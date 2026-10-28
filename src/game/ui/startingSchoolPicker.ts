import { STARTERS } from '../data/starterFish.ts';
import { enabledTextures } from '../data/roster.ts';
import { STARTING_SCHOOLS, schoolAvailable, startingTextures, type StartingSchoolId } from '../run/startingSchools.ts';
import { cardElement } from './cardElement';

export function startingSchoolPicker(): {element: HTMLElement; selection:()=>StartingSchoolId|undefined} {
  const root=document.createElement('section');root.className='starting-school-picker';
  const heading=document.createElement('h3');heading.textContent='Choose your starting school';root.append(heading);
  const intro=document.createElement('p');intro.textContent='Eight healthy reef creatures, 24 shells and three resolve. Each school has strengths and exposed sides; none changes your route or rewards.';root.append(intro);
  const enabled=enabledTextures(),available=STARTING_SCHOOLS.filter(s=>schoolAvailable(s.id,enabled));
  const label=document.createElement('label');label.textContent='Starting school';
  const select=document.createElement('select');select.setAttribute('aria-label','Starting school');label.append(select);root.append(label);
  for(const school of STARTING_SCHOOLS){const option=document.createElement('option');option.value=school.id;option.disabled=!schoolAvailable(school.id,enabled);option.textContent=`${school.name} — ${school.style}${option.disabled?' (enable its creatures in Gallery)':''}`;select.append(option);}
  if(available.length)select.value=available[0].id;
  else {const option=document.createElement('option');option.value='custom';option.textContent='Enabled reef roster';select.append(option);select.value='custom';}
  const details=document.createElement('div');root.append(details);
  const selection=()=>select.value==='custom'?undefined:select.value as StartingSchoolId;
  const render=()=>{
    details.replaceChildren();const school=STARTING_SCHOOLS.find(s=>s.id===selection());
    for(const text of school?[school.plan,`Watch for: ${school.weakness}`]:['Your Gallery settings disable creatures needed by all three schools. This fallback uses your enabled reef creatures; small pools repeat copies. Enable the listed creatures in Gallery to use a themed school.']){const p=document.createElement('p');p.textContent=text;details.append(p);}
    const cards=document.createElement('div');cards.className='starting-school-cards';
    const core=new Set(['minnow','anchovy','goby','blenny']);
    const preview=startingTextures(enabled,selection()).sort((a,b)=>Number(core.has(a))-Number(core.has(b)));
    for(const texture of preview){
      const fish=STARTERS.find(c=>c.texture===texture)!;const item=document.createElement('figure'),caption=document.createElement('figcaption');caption.textContent=fish.name;
      item.append(cardElement({...fish,owner:'player',condition:'healthy'}),caption);cards.append(item);
    }
    details.append(cards);
  };
  select.onchange=render;render();return {element:root,selection};
}
