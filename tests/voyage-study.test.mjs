import test from 'node:test';
import assert from 'node:assert/strict';
import {match} from '../scripts/balance/matches.mjs';
import {voyage} from '../scripts/balance/voyages.mjs';
import {createRun,rivalDeckFor} from '../src/game/run/state.ts';
test('study combat uses exact carried IDs, excludes injured fish, and never mutates the school',()=>{
 const run=createRun('CARRIED');run.school.slice(2).forEach(c=>c.condition='killed');
 const decks={player:run.school,rival:rivalDeckFor(run)},before=JSON.stringify(decks);
 const a=match({customDecks:decks,current:true,playLimit:4,charmMode:'player',loadout:['anchor-stone'],collectFrames:true});
 assert.equal(a.plays.player,2);assert.equal(a.plays.rival,4);assert.equal(a.trace.filter(t=>t.owner==='player').length,2);assert.equal(JSON.stringify(decks),before);assert.ok(a.frameCount>0);
 assert.ok(a.killedIds.every(id=>[...decks.player,...decks.rival].some(c=>c.id===id)));
});
test('full Voyage study is deterministic and distinguishes capped rematches from defeat',()=>{
 const options={seed:'VOYAGE-STUDY-REGRESSION',maxBossAttempts:2};const a=voyage(options),b=voyage(options);assert.deepEqual(a,b);
 assert.ok(a.battles.length>0);assert.ok(['won','lost'].includes(a.status)||a.capped);assert.ok(a.battles.every(m=>m.playerPlays<=2*(4+m.region)&&m.rivalPlays<=2*(4+m.region)));
 if(a.capped)assert.equal(a.status,'active');
});
