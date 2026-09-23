import Phaser from "phaser";
import "./styles/main.css";
import { createGameConfig, type GameView } from "./game/config";
import { VoyageView, currentRun, persistRun } from "./game/run/view";
import { activeNode, battleResult } from "./game/run/state";
import { random, REGIONS } from "./game/run/maps";
import { STARTERS, type FishCard } from "./game/data/starterFish";

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");
const menuView = document.querySelector<HTMLElement>("#menu");
let activeGame: Phaser.Game | undefined;
let voyage: VoyageView | undefined;
let activeView: GameView | "menu" | "voyage" | "voyage-battle" | undefined;
const voyageRoot = document.querySelector<HTMLElement>("#voyage")!;

function syncView(): void {
  let nextView: GameView | "menu" | "voyage" | "voyage-battle" = window.location.hash === "#voyage"
    ? "voyage"
    : window.location.hash === "#voyage-battle"
      ? "voyage-battle"
      : window.location.hash === "#gallery"
    ? "gallery"
    : window.location.hash === "#quick-match"
      ? "play"
      : "menu";
  const run = currentRun();
  if (nextView === "voyage-battle" && (!run || run.status !== "active" || !run.pending || !["battle", "boss"].includes(activeNode(run).type))) {
    window.location.replace("#voyage"); nextView = "voyage";
  }
  const showGallery = nextView === "gallery";
  const showPlay = nextView === "play" || nextView === "voyage-battle";
  if (menuView) menuView.hidden = nextView !== "menu";
  if (playView) playView.hidden = !showPlay;
  if (galleryView) galleryView.hidden = !showGallery;
  voyageRoot.hidden = nextView !== "voyage";
  if (activeView === nextView) return;
  activeGame?.destroy(true);
  activeGame = undefined;
  voyage?.destroy(); voyage = undefined;
  if (nextView === "voyage") voyage = new VoyageView(voyageRoot);
  else if (nextView !== "menu") {
    document.querySelector(showGallery ? "#gallery-game" : "#game")?.replaceChildren();
    const battle = nextView === "voyage-battle" && run;
    const heading = playView?.querySelector(".view-title");
    const back = playView?.querySelector<HTMLAnchorElement>(".nav-link");
    if (heading) heading.textContent = battle ? `${REGIONS[run.region].name} · ${activeNode(run).type === "boss" ? REGIONS[run.region].boss : "Battle"}` : "Quick Match";
    if (back) { back.href = battle ? "#voyage" : "#menu"; back.textContent = battle ? "Voyage Map" : "Main Menu"; }
    const config = createGameConfig(showGallery ? "gallery" : "play");
    if (battle) {
      const pool = REGIONS[run.region].pool;
      const rng = random(`${run.seed}:${run.pending}:rival`);
      const rivalDeck: FishCard[] = Array.from({ length: 10 }, (_, i) => {
        const texture = activeNode(run).type === "boss" && i < 5
          ? ["octopus", "swordfish", "hypno-squid"][run.region]
          : pool[Math.floor(rng() * pool.length)];
        return { ...STARTERS.find((fish) => fish.texture === texture)!, id: `rival-${i}`, owner: "rival", condition: "healthy" };
      });
      config.callbacks = { preBoot: (game) => {
        game.registry.set("voyageBattle", {
          playerDeck: run.school, rivalDeck,
          rng: random(`${run.seed}:${run.pending}:deal`),
          onResult: (player: number, rival: number) => {
            battleResult(run, player, rival); persistRun(run);
          },
          onComplete: () => { window.location.hash = "#voyage"; },
        });
      } };
    }
    activeGame = new Phaser.Game(config);
  }
  activeView = nextView;
}

window.addEventListener("hashchange", syncView);
syncView();
