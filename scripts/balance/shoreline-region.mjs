import fs from 'node:fs';
import {STARTERS,BATCH_TWO_STARTERS} from '../../src/game/data/starterFish.ts';
import {REEF_POOL} from '../../src/game/data/reefPool.ts';
import {SHORELINE_ROLES} from '../../src/game/data/shorelineRoles.ts';
import {scenarios,probe,retention} from './pilot.mjs';
import {classify} from './roster.mjs';
import {match} from './matches.mjs';
import {LOADOUTS} from './charms.mjs';

export const shore = STARTERS.filter(f=>REEF_POOL.includes(f.texture));
const old = id=>BATCH_TWO_STARTERS.find(f=>f.texture===id);
const changed = f=>JSON.stringify(f.edges)!==JSON.stringify(old(f.texture).edges);
const helpers=[
 ['minnow','anchovy','goby','shrimp','needlefish','seahorse','electric-eel','hermit-crab'],
 ['blenny','flounder','pistol-shrimp','moray-eel','decorator-crab','sea-urchin','coral-grouper','blue-tang'],
];
export function studyDeck(ids,owner,catalog){return ids.map((id,i)=>({...catalog.find(f=>f.texture===id),id:`${owner}-${i}`,owner,condition:'healthy'}));}
export function probeRegion(){
 return shore.map(f=>{
  const profiles={};
  for(const [version,card] of [['before',old(f.texture)],['after',f]]){
   const rows=[5,6,7].flatMap(size=>[false,true].flatMap(mirror=>scenarios(size,mirror).map(s=>probe(card,s))));
   profiles[version]={fixtures:rows.length,gains:rows.filter(r=>r.bestDelta>0).length,shock:rows.filter(r=>r.maxEnemyShocked>0).length,
    harmfulPlacements:rows.reduce((n,r)=>n+r.harmful,0),dislodges:[5,6,7].reduce((n,size)=>n+retention(card,size).dislodges,0)};
  }
  return {id:f.texture,changed:changed(f),...profiles};
 });
}
export function regionMatches(count=4,offset=0){
 const rows=[];
 for(const target of shore) for(let seed=offset;seed<offset+count;seed++) for(let school=0;school<2;school++) for(const [charm,loadout] of [[],...LOADOUTS].entries()){
  const playerIds=[target.texture,...helpers[school].filter(id=>id!==target.texture)].slice(0,8);
  const rivalIds=[target.texture,...helpers[1-school].filter(id=>id!==target.texture)].slice(0,8);
  const versions={},difficulty=seed%2?'tactical':'beginner';
  for(const version of ['before','after']){
   // Only the candidate changes, keeping each comparison interpretable.
   const catalog=BATCH_TWO_STARTERS.map(f=>version==='after'&&f.texture===target.texture?target:f);
   const tides=['player','rival'].map(first=>match({region:0,seed:`SHORE-AREA-v1-${seed}-${school}`,first,playLimit:4,difficulty,
    customDecks:{player:studyDeck(playerIds,'player',catalog),rival:studyDeck(rivalIds,'rival',BATCH_TWO_STARTERS)},
    loadout,charmMode:'player',target:target.texture}));
   const traces=tides.flatMap(t=>t.trace.filter(x=>x.owner==='player'&&x.card===target.texture));
   versions[version]={margin:tides.reduce((n,t)=>n+t.difference,0),played:traces.length,positive:traces.filter(x=>x.delta>0).length,
    available:tides.flatMap(t=>t.trace).filter(x=>x.owner==='player'&&x.available.includes(target.texture)).length,
    charms:tides.reduce((n,t)=>n+t.charmLog.length,0)};
  }
  rows.push({id:target.texture,seed,school,charm,difficulty,...versions});
 }
 return rows;
}
export function jointMatches(count=8,offset=0){
 // Nine full eight-card schools plus a final wrapped school cover every species.
 const groups=Array.from({length:Math.ceil(shore.length/8)},(_,i)=>Array.from({length:8},(_,j)=>shore[(i*8+j)%shore.length].texture));
 const rows=[];
 for(let seed=offset;seed<offset+count;seed++)for(let group=0;group<groups.length;group++)for(const version of ['before','after']){
  const catalog=version==='after'?STARTERS:BATCH_TWO_STARTERS;
  const tides=['player','rival'].map(first=>match({region:0,seed:`SHORE-JOINT-v1-${seed}-${group}`,first,playLimit:4,difficulty:seed%2?'tactical':'beginner',
   customDecks:{player:studyDeck(groups[group],'player',catalog),rival:studyDeck(groups[(group+3)%groups.length],'rival',catalog)},
   loadout:LOADOUTS[seed%LOADOUTS.length],charmMode:'player'}));
  rows.push({seed,group,version,margin:tides.reduce((n,t)=>n+t.difference,0),played:tides.flatMap(t=>t.trace.map(x=>x.card)),
   casualties:[...new Set(tides.flatMap(t=>t.killedIds))].length});
 }
 return rows;
}
export function summarize(rows){return shore.map(f=>{
 const rs=rows.filter(r=>r.id===f.texture),mean=(v,key)=>Number((rs.reduce((n,r)=>n+r[v][key],0)/rs.length).toFixed(3));
 return {id:f.texture,pairs:rs.length,better:rs.filter(r=>r.after.margin>r.before.margin).length,same:rs.filter(r=>r.after.margin===r.before.margin).length,worse:rs.filter(r=>r.after.margin<r.before.margin).length,
  before:mean('before','margin'),after:mean('after','margin'),played:rs.reduce((n,r)=>n+r.after.played,0),available:rs.reduce((n,r)=>n+r.after.available,0)};
});}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/shoreline-region.mjs')){
 const count=Number(process.argv[2]??4),offset=Number(process.argv[3]??0);
 const probes=probeRegion(),rows=regionMatches(count,offset),joint=jointMatches(count,offset),summary=summarize(rows);
 fs.mkdirSync('.cache/balance',{recursive:true});
 fs.writeFileSync(`.cache/balance/shoreline-region-${offset}.json`,JSON.stringify({count,offset,probes,rows,joint,summary},null,2));
 let doc=`# Shoreline regional evidence — seeds ${offset}–${offset+count-1}\n\nGenerated by \`node scripts/balance/shoreline-region.mjs ${count} ${offset}\`. Read [method and decisions](SHORELINE_BALANCE.md) before interpreting these numbers. Each comparison is two tides, four plays per side, identical opening resources with swapped starters. Better/same/worse refers to the experimental school's combined reef margin, not a card power rating.\n\n${rows.length} paired comparisons (${rows.length*4} tides), plus ${joint.length} whole-pool two-tide games (${joint.length*2} tides). Role probes cover 72 fixtures per version per creature.\n\n| Creature | Keep/change | Before → after positive role fixtures /72 | Better / same / worse | Mean margin before → after | Played after / available decisions |\n| --- | --- | --- | --- | --- | --- |\n`;
 for(const f of shore){const p=probes.find(r=>r.id===f.texture),r=summary.find(r=>r.id===f.texture);doc+=`| ${f.name} | ${changed(f)?'Change':'Keep'} | ${p.before.gains} → ${p.after.gains} | ${r.better} / ${r.same} / ${r.worse} | ${r.before} → ${r.after} | ${r.played} / ${r.available} |\n`;}
 const unique=new Set(joint.filter(r=>r.version==='after').flatMap(r=>r.played));
 doc+=`\nWhole-pool revised games actually played ${unique.size}/77 species. No-play IDs: ${shore.filter(f=>!unique.has(f.texture)).map(f=>f.texture).join(', ')||'none'}.\n`;
 fs.writeFileSync(`docs/SHORELINE_EVIDENCE_${offset}.md`,doc);
 console.log(JSON.stringify({count,offset,creatures:shore.length,changes:shore.filter(changed).length,pairedTides:rows.length*4,jointTides:joint.length*2,playedCoverage:unique.size,zeroPlayed:summary.filter(s=>!s.played),changed:summary.filter(s=>changed(shore.find(f=>f.texture===s.id)))},null,2));
}
