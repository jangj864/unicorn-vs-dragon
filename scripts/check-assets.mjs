import { readdir, readFile } from "node:fs/promises";
import { extname } from "node:path";

// Fail before publishing if Git LFS left text pointers in place of images.
const root = new URL("../src/imports/", import.meta.url);
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
let count = 0;
for (const entry of await readdir(root, { recursive: true })) {
  if (extname(entry) !== ".png") continue;
  const bytes = await readFile(new URL(entry.replaceAll("\\", "/"), root));
  if (!bytes.subarray(0, 8).equals(signature) || bytes.length < 33) {
    throw new Error(`Invalid PNG asset: ${entry}. Restore the image with git lfs pull before building.`);
  }
  count++;
}
console.log(`Verified ${count} PNG assets.`);
