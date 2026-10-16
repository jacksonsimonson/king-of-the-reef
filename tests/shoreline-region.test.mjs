import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_TWO_STARTERS,BATCH_THREE_STARTERS} from '../src/game/data/starterFish.ts';
import {SHORELINE_ROLES} from '../src/game/data/shorelineRoles.ts';
import {REEF_POOL} from '../src/game/data/reefPool.ts';
import {scenarios,probe} from '../scripts/balance/pilot.mjs';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {createRun,runFishDefinition,recruit,saveRun,loadRun,rivalDeckFor,shopOffers,offers} from '../src/game/run/state.ts';

const card=id=>({...STARTERS.find(f=>f.texture===id),id,owner:'player',condition:'healthy'});
const board=(size,entries)=>({board:Object.assign(Array(size*size).fill(null),Object.fromEntries(entries)),shocked:new Set()});
test('every Shoreline species has a reviewed identity, purpose and limitation; other regions are unchanged',()=>{
 assert.deepEqual(Object.keys(SHORELINE_ROLES).sort(),[...REEF_POOL].sort());
 assert.equal(new Set(Object.values(SHORELINE_ROLES).map(r=>r.title)).size,77);
 for(const [id,r] of Object.entries(SHORELINE_ROLES)){assert.ok(r.family&&r.title&&r.plan.length>35&&r.limitation.length>25,id);}
 for(const f of STARTERS.filter(f=>!REEF_POOL.includes(f.texture)))assert.deepEqual(f,BATCH_TWO_STARTERS.find(c=>c.texture===f.texture));
});
// Independent batch checks: these exercise complete cards, not individual edge counts.
for(const family of new Set(Object.values(SHORELINE_ROLES).map(r=>r.family))){
 test(`${family}: each species has useful ordinary control, shutdown, or an explicit delivered-holder role`,()=>{
  for(const [id,role] of Object.entries(SHORELINE_ROLES).filter(([,r])=>r.family===family)){
   if(id==='giant-clam')continue; // Delivery and retention are tested below, without a charm.
   const results=[false,true].flatMap(mirror=>scenarios(5,mirror).map(state=>probe(card(id),state)));
   assert.ok(results.some(r=>id==='electric-eel'?r.maxEnemyShocked>0:r.bestDelta>0),`${id}: ${role.title} has no observed ordinary contribution`);
  }
 });
}
for(const size of [5,6,7]){
 const reef=[...scoringReefs(size)][2];
 test(`${size}: armored holders have ordinary delivery and ordinary counterplay`,()=>{
  for(const id of ['boxfish','giant-clam']){
   const push={...card(id==='boxfish'?'needlefish':'anchovy'),id:'pusher'};
   const arrived=resolvePlacement(board(size,[[reef-1,card(id)]]),reef-2,push,size);
   assert.equal(arrived.board[reef]?.id,id);
   const counter={...push,owner:'rival'};
   const left=resolvePlacement(board(size,[[reef,card(id)]]),reef-1,counter,size);
   assert.notEqual(left.board[reef]?.id,id);
   const right={...counter,edges:[{direction:'left',effect:'double'}]};
   assert.equal(resolvePlacement(board(size,[[reef,card(id)]]),reef+1,right,size).board[reef]?.id,id);
  }
  const old={...BATCH_TWO_STARTERS.find(f=>f.texture==='boxfish'),id:'old-box',owner:'player',condition:'healthy'};
  assert.equal(resolvePlacement(board(size,[[reef-1,old]]),reef-2,card('needlefish'),size).board[reef],null);
 });
 test(`${size}: Blacktip hunts vertically, leaves horizontal counters and can hurt allies`,()=>{
  const target={...card('goby'),id:'target',edges:[],owner:'rival'};
  const strike=resolvePlacement(board(size,[[reef,target]]),reef+size,card('blacktip-reef-shark'),size);
  assert.ok(strike.killedIds.includes('target'));
  const friendly=resolvePlacement(board(size,[[reef,{...target,owner:'player'}]]),reef+size,card('blacktip-reef-shark'),size);
  assert.ok(friendly.killedIds.includes('target'));
  const shield={...target,edges:[{direction:'down',effect:'weak'}]};
  assert.equal(resolvePlacement(board(size,[[reef,shield]]),reef+size,card('blacktip-reef-shark'),size).board[reef]?.id,'target');
  const sideways={...card('anchovy'),owner:'rival'};
  assert.notEqual(resolvePlacement(board(size,[[reef,card('blacktip-reef-shark')]]),reef-1,sideways,size).board[reef]?.texture,'blacktip-reef-shark');
 });
}
test('whole-region versions retain saved definitions and seeded offers without changing current rules',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),values=new Map();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 try{
  for(const [version,catalog] of [[2,BATCH_TWO_STARTERS],[3,BATCH_THREE_STARTERS],[4,STARTERS]]){
   const run=createRun('REGION-SAVE');run.cardBalanceVersion=version;
   run.pending=run.maps[0].nodes.find(n=>n.type==='shop').id;run.current=run.maps[0].nodes.find(n=>n.next.includes(run.pending)).id;
   const catches=offers(run),stock=shopOffers(run);
   for(const id of REEF_POOL){recruit(run,id);assert.deepEqual(runFishDefinition(run,id).edges,catalog.find(f=>f.texture===id).edges);}
   saveRun(run);const loaded=loadRun();assert.ok(loaded);assert.deepEqual(loaded.school,run.school);assert.deepEqual(offers(loaded),catches);assert.deepEqual(shopOffers(loaded),stock);
   for(const f of rivalDeckFor(loaded))assert.deepEqual(f.edges,catalog.find(c=>c.texture===f.texture).edges);
  }
  assert.equal(createRun('CURRENT').cardBalanceVersion,4);
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
