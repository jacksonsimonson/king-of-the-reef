import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTERS, LEGACY_STARTERS } from '../src/game/data/starterFish.ts';
import { REEF_ART_CARDS } from '../src/game/data/reefArtCards.ts';
import { REEF_POOL, REEF_GROUPS, reefRarity, V2_REEF_GROUPS } from '../src/game/data/reefPool.ts';
import { REEF_DESIGNS } from '../src/game/data/reefDesigns.ts';
import { createRun, recruit, offers, saveRun, loadRun, rivalDeckFor, shopOffers } from '../src/game/run/state.ts';
import { movementFor } from '../src/game/fishing/model.ts';
import { resolvePlacement } from '../src/game/combat.ts';

const directions = ['up', 'right', 'down', 'left'];
const layout = card => directions.map(d => card.edges.find(e => e.direction === d)?.effect ?? 'blank').join('/');
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }

test('all 81 cards have unique directional layouts, independent of full-card abilities', () => {
  assert.equal(STARTERS.length, 81);
  const seen = new Map();
  for (const card of STARTERS) {
    assert.equal(new Set(card.edges.map(e => e.direction)).size, card.edges.length, card.name);
    assert.ok(!seen.has(layout(card)), `${card.name} duplicates ${seen.get(layout(card))}`);
    seen.set(layout(card), card.name);
  }
});

test('Reef special edges stay within the approved limits and named gimmicks', () => {
  assert.equal(REEF_POOL.length, 76);
  assert.equal(new Set(REEF_POOL).size, 76);
  const gimmicks = { boxfish: ['weak', 4], 'sea-urchin': ['spines', 4], 'giant-clam': ['weak', 3] };
  const normal = new Set(['minnow','anchovy','sardine','goby','blenny','flounder','clownfish','cleaner-wrasse','blue-tang','yellow-tang','butterflyfish','moorish-idol','queen-angelfish','coral-grouper','parrotfish']);
  for (const id of REEF_POOL) {
    const card = STARTERS.find(c => c.texture === id);
    assert.ok(card?.edges.length, id);
    assert.ok(reefRarity(id));
    assert.ok(movementFor(id));
    assert.ok(card.edges.every(e => !['swap', 'wave'].includes(e.effect)), id);
    const specials = card.edges.filter(e => e.effect !== 'standard');
    if (gimmicks[id]) {
      const [effect, count] = gimmicks[id];
      assert.equal(card.edges.length, count); assert.ok(card.edges.every(e => e.effect === effect));
    } else {
      assert.ok(specials.length <= 2, id);
      if (specials.length) assert.ok(card.edges.length <= 3, `${id} needs a blank side`);
    }
    assert.equal(specials.length === 0, normal.has(id), id);
  }
  assert.deepEqual(STARTERS.filter(c => c.ability).map(c => [c.texture,c.ability]), LEGACY_STARTERS.filter(c => c.ability).map(c => [c.texture,c.ability]));
  assert.deepEqual(REEF_GROUPS.map(g => g.weight), [47,37,15,1]);
});

test('all former previews recruit, resolve on a board, and persist as playable cards', () => {
  storage(); const run = createRun('EXPANDED-REEF');
  assert.equal(run.reefPoolVersion, 3);
  for (const card of REEF_ART_CARDS) {
    assert.ok(run.roster.includes(card.texture));
    assert.deepEqual(card.edges, REEF_DESIGNS[card.texture].edges);
    recruit(run, card.texture);
    const fish = run.school.at(-1);
    for (const index of [0,4,12,20,24]) {
      const board = Array(25).fill(null);
      for (const at of [7,11,13,17]) if (at !== index) board[at] = { ...fish, id: `target-${at}`, owner:'rival', edges:[] };
      const result = resolvePlacement({ board, shocked:new Set() }, index, fish);
      assert.equal(result.board.length, 25);
      assert.equal(new Set(result.board.filter(Boolean).map(c => c.id)).size, result.board.filter(Boolean).length);
    }
  }
  assert.ok(saveRun(run)); assert.deepEqual(loadRun().school, run.school);
});

test('version 2 voyages retain catches, shop prices, and old recruit/rival edges', () => {
  storage(); const run = createRun('V2-EXPANSION');
  run.reefPoolVersion = 2; run.roster = LEGACY_STARTERS.map(c => c.texture);
  run.pending = run.maps[0].nodes.find(n => n.type === 'shop').id;
  run.current = run.maps[0].nodes.find(n => n.next.includes(run.pending)).id;
  const catches = offers(run), stock = shopOffers(run);
  assert.ok(catches.every(id => V2_REEF_GROUPS.some(g => g.cards.includes(id))));
  recruit(run, 'electric-eel');
  assert.equal(run.school.at(-1).edges.filter(e => e.effect === 'shock').length, 4);
  assert.ok(saveRun(run)); const loaded = loadRun(); assert.ok(loaded);
  assert.deepEqual(offers(loaded), catches); assert.deepEqual(shopOffers(loaded), stock);
  for (const card of rivalDeckFor(loaded)) assert.deepEqual(card.edges, LEGACY_STARTERS.find(c => c.texture === card.texture).edges);
});
