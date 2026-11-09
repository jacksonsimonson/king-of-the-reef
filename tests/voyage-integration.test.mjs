import test from 'node:test';
import assert from 'node:assert/strict';
import {voyage} from '../scripts/balance/voyages.mjs';
import {loadRun,saveRun} from '../src/game/run/state.ts';
import {settleBattleWithSummary} from '../src/game/run/battleSummary.ts';

test('resuming current encounters and summary settlement preserve the uninterrupted Voyage',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let saved='',reloads=0;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>saved,setItem:(_key,value)=>{saved=value;}}});
 try{
  const args={seed:'INTEGRATION-v7-0',schoolPolicy:'both',elitePolicy:'seek',maxBossAttempts:2};
  const direct=voyage(args);
  const resumed=voyage({...args,checkpoint:run=>{
   assert.ok(saveRun(run));const loaded=loadRun();assert.deepEqual(loaded,run);reloads++;return loaded;
  },settle:(run,scores,killed,spent)=>{assert.ok(settleBattleWithSummary(run,scores,killed,spent));}});
  assert.deepEqual(resumed,direct);assert.ok(reloads>10);
  assert.ok(resumed.battles.some(b=>b.elite));
  const avoided=voyage({...args,elitePolicy:'avoid'});assert.ok(avoided.battles.every(b=>!b.elite));
 }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
