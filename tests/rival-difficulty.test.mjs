import test from 'node:test';
import assert from 'node:assert/strict';
import { regionalRules, scoringReefs, validRules } from '../src/game/battleRules.ts';
import { terrainForRules, placementDestination, blocksPlacement } from '../src/game/terrain.ts';
import { chooseRivalMove } from '../src/game/rivalAI.ts';
import { STARTERS } from '../src/game/data/starterFish.ts';
import { resolvePlacement } from '../src/game/combat.ts';
import { canPlaceFish, scoreBoard } from '../src/game/abilities.ts';
import { canPlayFish, canDrift } from '../src/game/data/tideCharms.ts';
import { random } from '../src/game/run/maps.ts';
import { validBattleSave } from '../src/game/run/battleSave.ts';
import { describeFrame } from '../src/game/combatFeedback.ts';
const fish = (id, owner='rival', edges=[], ability) => ({...STARTERS[0],id,owner,edges,ability,condition:'healthy'});
const water = {rocks:new Set(),whirlpools:[-1,-1]};

test('900 seeded layouts meet exact regional budgets, preserve reefs, and keep channels useful', () => {
  const counts = [new Set(),new Set(),new Set()], directions = new Set();
  for (let area=0;area<3;area++) for(let seed=0;seed<300;seed++) {
    const rules=regionalRules(area,String(seed)), terrain=terrainForRules(rules), size=rules.size;
    assert.deepEqual(terrainForRules(rules),terrain);
    const tiles=[...terrain.rocks,...terrain.features.keys(),...terrain.whirlpools.filter(i=>i>=0)];
    assert.equal(new Set(tiles).size,tiles.length); assert.ok(tiles.length>=2+area&&tiles.length<=4+area); counts[area].add(tiles.length);
    assert.ok(tiles.every(i=>i>=0&&i<size*size&&!scoringReefs(size).has(i)));
    for(const [i,type] of terrain.features) if(type.startsWith('channel-')) {
      directions.add(type); const exit=placementDestination(Array(size*size).fill(null),i,terrain);
      assert.notEqual(exit,i); assert.ok(!blocksPlacement(terrain,exit));
    }
    for(const reef of scoringReefs(size)) assert.ok(Array.from({length:size*size},(_,i)=>i).some(i=>Math.abs(i%size-reef%size)+Math.abs(Math.floor(i/size)-Math.floor(reef/size))===1&&!blocksPlacement(terrain,i)));
  }
  counts.forEach((set,i)=>assert.deepEqual([...set].sort(),[2+i,3+i,4+i])); assert.equal(directions.size,4);
});
test('5/6/7 boards consistently place, push, score, drift, log coordinates, and limit turns',()=>{
  for(const size of [5,6,7]) {
    const board=Array(size*size).fill(null), reef=[...scoringReefs(size)][1];
    const card=fish('scorer','player',[], 'sovereign'); board[reef]=card;
    assert.equal(scoreBoard(board).player,2);
    assert.equal(canPlaceFish(board,[...scoringReefs(size)][0],fish('plain'),water),false);
    assert.equal(canPlaceFish(board,[...scoringReefs(size)][0],fish('born','rival',[],'reefborn'),water),true);
    const from=size*(size-1)+1; board[from]=fish('target','player');
    const result=resolvePlacement({board,shocked:new Set(),terrain:water},from-1,fish('pusher','rival',[{direction:'right',effect:'standard'}]),size,true);
    assert.equal(result.board[from+1].id,'target'); assert.ok(describeFrame(board,new Set(),result.frames.at(-1)).join(' ').includes(`C${size}`));
    assert.equal(canDrift(board,from,from-size,water),true);
    assert.equal(canPlayFish([{card,played:false}],size-1,size),true); assert.equal(canPlayFish([{card,played:false}],size,size),false);
  }
});
test('every difficulty takes a winning final reef instead of pursuing casualties',()=>{
  for(const difficulty of ['beginner','tactical','expert']) {
    const board=Array(25).fill(null); board[11]=fish('enemy','player');
    const hand=[{card:fish('born','rival',[],'reefborn'),played:false}];
    const move=chooseRivalMove({board,shocked:new Set(),terrain:water,hand,difficulty,rivalPlaysLeft:1,playerPlaysLeft:0,publicThreats:[]},random('win'));
    const result=resolvePlacement({board,shocked:new Set(),terrain:water},move.index,hand[move.slotIndex].card);
    assert.equal(scoreBoard(result.board).rival,1);
  }
});
test('AI handles all regional sizes without mutating hands, boards, statuses or consuming extra turns',()=>{
  for(let area=0;area<3;area++) {
    const rules=regionalRules(area,'ai'),terrain=terrainForRules(rules),board=Array(rules.size**2).fill(null);
    const hand=[{card:fish('rival','rival',[{direction:'right',effect:'standard'}]),played:false}];
    const position={board,terrain,shocked:new Set(),hand,difficulty:rules.difficulty,rivalPlaysLeft:rules.plays,playerPlaysLeft:rules.plays,publicThreats:[fish('public','player',[{direction:'left',effect:'standard'}])]};
    const copy=structuredClone(position), start=performance.now();
    const move=chooseRivalMove(position,random('replay')); assert.ok(performance.now()-start<2000);
    assert.deepEqual(position,copy); assert.deepEqual(chooseRivalMove(position,random('replay')),move);
    assert.ok(canPlaceFish(board,move.index,hand[move.slotIndex].card,terrain));
    assert.equal(chooseRivalMove({...position,rivalPlaysLeft:0},random('none')),undefined);
    assert.equal(chooseRivalMove({...position,hand:[]},random('none')),undefined);
  }
});
test('Expert rejects an immediate reef grab that loses more control to a visible counterplay',()=>{
  const board=Array(25).fill(null);
  for(const i of [9,10,14,23]) board[i]=fish('r'+i);
  for(const i of [11,18]) board[i]=fish('p'+i,'player');
  const hand=[{card:fish('born','rival',[],'reefborn'),played:false},{card:fish('push','rival',[{direction:'right',effect:'double'},{direction:'up',effect:'standard'}]),played:false}];
  const threat=fish('revealed','player',[{direction:'left',effect:'double'},{direction:'down',effect:'standard'}]);
  const p={board,shocked:new Set(),terrain:water,hand,rivalPlaysLeft:1,playerPlaysLeft:1,publicThreats:[threat]};
  const worst=(move)=>{
    const after=resolvePlacement(p,move.index,hand[move.slotIndex].card).board;let score=Infinity;
    after.forEach((_,i)=>{if(canPlaceFish(after,i,threat,water)){const r=resolvePlacement({board:after,shocked:new Set(),terrain:water},i,threat);const s=scoreBoard(r.board);score=Math.min(score,s.rival-s.player);}});return score;
  };
  const tactical=chooseRivalMove({...p,difficulty:'tactical'},()=>0),expert=chooseRivalMove({...p,difficulty:'expert'},()=>0);
  assert.equal(tactical.index,2); assert.ok(worst(expert)>worst(tactical));
});
test('saved rules validate larger boards and old snapshots remain 5x5',()=>{
  for(let area=0;area<3;area++) {
    const rules=regionalRules(area,'save'); const s={version:1,nodeId:'battle',rules,board:Array(rules.size**2).fill(null),playerHand:[],rivalHand:[],playerDeck:[],rivalDeck:[],plays:{player:rules.plays,rival:rules.plays},shocked:[],killedIds:[],turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null};
    assert.ok(validBattleSave(JSON.parse(JSON.stringify(s)),'battle')); assert.ok(validRules(rules));
    const wrong=structuredClone(s); wrong.rules.size=4; assert.equal(validBattleSave(wrong,'battle'),false);
    delete s.rules; assert.equal(validBattleSave(s,'battle'),area===0);
  }
});
