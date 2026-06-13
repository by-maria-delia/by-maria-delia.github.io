import { galleryPhotos } from "../content/gallery";
import { pockets, stamps } from "../content/options";
import { products, productsDetails } from "../content/products";

/** Guardapolvos read from in-repo content; no network requests. */
export const useProducts = () => ({
	data: products,
	loading: false,
	error: null,
});

/** Global product details (sizes) read from in-repo content. */
export const useProductsDetails = () => ({
	data: productsDetails,
	loading: false,
	error: null,
});

/** Gallery photos read from in-repo content (visible only); no network requests. */
export const useGalleryImages = () => ({ images: galleryPhotos });

/** Global stamp (print) options read from in-repo content; no network requests. */
export const useStampImages = () => ({ images: stamps });

/** Global pocket options read from in-repo content; no network requests. */
export const usePocketsImages = () => ({ images: pockets });
