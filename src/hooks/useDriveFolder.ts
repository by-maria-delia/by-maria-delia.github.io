import { useEffect, useState } from "react";
import {
	BORDER_COLORS_DRIVE_FOLDER_ID,
	GALLERY_DRIVE_FOLDER_ID,
	PRODUCTS_IMAGES_DRIVE_FOLDER_ID,
	STAMPS_DRIVE_FOLDER_ID,
} from "../config";
import type { DriveFolder, DriveFolderType, DriveImage } from "../types";

const FOLDER_IDS: Record<DriveFolderType, string> = {
	productsImages: PRODUCTS_IMAGES_DRIVE_FOLDER_ID,
	gallery: GALLERY_DRIVE_FOLDER_ID,
	stamps: STAMPS_DRIVE_FOLDER_ID,
	borderColors: BORDER_COLORS_DRIVE_FOLDER_ID,
};

interface UseDriveFolderOptions {
	multipleFolders?: boolean;
}

interface UseDriveFolderResult {
	images: DriveImage[];
	folders: DriveFolder[];
	loading: boolean;
	error: string | null;
}

const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";

async function driveList(
	query: string,
): Promise<{ id: string; name: string }[]> {
	const params = new URLSearchParams({
		q: query,
		key: apiKey,
		fields: "files(id,name)",
		pageSize: "100",
		orderBy: "name",
	});

	const response = await fetch(`${DRIVE_API}?${params}`);
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	const json = await response.json();
	return json.files ?? [];
}

export default function useDriveFolder(
	type: DriveFolderType | null,
	options?: UseDriveFolderOptions,
): UseDriveFolderResult {
	const [images, setImages] = useState<DriveImage[]>([]);
	const [folders, setFolders] = useState<DriveFolder[]>([]);
	const [loading, setLoading] = useState(!!type && !!apiKey);
	const [error, setError] = useState<string | null>(null);

	const multipleFolders = options?.multipleFolders ?? false;

	useEffect(() => {
		if (!type || !apiKey) return;

		const folderId = FOLDER_IDS[type];
		let cancelled = false;

		async function fetchSingleFolder() {
			try {
				const files = await driveList(
					`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
				);

				if (!cancelled) {
					setImages(files);
					setLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err));
					setLoading(false);
				}
			}
		}

		async function fetchMultipleFolders() {
			try {
				const subfolders = await driveList(
					`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
				);

				const results = await Promise.all(
					subfolders.map(async (folder) => {
						const images = await driveList(
							`'${folder.id}' in parents and mimeType contains 'image/' and trashed = false`,
						);
						return { id: folder.id, name: folder.name, images };
					}),
				);

				if (!cancelled) {
					setFolders(results);
					setLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err));
					setLoading(false);
				}
			}
		}

		if (multipleFolders) {
			fetchMultipleFolders();
		} else {
			fetchSingleFolder();
		}

		return () => {
			cancelled = true;
		};
	}, [type, multipleFolders]);

	return { images, folders, loading, error };
}

import driveManifest from "../data/drive-manifest.json";

const imageManifest = driveManifest as Record<string, string>;

/** Builds a direct-display URL for a publicly shared Drive image. */
export function driveImageUrl(fileId: string): string {
	// if instead of a fileId is passed a full URL, extract the ID
	if (fileId.startsWith("http")) {
		const match = fileId.match(/\/d\/([^/]+)/);
		if (match) fileId = match[1];
		else {
			console.warn("Could not extract file ID from URL:", fileId);
			return "";
		}
	}

	// In production, use prefetched local images
	const ext = imageManifest[fileId];
	if (!import.meta.env.DEV && ext) {
		return `${import.meta.env.BASE_URL}drive-images/${fileId}.${ext}`;
	}

	return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${import.meta.env.VITE_GOOGLE_DRIVE_API_KEY}`;
}
