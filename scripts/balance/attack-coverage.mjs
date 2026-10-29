import fs from 'node:fs';
import {STARTERS,BATCH_SIX_STARTERS} from '../../src/game/data/starterFish.ts';
import {canPlaceFish} from '../../src/game/abilities.ts';
import {scoringReefs} from '../../src/game/battleRules.ts';
import {resolvePlacement} from '../../src/game/combat.ts';
import {placementOptions} from '../../src/game/abilityOptions.ts';
const size=6,rows=[],sides=['up','right','down','left'];
// Exhaust every legal placement/ability option, independent of the AI's move ranking.
for(const texture of ['flying-fish','orca','whale-shark','humpback-whale','anglerfish','pelagic-octopus'])for(const version of ['previous','current']){
 const actor={...(version==='current'?STARTERS:BATCH_SIX_STARTERS).find(c=>c.texture===texture),id:'attacker',owner:'rival',condition:'healthy'};
 const row={texture,version,scenarios:0,solved:0,byDefense:{}};
 for(const defense of ['open','standard','shield','anchor'])for(const reef of scoringReefs(size))for(const flanked of [false,true]){
  const board=Array(size*size).fill(null);
  board[reef]={...STARTERS[0],id:'holder',owner:'player',condition:'healthy',edges:['standard','shield'].includes(defense)?sides.map(direction=>({direction,effect:defense==='shield'?'weak':'standard'})):[],ability:defense==='anchor'?'anchor':undefined};
  if(flanked)board[reef+size<size*size?reef+size:reef-size]={...STARTERS.find(c=>c.texture==='anglerfish'),id:'flanker',owner:'rival',condition:'healthy'};
  const state={board,shocked:new Set(),terrain:{rocks:new Set(),features:new Map(),whirlpools:[-1,-1]}};
  let solved=false;
  for(let index=0;index<board.length;index++)if(canPlaceFish(board,index,actor,state.terrain))for(const option of placementOptions(state,index,actor)){
   const r=resolvePlacement(state,index,actor,size,false,option.choice);
   if(r.board[reef]?.id!=='holder')solved=true;
  }
  row.scenarios++;row.solved+=Number(solved);row.byDefense[defense]=(row.byDefense[defense]??0)+Number(solved);
 }
 rows.push(row);console.log(JSON.stringify(row));
}
fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync('.cache/balance/attack-coverage.json',JSON.stringify(rows,null,2));
