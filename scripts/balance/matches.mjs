import {beginAbilityTurn,readyGrowth,growArm,blankSides,freshAbilityMemory} from '../../src/game/battleAbilityState.ts';
import {abilityHandSteps,automatedHandChoice} from '../../src/game/abilityHands.ts';
import {placementOptions} from '../../src/game/abilityOptions.ts';
import {useStudyCharm} from './charms.mjs';
import {BATCH_ONE_STARTERS as STARTERS,STARTERS as CURRENT_STARTERS,PRE_BALANCE_STARTERS} from '../../src/game/data/starterFish.ts';
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
export function match({region=0,seed='study',school=0,first='player',legacy=false,terrain=true,difficulty,override,loadout=[],charmMode='both',target,initiative='alternating',playLimit,current=false,customDecks,playerDifficulty,collectFrames=false,auditAbilities=false}={}){
 const rules=regionalRules(region,seed);if(difficulty)rules.difficulty=difficulty;if(playLimit!==undefined)rules.plays=playLimit;
 const roster=current?CURRENT_STARTERS:STARTERS;
 const focal=region===2?'phantom-shark':'sea-urchin';
 const lookup=(id,owner)=>{
  const catalog=owner==='player'&&legacy&&id===focal?PRE_BALANCE_STARTERS:roster;
  const c=catalog.find(c=>c.texture===id);if(!c)throw new Error('Unknown fixture '+id);
  return {...c,...(owner==='player'&&id===override?.texture?override:{}),id:owner+'-'+id,owner,condition:'healthy'};
 };
 const decks={},hands={};
 const dealRng=random(seed+':deal'),actionRng=random(seed+':actions');
 for(const owner of ['player','rival']){
  if(customDecks){decks[owner]=structuredClone(customDecks[owner].filter(c=>c.condition==='healthy'));for(let i=decks[owner].length-1;i>0;i--){const j=Math.floor(dealRng()*(i+1));[decks[owner][i],decks[owner][j]]=[decks[owner][j],decks[owner][i]];}}
  else decks[owner]=shuffled(SCHOOLS[region][owner==='player'?school:1-school],seed+':'+owner).map(id=>lookup(id,owner));
  hands[owner]=decks[owner].splice(0,5).map(card=>({card,played:false}));
 }
 let state={board:Array(rules.size**2).fill(null),shocked:new Set(),terrain:terrain?terrainForRules(rules):{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}};
 const plays={player:0,rival:0},trace=[],charmLog=[];
 const inventories={player:[...loadout],rival:charmMode==='both'?[...loadout]:[]};
 const checkpoints=[],killedIds=new Set();let frameCount=0;
 const legal=owner=>plays[owner]<rules.plays&&hands[owner].some(slot=>!slot.played&&state.board.some((_,i)=>canPlaceFish(state.board,i,slot.card,state.terrain,state.memory)));
 const sequence=Array.from({length:rules.plays},(_,round)=>initiative==='snake'&&round%2?[other(first),first]:[first,other(first)]).flat();
 function* turns(){if(!customDecks){yield* sequence;return;}let owner=first;while(legal('player')||legal('rival')){if(!legal(owner))owner=other(owner);yield owner;owner=other(owner);}}
 let turn=-1;
 for(const owner of turns()){turn++;
  if(!legal('player')&&!legal('rival'))break;
  if(!legal(owner))continue;
  const growth=[];
  state.memory=beginAbilityTurn(state,owner);for(const c of readyGrowth(state,owner)){state=growArm(state,c.id,blankSides(c)[0]);if(auditAbilities&&state.board.find(f=>f?.id===c.id)?.edges.length>c.edges.length)growth.push(c.texture);}
  const opponent=other(owner),rng=customDecks?actionRng:random(seed+':decision:'+owner+':'+plays[owner]);
  const used=useStudyCharm({state,hands,decks,owner,inventory:inventories[owner],target:target??focal,rng:customDecks?actionRng:random(seed+':charm:'+owner+':'+plays[owner])});if(used)charmLog.push({...used,turn});
  const pool=roster.filter(c=>REGIONS[region].pool.includes(c.texture));
  const publicThreats=[...hands[opponent].filter(s=>!s.played&&s.revealed).map(s=>perspective(s.card,owner)),...pool.filter((_,i)=>i%Math.max(1,Math.floor(pool.length/6))===0).map(c=>({...c,owner:'player',condition:'healthy'}))];
  const memory=structuredClone(state.memory??freshAbilityMemory());if(owner==='player'){[memory.turns.player,memory.turns.rival]=[memory.turns.rival,memory.turns.player];for(const list of [memory.growth,memory.snares,memory.decoys])for(const token of list)token.owner=other(token.owner);memory.lureUsed=memory.lureUsed.map(other);}
  const policyPosition={...state,memory,board:state.board.map(c=>perspective(c,owner)),hand:hands[owner].map(s=>({...s,card:perspective(s.card,owner)})),difficulty:owner==='player'&&playerDifficulty?playerDifficulty:rules.difficulty,rivalPlaysLeft:rules.plays-plays[owner],playerPlaysLeft:legal(opponent)?rules.plays-plays[opponent]:0,publicThreats};
  const choice=chooseRivalMove(policyPosition,rng);
  if(!choice)throw new Error('Policy failed to select a legal move');
  const slot=hands[owner][choice.slotIndex],card=slot.card,before=scoreBoard(state.board);
  const available=hands[owner].filter(s=>!s.played).map(s=>s.card.texture);
  const result=resolvePlacement(state,choice.index,card,rules.size,collectFrames,choice.abilityChoice);
  let audit;
  if(auditAbilities){
   const without=resolvePlacement(state,choice.index,{...card,ability:undefined},rules.size,false,choice.abilityChoice);
   const signature=r=>JSON.stringify([r.board.map(c=>c&&[c.id,c.edges]),[...r.shocked].sort(),scoreBoard(r.board)]);
   audit={options:placementOptions(state,choice.index,card).length,choice:choice.abilityChoice,immediateDifference:signature(result)!==signature(without),handChoices:0,newReveals:0,growth,
    inflated:result.memory.inflated.filter(id=>!state.memory.inflated.includes(id)).map(id=>state.board.find(c=>c?.id===id)?.texture).filter(Boolean),
    decoys:result.memory.decoys.filter(t=>!state.memory.decoys.some(old=>old.index===t.index&&old.owner===t.owner&&old.expires===t.expires)).length,
    snaresConsumed:state.memory.snares.filter(t=>t.index===choice.index&&t.owner!==owner&&!result.memory.snares.some(next=>next.index===t.index&&next.owner===t.owner)).length};
   audit.snareExposure=Number(memory.snares.some(t=>t.owner==='player'));
   audit.snareDiversion=0;
   if(audit.snareExposure){
    // Fixed tie-breaking in both probes; never consume the actual match RNG.
    const withSnare=chooseRivalMove(policyPosition,()=>0);
    const withoutSnare=chooseRivalMove({...policyPosition,memory:{...memory,snares:memory.snares.filter(t=>t.owner!=='player')}},()=>0);
    const decision=c=>JSON.stringify(c&&[c.slotIndex,c.index,c.abilityChoice]);
    audit.snareDiversion=Number(decision(withSnare)!==decision(withoutSnare));
   }
  }
  for(const id of result.killedIds)killedIds.add(id);frameCount+=result.frames?.length??0;
  const after=scoreBoard(result.board), own=new Set(state.board.filter(c=>c?.owner===owner).map(c=>c.id));own.add(card.id);
  trace.push({owner,card:card.texture,index:choice.index,available,delta:(after[owner]-after[opponent])-(before[owner]-before[opponent]),allyKilled:result.killedIds.filter(id=>own.has(id)).length,enemyKilled:result.killedIds.filter(id=>!own.has(id)).length,allyShocked:[...result.shocked].filter(id=>!state.shocked.has(id)&&id.startsWith(owner+'-')).length,enemyShocked:[...result.shocked].filter(id=>!state.shocked.has(id)&&id.startsWith(opponent+'-')).length,last:plays[owner]+1===rules.plays});
  state={...result,terrain:state.terrain};slot.played=true;plays[owner]++;
  if(triggersRally(card,result.pushedEnemyIds,decks[owner]))resolveRally(decks[owner],rivalRallyChoice(decks[owner][0]));
  const knownIds=()=>new Set([...hands.player,...hands.rival].map(s=>s.card).concat(decks.player,decks.rival).filter(c=>c.known).map(c=>c.id));
  const knownBefore=audit?knownIds():undefined;
  const steps=abilityHandSteps({hands,decks,memory:state.memory},card,slot);let step=steps.next();while(!step.done){if(audit)audit.handChoices++;step=steps.next(automatedHandChoice(step.value));}
  if(audit)audit.newReveals=[...knownIds()].filter(id=>!knownBefore.has(id)).length;
  if(audit)trace.at(-1).abilityAudit=audit;
  if(turn%2===1)checkpoints.push(scoreBoard(state.board));
  if(card.ability==='revelation'){const targets=revealTargets(hands[opponent]);if(targets.length)revealCard(hands[opponent],targets[Math.floor(rng()*targets.length)].card.id);}
 }
 if(legal('player')||legal('rival'))throw new Error('Match ended prematurely');
 const score=scoreBoard(state.board);
 return {killedIds:[...killedIds],inventories,frameCount,region,seed,school,first,legacy,focal,terrain,score,plays,trace,reefOccupants:[...scoringReefs(rules.size)].map(i=>state.board[i]?.id??null),difference:score.player-score.rival,charmLog,checkpoints,initiative,charmMode};
}
