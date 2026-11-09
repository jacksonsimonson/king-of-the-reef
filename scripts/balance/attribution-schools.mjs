import assert from 'node:assert/strict';
import {random,REGIONS} from '../../src/game/run/maps.ts';
import {rivalDeckFor,runFishDefinition} from '../../src/game/run/state.ts';

/** Diagnostic controls only: all rivals retain ten healthy cards and unique copy IDs. */
export function attributionSchool(run,composition){
 if(composition==='weighted')return rivalDeckFor(run);
 assert.ok(['uniform','carried'].includes(composition));
 const pool=composition==='carried'?run.school.filter(c=>c.condition==='healthy'):
  [...new Set(REGIONS[run.region].pool)].filter(t=>run.roster.includes(t)).map(t=>runFishDefinition(run,t));
 assert.ok(pool.length);
 const rng=random(`${run.seed}:${run.pending}:composition`),cards=[];
 while(cards.length<10){
  const available=[...pool];
  for(let i=available.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[available[i],available[j]]=[available[j],available[i]];}
  cards.push(...available.slice(0,10-cards.length));
 }
 return cards.map((c,i)=>({...structuredClone(c),id:`rival-${i}`,owner:'rival',condition:'healthy'}));
}
