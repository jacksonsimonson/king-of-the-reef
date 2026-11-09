import fs from 'node:fs';
import assert from 'node:assert/strict';
import {match} from './matches.mjs';
import {attributionSchool} from './attribution-schools.mjs';
import {activeNode} from '../../src/game/run/state.ts';
import {availableCharms} from '../../src/game/data/tideCharms.ts';
import {combinedScore} from '../../src/game/twoTide.ts';
import {regionalRules} from '../../src/game/battleRules.ts';

const start=Number(process.argv[2]??0);assert.ok(Number.isInteger(start)&&start>=0);
const fixtures=JSON.parse(fs.readFileSync(`.cache/balance/carried-fixtures-${start}.json`,'utf8'));
const previous=JSON.parse(fs.readFileSync(`.cache/balance/carried-rivals-${start}.json`,'utf8'));
const results=[];
for(const [fixture,{run,schoolPolicy}] of fixtures.entries()){
 const before=JSON.stringify(run),node=activeNode(run),region=run.region,seed=run.seed+':'+node.id;
 const currentDifficulty=regionalRules(region,seed).difficulty;
 for(const composition of ['weighted','uniform','carried']){
  const rival=attributionSchool(run,composition);
  for(const difficulty of ['beginner','tactical','expert']){
   const args={region,seed,current:true,customDecks:{player:run.school,rival},loadout:availableCharms(run.charms),charmMode:'player',playerDifficulty:'expert',difficulty,playLimit:4+region};
   const tides=['player','rival'].map(first=>match({...args,first})),score=combinedScore(tides.map(t=>t.score));
   if(composition==='weighted'&&difficulty===currentDifficulty){
    const old=previous.find(r=>r.fixture===fixture&&r.offset===0);assert.ok(old);assert.deepEqual(score,old.score,'Baseline drift');
   }
   results.push({fixture,seed:run.seed,node:node.id,region,schoolPolicy,composition,difficulty,score,margin:score.player-score.rival,
    playerSpecies:run.school.filter(c=>c.condition==='healthy').map(c=>c.texture),rivalSpecies:rival.map(c=>c.texture),charms:args.loadout});
   assert.equal(JSON.stringify(run),before,'Replay mutated snapshot');
  }
 }
 if(fixture%10===0)console.log(JSON.stringify({completed:fixture+1,total:fixtures.length}));
}
fs.writeFileSync(`.cache/balance/rival-attribution-${start}.json`,JSON.stringify({complete:true,fixtures:fixtures.length,results}));
console.log(JSON.stringify({complete:true,fixtures:fixtures.length,matches:results.length,tides:results.length*2}));
