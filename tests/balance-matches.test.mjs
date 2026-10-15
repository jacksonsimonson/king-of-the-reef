import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {match,SCHOOLS} from '../scripts/balance/matches.mjs';
import {PROPOSALS,candidate} from '../scripts/balance/match-proposals.mjs';
test('mixed schools contain ten distinct known cards and matches finish at regional play limits',()=>{
 for(const schools of SCHOOLS)for(const school of schools){assert.equal(school.length,10);assert.equal(new Set(school).size,10);for(const id of school)assert.ok(STARTERS.some(c=>c.texture===id),id);}
 for(let region=0;region<3;region++)for(const first of ['player','rival']){
  const r=match({region,first,seed:'MATCH-REGRESSION'});assert.equal(r.trace[0].owner,first);assert.deepEqual(r.plays,{player:5+region,rival:5+region});
  assert.equal(r.trace.length,2*(5+region));for(const owner of ['player','rival']){const moves=r.trace.filter(t=>t.owner===owner);assert.equal(new Set(moves.map(t=>t.card)).size,moves.length);for(const move of moves)assert.ok(move.available.includes(move.card));}
  assert.ok(r.score.player>=0&&r.score.rival>=0);assert.equal(r.difference,r.score.player-r.score.rival);
 }
});
test('paired runs are deterministic, proposals never mutate live data and layouts remain unique',()=>{
 const before=structuredClone(STARTERS),options={region:2,school:0,seed:'PAIRED-REGRESSION'};
 assert.deepEqual(match(options),match(options));
 const layout=c=>['up','right','down','left'].map(d=>c.edges.find(e=>e.direction===d)?.effect??'blank').join('/');
 for(const p of PROPOSALS){const c=candidate(p);assert.ok(!STARTERS.some(other=>other.texture!==p.texture&&layout(other)===layout(c)),p.texture);match({...options,override:c});}
 assert.deepEqual(STARTERS,before);
});
const fish=(id,owner='rival')=>({id,texture:'minnow',name:id,species:'fixture',owner,condition:'healthy',edges:[]});
const state=entries=>({board:Object.assign(Array(25).fill(null),Object.fromEntries(entries)),shocked:new Set()});
test('proposed Angler keeps lure-and-bite role while losing left-side shutdown',()=>{
 const c={...candidate(PROPOSALS[0]),id:'angler',owner:'player',condition:'healthy'};
 const result=resolvePlacement(state([[14,fish('lure')],[17,fish('prey')],[11,fish('left')]]),12,c);
 assert.equal(result.board[13]?.id,'lure');assert.ok(result.killedIds.includes('prey'));assert.ok(!result.shocked.has('left'));
});
test('proposed Buoy keeps bobbing movement and upward wave, losing unrelated lower pull',()=>{
 const c={...candidate(PROPOSALS[1]),id:'buoy',owner:'player',condition:'healthy'};
 const result=resolvePlacement(state([[7,fish('wave')],[22,fish('below')]]),12,c);
 assert.equal(result.board[13]?.id,'buoy');assert.equal(result.board[2]?.id,'wave');assert.equal(result.board[22]?.id,'below');
});
