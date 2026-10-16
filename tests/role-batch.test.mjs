import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,PRE_BALANCE_STARTERS} from '../src/game/data/starterFish.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {createRun,recruit,runFishDefinition,saveRun,loadRun,SAVE_KEY,offers,shopOffers} from '../src/game/run/state.ts';
const card=(texture,old=false)=>({... (old?PRE_BALANCE_STARTERS:STARTERS).find(c=>c.texture===texture),id:texture,owner:'player',condition:'healthy'});
const target=(id,owner='rival',edges=[])=>({...card('minnow'),id,owner,edges});
const edge=(direction,effect='standard')=>({direction,effect});
const state=(size,entries)=>({board:Object.assign(Array(size*size).fill(null),Object.fromEntries(entries)),shocked:new Set()});
for(const size of [5,6,7]){
 const reef=[...scoringReefs(size)][1];
 test(`${size}: Urchin sets an ally onto a reef; its underside can also push an ally off-board`,()=>{
  const setup=state(size,[[reef-size,target('ally','player')]]);
  assert.equal(resolvePlacement(setup,reef-2*size,card('sea-urchin'),size).board[reef]?.id,'ally');
  assert.equal(resolvePlacement(setup,reef-2*size,card('sea-urchin',true),size).board[reef],null);
  const bottom=size*(size-1)+1;
  const harm=resolvePlacement(state(size,[[bottom,target('ally','player')]]),bottom-size,card('sea-urchin'),size);
  assert.ok(harm.killedIds.includes('ally'));
 });
 test(`${size}: Urchin retains lateral retaliation but underside Double has a clean counter`,()=>{
  const setup=state(size,[[reef,card('sea-urchin')]]);
  const side=resolvePlacement(setup,reef-1,target('attacker','rival',[edge('right')]),size);
  assert.ok(side.killedIds.includes('attacker'));assert.equal(side.board[reef+1]?.id,'sea-urchin');
  const below=resolvePlacement(setup,reef+size,target('attacker','rival',[edge('up','double')]),size);
  assert.ok(!below.killedIds.includes('attacker'));assert.equal(below.board[reef-size]?.id,'sea-urchin');
 });
 test(`${size}: Phantom retreats onto a reef then bites from its new position`,()=>{
  for(const old of [false,true]){
   const result=resolvePlacement(state(size,[[reef+1,target('prey')]]),reef-size,card('phantom-shark',old),size);
   assert.ok(result.killedIds.includes('prey'));assert.equal(result.board[reef]?.id,'phantom-shark');
  }
  const blocked=resolvePlacement(state(size,[[reef,target('blocker','player')],[reef+1,target('prey')]]),reef-size,card('phantom-shark'),size);
  assert.equal(blocked.board[reef-size]?.id,'phantom-shark');assert.ok(!blocked.killedIds.includes('prey'));
 });
 test(`${size}: Phantom has ordinary counters and a friendly Bite cost`,()=>{
  const shield=resolvePlacement(state(size,[[reef+1,target('prey','rival',[edge('left','weak')])]]),reef-size,card('phantom-shark'),size);
  assert.ok(!shield.killedIds.includes('prey'));
  const ally=resolvePlacement(state(size,[[reef+1,target('ally','player')]]),reef-size,card('phantom-shark'),size);
  assert.ok(ally.killedIds.includes('ally'));
  for(const old of [false,true]){
   const result=resolvePlacement(state(size,[[reef,card('phantom-shark',old)]]),reef+size,target('attacker','rival',[edge('up')]),size);
   assert.equal(result.board[reef]?.id,old?'phantom-shark':undefined);
  }
 });
 test(`${size}: full-Shock Eel enables a follow-up push, but shocks unshielded allies too`,()=>{
  const guarded=target('holder','rival',['up','right','down','left'].map(d=>edge(d)));
  const setup=state(size,[[reef,guarded]]),pusher=target('pusher','player',[edge('right')]);
  assert.equal(resolvePlacement(setup,reef-1,pusher,size).board[reef]?.id,'holder');
  const shocked=resolvePlacement(setup,reef-size,card('electric-eel'),size);
  assert.ok(shocked.shocked.has('holder'));
  assert.equal(resolvePlacement(shocked,reef-1,pusher,size).board[reef+1]?.id,'holder');
  const friends=resolvePlacement(state(size,[[reef,target('ally','player')],[reef-size+1,target('shield','player',[edge('left','weak')])]]),reef-size,card('electric-eel'),size);
  assert.ok(friends.shocked.has('ally'));assert.ok(!friends.shocked.has('shield'));
  assert.deepEqual(card('electric-eel').edges,card('electric-eel',true).edges);
 });
}
test('saved voyages retain old school, future recruits and queued offers; new voyages use the new batch',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 for(const old of [true,false]){
  const run=createRun('ROLE-BATCH');if(old)delete run.cardBalanceVersion;
  run.pending=run.maps[0].nodes.find(n=>n.type==='shop').id;
  run.current=run.maps[0].nodes.find(n=>n.next.includes(run.pending)).id;
  recruit(run,'sea-urchin');const stock=shopOffers(run),catches=offers(run);
  assert.ok(saveRun(run));const loaded=loadRun();assert.ok(loaded);
  assert.deepEqual(loaded.school,run.school);assert.deepEqual(shopOffers(loaded),stock);assert.deepEqual(offers(loaded),catches);
  for(const texture of ['sea-urchin','phantom-shark']){
   recruit(loaded,texture);assert.deepEqual(loaded.school.at(-1).edges,card(texture,old).edges);
   assert.deepEqual(runFishDefinition(loaded,texture).edges,card(texture,old).edges);
  }
 }
 const bad=createRun('FUTURE');bad.cardBalanceVersion=7;localStorage.setItem(SAVE_KEY,JSON.stringify(bad));assert.equal(loadRun(),null);
});
