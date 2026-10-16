import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {summarizeVoyages} from './roster-voyage-report.mjs';

const start=Number(process.argv[2]??0),count=Number(process.argv[3]??12);
assert.ok(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>0);
fs.mkdirSync('.cache/balance',{recursive:true});
const results=[];
for(const schoolPolicy of ['baseline','recruit','trim','both']){
 for(let i=start;i<start+count;i++)for(const playerDifficulty of ['tactical','expert'])for(const route of ['recovery','combat'])for(const catchRate of [.85,.6]){
  const r=voyage({seed:`ROSTER-VOYAGE-v6-${i}`,playerDifficulty,route,catchRate,schoolPolicy});
  assert.equal(r.balanceVersion,6);
  const visits=r.visits.filter(v=>v.after);
  assert.equal(24+visits.reduce((n,v)=>n+v.after.shells-v.shells,0),r.shells);
  assert.equal(8+visits.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
  for(const b of r.battles)assert.equal(b.after,b.before-b.dead+b.restored);
  results.push(r);
 }
 fs.writeFileSync(`.cache/balance/school-study-${start}.json`,JSON.stringify(results));
 const cohort=results.filter(r=>r.schoolPolicy===schoolPolicy);
 console.log(JSON.stringify({schoolPolicy,trimmed:cohort.flatMap(r=>r.visits).filter(v=>v.trimmed).length,...summarizeVoyages(cohort)}));
}
