import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, enterNode, reachable, activeNode, resolveVisit, battleResult, shopOffers, buyOffer, consumeCharm, saveRun, loadRun, SAVE_KEY } from '../src/game/run/state.ts';
import { CHARMS, CHARM_IDS, charmCard, refillSlot, shuffleHand, canPlayFish } from '../src/game/data/tideCharms.ts';
import { resolvePlacement } from '../src/game/combat.ts';

function shop(seed = 'shop') {
  const run = createRun(seed);
  for (let i = 0; i < 5; i++) {
    enterNode(run, reachable(run)[0]);
    const type = activeNode(run).type;
    if (type === 'battle') battleResult(run, 2, 1);
    else resolveVisit(run, type === 'event' ? 'rescue' : type === 'hydration' ? 'rest' : 'leave');
  }
  enterNode(run, reachable(run)[0]);
  return run;
}
function storage() {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('shops have three fixed, distinct ascending offers with both fish and charms', () => {
  for (let i = 0; i < 200; i++) {
    const run = shop(String(i)), stock = shopOffers(run);
    assert.equal(stock.length, 3);
    assert.ok(stock.some(o => o.kind === 'fish') && stock.some(o => o.kind === 'charm'));
    assert.ok(stock[0].price < stock[1].price && stock[1].price < stock[2].price);
    assert.ok(stock[0].price > 18 + 12, 'starting shells plus one victory cannot buy an offer');
    assert.equal(new Set(stock.map(o => o.texture ?? o.charm)).size, 3);
    assert.deepEqual(shopOffers(run), stock);
  }
});

test('buying all stock is atomic, never restocks, and survives reloading', () => {
  storage();
  const run = shop(); run.shells = 1000;
  const stock = shopOffers(run), pending = run.pending;
  for (const offer of stock) {
    assert.equal(buyOffer(run, offer.id), true);
    const balance = run.shells;
    assert.equal(buyOffer(run, offer.id), false);
    assert.equal(run.shells, balance);
    assert.deepEqual(shopOffers(run), stock);
    assert.equal(run.pending, pending);
  }
  assert.equal(run.shells, 1000 - stock.reduce((sum, o) => sum + o.price, 0));
  assert.equal(run.charms.length, stock.filter(o => o.kind === 'charm').length);
  saveRun(run); const loaded = loadRun();
  assert.deepEqual(loaded.shop, run.shop); assert.deepEqual(loaded.charms, run.charms);
  assert.equal(buyOffer(loaded, stock[0].id), false);
  assert.equal(resolveVisit(loaded, 'leave'), true);
  assert.equal(loaded.shop, undefined);
  const nextId = reachable(loaded)[0];
  loaded.maps[0].nodes.find(n => n.id === nextId).type = 'shop';
  enterNode(loaded, nextId);
  const nextStock = shopOffers(loaded);
  assert.ok(nextStock.every(o => !stock.some(old => old.id === o.id)));
  assert.equal(buyOffer(loaded, nextStock[0].id), true);
  assert.equal(loaded.shop.purchased.length, 1);
});

test('older saves get an empty inventory, invalid items fail validation, consumption requires battle', () => {
  storage(); const run = createRun('legacy'); delete run.charms;
  saveRun(run); const loaded = loadRun(); assert.deepEqual(loaded.charms, []);
  loaded.charms.push('coral-mail');
  assert.equal(consumeCharm(loaded, 'coral-mail'), false);
  const nextId = reachable(loaded)[0]; loaded.maps[0].nodes.find(n => n.id === nextId).type = 'battle';
  enterNode(loaded, nextId);
  assert.equal(consumeCharm(loaded, 'coral-mail'), true);
  assert.equal(consumeCharm(loaded, 'coral-mail'), false);
  saveRun(loaded); assert.deepEqual(loadRun().charms, []);
  loaded.charms.push('unknown-item'); saveRun(loaded); assert.equal(loadRun(), null);
  localStorage.setItem(SAVE_KEY, 'null');
});

test('draw replacements follow reserve order, hide new identities, and never recycle played cards', () => {
  const school = createRun('draw').school;
  const slot = { card: school[0], played: true, revealed: true };
  const deck = school.slice(5);
  refillSlot(slot, deck);
  assert.equal(slot.card.id, school[5].id); assert.equal(slot.played, false); assert.equal(slot.revealed, false);
  assert.equal(deck.length, 2);
  slot.played = true; refillSlot(slot, []); assert.equal(slot.played, true);
  assert.equal(canPlayFish([{ ...slot, played: false }], 4), true);
  assert.equal(canPlayFish([{ ...slot, played: false }], 5), false);
  assert.equal(canPlayFish([slot], 1), false);
});

test('Conch preserves every unplayed card exactly once and leaves played silhouettes alone', () => {
  const school = createRun('shuffle').school;
  const hand = school.slice(0, 5).map(card => ({ card, played: false }));
  hand[0].played = true;
  const deck = school.slice(5), played = hand[0].card;
  shuffleHand(hand, deck, () => 0);
  assert.equal(hand[0].card, played); assert.equal(hand[0].played, true);
  assert.equal(deck.length, 3);
  const ids = [...hand.filter(s => !s.played).map(s => s.card.id), ...deck.map(c => c.id)];
  assert.equal(new Set(ids).size, 7); assert.ok(!ids.includes(played.id));
});

test('Dial and Mail modify battle cards without changing school cards; shields block a push', () => {
  const run = createRun('charms'), fish = run.school[0];
  const before = JSON.stringify(fish);
  const turned = charmCard(fish, 'nautilus-dial');
  assert.equal(turned.edges[0].direction, 'right');
  const armored = charmCard(fish, 'coral-mail');
  assert.equal(armored.edges.length, 4);
  assert.equal(armored.edges.find(e => e.direction === 'up').effect, 'standard');
  assert.equal(armored.edges.find(e => e.direction === 'left').effect, 'weak');
  assert.equal(JSON.stringify(fish), before);
  const board = Array(25).fill(null); board[7] = armored;
  const enemy = { ...run.school[1], owner: 'rival' };
  const result = resolvePlacement({ board, shocked: new Set() }, 6, enemy);
  assert.equal(result.board[7].id, fish.id);
  assert.equal(result.board[8], null);
  for (const id of CHARM_IDS) {
    assert.ok(CHARMS[id].description.length > 0);
    assert.ok(CHARMS[id].icon.every(row => row.length === 11));
  }
});
