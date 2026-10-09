import { formatRecord } from "./rankings";
import { useEffect, useRef, useState } from "react";
import { blankInput, createGame, flipCard, stepGame, turnSnake, WIDTH, HEIGHT, type Game, type Mode } from "./engine";

import "./arcade.css";

type Props = { mode: Mode; locale: "ko" | "en"; guardian: string; background: string; onFinish: (milliseconds: number) => void; onExit: () => void };
const names = {
  snake: ["서펀트 스네이크", "SERPENT SNAKE"], breakout: ["브릭 브레이커", "BRICK BREAKER"],
  memory: ["룬 메모리", "RUNE MEMORY"], invader: ["스카이 인베이더", "SKY INVADER"], runner: ["포탈 러너", "PORTAL RUNNER"],
};
const runePatterns = [
  ["00100","01110","11111","01110","00100"], ["00100","01110","10101","00100","00100"],
  ["10101","11111","01110","01110","00100"], ["01110","11011","10001","11011","01110"],
  ["00110","01100","11111","00110","01100"], ["10101","01110","11111","01110","10101"],
];
const enemyPixels=["00100100","00011000","00111100","01111110","11011011","11111111","10100101","00100100"];
const shipPixels=["00011000","00111100","00111100","11111111","11011011","11011011","00011000"];

function sprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, unit: number, color: string) {
  ctx.fillStyle=color;
  rows.forEach((row, j)=>[...row].forEach((cell,i)=>{if(cell==="1"){const px=Math.round(x+i*unit),py=Math.round(y+j*unit);ctx.fillStyle=color;ctx.fillRect(px,py,unit,unit);ctx.fillStyle=rows[j-1]?.[i]!=="1"?"#ffffff80":"#00000030";ctx.fillRect(px,py,unit,1);if((i+j)%3===0){ctx.fillStyle="#fff1b944";ctx.fillRect(px,py,1,unit);}}}));
}

export function draw(ctx: CanvasRenderingContext2D, g: Game, backdrop: HTMLImageElement, guardian: HTMLImageElement) {
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#071320";ctx.fillRect(0,0,WIDTH,HEIGHT);
  if(backdrop.complete&&backdrop.naturalWidth){ctx.globalAlpha=g.mode==="runner"?.7:.6;const scale=Math.max(WIDTH/backdrop.naturalWidth,HEIGHT/backdrop.naturalHeight);const w=backdrop.naturalWidth*scale,h=backdrop.naturalHeight*scale;ctx.drawImage(backdrop,(WIDTH-w)/2,HEIGHT-h,w,h);ctx.globalAlpha=1;}
  // Small rain glints and riveted metal edges frame the landmark.
  ctx.fillStyle="#adcbe32b";
  for(let i=0;i<28;i++){const x=(i*73+Math.floor(g.elapsed*17))%480,y=(i*41+Math.floor(g.elapsed*52))%300;ctx.fillRect(x,y,1,4);}
  for(const x of [4,468]){ctx.fillStyle="#34434d";ctx.fillRect(x,0,8,360);for(let y=12;y<360;y+=36){ctx.fillStyle="#91a3a4";ctx.fillRect(x+2,y,3,3);ctx.fillStyle="#111d29";ctx.fillRect(x+3,y+1,2,1);}}
  ctx.fillStyle="#20364b";
  for(let x=0;x<480;x+=24)for(let y=0;y<360;y+=24)ctx.fillRect(x,y,1,1);
  if(g.mode==="snake"){
    ctx.fillStyle="#0a1c284d";ctx.fillRect(18,24,444,312);
    ctx.strokeStyle="#284659";ctx.strokeRect(18,24,444,312);
    g.snake.forEach((p,i)=>{ctx.fillStyle=i===0?"#fff0b0":"#55cabc";ctx.fillRect(20+p.x*22,26+p.y*22,20,20);ctx.fillStyle="#24595c";ctx.fillRect(23+p.x*22,39+p.y*22,14,4);ctx.fillStyle="#9ce3be";ctx.fillRect(23+p.x*22,28+p.y*22,14,3);ctx.fillStyle="#1c746c";for(let k=0;k<3;k++){ctx.fillRect(24+p.x*22+k*5,33+p.y*22+(k%2)*2,3,3);}ctx.fillStyle="#e6d598";ctx.fillRect(28+p.x*22,30+p.y*22,4,2);});
    const h=g.snake[0];ctx.fillStyle="#071320";ctx.fillRect(25+h.x*22,29+h.y*22,4,4);ctx.fillRect(34+h.x*22,29+h.y*22,4,4);
    sprite(ctx,runePatterns[0],23+g.food.x*22,29+g.food.y*22,3,"#f0c85c");
  }else if(g.mode==="breakout"){
    g.bricks.forEach((b,i)=>{if(!b.alive)return;ctx.fillStyle=["#dc706d","#e4bc59","#63bdb9","#7799c5"][Math.floor(i/6)];ctx.fillRect(b.x,b.y,68,18);ctx.fillStyle="#ffffff50";ctx.fillRect(b.x+3,b.y+2,62,3);ctx.fillStyle="#00000055";ctx.fillRect(b.x,b.y+14,68,4);ctx.fillStyle="#101c3066";ctx.fillRect(b.x+22,b.y+4,2,10);ctx.fillRect(b.x+45,b.y+4,2,10);ctx.fillRect(b.x+3,b.y+9,62,1);ctx.fillStyle="#fff2be88";ctx.fillRect(b.x+4,b.y+4,3,3);ctx.fillRect(b.x+61,b.y+4,3,3);});
    ctx.fillStyle="#f0c85c";ctx.fillRect(g.paddle-40,316,80,10);ctx.fillStyle="#fff0b0";ctx.fillRect(g.paddle-33,316,66,3);ctx.fillStyle="#476575";ctx.fillRect(g.paddle-40,315,8,12);ctx.fillRect(g.paddle+32,315,8,12);ctx.fillStyle="#111e2b";for(let n=-24;n<28;n+=8)ctx.fillRect(g.paddle+n,321,4,3);
    ctx.fillStyle="#fff4ce";ctx.fillRect(g.ball.x-4,g.ball.y-4,8,8);ctx.fillStyle="#fff";ctx.fillRect(g.ball.x-3,g.ball.y-3,3,3);ctx.fillStyle="#b58248";ctx.fillRect(g.ball.x-3,g.ball.y+3,6,2);
    if(g.ball.docked){ctx.fillStyle="#f0c85c";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("SPACE / LAUNCH",240,345);}
  }else if(g.mode==="invader"){
    g.enemies.forEach(e=>{if(e.alive)sprite(ctx,enemyPixels,e.x,e.y,3,"#e67d78");});
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0)sprite(ctx,shipPixels,g.ship-16,304,4,"#72e4dd");
    g.bullets.forEach(b=>{ctx.fillStyle=b.enemy?"#ed7b76":"#f9dc79";ctx.fillRect(b.x-2,b.y,4,10);});
  }else if(g.mode==="runner"){
    ctx.fillStyle="#102335";ctx.fillRect(0,304,480,56);ctx.fillStyle="#708392";ctx.fillRect(0,304,480,4);
    for(let row=0;row<3;row++)for(let n=0;n<13;n++){const x=n*42-(g.distance%42)+(row%2)*21;ctx.fillStyle=row%2?"#263e50":"#314b5a";ctx.fillRect(x,310+row*17,39,14);ctx.fillStyle="#7296a03b";ctx.fillRect(x+3,311+row*17,25,2);ctx.fillStyle="#101d2a";ctx.fillRect(x+6,318+row*17,9,1);}
    for(let x=-(g.distance%64);x<480;x+=64){ctx.fillStyle="#d1b358";ctx.fillRect(x,332,30,4);}
    for(const point of g.obstacles){const x=point-g.distance+80;if(x< -35||x>500)continue;ctx.fillStyle="#b96a48";ctx.fillRect(x,269,24,35);ctx.fillStyle="#ffd879";ctx.fillRect(x-3,270,30,6);ctx.fillRect(x-3,291,30,6);ctx.fillStyle="#5e3428";ctx.fillRect(x+3,276,3,14);ctx.fillRect(x+17,276,3,14);ctx.fillStyle="#ffe4ac";ctx.fillRect(x,271,6,2);ctx.fillStyle="#423d37";ctx.fillRect(x+7,279,10,8);ctx.fillStyle="#b7b49a";ctx.fillRect(x+9,281,6,2);}
    for(const point of g.coins){const x=point-g.distance+80;if(x>0&&x<480)sprite(ctx,runePatterns[0],x-7,247,3,"#ffe07e");}
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0){
      if(guardian.complete&&guardian.naturalWidth)ctx.drawImage(guardian,46,244-g.height,68,68);
      else sprite(ctx,shipPixels,64,270-g.height,4,"#79e6dd");
    }
    const portalX=g.survival?Infinity:3000-g.distance+80;
    if(portalX<480){ctx.fillStyle="#f0c85c";ctx.fillRect(portalX,244,8,60);ctx.fillRect(portalX+44,244,8,60);ctx.fillRect(portalX,244,52,8);ctx.fillStyle="#53c9e3";ctx.fillRect(portalX+8,252,36,52);}
  }
  ctx.strokeStyle="#496077";ctx.lineWidth=2;ctx.strokeRect(1,1,478,358);
}

export default function ArcadeGame({mode,locale,guardian,background,onFinish,onExit}:Props){
  const ko=locale==="ko",lang=ko?0:1;
  const game=useRef<Game>(createGame(mode, Math.random, true));
  const input=useRef(blankInput());
  const canvas=useRef<HTMLCanvasElement>(null);
  const [phase,setPhase]=useState<"ready"|"play"|"paused">("ready");
  const [,refresh]=useState(0);
  const claimed=useRef(false);
  const g=game.current;
  const reset=()=>{game.current=createGame(mode, Math.random, true);input.current=blankInput();claimed.current=false;setPhase("ready");refresh(n=>n+1);};
  useEffect(()=>{
    const image=new Image();image.src=background;const hero=new Image();hero.src=guardian;
    let frame=0,last=0,update=0;
    const loop=(now:number)=>{
      const dt=last?Math.min(.04,(now-last)/1000):0;last=now;
      if(phase==="play")stepGame(game.current,input.current,dt);
      const context=canvas.current?.getContext("2d");if(context)draw(context,game.current,image,hero);
      if(now-update>80){refresh(n=>n+1);update=now;}
      frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);
  },[phase,guardian,background]);
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
    <div className="cabinet-stats"><div><small>{ko?"생존 시간":"SURVIVAL TIME"}</small><b>{formatRecord(Math.floor(g.elapsed*1000),false)}</b></div><div><small>{ko?"남은 기회":"LIVES"}</small><b>{g.lives} ♥</b></div><div><small>{ko?"라운드":"WAVE"}</small><b>{g.wave}</b></div></div>
    <p className="cabinet-instructions">{(ko?[
      "방향키/WASD로 이동. 14초 안에 샤드를 먹으며 벽과 꼬리를 피하세요.",
      "좌우/드래그로 공을 받으세요. 자동 발사 · 벽돌을 깨면 다음 라운드.",
      "같은 룬을 찾으세요. 한 쌍마다 9초 이내에 선택하고, 시간이 지나거나 틀리면 기회가 줄어요. 라운드가 높아질수록 빨라집니다.",
      "좌우 이동 · SPACE 발사. 적을 모두 격추하면 더 빠른 다음 라운드.",
      "SPACE/↑ 점프. 속도가 올라가는 장애물을 피하며 오래 버티세요."
    ]:["ARROWS/WASD · Collect a shard within 14s. Avoid walls and your tail.","ARROWS/DRAG · Auto launch. Clear bricks to continue the next wave.","Match pairs within 9s each (faster per wave). A mismatch or inactivity costs a life.","ARROWS + SPACE · Clear invaders for the next, faster wave.","SPACE/↑ · Jump over obstacles. Speed increases as you survive."])[["snake","breakout","memory","invader","runner"].indexOf(mode)]}</p>
    <div className="cabinet-screen" style={{ backgroundImage: `linear-gradient(#07132055, #07132066), url("${background}")`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat" }}>
      {mode==="memory"?<div className="rune-board">{g.deck.map((symbol,i)=>{const shown=g.open.includes(i)||g.matched.includes(i);return <button key={i} className={g.matched.includes(i)?"rune matched":shown?"rune revealed":"rune"} aria-label={`${ko?"카드":"Card"} ${i+1}${shown?` · ${ko?"룬":"Rune"} ${symbol+1}`:""}`} aria-pressed={shown} disabled={phase!=="play"||g.status!=="running"||g.matched.includes(i)||g.open.length===2} onClick={()=>{flipCard(g,i);refresh(n=>n+1);}}>{shown?<svg viewBox="0 0 7 7" aria-hidden="true">{runePatterns[symbol].flatMap((row,y)=>[...row].map((cell,x)=>cell==="1"?<rect key={`${x}-${y}`} x={x+1} y={y+1} width="1" height="1"/>:null))}</svg>:<><span>✦</span><small>{String(i+1).padStart(2,"0")}</small></>}</button>;})}</div>:<canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={names[mode][lang]} onPointerDown={e=>{if(mode!=="breakout"&&mode!=="invader")return;e.currentTarget.setPointerCapture(e.pointerId);input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}} onPointerMove={e=>{if(e.buttons&&(mode==="breakout"||mode==="invader"))input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}}/>}
      {(phase!=="play"||g.status!=="running")&&<div className="cabinet-overlay" role="status"><span className="pixel-label">{g.status!=="running"?"RUN COMPLETE":phase==="paused"?"PAUSED":"SURVIVAL CHALLENGE"}</span><img src={guardian} alt=""/><h3>{g.status!=="running"?formatRecord(Math.floor(g.elapsed*1000),false):names[mode][lang]}</h3><p>{ko?"가장 오래 버틴 기록이 1위 · 1위 진영이 포탈 점령":"LONGEST SURVIVAL TAKES #1 · #1 CONTROLS THE PORTAL"}</p><button className="pixel-button" onClick={()=>{if(g.status!=="running"){if(!claimed.current){claimed.current=true;onFinish(Math.max(1,Math.floor(g.elapsed*1000)));}}else{input.current=blankInput();setPhase("play");}}}>{g.status!=="running"?(ko?"기록 등록":"REGISTER RECORD"):phase==="paused"?(ko?"계속하기":"RESUME"):(ko?"시작하기":"START")}</button>{g.status!=="running"&&<button className="cabinet-exit" onClick={reset}>{ko?"등록 없이 재도전":"RETRY WITHOUT SAVING"}</button>}<button className="cabinet-exit" onClick={onExit}>{ko?"지도로 돌아가기":"BACK TO MAP"}</button></div>}

    </div>
    <footer className="cabinet-controls">{mode==="snake"?<div className="cabinet-dpad">{[[0,-1,"↑"],[-1,0,"←"],[0,1,"↓"],[1,0,"→"]].map(([x,y,label])=><button key={label} aria-label={String(label)} onClick={()=>move(Number(x),Number(y))}>{label}</button>)}</div>:mode==="runner"?control("jump",ko?"↑ 점프":"↑ JUMP"):mode==="memory"?<span>{ko?"같은 룬을 찾아 포탈의 봉인을 해제하세요":"MATCH THE RUNES · UNLOCK THE PORTAL"}</span>:<>{control("left","←")}{control("fire",mode==="breakout"?(ko?"발사":"LAUNCH"):(ko?"발사":"FIRE"))}{control("right","→")}</>}</footer>
  </section>;
}
