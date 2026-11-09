import fs from 'node:fs';
import assert from 'node:assert/strict';
import {voyage} from './voyages.mjs';
import {saveRun,loadRun,activeNode} from '../../src/game/run/state.ts';
import {settleBattleWithSummary} from '../../src/game/run/battleSummary.ts';
import {summarizeVoyages} from './roster-voyage-report.mjs';
let stored='',reloads=0;globalThis.localStorage={getItem:()=>stored,setItem:(_,v)=>stored=v};
const cases={},results=[];
for(let seed=0;seed<32;seed++){
 const r=voyage({seed:`PLAYABILITY-v7-${seed}`,camp:true,schoolPolicy:'both',playerDifficulty:'expert',route:seed%2?'combat':'recovery',catchRate:seed%2?.6:.85,
 checkpoint(run){assert.ok(saveRun(run));const restored=loadRun();assert.deepEqual(restored,run);reloads++;
 if(run.status==='active'&&run.pending){const n=activeNode(run),key=`${run.region}-${n.type}`;cases[key]??=structuredClone(run);if(n.type==="hydration"&&run.resolve<3)cases[`${run.region}-hydration-low`]??=structuredClone(run);}
 return restored;},
 onBattle(run,attempt){if(activeNode(run).type==='boss'&&attempt===2)cases[`${run.region}-rematch`]??=run;},
 settle(run,scores,killed,spent){const summary=settleBattleWithSummary(run,scores,killed,spent);assert.equal(summary.healthy,run.school.filter(c=>c.condition==='healthy').length);assert.ok(summary.charmLedgerComplete);}});
 const visits=r.visits.filter(v=>v.after);
 assert.equal(8+visits.reduce((n,v)=>n+v.recruited.length-v.removed,0),r.school.length);
 assert.equal(24+visits.reduce((n,v)=>n+v.after.shells-v.shells,0),r.shells);
 assert.ok(r.battles.every(b=>b.playLimit===4+b.region&&b.playerPlays<=2*b.playLimit&&b.rivalPlays<=2*b.playLimit));
 assert.ok(visits.filter(v=>v.type==='camp').every(v=>v.recruited.length<=2&&v.after.shells===v.shells));
 results.push(r);console.log(JSON.stringify({seed,status:r.status,region:r.region,capped:r.capped,matches:r.battles.length}));
}
for(const region of [0,1,2])for(const type of ['camp','fishing','battle','shop','hydration','event','boss','rematch'])assert.ok(cases[`${region}-${type}`],`Missing ${region}-${type} coverage`);
assert.ok(results.some(r=>r.status==='won'),'No complete three-region route captured');
fs.mkdirSync('.cache/balance',{recursive:true});
fs.writeFileSync('.cache/balance/playability.json',JSON.stringify({reloads,results}));
fs.writeFileSync('.cache/playability-cases.json',JSON.stringify(cases));
fs.writeFileSync('.cache/playability.html',`<!doctype html><title>Voyage playability fixtures</title><h1>Isolated Voyage playability fixtures</h1><p>Actual carried saves captured from simulated routes. Load only on an isolated test origin.</p><main></main><script type="module">
const cases=await(await fetch('./playability-cases.json')).json(),key='king-of-the-reef-voyage-v1';
for(const [name,run] of Object.entries(cases)){const b=document.createElement('button');b.textContent='Load '+name;b.onclick=()=>{if(!sessionStorage.getItem('playability-backup'))sessionStorage.setItem('playability-backup',localStorage.getItem(key)??'null');localStorage.setItem(key,JSON.stringify(run));location.href='../#voyage';};document.querySelector('main').append(b);}
const b=document.createElement('button');b.textContent='Restore prior test save';b.onclick=()=>{const old=sessionStorage.getItem('playability-backup');if(old===null)return;if(old==='null')localStorage.removeItem(key);else localStorage.setItem(key,old);location.href='../#voyage';};document.querySelector('main').append(b);
</script>`);
console.log(JSON.stringify({reloads,cases:Object.keys(cases),...summarizeVoyages(results)}));

