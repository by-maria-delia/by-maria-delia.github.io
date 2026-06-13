import { products, productsDetails } from "../content/products";
import useDriveFolder from "../hooks/useDriveFolder";
import type { DriveFolderType, DriveImage } from "../types";
import galleryJson from "./gallery.json";
import pocketsJson from "./pockets.json";
import stampsJson from "./stamps.json";

// Static data from build-time prefetch (gallery/stamps/pockets still on Drive)
const staticGalleryImages = galleryJson.data as DriveImage[];
const staticStampImages = stampsJson.data as DriveImage[];
const staticPocketsImages = pocketsJson.data as DriveImage[];

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

export const useStampImages = () =>
	useDriveFolderDev("stamps", staticStampImages);

export const usePocketsImages = () =>
	useDriveFolderDev("pockets", staticPocketsImages);
