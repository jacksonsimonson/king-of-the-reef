import {match} from './matches.mjs';
import {COLOSSALS,companionCard} from '../../src/game/run/colossals.ts';
import {STARTERS} from '../../src/game/data/starterFish.ts';
import {REGIONS,random} from '../../src/game/run/maps.ts';
import {weightedRivalSchool} from '../../src/game/run/rivalSchools.ts';
import {randomCharms} from '../../src/game/data/tideCharms.ts';
const count=Number(process.argv[2]??12);
for(let boss=0;boss<2;boss++)for(const reward of COLOSSALS[boss].rewards){
 const region=boss+1,base=STARTERS.find(c=>c.texture===reward.texture),rows=[];
 for(let seed=7400;seed<7400+count;seed++){
  const mixed=STARTERS.filter(c=>REGIONS.slice(0,region+1).some(r=>r.pool.includes(c.texture))),pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));
  const school=weightedRivalSchool(mixed,'reward-player:'+seed,'neutral',false,region),rival=weightedRivalSchool(pool,'reward-rival:'+seed,'neutral',false,region);
  for(const upgraded of [false,true]){
   const player=[upgraded?companionCard(base,reward):{...base,owner:'player',condition:'healthy'},...school.slice(1)].map((c,i)=>({...c,id:'player-'+i,owner:'player'}));
   const tides=['player','rival'].map(first=>match({region,seed:'reward:'+seed,current:true,difficulty:'tactical',customDecks:{player,rival},first,playLimit:4+region,loadout:seed%2?randomCharms(random('charms:'+seed)):[],charmMode:'player'}));
   rows.push({upgraded,margin:tides.reduce((n,t)=>n+t.difference,0),uses:tides.flatMap(t=>t.trace).filter(t=>t.owner==='player'&&t.card===reward.texture).length});
  }
 }
 console.log(JSON.stringify({texture:reward.texture,...Object.fromEntries([false,true].map(upgraded=>{const r=rows.filter(x=>x.upgraded===upgraded);return [upgraded?'companion':'ordinary',{matches:r.length,meanMargin:r.reduce((n,x)=>n+x.margin,0)/r.length,uses:r.reduce((n,x)=>n+x.uses,0)}];}))}));
}
