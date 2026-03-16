import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const EMPTY_DATA = JSON.stringify({ meta: {}, data: [] });

const stubs = {
	"products.json": EMPTY_DATA,
	"smocks.json": EMPTY_DATA,
	"gallery.json": EMPTY_DATA,
	"stamps.json": EMPTY_DATA,
	"border-colors.json": EMPTY_DATA,
	"product-images.json": EMPTY_DATA,
	"drive-manifest.json": "{}",
};

let created = 0;
for (const [file, content] of Object.entries(stubs)) {
	const path = join(DATA_DIR, file);
	if (!existsSync(path)) {
		writeFileSync(path, content + "\n");
		created++;
		console.log(`  ✓ Created stub: ${file}`);
	}
}

if (created === 0) console.log("  All data stubs already exist.");
