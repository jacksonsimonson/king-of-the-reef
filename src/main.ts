import Phaser from "phaser";
import "./styles/main.css";
import { createGameConfig, type GameView } from "./game/config";

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");
let activeGame: Phaser.Game | undefined;
let activeView: GameView | undefined;

function syncView(): void {
  const nextView: GameView = window.location.hash === "#gallery" ? "gallery" : "play";
  const showGallery = nextView === "gallery";
  if (playView) playView.hidden = showGallery;
  if (galleryView) galleryView.hidden = !showGallery;
  if (activeView === nextView) return;
  activeGame?.destroy(true);
  document.querySelector(showGallery ? "#gallery-game" : "#game")?.replaceChildren();
  activeGame = new Phaser.Game(createGameConfig(nextView));
  activeView = nextView;
}

window.addEventListener("hashchange", syncView);
syncView();
