import fs from 'node:fs';
import {BATCH_THREE_STARTERS as STARTERS} from '../../src/game/data/starterFish.ts';
import {match} from './matches.mjs';

// Explicit baselines keep this experiment reproducible after adoption.
export const CRAB_TRIALS = {
 'horseshoe-crab': {
  before: [{direction:'up',effect:'weak'},{direction:'right',effect:'standard'},{direction:'left',effect:'weak'}],
  after: [{direction:'up',effect:'weak'},{direction:'down',effect:'standard'},{direction:'left',effect:'weak'}],
 },
 'pom-pom-crab': {
  before: [{direction:'right',effect:'spines'},{direction:'left',effect:'spines'}],
  after: [{direction:'right',effect:'spines'},{direction:'down',effect:'standard'},{direction:'left',effect:'spines'}],
 },
};
const schools = [
 ['minnow','goby','hermit-crab','crab','seahorse','boxfish','electric-eel'],
 ['anchovy','blenny','shrimp','needlefish','sea-urchin','pistol-shrimp','moray-eel'],
];
const loadouts = [[],['anchor-stone','reef-beacon','duelist-pearl'],['spear-shell','coral-mail','barbed-wreath']];
const deck=(ids,owner,target,variant)=>ids.map((id,i)=>{
 const fish=STARTERS.find(f=>f.texture===id);
 return {...fish,edges:CRAB_TRIALS[id]?.[id===target?variant:'before']??fish.edges,id:`${owner}-${i}`,owner,condition:'healthy'};
});
export function runCrabStudy(count=8,offset=0){
 const rows=[];
 for(const target of Object.keys(CRAB_TRIALS)) for(let seed=offset;seed<offset+count;seed++) for(let school=0;school<2;school++) for(let charm=0;charm<loadouts.length;charm++){
  const versions={};
  for(const variant of ['before','after']){
   const tides=['player','rival'].map(first=>match({region:0,seed:`SHORE-CRABS-v1-${seed}-${school}`,first,playLimit:4,difficulty:'tactical',current:true,
    customDecks:{player:deck([...schools[school],target],'player',target,variant),rival:deck([...schools[1-school],target],'rival',target,'before')},
    loadout:loadouts[charm],charmMode:'player',target}));
   versions[variant]={margin:tides.reduce((n,t)=>n+t.difference,0),played:tides.reduce((n,t)=>n+t.trace.filter(x=>x.owner==='player'&&x.card===target).length,0),
    casualties:tides.reduce((n,t)=>n+t.killedIds.filter(id=>id.startsWith('player-')).length,0)};
  }
  rows.push({target,seed,school,charm,...versions});
 }
 return {count,offset,tides:rows.length*4,results:Object.keys(CRAB_TRIALS).map(target=>{
  const group=rows.filter(r=>r.target===target),mean=key=>Object.fromEntries(['before','after'].map(v=>[v,Number((group.reduce((n,r)=>n+r[v][key],0)/group.length).toFixed(3))]));
  return {target,pairs:group.length,better:group.filter(r=>r.after.margin>r.before.margin).length,same:group.filter(r=>r.after.margin===r.before.margin).length,worse:group.filter(r=>r.after.margin<r.before.margin).length,margin:mean('margin'),played:mean('played'),casualties:mean('casualties')};}),rows};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/shoreline-crabs.mjs')){
 const report=runCrabStudy(Number(process.argv[2]??8),Number(process.argv[3]??0));
 fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/shoreline-crabs-${report.offset}.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify({...report,rows:undefined},null,2));
}
