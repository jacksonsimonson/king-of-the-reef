/** Native text controls retain readable sizing and keyboard operation on narrow screens. */
export function abilityDialog(title:string,options:string[],allowCancel=false,details?:string[]):{element:HTMLDialogElement;result:Promise<number>} {
 const dialog=document.createElement('dialog');dialog.className='voyage-dialog ability-dialog';
 const heading=document.createElement('h3');heading.textContent=title;dialog.setAttribute('aria-label',title);dialog.append(heading);
 const help=document.createElement('p');help.textContent=allowCancel?'Preview the effect, choose an option, or cancel the placement.':'Choose how this ability resolves.';dialog.append(help);
 let done:(n:number)=>void;
 const result=new Promise<number>(resolve=>done=resolve);
 const finish=(n:number)=>{done(n);dialog.remove();};
 const select=document.createElement('select');select.setAttribute('aria-label','Ability option');
 options.forEach((label,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=label;select.append(option);});
 const description=(i:number)=>options[i]+(details?.[i]?' — '+details[i]:'');
 const preview=document.createElement('p');preview.setAttribute('aria-live','polite');preview.textContent=description(0);select.onchange=()=>{preview.textContent=description(Number(select.value));};
 const confirm=document.createElement('button');confirm.className='voyage-button';confirm.textContent='Confirm choice';confirm.onclick=()=>finish(Number(select.value));
 dialog.append(select,preview,confirm);
 if(allowCancel){const cancel=document.createElement('button');cancel.className='voyage-button';cancel.textContent='Cancel placement';cancel.onclick=()=>finish(-1);dialog.append(cancel);}
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(allowCancel)finish(-1);});
 dialog.addEventListener('close',()=>finish(-1),{once:true});
 document.body.append(dialog);dialog.showModal();select.focus();return {element:dialog,result};
}
