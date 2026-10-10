import unicornShip from "../imports/arcade-props/unicorn-ship.png";
import dragonShip from "../imports/arcade-props/dragon-ship.png";
import unicornHead from "../imports/arcade-props/unicorn-head.png";
import dragonHead from "../imports/arcade-props/dragon-head.png";
import unicornShot from "../imports/arcade-props/unicorn-shot.png";
import dragonShot from "../imports/arcade-props/dragon-shot.png";
import type { Game } from "./engine";

export type InvaderArt = { team: "dragon" | "unicorn"; images: HTMLImageElement[] };
export function loadInvaderArt(team: InvaderArt["team"], onLoad?: () => void): InvaderArt {
  return { team, images: [unicornShip, dragonShip, unicornHead, dragonHead, unicornShot, dragonShot].map(url => {
    const image = new Image();
    if (onLoad) image.onload = onLoad;
    image.src = url;
    return image;
  }) };
}

export function drawInvaderArt(ctx: CanvasRenderingContext2D, game: Game, art: InvaderArt) {
  if (art.images.some(image => !image.complete || !image.naturalWidth)) return false;
  const own = art.team === "unicorn" ? 0 : 1;
  const rival = 1 - own;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const enemy of game.enemies) {
    if (!enemy.alive) continue;
    ctx.drawImage(art.images[2 + rival], 88, 12, 1088, 1216, enemy.x, enemy.y, 24, 27);
  }
  if (game.immune === 0 || Math.floor(game.elapsed * 12) % 2 === 0) {
    ctx.drawImage(art.images[own], game.ship - 20, 296, 40, 40);
  }
  for (const bullet of game.bullets) {
    const faction = bullet.enemy ? rival : own;
    ctx.save();
    ctx.translate(bullet.x, bullet.y + 5);
    // Both supplied projectiles point right: turn toward their travel direction.
    ctx.rotate(bullet.enemy ? Math.PI / 2 : -Math.PI / 2);
    if (faction === 0) ctx.drawImage(art.images[4], 144, 232, 980, 792, -10, -8, 20, 16);
    else ctx.drawImage(art.images[5], 68, 316, 1140, 624, -12, -6.5, 24, 13);
    ctx.restore();
  }
  ctx.restore();
  return true;
}
