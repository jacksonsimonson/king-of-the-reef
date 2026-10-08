import test from 'node:test';
import assert from 'node:assert/strict';
import { createRun, activeNode, enterNode, reachable, resolveVisit, battleResult, buyOffer, shopOffers, saveRun, loadRun, rivalDeckFor } from '../src/game/run/state.ts';
import { generateMap, random } from '../src/game/run/maps.ts';
import { validBattleSave } from '../src/game/run/battleSave.ts';
import { charmCard } from '../src/game/data/tideCharms.ts';

function storage() { const map = new Map(); globalThis.localStorage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }; }
function visit(run, type) {
  const node = run.maps[run.region].nodes.find(n => n.type === type);
  run.current = run.maps[run.region].nodes.find(n => n.next.includes(node.id)).id;
  assert.ok(enterNode(run, node.id)); return node;
}
function snapshot(run) {
  const rival = rivalDeckFor(run);
  return { version: 1, nodeId: run.pending, board: Array(25).fill(null), playerHand: run.school.slice(0, 5).map(card => ({card, played:false})), rivalHand: rival.slice(0, 5).map(card => ({card, played:false})), playerDeck: run.school.slice(5), rivalDeck: rival.slice(5), plays: {player:0, rival:0}, shocked: [], killedIds: [], turn:'player', rngCalls:16, pendingReveal:null, rallySlot:null };
}
test('battle checkpoint survives JSON with upgrades, reveals, casualties, reserves, and pending choices', () => {
  storage(); const run = createRun('checkpoint'); visit(run, 'battle'); const s = snapshot(run);
  const fish = s.playerHand[0].card;
  s.playerHand[0].card = charmCard(fish, 'reef-beacon');
  s.rivalHand[0].revealed = true;
  s.playerHand[1].played = true; s.board[6] = s.playerHand[1].card;
  s.playerHand[2].played = true; s.killedIds = [s.playerHand[2].card.id];
  s.plays.player = 2; s.shocked = [s.board[6].id]; s.rallySlot = 1;
  run.battle = structuredClone(s); run.charms = ['drift-shell'];
  assert.ok(validBattleSave(s, run.pending)); assert.ok(saveRun(run));
  const loaded = loadRun(); assert.deepEqual(loaded.battle, s); assert.deepEqual(loaded.charms, ['drift-shell']);
  assert.equal(run.school[0].battleAbilities, undefined, 'upgrades do not leak into permanent school');
  loaded.battle.rallySlot = null; loaded.battle.pendingReveal = 'card'; assert.ok(validBattleSave(loaded.battle, run.pending));
  battleResult(loaded, 2, 1, s.killedIds); assert.equal(loaded.battle, undefined);
  const shells = loaded.shells; battleResult(loaded, 2, 1, s.killedIds); assert.equal(loaded.shells, shells);
});
test('checkpoint validation rejects damaged or impossible data instead of resuming unsafe state', () => {
  const run = createRun('bad-checkpoint'); visit(run, 'battle'); const base = snapshot(run);
  for (const change of [s => s.nodeId = 'wrong', s => s.board.pop(), s => s.rngCalls = Infinity, s => s.plays.player = 6, s => s.board[0] = s.playerHand[0].card, s => s.playerHand[0].card.edges = null, s => s.rallySlot = 0, s => s.turn = 'other', s => s.killedIds = [s.playerHand[0].card.id]]) {
    const s = structuredClone(base); change(s); assert.equal(validBattleSave(s, run.pending), false);
  }
});
test('full-shop replacement is exact, atomic, duplicate-safe, and survives reload', () => {
  storage(); const run = createRun('replace'); visit(run, 'shop'); run.shells = 200;
  const offer = shopOffers(run).find(o => o.kind === 'charm'); run.charms = ['spyglass-pearl', 'spyglass-pearl', 'drift-shell'];
  const before = JSON.stringify(run);
  for (const index of [undefined, -1, 3, .5]) { assert.equal(buyOffer(run, offer.id, index), false); assert.equal(JSON.stringify(run), before); }
  assert.ok(buyOffer(run, offer.id, 1)); assert.deepEqual(run.charms, ['spyglass-pearl', offer.charm, 'drift-shell']); assert.equal(run.shells, 200 - offer.price);
  assert.equal(buyOffer(run, offer.id, 0), false); saveRun(run); assert.deepEqual(loadRun(), run);
  const poor = createRun('poor'); visit(poor, 'shop'); poor.charms = [...run.charms]; poor.shells = 0;
  const poorBefore = JSON.stringify(poor); assert.equal(buyOffer(poor, shopOffers(poor).find(o => o.kind === 'charm').id, 0), false); assert.equal(JSON.stringify(poor), poorBefore);
});
test('new maps are longer with bounded recovery gaps and noncrossing connected routes', () => {
  for (let seed = 0; seed < 300; seed++) for (let region = 0; region < 3; region++) {
    const map = generateMap(String(seed), region, 2), lookup = new Map(map.nodes.map(n => [n.id, n]));
    const reached = new Set([map.nodes[0].id]);
    for (const node of map.nodes) {
      assert.ok(reached.has(node.id)); assert.equal(node.next.length === 0, node.column === 18);
      const forced = {1:'fishing',2:'battle',5:'shop',6:'hydration',8:'battle',11:'shop',12:'hydration',14:'battle',17:'hydration',18:'boss'};
      if (forced[node.column]) assert.equal(node.type, forced[node.column]);
      for (const id of node.next) { assert.equal(lookup.get(id).column, node.column + 1); reached.add(id); }
      for (const other of map.nodes.filter(n => n.column === node.column && n.lane > node.lane)) for (const a of node.next) for (const b of other.next) assert.ok(lookup.get(a).lane <= lookup.get(b).lane);
    }
  }
});
test('legacy maps, stock, resources, and new maps retain their version after reload', () => {
  storage();
  for (const version of [1, 2]) {
    const run = createRun('compatibility', version); visit(run, 'shop'); const stock = shopOffers(run);
    saveRun(run); const loaded = loadRun(); assert.deepEqual(loaded, run); assert.deepEqual(shopOffers(loaded), stock);
    assert.equal(Math.max(...loaded.maps[0].nodes.map(n => n.column)), version === 1 ? 12 : 18);
    assert.equal(loaded.shells, version === 1 ? 18 : 24);
  }
});
test('regional passage caps recovery and awards each regional Colossal once', () => {
  for (const region of [0, 1, 2]) {
    const run = createRun('passage'); run.region = region; visit(run, 'boss');
    run.school.slice(0, 5).forEach(f => f.condition = 'killed'); run.resolve = 2; const shells = run.shells;
    run.battle = snapshot(run);
    battleResult(run, 2, 1); assert.equal(run.battle, undefined); assert.equal(run.shells, shells + 28 + region * 4);
    if (region < 2) { assert.equal(run.resolve, 3); assert.equal(run.school.filter(f => f.condition === 'killed').length, 2); }
    else assert.equal(run.status, 'won');
    const after = JSON.stringify(run); battleResult(run, 2, 1); assert.equal(JSON.stringify(run), after);
  }
});
test('replacement leaves legacy queued charms intact and does not grow inventory', () => {
  const run = createRun('queued', 1); visit(run, 'shop'); run.shells = 500;
  run.charms = ['spyglass-pearl', 'current-conch', 'nautilus-dial', 'coral-mail', 'drift-shell'];
  const offer = shopOffers(run).find(o => o.kind === 'charm');
  assert.ok(buyOffer(run, offer.id, 2)); assert.deepEqual(run.charms.slice(3), ['coral-mail', 'drift-shell']); assert.equal(run.charms.length, 5);
});
test('300 full voyages support early shopping and recover from ordinary attrition without free rewards', () => {
  for (let seed = 0; seed < 300; seed++) {
    const run = createRun('balance-' + seed), rng = random(String(seed)); let stops = 0, battles = 0, purchases = 0;
    while (run.status === 'active' && stops < 60) {
      const choices = reachable(run); assert.ok(choices.length);
      enterNode(run, choices[Math.floor(rng() * choices.length)]); const node = activeNode(run); stops++;
      if (node.type === 'battle' || node.type === 'boss') {
        battles++; const killed = run.school.filter(f => f.condition === 'healthy').slice(0, battles % 2).map(f => f.id);
        // Controlled ordinary attrition scenario: a loss every fourth ordinary battle.
        battleResult(run, node.type !== 'boss' && battles % 4 === 0 ? 0 : 2, 1, killed);
      } else if (node.type === 'shop') {
        const offer = shopOffers(run).find(o => o.kind === 'charm');
        if (node.column === 5 && run.region === 0 && purchases === 0) assert.ok(run.shells >= offer.price, 'first guaranteed merchant affordable when shells were saved');
        if (run.shells >= offer.price) { assert.ok(buyOffer(run, offer.id, run.charms.length === 3 ? 0 : undefined)); purchases++; }
        resolveVisit(run, 'leave');
      } else if (node.type === 'hydration') resolveVisit(run, 'rest', run.school.filter(f => f.condition === 'killed').slice(0, 3).map(f => f.id));
      else resolveVisit(run, node.type === 'event' ? 'rescue' : 'leave');
      assert.ok(run.school.some(f => f.condition === 'healthy')); assert.ok(run.shells >= 0); assert.ok(run.charms.length <= 3);
    }
    assert.equal(run.status, 'won'); assert.equal(stops, 54); assert.ok(purchases >= 3);
  }
});
