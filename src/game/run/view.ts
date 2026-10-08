import { FishingSession } from "../fishing/view.ts";
import { MOVEMENTS, movementFor } from "../fishing/model.ts";
import { cardElement } from "../ui/cardElement";
import { CHARMS, availableCharms, CHARM_CAPACITY, charmCanvas } from "../data/tideCharms.ts";
import { shopOffers, runFishDefinition } from "./state.ts";
import { drawEncounterArt, encounterTitle, isEncounterSpace } from "./encounters.ts";
import { drawIcon, drawSeascape } from "./art.ts";
import { COLUMNS, REGIONS, SPACE_INFO, type MapNode, type Space } from "./maps.ts";
import { activeNode, beginFishing, finishFishing, canRelease, createRun, enterNode, loadRun, offers, reachable, resolveVisit, saveRun, type Run } from "./state.ts";

let memory: Run | null = null;
export function currentRun(): Run | null { return memory ??= loadRun(); }
export function persistRun(run: Run): boolean { memory = run; return saveRun(run); }

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag); el.className = className; el.textContent = text; return el;
}
function button(text: string, callback: () => void, className = "voyage-button"): HTMLButtonElement {
  const el = element("button", className, text); el.type = "button"; el.onclick = callback; return el;
}
export class VoyageView {
  private root: HTMLElement;
  private run: Run | null;
  private preview: number;
  private selected: string | null = null;
  private observer?: ResizeObserver;
  private storageOk = true;
  private viewingMap = false;
  private fishing?: FishingSession;
  constructor(root: HTMLElement) {
    this.root = root; this.run = currentRun(); this.preview = this.run?.region ?? 0;
    this.render();
  }
  destroy(): void { this.fishing?.destroy(); this.fishing = undefined; this.observer?.disconnect(); this.root.replaceChildren(); }
  private save(): void { if (this.run) this.storageOk = persistRun(this.run); }
  private start(seed?: string): void {
    const id = seed?.trim().slice(0, 64) || crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase();
    this.viewingMap = false; this.run = createRun(id); this.preview = 0; this.selected = null; this.save(); this.render();
  }
  private render(): void {
    this.fishing?.destroy(); this.fishing = undefined;
    if (this.run?.fishing && this.run.fishing.snapshot.status !== "playing") {
      finishFishing(this.run, this.run.fishing.snapshot); this.save();
    }
    this.observer?.disconnect(); this.root.replaceChildren();
    const run = this.run;
    this.root.dataset.region = REGIONS[this.preview].id;
    const top = element("header", "voyage-top");
    const encounter = run?.status === "active" && run.pending && isEncounterSpace(activeNode(run).type) && !this.viewingMap;
    const title = element("div");
    title.append(element("p", "voyage-kicker", "KING OF THE REEF / EXPEDITION"), element("h2", "voyage-title", encounter ? "A pause in the current" : run ? "Chart your course" : "Beyond the shallows"));
    const controls = element("nav", "voyage-controls");
    const menu = element("a", "voyage-button", "Main Menu"); menu.href = "#menu";
    controls.append(menu);
    if (run) controls.append(button("New voyage", () => this.newRunDialog()));
    if (this.viewingMap && run?.pending && isEncounterSpace(activeNode(run).type)) controls.prepend(button("Resume visit →", () => { this.viewingMap = false; this.preview = run.region; this.render(); }));
    top.append(title, controls); this.root.append(top);
    if (encounter && run) {
      this.renderEncounter(run, activeNode(run));
      if (run.fishing) this.openFishing(true);
      return;
    }
    if (!run) {
      const intro = element("div", "voyage-intro");
      intro.append(element("p", "voyage-kicker", "THREE SEAS. ONE SCHOOL."), element("h3", "", "Leave the shore. Find the impossible."), element("p", "", "Choose branching currents, catch new creatures, and challenge the Colossals of the reef, the abyss, and the Triangle."));
      const seed = element("input"); seed.placeholder = "Optional voyage seed"; seed.maxLength = 64; seed.setAttribute("aria-label", "Voyage seed");
      intro.append(seed, button("Begin voyage →", () => this.start(seed.value)));
      this.root.append(intro);
    }
    const tabs = element("div", "voyage-regions");
    REGIONS.forEach((region, index) => {
      const tab = button(`0${index + 1}   ${region.name}${run && index > run.region ? " · UNCHARTED" : ""}`, () => { this.preview = index; this.selected = null; this.render(); }, "region-tab");
      tab.setAttribute("aria-pressed", String(index === this.preview)); tabs.append(tab);
    });
    this.root.append(tabs);
    const region = REGIONS[this.preview];
    const regionHeading = element("div", "voyage-region-heading");
    regionHeading.append(element("h3", "", region.name), element("p", "", region.subtitle));
    if (run) {
      const resources = element("div", "voyage-resources");
      for (const [icon, label] of [["resolve", `${run.resolve}/3 Resolve`], ["shell", `${run.shells} Shells`], ["school", `${run.school.filter((f) => f.condition === "healthy").length}/${run.school.length} Ready`]]) {
        const resource = element("span", "resource");
        const symbol = element("span", `pixel-icon icon-${icon}`); symbol.setAttribute("aria-hidden", "true");
        resource.append(symbol, element("span", "", label)); resources.append(resource);
      }
      regionHeading.append(resources);
    }
    this.root.append(regionHeading);
    const displayRun = run ?? createRun("WELCOME");
    const map = displayRun.maps[this.preview];
    const viewport = element("div", "voyage-map-scroll");
    const stage = element("div", "voyage-map");
    const background = element("canvas", "voyage-scenery"); background.setAttribute("aria-hidden", "true");
    const paths = element("canvas", "voyage-paths"); paths.setAttribute("aria-hidden", "true");
    stage.append(background, paths); viewport.append(stage); this.root.append(viewport);
    const buttons = new Map<string, HTMLButtonElement>();
    const available = run && run.region === this.preview ? reachable(run) : [];
    const layers = element("div", "voyage-zones");
    region.zones.forEach((zone) => layers.append(element("span", "", zone)));
    stage.append(layers);
    map.nodes.forEach((node) => {
      const info = SPACE_INFO[node.type];
      const label = node.type === "boss" ? region.boss : info.name;
      const btn = button("", () => { this.selected = node.id; this.renderDetail(); }, `map-node node-${node.type}`);
      btn.style.setProperty("--node-color", info.color);
      btn.setAttribute("aria-label", `${label}, step ${node.column}${available.includes(node.id) ? ", available" : ""}`);
      btn.title = `${label} — ${info.description}`;
      if (available.includes(node.id)) btn.classList.add("available");
      if (run?.visited.includes(node.id)) btn.classList.add("visited");
      if (run?.current === node.id || run?.pending === node.id) btn.classList.add("current");
      const icon = element("canvas"); drawIcon(icon, node.type, info.color);
      btn.append(icon, element("span", "node-label", label));
      stage.append(btn); buttons.set(node.id, btn);
    });
    const draw = () => {
      const width = Math.max(1320, Math.floor(viewport.clientWidth));
      const height = Math.max(540, Math.min(740, window.innerHeight - 380));
      stage.style.width = `${width}px`; stage.style.height = `${height}px`;
      for (const canvas of [background, paths]) { canvas.width = width; canvas.height = height; }
      drawSeascape(background, region.id, displayRun.seed);
      const positions = new Map<string, { x: number; y: number }>();
      map.nodes.forEach((node) => {
        const x = Math.round(108 + node.column * (width - 224) / (COLUMNS - 1));
        const y = Math.round(110 + node.lane * (height - 224) / 4);
        positions.set(node.id, { x, y });
        const btn = buttons.get(node.id)!; btn.style.left = `${x - 24}px`; btn.style.top = `${y - 24}px`;
      });
      const ctx = paths.getContext("2d")!;
      map.nodes.forEach((node) => node.next.forEach((id) => {
        const a = positions.get(node.id)!, b = positions.get(id)!;
        const traveled = run?.visited.includes(node.id) && run?.visited.includes(id);
        const next = available.includes(id) && node.id === run?.current;
        ctx.strokeStyle = traveled ? "#edd6a1" : next ? "#d3fbe0" : "#88a7b366";
        ctx.lineWidth = traveled || next ? 3 : 2;
        ctx.setLineDash(traveled ? [] : [5, 7]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }));
    };
    draw(); this.observer = new ResizeObserver(draw); this.observer.observe(viewport);
    const footer = element("div", "voyage-footer");
    const legend = element("div", "voyage-legend");
    (["battle", "fishing", "shop", "event", "hydration", "release", "boss"] as Space[]).forEach((type) => {
      const item = element("span"); const icon = element("canvas"); drawIcon(icon, type, SPACE_INFO[type].color);
      item.append(icon, element("span", "", SPACE_INFO[type].name)); legend.append(item);
    });
    footer.append(legend, element("p", "voyage-seed", run ? `SEED ${run.seed} · ${this.storageOk ? "AUTO-SAVED" : "SAVE UNAVAILABLE — KEEP THIS TAB OPEN"}` : "A different chart for every voyage"));
    this.root.append(footer);
    const detail = element("section", "voyage-detail"); detail.id = "voyage-detail"; detail.setAttribute("aria-live", "polite"); this.root.append(detail);
    this.renderDetail();
    if (run) {
      const bag = element("details", "voyage-school");
      bag.append(element("summary", "", `Tide Charms · ${Math.min(run.charms.length, CHARM_CAPACITY)}/${CHARM_CAPACITY}${run.charms.length > CHARM_CAPACITY ? ` · ${run.charms.length - CHARM_CAPACITY} Legacy Extras` : ""}`));
      bag.append(this.charmInventory(run)); this.root.append(bag);
      const school = element("details", "voyage-school"); school.append(element("summary", "", `Your School · ${run.school.length} Cards`));
      const cards = element("div", "school-cards");
      run.school.forEach((fish) => {
        const card = element("div", fish.condition === "healthy" ? "" : "resting");
        card.append(cardElement(fish), element("span", "", fish.name), element("small", "", fish.condition === "healthy" ? "Ready" : "Killed · Needs Hydration")); cards.append(card);
      });
      school.append(cards); this.root.append(school);
    }
    if (run?.fishing) this.openFishing(true);
  }
  private charmInventory(run: Run): HTMLElement {
    const section = element("section", "held-charms");
    section.setAttribute("aria-label", "Your Tide Charms");
    section.append(element("h4", "", `Your Tide Charms · ${Math.min(run.charms.length, CHARM_CAPACITY)}/${CHARM_CAPACITY}`));
    const slots = element("div", "charm-inventory");
    const available = availableCharms(run.charms);
    for (let index = 0; index < CHARM_CAPACITY; index++) {
      const entry = element("div", "charm-entry");
      const id = available[index];
      if (id) entry.append(charmCanvas(id), element("strong", "", CHARMS[id].name), element("p", "", CHARMS[id].description));
      else entry.append(element("strong", "", "Empty Slot"), element("p", "", "Room for one Tide Charm."));
      slots.append(entry);
    }
    section.append(slots);
    if (run.charms.length > CHARM_CAPACITY) section.append(element("p", "", `${run.charms.length - CHARM_CAPACITY} charms from an older save are waiting. Using a held charm makes the next one available.`));
    return section;
  }
  private renderDetail(): void {
    const panel = this.root.querySelector<HTMLElement>("#voyage-detail")!;
    panel.replaceChildren();
    const run = this.run;
    if (!run) { panel.append(element("p", "", "Preview all three seas above, then begin your voyage to choose a route.")); return; }
    if (run.status !== "active") {
      panel.append(element("h3", "", run.status === "won" ? "The three seas are yours." : "Your voyage has ended."), element("p", "", run.log), button("Sail again →", () => this.newRunDialog())); return;
    }
    if (this.preview !== run.region) {
      panel.append(element("h3", "", this.preview > run.region ? "Waters yet to be charted" : "A sea behind you"), element("p", "", "You can inspect this chart. Continue along the active region to advance."), button("Return to your school →", () => { this.preview = run.region; this.render(); })); return;
    }
    const node = run.pending ? activeNode(run) : run.maps[run.region].nodes.find((n) => n.id === this.selected);
    if (!node) { panel.append(element("h3", "", "Follow the bright current →"), element("p", "", run.log), element("p", "", "Select a connected, glowing space to inspect it. Your route becomes permanent when you enter.")); return; }
    const info = SPACE_INFO[node.type];
    panel.append(element("h3", "", node.type === "boss" ? REGIONS[run.region].boss : info.name), element("p", "", info.description));
    if (!run.pending) {
      if (reachable(run).includes(node.id)) panel.append(button("Enter this space →", () => { if (enterNode(run, node.id)) { this.viewingMap = false; this.save(); this.render(); } }));
      else panel.append(element("p", "", run.visited.includes(node.id) ? "Already visited." : "This space is not connected to your current position."));
      return;
    }
    if (isEncounterSpace(node.type)) {
      panel.append(element("p", "", "Your visit is still in progress. Viewing the chart does not spend this stop."), button("Resume visit →", () => { this.viewingMap = false; this.render(); }));
      return;
    }
    this.renderEncounterActions(panel, run, node);
  }
  private renderEncounter(run: Run, node: MapNode): void {
    const screen = element("section", "encounter-screen"); screen.dataset.encounter = node.type;
    const nav = element("div", "encounter-navigation");
    nav.append(button("← View chart", () => { this.viewingMap = true; this.preview = run.region; this.render(); }), element("p", "voyage-kicker", REGIONS[run.region].name + " / " + SPACE_INFO[node.type].name));
    const artFrame = element("div", "encounter-art");
    const art = element("canvas"); art.setAttribute("aria-hidden", "true"); artFrame.append(art);
    const panel = element("div", "encounter-content");
    const heading = element("h3", "", encounterTitle(node.type)); heading.tabIndex = -1;
    panel.append(heading, element("p", "encounter-description", SPACE_INFO[node.type].description));
    const resources = element("p", "encounter-resources", run.shells + " Shells · " + run.resolve + "/3 Resolve · " + run.school.filter(f => f.condition === "healthy").length + "/" + run.school.length + " Ready");
    const status = element("p", "encounter-status", node.type === "shop" ? `${run.shop?.purchased.length ?? 0} / 3 Offers Purchased · ${this.storageOk ? "Auto-saved" : "Save unavailable"}` : "Choose when you are ready. Viewing the chart keeps this visit open."); status.setAttribute("role", "status");
    panel.append(resources, status);
    if (!this.storageOk) panel.append(element("p", "encounter-status", "Save unavailable — keep this tab open."));
    this.renderEncounterActions(panel, run, node);
    screen.append(nav, artFrame, panel); this.root.append(screen);
    const draw = () => { art.width = Math.max(640, Math.floor(artFrame.clientWidth)); art.height = 256; drawEncounterArt(art, node.type, REGIONS[run.region].id, run.seed); };
    draw(); this.observer = new ResizeObserver(draw); this.observer.observe(artFrame);
    heading.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }
  private renderEncounterActions(panel: HTMLElement, run: Run, node: MapNode): void {
    const actions = element("div", "encounter-actions");
    if (node.type === "battle" || node.type === "boss") {
      panel.append(element("p", "", run.log));
      actions.append(button(node.type === "boss" ? "Challenge Colossal →" : "Enter battle →", () => { this.save(); window.location.hash = "#voyage-battle"; }));
    } else if (node.type === "shop") {
      panel.append(this.charmInventory(run));
      panel.append(element("p", "", `${run.shells} Shells · Each Offer Can Be Bought Once. Tide Charms Are Single-Use Battle Items.`));
      const stock = element("div", "shop-stock");
      for (const offer of shopOffers(run)) {
        const full = offer.kind === "charm" && run.charms.length >= CHARM_CAPACITY;
        const sold = run.shop?.purchased.includes(offer.id) ?? false;
        const pick = button("", () => this.resolve(offer.id), "catch-choice shop-offer");
        pick.dataset.offerId = offer.id;
        if (offer.kind === "fish") {
          const fish = runFishDefinition(run, offer.texture)!;
          pick.append(cardElement({ ...fish, owner: "player", condition: "healthy" }), element("strong", "", fish.name), element("span", "offer-description", "Healthy Creature · Joins Your School"));
        } else {
          const art = element("span", "school-card-art charm-card"); art.append(charmCanvas(offer.charm, 8));
          art.style.borderColor = CHARMS[offer.charm].color;
          pick.append(art, element("strong", "", CHARMS[offer.charm].name), element("span", "offer-description", CHARMS[offer.charm].description));
        }
        pick.append(element("small", "", `${offer.price} Shells`), element("span", "offer-status", sold ? "Sold Out" : full ? "Charm Inventory Full (3/3)" : run.shells < offer.price ? `Need ${offer.price - run.shells} More` : "Buy"));
        pick.disabled = sold || full || run.shells < offer.price;
        stock.append(pick);
      }
      panel.append(stock);
      actions.append(button("Sail On", () => this.resolve("leave")));
    } else if (node.type === "fishing") {
      for (const texture of offers(run)) {
        const fish = runFishDefinition(run, texture)!;
        const pick = button("", () => {
          if (beginFishing(run, texture)) { this.save(); this.openFishing(false); }
        }, "catch-choice");
        pick.append(cardElement({ ...fish, owner: "player", condition: "healthy" }), element("strong", "", fish.name), element("small", "", "Try · " + MOVEMENTS[movementFor(texture)].name));
        actions.append(pick);
      }
      actions.append(button("Skip", () => this.resolve("leave")));
    } else if (node.type === "hydration" || node.type === "release") {
      const hydration = node.type === "hydration";
      const choices = hydration ? run.school.filter((f) => f.condition === "killed") : run.school;
      const selected = new Set<string>();
      const limit = hydration ? 3 : 1;
      const status = element("p", "care-selection");
      const confirm = button("", () => {
        if (resolveVisit(run, hydration ? "rest" : [...selected][0], [...selected])) {
          this.selected = null; this.save(); this.render();
        }
      });
      const picks: HTMLButtonElement[] = [];
      const update = () => {
        status.textContent = hydration ? `${selected.size} / ${Math.min(3, choices.length)} Cards Selected` : "Choose One Card to Release Permanently";
        confirm.textContent = hydration ? `Hydrate ${selected.size} Cards · +1 Resolve` : "Confirm Release";
        confirm.disabled = !hydration && selected.size === 0;
        picks.forEach((pick) => {
          const checked = selected.has(pick.dataset.cardId!);
          pick.setAttribute("aria-pressed", String(checked));
          pick.disabled = (!checked && selected.size >= limit) || (!hydration && !canRelease(run, pick.dataset.cardId!));
        });
      };
      for (const fish of choices) {
        const pick = button("", () => {
          if (selected.has(fish.id)) selected.delete(fish.id); else selected.add(fish.id);
          update();
        }, "catch-choice care-choice");
        pick.dataset.cardId = fish.id;
        pick.append(cardElement(fish), element("strong", "", fish.name), element("small", "", fish.condition === "killed" ? "Killed" : "Ready"));
        picks.push(pick); actions.append(pick);
      }
      if (hydration && !choices.length) panel.append(element("p", "", "All your cards are healthy. You can still recover one resolve."));
      panel.append(status); update();
      const controls = element("div", "care-controls"); controls.append(confirm);
      if (!hydration) controls.append(button("Keep My School", () => this.resolve("leave")));
      actions.append(controls);
    }
    else if (node.type === "event") {
      panel.append(element("p", "", ["A tide-stranded skiff carries a shell chest and a tangled fishing net.", "Beneath the ice, a wreck holds a chest and a creature caught in its rigging.", "Lightning exposes a ghost ship. A trapped creature calls from beside its treasure."][run.region]));
      actions.append(button("Rescue the creature", () => this.resolve("rescue")), button("Salvage: +14 shells, −1 resolve (min 1)", () => this.resolve("salvage")));
    }
    panel.append(actions);
  }
  private resolve(choice: string): void {
    if (this.run && resolveVisit(this.run, choice)) { this.selected = null; this.save(); this.render(); }
  }
  private openFishing(resumed: boolean): void {
    const run = this.run, attempt = run?.fishing;
    if (!run || !attempt || this.fishing) return;
    const fish = runFishDefinition(run, attempt.texture)!;
    this.fishing = new FishingSession({ ...fish, owner: "player", condition: "healthy" }, attempt.snapshot, run.seed, resumed,
      (snapshot) => { if (run.fishing?.nodeId === attempt.nodeId) { run.fishing.snapshot = snapshot; this.save(); } },
      (snapshot) => { finishFishing(run, snapshot); this.save(); },
      () => { this.fishing = undefined; this.selected = null; this.render(); });
  }
  private newRunDialog(): void {
    const dialog = element("dialog", "voyage-dialog");
    dialog.append(element("h3", "", "Chart a new voyage?"), element("p", "", "This replaces your saved voyage with three newly generated maps."));
    const seed = element("input"); seed.placeholder = "Optional seed"; seed.maxLength = 64; seed.setAttribute("aria-label", "New voyage seed");
    dialog.append(seed, button("Start new voyage", () => { dialog.close(); dialog.remove(); this.start(seed.value); }), button("Keep sailing", () => { dialog.close(); dialog.remove(); }));
    dialog.addEventListener("close", () => dialog.remove(), { once: true });
    this.root.append(dialog); dialog.showModal();
  }
}
