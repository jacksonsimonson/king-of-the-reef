import Phaser from "phaser";
import { createStarterDeck, STARTERS, type FishCard } from "../data/starterFish";
import { drawFishCard } from "../ui/drawFishCard";
import { drawSeascape } from "../run/art";
import type { RegionId } from "../run/maps";
import { resolvePlacement, revealCard, revealTargets, type HandSlot } from "../combat";
import { cardDescription } from "../ui/cardVisuals";
import { pixelTextStyle, pixelPanel, pixelPearl } from "../ui/pixelTheme";
import { CHARMS, CHARM_IDS, charmCanvas, charmCard, refillSlot, shuffleHand, canPlayFish, PLAYS_PER_BATTLE, type CharmId } from "../data/tideCharms";

const COLORS = { deep: 0x00233a, water: 0x063d58, hover: 0x0b5267, green: 0x39ff14, pink: 0xff5ca8 };
const BOARD_SIZE = 5;
const CELL = 96;
const GAP = 6;
const HAND_SIZE = 5;
const HAND_CARD_SIZE = 144;
const BOARD_CARD_SIZE = 88;
const REEFS = new Set([2, 11, 18]);
interface VoyageBattle {
  playerDeck: FishCard[]; rivalDeck: FishCard[]; rng: () => number;
  region: RegionId; seed: string;
  charms: CharmId[];
  onUseCharm: (id: CharmId) => boolean;
  onResult: (player: number, rival: number, killedIds: string[]) => void;
  onComplete: () => void;
}

export class FoundationScene extends Phaser.Scene {
  private board: Array<FishCard | null> = [];
  private playerHand: HandSlot[] = [];
  private rivalHand: HandSlot[] = [];
  private playerDeck: FishCard[] = [];
  private rivalDeck: FishCard[] = [];
  private selectedId: string | null = null;
  private turn: "player" | "rival" = "player";
  private finished = false;
  private ui?: Phaser.GameObjects.Container;
  private placementPreview?: Phaser.GameObjects.Container;
  private previewIndex: number | null = null;
  private voyageBattle?: VoyageBattle;
  private killedIds = new Set<string>();
  private shocked = new Set<string>();
  private pendingReveal: "card" | "charm" | null = null;
  private charms: CharmId[] = [];
  private plays = { player: 0, rival: 0 };
  private waterColor = COLORS.water;
  private borderColor = COLORS.green;

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
    if (this.voyageBattle) {
      const canvas = document.createElement("canvas");
      canvas.width = this.scale.width; canvas.height = this.scale.height;
      drawSeascape(canvas, this.voyageBattle.region, this.voyageBattle.seed);
      this.textures.addCanvas("battle-seascape", canvas);
      const palette = { shoreline: [0x164d59, 0x73cbb1], ocean: [0x112f49, 0x80b9d2], bermuda: [0x302343, 0xa385c6] }[this.voyageBattle.region];
      [this.waterColor, this.borderColor] = palette;
    }
    this.resetMatch();
  }

  private resetMatch(): void {
    this.board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    const playerRound = this.dealRound(this.voyageBattle?.playerDeck ?? createStarterDeck("player"));
    const rivalRound = this.dealRound(this.voyageBattle?.rivalDeck ?? createStarterDeck("rival"));
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
    this.charms = this.voyageBattle?.charms ?? [...CHARM_IDS];
    this.plays = { player: 0, rival: 0 };
    this.render("Drag a fish to open water, or select it and choose a tile.");
    if (!this.playerHand.length) this.advanceTurn("player");
  }

  private render(message: string): void {
    this.placementPreview = undefined;
    this.previewIndex = null;
    this.ui?.destroy(true);
    this.ui = this.add.container(0, 0);
    const add = (object: Phaser.GameObjects.GameObject) => this.ui?.add(object);
    const scores = this.getScores();
    if (this.voyageBattle) {
      add(this.add.image(0, 0, "battle-seascape").setOrigin(0));
      add(this.add.rectangle(0, 0, this.scale.width, this.scale.height, COLORS.deep, 0.65).setOrigin(0));
    }

    add(pixelPanel(this, this.scale.width / 2, 48, this.scale.width - 32, 80));
    add(this.add.text(40, 22, "KING OF THE REEF", this.textStyle(24, "#eed49b")));
    add(this.add.text(40, 65, message, this.textStyle(16, "#b8ffd0")).setWordWrapWidth(1200));
    add(this.add.text(this.scale.width - 40, 26, `YOU ${scores.player}  ·  ${scores.rival} RIVAL`, this.textStyle(16, "#ffb8d8")).setOrigin(1, 0));
    add(this.add.text(this.scale.width - 40, 58, `FISH PLAYED ${this.plays.player}/${PLAYS_PER_BATTLE}  ·  ${this.plays.rival}/${PLAYS_PER_BATTLE}`, this.textStyle(16, "#b8d7dc")).setOrigin(1, 0));

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
        card.on("pointerdown", () => {
          if (!this.pendingReveal || !revealCard(this.rivalHand, slot.card.id)) return;
          const source = this.pendingReveal;
          this.pendingReveal = null;
          if (source === "charm") {
            if (!this.spendCharm("spyglass-pearl")) { slot.revealed = false; this.render("No Spyglass Pearl available."); return; }
            this.render("Rival card revealed. Play your fish when ready.");
          } else this.advanceTurn("player");
        });
        add(this.add.text(position.x, position.y + 90, "REVEAL", this.textStyle(16, "#81e8ed")).setOrigin(0.5));
      }
    });

    for (let index = 0; index < this.board.length; index += 1) {
      const row = Math.floor(index / BOARD_SIZE);
      const column = index % BOARD_SIZE;
      const x = board.x + column * (CELL + GAP);
      const y = board.y + row * (CELL + GAP);
      const reef = REEFS.has(index);
      const cell = this.add.rectangle(x + CELL / 2, y + CELL / 2, CELL, CELL, this.waterColor)
        .setStrokeStyle(3, reef ? COLORS.pink : this.borderColor, reef ? 1 : 0.72);
      add(cell);
      if (reef && !this.board[index]) this.drawPearl(x + CELL / 2, y + CELL / 2);
      if (this.board[index]) this.drawBoardFish(this.board[index]!, x, y);
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
      const cancel = this.add.text(38, board.y + 460, "CANCEL REVEAL", this.textStyle(8, "#eed49b")).setInteractive({ useHandCursor: true });
      cancel.on("pointerdown", () => { this.pendingReveal = null; this.render("Reveal canceled. Charm kept."); });
      add(cancel);
    }

    if (this.finished) this.drawResult(scores.player, scores.rival);
    else {
      const detail = this.add.text(40, this.scale.height - 68, "Hover a card to read its edges and ability.", this.textStyle(16, "#b8d7dc")).setWordWrapWidth(this.scale.width - 80);
      add(detail);
      this.events.removeAllListeners("card-hover");
      this.events.on("card-hover", (fish: FishCard) => detail.setText(cardDescription(fish) + (this.shocked.has(fish.id) ? " SHOCKED: all edges disabled for this battle." : "")));
      this.events.removeAllListeners("charm-hover");
      this.events.on("charm-hover", (id: CharmId) => detail.setText(`${CHARMS[id].name}: ${CHARMS[id].description}`));
    }
  }

  private boardSpan(): number {
    return BOARD_SIZE * CELL + (BOARD_SIZE - 1) * GAP;
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
    if (this.turn !== "player" || this.finished || this.pendingReveal) return;

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
      if (index !== null && !this.board[index] && !REEFS.has(index)) this.showPlacementPreview(index, slot.card);
      else this.clearPlacementPreview();
    });
    card.on("dragend", () => {
      const placement = this.previewIndex;
      this.clearPlacementPreview();
      if (placement !== null && !this.board[placement] && !REEFS.has(placement)) this.playPlayerCard(placement);
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

  private drawPearl(x: number, y: number): void {
    const pearl = pixelPearl(this, x, y - 4);
    const label = this.add.text(x, y + 28, "REEF", this.textStyle(11, "#ffb8d8", true)).setOrigin(0.5);
    this.ui?.add([pearl, label]);
  }

  private drawBoardFish(fish: FishCard, x: number, y: number): void {
    this.drawFishCard(fish, x + CELL / 2, y + CELL / 2, BOARD_CARD_SIZE, false);
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
    const row = Math.floor(index / BOARD_SIZE);
    const column = index % BOARD_SIZE;
    const board = this.boardOrigin();
    const x = board.x + column * (CELL + GAP) + CELL / 2;
    const y = board.y + row * (CELL + GAP) + CELL / 2;
    this.placementPreview = this.drawFishCard(fish, x, y, BOARD_CARD_SIZE, false).setAlpha(0.42).setDepth(30);
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
    if (row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE) return null;
    const localX = x - (board.x + column * (CELL + GAP));
    const localY = y - (board.y + row * (CELL + GAP));
    return localX <= CELL && localY <= CELL ? row * BOARD_SIZE + column : null;
  }

  private dealRound(school: FishCard[]): { hand: FishCard[]; deck: FishCard[] } {
    const healthy = school.filter((card) => card.condition === "healthy");
    for (let index = healthy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor((this.voyageBattle?.rng() ?? Math.random()) * (index + 1));
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
    this.ui?.add(this.add.text(x, y + 24, "USE BEFORE YOUR FISH", this.textStyle(8, "#8aa8b5")));
    CHARM_IDS.forEach((id, index) => {
      const count = this.charms.filter((entry) => entry === id).length;
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
  }

  private canUseCharm(id: CharmId): boolean {
    if (this.finished || this.turn !== "player" || this.pendingReveal || !canPlayFish(this.playerHand, this.plays.player) || !this.charms.includes(id)) return false;
    if (id === "spyglass-pearl") return revealTargets(this.rivalHand).length > 0;
    if (id === "current-conch") return this.playerDeck.length > 0;
    const selected = this.getSelectedPlayerCard();
    if (!selected) return false;
    return id !== "coral-mail" || selected.edges.length < 4;
  }

  private spendCharm(id: CharmId): boolean {
    if (this.voyageBattle) return this.voyageBattle.onUseCharm(id);
    const index = this.charms.indexOf(id);
    if (index < 0) return false;
    this.charms.splice(index, 1); return true;
  }

  private useCharm(id: CharmId): void {
    if (!this.canUseCharm(id)) return;
    if (id === "spyglass-pearl") {
      this.pendingReveal = "charm";
      this.render("Spyglass Pearl — choose a hidden rival card. Your fish play is still available.");
      return;
    }
    if (!this.spendCharm(id)) return;
    if (id === "current-conch") {
      shuffleHand(this.playerHand, this.playerDeck, () => this.voyageBattle?.rng() ?? Math.random());
      this.selectedId = null;
    } else {
      const slot = this.playerHand.find((entry) => !entry.played && entry.card.id === this.selectedId)!;
      slot.card = charmCard(slot.card, id);
    }
    this.render(`${CHARMS[id].name} used. Play your fish when ready.`);
  }

  private getSelectedPlayerCard(): FishCard | undefined {
    return this.playerHand.find((slot) => !slot.played && slot.card.id === this.selectedId)?.card;
  }

  private isLegalPlayerPlacement(index: number): boolean {
    return Boolean(this.selectedId && this.turn === "player" && !this.finished && !this.pendingReveal && !this.board[index] && !REEFS.has(index));
  }

  private playPlayerCard(index: number): void {
    const slot = this.playerHand.find((entry) => !entry.played && entry.card.id === this.selectedId);
    if (!slot || this.board[index] || REEFS.has(index) || this.turn !== "player" || this.finished || this.pendingReveal) return;
    slot.played = true;
    this.selectedId = null;
    const playedCard = slot.card;
    this.placeCard(index, playedCard);
    this.plays.player++;
    refillSlot(slot, this.playerDeck);
    if (playedCard.ability === "revelation" && revealTargets(this.rivalHand).length) {
      this.pendingReveal = "card";
      this.render("Revelation — choose an unrevealed card in the rival hand.");
      return;
    }
    this.advanceTurn("player");
  }

  private playRivalTurn(): void {
    const open = this.board.map((card, index) => (!card && !REEFS.has(index) ? index : -1)).filter((index) => index >= 0);
    const available = this.rivalHand.filter((slot) => !slot.played);
    if (!open.length || !available.length) return this.finishMatch();
    let best: { slot: HandSlot; index: number; score: number } | undefined;
    for (const slot of available) for (const index of open) {
      const score = this.evaluateMove(index, slot.card) + (this.voyageBattle?.rng() ?? Math.random()) * 1.5;
      if (!best || score > best.score) best = { slot, index, score };
    }
    if (!best) return this.finishMatch();
    best.slot.played = true;
    const playedCard = best.slot.card;
    this.placeCard(best.index, playedCard);
    this.plays.rival++;
    refillSlot(best.slot, this.rivalDeck);
    if (playedCard.ability === "revelation") {
      const targets = revealTargets(this.playerHand);
      if (targets.length) revealCard(this.playerHand, targets[Math.floor((this.voyageBattle?.rng() ?? Math.random()) * targets.length)].card.id);
    }
    this.advanceTurn("rival");
  }

  private advanceTurn(previous: "player" | "rival"): void {
    if (this.checkEnd()) return;
    const playerReady = canPlayFish(this.playerHand, this.plays.player);
    const rivalReady = canPlayFish(this.rivalHand, this.plays.rival);
    this.turn = rivalReady && (previous === "player" || !playerReady) ? "rival" : "player";
    this.render(this.turn === "rival" ? "The rival is choosing…" : "Your turn — drag a fish to open water.");
    if (this.turn === "rival") this.time.delayedCall(550, () => this.playRivalTurn());
  }

  private evaluateMove(index: number, card: FishCard): number {
    let simulation = this.board;
    const beforeScores = this.getScores(simulation);
    const opposingOwner = card.owner === "player" ? "rival" : "player";
    const opposingBefore = simulation.filter((fish) => fish?.owner === opposingOwner).length;
    const ownBefore = simulation.filter((fish) => fish?.owner === card.owner).length + 1;
    const result = resolvePlacement({ board: this.board, shocked: this.shocked }, index, card);
    simulation = result.board;
    const afterScores = this.getScores(simulation);
    const opposingAfter = simulation.filter((fish) => fish?.owner === opposingOwner).length;
    const ownScoreChange = afterScores[card.owner] - beforeScores[card.owner];
    const opposingScoreChange = afterScores[opposingOwner] - beforeScores[opposingOwner];
    const ownAfter = simulation.filter((fish) => fish?.owner === card.owner).length;
    const shockValue = simulation.reduce((value, fish) => value + (fish && result.shocked.has(fish.id) && !this.shocked.has(fish.id)
      ? (fish.owner === card.owner ? -1 : 1) * fish.edges.length : 0), 0);
    return ownScoreChange * 9 - opposingScoreChange * 7 + (opposingBefore - opposingAfter) * 6 - (ownBefore - ownAfter) * 6 + shockValue;
  }

  private placeCard(index: number, card: FishCard): void {
    const result = resolvePlacement({ board: this.board, shocked: this.shocked }, index, card);
    this.board = result.board;
    this.shocked = result.shocked;
    for (const id of result.killedIds) this.killedIds.add(id);
  }
  private getScores(board: Array<FishCard | null> = this.board): { player: number; rival: number } {
    let player = 0;
    let rival = 0;
    for (const index of REEFS) {
      if (board[index]?.owner === "player") player += 1;
      if (board[index]?.owner === "rival") rival += 1;
    }
    return { player, rival };
  }

  private checkEnd(): boolean {
    if ((!canPlayFish(this.playerHand, this.plays.player) && !canPlayFish(this.rivalHand, this.plays.rival))
      || !this.board.some((fish, index) => !fish && !REEFS.has(index))) {
      this.finishMatch();
      return true;
    }
    return false;
  }

  private finishMatch(): void {
    if (this.finished) return;
    this.finished = true;
    const score = this.getScores();
    this.voyageBattle?.onResult(score.player, score.rival, [...this.killedIds]);
    this.render(score.player > score.rival ? "You rule the reef!" : score.rival > score.player ? "The rival rules this tide." : "The tide ends in a draw.");
  }

  private drawResult(player: number, rival: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const panel = pixelPanel(this, centerX, centerY, 560, 208);
    const title = player > rival ? "YOU RULE THE REEF" : rival > player ? "RIVAL VICTORY" : "TIED TIDE";
    const heading = this.add.text(centerX, centerY - 43, title, this.textStyle(29, "#39ff14", true)).setOrigin(0.5);
    const score = this.add.text(centerX, centerY + 3, `${player} PEARLS  ·  ${rival} PEARLS`, this.textStyle(19, "#ff5ca8", true)).setOrigin(0.5);
    const buttonFrame = pixelPanel(this, centerX, centerY + 58, 216, 48, 0x28545a);
    const button = this.add.rectangle(centerX, centerY + 58, 200, 32, 0x28545a).setInteractive({ useHandCursor: true });
    button.on("pointerover", () => button.setFillStyle(0x3b6b65));
    button.on("pointerout", () => button.setFillStyle(0x28545a));
    const label = this.add.text(centerX, centerY + 58, this.voyageBattle ? "RETURN TO MAP" : "PLAY AGAIN", this.textStyle(16, "#eed49b")).setOrigin(0.5);
    button.once("pointerdown", () => {
      button.disableInteractive();
      if (this.voyageBattle) this.voyageBattle.onComplete();
      else this.resetMatch();
    });
    this.ui?.add([panel, heading, score, buttonFrame, button, label]);
  }

  private textStyle(size: number, color: string, _bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return pixelTextStyle(size, color === "#39ff14" ? "#eed49b" : color);
  }
}
