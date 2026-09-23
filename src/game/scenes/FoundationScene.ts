import Phaser from "phaser";
import { createStarterDeck, STARTERS, type Direction, type FishCard } from "../data/starterFish";
import { drawFishCard } from "../ui/drawFishCard";

const COLORS = { deep: 0x00233a, water: 0x063d58, hover: 0x0b5267, green: 0x39ff14, pink: 0xff5ca8 };
const BOARD_SIZE = 5;
const CELL = 96;
const GAP = 6;
const HAND_SIZE = 5;
const HAND_CARD_SIZE = 144;
const BOARD_CARD_SIZE = 88;
const REEFS = new Set([2, 11, 18]);
const DIRECTIONS: Record<Direction, { row: number; column: number; opposite: Direction }> = {
  up: { row: -1, column: 0, opposite: "down" },
  right: { row: 0, column: 1, opposite: "left" },
  down: { row: 1, column: 0, opposite: "up" },
  left: { row: 0, column: -1, opposite: "right" },
};

interface HandSlot { card: FishCard; played: boolean }

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

  constructor() { super("foundation"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of STARTERS) {
      this.load.image(fish.texture, `${base}assets/fish/${fish.texture}.png`);
    }
  }

  create(): void { this.resetMatch(); }

  private resetMatch(): void {
    this.board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    const playerRound = this.dealRound(createStarterDeck("player"));
    const rivalRound = this.dealRound(createStarterDeck("rival"));
    this.playerHand = playerRound.hand.map((card) => ({ card, played: false }));
    this.rivalHand = rivalRound.hand.map((card) => ({ card, played: false }));
    this.playerDeck = playerRound.deck;
    this.rivalDeck = rivalRound.deck;
    this.selectedId = null;
    this.turn = "player";
    this.finished = false;
    this.render("Drag a fish to open water, or select it and choose a tile.");
  }

  private render(message: string): void {
    this.placementPreview = undefined;
    this.previewIndex = null;
    this.ui?.destroy(true);
    this.ui = this.add.container(0, 0);
    const add = (object: Phaser.GameObjects.GameObject) => this.ui?.add(object);
    const scores = this.getScores();

    add(this.add.text(40, 26, "KING OF THE REEF", this.textStyle(27, "#39ff14", true)));
    add(this.add.text(40, 65, message, this.textStyle(16, "#b8ffd0")).setWordWrapWidth(1200));
    add(this.add.text(this.scale.width - 325, 28, `YOU ${scores.player}  ·  ${scores.rival} RIVAL`, this.textStyle(20, "#ff5ca8", true)));

    const board = this.boardOrigin();
    this.drawSidePanel(38, board.y, "YOUR DECK", this.playerDeck.length, "player");
    this.drawPowerups(38, board.y + 230, "YOUR POWERUPS");
    this.drawSidePanel(this.scale.width - 194, board.y, "RIVAL DECK", this.rivalDeck.length, "rival");
    this.drawPowerups(this.scale.width - 194, board.y + 230, "RIVAL POWERUPS");

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
      this.drawCardBack(position.x, position.y, HAND_CARD_SIZE, "rival", undefined, slot.played ? 0.22 : 1);
    });

    for (let index = 0; index < this.board.length; index += 1) {
      const row = Math.floor(index / BOARD_SIZE);
      const column = index % BOARD_SIZE;
      const x = board.x + column * (CELL + GAP);
      const y = board.y + row * (CELL + GAP);
      const reef = REEFS.has(index);
      const cell = this.add.rectangle(x + CELL / 2, y + CELL / 2, CELL, CELL, COLORS.water)
        .setStrokeStyle(3, reef ? COLORS.pink : COLORS.green, reef ? 1 : 0.72);
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
            cell.setFillStyle(COLORS.water);
            this.clearPlacementPreview();
          })
          .on("pointerdown", () => this.playPlayerCard(index));
      }
    }

    if (this.finished) this.drawResult(scores.player, scores.rival);
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
    if (this.turn !== "player" || this.finished) return;

    card.setInteractive({ useHandCursor: true });
    this.input.setDraggable(card);
    let dragged = false;
    card.on("dragstart", () => {
      dragged = true;
      this.selectedId = slot.card.id;
      card.setDepth(100).setScale(1.04);
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
    const pearl = this.add.circle(x, y - 3, 22, COLORS.pink).setStrokeStyle(3, 0xffb8d8);
    const shine = this.add.circle(x - 7, y - 11, 5, 0xffffff, 0.9);
    const label = this.add.text(x, y + 28, "REEF", this.textStyle(11, "#ffb8d8", true)).setOrigin(0.5);
    this.ui?.add([pearl, shine, label]);
  }

  private drawBoardFish(fish: FishCard, x: number, y: number): void {
    this.drawFishCard(fish, x + CELL / 2, y + CELL / 2, BOARD_CARD_SIZE, false);
  }

  private drawFishCard(fish: FishCard, x: number, y: number, size: number, selected: boolean, silhouette = false): Phaser.GameObjects.Container {
    if (!this.ui) throw new Error("Card UI container is unavailable");
    return drawFishCard({ scene: this, container: this.ui, fish, x, y, size, selected, silhouette });
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
      const swap = Math.floor(Math.random() * (index + 1));
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
    const diamond = this.add.rectangle(0, 0, size * 0.4, size * 0.4, color, 0.22).setStrokeStyle(2, color).setAngle(45);
    const pearl = this.add.circle(0, 0, Math.max(5, size * 0.08), COLORS.pink).setStrokeStyle(2, 0xffb8d8);
    card.add([back, inset, diamond, pearl]).setAlpha(alpha);
    this.ui?.add(card);
    if (count !== undefined) this.ui?.add(this.add.text(x, y + size / 2 + 15, `${count} IN DECK`, this.textStyle(12, "#b8ffd0", true)).setOrigin(0.5, 0));
    return card;
  }

  private drawPowerups(x: number, y: number, label: string): void {
    this.ui?.add(this.add.text(x, y, label, this.textStyle(13, "#ff5ca8", true)));
    for (let index = 0; index < 3; index += 1) {
      const slot = this.add.rectangle(x + 30 + index * 44, y + 52, 36, 48, COLORS.deep, 0.75).setStrokeStyle(2, COLORS.pink, 0.65);
      this.ui?.add(slot);
    }
    this.ui?.add(this.add.text(x, y + 86, "EMPTY", this.textStyle(11, "#8aa8b5", true)));
  }

  private getSelectedPlayerCard(): FishCard | undefined {
    return this.playerHand.find((slot) => !slot.played && slot.card.id === this.selectedId)?.card;
  }

  private isLegalPlayerPlacement(index: number): boolean {
    return Boolean(this.selectedId && this.turn === "player" && !this.finished && !this.board[index] && !REEFS.has(index));
  }

  private playPlayerCard(index: number): void {
    const slot = this.playerHand.find((entry) => !entry.played && entry.card.id === this.selectedId);
    if (!slot || this.board[index] || REEFS.has(index) || this.turn !== "player") return;
    slot.played = true;
    this.selectedId = null;
    this.placeCard(index, slot.card);
    if (this.checkEnd()) return;
    this.turn = "rival";
    this.render(`${slot.card.name} entered the current. The rival is choosing…`);
    this.time.delayedCall(550, () => this.playRivalTurn());
  }

  private playRivalTurn(): void {
    const open = this.board.map((card, index) => (!card && !REEFS.has(index) ? index : -1)).filter((index) => index >= 0);
    const available = this.rivalHand.filter((slot) => !slot.played);
    if (!open.length || !available.length) return this.finishMatch();
    let best: { slot: HandSlot; index: number; score: number } | undefined;
    for (const slot of available) for (const index of open) {
      const score = this.evaluateMove(index, slot.card) + Math.random() * 1.5;
      if (!best || score > best.score) best = { slot, index, score };
    }
    if (!best) return this.finishMatch();
    best.slot.played = true;
    this.placeCard(best.index, best.slot.card);
    if (this.checkEnd()) return;
    this.turn = "player";
    this.render("Your turn — drag a fish to open water.");
  }

  private evaluateMove(index: number, card: FishCard): number {
    const simulation = [...this.board];
    const beforeScores = this.getScores(simulation);
    const opposingOwner = card.owner === "player" ? "rival" : "player";
    const opposingBefore = simulation.filter((fish) => fish?.owner === opposingOwner).length;
    simulation[index] = card;
    this.resolveEdges(simulation, index, card);
    const afterScores = this.getScores(simulation);
    const opposingAfter = simulation.filter((fish) => fish?.owner === opposingOwner).length;
    const ownScoreChange = afterScores[card.owner] - beforeScores[card.owner];
    const opposingScoreChange = afterScores[opposingOwner] - beforeScores[opposingOwner];
    return ownScoreChange * 9 - opposingScoreChange * 7 + (opposingBefore - opposingAfter) * 6;
  }

  private placeCard(index: number, card: FishCard): void {
    this.board[index] = card;
    this.resolveEdges(this.board, index, card);
  }

  private resolveEdges(board: Array<FishCard | null>, placedIndex: number, card: FishCard): void {
    let sourceIndex = placedIndex;
    for (const edge of card.edges) {
      if (edge.effect === "weak") continue;
      if (edge.effect === "wave") {
        this.resolveWave(board, sourceIndex, edge.direction);
        continue;
      }
      if (edge.effect === "hook") {
        this.resolveHook(board, sourceIndex, edge.direction);
        continue;
      }

      const targetIndex = this.neighbor(sourceIndex, edge.direction);
      if (targetIndex === null) continue;
      const target = board[targetIndex];
      if (!target || this.edgeBlocks(target, edge.direction, edge.effect)) continue;

      if (edge.effect === "swap") {
        board[sourceIndex] = target;
        board[targetIndex] = card;
        sourceIndex = targetIndex;
      } else {
        this.tryPush(board, targetIndex, edge.direction, edge.effect === "bigger-fish");
      }
    }
  }

  private resolveHook(board: Array<FishCard | null>, sourceIndex: number, direction: Direction): void {
    const gapIndex = this.neighbor(sourceIndex, direction);
    if (gapIndex === null || board[gapIndex]) return;
    const targetIndex = this.neighbor(gapIndex, direction);
    if (targetIndex === null) return;
    const target = board[targetIndex];
    if (!target || this.edgeBlocks(target, direction, "hook")) return;
    board[gapIndex] = target;
    board[targetIndex] = null;
  }

  private resolveWave(board: Array<FishCard | null>, sourceIndex: number, direction: Direction): void {
    const forward = DIRECTIONS[direction];
    const perpendicular = { row: forward.column, column: -forward.row };
    for (const spread of [-1, 0, 1]) {
      const rowStep = forward.row + perpendicular.row * spread;
      const columnStep = forward.column + perpendicular.column * spread;
      const ray: number[] = [];
      for (let distance = 1; distance < BOARD_SIZE; distance += 1) {
        const rayIndex = this.offsetNeighbor(sourceIndex, rowStep * distance, columnStep * distance);
        if (rayIndex === null) break;
        ray.push(rayIndex);
      }
      for (let rayIndex = ray.length - 1; rayIndex >= 0; rayIndex -= 1) {
        const targetIndex = ray[rayIndex];
        const target = board[targetIndex];
        if (!target || this.edgeBlocks(target, direction, "wave")) continue;
        const destination = this.offsetNeighbor(targetIndex, rowStep, columnStep);
        if (destination === null) board[targetIndex] = null;
        else if (!board[destination]) {
          board[destination] = target;
          board[targetIndex] = null;
        }
      }
    }
  }

  private tryPush(board: Array<FishCard | null>, targetIndex: number, direction: Direction, remove: boolean): boolean {
    const target = board[targetIndex];
    if (!target) return false;
    const destination = this.neighbor(targetIndex, direction);
    if (destination !== null && board[destination]) return false;
    board[targetIndex] = null;
    if (!remove && destination !== null) board[destination] = target;
    return true;
  }

  private edgeBlocks(target: FishCard, incomingDirection: Direction, effect: FishCard["edges"][number]["effect"]): boolean {
    const defendingDirection = DIRECTIONS[incomingDirection].opposite;
    const defender = target.edges.find((edge) => edge.direction === defendingDirection);
    if (!defender) return false;
    if (effect === "double" || effect === "hook") return defender.effect !== "standard";
    return true;
  }

  private offsetNeighbor(index: number, rowOffset: number, columnOffset: number): number | null {
    const row = Math.floor(index / BOARD_SIZE) + rowOffset;
    const column = (index % BOARD_SIZE) + columnOffset;
    return row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE ? null : row * BOARD_SIZE + column;
  }

  private neighbor(index: number, direction: Direction): number | null {
    const vector = DIRECTIONS[direction];
    return this.offsetNeighbor(index, vector.row, vector.column);
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
    if (this.playerHand.every((slot) => slot.played) && this.rivalHand.every((slot) => slot.played)) {
      this.finishMatch();
      return true;
    }
    return false;
  }

  private finishMatch(): void {
    this.finished = true;
    const score = this.getScores();
    this.render(score.player > score.rival ? "You rule the reef!" : score.rival > score.player ? "The rival rules this tide." : "The tide ends in a draw.");
  }

  private drawResult(player: number, rival: number): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const panel = this.add.rectangle(centerX, centerY, 480, 196, COLORS.deep, 0.97).setStrokeStyle(5, COLORS.pink);
    const title = player > rival ? "YOU RULE THE REEF" : rival > player ? "RIVAL VICTORY" : "TIED TIDE";
    const heading = this.add.text(centerX, centerY - 43, title, this.textStyle(29, "#39ff14", true)).setOrigin(0.5);
    const score = this.add.text(centerX, centerY + 3, `${player} PEARLS  ·  ${rival} PEARLS`, this.textStyle(19, "#ff5ca8", true)).setOrigin(0.5);
    const button = this.add.rectangle(centerX, centerY + 58, 196, 46, COLORS.green).setInteractive({ useHandCursor: true });
    const label = this.add.text(centerX, centerY + 58, "PLAY AGAIN", this.textStyle(16, "#00233a", true)).setOrigin(0.5);
    button.on("pointerdown", () => this.resetMatch());
    this.ui?.add([panel, heading, score, button, label]);
  }

  private textStyle(size: number, color: string, bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return { color, fontFamily: "monospace", fontSize: `${size}px`, fontStyle: bold ? "bold" : "normal" };
  }
}
