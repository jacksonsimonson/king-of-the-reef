import { settleBattleWithSummary } from './game/run/battleSummary';
import type { TideScore } from './game/twoTide';
import Phaser from "phaser";
import { mountAudioControls, reefAudio } from "./game/audio/audio";
import "./styles/main.css";
import { createGameConfig, type GameView } from "./game/config";
import { VoyageView, currentRun, persistRun } from "./game/run/view";
import { activeNode, consumeCharm, rivalDeckFor } from "./game/run/state";
import type { CharmId } from "./game/data/tideCharms";
import { random, REGIONS } from "./game/run/maps";
import { drawSeascape } from "./game/run/art";
import { regionalRules } from './game/battleRules';
import { quickMatchSetup, type QuickMatchSettings } from './game/ui/quickMatchSetup';
import { voyageMatchFormat } from './game/run/battleSave';
import { openTutorial } from './game/ui/tutorial';

const playView = document.querySelector<HTMLElement>("#play");
const galleryView = document.querySelector<HTMLElement>("#gallery");
const menuView = document.querySelector<HTMLElement>("#menu");
let activeGame: Phaser.Game | undefined;
let voyage: VoyageView | undefined;
let quickRules: QuickMatchSettings | undefined;
let previousQuickRules: QuickMatchSettings | undefined;
let quickDialog: HTMLDialogElement | undefined;
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
  if (nextView !== 'play') { quickRules = undefined; quickDialog?.remove(); quickDialog = undefined; }
  if (nextView === 'play' && activeView !== 'play' && !quickRules) {
    if (!quickDialog) quickDialog = quickMatchSetup(previousQuickRules, rules => {
      quickRules = rules; previousQuickRules = rules; quickDialog = undefined; syncView();
    }, () => { quickDialog = undefined; window.location.hash = '#menu'; });
    return;
  }
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
    const rules = battle ? (run.battle?.rules ?? (run.battle ? {...regionalRules(run.region, `${run.seed}:${run.pending}`), size: 5 as const, plays: 5 as const, legacyTerrain: true} : regionalRules(run.region, `${run.seed}:${run.pending}`))) : quickRules ?? regionalRules(0, 'gallery');
    const config = createGameConfig(showGallery ? nextView as "gallery" | "gallery-roster" : "play", rules.size);
    if (!showGallery) {
      reefAudio.setTrack(`battle-${['shoreline','ocean','bermuda'].indexOf(rules.region) as 0 | 1 | 2}`);
      if (playView) playView.dataset.region = rules.region;
    }
    config.callbacks = {preBoot: game => { game.registry.set('battleRules', rules); game.registry.set('matchFormat', quickRules?.format); }};
    if (battle) {
      const rivalDeck = rivalDeckFor(run);
      config.callbacks = { preBoot: (game) => {
        game.registry.set('battleRules', rules);
        game.registry.set('matchFormat', voyageMatchFormat(run.battle));
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
          onResult: (_player: number, _rival: number, killedIds: string[], spentCharms: CharmId[], scores: TideScore[]) => {
            const summary = settleBattleWithSummary(run, scores, killedIds, spentCharms); persistRun(run); return summary;
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
  document.querySelector<HTMLButtonElement>('#tutorial-button')!.onclick = openTutorial;
  const setup = document.createElement('button'); setup.className = 'voyage-button'; setup.textContent = 'Quick Match Setup';
  setup.onclick = () => { activeGame?.scene.pause('foundation'); activeView = undefined; quickRules = undefined; syncView(); };
  playView?.querySelector('nav')?.append(setup);
  const showSetup = () => { setup.hidden = window.location.hash !== '#quick-match'; };
  window.addEventListener('hashchange', showSetup); showSetup();
  await document.fonts.load('16px "Reef Pixel"');
  window.addEventListener("hashchange", syncView);
  window.addEventListener("resize", () => { if (activeView === "menu") drawMenu(); });
  syncView();
}
void boot();
