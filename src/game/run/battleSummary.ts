import {battleResult, activeNode, BOSS_REMATCH_GUIDANCE, type Run} from './state.ts';
import {combinedScore, type TideScore} from '../twoTide.ts';
import type {CharmId} from '../data/tideCharms.ts';

export interface BattleSummary {
  scores: TideScore[]; total: TideScore; charmLedgerComplete: boolean;
  casualties: Array<{name: string; recovered: boolean}>;
  recovered: string[]; spentCharms: CharmId[];
  shells: number; resolve: number; resolveNow: number; healthy: number;
  message: string; rematchAdvice?: string;
}
/** Describe actual settlement, including boss passage recovery, rather than predicting rewards. */
export function settleBattleWithSummary(run: Run, scores: TideScore[], killedIds: string[], spentCharms: CharmId[]): BattleSummary | undefined {
  if (!run.pending || run.status !== 'active' || !['battle','boss'].includes(activeNode(run).type)) return;
  const before={shells:run.shells,resolve:run.resolve,charms:[...run.charms],school:run.school.map(c=>({...c}))};
  const total=combinedScore(scores);
  battleResult(run,total.player,total.rival,killedIds,spentCharms);
  const remaining=[...run.charms],consumed:CharmId[]=[];
  for(const id of before.charms){const index=remaining.indexOf(id);if(index<0)consumed.push(id);else remaining.splice(index,1);}
  return {scores:structuredClone(scores),total,charmLedgerComplete:scores.length===2,
    casualties:before.school.filter(c=>c.condition==='healthy'&&killedIds.includes(c.id)).map(c=>({name:c.name,recovered:run.school.find(f=>f.id===c.id)?.condition==='healthy'})),
    recovered:before.school.filter(c=>c.condition==='killed'&&run.school.find(f=>f.id===c.id)?.condition==='healthy').map(c=>c.name),
    spentCharms:consumed,shells:run.shells-before.shells,resolve:run.resolve-before.resolve,resolveNow:run.resolve,
    healthy:run.school.filter(c=>c.condition==='healthy').length,message:run.log,
    rematchAdvice:run.status==='active'&&run.pending&&activeNode(run).type==='boss'?BOSS_REMATCH_GUIDANCE:undefined};
}
