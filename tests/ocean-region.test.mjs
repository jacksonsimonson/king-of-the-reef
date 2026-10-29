import test from 'node:test';
import assert from 'node:assert/strict';
import {BATCH_FIVE_STARTERS as STARTERS,BATCH_FOUR_STARTERS,BATCH_THREE_STARTERS,BATCH_TWO_STARTERS,BATCH_ONE_STARTERS,PRE_BALANCE_STARTERS} from '../src/game/data/starterFish.ts';
import {OCEAN_ROLES} from '../src/game/data/oceanRoles.ts';
import {OCEAN_POOL} from '../src/game/data/oceanPool.ts';
import {scenarios,probe} from '../scripts/balance/pilot.mjs';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {createRun,runFishDefinition,recruit,saveRun,loadRun,rivalDeckFor,shopOffers,offers} from '../src/game/run/state.ts';

const card=(id,owner='player',catalog=STARTERS)=>({...catalog.find(f=>f.texture===id),id,owner,condition:'healthy'});
const pawn=(id,owner='rival',edges=[])=>({...card('minnow',owner),id,edges});
const board=(size,entries=[])=>({board:Object.assign(Array(size*size).fill(null),Object.fromEntries(entries)),shocked:new Set()});
test('all 47 Ocean entries have authored identities; Shoreline and Bermuda remain unchanged',()=>{
 assert.deepEqual(Object.keys(OCEAN_ROLES).sort(),[...OCEAN_POOL].sort());
 assert.equal(new Set(Object.values(OCEAN_ROLES).map(r=>r.title)).size,47);
 for(const [id,r] of Object.entries(OCEAN_ROLES))assert.ok(r.family&&r.plan.length>35&&r.limitation.length>25,id);
 for(const f of STARTERS.filter(f=>!OCEAN_POOL.includes(f.texture)))assert.deepEqual(f,BATCH_FOUR_STARTERS.find(c=>c.texture===f.texture));
});
for(const family of new Set(Object.values(OCEAN_ROLES).map(r=>r.family)))test(`${family}: ordinary contribution on regional and later boards`,()=>{
 for(const [id] of Object.entries(OCEAN_ROLES).filter(([,r])=>r.family===family)){
  if(id==='sea-mine')continue; // Explicit ordinary delivery, retention and retaliation below.
  for(const size of [6,7]){
   const rows=[false,true].flatMap(mirror=>scenarios(size,mirror).map(s=>probe(card(id),s)));
   assert.ok(rows.some(r=>r.bestDelta>0),`${id} has no ordinary control opportunity on ${size}`);
  }
 }
});
for(const size of [6,7]){
 const at=2*size+2;
 test(`${size}: revised tentacles arrange allies across gaps and respect defenses`,()=>{
  for(const [id,direction,delta] of [['portuguese-man-of-war','right',1],['king-crab','up',-size],['colossal-squid','down',size],['goblin-shark','down',size]]){
   const opposite={up:'down',right:'left',down:'up'}[direction];
   const target=pawn('ally','player');
   const result=resolvePlacement(board(size,[[at+delta*2,target]]),at,card(id),size);
   assert.equal(result.board[at+delta]?.id,'ally',id);
   const guard={...target,edges:[{direction:opposite,effect:'weak'}]};
   assert.equal(resolvePlacement(board(size,[[at+delta*2,guard]]),at,card(id),size).board[at+delta*2]?.id,'ally',id);
  }
 });
 test(`${size}: simplified tails set allies, allow Standard counters and do not retain removed special powers`,()=>{
  for(const [id,direction,delta] of [['orca','up',-size],['greenland-shark','left',-1],['bowhead-whale','down',size],['walrus','right',1],['giant-oarfish','down',size],['barreleye','left',-1],['albatross','right',1]]){
   // Block unrelated automatic retreats, so the tail's ordinary setup is isolated.
   const blockers=id==='albatross'?[[at+size,pawn('retreat-wall','player')]]:id==='barreleye'?[[at-1,pawn('retreat-wall','player')]]:[];
   // Barreleye's left target itself blocks its right-Bounce retreat.
   const entries=[...blockers.filter(([i])=>i!==at+delta),[at+delta,pawn('ally','player')]];
   assert.equal(resolvePlacement(board(size,entries),at,card(id),size).board[at+2*delta]?.id,'ally',id);
   const opposite={up:'down',right:'left',down:'up',left:'right'}[direction];
   const defended=pawn('guard','rival',[{direction:opposite,effect:'standard'}]);
   const r=resolvePlacement(board(size,[...blockers.filter(([i])=>i!==at+delta),[at+delta,defended]]),at,card(id),size);
   assert.equal(r.board[at+delta]?.id,'guard',id);
  }
 });
 test(`${size}: mine is delivered by a common card, retaliates, and can be removed safely from below`,()=>{
  const reef=[...scoringReefs(size)][2];
  const delivered=resolvePlacement(board(size,[[reef-1,card('sea-mine')]]),reef-2,card('anchovy'),size);
  assert.equal(delivered.board[reef]?.id,'sea-mine');
  const unsafe=resolvePlacement(board(size,[[reef,card('sea-mine')]]),reef-1,card('anchovy','rival'),size);
  assert.ok(unsafe.killedIds.includes('anchovy'));
  assert.notEqual(unsafe.board[reef]?.id,'sea-mine'); // Retaliation is not retention.
  const safe=resolvePlacement(board(size,[[reef,card('sea-mine')]]),reef+size,card('minnow','rival'),size);
  assert.ok(!safe.killedIds.includes('minnow'));assert.notEqual(safe.board[reef]?.id,'sea-mine');
 });
 test(`${size}: revised ambushers still kill allies and leave ordinary responses`,()=>{
  for(const id of ['orca','greenland-shark','colossal-squid','goblin-shark']){
   const r=resolvePlacement(board(size,[[at+1,pawn('ally','player')]]),at,card(id),size);
   assert.ok(r.killedIds.includes('ally'),id);
   const shield=pawn('shield','rival',[{direction:'left',effect:'weak'}]);
   assert.equal(resolvePlacement(board(size,[[at+1,shield]]),at,card(id),size).board[at+1]?.id,'shield',id);
  }
 });
}
test('all saved balance versions preserve Ocean definitions, recruits, rivals and seeded offers',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 try{
  for(const [version,catalog] of [[undefined,PRE_BALANCE_STARTERS],[1,BATCH_ONE_STARTERS],[2,BATCH_TWO_STARTERS],[3,BATCH_THREE_STARTERS],[4,BATCH_FOUR_STARTERS],[5,STARTERS]]){
   const run=createRun('OCEAN-REGION-SAVE');run.cardBalanceVersion=version;run.region=1;run.roster=[...OCEAN_POOL];
   run.pending=run.maps[1].nodes.find(n=>n.type==='shop').id;run.current=run.maps[1].nodes.find(n=>n.next.includes(run.pending)).id;
   const catches=offers(run),stock=shopOffers(run);
   for(const id of OCEAN_POOL){recruit(run,id);assert.deepEqual(runFishDefinition(run,id).edges,catalog.find(f=>f.texture===id).edges);assert.deepEqual(run.school.at(-1).edges,catalog.find(f=>f.texture===id).edges);}
   saveRun(run);const loaded=loadRun();assert.ok(loaded);assert.deepEqual(loaded.school,run.school);assert.deepEqual(offers(loaded),catches);assert.deepEqual(shopOffers(loaded),stock);
   for(const f of rivalDeckFor(loaded))assert.deepEqual(f.edges,catalog.find(c=>c.texture===f.texture).edges);
  }
  assert.equal(createRun('CURRENT').cardBalanceVersion,7);
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
