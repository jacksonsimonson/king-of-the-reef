import assert from 'node:assert/strict';
import {match} from './matches.mjs';
import {LOADOUTS} from './charms.mjs';
import {combinedScore,tidePlayLimit} from '../../src/game/twoTide.ts';
// Fresh seeds; current roster; both mixed-school assignments; equal policy for both seats.
for(const region of [0,1,2])for(const playLimit of new Set([4,tidePlayLimit(['shoreline','ocean','bermuda'][region]),5+region])){
 const row={region,playsPerTide:playLimit,pairs:0,firstWins:0,singleDraws:0,secondWins:0,pairDraws:0,emptyReefs:0,totalPlays:0};
 for(let seed=0;seed<24;seed++)for(const school of [0,1])for(const charmMode of ['both','player']){
  const args={region,playLimit,school,seed:`TWO-TIDE-PROGRESSION-${seed}`,loadout:LOADOUTS[seed%LOADOUTS.length],charmMode,current:true};
  const a=match({...args,first:'player'}),b=match({...args,first:'rival'});
  const combined=combinedScore([a.score,b.score]);
  assert.deepEqual(combined,combinedScore([b.score,a.score]));
  row.pairs++;if(combined.player===combined.rival)row.pairDraws++;
  for(const leg of [a,b]){
   const delta=leg.difference*(leg.first==='player'?1:-1);
   row[delta>0?'firstWins':delta<0?'secondWins':'singleDraws']++;
   row.emptyReefs+=leg.reefOccupants.filter(x=>!x).length;
   row.totalPlays+=leg.trace.length;
  }
 }
 console.log(JSON.stringify(row));
}
