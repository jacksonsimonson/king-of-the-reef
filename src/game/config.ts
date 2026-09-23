import Phaser from "phaser";
import { FoundationScene } from "./scenes/FoundationScene";
import { GalleryScene } from "./scenes/GalleryScene";

export type GameView = "play" | "gallery";

export function createGameConfig(view: GameView): Phaser.Types.Core.GameConfig {
  const gallery = view === "gallery";
  const parent = document.querySelector(gallery ? "#gallery-game" : "#game");
  const canvasWidth = Math.max(gallery ? 1360 : 2000, Math.floor(parent?.clientWidth ?? window.innerWidth - 64));
  const playHeight = Math.max(820, window.innerHeight - 145);
  return {
  type: Phaser.AUTO,
  parent: gallery ? "gallery-game" : "game",
  width: canvasWidth,
  height: gallery ? 600 : playHeight,
  backgroundColor: "#00233a",
  scene: gallery ? [GalleryScene] : [FoundationScene],
  scale: {
    mode: Phaser.Scale.NONE,
    // CSS centers canvases that fit; oversized native canvases scroll from the left edge.
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  };
}
