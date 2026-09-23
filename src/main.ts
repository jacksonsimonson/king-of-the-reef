import Phaser from "phaser";
import "./styles/main.css";
import { createGameConfig, type GameView } from "./game/config";

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");
const menuView = document.querySelector<HTMLElement>("#menu");
let activeGame: Phaser.Game | undefined;
let activeView: GameView | "menu" | undefined;

function syncView(): void {
  const nextView: GameView | "menu" = window.location.hash === "#gallery"
    ? "gallery"
    : window.location.hash === "#quick-match"
      ? "play"
      : "menu";
  const showGallery = nextView === "gallery";
  const showPlay = nextView === "play";
  if (menuView) menuView.hidden = nextView !== "menu";
  if (playView) playView.hidden = !showPlay;
  if (galleryView) galleryView.hidden = !showGallery;
  if (activeView === nextView) return;
  activeGame?.destroy(true);
  activeGame = undefined;
  if (nextView !== "menu") {
    document.querySelector(showGallery ? "#gallery-game" : "#game")?.replaceChildren();
    activeGame = new Phaser.Game(createGameConfig(nextView));
  }
  activeView = nextView;
}

window.addEventListener("hashchange", syncView);
syncView();
