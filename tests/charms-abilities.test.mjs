import test from 'node:test';
import assert from 'node:assert/strict';
import { ABILITIES, NEW_ABILITIES, hasAbility, grantAbility, canPlaceFish, scoreBoard } from '../src/game/abilities.ts';
import { CHARMS, CHARM_IDS, LEGACY_CHARM_IDS, charmCard, canCharmCard, canDrift, exchangeReserve } from '../src/game/data/tideCharms.ts';
import { resolvePlacement } from '../src/game/combat.ts';
import { STARTERS } from '../src/game/data/starterFish.ts';
import { createRun, saveRun, loadRun, SAVE_KEY, shopOffers } from '../src/game/run/state.ts';
import { generateShop } from '../src/game/run/shop.ts';
import { abilityPixels, cardDescription } from '../src/game/ui/cardVisuals.ts';

const fish = (id, ability, edges = [], owner = 'player') => ({ ...STARTERS[0], id, ability, edges, owner, condition: 'healthy' });
const edge = (effect = 'standard', direction = 'right') => ({ effect, direction });
const terrain = () => ({ rocks: new Set(), whirlpools: [0, 24], features: new Map() });
const state = (entries = {}) => ({ board: Object.assign(Array(25).fill(null), entries), shocked: new Set(), terrain: terrain() });

test('the expansion leaves creature assignments unchanged and provides distinct ability patterns', () => {
  assert.equal(CHARM_IDS.length, 12);
  assert.equal(NEW_ABILITIES.length, 8);
  assert.ok(STARTERS.every(card => !NEW_ABILITIES.includes(card.ability)));
  const signatures = NEW_ABILITIES.map(id => {
    assert.ok(ABILITIES[id].description.length);
    const pixels = abilityPixels(id);
    assert.ok(pixels.length > 0 && pixels.every(p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x < 64 && p.y >= 0 && p.y < 64));
    assert.ok(cardDescription(fish('example', id)).includes(ABILITIES[id].name));
    return JSON.stringify(pixels);
  });
  assert.equal(new Set(signatures).size, 8);
});

test('edge charms add attacks or retaliation without replacing existing edges or school data', () => {
  const original = fish('original', 'rally', [edge(), edge('weak', 'up')]);
  const snapshot = JSON.stringify(original);
  const spear = charmCard(original, 'spear-shell'), barbed = charmCard(original, 'barbed-wreath');
  assert.equal(spear.edges.filter(e => e.effect === 'standard').length, 3);
  assert.equal(barbed.edges.filter(e => e.effect === 'spines').length, 2);
  assert.equal(spear.edges.find(e => e.direction === 'up').effect, 'weak');
  assert.equal(charmCard(original, 'breaker-tooth').edges[0].effect, 'double');
  assert.equal(JSON.stringify(original), snapshot);
  assert.equal(canCharmCard(spear, 'spear-shell'), false);
  assert.equal(canCharmCard(fish('guard', undefined, [edge('weak')]), 'breaker-tooth'), false);
});

test('ability charms stack with original abilities without duplicating grants or mutating the school', () => {
  const original = fish('rallier', 'rally', [edge()]);
  let card = original;
  for (const [charm, ability] of [['anchor-stone', 'anchor'], ['reef-beacon', 'reefborn'], ['duelist-pearl', 'piercing']]) {
    assert.equal(canCharmCard(card, charm), true);
    card = charmCard(card, charm);
    assert.ok(hasAbility(card, ability));
    assert.equal(canCharmCard(card, charm), false);
    assert.ok(cardDescription(card).includes(ABILITIES[ability].name));
  }
  assert.equal(card.ability, 'rally');
  assert.equal(original.battleAbilities, undefined);
  assert.equal(card.battleAbilities.length, 3);
});

test('Dredger Net preserves all card identities and unchosen reserve order without resetting plays', () => {
  const old = fish('old'), reserve = ['a', 'b', 'c', 'd'].map(id => fish(id));
  const slot = { card: old, played: false, revealed: true };
  assert.equal(exchangeReserve(slot, reserve, 3), false);
  assert.equal(exchangeReserve(slot, reserve, 1), true);
  assert.equal(slot.card.id, 'b'); assert.equal(slot.revealed, false);
  assert.deepEqual(reserve.map(c => c.id), ['a', 'c', 'd', 'old']);
  assert.equal(new Set([slot.card, ...reserve].map(c => c.id)).size, 5);
  slot.played = true;
  assert.equal(exchangeReserve(slot, reserve, 0), false);
  assert.equal(exchangeReserve({ card: old, played: false }, [], 0), false);
});

test('Drift Shell supports reef repositioning but rejects wrapping, occupied tiles, hazards and anchors', () => {
  const input = state({ 6: fish('ally'), 7: fish('enemy', undefined, [], 'rival'), 9: fish('edge') });
  assert.equal(canDrift(input.board, 6, 11, input.terrain), true);
  assert.equal(canDrift(input.board, 6, 7, input.terrain), false);
  assert.equal(canDrift(input.board, 7, 12, input.terrain), false);
  assert.equal(canDrift(input.board, 9, 10, input.terrain), false);
  assert.equal(canDrift(input.board, 6, 12, input.terrain), false);
  input.terrain.rocks.add(11); assert.equal(canDrift(input.board, 6, 11, input.terrain), false);
  input.terrain.rocks.clear(); input.terrain.features.set(11, 'trench'); assert.equal(canDrift(input.board, 6, 11, input.terrain), false);
  input.terrain.features.clear(); input.board[6] = grantAbility(input.board[6], 'anchor'); assert.equal(canDrift(input.board, 6, 11, input.terrain), false);
  input.board[6] = fish('ally'); input.terrain.features.set(6, 'kelp'); assert.equal(canDrift(input.board, 6, 11, input.terrain), false);
});

test('Anchor prevents forced movement but permits predation and self-driven movement', () => {
  const target = fish('target', 'anchor', [], 'rival');
  for (const effect of ['standard', 'double', 'ram', 'wave', 'swap', 'follow-current']) {
    const result = resolvePlacement(state({ 7: target }), 6, fish('attacker', 'piercing', [edge(effect)]));
    assert.equal(result.board[7], target, effect);
  }
  assert.equal(resolvePlacement(state({ 8: target }), 6, fish('hooker', undefined, [edge('hook')])).board[8], target);
  assert.deepEqual(resolvePlacement(state({ 7: target }), 6, fish('predator', undefined, [edge('bigger-fish')])).killedIds, ['target']);
  const diver = fish('diver', 'anchor', [edge('dive')]);
  assert.equal(resolvePlacement(state({ 7: fish('obstacle') }), 6, diver).board[8], diver);
});

test('Reefborn changes legal placements without permitting occupied or hazardous tiles', () => {
  const input = state(), normal = fish('normal'), reefborn = fish('reef', 'reefborn');
  for (const reef of [2, 11, 18]) {
    assert.equal(canPlaceFish(input.board, reef, normal, input.terrain), false);
    assert.equal(canPlaceFish(input.board, reef, reefborn, input.terrain), true);
  }
  input.board[2] = normal; assert.equal(canPlaceFish(input.board, 2, reefborn, input.terrain), false);
  input.terrain.rocks.add(11); assert.equal(canPlaceFish(input.board, 11, reefborn, input.terrain), false);
  assert.equal(canPlaceFish(input.board, -1, reefborn, input.terrain), false);
});

test('Bulwark blocks incoming edges while shocked, but Piercing and terrain bypass it', () => {
  const guard = fish('guard', 'bulwark', [], 'rival'), input = state({ 7: guard });
  input.shocked.add('guard');
  assert.equal(resolvePlacement(input, 6, fish('attacker', undefined, [edge('double')])).board[7], guard);
  assert.equal(resolvePlacement(input, 6, fish('attacker', 'piercing', [edge('double')])).board[8], guard);
  input.terrain.features.set(6, 'vent');
  assert.equal(resolvePlacement(input, 6, fish('eruption')).board[8], guard);
});

test('Piercing bypasses Shields without bypassing rocks', () => {
  const guard = fish('guard', undefined, [edge('weak', 'left')], 'rival'), input = state({ 7: guard });
  assert.equal(resolvePlacement(input, 6, fish('piercer', 'piercing', [edge()])).board[8], guard);
  input.terrain.rocks.add(8);
  assert.equal(resolvePlacement(input, 6, fish('piercer', 'piercing', [edge()])).board[7], guard);
});

test('Escort adds only missing shields to adjacent allies without changing originals or enemies', () => {
  const ally = fish('ally', undefined, [edge()]), enemy = fish('enemy', undefined, [], 'rival'), diagonal = fish('diagonal');
  const input = state({ 7: ally, 11: enemy, 6: diagonal });
  const result = resolvePlacement(input, 12, fish('escort', 'escort'));
  assert.equal(result.board[7].edges.length, 4);
  assert.equal(result.board[7].edges[0].effect, 'standard');
  assert.equal(ally.edges.length, 1); assert.equal(result.board[11], enemy); assert.equal(result.board[6], diagonal);
});

test('Ambush shocks enemies before attacks, ignores edge shields, and spares allies', () => {
  const input = state({ 13: fish('guard', undefined, [edge('weak', 'left')], 'rival'), 7: fish('ally') });
  const result = resolvePlacement(input, 12, fish('ambusher', 'ambush', [edge()]));
  assert.deepEqual([...result.shocked], ['guard']);
  assert.equal(result.board[14].id, 'guard');
});

test('Wake resolves after attacks, ignores edge defense, spares allies and records trench kills', () => {
  const input = state({ 13: fish('enemy', undefined, [edge('weak', 'left')], 'rival'), 7: fish('ally'), 11: fish('anchored', 'anchor', [], 'rival') });
  input.terrain.features.set(14, 'trench');
  const result = resolvePlacement(input, 12, fish('wake', 'wake', [edge()]));
  assert.deepEqual(result.killedIds, ['enemy']); assert.deepEqual(result.pushedEnemyIds, ['enemy']);
  assert.equal(result.board[7].id, 'ally'); assert.equal(result.board[11].id, 'anchored');
  const dead = resolvePlacement(state({ 13: fish('spiny', undefined, [edge('spines', 'left')], 'rival'), 7: fish('untouched', undefined, [], 'rival') }), 12, fish('wake', 'wake', [edge()]));
  assert.equal(dead.board[7].id, 'untouched');
});

test('Sovereign scores two only while on a reef, for either owner', () => {
  const board = state({ 2: fish('king', 'sovereign'), 11: fish('rival', 'sovereign', [], 'rival'), 18: fish('normal'), 12: fish('off-reef', 'sovereign') }).board;
  assert.deepEqual(scoreBoard(board), { player: 3, rival: 2 });
});

test('legacy charm stock stays fixed and new voyages persist expanded stock across reload', () => {
  const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const run = createRun('stock-save'), node = run.maps[0].nodes.find(n => n.type === 'shop');
  run.current = run.maps[0].nodes.find(n => n.next.includes(node.id)).id; run.pending = node.id;
  const stock = shopOffers(run); run.charms = [...CHARM_IDS];
  saveRun(run); const loaded = loadRun();
  assert.equal(loaded.charmPoolVersion, 2); assert.deepEqual(shopOffers(loaded), stock); assert.deepEqual(loaded.charms, CHARM_IDS);
  delete run.charmPoolVersion; saveRun(run); const legacy = loadRun();
  assert.ok(shopOffers(legacy).filter(o => o.kind === 'charm').every(o => LEGACY_CHARM_IDS.includes(o.charm)));
  const seen = new Set();
  for (let i = 0; i < 1000; i++) for (const offer of generateShop(String(i), 'shop', 0, ['minnow', 'anchovy'])) if (offer.kind === 'charm') seen.add(offer.charm);
  assert.deepEqual([...seen].sort(), [...CHARM_IDS].sort());
  run.charmPoolVersion = 3; saveRun(run); assert.equal(loadRun(), null);
  values.delete(SAVE_KEY);
});
