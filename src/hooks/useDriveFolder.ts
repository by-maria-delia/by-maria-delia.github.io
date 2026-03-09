import { useEffect, useState } from "react";
import {
	BORDER_COLORS_DRIVE_FOLDER_ID,
	GALLERY_DRIVE_FOLDER_ID,
	STAMPS_DRIVE_FOLDER_ID,
} from "../config";
import type { DriveImage } from "../types";

type FolderType = "gallery" | "stamps" | "border_colors";

const FOLDER_IDS: Record<FolderType, string> = {
	gallery: GALLERY_DRIVE_FOLDER_ID,
	stamps: STAMPS_DRIVE_FOLDER_ID,
	border_colors: BORDER_COLORS_DRIVE_FOLDER_ID,
};

interface UseDriveFolderResult {
	images: DriveImage[];
	loading: boolean;
	error: string | null;
}

const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

export default function useDriveFolder(type: FolderType): UseDriveFolderResult {
	const [images, setImages] = useState<DriveImage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!apiKey) {
			setLoading(false);
			return;
		}

		let cancelled = false;

		async function fetchFolder() {
			try {
				const folderId = FOLDER_IDS[type];
				const params = new URLSearchParams({
					q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
					key: apiKey,
					fields: "files(id,name)",
					pageSize: "50",
					orderBy: "name",
				});

				const response = await fetch(
					`https://www.googleapis.com/drive/v3/files?${params}`,
				);

				if (!response.ok) throw new Error(`HTTP ${response.status}`);

				const json = await response.json();

				if (!cancelled) {
					console.log("Fetched Drive folder data:", json);
					setImages(json.files ?? []);
					setLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err));
					setLoading(false);
				}
			}
		}

		fetchFolder();
		return () => {
			cancelled = true;
		};
	}, [type]);

	return { images, loading, error };
}

/** Builds a direct-display URL for a publicly shared Drive image. */
export function driveImageUrl(fileId: string): string {
	return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${import.meta.env.VITE_GOOGLE_DRIVE_API_KEY}`;
	// return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
	// return `https://drive.google.com/uc?export=view&id=${fileId}`;
	// return `https://lh3.googleusercontent.com/d/${fileId}`;
}
