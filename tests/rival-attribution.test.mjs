import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,rivalDeckFor} from '../src/game/run/state.ts';
import {attributionSchool} from '../scripts/balance/attribution-schools.mjs';

test('diagnostic school controls preserve live decks and never recruit injured copies',()=>{
 const run=createRun('attribution');run.region=1;run.pending=run.maps[1].nodes.find(n=>n.type==='battle').id;
 const before=structuredClone(run);assert.deepEqual(attributionSchool(run,'weighted'),rivalDeckFor(run));
 const uniform=attributionSchool(run,'uniform');assert.equal(new Set(uniform.map(c=>c.texture)).size,10);
 assert.deepEqual(uniform,attributionSchool(run,'uniform'));
 run.school=run.school.slice(0,2);run.school[0].condition='killed';
 const carried=attributionSchool(run,'carried');assert.equal(carried.length,10);assert.equal(new Set(carried.map(c=>c.id)).size,10);
 assert.ok(carried.every(c=>c.texture===run.school[1].texture&&c.condition==='healthy'&&c.owner==='rival'));
 carried[0].edges.length=0;assert.ok(run.school[1].edges.length>0);
 assert.deepEqual(before.maps,run.maps);
});
