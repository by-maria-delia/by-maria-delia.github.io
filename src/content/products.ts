import type { Product, SmockData } from "../types";
import detallesJson from "./detalles.json";

/**
 * Loads every guardapolvo content file in the repo into typed `Product` data.
 * Files are eagerly bundled at build time, so there are zero network requests.
 * Order follows the filename (alphabetical), matching the catalog display order.
 */
const guardapolvoModules = import.meta.glob<Product>("./guardapolvos/*.json", {
	eager: true,
	import: "default",
});

export const products: Product[] = Object.keys(guardapolvoModules)
	.sort()
	.map((path) => guardapolvoModules[path]);

/** Global product details (currently the shared sizes list). */
export const productsDetails: SmockData = detallesJson;
