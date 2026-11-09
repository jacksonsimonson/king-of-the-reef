import test from 'node:test';
import assert from 'node:assert/strict';
import {GUIDE_SECTIONS,guideEntries} from '../src/game/ui/guideContent.ts';
import {ABILITIES} from '../src/game/abilities.ts';
import {CHARMS} from '../src/game/data/tideCharms.ts';
import {EFFECT_HELP} from '../src/game/ui/cardVisuals.ts';
test('the guide includes every playable ability, charm, and edge rule without duplicate entries',()=>{
 for(const [id,catalog] of [['abilities',ABILITIES],['charms',CHARMS]]){
  const entries=GUIDE_SECTIONS.find(s=>s.id===id).entries;
  for(const item of Object.values(catalog))assert.ok(entries.some(e=>e.title===item.name&&e.text===item.description));
  assert.equal(new Set(entries.map(e=>e.title)).size,entries.length);
 }
 const edges=GUIDE_SECTIONS.find(s=>s.id==='edges').entries;
 for(const rule of Object.values(EFFECT_HELP))assert.ok(edges.some(e=>e.title===rule.split(':')[0]));
 assert.equal(new Set(GUIDE_SECTIONS.map(s=>s.id)).size,GUIDE_SECTIONS.length);
});
test('guide search supports case-insensitive multiword queries and an empty state',()=>{
 const abilities=GUIDE_SECTIONS.find(s=>s.id==='abilities');
 assert.deepEqual(guideEntries(abilities,'  '),abilities.entries);
 assert.equal(guideEntries(abilities,'  MIMICRY   adjacent ')[0].title,'Mimicry');
 assert.equal(guideEntries(abilities,'Mimicry impossible-rule').length,0);
 const battle=GUIDE_SECTIONS.find(s=>s.id==='battle');assert.ok(guideEntries(battle,'charms reset').some(e=>e.title==='Two tides'));
});
