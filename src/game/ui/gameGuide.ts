import { GUIDE_SECTIONS, guideEntries } from './guideContent.ts';

export function mountGameGuide(root: HTMLElement): void {
  root.replaceChildren();
  const el = <K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = '') => {
    const node = document.createElement(tag); node.textContent = text; node.className = className; return node;
  };
  const header = el('header', '', 'guide-header');
  const title = el('h2', 'Game Guide'); title.tabIndex = -1;
  const back = el('a', 'Main Menu', 'nav-link'); back.href = '#menu'; header.append(title, back);
  const tabs = el('div', '', 'guide-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Guide topics');
  const panel = el('section', '', 'guide-panel'); panel.id = 'guide-panel'; panel.setAttribute('role', 'tabpanel');
  const heading = el('h3'), intro = el('p', '', 'guide-intro');
  const label = el('label', 'Search this tab', 'guide-search');
  const search = el('input'); search.type = 'search'; search.placeholder = 'Find a rule…'; label.append(search);
  const count = el('p', '', 'guide-count'); count.setAttribute('role', 'status');
  const entries = el('div', '', 'guide-entries'); panel.append(heading, intro, label, count, entries);
  let selected = 0;
  const drawEntries = () => {
    const matches = guideEntries(GUIDE_SECTIONS[selected], search.value); entries.replaceChildren();
    count.textContent = search.value ? `${matches.length} result${matches.length === 1 ? '' : 's'}` : '';
    if (!matches.length) entries.append(el('p', 'No matching rules.'));
    for (const item of matches) { const card = el('article', '', 'guide-entry'); card.append(el('h4', item.title), el('p', item.text)); entries.append(card); }
  };
  const select = (index: number, focus = false) => {
    selected = index; const section = GUIDE_SECTIONS[index];
    buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
    panel.setAttribute('aria-labelledby', buttons[index].id); heading.textContent = section.title; intro.textContent = section.intro;
    search.value = ''; drawEntries(); if (focus) buttons[index].focus();
  };
  const buttons = GUIDE_SECTIONS.map((section, index) => {
    const button = el('button', section.title); button.id = 'guide-tab-' + section.id;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
    button.onclick = () => select(index);
    button.onkeydown = event => {
      const target = event.key === 'ArrowRight' ? (index + 1) % GUIDE_SECTIONS.length : event.key === 'ArrowLeft' ? (index + GUIDE_SECTIONS.length - 1) % GUIDE_SECTIONS.length : event.key === 'Home' ? 0 : event.key === 'End' ? GUIDE_SECTIONS.length - 1 : undefined;
      if (target !== undefined) { event.preventDefault(); select(target, true); }
    };
    tabs.append(button); return button;
  });
  search.oninput = drawEntries;
  root.append(header, tabs, panel); select(0); title.focus(); window.scrollTo({ top: 0 });
}
