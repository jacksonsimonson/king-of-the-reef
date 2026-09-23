import Phaser from "phaser";
import { FoundationScene } from "./scenes/FoundationScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 720,
  height: 720,
  backgroundColor: "#071f2d",
  scene: [FoundationScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
  },
};
