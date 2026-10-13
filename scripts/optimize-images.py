"""Create lossless WebP copies of referenced PNGs (requires Pillow).
Original PNG artwork is retained. Re-run after changing an original image.
"""
from pathlib import Path
import re
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[1]
files = [p for p in (root / 'src').rglob('*') if p.suffix in {'.ts', '.tsx', '.css'}]
pattern = re.compile(r'''(?P<quote>["'])(?P<path>\.[^"']+\.(?:png|webp))(?P=quote)''')
images = {}
for file in files:
    for match in pattern.finditer(file.read_text()):
        original = (file.parent / match['path']).resolve().with_suffix('.png')
        if original.is_file():
            images[original] = original.with_suffix('.webp')
original_bytes = optimized_bytes = 0
for original, output in sorted(images.items()):
    with Image.open(original) as source:
        rgba = source.convert('RGBA')
        rgba.save(output, 'WEBP', lossless=True, method=4, exact=True)
        with Image.open(output) as result:
            decoded = result.convert('RGBA')
            assert decoded.size == rgba.size
            assert ImageChops.difference(rgba, decoded).getbbox(alpha_only=False) is None, original
    original_bytes += original.stat().st_size
    optimized_bytes += output.stat().st_size
for file in files:
    source = file.read_text()
    def replace(match):
        original = (file.parent / match['path']).resolve().with_suffix('.png')
        return match[0].replace('.png', '.webp') if original in images else match[0]
    updated = pattern.sub(replace, source)
    if updated != source:
        file.write_text(updated)
print(f'{len(images)} images verified pixel-for-pixel: {original_bytes:,} -> {optimized_bytes:,} bytes ({100 * (1-optimized_bytes/original_bytes):.1f}% smaller).')
