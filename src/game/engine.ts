export type Mode = "snake" | "breakout" | "memory" | "invader" | "runner";
export type Point = { x: number; y: number };
export type Input = { left: boolean; right: boolean; fire: boolean; jump: boolean; pointer?: number; fireTap?: boolean };
export type Game = {
  survival: boolean; wave: number; pressure: number;
  mode: Mode; status: "running" | "won" | "lost"; score: number; target: number; lives: number;
  time: number; elapsed: number; tick: number; cooldown: number; immune: number;
  snake: Point[]; direction: Point; queued: Point; food: Point;
  paddle: number; ball: Point & { vx: number; vy: number; docked: boolean };
  bricks: (Point & { alive: boolean })[];
  ship: number; enemies: (Point & { alive: boolean })[]; enemyDirection: number; enemyClock: number;
  bullets: (Point & { enemy: boolean })[];
  distance: number; height: number; velocity: number; obstacles: number[]; coins: number[];
  deck: number[]; open: number[]; matched: number[]; reveal: number; moves: number;
};
export const WIDTH = 480, HEIGHT = 360;
export const runnerObstacle = (point: number) => {
  const variants = [
    { kind: "crate", width: 36, height: 35 },
    { kind: "pillar", width: 26, height: 50 },
    { kind: "block", width: 47, height: 22 },
  ] as const;
  return variants[Math.floor(point / 100) % variants.length];
};
export const blankInput = (): Input => ({ left: false, right: false, fire: false, jump: false });
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function createGame(mode: Mode, random = Math.random, survival = false): Game {
  const deck = mode === "memory" && survival ? Array.from({length:20}, (_,i)=>i%10) : [0,1,2,3,4,5,0,1,2,3,4,5];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return {
    survival, wave: 1, pressure: 0, mode, status: "running", score: 0, target: mode === "breakout" ? 24 : mode === "invader" ? 12 : mode === "runner" ? 100 : 6,
    lives: mode === "snake" ? 1 : mode === "memory" ? 8 : 3,
    time: mode === "memory" ? 120 : 150, elapsed: 0, tick: 0, cooldown: 0, immune: 0,
    snake: [{x:6,y:7},{x:5,y:7},{x:4,y:7}], direction:{x:1,y:0}, queued:{x:1,y:0}, food:{x:10,y:7},
    paddle:240, ball:{x:240,y:306,vx:110,vy:-170,docked:true},
    bricks:Array.from({length:24},(_,i)=>({x:18+(i%6)*75,y:44+Math.floor(i/6)*25,alive:true})),
    ship:240, enemies:Array.from({length:12},(_,i)=>({x:60+(i%6)*58,y:44+Math.floor(i/6)*38,alive:true})),
    enemyDirection:1,enemyClock:0,bullets:[],distance:0,height:0,velocity:0,
    obstacles:[460,810,1190,1550,1930,2300,2660],coins:[300,640,990,1370,1750,2110,2470,2850],
    deck,open:[],matched:[],reveal:0,moves:0,
  };
}

export function turnSnake(game: Game, x: number, y: number) {
  if (game.status !== "running" || game.mode !== "snake" || Math.abs(x)+Math.abs(y)!==1) return;
  if (x === -game.direction.x && y === -game.direction.y) return;
  game.queued = {x,y};
}

export function flipCard(game: Game, index: number) {
  if (game.mode !== "memory" || game.status !== "running" || index<0 || index>=game.deck.length || game.open.length===2 || game.open.includes(index) || game.matched.includes(index)) return;
  game.open.push(index);
  if (game.open.length === 2) { game.moves++; game.reveal = .7; }
}

export function rpsResult(player: string, rival: string): "win" | "lose" | "draw" {
  if (player === rival) return "draw";
  return ({rock:"scissors",paper:"rock",scissors:"paper"} as Record<string,string>)[player] === rival ? "win" : "lose";
}

function damage(game: Game) {
  if (game.immune > 0) return;
  game.lives--; game.immune = 1.5;
  if (game.lives <= 0) game.status = "lost";
}

export function stepGame(g: Game, input: Input, seconds: number, random = Math.random) {
  if (g.status !== "running") return;
  const dt = clamp(seconds,0,.04);
  g.elapsed += dt; g.time = g.survival ? g.elapsed : Math.max(0,g.time-dt);
  if(g.survival)g.pressure+=dt;
  g.cooldown = Math.max(0,g.cooldown-dt); g.immune = Math.max(0,g.immune-dt);
  if (!g.survival && g.time <= 0) { g.status="lost"; return; }
  if (g.mode === "snake") {

    g.tick += dt;
    if (g.tick < Math.max(.105,.19-g.score*.012)) return;
    g.tick=0; g.direction={...g.queued};
    const head={x:g.snake[0].x+g.direction.x,y:g.snake[0].y+g.direction.y};
    const eating=head.x===g.food.x&&head.y===g.food.y;
    const body=eating?g.snake:g.snake.slice(0,-1);
    if(head.x<0||head.x>=20||head.y<0||head.y>=14||body.some(p=>p.x===head.x&&p.y===head.y)){g.lives=0;g.status="lost";return;}
    g.snake.unshift(head);
    if(eating){
      g.score++;g.pressure=0;
      const free:Point[]=[];
      for(let y=0;y<14;y++)for(let x=0;x<20;x++)if(!g.snake.some(p=>p.x===x&&p.y===y))free.push({x,y});
      g.food=free[Math.floor(random()*free.length)]??{x:0,y:0};
    }else g.snake.pop();
  } else if(g.mode === "breakout") {
    g.paddle=clamp(input.pointer??g.paddle+(Number(input.right)-Number(input.left))*300*dt,40,440);
    if(g.ball.docked){g.ball.x=g.paddle;g.ball.y=306;if(input.fire||input.fireTap||(g.survival&&g.pressure>1)){g.ball.docked=false;g.pressure=0;input.fireTap=false;}else return;}
    const b=g.ball,oldX=b.x,oldY=b.y;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<7||b.x>473){b.x=clamp(b.x,7,473);b.vx*=-1;}
    if(b.y<7){b.y=7;b.vy=Math.abs(b.vy);}
    if(b.vy>0&&oldY<=309&&b.y>=309&&Math.abs(b.x-g.paddle)<45){
      b.y=308;const offset=(b.x-g.paddle)/42;
      b.vx=offset*210;b.vy=-Math.sqrt(240*240-b.vx*b.vx);
    }
    for(const brick of g.bricks){
      if(!brick.alive||b.x+6<brick.x||b.x-6>brick.x+68||b.y+6<brick.y||b.y-6>brick.y+18)continue;
      brick.alive=false;g.score++;
      if(oldY+6<=brick.y||oldY-6>=brick.y+18)b.vy*=-1;
      else {b.vx*=-1;b.x=oldX;}
      break;
    }
    if(b.y>366){g.lives--;if(g.lives<=0)g.status="lost";else {g.ball={x:g.paddle,y:306,vx:110,vy:-170,docked:true};g.pressure=0;}}
  } else if(g.mode === "invader") {
    g.ship=clamp(input.pointer??g.ship+(Number(input.right)-Number(input.left))*260*dt,18,462);
    if((input.fire||input.fireTap)&&g.cooldown===0){g.bullets.push({x:g.ship,y:300,enemy:false});g.cooldown=.22;input.fireTap=false;}
    const alive=g.enemies.filter(e=>e.alive);
    const speed=24+(12-alive.length)*3+(g.survival?Math.min(65,g.elapsed*.5):0);
    if(alive.some(e=>e.x+g.enemyDirection*speed*dt<20||e.x+g.enemyDirection*speed*dt>436)){
      g.enemyDirection*=-1;alive.forEach(e=>e.y+=15);
    }
    alive.forEach(e=>e.x+=g.enemyDirection*speed*dt);
    g.enemyClock+=dt;
    if(g.enemyClock>Math.max(.45,1.2-g.score*.05)&&alive.length){
      const shooter=alive[Math.floor(random()*alive.length)];g.bullets.push({x:shooter.x+12,y:shooter.y+22,enemy:true});g.enemyClock=0;
    }
    for(const bullet of g.bullets){
      bullet.y+=(bullet.enemy?150:-340)*dt;
      if(bullet.enemy){if(Math.abs(bullet.x-g.ship)<17&&bullet.y>=303&&bullet.y<=330){damage(g);bullet.y=400;}}
      else for(const e of alive){if(e.alive&&bullet.x>=e.x-3&&bullet.x<=e.x+27&&bullet.y>=e.y&&bullet.y<=e.y+24){e.alive=false;g.score++;bullet.y=-100;break;}}
    }
    g.bullets=g.bullets.filter(b=>b.y>-10&&b.y<370);
    if(alive.some(e=>e.alive&&e.y>=283)){g.status="lost";g.lives=0;}
  } else if(g.mode === "runner") {
    if(input.jump&&g.height===0){g.velocity=460;}
    input.jump=false;g.velocity-=1000*dt;g.height=Math.max(0,g.height+g.velocity*dt);if(g.height===0)g.velocity=0;
    g.distance+=(140+(g.survival?Math.min(130,g.elapsed*.65):0))*dt;g.score=g.survival?Math.floor(g.distance):Math.min(100,Math.floor(g.distance/30));
    if(g.survival){g.obstacles=g.obstacles.filter(x=>x>g.distance-80);while((g.obstacles.at(-1)??0)<g.distance+900)g.obstacles.push((g.obstacles.at(-1)??g.distance)+290+random()*150);g.coins=g.coins.filter(x=>x>g.distance-80);}
    for(const obstacle of g.obstacles){const x=obstacle-g.distance+80;if(x<101&&x+runnerObstacle(obstacle).width>61&&g.height<runnerObstacle(obstacle).height)damage(g);}
    g.coins=g.coins.filter(coin=>{const x=coin-g.distance+80;return !(Math.abs(x-80)<24&&Math.abs(g.height-45)<38);});
  } else if(g.mode === "memory") {

    if(g.reveal>0){
    g.reveal=Math.max(0,g.reveal-dt);
    if(g.reveal===0){
      if(g.deck[g.open[0]]===g.deck[g.open[1]]){g.matched.push(...g.open);g.score++;}
      else if (!g.survival) {g.lives--;if(g.lives<=0)g.status="lost";}
      g.open=[];g.pressure=0;
      if (g.survival && g.matched.length === g.deck.length) g.status="won";
    }
    }
  }
  if(g.survival&&g.status==="running"){
    if((g.mode==="breakout"&&g.bricks.every(b=>!b.alive))||(g.mode==="invader"&&g.enemies.every(e=>!e.alive))){
      const next=createGame(g.mode,random,true);g.wave++;g.pressure=0;
      if(g.mode==="breakout"){g.bricks=next.bricks;g.ball={...next.ball,vx:110+Math.min(80,g.wave*8),vy:-170-Math.min(100,g.wave*10)};}
      if(g.mode==="invader"){g.enemies=next.enemies;g.bullets=[];g.enemyClock=0;}

    }
    if(g.mode==="snake"&&g.snake.length>=280){const next=createGame("snake",random,true);g.snake=next.snake;g.food=next.food;g.direction=next.direction;g.queued=next.queued;g.wave++;}
  } else if(g.status==="running"&&g.score>=g.target)g.status="won";
}
