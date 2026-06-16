/*
 * Banner de estado de publicacion para Sveltia CMS.
 *
 * Sveltia muestra "publicado" cuando el commit llega a GitHub, NO cuando la
 * pagina termina de desplegarse. Este script cierra esa brecha: detecta el
 * guardado, consulta la API de GitHub Actions y avisa a la editora cuando los
 * cambios ya estan en linea.
 *
 * Sin dependencias. Vanilla JS. Pensado para el limite no autenticado de la
 * API de GitHub (60 pedidos por hora por IP): no hay polling en reposo, solo
 * una rafaga corta despues de cada guardado.
 */
(function () {
	"use strict";

	var REPO = "by-maria-delia/by-maria-delia.github.io";
	var RUNS_API =
		"https://api.github.com/repos/" +
		REPO +
		"/actions/runs?branch=main&per_page=1";
	var LIVE_URL = "https://by-maria-delia.github.io/";

	var POLL_MS = 8000; // cadencia de la rafaga de consultas
	var MAX_WATCH_MS = 3 * 60 * 1000; // tope de tiempo observando un deploy
	var SAVE_COOLDOWN_MS = 10000; // evita re-disparar por el mismo guardado
	var CLOCK_SKEW_MS = 60000; // margen al comparar created_at con el guardado

	// --- estado interno -----------------------------------------------------
	var saveTime = 0;
	var watchStart = 0;
	var pollTimer = null;
	var lastSaveTrigger = 0;
	var apiErrors = 0;

	// --- banner (DOM) -------------------------------------------------------
	var banner, dot, title, subtitle, link, closeBtn;

	function buildBanner() {
		banner = document.createElement("div");
		banner.setAttribute("role", "status");
		banner.setAttribute("aria-live", "polite");
		banner.style.cssText = [
			"position:fixed",
			"top:12px",
			"left:50%",
			"transform:translateX(-50%)",
			"z-index:2147483647",
			"display:none",
			"align-items:center",
			"gap:10px",
			"max-width:92vw",
			"padding:10px 14px",
			"border-radius:9999px",
			"background:#F4EED7",
			"color:#2e2a26",
			"font-family:'Nunito',system-ui,-apple-system,sans-serif",
			"font-size:14px",
			"line-height:1.25",
			"box-shadow:0 6px 24px rgba(46,42,38,0.18)",
			"border:1px solid #C8BDAC",
		].join(";");

		dot = document.createElement("span");
		dot.style.cssText = [
			"flex:0 0 auto",
			"width:10px",
			"height:10px",
			"border-radius:50%",
			"background:#E3C567",
		].join(";");

		var textWrap = document.createElement("div");
		textWrap.style.cssText = "display:flex;flex-direction:column;min-width:0";

		title = document.createElement("strong");
		title.style.cssText = "font-weight:700;color:#4a4540";

		subtitle = document.createElement("span");
		subtitle.style.cssText = "color:#666058;font-size:12.5px";

		textWrap.appendChild(title);
		textWrap.appendChild(subtitle);

		link = document.createElement("a");
		link.href = LIVE_URL;
		link.target = "_blank";
		link.rel = "noopener";
		link.textContent = "Ver la pagina";
		link.style.cssText = [
			"flex:0 0 auto",
			"display:none",
			"padding:6px 12px",
			"border-radius:9999px",
			"background:#4a4540",
			"color:#F4EED7",
			"text-decoration:none",
			"font-weight:700",
			"font-size:13px",
		].join(";");

		closeBtn = document.createElement("button");
		closeBtn.type = "button";
		closeBtn.setAttribute("aria-label", "Cerrar aviso");
		closeBtn.textContent = "×"; // ×
		closeBtn.style.cssText = [
			"flex:0 0 auto",
			"appearance:none",
			"border:none",
			"background:transparent",
			"color:#666058",
			"font-size:18px",
			"line-height:1",
			"cursor:pointer",
			"padding:0 2px",
		].join(";");
		closeBtn.addEventListener("click", function () {
			stopWatching();
			hide();
		});

		banner.appendChild(dot);
		banner.appendChild(textWrap);
		banner.appendChild(link);
		banner.appendChild(closeBtn);
		document.body.appendChild(banner);
	}

	function show() {
		banner.style.display = "flex";
	}
	function hide() {
		banner.style.display = "none";
	}

	function render(state) {
		// state: { color, title, subtitle, showLink }
		dot.style.background = state.color;
		title.textContent = state.title;
		subtitle.textContent = state.subtitle || "";
		subtitle.style.display = state.subtitle ? "block" : "none";
		link.style.display = state.showLink ? "inline-block" : "none";
		show();
	}

	var STATES = {
		publishing: {
			color: "#E3C567",
			title: "Publicando cambios...",
			subtitle: "Esto puede tardar hasta un minuto.",
			showLink: false,
		},
		success: {
			color: "#5E7D6A",
			title: "Cambios publicados",
			subtitle: "Tus cambios ya estan en linea.",
			showLink: true,
		},
		failure: {
			color: "#C0785E",
			title: "Hubo un problema al publicar",
			subtitle: "Reintenta guardar o avisa al equipo.",
			showLink: false,
		},
		slow: {
			color: "#E3C567",
			title: "La publicacion esta tardando mas de lo normal",
			subtitle: "Proba revisar la pagina en unos minutos.",
			showLink: true,
		},
	};

	// --- consulta a la API --------------------------------------------------
	function fetchLatestRun() {
		return fetch(RUNS_API, {
			cache: "no-store",
			headers: { Accept: "application/vnd.github+json" },
		}).then(function (res) {
			if (res.status === 403) {
				// limite de la API agotado: dejar de molestar.
				throw new Error("rate-limited");
			}
			if (!res.ok) throw new Error("http-" + res.status);
			return res.json();
		}).then(function (data) {
			return data && data.workflow_runs && data.workflow_runs[0]
				? data.workflow_runs[0]
				: null;
		});
	}

	function tick() {
		if (Date.now() - watchStart > MAX_WATCH_MS) {
			render(STATES.slow);
			stopWatching();
			return;
		}

		fetchLatestRun()
			.then(function (run) {
				apiErrors = 0;
				if (!run) return; // sin datos: seguir esperando

				var createdMs = Date.parse(run.created_at);
				var isOurs =
					!isNaN(createdMs) && createdMs >= saveTime - CLOCK_SKEW_MS;

				if (!isOurs) {
					// El run nuevo todavia no aparece; CI aun no arranco.
					render(STATES.publishing);
					return;
				}

				if (run.status !== "completed") {
					render(STATES.publishing);
					return;
				}

				// Run terminado y es el nuestro.
				stopWatching();
				if (run.conclusion === "success") {
					render(STATES.success);
					autoHide(20000);
				} else {
					render(STATES.failure);
				}
			})
			.catch(function (err) {
				if (err && err.message === "rate-limited") {
					stopWatching();
					hide();
					return;
				}
				apiErrors += 1;
				if (apiErrors >= 3) {
					stopWatching();
					hide();
				}
			});
	}

	var hideTimer = null;
	function autoHide(ms) {
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(hide, ms);
	}

	// --- ciclo de observacion ----------------------------------------------
	function startWatching() {
		saveTime = Date.now();
		watchStart = saveTime;
		apiErrors = 0;
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		render(STATES.publishing);
		if (pollTimer) clearInterval(pollTimer);
		tick(); // consulta inmediata
		pollTimer = setInterval(tick, POLL_MS);
	}

	function stopWatching() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	function onSaveDetected() {
		var now = Date.now();
		if (now - lastSaveTrigger < SAVE_COOLDOWN_MS) return;
		lastSaveTrigger = now;
		startWatching();
	}

	// --- deteccion del guardado --------------------------------------------
	// Primario: API oficial de eventos de Sveltia CMS. El evento `postSave` se
	// dispara cuando el commit termino de generarse, que es el mismo momento
	// que nos interesa para empezar a observar el deploy.
	// Docs: https://sveltiacms.app/en/docs/api/events
	// El bundle de Sveltia se carga async, asi que esperamos a que
	// `window.CMS.registerEventListener` exista antes de suscribirnos.
	function installSveltiaEventListener() {
		var MAX_WAIT_MS = 15000;
		var INTERVAL_MS = 200;
		var waited = 0;
		var timer = setInterval(function () {
			var cms = window.CMS;
			if (cms && typeof cms.registerEventListener === "function") {
				clearInterval(timer);
				try {
					cms.registerEventListener({
						name: "postSave",
						handler: function () {
							onSaveDetected();
						},
					});
				} catch (e) {
					/* sin respaldo: si esto falla no detectamos guardados */
				}
				return;
			}
			waited += INTERVAL_MS;
			if (waited >= MAX_WAIT_MS) clearInterval(timer);
		}, INTERVAL_MS);
	}

	// --- arranque -----------------------------------------------------------
	function init() {
		buildBanner();
		installSveltiaEventListener();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
