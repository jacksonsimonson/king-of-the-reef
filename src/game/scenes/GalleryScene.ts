import Phaser from "phaser";
import { STARTERS, type EdgeEffect, type FishCard } from "../data/starterFish";
import { drawEffectBadge, drawFishCard } from "../ui/drawFishCard";
import { pixelTextStyle, pixelPanel } from "../ui/pixelTheme";
import { cardDescription, EFFECT_HELP } from "../ui/cardVisuals";
import { reefRarity } from "../data/reefPool";

const CARD_SIZE = 144;
const COLUMN_GAP = 24;
const ROW_GAP = 104;
const COLUMNS = 8;
const START_Y = 164;
export const GALLERY_HEIGHT = START_Y + Math.ceil(STARTERS.length / COLUMNS) * (CARD_SIZE + ROW_GAP) + 180;
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
];

export class GalleryScene extends Phaser.Scene {
  constructor() { super("gallery"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of STARTERS) {
      this.load.image(fish.texture, `${base}assets/fish/${fish.texture}.png`);
    }
  }

  create(): void {
    this.add.existing(pixelPanel(this, this.scale.width / 2, 48, this.scale.width - 32, 80));
    const cards = this.add.container(0, 0);
    this.add.text(32, 26, "FISH GALLERY", this.textStyle(26, "#39ff14", true));
    this.add.text(32, 62, `${STARTERS.length} creatures · Hover cards or edge icons for their rules.`, this.textStyle(15, "#b8ffd0"));
    const detail = this.add.text(32, GALLERY_HEIGHT - 92, "Revelation cards have an eye-patterned background.", this.textStyle(16, "#b8d7dc")).setWordWrapWidth(this.scale.width - 64);

    STARTERS.forEach((definition, index) => {
      const row = Math.floor(index / COLUMNS);
      const rowStart = row * COLUMNS;
      const rowCards = Math.min(COLUMNS, STARTERS.length - rowStart);
      const rowWidth = rowCards * CARD_SIZE + (rowCards - 1) * COLUMN_GAP;
      const startX = Math.floor((this.scale.width - rowWidth) / 2) + CARD_SIZE / 2;
      const column = index % COLUMNS;
      const x = startX + column * (CARD_SIZE + COLUMN_GAP);
      const y = START_Y + row * (CARD_SIZE + ROW_GAP);
      const fish: FishCard = { ...definition, id: `gallery-${definition.id}`, owner: "player", condition: "healthy" };
      drawFishCard({ scene: this, container: cards, fish, x, y, size: CARD_SIZE })
        .setInteractive().on("pointerover", () => detail.setText(cardDescription(fish)));
      this.add.text(x, y + CARD_SIZE / 2 + 18, fish.name, this.textStyle(14, "#f2fff7", true))
        .setWordWrapWidth(160).setAlign("center").setOrigin(0.5, 0);
      this.add.text(x, y + CARD_SIZE / 2 + 62, reefRarity(fish.texture) ?? "Other Waters", this.textStyle(8, "#b8d7dc")).setOrigin(0.5, 0);
    });

    const legendY = GALLERY_HEIGHT - 170;
    const itemWidth = 140;
    const legendWidth = EFFECTS.length * itemWidth;
    const legendStart = Math.floor((this.scale.width - legendWidth) / 2) + itemWidth / 2;
    this.add.text(this.scale.width / 2, legendY - 40, "EDGE EFFECTS", this.textStyle(17, "#39ff14", true)).setOrigin(0.5);
    EFFECTS.forEach(({ effect, label }, index) => {
      drawEffectBadge(this, effect, 30).setPosition(legendStart + index * itemWidth, legendY)
        .setSize(40, 40).setInteractive().on("pointerover", () => detail.setText(EFFECT_HELP[effect]));
      this.add.text(legendStart + index * itemWidth, legendY + 24, label, this.textStyle(11, "#f2fff7", true)).setOrigin(0.5, 0);
    });
  }

  private textStyle(size: number, color: string, _bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return pixelTextStyle(size, color === "#39ff14" ? "#eed49b" : color);
  }
}
