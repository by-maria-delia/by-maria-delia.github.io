import type { OptionImage } from "../types";

/**
 * Loads the global Customizer option collections (stamps, pockets and bases)
 * from in-repo content. Files are eagerly bundled at build time, so there are
 * zero network requests. Order follows the filename (alphabetical).
 */
const load = (modules: Record<string, OptionImage>): OptionImage[] =>
	Object.keys(modules)
		.sort()
		.map((path) => modules[path]);

export const stamps: OptionImage[] = load(
	import.meta.glob<OptionImage>("./stamps/*.json", {
		eager: true,
		import: "default",
	}),
);

export const pockets: OptionImage[] = load(
	import.meta.glob<OptionImage>("./pockets/*.json", {
		eager: true,
		import: "default",
	}),
);

export const bases: OptionImage[] = load(
	import.meta.glob<OptionImage>("./bases/*.json", {
		eager: true,
		import: "default",
	}),
);
