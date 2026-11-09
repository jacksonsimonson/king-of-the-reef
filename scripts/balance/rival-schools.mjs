import {STARTERS} from '../../src/game/data/starterFish.ts';
import {REGIONS} from '../../src/game/run/maps.ts';
import {RIVAL_STYLES,weightedRivalSchool,schoolRating} from '../../src/game/run/rivalSchools.ts';
import {match} from './matches.mjs';
const start=Number(process.argv[2]??3000),count=Number(process.argv[3]??4);
for(let region=0;region<3;region++)for(const style of Object.keys(RIVAL_STYLES)){
 const pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));
 const rows=[];
 for(let seed=start;seed<start+count;seed++){
  const player=weightedRivalSchool(pool,'player:'+seed,'balanced').map((c,i)=>({...c,id:'player-'+i,owner:'player'}));
  for(const elite of [false,true]){
   const rival=weightedRivalSchool(pool,'rival:'+seed,style,elite);
   for(const first of ['player','rival'])for(const swapped of [false,true]){
    const owned=(cards,owner)=>cards.map((c,i)=>({...c,id:owner+'-'+i,owner}));
    const customDecks=swapped?{player:owned(rival,'player'),rival:owned(player,'rival')}:{player,rival};
    const result=match({region,seed:'weighted:'+seed,first,current:true,difficulty:process.argv[4]??'tactical',customDecks});
    rows.push({elite,margin:result.difference*(swapped?-1:1),rating:schoolRating(rival),kills:result.killedIds.length});
   }
  }
 }
 console.log(JSON.stringify({region,style,tides:rows.length,...Object.fromEntries([false,true].map(elite=>{const r=rows.filter(x=>x.elite===elite);return [elite?'elite':'normal',{margin:r.reduce((n,x)=>n+x.margin,0)/r.length,rating:r.reduce((n,x)=>n+x.rating,0)/r.length,kills:r.reduce((n,x)=>n+x.kills,0)/r.length}]}))}));
}
