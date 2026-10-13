import { draw } from "./drawGame";
import { loadImage, watchImages } from "./imageCache";
import { playSound, pauseMusic } from "./audio";
import { loadBreakoutArt } from "./breakoutArt";
import { loadRunnerCharacter } from "./runnerCharacter";
import { memoryCards } from "./memoryCards";
import { loadInvaderArt } from "./invaderArt";
import { loadRunnerArt } from "./runnerArt";
import { loadSnakeSkin } from "./snakeSkin";
import { formatRecord } from "./rankings";
import { useEffect, useMemo, useRef, useState } from "react";
import { blankInput, createGame, flipCard, stepGame, turnSnake, WIDTH, HEIGHT, type Mode } from "./engine";

import "./arcade.css";

type Props = { team: "dragon" | "unicorn"; mode: Mode; locale: "ko" | "en"; guardian: string; guardianLevel?: number; background: string; onFinish: (milliseconds: number) => void; onExit: () => void };
const names = {
  snake: ["서펀트 스네이크", "SERPENT SNAKE"], breakout: ["브릭 브레이커", "BRICK BREAKER"],
  memory: ["룬 메모리", "RUNE MEMORY"], invader: ["스카이 인베이더", "SKY INVADER"], runner: ["포탈 러너", "PORTAL RUNNER"],
};
export default function ArcadeGame({team,mode,locale,guardian,guardianLevel=1,background,onFinish,onExit}:Props){
  const ko=locale==="ko",lang=ko?0:1;
  const [initialGame] = useState(() => createGame(mode, Math.random, true));
  const game = useRef(initialGame);
  const input=useRef(blankInput());
  const canvas=useRef<HTMLCanvasElement>(null);
  const [phase,setPhase]=useState<"ready"|"play"|"paused">("ready");
  const [,refresh]=useState(0);
  const claimed=useRef(false);
  useEffect(() => { pauseMusic(phase === "paused"); return () => pauseMusic(false); }, [phase]);
  const g=game.current;
  const reset=()=>{game.current=createGame(mode, Math.random, true);input.current=blankInput();claimed.current=false;setPhase("ready");refresh(n=>n+1);};
  const art = useMemo(() => ({
    image: loadImage(background),
    breakoutArt: mode === "breakout" ? loadBreakoutArt(team) : undefined,
    invaderArt: mode === "invader" ? loadInvaderArt(team) : undefined,
    runnerArt: mode === "runner" ? loadRunnerArt() : undefined,
    runnerHero: mode === "runner" ? loadRunnerCharacter(team, guardianLevel) : undefined,
    snakeSkin: mode === "snake" ? loadSnakeSkin(team) : undefined,
  }), [background, team, mode, guardianLevel]);
  useEffect(()=>{
    const { image, breakoutArt, invaderArt, runnerArt, runnerHero, snakeSkin } = art;
    const paint = () => { const context = canvas.current?.getContext("2d"); if (context) draw(context, game.current, image, snakeSkin, runnerArt, invaderArt, runnerHero, breakoutArt); };
    const stopWatching = watchImages([image, ...(breakoutArt?.images ?? []), ...(invaderArt?.images ?? []), ...(runnerArt ?? []), ...(snakeSkin?.images ?? []), ...(runnerHero ? [runnerHero.image] : [])], paint);
    let frame=0,last=0,update=0;
    const loop=(now:number)=>{
      const dt=last?Math.min(.04,(now-last)/1000):0;last=now;
      if(phase==="play") {
        const before = { score: game.current.score, lives: game.current.lives, status: game.current.status, matched: game.current.matched.length, height: game.current.height, coins: game.current.coins.length, bullets: game.current.bullets.filter(b => !b.enemy).length };
        stepGame(game.current,input.current,dt);
        if (game.current.status !== before.status) playSound(game.current.status === "won" ? "win" : "lose");
        else if (game.current.lives < before.lives) playSound("hit");
        else if ((mode !== "runner" && game.current.score > before.score) || game.current.matched.length > before.matched || game.current.coins.length < before.coins) playSound("collect");
        if (mode === "runner" && before.height === 0 && game.current.height > 0) playSound("jump");
        if (mode === "invader" && game.current.bullets.filter(b => !b.enemy).length > before.bullets) playSound("attack");
      }
      paint();
      if (phase === "play" && (now-update >= 100 || game.current.status !== "running")) { refresh(n=>n+1); update=now; }
      if (phase === "play" && game.current.status === "running") frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(frame);stopWatching();};
  },[phase,art,mode]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      if(target.closest("input,textarea,select"))return;
      if(e.code==="Escape"||e.code==="KeyP") { e.preventDefault();input.current=blankInput();setPhase(p=>p==="play"?"paused":p==="paused"?"play":p);return; }
      if(phase!=="play"||game.current.status!=="running")return;
      if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space","KeyA","KeyD","KeyW","KeyS"].includes(e.code))e.preventDefault();
      const left=["ArrowLeft","KeyA"].includes(e.code),right=["ArrowRight","KeyD"].includes(e.code);
      if(left){input.current.left=true;input.current.pointer=undefined;turnSnake(game.current,-1,0);}
      if(right){input.current.right=true;input.current.pointer=undefined;turnSnake(game.current,1,0);}
      if(["ArrowUp","KeyW"].includes(e.code))turnSnake(game.current,0,-1);
      if(["ArrowDown","KeyS"].includes(e.code))turnSnake(game.current,0,1);
      if(e.code==="Space")input.current.fire=true;
      if(!e.repeat&&["Space","ArrowUp","KeyW"].includes(e.code))input.current.jump=true;
    };
    const onUp=(e:KeyboardEvent)=>{if(["ArrowLeft","KeyA"].includes(e.code))input.current.left=false;if(["ArrowRight","KeyD"].includes(e.code))input.current.right=false;if(e.code==="Space")input.current.fire=false;if(["Space","ArrowUp","KeyW"].includes(e.code))input.current.jump=false;};
    const pause=()=>{input.current=blankInput();setPhase(p=>p==="play"?"paused":p);};
    const hide=()=>{if(document.hidden)pause();};
    window.addEventListener("keydown",onKey);window.addEventListener("keyup",onUp);window.addEventListener("blur",pause);document.addEventListener("visibilitychange",hide);
    return()=>{window.removeEventListener("keydown",onKey);window.removeEventListener("keyup",onUp);window.removeEventListener("blur",pause);document.removeEventListener("visibilitychange",hide);};
  },[phase]);
  const move=(x:number,y:number)=>{if(phase==="play")turnSnake(g,x,y);};
  const control=(key:"left"|"right"|"fire"|"jump",label:string)=><button aria-label={label} disabled={phase!=="play"||g.status!=="running"} onClick={()=>{if(key==="left"||key==="right")input.current.pointer=(mode==="invader"?g.ship:g.paddle)+(key==="left"?-22:22);if(key==="fire")input.current.fireTap=true;if(key==="jump")input.current.jump=true;}} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);input.current.pointer=undefined;input.current[key]=true;}} onPointerUp={()=>{input.current[key]=false;}} onPointerCancel={()=>{input.current[key]=false;}} onLostPointerCapture={()=>{input.current[key]=false;}} onKeyDown={e=>{if(e.key==="Enter")input.current[key]=true;}} onKeyUp={()=>{input.current[key]=false;}}>{label}</button>;
  return <section className={`arcade-cabinet cabinet-${mode}`} aria-label={names[mode][lang]}>
    <header className="cabinet-header"><div><span>NYC / PORTAL ARCADE</span><h2>{names[mode][lang]}</h2></div><button className="cabinet-pause" disabled={phase==="ready"||g.status!=="running"} onClick={()=>{input.current=blankInput();setPhase(p=>p==="paused"?"play":"paused");}}>{phase==="paused"?(ko?"계속":"RESUME"):(ko?"일시정지":"PAUSE")}</button></header>
    <div className="cabinet-stats"><div><small>{mode==="memory"?(ko?"완료 시간":"ELAPSED TIME"):(ko?"생존 시간":"SURVIVAL TIME")}</small><b>{formatRecord(Math.floor(g.elapsed*1000),false)}</b></div><div><small>{mode==="memory"?(ko?"맞춘 쌍":"PAIRS"):(ko?"남은 기회":"LIVES")}</small><b>{mode==="memory" ? `${g.matched.length/2} / 10` : `${g.lives} ♥`}</b></div><div><small>{mode==="memory"?(ko?"시도":"MOVES"):(ko?"라운드":"WAVE")}</small><b>{mode==="memory"?g.moves:g.wave}</b></div></div>
    <p className="cabinet-instructions">{(ko?[
      "방향키/WASD로 이동. 시간 제한 없이 샤드를 모으고 벽과 꼬리를 피하세요.",
      "좌우/드래그로 공을 받으세요. 자동 발사 · 벽돌을 깨면 다음 라운드.",
      "10쌍을 최대한 빨리 맞추세요. 모든 쌍을 맞추면 종료 · 가장 짧은 완료 시간이 1위.",
      "좌우 이동 · SPACE 발사. 적을 모두 격추하면 더 빠른 다음 라운드.",
      "SPACE/↑ 점프. 속도가 올라가는 장애물을 피하며 오래 버티세요."
    ]:["ARROWS/WASD · No time limit. Collect shards; avoid walls and your tail.","ARROWS/DRAG · Auto launch. Clear bricks to continue the next wave.","Match all 10 pairs as fast as possible. Fastest completion takes #1.","ARROWS + SPACE · Clear invaders for the next, faster wave.","SPACE/↑ · Jump over obstacles. Speed increases as you survive."])[["snake","breakout","memory","invader","runner"].indexOf(mode)]}</p>
    <div className="cabinet-screen" style={{ backgroundImage: `linear-gradient(#07132055, #07132066), url("${background}")`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat" }}>
      {mode==="memory"?<div className="rune-board">{g.deck.map((symbol,i)=>{const shown=g.open.includes(i)||g.matched.includes(i);return <button key={i} className={g.matched.includes(i)?"rune matched":shown?"rune revealed":"rune"} aria-label={`${ko?"카드":"Card"} ${i+1}${shown?` · ${ko?"룬":"Rune"} ${symbol+1}`:""}`} aria-pressed={shown} disabled={phase!=="play"||g.status!=="running"||g.matched.includes(i)||g.open.length===2} onClick={()=>{const matched=g.matched.length;flipCard(g,i);if(g.status==="won")playSound("win");else if(g.matched.length>matched)playSound("collect");refresh(n=>n+1);}}>{shown?<img src={memoryCards[symbol]} alt="" draggable={false}/>:<><span>✦</span><small>{String(i+1).padStart(2,"0")}</small></>}</button>;})}</div>:<canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={names[mode][lang]} onPointerDown={e=>{if(mode!=="breakout"&&mode!=="invader")return;e.currentTarget.setPointerCapture(e.pointerId);input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}} onPointerMove={e=>{if(e.buttons&&(mode==="breakout"||mode==="invader"))input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}}/>}
      {(phase!=="play"||g.status!=="running")&&<div className="cabinet-overlay" role="status"><span className="pixel-label">{g.status!=="running"?"RUN COMPLETE":phase==="paused"?"PAUSED":(mode==="memory"?"TIME ATTACK":"SURVIVAL CHALLENGE")}</span><img src={guardian} alt=""/><h3>{g.status!=="running"?formatRecord(Math.floor(g.elapsed*1000),false):names[mode][lang]}</h3><p>{mode==="memory"?(ko?"최단 완료 시간이 1위 · 1위 진영이 포탈 점령":"FASTEST CLEAR TAKES #1 · #1 CONTROLS THE PORTAL"):(ko?"가장 오래 버틴 기록이 1위 · 1위 진영이 포탈 점령":"LONGEST SURVIVAL TAKES #1 · #1 CONTROLS THE PORTAL")}</p><button className="pixel-button" onClick={()=>{if(g.status!=="running"){if(!claimed.current){claimed.current=true;onFinish(Math.max(1,Math.floor(g.elapsed*1000)));}}else{input.current=blankInput();setPhase("play");}}}>{g.status!=="running"?(ko?"기록 등록":"REGISTER RECORD"):phase==="paused"?(ko?"계속하기":"RESUME"):(ko?"시작하기":"START")}</button>{g.status!=="running"&&<button className="cabinet-exit" onClick={reset}>{ko?"등록 없이 재도전":"RETRY WITHOUT SAVING"}</button>}<button className="cabinet-exit" onClick={onExit}>{ko?"지도로 돌아가기":"BACK TO MAP"}</button></div>}

    </div>
    <footer className="cabinet-controls">{mode==="snake"?<div className="cabinet-dpad">{[[0,-1,"↑"],[-1,0,"←"],[0,1,"↓"],[1,0,"→"]].map(([x,y,label])=><button key={label} aria-label={String(label)} onClick={()=>move(Number(x),Number(y))}>{label}</button>)}</div>:mode==="runner"?control("jump",ko?"↑ 점프":"↑ JUMP"):mode==="memory"?<span>{ko?"같은 룬을 찾아 포탈의 봉인을 해제하세요":"MATCH THE RUNES · UNLOCK THE PORTAL"}</span>:<>{control("left","←")}{control("fire",mode==="breakout"?(ko?"발사":"LAUNCH"):(ko?"발사":"FIRE"))}{control("right","→")}</>}</footer>
  </section>;
}
