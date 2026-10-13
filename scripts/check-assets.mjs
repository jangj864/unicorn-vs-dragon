import { open, readdir } from "node:fs/promises";
import { extname } from "node:path";

// Check headers without loading every large source image into memory.
const roots = [new URL("../src/imports/", import.meta.url), new URL("../public/", import.meta.url)];
const signatures = {
  ".png": bytes => bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  ".webp": bytes => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
  ".woff2": bytes => bytes.toString("ascii", 0, 4) === "wOF2",
};
let count = 0;
for (const root of roots) {
  for (const entry of await readdir(root, { recursive: true })) {
    const validate = signatures[extname(entry)];
    if (!validate) continue;
    const file = await open(new URL(entry.replaceAll("\\", "/"), root));
    try {
      const header = Buffer.alloc(16);
      const { bytesRead } = await file.read(header, 0, header.length, 0);
      if (bytesRead < 16 || !validate(header)) throw new Error(`Invalid asset: ${entry}. Restore the file with git lfs pull before building.`);
      count++;
    } finally { await file.close(); }
  }
}
console.log(`Verified ${count} image and font assets.`);
