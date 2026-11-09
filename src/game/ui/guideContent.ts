import { MOVEMENTS } from '../fishing/model.ts';
import { ABILITIES } from '../abilities.ts';
import { CHARMS } from '../data/tideCharms.ts';
import { TERRAIN_INFO } from '../terrain.ts';
import { EFFECT_HELP } from './cardVisuals.ts';

export interface GuideEntry { title: string; text: string }
export interface GuideSection { id: string; title: string; intro: string; entries: GuideEntry[] }
const entry = (title: string, text: string): GuideEntry => ({ title, text });
export const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'basics', title: 'Start here', intro: 'Build your school. Move your creatures onto reefs. Hold them until the tide ends.', entries: [
    entry('1 · Claim the reefs', 'The three pearl tiles are scoring reefs. A creature on a reef usually scores one point. Most creatures cannot be played directly onto a reef: use their edges to move creatures into position.'),
    entry('2 · Play a creature', 'Select a hand card, then an empty legal tile, or drag the card there. Its directional edges resolve in their stored order. Edges can affect allies as well as enemies, so consider every side.'),
    entry('3 · Win the match', 'Voyage matches have two tides. You start the first, the rival starts the second. Add both final reef scores: the higher total wins. Quick Match also offers a Classic single tide.'),
    entry('A good first battle', 'Try a Beginner Quick Match in the Shoreline. Move an ally onto a reef, then use your remaining plays to protect it or remove a rival. You do not need to learn every ability before starting.'),
  ] },
  { id: 'battle', title: 'Battles', intro: 'Position matters more than filling the board.', entries: [
    entry('Your turn', 'You may use held charms before placing your creature. Choose any legal hand card and tile, complete any ability choices, and let its effects resolve. The played hand slot refills from your reserve when possible.'),
    entry('Edges and full-card abilities', 'An edge belongs to a particular side. A full-card ability belongs to the whole creature, like Rally or Mimicry. Shields and other defenses protect specific directions; a blank side has no edge defense. Shock disables edges, not full-card abilities.'),
    entry('Order of effects', 'Direct-play terrain can change placement before edges resolve. Ability timing is written on the card. Whirlpools move the played creature after its effects, if it survives on the pool and the exit is free. Movement onto terrain does not retrigger direct-play effects.'),
    entry('Removal', 'Creatures forced off the board or into a trench are killed. Most movement cannot pass through occupied destinations. Bite kills only when its normal movement and defense checks permit it.'),
    entry('Scoring', 'Only the final board of each tide scores. Sovereign is worth two on a reef; Shoal is worth two with an adjacent ally. Reef Network can add an off-reef point. Their stacking limits are listed in Abilities.'),
    entry('Two tides', 'The board, starting hands, reserves, and charms reset for tide two. The rival starts that tide. Add both scores for one match outcome. Creatures killed in either tide need hydration afterward. A charm used in either tide consumes one held copy, even if used again after the refresh.'),
    entry('Regional progression', 'Shoreline: 5 × 5 board, 4 plays per side per tide, 2–4 special tiles. Open Ocean: 6 × 6, 5 plays, 3–5 special tiles. Bermuda: 7 × 7, 6 plays, 4–6 special tiles. The three scoring reefs are additional; each whirlpool endpoint counts separately.'),
    entry('Quick Match', 'Choose region, difficulty, board size, and format. Classic allows 5–7 plays per side; Two tides uses the region’s 4/5/6 budget. You receive three random charms. Beginner favors immediate gains, Tactical considers positioning, and Expert anticipates replies.'),
    entry('Saving a battle', 'Voyage saves at stable decisions, including the tide intermission. Leaving during an animation resumes the previous saved decision. Older saved battles can keep their original single-tide rules.'),
  ] },
  { id: 'edges', title: 'Edges', intro: 'Read the side facing a target. Effects can help or hurt either school.', entries: Object.values(EFFECT_HELP).map(text => { const colon = text.indexOf(':'); return entry(text.slice(0, colon), text.slice(colon + 1).trim() + '.'); }) },
  { id: 'abilities', title: 'Abilities', intro: 'Full-card powers. Their text tells you when they resolve and what they can affect.', entries: Object.values(ABILITIES).map(a => entry(a.name, a.description)).sort((a,b) => a.title.localeCompare(b.title)) },
  { id: 'terrain', title: 'Terrain', intro: 'Special tiles change the value of a position. Inspect a target before committing.', entries: [
    entry('Reef', 'A pearl tile scores for its occupant at tide end. Direct placement requires Reefborn.'),
    entry('Rock', 'Blocks both placement and movement.'),
    entry('Whirlpool · A / B', 'After the played creature resolves its effects, it travels once to the paired pool if it is still on the entry pool and the exit is empty. An occupied exit leaves it in place.'),
    entry('Tide channels · all four directions', TERRAIN_INFO['channel-right'].rule),
    ...Object.entries(TERRAIN_INFO).filter(([id]) => !id.startsWith('channel-')).map(([,t]) => entry(t.name, t.rule)),
    entry('Afterimage and Snare', 'These are temporary ability markers, not permanent terrain. A decoy blocks placement but clears when a creature moves through it. An enemy directly played on a Snare skips its first offensive edge. See Abilities for expiration rules.'),
  ] },
  { id: 'charms', title: 'Charms', intro: 'Carry three charms. Use them before your creature placement; unfinished choices can be canceled without spending the charm.', entries: [
    entry('Inventory and purchases', 'Some charms require a selected hand card or board target. At a full inventory, buying a charm requires choosing one held charm to discard. There is no refund for that discarded charm. Two-tide refresh and consumption rules are in Battles.'),
    ...Object.values(CHARMS).map(c => entry(c.name, c.description)).sort((a,b) => a.title.localeCompare(b.title)),
  ] },
  { id: 'voyage', title: 'Voyage', intro: 'Follow connected routes through three seas. Each stop is a choice with consequences.', entries: [
    entry('Routes and seeds', 'Inspect a connected stop before entering. Entering commits your route. Viewing the chart during an encounter keeps that visit open. A seed reproduces the chart; saved voyages keep their original creature and encounter rules.'),
    entry('Battles and elites', 'A normal win earns 14/16/18 shells by area; an elite win earns eight more. Ties earn six shells and losses cost one resolve. Elites are optional stronger local schools. Their cards are still randomly drawn from the area.'),
    entry('Fishing', 'Choose one local creature to attempt, or skip the stop. A catch joins your school. An escape uses up the stop. See Fishing for controls and timing.'),
    entry('Shops and events', 'Shops offer three purchases, each buyable once. Events offer choices with their costs and rewards shown before you decide. Some require selecting a creature to trade or heal.'),
    entry('Injuries and hydration', 'Killed creatures remain in your school but cannot fight. Hydration restores up to three selected creatures and one resolve, up to three resolve. You can recover resolve even when no fish need healing. Zero resolve ends the voyage.'),
    entry('Release', 'Release permanently removes a creature from your school. Keep at least five creatures and one healthy creature. Release can trim your draw pool, but removing too many ready creatures leaves fewer options in battle.'),
    entry('Colossals', 'Win to advance to the next sea. A tie requires a rematch without losing resolve. A loss costs one resolve. Rematches keep the same rival school and terrain; injuries and spent charms carry over with no recovery between attempts. Region passage restores up to three killed creatures and one resolve.'),
    entry('Collection and roster', 'The Collection Journal records recruited species. Inspect School shows your current copies, health, edges, and abilities. All healthy copies enter the battle shuffle; inspection does not edit the school. Select up to two creatures to compare; selecting a third replaces the oldest selection. Gallery roster settings affect Quick Match and new voyages, not active saves. Newly added creatures start enabled.'),
  ] },
  { id: 'fishing', title: 'Fishing', intro: 'Keep the fish inside your capture zone to fill the catch meter.', entries: [
    entry('Move the zone', 'Hold Left or Right to move the capture zone. Release to stop. Stay over the moving fish to gain progress; losing it drains progress. Fill the meter within 60 seconds to catch it.'),
    entry('Pause and resume', 'Escape or Pause pauses the attempt. Leaving or reloading preserves it. Resume continues the same attempt rather than granting a fresh try. Losing focus also pauses fishing.'),
    ...Object.values(MOVEMENTS).map(m => entry(m.name, m.description)),
    entry('Read the fish', 'The pattern name identifies its movement behavior. Later seas have stronger water movement. Watch the fish and adjust your zone instead of holding one direction.'),
  ] },
  { id: 'controls', title: 'Controls', intro: 'Mouse and keyboard controls are both available.', entries: [
    entry('Menus and guide tabs', 'Use Tab and Shift+Tab to move focus, Enter or Space to activate buttons, and arrow keys inside selection lists. Guide tabs also support Left/Right arrows, Home, and End. Search filters the current guide tab.'),
    entry('Battle', 'Click or drag a hand card to an empty legal tile. The collapsed Battle controls panel provides labeled card, charm, target, and follow-up choices without dragging. Selecting a card or target lets you inspect its actual effects before placing.'),
    entry('Ability choices', 'Choose an option, inspect its preview, and confirm. Cancel placement is available for optional pre-placement choices. Required choices such as Rally or Revelation must finish before the next turn.'),
    entry('Inspection', 'Hover cards and charms for their effects. Use Inspect board in Battle controls for terrain and publicly revealed rival cards. Hidden enemy cards stay hidden. The optional Combat log records recent results.'),
    entry('Sound and motion', 'Sound controls music, effects, and mute. Enable audio if your browser blocks playback. Motion switches between animated and reduced combat feedback; reduced motion does not change the rules.'),
  ] },
];
export function guideEntries(section: GuideSection, query: string): GuideEntry[] {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return section.entries.filter(e => words.every(word => `${e.title} ${e.text}`.toLocaleLowerCase().includes(word)));
}
