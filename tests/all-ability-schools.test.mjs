import test from 'node:test';
import assert from 'node:assert/strict';
import {HOSTS,ABILITY_LOADOUTS,school,decks} from '../scripts/balance/all-ability-schools.mjs';
import {CHARMS} from '../src/game/data/tideCharms.ts';
import {match} from '../scripts/balance/matches.mjs';
import {REGIONS} from '../src/game/run/maps.ts';
test('mixed-school fixtures are reproducible, varied and respect regional progression',()=>{
 const seen=new Set();
 for(let region=0;region<3;region++)for(let seed=1200;seed<1216;seed++)for(const density of ['mixed','heavy']){
  const ids=school(region,seed,density,'player'),allowed=new Set(REGIONS.slice(0,region+1).flatMap(r=>r.pool));
  assert.deepEqual(ids,school(region,seed,density,'player'));assert.equal(new Set(ids).size,ids.length);
  assert.ok(ids.every(id=>allowed.has(id)));assert.equal(ids.filter(id=>!HOSTS.includes(id)).length,4);
  ids.filter(id=>HOSTS.includes(id)).forEach(id=>seen.add(id));
 }
 assert.deepEqual([...seen].sort(),[...HOSTS].sort());
 assert.notDeepEqual(school(2,1200,'mixed','player'),school(2,1201,'mixed','player'));
 assert.deepEqual(new Set(school(2,1200,'all20','player')),new Set(HOSTS));
 assert.deepEqual(new Set(ABILITY_LOADOUTS.flat()),new Set(Object.keys(CHARMS)));
 assert.ok(ABILITY_LOADOUTS.every(items=>items.length===0||items.length===3));
});
test('ability telemetry does not change decisions, draws, scoring or casualties',()=>{
 const ids={player:school(2,1600,'heavy','player'),rival:school(2,1600,'heavy','rival')};
 const args={region:2,seed:'AUDIT-INVARIANCE',customDecks:decks(ids,'player','current'),current:true,difficulty:'tactical',playerDifficulty:'tactical',playLimit:6,loadout:['dredger-net','current-conch','spyglass-pearl']};
 const plain=match(args),audited=match({...args,auditAbilities:true});
 for(const t of audited.trace){assert.ok(t.abilityAudit);assert.ok(t.abilityAudit.options>=1);assert.ok(t.abilityAudit.newReveals>=0);delete t.abilityAudit;}
 assert.deepEqual(audited,plain);
});
