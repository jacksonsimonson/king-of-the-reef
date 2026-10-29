import type { CardEdge } from './starterFish.ts';
import type { CardAbility } from '../abilities.ts';
const edges = (...pairs: string[]): CardEdge[] => pairs.map(pair => { const [direction,effect]=pair.split(':'); return {direction,effect} as CardEdge; });
export const ABILITY_ASSIGNMENTS: Record<string,{ability:CardAbility;edges:CardEdge[]}> = {
 'flying-fish':{ability:'slipstream',edges:edges('up:dive','right:standard')},
 remora:{ability:'towline',edges:edges('up:weak','right:standard')},
 pufferfish:{ability:'inflate',edges:edges('up:weak','right:standard')},
 'decorator-crab':{ability:'borrowed-armor',edges:edges('up:hook')},
 'sea-star':{ability:'spreading-arms',edges:edges('right:standard','down:hook')},
 'mantis-shrimp':{ability:'focused-strike',edges:edges('right:double')},
 orca:{ability:'pack-hunt',edges:edges('up:standard','right:bigger-fish')},
 'whale-shark':{ability:'gentle-giant',edges:edges('up:weak','right:wave')},
 clownfish:{ability:'shoal',edges:edges('up:standard')},
 'staghorn-coral':{ability:'reef-network',edges:edges('up:spines','down:standard')},
 'bottlenose-dolphin':{ability:'sonar',edges:edges('up:standard','right:standard')},
 'humpback-whale':{ability:'relay',edges:edges('up:wave','right:standard')},
 anglerfish:{ability:'false-lure',edges:edges('right:hook','down:standard')},
 'pelagic-octopus':{ability:'mimicry',edges:edges('up:dive','down:standard')},
 'compass-jelly':{ability:'true-north',edges:edges('up:swap','right:standard')},
 'phantom-shark':{ability:'afterimage',edges:edges('up:bounce','right:bigger-fish')},
 'cleaner-wrasse':{ability:'grooming',edges:edges('right:standard')},
 'rust-lobster':{ability:'snare-line',edges:edges('up:spines','right:hook')},
 seahorse:{ability:'muster',edges:edges('up:hook','down:standard')},
 'map-serpent':{ability:'battle-plan',edges:edges('up:swap','down:follow-current')},
};
