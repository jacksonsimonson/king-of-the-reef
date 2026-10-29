import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_SIX_STARTERS} from '../src/game/data/starterFish.ts';
import {ABILITY_ASSIGNMENTS} from '../src/game/data/abilityAssignments.ts';
import {ABILITIES,canPlaceFish,scoreBoard} from '../src/game/abilities.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {freshAbilityMemory,beginAbilityTurn,readyGrowth,growArm,validAbilityMemory} from '../src/game/battleAbilityState.ts';
import {placementOptions} from '../src/game/abilityOptions.ts';
import {abilityHandSteps} from '../src/game/abilityHands.ts';
import {chooseRivalMove} from '../src/game/rivalAI.ts';
import {createRun,runFishDefinition,saveRun,loadRun} from '../src/game/run/state.ts';
const fish=(id,ability,edges=[],owner='player')=>({...STARTERS[0],id,ability,edges,owner,condition:'healthy'});
const e=(direction,effect='standard')=>({direction,effect});
const terrain=()=>({rocks:new Set(),whirlpools:[-1,-1],features:new Map()});
const state=(entries={},size=5)=>({board:Object.assign(Array(size*size).fill(null),entries),shocked:new Set(),terrain:terrain(),memory:freshAbilityMemory()});
const play=(s,index,c,choice={})=>({...resolvePlacement(s,index,c,Math.sqrt(s.board.length),true,choice),terrain:s.terrain});
test('twenty assignments have exact edge budgets, distinct full identities and untouched basic guides',()=>{
 assert.equal(Object.keys(ABILITY_ASSIGNMENTS).length,20);assert.equal(new Set(Object.values(ABILITY_ASSIGNMENTS).map(a=>a.ability)).size,20);
 for(const [id,a] of Object.entries(ABILITY_ASSIGNMENTS)){const c=STARTERS.find(c=>c.texture===id);assert.equal(c.ability,a.ability);assert.deepEqual(c.edges,a.edges);assert.ok(ABILITIES[c.ability]);}
 for(const id of ['minnow','anchovy','sardine','goby','electric-eel'])assert.deepEqual(STARTERS.find(c=>c.texture===id),BATCH_SIX_STARTERS.find(c=>c.texture===id));
 const signatures=STARTERS.map(c=>JSON.stringify([['up','right','down','left'].map(d=>c.edges.find(e=>e.direction===d)?.effect??null),c.ability??null]));
 assert.equal(new Set(signatures).size,STARTERS.length);
});
test('Slipstream and Towline deliver reef holders, avoid hazards, and do not retrigger edges',()=>{
 let s=state();const actor=fish('s','slipstream',[e('down')]);let r=play(s,6,actor,{direction:'down'});assert.equal(r.board[11].id,'s');
 s.terrain.rocks.add(11);assert.equal(play(s,6,actor,{direction:'down'}).board[6].id,'s');
 s=state({16:fish('ally')});r=play(s,6,fish('t','towline'),{direction:'down'});assert.equal(r.board[11].id,'ally');
 s.board[16].ability='anchor';assert.equal(play(s,6,fish('t','towline'),{direction:'down'}).board[16].id,'ally');
});
test('Inflate consumes only successful hostile movement, not blocked exits, friendly pushes or Bite',()=>{
 const target=fish('p','inflate');const actor=fish('a',undefined,[e('right')],'rival');
 let s=state({12:target,13:fish('block')});assert.deepEqual(play(s,11,actor).memory.inflated,[]);
 s=state({12:target});let r=play(s,11,actor);assert.equal(r.board[12].id,'p');assert.deepEqual(r.memory.inflated,['p']);
 r.board[11]=null;r=play(r,11,actor);assert.equal(r.board[13].id,'p');
 assert.equal(play(s,11,{...actor,owner:'player'}).board[13].id,'p');
 assert.ok(play(s,11,fish('bite',undefined,[e('right','bigger-fish')],'rival')).killedIds.includes('p'));
 for(const effect of ['ram','wave','swap'])assert.equal(play(s,11,fish('a',undefined,[e('right',effect)],'rival')).board[12].id,'p',effect);
 assert.equal(play(s,10,fish('hook',undefined,[e('right','hook')],'rival')).board[12].id,'p');
});
test('Borrowed Armor and delayed Spreading Arms add one side without an immediate attack or input mutation',()=>{
 const actor=fish('crab','borrowed-armor',[e('up','hook')]),s=state();let r=play(s,12,actor,{direction:'left'});
 assert.deepEqual(r.board[12].edges,[e('up','hook'),e('left','weak')]);assert.equal(actor.edges.length,1);
 r=play(s,12,fish('star','spreading-arms'));assert.equal(readyGrowth(r,'player').length,0);
 r.memory=beginAbilityTurn(r,'rival');assert.equal(readyGrowth(r,'player').length,0);
 r.memory=beginAbilityTurn(r,'player');assert.equal(readyGrowth(r,'player').length,1);
 r.board[13]=fish('enemy',undefined,[],'rival');const grown=growArm(r,'star','right');assert.equal(grown.board[13].id,'enemy');assert.deepEqual(grown.board[12].edges,[e('right')]);
 assert.equal(readyGrowth(grown,'player').length,0);
});
test('Focused Strike and Pack Hunt retain Bulwark, occupancy and ally setup counterplay',()=>{
 const shield=fish('guard',undefined,[e('left','weak')],'rival');let s=state({12:shield});
 assert.equal(play(s,11,fish('m','focused-strike',[e('right','double')]),{direction:'right'}).board[13].id,'guard');
 s.board[12]={...shield,ability:'bulwark'};assert.equal(play(s,11,fish('m','focused-strike',[e('right','double')]),{direction:'right'}).board[12].id,'guard');
 s=state({12:shield});const orca=fish('o','pack-hunt',[e('right','bigger-fish')]);assert.equal(play(s,11,orca).board[12].id,'guard');
 s.board[7]=fish('flanker');assert.ok(play(s,11,orca).killedIds.includes('guard'));
 s.board[13]=fish('block');assert.equal(play(s,11,orca).board[12].id,'guard');
});
test('Gentle Giant keeps defensive markers while suppressing the chosen attack',()=>{
 const whale=fish('w','gentle-giant',[e('right','wave')]),s=state({12:fish('ally')});
 const r=play(s,11,whale,{direction:'right'});assert.equal(r.board[12].id,'ally');assert.deepEqual(r.board[11].edges,whale.edges);
 assert.notEqual(play(s,11,whale).board[12]?.id,'ally');
});
test('Shoal and revised Network affect ordinary scoring, cap duplicates and do not stack Sovereign',()=>{
 let s=state({11:fish('shoal','shoal')});assert.equal(scoreBoard(s.board).player,1);s.board[6]=fish('ally');assert.equal(scoreBoard(s.board).player,2);
 s.board[11].battleAbilities=['sovereign'];assert.equal(scoreBoard(s.board).player,2);
 s=state({11:fish('holder'),6:fish('coral','reef-network'),10:fish('second','reef-network')});assert.equal(scoreBoard(s.board).player,2);
 s.board[11]=null;assert.equal(scoreBoard(s.board).player,0);
 s.board[11]=fish('holder');s.board[6].battleAbilities=['sovereign'];s.board[10]=null;assert.equal(scoreBoard(s.board).player,1);
});
test('Mimicry, True North and Battle Plan change the complete resolution without mutating original cards',()=>{
 let s=state({7:fish('model',undefined,[e('up','hook')])});let actor=fish('m','mimicry',[e('up','dive'),e('down')]);
 const r=play(s,12,actor,{direction:'right',effect:'hook'});assert.ok(r.board.find(c=>c?.id==='m').edges.some(e=>e.direction==='right'&&e.effect==='hook'));assert.equal(actor.edges.length,2);
 assert.equal(play(s,12,actor,{direction:'right',effect:'bigger-fish'}).board.find(c=>c?.id==='m').edges.length,2);
 s=state({11:fish('target')});actor=fish('j','true-north',[e('up')]);assert.equal(play(s,12,actor,{rotation:3}).board[10].id,'target');assert.deepEqual(actor.edges,[e('up')]);
 s=state({7:fish('a',undefined,[],'rival'),17:fish('b',undefined,[],'rival')});actor=fish('plan','battle-plan',[e('up','swap'),e('down','follow-current')]);
 assert.notDeepEqual(play(s,12,actor).board,play(s,12,actor,{reverse:true}).board);
});
test('Afterimage is non-scoring, blocks direct placement, clears on movement and expires after the next remover placement',()=>{
 const phantom=fish('ghost','afterimage'),killer=fish('bite',undefined,[e('right','bigger-fish')],'rival');
 let s=state({12:phantom});s.memory.turns.rival=1;let r=play(s,11,killer);assert.equal(r.memory.decoys.length,1);assert.equal(canPlaceFish(r.board,12,fish('x'),r.terrain,r.memory),false);assert.equal(scoreBoard(r.board).player,0);
 r.memory=beginAbilityTurn(r,'player');r.board[17]=fish('ally');r=play(r,22,fish('push',undefined,[e('up')]));assert.equal(r.board[12].id,'ally');assert.equal(r.memory.decoys.length,0);
 r=play(s,11,killer);r.memory=beginAbilityTurn(r,'rival');r=play(r,0,fish('next',undefined,[],'rival'));assert.equal(r.memory.decoys.length,0);
});
test('Afterimage also responds to enemy Spines retaliation, with the correct expiry owner',()=>{
 const s=state({12:fish('urchin',undefined,[e('left','spines')],'rival')});
 const r=play(s,11,fish('ghost','afterimage',[e('right')]));
 assert.ok(r.killedIds.includes('ghost'));assert.deepEqual(r.memory.decoys,[{index:11,owner:'rival',expires:1}]);
});
test('every new ability offers bounded immutable choices on all three board sizes',()=>{
 for(const size of [5,6,7])for(const texture of Object.keys(ABILITY_ASSIGNMENTS)){
  const c={...STARTERS.find(c=>c.texture===texture),owner:'player',condition:'healthy'},s=state({},size);
  s.board[size+2]=fish('ally',undefined,[e('up','weak')]);s.board[2*size+1]=fish('enemy',undefined,[e('left')],'rival');
  const original=structuredClone(s);
  for(const option of placementOptions(s,size+1,c)){
   const r=play(s,size+1,c,option.choice);assert.equal(r.board.length,size*size);assert.ok(validAbilityMemory(r.memory,size));
   assert.equal(new Set(r.board.filter(Boolean).map(c=>c.id)).size,r.board.filter(Boolean).length);
  }
  assert.deepEqual(s,original);
 }
});
test('Grooming cleanses and rotates only the selected ally; Snare skips exactly one enemy offensive edge',()=>{
 let s=state({12:fish('ally',undefined,[e('up','weak')])});s.shocked.add('ally');let r=play(s,11,fish('clean','grooming'),{target:12,rotation:1});assert.ok(!r.shocked.has('ally'));assert.deepEqual(r.board[12].edges,[e('right','weak')]);assert.ok(s.shocked.has('ally'));
 r=play(state(),11,fish('lobster','snare-line'),{direction:'right'});assert.equal(r.memory.snares[0].index,12);
 r.board[7]=fish('above');r.board[13]=fish('right');r.memory=beginAbilityTurn(r,'rival');r=play(r,12,fish('enemy',undefined,[e('left','weak'),e('up'),e('right')],'rival'));
 assert.equal(r.board[7].id,'above');assert.equal(r.board[14].id,'right');assert.equal(r.memory.snares.length,0);
 r=play(state(),11,fish('lobster','snare-line'),{direction:'right'});assert.equal(beginAbilityTurn(r,'player').snares.length,0);
});
function handFixture(ability){const card=fish('actor',ability),slot={card,played:true};return {card,slot,state:{hands:{player:[slot,{card:fish('other'),played:false}],rival:[{card:fish('secret',undefined,[],'rival'),played:false}]},decks:{player:[fish('first'),fish('second'),fish('third')],rival:[fish('r1',undefined,[],'rival'),fish('r2',undefined,[],'rival')]},memory:freshAbilityMemory()}};}
test('Sonar publicly tracks drawn identities; Relay chooses only the top two and preserves reserve order',()=>{
 let f=handFixture('sonar');assert.ok(abilityHandSteps(f.state,f.card,f.slot).next().done);assert.ok(f.state.decks.rival.every(c=>c.known));
 f=handFixture('relay');const steps=abilityHandSteps(f.state,f.card,f.slot);assert.deepEqual(steps.next().value.options,['Minnow','Minnow']);assert.ok(steps.next(1).done);assert.equal(f.slot.card.id,'second');assert.deepEqual(f.state.decks.player.map(c=>c.id),['first','third']);
});
test('False Lure reveals before an optional exchange, caps exchanges and does not leak incoming identity',()=>{
 const f=handFixture('false-lure'),steps=abilityHandSteps(f.state,f.card,f.slot);assert.ok(steps.next().value.options[0].includes('Hidden'));assert.ok(steps.next(0).value.title.includes('Minnow'));assert.ok(steps.next(1).done);
 assert.equal(f.state.hands.rival[0].card.id,'r1');assert.equal(f.state.hands.rival[0].revealed,false);assert.equal(f.state.decks.rival.at(-1).id,'secret');assert.equal(f.state.decks.rival.at(-1).known,true);assert.deepEqual(f.state.memory.lureUsed,['player']);
 const again=abilityHandSteps(f.state,f.card,f.slot);again.next();assert.equal(again.next(0).done,true);
});
test('Muster excludes the new replacement, preserves identities and never resets plays',()=>{
 const f=handFixture('muster'),steps=abilityHandSteps(f.state,f.card,f.slot);assert.equal(steps.next().value.options.length,2);steps.next(1);
 assert.equal(f.slot.card.id,'first');assert.equal(f.state.hands.player[1].card.id,'second');assert.deepEqual(f.state.decks.player.map(c=>c.id),['third','other']);assert.equal(f.state.hands.player.length,2);
});
test('legal options and AI use scoring choices without hidden information',()=>{
 const s=state(),card=fish('fly','slipstream');assert.ok(placementOptions(s,6,card).some(o=>o.choice.direction==='down'));
 const actor={...card,owner:'rival'};const move=chooseRivalMove({...s,hand:[{card:actor,played:false}],difficulty:'tactical',rivalPlaysLeft:1,playerPlaysLeft:0,publicThreats:[]},()=>0);
 assert.ok(move);assert.equal(scoreBoard(play(s,move.index,actor,move.abilityChoice).board).rival,1);
});
test('version-six definitions stay frozen and all twenty new assignments reload under version seven',()=>{
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const run=createRun('ABILITIES');assert.equal(run.cardBalanceVersion,7);saveRun(run);assert.deepEqual(loadRun().school,run.school);
 for(const id of Object.keys(ABILITY_ASSIGNMENTS)){assert.equal(runFishDefinition(run,id).ability,ABILITY_ASSIGNMENTS[id].ability);const old={...run,cardBalanceVersion:6};assert.deepEqual(runFishDefinition(old,id),BATCH_SIX_STARTERS.find(c=>c.texture===id));}
 const m=freshAbilityMemory();assert.ok(validAbilityMemory(m,5));assert.ok(!validAbilityMemory({...m,snares:[{index:25,owner:'player'}]},5));assert.ok(!validAbilityMemory({...m,lureUsed:['player','player']},5));
});
