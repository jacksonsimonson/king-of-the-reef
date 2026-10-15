import type {BattleSummary} from '../run/battleSummary.ts';
import {CHARMS} from '../data/tideCharms.ts';

export function showBattleSummary(summary: BattleSummary, onContinue: () => void): HTMLDialogElement {
  const dialog=document.createElement('dialog');dialog.className='voyage-dialog match-summary';dialog.setAttribute('aria-label','Voyage match summary');
  const heading=document.createElement('h2');heading.textContent='Match summary';heading.tabIndex=-1;dialog.append(heading);
  const paragraph=(text:string)=>{const p=document.createElement('p');p.textContent=text;dialog.append(p);};
  const section=(title:string,items:string[])=>{const h=document.createElement('h3');h.textContent=title;dialog.append(h);const list=document.createElement('ul');for(const text of items){const li=document.createElement('li');li.textContent=text;list.append(li);}dialog.append(list);};
  const table=document.createElement('table');const row=(values:string[],header=false)=>{const tr=document.createElement('tr');for(const value of values){const cell=document.createElement(header?'th':'td');cell.textContent=value;tr.append(cell);}table.append(tr);};
  row(['Reef points','You','Rival'],true);summary.scores.forEach((s,i)=>row([`Tide ${i+1}`,String(s.player),String(s.rival)]));row(['Combined',String(summary.total.player),String(summary.total.rival)],true);dialog.append(table);
  const signed=(n:number)=>n>0?`+${n}`:String(n);
  paragraph(`Shells: ${signed(summary.shells)} · Resolve: ${signed(summary.resolve)} (${summary.resolveNow}/3 now)`);
  paragraph(summary.message);
  section('Casualties',summary.casualties.length?summary.casualties.map(c=>`${c.name} — ${c.recovered?'restored by regional passage':'needs hydration'}`):['No new casualties.']);
  if(summary.recovered.length)section('Earlier casualties restored',summary.recovered);
  const counts=new Map<string,number>();for(const id of summary.spentCharms)counts.set(CHARMS[id].name,(counts.get(CHARMS[id].name)??0)+1);
  section('Charms consumed',!summary.charmLedgerComplete?['Legacy single-tide battle: earlier charm spending is not tracked in this summary.']:counts.size?[...counts].map(([name,count])=>`${name} ×${count}`):['None.']);
  paragraph(`${summary.healthy} healthy creatures ready for the next encounter.`);
  const proceed=document.createElement('button');proceed.className='voyage-button';proceed.textContent='Return to map';proceed.onclick=()=>{dialog.close();onContinue();};
  const inspect=document.createElement('button');inspect.className='voyage-button';inspect.textContent='Inspect final board';inspect.onclick=()=>dialog.close();dialog.append(proceed,inspect);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();heading.focus();return dialog;
}
