import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun,enterNode} from '../src/game/run/state.ts';
import {settleBattleWithSummary} from '../src/game/run/battleSummary.ts';
function fixture(type='battle'){
 const run=createRun('SUMMARY');const node=run.maps[0].nodes.find(n=>n.type===type);
 run.current=run.maps[0].nodes.find(n=>n.next.includes(node.id)).id;assert.ok(enterNode(run,node.id));return run;
}
test('summary reports actual combined rewards, deduplicated casualties and charm consumption',()=>{
 const run=fixture();run.charms=['anchor-stone','anchor-stone','drift-shell'];const fish=run.school[0];
 const s=settleBattleWithSummary(run,[{player:2,rival:0},{player:0,rival:1}],[fish.id,fish.id,'rival-1'],['anchor-stone']);
 assert.deepEqual(s.total,{player:2,rival:1});assert.equal(s.shells,14);assert.equal(s.resolve,0);assert.equal(s.casualties.length,1);assert.equal(s.casualties[0].recovered,false);assert.deepEqual(s.spentCharms,['anchor-stone']);assert.equal(s.healthy,7);
 const after=JSON.stringify(run);assert.equal(settleBattleWithSummary(run,[{player:2,rival:1}],[],[]),undefined);assert.equal(JSON.stringify(run),after);
});
test('boss passage distinguishes newly killed then recovered fish from earlier injuries',()=>{
 const run=fixture('boss');run.resolve=2;run.school[0].condition='killed';
 const s=settleBattleWithSummary(run,[{player:1,rival:0},{player:1,rival:0}],[run.school[1].id],[]);
 assert.equal(s.shells,28);assert.equal(s.resolve,1);assert.equal(s.resolveNow,3);assert.deepEqual(s.recovered,[run.school[0].name]);assert.deepEqual(s.casualties,[{name:run.school[1].name,recovered:true}]);assert.equal(s.healthy,8);
});
test('loss, boss draw and legacy summaries describe the actual outcome',()=>{
 const loss=fixture();loss.resolve=1;const s=settleBattleWithSummary(loss,[{player:0,rival:2},{player:0,rival:1}],[],[]);assert.equal(s.resolve,-1);assert.equal(s.resolveNow,0);assert.equal(s.shells,0);assert.equal(loss.status,'lost');
 const boss=fixture('boss'),tie=settleBattleWithSummary(boss,[{player:1,rival:1},{player:0,rival:0}],[],[]);assert.match(tie.message,/Rematch/);assert.equal(tie.shells,0);assert.equal(boss.region,0);
 assert.equal(settleBattleWithSummary(fixture(),[{player:1,rival:0}],[],[]).charmLedgerComplete,false);
});
