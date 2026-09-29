import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/game/data/openOceanCards.ts", import.meta.url), "utf8");
const rows = [...source.matchAll(/card\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"(?:,\s*"ready")?\)/g)]
  .map(([, texture, name, zone, type, rarity]) => ({ texture, name, zone, type, rarity }));

test("Open Ocean foundation has 43 unique new creatures", () => {
  assert.equal(rows.length, 43);
  assert.equal(new Set(rows.map((card) => card.texture)).size, rows.length);
  assert.equal(new Set(rows.map((card) => card.name)).size, rows.length);
});

test("Open Ocean cards are assigned to the three map zones", () => {
  const counts = Object.fromEntries(["continental-shelf", "polar-current", "midnight-trench"]
    .map((zone) => [zone, rows.filter((card) => card.zone === zone).length]));
  assert.deepEqual(counts, { "continental-shelf": 18, "polar-current": 15, "midnight-trench": 10 });
});

test("the curated roster uses one tuna and one billfish", () => {
  assert.deepEqual(rows.filter((card) => card.name.includes("Tuna")).map((card) => card.name), ["Yellowfin Tuna"]);
  assert.deepEqual(rows.filter((card) => ["Sailfish", "Blue Marlin"].includes(card.name)).map((card) => card.name), ["Sailfish"]);
});

test("planned cards remain inactive until art and edges are approved", () => {
  const starters = readFileSync(new URL("../src/game/data/starterFish.ts", import.meta.url), "utf8");
  assert.doesNotMatch(starters, /OPEN_OCEAN_CARDS/);
  assert.match(source, /art: "awaiting-art"/);
});

test("the first ten manifest entries have approved art", () => {
  const ready = [...source.matchAll(/card\("([^"]+)"[^\n]+"ready"\)/g)].map((match) => match[1]);
  assert.deepEqual(ready, [
    "yellowfin-tuna", "mahi-mahi", "wahoo", "flying-fish", "sailfish",
    "great-white-shark", "thresher-shark", "whale-shark", "giant-oceanic-manta-ray", "leatherback-sea-turtle",
  ]);
});
