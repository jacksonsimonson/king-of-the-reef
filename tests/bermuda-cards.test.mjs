import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { BERMUDA_CARDS, BERMUDA_POOL } from "../src/game/data/bermudaCards.ts";
import { STARTERS } from "../src/game/data/starterFish.ts";
import { REGIONS } from "../src/game/run/maps.ts";
import { movementFor } from "../src/game/fishing/model.ts";

test("14 supplied Bermuda designs are playable regional cards", () => {
  assert.equal(BERMUDA_CARDS.length, 14);
  assert.equal(new Set(BERMUDA_POOL).size, 14);
  for (const data of BERMUDA_CARDS) {
    const card = STARTERS.find(card => card.texture === data.texture);
    assert.ok(card, data.name);
    assert.ok(card.edges.length > 0, data.name);
    assert.ok(existsSync(new URL("../public/assets/fish/" + data.texture + ".png", import.meta.url)), data.name);
    assert.ok(movementFor(data.texture), data.name);
    assert.ok(REGIONS[2].pool.includes(data.texture), data.name);
  }
});
