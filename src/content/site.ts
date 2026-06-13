import type { SiteContent } from "../types";
import siteJson from "./site.json";

/**
 * The Site Content singleton: all editable storefront copy plus the global
 * Instagram URL and WhatsApp number. Bundled at build time, so there are zero
 * network requests.
 */
export const siteContent: SiteContent = siteJson;
