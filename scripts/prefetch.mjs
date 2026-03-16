import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");
const IMAGES_DIR = join(ROOT, "public", "drive-images");

// ── Env vars ──────────────────────────────────────────────────────────
// CI provides env vars directly; locally fall back to .env file
function loadEnv() {
	if (!process.env.VITE_SHEET_CSV_URL) {
		try {
			const envFile = readFileSync(join(ROOT, ".env"), "utf-8");
			for (const line of envFile.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const eqIdx = trimmed.indexOf("=");
				if (eqIdx === -1) continue;
				const key = trimmed.slice(0, eqIdx);
				const value = trimmed.slice(eqIdx + 1);
				if (!process.env[key]) process.env[key] = value;
			}
		} catch {
			// .env may not exist in CI
		}
	}
}
loadEnv();

const SHEET_CSV_URL = process.env.VITE_SHEET_CSV_URL;
const DRIVE_API_KEY = process.env.VITE_GOOGLE_DRIVE_API_KEY;

if (!SHEET_CSV_URL) {
	console.error("Missing VITE_SHEET_CSV_URL");
	process.exit(1);
}
if (!DRIVE_API_KEY) {
	console.error("Missing VITE_GOOGLE_DRIVE_API_KEY");
	process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────
async function fetchWithRetry(url, retries = 3) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
			return res;
		} catch (err) {
			if (attempt === retries) throw err;
			const delay = 1000 * 2 ** (attempt - 1);
			console.warn(`  Attempt ${attempt} failed, retrying in ${delay}ms...`);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
}

function sheetUrl(gid) {
	return `${SHEET_CSV_URL}?gid=${gid}&single=true&output=csv`;
}

function writeData(filename, data) {
	const output = {
		meta: { fetchedAt: new Date().toISOString() },
		data,
	};
	const path = join(DATA_DIR, filename);
	writeFileSync(path, JSON.stringify(output, null, "\t") + "\n");
	console.log(`  ✓ ${filename} (${data.length} items)`);
}

// ── Fetch Google Sheet (CSV) ──────────────────────────────────────────
async function fetchSheet(gid, filename) {
	const url = sheetUrl(gid);
	const res = await fetchWithRetry(url);
	const text = await res.text();
	const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
	writeData(filename, data);
}

// ── Google Drive ──────────────────────────────────────────────────────
// Mirrors config.ts folder IDs and useDriveFolder.ts folder types
const FOLDER_IDS = {
	productsImages: "1GFqc4b_f0AOx77SctLcDIlVSSwSlxkQX",
	gallery: "1A5Wa_M-i2aXM4BCLA-xvLgzzGriQ3Na1",
	stamps: "1oM-E5h_3KE63q5l3-_x3nYBeVCN6SE2k",
	borderColors: "1GFqc4b_f0AOx77SctLcDIlVSSwSlxkQX",
};

// Paginated Drive file listing — mirrors useDriveFolder.ts driveList()
async function driveList(query) {
	let allFiles = [];
	let pageToken = undefined;

	do {
		const params = new URLSearchParams({
			q: query,
			key: DRIVE_API_KEY,
			fields: "nextPageToken,files(id,name)",
			pageSize: "100",
			orderBy: "name",
		});
		if (pageToken) params.set("pageToken", pageToken);

		const res = await fetchWithRetry(
			`https://www.googleapis.com/drive/v3/files?${params}`,
		);
		const json = await res.json();
		allFiles = allFiles.concat(json.files ?? []);
		pageToken = json.nextPageToken;
	} while (pageToken);

	return allFiles;
}

async function fetchDriveFolder(folderKey, filename) {
	const folderId = FOLDER_IDS[folderKey];
	const files = await driveList(
		`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
	);
	writeData(filename, files);
}

// Mirrors useDriveFolder.ts multipleFolders option: lists subfolders, then images in each
async function fetchDriveMultiFolder(folderKey, filename) {
	const folderId = FOLDER_IDS[folderKey];
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

	writeData(filename, results);
}

// ── Download Drive images ─────────────────────────────────────────────
const MIME_TO_EXT = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/svg+xml": "svg",
};

// Shared manifest: fileId → extension (written to src/data at the end)
const manifest = {};

async function downloadImage(fileId) {
	if (!fileId || manifest[fileId]) return;
	try {
		const res = await fetchWithRetry(
			`https://lh3.googleusercontent.com/d/${fileId}`,
		);
		const contentType = res.headers.get("content-type") ?? "image/jpeg";
		const ext = MIME_TO_EXT[contentType] ?? "jpg";
		const buffer = Buffer.from(await res.arrayBuffer());
		writeFileSync(join(IMAGES_DIR, `${fileId}.${ext}`), buffer);
		manifest[fileId] = ext;
	} catch (err) {
		console.warn(`  ⚠ Failed to download ${fileId}: ${err.message}`);
	}
}

async function downloadAllImages(imageIds) {
	if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

	// Download in batches of 5 to avoid overwhelming the API
	const BATCH = 5;
	for (let i = 0; i < imageIds.length; i += BATCH) {
		await Promise.all(imageIds.slice(i, i + BATCH).map(downloadImage));
	}
}

function writeManifest() {
	const path = join(DATA_DIR, "drive-manifest.json");
	writeFileSync(path, JSON.stringify(manifest, null, "\t") + "\n");
	console.log(`  ✓ drive-manifest.json (${Object.keys(manifest).length} images)`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
	console.log("Prefetching data...\n");

	// 1. Fetch metadata (sheets + drive folders)
	await Promise.all([
		fetchSheet(0, "products.json"),
		fetchSheet(210216102, "smocks.json"),
		fetchDriveFolder("gallery", "gallery.json"),
		fetchDriveFolder("stamps", "stamps.json"),
		fetchDriveFolder("borderColors", "border-colors.json"),
		fetchDriveMultiFolder("productsImages", "product-images.json"),
	]);

	// 2. Collect all image IDs to download
	const readJson = (f) => JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8"));
	const galleryData = readJson("gallery.json");
	const stampsData = readJson("stamps.json");
	const borderColorsData = readJson("border-colors.json");
	const productsData = readJson("products.json");
	const productImagesData = readJson("product-images.json");

	const imageIds = [
		...galleryData.data.map((f) => f.id),
		...stampsData.data.map((f) => f.id),
		...borderColorsData.data.map((f) => f.id),
		...productsData.data.map((p) => p.imagen).filter(Boolean),
		...productImagesData.data.flatMap((folder) => folder.images.map((img) => img.id)),
	];

	// 3. Download images + write manifest
	console.log(`\n  Downloading ${imageIds.length} images...`);
	await downloadAllImages(imageIds);
	writeManifest();

	console.log("\nDone!");
}

main().catch((err) => {
	console.error("Prefetch failed:", err);
	process.exit(1);
});
