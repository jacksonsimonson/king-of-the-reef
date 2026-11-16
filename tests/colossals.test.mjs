import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {freshAbilityMemory,validAbilityMemory} from '../src/game/battleAbilityState.ts';
import {freshColossal} from '../src/game/colossalState.ts';
import {COLOSSALS,colossalSchool,companionCard} from '../src/game/run/colossals.ts';
import {validBattleSave} from '../src/game/run/battleSave.ts';
import {regionalRules} from '../src/game/battleRules.ts';
import {REGIONS} from '../src/game/run/maps.ts';
import {createRun,rivalDeckFor,battleResult,claimColossalReward,saveRun,loadRun,SAVE_KEY} from '../src/game/run/state.ts';
const fish=(id,owner='player',edges=[],ability)=>({...STARTERS[0],id,name:id,owner,condition:'healthy',edges,ability});
const edge=(direction,effect)=>({direction,effect});
const setup=(boss,size=5)=>({board:Array(size*size).fill(null),shocked:new Set(),terrain:{rocks:new Set(),whirlpools:[null,null],features:new Map()},memory:{...freshAbilityMemory(),colossal:freshColossal(boss,size-1)}});
test('Reefback only armors a supported rival; two pulses, no overwritten edges or mutation',()=>{
  const s=setup('reefback');s.memory.colossal.plays.rival=1;s.board[11]=fish('holder','rival',[edge('right','standard')]);s.board[10]=fish('support','rival');
  const copy=structuredClone(s),r=resolvePlacement(s,24,fish('actor','rival'),5,true);
  assert.deepEqual(s,copy);assert.equal(r.board[11].edges.length,2);assert.deepEqual(r.board[11].edges[0],s.board[11].edges[0]);
  assert.equal(r.board[11].edges[1].effect,'weak');assert.equal(r.frames.at(-1).label,'Reefback King');
  s.board[10]=null;assert.equal(resolvePlacement(s,24,fish('actor','rival')).board[11].edges.length,1);
  s.memory.colossal.plays.rival=2;s.board[10]=fish('support','rival');assert.equal(resolvePlacement(s,24,fish('actor','rival')).board[11].edges.length,1);
});
test('Sonar gives a response: move the prey or support it; only a still-isolated marked ID dies',()=>{
  for(const size of [5,6,7]) {
    const s=setup('midnight',size);s.memory.colossal.plays.rival=1;s.board[1]=fish('prey');
    const marked=resolvePlacement(s,size*size-1,fish('hunter','rival'),size,true);
    assert.deepEqual(marked.memory.colossal.prey,{id:'prey',index:1});assert.ok(marked.board[1]);
    const next={...marked,terrain:s.terrain};
    const dead=resolvePlacement(next,size*size-2,fish('response'),size,true);assert.ok(dead.killedIds.includes('prey'));assert.equal(dead.memory.colossal.prey,undefined);
    const supported=resolvePlacement(next,0,fish('friend'),size);assert.equal(supported.board[1].id,'prey');
    const moved=resolvePlacement(next,0,fish('pusher','player',[edge('right','standard')]),size);assert.equal(moved.board[2].id,'prey');
    const replaced=structuredClone(next);replaced.board[1]=fish('different');assert.ok(resolvePlacement(replaced,3,fish('reply'),size).board[1]);
  }
});
test('Sunken Eye laser stops at first creature/rock; upper Shields and Bulwark block, no kills',()=>{
  for(const size of [5,6,7]) for(const counter of ['none','shield','bulwark','rock','friendly']) {
    const s=setup('sunken-eye',size);s.memory.colossal.lane=1;
    s.board[size+1]=fish('target','player',counter==='shield'?[edge('up','weak')]:[],counter==='bulwark'?'bulwark':undefined);
    if(counter==='rock')s.terrain.rocks.add(1);
    if(counter==='friendly')s.board[1]=fish('screen','rival');
    const r=resolvePlacement(s,size*size-1,fish('reply'),size,true);
    assert.equal(r.shocked.has('target'),counter==='none');assert.equal(r.shocked.has('screen'),counter==='friendly');
    assert.equal(r.killedIds.length,0);assert.equal(r.memory.colossal.lane,undefined);assert.ok(r.frames.at(-1).beamTiles.length);
    assert.deepEqual(resolvePlacement(s,size*size-1,fish('reply'),size,false).board,r.board);
  }
});
test('No new threat after last response; fresh tide clears marks; malformed boss memory rejected',()=>{
  const s=setup('sunken-eye',7);s.memory.colossal.plays.player=6;s.memory.colossal.plays.rival=3;
  assert.equal(resolvePlacement(s,48,fish('last','rival'),7).memory.colossal.lane,undefined);
  assert.equal(freshColossal('sunken-eye',6).lane,undefined);
  s.memory.colossal.lane=7;assert.equal(validAbilityMemory(s.memory,7),false);
  const whale=setup('midnight',6);whale.memory.colossal.plays.rival=3;whale.board[1]=fish('prey');
  assert.equal(resolvePlacement(whale,35,fish('hunter','rival'),6).memory.colossal.prey,undefined);
});
test('Themed schools deterministic, regional, varied and respect disabled cards',()=>{
  for(let region=0;region<3;region++){
    const pool=STARTERS.filter(c=>REGIONS[region].pool.includes(c.texture));
    for(const texture of COLOSSALS[region].pool)assert.ok(pool.some(c=>c.texture===texture),texture);
    const samples=new Set();
    for(let seed=0;seed<12;seed++){
      const a=colossalSchool(pool,region,''+seed);assert.deepEqual(a,colossalSchool(pool,region,''+seed));
      assert.equal(a.length,10);assert.ok(a.slice(0,6).every(c=>COLOSSALS[region].pool.includes(c.texture)));
      assert.ok(a.every(c=>a.filter(f=>f.texture===c.texture).length<=2));samples.add(a.map(c=>c.texture).join(','));
    }
    assert.ok(samples.size>1);
    const restricted=pool.slice(0,3),school=colossalSchool(restricted,region,'restricted');assert.ok(school.every(c=>restricted.some(f=>f.texture===c.texture)));
  }
});
test('Only opted-in runs change; reward survives save, claimed once, and final boss completes voyage',()=>{
  const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const legacy=createRun('old');assert.equal(legacy.colossalVersion,undefined);
  const run=createRun('new',2,undefined,false,true);assert.equal(run.colossalVersion,1);
  const boss=run.maps[0].nodes.at(-1);run.current=run.maps[0].nodes.find(n=>n.next.includes(boss.id)).id;run.pending=boss.id;
  assert.equal(rivalDeckFor(run).length,10);battleResult(run,1,0);assert.equal(run.colossalReward,0);
  saveRun(run);const restored=loadRun();assert.ok(restored);assert.equal(restored.colossalReward,0);
  const n=restored.school.length;assert.equal(claimColossalReward(restored,99),false);assert.equal(claimColossalReward(restored,0),true);
  assert.equal(restored.school.length,n+1);assert.equal(restored.school.at(-1).ability,'escort');assert.equal(claimColossalReward(restored,0),false);
  restored.region=2;restored.pending=restored.maps[2].nodes.at(-1).id;battleResult(restored,1,0);assert.equal(restored.status,'won');assert.equal(restored.colossalReward,undefined);
  store.delete(SAVE_KEY);
});
test('Companions trade a real edge, preserve ordinary definitions and have one innate ability',()=>{
  for(const boss of COLOSSALS)for(const reward of boss.rewards){
    const base=STARTERS.find(c=>c.texture===reward.texture),copy=structuredClone(base),card=companionCard(base,reward);
    assert.deepEqual(base,copy);assert.equal(card.edges.length,base.edges.length-1);assert.equal(card.ability,reward.ability);assert.equal(card.battleAbilities,undefined);
    assert.ok(card.edges.length>0);assert.equal(card.condition,'healthy');
  }
});
test('Boss saves require matching rules, counters and valid telegraphs',()=>{
  for(let region=0;region<3;region++){
    const size=5+region,memory=freshAbilityMemory();memory.colossal=freshColossal(COLOSSALS[region].id,4+region);
    const save={version:1,nodeId:'boss',board:Array(size*size).fill(null),playerHand:[],rivalHand:[],playerDeck:[],rivalDeck:[],shocked:[],killedIds:[],plays:{player:0,rival:0},turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null,memory,
      rules:{...regionalRules(region,'save'),colossal:COLOSSALS[region].id},twoTide:{opening:{playerHand:[],rivalHand:[],playerDeck:[],rivalDeck:[],charms:[]},scores:[],seed:'save',intermission:false,charms:[],spentCharms:[],killedIds:[]}};
    if(region===1)memory.colossal.prey={id:'target',index:1};if(region===2)memory.colossal.lane=1;
    assert.ok(validBattleSave(JSON.parse(JSON.stringify(save)),'boss'));
    const mismatch=structuredClone(save);mismatch.memory.colossal.plays.rival=1;assert.equal(validBattleSave(mismatch,'boss'),false);
    const missing=structuredClone(save);delete missing.rules.colossal;assert.equal(validBattleSave(missing,'boss'),false);
  }
});
test('Sonar removal respects Afterimage and does not retrigger after its response',()=>{
  const s=setup('midnight');s.board[1]=fish('phantom','player',[],'afterimage');s.memory.colossal.prey={id:'phantom',index:1};
  const r=resolvePlacement(s,24,fish('response'),5,true);assert.ok(r.killedIds.includes('phantom'));assert.ok(r.memory.decoys.some(t=>t.index===1));
  const again=resolvePlacement({...r,terrain:s.terrain},23,fish('next','rival'),5,true);assert.equal(again.killedIds.length,0);
});
