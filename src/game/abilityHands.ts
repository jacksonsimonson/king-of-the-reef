import {ABILITIES,hasAbility} from './abilities.ts';
import {refillSlot} from './data/tideCharms.ts';
import type {FishCard,Owner} from './data/starterFish.ts';
import type {HandSlot} from './combat.ts';
import type {AbilityMemory} from './battleAbilityState.ts';
export interface HandChoice {title:string;options:string[]; details?:string[]; values?:number[]}
export interface AbilityHands {hands:Record<Owner,HandSlot[]>;decks:Record<Owner,FishCard[]>;memory:AbilityMemory}
function known(card:FishCard):FishCard{return {...card,known:true};}
function reveal(slot:HandSlot):void{slot.revealed=true;slot.card=known(slot.card);}
const handValue=(c:FishCard)=>c.edges.reduce((n,e)=>n+(e.effect==='weak'?.7:e.effect==='standard'?1:1.4),c.ability?1:0);
const cardDetail=(c:FishCard)=>c.edges.map(e=>`${e.direction}: ${e.effect==='weak'?'Shield':e.effect==='bigger-fish'?'Bite':e.effect}`).join('; ')+'. '+(c.ability?ABILITIES[c.ability].name+': '+ABILITIES[c.ability].description:'No innate ability.');
/** Shared staged choices: UI awaits each yield; simulations/AI drive the same generator. */
export function* abilityHandSteps(state:AbilityHands,card:FishCard,slot:HandSlot):Generator<HandChoice,void,number> {
 const owner=card.owner,enemy=owner==='player'?'rival':'player',deck=state.decks[owner],hand=state.hands[owner],opponent=state.hands[enemy],reserve=state.decks[enemy];
 if(hasAbility(card,'relay')&&deck.length>1){
  const n=yield {title:'Relay · choose your replacement',options:deck.slice(0,2).map(c=>c.name),details:deck.slice(0,2).map(cardDetail),values:deck.slice(0,2).map(handValue)};
  if(n===1)[deck[0],deck[1]]=[deck[1],deck[0]];
 }
 refillSlot(slot,deck);
 if(hasAbility(card,'sonar')){
  if(reserve.length)for(let n=0;n<Math.min(2,reserve.length);n++)reserve[n]=known(reserve[n]);
  else {const target=opponent.find(s=>!s.played&&!s.revealed);if(target)reveal(target);}
 }
 if(hasAbility(card,'false-lure')){
  const hidden=opponent.filter(s=>!s.played&&!s.revealed);
  if(hidden.length){
   const n=yield {title:'False Lure · choose a hidden slot to reveal',options:hidden.map(s=>'Hidden rival slot '+(opponent.indexOf(s)+1))};
   const target=hidden[n]??hidden[0];reveal(target);
   if(reserve.length&&!state.memory.lureUsed.includes(owner)){
    const detail=cardDetail(target.card);
    const swap=yield {title:'False Lure · '+target.card.name,options:['Keep revealed card in rival hand','Exchange for unknown top reserve'],details:[detail,detail],values:[0,handValue(target.card)-2.5]};
    if(swap===1){const old=target.card;target.card=reserve.shift()!;target.revealed=Boolean(target.card.known);reserve.push(old);state.memory.lureUsed.push(owner);}
   }
  }
 }
 if(hasAbility(card,'muster')&&deck.length){
  const others=hand.filter(s=>!s.played&&s!==slot);
  if(others.length){const n=yield {title:'Muster · exchange another hand card for top reserve',options:['Keep hand',...others.map(s=>s.card.name)],details:['No exchange.',...others.map(s=>cardDetail(s.card))],values:[0,...others.map(s=>2.5-handValue(s.card))]};
   if(n>0&&n<=others.length){const target=others[n-1],old=target.card;target.card=deck.shift()!;target.revealed=Boolean(target.card.known);deck.push(old);}
  }
 }
}
/** Does not inspect hidden opponent cards or reserves; picks only from legitimately shown options. */
export function automatedHandChoice(request:HandChoice):number {
 if(request.values)return request.values.reduce((best,v,i)=>v>request.values![best]?i:best,0);
 return 0;
}
