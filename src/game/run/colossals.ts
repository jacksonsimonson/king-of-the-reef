import { random } from './maps.ts';
import type { FishCard, Direction } from '../data/starterFish.ts';
import type { CardAbility } from '../abilities.ts';
import type { ColossalId } from '../colossalState.ts';

export interface ColossalReward {texture:string;ability:CardAbility;remove:Direction}
export const COLOSSALS: {id:ColossalId;name:string;pool:string[];rewards:ColossalReward[]}[] = [
  {id:'reefback',name:'Reefback King',pool:['hermit-crab','decorator-crab','giant-clam','boxfish','staghorn-coral','mantis-shrimp','crab','clownfish','coral-grouper','seahorse'],
    rewards:[{texture:'hermit-crab',ability:'escort',remove:'left'},{texture:'giant-clam',ability:'inflate',remove:'down'}]},
  {id:'midnight',name:'Midnight Marauder',pool:['lanternfish','viperfish','anglerfish','gulper-eel','colossal-squid','pelagic-octopus','vampire-squid','greenland-shark','goblin-shark','barreleye'],
    rewards:[{texture:'lanternfish',ability:'sonar',remove:'left'},{texture:'gulper-eel',ability:'pack-hunt',remove:'left'}]},
  {id:'sunken-eye',name:'The Sunken Eye',pool:['ghost-net','anchor-crab','rust-lobster','lighthouse-hermit','lightning-marlin','cannonball-ray','figurehead-fish','drowned-diver','compass-jelly','bottle-ocean'],rewards:[]},
];
export function companionCard(definition: Omit<FishCard,'owner'|'condition'>, reward:ColossalReward):FishCard {
  return {...definition,edges:definition.edges.filter(e=>e.direction!==reward.remove).map(e=>({...e})),ability:reward.ability,owner:'player',condition:'healthy'};
}

/** Weighted sampling with a two-copy cap. Disabled cards are respected; small enabled pools fall back safely. */
export function colossalSchool(pool: FishCard[], region: number, seed: string): FishCard[] {
  const rng=random(seed+':colossal'),theme=COLOSSALS[region].pool,counts=new Map<string,number>();
  if (!pool.length) return [];
  return Array.from({length:10},(_,i)=>{
    let eligible=pool.filter(f=>(counts.get(f.texture)??0)<2);
    if (!eligible.length) eligible=pool;
    const core=eligible.filter(f=>theme.includes(f.texture));
    if (i<6 && core.length) eligible=core;
    const weights=eligible.map(f=>theme.includes(f.texture)?6:1),total=weights.reduce((a,b)=>a+b,0);
    let pick=rng()*total,index=0;
    for (;index<weights.length-1&&pick>=weights[index];index++)pick-=weights[index];
    const fish=eligible[index];counts.set(fish.texture,(counts.get(fish.texture)??0)+1);
    return {...fish,edges:fish.edges.map(e=>({...e})),id:'colossal-'+i,owner:'rival',condition:'healthy'};
  });
}
