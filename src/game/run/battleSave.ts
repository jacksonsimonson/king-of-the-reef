import { ABILITIES } from '../abilities.ts';
import { STARTERS, type FishCard } from '../data/starterFish.ts';
import type { HandSlot } from '../combat.ts';

/** Only stable decision points are saved. Animation frames are never checkpoints. */
export interface BattleSave {
  version: 1; nodeId: string; board: Array<FishCard | null>;
  playerHand: HandSlot[]; rivalHand: HandSlot[]; playerDeck: FishCard[]; rivalDeck: FishCard[];
  shocked: string[]; killedIds: string[]; plays: { player: number; rival: number };
  turn: 'player' | 'rival'; rngCalls: number;
  pendingReveal: 'card' | null; rallySlot: number | null;
}
export function validBattleSave(value: unknown, nodeId: string): value is BattleSave {
  if (!value || typeof value !== 'object') return false;
  const s = value as BattleSave;
  const integer = (n: number, max: number) => Number.isInteger(n) && n >= 0 && n <= max;
  const card = (f: FishCard) => f && typeof f.id === 'string' && typeof f.name === 'string' && typeof f.species === 'string'
    && STARTERS.some(base => base.texture === f.texture) && ['player', 'rival'].includes(f.owner) && f.condition === 'healthy'
    && Array.isArray(f.edges) && f.edges.length <= 4 && new Set(f.edges.map(e => e?.direction)).size === f.edges.length
    && f.edges.every(e => e && ['up', 'right', 'down', 'left'].includes(e.direction) && ['standard', 'double', 'weak', 'bigger-fish', 'swap', 'hook', 'wave', 'shock', 'spines', 'ram', 'follow-current', 'bounce', 'dive'].includes(e.effect))
    && (f.ability === undefined || Object.hasOwn(ABILITIES, f.ability))
    && (f.battleAbilities === undefined || Array.isArray(f.battleAbilities) && f.battleAbilities.every(a => Object.hasOwn(ABILITIES, a)));
  const hand = (slots: HandSlot[], owner: string) => Array.isArray(slots) && slots.length <= 5 && slots.every(slot => slot && typeof slot.played === 'boolean' && (slot.revealed === undefined || typeof slot.revealed === 'boolean') && card(slot.card) && slot.card.owner === owner);
  const deck = (cards: FishCard[], owner: string) => Array.isArray(cards) && cards.every(f => card(f) && f.owner === owner);
  if (s.version !== 1 || s.nodeId !== nodeId || !['player', 'rival'].includes(s.turn) || !integer(s.rngCalls, 100000)
    || !Array.isArray(s.board) || s.board.length !== 25 || !s.board.every(f => f === null || card(f))
    || !hand(s.playerHand, 'player') || !hand(s.rivalHand, 'rival') || !deck(s.playerDeck, 'player') || !deck(s.rivalDeck, 'rival')
    || !s.plays || !integer(s.plays.player, 5) || !integer(s.plays.rival, 5)
    || ![null, 'card'].includes(s.pendingReveal) || !(s.rallySlot === null || integer(s.rallySlot, s.playerHand.length - 1))) return false;
  const live = [...s.board.filter(f => f !== null), ...s.playerHand.filter(h => !h.played).map(h => h.card), ...s.rivalHand.filter(h => !h.played).map(h => h.card), ...s.playerDeck, ...s.rivalDeck];
  if (new Set(live.map(f => f.id)).size !== live.length) return false;
  if (![s.shocked, s.killedIds].every(ids => Array.isArray(ids) && ids.every(id => typeof id === 'string') && new Set(ids).size === ids.length)) return false;
  if (s.killedIds.some(id => live.some(f => f.id === id))) return false;
  if (s.pendingReveal && (s.turn !== 'player' || !s.rivalHand.some(h => !h.played && !h.revealed))) return false;
  if (s.rallySlot !== null && (s.turn !== 'player' || s.pendingReveal || !s.playerHand[s.rallySlot].played || !s.playerDeck.length)) return false;
  return true;
}
