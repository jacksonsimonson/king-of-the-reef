import Phaser from "phaser";

const BOARD_SIZE = 5;
const CELL_SIZE = 104;
const GAP = 8;
const PEARL_REEFS = new Set(["0,2", "2,1", "3,3"]);

export class FoundationScene extends Phaser.Scene {
  constructor() {
    super("foundation");
  }

  create(): void {
    const boardPixels = BOARD_SIZE * CELL_SIZE + (BOARD_SIZE - 1) * GAP;
    const originX = (this.scale.width - boardPixels) / 2;
    const originY = 92;

    this.add
      .text(this.scale.width / 2, 42, "5 × 5 TIDAL BOARD", {
        color: "#8bf0c8",
        fontFamily: "monospace",
        fontSize: "24px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        const x = originX + column * (CELL_SIZE + GAP);
        const y = originY + row * (CELL_SIZE + GAP);
        const isPearlReef = PEARL_REEFS.has(`${row},${column}`);

        this.add
          .rectangle(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2,
            CELL_SIZE,
            CELL_SIZE,
            0x103b4b,
          )
          .setStrokeStyle(4, isPearlReef ? 0xff64ae : 0x78e6bd);

        if (isPearlReef) {
          this.add
            .circle(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 6, 28, 0xff64ae)
            .setStrokeStyle(4, 0xffc3e1);
          this.add.circle(
            x + CELL_SIZE / 2 - 9,
            y + CELL_SIZE / 2 - 15,
            7,
            0xfff5fb,
            0.9,
          );
          this.add
            .text(x + CELL_SIZE / 2, y + CELL_SIZE - 13, "PEARL", {
              color: "#ffc3e1",
              fontFamily: "monospace",
              fontSize: "14px",
              fontStyle: "bold",
            })
            .setOrigin(0.5);
        }
      }
    }

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 38,
        "Board foundation ready — cards arrive next",
        {
          color: "#8bf0c8",
          fontFamily: "monospace",
          fontSize: "18px",
        },
      )
      .setOrigin(0.5);
  }
}
