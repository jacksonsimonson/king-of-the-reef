import Phaser from "phaser";
import { STARTERS, type EdgeEffect, type FishCard } from "../data/starterFish";
import { drawEffectBadge, drawFishCard } from "../ui/drawFishCard";
import { pixelTextStyle, pixelPanel } from "../ui/pixelTheme";
import { cardDescription, EFFECT_HELP } from "../ui/cardVisuals";
import { reefRarity } from "../data/reefPool";
import { enabledTextures, toggleFish } from "../data/roster";
import { REGIONS } from "../run/maps";
import { catalogSections } from "../data/galleryCatalog";
import { oceanRarity } from "../data/oceanPool";

const GALLERY_CARDS = STARTERS;

const CARD_SIZE = 144;
const COLUMN_GAP = 24;
const ROW_GAP = 128;
const COLUMNS = 8;
const CARD_STEP = CARD_SIZE + ROW_GAP;
const START_Y = 136;
const SECTION_HEADING_HEIGHT = 72;
const FOOTER_HEIGHT = 310;
function galleryHeight(cards: readonly Omit<FishCard, "owner" | "condition">[]): number {
  return START_Y + catalogSections(cards).reduce((height, section) => height + SECTION_HEADING_HEIGHT + Math.ceil(section.cards.length / COLUMNS) * CARD_STEP, 0) + FOOTER_HEIGHT;
}
export const GALLERY_HEIGHT = galleryHeight(GALLERY_CARDS);
export const ROSTER_HEIGHT = galleryHeight(STARTERS);
const EFFECTS: Array<{ effect: EdgeEffect; label: string }> = [
  { effect: "standard", label: "STANDARD" },
  { effect: "double", label: "DOUBLE" },
  { effect: "weak", label: "SHIELD" },
  { effect: "bigger-fish", label: "BIGGER FISH" },
  { effect: "swap", label: "SWAP" },
  { effect: "hook", label: "HOOK" },
  { effect: "wave", label: "WAVE" },
  { effect: "shock", label: "SHOCK" },
  { effect: "spines", label: "SPINES" },
  { effect: "ram", label: "RAM" },
  { effect: "follow-current", label: "FOLLOW CURRENT" },
  { effect: "bounce", label: "BOUNCE" },
  { effect: "dive", label: "DIVE" },
];

export class GalleryScene extends Phaser.Scene {
  constructor() { super("gallery"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of GALLERY_CARDS) {
      this.load.image(fish.texture, `${base}assets/fish/${fish.texture}.png`);
    }
  }

  private inspectedTexture = '';
  private keyboardOpen = false;
  private restoreControlFocus = false;
  create(): void {
    const rosterMode = window.location.hash === "#gallery-roster";
    const definitions = rosterMode ? STARTERS : GALLERY_CARDS;
    this.add.existing(pixelPanel(this, this.scale.width / 2, 48, this.scale.width - 32, 80));
    const cards = this.add.container(0, 0);
    const enabled = new Set(enabledTextures());
    const controls = document.createElement('details'); controls.className = 'battle-controls'; controls.open = this.keyboardOpen;
    controls.ontoggle = () => { this.keyboardOpen = controls.open; };
    const summary = document.createElement('summary'); summary.textContent = 'Browse cards with keyboard and text';
    const label = document.createElement('label'); label.textContent = 'Creature ';
    const select = document.createElement('select'); definitions.forEach(f => select.append(new Option(f.name,f.texture)));
    if (definitions.some(f => f.texture === this.inspectedTexture)) select.value = this.inspectedTexture;
    const description = document.createElement('p'); description.setAttribute('role','status');
    const toggle = document.createElement('button'); toggle.className = 'voyage-button';
    const update = () => {
      this.inspectedTexture = select.value;
      const f = definitions.find(f => f.texture === select.value)!;
      description.textContent = cardDescription({...f,id:'inspect',owner:'player',condition:'healthy'});
      toggle.textContent = enabled.has(f.texture) ? 'Disable in new games' : 'Enable in new games';
    };
    select.onchange = update; update();
    toggle.onclick = () => {
      const result = toggleFish(select.value,REGIONS.map(r=>r.pool));
      if (!result.changed) { description.textContent = result.reason ?? 'Roster unchanged.'; return; }
      this.restoreControlFocus = true; this.scene.restart();
    };
    label.append(select); controls.append(summary,label,description); if (rosterMode) controls.append(toggle);
    document.querySelector('#gallery-game')?.before(controls);
    const cleanup = () => { controls.ontoggle = null; controls.remove(); };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,cleanup); this.events.once(Phaser.Scenes.Events.DESTROY,cleanup);
    if (this.restoreControlFocus) { select.focus({preventScroll:true}); this.restoreControlFocus = false; }
    this.add.text(32, 26, rosterMode ? "BATTLE ROSTER" : "CREATURE GALLERY", this.textStyle(26, "#39ff14", true));
    this.add.text(32, 62, rosterMode
      ? `${enabled.size}/${STARTERS.length} enabled · Click to toggle for Quick Match and your next Voyage.`
      : `${GALLERY_CARDS.length} creatures · Grouped by environment.`, this.textStyle(15, "#b8ffd0"));
    const detail = this.add.text(32, (rosterMode ? ROSTER_HEIGHT : GALLERY_HEIGHT) - 92, rosterMode
      ? "Active Voyages keep their starting roster. New fish are enabled by default."
      : "Card backgrounds: Eyes = Revelation. Flags = Rally.", this.textStyle(16, "#b8d7dc")).setWordWrapWidth(this.scale.width - 64);

    let sectionY = START_Y;
    for (const section of catalogSections(definitions)) {
      this.add.text(32, sectionY, section.environment.name, this.textStyle(20, "#39ff14", true));
      this.add.text(32, sectionY + 30, section.environment.description, this.textStyle(12, "#b8d7dc"));
      sectionY += SECTION_HEADING_HEIGHT;
      section.cards.forEach((definition, index) => {
        const row = Math.floor(index / COLUMNS);
        const rowStart = row * COLUMNS;
        const rowCards = Math.min(COLUMNS, section.cards.length - rowStart);
        const rowWidth = rowCards * CARD_SIZE + (rowCards - 1) * COLUMN_GAP;
        const startX = Math.floor((this.scale.width - rowWidth) / 2) + CARD_SIZE / 2;
        const column = index % COLUMNS;
        const x = startX + column * (CARD_SIZE + COLUMN_GAP);
        const y = sectionY + CARD_SIZE / 2 + row * CARD_STEP;
        const fish: FishCard = { ...definition, id: `gallery-${definition.id}`, owner: "player", condition: "healthy" };
        const card = drawFishCard({ scene: this, container: cards, fish, x, y, size: CARD_SIZE });
        card.setInteractive().on("pointerover", () => detail.setText(rosterMode
          ? `${fish.name}: ${enabled.has(fish.texture) ? "Enabled" : "Disabled"}. ${cardDescription(fish)}`
          : cardDescription(fish)));
        if (rosterMode) card.on("pointerdown", () => {
          const result = toggleFish(fish.texture, REGIONS.map((region) => region.pool));
          if (!result.changed) { detail.setText(result.reason ?? "Roster unchanged."); return; }
          this.scene.restart();
        });
        if (rosterMode && !enabled.has(fish.texture)) card.setAlpha(0.3);
        this.add.text(x, y + CARD_SIZE / 2 + 18, fish.name, this.textStyle(14, "#f2fff7", true))
          .setWordWrapWidth(160).setAlign("center").setOrigin(0.5, 0);
        this.add.text(x, y + CARD_SIZE / 2 + 88, rosterMode ? (enabled.has(fish.texture) ? "ENABLED" : "DISABLED") : reefRarity(fish.texture) ?? oceanRarity(fish.texture) ?? "Other Waters",
          this.textStyle(8, rosterMode ? (enabled.has(fish.texture) ? "#b8ffd0" : "#ff8b8b") : "#b8d7dc")).setOrigin(0.5, 0);
      });
      sectionY += Math.ceil(section.cards.length / COLUMNS) * CARD_STEP;
    }

    if (rosterMode) return;
    const legendY = GALLERY_HEIGHT - 260;
    const itemWidth = 140;
    const legendColumns = Math.max(1, Math.floor((this.scale.width - 64) / itemWidth));
    const legendWidth = Math.min(EFFECTS.length, legendColumns) * itemWidth;
    const legendStart = Math.floor((this.scale.width - legendWidth) / 2) + itemWidth / 2;
    this.add.text(this.scale.width / 2, legendY - 40, "EDGE EFFECTS", this.textStyle(17, "#39ff14", true)).setOrigin(0.5);
    EFFECTS.forEach(({ effect, label }, index) => {
      drawEffectBadge(this, effect, 30).setPosition(legendStart + (index % legendColumns) * itemWidth, legendY + Math.floor(index / legendColumns) * 70)
        .setSize(40, 40).setInteractive().on("pointerover", () => detail.setText(EFFECT_HELP[effect]));
      this.add.text(legendStart + (index % legendColumns) * itemWidth, legendY + Math.floor(index / legendColumns) * 70 + 24, label, this.textStyle(11, "#f2fff7", true)).setOrigin(0.5, 0);
    });
  }

  private textStyle(size: number, color: string, _bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return pixelTextStyle(size, color === "#39ff14" ? "#eed49b" : color);
  }
}
