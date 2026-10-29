import fs from 'node:fs';
import assert from 'node:assert/strict';
import {match} from './matches.mjs';
const ids=['none','guardian-ribbon','cuttle-ink','surge-bottle','undertow-lure'],rows=[];
// Paired seeds and both starters; each sample is one tide, not a whole two-tide match.
for(const id of ids){
 const results=[];
 for(let region=0;region<3;region++)for(let seed=0;seed<4;seed++)for(const first of ['player','rival']){
  const r=match({seed:`ITEMS-${seed}`,region,first,current:true,difficulty:'tactical',playerDifficulty:'tactical',playLimit:4+region,charmMode:'player',loadout:id==='none'?[]:[id]});
  assert.ok(r.trace.length<=2*(4+region));assert.ok(r.charmLog.length<=1);
  results.push({region,seed,first,difference:r.difference,used:r.charmLog.length});
 }
 rows.push({id,tides:results.length,uses:results.reduce((n,r)=>n+r.used,0),meanMargin:results.reduce((n,r)=>n+r.difference,0)/results.length,results});
 console.log(JSON.stringify({...rows.at(-1),results:undefined}));
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync('.cache/balance/items.json',JSON.stringify(rows,null,2));
