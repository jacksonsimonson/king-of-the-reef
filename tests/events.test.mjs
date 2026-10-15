import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, resolveVisit, offers, saveRun, loadRun } from '../src/game/run/state.ts';
import { voyageEvent, eventChoiceAvailable } from '../src/game/run/events.ts';
function fixture(kind, region=0) {
  for(let i=0;i<1000;i++) {
    const run=createRun('event-'+i); run.region=region;
    const node=run.maps[region].nodes.find(n=>n.type==='event'); if(!node) continue;
    run.current=run.maps[region].nodes.find(n=>n.next.includes(node.id)).id; run.visited.push(run.current); run.pending=node.id;
    if(voyageEvent(run,'Fish').choices.some(c=>c.id===kind)) return run;
  }
  throw Error('Missing event');
}
test('all regional events are deterministic and have a useful free choice at minimum resources',()=>{
  const titles=new Set();
  for(let region=0;region<3;region++) for(const kind of ['rescue','dive','heal','trade']) {
    const run=fixture(kind,region); run.shells=0;run.resolve=1;
    const event=voyageEvent(run,'Fish');titles.add(event.title);
    assert.deepEqual(voyageEvent(structuredClone(run),'Fish'),event);
    assert.ok(event.choices.some(c=>eventChoiceAvailable(run,c)));
    const choice=event.choices.find(c=>eventChoiceAvailable(run,c));
    assert.ok(resolveVisit(run,choice.id));const after=structuredClone(run);
    assert.equal(resolveVisit(run,choice.id),false);assert.deepEqual(run,after);
  }
  assert.equal(titles.size,12);
});
test('risk and purchases reject insufficient resources without mutation',()=>{
  for(const [kind,choice] of [['dive','dive'],['trade','buy']]) {
    const run=fixture(kind);run.resolve=1;run.shells=0;const before=structuredClone(run);
    assert.equal(resolveVisit(run,choice),false);assert.deepEqual(run,before);
  }
  const run=fixture('dive');const shells=run.shells;assert.ok(resolveVisit(run,'dive'));assert.equal(run.resolve,2);assert.equal(run.shells,shells+24);
});
test('trades replace exactly the selected fish and preserve a viable school',()=>{
  const run=fixture('trade');run.school=run.school.slice(0,1);const old=run.school[0].id,texture=offers(run)[0],shells=run.shells;
  for(const selection of [[],['missing'],[old,old]]) { const before=structuredClone(run);assert.equal(resolveVisit(run,'trade',selection),false);assert.deepEqual(run,before); }
  assert.ok(resolveVisit(run,'trade',[old]));assert.equal(run.school.length,1);assert.notEqual(run.school[0].id,old);assert.equal(run.school[0].texture,texture);assert.equal(run.school[0].condition,'healthy');assert.equal(run.shells,shells+6);
});
test('treatment restores only the chosen killed card and charges once',()=>{
  const run=fixture('heal');run.school[0].condition=run.school[1].condition='killed';
  const shells=run.shells;
  assert.equal(resolveVisit(run,'heal',[run.school[2].id]),false);
  assert.ok(resolveVisit(run,'heal',[run.school[1].id]));assert.equal(run.school[0].condition,'killed');assert.equal(run.school[1].condition,'healthy');assert.equal(run.shells,shells-8);
});
test('events persist their offers across saves and old saves retain original rescue/salvage',()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const run=fixture('trade');saveRun(run);const loaded=loadRun();assert.ok(loaded);assert.deepEqual(voyageEvent(loaded,'Fish'),voyageEvent(run,'Fish'));assert.deepEqual(offers(loaded),offers(run));
  delete run.eventVersion;saveRun(run);const old=loadRun();const count=old.school.length;assert.ok(resolveVisit(old,'rescue'));assert.equal(old.school.length,count+1);
  const legacy=fixture('heal');delete legacy.eventVersion;legacy.resolve=1;const shells=legacy.shells;assert.ok(resolveVisit(legacy,'salvage'));assert.equal(legacy.resolve,1);assert.equal(legacy.shells,shells+14);
});
