import Phaser from "phaser";
import { mountAudioControls, reefAudio } from "./game/audio/audio";
import "./styles/main.css";
import { createGameConfig, type GameView } from "./game/config";
import { VoyageView, currentRun, persistRun } from "./game/run/view";
import { activeNode, battleResult, consumeCharm, rivalDeckFor } from "./game/run/state";
import type { CharmId } from "./game/data/tideCharms";
import { random, REGIONS } from "./game/run/maps";
import { drawSeascape } from "./game/run/art";

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");
const menuView = document.querySelector<HTMLElement>("#menu");
let activeGame: Phaser.Game | undefined;
let voyage: VoyageView | undefined;
let activeView: GameView | "menu" | "voyage" | "voyage-battle" | undefined;
const voyageRoot = document.querySelector<HTMLElement>("#voyage")!;

function drawMenu(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#menu-scenery")!;
  canvas.width = menuView!.clientWidth; canvas.height = menuView!.clientHeight;
  drawSeascape(canvas, "shoreline", "REEF-TITLE");
}

function syncView(): void {
  let nextView: GameView | "menu" | "voyage" | "voyage-battle" = window.location.hash === "#voyage"
    ? "voyage"
    : window.location.hash === "#voyage-battle"
      ? "voyage-battle"
      : window.location.hash === "#gallery-roster"
        ? "gallery-roster"
        : window.location.hash === "#gallery"
          ? "gallery"
    : window.location.hash === "#quick-match"
      ? "play"
      : "menu";
  const run = currentRun();
  if (nextView === "voyage-battle" && (!run || run.status !== "active" || !run.pending || !["battle", "boss"].includes(activeNode(run).type))) {
    window.location.replace("#voyage"); nextView = "voyage";
  }
  const showGallery = nextView === "gallery" || nextView === "gallery-roster";
  const showPlay = nextView === "play" || nextView === "voyage-battle";
  if (menuView) menuView.hidden = nextView !== "menu";
  if (nextView === "menu") drawMenu();
  if (playView) playView.hidden = !showPlay;
  if (galleryView) galleryView.hidden = !showGallery;
  voyageRoot.hidden = nextView !== "voyage";
  if (activeView === nextView) return;
  reefAudio.setTrack(showPlay ? `battle-${nextView === "voyage-battle" && run ? run.region as 0 | 1 | 2 : 0}` : `map-${nextView === "voyage" && run ? run.region as 0 | 1 | 2 : 0}`);
  activeGame?.destroy(true);
  activeGame = undefined;
  voyage?.destroy(); voyage = undefined;
  if (nextView === "voyage") voyage = new VoyageView(voyageRoot);
  else if (nextView !== "menu") {
    document.querySelector(showGallery ? "#gallery-game" : "#game")?.replaceChildren();
    const battle = nextView === "voyage-battle" && run;
    if (playView) playView.dataset.region = battle ? REGIONS[run.region].id : "shoreline";
    const heading = playView?.querySelector(".view-title");
    const back = playView?.querySelector<HTMLAnchorElement>(".nav-link");
    if (heading) heading.textContent = battle ? `${REGIONS[run.region].name} · ${activeNode(run).type === "boss" ? REGIONS[run.region].boss : "Battle"}` : "Quick Match";
    if (back) { back.href = battle ? "#voyage" : "#menu"; back.textContent = battle ? "Voyage Map" : "Main Menu"; }
    const config = createGameConfig(showGallery ? nextView as "gallery" | "gallery-roster" : "play");
    if (battle) {
      const rivalDeck = rivalDeckFor(run);
      config.callbacks = { preBoot: (game) => {
        game.registry.set("voyageBattle", {
          nodeId: run.pending!, checkpoint: run.battle,
          onCheckpoint: (checkpoint: import("./game/run/battleSave").BattleSave) => { run.battle = checkpoint; return persistRun(run); },
          playerDeck: run.school, rivalDeck,
          charms: run.charms,
          onUseCharm: (id: CharmId) => {
            if (!consumeCharm(run, id)) return false;
            return true; // The next stable checkpoint saves the spent charm and its effect together.
          },
          region: REGIONS[run.region].id, seed: run.seed,
          rng: random(`${run.seed}:${run.pending}:deal`),
          onResult: (player: number, rival: number, killedIds: string[]) => {
            battleResult(run, player, rival, killedIds); persistRun(run);
          },
          onComplete: () => { window.location.hash = "#voyage"; },
        });
      } };
    }
    activeGame = new Phaser.Game(config);
  }
  activeView = nextView;
}

// Canvas text must wait for the local typeface rather than caching a fallback.
async function boot(): Promise<void> {
  mountAudioControls();
  await document.fonts.load('16px "Reef Pixel"');
  window.addEventListener("hashchange", syncView);
  window.addEventListener("resize", () => { if (activeView === "menu") drawMenu(); });
  syncView();
}
void boot();
