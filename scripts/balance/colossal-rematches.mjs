import fs from 'node:fs';
import {match} from './matches.mjs';
import {playerPolicy} from './colossal-policy.mjs';
import {rivalDeckFor} from '../../src/game/run/state.ts';
import {COLOSSALS} from '../../src/game/run/colossals.ts';
const rows=[];
for(const start of [0,24]){
 const cases=JSON.parse(fs.readFileSync(`.cache/colossal-voyage-cases-${start}.json`));
 for(const [key,run]of Object.entries(cases).filter(([key])=>key.startsWith('rematch-'))){
  const results=[];
  for(let rank=0;rank<8;rank++){
   const tides=['player','rival'].map(first=>match({region:run.region,seed:run.seed+':'+run.pending,current:true,customDecks:{player:run.school,rival:rivalDeckFor(run)},loadout:run.charms,charmMode:'player',first,playLimit:4+run.region,colossal:COLOSSALS[run.region].id,playerPolicy:(s,h,r)=>playerPolicy(s,h,r,rank)}));
   results.push({rank,margin:tides.reduce((n,t)=>n+t.difference,0),casualties:new Set(tides.flatMap(t=>t.killedIds).filter(id=>run.school.some(c=>c.id===id))).size});
  }
  const row={start,key,seed:run.seed,healthy:run.school.filter(c=>c.condition==='healthy').length,results};rows.push(row);console.log(JSON.stringify(row));
 }
}
fs.writeFileSync('.cache/balance/colossal-rematches.json',JSON.stringify(rows));
