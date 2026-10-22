export type MapView = { x: number; y: number; zoom: number };
export type PanBounds = { maxX: number; maxY: number; minY: number };

export function getPanBounds(width: number, height: number, canvasWidth: number, canvasHeight: number, zoom: number, bottomOverlap = 0): PanBounds {
  const maxY = Math.max(0, (canvasHeight * zoom - height) / 2);
  return {
    maxX: Math.max(0, (canvasWidth * zoom - width) / 2),
    maxY,
    minY: -maxY - Math.min(height, Math.max(0, bottomOverlap)),
  };
}

/** Return the same object at a boundary so React can skip redundant renders. */
export function constrainMap(view: MapView, bounds: PanBounds, x = view.x, y = view.y, zoom = view.zoom): MapView {
  x = Math.min(bounds.maxX, Math.max(-bounds.maxX, x));
  y = Math.min(bounds.maxY, Math.max(bounds.minY, y));
  return x === view.x && y === view.y && zoom === view.zoom ? view : { x, y, zoom };
}
