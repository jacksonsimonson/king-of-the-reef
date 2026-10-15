import fs from 'node:fs';
import {voyage} from './voyages.mjs';
const count=Number(process.argv[2]??12),start=Number(process.argv[3]??0),catchRate=Number(process.argv[4]??.85),results=[];
for(const format of ['classic','two-tide'])for(const playerDifficulty of ['tactical','expert'])for(const route of ['recovery','combat'])for(let seed=start;seed<start+count;seed++){
 results.push(voyage({seed:'FULL-VOYAGE-HOLDOUT-'+seed,format,route,playerDifficulty,catchRate}));
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/full-voyages-${start}.json`,JSON.stringify(results));
for(const format of ['classic','two-tide'])for(const playerDifficulty of ['tactical','expert']){
 const runs=results.filter(r=>r.format===format&&r.playerDifficulty===playerDifficulty),battles=runs.flatMap(r=>r.battles),avg=(xs)=>xs.length?+(xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(2):0;
 console.log(JSON.stringify({format,playerDifficulty,runs:runs.length,won:runs.filter(r=>r.status==='won').length,lost:runs.filter(r=>r.status==='lost').length,capped:runs.filter(r=>r.capped).length,reached:[0,1,2].map(i=>runs.filter(r=>r.region>=i).length),battles:battles.length,casualtiesPerBattle:avg(battles.map(b=>b.dead)),lowSchoolBattles:runs.reduce((n,r)=>n+r.lowSchoolBattles,0),purchasesPerRun:avg(runs.map(r=>r.purchases)),healedPerRun:avg(runs.map(r=>r.healed)),endingShells:avg(runs.map(r=>r.shells)),regions:[0,1,2].map(region=>{const rows=battles.filter(b=>b.region===region);return {region,battles:rows.length,draws:rows.filter(b=>b.score.player===b.score.rival).length,playerPlays:avg(rows.map(b=>b.playerPlays)),frames:avg(rows.map(b=>b.frames)),dead:avg(rows.map(b=>b.dead))};})}));
}
