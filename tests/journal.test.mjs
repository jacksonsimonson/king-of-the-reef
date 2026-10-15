import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTERS } from '../src/game/data/starterFish.ts';
import { createRun } from '../src/game/run/state.ts';
import { mergeDiscoveries, recordDiscoveries, JOURNAL_KEY, creatureRole, creatureRegions, filterCreatures } from '../src/game/journal.ts';

const all = { search: '', region: '', role: '', health: '', rarity: '' };
test('discovery migration deduplicates species and rejects unknown or malformed records', () => {
  assert.deepEqual(mergeDiscoveries(['goby', 'goby', null, 'fake'], ['minnow']), ['minnow', 'goby']);
  assert.deepEqual(mergeDiscoveries({ bad: true }, ['goby']), ['goby']);
  const run = createRun('JOURNAL');
  assert.equal(mergeDiscoveries(null, run.school.map(f => f.texture)).length, 8);
});
test('discoveries survive release/new schools, corrupt storage and storage failures', () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const data = new Map();
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) } });
    recordDiscoveries(['goby']); recordDiscoveries(['minnow']);
    assert.deepEqual(JSON.parse(data.get(JOURNAL_KEY)), ['minnow', 'goby']);
    data.set(JOURNAL_KEY, '{'); assert.equal(recordDiscoveries().saved, true);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw Error('blocked'); } });
    const failed = recordDiscoveries(['electric-eel']); assert.equal(failed.saved, false); assert.ok(failed.textures.includes('electric-eel'));
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) } });
    assert.ok(recordDiscoveries().textures.includes('electric-eel'));
  } finally { if (old) Object.defineProperty(globalThis, 'localStorage', old); else delete globalThis.localStorage; }
});
test('inspection filters actual saved copies without changing school order or definitions', () => {
  const run = createRun('INSPECT'), original = run.school[0];
  run.school.push({ ...original, id: 'duplicate', condition: 'killed', edges: [{ direction: 'up', effect: 'shock' }] });
  const before = JSON.stringify(run);
  const matches = filterCreatures(run.school, { ...all, search: original.name.toUpperCase(), health: 'killed', role: 'Disruptor', region: '0' });
  assert.deepEqual(matches.map(f => f.id), ['duplicate']);
  assert.equal(creatureRole(original), 'Positioner');
  assert.equal(JSON.stringify(run), before);
  assert.equal(filterCreatures(run.school, { ...all, region: '2' }).length, 0);
  assert.equal(filterCreatures(run.school, { ...all, rarity: 'Extremely Rare' }).length, 0);
});
test('all catalog entries have a role, and familiar mechanics have useful labels', () => {
  for (const fish of STARTERS) assert.ok(creatureRole(fish));
  assert.equal(creatureRole({ edges: [{ effect: 'spines' }] }), 'Retaliator');
  assert.equal(creatureRole({ edges: [{ effect: 'weak' }] }), 'Defender');
  assert.equal(creatureRole({ edges: [], ability: 'reefborn' }), 'Scorer');
  assert.deepEqual(creatureRegions('hypno-squid'), [2]);
});
