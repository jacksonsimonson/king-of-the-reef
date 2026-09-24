import test from "node:test";
import assert from "node:assert/strict";
import { STARTERS } from "../src/game/data/starterFish.ts";
import { AREA_MOVEMENT, MOVEMENTS, FISH_MOVEMENT, FishingModel, movementFor, ZONE_WIDTH, validSnapshot } from "../src/game/fishing/model.ts";
import { createRun, beginFishing, finishFishing, enterNode, reachable, offers, resolveVisit, saveRun, loadRun } from "../src/game/run/state.ts";

function stop(seed = "fishing") {
  const run = createRun(seed); enterNode(run, reachable(run)[0]); return run;
}
test("every creature has exactly one supported fishing movement group", () => {
  assert.deepEqual(Object.keys(FISH_MOVEMENT).sort(), STARTERS.map((f) => f.texture).sort());
  STARTERS.forEach((f) => assert.ok(MOVEMENTS[movementFor(f.texture)]));
});
test("left/right moves the zone, release stops it, opposite keys cancel, and boundaries clamp", () => {
  const game = new FishingModel("gradual", "shoreline", 1);
  game.step(true, false); assert.ok(game.zone < 0.5);
  const position = game.zone; game.step(false, false); assert.equal(game.zone, position);
  game.step(true, true); assert.equal(game.zone, position);
  game.step(false, true); assert.equal(game.zone, 0.5);
  for (let i = 0; i < 60; i++) game.step(true, false);
  assert.equal(game.zone, ZONE_WIDTH / 2);
  for (let i = 0; i < 120; i++) game.step(false, true);
  assert.equal(game.zone, 1 - ZONE_WIDTH / 2);
});
test("region multipliers increase aggregate travel for every movement group", () => {
  for (const movement of Object.keys(MOVEMENTS)) {
    const totals = Object.keys(AREA_MOVEMENT).map((region) => {
      let total = 0;
      for (let seed = 1; seed <= 40; seed++) {
        const game = new FishingModel(movement, region, seed);
        for (let i = 0; i < 1200; i++) {
          game.progress = 0.5; game.step(false, false);
          assert.ok(validSnapshot(game.snapshot()));
        }
        total += game.distance;
      }
      return total;
    });
    assert.ok(totals[1] > totals[0] && totals[2] > totals[1], movement + ": " + totals);
  }
});
test("tracking catches a fish; losing it escapes; terminal outcomes never advance again", () => {
  const caught = new FishingModel("gradual", "shoreline", 72);
  for (let i = 0; i < 3601 && caught.status === "playing"; i++) {
    caught.step(caught.zone > caught.fish + 0.008, caught.zone < caught.fish - 0.008);
  }
  assert.equal(caught.status, "caught");
  const before = caught.snapshot(); caught.step(true, false); assert.deepEqual(caught.snapshot(), before);
  const lost = new FishingModel("runner", "bermuda", 7);
  for (let i = 0; i < 3601 && lost.status === "playing"; i++) {
    lost.step(lost.fish > 0.5, lost.fish <= 0.5);
  }
  assert.equal(lost.status, "escaped");
});
test("saved state restores the exact fish pattern and progress, including random state", () => {
  const original = new FishingModel("darter", "ocean", 99);
  for (let i = 0; i < 160; i++) original.step(i % 2 === 0, i % 2 !== 0);
  const restored = FishingModel.restore(JSON.parse(JSON.stringify(original.snapshot())));
  for (let i = 0; i < 200; i++) {
    original.step(false, true); restored.step(false, true);
    assert.deepEqual(restored.snapshot(), original.snapshot());
  }
});
test("Try commits one target; Skip only works before Try; escape consumes the stop with no reward or retry", () => {
  const run = stop(), count = run.school.length, target = offers(run)[0], node = run.pending;
  assert.equal(beginFishing(run, "missing"), false);
  assert.equal(beginFishing(run, target), true);
  assert.equal(beginFishing(run, offers(run)[1]), false);
  assert.equal(resolveVisit(run, "leave"), false);
  assert.equal(resolveVisit(run, target), false);
  assert.equal(finishFishing(run, run.fishing.snapshot), false);
  const outcome = {...run.fishing.snapshot, status: "escaped", progress: 0};
  assert.equal(finishFishing(run, outcome), true);
  assert.equal(run.school.length, count); assert.equal(run.pending, null);
  assert.ok(run.visited.includes(node)); assert.equal(run.fishing, undefined);
  assert.equal(beginFishing(run, target), false);
  assert.equal(finishFishing(run, outcome), false);
  const skipped = stop("skip"); assert.equal(resolveVisit(skipped, "leave"), true);
  assert.equal(skipped.school.length, 8); assert.equal(skipped.pending, null);
});
test("successful catches recruit exactly once and unfinished attempts survive reload", () => {
  const run = stop(), texture = offers(run)[0]; beginFishing(run, texture);
  const model = FishingModel.restore(run.fishing.snapshot);
  for (let i = 0; i < 100; i++) model.step(true, false);
  run.fishing.snapshot = model.snapshot();
  const data = new Map();
  globalThis.localStorage = { getItem: (k) => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) };
  assert.equal(saveRun(run), true);
  const restored = loadRun(); assert.deepEqual(restored.fishing, run.fishing);
  assert.equal(beginFishing(restored, texture), false);
  const outcome = {...restored.fishing.snapshot, status: "caught", progress: 1};
  assert.equal(finishFishing(restored, outcome), true);
  assert.equal(restored.school.at(-1).texture, texture); assert.equal(restored.school.length, 9);
  assert.equal(finishFishing(restored, outcome), false);
  assert.equal(restored.school.length, 9);
});
