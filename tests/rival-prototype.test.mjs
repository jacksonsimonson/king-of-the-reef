import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {REGIONS} from '../src/game/run/maps.ts';
import {weightedRivalSchool,RIVAL_STYLES,schoolRating} from '../src/game/run/rivalSchools.ts';
import {prototypeSchool} from '../scripts/balance/rival-prototype.mjs';

test('study sampler matches production at zero and lowers only ordinary target budgets',()=>{
 for(const region of [1,2]){
  const pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));let baseline=0,lower=0;
  for(const style of Object.keys(RIVAL_STYLES))for(let i=0;i<20;i++){
   const seed=`prototype-${i}`,current=weightedRivalSchool(pool,seed,style,false,region);
   assert.deepEqual(prototypeSchool(pool,seed,style,region,0),current);
   const candidate=prototypeSchool(pool,seed,style,region,-.2);
   assert.equal(candidate.length,10);assert.equal(new Set(candidate.map(c=>c.texture)).size,10);
   assert.ok(candidate.every(c=>pool.some(p=>p.texture===c.texture)));
   baseline+=schoolRating(current);lower+=schoolRating(candidate);
  }
  assert.ok(lower<baseline);
 }
});
