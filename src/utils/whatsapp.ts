import { siteContent } from "../content/site";
import type { WhatsAppParams } from "../types";

export function buildWhatsAppURL({
	model_name,
	size,
	pockets,
	tipo_de_estampado,
	extra_comments,
}: WhatsAppParams): string {
	const lines = [
		"Hola! Quiero consultar por este guardapolvo:",
		`Modelo: *${model_name}*`,
		`Talle: *${size}*`,
		`Tipo de bolsillo: *${pockets}*`,
		`Estampado: *${tipo_de_estampado}*`,
	];

	if (extra_comments) {
		lines.push(`Comentarios: _${extra_comments}_`);
	}

	const message = encodeURIComponent(lines.join("\n"));
	return `https://wa.me/${siteContent.whatsappNumber}?text=${message}`;
}
