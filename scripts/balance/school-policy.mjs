// Study-only composition hypothesis. These relative weights are not card power ratings.
import {canRelease,runFishDefinition} from '../../src/game/run/state.ts';

const setup=new Set(['standard','double','hook','wave']);
const control=new Set(['bigger-fish','swap','shock','ram','dive']);
export function toolsFor(card){
 const edges=card.edges;
 return {
  setup:edges.some(e=>setup.has(e.effect)),
  control:edges.some(e=>control.has(e.effect))||['ambush','wake','piercing'].includes(card.ability),
  hold:edges.some(e=>['weak','spines'].includes(e.effect))||['anchor','bulwark','escort'].includes(card.ability),
  entry:edges.some(e=>['ram','follow-current','bounce','dive'].includes(e.effect))||card.ability==='reefborn',
  ...Object.fromEntries(['up','right','down','left'].map(d=>[d,edges.some(e=>e.direction===d&&setup.has(e.effect))]))
 };
}
export function schoolFit(cards){
 if(!cards.length)return 0;
 const profiles=cards.map(toolsFor),targets={setup:.5,control:.25,hold:.25,entry:.15,up:.2,right:.2,down:.2,left:.2};
 // Saturating coverage: adding more edges of one type does not keep raising its score.
 return Object.entries(targets).reduce((score,[tool,target])=>score+Math.min(1,profiles.filter(p=>p[tool]).length/cards.length/target),0);
}
export function recruitGain(run,texture){
 const cards=run.school.filter(c=>c.condition==='healthy');
 return schoolFit([...cards,runFishDefinition(run,texture)])-schoolFit(cards);
}
export function chooseRecruit(run,textures){
 return [...textures].sort((a,b)=>recruitGain(run,b)-recruitGain(run,a)||a.localeCompare(b))[0];
}
export function trimCandidate(run){
 const healthy=run.school.filter(c=>c.condition==='healthy');
 // Keep at least eight healthy copies, or the regional six-play budget plus two reserves.
 if(healthy.length<=8)return null;
 const before=schoolFit(healthy);
 return healthy.filter(c=>canRelease(run,c.id)).map(card=>({card,gain:schoolFit(healthy.filter(c=>c.id!==card.id))-before}))
  .filter(x=>x.gain>1e-9).sort((a,b)=>b.gain-a.gain||a.card.id.localeCompare(b.card.id))[0]?.card??null;
}
