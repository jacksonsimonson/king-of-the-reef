import { STARTERS } from '../../src/game/data/starterFish.ts';
import { REGIONS } from '../../src/game/run/maps.ts';
// Revision-scoped hypotheses, relative to one Standard edge = 1. Never runtime balance costs.
export const EDGE_WEIGHTS = {
  standard:[1,1], weak:[.75,1.25], double:[1.25,1.75], 'bigger-fish':[1.5,2.5], swap:[1.5,2.5], hook:[1.25,2], wave:[1.5,3], shock:[1,2], spines:[.5,1.25], ram:[1.25,2.5], 'follow-current':[1.75,2.75], bounce:[1.5,2.5], dive:[1.25,2.25],
};
export const ABILITY_WEIGHTS = {
  revelation:[.25,.75], rally:[.25,1], anchor:[1,2.5], reefborn:[2,4], bulwark:[2,4], piercing:[1,3], escort:[.75,2], ambush:[1.5,3], wake:[1.5,3.5], sovereign:[2,4],
};
export const PILOT = ['minnow','blenny','boxfish','electric-eel','sea-urchin','ocean-sunfish','yellowfin-tuna','flying-fish','phantom-shark','invisible-ink-squid'];
export function classify(card) {
  const effects=card.edges.map(e=>e.effect), has=(...names)=>effects.some(e=>names.includes(e));
  let role, purpose;
  if(card.ability) {role='Support';purpose='Use '+card.ability+' while supporting reef approaches';}
  else if(effects.every(e=>e==='shock')) {role='Support';purpose='Disable enemy edges so ordinary allies can contest';}
  else if(has('bigger-fish')) {role='Predator';purpose='Remove an exposed threat through the Bite approach';}
  else if(has('follow-current','bounce','dive','swap')) {role='Flexible mover';purpose='Enter or escape scoring lanes through self-movement';}
  else if(has('wave','ram','shock')) {role='Displacer';purpose=has('shock')?'Disable opposing edge control; needs allied displacement':'Clear scoring approaches with directional area pressure';}
  else if(effects.every(e=>['weak','spines'].includes(e))) {role='Holder';purpose=has('weak')?'Resist contesting after an ally supplies reef access':'Threaten retaliation after an ally supplies reef access';}
  else if(card.texture==='sea-urchin' && has('standard')) {role='Reef setter';purpose='Push an ally into position while spiny sides threaten retaliation';}
  else if(has('hook') || effects.every(e=>e==='standard')) {role='Reef setter';purpose='Set up allied reef entry through the marked approach';}
  else {role='Displacer';purpose='Contest an occupied approach with directional pushes';}
  const distinct=new Set(effects).size;
  const flags=[];
  if(distinct>=3) flags.push('Mixed package: justify each edge against primary role');
  if(role==='Holder') flags.push('No independent entry; test setup demand');
  if(effects.every(e=>e==='spines')) flags.push('Retaliation is not retention; role at risk');
  if(effects.every(e=>e==='shock')) flags.push('No displacement; role at risk');
  if(effects.length===1) flags.push('Narrow coverage; compare broader peers');
  const family=has('shock')?'Can disable allied edges':has('bigger-fish','wave','ram')?'Can kill/displace allies':has('standard','double','hook','swap','follow-current','bounce')?'Can disrupt allied placement':'No direct allied damage; setup/occupancy cost remains';
  const terms=[...effects.map(e=>EDGE_WEIGHTS[e]),...(card.ability?[ABILITY_WEIGHTS[card.ability]]:[])];
  const range=[0,1].map(i=>Number(terms.reduce((n,v)=>n+v[i],0).toFixed(2)));
  return {id:card.texture,name:card.name,regions:REGIONS.filter(r=>r.pool.includes(card.texture)).map(r=>r.id),role,purpose,range,flags,friendlyRisk:family,edges:card.edges,ability:card.ability??null};
}
export function inventory(){return STARTERS.map(classify);}
