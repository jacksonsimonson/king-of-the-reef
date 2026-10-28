import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {activeNode} from '../../src/game/run/state.ts';

// Capture actual carried schools before combat; do not synthesize stronger decks.
const cases={};
voyage({seed:'ROSTER-VOYAGE-v6-0',onBattle:(run,attempt)=>{
 const node=activeNode(run);
 if(run.region===1&&node.type==='battle'&&!cases.ocean)cases.ocean=run;
 if(run.region===1&&node.type==='boss'&&attempt===2&&!cases.boss)cases.boss=run;
}});
voyage({seed:'ROSTER-VOYAGE-v6-0',route:'combat',catchRate:.6,onBattle:run=>{
 if(run.region===2&&activeNode(run).type==='battle'&&!cases.bermuda)cases.bermuda=run;
}});
assert.deepEqual(Object.keys(cases),['ocean','boss','bermuda']);
assert.ok(Object.values(cases).every(r=>r.cardBalanceVersion===6));
fs.mkdirSync('.cache',{recursive:true});
fs.writeFileSync('.cache/playtest-cases.json',JSON.stringify(cases));
fs.writeFileSync('.cache/playtest.html',`<!doctype html><html><body>
<h1>Isolated Voyage playtest fixtures</h1>
<p>Use a separate local server port. Loading a case replaces only this origin's Voyage save; its prior value is backed up once for this tab.</p><main></main>
<script type="module">
import '../src/styles/main.css';
import {settleBattleWithSummary} from '../src/game/run/battleSummary.ts';
import {showBattleSummary} from '../src/game/ui/battleSummary.ts';
const cases=await(await fetch('./playtest-cases.json')).json(),key='king-of-the-reef-voyage-v1';
const button=(label,action)=>{const b=document.createElement('button');b.textContent=label;b.onclick=action;document.querySelector('main').append(b);};
for(const [name,run] of Object.entries(cases))button('Load '+name,()=>{
 if(!sessionStorage.getItem('playtest-backup'))sessionStorage.setItem('playtest-backup',localStorage.getItem(key)??'null');
 localStorage.setItem(key,JSON.stringify(run));location.href='../#voyage-battle';
});
button('Preview boss draw summary (synthetic result)',()=>showBattleSummary(settleBattleWithSummary(structuredClone(cases.boss),[{player:1,rival:0},{player:0,rival:1}],[],[]),()=>{}));
button('Preview regular draw summary (synthetic result)',()=>showBattleSummary(settleBattleWithSummary(structuredClone(cases.ocean),[{player:2,rival:1},{player:1,rival:2}],[],[]),()=>{}));
button('Restore prior test save',()=>{const backup=sessionStorage.getItem('playtest-backup');if(backup!==null){if(backup==='null')localStorage.removeItem(key);else localStorage.setItem(key,backup);sessionStorage.removeItem('playtest-backup');}location.href='../';});
</script></body></html>`);
console.log('Wrote .cache/playtest.html and three carried-school fixtures. Serve with Vite on an isolated port; never use these to overwrite a real Voyage.');
