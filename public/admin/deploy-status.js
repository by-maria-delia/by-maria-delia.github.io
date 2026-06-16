/*
 * Banner de estado de publicacion para Sveltia CMS.
 *
 * Flujo (post staging branch, ver docs/handoff-staging-branch.md):
 *
 *  1. La editora guarda en /admin/. El commit va a la rama `preview`.
 *  2. Netlify despliega la vista previa en ~1 minuto. El banner avisa:
 *     "Cambios guardados en vista previa" y, tras una espera, "Vista previa
 *     lista" con enlace al sitio de staging.
 *  3. Cuando ella decide publicar a produccion, el boton "Publicar a
 *     produccion" (ver promote-button.js) dispara el workflow de GitHub
 *     Actions y emite el evento `maria-delia:promote-dispatched`. El banner
 *     cambia a modo "Publicando a produccion..." y consulta la API de
 *     GitHub Actions para avisar cuando el sitio en vivo se actualizo.
 *
 * Sin dependencias. Vanilla JS. Pensado para el limite no autenticado de la
 * API de GitHub (60 pedidos por hora por IP): solo se consulta despues de un
 * deploy a produccion.
 */
(function () {
	"use strict";

	var REPO = "by-maria-delia/by-maria-delia.github.io";
	var RUNS_API =
		"https://api.github.com/repos/" +
		REPO +
		"/actions/runs?branch=main&per_page=5";
	var LIVE_URL = "https://by-maria-delia.github.io/";
	var STAGING_URL = "https://maria-delia-preview.netlify.app/";
	var STAGING_READY_DELAY_MS = 60000; // tiempo tipico de build en Netlify

	var POLL_MS = 8000; // cadencia de la rafaga de consultas
	var MAX_WATCH_MS = 3 * 60 * 1000; // tope de tiempo observando un deploy
	var SAVE_COOLDOWN_MS = 10000; // evita re-disparar por el mismo guardado
	var CLOCK_SKEW_MS = 60000; // margen al comparar created_at con el guardado

	// --- estado interno -----------------------------------------------------
	var watchStartTime = 0; // momento desde el que un run cuenta como "nuestro"
	var watchTimerStart = 0;
	var pollTimer = null;
	var stagingDelayTimer = null;
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
		closeBtn.textContent = "×";
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
			stopProductionWatch();
			stopStagingDelay();
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
		// state: { color, title, subtitle, linkUrl, linkText }
		dot.style.background = state.color;
		title.textContent = state.title;
		subtitle.textContent = state.subtitle || "";
		subtitle.style.display = state.subtitle ? "block" : "none";
		if (state.linkUrl) {
			link.href = state.linkUrl;
			link.textContent = state.linkText || "Ver la pagina";
			link.style.display = "inline-block";
		} else {
			link.style.display = "none";
		}
		show();
	}

	var STATES = {
		stagingSaved: {
			color: "#E3C567",
			title: "Cambios guardados en vista previa",
			subtitle:
				"La vista previa estara lista en aproximadamente un minuto.",
			linkUrl: STAGING_URL,
			linkText: "Ver vista previa",
		},
		stagingReady: {
			color: "#5E7D6A",
			title: "Vista previa lista",
			subtitle: "Revisala y luego pulsa Publicar a produccion.",
			linkUrl: STAGING_URL,
			linkText: "Ver vista previa",
		},
		publishing: {
			color: "#E3C567",
			title: "Publicando a produccion...",
			subtitle: "Esto puede tardar hasta un minuto.",
			linkUrl: null,
		},
		success: {
			color: "#5E7D6A",
			title: "Publicado en produccion",
			subtitle: "Tus cambios ya estan en el sitio en vivo.",
			linkUrl: LIVE_URL,
			linkText: "Ver la pagina",
		},
		failure: {
			color: "#C0785E",
			title: "Hubo un problema al publicar",
			subtitle: "Reintenta o avisa al equipo.",
			linkUrl: null,
		},
		slow: {
			color: "#E3C567",
			title: "La publicacion esta tardando mas de lo normal",
			subtitle: "Proba revisar la pagina en unos minutos.",
			linkUrl: LIVE_URL,
			linkText: "Ver la pagina",
		},
	};

	// --- modo staging (post-save a `preview`) -------------------------------
	function startStagingFlow() {
		stopProductionWatch();
		stopStagingDelay();
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = null;
		}
		render(STATES.stagingSaved);
		stagingDelayTimer = setTimeout(function () {
			render(STATES.stagingReady);
			autoHide(45000);
		}, STAGING_READY_DELAY_MS);
	}

	function stopStagingDelay() {
		if (stagingDelayTimer) {
			clearTimeout(stagingDelayTimer);
			stagingDelayTimer = null;
		}
	}

	// --- modo produccion (post promote workflow_dispatch) -------------------
	function fetchLatestRun() {
		return fetch(RUNS_API, {
			cache: "no-store",
			headers: { Accept: "application/vnd.github+json" },
		})
			.then(function (res) {
				if (res.status === 403) {
					throw new Error("rate-limited");
				}
				if (!res.ok) throw new Error("http-" + res.status);
				return res.json();
			})
			.then(function (data) {
				if (!data || !data.workflow_runs) return null;
				// Buscamos el primer run en `main` creado despues de pulsar
				// Publicar. Asi ignoramos un run viejo que aun esta "completed"
				// arriba de la lista mientras GitHub no muestra el nuevo.
				for (var i = 0; i < data.workflow_runs.length; i++) {
					var run = data.workflow_runs[i];
					var createdMs = Date.parse(run.created_at);
					if (
						!isNaN(createdMs) &&
						createdMs >= watchStartTime - CLOCK_SKEW_MS
					) {
						return run;
					}
				}
				return null;
			});
	}

	function tick() {
		if (Date.now() - watchTimerStart > MAX_WATCH_MS) {
			render(STATES.slow);
			stopProductionWatch();
			return;
		}

		fetchLatestRun()
			.then(function (run) {
				apiErrors = 0;
				if (!run) {
					// CI aun no arranco: seguir mostrando "Publicando...".
					render(STATES.publishing);
					return;
				}

				if (run.status !== "completed") {
					render(STATES.publishing);
					return;
				}

				stopProductionWatch();
				if (run.conclusion === "success") {
					render(STATES.success);
					autoHide(20000);
				} else {
					render(STATES.failure);
				}
			})
			.catch(function (err) {
				if (err && err.message === "rate-limited") {
					stopProductionWatch();
					hide();
					return;
				}
				apiErrors += 1;
				if (apiErrors >= 3) {
					stopProductionWatch();
					hide();
				}
			});
	}

	var hideTimer = null;
	function autoHide(ms) {
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(hide, ms);
	}

	function startProductionWatch() {
		stopStagingDelay();
		watchStartTime = Date.now();
		watchTimerStart = watchStartTime;
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

	function stopProductionWatch() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}

	function onSaveDetected() {
		var now = Date.now();
		if (now - lastSaveTrigger < SAVE_COOLDOWN_MS) return;
		lastSaveTrigger = now;
		startStagingFlow();
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

	// --- evento "promote dispatched" (lo emite promote-button.js) -----------
	function installPromoteListener() {
		window.addEventListener("maria-delia:promote-dispatched", function () {
			startProductionWatch();
		});
		window.addEventListener("maria-delia:promote-failed", function (e) {
			stopProductionWatch();
			stopStagingDelay();
			var detail = (e && e.detail) || {};
			render({
				color: "#C0785E",
				title: "No se pudo publicar",
				subtitle:
					detail.message || "Reintenta o avisa al equipo.",
				linkUrl: null,
			});
			autoHide(15000);
		});
	}

	// --- arranque -----------------------------------------------------------
	function init() {
		buildBanner();
		installSveltiaEventListener();
		installPromoteListener();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
