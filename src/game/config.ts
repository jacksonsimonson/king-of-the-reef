import Phaser from "phaser";
import { FoundationScene } from "./scenes/FoundationScene";
import { GalleryScene } from "./scenes/GalleryScene";

export type GameView = "play" | "gallery";

export function createGameConfig(view: GameView): Phaser.Types.Core.GameConfig {
  const gallery = view === "gallery";
  return {
  type: Phaser.AUTO,
  parent: gallery ? "gallery-game" : "game",
  width: gallery ? 1360 : 900,
  height: gallery ? 360 : 820,
  backgroundColor: "#00233a",
  scene: gallery ? [GalleryScene] : [FoundationScene],
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
}
