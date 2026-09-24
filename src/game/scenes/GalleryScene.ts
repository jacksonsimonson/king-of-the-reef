import Phaser from "phaser";
import { STARTERS, type EdgeEffect, type FishCard } from "../data/starterFish";
import { drawEffectBadge, drawFishCard } from "../ui/drawFishCard";
import { pixelTextStyle, pixelPanel } from "../ui/pixelTheme";

const CARD_SIZE = 144;
const COLUMN_GAP = 24;
const ROW_GAP = 56;
const COLUMNS = 8;
const START_Y = 164;
const EFFECTS: Array<{ effect: EdgeEffect; label: string }> = [
  { effect: "standard", label: "STANDARD" },
  { effect: "double", label: "DOUBLE" },
  { effect: "weak", label: "SHIELD" },
  { effect: "bigger-fish", label: "BIGGER FISH" },
  { effect: "swap", label: "SWAP" },
  { effect: "hook", label: "HOOK" },
  { effect: "wave", label: "WAVE" },
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
    this.add.text(32, 62, "Cards appear in creation order.", this.textStyle(15, "#b8ffd0"));

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
      drawFishCard({ scene: this, container: cards, fish, x, y, size: CARD_SIZE });
      this.add.text(x, y + CARD_SIZE / 2 + 18, fish.name, this.textStyle(14, "#f2fff7", true))
        .setOrigin(0.5, 0);
    });

    const legendY = 526;
    const itemWidth = 170;
    const legendWidth = EFFECTS.length * itemWidth;
    const legendStart = Math.floor((this.scale.width - legendWidth) / 2) + itemWidth / 2;
    this.add.text(this.scale.width / 2, 486, "EDGE EFFECTS", this.textStyle(17, "#39ff14", true)).setOrigin(0.5);
    EFFECTS.forEach(({ effect, label }, index) => {
      drawEffectBadge(this, effect, 30).setPosition(legendStart + index * itemWidth, legendY);
      this.add.text(legendStart + index * itemWidth, legendY + 24, label, this.textStyle(11, "#f2fff7", true)).setOrigin(0.5, 0);
    });
  }

  private textStyle(size: number, color: string, _bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return pixelTextStyle(size, color === "#39ff14" ? "#eed49b" : color);
  }
}
