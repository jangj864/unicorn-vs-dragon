import { useEffect, useRef } from "react";
import { draw } from "./ArcadeGame";
import { createGame, type Mode } from "./engine";

export default function GamePreview({ mode, background, label }: { mode: Mode; background: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let disposed = false;
    const image = new Image();
    const hero = new Image();
    const game = createGame(mode);
    if (mode === "snake") { game.snake = [{x:10,y:5},{x:9,y:5},{x:8,y:5},{x:8,y:6},{x:8,y:7},{x:7,y:7},{x:6,y:7}]; game.food = {x:13,y:4}; }
    if (mode === "breakout") { game.ball.docked = false; game.ball.x = 260; game.ball.y = 245; }
    const paint = () => { const ctx=canvas.current?.getContext("2d"); if(ctx&&!disposed)draw(ctx,game,image,hero); };
    image.onload = paint;
    image.src = background;
    paint();
    return () => { disposed = true; image.onload = null; };
  }, [mode, background]);
  return <canvas ref={canvas} width={480} height={360} role="img" aria-label={label} />;
}
