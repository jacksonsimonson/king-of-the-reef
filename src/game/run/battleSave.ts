import { ABILITIES } from '../abilities.ts';
import { STARTERS, type FishCard } from '../data/starterFish.ts';
import type { HandSlot } from '../combat.ts';
import { validRules, type BattleRules } from '../battleRules.ts';
import { isCharm, CHARM_CAPACITY, type CharmId } from '../data/tideCharms.ts';
import { tidePlayLimit, type TideScore } from '../twoTide.ts';

export interface BattleOpening {
  playerHand: HandSlot[]; rivalHand: HandSlot[]; playerDeck: FishCard[]; rivalDeck: FishCard[]; charms: CharmId[];
}
export interface TwoTideSave {
  opening: BattleOpening; scores: TideScore[]; seed: string; intermission: boolean;
  charms: CharmId[]; spentCharms: CharmId[]; killedIds: string[];
}
export function voyageMatchFormat(saved?: BattleSave): 'classic' | 'two-tide' { return saved && !saved.twoTide ? 'classic' : 'two-tide'; }

/** Only stable decision points are saved. Animation frames are never checkpoints. */
export interface BattleSave {
  version: 1; nodeId: string; board: Array<FishCard | null>;
  playerHand: HandSlot[]; rivalHand: HandSlot[]; playerDeck: FishCard[]; rivalDeck: FishCard[];
  shocked: string[]; killedIds: string[]; plays: { player: number; rival: number };
  turn: 'player' | 'rival'; rngCalls: number;
  pendingReveal: 'card' | null; rallySlot: number | null;
  rules?: BattleRules;
  twoTide?: TwoTideSave;
}
export function validBattleSave(value: unknown, nodeId: string): value is BattleSave {
  if (!value || typeof value !== 'object') return false;
  const s = value as BattleSave;
  if (s.rules !== undefined && !validRules(s.rules)) return false;
  const size = s.rules?.size ?? 5, limit = s.twoTide && s.rules ? tidePlayLimit(s.rules.region) : s.rules?.plays ?? 5;
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
    || !Array.isArray(s.board) || s.board.length !== size * size || !s.board.every(f => f === null || card(f))
    || !hand(s.playerHand, 'player') || !hand(s.rivalHand, 'rival') || !deck(s.playerDeck, 'player') || !deck(s.rivalDeck, 'rival')
    || !s.plays || !integer(s.plays.player, limit) || !integer(s.plays.rival, limit)
    || ![null, 'card'].includes(s.pendingReveal) || !(s.rallySlot === null || integer(s.rallySlot, s.playerHand.length - 1))) return false;
  const live = [...s.board.filter(f => f !== null), ...s.playerHand.filter(h => !h.played).map(h => h.card), ...s.rivalHand.filter(h => !h.played).map(h => h.card), ...s.playerDeck, ...s.rivalDeck];
  if (new Set(live.map(f => f.id)).size !== live.length) return false;
  if (![s.shocked, s.killedIds].every(ids => Array.isArray(ids) && ids.every(id => typeof id === 'string') && new Set(ids).size === ids.length)) return false;
  if (s.killedIds.some(id => live.some(f => f.id === id))) return false;
  if (s.pendingReveal && (s.turn !== 'player' || !s.rivalHand.some(h => !h.played && !h.revealed))) return false;
  if (s.rallySlot !== null && (s.turn !== 'player' || s.pendingReveal || !s.playerHand[s.rallySlot].played || !s.playerDeck.length)) return false;
  if (s.twoTide !== undefined) {
    const t = s.twoTide, o = t?.opening;
    const charms = (ids: CharmId[]) => Array.isArray(ids) && ids.length <= CHARM_CAPACITY && ids.every(isCharm);
    const subset = (a: CharmId[], b: CharmId[]) => a.every(id => a.filter(c => c === id).length <= b.filter(c => c === id).length);
    if (!s.rules || !t || !o || typeof t.seed !== 'string' || t.seed.length > 500 || typeof t.intermission !== 'boolean'
      || !Array.isArray(t.scores) || t.scores.length > 1 || t.scores.some(score => !score || !integer(score.player, 1000) || !integer(score.rival, 1000))
      || t.intermission && (t.scores.length !== 1 || s.pendingReveal !== null || s.rallySlot !== null)
      || !hand(o.playerHand, 'player') || !hand(o.rivalHand, 'rival') || !deck(o.playerDeck, 'player') || !deck(o.rivalDeck, 'rival')
      || [...o.playerHand, ...o.rivalHand].some(slot => slot.played || slot.revealed)
      || !charms(o.charms) || !charms(t.charms) || !charms(t.spentCharms) || !subset(t.charms, o.charms) || !subset(t.spentCharms, o.charms)
      || !Array.isArray(t.killedIds) || t.killedIds.some(id => typeof id !== 'string') || new Set(t.killedIds).size !== t.killedIds.length) return false;
    const openingCards = [...o.playerHand.map(s => s.card), ...o.rivalHand.map(s => s.card), ...o.playerDeck, ...o.rivalDeck];
    if (new Set(openingCards.map(c => c.id)).size !== openingCards.length) return false;
    if (t.killedIds.some(id => !openingCards.some(c => c.id === id))) return false;
    // Every charge missing this tide must be represented in the permanent-spending ledger.
    if (o.charms.some(id => o.charms.filter(c => c === id).length - t.charms.filter(c => c === id).length > t.spentCharms.filter(c => c === id).length)) return false;
  }
  return true;
}
