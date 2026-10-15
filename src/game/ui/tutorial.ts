export const TUTORIAL_PAGES = [
  ['Welcome aboard', 'King of the Reef is about controlling three pearl reefs. You win a battle by having more reef points when both sides finish playing. This guide is optional: use Back and Next, or close it whenever you like.'],
  ['Place, then move', 'Select a fish in your hand, then choose an empty legal tile. Most fish cannot be placed directly on a reef: use directional edges to move fish onto it. Reefborn is the exception. Played slots refill from your reserve; your placement budget, not the hand size, ends the battle.'],
  ['Read your fish', 'Each card has directional edges and may have a full-card ability. Hover a card, or select it in Battle controls, to read its description. Standard pushes, Double pushes farther, Hook pulls, Swap exchanges positions, and Bite can kill. Shields defend their side; some abilities change these rules.'],
  ['Reefs and terrain', 'Three pearl tiles score one point per occupying fish; Sovereign scores two. Rocks block placement and movement. Channels move a played fish before its edges resolve. Whirlpools move it AFTER its effects, if it survives on the pool and the exit is free. Read the terrain description before committing.'],
  ['Charms and choices', 'Carry up to three Tide Charms. Use them before placing a fish; some need a selected hand card. Reveals, reserve choices, and Drift ask for a target. Cancel an unfinished charm choice to keep the charm. Rally and Revelation from cards must be completed before the next turn.'],
  ['Voyage and recovery', 'Choose connected stops on the voyage map. Fishing recruits creatures; shops sell fish and charms; events offer explicit trades and rewards. Killed fish stay in your school but cannot fight until hydrated. Hydration restores up to three selected fish and one resolve. Zero resolve ends the run.'],
  ['Two-tide battles', 'Voyage battles have two tides. You start the first; the rival starts the second. Add both reef scores to decide one reward or resolve loss. The board, opening hands, reserves and charms reset between tides. Fish killed in either tide need hydration after the match. A charm used in either tide consumes one inventory copy; refreshed use in the other tide does not charge twice. Saves resume either tide or the intermission.'],
  ['Fishing and regional growth', 'In fishing, use Left and Right to keep the fish inside your capture zone. Fill the meter to catch it. Escape pauses; leaving or reloading preserves the attempt. Voyage boards grow from 5×5 to 6×6 to 7×7. Plays per side per tide grow from 4 to 5 to 6. Quick Match offers the same two-tide progression or a Classic single tide with 5–7 plays.'],
  ['Controls and your first match', 'Menus work with Tab, Shift+Tab, Enter and Space. Battle controls above the board provide labeled card, charm, target and follow-up choices. Native selection lists use arrow keys. Inspect a target and its terrain, then press Place to commit. Mouse clicking and dragging still work. Motion can be reduced below the board, and Sound controls adjust music and effects. Try Beginner Quick Match first.'],
];
export function openTutorial(): void {
  if (document.querySelector('.tutorial-dialog')) return;
  const origin = document.activeElement as HTMLElement | null;
  const dialog = document.createElement('dialog'); dialog.className = 'voyage-dialog tutorial-dialog'; dialog.setAttribute('aria-label','How to play');
  let page = 0;
  const title = document.createElement('h2'); title.tabIndex = -1;
  const count = document.createElement('p'); const body = document.createElement('p'); body.className = 'tutorial-copy';
  const back = document.createElement('button'), next = document.createElement('button'), close = document.createElement('button');
  for (const b of [back,next,close]) b.className = 'voyage-button';
  back.textContent = 'Back'; close.textContent = 'Close tutorial';
  const draw = () => { title.textContent = TUTORIAL_PAGES[page][0]; count.textContent = `Page ${page+1} of ${TUTORIAL_PAGES.length}`; body.textContent = TUTORIAL_PAGES[page][1]; back.disabled = page === 0; next.textContent = page === TUTORIAL_PAGES.length-1 ? 'Finish' : 'Next'; title.focus(); };
  back.onclick = () => { page--; draw(); }; next.onclick = () => { if (page === TUTORIAL_PAGES.length-1) dialog.close(); else { page++; draw(); } }; close.onclick = () => dialog.close();
  dialog.append(count,title,body,back,next,close); document.body.append(dialog);
  dialog.addEventListener('close', () => { dialog.remove(); origin?.focus(); }, {once:true}); dialog.showModal(); draw();
}
