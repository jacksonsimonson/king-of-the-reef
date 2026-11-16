import fs from 'node:fs';
import assert from 'node:assert/strict';
import {match} from './matches.mjs';
import {playerPolicy} from './colossal-policy.mjs';
import {rivalDeckFor,battleResult,saveRun,loadRun} from '../../src/game/run/state.ts';
import {COLOSSALS} from '../../src/game/run/colossals.ts';
import {combinedScore,matchCharmSpending} from '../../src/game/twoTide.ts';

// Sequential adaptation, not a best-of-N reset: injuries, resolve and charms persist.
// All three arms start identically. After each unsuccessful match, adaptive changes its
// opening rank by one, with no access to the outcome of an unplayed alternative.
const rows=[],fixtures={};let stored='',reloads=0;
// Public-board counter preferences: deny armor support, shelter isolated prey
// before the hunt, and keep an active upper defense at the front of occupied lanes.
// Heuristic weights are study-only, not card ratings or changes to rival AI.
function counterValue(result){
 const {board,shocked}=result,c=result.memory.colossal,size=Math.sqrt(board.length);
 const neighbors=i=>[i%size?i-1:-1,i%size<size-1?i+1:-1,i-size,i+size].filter(j=>j>=0&&j<board.length);
 if(c.id==='reefback')return -2*board.filter((f,i)=>f?.owner==='rival'&&f.edges.length<4&&neighbors(i).some(j=>board[j]?.owner==='rival')).length;
 if(c.id==='midnight')return c.plays.rival<2?-3*board.filter((f,i)=>f?.owner==='player'&&!neighbors(i).some(j=>board[j]?.owner==='player')).length:0;
 let value=0;
 for(let col=0;col<size;col++){
  const lane=board.filter((_,i)=>i%size===col),first=lane.find(Boolean);
  if(first?.owner==='player'&&!shocked.has(first.id)&&!first.edges.some(e=>e.direction==='up'&&e.effect==='weak')&&first.ability!=='bulwark')value-=2;
 }
 return value;
}
globalThis.localStorage={getItem:()=>stored,setItem:(_,value)=>stored=value};
for(const start of [0,24,'stalls']){
 const path=`.cache/colossal-voyage-cases-${start}.json`;
 assert.ok(fs.existsSync(path),'Run the PR57 colossal-voyages studies and colossal-stalls.mjs first; see DECISIONS.md.');
 const cases=JSON.parse(fs.readFileSync(path));
 for(const [key,initial]of Object.entries(cases).filter(([key])=>/^(boss|rematch)-/.test(key))){
  let firstAttempt;
  for(const mode of ['repeat','adapt','counter']){
   let run=structuredClone(initial);const region=run.region,node=run.pending,attempts=[];
   const rival=JSON.stringify(rivalDeckFor(run));
   for(let attempt=0;attempt<6&&run.status==='active'&&run.pending===node;attempt++){
    const before=structuredClone(run),opening=[...run.charms],rank=mode==='adapt'?attempt:0;
    assert.equal(JSON.stringify(rivalDeckFor(run)),rival);
    const tides=['player','rival'].map(first=>match({region,seed:run.seed+':'+node,current:true,customDecks:{player:run.school,rival:rivalDeckFor(run)},loadout:opening,charmMode:'player',first,playLimit:4+region,colossal:COLOSSALS[region].id,collectFrames:true,playerPolicy:(s,h,r)=>playerPolicy(s,h,r,rank,mode==='counter'&&attempt>0?counterValue:undefined)}));
    assert.ok(tides.every(t=>t.plays.player<=4+region&&t.plays.rival<=4+region));
    const score=combinedScore(tides.map(t=>t.score)),killed=[...new Set(tides.flatMap(t=>t.killedIds))],spent=tides.reduce((ledger,t)=>matchCharmSpending(opening,t.inventories.player,ledger),[]);
    battleResult(run,score.player,score.rival,killed,spent);
    assert.ok(saveRun(run));assert.deepEqual(loadRun(),run);run=loadRun();reloads++;
    const won=score.player>score.rival;
    if(!won){assert.equal(run.shells,before.shells);assert.equal(run.resolve,before.resolve-Number(score.player<score.rival));assert.equal(run.school.filter(c=>c.condition==='healthy').length,before.school.filter(c=>c.condition==='healthy'&&!killed.includes(c.id)).length);}
    assert.ok(run.charms.length<=opening.length);
    attempts.push({rank,score,resolveBefore:before.resolve,resolveAfter:run.resolve,healthyBefore:before.school.filter(c=>c.condition==='healthy').length,healthyAfter:run.school.filter(c=>c.condition==='healthy').length,spent,plays:tides.reduce((n,t)=>n+t.plays.player+t.plays.rival,0),frames:tides.reduce((n,t)=>n+t.frameCount,0),opening:tides.map(t=>t.trace.find(t=>t.owner==='player')).map(t=>({card:t.card,index:t.index}))});
    if(attempt===0){if(firstAttempt)assert.deepEqual(attempts[0],firstAttempt);else firstAttempt=attempts[0];}
    if(mode==='adapt'&&attempt<2)fixtures[`${start} ${key} attempt ${attempt+1}`]={run:before,hash:'voyage'};
    if(won)break;
   }
   const row={start,key,seed:initial.seed,region,mode,result:run.region>region||run.status==='won'?'won':run.status==='lost'?'lost':'capped',attempts};rows.push(row);
  }
 }
}
fs.writeFileSync('.cache/balance/colossal-retries.json',JSON.stringify({reloads,rows}));
fs.writeFileSync('.cache/colossal-retry-cases.json',JSON.stringify(fixtures));
for(let region=0;region<3;region++)for(const mode of ['repeat','adapt','counter']){
 const subset=rows.filter(r=>r.region===region&&r.mode===mode),a=subset.flatMap(r=>r.attempts);
 console.log(JSON.stringify({boss:COLOSSALS[region].name,mode,cases:subset.length,wins:subset.filter(r=>r.result==='won').length,losses:subset.filter(r=>r.result==='lost').length,caps:subset.filter(r=>r.result==='capped').length,matches:a.length,draws:a.filter(a=>a.score.player===a.score.rival).length,placements:a.reduce((n,a)=>n+a.plays,0)}));
}
console.log(JSON.stringify({reloads,fixtures:Object.keys(fixtures).length}));
