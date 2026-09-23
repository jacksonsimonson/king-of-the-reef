import Phaser from "phaser";
import { STARTERS, type FishCard } from "../data/starterFish";
import { drawFishCard } from "../ui/drawFishCard";

const CARD_SIZE = 144;
const COLUMN_GAP = 24;
const ROW_GAP = 56;
const COLUMNS = 8;
const START_X = 84;
const START_Y = 164;

export class GalleryScene extends Phaser.Scene {
  constructor() { super("gallery"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of STARTERS) {
      this.load.image(fish.texture, `${base}assets/fish/${fish.texture}.png`);
    }
  }

  create(): void {
    const cards = this.add.container(0, 0);
    this.add.text(32, 26, "FISH GALLERY", this.textStyle(26, "#39ff14", true));
    this.add.text(32, 62, "Cards appear in creation order.", this.textStyle(15, "#b8ffd0"));

    STARTERS.forEach((definition, index) => {
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const x = START_X + column * (CARD_SIZE + COLUMN_GAP);
      const y = START_Y + row * (CARD_SIZE + ROW_GAP);
      const fish: FishCard = { ...definition, id: `gallery-${definition.id}`, owner: "player" };
      drawFishCard({ scene: this, container: cards, fish, x, y, size: CARD_SIZE });
      this.add.text(x, y + CARD_SIZE / 2 + 18, fish.name, this.textStyle(14, "#f2fff7", true))
        .setOrigin(0.5, 0);
    });
  }

  private textStyle(size: number, color: string, bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return { color, fontFamily: "monospace", fontSize: `${size}px`, fontStyle: bold ? "bold" : "normal" };
  }
}
