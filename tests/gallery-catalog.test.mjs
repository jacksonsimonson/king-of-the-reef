import test from "node:test";
import assert from "node:assert/strict";
import { STARTERS } from "../src/game/data/starterFish.ts";
import { catalogSections, galleryType } from "../src/game/data/galleryCatalog.ts";

test("gallery separates environments and keeps creature types contiguous", () => {
  const cards = STARTERS;
  const sections = catalogSections(cards);
  assert.deepEqual(sections.map(({ environment }) => environment.id), ["shoreline", "ocean", "bermuda"]);
  assert.deepEqual(sections.map(({ cards }) => cards.length), [75, 4, 2]);
  const flattened = sections.flatMap(({ cards }) => cards);
  assert.equal(flattened.length, cards.length);
  assert.equal(new Set(flattened.map(({ texture }) => texture)).size, cards.length);

  const order = ["fish", "sharks-rays", "reptiles-mammals", "cephalopods", "crustaceans", "mollusks", "echinoderms", "jellies-anemones", "corals-sponges", "curios"];
  for (const section of sections) {
    const ranks = section.cards.map(({ texture }) => order.indexOf(galleryType(texture)));
    assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  }
});
