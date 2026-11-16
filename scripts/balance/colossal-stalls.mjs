import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
// Reconstruct one genuinely capped route per region/batch from PR57, rather
// than treating every second attempt as a long-running stall.
const cases={};
for(const start of [0,24]){
 const prior=JSON.parse(fs.readFileSync(`.cache/balance/colossal-voyages-${start}.json`)).results;
 for(let region=0;region<3;region++){
  const r=prior.find(r=>r.capped&&r.region===region);if(!r)continue;
  const {seed,route,schoolPolicy,elitePolicy,catchRate,companionChoice}=r;
  const replay=voyage({seed,route,schoolPolicy,elitePolicy,catchRate,companionChoice,camp:true,colossals:true,playerDifficulty:'expert',
   onBattle(run,attempt){if(run.region===region&&attempt===6)cases[`rematch-${start}-${region}`]=structuredClone(run);}});
  assert.equal(replay.capped,true);assert.deepEqual(replay.battles,r.battles);
  console.log(JSON.stringify({seed,region,attempts:replay.battles.filter(b=>b.region===region&&b.boss).length}));
 }
}
fs.writeFileSync('.cache/colossal-voyage-cases-stalls.json',JSON.stringify(cases));
