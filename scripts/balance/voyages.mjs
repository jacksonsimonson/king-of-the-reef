import assert from 'node:assert/strict';
import {createRun,activeNode,reachable,enterNode,offers,beginFishing,finishFishing,resolveVisit,shopOffers,buyOffer,rivalDeckFor,battleResult} from '../../src/game/run/state.ts';
import {voyageEvent,eventChoiceAvailable} from '../../src/game/run/events.ts';
import {random,REGIONS} from '../../src/game/run/maps.ts';
import {tidePlayLimit,combinedScore,matchCharmSpending} from '../../src/game/twoTide.ts';
import {availableCharms} from '../../src/game/data/tideCharms.ts';
import {match} from './matches.mjs';

/** Seeded route decisions and real combat/settlement; fishing success is an explicit assumption. */
export function voyage({seed='VOYAGE-STUDY-0',format='two-tide',route='recovery',playerDifficulty='tactical',catchRate=.85,maxBossAttempts=6}={}){
 const run=createRun(seed),battles=[],visits=[],attempts=new Map();let purchases=0,healed=0,catches=0,escapes=0,lowSchoolBattles=0,capped=false;
 const healthy=()=>run.school.filter(c=>c.condition==='healthy').length;
 for(let guard=0;run.status==='active'&&guard<100;guard++){
  if(!run.pending){
   const candidates=reachable(run).map(id=>run.maps[run.region].nodes.find(n=>n.id===id));
   const rank=n=>{
    if(route==='recovery')return ({hydration:run.resolve<3||healthy()<8?10:2,fishing:7,event:5,shop:run.shells>=8?6:1,battle:0,release:1,boss:0})[n.type]??0;
    return ({battle:8,fishing:6,event:5,shop:run.shells>=8?7:1,hydration:run.resolve===1?10:2,release:1,boss:0})[n.type]??0;
   };
   candidates.sort((a,b)=>rank(b)-rank(a)||a.id.localeCompare(b.id));assert.ok(candidates.length);assert.ok(enterNode(run,candidates[0].id));
  }
  const node=activeNode(run),region=run.region;visits.push({region,type:node.type,healthy:healthy(),shells:run.shells,resolve:run.resolve});
  if(node.type==='battle'||node.type==='boss'){
   const count=(attempts.get(node.id)??0)+1;attempts.set(node.id,count);
   if(count>maxBossAttempts){capped=true;break;}
   const opening=availableCharms(run.charms),before=healthy();if(before<tidePlayLimit(REGIONS[region].id))lowSchoolBattles++;
   const args={region,seed:run.seed+':'+node.id,current:true,customDecks:{player:run.school,rival:rivalDeckFor(run)},loadout:opening,charmMode:'player',playerDifficulty,playLimit:format==='two-tide'?tidePlayLimit(REGIONS[region].id):5+region,collectFrames:true};
   const tides=[match({...args,first:'player'})];if(format==='two-tide')tides.push(match({...args,first:'rival'}));
   const score=combinedScore(tides.map(t=>t.score)),killed=[...new Set(tides.flatMap(t=>t.killedIds))],spent=tides.reduce((ledger,t)=>matchCharmSpending(opening,t.inventories.player,ledger),[]);
   const shells=run.shells,resolve=run.resolve;
   battleResult(run,score.player,score.rival,killed,spent);
   battles.push({region,boss:node.type==='boss',attempt:count,before,score,dead:killed.filter(id=>run.school.some(c=>c.id===id)).length,spent:spent.length,playerPlays:tides.reduce((n,t)=>n+t.plays.player,0),rivalPlays:tides.reduce((n,t)=>n+t.plays.rival,0),frames:tides.reduce((n,t)=>n+t.frameCount,0),shellDelta:run.shells-shells,resolveDelta:run.resolve-resolve});
  }else if(node.type==='hydration'){
   const selected=run.school.filter(c=>c.condition==='killed').slice(0,3).map(c=>c.id);healed+=selected.length;assert.ok(resolveVisit(run,'rest',selected));
  }else if(node.type==='fishing'){
   const choices=offers(run),rng=random(seed+':'+node.id+':catch');const texture=choices[Math.floor(rng()*choices.length)];
   assert.ok(beginFishing(run,texture));const caught=rng()<catchRate;
   const snapshot={...run.fishing.snapshot,status:caught?'caught':'escaped',progress:caught?1:0};assert.ok(finishFishing(run,snapshot));caught?catches++:escapes++;
  }else if(node.type==='shop'){
   const stock=shopOffers(run).filter(o=>o.price<=run.shells).sort((a,b)=>(healthy()<8?Number(b.kind==='fish')-Number(a.kind==='fish'):Number(b.kind==='charm')-Number(a.kind==='charm'))||a.price-b.price);
   for(const offer of stock){if(offer.kind==='charm'&&run.charms.length>=3)continue;if(offer.price>run.shells)continue;if(buyOffer(run,offer.id)){purchases++;break;}}
   assert.ok(resolveVisit(run,'leave'));
  }else if(node.type==='event'){
   const selected=run.school.find(c=>c.condition==='killed')?.id;
   const options=voyageEvent(run,'offered fish').choices.map(choice=>({choice,ids:(choice.heal||choice.trade)&&selected?[selected]:[]})).filter(({choice,ids})=>eventChoiceAvailable(run,choice,ids));
   const value=c=>(c.resolve??0)*(run.resolve<3?20:0)+(c.heal?12:0)+(c.recruit?10:0)+(c.shells??0)/4;
   options.sort((a,b)=>value(b.choice)-value(a.choice));assert.ok(options.length);assert.ok(resolveVisit(run,options[0].choice.id,options[0].ids));
  }else assert.ok(resolveVisit(run,'leave'));
  assert.ok(run.shells>=0&&run.resolve>=0&&run.charms.length<=3);
 }
 return {seed,format,route,playerDifficulty,catchRate,status:run.status,capped,region:run.region,shells:run.shells,healthy:healthy(),purchases,healed,catches,escapes,lowSchoolBattles,battles,visits};
}
