import type { Run } from './state.ts';
export interface RegionRecord { wins:number; losses:number; draws:number; pointsFor:number; pointsAgainst:number; bossAttempts:number; bossDefeated:boolean }
export interface RunRecap {
  version:1; regions:RegionRecord[]; recruited:number; caught:number; departed:number;
  purchases:number; charmsUsed:number; casualties:number; recoveries:number;
  companions:{region:number;name:string;ability:string}[];
}
export function freshRecap():RunRecap {
  return {version:1,regions:Array.from({length:3},()=>({wins:0,losses:0,draws:0,pointsFor:0,pointsAgainst:0,bossAttempts:0,bossDefeated:false})),recruited:0,caught:0,departed:0,purchases:0,charmsUsed:0,casualties:0,recoveries:0,companions:[]};
}
export function validRecap(value:unknown):value is RunRecap {
  if(!value||typeof value!=='object')return false;
  const r=value as RunRecap,n=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>=0;
  return r.version===1 && ['recruited','caught','departed','purchases','charmsUsed','casualties','recoveries'].every(k=>n(r[k as keyof RunRecap]))
    && Array.isArray(r.regions)&&r.regions.length===3&&r.regions.every(s=>s&&['wins','losses','draws','pointsFor','pointsAgainst','bossAttempts'].every(k=>n(s[k as keyof RegionRecord]))&&typeof s.bossDefeated==='boolean'&&s.bossAttempts<=s.wins+s.losses+s.draws&&(!s.bossDefeated||s.wins>0&&s.bossAttempts>0))
    && Array.isArray(r.companions)&&r.companions.length<=2&&new Set(r.companions.map(c=>c?.region)).size===r.companions.length
    &&r.companions.every(c=>c&&[0,1].includes(c.region)&&typeof c.name==='string'&&c.name.length<=100&&typeof c.ability==='string'&&c.ability.length<=60);
}
/** Present recorded history only. Older saves retain a useful final-school snapshot. */
export function recapSnapshot(run:Run) {
  const records=run.recap?.regions;
  return {won:run.status==='won',seed:run.seed,region:run.region,shells:run.shells,resolve:run.resolve,
    school:run.school.length,healthy:run.school.filter(c=>c.condition==='healthy').length,
    visited:new Set(run.visited).size,recorded:run.recap,
    matches:records?.reduce((n,r)=>n+r.wins+r.losses+r.draws,0),
    wins:records?.reduce((n,r)=>n+r.wins,0),losses:records?.reduce((n,r)=>n+r.losses,0),draws:records?.reduce((n,r)=>n+r.draws,0)};
}
