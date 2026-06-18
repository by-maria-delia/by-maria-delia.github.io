/*
 * Boton "Mis numeros" para Sveltia CMS.
 *
 * Inserta un boton fijo en /admin/ que abre un modal con las 4 metricas
 * que la editora necesita ver: visitas unicas, pedidos por WhatsApp,
 * tasa de conversion, y modelos mas vistos. Selector de ventana
 * temporal: 7 / 30 / 90 dias.
 *
 * Los datos vienen de la Share API de Umami Cloud. El share token es
 * publico (cualquiera con la URL de share ya puede ver los datos), asi
 * que embeber el SHARE_ID en este script no agrega exposicion. La
 * autenticacion la heredamos del propio /admin/, gateado por GitHub
 * OAuth via Sveltia.
 */
(function () {
	"use strict";

	// === Configuracion ===
	var SHARE_ID = "aED8dqVMnpSywatu";
	var API_BASE = "https://gateway-us.umami.is/api";

	// === Estado ===
	var token = null;
	var websiteId = null;
	var modalEl = null;
	var currentDays = 30;
	var loading = false;

	// === Boton flotante ===
	function buildButton() {
		var btn = document.createElement("button");
		btn.type = "button";
		btn.setAttribute("aria-label", "Ver mis numeros");
		btn.style.cssText = [
			"position:fixed",
			// Apilado por encima del boton "Publicar a produccion" para no
			// taparlo cuando ambos esten visibles a la vez.
			"bottom:80px",
			"right:20px",
			"z-index:2147483645",
			"display:inline-flex",
			"align-items:center",
			"gap:8px",
			"padding:11px 18px",
			"border-radius:9999px",
			"border:1px solid #C8BDAC",
			"background:#5E93B5",
			"color:#FFFDF9",
			"font-family:'Baloo 2','Nunito',system-ui,-apple-system,sans-serif",
			"font-weight:700",
			"font-size:14px",
			"line-height:1.1",
			"cursor:pointer",
			"box-shadow:0 8px 28px rgba(46,42,38,0.28)",
		].join(";");
		btn.textContent = "Mis numeros";
		btn.addEventListener("click", openModal);
		btn.addEventListener("mouseenter", function () {
			btn.style.filter = "brightness(1.08)";
		});
		btn.addEventListener("mouseleave", function () {
			btn.style.filter = "";
		});
		document.body.appendChild(btn);
	}

	// === Modal ===
	function buildModal() {
		var m = document.createElement("div");
		m.id = "mis-numeros-modal";
		m.style.cssText = [
			"position:fixed",
			"inset:0",
			"z-index:2147483647",
			"display:none",
			"align-items:center",
			"justify-content:center",
			"padding:16px",
			"background:rgba(61,70,81,0.45)",
			"backdrop-filter:blur(4px)",
			"font-family:'Nunito',system-ui,-apple-system,sans-serif",
			"color:#3D4651",
		].join(";");
		m.addEventListener("click", function (e) {
			if (e.target === m) closeModal();
		});

		var dialog = document.createElement("div");
		dialog.style.cssText = [
			"background:#FFFDF9",
			"border-radius:24px",
			"width:min(640px,100%)",
			"max-height:88vh",
			"overflow:auto",
			"box-shadow:0 20px 60px rgba(46,42,38,0.35)",
		].join(";");

		dialog.innerHTML =
			'<header style="display:flex;align-items:center;justify-content:space-between;' +
			'gap:12px;padding:20px 24px;border-bottom:1px solid #ECE6DC;">' +
			'<h2 style="margin:0;font-family:\'Oooh Baby\',cursive;font-size:34px;' +
			"color:#3E6C8A;font-weight:400;line-height:1;\">Mis numeros</h2>" +
			'<div style="display:flex;align-items:center;gap:8px;">' +
			'<select data-mn-range style="padding:8px 12px;border-radius:9999px;' +
			"border:1px solid #ECE6DC;background:#FFFDF9;color:#3D4651;" +
			"font-family:'Baloo 2',sans-serif;font-weight:600;font-size:13px;cursor:pointer;\">" +
			'<option value="7">Ultimos 7 dias</option>' +
			'<option value="30" selected>Ultimos 30 dias</option>' +
			'<option value="90">Ultimos 90 dias</option>' +
			"</select>" +
			'<button data-mn-close type="button" aria-label="Cerrar" ' +
			'style="display:grid;place-items:center;width:36px;height:36px;' +
			"border-radius:9999px;background:#F4F0E8;color:#737E8B;border:0;" +
			"cursor:pointer;font-size:22px;line-height:1;\">×</button>" +
			"</div></header>" +
			'<div data-mn-body style="padding:24px;"></div>';

		m.appendChild(dialog);
		document.body.appendChild(m);

		dialog.querySelector("[data-mn-close]").addEventListener("click", closeModal);
		dialog.querySelector("[data-mn-range]").addEventListener("change", function (e) {
			currentDays = parseInt(e.target.value, 10);
			loadData();
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "Escape" && m.style.display !== "none") closeModal();
		});

		return m;
	}

	// === Render ===
	function renderLoading() {
		return (
			'<div style="text-align:center;color:#737E8B;padding:40px 0;' +
			"font-family:'Baloo 2',sans-serif;font-weight:600;\">Cargando...</div>"
		);
	}

	function renderError(msg) {
		return (
			'<div style="color:#E486A4;text-align:center;padding:32px 16px;' +
			"font-family:'Baloo 2',sans-serif;\">" +
			"No pudimos cargar los datos." +
			'<br><small style="color:#737E8B;font-weight:400;">' +
			escapeHtml(msg) +
			"</small></div>"
		);
	}

	function renderBody(stats, eventMetrics, modelData) {
		var visitors = stats.visitors || 0;
		var whatsappRow = (eventMetrics || []).find(function (e) {
			return e.x === "whatsapp_click";
		});
		var orders = whatsappRow ? whatsappRow.y : 0;
		var conversionPct = visitors > 0 ? (orders / visitors) * 100 : 0;
		var conversionStr =
			conversionPct === 0
				? "0%"
				: conversionPct < 1
					? conversionPct.toFixed(1) + "%"
					: Math.round(conversionPct) + "%";

		var models = (modelData || [])
			.filter(function (e) {
				return e.propertyName === "model_name";
			})
			.sort(function (a, b) {
				return b.total - a.total;
			})
			.slice(0, 5);

		var card = function (label, value, valueColor, bg) {
			return (
				'<div style="background:' +
				bg +
				";border-radius:18px;padding:18px 20px;" +
				'display:flex;flex-direction:column;gap:6px;min-width:0;">' +
				'<div style="font-family:\'Baloo 2\',sans-serif;font-size:13px;' +
				"font-weight:600;color:#737E8B;\">" +
				label +
				"</div>" +
				'<div style="font-family:\'Baloo 2\',sans-serif;font-size:38px;' +
				"font-weight:800;color:" +
				valueColor +
				";line-height:1;font-variant-numeric:tabular-nums;\">" +
				value +
				"</div>" +
				"</div>"
			);
		};

		var modelsList =
			models.length > 0
				? '<ol style="margin:0;padding:0;list-style:none;display:flex;' +
					'flex-direction:column;gap:8px;">' +
					models
						.map(function (mod, i) {
							return (
								'<li style="display:flex;align-items:center;' +
								"justify-content:space-between;gap:12px;padding:10px 14px;" +
								'background:#F4F0E8;border-radius:12px;">' +
								'<span style="display:flex;align-items:center;gap:10px;min-width:0;">' +
								'<span style="display:grid;place-items:center;width:24px;height:24px;' +
								"border-radius:9999px;background:#E486A4;color:#FFFDF9;" +
								"font-family:'Baloo 2',sans-serif;font-weight:700;font-size:12px;\">" +
								(i + 1) +
								"</span>" +
								'<span style="font-family:\'Baloo 2\',sans-serif;font-weight:600;' +
								"color:#3D4651;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" +
								escapeHtml(mod.propertyValue) +
								"</span></span>" +
								'<span style="font-family:\'Baloo 2\',sans-serif;font-weight:700;' +
								"color:#3D4651;font-variant-numeric:tabular-nums;\">" +
								mod.total +
								"</span></li>"
							);
						})
						.join("") +
					"</ol>"
				: '<div style="color:#737E8B;text-align:center;padding:24px;' +
					"background:#F4F0E8;border-radius:12px;font-family:'Baloo 2',sans-serif;\">" +
					"Todavia nadie abrio el personalizador en este periodo." +
					"</div>";

		return (
			'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));' +
			'gap:12px;margin-bottom:24px;">' +
			card("Visitas unicas", visitors, "#3E6C8A", "#C3E1F2") +
			card("Pedidos por WhatsApp", orders, "#65AE85", "#C9E9D5") +
			card("Tasa de conversion", conversionStr, "#E486A4", "#F8C7D7") +
			"</div>" +
			'<h3 style="margin:0 0 12px;font-family:\'Baloo 2\',sans-serif;' +
			"font-size:18px;font-weight:700;color:#3D4651;\">Modelos mas vistos</h3>" +
			modelsList
		);
	}

	function escapeHtml(s) {
		return String(s).replace(/[&<>"']/g, function (c) {
			return {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			}[c];
		});
	}

	// === API ===
	function ensureToken() {
		if (token && websiteId) return Promise.resolve();
		return fetch(API_BASE + "/share/" + SHARE_ID)
			.then(function (r) {
				if (!r.ok) throw new Error("share-" + r.status);
				return r.json();
			})
			.then(function (data) {
				if (!data.token || !data.websiteId) throw new Error("share-shape");
				token = data.token;
				websiteId = data.websiteId;
			});
	}

	function apiCall(path) {
		return fetch(API_BASE + "/websites/" + websiteId + path, {
			headers: {
				"x-umami-share-token": token,
				"x-umami-share-context": "1",
			},
		}).then(function (r) {
			if (!r.ok) throw new Error("api-" + r.status);
			return r.json();
		});
	}

	function loadData() {
		if (!modalEl || loading) return;
		var body = modalEl.querySelector("[data-mn-body]");
		loading = true;
		body.innerHTML = renderLoading();

		var endAt = Date.now();
		var startAt = endAt - currentDays * 24 * 60 * 60 * 1000;
		var qs = "startAt=" + startAt + "&endAt=" + endAt;

		ensureToken()
			.then(function () {
				return Promise.all([
					apiCall("/stats?" + qs),
					apiCall("/metrics?" + qs + "&type=event&limit=20"),
					apiCall("/event-data/events?" + qs + "&event=customizer_open"),
				]);
			})
			.then(function (results) {
				body.innerHTML = renderBody(results[0], results[1], results[2]);
			})
			.catch(function (err) {
				body.innerHTML = renderError((err && err.message) || String(err));
			})
			.then(function () {
				loading = false;
			});
	}

	// === Ciclo de vida del modal ===
	function openModal() {
		if (!modalEl) modalEl = buildModal();
		modalEl.style.display = "flex";
		loadData();
	}

	function closeModal() {
		if (modalEl) modalEl.style.display = "none";
	}

	// === Arranque ===
	function init() {
		buildButton();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
