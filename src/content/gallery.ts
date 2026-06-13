import type { GalleryPhoto } from "../types";

/**
 * Loads the "Nuestros trabajos" gallery photos from in-repo content, keeping
 * only the visible ones. Files are eagerly bundled at build time, so there are
 * zero network requests. Order follows the filename (alphabetical).
 */
const galleryModules = import.meta.glob<GalleryPhoto>("./gallery/*.json", {
	eager: true,
	import: "default",
});

export const galleryPhotos: GalleryPhoto[] = Object.keys(galleryModules)
	.sort()
	.map((path) => galleryModules[path])
	.filter((photo) => photo.visible);
