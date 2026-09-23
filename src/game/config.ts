import Phaser from "phaser";
import { FoundationScene } from "./scenes/FoundationScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 900,
  height: 800,
  backgroundColor: "#00233a",
  scene: [FoundationScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};
