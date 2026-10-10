import platformUrl from "../imports/arcade-props/runner-platform.png";
import pillarUrl from "../imports/arcade-props/runner-pillar.png";
import crateUrl from "../imports/arcade-props/runner-crate.png";
import blockUrl from "../imports/arcade-props/runner-cracked-block.png";
import { runnerObstacle, type Game } from "./engine";

export function loadRunnerArt(onLoad?: () => void) {
  return [platformUrl, pillarUrl, crateUrl, blockUrl].map(url => {
    const image = new Image();
    if (onLoad) image.onload = onLoad;
    image.src = url;
    return image;
  });
}

export function drawRunnerArt(ctx: CanvasRenderingContext2D, game: Game, images: HTMLImageElement[]) {
  if (images.length !== 4 || images.some(image => !image.complete || !image.naturalWidth)) return false;
  const [platform, pillar, crate, block] = images;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#101c2b";
  ctx.fillRect(0, 304, 480, 56);
  for (let x = -(game.distance % 320); x < 480; x += 320) {
    ctx.drawImage(platform, 20, 460, 1408, 248, x, 304, 321, 56);
  }
  for (const point of game.obstacles) {
    const x = point - game.distance + 80;
    const obstacle = runnerObstacle(point);
    if (x + obstacle.width < 0 || x > 480) continue;
    if (obstacle.kind === "pillar") ctx.drawImage(pillar, 220, 116, 648, 1240, x, 304 - obstacle.height, obstacle.width, obstacle.height);
    else if (obstacle.kind === "block") ctx.drawImage(block, 76, 356, 1100, 520, x, 304 - obstacle.height, obstacle.width, obstacle.height);
    else ctx.drawImage(crate, 176, 188, 904, 880, x, 304 - obstacle.height, obstacle.width, obstacle.height);
  }
  ctx.restore();
  return true;
}
