import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {match} from './matches.mjs';
import {prototypeSchool} from './rival-prototype.mjs';
import {activeNode,rivalDeckFor,runFishDefinition} from '../../src/game/run/state.ts';
import {REGIONS} from '../../src/game/run/maps.ts';
import {rivalStyle,schoolRating} from '../../src/game/run/rivalSchools.ts';
import {availableCharms} from '../../src/game/data/tideCharms.ts';
import {combinedScore} from '../../src/game/twoTide.ts';

const start=Number(process.argv[2]??0),count=Number(process.argv[3]??8);
assert.ok(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>0);
const fixtures=[],results=[],seen=new Set();
fs.mkdirSync('.cache/balance',{recursive:true});
for(let i=start;i<start+count;i++){
 for(const schoolPolicy of ['baseline','both']){
  const perRegion=[0,0,0];
  voyage({seed:`INTEGRATION-v7-${i}`,schoolPolicy,elitePolicy:'avoid',catchRate:.85,playerDifficulty:'expert',onBattle:run=>{
   const node=activeNode(run),region=run.region;
   if(region===0||node.type!=='battle'||node.elite||perRegion[region]>=2)return;
   perRegion[region]++;
   const key=JSON.stringify([run.seed,node.id,run.school,run.charms]);
   if(seen.has(key))return;seen.add(key);
   fixtures.push({schoolPolicy,run});
  }});
 }
 console.log(JSON.stringify({capturedSeed:i,fixtures:fixtures.length}));
}
fs.writeFileSync(`.cache/balance/carried-fixtures-${start}.json`,JSON.stringify(fixtures));
for(const [index,{schoolPolicy,run}] of fixtures.entries()){
 const node=activeNode(run),region=run.region,seed=run.seed+':'+node.id;
 const pool=[...new Set(REGIONS[region].pool)].filter(t=>run.roster.includes(t)).map(t=>({...runFishDefinition(run,t),owner:'rival',condition:'healthy'}));
 const style=rivalStyle(run.seed,node.id),baseline=rivalDeckFor(run);
 assert.deepEqual(prototypeSchool(pool,seed+':weighted-rival',style,region,0),baseline);
 const before=JSON.stringify(run);
 for(const offset of [0,-.1,-.2]){
  const rival=prototypeSchool(pool,seed+':weighted-rival',style,region,offset);
  const args={region,seed,current:true,customDecks:{player:run.school,rival},loadout:availableCharms(run.charms),charmMode:'player',playerDifficulty:'expert',playLimit:4+region};
  const tides=['player','rival'].map(first=>match({...args,first}));
  const score=combinedScore(tides.map(t=>t.score));
  results.push({fixture:index,seed:run.seed,node:node.id,region,style,schoolPolicy,offset,rating:schoolRating(rival),changed:rival.some((c,i)=>c.texture!==baseline[i].texture),score,margin:score.player-score.rival,
   killed:new Set(tides.flatMap(t=>t.killedIds)).size,charms:args.loadout,spent:tides.map(t=>t.charmLog.length)});
  assert.equal(JSON.stringify(run),before,'Replay mutated carried school');
 }
 fs.writeFileSync(`.cache/balance/carried-rivals-${start}.json`,JSON.stringify(results));
 if(index%10===0)console.log(JSON.stringify({replayed:index+1,total:fixtures.length}));
}
