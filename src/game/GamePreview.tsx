import { loadBreakoutArt } from "./breakoutArt";
import { loadSnakeSkin } from "./snakeSkin";
import { loadRunnerCharacter } from "./runnerCharacter";
import { loadInvaderArt, type InvaderArt } from "./invaderArt";
import { loadRunnerArt } from "./runnerArt";
import { useEffect, useRef } from "react";
import { draw } from "./ArcadeGame";
import { createGame, type Mode } from "./engine";

export default function GamePreview({ mode, background, label, team = "unicorn" }: { team?: "dragon" | "unicorn"; mode: Mode; background: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let disposed = false;
    const image = new Image();
    const hero = new Image();
    const game = createGame(mode);
    if (mode === "snake") { game.snake = [{x:10,y:5},{x:9,y:5},{x:8,y:5},{x:8,y:6},{x:8,y:7},{x:7,y:7},{x:6,y:7}]; game.food = {x:13,y:4}; }
    if (mode === "breakout") { game.ball.docked = false; game.ball.x = 260; game.ball.y = 245; }
    let invaderArt: InvaderArt | undefined;
    if (mode === "invader") game.bullets = [{x:240,y:236,enemy:false},{x:130,y:148,enemy:true}];
    let runnerArt: HTMLImageElement[] | undefined;
    if (mode === "runner") game.obstacles = [110, 220, 340];
    const snakeSkin = mode === "snake" ? loadSnakeSkin(team) : undefined;
    const runnerHero = mode === "runner" ? loadRunnerCharacter(team, 3) : undefined;
    let breakoutArt: ReturnType<typeof loadBreakoutArt> | undefined;
    const paint = () => { const ctx=canvas.current?.getContext("2d"); if(ctx&&!disposed)draw(ctx,game,image,hero,snakeSkin,runnerArt,invaderArt,runnerHero,breakoutArt); };
    if (mode === "runner") runnerArt = loadRunnerArt(paint);
    if (mode === "invader") invaderArt = loadInvaderArt(team, paint);
    snakeSkin?.images.forEach(image => { image.onload = paint; });
    if (runnerHero) runnerHero.image.onload = paint;
    if (mode === "breakout") breakoutArt = loadBreakoutArt(team, paint);
    image.onload = paint;
    image.src = background;
    paint();
    return () => { disposed = true; breakoutArt?.images.forEach(image => { image.onload = null; }); snakeSkin?.images.forEach(image => { image.onload = null; }); if (runnerHero) runnerHero.image.onload = null; invaderArt?.images.forEach(image => { image.onload = null; }); image.onload = null; runnerArt?.forEach(image => { image.onload = null; }); };
  }, [mode, background, team]);
  return <canvas ref={canvas} width={480} height={360} role="img" aria-label={label} />;
}
