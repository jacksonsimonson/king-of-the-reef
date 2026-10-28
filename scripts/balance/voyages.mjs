import assert from 'node:assert/strict';
import {createRun,activeNode,reachable,enterNode,offers,beginFishing,finishFishing,resolveVisit,shopOffers,buyOffer,rivalDeckFor,battleResult} from '../../src/game/run/state.ts';
import {voyageEvent,eventChoiceAvailable} from '../../src/game/run/events.ts';
import {random,REGIONS} from '../../src/game/run/maps.ts';
import {tidePlayLimit,combinedScore,matchCharmSpending} from '../../src/game/twoTide.ts';
import {availableCharms} from '../../src/game/data/tideCharms.ts';
import {match} from './matches.mjs';
import {chooseRecruit,recruitGain,trimCandidate} from './school-policy.mjs';

/** Seeded route decisions and real combat/settlement; fishing success is an explicit assumption. */
export function voyage({seed='VOYAGE-STUDY-0',format='two-tide',route='recovery',playerDifficulty='tactical',catchRate=.85,maxBossAttempts=6,schoolPolicy='baseline',onBattle,startingSchoolId}={}){
 assert.ok(['baseline','recruit','trim','both'].includes(schoolPolicy));
 const deliberate=['recruit','both'].includes(schoolPolicy),trimming=['trim','both'].includes(schoolPolicy);
 const run=createRun(seed,2,startingSchoolId),battles=[],visits=[],attempts=new Map(),bossOpenings=new Set();let purchases=0,healed=0,catches=0,escapes=0,lowSchoolBattles=0,capped=false;
 const startingSchool=run.school.map(c=>c.texture),balanceVersion=run.cardBalanceVersion;
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
  const node=activeNode(run),region=run.region;
  const visit={region,nodeId:node.id,column:node.column,type:node.type,school:run.school.length,healthy:healthy(),shells:run.shells,resolve:run.resolve};visits.push(visit);
  const previousIds=new Set(run.school.map(c=>c.id)),previousInjured=new Set(run.school.filter(c=>c.condition==='killed').map(c=>c.id));
  if(node.type==='battle'||node.type==='boss'){
   const count=(attempts.get(node.id)??0)+1;attempts.set(node.id,count);
   if(count>maxBossAttempts){capped=true;break;}
   onBattle?.(structuredClone(run),count);
   const opening=availableCharms(run.charms),before=healthy(),playLimit=format==='two-tide'?tidePlayLimit(REGIONS[region].id):5+region;
   const regionalHealthy=run.school.filter(c=>c.condition==='healthy'&&REGIONS[region].pool.includes(c.texture)).length;
   const distinctHealthy=new Set(run.school.filter(c=>c.condition==='healthy').map(c=>c.texture)).size;
   if(before<playLimit)lowSchoolBattles++;
   const signature=JSON.stringify([node.id,run.school.map(c=>[c.id,c.condition]),opening]);
   const repeatedOpening=node.type==='boss'&&bossOpenings.has(signature);if(node.type==='boss')bossOpenings.add(signature);
   const args={region,seed:run.seed+':'+node.id,current:true,customDecks:{player:run.school,rival:rivalDeckFor(run)},loadout:opening,charmMode:'player',playerDifficulty,playLimit:format==='two-tide'?tidePlayLimit(REGIONS[region].id):5+region,collectFrames:true};
   const tides=[match({...args,first:'player'})];if(format==='two-tide')tides.push(match({...args,first:'rival'}));
   const score=combinedScore(tides.map(t=>t.score)),killed=[...new Set(tides.flatMap(t=>t.killedIds))],spent=tides.reduce((ledger,t)=>matchCharmSpending(opening,t.inventories.player,ledger),[]);
   const shells=run.shells,resolve=run.resolve;
   battleResult(run,score.player,score.rival,killed,spent);
   const dead=killed.filter(id=>run.school.some(c=>c.id===id));
   visit.battleRestored=run.school.filter(c=>c.condition==='healthy'&&(previousInjured.has(c.id)||dead.includes(c.id))).length;
   battles.push({region,boss:node.type==='boss',attempt:count,before,school:run.school.length,after:healthy(),regionalHealthy,distinctHealthy,playLimit,repeatedOpening,score,dead:dead.length,injuredAfter:run.school.length-healthy(),restored:visit.battleRestored,spent:spent.length,playerPlays:tides.reduce((n,t)=>n+t.plays.player,0),rivalPlays:tides.reduce((n,t)=>n+t.plays.rival,0),frames:tides.reduce((n,t)=>n+t.frameCount,0),shellDelta:run.shells-shells,resolveDelta:run.resolve-resolve,playedTextures:[...new Set(tides.flatMap(t=>t.trace.filter(x=>x.owner==='player').map(x=>x.card)))],availableTextures:[...new Set(tides.flatMap(t=>t.trace.filter(x=>x.owner==='player').flatMap(x=>x.available)))]});
  }else if(node.type==='hydration'){
   const selected=run.school.filter(c=>c.condition==='killed').slice(0,3).map(c=>c.id);healed+=selected.length;assert.ok(resolveVisit(run,'rest',selected));
  }else if(node.type==='fishing'){
   const choices=offers(run),rng=random(seed+':'+node.id+':catch'),randomChoice=choices[Math.floor(rng()*choices.length)];
   const texture=deliberate?chooseRecruit(run,choices):randomChoice;
   visit.fishingChoice={offered:choices,selected:texture,gain:recruitGain(run,texture)};
   assert.ok(beginFishing(run,texture));const caught=rng()<catchRate;
   const snapshot={...run.fishing.snapshot,status:caught?'caught':'escaped',progress:caught?1:0};assert.ok(finishFishing(run,snapshot));caught?catches++:escapes++;
  }else if(node.type==='shop'){
   const offered=shopOffers(run);visit.stock=offered.map(o=>({kind:o.kind,price:o.price,affordable:o.price<=run.shells}));visit.charmSlots=3-run.charms.length;
   const stock=offered.filter(o=>o.price<=run.shells).sort((a,b)=>(healthy()<8?Number(b.kind==='fish')-Number(a.kind==='fish'):Number(b.kind==='charm')-Number(a.kind==='charm'))||a.price-b.price);
   if(deliberate)stock.sort((a,b)=>{
    const value=o=>o.kind==='fish'&&(healthy()<8||recruitGain(run,o.texture)>1e-9)?2+recruitGain(run,o.texture):o.kind==='charm'?1:0;
    return value(b)-value(a)||a.price-b.price;
   });
   for(const offer of stock){if(offer.kind==='charm'&&run.charms.length>=3)continue;if(offer.price>run.shells)continue;if(buyOffer(run,offer.id)){purchases++;visit.purchase={kind:offer.kind,price:offer.price};break;}}
   assert.ok(resolveVisit(run,'leave'));
  }else if(node.type==='release'&&trimming){
   const selected=trimCandidate(run);visit.trimmed=selected?{id:selected.id,texture:selected.texture}:null;
   assert.ok(resolveVisit(run,selected?.id??'leave'));
  }else if(node.type==='event'){
   const selected=run.school.find(c=>c.condition==='killed')?.id;
   const options=voyageEvent(run,'offered fish').choices.map(choice=>({choice,ids:(choice.heal||choice.trade)&&selected?[selected]:[]})).filter(({choice,ids})=>eventChoiceAvailable(run,choice,ids));
   const value=c=>(c.resolve??0)*(run.resolve<3?20:0)+(c.heal?12:0)+(c.recruit?10:0)+(c.shells??0)/4;
   options.sort((a,b)=>value(b.choice)-value(a.choice));assert.ok(options.length);assert.ok(resolveVisit(run,options[0].choice.id,options[0].ids));
  }else assert.ok(resolveVisit(run,'leave'));
  visit.after={region:run.region,school:run.school.length,healthy:healthy(),shells:run.shells,resolve:run.resolve};
  visit.recruited=run.school.filter(c=>!previousIds.has(c.id)).map(c=>c.texture);
  visit.removed=[...previousIds].filter(id=>!run.school.some(c=>c.id===id)).length;
  visit.restored=visit.battleRestored??run.school.filter(c=>previousInjured.has(c.id)&&c.condition==='healthy').length;
  assert.ok(run.shells>=0&&run.resolve>=0&&run.charms.length<=3);
 }
 assert.ok(run.status!=='active'||capped,'Study guard reached without a terminal outcome or declared boss cap');
 return {seed,format,route,playerDifficulty,catchRate,schoolPolicy,balanceVersion,startingSchool,status:run.status,capped,region:run.region,shells:run.shells,healthy:healthy(),school:run.school.map(c=>({texture:c.texture,condition:c.condition})),purchases,healed,catches,escapes,lowSchoolBattles,battles,visits};
}
