import fs from 'node:fs';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_SIX_STARTERS} from '../../src/game/data/starterFish.ts';
import {match} from './matches.mjs';
import {LOADOUTS} from './charms.mjs';
// Several new abilities together, paired seats/initiative and unchanged deal seeds.
const schools=[
 ['remora','pufferfish','decorator-crab','sea-star','mantis-shrimp','clownfish','staghorn-coral','bottlenose-dolphin','cleaner-wrasse','seahorse'],
 ['flying-fish','orca','whale-shark','humpback-whale','anglerfish','pelagic-octopus','clownfish','pufferfish','seahorse','cleaner-wrasse'],
 ['compass-jelly','phantom-shark','rust-lobster','map-serpent','flying-fish','orca','whale-shark','anglerfish','pelagic-octopus','staghorn-coral'],
];
const rows=[];
for(let region=0;region<3;region++){
 let games=0,total=0,wins=0,draws=0,losses=0;const played=new Set();
 for(let seed=200;seed<212;seed++)for(const loadout of [[],...LOADOUTS])for(const newOwner of ['player','rival']){
  let margin=0;
  for(const first of ['player','rival']){
   const customDecks=Object.fromEntries(['player','rival'].map(owner=>[owner,schools[region].map((id,i)=>({...((owner===newOwner?STARTERS:BATCH_SIX_STARTERS).find(c=>c.texture===id)),id:owner+'-'+i,owner,condition:'healthy'}))]));
   const r=match({region,seed:`MIXED-ABILITIES-${seed}`,customDecks,first,current:true,difficulty:'tactical',playerDifficulty:'tactical',loadout,playLimit:4+region});
   assert.equal(r.plays.player,4+region);assert.equal(r.plays.rival,4+region);
   margin+=(newOwner==='player'?1:-1)*r.difference;
   r.trace.filter(t=>t.owner===newOwner).forEach(t=>played.add(t.card));
  }
  games++;total+=margin;if(margin>0)wins++;else if(margin<0)losses++;else draws++;
 }
 const row={region,pairedGames:games,tides:games*2,meanNewMargin:total/games,wins,draws,losses,played:[...played]};rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync('.cache/balance/ability-schools.json',JSON.stringify(rows,null,2));
