import type { Product } from "../types";

/**
 * Formats a guardapolvo price for display. A text override is shown verbatim;
 * otherwise a numeric price is formatted as es-AR currency (e.g. `$50.000,00`).
 * Returns null when there is no price to show.
 */
export function formatPrice(
	product: Pick<Product, "precio" | "precioTexto">,
): string | null {
	if (product.precioTexto?.trim()) return product.precioTexto;
	if (product.precio == null) return null;
	return `$${product.precio.toLocaleString("es-AR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}
