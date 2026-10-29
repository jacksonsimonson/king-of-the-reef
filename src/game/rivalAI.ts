import {placementOptions} from './abilityOptions.ts';
import {beginAbilityTurn,readyGrowth,growArm,blankSides,type AbilityChoice} from './battleAbilityState.ts';
import { canPlaceFish, hasAbility, scoreBoard } from './abilities.ts';
import { scoringReefs, type Difficulty } from './battleRules.ts';
import { resolvePlacement, type BattleState, type HandSlot } from './combat.ts';
import type { FishCard } from './data/starterFish.ts';

export interface RivalPosition extends BattleState {
  hand: readonly HandSlot[]; difficulty: Difficulty; rivalPlaysLeft: number; playerPlaysLeft: number;
  /** Public catalog possibilities and explicitly revealed cards only; never hidden hand/reserve contents. */
  publicThreats: readonly FishCard[];
}
function value(state: BattleState, positional: boolean, terminal = false): number {
  const score = scoreBoard(state.board);
  if (terminal) return (score.rival - score.player) * 1000;
  let result = (score.rival - score.player) * 18;
  const size = Math.sqrt(state.board.length), reefs = [...scoringReefs(size)];
  for (const [index, card] of state.board.entries()) {
    if (!card) continue;
    const sign = card.owner === 'rival' ? 1 : -1;
    result += sign * 4;
    if (state.shocked.has(card.id)) result -= sign * card.edges.length * .65;
    result += sign*card.edges.filter(e=>e.effect==='weak').length*.15;
    if (!positional) continue;
    const distance = Math.min(...reefs.map(r => Math.abs(index % size - r % size) + Math.abs(Math.floor(index / size) - Math.floor(r / size))));
    result += sign * (3 / (1 + distance));
    if (reefs.includes(index)) {
      result += sign * (hasAbility(card, 'anchor') || hasAbility(card, 'bulwark') || state.terrain?.features?.get(index) === 'kelp' ? 2 : 0);
      result += sign * card.edges.filter(e => ['weak', 'spines'].includes(e.effect)).length * .4;
    }
  }
  return result;
}
export function chooseRivalMove(position: RivalPosition, rng: () => number): { slotIndex: number; index: number; abilityChoice: AbilityChoice } | undefined {
  if (position.rivalPlaysLeft <= 0) return undefined;
  const candidates: Array<{slotIndex: number; index: number; abilityChoice: AbilityChoice; score: number; result: ReturnType<typeof resolvePlacement>}> = [];
  position.hand.forEach((slot, slotIndex) => {
    if (slot.played) return;
    position.board.forEach((_, index) => {
      if (!canPlaceFish(position.board, index, slot.card, position.terrain!,position.memory)) return;
      for(const option of placementOptions(position,index,slot.card)){
      const result = resolvePlacement(position, index, slot.card,Math.sqrt(position.board.length),false,option.choice);
      const terminal = position.rivalPlaysLeft === 1 && position.playerPlaysLeft === 0;
      const score = value({...result, terrain: position.terrain}, position.difficulty !== 'beginner', terminal)
        + rng() * (position.difficulty === 'beginner' && !terminal ? 5 : .01);
      candidates.push({slotIndex, index, abilityChoice:option.choice, score, result});
      }
    });
  });
  candidates.sort((a, b) => b.score - a.score);
  if (position.difficulty !== 'expert' || position.playerPlaysLeft <= 0) return candidates[0];
  // Bounded two-ply search: six promising moves against up to six public response profiles.
  const finalists = candidates.slice(0, 6);
  for (const move of finalists) {
    let state: BattleState = {board: move.result.board, shocked: move.result.shocked, terrain: position.terrain,memory:move.result.memory};
    state.memory=beginAbilityTurn(state,'player');
    for(const fish of readyGrowth(state,'player'))state={...state,...growArm(state,fish.id,blankSides(fish)[0])};
    let worst = Infinity;
    for (const [i, possible] of position.publicThreats.slice(0, 6).entries()) {
      const card = {...possible, id: `forecast-${i}`, owner: 'player' as const};
      state.board.forEach((_, index) => {
        if (!canPlaceFish(state.board, index, card, state.terrain!,state.memory)) return;
        for(const option of placementOptions(state,index,card)){
        const response = resolvePlacement(state, index, card,Math.sqrt(state.board.length),false,option.choice);
        worst = Math.min(worst, value({...response, terrain: state.terrain}, true, position.rivalPlaysLeft === 1 && position.playerPlaysLeft === 1));
        }
      });
    }
    if (Number.isFinite(worst)) move.score = worst + move.score * .15;
  }
  finalists.sort((a, b) => b.score - a.score);
  return finalists[0];
}
