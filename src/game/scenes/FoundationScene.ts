import Phaser from "phaser";

const BOARD_SIZE = 5;
const CELL_SIZE = 104;
const GAP = 8;
const REEFS = new Set(["0,2", "2,1", "3,3"]);

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
        color: "#271b18",
        fontFamily: "monospace",
        fontSize: "24px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        const x = originX + column * (CELL_SIZE + GAP);
        const y = originY + row * (CELL_SIZE + GAP);
        const isReef = REEFS.has(`${row},${column}`);

        this.add
          .rectangle(
            x + CELL_SIZE / 2,
            y + CELL_SIZE / 2,
            CELL_SIZE,
            CELL_SIZE,
            isReef ? 0xd52b2f : 0xfff4b3,
          )
          .setStrokeStyle(4, 0x271b18);

        if (isReef) {
          this.add
            .text(x + CELL_SIZE / 2, y + CELL_SIZE / 2, "REEF", {
              color: "#fff8dc",
              fontFamily: "monospace",
              fontSize: "18px",
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
          color: "#271b18",
          fontFamily: "monospace",
          fontSize: "18px",
        },
      )
      .setOrigin(0.5);
  }
}
