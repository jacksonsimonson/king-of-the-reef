import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_TWO_STARTERS} from '../src/game/data/starterFish.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {createRun,recruit,runFishDefinition,saveRun,loadRun,offers,shopOffers} from '../src/game/run/state.ts';
import {CRAB_TRIALS} from '../scripts/balance/shoreline-crabs.mjs';
const fish=(texture,old=false)=>({... (old?BATCH_TWO_STARTERS:STARTERS).find(f=>f.texture===texture),id:texture,owner:'player',condition:'healthy'});
const pawn=(id,owner='player',edges=[])=>({...fish('minnow'),id,owner,edges});
const edge=(direction,effect='standard')=>({direction,effect});
const state=(size,entries)=>({board:Object.assign(Array(size*size).fill(null),Object.fromEntries(entries)),shocked:new Set()});
for(const size of [5,6,7]){
 const reef=[...scoringReefs(size)][1];
 test(`${size}: Hermit keeps simple lateral delivery, shell protection and exposed front counter`,()=>{
  const rightReef=[...scoringReefs(size)][2];
  assert.equal(resolvePlacement(state(size,[[rightReef-1,pawn('ally')]]),rightReef-2,fish('hermit-crab'),size).board[rightReef]?.id,'ally');
  const setup=state(size,[[reef,fish('hermit-crab')]]);
  assert.equal(resolvePlacement(setup,reef-1,pawn('attacker','rival',[edge('right','double')]),size).board[reef]?.id,'hermit-crab');
  assert.equal(resolvePlacement(setup,reef-size,pawn('attacker','rival',[edge('down')]),size).board[reef+size]?.id,'hermit-crab');
 });
 test(`${size}: Horseshoe trades horizontal coverage for guarded downward delivery`,()=>{
  const setup=state(size,[[reef-size,pawn('ally')]]);
  assert.equal(resolvePlacement(setup,reef-2*size,fish('horseshoe-crab'),size).board[reef]?.id,'ally');
  assert.equal(resolvePlacement(setup,reef-2*size,fish('horseshoe-crab',true),size).board[reef],null);
  const resting=state(size,[[reef,fish('horseshoe-crab')]]);
  assert.equal(resolvePlacement(resting,reef+1,pawn('attacker','rival',[edge('left')]),size).board[reef-1]?.id,'horseshoe-crab');
  assert.equal(resolvePlacement(resting,reef-size,pawn('attacker','rival',[edge('down','double')]),size).board[reef]?.id,'horseshoe-crab');
  const bottom=size*(size-1)+1;
  assert.ok(resolvePlacement(state(size,[[bottom,pawn('ally')]]),bottom-size,fish('horseshoe-crab'),size).killedIds.includes('ally'));
 });
 test(`${size}: Pom-Pom pushes an ally onto a reef, with occupancy and Shield counters`,()=>{
  const setup=state(size,[[reef-size,pawn('ally')]]);
  assert.equal(resolvePlacement(setup,reef-2*size,fish('pom-pom-crab'),size).board[reef]?.id,'ally');
  assert.equal(resolvePlacement(setup,reef-2*size,fish('pom-pom-crab',true),size).board[reef],null);
  const defended=state(size,[[reef-size,pawn('holder','rival',[edge('up','weak')])]]);
  assert.equal(resolvePlacement(defended,reef-2*size,fish('pom-pom-crab'),size).board[reef-size]?.id,'holder');
  const occupied=state(size,[[reef,pawn('blocker')],[reef+size,pawn('ally')]]);
  assert.equal(resolvePlacement(occupied,reef-size,fish('pom-pom-crab'),size).board[reef+size]?.id,'ally');
  // Pushing an allied holder away from a reef is a real positional cost.
  assert.equal(resolvePlacement(state(size,[[reef,pawn('holder')]]),reef-size,fish('pom-pom-crab'),size).board[reef],null);
  // Its open top offers an ordinary enemy counter; Urchin retaliates against that enemy.
  for(const texture of ['pom-pom-crab','sea-urchin']){
   const delivery=resolvePlacement(state(size,[[reef-size,fish(texture)]]),reef-2*size,pawn('pusher','rival',[edge('down')]),size);
   assert.equal(delivery.board[reef]?.id,texture);assert.equal(delivery.killedIds.includes('pusher'),texture==='sea-urchin');
  }
 });
 test(`${size}: Pom-Pom retaliates laterally but can be safely displaced from above`,()=>{
  const setup=state(size,[[reef,fish('pom-pom-crab')]]);
  const side=resolvePlacement(setup,reef-1,pawn('attacker','rival',[edge('right')]),size);
  assert.ok(side.killedIds.includes('attacker'));assert.equal(side.board[reef+1]?.id,'pom-pom-crab');
  const top=resolvePlacement(setup,reef-size,pawn('attacker','rival',[edge('down')]),size);
  assert.ok(!top.killedIds.includes('attacker'));assert.equal(top.board[reef+size]?.id,'pom-pom-crab');
 });
}
test('adopted definitions match tested candidates and previous voyages preserve schools, recruits and offers',()=>{
 const old=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 try{
  for(const version of [undefined,1,2,3]){
   const run=createRun('CRAB-SAVES');run.cardBalanceVersion=version;
   run.pending=run.maps[0].nodes.find(n=>n.type==='shop').id;run.current=run.maps[0].nodes.find(n=>n.next.includes(run.pending)).id;
   for(const texture of Object.keys(CRAB_TRIALS)){
    recruit(run,texture);assert.deepEqual(runFishDefinition(run,texture).edges,CRAB_TRIALS[texture][version===3?'after':'before']);
   }
   const stock=shopOffers(run),catches=offers(run);saveRun(run);const loaded=loadRun();assert.ok(loaded);
   assert.deepEqual(loaded.school,run.school);assert.deepEqual(shopOffers(loaded),stock);assert.deepEqual(offers(loaded),catches);
  }
  for(const texture of Object.keys(CRAB_TRIALS))assert.deepEqual(fish(texture).edges,CRAB_TRIALS[texture].after);
 }finally{if(old)Object.defineProperty(globalThis,'localStorage',old);else delete globalThis.localStorage;}
});
