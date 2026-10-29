import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {STARTERS,BATCH_SIX_STARTERS} from '../../src/game/data/starterFish.ts';
import {ABILITY_ASSIGNMENTS} from '../../src/game/data/abilityAssignments.ts';
import {REGIONS} from '../../src/game/run/maps.ts';
import {match,shuffled} from './matches.mjs';
import {LOADOUTS} from './charms.mjs';
export const HOSTS=Object.keys(ABILITY_ASSIGNMENTS);
export const ABILITY_LOADOUTS=[[],...LOADOUTS,['guardian-ribbon','cuttle-ink','surge-bottle'],['undertow-lure','reef-beacon','current-conch']];
export function school(region,seed,density,seat){
 const eligible=new Set(REGIONS.slice(0,region+1).flatMap(r=>r.pool));
 const hosts=shuffled(HOSTS.filter(id=>eligible.has(id)),`${seed}:${seat}:hosts`);
 const ordinary=shuffled(STARTERS.filter(c=>eligible.has(c.texture)&&!HOSTS.includes(c.texture)).map(c=>c.texture),`${seed}:${seat}:ordinary`);
 return density==='all20'?[...HOSTS]:[...hosts.slice(0,density==='heavy'?8:4),...ordinary.slice(0,4)];
}
export function decks(ids,seat,version){return Object.fromEntries(['player','rival'].map(owner=>[owner,ids[owner].map((id,i)=>({...((owner===seat&&version==='previous'?BATCH_SIX_STARTERS:STARTERS).find(c=>c.texture===id)),id:owner+'-'+i,owner,condition:'healthy'}))]));}
export function runStudy(offset,count,difficulty='tactical'){
 const rows=[],coverage=Object.fromEntries(HOSTS.map(id=>[id,{schoolEntries:0,offered:0,played:0,optionalOffered:0,optionalChosen:0,immediateDifference:0,handChoices:0,newReveals:0,delayedEffects:0,snareExposure:0,snareDiversion:0,partners:new Set()}]));
 for(let region=0;region<3;region++)for(const density of difficulty==='expert'?['mixed']:['mixed','heavy',...(region===2?['all20']:[])]){
  const trials=[];
  for(let seed=offset;seed<offset+count;seed++)for(const charm of difficulty==='expert'?[0]:ABILITY_LOADOUTS.map((_,i)=>i))for(const seat of ['player','rival']){
   const ids=Object.fromEntries(['player','rival'].map(owner=>[owner,school(region,seed,density,owner)]));
   const trial={seed,charm,seat,versions:{}};
   for(const version of ['current','previous']){
    let margin=0,losses=0,kills=0;
    for(const first of ['player','rival']){
     const r=match({region,seed:`ALL-ABILITIES-${seed}`,customDecks:decks(ids,seat,version),first,current:true,difficulty,playerDifficulty:difficulty,loadout:ABILITY_LOADOUTS[charm],playLimit:4+region,auditAbilities:version==='current'});
     assert.equal(r.plays.player,4+region);assert.equal(r.plays.rival,4+region);
     margin+=(seat==='player'?1:-1)*r.difference;
     losses+=r.killedIds.filter(id=>id.startsWith(seat+'-')).length;kills+=r.killedIds.filter(id=>!id.startsWith(seat+'-')).length;
     if(version==='current'){
      for(const owner of ['player','rival'])for(const id of ids[owner].filter(id=>coverage[id])){coverage[id].schoolEntries++;ids[owner].filter(other=>other!==id&&coverage[other]).forEach(other=>coverage[id].partners.add(other));}
      for(const t of r.trace){
       for(const id of [...t.abilityAudit.growth,...t.abilityAudit.inflated])if(coverage[id])coverage[id].delayedEffects++;
       coverage['phantom-shark'].delayedEffects+=t.abilityAudit.decoys;
       coverage['rust-lobster'].delayedEffects+=t.abilityAudit.snaresConsumed;
       coverage['rust-lobster'].snareExposure+=t.abilityAudit.snareExposure;
       coverage['rust-lobster'].snareDiversion+=t.abilityAudit.snareDiversion;
       t.available.filter(id=>coverage[id]).forEach(id=>coverage[id].offered++);
       const c=coverage[t.card];if(!c)continue;c.played++;c.optionalOffered+=Number(t.abilityAudit.options>1);c.optionalChosen+=Number(Object.keys(t.abilityAudit.choice).length>0);c.immediateDifference+=Number(t.abilityAudit.immediateDifference);c.handChoices+=t.abilityAudit.handChoices;c.newReveals+=t.abilityAudit.newReveals;
      }
     }
    }
    trial.versions[version]={margin,kills,losses};
   }
   trials.push(trial);
  }
  const mean=(v,key)=>trials.reduce((n,t)=>n+t.versions[v][key],0)/trials.length;
  const row={region,density,pairedPerVersion:trials.length,currentMargin:mean('current','margin'),previousMargin:mean('previous','margin'),delta:mean('current','margin')-mean('previous','margin'),currentLosses:mean('current','losses'),previousLosses:mean('previous','losses'),trials};rows.push(row);console.log(JSON.stringify({...row,trials:undefined}));
 }
 const result={offset,count,difficulty,tides:rows.reduce((n,r)=>n+r.pairedPerVersion*4,0),rows,coverage:Object.fromEntries(Object.entries(coverage).map(([id,c])=>[id,{...c,partners:[...c.partners].sort()}]))};
 fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/all-abilities-${offset}-${difficulty}.json`,JSON.stringify(result,null,2));
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const offset=Number(process.argv[2]??1200),count=Number(process.argv[3]??8),difficulty=process.argv[4]??'tactical';
 assert.ok(Number.isInteger(offset)&&offset>=0&&Number.isInteger(count)&&count>0&&count<=100);
 assert.ok(['beginner','tactical','expert'].includes(difficulty));runStudy(offset,count,difficulty);
}
