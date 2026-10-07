import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTERS, LEGACY_STARTERS, ORIGINAL_FISH_TEXTURES } from '../src/game/data/starterFish.ts';
import { ADVANCED_REEF, V2_REEF_GROUPS as REEF_GROUPS, drawReefCard, reefRarity } from '../src/game/data/reefPool.ts';
import { enabledTextures, saveEnabledTextures, ROSTER_KEY } from '../src/game/data/roster.ts';
import { createRun, offers, saveRun, loadRun, enterNode, reachable, rivalDeckFor, shopOffers, buyOffer } from '../src/game/run/state.ts';
import { random } from '../src/game/run/maps.ts';
import { resolvePlacement } from '../src/game/combat.ts';
import { triggersRally, resolveRally, rivalRallyChoice } from '../src/game/rally.ts';
import { refillSlot } from '../src/game/data/tideCharms.ts';
import { abilityPixels, cardDescription } from '../src/game/ui/cardVisuals.ts';

const creature = (texture, owner = 'player') => ({ ...STARTERS.find(f => f.texture === texture), id: owner + texture, owner, condition: 'healthy' });
const target = (id, owner = 'rival', edges = []) => ({ ...creature('minnow', owner), id, edges });
const state = (...entries) => ({ board: Object.assign(Array(25).fill(null), Object.fromEntries(entries)), shocked: new Set() });
const grouper = () => creature('coral-grouper');
function storage() { const values = new Map(); globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }

test('advanced pool preserves existing rare identities and first-draw weights', () => {
  assert.equal(ADVANCED_REEF.length, 8);
  for (const id of ADVANCED_REEF) assert.equal(reefRarity(id, 2), 'Rare');
  assert.equal(REEF_GROUPS.reduce((sum, group) => sum + group.weight, 0), 100);
  const rare = REEF_GROUPS.find(group => group.cards.includes('electric-eel'));
  assert.equal(rare.weight / rare.cards.length, 1.75);
  assert.equal(REEF_GROUPS.find(group => group.cards.includes('moray-eel')).weight, 1);
  assert.equal(REEF_GROUPS.find(group => group.cards.includes('parrotfish')).weight, 8);
  const reef = LEGACY_STARTERS.filter(card => REEF_GROUPS.some(group => group.cards.includes(card.texture)));
  assert.deepEqual(reef.filter(card => card.edges.some(e => e.effect === 'bigger-fish')).map(c => c.texture), ['moray-eel']);
  assert.deepEqual(reef.filter(card => card.edges.some(e => e.effect === 'double' && e.direction === 'right')).map(c => c.texture), ['needlefish']);
  assert.ok(reef.every(card => card.edges.filter(e => e.effect === 'bigger-fish').length <= 1));
  const counts = Object.fromEntries(ADVANCED_REEF.map(id => [id, 0])), rng = random('ADVANCED-RATES');
  for (let i = 0; i < 100000; i++) { const id = drawReefCard(rng, [], 2); if (id in counts) counts[id]++; }
  for (const count of Object.values(counts)) assert.ok(count > 850 && count < 1150);
});

test('Rally records successful enemy pushes, including off-board and retaliating targets', () => {
  const reserve = [creature('parrotfish')];
  for (const [index, enemyIndex] of [[12, 13], [13, 14]]) {
    const result = resolvePlacement(state([enemyIndex, target('enemy')]), index, grouper());
    assert.deepEqual(result.pushedEnemyIds, ['enemy']);
    assert.ok(triggersRally(grouper(), result.pushedEnemyIds, reserve));
  }
  const source = state([13, creature('sea-urchin', 'rival')]);
  const result = resolvePlacement(source, 12, grouper());
  assert.ok(result.killedIds.includes(grouper().id));
  assert.ok(triggersRally(grouper(), result.pushedEnemyIds, reserve), 'card ability still resolves after retaliation');
  assert.equal(source.board[12], null, 'simulation did not place in input board');
});

test('Rally does not trigger from blocked, friendly, absent or disabled pushes', () => {
  const reserve = [creature('parrotfish')];
  const cases = [state(), state([13, target('friend', 'player')]), state([13, target('enemy', 'rival', [{ direction: 'left', effect: 'weak' }])]), state([13, target('enemy')], [14, target('wall')])];
  const shocked = state([13, target('enemy')]); shocked.shocked.add(grouper().id); cases.push(shocked);
  for (const before of cases) {
    const result = resolvePlacement(before, 12, grouper());
    assert.deepEqual(result.pushedEnemyIds, []);
    assert.equal(triggersRally(grouper(), result.pushedEnemyIds, reserve), false);
  }
  assert.equal(triggersRally(grouper(), ['enemy'], []), false);
  assert.equal(triggersRally(creature('lionfish'), ['enemy'], reserve), false);
});

test('several pushes create one Rally choice and bottom changes the immediate draw', () => {
  const result = resolvePlacement(state([7, target('a')], [13, target('b')], [17, target('c')]), 12, grouper());
  assert.equal(result.pushedEnemyIds.length, 3);
  const deck = [creature('needlefish'), creature('parrotfish'), creature('stonefish')];
  const slot = { card: grouper(), played: true };
  resolveRally(deck, 'bottom'); refillSlot(slot, deck);
  assert.equal(slot.card.texture, 'parrotfish');
  assert.deepEqual(deck.map(c => c.texture), ['stonefish', 'needlefish']);
  const one = [creature('minnow')]; resolveRally(one, 'bottom'); assert.equal(one.length, 1);
  resolveRally([], 'bottom');
  const keep = [creature('frogfish'), creature('minnow')]; resolveRally(keep, 'keep'); refillSlot(slot, keep);
  assert.equal(slot.card.texture, 'frogfish');
  assert.equal(rivalRallyChoice(creature('minnow')), 'bottom');
  assert.equal(rivalRallyChoice(creature('parrotfish')), 'keep');
});

test('Rally uses a distinct bounded flag pattern and the correct rules description', () => {
  const flags = abilityPixels('rally');
  assert.ok(flags.length > 100);
  assert.ok(flags.every(p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < 64 && p.y < 64));
  assert.notDeepEqual(flags, abilityPixels('revelation'));
  assert.match(cardDescription(grouper()), /Rally/); assert.doesNotMatch(cardDescription(grouper()), /Revelation/);
});

test('new fish default enabled while old toggle choices survive catalog expansion', () => {
  storage(); localStorage.setItem(ROSTER_KEY, JSON.stringify(ORIGINAL_FISH_TEXTURES.filter(id => id !== 'minnow')));
  assert.equal(enabledTextures().includes('minnow'), false);
  assert.ok(ADVANCED_REEF.every(id => enabledTextures().includes(id)));
  saveEnabledTextures(enabledTextures().filter(id => id !== 'parrotfish'));
  assert.equal(enabledTextures().includes('parrotfish'), false);
});

test('rival schools and Colossals honor the saved roster through all regions', () => {
  storage(); const run = createRun('RIVALS');
  run.roster = ['minnow', 'anchovy', 'goby', 'sardine', 'lure', 'ocean-sunfish', 'barracuda', 'anchor-crab', 'shipwreck-moray', 'chain-catshark'];
  for (let region = 0; region < 3; region++) {
    run.region = region; run.current = run.maps[region].nodes[0].id;
    for (const type of ['battle', 'boss']) {
      const node = run.maps[region].nodes.find(n => n.type === type); run.pending = node.id;
      assert.ok(rivalDeckFor(run).every(card => run.roster.includes(card.texture)));
    }
  }
});

test('legacy voyages preserve seeded offers and stock across the new weight table', () => {
  storage(); const run = createRun('LEGACY-STOCK');
  run.roster = [...ORIGINAL_FISH_TEXTURES]; run.reefPoolVersion = 1;
  enterNode(run, reachable(run)[0]); run.maps[0].nodes.find(n => n.id === run.pending).type = 'shop';
  const stock = shopOffers(run), catches = offers(run); run.shells = 200;
  buyOffer(run, stock[0].id);
  delete run.reefPoolVersion; delete run.roster; saveRun(run);
  const loaded = loadRun();
  assert.ok(loaded); assert.equal(loaded.reefPoolVersion, 1);
  assert.deepEqual(offers(loaded), catches); assert.deepEqual(shopOffers(loaded), stock);
  assert.equal(buyOffer(loaded, stock[0].id), false);
  assert.ok(rivalDeckFor(loaded).every(card => ORIGINAL_FISH_TEXTURES.includes(card.texture)));
});

test('a small regional roster still starts eight enabled cards with unique identities', () => {
  storage(); saveEnabledTextures(['sardine', 'octopus', 'lure', 'barracuda', 'swordfish', 'hypno-squid', 'minnow', 'anchor-crab', 'shipwreck-moray']);
  const run = createRun('SMALL');
  assert.equal(run.school.length, 8); assert.equal(new Set(run.school.map(c => c.id)).size, 8);
  assert.ok(run.school.every(card => run.roster.includes(card.texture)));
  saveRun(run); assert.ok(loadRun());
});
