import { pockets, stamps } from "../content/options";
import { products, productsDetails } from "../content/products";
import useDriveFolder from "../hooks/useDriveFolder";
import type { DriveFolderType, DriveImage } from "../types";
import galleryJson from "./gallery.json";

// Static data from build-time prefetch (gallery still on Drive)
const staticGalleryImages = galleryJson.data as DriveImage[];

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

function useDriveFolderDev(type: DriveFolderType, fallback: DriveImage[]) {
	const data = useDriveFolder(import.meta.env.DEV ? type : null);

	if (!import.meta.env.DEV)
		return { images: fallback, folders: [], loading: false, error: null };

	return data;
}

export const useGalleryImages = () =>
	useDriveFolderDev("gallery", staticGalleryImages);

/** Global stamp (print) options read from in-repo content; no network requests. */
export const useStampImages = () => ({ images: stamps });

/** Global pocket options read from in-repo content; no network requests. */
export const usePocketsImages = () => ({ images: pockets });
