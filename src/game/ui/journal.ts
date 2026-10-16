import { STARTERS, type FishCard } from '../data/starterFish.ts';
import { SHORELINE_ROLES } from '../data/shorelineRoles.ts';
import { enabledTextures } from '../data/roster.ts';
import { REGIONS } from '../run/maps.ts';
import type { Run } from '../run/state.ts';
import { creatureRole, creatureRegions, creatureRarity, filterCreatures, recordDiscoveries, ROLE_HELP, type InspectionFilter } from '../journal.ts';
import { cardElement } from './cardElement';
import { EFFECT_HELP, ABILITY_HELP } from './cardVisuals.ts';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
}
export function openJournal(run: Run | null, initial: 'journal' | 'school' = 'journal'): void {
  if (document.querySelector('.journal-dialog')) return;
  const origin = document.activeElement as HTMLElement | null;
  const discoveries = recordDiscoveries(run?.school.map(f => f.texture));
  const known = new Set(discoveries.textures);
  const enabled = new Set(run?.roster ?? enabledTextures());
  const catalog: FishCard[] = STARTERS.filter(f => known.has(f.texture)).map(f => ({ ...f, owner: 'player', condition: 'healthy' }));
  let mode = initial, selected: FishCard[] = [];
  const filter: InspectionFilter = { search: '', region: '', role: '', health: '', rarity: '' };
  const dialog = el('dialog', '', 'voyage-dialog journal-dialog'); dialog.setAttribute('aria-label', 'Collection journal and school');
  const title = el('h2'); title.tabIndex = -1;
  const close = el('button', 'Close', 'voyage-button'); close.onclick = () => dialog.close();
  const tabs = el('nav', '', 'journal-toolbar'); tabs.setAttribute('aria-label', 'Collection views');
  const journal = el('button', 'Collection journal', 'voyage-button'), school = el('button', 'Your school', 'voyage-button');
  school.disabled = !run; tabs.append(journal, school);
  const summary = el('p'), roles = el('p'), note = el('p');
  note.textContent = 'Roles are browsing guides based on current mechanics, not power ratings. Inspect directions and abilities before choosing a fish.';
  const controls = el('div', '', 'journal-toolbar');
  const searchLabel = el('label', 'Search name or mechanic');
  const search = el('input'); search.type = 'search'; search.placeholder = 'Name, Shield, Shock…'; searchLabel.append(search); controls.append(searchLabel);
  search.oninput = () => { filter.search = search.value; drawList(); };
  const select = (label: string, key: keyof InspectionFilter, values: [string, string][]) => {
    const wrapper = el('label', label), input = el('select');
    for (const [value, text] of [['', 'All'], ...values]) { const option = el('option', text); option.value = value; input.append(option); }
    input.onchange = () => { filter[key] = input.value; drawList(); }; wrapper.append(input); controls.append(wrapper); return wrapper;
  };
  select('Region', 'region', REGIONS.map((r, i) => [String(i), r.name]));
  select('Role', 'role', Object.keys(ROLE_HELP).map(r => [r, r]));
  select('Rarity', 'rarity', ['Common', 'Uncommon', 'Rare', 'Extremely Rare', 'Unrated'].map(r => [r, r]));
  const health = select('Health', 'health', [['healthy', 'Ready'], ['killed', 'Needs hydration']]);
  const reset = el('button', 'Clear filters', 'voyage-button');
  reset.onclick = () => { for (const key of Object.keys(filter) as (keyof InspectionFilter)[]) filter[key] = ''; search.value = ''; controls.querySelectorAll('select').forEach(s => { s.value = ''; }); drawList(); };
  controls.append(reset);
  const count = el('p'); count.setAttribute('role', 'status');
  const list = el('div', '', 'journal-list'); list.setAttribute('aria-label', 'Creatures');
  const comparison = el('section', '', 'journal-comparison'); comparison.setAttribute('aria-label', 'Selected creatures');
  comparison.tabIndex = -1;
  const inspect = el('button', 'View comparison', 'voyage-button'); inspect.onclick = () => comparison.focus();
  const regionText = (fish: FishCard) => creatureRegions(fish.texture).map(i => REGIONS[i].name).join(', ') || 'No current regional catch pool';
  const drawComparison = () => {
    comparison.replaceChildren();
    if (!selected.length) { comparison.append(el('p', 'Select up to two creatures to inspect and compare. Selecting a third replaces the oldest selection.')); return; }
    for (const fish of selected) {
      const panel = el('article', '', 'journal-creature');
      panel.append(el('h3', fish.name), cardElement(fish));
      panel.append(el('p', `${creatureRarity(fish.texture)} · ${regionText(fish)}`));
      if (mode === 'school') panel.append(el('p', `${fish.condition === 'healthy' ? 'Ready' : 'Killed · Needs hydration'} · Copy ${fish.id}`));
      else panel.append(el('p', `Owned copies: ${run?.school.filter(f => f.texture === fish.texture).length ?? 0} · Current catalog rules`));
      if (!enabled.has(fish.texture)) panel.append(el('p', 'Excluded from this voyage’s recruitment roster (or current roster settings if no voyage).'));
      const role = creatureRole(fish); panel.append(el('h4', role), el('p', ROLE_HELP[role]));
      const identity = SHORELINE_ROLES[fish.texture];
      const current = STARTERS.find(f => f.texture === fish.texture);
      if (identity && current && JSON.stringify(current.edges) === JSON.stringify(fish.edges) && current.ability === fish.ability) {
        panel.append(el('h4', identity.title), el('p', identity.plan), el('p', `Tradeoff: ${identity.limitation}`));
      }
      const edges = el('ul');
      for (const direction of ['up', 'right', 'down', 'left'] as const) {
        const edge = fish.edges.find(e => e.direction === direction);
        edges.append(el('li', `${direction[0].toUpperCase()}${direction.slice(1)} — ${edge ? EFFECT_HELP[edge.effect] : 'Empty: no edge effect or edge defense'}`));
      }
      panel.append(edges, el('p', fish.ability ? ABILITY_HELP[fish.ability] : 'No full-card ability.'));
      const remove = el('button', `Remove ${fish.name} from comparison`, 'voyage-button');
      remove.onclick = () => { selected = selected.filter(f => f.id !== fish.id); drawList(); search.focus(); };
      panel.append(remove); comparison.append(panel);
    }
  };
  const drawList = () => {
    const source = mode === 'school' ? run?.school ?? [] : catalog;
    const matches = filterCreatures(source, filter);
    count.textContent = `${matches.length} of ${source.length} ${mode === 'school' ? 'owned copies' : 'discovered species'} shown. ${selected.length} selected for comparison.`;
    inspect.disabled = selected.length === 0;
    list.replaceChildren();
    for (const fish of matches) {
      const label = `${fish.name} · ${creatureRole(fish)}${mode === 'school' ? ` · ${fish.condition === 'healthy' ? 'Ready' : 'Needs hydration'} · ${fish.id}` : ''}`;
      const button = el('button', label, 'voyage-button'); button.setAttribute('aria-pressed', String(selected.some(f => f.id === fish.id)));
      button.onclick = () => {
        selected = selected.some(f => f.id === fish.id) ? selected.filter(f => f.id !== fish.id) : [...selected.slice(-1), fish];
        drawList(); (list.querySelectorAll('button')[matches.indexOf(fish)] as HTMLElement)?.focus();
      }; list.append(button);
    }
    if (!matches.length) list.append(el('p', 'No creatures match these filters. Try clearing a filter or recruit more creatures in Voyage.'));
    drawComparison();
  };
  const draw = () => {
    title.textContent = mode === 'school' ? 'Inspect your school' : 'Collection journal';
    journal.setAttribute('aria-pressed', String(mode === 'journal')); school.setAttribute('aria-pressed', String(mode === 'school'));
    health.hidden = mode !== 'school';
    summary.textContent = mode === 'school'
      ? `${run!.school.filter(f => f.condition === 'healthy').length}/${run!.school.length} ready. All healthy copies enter the battle shuffle; this screen does not change your school. Owned cards retain their saved rules.`
      : `${known.size}/${STARTERS.length} species discovered. Recruit creatures in Voyage to record them across runs on this browser. Existing saves contribute their current school; previously released creatures cannot be recovered from old saves.`;
    roles.textContent = mode === 'school' ? Object.keys(ROLE_HELP).map(role => { const copies = run!.school.filter(f => creatureRole(f) === role); return `${role}: ${copies.filter(f => f.condition === 'healthy').length}/${copies.length} ready`; }).join(' · ')
      : REGIONS.map((r, i) => `${r.name}: ${STARTERS.filter(f => known.has(f.texture) && creatureRegions(f.texture).includes(i)).length}/${STARTERS.filter(f => creatureRegions(f.texture).includes(i)).length}`).join(' · ');
    drawList();
  };
  journal.onclick = () => { mode = 'journal'; selected = []; filter.health = ''; health.querySelector('select')!.value = ''; draw(); };
  school.onclick = () => { mode = 'school'; selected = []; draw(); };
  dialog.append(close, title, tabs, summary, roles, note);
  if (!discoveries.saved) dialog.append(el('p', 'Journal storage unavailable. Discoveries are kept for this tab only until saving works again.', 'journal-warning'));
  dialog.append(controls, count, inspect, list, comparison);
  dialog.addEventListener('close', () => { dialog.remove(); origin?.focus(); }, { once: true });
  document.body.append(dialog); draw(); dialog.showModal(); title.focus();
}
