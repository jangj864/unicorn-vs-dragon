import { useEffect, useRef, useState } from "react";
import { blankInput, createGame, flipCard, stepGame, turnSnake, WIDTH, HEIGHT, type Game, type Mode } from "./engine";
import street from "../imports/nyc-neon-street.png";
import "./arcade.css";

type Props = { mode: Mode; locale: "ko" | "en"; guardian: string; onCapture: () => void; onExit: () => void };
const names = {
  snake: ["서펀트 스네이크", "SERPENT SNAKE"], breakout: ["브릭 브레이커", "BRICK BREAKER"],
  memory: ["룬 메모리", "RUNE MEMORY"], invader: ["스카이 인베이더", "SKY INVADER"], runner: ["포탈 러너", "PORTAL RUNNER"],
};
const rules = {
  snake: ["방향키 / WASD로 이동해 샤드 6개를 수집하세요. 벽과 꼬리를 피하세요.", "Collect 6 shards with arrows / WASD. Avoid walls and your tail."],
  breakout: ["좌우 키 또는 화면을 드래그해 패들을 이동하세요. SPACE로 공을 발사하고 벽돌 24개를 모두 깨세요.", "Move with arrows or drag the court. SPACE launches the ball. Break all 24 bricks."],
  memory: ["카드를 눌러 같은 룬 6쌍을 찾으세요. 120초, 실수는 8번까지 가능합니다.", "Find all 6 rune pairs in 120 seconds. You have 8 attempts to miss."],
  invader: ["좌우 키로 이동하고 SPACE를 길게 눌러 발사하세요. 적 12기를 격추하고 탄환을 피하세요.", "Move with arrows, hold SPACE to fire. Destroy 12 invaders and dodge their shots."],
  runner: ["SPACE / ↑ 또는 점프 버튼으로 장애물을 넘으세요. 3번 충돌하기 전에 포탈에 도착하세요.", "SPACE / ↑ or JUMP clears obstacles. Reach the portal before taking 3 hits."],
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
  rows.forEach((row, j)=>[...row].forEach((cell,i)=>{if(cell==="1")ctx.fillRect(Math.round(x+i*unit),Math.round(y+j*unit),unit,unit);}));
}

function draw(ctx: CanvasRenderingContext2D, g: Game, backdrop: HTMLImageElement, guardian: HTMLImageElement) {
  ctx.imageSmoothingEnabled=false;
  ctx.fillStyle="#071320";ctx.fillRect(0,0,WIDTH,HEIGHT);
  if(backdrop.complete&&backdrop.naturalWidth){ctx.globalAlpha=g.mode==="runner"?.5:.16;ctx.drawImage(backdrop,0,0,480,360);ctx.globalAlpha=1;}
  ctx.fillStyle="#20364b";
  for(let x=0;x<480;x+=24)for(let y=0;y<360;y+=24)ctx.fillRect(x,y,1,1);
  if(g.mode==="snake"){
    ctx.fillStyle="#0a1c28";ctx.fillRect(18,24,444,312);
    ctx.strokeStyle="#284659";ctx.strokeRect(18,24,444,312);
    g.snake.forEach((p,i)=>{ctx.fillStyle=i===0?"#fff0b0":"#55cabc";ctx.fillRect(20+p.x*22,26+p.y*22,20,20);ctx.fillStyle="#24595c";ctx.fillRect(23+p.x*22,39+p.y*22,14,4);});
    const h=g.snake[0];ctx.fillStyle="#071320";ctx.fillRect(25+h.x*22,29+h.y*22,4,4);ctx.fillRect(34+h.x*22,29+h.y*22,4,4);
    sprite(ctx,runePatterns[0],23+g.food.x*22,29+g.food.y*22,3,"#f0c85c");
  }else if(g.mode==="breakout"){
    g.bricks.forEach((b,i)=>{if(!b.alive)return;ctx.fillStyle=["#dc706d","#e4bc59","#63bdb9","#7799c5"][Math.floor(i/6)];ctx.fillRect(b.x,b.y,68,18);ctx.fillStyle="#ffffff50";ctx.fillRect(b.x+3,b.y+2,62,3);ctx.fillStyle="#00000055";ctx.fillRect(b.x,b.y+14,68,4);});
    ctx.fillStyle="#f0c85c";ctx.fillRect(g.paddle-40,316,80,10);ctx.fillStyle="#fff0b0";ctx.fillRect(g.paddle-33,316,66,3);
    ctx.fillStyle="#fff4ce";ctx.fillRect(g.ball.x-5,g.ball.y-5,10,10);
    if(g.ball.docked){ctx.fillStyle="#f0c85c";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("SPACE / LAUNCH",240,345);}
  }else if(g.mode==="invader"){
    g.enemies.forEach(e=>{if(e.alive)sprite(ctx,enemyPixels,e.x,e.y,3,"#e67d78");});
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0)sprite(ctx,shipPixels,g.ship-16,304,4,"#72e4dd");
    g.bullets.forEach(b=>{ctx.fillStyle=b.enemy?"#ed7b76":"#f9dc79";ctx.fillRect(b.x-2,b.y,4,10);});
  }else if(g.mode==="runner"){
    ctx.fillStyle="#102335";ctx.fillRect(0,304,480,56);ctx.fillStyle="#708392";ctx.fillRect(0,304,480,4);
    for(let x=-(g.distance%64);x<480;x+=64){ctx.fillStyle="#d1b358";ctx.fillRect(x,332,30,4);}
    for(const point of g.obstacles){const x=point-g.distance+80;if(x< -35||x>500)continue;ctx.fillStyle="#b96a48";ctx.fillRect(x,269,24,35);ctx.fillStyle="#ffd879";ctx.fillRect(x-3,270,30,6);ctx.fillRect(x-3,291,30,6);}
    for(const point of g.coins){const x=point-g.distance+80;if(x>0&&x<480)sprite(ctx,runePatterns[0],x-7,247,3,"#ffe07e");}
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0){
      if(guardian.complete&&guardian.naturalWidth)ctx.drawImage(guardian,46,244-g.height,68,68);
      else sprite(ctx,shipPixels,64,270-g.height,4,"#79e6dd");
    }
    const portalX=3000-g.distance+80;
    if(portalX<480){ctx.fillStyle="#f0c85c";ctx.fillRect(portalX,244,8,60);ctx.fillRect(portalX+44,244,8,60);ctx.fillRect(portalX,244,52,8);ctx.fillStyle="#53c9e3";ctx.fillRect(portalX+8,252,36,52);}
  }
  ctx.strokeStyle="#496077";ctx.lineWidth=2;ctx.strokeRect(1,1,478,358);
}

export default function ArcadeGame({mode,locale,guardian,onCapture,onExit}:Props){
  const ko=locale==="ko",lang=ko?0:1;
  const game=useRef<Game>(createGame(mode));
  const input=useRef(blankInput());
  const canvas=useRef<HTMLCanvasElement>(null);
  const [phase,setPhase]=useState<"ready"|"play"|"paused">("ready");
  const [,refresh]=useState(0);
  const claimed=useRef(false);
  const g=game.current;
  const reset=()=>{game.current=createGame(mode);input.current=blankInput();claimed.current=false;setPhase("ready");refresh(n=>n+1);};
  useEffect(()=>{
    const image=new Image();image.src=street;const hero=new Image();hero.src=guardian;
    let frame=0,last=0,update=0;
    const loop=(now:number)=>{
      const dt=last?Math.min(.04,(now-last)/1000):0;last=now;
      if(phase==="play")stepGame(game.current,input.current,dt);
      const context=canvas.current?.getContext("2d");if(context)draw(context,game.current,image,hero);
      if(now-update>80){refresh(n=>n+1);update=now;}
      frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);
  },[phase,guardian]);
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
    <div className="cabinet-stats"><div><small>{ko?"진행":"PROGRESS"}</small><b>{g.score}<span> / {g.target}{mode==="runner"?"%":""}</span></b></div><div><small>{mode==="memory"?(ko?"남은 실수":"MISSES LEFT"):(ko?"남은 기회":"LIVES")}</small><b className="life-count">{g.lives} <span>♥</span></b></div><div><small>{ko?"남은 시간":"TIME"}</small><b>{Math.ceil(g.time)}<span>s</span></b></div></div>
    <p className="cabinet-instructions">{rules[mode][lang]}</p>
    <div className="cabinet-screen">
      {mode==="memory"?<div className="rune-board">{g.deck.map((symbol,i)=>{const shown=g.open.includes(i)||g.matched.includes(i);return <button key={i} className={g.matched.includes(i)?"rune matched":shown?"rune revealed":"rune"} aria-label={`${ko?"카드":"Card"} ${i+1}${shown?` · ${ko?"룬":"Rune"} ${symbol+1}`:""}`} aria-pressed={shown} disabled={phase!=="play"||g.status!=="running"||g.matched.includes(i)||g.open.length===2} onClick={()=>{flipCard(g,i);refresh(n=>n+1);}}>{shown?<svg viewBox="0 0 7 7" aria-hidden="true">{runePatterns[symbol].flatMap((row,y)=>[...row].map((cell,x)=>cell==="1"?<rect key={`${x}-${y}`} x={x+1} y={y+1} width="1" height="1"/>:null))}</svg>:<><span>✦</span><small>{String(i+1).padStart(2,"0")}</small></>}</button>;})}</div>:<canvas ref={canvas} width={WIDTH} height={HEIGHT} aria-label={names[mode][lang]} onPointerDown={e=>{if(mode!=="breakout"&&mode!=="invader")return;e.currentTarget.setPointerCapture(e.pointerId);input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}} onPointerMove={e=>{if(e.buttons&&(mode==="breakout"||mode==="invader"))input.current.pointer=(e.clientX-e.currentTarget.getBoundingClientRect().left)/e.currentTarget.getBoundingClientRect().width*WIDTH;}}/>}
      {(phase!=="play"||g.status!=="running")&&<div className="cabinet-overlay" role="status"><span className="pixel-label">{g.status==="won"?"PORTAL SECURED":g.status==="lost"?"TRY AGAIN":phase==="paused"?"PAUSED":"READY, GUARDIAN?"}</span><img src={guardian} alt=""/><h3>{g.status==="won"?(ko?"구역 확보!":"MISSION CLEAR"):g.status==="lost"?(ko?"다시 도전하세요":"MISSION FAILED"):phase==="paused"?(ko?"잠시 쉬어가기":"TAKE A BREATHER"):names[mode][lang]}</h3><p>{g.status==="won"?(ko?"포탈을 점령하면 샤드 240개와 진화 보상을 받습니다.":"Claim the portal for 240 shards and an evolution reward."):g.status==="lost"?(ko?"새로운 기회로 다시 시작할 수 있어요.":"A fresh run is one button away."):phase==="paused"?(ko?"시간과 게임이 멈춰 있습니다.":"The game and timer are paused."):(ko?"준비가 되면 시작하세요.":"Start when you are ready.")}</p><button className="pixel-button" onClick={()=>{if(g.status==="won"){if(!claimed.current){claimed.current=true;onCapture();}}else if(g.status==="lost")reset();else{input.current=blankInput();setPhase("play");}}}>{g.status==="won"?(ko?"포탈 점령 +240 ✦":"CLAIM +240 ✦"):g.status==="lost"?(ko?"재도전":"RETRY"):phase==="paused"?(ko?"계속하기":"RESUME"):(ko?"시작하기":"START")}</button><button className="cabinet-exit" onClick={onExit}>{ko?"지도로 돌아가기":"BACK TO MAP"}</button></div>}
    </div>
    <footer className="cabinet-controls">{mode==="snake"?<div className="cabinet-dpad">{[[0,-1,"↑"],[-1,0,"←"],[0,1,"↓"],[1,0,"→"]].map(([x,y,label])=><button key={label} aria-label={String(label)} onClick={()=>move(Number(x),Number(y))}>{label}</button>)}</div>:mode==="runner"?control("jump",ko?"↑ 점프":"↑ JUMP"):mode==="memory"?<span>{ko?"같은 룬을 찾아 포탈의 봉인을 해제하세요":"MATCH THE RUNES · UNLOCK THE PORTAL"}</span>:<>{control("left","←")}{control("fire",mode==="breakout"?(ko?"발사":"LAUNCH"):(ko?"발사":"FIRE"))}{control("right","→")}</>}</footer>
  </section>;
}
