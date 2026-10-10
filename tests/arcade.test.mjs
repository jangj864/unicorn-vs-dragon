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
    const input=blankInput();input.jump=win.obstacles.some(p=>p-win.distance>22&&p-win.distance<45)&&win.height===0;
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
  const migrated={...save,owners:[...save.owners,null,null]};
  assert.deepEqual(parseProgress(JSON.stringify(save)),migrated);
  assert.deepEqual(parseProgress(JSON.stringify(migrated)),migrated);
  for(const bad of [null,'bad','{}',JSON.stringify({...save,shards:-1}),JSON.stringify({...save,owners:['dragon']}),JSON.stringify({...save,levels:{dragon:8,unicorn:1}})])assert.equal(parseProgress(bad),null);
});

test('survival counts upwards, automatically launches, and continues into another wave',()=>{
  const g=createGame('breakout',Math.random,true);
  for(let i=0;i<30;i++)stepGame(g,blankInput(),.04);
  assert.equal(g.ball.docked,false);assert.ok(g.elapsed>1);assert.equal(g.time,g.elapsed);
  g.bricks.forEach(b=>b.alive=false);stepGame(g,blankInput(),.02);
  assert.equal(g.wave,2);assert.equal(g.status,'running');assert.equal(g.bricks.filter(b=>b.alive).length,24);
  const inv=createGame('invader',Math.random,true);inv.enemies.forEach(e=>e.alive=false);stepGame(inv,blankInput(),.02);
  assert.equal(inv.wave,2);assert.equal(inv.enemies.filter(e=>e.alive).length,12);
});
test('survival runner replenishes hazards beyond the old finish line',()=>{
  const g=createGame('runner',Math.random,true);g.distance=3300;g.obstacles=[];stepGame(g,blankInput(),.02);
  assert.equal(g.status,'running');assert.ok(g.obstacles.length>0);assert.ok(g.obstacles.at(-1)>g.distance+900);
});
test('memory time attack counts up, tolerates mistakes, and stops after all ten pairs',()=>{
 const g=createGame('memory',()=>.25,true);
 assert.equal(g.deck.length,20); assert.equal(new Set(g.deck).size,10);
 advance(g,20); assert.equal(g.status,'running'); assert.ok(g.elapsed>19);
 const a=0,b=g.deck.findIndex(v=>v!==g.deck[a]); flipCard(g,a);flipCard(g,b);advance(g,.8);
 assert.equal(g.status,'running');assert.equal(g.lives,8);
 for(let value=0;value<10;value++) { const pair=g.deck.flatMap((v,i)=>v===value?[i]:[]); pair.forEach(i=>flipCard(g,i));advance(g,.8); }
 assert.equal(g.status,'won');assert.equal(g.matched.length,20);
 const elapsed=g.elapsed;advance(g,10);assert.equal(g.elapsed,elapsed);
});
test('leaderboards sort descending, retain earlier ties, cap at ten, and format time',async()=>{
  const source=fs.readFileSync(new URL('../src/game/rankings.ts',import.meta.url),'utf8').replaceAll('import.meta.env','({})');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
  const {rankEntries,formatRecord}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const entries=Array.from({length:12},(_,i)=>({nickname:`P${i}`,player_id:`${i}`,team:'dragon',value:i,created_at:'2026-01-01'}));
  const ordered=rankEntries(entries);assert.equal(ordered.length,10);assert.equal(ordered[0].value,11);
  const tied=rankEntries([{...entries[0],value:100,created_at:'2026-02-01'},{...entries[1],value:100}]);assert.equal(tied[0].nickname,'P1');
  assert.equal(formatRecord(61500,false),'1:01.5');assert.equal(formatRecord(7,true),'7 W');
});

test('submitted records persist and portal ownership follows the best record only',async()=>{
  const source=fs.readFileSync(new URL('../src/game/rankings.ts',import.meta.url),'utf8').replaceAll('import.meta.env','({})');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
  const {submitRecord,fetchBoards}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  try{
    await submitRecord(1,'Alice','dragon',5);
    let boards=await submitRecord(1,'Bob','unicorn',4);assert.equal(boards[1][0].team,'dragon');
    boards=await submitRecord(1,'Bob','unicorn',6);assert.equal(boards[1][0].team,'unicorn');
    boards=await submitRecord(1,'Bob','dragon',3);assert.equal(boards[1][0].value,6);assert.equal(boards[1][0].team,'unicorn');
    assert.deepEqual(await fetchBoards(),boards);
    assert.equal(boards[0].length,0);
    await submitRecord(4,'Alice','dragon',50000);
    boards=await submitRecord(4,'Bob','unicorn',40000);assert.equal(boards[4][0].team,'unicorn');
    boards=await submitRecord(4,'Alice','dragon',30000);assert.equal(boards[4][0].value,30000);
    boards=await submitRecord(4,'Alice','unicorn',60000);assert.equal(boards[4][0].value,30000);assert.equal(boards[4][0].team,'dragon');
    assert.deepEqual((await fetchBoards())[4],boards[4]);
    await assert.rejects(submitRecord(1,' ','dragon',7));
  }finally{delete globalThis.localStorage;}
});

test('online submission accepts an empty success response then refreshes the ranking',async()=>{
  const source=fs.readFileSync(new URL('../src/game/rankings.ts',import.meta.url),'utf8').replaceAll('import.meta.env','({VITE_SUPABASE_URL:"https://example.invalid",VITE_SUPABASE_ANON_KEY:"test-public"})');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
  const savedFetch=globalThis.fetch;
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  const paths=[];
  globalThis.fetch=async(url)=>{
    paths.push(url);
    if(url.endsWith('/auth/v1/signup'))return new Response(JSON.stringify({access_token:'test-session',refresh_token:'test-refresh',expires_in:3600}));
    if(url.endsWith('/portal_memory_top_ten'))return new Response('[]');
    if(url.endsWith('/portal_submit_record'))return new Response(null,{status:204});
    return new Response(JSON.stringify([{zone_id:1,nickname:'Test',team:'dragon',value:1,player_id:'test',created_at:'2026-10-09'}]));
  };
  try{
    const {submitRecord}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
    const boards=await submitRecord(1,'Test','dragon',1);
    assert.equal(boards[1][0].nickname,'Test');assert.equal(paths.length,4);
  }finally{globalThis.fetch=savedFetch;delete globalThis.localStorage;}
});

test('survival snake has no food deadline or overall time limit', () => {
  const g = createGame('snake', () => .25, true);
  g.food = { x: 10, y: 10 };
  for (let frame = 0; frame < 10000; frame++) {
    const head = g.snake[0];
    if (g.direction.x === 1 && head.x === 17) turnSnake(g, 0, -1);
    if (g.direction.y === -1 && head.y === 2) turnSnake(g, -1, 0);
    if (g.direction.x === -1 && head.x === 2) turnSnake(g, 0, 1);
    if (g.direction.y === 1 && head.y === 7) turnSnake(g, 1, 0);
    stepGame(g, blankInput(), .02);
  }
  assert.equal(g.status, 'running');
  assert.equal(g.score, 0);
  assert.ok(g.elapsed > 199);
  assert.equal(g.time, g.elapsed);
  assert.equal(g.lives, 1);
});
