import test from "node:test";
import assert from "node:assert/strict";
import { STARTERS } from "../src/game/data/starterFish.ts";
import { REEF_GROUPS, REEF_POOL, drawReefCard } from "../src/game/data/reefPool.ts";
import { resolvePlacement, revealTargets, revealCard } from "../src/game/combat.ts";
import { random } from "../src/game/run/maps.ts";
import { createRun, offers } from "../src/game/run/state.ts";

const fish = (id, edges = [], owner = "rival") => ({ id, name: id, texture: id, species: "test", edges, owner, condition: "healthy" });
const edge = (direction, effect = "standard") => ({ direction, effect });
const definition = (texture, owner = "player") => ({ ...STARTERS.find((f) => f.texture === texture), id: texture, owner, condition: "healthy" });
const state = (...entries) => ({ board: Object.assign(Array(25).fill(null), Object.fromEntries(entries)), shocked: new Set() });

test("Reef has all 15 nonempty standard-arrow combinations, exactly once, plus seven specials", () => {
  const cards = STARTERS.filter((f) => REEF_POOL.includes(f.texture));
  assert.equal(cards.length, 22);
  const masks = cards.filter((f) => f.edges.every((e) => e.effect === "standard")).map((f) => f.edges.reduce((mask, e) => mask | (1 << ["up", "right", "down", "left"].indexOf(e.direction)), 0));
  assert.deepEqual(masks.sort((a, b) => a - b), Array.from({ length: 15 }, (_, i) => i + 1));
});
test("weighted catches preserve common basics, rare specials and 1% Moray across seeded draws", () => {
  const rng = random("reef-rarity");
  const counts = REEF_GROUPS.map(() => 0);
  for (let i = 0; i < 50000; i++) {
    const id = drawReefCard(rng);
    counts[REEF_GROUPS.findIndex((g) => g.cards.includes(id))]++;
  }
  REEF_GROUPS.forEach((group, i) => assert.ok(Math.abs(counts[i] / 500 - group.weight) < 1));
  for (let i = 0; i < 100; i++) {
    const run = createRun("offers-" + i);
    assert.equal(new Set(offers(run)).size, 3);
    assert.deepEqual(offers(run), offers(run));
  }
});
test("Shock bypasses arrows but facing Shield blocks; input simulation remains untouched", () => {
  const target = fish("target", [edge("left", "double")]);
  const shield = fish("shield", [edge("down", "weak")]);
  const before = state([13, target], [7, shield]);
  const result = resolvePlacement(before, 12, definition("electric-eel"));
  assert.ok(result.shocked.has("target"));
  assert.ok(!result.shocked.has("shield"));
  assert.equal(before.shocked.size, 0);
  assert.equal(before.board[12], null);
  assert.equal(target.edges[0].effect, "double");
  const pushed = resolvePlacement(result, 14, fish("pusher", [edge("left")], "player"));
  assert.equal(pushed.board[13], target); // occupied destination stops the push
  assert.ok(pushed.shocked.has("target"));
});
test("Shock status follows movement and disables all sides, including Spines", () => {
  const target = definition("sea-urchin", "rival");
  const before = state([13, target]);
  before.shocked.add(target.id);
  const moved = resolvePlacement(before, 12, definition("anchovy"));
  assert.equal(moved.board[14], target);
  assert.ok(moved.shocked.has(target.id));
  assert.equal(moved.board[12].id, "anchovy");
  const killed = resolvePlacement(moved, 9, fish("down", [edge("down")], "player"));
  assert.equal(killed.board[19], target);
  assert.ok(killed.shocked.has(target.id));
});
test("Spines kills a direct enemy pusher after movement, including off-board, and halts its remaining edges", () => {
  for (const effect of ["standard", "double"]) {
    const target = definition("sea-urchin", "rival");
    const attacker = fish("attacker", [edge("right", effect), edge("up")], "player");
    const upper = fish("upper");
    const result = resolvePlacement(state([14, target], [8, upper]), 13, attacker);
    assert.equal(result.board[14], null);
    assert.equal(result.board[13], null);
    assert.equal(result.board[8], upper);
    assert.deepEqual(new Set(result.killedIds), new Set(["sea-urchin", "attacker"]));
  }
});
test("blocked pushes and friendly pushes do not retaliate", () => {
  const target = definition("sea-urchin", "rival");
  const blocked = resolvePlacement(state([13, target], [14, fish("blocker")]), 12, definition("anchovy"));
  assert.equal(blocked.board[12].id, "anchovy");
  assert.equal(blocked.board[13], target);
  const friendly = resolvePlacement(state([13, definition("sea-urchin")]), 12, definition("anchovy"));
  assert.equal(friendly.board[14].id, "sea-urchin");
  assert.deepEqual(friendly.killedIds, []);
});
test("Hook, Swap, Wave and Bite pass nondefending Spines without retaliation", () => {
  for (const effect of ["hook", "swap", "wave", "bigger-fish"]) {
    const target = definition("sea-urchin", "rival");
    const result = resolvePlacement(state([effect === "hook" ? 14 : 13, target]), 12, fish("attacker", [edge("right", effect)], "player"));
    assert.ok(result.board.some((f) => f?.id === "attacker"));
    assert.equal(result.killedIds.includes("attacker"), false);
    if (effect === "bigger-fish") assert.deepEqual(result.killedIds, [target.id]);
  }
});
test("Wave moves all three rays farthest-first, killing only beyond the board", () => {
  const near = fish("near"), far = fish("far"), diagonal = fish("diagonal"), shield = fish("shield", [edge("up", "weak")]);
  const result = resolvePlacement(state([12, near], [17, far], [13, diagonal], [11, shield]), 7, definition("ocean-sunfish"));
  assert.equal(result.board[17], near);
  assert.equal(result.board[22], far);
  assert.equal(result.board[19], diagonal);
  assert.equal(result.board[11], shield);
  assert.deepEqual(result.killedIds, []);
  const overboard = resolvePlacement(state([22, far]), 7, definition("ocean-sunfish"));
  assert.deepEqual(overboard.killedIds, ["far"]);
});
test("Double and Hook ignore Standard but not Shield; Bite requires a successful push destination", () => {
  for (const effect of ["double", "hook"]) for (const defense of ["standard", "weak"]) {
    const target = fish("target", [edge("left", defense)]);
    const index = effect === "hook" ? 14 : 13;
    const result = resolvePlacement(state([index, target]), 12, fish("source", [edge("right", effect)], "player"));
    assert.equal(result.board[index] === target, defense === "weak");
  }
  const result = resolvePlacement(state([13, fish("prey")], [14, fish("blocker")]), 12, definition("moray-eel"));
  assert.deepEqual(result.killedIds, []);
});
test("Revelation only exposes one remaining unrevealed hand slot and persists on that slot", () => {
  const hand = [
    { card: fish("played"), played: true },
    { card: fish("known"), played: false, revealed: true },
    { card: fish("hidden"), played: false },
  ];
  assert.deepEqual(revealTargets(hand).map((s) => s.card.id), ["hidden"]);
  assert.equal(revealCard(hand, "played"), false);
  assert.equal(revealCard(hand, "hidden"), true);
  assert.equal(revealCard(hand, "hidden"), false);
  assert.equal(revealTargets(hand).length, 0);
});
