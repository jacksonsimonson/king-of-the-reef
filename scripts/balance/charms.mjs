import {charmCard,canCharmCard,canDrift,exchangeReserve,shuffleHand} from '../../src/game/data/tideCharms.ts';
import {revealCard,revealTargets} from '../../src/game/combat.ts';
import {scoreBoard} from '../../src/game/abilities.ts';
export const LOADOUTS=[['spear-shell','breaker-tooth','barbed-wreath'],['anchor-stone','reef-beacon','duelist-pearl'],['nautilus-dial','coral-mail','drift-shell'],['dredger-net','current-conch','spyglass-pearl']];
// Reproducible stress policy, not an optimal charm AI. One usable charm per turn.
// Prioritize the study creature when it is in hand; no peek beyond Dredger's legal top three.
export function useStudyCharm({state,hands,decks,owner,inventory,target,rng}){
 const opponent=owner==='player'?'rival':'player';
 for(let ci=0;ci<inventory.length;ci++){
  const charm=inventory[ci],slots=hands[owner].filter(s=>!s.played),ordered=[...slots].sort((a,b)=>Number(b.card.texture===target)-Number(a.card.texture===target));let detail;
  if(charm==='drift-shell'){
   const board=state.board.map(c=>c&&({...c,owner:c.owner===owner?'player':'rival'}));let best;
   for(let from=0;from<board.length;from++)for(let to=0;to<board.length;to++)if(canDrift(board,from,to,state.terrain)){
    const copy=[...board];copy[to]=copy[from];copy[from]=null;const score=scoreBoard(copy),value=score.player-score.rival;
    if(!best||value>best.value)best={from,to,value};
   }
   const before=scoreBoard(board);
   if(best&&best.value>before.player-before.rival){state.board[best.to]=state.board[best.from];state.board[best.from]=null;detail={from:best.from,to:best.to};}
  }else if(charm==='dredger-net'){
   const slot=ordered.find(s=>s.card.texture!==target);if(slot&&decks[owner].length){const options=decks[owner].slice(0,3);let i=options.findIndex(c=>c.texture===target);if(i<0)i=0;if(exchangeReserve(slot,decks[owner],i))detail={card:slot.card.texture};}
  }else if(charm==='current-conch'){
   if(slots.length&&decks[owner].length){shuffleHand(hands[owner],decks[owner],rng);detail={};}
  }else if(charm==='spyglass-pearl'){
   const targets=revealTargets(hands[opponent]);if(targets.length){const card=targets[Math.floor(rng()*targets.length)].card;revealCard(hands[opponent],card.id);detail={card:card.texture};}
  }else{
   const slot=ordered.find(s=>canCharmCard(s.card,charm));if(slot){slot.card=charmCard(slot.card,charm);detail={card:slot.card.texture};}
  }
  if(detail){inventory.splice(ci,1);return {owner,charm,...detail};}
 }
 return null;
}
