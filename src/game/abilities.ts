import {adjacent,SIDES,type AbilityMemory} from './battleAbilityState.ts';
import type { FishCard } from "./data/starterFish.ts";
import { scoringReefs } from "./battleRules.ts";
import { blocksPlacement, type Terrain } from "./terrain.ts";

export const ABILITIES = {
  "slipstream": {"name":"Slipstream","description":"After edges, optionally step to adjacent empty safe water, including a reef.","color":5602953,"icon":["10001","00000","10101","00010","01110"]},
  "towline": {"name":"Towline","description":"After edges, optionally pull one ally across an empty one-tile gap.","color":6194060,"icon":["10001","00001","10101","00100","01110"]},
  "inflate": {"name":"Inflate","description":"Block the first successful enemy edge movement each tide. Predation and terrain bypass it; friendly movement is allowed.","color":6785167,"icon":["10001","00010","10101","00110","01110"]},
  "borrowed-armor": {"name":"Borrowed Armor","description":"Before edges, optionally add a Shield to one blank side for this tide.","color":7376274,"icon":["10001","00011","10101","01000","01110"]},
  "spreading-arms": {"name":"Spreading Arms","description":"At your next turn, if still on board, optionally grow one Standard edge on a blank side. No immediate attack.","color":7967381,"icon":["10001","00100","10101","01010","01110"]},
  "focused-strike": {"name":"Focused Strike","description":"Choose one Double edge to ignore edge defenses this placement. Bulwark and movement blockers still apply.","color":5602953,"icon":["10001","00101","10101","01100","01110"]},
  "pack-hunt": {"name":"Pack Hunt","description":"Bite ignores edge defenses against enemies beside another ally. Bulwark and normal Bite exits still apply.","color":6194060,"icon":["10001","00110","10101","01110","01110"]},
  "gentle-giant": {"name":"Gentle Giant","description":"Optionally skip one offensive edge this placement; its defensive marker remains.","color":6785167,"icon":["10001","00111","10101","00000","01110"]},
  "shoal": {"name":"Shoal","description":"Worth two on a reef beside an ally. Does not stack with Sovereign.","color":7376274,"icon":["10001","01000","10101","00010","01110"]},
  "reef-network": {"name":"Reef Network","description":"Off a reef, score one beside an allied reef holder. At most one Network bonus per owner. Sovereign suppresses this bonus.","color":7967381,"icon":["10001","01001","10101","00100","01110"]},
  "sonar": {"name":"Sonar","description":"Reveal the next two rival reserve cards. With no reserve, reveal one hidden hand card instead.","color":5602953,"icon":["10001","01010","10101","00110","01110"]},
  "relay": {"name":"Relay","description":"Choose which of your next two reserve cards is drawn as the replacement. No extra draws.","color":6194060,"icon":["10001","01011","10101","01000","01110"]},
  "false-lure": {"name":"False Lure","description":"Reveal a hidden rival hand card, then optionally exchange it for their top reserve. One exchange per side per tide.","color":6785167,"icon":["10001","01100","10101","01010","01110"]},
  "mimicry": {"name":"Mimicry","description":"Copy one adjacent Standard, Hook or Shield onto a blank side before edges. Lasts this tide.","color":7376274,"icon":["10001","01101","10101","01100","01110"]},
  "true-north": {"name":"True North","description":"Choose any edge orientation before placement. Stored resolution order stays unchanged.","color":7967381,"icon":["10001","01110","10101","01110","01110"]},
  "afterimage": {"name":"Afterimage","description":"Enemy removal leaves a non-scoring decoy. Movement clears it; otherwise it expires after the remover’s next placement.","color":5602953,"icon":["10001","01111","10101","00000","01110"]},
  "grooming": {"name":"Grooming","description":"After edges, cleanse one adjacent ally’s Shock and optionally rotate its edges a quarter-turn. No retriggers.","color":6194060,"icon":["10001","10000","10101","00010","01110"]},
  "snare-line": {"name":"Snare Line","description":"Mark adjacent empty safe water until your next turn. An enemy placed there skips its first offensive edge.","color":6785167,"icon":["10001","10001","10101","00100","01110"]},
  "muster": {"name":"Muster","description":"After drawing, optionally exchange another unplayed hand card for the top reserve. The outgoing card goes to the bottom.","color":7376274,"icon":["10001","10010","10101","00110","01110"]},
  "battle-plan": {"name":"Battle Plan","description":"Resolve offensive edges in normal or reversed stored order. Directions and defenses stay unchanged.","color":7967381,"icon":["10001","10011","10101","01000","01110"]},
  revelation: { name: "Revelation", description: "On play, reveal one opposing hand card until played.", color: 0x407b9a, icon: ["01110", "10001", "10101", "10001", "01110"] },
  rally: { name: "Rally", description: "After pushing an enemy, peek at your next reserve card. Keep it or send it to the bottom before drawing. Once per placement.", color: 0x77603b, icon: ["11111", "11110", "10000", "10000", "10000"] },
  anchor: { name: "Anchor", description: "Cannot be forced to move by pushes, hooks or swaps. Own movement and direct-play terrain still work. Can still be eaten.", color: 0x697c91, icon: ["00100", "01110", "00100", "10101", "01110"] },
  reefborn: { name: "Reefborn", description: "May be played directly onto an empty scoring reef. Terrain and occupancy still apply.", color: 0x967097, icon: ["10101", "11111", "01110", "00100", "11111"] },
  bulwark: { name: "Bulwark", description: "Blocks incoming edge effects on every side, even while shocked. Dive, terrain and Piercing bypass this defense.", color: 0x647e68, icon: ["11111", "10101", "10101", "01110", "00100"] },
  piercing: { name: "Piercing", description: "Offensive edges ignore edge defenses and Bulwark. Rocks, Anchor and kelp still stop movement.", color: 0x9b715e, icon: ["00100", "01110", "10101", "00100", "00100"] },
  escort: { name: "Escort", description: "Before edges resolve, add Shields to empty sides of orthogonally adjacent allies for this battle.", color: 0x698b8b, icon: ["01010", "11111", "01010", "00100", "01110"] },
  ambush: { name: "Ambush", description: "Before edges resolve, shock orthogonally adjacent enemies, ignoring edge defenses. Allies are untouched.", color: 0x8d769e, icon: ["00010", "00100", "11111", "00100", "01000"] },
  wake: { name: "Wake", description: "After edges resolve, push orthogonally adjacent enemies outward once, ignoring defenses. Rocks, occupied cells, kelp and Anchor block it.", color: 0x548b9d, icon: ["01010", "10101", "00000", "01010", "10101"] },
  sovereign: { name: "Sovereign", description: "Worth two points instead of one while occupying a scoring reef.", color: 0x998750, icon: ["10101", "11111", "11111", "01110", "01110"] },
} as const;
export type CardAbility = keyof typeof ABILITIES;
export const NEW_ABILITIES = ["anchor", "reefborn", "bulwark", "piercing", "escort", "ambush", "wake", "sovereign"] as const;
export const SCORING_REEFS = new Set([2, 11, 18]);
export function hasAbility(card: FishCard | null | undefined, ability: CardAbility): boolean {
  return Boolean(card && (card.ability === ability || card.battleAbilities?.includes(ability)));
}
export function grantAbility(card: FishCard, ability: CardAbility): FishCard {
  return hasAbility(card, ability) ? card : { ...card, battleAbilities: [...(card.battleAbilities ?? []), ability] };
}
export function canPlaceFish(board: readonly (FishCard | null)[], index: number, card: FishCard | undefined, terrain: Terrain, memory?: AbilityMemory): boolean {
  return Boolean(card && Number.isInteger(index) && index >= 0 && index < board.length && !board[index]
    && !memory?.decoys.some(t=>t.index===index) && !blocksPlacement(terrain, index) && (!scoringReefs(Math.sqrt(board.length)).has(index) || hasAbility(card, "reefborn")));
}
export function scoreBoard(board: readonly (FishCard | null)[]): { player: number; rival: number } {
  const scores = { player: 0, rival: 0 };
  for (const index of scoringReefs(Math.sqrt(board.length))) {
    const card = board[index];
    if (card) {
      const supported=SIDES.some(d=>{const n=adjacent(index,d,Math.sqrt(board.length));return n!==null&&board[n]?.owner===card.owner;});
      scores[card.owner] += hasAbility(card,'sovereign')||hasAbility(card,'shoal')&&supported?2:1;
    }
  }
  const network=new Set<string>(),reefs=scoringReefs(Math.sqrt(board.length));
  board.forEach((card,index)=>{if(card&&!reefs.has(index)&&hasAbility(card,'reef-network')&&!hasAbility(card,'sovereign')&&!network.has(card.owner)&&SIDES.some(d=>{const n=adjacent(index,d,Math.sqrt(board.length));return n!==null&&reefs.has(n)&&board[n]?.owner===card.owner;})){scores[card.owner]++;network.add(card.owner);}});
  return scores;
}
