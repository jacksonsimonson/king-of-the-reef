import { random } from './maps.ts';
import type { Run } from './state.ts';
export interface EventChoice { id: string; label: string; shells?: number; resolve?: number; recruit?: boolean; heal?: boolean; trade?: boolean; }
export interface VoyageEvent { title: string; text: string; choices: EventChoice[]; }
const themes = [
  [['Tangled Tidepool', 'A stranded skiff holds a trapped creature and a shell chest.'], ['Surf Salvage', 'The breakers reveal cargo between dangerous waves.'], ['Cleaner Cove', 'Cleaner shrimp offer a safe place to recover.'], ['Shell Collector', 'A collector offers a regional creature in exchange for one of yours.']],
  [['Icebound Rescue', 'A creature is tangled in the rigging beneath the ice.'], ['Trench Expedition', 'A sinking cargo hold promises treasure to a bold diver.'], ['Warm Current', 'A sheltered current offers recovery before the next crossing.'], ['Pelagic Caravan', 'A traveling school offers an exchange or paid passage work.']],
  [['Ghost Net', 'Lightning reveals a creature trapped beside a ghost ship’s treasure.'], ['Storm Cache', 'A wreck appears between lightning strikes. Choose how far to venture.'], ['Stillwater Eye', 'Inside the storm’s eye, a caretaker offers a moment of safety.'], ['Phantom Trader', 'A spectral merchant offers a creature exchange with clearly stated terms.']],
];
export function voyageEvent(run: Run, name: string): VoyageEvent {
  const kind = Math.floor(random(`${run.seed}:${run.pending}:event-v1`)() * 4);
  const [title, text] = themes[run.region][kind];
  const choices: EventChoice[][] = [
    [{id:'rescue', label:`Rescue ${name} · add to school`, recruit:true}, {id:'cargo',label:'Recover cargo · +12 shells',shells:12}],
    [{id:'safe',label:'Collect loose cargo · +8 shells',shells:8}, {id:'dive',label:'Deep dive · +24 shells, −1 resolve (requires 2+)',shells:24,resolve:-1}, {id:'hire',label:`Hire rescuers · −10 shells, recruit ${name}`,shells:-10,recruit:true}],
    [{id:'rest',label:'Rest · +1 resolve (maximum 3)',resolve:1}, {id:'heal',label:'Treatment · −8 shells, restore one selected killed fish',shells:-8,heal:true}, {id:'work',label:'Help the caretaker · +10 shells',shells:10}],
    [{id:'trade',label:`Trade one selected fish for ${name} · +6 shells`,shells:6,recruit:true,trade:true}, {id:'buy',label:`Buy ${name} · −14 shells`,shells:-14,recruit:true}, {id:'work',label:'Guide the merchant · +10 shells',shells:10}],
  ];
  return {title, text, choices:choices[kind]};
}
export function eventChoiceAvailable(run: Run, choice: EventChoice, selected: string[] = []): boolean {
  if (run.shells + (choice.shells ?? 0) < 0 || run.resolve + (choice.resolve ?? 0) < 1) return false;
  if (choice.resolve === 1 && run.resolve === 3) return false;
  if (choice.heal || choice.trade) return selected.length === 1 && run.school.some(f => f.id === selected[0] && (!choice.heal || f.condition === 'killed'));
  return selected.length === 0;
}
