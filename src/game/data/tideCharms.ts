import type { FishCard, Direction } from "./starterFish.ts";
import type { HandSlot } from "../combat.ts";

export const CHARMS = {
  "current-conch": { name: "Current Conch", price: 34, color: "#81e8ed", description: "Shuffle your unplayed hand into your remaining deck, then draw the same number. Does not reset your fish plays.", icon: ["00011110000", "00122221000", "01211122100", "12122112210", "12211212210", "12122212210", "01211122100", "00122221000", "00012210000", "00001100000", "00000000000"] },
  "spyglass-pearl": { name: "Spyglass Pearl", price: 30, color: "#b7a4ff", description: "Reveal one hidden card in the rival hand. You still play a fish afterward.", icon: ["00000000000", "00011111000", "00122222100", "01221112210", "12213331221", "12213131221", "12213331221", "01221112210", "00122222100", "00011111000", "00000000000"] },
  "nautilus-dial": { name: "Nautilus Dial", price: 38, color: "#ffc77c", description: "Select a fish in your hand, then turn all its edges clockwise once. Lasts this battle only.", icon: ["00000100000", "00000110000", "00111111000", "01000110000", "01000100000", "01000000010", "00000000010", "00011000100", "00111111000", "00011000000", "00001000000"] },
  "coral-mail": { name: "Coral Mail", price: 46, color: "#ff98ac", description: "Select a fish in your hand, then add Shields to its empty sides for this battle. Does not replace existing edges or remove Shock.", icon: ["00111111100", "01221212210", "01221212210", "01221212210", "01222222210", "01221212210", "00121212100", "00122222100", "00012221000", "00001210000", "00000100000"] },
} as const;
export type CharmId = keyof typeof CHARMS;
export const CHARM_IDS = Object.keys(CHARMS) as CharmId[];
export function isCharm(id: unknown): id is CharmId { return typeof id === "string" && Object.hasOwn(CHARMS, id); }
const CLOCKWISE: Direction[] = ["up", "right", "down", "left"];

// Copy both the card and its edges: battle modifications must never leak into the school.
export function charmCard(card: FishCard, charm: "nautilus-dial" | "coral-mail"): FishCard {
  const edges = card.edges.map((edge) => ({ ...edge }));
  if (charm === "nautilus-dial") edges.forEach((edge) => { edge.direction = CLOCKWISE[(CLOCKWISE.indexOf(edge.direction) + 1) % 4]; });
  else for (const direction of CLOCKWISE) if (!edges.some((edge) => edge.direction === direction)) edges.push({ direction, effect: "weak" });
  return { ...card, edges };
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
    ctx.fillRect((x + 2) * scale, (y + 2) * scale, scale, scale);
  }));
  return canvas;
}
