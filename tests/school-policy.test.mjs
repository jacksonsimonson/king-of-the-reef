import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,resolveVisit} from '../src/game/run/state.ts';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {chooseRecruit,recruitGain,trimCandidate,schoolFit} from '../scripts/balance/school-policy.mjs';
import {voyage} from '../scripts/balance/voyages.mjs';

const copy=(texture,id)=>({...STARTERS.find(c=>c.texture===texture),id,owner:'player',condition:'healthy'});
test('recruiting fills an absent setup direction instead of rewarding another identical setter',()=>{
 const run=createRun('POLICY');run.school=Array.from({length:8},(_,i)=>copy('minnow',String(i)));
 assert.equal(chooseRecruit(run,['minnow','anchovy']),'anchovy');
 assert.ok(recruitGain(run,'anchovy')>recruitGain(run,'minnow'));
 assert.equal(chooseRecruit(run,['anchovy','minnow']),'anchovy');
 assert.equal(schoolFit(run.school),schoolFit([...run.school,...run.school]));
});
test('trimming preserves eight healthy copies and uses one real Release settlement',()=>{
 const run=createRun('TRIM');run.school=Array.from({length:7},(_,i)=>copy('minnow',String(i)));
 run.school.push(copy('anchovy','right'),copy('goby','left'));
 const candidate=trimCandidate(run);assert.ok(candidate);assert.equal(candidate.texture,'minnow');
 const node=run.maps[0].nodes.find(n=>n.column===1);node.type='release';run.pending=node.id;
 const before=schoolFit(run.school);assert.ok(resolveVisit(run,candidate.id));
 assert.equal(run.school.length,8);assert.ok(schoolFit(run.school)>before);assert.equal(trimCandidate(run),null);
 run.school.push({...copy('minnow','injured'),condition:'killed'});assert.equal(trimCandidate(run),null);
 assert.equal(run.pending,null);assert.ok(run.visited.includes(node.id));
});
test('each school policy is deterministic, preserves ledgers and records legal choices',()=>{
 for(const schoolPolicy of ['baseline','recruit','trim','both']){
  const args={seed:'ROSTER-VOYAGE-v6-0',schoolPolicy,maxBossAttempts:2};const r=voyage(args);
  assert.deepEqual(r,voyage(args));
  const vs=r.visits.filter(v=>v.after);
  assert.equal(8+vs.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
  for(const v of vs){
   if(v.trimmed){assert.equal(v.type,'release');assert.equal(v.removed,1);assert.ok(v.after.healthy>=8);}
   if(v.fishingChoice)assert.ok(v.fishingChoice.offered.includes(v.fishingChoice.selected));
   if(v.purchase)assert.ok(v.stock.some(o=>o.affordable&&o.kind===v.purchase.kind&&o.price===v.purchase.price));
  }
 }
});
