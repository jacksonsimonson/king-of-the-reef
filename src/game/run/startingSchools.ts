import { REGIONS } from './maps.ts';

export const STARTING_SCHOOLS = [
  { id: 'guides', name: 'Tidepool Guides', style: 'Flexible positioning',
    plan: 'Use simple pushes to deliver allies, then use Shrimp, Sea Star and Octopus to arrange the next reef approach.',
    weakness: 'Few protected sides. Exposed holders need careful placement and timely counters.',
    textures: ['minnow','anchovy','goby','crab','blenny','shrimp','sea-star','octopus'] },
  { id: 'shellguard', name: 'Shellguard', style: 'Guarded reef control',
    plan: 'Deliver shelled creatures through their open sides. Mantis Shrimp breaks ordinary defenses while your holders protect selected approaches.',
    weakness: 'Shields can block your own delivery. Limited reach makes early positioning important.',
    textures: ['minnow','anchovy','goby','blenny','decorator-crab','horseshoe-crab','frogfish','mantis-shrimp'] },
  { id: 'tethers', name: 'Reef Tethers', style: 'Pulls and precise spacing',
    plan: 'Leave a one-tile gap for your Hooks. Pull allies onto reefs or draw opponents away from their formations.',
    weakness: 'Hooks need a gap and can move allies out of position. Few shields protect your holders.',
    textures: ['minnow','anchovy','goby','blenny','shrimp','sea-star','christmas-tree-worm','comb-jelly'] },
] as const;
export type StartingSchoolId = typeof STARTING_SCHOOLS[number]['id'];
export function isStartingSchool(value: unknown): value is StartingSchoolId {
  return STARTING_SCHOOLS.some(s=>s.id===value);
}
export function schoolAvailable(id: StartingSchoolId, enabled: readonly string[]): boolean {
  return STARTING_SCHOOLS.find(s=>s.id===id)!.textures.every(t=>enabled.includes(t));
}
/** Named schools never silently substitute disabled cards. Legacy/default calls retain their old fallback. */
export function startingTextures(enabled: readonly string[], id?: StartingSchoolId): string[] {
  if(id!==undefined){
    if(!isStartingSchool(id)||!schoolAvailable(id,enabled))throw new Error('Starting school is unavailable in the enabled roster');
    return [...STARTING_SCHOOLS.find(s=>s.id===id)!.textures];
  }
  const preferred: readonly string[]=STARTING_SCHOOLS[0].textures;
  const pool=[...preferred.filter(t=>enabled.includes(t)),...REGIONS[0].pool.filter(t=>enabled.includes(t)&&!preferred.includes(t))].slice(0,8);
  return Array.from({length:pool.length?8:0},(_,i)=>pool[i%pool.length]);
}
