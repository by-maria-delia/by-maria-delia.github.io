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

/** A global Customizer option (stamp or pocket) rendered as a selectable thumbnail. */
export interface OptionImage {
	/** Display name; also the value sent in the WhatsApp message. */
	nombre: string;
	/** Public image path (e.g. `/media/stamps/estampa-00.jpg`). */
	imagen: string;
}

/** A renderable image for the product carousel. */
export interface CarouselImage {
	/** Resolved image URL. */
	src: string;
	name: string;
	placeholder?: boolean;
}

/** A gallery photo shown in the "Nuestros trabajos" section. */
export interface GalleryPhoto {
	/** Public image path (e.g. `/media/gallery/trabajo-00.png`). */
	imagen: string;
	/** Optional caption; also used as the image alt text. */
	descripcion?: string;
	/** Only visible photos render in the storefront. */
	visible: boolean;
}

/** A labelled link (nav item or hero call-to-action). */
export interface NavLink {
	label: string;
	href: string;
}

/** All editable site copy and global values, loaded from a single in-repo singleton. */
export interface SiteContent {
	brandName: string;
	/** Shared one-line description (hero subtitle and footer tagline). */
	tagline: string;
	/** Digits-only WhatsApp number used to build wa.me links. */
	whatsappNumber: string;
	instagramUrl: string;
	instagramHandle: string;
	nav: { links: NavLink[] };
	hero: {
		eyebrow: string;
		/** Public path to the hero product image (e.g. `/media/guardapolvos/princesa.png`). */
		image: string;
		/** Alt text for the hero image. */
		imageAlt?: string;
		primaryCta: NavLink;
		secondaryCta: NavLink;
	};
	howItWorks: {
		heading: string;
		subheading: string;
		steps: { title: string; desc: string }[];
		footnote: string;
	};
	gallery: {
		heading: string;
		subheading: string;
	};
	delivery: {
		heading: string;
		paragraphs: string[];
		footnote: string;
	};
	footer: {
		whatsappLabel: string;
		location: string;
		copyright: string;
	};
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
