import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {summarizeVoyages} from './roster-voyage-report.mjs';
import {saveRun,loadRun,activeNode,rivalDeckFor,battleWinReward} from '../../src/game/run/state.ts';
import {settleBattleWithSummary} from '../../src/game/run/battleSummary.ts';

const start=Number(process.argv[2]??0),count=Number(process.argv[3]??4);
const route=process.argv[4]??'recovery';
assert.ok(['recovery','combat'].includes(route));
assert.ok(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>0);
// Isolated storage: never touches browser saves. Reload every pending encounter and terminal run.
let saved='',reloads=0;
globalThis.localStorage={getItem:()=>saved,setItem:(_key,value)=>{saved=value;}};
function checkpoint(run){
 assert.ok(saveRun(run));const restored=loadRun();assert.ok(restored);
 assert.deepEqual(restored,run);reloads++;return restored;
}
const results=[];
fs.mkdirSync('.cache/balance',{recursive:true});
for(let i=start;i<start+count;i++){
 for(const elitePolicy of ['avoid','seek'])for(const schoolPolicy of ['baseline','both'])for(const catchRate of [.6,.85]){
  const expectedRewards=[];
  const r=voyage({seed:`INTEGRATION-v7-${i}`,elitePolicy,schoolPolicy,catchRate,route,
   playerDifficulty:i%2?'expert':'tactical',checkpoint,
   onBattle:run=>{assert.equal(rivalDeckFor(run).length,10);expectedRewards.push(battleWinReward(run,activeNode(run)));},
   settle:(run,scores,killed,spent)=>{
    const before=run.charms.length,summary=settleBattleWithSummary(run,scores,killed,spent);
    assert.ok(summary?.charmLedgerComplete);
    assert.equal(summary.spentCharms.length,before-run.charms.length);
    assert.equal(summary.healthy,run.school.filter(c=>c.condition==='healthy').length);
    assert.deepEqual(summary.scores,scores);
   }});
  assert.equal(r.balanceVersion,7);assert.equal(r.rivalSchoolVersion,1);
  const visits=r.visits.filter(v=>v.after);
  assert.equal(24+visits.reduce((n,v)=>n+v.after.shells-v.shells,0),r.shells);
  assert.equal(8+visits.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
  for(const [index,b] of r.battles.entries()){
   assert.equal(b.after,b.before-b.dead+b.restored);
   assert.equal(b.playLimit,4+b.region);
   assert.ok(b.playerPlays<=2*b.playLimit&&b.rivalPlays<=2*b.playLimit);
   assert.equal(b.shellDelta,b.score.player>b.score.rival?expectedRewards[index]:b.score.player===b.score.rival&&!b.boss?6:0);
  }
  results.push(r);
 }
 fs.writeFileSync(`.cache/balance/integration-${route}-${start}.json`,JSON.stringify({reloads,results}));
 console.log(JSON.stringify({seed:i,runs:results.length,reloads,...summarizeVoyages(results)}));
}
