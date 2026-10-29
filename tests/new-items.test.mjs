import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARMS,CHARM_IDS,V2_CHARM_IDS,charmCard,canCharmCard} from '../src/game/data/tideCharms.ts';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {hasAbility} from '../src/game/abilities.ts';
import {createRun,saveRun,loadRun,shopOffers} from '../src/game/run/state.ts';
import {generateShop} from '../src/game/run/shop.ts';
const fish=(id,owner='player',edges=[])=>({...STARTERS[0],id,owner,edges,condition:'healthy'});
const state=(entries={})=>({board:Object.assign(Array(25).fill(null),entries),shocked:new Set(),terrain:{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}});
test('new charms retain innate abilities, reject duplicate grants and leave school cards unchanged',()=>{
 const base={...fish('actor'),ability:'revelation'},before=structuredClone(base);
 for(const [id,ability] of [['guardian-ribbon','escort'],['cuttle-ink','ambush'],['surge-bottle','wake']]){
  const changed=charmCard(base,id);assert.ok(hasAbility(changed,ability));assert.ok(hasAbility(changed,'revelation'));
  assert.equal(canCharmCard(changed,id),false);assert.deepEqual(base,before);
 }
 assert.equal(new Set(CHARM_IDS).size,16);
 assert.equal(new Set(CHARM_IDS.slice(12).map(id=>JSON.stringify(CHARMS[id].icon))).size,4);
});
test('Guardian protects an ordinary ally but its shields also block friendly delivery',()=>{
 const ally=fish('holder');const protectedState=resolvePlacement(state({11:ally}),12,charmCard(fish('support'),'guardian-ribbon'));
 assert.equal(protectedState.board[11].edges.length,4);
 for(const owner of ['player','rival']){
  const attacked=resolvePlacement(protectedState,16,fish('pusher',owner,[{direction:'up',effect:'standard'}]));
  assert.equal(attacked.board[11].id,'holder');
 }
 assert.equal(ally.edges.length,0);
});
test('Cuttle Ink removes ordinary edge defense before the equipped fish pushes',()=>{
 const target=fish('defender','rival',[{direction:'left',effect:'weak'}]);
 const actor=fish('pusher','player',[{direction:'right',effect:'standard'}]);
 assert.equal(resolvePlacement(state({12:target}),11,actor).board[12].id,'defender');
 const result=resolvePlacement(state({12:target}),11,charmCard(actor,'cuttle-ink'));
 assert.ok(result.shocked.has('defender'));assert.equal(result.board[13].id,'defender');
 const bulwark={...target,ability:'bulwark'};
 assert.equal(resolvePlacement(state({12:bulwark}),11,charmCard(actor,'cuttle-ink')).board[12].id,'defender');
});
test('Surge follows edges, spares allies, and respects Anchor and occupied destinations',()=>{
 const actor=charmCard(fish('surge'),'surge-bottle'),enemy=fish('enemy','rival',[{direction:'left',effect:'weak'}]);
 assert.equal(resolvePlacement(state({12:enemy}),11,actor).board[13].id,'enemy');
 for(const entries of [{12:{...enemy,ability:'anchor'}},{12:enemy,13:fish('blocker')},{12:fish('ally')}]){
  const result=resolvePlacement(state(entries),11,actor);assert.equal(result.board[12].id,entries[12].id);
 }
 const push=charmCard(fish('push','player',[{direction:'right',effect:'standard'}]),'surge-bottle');
 assert.equal(resolvePlacement(state({12:fish('enemy','rival')}),11,push).board[13].id,'enemy','Wake does not push an already distant target twice');
});
test('Undertow trades adjacent pushes for gap pulls without changing other edges',()=>{
 const base=fish('puller','player',[{direction:'right',effect:'standard'},{direction:'up',effect:'weak'}]),modified=charmCard(base,'undertow-lure');
 assert.deepEqual(modified.edges,[{direction:'right',effect:'hook'},{direction:'up',effect:'weak'}]);
 assert.equal(resolvePlacement(state({12:fish('holder')}),10,modified).board[11].id,'holder');
 assert.equal(resolvePlacement(state({11:fish('adjacent')}),10,modified).board[11].id,'adjacent');
 assert.equal(canCharmCard(modified,'undertow-lure'),false);assert.equal(base.edges[0].effect,'standard');
});
test('version-two stock and purchases survive while new games expose all four additions',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 assert.deepEqual(V2_CHARM_IDS,['current-conch','spyglass-pearl','nautilus-dial','coral-mail','spear-shell','breaker-tooth','barbed-wreath','dredger-net','drift-shell','anchor-stone','reef-beacon','duelist-pearl']);
 const seen=new Set();
 for(let seed=0;seed<120;seed++){
  const old=generateShop(String(seed),'shop',0,['minnow','anchovy'],3,true,2,true);
  assert.ok(old.filter(o=>o.kind==='charm').every(o=>V2_CHARM_IDS.includes(o.charm)));
  generateShop(String(seed),'shop',0,['minnow','anchovy'],3,true,3,true).filter(o=>o.kind==='charm').forEach(o=>seen.add(o.charm));
 }
 for(const id of CHARM_IDS.slice(12))assert.ok(seen.has(id));
 for(const version of [2,3]){
  const run=createRun('ITEM-SAVE');assert.equal(run.charmPoolVersion,3);run.charmPoolVersion=version;
  run.pending=run.maps[0].nodes.find(n=>n.type==='shop').id;run.current=run.maps[0].nodes.find(n=>n.next.includes(run.pending)).id;
  run.shop={nodeId:run.pending,purchased:[run.pending+':1']};
  run.charms=['guardian-ribbon','cuttle-ink','undertow-lure'];const stock=shopOffers(run);saveRun(run);
  const loaded=loadRun();assert.deepEqual(shopOffers(loaded),stock);assert.deepEqual(loaded.charms,run.charms);assert.deepEqual(loaded.shop,run.shop);
 }
});
