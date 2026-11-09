import { regionalRules, type BattleRules, type Difficulty } from '../battleRules.ts';
import { tidePlayLimit } from '../twoTide.ts';
export type QuickMatchSettings = BattleRules & { format?: 'classic' | 'two-tide' };
export function quickMatchSetup(previous: QuickMatchSettings | undefined, start: (rules: QuickMatchSettings) => void, cancel: () => void): HTMLDialogElement {
  const dialog = document.createElement('dialog'); dialog.className = 'voyage-dialog quick-match-setup';
  dialog.setAttribute('aria-label', 'Quick Match setup');
  dialog.innerHTML = `<h2>Quick Match</h2>
    <label>Format <select name="format"><option value="classic">Classic · one tide</option><option value="two-tide">Two tides</option></select></label>
    <p data-tide-budget role="status"></p>
    <label>Region <select name="region"><option value="0">Shoreline · 2–4 special tiles</option><option value="1">Open Ocean · 3–5 special tiles</option><option value="2">Bermuda · 4–6 special tiles</option></select></label>
    <label>Rival difficulty <select name="difficulty"><option value="beginner">Beginner</option><option value="tactical">Tactical</option><option value="expert">Expert</option></select></label>
    <label>Board size <select name="size"><option value="5">5 × 5</option><option value="6">6 × 6</option><option value="7">7 × 7</option></select></label>
    <label>Plays per side <select name="plays"><option value="5">5</option><option value="6">6</option><option value="7">7</option></select></label>
    <button type="button" class="voyage-button" data-start>Start Match</button><button type="button" class="voyage-button" data-cancel>Cancel</button>`;
  const field = (name: string) => dialog.querySelector<HTMLSelectElement>(`[name="${name}"]`)!;
  const apply = (rules: BattleRules) => { field('region').value = String(['shoreline','ocean','bermuda'].indexOf(rules.region)); field('difficulty').value = rules.difficulty; field('size').value = String(rules.size); field('plays').value = String(rules.plays); };
  apply(previous ?? regionalRules(0, ''));
  field('format').value = previous?.format ?? 'classic';
  const updateFormat = () => {
    const twoTide = field('format').value === 'two-tide';
    field('plays').disabled = twoTide;
    field('plays').closest('label')!.hidden = twoTide;
    const plays = tidePlayLimit(regionalRules(Number(field('region').value), '').region);
    dialog.querySelector('[data-tide-budget]')!.textContent = twoTide ? `${plays} plays per side per tide` : '';
  };
  field('format').onchange = updateFormat; updateFormat();
  field('region').onchange = () => { apply(regionalRules(Number(field('region').value), '')); updateFormat(); };
  let accepted = false;
  dialog.querySelector<HTMLButtonElement>('[data-start]')!.onclick = () => {
    const rules = regionalRules(Number(field('region').value), crypto.getRandomValues(new Uint32Array(1))[0].toString(36));
    rules.size = Number(field('size').value) as 5 | 6 | 7; rules.plays = Number(field('plays').value) as 5 | 6 | 7; rules.difficulty = field('difficulty').value as Difficulty;
    accepted = true; dialog.close(); start({...rules, format: field('format').value as 'classic' | 'two-tide'});
  };
  dialog.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => dialog.close();
  dialog.addEventListener('close', () => { dialog.remove(); if (!accepted) cancel(); }, {once:true});
  document.body.append(dialog); dialog.showModal(); return dialog;
}
