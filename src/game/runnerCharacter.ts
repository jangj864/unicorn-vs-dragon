import u1 from "../imports/arcade-props/runner-unicorn-1.png";
import u2 from "../imports/arcade-props/runner-unicorn-2.png";
import u3 from "../imports/arcade-props/runner-unicorn-3.png";
import d1 from "../imports/arcade-props/runner-dragon-1.png";
import d2 from "../imports/arcade-props/runner-dragon-2.png";
import d3 from "../imports/arcade-props/runner-dragon-3.png";
import type { Game } from "./engine";

const characters = {
  unicorn: [{ url: u1, crop: [32, 216, 1184, 872] }, { url: u2, crop: [36, 268, 1172, 796] }, { url: u3, crop: [8, 184, 1246, 920] }],
  dragon: [{ url: d1, crop: [16, 192, 1212, 888] }, { url: d2, crop: [16, 244, 1220, 820] }, { url: d3, crop: [4, 140, 1250, 1000] }],
};

export function runnerCharacter(team: "unicorn" | "dragon", level: number) {
  return characters[team][Math.max(0, Math.min(2, level - 1))];
}

export function loadRunnerCharacter(team: "unicorn" | "dragon", level: number) {
  const art = runnerCharacter(team, level);
  const image = new Image();
  image.src = art.url;
  return { image, crop: art.crop };
}

export function drawRunnerCharacter(ctx: CanvasRenderingContext2D, game: Game, art: ReturnType<typeof loadRunnerCharacter>) {
  if (!art.image.complete || !art.image.naturalWidth) return false;
  const [sx, sy, sw, sh] = art.crop;
  const width = 78;
  const height = width * sh / sw;
  const stride = game.height > 0 ? 0 : Math.sin(game.distance / 9);
  ctx.save();
  ctx.translate(80, 304 - game.height - Math.abs(stride) * 2);
  ctx.rotate(game.height > 0 ? -0.05 : stride * 0.018);
  ctx.drawImage(art.image, sx, sy, sw, sh, -width / 2, -height, width, height);
  ctx.restore();
  return true;
}
