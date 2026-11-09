import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlacement } from '../src/game/combat.ts';
import { describeFrame } from '../src/game/combatFeedback.ts';
import { STARTERS } from '../src/game/data/starterFish.ts';
import { battleTerrain, blocksPlacement } from '../src/game/terrain.ts';
const fish = (id, edges=[], ability) => ({...STARTERS[0], id, name:id, owner:'player', edges, ability});
const edge = (effect,direction='right')=>({effect,direction});
const state = () => ({board:Array(25).fill(null),shocked:new Set()});
test('recorded effects preserve combat results and immutable input across regional rosters',()=>{
 for(const region of ['shoreline','ocean','bermuda']) for(const [i,base] of STARTERS.entries()) {
  const input=state();input.terrain=battleTerrain(region);
  const index=[0,1,5,9,14,20,21,22][i%8];
  for(const pos of [3,4,7,10,11,12,13,18,19,23,24]) if(pos!==index&&!blocksPlacement(input.terrain,pos))input.board[pos]={...STARTERS[(i+pos)%STARTERS.length],id:'target-'+pos,owner:'rival'};
  const original=JSON.stringify(input.board);const card={...base,id:'played'};
  const plain=resolvePlacement(input,index,card), recorded=resolvePlacement(input,index,card,5,true);
  assert.deepEqual({...recorded,frames:[]},plain);assert.equal(JSON.stringify(input.board),original);
  assert.ok(recorded.frames.length);assert.deepEqual(recorded.frames.at(-1).board,recorded.board);
  assert.deepEqual(recorded.frames.at(-1).shocked,recorded.shocked);
 }
});
test('push resolves before whirlpool and logs both locations',()=>{
 const input=state();input.terrain={rocks:new Set(),whirlpools:[6,19]};input.board[7]=fish('target');
 const result=resolvePlacement(input,6,fish('actor',[edge('standard')]),5,true);
 assert.deepEqual(result.frames.map(f=>f.label),['Your play','actor · standard right','Whirlpool']);
 assert.equal(result.frames[1].board[8].id,'target');assert.equal(result.frames[1].board[6].id,'actor');
 assert.match(describeFrame(result.frames[1].board,new Set(),result.frames[2]).join(' '),/B2 → E4/);
});
test('blocked defense and occupied destination produce explanations without movement',()=>{
 for(const defense of [true,false]) {
  const input=state();input.board[7]=fish('target',defense?[edge('weak','left')]:[]);if(!defense)input.board[8]=fish('obstacle');
  const result=resolvePlacement(input,6,fish('actor',[edge('standard')]),5,true);
  assert.match(result.frames.at(-1).notes.join(' '),defense?/defending edge/:/occupied tile/);
  assert.equal(result.board[7].id,'target');
 }
});
test('retaliation and shocks are recorded with named causes',()=>{
 const input=state();input.board[7]={...fish('urchin',[edge('spines','left')]),owner:'rival'};
 const result=resolvePlacement(input,6,fish('actor',[edge('standard')]),5,true);
 assert.match(result.frames.at(-1).notes.join(' '),/Spines/);
 assert.match(describeFrame(result.frames[0].board,new Set(),result.frames[1]).join(' '),/actor removed/);
 const shock=resolvePlacement(input,6,fish('eel',[edge('shock')]),5,true);
 assert.match(describeFrame(shock.frames[0].board,new Set(),shock.frames[1]).join(' '),/urchin shocked/);
});

test('presentation tracks duplicate-species swaps, removal and same-length edge changes on every board size', async()=>{
 const {frameHighlights}=await import('../src/game/combatFeedback.ts');
 for(const size of [5,6,7]){
  const a=fish('a',[edge('standard')]),b={...fish('b',[edge('shield')]),name:a.name},c=fish('c');
  const before=Array(size*size).fill(null);before[0]=a;before[1]=b;before[size]=c;
  const after=[...before];after[0]=b;after[1]={...a,edges:[edge('double')]};after[size]=null;
  const cues=frameHighlights(before,new Set(),{label:'effect',board:after,shocked:new Set(['b']),notes:[],blockedTiles:[size+1]});
  assert.deepEqual(cues,{moves:[{from:0,to:1},{from:1,to:0}],removed:[size],changed:[0,1],blocked:[size+1]});
  assert.equal(before[0].edges[0].effect,'standard');
  assert.match(describeFrame(before,new Set(),{label:'ability',board:after,shocked:new Set(),notes:[]}).join(' '),/changed edges/);
 }
});
test('blocked cues identify the actual defender and obstacle without changing combat',()=>{
 for(const size of [5,6,7])for(const defense of [true,false]){
  const board=Array(size*size).fill(null),source=size+1,target=source+1,obstacle=source+2;
  board[target]=fish('defender',defense?[edge('shield','left')]:[]);if(!defense)board[obstacle]=fish('wall');
  const recorded=resolvePlacement({board,shocked:new Set()},source,fish('actor',[edge('standard')]),size,true);
  const plain=resolvePlacement({board,shocked:new Set()},source,fish('actor',[edge('standard')]),size,false);
  assert.deepEqual(recorded.board,plain.board);
  assert.deepEqual(recorded.frames.at(-1).blockedTiles,[defense?target:obstacle]);
 }
});
