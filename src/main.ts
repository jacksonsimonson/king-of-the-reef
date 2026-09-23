import Phaser from "phaser";
import "./styles/main.css";
import { gameConfig } from "./game/config";

new Phaser.Game(gameConfig);

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");

function syncView(): void {
  const showGallery = window.location.hash === "#gallery";
  if (playView) playView.hidden = showGallery;
  if (galleryView) galleryView.hidden = !showGallery;
}

window.addEventListener("hashchange", syncView);
syncView();
