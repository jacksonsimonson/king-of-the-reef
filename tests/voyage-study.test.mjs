import test from 'node:test';
import assert from 'node:assert/strict';
import {match} from '../scripts/balance/matches.mjs';
import {voyage} from '../scripts/balance/voyages.mjs';
import {createRun,rivalDeckFor} from '../src/game/run/state.ts';
import {summarizeVoyages} from '../scripts/balance/roster-voyage-report.mjs';
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
test('playtest capture receives detached encounter saves without changing simulation results',()=>{
 const options={seed:'VOYAGE-STUDY-REGRESSION',maxBossAttempts:2};let captured=0;
 const expected=voyage(options),actual=voyage({...options,onBattle:(run,attempt)=>{
  captured++;assert.ok(run.pending);assert.ok(attempt>=1);run.school.length=0;run.shells=0;
 }});
 assert.equal(captured,actual.battles.length);assert.deepEqual(actual,expected);
});
test('Voyage resource ledger reconciles purchases, recruitment, recovery and actual combat shortages',()=>{
 const run=voyage({seed:'RESOURCE-LEDGER',maxBossAttempts:2,catchRate:.6});
 assert.equal(run.balanceVersion,7);
 const complete=run.visits.filter(v=>v.after);
 assert.equal(24+complete.reduce((n,v)=>n+v.after.shells-v.shells,0),run.shells);
 assert.equal(8+complete.reduce((n,v)=>n+v.recruited.length-v.removed,0),run.school.length);
 assert.equal(run.healed,complete.filter(v=>v.type==='hydration').reduce((n,v)=>n+v.restored,0));
 assert.equal(run.purchases,complete.filter(v=>v.purchase).length);
 for(const v of complete){
  assert.ok(v.after.healthy<=v.after.school&&v.after.resolve<=3&&v.after.shells>=0);
  if(v.type==='hydration')assert.ok(v.restored<=3);
  if(v.purchase){assert.equal(v.shells-v.after.shells,v.purchase.price);assert.ok(v.stock.some(o=>o.affordable&&o.kind===v.purchase.kind&&o.price===v.purchase.price));}
 }
 for(const b of run.battles){assert.equal(b.after,b.before-b.dead+b.restored);assert.equal(b.injuredAfter,b.school-b.after);assert.ok(b.regionalHealthy<=b.before&&b.distinctHealthy<=b.before);assert.ok(b.playedTextures.every(id=>b.availableTextures.includes(id)));}
 const summary=summarizeVoyages([run]);assert.equal(summary.matches,run.battles.length);assert.equal(summary.recruited,complete.reduce((n,v)=>n+v.recruited.length,0));
 assert.equal(summary.purchases,summary.fishPurchases+summary.charmPurchases);
 assert.equal(summarizeVoyages([]).deadPerMatch,null);
});
