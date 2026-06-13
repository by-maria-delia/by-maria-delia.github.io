export interface Product {
	nombre: string;
	/** Numeric price; formatted to es-AR at render. */
	precio?: number;
	/** Optional verbatim price override (e.g. "Consultar"); shown instead of `precio`. */
	precioTexto?: string;
	descripcion?: string;
	disponible: boolean;
	/** Ordered list of public image paths (first is the primary card image). */
	imagenes: string[];
}

export interface SmockData {
	talles: string;
}

/** A renderable image for the product carousel. */
export interface CarouselImage {
	/** Resolved image URL. */
	src: string;
	name: string;
	placeholder?: boolean;
}

export interface GalleryPhoto {
	id?: string;
	imagen: string;
	descripcion?: string;
	visible?: string;
}

export interface WhatsAppParams {
	model_name: string;
	size: string;
	pockets: string;
	tipo_de_estampado: string;
	extra_comments: string;
}

export type SheetType = "products" | "details";

export type DriveFolderType =
	| "gallery"
	| "stamps"
	| "pockets"
	| "productsImages";

export interface DriveImage {
	id: string;
	name: string;
	url?: string;
	placeholder?: boolean;
}

export interface DriveFolder {
	id: string;
	name: string;
	images: DriveImage[];
}
