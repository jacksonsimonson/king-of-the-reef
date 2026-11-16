import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,saveRun,loadRun} from '../../src/game/run/state.ts';
import {STARTERS} from '../../src/game/data/starterFish.ts';
import {regionalRules} from '../../src/game/battleRules.ts';
import {terrainForRules} from '../../src/game/terrain.ts';
import {freshAbilityMemory} from '../../src/game/battleAbilityState.ts';
import {freshColossal} from '../../src/game/colossalState.ts';
import {COLOSSALS} from '../../src/game/run/colossals.ts';
import {validBattleSave} from '../../src/game/run/battleSave.ts';
const cases={};let stored='';globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>stored=v};
for(let region=0;region<3;region++){
 const run=createRun('COLOSSAL-PREVIEW',2,undefined,false,true);run.region=region;
 const boss=run.maps[region].nodes.at(-1);run.current=run.maps[region].nodes.find(n=>n.next.includes(boss.id)).id;run.pending=boss.id;
 cases[COLOSSALS[region].name]={run:structuredClone(run),hash:'voyage'};
 const size=5+region;let rules;
 for(let seed=0;seed<500;seed++){
  rules={...regionalRules(region,'colossal-fixture-'+seed),colossal:COLOSSALS[region].id};const t=terrainForRules(rules);
  if([0,1,size+1,size*size-1].every(i=>!t.rocks.has(i)&&!t.features?.has(i)&&!t.whirlpools.includes(i)))break;
 }
 const card=(id,owner)=>({...STARTERS[0],id,owner,condition:'healthy',edges:[],ability:undefined});
 const prey=card('prey','player'),reply=card('reply','player'),rivals=[card('rival-a','rival'),card('rival-b','rival')];
 const board=Array(size*size).fill(null);board[size+1]=prey;board[size*size-1]=rivals[0];board[size*size-2]=rivals[1];
 const memory={...freshAbilityMemory(),colossal:freshColossal(COLOSSALS[region].id,4+region)};memory.colossal.plays={player:1,rival:2};
 if(region===1)memory.colossal.prey={id:prey.id,index:size+1};
 if(region===2)memory.colossal.lane=1;
 const opening={playerHand:[{card:prey,played:false},{card:reply,played:false}],rivalHand:rivals.map(card=>({card,played:false})),playerDeck:[],rivalDeck:[],charms:[]};
 run.school=[prey,reply,...run.school];
 run.battle={version:1,nodeId:run.pending,board,playerHand:[{card:prey,played:true},{card:reply,played:false}],rivalHand:rivals.map(card=>({card,played:true})),playerDeck:[],rivalDeck:[],shocked:[],killedIds:[],plays:{player:1,rival:2},turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null,rules,memory,
  twoTide:{opening,scores:[],seed:'colossal-fixture',intermission:false,charms:[],spentCharms:[],killedIds:[]}};
 assert.ok(validBattleSave(run.battle,run.pending));saveRun(run);assert.ok(loadRun());
 cases[COLOSSALS[region].name+' battle']={run:structuredClone(run),hash:'voyage-battle'};
 if(region===0){
  const pulse=structuredClone(run),extra=card('rival-c','rival');pulse.battle.memory.colossal.plays.rival=1;pulse.battle.plays.rival=1;
  pulse.battle.rivalHand.push({card:extra,played:false});pulse.battle.twoTide.opening.rivalHand.push({card:extra,played:false});
  assert.ok(validBattleSave(pulse.battle,pulse.pending));cases['Reefback armor pulse']={run:pulse,hash:'voyage-battle'};
 }
 if(region===2){run.battle.playerHand[1].card={...reply,edges:[{direction:'up',effect:'weak'}]};cases['Laser shield response']={run:structuredClone(run),hash:'voyage-battle'};}
}
const reward=createRun('REWARD',2,undefined,true,true);reward.region=1;reward.current=reward.maps[1].nodes[0].id;reward.pending=reward.current;reward.camp.nodeId=reward.current;reward.colossalReward=0;
cases['Companion reward']={run:reward,hash:'voyage'};
fs.mkdirSync('.cache',{recursive:true});fs.writeFileSync('.cache/colossal-fixtures.json',JSON.stringify(cases));
fs.writeFileSync('.cache/colossal-fixtures.html',`<!doctype html><title>Colossal test fixtures</title><h1>Colossal test fixtures</h1><p>Synthetic saves. Use only an isolated test origin.</p><main></main><script type="module">const cases=await(await fetch('./colossal-fixtures.json')).json();for(const [name,c]of Object.entries(cases)){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(!sessionStorage.getItem('colossal-backup'))sessionStorage.setItem('colossal-backup',localStorage.getItem('king-of-the-reef-voyage-v1')??'null');localStorage.setItem('king-of-the-reef-voyage-v1',JSON.stringify(c.run));location.href='../#'+c.hash;};document.querySelector('main').append(b);}const restore=document.createElement('button');restore.textContent='Restore prior test save';restore.onclick=()=>{const old=sessionStorage.getItem('colossal-backup');if(old===null)return;if(old==='null')localStorage.removeItem('king-of-the-reef-voyage-v1');else localStorage.setItem('king-of-the-reef-voyage-v1',old);location.href='../#voyage';};document.querySelector('main').append(restore);</script>`);
console.log('Generated '+Object.keys(cases).length+' Colossal fixtures.');
