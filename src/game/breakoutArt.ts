import { loadImage } from "./imageCache";
import unicorn_red from "../imports/arcade-props/breakout-unicorn-red.webp";
import unicorn_gold from "../imports/arcade-props/breakout-unicorn-gold.webp";
import unicorn_blue from "../imports/arcade-props/breakout-unicorn-blue.webp";
import unicorn_purple from "../imports/arcade-props/breakout-unicorn-purple.webp";
import unicorn_paddle from "../imports/arcade-props/breakout-unicorn-paddle.webp";
import dragon_red from "../imports/arcade-props/breakout-dragon-red.webp";
import dragon_gold from "../imports/arcade-props/breakout-dragon-gold.webp";
import dragon_blue from "../imports/arcade-props/breakout-dragon-blue.webp";
import dragon_purple from "../imports/arcade-props/breakout-dragon-purple.webp";
import dragon_paddle from "../imports/arcade-props/breakout-dragon-paddle.webp";
import type { Game } from "./engine";
const art = {
  unicorn: { urls: [unicorn_red, unicorn_gold, unicorn_blue, unicorn_purple, unicorn_paddle], crops: [[56,460,1148,340],[40,500,1180,388],[44,472,1168,344],[60,452,1140,364],[112,148,1952,452]] },
  dragon: { urls: [dragon_red, dragon_gold, dragon_blue, dragon_purple, dragon_paddle], crops: [[48,452,1164,368],[16,424,1224,424],[36,444,1184,400],[24,444,1208,376],[32,160,2108,428]] },
};
export function loadBreakoutArt(team: "unicorn" | "dragon") {
  const skin = art[team];
  return { crops: skin.crops, images: skin.urls.map(url => {
    return loadImage(url);
  }) };
}
export function drawBreakoutArt(ctx: CanvasRenderingContext2D, game: Game, skin: ReturnType<typeof loadBreakoutArt>) {
  if (skin.images.some(image => !image.complete || !image.naturalWidth)) return false;
  const paint = (index: number, x: number, y: number, w: number, h: number) => {
    const [sx,sy,sw,sh] = skin.crops[index];
    ctx.drawImage(skin.images[index],sx,sy,sw,sh,x,y,w,h);
  };
  game.bricks.forEach((brick,index) => {
    if (brick.alive) paint(Math.floor(index / 6) % 4,brick.x,brick.y,68,18);
  });
  // Keep the playing surface aligned with the existing paddle collision plane.
  paint(4,game.paddle-40,309,80,18);
  return true;
}