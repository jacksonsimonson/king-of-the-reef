import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,recruit,resolveVisit,offers,beginFishing,finishFishing,battleResult,claimColossalReward,saveRun,loadRun,shopOffers,buyOffer} from '../src/game/run/state.ts';
import {freshRecap,validRecap,recapSnapshot} from '../src/game/run/recap.ts';
import {settleBattleWithSummary} from '../src/game/run/battleSummary.ts';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
const run=()=>createRun('RECAP',2,undefined,true,true);
function at(r,type,region=r.region){r.region=region;const n=r.maps[region].nodes.find(n=>n.type===type&&n.column>0);assert.ok(n,type);r.current=r.maps[region].nodes.find(p=>p.next.includes(n.id)).id;r.pending=n.id;delete r.camp;return n;}
test('New departures record from zero after starters; old saves have no invented history',()=>{
 const r=run();assert.equal(r.school.length,8);assert.deepEqual(r.recap,freshRecap());
 delete r.recap;saveRun(r);const old=loadRun();assert.ok(old);assert.equal(old.recap,undefined);assert.equal(recapSnapshot(old).matches,undefined);
});
test('Recruiting, camp release, fishing and purchases count successful actions once',()=>{
 const r=run();const released=r.school[0].id;assert.ok(resolveVisit(r,released));assert.equal(r.recap.departed,1);assert.equal(resolveVisit(r,released),false);
 assert.ok(resolveVisit(r,'fish'));assert.ok(beginFishing(r,offers(r)[0]));const end={...r.fishing.snapshot,status:'caught',progress:1};assert.ok(finishFishing(r,end));assert.equal(finishFishing(r,end),false);
 assert.equal(r.recap.caught,1);assert.equal(r.recap.recruited,1);
 recruit(r,'minnow');assert.equal(r.recap.recruited,2);
 at(r,'shop');r.shells=100;const offer=shopOffers(r)[0];assert.ok(buyOffer(r,offer.id));assert.equal(buyOffer(r,offer.id),false);assert.equal(r.recap.purchases,1);
});
test('Boss attempts, repeated injuries, spending and passage recovery use real settlement',()=>{
 const r=run();at(r,'boss');const id=r.school[0].id;r.charms=['anchor-stone'];
 battleResult(r,1,1,[id,id],['anchor-stone','anchor-stone']);assert.equal(r.recap.casualties,1);assert.equal(r.recap.charmsUsed,1);
 battleResult(r,0,1,[id]);assert.equal(r.recap.casualties,1);
 battleResult(r,2,0);const row=r.recap.regions[0];assert.deepEqual(row,{wins:1,losses:1,draws:1,pointsFor:3,pointsAgainst:2,bossAttempts:3,bossDefeated:true});
 assert.equal(r.recap.recoveries,1);assert.equal(r.colossalReward,0);assert.ok(claimColossalReward(r,0));assert.equal(r.recap.companions[0].name,'Hermit Crab');assert.equal(r.recap.recruited,1);
 assert.equal(claimColossalReward(r,0),false);assert.equal(r.recap.companions.length,1);
 saveRun(r);assert.deepEqual(loadRun().recap,r.recap);
});
test('Hydration records actual recoveries, no empty-rest inflation',()=>{
 const r=run();r.school[0].condition='killed';at(r,'hydration');assert.ok(resolveVisit(r,'rest',[r.school[0].id]));assert.equal(r.recap.recoveries,1);
 at(r,'hydration');assert.ok(resolveVisit(r,'rest',[]));assert.equal(r.recap.recoveries,1);
});
test('Final victory exposes outcome once, persists recap and does not offer a useless companion',()=>{
 const r=run();at(r,'boss',2);const summary=settleBattleWithSummary(r,[{player:2,rival:0},{player:1,rival:1}],[],[]);
 assert.equal(summary.outcome,'won');assert.equal(r.status,'won');assert.equal(r.colossalReward,undefined);
 const before=structuredClone(r.recap);assert.equal(settleBattleWithSummary(r,[{player:3,rival:0}],[],[]),undefined);assert.deepEqual(r.recap,before);
 const snapshot=recapSnapshot(r);assert.equal(snapshot.matches,1);assert.equal(snapshot.wins,1);assert.equal(snapshot.won,true);assert.equal(snapshot.recorded.regions[2].pointsFor,3);
 saveRun(r);assert.equal(loadRun().status,'won');assert.deepEqual(loadRun().recap,before);
});
test('Defeat exposes the same recap without creating a victory or erasing the school',()=>{
 const r=run();r.resolve=1;at(r,'battle');const summary=settleBattleWithSummary(r,[{player:0,rival:2}],[],[]);
 assert.equal(summary.outcome,'lost');assert.equal(recapSnapshot(r).won,false);assert.equal(recapSnapshot(r).losses,1);assert.equal(r.school.length,8);
});
test('Malformed history is rejected and snapshots leave the saved run untouched',()=>{
 const r=run(),before=structuredClone(r);recapSnapshot(r);assert.deepEqual(r,before);
 for(const mutate of [r=>r.regions[0].wins=-1,r=>r.regions.pop(),r=>r.regions[0].bossDefeated=true,r=>r.charmsUsed=NaN,r=>r.companions=[{region:4,name:'Bad',ability:'none'}]]){const record=freshRecap();mutate(record);assert.equal(validRecap(record),false);}
 r.recap.recruited=-1;saveRun(r);assert.equal(loadRun(),null);
});
