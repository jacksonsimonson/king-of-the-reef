import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {summarizeVoyages} from './roster-voyage-report.mjs';
import {FishingModel,MOVEMENTS} from '../../src/game/fishing/model.ts';

fs.mkdirSync('.cache/balance',{recursive:true});
const runs=[];
for(const camp of [false,true]){
 for(let seed=0;seed<8;seed++)for(const schoolPolicy of ['baseline','both'])for(const catchRate of [.6,.85]){
  const r=voyage({seed:`CAMP-STUDY-${seed}`,camp,schoolPolicy,catchRate,playerDifficulty:'expert'});
  const visits=r.visits.filter(v=>v.after);
  assert.equal(8+visits.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
  assert.ok(visits.filter(v=>v.type==='camp').every(v=>v.recruited.length<=2&&v.after.shells===v.shells));
  runs.push({camp,...r});
 }
 console.log(JSON.stringify({camp,...summarizeVoyages(runs.filter(r=>r.camp===camp))}));
}
fs.writeFileSync('.cache/balance/fish-camp.json',JSON.stringify(runs));
// Responsive synthetic tracker: compare direct input habits with anticipation of momentum.
for(const controller of ['reactive','anticipating'])for(const version of [1,2]){
 const rows=[];
 for(const region of ['shoreline','ocean','bermuda'])for(const movement of Object.keys(MOVEMENTS)){
  let caught=0,seconds=0;
  for(let seed=0;seed<40;seed++){
   const m=new FishingModel(movement,region,seed);m.controlVersion=version;
   while(m.status==='playing'){
    const prediction=controller==='anticipating'?m.zone+m.zoneVelocity*.3:m.zone;
    m.step(prediction>m.fish+.008,prediction<m.fish-.008);
   }
   caught+=Number(m.status==='caught');seconds+=m.elapsed;
  }
  rows.push({region,movement,caught,outOf:40,seconds:Math.round(seconds/40*10)/10});
 }
 console.log(JSON.stringify({controller,version,rows}));
}
