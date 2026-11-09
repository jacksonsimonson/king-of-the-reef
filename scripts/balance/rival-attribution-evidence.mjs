import fs from 'node:fs';
import assert from 'node:assert/strict';
const files=process.argv.slice(2);assert.ok(files.length);
const rows=files.flatMap(file=>{const batch=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(batch.complete,true);assert.equal(batch.results.length,batch.fixtures*9);return batch.results;});
assert.equal(new Set(rows.map(r=>[r.seed,r.node,r.schoolPolicy,r.composition,r.difficulty].join(':'))).size,rows.length,'Duplicate cohort');
const mean=xs=>xs.length?Number((xs.reduce((a,b)=>a+b,0)/xs.length).toFixed(3)):null;
console.log(JSON.stringify([1,2].map(region=>{
 const regional=rows.filter(r=>r.region===region);
 return {region,seeds:new Set(regional.map(r=>r.seed)).size,cells:['weighted','uniform','carried'].flatMap(composition=>['beginner','tactical','expert'].map(difficulty=>{
  const sample=regional.filter(r=>r.composition===composition&&r.difficulty===difficulty);
  const deltas=sample.map(r=>{const base=regional.find(b=>b.seed===r.seed&&b.node===r.node&&b.schoolPolicy===r.schoolPolicy&&b.composition==='weighted'&&b.difficulty===(region===1?'tactical':'expert'));assert.ok(base);return r.margin-base.margin;});
  return {composition,difficulty,n:sample.length,wins:sample.filter(r=>r.margin>0).length,draws:sample.filter(r=>r.margin===0).length,losses:sample.filter(r=>r.margin<0).length,margin:mean(sample.map(r=>r.margin)),delta:mean(deltas)};
 }))};
}),null,2));
