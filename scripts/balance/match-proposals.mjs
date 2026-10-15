import fs from 'node:fs';
import {STARTERS} from '../../src/game/data/starterFish.ts';
import {match} from './matches.mjs';
export const PROPOSALS=[{texture:'void-angler',school:0,remove:'left'},{texture:'buoy-jelly',school:1,remove:'down'}];
export function candidate(proposal){const original=STARTERS.find(c=>c.texture===proposal.texture);return {...original,edges:original.edges.filter(e=>e.direction!==proposal.remove)};}
export function proposalStudy(){
 const baseline=JSON.parse(fs.readFileSync('.cache/balance/matches.json','utf8')),all=[];
 let doc='\n## Simulation-only next-batch candidates\n\nEach candidate removes one edge, on the experimental side only. 16 matched seeds × both starting sides × terrain on/off = 64 pairs per creature. Baselines reuse the corresponding current-card matches above. These same-seed exploratory comparisons are not an independent validation set.\n\n| Proposal | Better / same / worse | Old → proposed mean margin | Old → proposed plays / 64 |\n| --- | --- | ---: | ---: |\n';
 for(const proposal of PROPOSALS){const rows=[];for(let n=0;n<16;n++)for(const first of ['player','rival'])for(const terrain of [true,false]){
  const seed='MIXED-v1-'+n;
  const old=baseline.find(r=>r.region===2&&!r.legacy&&r.school===proposal.school&&r.seed===seed&&r.first===first&&r.terrain===terrain);
  if(!old)throw new Error('Missing baseline; rerun match-report');
  const current=match({region:2,seed,school:proposal.school,first,terrain,override:candidate(proposal)});rows.push({old,current});
 }
 const sum=(key)=>rows.reduce((n,r)=>n+r[key].difference,0)/rows.length;
 const plays=key=>rows.filter(r=>r[key].trace.some(t=>t.owner==='player'&&t.card===proposal.texture)).length;
 const deltas=rows.map(r=>r.current.difference-r.old.difference);
 doc+=`| ${proposal.texture}: remove ${proposal.remove} | ${deltas.filter(d=>d>0).length} / ${deltas.filter(d=>d===0).length} / ${deltas.filter(d=>d<0).length} | ${sum('old').toFixed(3)} → ${sum('current').toFixed(3)} | ${plays('old')} → ${plays('current')} |\n`;
 all.push({proposal,rows});}
 fs.writeFileSync('.cache/balance/proposals.json',JSON.stringify(all));return doc;
}
