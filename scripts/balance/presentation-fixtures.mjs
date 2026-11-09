import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,resolveVisit,battleResult,enterNode,reachable,saveRun,loadRun} from '../../src/game/run/state.ts';
import {STARTERS} from '../../src/game/data/starterFish.ts';
import {regionalRules,scoringReefs} from '../../src/game/battleRules.ts';
import {terrainForRules} from '../../src/game/terrain.ts';
import {validBattleSave} from '../../src/game/run/battleSave.ts';
const cases={};let stored='';globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>stored=v};
for(let region=0;region<3;region++)for(const effect of ['push','block','remove','shock']){
 const run=createRun('PRESENTATION',2,undefined,true);
 for(let r=0;r<region;r++){resolveVisit(run,'leave');run.pending=run.maps[r].nodes.at(-1).id;battleResult(run,3,0);}
 resolveVisit(run,'leave');const next=run.maps[region].nodes.find(n=>n.id===reachable(run)[0]);next.type='battle';enterNode(run,next.id);
 const size=5+region,reef=[...scoringReefs(size)][0],target=reef+size,source=target+size;
 let rules;for(let seed=0;seed<100;seed++){rules=regionalRules(region,'PRESENTATION-'+seed);const terrain=terrainForRules(rules);if([source,target,reef].every(i=>!terrain.rocks.has(i)&&!terrain.features?.has(i)&&!terrain.whirlpools.includes(i)))break;}
 const chosen=terrainForRules(rules);assert.ok([source,target,reef].every(i=>!chosen.rocks.has(i)&&!chosen.features?.has(i)&&!chosen.whirlpools.includes(i)));
 const card=(id,owner,edges)=>({...STARTERS[0],id,name:id,owner,condition:'healthy',edges,ability:undefined});
 const actor=card('Actor','player',[{direction:'up',effect:effect==='shock'?'shock':effect==='remove'?'bigger-fish':'standard'}]);
 const victim=card('Target',effect==='push'?'player':'rival',effect==='block'?[{direction:'down',effect:'weak'}]:[]);
 const board=Array(size*size).fill(null);board[target]=victim;
 run.battle={version:1,nodeId:run.pending,board,playerHand:[{card:actor,played:false}],rivalHand:[],playerDeck:[],rivalDeck:[],shocked:[],killedIds:[],plays:{player:0,rival:0},turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null,rules};
 assert.ok(validBattleSave(run.battle,run.pending));saveRun(run);assert.ok(loadRun());cases[`${size} ${effect}`]={run,target:String.fromCharCode(65+source%size)+(Math.floor(source/size)+1)};
}
fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/presentation.json',JSON.stringify(cases));
fs.writeFileSync('.cache/presentation.html',`<!doctype html><title>Battle presentation fixtures</title><h1>Battle presentation fixtures</h1><p>Synthetic cases. Use only an isolated test origin.</p><main></main><script type="module">const cases=await(await fetch('./presentation.json')).json();for(const [name,c]of Object.entries(cases)){const b=document.createElement('button');b.textContent=name+' at '+c.target;b.onclick=()=>{if(!sessionStorage.getItem('presentation-backup'))sessionStorage.setItem('presentation-backup',localStorage.getItem('king-of-the-reef-voyage-v1')??'null');localStorage.setItem('king-of-the-reef-voyage-v1',JSON.stringify(c.run));location.href='../#voyage-battle';};document.querySelector('main').append(b);}const restore=document.createElement('button');restore.textContent='Restore prior test save';restore.onclick=()=>{const old=sessionStorage.getItem('presentation-backup');if(old===null)return;if(old==='null')localStorage.removeItem('king-of-the-reef-voyage-v1');else localStorage.setItem('king-of-the-reef-voyage-v1',old);location.href='../#voyage';};document.querySelector('main').append(restore);</script>`);
console.log('Generated 12 validated presentation fixtures');
