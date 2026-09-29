import type { CardEdge } from "./starterFish.ts";
import type { Movement } from "../fishing/model.ts";

export const BERMUDA_DESIGNS: Record<string, { edges: CardEdge[]; movement: Movement }> = {
  "anchor-crab": { edges: [{ direction: "up", effect: "weak" }, { direction: "right", effect: "hook" }, { direction: "left", effect: "ram" }], movement: "lurker" },
  "shipwreck-moray": { edges: [{ direction: "right", effect: "bigger-fish" }, { direction: "down", effect: "dive" }, { direction: "left", effect: "hook" }], movement: "lurker" },
  "chain-catshark": { edges: [{ direction: "right", effect: "follow-current" }, { direction: "down", effect: "hook" }, { direction: "left", effect: "double" }], movement: "runner" },
  "rust-lobster": { edges: [{ direction: "up", effect: "spines" }, { direction: "right", effect: "ram" }, { direction: "down", effect: "weak" }], movement: "lurker" },
  "compass-jelly": { edges: [{ direction: "up", effect: "swap" }, { direction: "right", effect: "shock" }, { direction: "down", effect: "weak" }, { direction: "left", effect: "swap" }], movement: "drifter" },
  "cannonball-ray": { edges: [{ direction: "up", effect: "wave" }, { direction: "right", effect: "ram" }, { direction: "down", effect: "bounce" }], movement: "drifter" },
  "bilge-eel": { edges: [{ direction: "right", effect: "hook" }, { direction: "down", effect: "bounce" }, { direction: "left", effect: "shock" }], movement: "darter" },
  "figurehead-fish": { edges: [{ direction: "up", effect: "weak" }, { direction: "right", effect: "double" }, { direction: "down", effect: "ram" }], movement: "gradual" },
  "ghost-net": { edges: [{ direction: "up", effect: "hook" }, { direction: "right", effect: "hook" }, { direction: "down", effect: "hook" }], movement: "drifter" },
  "mimic-chest": { edges: [{ direction: "up", effect: "weak" }, { direction: "right", effect: "bigger-fish" }, { direction: "down", effect: "weak" }, { direction: "left", effect: "weak" }], movement: "lurker" },
  "bottomless-maw": { edges: [{ direction: "up", effect: "hook" }, { direction: "right", effect: "bigger-fish" }, { direction: "down", effect: "hook" }, { direction: "left", effect: "bigger-fish" }], movement: "lurker" },
  "lightning-marlin": { edges: [{ direction: "up", effect: "shock" }, { direction: "right", effect: "ram" }, { direction: "down", effect: "double" }], movement: "runner" },
  "thunder-jelly": { edges: [{ direction: "up", effect: "shock" }, { direction: "right", effect: "wave" }, { direction: "down", effect: "shock" }, { direction: "left", effect: "weak" }], movement: "drifter" },
  "squall-crab": { edges: [{ direction: "up", effect: "weak" }, { direction: "right", effect: "ram" }, { direction: "down", effect: "wave" }, { direction: "left", effect: "bounce" }], movement: "darter" },
};
