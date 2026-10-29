import fs from 'node:fs';
import assert from 'node:assert/strict';
import {STARTERS,BATCH_SIX_STARTERS} from '../../src/game/data/starterFish.ts';
import {match,SCHOOLS} from './matches.mjs';
const offset=Number(process.argv[2]??400),count=Number(process.argv[3]??8);
const schools=[
 ['remora','pufferfish','decorator-crab','sea-star','mantis-shrimp','clownfish','staghorn-coral','bottlenose-dolphin','cleaner-wrasse','seahorse'],
 ['flying-fish','orca','whale-shark','humpback-whale','anglerfish','pelagic-octopus','clownfish','pufferfish','seahorse','cleaner-wrasse'],
];
const counters=[
 ['minnow','anchovy','goby','blenny','sea-urchin','electric-eel','moray-eel','parrotfish','coral-grouper','boxfish'],
 ['yellowfin-tuna','wahoo','sailfish','thresher-shark','moray-eel','electric-eel','coral-grouper','boxfish','sea-urchin','paper-nautilus'],
];
const variants=[['current','previous','no-shoal','no-network','neither'],['current','previous','humpback-double','angler-bite','octopus-hook']];
const loadouts=[[],['anchor-stone','reef-beacon','nautilus-dial'],['spear-shell','breaker-tooth','barbed-wreath']];
function definition(id,variant){
 const c=structuredClone((variant==='previous'?BATCH_SIX_STARTERS:STARTERS).find(c=>c.texture===id));assert.ok(c,id);
 if((variant==='no-shoal'||variant==='neither')&&id==='clownfish')delete c.ability;
 if((variant==='no-network'||variant==='neither')&&id==='staghorn-coral')delete c.ability;
 const changes={'humpback-double':['humpback-whale','right','double'],'angler-bite':['anglerfish','down','bigger-fish'],'octopus-hook':['pelagic-octopus','down','hook']};
 const change=changes[variant];if(change&&id===change[0])c.edges=c.edges.map(e=>e.direction===change[1]?{...e,effect:change[2]}:e);
 return c;
}
const rows=[];
for(let region=0;region<2;region++)for(const opponent of ['previous-mirror','ordinary','counter']){
 const trials=[];
 for(let seed=offset;seed<offset+count;seed++)for(let charm=0;charm<loadouts.length;charm++)for(const seat of ['player','rival']){
  const result={seed,charm,seat,variants:{}};
  for(const variant of variants[region]){
   let margin=0,kills=0,losses=0,plays=0;const hosts=new Set();
   for(const first of ['player','rival']){
    const customDecks=Object.fromEntries(['player','rival'].map(owner=>{
     const focal=owner===seat,ids=focal?schools[region]:opponent==='previous-mirror'?schools[region]:opponent==='ordinary'?SCHOOLS[region][0]:counters[region];
     return [owner,ids.map((id,i)=>({...definition(id,focal?variant:opponent==='previous-mirror'?'previous':'current'),id:owner+'-'+i,owner,condition:'healthy'}))];
    }));
    const r=match({region,seed:`COVERAGE-${seed}`,customDecks,first,current:true,difficulty:'tactical',playerDifficulty:'tactical',loadout:loadouts[charm],playLimit:4+region});
    assert.equal(r.plays.player,4+region);assert.equal(r.plays.rival,4+region);
    margin+=(seat==='player'?1:-1)*r.difference;plays+=r.plays[seat];
    kills+=r.killedIds.filter(id=>!id.startsWith(seat+'-')).length;losses+=r.killedIds.filter(id=>id.startsWith(seat+'-')).length;
    r.trace.filter(t=>t.owner===seat).forEach(t=>hosts.add(t.card));
   }
   result.variants[variant]={margin,kills,losses,plays,hosts:[...hosts]};
  }
  trials.push(result);
 }
 for(const variant of variants[region]){
  const mean=key=>trials.reduce((sum,t)=>sum+t.variants[variant][key],0)/trials.length;
  const delta=trials.reduce((sum,t)=>sum+t.variants[variant].margin-t.variants.current.margin,0)/trials.length;
  const row={region,opponent,variant,pairedGames:trials.length,margin:mean('margin'),deltaFromCurrent:delta,kills:mean('kills'),losses:mean('losses')};rows.push(row);console.log(JSON.stringify(row));
 }
 fs.mkdirSync('.cache/balance',{recursive:true});fs.writeFileSync(`.cache/balance/coverage-${offset}-${region}-${opponent}.json`,JSON.stringify(trials));
}
fs.writeFileSync(`.cache/balance/coverage-${offset}.json`,JSON.stringify({offset,count,rows},null,2));
