import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,activeNode,reachable,enterNode,resolveVisit,canCampRelease,campMinimum,offers,beginFishing,finishFishing,battleResult,saveRun,loadRun} from '../src/game/run/state.ts';
import {FishingModel,ZONE_WIDTH,validSnapshot} from '../src/game/fishing/model.ts';

const camp=()=>createRun('FISH-CAMP',2,undefined,true);
function storage(){let value;globalThis.localStorage={getItem:()=>value??null,setItem:(_key,v)=>{value=v;}};}
test('camp release floor, phase lock, two attempts and no revisits survive saving',()=>{
 storage();let run=camp();assert.equal(activeNode(run).type,'camp');assert.deepEqual(reachable(run),[]);
 assert.equal(beginFishing(run,offers(run)[0]),false);
 for(let i=0;i<2;i++)assert.ok(resolveVisit(run,run.school[0].id));
 assert.equal(run.school.length,6);assert.ok(run.school.every(c=>!canCampRelease(run,c.id)));
 assert.ok(saveRun(run));run=loadRun();assert.ok(run);assert.equal(run.camp.phase,'release');
 assert.ok(resolveVisit(run,'fish'));assert.equal(resolveVisit(run,run.school[0].id),false);
 const id=run.pending;
 for(const status of ['escaped','caught']){
  assert.ok(beginFishing(run,offers(run)[0]));assert.equal(resolveVisit(run,'leave'),false);
  assert.ok(saveRun(run));run=loadRun();assert.ok(run?.fishing);
  const outcome={...run.fishing.snapshot,status,progress:status==='caught'?1:0};
  assert.ok(finishFishing(run,outcome));assert.equal(finishFishing(run,outcome),false);
  assert.ok(saveRun(run));run=loadRun();assert.ok(run);
 }
 assert.equal(run.school.length,7);assert.equal(run.camp.attempts,2);assert.equal(beginFishing(run,offers(run)[0]),false);
 assert.ok(resolveVisit(run,'leave'));assert.equal(enterNode(run,id),false);assert.equal(run.camp,undefined);
 assert.equal(run.visited.filter(v=>v===id).length,1);assert.ok(reachable(run).length);
});
test('regional passage opens each camp once and legacy voyages retain their original stops',()=>{
 const run=camp();
 for(let region=0;region<3;region++){
  assert.equal(campMinimum(run),6+region);assert.equal(run.camp.attempts,0);
  assert.ok(resolveVisit(run,'leave'));const boss=run.maps[region].nodes.at(-1);
  run.pending=boss.id;battleResult(run,2,0);
 }
 assert.equal(run.status,'won');assert.equal(run.camp,undefined);
 const old=createRun('old');assert.equal(old.campVersion,undefined);assert.equal(activeNode(old).type,'start');
 assert.ok(enterNode(old,reachable(old)[0]));assert.equal(activeNode(old).type,'fishing');
});
test('invalid camp phases, budgets and unfinished fishing cannot resume',()=>{
 storage();const run=camp();
 for(const patch of [{phase:'unknown'},{attempts:-1},{attempts:3},{attempts:.5},{attempts:1},{nodeId:'wrong'}]){
  const bad=structuredClone(run);Object.assign(bad.camp,patch);saveRun(bad);assert.equal(loadRun(),null);
 }
 const missing=structuredClone(run);delete missing.camp;saveRun(missing);assert.equal(loadRun(),null);
});
test('weighted fishing coasts, reverses gradually, accelerates left and rests at the boundaries',()=>{
 const m=new FishingModel('gradual','shoreline',1);
 for(let i=0;i<12;i++)m.step(false,true);
 const restored=FishingModel.restore(m.snapshot());
 const velocity=m.zoneVelocity,position=m.zone;m.step(false,false);
 restored.step(false,false);assert.deepEqual(restored.snapshot(),m.snapshot());assert.ok(restored.zoneVelocity>0);
 assert.ok(m.zone>position&&m.zoneVelocity>0&&m.zoneVelocity<velocity);
 for(let i=0;i<30;i++)m.step(false,false);assert.ok(m.zoneVelocity<0);
 const left=m.zoneVelocity;m.step(false,false);assert.ok(m.zoneVelocity<left);
 const oldVelocity=m.zoneVelocity;m.step(false,true);assert.ok(m.zoneVelocity>oldVelocity&&m.zoneVelocity<0);
 for(let i=0;i<180;i++){m.progress=.5;m.step(true,false);}assert.equal(m.zone,ZONE_WIDTH/2);assert.equal(m.zoneVelocity,0);
 for(let i=0;i<180;i++){m.progress=.5;m.step(false,true);}assert.equal(m.zone,1-ZONE_WIDTH/2);assert.equal(m.zoneVelocity,0);
 const saved=m.snapshot();assert.ok(validSnapshot(saved));assert.equal(validSnapshot({...saved,zoneVelocity:Infinity}),false);
 assert.equal(validSnapshot({...saved,zoneVelocity:2}),false);assert.equal(validSnapshot({...saved,controlVersion:3}),false);
});

test('camp release cannot spend the healthy reserve even when injured cards remain',()=>{
 const run=camp();run.school[0].condition='killed';run.school[1].condition='killed';
 assert.ok(canCampRelease(run,run.school[0].id));assert.equal(canCampRelease(run,run.school[2].id),false);
 assert.ok(resolveVisit(run,run.school[0].id));assert.ok(resolveVisit(run,run.school[0].id));
 assert.equal(run.school.length,6);assert.equal(canCampRelease(run,run.school[0].id),false);
});
