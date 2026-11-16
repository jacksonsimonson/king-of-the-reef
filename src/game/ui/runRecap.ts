import type {Run} from '../run/state.ts';
import {recapSnapshot} from '../run/recap.ts';
import {COLOSSALS} from '../run/colossals.ts';
import {REGIONS} from '../run/maps.ts';
import {ABILITIES,type CardAbility} from '../abilities.ts';

export function runRecapView(run:Run,onAgain:()=>void):HTMLElement {
  const s=recapSnapshot(run),root=document.createElement('section');root.className='run-finale';root.setAttribute('aria-label','Voyage recap');
  const el=(tag:string,text:string,className='')=>{const e=document.createElement(tag);e.textContent=text;e.className=className;return e;};
  const art=document.createElement('div');art.className='run-finale-art';
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=160;canvas.setAttribute('aria-hidden','true');art.append(canvas);root.append(art);
  const c=canvas.getContext('2d')!,rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  rect(0,0,640,160,'#092c3b');
  for(let i=0;i<22;i++)rect((i*68)%640,20+(i*28)%128,20,4,['#24564f','#274b68','#464568'][i%3]);
  const gold=s.won?'#edcf8d':'#779397';
  rect(256,84,128,32,gold);rect(256,48,24,56,gold);rect(308,32,24,72,gold);rect(360,48,24,56,gold);rect(264,120,112,8,gold);
  for(const [i,color] of ['#7fe5c0','#8ccdf3','#c6a5ff'].entries()){rect(276+i*32,88,16,16,color);rect(280+i*32,92,4,4,'#efffef');}
  const heading=el('h2',s.won?'The three seas are yours.':'Your voyage has ended.');heading.tabIndex=-1;root.append(heading);
  root.append(el('p',s.won?'King of the Reef':`Last waters: ${REGIONS[s.region].name}`,'voyage-kicker'));
  const stats=el('dl','','run-recap-stats');
  const metric=(name:string,value:string|number)=>{const pair=el('div','');pair.append(el('dt',name),el('dd',String(value)));stats.append(pair);};
  metric('School',`${s.healthy} ready / ${s.school}`);metric('Shells remaining',s.shells);metric('Resolve',`${s.resolve}/3`);metric('Route spaces visited',s.visited);
  if(s.recorded){metric('Matches',s.matches!);metric('Wins / draws / losses',`${s.wins} / ${s.draws} / ${s.losses}`);metric('Creatures recruited',s.recorded.recruited);metric('Fish caught',s.recorded.caught);metric('Departures',s.recorded.departed);metric('Shop purchases',s.recorded.purchases);metric('Charms used',s.recorded.charmsUsed);metric('Casualties / recoveries',`${s.recorded.casualties} / ${s.recorded.recoveries}`);}
  root.append(stats);
  if(s.recorded){
    root.append(el('h3','Across the three seas'));
    const scroll=el('div','','run-recap-table'),table=document.createElement('table');
    const row=(values:string[],header=false)=>{const tr=document.createElement('tr');for(const v of values){const cell=document.createElement(header?'th':'td');cell.textContent=v;if(header)cell.setAttribute('scope','col');tr.append(cell);}table.append(tr);};
    row(['Region','Wins / draws / losses','Reef points · you / rival','Colossal'],true);
    s.recorded.regions.forEach((r,i)=>row([REGIONS[i].name,`${r.wins} / ${r.draws} / ${r.losses}`,`${r.pointsFor} / ${r.pointsAgainst}`,`${run.colossalVersion===1?COLOSSALS[i].name:REGIONS[i].boss} · ${r.bossDefeated?'Defeated':i>s.region?'Unreached':'Not defeated'}${r.bossAttempts?` · ${r.bossAttempts} attempt${r.bossAttempts===1?'':'s'}`:''}`]));
    scroll.append(table);root.append(scroll);
    if(s.recorded.companions.length){root.append(el('h3','Colossal companions'));const list=el('ul','');s.recorded.companions.forEach(c=>list.append(el('li',`${c.name} · ${ABILITIES[c.ability as CardAbility]?.name??c.ability}`)));root.append(list);}
  }else root.append(el('p','Detailed encounter records are unavailable for this older voyage.'));
  root.append(el('p','Voyage seed: '+s.seed,'run-recap-seed'));
  const again=el('button','Sail again','voyage-button') as HTMLButtonElement;again.type='button';again.onclick=onAgain;
  const menu=el('a','Main menu','voyage-button') as HTMLAnchorElement;menu.href='#menu';const actions=el('div','','encounter-actions');actions.append(again,menu);root.append(actions);
  return root;
}
