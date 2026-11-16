import {resolvePlacement} from '../../src/game/combat.ts';
import {canPlaceFish,scoreBoard} from '../../src/game/abilities.ts';
import {placementOptions} from '../../src/game/abilityOptions.ts';
import {scoringReefs} from '../../src/game/battleRules.ts';
// Explicit player policy in actual board ownership: the asymmetric boss must never
// be mirrored into the player's seat. This is a greedy probe, not human play evidence.
export function playerPolicy(state,hand,rng,openingRank=0,positionValue=()=>0){
 const size=Math.sqrt(state.board.length),reefs=[...scoringReefs(size)],candidates=[];
 hand.forEach((slot,slotIndex)=>{if(slot.played)return;state.board.forEach((_,index)=>{
  if(!canPlaceFish(state.board,index,slot.card,state.terrain,state.memory))return;
  for(const {choice} of placementOptions(state,index,slot.card)){
   const result=resolvePlacement(state,index,slot.card,size,false,choice),score=scoreBoard(result.board);
   let value=18*(score.player-score.rival)+rng()*.01+positionValue(result);
   result.board.forEach((c,i)=>{if(!c)return;const sign=c.owner==='player'?1:-1;
    const distance=Math.min(...reefs.map(r=>Math.abs(i%size-r%size)+Math.abs(Math.floor(i/size)-Math.floor(r/size))));
    value+=sign*(4+3/(1+distance)-(result.shocked.has(c.id)?c.edges.length*.65:0));
   });
   candidates.push({slotIndex,index,abilityChoice:choice,value});
  }
 });});candidates.sort((a,b)=>b.value-a.value);
 return candidates[state.memory?.colossal?.plays.player===0?Math.min(openingRank,candidates.length-1):0];
}
