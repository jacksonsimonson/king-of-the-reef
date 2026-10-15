import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STARTERS} from '../src/game/data/starterFish.ts';
import {ABILITIES,canPlaceFish} from '../src/game/abilities.ts';
import {resolvePlacement} from '../src/game/combat.ts';
import {scoringReefs} from '../src/game/battleRules.ts';
import {inventory,EDGE_WEIGHTS,ABILITY_WEIGHTS} from '../scripts/balance/roster.mjs';
import {scenarios,probe,pilotCandidates,retention} from '../scripts/balance/pilot.mjs';
test('inventory covers each live creature once and relative ranges cover every current mechanic',()=>{
 const rows=inventory();assert.equal(rows.length,STARTERS.length);assert.equal(new Set(rows.map(c=>c.id)).size,STARTERS.length);
 const markdown=fs.readFileSync('docs/ROSTER_ROLE_INVENTORY.md','utf8');
 for(const row of rows){assert.equal(row.regions.length,1);assert.ok(row.role&&row.purpose);assert.equal(markdown.split('`'+row.id+'`').length-1,1);assert.ok(row.range[1]>=row.range[0]);}
 for(const effect of new Set(STARTERS.flatMap(c=>c.edges.map(e=>e.effect))))assert.ok(EDGE_WEIGHTS[effect]);
 assert.deepEqual(Object.keys(ABILITY_WEIGHTS).sort(),Object.keys(ABILITIES).sort());assert.deepEqual(EDGE_WEIGHTS.standard,[1,1]);
});
test('comparison fixtures are legal and deterministic; proposals never mutate live definitions',()=>{
 const snapshot=structuredClone(STARTERS),candidates=pilotCandidates();assert.equal(candidates.length,13);
 for(const size of [5,6,7])for(const mirror of [false,true]){
 const suite=scenarios(size,mirror);assert.equal(suite.length,12);assert.deepEqual(suite,scenarios(size,mirror));
 for(const state of suite){const ids=state.board.filter(Boolean).map(c=>c.id);assert.equal(new Set(ids).size,ids.length);assert.equal(state.board.length,size*size);
 const before=structuredClone(state);for(const card of candidates){const result=probe(card,state);assert.ok(result.legal>0);assert.ok(result.harmful>=0&&result.harmful<=result.legal);assert.ok(canPlaceFish(state.board,result.bestIndex,{...card,owner:'player',condition:'healthy'},state.terrain));}assert.deepEqual(state,before);}
 }
 assert.deepEqual(STARTERS,snapshot);
});
test('holder probe distinguishes defense from retaliation and does not claim invulnerability',()=>{
 const box=STARTERS.find(c=>c.texture==='boxfish'),urchin=STARTERS.find(c=>c.texture==='sea-urchin');assert.equal(retention(box,5).dislodges,0);assert.ok(retention(urchin,5).dislodges>0);
 const reef=[...scoringReefs(5)][1],board=Array(25).fill(null);board[reef]={...box,id:'holder',owner:'player',condition:'healthy'};
 const piercing={...STARTERS[0],id:'piercer',owner:'rival',condition:'healthy',ability:'piercing',edges:[{direction:'right',effect:'standard'}]};
 const result=resolvePlacement({board,shocked:new Set()},reef-1,piercing);assert.notEqual(result.board[reef]?.id,'holder');
});
test('friendly harm is counted separately from reward and score-only probes do not pretend to value Shock',()=>{
 const state=scenarios(5).find(s=>s.name==='friendly reef');const eel=STARTERS.find(c=>c.texture==='electric-eel');const result=probe(eel,state);assert.equal(result.bestDelta,0);assert.ok(result.harmful>0);
 const before=structuredClone(state);assert.deepEqual(probe(eel,state),result);assert.deepEqual(state,before);
});
