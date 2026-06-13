declare module "swiper/css" {}
declare module "swiper/css/navigation" {}
declare module "swiper/css/pagination" {}
declare module "swiper/css/zoom" {}

interface ImportMetaEnv {
	readonly VITE_SHEET_CSV_URL: string;
	readonly VITE_GOOGLE_DRIVE_API_KEY: string;
}

// biome-ignore lint/correctness/noUnusedVariables: this is needed for TypeScript to recognize import.meta.env
interface ImportMeta {
	readonly env: ImportMetaEnv;
}
