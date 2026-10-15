import fs from 'node:fs';
import {BATCH_ONE_STARTERS as STARTERS} from '../../src/game/data/starterFish.ts';
import {match} from './matches.mjs';
import {LOADOUTS} from './charms.mjs';
import {PROPOSALS,candidate} from './match-proposals.mjs';
const pairs=[];
for(const p of PROPOSALS)for(let n=0;n<8;n++)for(const first of ['player','rival'])for(const charmMode of ['player','both'])for(const [li,loadout] of LOADOUTS.entries()){
 const opts={region:2,school:p.school,seed:'CHARM-HOLDOUT-v1-'+n,first,loadout,charmMode,target:p.texture};
 const before=match({...opts,override:STARTERS.find(c=>c.texture===p.texture)}),after=match({...opts,override:candidate(p)});pairs.push({texture:p.texture,li,charmMode,before,after});
}
let doc='# Fresh-seed charm and turn-order measurements\n\nReproduce with `node scripts/balance/charm-report.mjs`. Read [interpretation and limitations](BALANCE_BATCH_2.md). 512 creature-comparison matches: 8 fresh seeds × 2 acting orders × 4 three-charm loadouts × player-only/both-side charms × 2 creatures × before/after. All use Bermuda Expert, regional terrain and the existing mixed schools.\n\n| Creature / charm seats | Better / same / worse pairs | Old → proposed mean margin | Old → proposed plays |\n| --- | --- | ---: | ---: |\n';
for(const p of PROPOSALS)for(const mode of ['player','both']){
 const rows=pairs.filter(r=>r.texture===p.texture&&r.charmMode===mode),d=rows.map(r=>r.after.difference-r.before.difference),mean=k=>(rows.reduce((n,r)=>n+r[k].difference,0)/rows.length).toFixed(3),plays=k=>rows.filter(r=>r[k].trace.some(t=>t.owner==='player'&&t.card===p.texture)).length;
 doc+=`| ${p.texture} / ${mode} | ${d.filter(x=>x>0).length} / ${d.filter(x=>x===0).length} / ${d.filter(x=>x<0).length} | ${mean('before')} → ${mean('after')} | ${plays('before')} → ${plays('after')} / ${rows.length} |\n`;
}
doc+='\n| Charm | Uses across all comparison matches | Uses targeting a study creature |\n| --- | ---: | ---: |\n';
const logs=pairs.flatMap(r=>[...r.before.charmLog,...r.after.charmLog]);
for(const id of LOADOUTS.flat()){const rows=logs.filter(l=>l.charm===id);doc+=`| ${id} | ${rows.length} | ${rows.filter(l=>PROPOSALS.some(p=>p.texture===l.card)).length} |\n`;}
const order=[];
for(let region=0;region<3;region++)for(let n=0;n<8;n++)for(const school of [0,1])for(const first of ['player','rival'])for(const initiative of ['alternating','snake'])order.push(match({region,seed:'ORDER-HOLDOUT-v1-'+n,school,first,initiative,difficulty:'tactical'}));
doc+='\n## Turn-order diagnostics\n\n192 additional full matches: 8 new seeds × 2 schools × both starters × 3 regions × two schedules. No charms; Tactical AI on both seats in all regions avoids an Expert forecast that assumes the next move belongs to the opponent during consecutive snake turns. This policy still optimizes final control, not accumulated scoring.\n\nCounts are first-side wins / ties / second-side wins, 32 matches per row. Tie-break and checkpoint scores are rescoring of the same alternating games, not policies trained for those rules. Snake alternates initiative per two-play round (AB, BA, AB…).\n\n| Region | Alternating, final control | Snake, final control | Alternating, first wins ties | Alternating, sum of round-end control |\n| --- | --- | --- | --- | --- |\n';
const tally=(rows,fn)=>{const d=rows.map(r=>fn(r)*(r.first==='player'?1:-1));return `${d.filter(x=>x>0).length} / ${d.filter(x=>x===0).length} / ${d.filter(x=>x<0).length}`;};
for(let region=0;region<3;region++){
 const a=order.filter(r=>r.region===region&&r.initiative==='alternating'),b=order.filter(r=>r.region===region&&r.initiative==='snake');
 doc+=`| ${['Shoreline','Ocean','Bermuda'][region]} | ${tally(a,r=>r.difference)} | ${tally(b,r=>r.difference)} | ${tally(a,r=>r.difference||(r.first==='player'?1:-1))} | ${tally(a,r=>r.checkpoints.reduce((n,s)=>n+s.player-s.rival,0))} |\n`;
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync('.cache/balance/charm-holdout.json',JSON.stringify(pairs));fs.writeFileSync('.cache/balance/order-holdout.json',JSON.stringify(order));fs.writeFileSync('docs/CHARM_HOLDOUT_RESULTS.md',doc);console.log(doc);
