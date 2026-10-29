import test from 'node:test';
import assert from 'node:assert/strict';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {scoreBoard,canPlaceFish} from '../src/game/abilities.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {charmCard} from '../src/game/data/tideCharms.ts';
import {chooseRivalMove} from '../src/game/rivalAI.ts';
const card=(texture,owner='player')=>({...STARTERS.find(c=>c.texture===texture),id:owner+'-'+texture,owner,condition:'healthy'});
const terrain={rocks:new Set(),features:new Map(),whirlpools:[-1,-1]};
const position=board=>({board,shocked:new Set(),terrain});
test('Shoal and Network share a strong formation with two ordinary displacement counters on every board',()=>{
 for(const size of [5,6,7])for(const owner of ['player','rival']){
  const enemy=owner==='player'?'rival':'player',reef=[...scoringReefs(size)][1],coral=reef-size;
  const board=Array(size*size).fill(null);board[reef]=card('clownfish',owner);board[coral]=card('staghorn-coral',owner);
  assert.equal(scoreBoard(board)[owner],3);
  const attacker={...card('minnow',enemy),edges:[{direction:'right',effect:'standard'}]};
  const detach=resolvePlacement(position(board),coral-1,attacker,size);
  assert.equal(scoreBoard(detach.board)[owner],1,'Moving the coral removes both scoring bonuses');
  const holder=resolvePlacement(position(board),reef+1,{...attacker,edges:[{direction:'left',effect:'standard'}]},size);
  assert.equal(scoreBoard(holder.board)[owner],0,'Moving the holder breaks the whole formation');
  assert.equal(scoreBoard(board)[owner],3,'Counter previews must not mutate the board');
 }
});
test('Reef Beacon accelerates the holder but cannot deploy the entire formation or stack duplicate Network points',()=>{
 const board=Array(25).fill(null),clown=card('clownfish');assert.equal(canPlaceFish(board,11,clown,terrain),false);
 const beacon=charmCard(clown,'reef-beacon');assert.equal(canPlaceFish(board,11,beacon,terrain),true);
 board[11]=beacon;assert.equal(scoreBoard(board).player,1);
 board[6]=card('staghorn-coral');assert.equal(scoreBoard(board).player,3);
 board[10]={...card('staghorn-coral'),id:'second-coral'};assert.equal(scoreBoard(board).player,3);
 const anchored=charmCard(board[6],'anchor-stone');board[6]=anchored;
 const attack={...card('minnow','rival'),edges:[{direction:'left',effect:'standard'}]};
 const result=resolvePlacement(position(board),12,attack);
 assert.equal(result.board[11].id,beacon.id,'Occupied escape prevents this particular push');
 board[10]=null;
 assert.equal(scoreBoard(resolvePlacement(position(board),12,attack).board).player,0,'Anchoring coral does not protect the exposed reef holder');
});
test('Ocean bodies retain ordinary allied delivery while offensive coverage prototypes have distinct costs',()=>{
 const board=Array(36).fill(null);board[14]=card('anchovy');
 for(const texture of ['humpback-whale','anglerfish']){
  const actor=card(texture),index=texture==='humpback-whale'?13:8;
  const r=resolvePlacement(position(board),index,actor,6);
  assert.equal(r.board[texture==='humpback-whale'?15:20]?.id,'player-anchovy');
 }
 // Returning Bite is not a free restoration: it kills a friendly fish where Standard delivers it.
 const angler=card('anglerfish');angler.edges=angler.edges.map(e=>e.direction==='down'?{...e,effect:'bigger-fish'}:e);
 assert.ok(resolvePlacement(position(board),8,angler,6).killedIds.includes('player-anchovy'));
 const octopus=card('pelagic-octopus');const gap=Array(36).fill(null);gap[20]=card('minnow');
 assert.equal(resolvePlacement(position(gap),8,octopus,6).board[20]?.id,'player-minnow');
 const hook={...octopus,edges:octopus.edges.map(e=>e.direction==='down'?{...e,effect:'hook'}:e)};
 assert.equal(resolvePlacement(position(gap),8,hook,6).board[14]?.id,'player-minnow');
});
test('all rival difficulties can break the scoring formation with ordinary directional guides',()=>{
 for(const size of [5,6,7])for(const difficulty of ['beginner','tactical','expert']){
  const board=Array(size*size).fill(null),reef=[...scoringReefs(size)][1];
  board[reef]=card('clownfish');board[reef-size]=card('staghorn-coral');
  const hand=['minnow','anchovy','sardine','goby'].map(id=>({card:card(id,'rival'),played:false}));
  const state=position(board),move=chooseRivalMove({...state,hand,difficulty,rivalPlaysLeft:1,playerPlaysLeft:0,publicThreats:[]},()=>0);
  assert.ok(move);
  assert.equal(scoreBoard(resolvePlacement(state,move.index,hand[move.slotIndex].card,size,false,move.abilityChoice).board).player,0);
 }
});
