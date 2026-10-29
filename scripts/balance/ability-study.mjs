import fs from 'node:fs';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_SIX_STARTERS} from '../../src/game/data/starterFish.ts';
import {ABILITY_ASSIGNMENTS} from '../../src/game/data/abilityAssignments.ts';
import {REGIONS} from '../../src/game/run/maps.ts';
import {match} from './matches.mjs';
const offset=Number(process.argv[2]??0),count=Number(process.argv[3]??4);
const rows=[];
for(const texture of Object.keys(ABILITY_ASSIGNMENTS)){
 const region=REGIONS.findIndex(r=>r.pool.includes(texture)),results=[];
 const common=['minnow','anchovy','sardine','goby','blenny','crab'];
 const regional=REGIONS[region].pool.filter(id=>id!==texture&&!common.includes(id));
 for(let seed=offset;seed<offset+count;seed++)for(const first of ['player','rival'])for(const charms of [false,true]){
  const ids=[texture,...common,regional[seed%regional.length]];
  const enemies=[...common,...regional.slice(seed%Math.max(1,regional.length-2),seed%Math.max(1,regional.length-2)+2)];
  const trial={seed,first,charms};
  for(const version of ['old','new']){
   const decks=Object.fromEntries(['player','rival'].map(owner=>[owner,(owner==='player'?ids:enemies).map((id,i)=>{
    const catalog=owner==='player'&&id===texture&&version==='new'?STARTERS:BATCH_SIX_STARTERS;
    return {...catalog.find(c=>c.texture===id),id:owner+'-'+i,owner,condition:'healthy'};
   })]));
   const r=match({seed:`ABILITY-${seed}`,region,current:true,customDecks:decks,first,difficulty:'tactical',playerDifficulty:'tactical',playLimit:4+region,charmMode:'both',loadout:charms?['anchor-stone','reef-beacon','nautilus-dial']:[]});
   assert.ok(r.plays.player<=4+region&&r.plays.rival<=4+region);
   trial[version]={margin:r.difference,played:r.trace.some(t=>t.owner==='player'&&t.card===texture),casualties:r.killedIds.filter(id=>id.startsWith('player-')).length};
  }
  results.push(trial);
 }
 const mean=key=>results.reduce((n,r)=>n+r[key].margin,0)/results.length;
 const row={texture,region,tides:results.length*2,oldMargin:mean('old'),newMargin:mean('new'),delta:mean('new')-mean('old'),newPlays:results.filter(r=>r.new.played).length,results};rows.push(row);
 console.log(JSON.stringify({...row,results:undefined}));
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/abilities-${offset}.json`,JSON.stringify({offset,count,assignments:ABILITY_ASSIGNMENTS,rows},null,2));
