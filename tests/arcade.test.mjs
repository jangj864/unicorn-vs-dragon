import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/game/engine.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { createGame, stepGame, turnSnake, flipCard, blankInput, rpsResult } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const advance = (g, seconds, input = blankInput()) => { for(let t=0;t<seconds;t+=.02)stepGame(g,input,.02,()=>.25); };

test('snake only scores on food, cannot reverse, grows, and loses on a wall', () => {
  const g=createGame('snake');turnSnake(g,-1,0);assert.deepEqual(g.queued,{x:1,y:0});
  turnSnake(g,0,-1);assert.equal(g.score,0);turnSnake(g,1,0);
  advance(g,.81);assert.equal(g.score,1);assert.equal(g.snake.length,4);
  assert.ok(!g.snake.some(p=>p.x===g.food.x&&p.y===g.food.y));
  advance(g,5);assert.equal(g.status,'lost');
});
test('snake detects self collision', () => {
  const g=createGame('snake');g.snake=[{x:2,y:2},{x:2,y:3},{x:3,y:3},{x:3,y:2},{x:4,y:2}];
  advance(g,.21);assert.equal(g.status,'lost');
});
test('breakout requires the ball, bounces off a paddle, loses lives and clears all bricks', () => {
  const g=createGame('breakout');advance(g,1);assert.equal(g.score,0);assert.equal(g.ball.docked,true);
  g.ball={x:240,y:307,vx:0,vy:170,docked:false};stepGame(g,blankInput(),.02);assert.ok(g.ball.vy<0);
  g.ball={x:20,y:365,vx:0,vy:170,docked:false};stepGame(g,blankInput(),.02);assert.equal(g.lives,2);assert.equal(g.ball.docked,true);
  for(const b of g.bricks){g.ball={x:b.x+30,y:b.y+26,vx:0,vy:-170,docked:false};stepGame(g,blankInput(),.04);}
  assert.equal(g.score,24);assert.equal(g.status,'won');
});
test('invaders require travelling bullets and hostile shots cause damage', () => {
  const g=createGame('invader');const input=blankInput();input.fire=true;stepGame(g,input,.02);assert.equal(g.score,0);assert.equal(g.bullets.length,1);
  g.bullets=[{x:g.ship,y:305,enemy:true}];stepGame(g,blankInput(),.02);assert.equal(g.lives,2);
  for(const enemy of g.enemies){g.bullets=[{x:enemy.x+12,y:enemy.y+12,enemy:false}];stepGame(g,blankInput(),.02);}
  assert.equal(g.score,12);assert.equal(g.status,'won');
});
test('runner collision and correctly timed jumping have different outcomes', () => {
  const lost=createGame('runner');advance(lost,25);assert.equal(lost.status,'lost');
  const win=createGame('runner');
  for(let t=0;t<25&&win.status==='running';t+=.02){
    const input=blankInput();input.jump=win.obstacles.some(p=>p-win.distance>22&&p-win.distance<60)&&win.height===0;
    stepGame(win,input,.02);
  }
  assert.equal(win.status,'won');assert.equal(win.score,100);assert.ok(win.lives>0);
});
test('memory shuffles six pairs, ignores extra flips and handles mismatches and victory', () => {
  const g=createGame('memory',()=>.25);assert.equal(new Set(g.deck).size,6);
  for(let i=0;i<6;i++)assert.equal(g.deck.filter(v=>v===i).length,2);
  const other=g.deck.findIndex(v=>v!==g.deck[0]);flipCard(g,0);flipCard(g,other);flipCard(g,11);assert.equal(g.open.length,2);
  advance(g,.75);assert.equal(g.lives,7);assert.equal(g.open.length,0);
  for(let symbol=0;symbol<6;symbol++){g.deck.forEach((v,i)=>{if(v===symbol)flipCard(g,i);});advance(g,.75);}
  assert.equal(g.score,6);assert.equal(g.status,'won');
});
test('timeout loses and terminal states cannot keep scoring', () => {
  const g=createGame('memory');g.time=.01;stepGame(g,blankInput(),.02);assert.equal(g.status,'lost');
  const before=JSON.stringify(g);flipCard(g,0);stepGame(g,blankInput(),.02);assert.equal(JSON.stringify(g),before);
});
test('RPS outcomes are complete and symmetric across all nine combinations', () => {
  for(const a of ['rock','paper','scissors'])for(const b of ['rock','paper','scissors']){
    const result=rpsResult(a,b),reverse=rpsResult(b,a);
    assert.equal(a===b,result==='draw');if(result==='win')assert.equal(reverse,'lose');if(result==='lose')assert.equal(reverse,'win');
  }
});

test('a short touch launches one ball or shot without requiring a held key', () => {
  const b=createGame('breakout'),i=createGame('invader');
  const tap={...blankInput(),fireTap:true};stepGame(b,tap,.02);assert.equal(b.ball.docked,false);assert.equal(tap.fireTap,false);
  const shot={...blankInput(),fireTap:true};stepGame(i,shot,.02);assert.equal(i.bullets.length,1);assert.equal(shot.fireTap,false);
});

test('progress can round-trip and malformed saves fall back safely', async () => {
  const source=fs.readFileSync(new URL('../src/game/progress.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
  const {parseProgress}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const save={shards:240,levels:{dragon:2,unicorn:1},owners:['unicorn','dragon',null,'unicorn','dragon','dragon'],scores:{dragon:49,unicorn:51}};
  assert.deepEqual(parseProgress(JSON.stringify(save)),save);
  for(const bad of [null,'bad','{}',JSON.stringify({...save,shards:-1}),JSON.stringify({...save,owners:['dragon']}),JSON.stringify({...save,levels:{dragon:8,unicorn:1}})])assert.equal(parseProgress(bad),null);
});
