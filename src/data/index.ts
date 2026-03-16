import useDriveFolder from "../hooks/useDriveFolder";
import useGoogleSheet from "../hooks/useGoogleSheet";
import type {
	DriveFolder,
	DriveFolderType,
	DriveImage,
	Product,
	SheetType,
	SmockData,
} from "../types";
import borderColorsJson from "./border-colors.json";
import galleryJson from "./gallery.json";
import productImagesJson from "./product-images.json";
import productsJson from "./products.json";
import smocksJson from "./smocks.json";
import stampsJson from "./stamps.json";

// Static data from build-time prefetch
const staticProducts = productsJson.data as Product[];
const staticProductsDetails = smocksJson.data as SmockData[];
const staticGalleryImages = galleryJson.data as DriveImage[];
const staticStampImages = stampsJson.data as DriveImage[];
const staticBorderColorImages = borderColorsJson.data as DriveImage[];
const staticProductFolders = productImagesJson.data as DriveFolder[];

/**
 * In dev: fetches live data from Google Sheets, falls back to static JSON while loading.
 * In prod: returns static JSON instantly (zero API calls).
 */
function useGoogleSheetDev<T>(type: SheetType, fallback: T[]) {
	const data = useGoogleSheet<T>(import.meta.env.DEV ? type : null);

	if (!import.meta.env.DEV)
		return { data: fallback, loading: false, error: null };

	return data;
}

export const useProducts = () =>
	useGoogleSheetDev<Product>("products", staticProducts);

export const useProductsDetails = () => {
	const { data, error, loading } = useGoogleSheetDev<SmockData>(
		"details",
		staticProductsDetails,
	);

	return { data: data[0], error, loading };
};

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

export const useBorderColorImages = () =>
	useDriveFolderDev("borderColors", staticBorderColorImages);

export const useProductImages = () => {
	const data = useDriveFolder(
		import.meta.env.DEV ? "productsImages" : null,
		{ multipleFolders: true },
	);

	if (!import.meta.env.DEV)
		return { folders: staticProductFolders, loading: false, error: null };

	return data;
};
