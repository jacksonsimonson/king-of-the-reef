import test from 'node:test';
import assert from 'node:assert/strict';
import {combinedScore,freshTide,tidePlayLimit} from '../src/game/twoTide.ts';
import {match} from '../scripts/balance/matches.mjs';
test('a second tide restores resources without sharing combat mutations',()=>{
 const opening={hand:[{card:{id:'fish',edges:{up:'bite'}},played:false}],deck:[{id:'reserve'}],charms:['anchor']};
 const first=freshTide(opening);first.hand[0].played=true;first.hand[0].card.edges.up='shock';first.deck.pop();first.charms.pop();
 assert.deepEqual(freshTide(opening),opening);assert.equal(opening.hand[0].card.edges.up,'bite');
});
test('each starter gets a short tide; totals award neither ties nor a final-tide bonus',()=>{
 assert.deepEqual([5,6,7].map(tidePlayLimit),[4,4,4]);
 assert.deepEqual(combinedScore([{player:4,rival:1},{player:0,rival:3}]),{player:4,rival:4});
 assert.deepEqual(combinedScore([]),{player:0,rival:0});
});
test('current mixed schools complete short tides in both orders with refreshed charms',()=>{
 for(const region of [0,1,2]){
  const args={region,seed:'TWO-TIDE-REGRESSION',current:true,playLimit:tidePlayLimit(5+region),loadout:['anchor-stone','drift-shell','coral-mail']};
  const a=match({...args,first:'player'}),b=match({...args,first:'rival'});
  for(const leg of [a,b])assert.deepEqual(leg.plays,{player:args.playLimit,rival:args.playLimit});
  assert.equal(a.trace[0].owner,'player');assert.equal(b.trace[0].owner,'rival');
  assert.deepEqual(combinedScore([a.score,b.score]),combinedScore([b.score,a.score]));
 }
});
