import type { FishCard } from '../data/starterFish.ts';
import type { CombatFrame } from '../combatFeedback.ts';
import type { Effect } from './synthesis.ts';

// Read only committed presentation frames; AI simulations never reach this function.
export function combatCue(before: Array<FishCard | null>, shocked: Set<string>, frame: CombatFrame): Effect | undefined {
  const old = new Map(before.flatMap((c, i) => c ? [[c.id, i] as const] : []));
  const next = new Set(frame.board.flatMap(c => c ? [c.id] : []));
  if ([...old.keys()].some(id => !next.has(id))) return 'remove';
  if ([...frame.shocked].some(id => !shocked.has(id))) return 'shock';
  if (frame.board.some((c, i) => c && old.has(c.id) && old.get(c.id) !== i)) return frame.label === 'Whirlpool' ? 'whirlpool' : 'move';
  if ([...next].some(id => !old.has(id))) return 'place';
  if (frame.notes.length) return 'block';
  if (frame.board.some(c => c && c.edges.length > (before.find(p => p?.id === c.id)?.edges.length ?? c.edges.length))) return 'charm';
  return undefined;
}
