import headUrl from "../imports/dragon-snake-head.png";
import bodyUrl from "../imports/dragon-snake-body.png";
import tailUrl from "../imports/dragon-snake-tail.png";
import unicornHead from "../imports/unicorn-snake-head.png";
import unicornBody from "../imports/unicorn-snake-body.png";
import unicornTail from "../imports/unicorn-snake-tail.png";
import type { Game, Point } from "./engine";

export type SnakeSkin = { images: HTMLImageElement[]; team: "dragon" | "unicorn" };
export function loadSnakeSkin(team: SnakeSkin["team"]): SnakeSkin {
  const urls = team === "dragon" ? [headUrl, bodyUrl, tailUrl] : [unicornHead, unicornBody, unicornTail];
  return { team, images: urls.map(url => {
    const image = new Image();
    image.src = url;
    return image;
  }) };
}

const center = (p: Point): Point => ({ x: 30 + p.x * 22, y: 36 + p.y * 22 });
const middle = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
// The supplied overhead artwork faces down. Rotate the whole sprite, not the board.
const angle = (x: number, y: number) => Math.atan2(y, x) - Math.PI / 2;

export function drawSnakeSkin(ctx: CanvasRenderingContext2D, game: Game, skin: SnakeSkin) {
  const { images, team } = skin;
  const unicorn = team === "unicorn";
  if (images.length !== 3 || images.some(image => !image.complete || !image.naturalWidth)) return false;
  const [head, body, tail] = images;
  const points = game.snake.map(center);
  if (!points.length) return true;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // Sample narrow strips of the original scales along each curved cell. This
  // keeps the neck continuous through all four corners without square joints.
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    const start = i === points.length - 1 ? p : middle(p, points[i + 1]);
    const end = i === 0 ? p : middle(p, points[i - 1]);
    for (let n = 0; n <= 24; n++) {
      const t = n / 24, u = 1 - t;
      const x = u*u*start.x + 2*u*t*p.x + t*t*end.x;
      const y = u*u*start.y + 2*u*t*p.y + t*t*end.y;
      const dx = 2*u*(p.x-start.x) + 2*t*(end.x-p.x);
      const dy = 2*u*(p.y-start.y) + 2*t*(end.y-p.y);
      if (dx === 0 && dy === 0) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle(dx, dy));
      const sourceY = unicorn ? 300 + ((i * 360 + n * 15) % 480) : 120 + ((i * 480 + n * 20) % 960);
      ctx.drawImage(body, unicorn ? 432 : 420, sourceY, unicorn ? 388 : 416, 40, -9, -1, 18, 2);
      ctx.restore();
    }
  }
  if (points.length > 1) {
    const tip = points[points.length - 1], before = points[points.length - 2];
    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.rotate(angle(tip.x - before.x, tip.y - before.y));
    if (unicorn) ctx.drawImage(tail, 412, 320, 472, 856, -10, -11, 20, 29);
    else ctx.drawImage(tail, 438, 530, 376, 674, -9, -11, 18, 25);
    ctx.restore();
  }
  ctx.translate(points[0].x, points[0].y);
  ctx.rotate(angle(game.direction.x, game.direction.y));
  if (unicorn) ctx.drawImage(head, 232, 64, 792, 1148, -11, -15, 22, 31);
  else ctx.drawImage(head, 220, 48, 814, 1174, -11, -15, 22, 31);
  ctx.restore();
  return true;
}
