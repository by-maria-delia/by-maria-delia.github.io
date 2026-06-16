/*
 * Boton "Publicar a produccion" para Sveltia CMS.
 *
 * Inserta un boton fijo en /admin/. Mientras `preview` esta adelante de `main`,
 * el boton queda habilitado y muestra cuantos cambios faltan publicar. Al
 * pulsarlo:
 *
 *   1. Pide confirmacion ("Publicar X cambios a la pagina en vivo?").
 *   2. Llama a la API de GitHub para disparar el workflow `promote.yml` (que
 *      hace fast-forward de `preview` hacia `main` y dispara el deploy a
 *      produccion).
 *   3. Emite el evento `maria-delia:promote-dispatched` (o `:promote-failed`)
 *      para que deploy-status.js muestre el aviso correspondiente.
 *
 * Usa el token OAuth que Sveltia ya guarda en `localStorage` despues del
 * login. Sin token (sesion expirada): el boton avisa que hay que volver a
 * entrar. Ver docs/handoff-staging-branch.md.
 */
(function () {
	"use strict";

	var REPO = "by-maria-delia/by-maria-delia.github.io";
	var COMPARE_API =
		"https://api.github.com/repos/" + REPO + "/compare/main...preview";
	var DISPATCH_API =
		"https://api.github.com/repos/" +
		REPO +
		"/actions/workflows/promote.yml/dispatches";

	// Cadencia para revisar si `preview` esta adelante de `main`. La API no
	// autenticada da 60 req/hora por IP; con 5 min sobra y deja margen para
	// los otros consumidores (banner, etc).
	var REFRESH_AFTER_SUCCESS_MS = 8000;
	var POLL_DEBOUNCE_MS = 3000;

	// --- estado interno -----------------------------------------------------
	var button;
	var aheadBy = 0;
	var dispatching = false;
	var lastPollAt = 0;

	// --- token storage ------------------------------------------------------
	// Sveltia guarda el resultado del login OAuth en localStorage. La clave
	// exacta puede cambiar entre versiones, asi que probamos primero el
	// nombre documentado y caemos a una busqueda por prefijo.
	function getOAuthToken() {
		try {
			var keys = ["sveltia-cms.user", "sveltia-cms-user"];
			var raw = null;
			for (var i = 0; i < keys.length; i++) {
				raw = localStorage.getItem(keys[i]);
				if (raw) break;
			}
			if (!raw) {
				for (var j = 0; j < localStorage.length; j++) {
					var k = localStorage.key(j);
					if (
						k &&
						k.toLowerCase().indexOf("sveltia") !== -1 &&
						k.toLowerCase().indexOf("user") !== -1
					) {
						raw = localStorage.getItem(k);
						if (raw) break;
					}
				}
			}
			if (!raw) return null;
			var parsed = JSON.parse(raw);
			return (
				(parsed && (parsed.token || parsed.access_token)) || null
			);
		} catch (e) {
			return null;
		}
	}

	// --- DOM ----------------------------------------------------------------
	function buildButton() {
		button = document.createElement("button");
		button.type = "button";
		button.setAttribute("aria-label", "Publicar cambios a produccion");
		button.style.cssText = [
			"position:fixed",
			"top:12px",
			"right:16px",
			"z-index:2147483646",
			"display:none",
			"align-items:center",
			"gap:8px",
			"padding:9px 16px",
			"border-radius:9999px",
			"border:1px solid #C8BDAC",
			"background:#5E7D6A",
			"color:#F4EED7",
			"font-family:'Baloo 2','Nunito',system-ui,-apple-system,sans-serif",
			"font-weight:700",
			"font-size:14px",
			"line-height:1.1",
			"cursor:pointer",
			"box-shadow:0 6px 24px rgba(46,42,38,0.22)",
		].join(";");
		button.addEventListener("click", onClick);
		button.addEventListener("mouseenter", function () {
			if (!button.disabled) button.style.filter = "brightness(1.08)";
		});
		button.addEventListener("mouseleave", function () {
			button.style.filter = "";
		});
		document.body.appendChild(button);
	}

	function setLabel(count, enabled) {
		var label =
			count > 0
				? "Publicar a produccion (" + count + ")"
				: "Sin cambios para publicar";
		button.textContent = label;
		button.disabled = !enabled;
		button.style.background = enabled ? "#5E7D6A" : "#B6AE9D";
		button.style.cursor = enabled ? "pointer" : "default";
		button.style.display = "inline-flex";
	}

	function hide() {
		button.style.display = "none";
	}

	// --- compare API --------------------------------------------------------
	function refresh() {
		var now = Date.now();
		if (now - lastPollAt < POLL_DEBOUNCE_MS) return;
		lastPollAt = now;

		fetch(COMPARE_API, {
			cache: "no-store",
			headers: { Accept: "application/vnd.github+json" },
		})
			.then(function (res) {
				if (res.status === 403) throw new Error("rate-limited");
				if (!res.ok) throw new Error("http-" + res.status);
				return res.json();
			})
			.then(function (data) {
				aheadBy = (data && data.ahead_by) || 0;
				if (dispatching) return; // no pisar el estado "Publicando..."
				setLabel(aheadBy, aheadBy > 0);
			})
			.catch(function () {
				// silencioso: no queremos arruinar el UI por un blip de red.
				if (!dispatching) hide();
			});
	}

	// --- click handler ------------------------------------------------------
	function onClick() {
		if (button.disabled || dispatching) return;

		var count = aheadBy;
		var msg =
			count === 1
				? "Publicar 1 cambio en la pagina en vivo?"
				: "Publicar " + count + " cambios en la pagina en vivo?";
		if (!window.confirm(msg)) return;

		var token = getOAuthToken();
		if (!token) {
			emit("maria-delia:promote-failed", {
				message:
					"No encontramos tu sesion. Cerra y volve a entrar al CMS.",
			});
			return;
		}

		dispatching = true;
		var prevText = button.textContent;
		button.disabled = true;
		button.textContent = "Publicando...";
		button.style.background = "#B6AE9D";
		button.style.cursor = "default";

		fetch(DISPATCH_API, {
			method: "POST",
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: "Bearer " + token,
				"X-GitHub-Api-Version": "2022-11-28",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ref: "main" }),
		})
			.then(function (res) {
				if (res.status === 204) return null;
				return res.text().then(function (body) {
					throw new Error("dispatch-" + res.status + ":" + body);
				});
			})
			.then(function () {
				emit("maria-delia:promote-dispatched", { count: count });
				// Refrescar despues de un toque para reflejar ahead_by=0.
				setTimeout(refresh, REFRESH_AFTER_SUCCESS_MS);
			})
			.catch(function (err) {
				var message = "Reintenta o avisa al equipo.";
				if (err && /403/.test(err.message)) {
					message =
						"Permisos insuficientes. El equipo tiene que revisar la autenticacion.";
				} else if (err && /401/.test(err.message)) {
					message =
						"Tu sesion vencio. Cerra y volve a entrar al CMS.";
				} else if (err && /404/.test(err.message)) {
					message =
						"No encontramos el workflow promote.yml. Avisa al equipo.";
				}
				emit("maria-delia:promote-failed", { message: message });
				button.textContent = prevText;
				button.disabled = false;
				button.style.background = "#5E7D6A";
				button.style.cursor = "pointer";
			})
			.then(function () {
				dispatching = false;
			});
	}

	function emit(name, detail) {
		try {
			window.dispatchEvent(new CustomEvent(name, { detail: detail }));
		} catch (e) {
			/* navegadores muy viejos: ignorar */
		}
	}

	// --- enganches con Sveltia ---------------------------------------------
	function installSveltiaPostSaveRefresh() {
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
							// Pequena espera: el commit recien se acaba de
							// hacer; le damos a la API un instante para
							// reflejarlo en el compare.
							setTimeout(refresh, 4000);
						},
					});
				} catch (e) {
					/* sin respaldo */
				}
				return;
			}
			waited += INTERVAL_MS;
			if (waited >= MAX_WAIT_MS) clearInterval(timer);
		}, INTERVAL_MS);
	}

	// --- arranque -----------------------------------------------------------
	function init() {
		buildButton();
		setLabel(0, false);
		refresh();
		installSveltiaPostSaveRefresh();
		document.addEventListener("visibilitychange", function () {
			if (document.visibilityState === "visible") refresh();
		});
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
