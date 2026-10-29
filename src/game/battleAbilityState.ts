import {hasAbility} from './abilities.ts';
import type {Direction, EdgeEffect, FishCard, Owner} from './data/starterFish.ts';
import type {Terrain} from './terrain.ts';
export const SIDES: Direction[]=['up','right','down','left'];
export interface AbilityChoice {direction?:Direction;target?:number;rotation?:number;effect?:EdgeEffect;reverse?:boolean;skip?:boolean}
export interface AbilityMemory {
 turns:Record<Owner,number>; inflated:string[]; grown:string[];
 growth:{id:string;owner:Owner;ready:number}[];
 decoys:{index:number;owner:Owner;expires:number}[];
 snares:{index:number;owner:Owner}[]; lureUsed:Owner[];
}
export const freshAbilityMemory=():AbilityMemory=>({turns:{player:0,rival:0},inflated:[],grown:[],growth:[],decoys:[],snares:[],lureUsed:[]});
export interface AbilityBoard {board:(FishCard|null)[];shocked:ReadonlySet<string>;terrain?:Terrain;memory?:AbilityMemory}
export function adjacent(index:number,direction:Direction,size:number):number|null {
 const r=Math.floor(index/size)+(direction==='up'?-1:direction==='down'?1:0),c=index%size+(direction==='left'?-1:direction==='right'?1:0);
 return r<0||r>=size||c<0||c>=size?null:r*size+c;
}
export const blankSides=(card:FishCard)=>SIDES.filter(d=>!card.edges.some(e=>e.direction===d));
export const rotateCard=(card:FishCard,rotation:number):FishCard=>({...card,edges:card.edges.map(e=>({...e,direction:SIDES[(SIDES.indexOf(e.direction)+rotation+4)%4]}))});
export function safeEmpty(state:AbilityBoard,index:number|null):index is number {
 return index!==null && index>=0 && index<state.board.length && !state.board[index] && !state.terrain?.rocks.has(index) && state.terrain?.features?.get(index)!=='trench';
}
export function beginAbilityTurn(state:AbilityBoard,owner:Owner):AbilityMemory {
 const m=structuredClone(state.memory??freshAbilityMemory());m.turns[owner]++;
 m.snares=m.snares.filter(t=>t.owner!==owner);return m;
}
export function validAbilityMemory(value:unknown,size:number):value is AbilityMemory {
 if(!value||typeof value!=='object')return false;
 const m=value as AbilityMemory,owner=(o:unknown)=>o==='player'||o==='rival',num=(n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<=1000;
 const ids=(v:unknown)=>Array.isArray(v)&&v.length<=200&&v.every(id=>typeof id==='string')&&new Set(v).size===v.length;
 const tiles=(v:unknown)=>Array.isArray(v)&&v.length<=size*size&&v.every(t=>t&&num(t.index)&&t.index<size*size&&owner(t.owner))&&new Set(v.map(t=>t.index)).size===v.length;
 return Boolean(m.turns&&num(m.turns.player)&&num(m.turns.rival)&&ids(m.inflated)&&ids(m.grown)
  &&Array.isArray(m.growth)&&m.growth.length<=200&&m.growth.every(g=>g&&typeof g.id==='string'&&owner(g.owner)&&num(g.ready))
  &&tiles(m.decoys)&&m.decoys.every(t=>num(t.expires))&&tiles(m.snares)&&m.snares.length<=2&&new Set(m.snares.map(t=>t.owner)).size===m.snares.length
  &&Array.isArray(m.lureUsed)&&m.lureUsed.length<=2&&m.lureUsed.every(owner)&&new Set(m.lureUsed).size===m.lureUsed.length);
}
export function readyGrowth(state:AbilityBoard,owner:Owner):FishCard[] {
 const m=state.memory??freshAbilityMemory();return state.board.filter((c):c is FishCard=>Boolean(c&&c.owner===owner&&m.growth.some(g=>g.id===c.id&&g.ready<=m.turns[owner])&&!m.grown.includes(c.id)));
}
export function growArm(state:AbilityBoard,id:string,direction?:Direction):AbilityBoard {
 const m=structuredClone(state.memory??freshAbilityMemory()),board=[...state.board],index=board.findIndex(c=>c?.id===id),card=board[index];
 if(!card||!readyGrowth(state,card.owner).some(c=>c.id===id))return state;
 if(direction&&!blankSides(card).includes(direction))throw Error('Growth requires a blank side');
 if(direction)board[index]={...card,edges:[...card.edges,{direction,effect:'standard'}]};
 m.grown.push(id);m.growth=m.growth.filter(g=>g.id!==id);return {...state,board,memory:m};
}
export function prepareAbilityCard(state:AbilityBoard,index:number,card:FishCard,choice:AbilityChoice):FishCard {
 if(hasAbility(card,'borrowed-armor')&&choice.direction&&blankSides(card).includes(choice.direction))return {...card,edges:[...card.edges,{direction:choice.direction,effect:'weak'}]};
 if(hasAbility(card,'mimicry')&&choice.direction&&choice.effect&&blankSides(card).includes(choice.direction)&&['standard','hook','weak'].includes(choice.effect)){
  const near=SIDES.map(d=>adjacent(index,d,Math.sqrt(state.board.length))).some(i=>i!==null&&state.board[i]?.edges.some(e=>e.effect===choice.effect));
  if(near)return {...card,edges:[...card.edges,{direction:choice.direction,effect:choice.effect}].sort((a,b)=>SIDES.indexOf(a.direction)-SIDES.indexOf(b.direction))};
 }
 return card;
}
export function applyPostAbility(state:AbilityBoard,index:number,card:FishCard,choice:AbilityChoice):AbilityBoard {
 const board=[...state.board],shocked=new Set(state.shocked),memory=structuredClone(state.memory??freshAbilityMemory()),size=Math.sqrt(board.length);
 const current=board[index];if(!current||current.id!==card.id)return {...state,board,shocked,memory};
 const next=choice.direction?adjacent(index,choice.direction,size):null;
 if(hasAbility(card,'slipstream')&&safeEmpty({...state,board},next)){board[next]=current;board[index]=null;}
 if(hasAbility(card,'towline')&&choice.direction&&safeEmpty({...state,board},next)){
  const far=adjacent(next,choice.direction,size),ally=far===null?null:board[far];
  if(ally&&ally.owner===card.owner&&!hasAbility(ally,'anchor')&&state.terrain?.features?.get(far!)!=='kelp'){board[next]=ally;board[far!]=null;}
 }
 if(hasAbility(card,'grooming')&&choice.target!==undefined&&SIDES.some(d=>adjacent(index,d,size)===choice.target)){
  const ally=board[choice.target];if(ally&&ally.owner===card.owner){shocked.delete(ally.id);board[choice.target]=rotateCard(ally,choice.rotation===1?1:choice.rotation===3?3:0);}
 }
 if(hasAbility(card,'snare-line')&&safeEmpty({...state,board},next)&&!memory.decoys.some(t=>t.index===next)){
  memory.snares=memory.snares.filter(t=>t.owner!==card.owner&&t.index!==next);memory.snares.push({index:next,owner:card.owner});
 }
 memory.decoys=memory.decoys.filter(t=>!board[t.index]);
 return {...state,board,shocked,memory};
}
