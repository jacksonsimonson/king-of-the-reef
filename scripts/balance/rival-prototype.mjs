// Study-only copy of the ordinary-school sampler. Zero-offset parity is tested
// against production so experiments cannot silently change another parameter.
import {random} from '../../src/game/run/maps.ts';
import {rivalRating,schoolRating,styleWeight,hasPositioning} from '../../src/game/run/rivalSchools.ts';

export function prototypeSchool(pool,seed,style,region,offset){
 const rng=random(seed),mean=schoolRating(pool);
 const deviation=Math.sqrt(pool.reduce((n,c)=>n+(rivalRating(c)-mean)**2,0)/pool.length);
 const target=mean+offset*deviation;
 let best=[],distance=Infinity;
 for(let attempt=0;attempt<16;attempt++){
  const cards=[];let available=[...pool];
  while(cards.length<10){
   if(!available.length)available=[...pool];
   const weights=available.map(c=>styleWeight(c,style,region));
   let roll=rng()*weights.reduce((a,b)=>a+b,0),index=weights.length-1;
   for(let i=0;i<weights.length;i++){roll-=weights[i];if(roll<0){index=i;break;}}
   cards.push(available.splice(index,1)[0]);
  }
  const shortage=Math.max(0,Math.min(3,pool.filter(hasPositioning).length)-cards.filter(hasPositioning).length);
  const gap=Math.abs(schoolRating(cards)-target)+shortage*10;
  if(gap<distance){best=cards;distance=gap;}
 }
 return best.map((c,i)=>({...c,edges:c.edges.map(e=>({...e})),id:`rival-${i}`,owner:'rival',condition:'healthy'}));
}
