import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {saveRun,loadRun,activeNode} from '../../src/game/run/state.ts';
import {settleBattleWithSummary} from '../../src/game/run/battleSummary.ts';
import {summarizeVoyages} from './roster-voyage-report.mjs';
const recovery=process.argv[4]==='recovery';
const start=Number(process.argv[2]??0),count=Number(process.argv[3]??24),results=[],cases={};let stored='',reloads=0;
globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>stored=v};
fs.mkdirSync('.cache/balance',{recursive:true});
for(let seed=start;seed<start+count;seed++)for(const companionChoice of [0,1]){
 const r=voyage({seed:`COLOSSAL-VOYAGE-${seed}`,camp:true,colossals:true,companionChoice,schoolPolicy:recovery||seed%4<2?'both':'baseline',elitePolicy:!recovery&&seed%3===0?'seek':'avoid',
  playerDifficulty:'expert',route:!recovery&&seed%2?'combat':'recovery',catchRate:!recovery&&seed%2?.6:.85,
  checkpoint(run){assert.ok(saveRun(run));const restored=loadRun();assert.deepEqual(restored,run);reloads++;
   if(run.status!=='active')cases[run.status]??=structuredClone(run);
   else if(run.colossalReward!==undefined)cases[`reward-${run.colossalReward}`]??=structuredClone(run);
   else if(run.pending&&activeNode(run).type==='boss')cases[`boss-${run.region}`]??=structuredClone(run);
   return restored;},
  onBattle(run,attempt){if(activeNode(run).type==='boss'&&attempt===2)cases[`rematch-${run.region}`]??=run;},
  settle(run,scores,killed,spent){const summary=settleBattleWithSummary(run,scores,killed,spent);assert.equal(summary.healthy,run.school.filter(c=>c.condition==='healthy').length);assert.equal(summary.outcome,run.status);assert.ok(summary.charmLedgerComplete);}});
 const visits=r.visits.filter(v=>v.after),record=r.recap;
 assert.equal(8+visits.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
 assert.equal(24+visits.reduce((n,v)=>n+v.after.shells-v.shells,0),r.shells);
 assert.equal(record.caught,r.catches);assert.equal(record.purchases,r.purchases);
 assert.equal(record.recruited,visits.reduce((n,v)=>n+v.recruited.length,0));
 assert.equal(record.departed,visits.reduce((n,v)=>n+v.removed,0));
 assert.equal(record.charmsUsed,r.battles.reduce((n,b)=>n+b.spent,0));
 assert.equal(record.casualties,r.battles.reduce((n,b)=>n+b.dead,0));
 for(let region=0;region<3;region++){
  const b=r.battles.filter(b=>b.region===region),row=record.regions[region];
  assert.equal(row.wins+row.losses+row.draws,b.length);assert.equal(row.bossAttempts,b.filter(b=>b.boss).length);
  assert.equal(row.pointsFor,b.reduce((n,b)=>n+b.score.player,0));assert.equal(row.pointsAgainst,b.reduce((n,b)=>n+b.score.rival,0));
 }
 assert.ok(r.battles.every(b=>b.after===b.before-b.dead+b.restored+b.companionAdded&&b.playLimit===4+b.region&&b.playerPlays<=2*b.playLimit&&b.rivalPlays<=2*b.playLimit));
 results.push(r);fs.writeFileSync(`.cache/balance/colossal-voyages-${start}.json`,JSON.stringify({reloads,results}));
 fs.writeFileSync(`.cache/colossal-voyage-cases-${start}.json`,JSON.stringify(cases));
 console.log(JSON.stringify({seed,companionChoice,status:r.status,region:r.region,capped:r.capped,matches:r.battles.length,companionPlays:r.battles.reduce((n,b)=>n+b.companionPlays,0)}));
}
console.log(JSON.stringify({reloads,cases:Object.keys(cases),...summarizeVoyages(results)}));
