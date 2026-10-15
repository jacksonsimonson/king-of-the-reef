import {PRE_BALANCE_STARTERS as STARTERS} from '../../src/game/data/starterFish.ts';
import {canPlaceFish,scoreBoard} from '../../src/game/abilities.ts';
import {resolvePlacement} from '../../src/game/combat.ts';
import {scoringReefs,regionalRules} from '../../src/game/battleRules.ts';
import {terrainForRules} from '../../src/game/terrain.ts';
import {PILOT} from './roster.mjs';
const dirs=['up','right','down','left'];
const fish=(id,owner,effects=[])=>({id,texture:'minnow',name:id,species:'probe',owner,condition:'healthy',edges:effects.map(([direction,effect])=>({direction,effect}))});
export function scenarios(size,mirror=false){
  const reef=[...scoringReefs(size)][1], row=Math.floor(reef/size), a=row*size;
  const definitions=[
    ['empty',[]], ['ally approach',[[a,'player']]], ['enemy reef',[[reef,'rival']]],
    ['Standard holder',[[reef,'rival','standard']]], ['Shield holder',[[reef,'rival','weak']]],
    ['crowded lane',[[a,'player'],[reef,'rival'],[reef+1,'rival']]],
    ['friendly edge risk',[[0,'player'],[size-1,'player'],[size,'rival']]],
    ['split control',[[[...scoringReefs(size)][0],'player'],[[...scoringReefs(size)][1],'rival'],[[...scoringReefs(size)][2],'rival']]],
    ['blocked landing',[[reef,'rival'],[reef+1,'player'],[reef-1,'player']]],
    ['friendly reef',[[reef,'player'],[reef-size,'player']]],
    ['shocked holder',[[reef,'rival','weak']]], ['regional terrain',[[reef,'rival'],[a,'player']]],
  ];
  return definitions.map(([name,placements])=>{
    const board=Array(size*size).fill(null);
    const at=i=>mirror&&!scoringReefs(size).has(i)?Math.floor(i/size)*size+size-1-i%size:i;
    // Keep reef occupants fixed; mirror other setup pieces to sample different approach lanes.
    for(const [i,owner,effect] of placements) board[at(i)]=fish('fixture-'+i,owner,effect?dirs.map(d=>[d,effect]):[]);
    let terrain={rocks:new Set(),whirlpools:[-1,-1],features:new Map()};
    if(name==='regional terrain') {terrain=terrainForRules(regionalRules(size-5,'BALANCE-PILOT-v1'));for(const [i,c] of board.entries())if(c&&(terrain.rocks.has(i)||terrain.features.get(i)==='trench'))board[i]=null;}
    const shocked=new Set(name==='shocked holder'?board.filter(Boolean).map(c=>c.id):[]);
    return {name,size,mirror,board,shocked,terrain};
  });
}
const difference=board=>{const s=scoreBoard(board);return s.player-s.rival;};
export function probe(definition,state){
  const card={...definition,id:'candidate',owner:'player',condition:'healthy'};
  const before=difference(state.board), ownIds=state.board.filter(c=>c?.owner==='player').map(c=>c.id);
  const legal=[];
  state.board.forEach((_,index)=>{if(canPlaceFish(state.board,index,card,state.terrain)){
    const result=resolvePlacement(state,index,card);
    const ownLost=ownIds.filter(id=>!result.board.some(c=>c?.id===id)).length;
    const alliedShock=ownIds.filter(id=>result.shocked.has(id)&&!state.shocked.has(id)).length;
    const enemyShocked=state.board.filter(c=>c?.owner==='rival'&&result.shocked.has(c.id)&&!state.shocked.has(c.id)).length;
    const delta=difference(result.board)-before;
    legal.push({index,result,delta,ownLost,alliedShock,enemyShocked});
  }});
  if(!legal.length)return {legal:0,bestDelta:null,replyScore:null,harmful:0};
  legal.sort((a,b)=>b.delta-a.delta||a.ownLost-b.ownLost||a.alliedShock-b.alliedShock||a.index-b.index);
  const best=legal[0]; let worst=Infinity;
  const replies=[fish('reply','rival',dirs.map(d=>[d,'standard'])),fish('reply','rival',[['right','double']]),fish('reply','rival',[['down','hook']]),fish('reply','rival',[['left','bigger-fish']])];
  for(const reply of replies)best.result.board.forEach((_,i)=>{if(canPlaceFish(best.result.board,i,reply,state.terrain))worst=Math.min(worst,difference(resolvePlacement({...best.result,terrain:state.terrain},i,reply).board));});
  return {legal:legal.length,bestDelta:best.delta,replyScore:worst===Infinity?difference(best.result.board):worst,harmful:legal.filter(m=>m.ownLost||m.alliedShock||m.delta<0).length,bestIndex:best.index,ownLost:best.ownLost,alliedShock:best.alliedShock,maxEnemyShocked:Math.max(...legal.map(m=>m.enemyShocked)),bestGainNeedsHarm:best.delta>0&&!legal.some(m=>m.delta===best.delta&&!m.ownLost&&!m.alliedShock)};
}
export function retention(definition,size){
 const reef=[...scoringReefs(size)][1],board=Array(size*size).fill(null);
 board[reef]={...definition,id:'holder',owner:'player',condition:'healthy'};
 const state={board,shocked:new Set(),terrain:{rocks:new Set(),whirlpools:[-1,-1],features:new Map()}};
 let replies=0,dislodges=0;
 for(const effect of ['standard','double','hook','bigger-fish'])for(const direction of dirs){
  const card=fish('reply','rival',[[direction,effect]]);
  board.forEach((_,i)=>{if(canPlaceFish(board,i,card,state.terrain)){replies++;const result=resolvePlacement(state,i,card);if(result.board[reef]?.id!=='holder')dislodges++;}});
 }
 return {size,replies,dislodges};
}
export function pilotCandidates(){
 const live=PILOT.map(id=>({...STARTERS.find(c=>c.texture===id),probeId:id,source:id}));
 const variants=[
  ['sea-urchin','urchin-setter-proposal',card=>({...card,edges:card.edges.map(e=>e.direction==='down'?{...e,effect:'standard'}:e)} )],
  ['electric-eel','eel-support-proposal',card=>({...card,edges:card.edges.map(e=>e.direction==='left'?{...e,effect:'standard'}:e)} )],
  ['phantom-shark','phantom-predator-proposal',card=>({...card,edges:card.edges.filter(e=>['up','right'].includes(e.direction))})],
 ].map(([source,probeId,change])=>({...change(STARTERS.find(c=>c.texture===source)),probeId,source}));
 return [...live,...variants];
}
export function runPilot(){
 const states=[5,6,7].flatMap(size=>[false,true].flatMap(m=>scenarios(size,m)));
 return pilotCandidates().map(card=>{return {id:card.probeId,source:card.source,retention:[5,6,7].map(size=>retention(card,size)),rows:states.map(state=>({scenario:state.name,size:state.size,mirror:state.mirror,...probe(card,state)}))};});
}
