import fs from 'node:fs';
import assert from 'node:assert/strict';
import {STARTING_SCHOOLS} from '../../src/game/run/startingSchools.ts';
import {createRun} from '../../src/game/run/state.ts';
import {match} from './matches.mjs';
import {voyage} from './voyages.mjs';
import {summarizeVoyages} from './roster-voyage-report.mjs';

const offset=Number(process.argv[2]??0),count=Number(process.argv[3]??32);
assert.ok(Number.isInteger(offset)&&offset>=0&&Number.isInteger(count)&&count>0);
const pairs=[],runs=[];
for(let i=0;i<STARTING_SCHOOLS.length;i++)for(let j=i+1;j<STARTING_SCHOOLS.length;j++){
 const a=STARTING_SCHOOLS[i].id,b=STARTING_SCHOOLS[j].id;
 for(let n=offset;n<offset+count;n++)for(const charms of [false,true])for(const reverse of [false,true]){
  const ids=reverse?[b,a]:[a,b],seed=`STARTING-SCHOOL-${n}`;
  const customDecks=Object.fromEntries(['player','rival'].map((owner,k)=>[owner,createRun(seed,2,ids[k]).school.map(c=>({...c,id:owner+'-'+c.id,owner}))]));
  const results=['player','rival'].map(first=>match({seed,current:true,region:0,difficulty:'tactical',playerDifficulty:'tactical',playLimit:4,customDecks,first,charmMode:'both',loadout:charms?['anchor-stone','drift-shell']:[]}));
  const delta=results.reduce((sum,r)=>sum+r.difference,0)*(reverse?-1:1);
  pairs.push({a,b,seed,charms,reverse,delta});
 }
 const group=pairs.filter(p=>p.a===a&&p.b===b);console.log(JSON.stringify({a,b,matches:group.length,wins:group.filter(p=>p.delta>0).length,draws:group.filter(p=>p.delta===0).length,losses:group.filter(p=>p.delta<0).length,margin:group.reduce((n,p)=>n+p.delta,0)/group.length}));
}
for(const school of STARTING_SCHOOLS){
 for(let n=offset;n<offset+Math.min(count,12);n++)for(const playerDifficulty of ['tactical','expert'])for(const catchRate of [.85,.6]){
  const r=voyage({seed:`ROSTER-VOYAGE-v6-${n}`,startingSchoolId:school.id,playerDifficulty,catchRate,route:'recovery'});
  runs.push({...r,schoolId:school.id});
 }
 const cohort=runs.filter(r=>r.schoolId===school.id);assert.equal(cohort.length,Math.min(count,12)*4);
 console.log(JSON.stringify({school:school.id,...summarizeVoyages(cohort)}));
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/starting-schools-${offset}.json`,JSON.stringify({schools:STARTING_SCHOOLS,pairs,runs}));
