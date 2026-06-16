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
 * entrar.
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
	// autenticada da 60 req/hora por IP; con esta cadencia y los disparos
	// puntuales (postSave, focus) queda bastante margen.
	var POLL_DEBOUNCE_MS = 3000;

	// Modo post-dispatch: mientras esperamos que el workflow promote.yml haga
	// el fast-forward sobre `main`, consultamos el compare endpoint cada 8s
	// para detectar el momento en que `ahead_by` cae a 0 y devolvemos el boton
	// a "Sin cambios para publicar". Si pasan 5 min sin cambios, abortamos y
	// dejamos que la editora reintente.
	var POST_DISPATCH_POLL_MS = 8000;
	var POST_DISPATCH_MAX_MS = 5 * 60 * 1000;

	// --- estado interno -----------------------------------------------------
	var button;
	var aheadBy = 0;
	var dispatching = false;
	var lastPollAt = 0;
	var postDispatchTimer = null;
	var postDispatchStart = 0;

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
			// Esquina inferior derecha: lejos del boton "Save" propio de
			// Sveltia, que vive arriba a la derecha del editor de entradas.
			"bottom:20px",
			"right:20px",
			"z-index:2147483646",
			"display:none",
			"align-items:center",
			"gap:8px",
			"padding:11px 18px",
			"border-radius:9999px",
			"border:1px solid #C8BDAC",
			"background:#5E7D6A",
			"color:#F4EED7",
			"font-family:'Baloo 2','Nunito',system-ui,-apple-system,sans-serif",
			"font-weight:700",
			"font-size:14px",
			"line-height:1.1",
			"cursor:pointer",
			"box-shadow:0 8px 28px rgba(46,42,38,0.28)",
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
				if (dispatching) {
					// Estamos esperando que el workflow promote.yml termine
					// el fast-forward. Cuando ahead_by cae a 0, el push ya
					// se hizo: cerramos el modo "Publicando..." y volvemos
					// al estado idle.
					if (aheadBy === 0) {
						dispatching = false;
						stopPostDispatchPolling();
						setLabel(0, false);
					}
					return;
				}
				setLabel(aheadBy, aheadBy > 0);
			})
			.catch(function () {
				// silencioso: no queremos arruinar el UI por un blip de red.
				if (!dispatching) hide();
			});
	}

	// --- post-dispatch polling ---------------------------------------------
	function startPostDispatchPolling() {
		stopPostDispatchPolling();
		postDispatchStart = Date.now();
		postDispatchTimer = setInterval(function () {
			if (Date.now() - postDispatchStart > POST_DISPATCH_MAX_MS) {
				// Algo se trabo. Cerramos el modo "Publicando..." y
				// mostramos el conteo real para que se pueda reintentar.
				stopPostDispatchPolling();
				dispatching = false;
				lastPollAt = 0;
				refresh();
				return;
			}
			lastPollAt = 0; // saltamos el debounce mientras polleamos
			refresh();
		}, POST_DISPATCH_POLL_MS);
	}

	function stopPostDispatchPolling() {
		if (postDispatchTimer) {
			clearInterval(postDispatchTimer);
			postDispatchTimer = null;
		}
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
				// Quedamos en modo "Publicando..." y polleamos el compare
				// API: cuando promote.yml hace el fast-forward, ahead_by
				// cae a 0 y devolvemos el boton a "Sin cambios para
				// publicar" sin necesidad de recargar la pagina.
				startPostDispatchPolling();
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
				// El dispatch fallo: salimos del modo "Publicando..." y
				// restauramos el boton para reintentar.
				dispatching = false;
				stopPostDispatchPolling();
				button.textContent = prevText;
				button.disabled = false;
				button.style.background = "#5E7D6A";
				button.style.cursor = "pointer";
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
