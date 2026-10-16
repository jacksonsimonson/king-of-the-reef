import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_FIVE_STARTERS,BATCH_FOUR_STARTERS,BATCH_THREE_STARTERS,BATCH_TWO_STARTERS,BATCH_ONE_STARTERS,PRE_BALANCE_STARTERS} from '../src/game/data/starterFish.ts';
import {BERMUDA_ROLES} from '../src/game/data/bermudaRoles.ts';
import {SHORELINE_ROLES} from '../src/game/data/shorelineRoles.ts';
import {OCEAN_ROLES} from '../src/game/data/oceanRoles.ts';
import {REGIONS} from '../src/game/run/maps.ts';
import {scenarios,probe} from '../scripts/balance/pilot.mjs';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {createRun,runFishDefinition,recruit,saveRun,loadRun,rivalDeckFor,shopOffers,offers} from '../src/game/run/state.ts';
const pool=REGIONS[2].pool;
const card=(id,owner='player',catalog=STARTERS)=>({...catalog.find(f=>f.texture===id),id,owner,condition:'healthy'});
const pawn=(id,owner='rival',edges=[])=>({...card('minnow',owner),id,edges});
const board=(size,entries=[])=>({board:Object.assign(Array(size*size).fill(null),Object.fromEntries(entries)),shocked:new Set()});
test('all 43 Bermuda entries have authored identities and all 167 catalog roles are covered',()=>{
 assert.deepEqual(Object.keys(BERMUDA_ROLES).sort(),[...pool].sort());
 assert.equal(new Set(Object.values(BERMUDA_ROLES).map(r=>r.title)).size,43);
 for(const [id,r] of Object.entries(BERMUDA_ROLES))assert.ok(r.family&&r.plan.length>35&&r.limitation.length>25,id);
 const roles={...SHORELINE_ROLES,...OCEAN_ROLES,...BERMUDA_ROLES};
 assert.deepEqual(Object.keys(roles).sort(),STARTERS.map(f=>f.texture).sort());
 for(const f of STARTERS.filter(f=>!pool.includes(f.texture)))assert.deepEqual(f,BATCH_FIVE_STARTERS.find(c=>c.texture===f.texture));
});
for(const family of new Set(Object.values(BERMUDA_ROLES).map(r=>r.family)))test(`${family}: every complete card has an ordinary regional control or shutdown opportunity`,()=>{
 for(const [id] of Object.entries(BERMUDA_ROLES).filter(([,r])=>r.family===family)){
  const rows=[false,true].flatMap(mirror=>scenarios(7,mirror).map(s=>probe(card(id),s)));
  assert.ok(rows.some(r=>r.bestDelta>0||r.maxEnemyShocked>0),`${id} has no ordinary contribution`);
 }
});
for(const size of [5,6,7]){
 const at=2*size+2;
 test(`${size}: revised claws pull across gaps, work for allies and respect Shields`,()=>{
  for(const [id,direction,delta] of [['rust-lobster','right',1],['squall-crab','right',1],['reef-titan','left',-1],['lighthouse-hermit','left',-1]]){
   const opposite=direction==='right'?'left':'right';
   assert.equal(resolvePlacement(board(size,[[at+delta*2,pawn('ally','player')]]),at,card(id),size).board[at+delta]?.id,'ally',id);
   const guarded=pawn('guard','rival',[{direction:opposite,effect:'weak'}]);
   assert.equal(resolvePlacement(board(size,[[at+delta*2,guarded]]),at,card(id),size).board[at+delta*2]?.id,'guard',id);
  }
 });
 test(`${size}: Mimic Chest has ordinary delivery and the same ordinary counter`,()=>{
  const reef=[...scoringReefs(size)][2];
  assert.equal(resolvePlacement(board(size,[[reef-1,card('mimic-chest')]]),reef-2,card('needlefish'),size).board[reef]?.id,'mimic-chest');
  const old=card('mimic-chest','player',BATCH_FIVE_STARTERS);
  assert.equal(resolvePlacement(board(size,[[reef-1,old]]),reef-2,card('needlefish'),size).board[reef],null);
  assert.notEqual(resolvePlacement(board(size,[[reef,card('mimic-chest')]]),reef-1,card('needlefish','rival'),size).board[reef]?.id,'mimic-chest');
  assert.ok(resolvePlacement(board(size,[[at+1,pawn('ally','player')]]),at,card('mimic-chest'),size).killedIds.includes('ally'));
 });
 test(`${size}: removed flank effects leave a basic response while earlier pass cards retain their roles`,()=>{
  for(const [id,direction,delta] of [['skeleton-fisherman','left',-1],['drowned-diver','right',1],['bonefish','left',-1],['graveyard-leviathan','down',size],['lighthouse-hermit','right',1],['abyssal-spadefish','up',-size],['mountain-ray','left',-1],['fossil-from-tomorrow','down',size],['triangle-shard','left',-1],['reef-titan','down',size],['paradox-puffer','right',1],['map-serpent','left',-1],['squall-crab','left',-1],['tempest-seahorse','left',-1],['stormfin-tuna','down',size],['stormback-whale','left',-1],['black-squall','left',-1],['compass-jelly','down',size]]){
   const opposite={up:'down',right:'left',down:'up',left:'right'}[direction];
   const attacker=pawn('reply','rival',[{direction:opposite,effect:'standard'}]);
   const r=resolvePlacement(board(size,[[at,card(id)]]),at+delta,attacker,size);
   assert.notEqual(r.board[at]?.id,id,id);assert.ok(!r.killedIds.includes('reply'),id);
  }
  for(const id of ['phantom-shark','void-angler','buoy-jelly'])assert.deepEqual(card(id),card(id,'player',BATCH_FIVE_STARTERS));
 });
}
test('Red Door resolves a real exchange chain, can undo its first gain and respects an ordinary defense',()=>{
 const size=7,at=24,entries=[[17,pawn('first')],[18,pawn('second')],[25,pawn('third')]];
 const r=resolvePlacement(board(size,entries),at,card('red-door'),size);
 assert.equal(r.board[at]?.id,'red-door');assert.equal(r.board[17]?.id,'second');assert.equal(r.board[18]?.id,'third');assert.equal(r.board[25]?.id,'first');
 const guard=pawn('guard','rival',[{direction:'down',effect:'standard'}]);
 const blocked=resolvePlacement(board(size,[[17,guard]]),at,card('red-door'),size);
 assert.equal(blocked.board[17]?.id,'guard');assert.equal(blocked.board[at]?.id,'red-door');
});
test('refined Black Squall keeps independent reef entry and Lightning Skeleton can strike a defended target',()=>{
 const size=7,reef=[...scoringReefs(size)][1];
 const recoil=resolvePlacement(board(size),reef+size,card('black-squall'),size);
 assert.equal(recoil.board[reef]?.id,'black-squall');
 const guard=pawn('guard','rival',[{direction:'left',effect:'standard'}]);
 assert.equal(resolvePlacement(board(size,[[25,guard]]),24,card('stormfin-tuna'),size).board[26]?.id,'guard');
 const shield={...guard,edges:[{direction:'left',effect:'weak'}]};
 assert.equal(resolvePlacement(board(size,[[25,shield]]),24,card('stormfin-tuna'),size).board[25]?.id,'guard');
});
test('Lightning Skeleton and Admiral have ordinary setup even without an enemy to shut down',()=>{
 const size=7,at=24;
 for(const id of ['stormfin-tuna','tempest-seahorse']){
  const r=resolvePlacement(board(size,[[at+1,pawn('ally','player')]]),at,card(id),size);
  assert.equal(r.board[at+2]?.id,'ally');assert.equal(r.board[at]?.id,id);
  const delta=id==='stormfin-tuna'?-size:size;
  assert.ok(resolvePlacement(board(size,[[at+delta,pawn('friend','player')]]),at,card(id),size).shocked.has('friend'));
 }
});
test('saved versions preserve every Bermuda recruit, rival and seeded offer',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 try{
  for(const [version,catalog] of [[undefined,PRE_BALANCE_STARTERS],[1,BATCH_ONE_STARTERS],[2,BATCH_TWO_STARTERS],[3,BATCH_THREE_STARTERS],[4,BATCH_FOUR_STARTERS],[5,BATCH_FIVE_STARTERS],[6,STARTERS]]){
   const run=createRun('BERMUDA-REGION-SAVE');run.cardBalanceVersion=version;run.region=2;run.roster=[...pool];
   run.pending=run.maps[2].nodes.find(n=>n.type==='shop').id;run.current=run.maps[2].nodes.find(n=>n.next.includes(run.pending)).id;
   const catches=offers(run),stock=shopOffers(run);
   for(const id of pool){recruit(run,id);assert.deepEqual(runFishDefinition(run,id).edges,catalog.find(f=>f.texture===id).edges);assert.deepEqual(run.school.at(-1).edges,catalog.find(f=>f.texture===id).edges);}
   saveRun(run);const loaded=loadRun();assert.ok(loaded);assert.deepEqual(loaded.school,run.school);assert.deepEqual(offers(loaded),catches);assert.deepEqual(shopOffers(loaded),stock);
   for(const f of rivalDeckFor(loaded))assert.deepEqual(f.edges,catalog.find(c=>c.texture===f.texture).edges);
  }
  assert.equal(createRun('CURRENT').cardBalanceVersion,6);
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
