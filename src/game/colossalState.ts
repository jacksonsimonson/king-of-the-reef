export type ColossalId = 'reefback' | 'midnight' | 'sunken-eye';
export const COLOSSAL_IDS: ColossalId[] = ['reefback', 'midnight', 'sunken-eye'];
export interface ColossalState {
  id: ColossalId; limit: number; plays: {player: number; rival: number};
  prey?: {id: string; index: number}; lane?: number;
}
export function freshColossal(id: ColossalId, limit: number): ColossalState {
  return {id, limit, plays: {player: 0, rival: 0}};
}
export function validColossal(value: unknown, size: number): value is ColossalState {
  if (!value || typeof value !== 'object') return false;
  const c = value as ColossalState;
  const n = (v: number, max: number) => Number.isInteger(v) && v >= 0 && v <= max;
  return COLOSSAL_IDS.includes(c.id) && [4,5,6].includes(c.limit) && Boolean(c.plays)
    && n(c.plays.player,c.limit) && n(c.plays.rival,c.limit)
    && (c.prey === undefined || c.id === 'midnight' && typeof c.prey.id === 'string' && n(c.prey.index,size*size-1))
    && (c.lane === undefined || c.id === 'sunken-eye' && n(c.lane,size-1));
}
