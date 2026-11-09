import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {REGIONS} from '../src/game/run/maps.ts';
import {createRun,rivalDeckFor,activeNode,battleResult,saveRun,loadRun,SAVE_KEY} from '../src/game/run/state.ts';
import {RIVAL_STYLES,weightedRivalSchool,schoolRating,styleWeight} from '../src/game/run/rivalSchools.ts';
const poolFor=r=>STARTERS.filter(c=>REGIONS[r].pool.includes(c.texture));
test('regional schools are reproducible, varied, unique and similarly budgeted; elites rate higher',()=>{
 for(let r=0;r<3;r++){
  const pool=poolFor(r), seen=new Set();let normal=0,elite=0;
  for(const style of Object.keys(RIVAL_STYLES)) for(let seed=0;seed<40;seed++){
   const key='distribution:'+seed, cards=weightedRivalSchool(pool,key,style), strong=weightedRivalSchool(pool,key,style,true);
   assert.deepEqual(cards,weightedRivalSchool(pool,key,style));assert.equal(cards.length,10);assert.equal(new Set(cards.map(c=>c.texture)).size,10);
   assert.equal(new Set(cards.map(c=>c.id)).size,10);
   assert.ok(cards.every(c=>pool.some(p=>p.texture===c.texture)&&c.owner==='rival'&&c.condition==='healthy'));
   cards.forEach(c=>seen.add(c.texture));normal+=schoolRating(cards);elite+=schoolRating(strong);
   assert.ok(Math.abs(schoolRating(cards)-schoolRating(pool))<.35);
  }
  assert.equal(seen.size,pool.length);assert.ok(elite>normal);
 }
});
test('style weights bias relevant cards without excluding others, and tiny pools recycle safely',()=>{
 for(const style of ['holders','hunters','currents']){
  let themed=0,plain=0;const pool=poolFor(0);
  for(let seed=0;seed<100;seed++){
   themed+=weightedRivalSchool(pool,String(seed),style).filter(c=>styleWeight(c,style)>1).length;
   plain+=weightedRivalSchool(pool,String(seed),'balanced').filter(c=>styleWeight(c,style)>1).length;
  }
  assert.ok(themed>plain,style);
 }
 const pool=poolFor(0).slice(0,2);const cards=weightedRivalSchool(pool,'tiny','hunters');
 assert.equal(cards.length,10);assert.ok(cards.every(c=>pool.some(p=>p.texture===c.texture)));
 assert.throws(()=>weightedRivalSchool([],'empty','balanced'));
});
test('elites are optional, respect saved encounters and pay the advertised premium',()=>{
 let count=0;
 for(let seed=0;seed<100;seed++)for(const map of createRun(String(seed)).maps)for(const node of map.nodes.filter(n=>n.elite)){
  count++;assert.equal(node.type,'battle');assert.ok([8,14].includes(node.column));
  for(const parent of map.nodes.filter(p=>p.next.includes(node.id)))assert.ok(parent.next.some(id=>!map.nodes.find(n=>n.id===id).elite));
 }
 assert.ok(count>100);
 const run=createRun('save');const node=run.maps[0].nodes.find(n=>n.type==='battle');
 run.current=run.maps[0].nodes.find(n=>n.next.includes(node.id)).id;run.pending=node.id;node.elite=true;
 const deck=rivalDeckFor(run);let saved;globalThis.localStorage={setItem:(k,v)=>saved=v,getItem:()=>saved};
 assert.ok(saveRun(run));const loaded=loadRun();assert.ok(loaded);assert.deepEqual(rivalDeckFor(loaded),deck);assert.equal(activeNode(loaded).elite,true);
 const before=loaded.shells;battleResult(loaded,3,1);assert.equal(loaded.shells-before,22);assert.equal(loaded.pending,null);
 delete run.rivalSchoolVersion;delete node.elite;saveRun(run);const legacy=loadRun();assert.ok(legacy);assert.equal(legacy.rivalSchoolVersion,undefined);assert.deepEqual(rivalDeckFor(legacy),rivalDeckFor(run));
 const bad=JSON.parse(saved);bad.rivalSchoolVersion=2;saved=JSON.stringify(bad);assert.equal(loadRun(),null);
});

test('production integration respects enabled regional cards and leaves Colossals on their old generator',()=>{
 const run=createRun('integration');
 for(let r=0;r<3;r++){
  run.region=r;run.pending=run.maps[r].nodes.find(n=>n.type==='battle').id;
  run.roster=poolFor(r).slice(0,3).map(c=>c.texture);
  assert.ok(rivalDeckFor(run).every(c=>run.roster.includes(c.texture)));
 }
 run.roster=STARTERS.map(c=>c.texture);run.pending=run.maps[2].nodes.find(n=>n.type==='boss').id;
 const boss=rivalDeckFor(run);delete run.rivalSchoolVersion;assert.deepEqual(rivalDeckFor(run),boss);
});
