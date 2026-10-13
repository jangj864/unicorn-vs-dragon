/** Share decoded images without letting one canvas overwrite another's load handler. */
const images = new Map<string, HTMLImageElement>();
const MAX_CACHED_IMAGES = 24;
export function loadImage(url: string): HTMLImageElement {
  let image = images.get(url);
  if (!image) {
    image = new Image();
    image.decoding = "async";
    image.src = url;
    images.set(url, image);
    image.addEventListener("error", () => { if (images.get(url) === image) images.delete(url); }, { once: true });
    if (images.size > MAX_CACHED_IMAGES) images.delete(images.keys().next().value!);
  }
  // Refresh recency; eviction never invalidates images held by active canvases.
  images.delete(url);
  images.set(url, image);
  return image;
}
export function watchImages(images: HTMLImageElement[], onLoad: () => void) {
  const pending = images.filter(image => !image.complete);
  pending.forEach(image => image.addEventListener("load", onLoad));
  return () => pending.forEach(image => image.removeEventListener("load", onLoad));
}
