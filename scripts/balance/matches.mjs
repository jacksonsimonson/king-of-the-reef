import {STARTERS,PRE_BALANCE_STARTERS} from '../../src/game/data/starterFish.ts';
import {chooseRivalMove} from '../../src/game/rivalAI.ts';
import {resolvePlacement,revealCard,revealTargets} from '../../src/game/combat.ts';
import {canPlaceFish,scoreBoard} from '../../src/game/abilities.ts';
import {regionalRules,scoringReefs} from '../../src/game/battleRules.ts';
import {terrainForRules} from '../../src/game/terrain.ts';
import {refillSlot} from '../../src/game/data/tideCharms.ts';
import {triggersRally,resolveRally,rivalRallyChoice} from '../../src/game/rally.ts';
import {random,REGIONS} from '../../src/game/run/maps.ts';
export const SCHOOLS=[
 [
  ['sea-urchin','electric-eel','minnow','blenny','boxfish','seahorse','moray-eel','parrotfish','coral-grouper','invisible-ink-squid'],
  ['sea-urchin','electric-eel','anchovy','sardine','goby','clownfish','needlefish','octopus','pufferfish','lionfish'],
 ],
 [
  ['sea-urchin','electric-eel','yellowfin-tuna','ocean-sunfish','flying-fish','whale-shark','sea-snake','thresher-shark','coral-grouper','boxfish'],
  ['sea-urchin','electric-eel','wahoo','mahi-mahi','sailfish','common-dolphin','narwhal','paper-nautilus','moray-eel','invisible-ink-squid'],
 ],
 [
  ['phantom-shark','electric-eel','sea-urchin','boxfish','yellowfin-tuna','ghost-net','mimic-chest','void-angler','bonefish','coral-grouper'],
  ['phantom-shark','electric-eel','sea-urchin','flying-fish','whale-shark','chain-catshark','lighthouse-hermit','skeleton-fisherman','buoy-jelly','invisible-ink-squid'],
 ],
];
export function shuffled(items,seed){const result=[...items],rng=random(seed);for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
const other=owner=>owner==='player'?'rival':'player';
// The same production rival policy controls both seats. Swap ownership, never geometry.
const perspective=(card,owner)=>card&&({...card,owner:card.owner===owner?'rival':'player'});
export function match({region=0,seed='study',school=0,first='player',legacy=false,terrain=true,difficulty,override}={}){
 const rules=regionalRules(region,seed);if(difficulty)rules.difficulty=difficulty;
 const focal=region===2?'phantom-shark':'sea-urchin';
 const lookup=(id,owner)=>{
  const catalog=owner==='player'&&legacy&&id===focal?PRE_BALANCE_STARTERS:STARTERS;
  const c=catalog.find(c=>c.texture===id);if(!c)throw new Error('Unknown fixture '+id);
  return {...c,...(owner==='player'&&id===override?.texture?override:{}),id:owner+'-'+id,owner,condition:'healthy'};
 };
 const decks={},hands={};
 for(const owner of ['player','rival']){decks[owner]=shuffled(SCHOOLS[region][owner==='player'?school:1-school],seed+':'+owner).map(id=>lookup(id,owner));hands[owner]=decks[owner].splice(0,5).map(card=>({card,played:false}));}
 let state={board:Array(rules.size**2).fill(null),shocked:new Set(),terrain:terrain?terrainForRules(rules):{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}};
 const plays={player:0,rival:0},trace=[];
 const legal=owner=>plays[owner]<rules.plays&&hands[owner].some(slot=>!slot.played&&state.board.some((_,i)=>canPlaceFish(state.board,i,slot.card,state.terrain)));
 let owner=first;
 for(let turn=0;turn<rules.plays*2+2;turn++,owner=other(owner)){
  if(!legal('player')&&!legal('rival'))break;
  if(!legal(owner))continue;
  const opponent=other(owner),rng=random(seed+':decision:'+owner+':'+plays[owner]);
  const pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));
  const publicThreats=[...hands[opponent].filter(s=>!s.played&&s.revealed).map(s=>perspective(s.card,owner)),...pool.filter((_,i)=>i%Math.max(1,Math.floor(pool.length/6))===0).map(c=>({...c,owner:'player',condition:'healthy'}))];
  const choice=chooseRivalMove({...state,board:state.board.map(c=>perspective(c,owner)),hand:hands[owner].map(s=>({...s,card:perspective(s.card,owner)})),difficulty:rules.difficulty,rivalPlaysLeft:rules.plays-plays[owner],playerPlaysLeft:legal(opponent)?rules.plays-plays[opponent]:0,publicThreats},rng);
  if(!choice)throw new Error('Policy failed to select a legal move');
  const slot=hands[owner][choice.slotIndex],card=slot.card,before=scoreBoard(state.board);
  const available=hands[owner].filter(s=>!s.played).map(s=>s.card.texture);
  const result=resolvePlacement(state,choice.index,card,rules.size);
  const after=scoreBoard(result.board), own=new Set(state.board.filter(c=>c?.owner===owner).map(c=>c.id));own.add(card.id);
  trace.push({owner,card:card.texture,index:choice.index,available,delta:(after[owner]-after[opponent])-(before[owner]-before[opponent]),allyKilled:result.killedIds.filter(id=>own.has(id)).length,enemyKilled:result.killedIds.filter(id=>!own.has(id)).length,allyShocked:[...result.shocked].filter(id=>!state.shocked.has(id)&&id.startsWith(owner+'-')).length,enemyShocked:[...result.shocked].filter(id=>!state.shocked.has(id)&&id.startsWith(opponent+'-')).length,last:plays[owner]+1===rules.plays});
  state={...result,terrain:state.terrain};slot.played=true;plays[owner]++;
  if(triggersRally(card,result.pushedEnemyIds,decks[owner]))resolveRally(decks[owner],rivalRallyChoice(decks[owner][0]));
  refillSlot(slot,decks[owner]);
  if(card.ability==='revelation'){const targets=revealTargets(hands[opponent]);if(targets.length)revealCard(hands[opponent],targets[Math.floor(rng()*targets.length)].card.id);}
 }
 if(legal('player')||legal('rival'))throw new Error('Match ended prematurely');
 const score=scoreBoard(state.board);
 return {region,seed,school,first,legacy,focal,terrain,score,plays,trace,reefOccupants:[...scoringReefs(rules.size)].map(i=>state.board[i]?.id??null),difference:score.player-score.rival};
}
