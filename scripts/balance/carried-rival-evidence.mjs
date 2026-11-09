import fs from 'node:fs';
import assert from 'node:assert/strict';

const path=process.argv[2];assert.ok(path,'Pass a carried-rivals JSON path');
const rows=JSON.parse(fs.readFileSync(path,'utf8'));
const mean=values=>values.length?Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(3)):null;
const outcome=r=>Math.sign(r.margin);
console.log(JSON.stringify([1,2].map(region=>{
 const regional=rows.filter(r=>r.region===region),base=regional.filter(r=>r.offset===0);
 assert.ok(base.length,'Missing region coverage');
 return {region,fixtures:base.length,seeds:new Set(base.map(r=>r.seed)).size,
  candidates:[0,-.1,-.2].map(offset=>{
   const sample=regional.filter(r=>r.offset===offset);assert.equal(sample.length,base.length);
   const pairs=sample.map(r=>({r,b:base.find(b=>b.fixture===r.fixture)}));
   return {offset,wins:sample.filter(r=>r.margin>0).length,draws:sample.filter(r=>r.margin===0).length,losses:sample.filter(r=>r.margin<0).length,
    meanMargin:mean(sample.map(r=>r.margin)),meanRating:mean(sample.map(r=>r.rating)),changed:sample.filter(r=>r.changed).length,
    outcomeImproved:pairs.filter(({r,b})=>outcome(r)>outcome(b)).length,outcomeWorsened:pairs.filter(({r,b})=>outcome(r)<outcome(b)).length,
    marginDelta:mean(pairs.map(({r,b})=>r.margin-b.margin)),
    seedMarginDeltas:Object.fromEntries([...new Set(base.map(b=>b.seed))].map(seed=>[seed,mean(pairs.filter(p=>p.r.seed===seed).map(({r,b})=>r.margin-b.margin))]))};
  })};
}),null,2));
