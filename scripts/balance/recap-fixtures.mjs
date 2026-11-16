import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,battleResult,claimColossalReward,saveRun,loadRun} from '../../src/game/run/state.ts';
import {regionalRules} from '../../src/game/battleRules.ts';
import {freshAbilityMemory} from '../../src/game/battleAbilityState.ts';
import {freshColossal} from '../../src/game/colossalState.ts';
import {validBattleSave} from '../../src/game/run/battleSave.ts';
let stored='';globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>stored=v};
const run=createRun('RECAP-DEMO',2,undefined,false,true),cases={};
const boss=()=>{const n=run.maps[run.region].nodes.at(-1);run.current=run.maps[run.region].nodes.find(p=>p.next.includes(n.id)).id;run.pending=n.id;};
boss();battleResult(run,1,1);battleResult(run,2,0);claimColossalReward(run,0);
boss();battleResult(run,0,1,[run.school[0].id]);battleResult(run,3,1);claimColossalReward(run,1);
boss();const final=structuredClone(run);battleResult(run,3,1);cases.Victory={run:structuredClone(run),hash:'voyage'};
const legacy=structuredClone(run);delete legacy.recap;cases['Older victory']={run:legacy,hash:'voyage'};
const loss=structuredClone(final);loss.resolve=1;battleResult(loss,0,2);cases.Defeat={run:loss,hash:'voyage'};
const rules={...regionalRules(2,'recap-finale'),colossal:'sunken-eye'},memory=freshAbilityMemory();memory.colossal=freshColossal('sunken-eye',6);memory.colossal.plays={player:5,rival:6};
const holder={...final.school[0],edges:[],ability:undefined},reply={...final.school[1],edges:[],ability:undefined};const board=Array(49).fill(null);board[3]=holder;
final.battle={version:1,nodeId:final.pending,rules,memory,board,playerHand:[{card:holder,played:true},{card:reply,played:false}],rivalHand:[],playerDeck:[],rivalDeck:[],shocked:[],killedIds:[],plays:{player:5,rival:6},turn:'player',rngCalls:0,pendingReveal:null,rallySlot:null,
 twoTide:{opening:{playerHand:[{card:holder,played:false},{card:reply,played:false}],rivalHand:[],playerDeck:[],rivalDeck:[],charms:[]},scores:[{player:2,rival:0}],seed:'recap-finale',intermission:false,charms:[],spentCharms:[],killedIds:[]}};
assert.ok(validBattleSave(final.battle,final.pending));cases['Final winning move']={run:final,hash:'voyage-battle'};
for(const {run} of Object.values(cases)){saveRun(run);assert.ok(loadRun());}
for(const start of [0,24]){const path=`.cache/colossal-voyage-cases-${start}.json`;if(fs.existsSync(path))for(const [name,run]of Object.entries(JSON.parse(fs.readFileSync(path))))cases[`Carried ${start} ${name}`]={run,hash:'voyage'};}
fs.writeFileSync('.cache/recap-fixtures.json',JSON.stringify(cases));
fs.writeFileSync('.cache/recap-fixtures.html',`<!doctype html><title>Voyage recap fixtures</title><h1>Voyage recap fixtures</h1><p>Synthetic ending cases plus labeled carried-study saves. Isolated test origin only.</p><main></main><script type="module">const cases=await(await fetch('./recap-fixtures.json')).json(),key='king-of-the-reef-voyage-v1';for(const [name,c]of Object.entries(cases)){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(!sessionStorage.getItem('recap-backup'))sessionStorage.setItem('recap-backup',localStorage.getItem(key)??'null');localStorage.setItem(key,JSON.stringify(c.run));location.href='../#'+c.hash;};document.querySelector('main').append(b);}const restore=document.createElement('button');restore.textContent='Restore prior test save';restore.onclick=()=>{const old=sessionStorage.getItem('recap-backup');if(old===null)return;if(old==='null')localStorage.removeItem(key);else localStorage.setItem(key,old);location.href='../#voyage';};document.querySelector('main').append(restore);</script>`);
console.log('Generated '+Object.keys(cases).length+' recap/route fixtures.');
