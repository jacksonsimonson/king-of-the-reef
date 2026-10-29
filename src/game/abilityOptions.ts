import {hasAbility} from './abilities.ts';
import {resolvePlacement,type BattleState} from './combat.ts';
import {adjacent,blankSides,SIDES,safeEmpty,type AbilityChoice} from './battleAbilityState.ts';
import {placementDestination,placementCard} from './terrain.ts';
import type {FishCard} from './data/starterFish.ts';
export interface PlacementOption {label:string;choice:AbilityChoice}
const tile=(n:number,size:number)=>String.fromCharCode(65+n%size)+(Math.floor(n/size)+1);
/** Options use only the public board. Post-edge destinations are resolved without hidden cards. */
export function placementOptions(state:BattleState,index:number,card:FishCard):PlacementOption[] {
 const out:PlacementOption[]=[{label:'Keep normal play / skip optional effect',choice:{}}],size=Math.sqrt(state.board.length);
 if(hasAbility(card,'true-north'))for(let n=1;n<4;n++)out.push({label:`Rotate ${n*90}° clockwise`,choice:{rotation:n}});
 if(hasAbility(card,'battle-plan'))out.push({label:'Reverse edge order',choice:{reverse:true}});
 if(hasAbility(card,'focused-strike')||hasAbility(card,'gentle-giant'))for(const e of card.edges){
  if(hasAbility(card,'focused-strike')?e.effect==='double':!['weak','spines'].includes(e.effect))out.push({label:`${hasAbility(card,'focused-strike')?'Focus':'Skip'} ${e.direction} ${e.effect}`,choice:{direction:e.direction}});
 }
 const placed=placementCard(card,index,state.terrain),entry=placementDestination(state.board,index,state.terrain,size);
 if(hasAbility(card,'borrowed-armor'))for(const d of blankSides(placed))out.push({label:`Shield ${d}`,choice:{direction:d}});
 if(hasAbility(card,'mimicry')){
  const effects=new Set(SIDES.flatMap(d=>{const n=adjacent(entry,d,size);return n===null?[]:state.board[n]?.edges.map(e=>e.effect).filter(e=>['standard','hook','weak'].includes(e))??[];}));
  for(const direction of blankSides(placed))for(const effect of effects)out.push({label:`Copy ${effect==='weak'?'Shield':effect} onto ${direction}`,choice:{direction,effect}});
 }
 if(['slipstream','towline','grooming','snare-line'].some(a=>hasAbility(card,a as NonNullable<FishCard['ability']>))){
  // Suppress whirlpool only while finding the pre-teleport post-edge choice origin.
  const terrain=state.terrain?{...state.terrain,whirlpools:[-1,-1] as [number,number]}:undefined;
  const base=resolvePlacement({...state,terrain},index,card),source=base.board.findIndex(c=>c?.id===card.id);
  if(source<0)return out;
  const after={...state,...base};
  for(const direction of SIDES){const n=adjacent(source,direction,size);
   if(hasAbility(card,'slipstream')&&safeEmpty(after,n))out.push({label:`Step to ${tile(n,size)}`,choice:{direction}});
   if(hasAbility(card,'snare-line')&&safeEmpty(after,n)&&!base.memory.decoys.some(t=>t.index===n))out.push({label:`Snare ${tile(n,size)}`,choice:{direction}});
   if(hasAbility(card,'towline')&&safeEmpty(after,n)){
    const far=adjacent(n,direction,size),ally=far===null?null:base.board[far];
    if(ally?.owner===card.owner&&!hasAbility(ally,'anchor')&&state.terrain?.features?.get(far!)!=='kelp')out.push({label:`Pull ${ally.name} from ${tile(far!,size)} to ${tile(n,size)}`,choice:{direction}});
   }
   const ally=n===null?null:base.board[n];
   if(hasAbility(card,'grooming')&&ally?.owner===card.owner)for(const rotation of [0,1,3])out.push({label:`Groom ${ally.name} at ${tile(n!,size)}${rotation?' · turn '+(rotation===1?'clockwise':'counterclockwise'):' · keep orientation'}`,choice:{target:n!,rotation}});
  }
 }
 return out;
}
