import { drawBreakoutArt, type loadBreakoutArt } from "./breakoutArt";
import { drawRunnerCharacter, type loadRunnerCharacter } from "./runnerCharacter";
import { drawInvaderArt, type InvaderArt } from "./invaderArt";
import { drawRunnerArt } from "./runnerArt";
import { drawSnakeSkin, type SnakeSkin } from "./snakeSkin";
import { WIDTH, HEIGHT, type Game } from "./engine";

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

export function draw(ctx: CanvasRenderingContext2D, g: Game, backdrop: HTMLImageElement, snakeSkin?: SnakeSkin, runnerArt?: HTMLImageElement[], invaderArt?: InvaderArt, runnerHero?: ReturnType<typeof loadRunnerCharacter>, breakoutArt?: ReturnType<typeof loadBreakoutArt>) {
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
    if (!snakeSkin || !drawSnakeSkin(ctx, g, snakeSkin)) {
    g.snake.forEach((p,i)=>{ctx.fillStyle=i===0?"#fff0b0":"#55cabc";ctx.fillRect(20+p.x*22,26+p.y*22,20,20);ctx.fillStyle="#24595c";ctx.fillRect(23+p.x*22,39+p.y*22,14,4);ctx.fillStyle="#9ce3be";ctx.fillRect(23+p.x*22,28+p.y*22,14,3);ctx.fillStyle="#1c746c";for(let k=0;k<3;k++){ctx.fillRect(24+p.x*22+k*5,33+p.y*22+(k%2)*2,3,3);}ctx.fillStyle="#e6d598";ctx.fillRect(28+p.x*22,30+p.y*22,4,2);});
    const h=g.snake[0];ctx.fillStyle="#071320";ctx.fillRect(25+h.x*22,29+h.y*22,4,4);ctx.fillRect(34+h.x*22,29+h.y*22,4,4);
    }
    sprite(ctx,runePatterns[0],23+g.food.x*22,29+g.food.y*22,3,"#f0c85c");
  }else if(g.mode==="breakout"){
    if (!breakoutArt || !drawBreakoutArt(ctx,g,breakoutArt)) {
    g.bricks.forEach((b,i)=>{if(!b.alive)return;ctx.fillStyle=["#dc706d","#e4bc59","#63bdb9","#7799c5"][Math.floor(i/6)];ctx.fillRect(b.x,b.y,68,18);ctx.fillStyle="#ffffff50";ctx.fillRect(b.x+3,b.y+2,62,3);ctx.fillStyle="#00000055";ctx.fillRect(b.x,b.y+14,68,4);ctx.fillStyle="#101c3066";ctx.fillRect(b.x+22,b.y+4,2,10);ctx.fillRect(b.x+45,b.y+4,2,10);ctx.fillRect(b.x+3,b.y+9,62,1);ctx.fillStyle="#fff2be88";ctx.fillRect(b.x+4,b.y+4,3,3);ctx.fillRect(b.x+61,b.y+4,3,3);});
    ctx.fillStyle="#f0c85c";ctx.fillRect(g.paddle-40,316,80,10);ctx.fillStyle="#fff0b0";ctx.fillRect(g.paddle-33,316,66,3);ctx.fillStyle="#476575";ctx.fillRect(g.paddle-40,315,8,12);ctx.fillRect(g.paddle+32,315,8,12);ctx.fillStyle="#111e2b";for(let n=-24;n<28;n+=8)ctx.fillRect(g.paddle+n,321,4,3);
    }
    ctx.fillStyle="#fff4ce";ctx.fillRect(g.ball.x-4,g.ball.y-4,8,8);ctx.fillStyle="#fff";ctx.fillRect(g.ball.x-3,g.ball.y-3,3,3);ctx.fillStyle="#b58248";ctx.fillRect(g.ball.x-3,g.ball.y+3,6,2);
    if(g.ball.docked){ctx.fillStyle="#f0c85c";ctx.font="10px monospace";ctx.textAlign="center";ctx.fillText("SPACE / LAUNCH",240,345);}
  }else if(g.mode==="invader"){
    if (!invaderArt || !drawInvaderArt(ctx, g, invaderArt)) {
    g.enemies.forEach(e=>{if(e.alive)sprite(ctx,enemyPixels,e.x,e.y,3,"#e67d78");});
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0)sprite(ctx,shipPixels,g.ship-16,304,4,"#72e4dd");
    g.bullets.forEach(b=>{ctx.fillStyle=b.enemy?"#ed7b76":"#f9dc79";ctx.fillRect(b.x-2,b.y,4,10);});
    }
  }else if(g.mode==="runner"){
    if (!runnerArt || !drawRunnerArt(ctx, g, runnerArt)) {
    ctx.fillStyle="#102335";ctx.fillRect(0,304,480,56);ctx.fillStyle="#708392";ctx.fillRect(0,304,480,4);
    for(let row=0;row<3;row++)for(let n=0;n<13;n++){const x=n*42-(g.distance%42)+(row%2)*21;ctx.fillStyle=row%2?"#263e50":"#314b5a";ctx.fillRect(x,310+row*17,39,14);ctx.fillStyle="#7296a03b";ctx.fillRect(x+3,311+row*17,25,2);ctx.fillStyle="#101d2a";ctx.fillRect(x+6,318+row*17,9,1);}
    for(let x=-(g.distance%64);x<480;x+=64){ctx.fillStyle="#d1b358";ctx.fillRect(x,332,30,4);}
    for(const point of g.obstacles){const x=point-g.distance+80;if(x< -35||x>500)continue;ctx.fillStyle="#b96a48";ctx.fillRect(x,269,24,35);ctx.fillStyle="#ffd879";ctx.fillRect(x-3,270,30,6);ctx.fillRect(x-3,291,30,6);ctx.fillStyle="#5e3428";ctx.fillRect(x+3,276,3,14);ctx.fillRect(x+17,276,3,14);ctx.fillStyle="#ffe4ac";ctx.fillRect(x,271,6,2);ctx.fillStyle="#423d37";ctx.fillRect(x+7,279,10,8);ctx.fillStyle="#b7b49a";ctx.fillRect(x+9,281,6,2);}
    }
    for(const point of g.coins){const x=point-g.distance+80;if(x>0&&x<480)sprite(ctx,runePatterns[0],x-7,247,3,"#ffe07e");}
    if(g.immune===0||Math.floor(g.elapsed*12)%2===0){
      if(runnerHero && drawRunnerCharacter(ctx,g,runnerHero)) { /* Running art is aligned to the ground. */ }
      else sprite(ctx,shipPixels,64,270-g.height,4,"#79e6dd");
    }
    const portalX=g.survival?Infinity:3000-g.distance+80;
    if(portalX<480){ctx.fillStyle="#f0c85c";ctx.fillRect(portalX,244,8,60);ctx.fillRect(portalX+44,244,8,60);ctx.fillRect(portalX,244,52,8);ctx.fillStyle="#53c9e3";ctx.fillRect(portalX+8,252,36,52);}
  }
  ctx.strokeStyle="#496077";ctx.lineWidth=2;ctx.strokeRect(1,1,478,358);
}

