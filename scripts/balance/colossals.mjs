import fs from 'node:fs';
import assert from 'node:assert/strict';
import {match} from './matches.mjs';
import {COLOSSALS,colossalSchool} from '../../src/game/run/colossals.ts';
import {STARTERS} from '../../src/game/data/starterFish.ts';
import {REGIONS} from '../../src/game/run/maps.ts';
import {weightedRivalSchool} from '../../src/game/run/rivalSchools.ts';
import {resolvePlacement} from '../../src/game/combat.ts';
import {canPlaceFish,scoreBoard} from '../../src/game/abilities.ts';
import {placementOptions} from '../../src/game/abilityOptions.ts';
import {scoringReefs} from '../../src/game/battleRules.ts';
import {randomCharms} from '../../src/game/data/tideCharms.ts';
import {random} from '../../src/game/run/maps.ts';

// Explicit player policy in actual board ownership: the asymmetric boss must never
// be mirrored into the player's seat. This is a greedy probe, not human play evidence.
export function playerPolicy(state,hand,rng){
 const size=Math.sqrt(state.board.length),reefs=[...scoringReefs(size)];let best;
 hand.forEach((slot,slotIndex)=>{if(slot.played)return;state.board.forEach((_,index)=>{
  if(!canPlaceFish(state.board,index,slot.card,state.terrain,state.memory))return;
  for(const {choice} of placementOptions(state,index,slot.card)){
   const result=resolvePlacement(state,index,slot.card,size,false,choice),score=scoreBoard(result.board);
   let value=18*(score.player-score.rival)+rng()*.01;
   result.board.forEach((c,i)=>{if(!c)return;const sign=c.owner==='player'?1:-1;
    const distance=Math.min(...reefs.map(r=>Math.abs(i%size-r%size)+Math.abs(Math.floor(i/size)-Math.floor(r/size))));
    value+=sign*(4+3/(1+distance)-(result.shocked.has(c.id)?c.edges.length*.65:0));
   });
   if(!best||value>best.value)best={slotIndex,index,abilityChoice:choice,value};
  }
 });});return best;
}
const count=Number(process.argv[2]??12),start=Number(process.argv[3]??7100),rows=[];
for(let region=0;region<3;region++) {
 const pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));
 for(let seed=start;seed<start+count;seed++){
  const mixed=STARTERS.filter(c=>REGIONS.slice(0,region+1).some(r=>r.pool.includes(c.texture)));
  const player=weightedRivalSchool(mixed,'player:'+seed,['attackers','defenders','neutral'][seed%3],false,region).map((c,i)=>({...c,id:'player-'+i,owner:'player'}));
  const rival=colossalSchool(pool,region,'school:'+seed),loadout=seed%2?randomCharms(random('charms:'+seed)):[];
  for(const enabled of [false,true]){
   const tides=['player','rival'].map(first=>match({region,seed:'colossal:'+seed,current:true,customDecks:{player,rival},first,playLimit:4+region,
    colossal:enabled?COLOSSALS[region].id:undefined,playerPolicy,loadout,charmMode:'player'}));
   const margin=tides.reduce((n,t)=>n+t.difference,0);
   for(const t of tides)assert.ok(t.plays.player<=4+region&&t.plays.rival<=4+region);
   rows.push({region,seed,enabled,margin,result:Math.sign(margin),kills:tides.reduce((n,t)=>n+t.killedIds.filter(id=>id.startsWith('player')).length,0),plays:tides.reduce((n,t)=>n+t.plays.player+t.plays.rival,0)});
  }
 }
 console.log(JSON.stringify({region,...Object.fromEntries([false,true].map(enabled=>{const r=rows.filter(x=>x.region===region&&x.enabled===enabled);return [enabled?'boss':'sameSchoolWithoutPower',{matches:r.length,wins:r.filter(x=>x.result>0).length,draws:r.filter(x=>!x.result).length,losses:r.filter(x=>x.result<0).length,meanMargin:r.reduce((n,x)=>n+x.margin,0)/r.length,meanCasualties:r.reduce((n,x)=>n+x.kills,0)/r.length,meanPlays:r.reduce((n,x)=>n+x.plays,0)/r.length}];}))}));
}
fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync(`.cache/colossals-${start}.json`,JSON.stringify(rows));
