export function sheetUrl(gid: number | string): string {
	return `${import.meta.env.VITE_SHEET_CSV_URL}?gid=${gid}&single=true&output=csv`;
}

export const PRODUCTS_SHEET_CSV_URL = sheetUrl(0);
export const SMOCKS_DATA_SHEET_CSV_URL = sheetUrl(210216102);

// Google Drive gallery — share the folder publicly (Anyone with the link → Viewer)
// and use the folder ID from the share URL (https://drive.google.com/drive/folders/{FOLDER_ID}).
export const PRODUCTS_IMAGES_DRIVE_FOLDER_ID =
	"1GFqc4b_f0AOx77SctLcDIlVSSwSlxkQX";
export const GALLERY_DRIVE_FOLDER_ID = "1A5Wa_M-i2aXM4BCLA-xvLgzzGriQ3Na1";
export const STAMPS_DRIVE_FOLDER_ID = "1oM-E5h_3KE63q5l3-_x3nYBeVCN6SE2k";
export const BORDER_COLORS_DRIVE_FOLDER_ID =
	"1GFqc4b_f0AOx77SctLcDIlVSSwSlxkQX";

export const WHATSAPP_NUMBER = import.meta.env.VITE_WSP_NUMBER;
export const INSTAGRAM_URL = "https://instagram.com/mariadelia_guardapolvos";
