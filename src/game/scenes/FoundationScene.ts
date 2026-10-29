import {abilityDialog} from '../ui/abilityDialog';
import {placementOptions} from '../abilityOptions.ts';
import {abilityHandSteps,automatedHandChoice} from '../abilityHands.ts';
import {freshAbilityMemory,beginAbilityTurn,readyGrowth,growArm,blankSides,type AbilityChoice} from '../battleAbilityState.ts';
import type { BattleSummary } from '../run/battleSummary';
import { showBattleSummary } from '../ui/battleSummary';
import { reefAudio } from "../audio/audio.ts";
import { combatCue } from "../audio/cues.ts";
import type { BattleSave, BattleOpening } from "../run/battleSave.ts";
import { regionalRules, scoringReefs, type BattleRules } from '../battleRules.ts';
import { chooseRivalMove } from '../rivalAI.ts';
import { combinedScore, matchCharmSpending, freshTide, tidePlayLimit, type TideScore } from '../twoTide.ts';
import { random, REGIONS } from '../run/maps.ts';
import { describeFrame, tileName, type CombatFrame } from "../combatFeedback";
import { ABILITIES, canPlaceFish, scoreBoard } from "../abilities";
import Phaser from "phaser";
import { battleTerrain, terrainForRules, placementCard, placementDestination, terrainLegend, TERRAIN_INFO } from "../terrain";
import { STARTERS, type FishCard } from "../data/starterFish";
import { createEnabledDeck } from "../data/roster";
import { drawFishCard } from "../ui/drawFishCard";
import { drawSeascape } from "../run/art";
import type { RegionId } from "../run/maps";
import { resolvePlacement, revealCard, revealTargets, type HandSlot } from "../combat";
import { cardDescription } from "../ui/cardVisuals";
import { pixelTextStyle, pixelPanel, pixelPearl } from "../ui/pixelTheme";
import { CHARMS, CHARM_CAPACITY, availableCharms, randomCharms, charmCanvas, charmCard, canCharmCard, canDrift, exchangeReserve, refillSlot, shuffleHand, canPlayFish, type CharmId } from "../data/tideCharms";
import { triggersRally, resolveRally, rivalRallyChoice } from "../rally";

const COLORS = { deep: 0x00233a, water: 0x063d58, hover: 0x0b5267, green: 0x39ff14, pink: 0xff5ca8 };

const CELL = 96;
const GAP = 6;
const HAND_SIZE = 5;
const HAND_CARD_SIZE = 144;
const BOARD_CARD_SIZE = 88;

interface VoyageBattle {
  playerDeck: FishCard[]; rivalDeck: FishCard[]; rng: () => number;
  region: RegionId; seed: string;
  charms: CharmId[];
  checkpoint?: BattleSave;
  nodeId: string;
  onCheckpoint: (save: BattleSave) => boolean;
  onUseCharm: (id: CharmId) => boolean;
  onResult: (player: number, rival: number, killedIds: string[], spentCharms: CharmId[], scores: TideScore[]) => BattleSummary | void;
  onComplete: () => void;
}

export class FoundationScene extends Phaser.Scene {
  private abilityMemory=freshAbilityMemory();
  private abilityDialog?: HTMLDialogElement;
  private get abilityState(){return {board:this.board,shocked:this.shocked,terrain:this.terrain,memory:this.abilityMemory};}
  private async chooseAbility(title:string,options:string[],cancel=false,details?:string[]):Promise<number>{
    const prompt=abilityDialog(title,options,cancel,details);this.abilityDialog=prompt.element;
    const result=await prompt.result;this.abilityDialog=undefined;return result;
  }
  private async beginAbilityTurn():Promise<void>{
    this.resolving=true;this.abilityMemory=beginAbilityTurn(this.abilityState,this.turn);
    for(const fish of readyGrowth(this.abilityState,this.turn)){
      const sides=blankSides(fish);let pick=0;
      if(this.turn==='player'&&sides.length){this.render('Spreading Arms · choose a new side.');pick=await this.chooseAbility(fish.name+' · Spreading Arms',['Skip growth',...sides.map(d=>'Grow Standard on '+d)]);}
      else if(sides.length)pick=1;
      if(!this.sys.isActive())return;
      const next=growArm(this.abilityState,fish.id,pick>0?sides[pick-1]:undefined);this.board=next.board;this.abilityMemory=next.memory!;
    }
    this.resolving=false;
  }
  private async finishAbilityDraw(card:FishCard,slot:HandSlot):Promise<void>{
    this.resolving=true;
    const steps=abilityHandSteps({hands:{player:this.playerHand,rival:this.rivalHand},decks:{player:this.playerDeck,rival:this.rivalDeck},memory:this.abilityMemory},card,slot);
    let step=steps.next();while(!step.done){
      const request=step.value;
      const picked=card.owner==='player'?await this.chooseAbility(request.title,request.options,false,request.details):automatedHandChoice(request);
      if(!this.sys.isActive())return;step=steps.next(Math.max(0,picked));
    }
    if(card.ability==='sonar'){const deck=card.owner==='player'?this.rivalDeck:this.playerDeck;this.logCombat('Sonar · next reserve in order: '+deck.slice(0,2).filter(c=>c.known).map(c=>c.name).join(', '));}
    this.resolving=false;
  }
  private summary?: BattleSummary;
  private summaryDialog?: HTMLDialogElement;
  private openSummary(): void { if (this.summary) { this.summaryDialog?.remove(); this.summaryDialog = showBattleSummary(this.summary, () => this.resultAction()); } }
  private twoTide = false;
  private tideScores: TideScore[] = [];
  private opening?: BattleOpening;
  private matchKilled = new Set<string>();
  private spentCharms: CharmId[] = [];
  private tideSeed = '';
  private tideRandom?: () => number;
  private get playLimit(): number { return this.twoTide ? tidePlayLimit(this.rules.region) : this.rules.plays; }
  private get intermission(): boolean { return this.twoTide && this.finished && this.tideScores.length === 1; }
  private board: Array<FishCard | null> = [];
  private terrain = battleTerrain();
  private rules: BattleRules = regionalRules(0, 'quick');
  private playerHand: HandSlot[] = [];
  private rivalHand: HandSlot[] = [];
  private playerDeck: FishCard[] = [];
  private rivalDeck: FishCard[] = [];
  private selectedId: string | null = null;
  private controls?: HTMLDetailsElement;
  private targetIndex = 0;
  private turn: "player" | "rival" = "player";
  private finished = false;
  private ui?: Phaser.GameObjects.Container;
  private placementPreview?: Phaser.GameObjects.Container;
  private previewIndex: number | null = null;
  private voyageBattle?: VoyageBattle;
  private killedIds = new Set<string>();
  private shocked = new Set<string>();
  private pendingReveal: "card" | "charm" | null = null;
  private pendingRally: HandSlot | null = null;
  private charms: CharmId[] = [];
  private pendingDraft = false;
  private pendingDrift = false;
  private driftFrom: number | null = null;
  private resolving = false;
  private motionReduced = false;
  private feedbackPanel?: HTMLElement;
  private feedbackLog?: HTMLOListElement;
  private boardDrawings = new Map<string, Phaser.GameObjects.Container>();
  private plays = { player: 0, rival: 0 };
  private waterColor = COLORS.water;
  private borderColor = COLORS.green;
  private rngCalls = 0;
  private saveStatus?: HTMLElement;

  constructor() { super("foundation"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of STARTERS) {
      this.load.image(fish.texture, `${base}assets/fish/${fish.texture}.png`);
    }
  }

  create(): void {
    this.input.dragDistanceThreshold = 6;
    this.voyageBattle = this.registry.get("voyageBattle") as VoyageBattle | undefined;
    this.rules = this.registry.get('battleRules') ?? this.rules;
    this.twoTide = this.registry.get('matchFormat') === 'two-tide';
    {
      const canvas = document.createElement("canvas");
      canvas.width = this.scale.width; canvas.height = this.scale.height;
      drawSeascape(canvas, this.rules.region, this.rules.seed);
      this.textures.addCanvas("battle-seascape", canvas);
      const palette = { shoreline: [0x164d59, 0x73cbb1], ocean: [0x112f49, 0x80b9d2], bermuda: [0x302343, 0xa385c6] }[this.rules.region];
      [this.waterColor, this.borderColor] = palette;
    }
    this.terrain = terrainForRules(this.rules);
    this.motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.feedbackPanel = document.createElement("section"); this.feedbackPanel.className = "combat-feedback";
    const toggle = document.createElement("button"); toggle.className = "voyage-button";
    const setLabel = () => { toggle.textContent = this.motionReduced ? "Motion: Reduced" : "Motion: Animated"; toggle.setAttribute("aria-pressed", String(this.motionReduced)); };
    setLabel(); toggle.onclick = () => { this.motionReduced = !this.motionReduced; setLabel(); };
    const details = document.createElement("details"); details.open = true;
    const summary = document.createElement("summary"); summary.textContent = "Combat log · latest 40 events";
    this.feedbackLog = document.createElement("ol"); this.feedbackLog.setAttribute("aria-label", "Combat log");
    details.append(summary, this.feedbackLog); this.feedbackPanel.append(toggle, details);
    if (this.voyageBattle) {
      this.saveStatus = document.createElement("p"); this.saveStatus.setAttribute("role", "status");
      this.feedbackPanel.prepend(this.saveStatus);
    }
    document.querySelector("#game")?.after(this.feedbackPanel);
    this.controls = document.createElement('details'); this.controls.className = 'battle-controls'; this.controls.setAttribute('aria-label', 'Battle controls');
    document.querySelector('#game')?.before(this.controls);
    const cleanup = () => { this.abilityDialog?.close(); this.controls?.remove(); this.summaryDialog?.remove(); };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup); this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.feedbackPanel?.remove(); });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => { this.feedbackPanel?.remove(); });
    if (this.voyageBattle?.checkpoint) this.restoreBattle(this.voyageBattle.checkpoint);
    else this.resetMatch();
  }

  private random(): number { this.rngCalls++; return this.tideRandom?.() ?? this.voyageBattle?.rng() ?? Math.random(); }

  private restoreBattle(saved: BattleSave): void {
    const s = structuredClone(saved);
    this.abilityMemory=s.memory??freshAbilityMemory();
    this.board = s.board; this.playerHand = s.playerHand; this.rivalHand = s.rivalHand;
    this.playerDeck = s.playerDeck; this.rivalDeck = s.rivalDeck; this.plays = s.plays;
    this.shocked = new Set(s.shocked); this.killedIds = new Set(s.killedIds); this.turn = s.turn;
    this.pendingReveal = s.pendingReveal; this.pendingRally = s.rallySlot === null ? null : this.playerHand[s.rallySlot];
    this.charms = this.voyageBattle!.charms;
    if (s.twoTide) {
      this.opening = s.twoTide.opening; this.tideScores = s.twoTide.scores;
      this.tideSeed = s.twoTide.seed; this.tideRandom = random(this.tideSeed + ':actions');
      this.charms = s.twoTide.charms; this.spentCharms = s.twoTide.spentCharms;
      this.matchKilled = new Set(s.twoTide.killedIds); this.finished = s.twoTide.intermission;
    }
    for (let i = 0; i < s.rngCalls; i++) this.random();
    this.logCombat("Battle resumed from the last saved decision.");
    this.render(this.intermission ? 'Tide 1 complete. Next tide restores resources; rival starts.' : this.pendingRally ? "Rally — choose your next draw." : this.pendingReveal ? "Revelation — reveal a rival card." : this.turn === "rival" ? "Battle resumed. The rival is choosing…" : "Battle resumed. Your turn.");
    if (!this.finished && this.turn === "rival") this.time.delayedCall(550, () => this.playRivalTurn());
  }

  private checkpoint(): void {
    if (!this.voyageBattle || this.resolving || this.finished && !this.intermission) return;
    const saved: BattleSave = structuredClone({ version: 1, nodeId: this.voyageBattle.nodeId, rules: this.rules,
      board: this.board, memory:this.abilityMemory, playerHand: this.playerHand, rivalHand: this.rivalHand,
      playerDeck: this.playerDeck, rivalDeck: this.rivalDeck, shocked: [...this.shocked], killedIds: [...this.killedIds],
      plays: this.plays, turn: this.turn, rngCalls: this.rngCalls,
      pendingReveal: this.pendingReveal === "card" ? "card" : null,
      rallySlot: this.pendingRally ? this.playerHand.indexOf(this.pendingRally) : null });
    if (this.twoTide && this.opening) saved.twoTide = freshTide({
      opening: this.opening, scores: this.tideScores, seed: this.tideSeed, intermission: this.intermission,
      charms: this.charms, spentCharms: this.spentCharms, killedIds: [...this.matchKilled],
    });
    const ok = this.voyageBattle.onCheckpoint(saved);
    if (this.saveStatus) this.saveStatus.textContent = ok ? "Battle saved. Leaving during an animation resumes the previous decision." : "Battle could not be saved. Keep this page open to preserve your progress.";
  }

  private resultAction(): void {
    if (!this.finished) return;
    if (this.intermission) this.resetMatch(true);
    else if (this.voyageBattle) this.voyageBattle.onComplete();
    else this.resetMatch();
  }

  private resetMatch(nextTide = false): void {
    if (!nextTide) {
      this.summary = undefined; this.summaryDialog?.remove();
      this.tideScores = []; this.opening = undefined; this.matchKilled.clear(); this.spentCharms = [];
      this.tideSeed = this.voyageBattle ? this.voyageBattle.seed + ':' + this.voyageBattle.nodeId : crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    }
    if (this.twoTide) this.tideRandom = random(this.tideSeed + ':deal');
    this.resolving = false; this.feedbackLog?.replaceChildren();
    this.abilityMemory=freshAbilityMemory();
    this.board = Array(this.rules.size * this.rules.size).fill(null);
    const playerRound = this.dealRound(this.voyageBattle?.playerDeck ?? createEnabledDeck("player"));
    const rivalRound = this.dealRound(this.voyageBattle?.rivalDeck ?? createEnabledDeck("rival"));
    this.playerHand = playerRound.hand.map((card) => ({ card, played: false }));
    this.rivalHand = rivalRound.hand.map((card) => ({ card, played: false }));
    this.playerDeck = playerRound.deck;
    this.rivalDeck = rivalRound.deck;
    this.selectedId = null;
    this.turn = "player";
    this.finished = false;
    this.killedIds.clear();
    this.shocked.clear();
    this.pendingReveal = null;
    this.pendingRally = null;
    this.pendingDraft = false; this.pendingDrift = false; this.driftFrom = null;
    this.charms = this.voyageBattle ? (this.twoTide ? availableCharms(this.voyageBattle.charms) : this.voyageBattle.charms) : randomCharms(() => this.random());
    if (this.twoTide) {
      if (!this.opening) this.opening = freshTide({playerHand: this.playerHand, rivalHand: this.rivalHand, playerDeck: this.playerDeck, rivalDeck: this.rivalDeck, charms: this.charms});
      Object.assign(this, freshTide(this.opening));
      this.tideRandom = random(this.tideSeed + ':actions'); this.rngCalls = 0;
      this.turn = nextTide ? 'rival' : 'player';
    }
    this.plays = { player: 0, rival: 0 };
    this.abilityMemory=beginAbilityTurn(this.abilityState,this.turn);
    this.render(this.turn === 'rival' ? 'Fresh tide. The rival moves first.' : 'Drag a fish to open water, or select it and choose a tile.');
    if (this.turn === 'rival') this.time.delayedCall(550, () => this.playRivalTurn());
    else if (!this.playerHand.length) this.advanceTurn("player");
  }

  private render(message: string): void {
    if (this.twoTide) message = `Tide ${Math.min(this.tideScores.length + (this.finished ? 0 : 1), 2)}/2 · ${this.tideScores.length ? 'Combined ' + combinedScore(this.tideScores).player + '–' + combinedScore(this.tideScores).rival + ' · ' : ''}${message}`;
    this.checkpoint();
    this.placementPreview = undefined;
    this.previewIndex = null;
    this.ui?.destroy(true);
    this.boardDrawings.clear();
    this.events.removeAllListeners("card-hover");
    this.events.removeAllListeners("charm-hover");
    this.ui = this.add.container(0, 0);
    const add = (object: Phaser.GameObjects.GameObject) => this.ui?.add(object);
    const scores = this.getScores();
    if (this.textures.exists("battle-seascape")) {
      add(this.add.image(0, 0, "battle-seascape").setOrigin(0));
      add(this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.deep, 0.65).setOrigin(0));
    }

    add(pixelPanel(this, this.scale.width / 2, 48, this.scale.width - 32, 80));
    add(this.add.text(40, 22, `KING OF THE REEF · ${this.rules.difficulty.toUpperCase()} · ${this.rules.size}×${this.rules.size}`, this.textStyle(24, "#eed49b")));
    add(this.add.text(40, 65, message, this.textStyle(16, "#b8ffd0")).setWordWrapWidth(1200));
    add(this.add.text(this.scale.width - 40, 26, `YOU ${scores.player}  ·  ${scores.rival} RIVAL`, this.textStyle(16, "#ffb8d8")).setOrigin(1, 0));
    add(this.add.text(this.scale.width - 40, 58, `FISH PLAYED ${this.plays.player}/${this.playLimit}  ·  ${this.plays.rival}/${this.playLimit}`, this.textStyle(16, "#b8d7dc")).setOrigin(1, 0));

    const board = this.boardOrigin();
    this.drawSidePanel(38, board.y, "YOUR DECK", this.playerDeck.length, "player");
    this.drawCharms(38, board.y + 230);
    this.drawSidePanel(this.scale.width - 194, board.y, "RIVAL DECK", this.rivalDeck.length, "rival");
    add(this.add.text(this.scale.width - 194, board.y + 230, "TIDE CHARMS", this.textStyle(16, "#ff8b8b")));
    add(this.add.text(this.scale.width - 194, board.y + 262, "NONE", this.textStyle(8, "#8aa8b5")));

    const playerHandCenter = board.x - 280;
    const rivalHandCenter = board.x + this.boardSpan() + 280;
    add(this.add.text(playerHandCenter - 92, board.y - 35, this.turn === "player" ? "YOUR HAND" : "RIVAL TURN", this.textStyle(15, "#69bbff", true)));
    this.playerHand.forEach((slot, index) => {
      const position = this.handPosition(index, playerHandCenter, board.y);
      this.drawPlayerHandSlot(slot, position.x, position.y);
    });

    add(this.add.text(rivalHandCenter - 92, board.y - 35, "RIVAL HAND", this.textStyle(15, "#ff8b8b", true)));
    this.rivalHand.forEach((slot, index) => {
      const position = this.handPosition(index, rivalHandCenter, board.y);
      const card = slot.revealed && !slot.played
        ? this.drawFishCard(slot.card, position.x, position.y, HAND_CARD_SIZE, false)
        : this.drawCardBack(position.x, position.y, HAND_CARD_SIZE, "rival", undefined, slot.played ? 0.22 : 1);
      if (this.pendingReveal && !slot.played && !slot.revealed) {
        card.setSize(HAND_CARD_SIZE, HAND_CARD_SIZE).setInteractive({ useHandCursor: true });
        card.on("pointerdown", () => this.chooseReveal(slot));
        add(this.add.text(position.x, position.y + 90, "REVEAL", this.textStyle(16, "#81e8ed")).setOrigin(0.5));
      }
    });

    for (let index = 0; index < this.board.length; index += 1) {
      const row = Math.floor(index / this.rules.size);
      const column = index % this.rules.size;
      const x = board.x + column * (CELL + GAP);
      const y = board.y + row * (CELL + GAP);
      const reef = scoringReefs(this.rules.size).has(index);
      const cell = this.add.rectangle(x + CELL / 2, y + CELL / 2, CELL, CELL, this.waterColor)
        .setStrokeStyle(3, reef ? COLORS.pink : this.borderColor, reef ? 1 : 0.72);
      add(cell);
      add(this.add.text(x + 4, y + 3, tileName(index, this.rules.size), this.textStyle(8, "#86a9b3")));
      if (!this.board[index]) this.drawTerrain(index, x, y);
      if (reef && !this.board[index]) this.drawPearl(x + CELL / 2, y + CELL / 2);
      if (this.board[index]) this.drawBoardFish(this.board[index]!, x, y);
      const marker=this.abilityMemory.decoys.some(t=>t.index===index)?'AFTERIMAGE':this.abilityMemory.snares.some(t=>t.index===index)?'SNARE':null;
      if(marker)add(this.add.text(x+CELL/2,y+CELL/2,marker,this.textStyle(8,marker==='SNARE'?'#ffcc88':'#c6a4ff')).setOrigin(.5));
      const tokenFish=this.board[index];
      if(tokenFish?.ability==='inflate')add(this.add.text(x+CELL/2,y+6,this.abilityMemory.inflated.includes(tokenFish.id)?'DEFLATED':'INFLATED',this.textStyle(8,'#ffdd88')).setOrigin(.5,0));
      if(tokenFish?.ability==='spreading-arms')add(this.add.text(x+CELL/2,y+6,this.abilityMemory.grown.includes(tokenFish.id)?'GROWN':'GROWING',this.textStyle(8,'#aaffbb')).setOrigin(.5,0));
      const feature = this.terrain.features?.get(index);
      if (feature && this.board[index]) add(this.add.text(x + CELL / 2, y + CELL - 4, TERRAIN_INFO[feature].name, { ...this.textStyle(8, "#c4ece1"), backgroundColor: "#00233a" }).setOrigin(0.5, 1));
      if (this.pendingDrift && this.driftFrom !== null && canDrift(this.board, this.driftFrom, index, this.terrain)) {
        cell.setStrokeStyle(4, 0xffdd88).setInteractive({ useHandCursor: true }).on("pointerdown", () => {
          this.finishDrift(index);
        });
      }
      if (this.isLegalPlayerPlacement(index)) {
        cell.setInteractive({ useHandCursor: true })
          .on("pointerover", () => {
            cell.setFillStyle(COLORS.hover);
            const fish = this.getSelectedPlayerCard();
            if (fish) this.showPlacementPreview(index, fish);
          })
          .on("pointerout", () => {
            cell.setFillStyle(this.waterColor);
            this.clearPlacementPreview();
          })
          .on("pointerdown", () => this.playPlayerCard(index));
      }
    }
    if (this.pendingReveal === "charm") {
      const cancel = this.add.text(38, board.y + 520, "CANCEL REVEAL", this.textStyle(8, "#eed49b")).setInteractive({ useHandCursor: true });
      cancel.on("pointerdown", () => { this.pendingReveal = null; this.render("Reveal canceled. Charm kept."); });
      add(cancel);
    }

    add(this.add.text(this.scale.width - 194, board.y + 310, terrainLegend(this.terrain), this.textStyle(8, "#b8d7dc")).setWordWrapWidth(168).setLineSpacing(6));
    if (this.pendingDrift) {
      const cancel = this.add.text(38, board.y + 500, "CANCEL DRIFT", this.textStyle(8, "#eed49b")).setInteractive({ useHandCursor: true });
      cancel.on("pointerdown", () => { this.pendingDrift = false; this.driftFrom = null; this.render("Drift canceled. Charm kept."); }); add(cancel);
    }
    this.renderControls(message);
    if (this.finished) this.drawResult(scores.player, scores.rival);
    else {
      const detail = this.add.text(40, this.scale.height - 68, "Hover a card to read its edges and ability.", this.textStyle(16, "#b8d7dc")).setWordWrapWidth(this.scale.width - 80);
      add(detail);
      this.events.removeAllListeners("card-hover");
      this.events.on("card-hover", (fish: FishCard) => detail.setText(cardDescription(fish) + (this.shocked.has(fish.id) ? " SHOCKED: all edges disabled for this battle." : "")));
      this.events.removeAllListeners("charm-hover");
      this.events.on("charm-hover", (id: CharmId) => detail.setText(`${CHARMS[id].name}: ${CHARMS[id].description}`));
      if (this.pendingRally) this.drawRally();
      if (this.pendingDraft) this.drawDraft();
    }
  }

  private boardSpan(): number {
    return this.rules.size * CELL + (this.rules.size - 1) * GAP;
  }

  private boardOrigin(): { x: number; y: number } {
    const span = this.boardSpan();
    return {
      x: Math.floor((this.scale.width - span) / 2),
      y: Math.max(120, Math.floor((this.scale.height - span) / 2)),
    };
  }

  private handPosition(index: number, centerX: number, boardY: number): { x: number; y: number } {
    const positions = [
      { x: -164, y: 82 },
      { x: 0, y: 82 },
      { x: 164, y: 82 },
      { x: -82, y: 252 },
      { x: 82, y: 252 },
    ];
    return { x: centerX + positions[index].x, y: boardY + positions[index].y };
  }

  private drawPlayerHandSlot(slot: HandSlot, x: number, y: number): void {
    const selected = this.selectedId === slot.card.id;
    this.drawFishCard(slot.card, x, y, HAND_CARD_SIZE, false, true);
    if (slot.played) return;
    const card = this.drawFishCard(slot.card, x, y, HAND_CARD_SIZE, selected);
    if (slot.revealed) this.ui?.add(this.add.text(x, y + 90, "REVEALED", this.textStyle(16, "#81e8ed")).setOrigin(0.5));
    if (this.turn !== "player" || this.resolving || this.finished || this.pendingReveal || this.pendingRally || this.pendingDraft || this.pendingDrift) return;

    card.setInteractive({ useHandCursor: true });
    this.input.setDraggable(card);
    let dragged = false;
    card.on("pointerdown", () => { dragged = false; });
    card.on("dragstart", () => {
      dragged = true;
      this.selectedId = slot.card.id;
      card.setDepth(100);
    });
    card.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      card.setPosition(dragX, dragY);
      const index = this.boardIndexAt(pointer.x, pointer.y);
      if (index !== null && canPlaceFish(this.board, index, slot.card, this.terrain,this.abilityMemory)) this.showPlacementPreview(index, slot.card);
      else this.clearPlacementPreview();
    });
    card.on("dragend", () => {
      const placement = this.previewIndex;
      this.clearPlacementPreview();
      if (placement !== null && canPlaceFish(this.board, placement, slot.card, this.terrain,this.abilityMemory)) this.playPlayerCard(placement);
      else {
        card.setPosition(x, y).setScale(1).setDepth(2);
        this.selectedId = null;
      }
    });
    card.on("pointerup", () => {
      if (dragged) return;
      this.selectedId = selected ? null : slot.card.id;
      this.render(this.selectedId ? `${slot.card.name} selected — choose open water.` : "Selection cleared.");
    });
  }

  private drawTerrain(index: number, x: number, y: number): void {
    const rock = this.terrain.rocks.has(index);
    const pool = this.terrain.whirlpools.indexOf(index);
    const feature = this.terrain.features?.get(index);
    if (feature) {
      const info = TERRAIN_INFO[feature];
      info.pixels.forEach((row, py) => [...row].forEach((value, px) => {
        if (value === "1") this.ui?.add(this.add.rectangle(x + 28 + px * 8, y + 20 + py * 8, 8, 8, info.color).setOrigin(0));
      }));
      this.ui?.add(this.add.text(x + CELL / 2, y + 70, info.name, this.textStyle(8, "#c4ece1")).setOrigin(0.5));
      return;
    }
    if (!rock && pool < 0) return;
    const pixels = rock
      ? ["000000000000", "000011110000", "001122221000", "011222222100", "012223322210", "122233222210", "122222222221", "122222222221", "011111111110", "000000000000"]
      : ["000111111000", "001222222100", "012211112210", "122100001221", "121002210121", "121012210121", "122100010221", "012211112210", "001222222100", "000111111000"];
    const palette = rock ? [0, 0x344c60, 0x72929a, 0xb1c5b8] : [0, 0x277b99, 0x8be9e5, 0xffffff];
    pixels.forEach((row, py) => [...row].forEach((value, px) => {
      if (value !== "0") this.ui?.add(this.add.rectangle(x + 24 + px * 4, y + 18 + py * 4, 4, 4, palette[Number(value)]).setOrigin(0));
    }));
    this.ui?.add(this.add.text(x + CELL / 2, y + 70, rock ? "ROCK" : pool === 0 ? "POOL A" : "POOL B", this.textStyle(8, "#c4ece1")).setOrigin(0.5));
  }

  private drawPearl(x: number, y: number): void {
    const pearl = pixelPearl(this, x, y - 4);
    const label = this.add.text(x, y + 28, "REEF", this.textStyle(11, "#ffb8d8", true)).setOrigin(0.5);
    this.ui?.add([pearl, label]);
  }

  private drawBoardFish(fish: FishCard, x: number, y: number): void {
    const drawing = this.drawFishCard(fish, x + CELL / 2, y + CELL / 2, BOARD_CARD_SIZE, false);
    this.boardDrawings.set(fish.id, drawing);
    if (this.pendingDrift && fish.owner === "player") drawing.on("pointerdown", () => {
      this.driftFrom = this.board.findIndex(card => card?.id === fish.id);
      this.render("Choose an adjacent gold-bordered tile, or another friendly fish.");
    });
  }

  private drawFishCard(fish: FishCard, x: number, y: number, size: number, selected: boolean, silhouette = false): Phaser.GameObjects.Container {
    if (!this.ui) throw new Error("Card UI container is unavailable");
    const card = drawFishCard({ scene: this, container: this.ui, fish, x, y, size, selected, silhouette, shocked: this.shocked.has(fish.id) });
    if (!silhouette) card.setInteractive().on("pointerover", () => this.events.emit("card-hover", fish));
    return card;
  }

  private showPlacementPreview(index: number, fish: FishCard): void {
    if (this.previewIndex === index) return;
    this.clearPlacementPreview();
    const destination = placementDestination(this.board, index, this.terrain);
    const row = Math.floor(destination / this.rules.size);
    const column = destination % this.rules.size;
    const board = this.boardOrigin();
    const x = board.x + column * (CELL + GAP) + CELL / 2;
    const y = board.y + row * (CELL + GAP) + CELL / 2;
    this.placementPreview = this.drawFishCard(placementCard(fish, index, this.terrain), x, y, BOARD_CARD_SIZE, false).disableInteractive().setAlpha(0.42).setDepth(30);
    this.previewIndex = index;
  }

  private clearPlacementPreview(): void {
    this.placementPreview?.destroy(true);
    this.placementPreview = undefined;
    this.previewIndex = null;
  }

  private boardIndexAt(x: number, y: number): number | null {
    const board = this.boardOrigin();
    const column = Math.floor((x - board.x) / (CELL + GAP));
    const row = Math.floor((y - board.y) / (CELL + GAP));
    if (row < 0 || row >= this.rules.size || column < 0 || column >= this.rules.size) return null;
    const localX = x - (board.x + column * (CELL + GAP));
    const localY = y - (board.y + row * (CELL + GAP));
    return localX <= CELL && localY <= CELL ? row * this.rules.size + column : null;
  }

  private dealRound(school: FishCard[]): { hand: FishCard[]; deck: FishCard[] } {
    const healthy = school.filter((card) => card.condition === "healthy");
    for (let index = healthy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(this.random() * (index + 1));
      [healthy[index], healthy[swap]] = [healthy[swap], healthy[index]];
    }
    return { hand: healthy.slice(0, HAND_SIZE), deck: healthy.slice(HAND_SIZE) };
  }

  private drawSidePanel(x: number, y: number, label: string, count: number, owner: "player" | "rival"): void {
    this.ui?.add(this.add.text(x, y, label, this.textStyle(14, owner === "player" ? "#69bbff" : "#ff8b8b", true)));
    this.drawCardBack(x + 78, y + 98, 144, owner, count);
  }

  private drawCardBack(x: number, y: number, size: number, owner: "player" | "rival", count?: number, alpha = 1): Phaser.GameObjects.Container {
    const color = owner === "player" ? 0x1597ff : 0xff3b3b;
    const card = this.add.container(x, y);
    const back = this.add.rectangle(0, 0, size, size, COLORS.deep).setStrokeStyle(4, color);
    const inset = this.add.rectangle(0, 0, size - 14, size - 14, COLORS.water).setStrokeStyle(2, color, 0.8);
    const ornament = this.add.graphics().fillStyle(color, 0.6);
    for (let step = 0; step < 8; step++) {
      const offset = step * 4;
      ornament.fillRect(-32 + offset, -offset, 4, 4).fillRect(offset, -32 + offset, 4, 4);
      ornament.fillRect(-32 + offset, offset, 4, 4).fillRect(offset, 32 - offset, 4, 4);
    }
    const pearl = pixelPearl(this, 0, 0, 2);
    card.add([back, inset, ornament, pearl]).setAlpha(alpha);
    this.ui?.add(card);
    if (count !== undefined) this.ui?.add(this.add.text(x, y + size / 2 + 15, `${count} IN DECK`, this.textStyle(12, "#b8ffd0", true)).setOrigin(0.5, 0));
    return card;
  }

  private drawCharms(x: number, y: number): void {
    this.ui?.add(this.add.text(x, y, "TIDE CHARMS", this.textStyle(16, "#eed49b")));
    this.ui?.add(this.add.text(x, y + 24, `${availableCharms(this.charms).length}/${CHARM_CAPACITY} · USE BEFORE YOUR FISH`, this.textStyle(8, "#8aa8b5")));
    availableCharms(this.charms).forEach((id, index) => {
      const count = 1;
      const active = this.canUseCharm(id);
      const key = `charm-${id}`;
      if (!this.textures.exists(key)) this.textures.addCanvas(key, charmCanvas(id, 2));
      const row = this.add.container(x, y + 58 + index * 48);
      const frame = this.add.rectangle(76, 0, 152, 40, active ? 0x28545a : 0x102d3c).setStrokeStyle(2, active ? 0x81e8ed : 0x446270);
      const icon = this.add.image(18, 0, key);
      const label = this.add.text(38, -12, `${CHARMS[id].name.replace(" ", "\n")} ×${count}`, this.textStyle(8, count ? "#eed49b" : "#8aa8b5"));
      row.add([frame, icon, label]); this.ui?.add(row);
      frame.setInteractive({ useHandCursor: active });
      frame.on("pointerover", () => this.events.emit("charm-hover", id));
      frame.on("pointerdown", () => this.useCharm(id));
    });
    for (let index = availableCharms(this.charms).length; index < CHARM_CAPACITY; index++) {
      this.ui?.add(this.add.rectangle(x + 76, y + 58 + index * 48, 152, 40, 0x102d3c).setStrokeStyle(2, 0x446270));
      this.ui?.add(this.add.text(x + 38, y + 50 + index * 48, "EMPTY SLOT", this.textStyle(8, "#8aa8b5")));
    }
  }

  private hasLegalMove(owner: "player" | "rival"): boolean {
    const hand = owner === "player" ? this.playerHand : this.rivalHand;
    return canPlayFish(hand, this.plays[owner], this.playLimit) && hand.some(slot => !slot.played && this.board.some((_, index) => canPlaceFish(this.board, index, slot.card, this.terrain,this.abilityMemory)));
  }

  private canUseCharm(id: CharmId): boolean {
    if (this.resolving || this.finished || this.turn !== "player" || this.pendingReveal || this.pendingRally || this.pendingDraft || this.pendingDrift || !canPlayFish(this.playerHand, this.plays.player, this.playLimit) || !availableCharms(this.charms).includes(id)) return false;
    if (id === "spyglass-pearl") return revealTargets(this.rivalHand).length > 0;
    if (id === "current-conch") return this.playerDeck.length > 0;
    if (id === "drift-shell") return this.board.some((_, from) => this.board.some((_, to) => canDrift(this.board, from, to, this.terrain)));
    const selected = this.getSelectedPlayerCard();
    if (!selected) return false;
    if (id === "dredger-net") return this.playerDeck.length > 0;
    return canCharmCard(selected, id);
  }

  private spendCharm(id: CharmId): boolean {
    if (this.voyageBattle && !this.twoTide) {
      const spent = this.voyageBattle.onUseCharm(id);
      if (spent) reefAudio.play("charm");
      return spent;
    }
    const index = this.charms.indexOf(id);
    if (index < 0) return false;
    this.charms.splice(index, 1);
    if (this.twoTide && this.opening) this.spentCharms = matchCharmSpending(this.opening.charms, this.charms, this.spentCharms);
    reefAudio.play("charm"); return true;
  }

  private useCharm(id: CharmId): void {
    if (!this.canUseCharm(id)) return;
    if (id === "spyglass-pearl") {
      this.pendingReveal = "charm";
      this.render("Spyglass Pearl — choose a hidden rival card. Your fish play is still available.");
      return;
    }
    if (id === "dredger-net") { this.pendingDraft = true; this.render("Dredger Net — choose a replacement from your next three reserve cards."); return; }
    if (id === "drift-shell") { this.pendingDrift = true; this.driftFrom = null; this.render("Drift Shell — choose a friendly board fish, then an adjacent empty tile."); return; }
    if (!this.spendCharm(id)) return;
    if (id === "current-conch") {
      shuffleHand(this.playerHand, this.playerDeck, () => this.random());
      this.selectedId = null;
    } else {
      const slot = this.playerHand.find((entry) => !entry.played && entry.card.id === this.selectedId)!;
      slot.card = charmCard(slot.card, id);
    }
    this.logCombat(CHARMS[id].name + " used.");
    this.render(`${CHARMS[id].name} used. Play your fish when ready.`);
  }

  private drawDraft(): void {
    const x = Math.floor(this.scale.width / 2), y = Math.floor(this.scale.height / 2);
    const modal = this.add.container(0, 0).setDepth(210); this.ui?.add(modal);
    modal.add(pixelPanel(this, x, y, 720, 400));
    modal.add(this.add.text(x, y - 172, "DREDGER NET · CHOOSE ONE", this.textStyle(24, "#eed49b")).setOrigin(0.5));
    this.playerDeck.slice(0, 3).forEach((fish, index) => {
      const cx = x + (index - 1) * 216;
      const pick = drawFishCard({ scene: this, container: modal, fish, x: cx, y: y - 12, size: HAND_CARD_SIZE });
      pick.setInteractive({ useHandCursor: true }).on("pointerover", () => this.events.emit("card-hover", fish)).on("pointerdown", () => {
        this.chooseDraft(index);
      });
      modal.add(this.add.text(cx, y + 84, fish.name, this.textStyle(8, "#b8d7dc")).setOrigin(0.5).setWordWrapWidth(192));
    });
    const cancel = this.add.text(x, y + 148, "CANCEL · KEEP CHARM", this.textStyle(16, "#eed49b")).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cancel.on("pointerdown", () => { this.pendingDraft = false; this.render("Draft canceled. Charm kept."); }); modal.add(cancel);
  }


  private chooseReveal(slot: HandSlot): void {
    if (!this.pendingReveal || this.resolving || this.finished || !revealCard(this.rivalHand, slot.card.id)) return;
    const source = this.pendingReveal; this.pendingReveal = null;
    if (source === 'charm') {
      if (!this.spendCharm('spyglass-pearl')) { slot.revealed = false; this.render('No Spyglass Pearl available.'); return; }
      this.render('Rival card revealed. Play your fish when ready.');
    } else this.advanceTurn('player');
  }
  private finishDrift(index: number): void {
    if (!this.pendingDrift || this.driftFrom === null || !canDrift(this.board, this.driftFrom, index, this.terrain) || !this.spendCharm('drift-shell')) return;
    this.board[index] = this.board[this.driftFrom]; this.board[this.driftFrom] = null;
    this.abilityMemory.decoys = this.abilityMemory.decoys.filter(token => token.index !== index);
    this.pendingDrift = false; this.driftFrom = null; this.render('Fish repositioned. Play your fish when ready.');
  }
  private chooseDraft(index: number): void {
    const slot = this.playerHand.find(entry => !entry.played && entry.card.id === this.selectedId);
    if (!this.pendingDraft || !slot || !this.playerDeck[index] || !this.spendCharm('dredger-net')) return;
    exchangeReserve(slot, this.playerDeck, index); this.selectedId = slot.card.id; this.pendingDraft = false;
    this.render('Replacement chosen. Your old fish is at the bottom of the reserve.');
  }
  private renderControls(message: string): void {
    const root = this.controls; if (!root) return;
    const focused = root.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.control : undefined;
    root.replaceChildren();
    const summaryControl = document.createElement('summary'); summaryControl.textContent = 'Battle controls · keyboard and text'; root.append(summaryControl);
    const text = (value: string) => { const p = document.createElement('p'); p.textContent = value; root.append(p); return p; };
    const heading = document.createElement('h3'); heading.textContent = 'Battle controls'; root.append(heading);
    const scores = this.getScores();
    const status = text(message + ` Reef points: you ${scores.player}, rival ${scores.rival}. Plays: you ${this.plays.player}/${this.playLimit}, rival ${this.plays.rival}/${this.playLimit}.`); status.setAttribute('role', 'status'); status.tabIndex = -1; status.dataset.control = 'status';
    if (this.twoTide && this.tideScores.length) text(this.tideScores.map((s, i) => `Tide ${i + 1}: you ${s.player}, rival ${s.rival}`).join(' · '));
    const button = (id: string, label: string, action: () => void, disabled = false) => {
      const b = document.createElement('button'); b.className = 'voyage-button'; b.dataset.control = id; b.textContent = label; b.disabled = disabled; b.onclick = action; root.append(b); return b;
    };
    const select = (id: string, title: string, options: Array<[string,string]>, current: string, change: (value: string) => void) => {
      const label = document.createElement('label'); label.textContent = title + ' ';
      const input = document.createElement('select'); input.dataset.control = id;
      options.forEach(([value,name]) => input.append(new Option(name,value))); input.value = current;
      input.onchange = () => change(input.value); label.append(input); root.append(label); return input;
    };
    const tile = (i: number) => {
      const f = this.board[i], feature = this.terrain.features?.get(i);
      return tileName(i,this.rules.size) + ': ' + (scoringReefs(this.rules.size).has(i) ? 'scoring reef; ' : '')
        + (this.terrain.rocks.has(i) ? 'rock; ' : '') + (this.terrain.whirlpools.includes(i) ? 'whirlpool; ' : '')
        + (feature ? TERRAIN_INFO[feature].name + ': ' + TERRAIN_INFO[feature].rule + ' ' : '') + (f ? f.owner + ' ' + cardDescription(f) + (this.shocked.has(f.id) ? ' Shocked.' : '') : 'empty');
    };
    const busy = this.resolving || this.turn !== 'player';
    if (this.finished) button('result', this.intermission ? 'Next tide · rival starts' : this.voyageBattle ? 'Return to map' : 'Play again', () => this.resultAction());
    else if (!busy) {
      if (this.pendingRally) {
        text('Next reserve: ' + (this.playerDeck[0] ? cardDescription(this.playerDeck[0]) : 'empty'));
        button('rally-keep','Keep and draw', () => this.finishRally('keep')); button('rally-bottom','Send to bottom', () => this.finishRally('bottom'));
      } else if (this.pendingReveal) {
        this.rivalHand.forEach((slot,i) => { if (!slot.played && !slot.revealed) button('reveal-'+i, 'Reveal rival card '+(i+1), () => this.chooseReveal(slot)); });
      } else if (this.pendingDraft) {
        this.playerDeck.slice(0,3).forEach((fish,i) => button('draft-'+i, cardDescription(fish), () => this.chooseDraft(i)));
      } else if (this.pendingDrift) {
        const friends = this.board.flatMap((f,i) => f?.owner === 'player' ? [[String(i),tile(i)] as [string,string]] : []);
        select('drift-from', 'Fish to move', [['','Choose a fish'],...friends], this.driftFrom === null ? '' : String(this.driftFrom), value => { this.driftFrom = value === '' ? null : Number(value); this.render('Choose an adjacent empty destination.'); });
        if (this.driftFrom !== null) this.board.forEach((_,i) => { if (canDrift(this.board,this.driftFrom!,i,this.terrain)) button('drift-'+i, 'Move to '+tile(i), () => this.finishDrift(i)); });
      } else {
        select('hand','Hand card', [['','Choose a fish'], ...this.playerHand.filter(s => !s.played).map(s => [s.card.id,s.card.name] as [string,string])], this.selectedId ?? '', id => { this.selectedId = id || null; this.render('Inspect a target, then choose Place.'); });
        const card = this.getSelectedPlayerCard();
        if (card) {
          text(cardDescription(card));
          const legal = this.board.flatMap((_,i) => this.isLegalPlayerPlacement(i) ? [[String(i),tile(i)] as [string,string]] : []);
          if (!legal.some(([i]) => Number(i) === this.targetIndex)) this.targetIndex = Number(legal[0]?.[0] ?? 0);
          if (legal.length) {
            select('target','Placement target', legal, String(this.targetIndex), value => { this.targetIndex = Number(value); this.render('Target selected. Choose Place to commit.'); });
            const destination = placementDestination(this.board,this.targetIndex,this.terrain);
            text('Target: '+tile(this.targetIndex)+(destination !== this.targetIndex ? ' Channel moves to '+tileName(destination,this.rules.size)+' before edges.' : '')+' Effects resolve before any whirlpool travel.');
            button('place','Place at '+tileName(this.targetIndex,this.rules.size), () => { void this.playPlayerCard(this.targetIndex); });
            this.showPlacementPreview(this.targetIndex,card);
          } else text('This fish has no legal placement. Choose another card or use a charm.');
        }
        availableCharms(this.charms).forEach((id,i) => button('charm-'+i, CHARMS[id].name+': '+CHARMS[id].description, () => this.useCharm(id), !this.canUseCharm(id)));
      }
      if (this.pendingReveal === 'charm' || this.pendingDraft || this.pendingDrift) button('cancel','Cancel choice · keep charm', () => { this.pendingReveal = null; this.pendingDraft = false; this.pendingDrift = false; this.driftFrom = null; this.render('Choice canceled. Charm kept.'); });
    }
    if (this.finished && this.summary) button('summary', 'View match summary', () => this.openSummary());
    const inspect = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = 'Inspect board and revealed rival cards'; inspect.append(summary);
    this.board.forEach((_,i) => { const p = document.createElement('p'); p.textContent = tile(i); inspect.append(p); });
    this.rivalHand.forEach((slot,i) => { if (slot.revealed && !slot.played) { const p = document.createElement('p'); p.textContent = 'Rival card '+(i+1)+': '+cardDescription(slot.card); inspect.append(p); } });
    for(const [owner,deck] of [['player',this.playerDeck],['rival',this.rivalDeck]] as const)[...deck].filter(c=>c.known).sort((a,b)=>a.name.localeCompare(b.name)).forEach((card)=>{if(card.known){const p=document.createElement('p');p.textContent=owner+' known reserve identity: '+cardDescription(card);inspect.append(p);}});
    for(const token of this.abilityMemory.decoys){const p=document.createElement('p');p.textContent='Afterimage at '+tileName(token.index,this.rules.size)+'; blocks placement, movement clears it.';inspect.append(p);}
    for(const token of this.abilityMemory.snares){const p=document.createElement('p');p.textContent=token.owner+' Snare at '+tileName(token.index,this.rules.size);inspect.append(p);}
    root.append(inspect);
    if (focused) { const replacement = [...root.querySelectorAll<HTMLElement>('[data-control]')].find(el => el.dataset.control === focused && !(el as HTMLButtonElement).disabled); (replacement ?? status).focus({preventScroll:true}); }
  }

  private getSelectedPlayerCard(): FishCard | undefined {
    return this.playerHand.find((slot) => !slot.played && slot.card.id === this.selectedId)?.card;
  }

  private isLegalPlayerPlacement(index: number): boolean {
    return Boolean(this.selectedId && this.turn === "player" && !this.resolving && !this.finished && !this.pendingReveal && !this.pendingRally && !this.pendingDraft && !this.pendingDrift && canPlaceFish(this.board, index, this.getSelectedPlayerCard(), this.terrain,this.abilityMemory));
  }

  private async playPlayerCard(index: number): Promise<void> {
    const slot = this.playerHand.find((entry) => !entry.played && entry.card.id === this.selectedId);
    if (!slot || !canPlaceFish(this.board, index, slot.card, this.terrain,this.abilityMemory) || this.turn !== "player" || this.resolving || this.finished || this.pendingReveal || this.pendingRally || this.pendingDraft || this.pendingDrift) return;
    const playedCard = slot.card;
    const options=placementOptions(this.abilityState,index,playedCard);let picked=0;
    if(options.length>1){
      this.resolving=true;this.render('Choose '+playedCard.name+' ability.');
      picked=await this.chooseAbility(playedCard.name+' · '+(playedCard.ability?ABILITIES[playedCard.ability].name:'Ability'),options.map(o=>{
        const result=resolvePlacement(this.abilityState,index,playedCard,this.rules.size,false,o.choice),score=scoreBoard(result.board);
        return o.label+' · resulting score '+score.player+'–'+score.rival+' · removals '+result.killedIds.length;
      }),true);
      if(!this.sys.isActive())return;this.resolving=false;
      if(picked<0){this.render('Placement canceled. Card kept.');return;}
    }
    slot.played=true;this.selectedId=null;
    const result = await this.placeCard(index, playedCard,options[picked].choice);
    if (!this.sys.isActive()) return;
    this.plays.player++;
    if (triggersRally(playedCard, result.pushedEnemyIds, this.playerDeck)) {
      this.logCombat(playedCard.name + ": Rally triggered — choose your next draw.");
      this.pendingRally = slot;
      this.render("Rally — inspect your next card before drawing your replacement.");
      return;
    }
    await this.finishAbilityDraw(playedCard,slot);
    if(!this.sys.isActive())return;
    if (playedCard.ability === "revelation" && revealTargets(this.rivalHand).length) {
      this.logCombat(playedCard.name + ": Revelation triggered — reveal a rival card.");
      this.pendingReveal = "card";
      this.render("Revelation — choose an unrevealed card in the rival hand.");
      return;
    }
    this.advanceTurn("player");
  }

  private async playRivalTurn(): Promise<void> {
    const publicPool = STARTERS.filter(c => (REGIONS.find(r => r.id === this.rules.region)!.pool as readonly string[]).includes(c.texture));
    const revealed = this.playerHand.filter(s => !s.played && s.revealed).map(s => s.card);
    const profiles = [...revealed, ...publicPool.filter((_, i) => i % Math.max(1, Math.floor(publicPool.length / 6)) === 0).map(c => ({...c, owner: 'player' as const, condition: 'healthy' as const}))];
    const choice = chooseRivalMove({...this.abilityState, hand: this.rivalHand,
      difficulty: this.rules.difficulty, rivalPlaysLeft: this.playLimit - this.plays.rival,
      playerPlaysLeft: this.hasLegalMove('player') ? this.playLimit - this.plays.player : 0, publicThreats: profiles}, () => this.random());
    if (!choice) return this.advanceTurn('rival');
    const best = {slot: this.rivalHand[choice.slotIndex], index: choice.index};
    best.slot.played = true;
    const playedCard = best.slot.card;
    const result = await this.placeCard(best.index, playedCard,choice.abilityChoice);
    if (!this.sys.isActive()) return;
    this.plays.rival++;
    if (triggersRally(playedCard, result.pushedEnemyIds, this.rivalDeck)) resolveRally(this.rivalDeck, rivalRallyChoice(this.rivalDeck[0]));
    await this.finishAbilityDraw(playedCard,best.slot);
    if(!this.sys.isActive())return;
    if (playedCard.ability === "revelation") {
      const targets = revealTargets(this.playerHand);
      if (targets.length) revealCard(this.playerHand, targets[Math.floor(this.random() * targets.length)].card.id);
    }
    this.advanceTurn("rival");
  }

  private async advanceTurn(previous: "player" | "rival"): Promise<void> {
    if (this.checkEnd()) return;
    const playerReady = this.hasLegalMove("player");
    const rivalReady = this.hasLegalMove("rival");
    this.turn = rivalReady && (previous === "player" || !playerReady) ? "rival" : "player";
    await this.beginAbilityTurn();
    if(!this.sys.isActive())return;
    this.render(this.turn === "rival" ? "The rival is choosing…" : "Your turn — drag a fish to open water.");
    if (this.turn === "rival") this.time.delayedCall(550, () => this.playRivalTurn());
  }

  private logCombat(message: string): void {
    const line = document.createElement("li"); line.textContent = message;
    this.feedbackLog?.append(line);
    while (this.feedbackLog && this.feedbackLog.children.length > 40) this.feedbackLog.firstElementChild?.remove();
    if (this.feedbackLog) this.feedbackLog.scrollTop = this.feedbackLog.scrollHeight;
  }

  private async showCombatFrame(frame: CombatFrame): Promise<void> {
    const before = this.board;
    const cue = combatCue(before, this.shocked, frame);
    if (cue) reefAudio.play(cue);
    for (const line of describeFrame(before, this.shocked, frame)) this.logCombat(line);
    this.board = frame.board; this.shocked = frame.shocked;
    this.render("Resolving: " + frame.label);
    if (this.motionReduced || !this.sys.isActive()) return;
    const origin = this.boardOrigin();
    const position = (index: number) => ({ x: origin.x + (index % this.rules.size) * (CELL + GAP) + CELL / 2, y: origin.y + Math.floor(index / this.rules.size) * (CELL + GAP) + CELL / 2 });
    const animations: Promise<void>[] = [];
    const animate = (drawing: Phaser.GameObjects.Container, values: object) => animations.push(new Promise(resolve => {
      this.tweens.add({ targets: drawing, ...values, duration: 260, ease: "Sine.easeInOut", onUpdate: () => { drawing.x = Math.round(drawing.x); drawing.y = Math.round(drawing.y); }, onComplete: () => resolve() });
    }));
    for (const [from, fish] of before.entries()) {
      if (!fish) continue;
      const to = frame.board.findIndex(card => card?.id === fish.id);
      if (to < 0) {
        const point = position(from);
        const ghost = this.drawFishCard(fish, point.x, point.y, BOARD_CARD_SIZE, false).disableInteractive();
        animate(ghost, { alpha: 0 });
      } else if (to !== from) {
        const drawing = this.boardDrawings.get(fish.id)!;
        if (frame.label === "Whirlpool") { drawing.setAlpha(0); animate(drawing, { alpha: 1 }); }
        else { const start = position(from); drawing.setPosition(start.x, start.y); animate(drawing, position(to)); }
      }
    }
    for (const fish of frame.board) {
      if (!fish) continue;
      const prior = before.find(card => card?.id === fish.id);
      if (!prior || prior.edges.length !== fish.edges.length || frame.label.includes("shock") || frame.label === "Full-card ability" || frame.label === "Storm field") {
        const drawing = this.boardDrawings.get(fish.id)!; drawing.setAlpha(0.4); animate(drawing, { alpha: 1 });
      }
    }
    if (!animations.length) animations.push(new Promise(resolve => { this.time.delayedCall(260, () => resolve()); }));
    await Promise.all(animations);
  }

  private async placeCard(index: number, card: FishCard, choice:AbilityChoice={}): Promise<ReturnType<typeof resolvePlacement>> {
    this.resolving = true;
    const beforeScore = this.getScores();
    const result = resolvePlacement(this.abilityState, index, card, this.rules.size, true,choice);
    for (const frame of result.frames) {
      if (!this.sys.isActive()) break;
      await this.showCombatFrame(frame);
    }
    this.board = result.board; this.shocked = result.shocked; this.abilityMemory=result.memory;
    for (const id of result.killedIds) this.killedIds.add(id);
    const afterScore = this.getScores();
    if (beforeScore.player !== afterScore.player || beforeScore.rival !== afterScore.rival) this.logCombat(`Reef control: you ${afterScore.player} · rival ${afterScore.rival}.`);
    this.resolving = false;
    return result;
  }
  private finishRally(choice: "keep" | "bottom"): void {
    if (!this.pendingRally || this.resolving || this.finished || this.turn !== "player") return;
    resolveRally(this.playerDeck, choice);
    refillSlot(this.pendingRally, this.playerDeck);
    this.pendingRally = null;
    this.advanceTurn("player");
  }

  private drawRally(): void {
    const top = this.playerDeck[0];
    if (!top) return;
    const x = Math.floor(this.scale.width / 2), y = Math.floor(this.scale.height / 2);
    const modal = this.add.container(0, 0).setDepth(200);
    this.ui?.add(modal);
    modal.add(pixelPanel(this, x, y, 592, 416));
    modal.add(this.add.text(x, y - 176, "RALLY · NEXT IN DECK", this.textStyle(24, "#eed49b")).setOrigin(0.5));
    drawFishCard({ scene: this, container: modal, fish: top, x, y: y - 40, size: HAND_CARD_SIZE })
      .setInteractive().on("pointerover", () => this.events.emit("card-hover", top));
    modal.add(this.add.text(x, y + 64, top.name, this.textStyle(16, "#b8ffd0")).setOrigin(0.5));
    modal.add(this.add.text(x, y + 96, "Choose before drawing your replacement.", this.textStyle(8, "#b8d7dc")).setOrigin(0.5));
    (["keep", "bottom"] as const).forEach((choice, index) => {
      const bx = x - 144 + index * 288;
      const button = this.add.rectangle(bx, y + 144, 256, 48, 0x28545a).setStrokeStyle(2, 0x81e8ed).setInteractive({ useHandCursor: true });
      button.on("pointerdown", () => this.finishRally(choice));
      modal.add([button, this.add.text(bx, y + 144, choice === "keep" ? "KEEP & DRAW" : "SEND TO BOTTOM", this.textStyle(16, "#eed49b")).setOrigin(0.5)]);
    });
  }
  private getScores(board: Array<FishCard | null> = this.board): { player: number; rival: number } { return scoreBoard(board); }

  private checkEnd(): boolean {
    if ((!canPlayFish(this.playerHand, this.plays.player, this.playLimit) && !canPlayFish(this.rivalHand, this.plays.rival, this.playLimit))
      || !this.hasLegalMove("player") && !this.hasLegalMove("rival")) {
      this.finishMatch();
      return true;
    }
    return false;
  }

  private finishMatch(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.twoTide) { this.tideScores.push(this.getScores()); for (const id of this.killedIds) this.matchKilled.add(id); }
    const score = this.twoTide ? combinedScore(this.tideScores) : this.getScores();
    if (this.intermission) {
      this.render('Next tide: board and resources reset; rival starts.');
      return;
    }
    reefAudio.play(score.player > score.rival ? "victory" : score.player < score.rival ? "defeat" : "reward");
    this.summary = this.voyageBattle?.onResult(score.player, score.rival, [...(this.twoTide ? this.matchKilled : this.killedIds)], this.spentCharms, this.twoTide ? this.tideScores : [score]) || undefined;
    this.render(score.player > score.rival ? "You rule the reef!" : score.rival > score.player ? "The rival rules this tide." : "The tide ends in a draw.");
    this.openSummary();
  }

  private drawResult(player: number, rival: number): void {
    if (this.twoTide) ({player, rival} = combinedScore(this.tideScores));
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const panel = pixelPanel(this, centerX, centerY, 560, 208);
    const title = this.intermission ? "TIDE 1 COMPLETE" : player > rival ? "YOU RULE THE REEF" : rival > player ? "RIVAL VICTORY" : "TIED TIDE";
    const heading = this.add.text(centerX, centerY - 43, title, this.textStyle(29, "#39ff14", true)).setOrigin(0.5);
    const score = this.add.text(centerX, centerY + 3, `${this.twoTide ? "TOTAL: " : ""}${player} PEARLS  ·  ${rival} PEARLS`, this.textStyle(19, "#ff5ca8", true)).setOrigin(0.5);
    const buttonFrame = pixelPanel(this, centerX, centerY + 58, 216, 48, 0x28545a);
    const button = this.add.rectangle(centerX, centerY + 58, 200, 32, 0x28545a).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => button.setFillStyle(0x3b6b65));
    button.on("pointerout", () => button.setFillStyle(0x28545a));
    const label = this.add.text(centerX, centerY + 58, this.intermission ? "NEXT TIDE" : this.voyageBattle ? "RETURN TO MAP" : "PLAY AGAIN", this.textStyle(16, "#eed49b")).setOrigin(0.5);
    button.once("pointerdown", () => {
      button.disableInteractive();
      this.resultAction();
    });
    this.ui?.add([panel, heading, score, buttonFrame, button, label]);
    if (this.twoTide) this.ui?.add(this.add.text(centerX, centerY - 78,
      this.tideScores.map((s, i) => `TIDE ${i + 1}: ${s.player}–${s.rival}`).join('  ·  '), this.textStyle(16, '#b8d7dc')).setOrigin(0.5));

  }

  private textStyle(size: number, color: string, _bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return pixelTextStyle(size, color === "#39ff14" ? "#eed49b" : color);
  }
}
