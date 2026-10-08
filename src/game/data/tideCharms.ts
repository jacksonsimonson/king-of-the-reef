import type { FishCard, Direction } from "./starterFish.ts";
import type { HandSlot } from "../combat.ts";
import { grantAbility, hasAbility } from "../abilities.ts";
import { blocksPlacement, type Terrain } from "../terrain.ts";

export const CHARMS = {
  "spear-shell": { name: "Spear Shell", price: 42, color: "#9ddcdf", description: "Select a hand fish. Fill its empty sides with Standard pushes for this battle.", icon: ["00001100000","00001100000","00112211000","00112211000","11222222110","11222222110","00001100000","00001100000","00001100000","00001100000","00000000000"] },
  "breaker-tooth": { name: "Breaker Tooth", price: 46, color: "#e5b68a", description: "Select a hand fish. Upgrade its Standard edges to Double pushes for this battle.", icon: ["11110011110","11110011110","11221122110","11221122110","11222222110","11222222110","00112211000","00112211000","00001100000","00001100000","00000000000"] },
  "barbed-wreath": { name: "Barbed Wreath", price: 42, color: "#d6a4ba", description: "Select a hand fish. Fill its empty sides with retaliating Spines for this battle.", icon: ["11001100110","11001100110","00112211000","00112211000","11222222110","11222222110","00112211000","00112211000","11001100110","11001100110","00000000000"] },
  "dredger-net": { name: "Dredger Net", price: 38, color: "#a0d8b5", description: "Select a hand fish, then choose from the next three reserve cards to replace it. Your old fish goes to the bottom. Cancel keeps the charm.", icon: ["11111111110","11111111110","11221122110","11221122110","11111111110","11111111110","11221122110","11221122110","00111111000","00111111000","00000000000"] },
  "drift-shell": { name: "Drift Shell", price: 50, color: "#8cbfe8", description: "Move one friendly board fish to an adjacent empty safe tile, including a reef. Does not activate edges or direct-play terrain. Anchor and kelp cannot move. Cancel keeps the charm.", icon: ["00001100000","00001100000","00112211000","00112211000","11222222110","11222222110","00112211000","00112211000","11001100110","11001100110","00000000000"] },
  "anchor-stone": { name: "Anchor Stone", price: 46, color: "#abbacb", description: "Select a hand fish. Grant Anchor for this battle: resist forced movement, but not predation. Keeps its original ability.", icon: ["00001100000","00001100000","00112211000","00112211000","00001100000","00001100000","11221122110","11221122110","00111111000","00111111000","00000000000"] },
  "reef-beacon": { name: "Reef Beacon", price: 58, color: "#f1b9df", description: "Select a hand fish. Grant Reefborn for this battle, allowing direct placement on an empty scoring reef. Keeps its original ability.", icon: ["11001100110","11001100110","00112211000","00112211000","11222222110","11222222110","00112211000","00112211000","11111111110","11111111110","00000000000"] },
  "duelist-pearl": { name: "Duelist Pearl", price: 58, color: "#f3d08c", description: "Select a hand fish. Grant Piercing for this battle: its attacks ignore edge defenses and Bulwark. Terrain and Anchor still block movement. Keeps its original ability.", icon: ["00001100000","00001100000","00112211000","00112211000","11222222110","11222222110","00112211000","00112211000","00001100000","00001100000","00000000000"] },
  "current-conch": { name: "Current Conch", price: 34, color: "#81e8ed", description: "Shuffle your unplayed hand into your remaining deck, then draw the same number. Does not reset your fish plays.", icon: ["00011110000", "00122221000", "01211122100", "12122112210", "12211212210", "12122212210", "01211122100", "00122221000", "00012210000", "00001100000", "00000000000"] },
  "spyglass-pearl": { name: "Spyglass Pearl", price: 30, color: "#b7a4ff", description: "Reveal one hidden card in the rival hand. You still play a fish afterward.", icon: ["00000000000", "00011111000", "00122222100", "01221112210", "12213331221", "12213131221", "12213331221", "01221112210", "00122222100", "00011111000", "00000000000"] },
  "nautilus-dial": { name: "Nautilus Dial", price: 38, color: "#ffc77c", description: "Select a fish in your hand, then turn all its edges clockwise once. Lasts this battle only.", icon: ["00000100000", "00000110000", "00111111000", "01000110000", "01000100000", "01000000010", "00000000010", "00011000100", "00111111000", "00011000000", "00001000000"] },
  "coral-mail": { name: "Coral Mail", price: 46, color: "#ff98ac", description: "Select a fish in your hand, then add Shields to its empty sides for this battle. Does not replace existing edges or remove Shock.", icon: ["00111111100", "01221212210", "01221212210", "01221212210", "01222222210", "01221212210", "00121212100", "00122222100", "00012221000", "00001210000", "00000100000"] },
} as const;
export type CharmId = keyof typeof CHARMS;
export const LEGACY_CHARM_IDS: CharmId[] = ["current-conch", "spyglass-pearl", "nautilus-dial", "coral-mail"];
export const CHARM_IDS = [...LEGACY_CHARM_IDS, ...Object.keys(CHARMS).filter(id => !LEGACY_CHARM_IDS.includes(id as CharmId))] as CharmId[];
export function isCharm(id: unknown): id is CharmId { return typeof id === "string" && Object.hasOwn(CHARMS, id); }
const CLOCKWISE: Direction[] = ["up", "right", "down", "left"];

// Copy both the card and its edges: battle modifications must never leak into the school.
export function charmCard(card: FishCard, charm: CharmId): FishCard {
  if (charm === "anchor-stone") return grantAbility(card, "anchor");
  if (charm === "reef-beacon") return grantAbility(card, "reefborn");
  if (charm === "duelist-pearl") return grantAbility(card, "piercing");
  const edges = card.edges.map((edge) => ({ ...edge }));
  if (charm === "nautilus-dial") edges.forEach((edge) => { edge.direction = CLOCKWISE[(CLOCKWISE.indexOf(edge.direction) + 1) % 4]; });
  else if (charm === "breaker-tooth") edges.forEach(edge => { if (edge.effect === "standard") edge.effect = "double"; });
  else if (["coral-mail", "spear-shell", "barbed-wreath"].includes(charm)) {
    const effect = charm === "coral-mail" ? "weak" : charm === "spear-shell" ? "standard" : "spines";
    for (const direction of CLOCKWISE) if (!edges.some(edge => edge.direction === direction)) edges.push({ direction, effect });
  }
  return { ...card, edges };
}

export function canCharmCard(card: FishCard | undefined, charm: CharmId): boolean {
  if (!card) return false;
  return JSON.stringify(charmCard(card, charm)) !== JSON.stringify(card);
}

export function exchangeReserve(slot: HandSlot, deck: FishCard[], index: number): boolean {
  if (slot.played || !Number.isInteger(index) || index < 0 || index >= Math.min(3, deck.length)) return false;
  const old = slot.card;
  slot.card = deck.splice(index, 1)[0]; slot.revealed = false;
  deck.push(old);
  return true;
}

export function canDrift(board: readonly (FishCard | null)[], from: number, to: number, terrain: Terrain, size = 5): boolean {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= board.length || to >= board.length) return false;
  if (board[from]?.owner !== "player" || board[to] || blocksPlacement(terrain, to)
    || hasAbility(board[from], "anchor") || terrain.features?.get(from) === "kelp") return false;
  return Math.abs(Math.floor(from / size) - Math.floor(to / size)) + Math.abs(from % size - to % size) === 1;
}

export function refillSlot(slot: HandSlot, deck: FishCard[]): void {
  const next = deck.shift();
  if (next) { slot.card = next; slot.played = false; slot.revealed = false; }
}
export const PLAYS_PER_BATTLE = 5;
export function canPlayFish(hand: HandSlot[], played: number): boolean {
  return played < PLAYS_PER_BATTLE && hand.some((slot) => !slot.played);
}

export function shuffleHand(hand: HandSlot[], deck: FishCard[], rng: () => number): void {
  const slots = hand.filter((slot) => !slot.played);
  const pool = [...slots.map((slot) => slot.card), ...deck];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Keep revealed cards visible when they remain in hand after the shuffle.
  const known = new Set(hand.filter((slot) => slot.revealed).map((slot) => slot.card.id));
  slots.forEach((slot) => { slot.card = pool.shift()!; slot.revealed = known.has(slot.card.id); });
  deck.splice(0, deck.length, ...pool);
}

export function charmCanvas(id: CharmId, scale = 4): HTMLCanvasElement {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 16 * scale;
  const ctx = canvas.getContext("2d")!;
  CHARMS[id].icon.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === "0") return;
    ctx.fillStyle = pixel === "1" ? CHARMS[id].color : pixel === "2" ? "#ffffff" : "#16364d";
    ctx.fillRect((x + Math.floor((16 - row.length) / 2)) * scale, (y + Math.floor((16 - CHARMS[id].icon.length) / 2)) * scale, scale, scale);
  }));
  return canvas;
}
