import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTERS } from '../src/game/data/starterFish.ts';
import { enabledTextures, saveEnabledTextures, toggleFish, createEnabledDeck, ROSTER_KEY } from '../src/game/data/roster.ts';
import { REGIONS } from '../src/game/run/maps.ts';
import { createRun, offers } from '../src/game/run/state.ts';

function storage() {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  return values;
}

test('roster defaults to every fish and filters both sides of Quick Match', () => {
  storage();
  assert.deepEqual(enabledTextures(), STARTERS.map(f => f.texture));
  saveEnabledTextures(['minnow', 'anchovy', 'sardine', 'goby', 'octopus']);
  assert.deepEqual(enabledTextures(), ['minnow', 'anchovy', 'sardine', 'goby', 'octopus']);
  assert.equal(createEnabledDeck('player').length, 10);
  assert.ok(createEnabledDeck('rival').every(card => enabledTextures().includes(card.texture)));
});

test('toggle protects five battle choices and three distinct choices in every region', () => {
  storage(); const pools = REGIONS.map(r => r.pool);
  for (const texture of STARTERS.map(f => f.texture).slice(5)) saveEnabledTextures(enabledTextures().filter(t => t !== texture));
  const blocked = toggleFish(enabledTextures()[0], pools);
  assert.equal(blocked.changed, false); assert.match(blocked.reason, /five fish/);
  storage();
  const bermuda = REGIONS[2].pool;
  for (const texture of bermuda.slice(3)) assert.equal(toggleFish(texture, pools).changed, true);
  const regionBlocked = toggleFish(bermuda[0], pools);
  assert.equal(regionBlocked.changed, false); assert.match(regionBlocked.reason, /region/);
  assert.equal(toggleFish(bermuda.at(-1), pools).enabled, true);
});

test('new voyages and encounter offers honor roster without deleting established schools', () => {
  storage();
  const allowed = STARTERS.map(f => f.texture).filter(t => t !== 'minnow' && t !== 'boxfish');
  saveEnabledTextures(allowed);
  const run = createRun('ROSTER');
  assert.deepEqual(run.roster, allowed);
  assert.ok(run.school.every(card => allowed.includes(card.texture)));
  const originalOffers = offers(run);
  assert.ok(originalOffers.every(texture => allowed.includes(texture)));
  const owned = run.school[0];
  saveEnabledTextures(allowed.filter(texture => texture !== owned.texture));
  assert.ok(run.school.some(card => card.id === owned.id), 'existing voyage ownership remains intact');
  assert.deepEqual(run.roster, allowed, 'active voyage roster is a snapshot');
  assert.deepEqual(offers(run), originalOffers, 'active voyage generation does not change');
  assert.ok(!createEnabledDeck('player').some(card => card.texture === owned.texture));
  assert.ok(!createRun('NEXT').roster.includes(owned.texture), 'next voyage picks up the toggle');
  globalThis.localStorage.setItem(ROSTER_KEY, '{bad');
  assert.equal(enabledTextures().length, STARTERS.length);
});

test('older saves migrate to the original full voyage roster', async () => {
  const values = storage(), run = createRun('OLD');
  delete run.roster;
  values.set('king-of-the-reef-voyage-v1', JSON.stringify(run));
  const { loadRun } = await import('../src/game/run/state.ts');
  assert.deepEqual(loadRun().roster, STARTERS.map(f => f.texture));
});
