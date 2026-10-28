import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTING_SCHOOLS,schoolAvailable,startingTextures} from '../src/game/run/startingSchools.ts';
import {createRun,saveRun,loadRun,SAVE_KEY,recruit} from '../src/game/run/state.ts';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {REGIONS} from '../src/game/run/maps.ts';
import {saveEnabledTextures} from '../src/game/data/roster.ts';
import {resolvePlacement} from '../src/game/combat.ts';
function storage(){const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};return values;}

test('themed schools contain eight distinct reef creatures with identical starting resources and routes',()=>{
 storage();const baseline=createRun('SCHOOLS');
 assert.deepEqual(baseline.school.map(c=>c.texture),['minnow','anchovy','goby','crab','blenny','shrimp','sea-star','octopus']);
 for(const s of STARTING_SCHOOLS){
  assert.equal(s.textures.length,8);assert.equal(new Set(s.textures).size,8);
  assert.ok(s.textures.every(t=>REGIONS[0].pool.includes(t)));
  const r=createRun('SCHOOLS',2,s.id);assert.deepEqual(r.school.map(c=>c.texture),s.textures);
  assert.equal(new Set(r.school.map(c=>c.id)).size,8);assert.ok(r.school.every(c=>c.condition==='healthy'));
  assert.deepEqual(r.maps,baseline.maps);assert.equal(r.shells,24);assert.equal(r.resolve,3);assert.deepEqual(r.charms,[]);
 }
});
test('school identities provide real delivery tools and different specialist emphasis',()=>{
 const effects=id=>createRun('TOOLS',2,id).school.flatMap(c=>c.edges.map(e=>e.effect));
 const guards=effects('shellguard'),pulls=effects('tethers'),guides=effects('guides');
 assert.ok(guards.filter(e=>e==='weak').length>guides.filter(e=>e==='weak').length);
 assert.ok(guards.includes('double'));assert.ok(pulls.filter(e=>e==='hook').length>guards.filter(e=>e==='hook').length);
 for(const id of ['guides','shellguard','tethers'])assert.ok(effects(id).includes('standard'));
});
test('saved schools and acquired cards survive reload without reapplying the starting package',()=>{
 const values=storage();
 for(const s of STARTING_SCHOOLS){const r=createRun('SAVE',2,s.id);r.school[0].condition='killed';recruit(r,'sardine');saveRun(r);const loaded=loadRun();assert.equal(loaded.startingSchool,s.id);assert.deepEqual(loaded.school,r.school);}
 const old=createRun('OLD');delete old.startingSchool;saveRun(old);assert.deepEqual(loadRun().school,old.school);assert.equal(loadRun().startingSchool,undefined);
 values.set(SAVE_KEY,JSON.stringify({...old,startingSchool:'invalid'}));assert.equal(loadRun(),null);
});
test('disabled creatures make named schools unavailable while legacy roster fallback remains reef-only',()=>{
 storage();const all=STARTERS.map(c=>c.texture),enabled=all.filter(t=>t!=='minnow');saveEnabledTextures(enabled);
 for(const s of STARTING_SCHOOLS){assert.equal(schoolAvailable(s.id,enabled),false);assert.throws(()=>createRun('DISABLED',2,s.id),/unavailable/);}
 const limited=['anchovy','sardine','goby'];saveEnabledTextures(limited);
 const r=createRun('SMALL');assert.equal(r.school.length,8);assert.ok(r.school.every(c=>limited.includes(c.texture)));
 assert.equal(new Set(r.school.map(c=>c.id)).size,8);assert.equal(startingTextures([],undefined).length,0);
 assert.throws(()=>startingTextures(all,'invalid'),/unavailable/);
});
test('each school can deliver a holder to a reef using its intended tools',()=>{
 storage();
 const state=()=>({board:Array(25).fill(null),shocked:new Set(),terrain:{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}});
 for(const [id,actor,target,from,to] of [
  ['guides','minnow','shrimp',16,21],
  ['shellguard','frogfish','mantis-shrimp',12,10],
  ['tethers','christmas-tree-worm','shrimp',6,16],
 ]){
  const school=createRun('DELIVERY',2,id).school,board=state(),holder=school.find(c=>c.texture===target);
  board.board[from]=holder;const moved=resolvePlacement(board,to,school.find(c=>c.texture===actor),5);
  assert.equal(moved.board[11]?.id,holder.id,`${id} delivers onto B3`);
  if(id==='shellguard'){
   const attacker={...STARTERS.find(c=>c.texture==='sardine'),id:'enemy',owner:'rival',condition:'healthy'};
   const held=resolvePlacement({...moved,terrain:board.terrain},6,attacker,5);
   assert.equal(held.board[11]?.id,holder.id,'Mantis upper Shield retains the delivered position');
  }
 }
});
