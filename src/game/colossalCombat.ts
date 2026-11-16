import { hasAbility } from './abilities.ts';
import { adjacent, SIDES } from './battleAbilityState.ts';
import { scoringReefs } from './battleRules.ts';
import type { FishCard, Owner } from './data/starterFish.ts';
import type { ColossalState } from './colossalState.ts';
import type { Terrain } from './terrain.ts';

/** Called once after a placement finishes, by both live combat and AI forecasts. */
export function colossalAfterPlay(board: (FishCard|null)[], shocked: Set<string>, c: ColossalState,
  owner: Owner, terrain?: Terrain): {notes: string[]; beamTiles: number[]} {
  const size = Math.sqrt(board.length), reefs = scoringReefs(size), notes: string[] = [], beamTiles: number[] = [];
  const supported = (index: number) => SIDES.some(d => {const i=adjacent(index,d,size); return i!==null && board[i]?.owner===board[index]?.owner;});
  c.plays[owner]++;
  if (owner === 'player') {
    if (c.prey) {
      const {id,index}=c.prey;
      if (board[index]?.id===id && !supported(index)) {
        notes.push('Midnight Marauder took '+board[index]!.name+'.'); board[index]=null;
      } else notes.push('The sonar hunt missed.');
      delete c.prey;
    }
    if (c.lane!==undefined) {
      for (let row=0;row<size;row++) {
        const i=row*size+c.lane; beamTiles.push(i);
        if (terrain?.rocks.has(i)) {notes.push('The laser struck a rock.');break;}
        const target=board[i]; if (!target) continue;
        if (hasAbility(target,'bulwark') || !shocked.has(target.id) && target.edges.some(e=>e.direction==='up'&&e.effect==='weak')) notes.push(target.name+' blocked the laser.');
        else {shocked.add(target.id);notes.push('The laser shocked '+target.name+'.');}
        break;
      }
      if (!notes.length) notes.push('The laser passed through empty water.');
      delete c.lane;
    }
    return {notes,beamTiles};
  }
  // One hunt, or two armor/laser pulses. Never arm after the player's final move.
  if (!(c.id==='midnight'?[2]:[2,4]).includes(c.plays.rival) || c.plays.player>=c.limit) return {notes,beamTiles};
  if (c.id==='reefback') {
    const candidates=board.map((fish,index)=>({fish,index})).filter(({fish,index})=>fish?.owner==='rival'&&supported(index)&&fish.edges.length<4)
      .sort((a,b)=>Number(reefs.has(b.index))-Number(reefs.has(a.index))||a.index-b.index);
    const target=candidates[0];
    if (target?.fish) {
      const direction=SIDES.find(d=>!target.fish!.edges.some(e=>e.direction===d))!;
      board[target.index]={...target.fish,edges:[...target.fish.edges,{direction,effect:'weak'}]};
      notes.push('Reefback King armored '+target.fish.name+' on its '+direction+' side.');
    }
  } else if (c.id==='midnight') {
    const target=board.map((fish,index)=>({fish,index})).filter(({fish,index})=>fish?.owner==='player'&&!supported(index))
      .sort((a,b)=>Number(reefs.has(b.index))-Number(reefs.has(a.index))||a.index-b.index)[0];
    if (target?.fish) {c.prey={id:target.fish.id,index:target.index};notes.push('Sonar locked onto '+target.fish.name+'.');}
  } else {
    const lanes=Array.from({length:size},(_,lane)=>({lane,score:board.reduce((score,f,i)=>score+(i%size===lane&&f?.owner==='player'?(reefs.has(i)?3:1):0),0)}))
      .sort((a,b)=>b.score-a.score||a.lane-b.lane);
    c.lane=lanes[0].lane;notes.push('The Sunken Eye charged column '+String.fromCharCode(65+c.lane)+'.');
  }
  return {notes,beamTiles};
}
