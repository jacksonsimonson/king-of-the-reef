import fs from 'node:fs';
import assert from 'node:assert/strict';
import {summarizeVoyages} from './roster-voyage-report.mjs';

const files=process.argv.slice(2);
assert.ok(files.length,'Pass integration study JSON paths');
const batches=files.map(file=>JSON.parse(fs.readFileSync(file,'utf8'))),runs=batches.flatMap(b=>b.results);
assert.equal(new Set(runs.map(r=>[r.seed,r.route,r.elitePolicy,r.schoolPolicy,r.catchRate].join(':'))).size,runs.length,'Overlapping cohorts');
const battles=runs.flatMap(r=>r.battles),visits=runs.flatMap(r=>r.visits);
const outcomes=bs=>({matches:bs.length,wins:bs.filter(b=>b.score.player>b.score.rival).length,draws:bs.filter(b=>b.score.player===b.score.rival).length,losses:bs.filter(b=>b.score.player<b.score.rival).length});
const cohorts=key=>Object.fromEntries([...new Set(runs.map(r=>r[key]))].map(value=>{
 const rs=runs.filter(r=>r[key]===value),s=summarizeVoyages(rs);
 return [value,{runs:s.runs,won:s.won,lost:s.lost,capped:s.capped,reached:s.reached,shortages:s.lowSchoolBattles}];
}));
console.log(JSON.stringify({total:summarizeVoyages(runs),reloads:batches.reduce((n,b)=>n+b.reloads,0),
 cohorts:Object.fromEntries(['route','elitePolicy','schoolPolicy','catchRate','playerDifficulty'].map(key=>[key,cohorts(key)])),
 regionalBattles:[0,1,2].map(region=>({region,...Object.fromEntries(['normal','elite','boss'].map(kind=>[kind,outcomes(battles.filter(b=>b.region===region&&(kind==='boss'?b.boss:!b.boss&&b.elite===(kind==='elite'))))]))})),
 coverage:{visits:Object.fromEntries([...new Set(visits.map(v=>v.type))].map(type=>[type,visits.filter(v=>v.type===type).length])),
  trimmed:visits.filter(v=>v.trimmed).length,charms:[...new Set(battles.flatMap(b=>b.charmIds))].sort(),spent:battles.reduce((n,b)=>n+b.spent,0),
  playerSpecies:new Set(battles.flatMap(b=>b.playedTextures)).size,rivalSpecies:new Set(battles.flatMap(b=>b.rivalTextures)).size}},null,2));
