import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,enterNode,rivalDeckFor,saveRun,loadRun,battleResult} from '../src/game/run/state.ts';
import {validBattleSave,voyageMatchFormat} from '../src/game/run/battleSave.ts';
import {regionalRules} from '../src/game/battleRules.ts';
import {matchCharmSpending,tidePlayLimit} from '../src/game/twoTide.ts';

function fixture(region=0,type='battle') {
 const run=createRun('VOYAGE-TWO-TIDE');run.region=region;
 const node=run.maps[region].nodes.find(n=>n.type===type);
 run.current=run.maps[region].nodes.find(n=>n.next.includes(node.id)).id;
 assert.ok(enterNode(run,node.id));run.charms=['anchor-stone','anchor-stone','drift-shell'];
 const rivals=rivalDeckFor(run),rules=regionalRules(region,'checkpoint');
 const opening=structuredClone({playerHand:run.school.slice(0,5).map(card=>({card,played:false})),rivalHand:rivals.slice(0,5).map(card=>({card,played:false})),playerDeck:run.school.slice(5),rivalDeck:rivals.slice(5),charms:run.charms});
 const s={version:1,nodeId:node.id,rules,board:Array(rules.size**2).fill(null),...structuredClone(opening),plays:{player:0,rival:0},shocked:[],killedIds:[],turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null,
  twoTide:{opening,scores:[],seed:'checkpoint',intermission:false,charms:[...run.charms],spentCharms:[],killedIds:[]}};
 delete s.charms;run.battle=s;return {run,s};
}
test('new Voyage battles use two tides; old in-progress battles retain Classic',()=>{
 assert.equal(voyageMatchFormat(),'two-tide');const {s}=fixture();assert.equal(voyageMatchFormat(s),'two-tide');delete s.twoTide;assert.equal(voyageMatchFormat(s),'classic');assert.ok(validBattleSave(s,s.nodeId));
});
test('both tides and intermission round-trip with regional budgets, ledgers and action RNG',()=>{
 const map=new Map();globalThis.localStorage={setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)??null};
 for(const region of [0,1,2])for(const phase of ['first','break','second']){
  const {run,s}=fixture(region);s.plays={player:tidePlayLimit(s.rules.region),rival:tidePlayLimit(s.rules.region)};
  s.twoTide.charms=['anchor-stone','drift-shell'];s.twoTide.spentCharms=['anchor-stone'];s.rngCalls=9;
  if(phase!=='first'){s.twoTide.scores=[{player:2,rival:1}];s.twoTide.killedIds=[s.playerHand[0].card.id];}
  s.twoTide.intermission=phase==='break';if(phase==='second')s.turn='rival';
  assert.ok(validBattleSave(s,s.nodeId));assert.ok(saveRun(run));assert.deepEqual(loadRun().battle,s);
  assert.deepEqual(run.charms,['anchor-stone','anchor-stone','drift-shell'],'no permanent charges before combined result');
 }
});
test('malformed two-tide checkpoints are rejected',()=>{
 const {s}=fixture();for(const mutate of [
  t=>t.twoTide=null,t=>t.twoTide.opening=null,t=>t.twoTide.scores=[{player:-1,rival:0}],
  t=>t.twoTide.scores=[{player:0,rival:0},{player:0,rival:0}],t=>t.twoTide.intermission=true,
  t=>t.twoTide.charms=[],t=>t.twoTide.spentCharms=['coral-mail'],t=>t.twoTide.killedIds=['unknown'],
  t=>t.twoTide.opening.playerHand[0].played=true,t=>t.plays.player=5,
  t=>t.twoTide.opening.playerDeck.push(t.twoTide.opening.playerHand[0].card),
 ]){const bad=structuredClone(s);mutate(bad);assert.equal(validBattleSave(bad,s.nodeId),false);}
});
test('refreshed charms consume maximum copies used in either tide, not both tides added',()=>{
 const opening=['anchor-stone','anchor-stone','drift-shell'];
 const first=matchCharmSpending(opening,['anchor-stone','drift-shell'],[]);
 assert.deepEqual(first,['anchor-stone']);
 assert.deepEqual(matchCharmSpending(opening,['anchor-stone','drift-shell'],first),first);
 assert.deepEqual(matchCharmSpending(opening,['drift-shell'],first),['anchor-stone','anchor-stone']);
 assert.deepEqual(matchCharmSpending(opening,['anchor-stone','anchor-stone'],first),['anchor-stone','drift-shell']);
});
test('combined result settles charms, both tides casualties and one reward or resolve loss',()=>{
 for(const [player,rival] of [[4,2],[2,4],[3,3]]){
  const {run}=fixture();const shells=run.shells,resolve=run.resolve;
  const killed=run.school.slice(0,2).map(c=>c.id);
  battleResult(run,player,rival,killed,['anchor-stone','drift-shell']);
  assert.deepEqual(run.charms,['anchor-stone']);assert.ok(run.school.slice(0,2).every(c=>c.condition==='killed'));
  assert.equal(run.battle,undefined);assert.equal(run.resolve,resolve-(player<rival?1:0));assert.equal(run.shells>shells,player>=rival);
  const after=JSON.stringify(run);battleResult(run,player,rival,killed,['anchor-stone']);assert.equal(JSON.stringify(run),after);
 }
});
test('boss combined draws retain rematch, losses cost one resolve, wins advance one map',()=>{
 for(const [player,rival] of [[1,1],[1,2],[2,1]]){
  const {run}=fixture(0,'boss'),resolve=run.resolve;
  battleResult(run,player,rival,[],['anchor-stone']);
  assert.equal(run.region,player>rival?1:0);assert.equal(run.pending!==null,player<=rival);
  if(player<=rival)assert.equal(run.resolve,resolve-(player<rival?1:0));
  assert.equal(run.battle,undefined);assert.equal(voyageMatchFormat(run.battle),'two-tide');
 }
});
