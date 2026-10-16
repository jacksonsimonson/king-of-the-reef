import test from 'node:test';
import assert from 'node:assert/strict';
import {match} from '../scripts/balance/matches.mjs';
import {LOADOUTS,useStudyCharm} from '../scripts/balance/charms.mjs';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {canPlaceFish} from '../src/game/abilities.ts';
import {charmCard} from '../src/game/data/tideCharms.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {candidate,PROPOSALS} from '../scripts/balance/match-proposals.mjs';
test('charm stress matches finish, consume at most three per seat, and never give player-only rivals charms',()=>{
 for(const loadout of LOADOUTS)for(const charmMode of ['player','both']){
  const result=match({region:2,seed:'CHARM-REGRESSION',loadout,charmMode,target:'void-angler'});
  assert.deepEqual(result.plays,{player:7,rival:7});
  for(const owner of ['player','rival']){const logs=result.charmLog.filter(l=>l.owner===owner);assert.ok(logs.length<=3);assert.equal(new Set(logs.map(l=>l.charm)).size,logs.length);assert.ok(logs.every(l=>loadout.includes(l.charm)));if(charmMode==='player'&&owner==='rival')assert.equal(logs.length,0);}
 }
});
test('both candidate cards retain new blank sides until battle-only charms fill them',()=>{
 for(const proposal of PROPOSALS){const base={...candidate(proposal),id:'candidate',owner:'player',condition:'healthy'},before=structuredClone(base);
  for(const charm of ['spear-shell','barbed-wreath','coral-mail']){const modified=charmCard(base,charm);assert.equal(modified.edges.length,4);assert.ok(modified.edges.some(e=>e.direction===proposal.remove));}
  const beacon=charmCard(base,'reef-beacon'),board=Array(49).fill(null);assert.equal(canPlaceFish(board,22,base,{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}),false);assert.equal(canPlaceFish(board,22,beacon,{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}),true);
  const anchor=charmCard(base,'anchor-stone');board[22]=anchor;const attacker={...base,id:'attacker',owner:'rival',edges:[{direction:'up',effect:'double'}]};assert.equal(resolvePlacement({board,shocked:new Set()},29,attacker).board[22]?.id,'candidate');
  assert.deepEqual(base,before);
 }
});
test('study Drift uses legal movement and consumes only when it gains control',()=>{
 const card={...STARTERS[0],id:'ally',owner:'rival',condition:'healthy'},board=Array(25).fill(null);board[6]=card;
 const state={board,shocked:new Set(),terrain:{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}},inventory=['drift-shell'];
 const result=useStudyCharm({state,hands:{player:[],rival:[]},decks:{player:[],rival:[]},owner:'rival',inventory,rng:()=>0});
 assert.equal(result.from,6);assert.equal(result.to,11);assert.equal(state.board[11].id,'ally');assert.equal(inventory.length,0);
});
test('snake schedule preserves both play budgets and alternates initiative each round',()=>{
 const r=match({region:0,initiative:'snake',seed:'ORDER-REGRESSION',difficulty:'tactical'});
 assert.deepEqual(r.trace.map(t=>t.owner),['player','rival','rival','player','player','rival','rival','player','player','rival']);assert.equal(r.checkpoints.length,5);
});
import {createRun,recruit,runFishDefinition,saveRun,loadRun,rivalDeckFor,offers,shopOffers} from '../src/game/run/state.ts';
import {BATCH_ONE_STARTERS} from '../src/game/data/starterFish.ts';
test('batch two preserves unversioned and batch-one voyages, offers and rival recruitment',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 for(const version of [undefined,1,2]){
  const run=createRun('BATCH-TWO');if(version===undefined)delete run.cardBalanceVersion;else run.cardBalanceVersion=version;
  run.region=2;run.pending=run.maps[2].nodes.find(n=>n.type==='shop').id;run.current=run.maps[2].nodes.find(n=>n.next.includes(run.pending)).id;
  const stock=shopOffers(run),catches=offers(run);
  for(const texture of ['void-angler','buoy-jelly'])recruit(run,texture);
  assert.ok(saveRun(run));const loaded=loadRun();assert.ok(loaded);assert.deepEqual(loaded.school,run.school);assert.deepEqual(shopOffers(loaded),stock);assert.deepEqual(offers(loaded),catches);
  for(const texture of ['void-angler','buoy-jelly']){
   const expected=(version===2?STARTERS:BATCH_ONE_STARTERS).find(c=>c.texture===texture);recruit(loaded,texture);assert.deepEqual(loaded.school.at(-1).edges,expected.edges);assert.deepEqual(runFishDefinition(loaded,texture).edges,expected.edges);
   const encounter={...loaded,roster:[texture]};assert.ok(rivalDeckFor(encounter).every(c=>JSON.stringify(c.edges)===JSON.stringify(expected.edges)));
  }
 }
 assert.equal(createRun('NEW').cardBalanceVersion,6);
});
