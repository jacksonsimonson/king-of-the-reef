import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {voyage} from './voyages.mjs';

const mean=xs=>xs.length?Number((xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(2)):null;
export function summarizeVoyages(runs){
 const battles=runs.flatMap(r=>r.battles),visits=runs.flatMap(r=>r.visits),shops=visits.filter(v=>v.type==='shop');
 return {runs:runs.length,won:runs.filter(r=>r.status==='won').length,lost:runs.filter(r=>r.status==='lost').length,capped:runs.filter(r=>r.capped).length,
  reached:[0,1,2].map(i=>runs.filter(r=>r.region>=i).length),matches:battles.length,tides:runs.reduce((n,r)=>n+r.battles.length*(r.format==='two-tide'?2:1),0),
  lowSchoolBattles:runs.reduce((n,r)=>n+r.lowSchoolBattles,0),deadPerMatch:mean(battles.map(b=>b.dead)),
  endingSchool:mean(runs.map(r=>r.school.length)),endingHealthy:mean(runs.map(r=>r.healthy)),endingShells:mean(runs.map(r=>r.shells)),
  purchases:shops.filter(v=>v.purchase).length,fishPurchases:shops.filter(v=>v.purchase?.kind==='fish').length,charmPurchases:shops.filter(v=>v.purchase?.kind==='charm').length,
  shops:shops.length,noAffordableShops:shops.filter(v=>!v.stock.some(o=>o.affordable)).length,
  noAffordableFish:shops.filter(v=>!v.stock.some(o=>o.kind==='fish'&&o.affordable)).length,shopSpend:shops.reduce((n,v)=>n+(v.purchase?.price??0),0),
  healing:Object.fromEntries(['hydration','event','boss'].map(type=>[type,visits.filter(v=>v.type===type).reduce((n,v)=>n+(v.restored??0),0)])),
  fishing:{caught:runs.reduce((n,r)=>n+r.catches,0),escaped:runs.reduce((n,r)=>n+r.escapes,0)},
  recruited:visits.reduce((n,v)=>n+(v.recruited?.length??0),0),
  bossDraws:battles.filter(b=>b.boss&&b.score.player===b.score.rival).length,repeatedBossOpenings:battles.filter(b=>b.repeatedOpening).length,
  regions:[0,1,2].map(region=>{
   const bs=battles.filter(b=>b.region===region),vs=visits.filter(v=>v.region===region),hs=vs.filter(v=>v.type==='hydration');
   return {region,runs:runs.filter(r=>r.battles.some(b=>b.region===region)).length,matches:bs.length,regular:bs.filter(b=>!b.boss).length,boss:bs.filter(b=>b.boss).length,
    wins:bs.filter(b=>b.score.player>b.score.rival).length,draws:bs.filter(b=>b.score.player===b.score.rival).length,losses:bs.filter(b=>b.score.player<b.score.rival).length,
    school:mean(bs.map(b=>b.school)),healthy:mean(bs.map(b=>b.before)),regionalHealthy:mean(bs.map(b=>b.regionalHealthy)),distinctHealthy:mean(bs.map(b=>b.distinctHealthy)),injured:mean(bs.map(b=>b.school-b.before)),dead:mean(bs.map(b=>b.dead)),low:bs.filter(b=>b.before<b.playLimit).length,
    plays:mean(bs.map(b=>b.playerPlays)),hydrationVisits:hs.length,hydrationAtCapacity:hs.filter(v=>v.restored===3).length,stillInjuredAfterHydration:hs.filter(v=>v.after.school>v.after.healthy).length,
    lowResolveMatches:bs.filter(b=>b.resolveDelta<0).length,fishOffers:vs.filter(v=>v.type==='shop').flatMap(v=>v.stock.filter(o=>o.kind==='fish')).length,
    recruits:vs.reduce((n,v)=>n+(v.recruited?.length??0),0)};
  })};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const count=Number(process.argv[2]??6),start=Number(process.argv[3]??0),results=[];
 if(!Number.isInteger(count)||count<1||!Number.isInteger(start)||start<0)throw new Error('Expected positive seed count and nonnegative offset');
 fs.mkdirSync('.cache/balance',{recursive:true});
 const path=`.cache/balance/finished-roster-voyages-${start}.json`;
 for(const playerDifficulty of ['tactical','expert'])for(const route of ['recovery','combat'])for(const catchRate of [.85,.60]){
  for(let seed=start;seed<start+count;seed++){
   const result=voyage({seed:'ROSTER-VOYAGE-v6-'+seed,format:'two-tide',route,playerDifficulty,catchRate});
   if(result.balanceVersion!==6)throw new Error('This report targets roster balance version 6; review the protocol before updating');
   results.push(result);fs.writeFileSync(path,JSON.stringify(results));
  }
  console.log(JSON.stringify({playerDifficulty,route,catchRate,...summarizeVoyages(results.filter(r=>r.playerDifficulty===playerDifficulty&&r.route===route&&r.catchRate===catchRate))}));
 }
 console.log(JSON.stringify({total:summarizeVoyages(results)}));
}
