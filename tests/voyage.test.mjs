import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, REGIONS } from '../src/game/run/maps.ts';
import { createRun, enterNode, reachable, resolveVisit, offers, activeNode, battleResult, saveRun, loadRun, SAVE_KEY } from '../src/game/run/state.ts';

test('1,000 seeds per region: complete, noncrossing routes and guaranteed encounters', () => {
  for (let seed = 0; seed < 1000; seed++) for (let region = 0; region < 3; region++) {
    const map = generateMap(String(seed), region);
    const lookup = new Map(map.nodes.map(n => [n.id, n]));
    const reached = new Set([map.nodes[0].id]);
    for (const n of map.nodes) {
      assert.ok(reached.has(n.id), `orphan ${n.id}`);
      assert.equal(n.next.length > 0, n.type !== 'boss');
      assert.equal(new Set(n.next).size, n.next.length);
      for (const id of n.next) { assert.equal(lookup.get(id).column, n.column + 1); reached.add(id); }
      const forced = { 0: 'start', 1: 'fishing', 2: 'battle', 6: 'shop', 11: 'hydration', 12: 'boss' };
      if (forced[n.column]) assert.equal(n.type, forced[n.column]);
    }
    for (const a of map.nodes) for (const b of map.nodes) {
      if (a.column !== b.column || a.lane >= b.lane) continue;
      for (const x of a.next) for (const y of b.next) assert.ok(lookup.get(x).lane <= lookup.get(y).lane);
    }
  }
});
test('seeds reproduce maps and different seeds produce different routes', () => {
  assert.deepEqual(createRun('REEF').maps, createRun('REEF').maps);
  assert.notDeepEqual(createRun('REEF').maps, createRun('ABYSS').maps);
  REGIONS.forEach(region => assert.equal(Object.values(region.weights).reduce((a, b) => a + b), 100));
});
test('weighted random spaces follow configured rates across 500 maps', () => {
  REGIONS.forEach((region, i) => {
    const counts = Object.fromEntries(Object.keys(region.weights).map(key => [key, 0]));
    let total = 0;
    for (let seed = 0; seed < 500; seed++) for (const n of generateMap(String(seed), i).nodes) {
      if ([3,4,5,7,8,9,10].includes(n.column)) { counts[n.type]++; total++; }
    }
    for (const [type, rate] of Object.entries(region.weights)) assert.ok(Math.abs(counts[type] / total * 100 - rate) < 2);
  });
});
test('illegal movement, double entry and duplicate rewards are rejected', () => {
  const run = createRun('movement');
  assert.equal(enterNode(run, run.maps[0].nodes.at(-1).id), false);
  const id = reachable(run)[0];
  assert.equal(enterNode(run, id), true);
  assert.equal(enterNode(run, id), false);
  assert.deepEqual(reachable(run), []);
  assert.equal(resolveVisit(run, 'not-a-fish'), false);
  assert.equal(resolveVisit(run, offers(run)[0]), true);
  assert.equal(run.school.length, 9);
  assert.equal(resolveVisit(run, 'leave'), false);
  assert.equal(enterNode(run, id), false);
});
function advance(run) {
  assert.ok(enterNode(run, reachable(run)[0]));
  const node = activeNode(run);
  if (node.type === 'battle' || node.type === 'boss') battleResult(run, 2, 1);
  else resolveVisit(run, node.type === 'event' ? 'rescue' : node.type === 'hydration' ? 'rest' : 'leave');
}
test('all three regions can be completed and final Colossal wins the run', () => {
  const run = createRun('complete');
  for (let step = 0; step < 36; step++) advance(run);
  assert.equal(run.status, 'won'); assert.equal(run.region, 2);
  assert.deepEqual(reachable(run), []);
});
test('shop transaction is atomic and insufficient shells cannot purchase', () => {
  const run = createRun('shop');
  for (let i = 0; i < 5; i++) advance(run);
  enterNode(run, reachable(run)[0]); assert.equal(activeNode(run).type, 'shop');
  run.shells = 17;
  assert.equal(resolveVisit(run, offers(run)[0]), false);
  assert.equal(run.shells, 17);
  run.shells = 18; const before = run.school.length;
  assert.equal(resolveVisit(run, offers(run)[0]), true);
  assert.equal(run.school.length, before + 1); assert.equal(run.shells, 0);
});
test('hydration restores knocked-out creatures and caps resolve at three', () => {
  const run = createRun('rest');
  for (let i = 0; i < 10; i++) advance(run);
  enterNode(run, reachable(run)[0]); assert.equal(activeNode(run).type, 'hydration');
  run.school[0].condition = 'knocked-out'; run.resolve = 2;
  resolveVisit(run, 'rest');
  assert.equal(run.resolve, 3); assert.ok(run.school.every(f => f.condition === 'healthy'));
});
test('Colossal ties and losses do not bypass the Colossal; exhaustion ends a run', () => {
  const run = createRun('guardian');
  for (let i = 0; i < 11; i++) advance(run);
  enterNode(run, reachable(run)[0]); assert.equal(activeNode(run).type, 'boss');
  const id = run.pending;
  battleResult(run, 1, 1); assert.equal(run.pending, id); assert.equal(run.region, 0);
  battleResult(run, 0, 1); assert.equal(run.pending, id); assert.equal(run.resolve, 2);
  battleResult(run, 0, 1); battleResult(run, 0, 1);
  assert.equal(run.status, 'lost'); assert.deepEqual(reachable(run), []);
});
test('save/load preserves pending offers and rejects corrupt storage', () => {
  const store = new Map();
  globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  const run = createRun('save'); enterNode(run, reachable(run)[0]);
  assert.ok(saveRun(run)); assert.deepEqual(loadRun(), run); assert.deepEqual(offers(loadRun()), offers(run));
  store.set(SAVE_KEY, '{broken'); assert.equal(loadRun(), null);
  store.set(SAVE_KEY, JSON.stringify({ ...run, current: 'made-up' })); assert.equal(loadRun(), null);
  globalThis.localStorage.setItem = () => { throw Error('full'); };
  assert.equal(saveRun(run), false);
});
