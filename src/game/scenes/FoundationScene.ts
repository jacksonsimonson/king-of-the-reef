import Phaser from "phaser";
import { createStarterSchool, type Direction, type FishCard } from "../data/starterFish";

const COLORS = { deep: 0x00233a, water: 0x063d58, hover: 0x0b5267, green: 0x39ff14, pink: 0xff5ca8 };
const BOARD_SIZE = 5;
const CELL = 82;
const GAP = 6;
const BOARD_X = 240;
const BOARD_Y = 92;
const REEFS = new Set([2, 11, 18]);
const DIRECTIONS: Record<Direction, { row: number; column: number; opposite: Direction; glyph: string }> = {
  up: { row: -1, column: 0, opposite: "down", glyph: "▲" },
  right: { row: 0, column: 1, opposite: "left", glyph: "▶" },
  down: { row: 1, column: 0, opposite: "up", glyph: "▼" },
  left: { row: 0, column: -1, opposite: "right", glyph: "◀" },
};

export class FoundationScene extends Phaser.Scene {
  private board: Array<FishCard | null> = [];
  private playerHand: FishCard[] = [];
  private rivalHand: FishCard[] = [];
  private selectedId: string | null = null;
  private turn: "player" | "rival" = "player";
  private finished = false;
  private ui?: Phaser.GameObjects.Container;

  constructor() { super("foundation"); }

  preload(): void {
    const base = import.meta.env.BASE_URL;
    for (const fish of ["minnow", "anchovy", "sardine", "goby"]) {
      this.load.image(fish, `${base}assets/fish/${fish}.png`);
    }
  }

  create(): void { this.resetMatch(); }

  private resetMatch(): void {
    this.board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    this.playerHand = createStarterSchool("player");
    this.rivalHand = createStarterSchool("rival");
    this.selectedId = null;
    this.turn = "player";
    this.finished = false;
    this.render("Choose a fish, then choose an open water tile.");
  }

  private render(message: string): void {
    this.ui?.destroy(true);
    this.ui = this.add.container(0, 0);
    const add = (object: Phaser.GameObjects.GameObject) => this.ui?.add(object);
    const scores = this.getScores();

    add(this.add.text(36, 26, "KING OF THE REEF", this.textStyle(24, "#39ff14", true)));
    add(this.add.text(36, 60, message, this.textStyle(15, "#b8ffd0")).setWordWrapWidth(825));
    add(this.add.text(716, 25, `YOU ${scores.player}  ·  ${scores.rival} RIVAL`, this.textStyle(18, "#ff5ca8", true)));

    for (let index = 0; index < this.board.length; index += 1) {
      const row = Math.floor(index / BOARD_SIZE);
      const column = index % BOARD_SIZE;
      const x = BOARD_X + column * (CELL + GAP);
      const y = BOARD_Y + row * (CELL + GAP);
      const reef = REEFS.has(index);
      const cell = this.add.rectangle(x + CELL / 2, y + CELL / 2, CELL, CELL, COLORS.water)
        .setStrokeStyle(3, reef ? COLORS.pink : COLORS.green, reef ? 1 : 0.72);
      add(cell);
      if (reef && !this.board[index]) this.drawPearl(x + CELL / 2, y + CELL / 2);
      if (this.board[index]) this.drawBoardFish(this.board[index]!, x, y);
      if (!reef && !this.board[index] && this.selectedId && this.turn === "player" && !this.finished) {
        cell.setInteractive({ useHandCursor: true })
          .on("pointerover", () => cell.setFillStyle(COLORS.hover))
          .on("pointerout", () => cell.setFillStyle(COLORS.water))
          .on("pointerdown", () => this.playPlayerCard(index));
      }
    }

    add(this.add.text(36, 110, "RIVAL", this.textStyle(14, "#ff5ca8", true)));
    add(this.add.text(36, 137, `${this.rivalHand.length} fish remain`, this.textStyle(16, "#f2fff7")));
    add(this.add.text(36, 188, "REEFS", this.textStyle(14, "#ff5ca8", true)));
    add(this.add.text(36, 215, "Push fish onto\n2 of 3 pearls\nto rule the reef.", this.textStyle(15, "#b8ffd0")).setLineSpacing(6));
    add(this.add.text(36, 565, this.turn === "player" ? "YOUR SCHOOL" : "RIVAL TURN", this.textStyle(16, "#39ff14", true)));
    this.playerHand.forEach((fish, index) => this.drawHandCard(fish, 190 + index * 175, 650));
    if (this.finished) this.drawResult(scores.player, scores.rival);
  }

  private drawPearl(x: number, y: number): void {
    const pearl = this.add.circle(x, y - 3, 22, COLORS.pink).setStrokeStyle(3, 0xffb8d8);
    const shine = this.add.circle(x - 7, y - 11, 5, 0xffffff, 0.9);
    const label = this.add.text(x, y + 28, "REEF", this.textStyle(11, "#ffb8d8", true)).setOrigin(0.5);
    this.ui?.add([pearl, shine, label]);
  }

  private drawBoardFish(fish: FishCard, x: number, y: number): void {
    const tint = fish.owner === "player" ? COLORS.green : COLORS.pink;
    const backing = this.add.rectangle(x + CELL / 2, y + CELL / 2, CELL - 8, CELL - 8, COLORS.deep, 0.94).setStrokeStyle(3, tint);
    const sprite = this.add.image(x + CELL / 2, y + CELL / 2, fish.texture).setDisplaySize(48, 48);
    if (fish.owner === "rival") sprite.setFlipX(true).setTint(0xffadd1);
    const arrow = this.add.text(x + CELL / 2, y + CELL / 2, DIRECTIONS[fish.direction].glyph, this.textStyle(19, fish.owner === "player" ? "#39ff14" : "#ff5ca8", true)).setOrigin(0.5);
    this.positionArrow(arrow, fish.direction, x + CELL / 2, y + CELL / 2, 31);
    this.ui?.add([backing, sprite, arrow]);
  }

  private drawHandCard(fish: FishCard, x: number, y: number): void {
    const selected = this.selectedId === fish.id;
    const card = this.add.rectangle(x, y, 154, 112, selected ? COLORS.hover : COLORS.water)
      .setStrokeStyle(selected ? 5 : 3, selected ? COLORS.pink : COLORS.green)
      .setInteractive({ useHandCursor: this.turn === "player" && !this.finished });
    const sprite = this.add.image(x - 42, y - 5, fish.texture).setDisplaySize(48, 48);
    const name = this.add.text(x - 70, y + 34, fish.name.toUpperCase(), this.textStyle(13, "#f2fff7", true));
    const type = this.add.text(x + 8, y + 9, fish.species, this.textStyle(11, "#b8ffd0")).setOrigin(0.5);
    const arrow = this.add.text(x + 45, y - 20, DIRECTIONS[fish.direction].glyph, this.textStyle(28, "#39ff14", true)).setOrigin(0.5);
    if (this.turn === "player" && !this.finished) {
      card.on("pointerdown", () => {
        this.selectedId = selected ? null : fish.id;
        this.render(this.selectedId ? `${fish.name} selected — choose open water.` : "Selection cleared.");
      });
    }
    this.ui?.add([card, sprite, name, type, arrow]);
  }

  private positionArrow(text: Phaser.GameObjects.Text, direction: Direction, x: number, y: number, offset: number): void {
    const delta = DIRECTIONS[direction];
    text.setPosition(x + delta.column * offset, y + delta.row * offset);
  }

  private playPlayerCard(index: number): void {
    const card = this.playerHand.find((fish) => fish.id === this.selectedId);
    if (!card || this.board[index] || REEFS.has(index) || this.turn !== "player") return;
    this.playerHand = this.playerHand.filter((fish) => fish.id !== card.id);
    this.selectedId = null;
    this.placeCard(index, card);
    if (this.checkEnd()) return;
    this.turn = "rival";
    this.render(`${card.name} entered the current. The rival is choosing…`);
    this.time.delayedCall(550, () => this.playRivalTurn());
  }

  private playRivalTurn(): void {
    const open = this.board.map((card, index) => (!card && !REEFS.has(index) ? index : -1)).filter((index) => index >= 0);
    if (!open.length || !this.rivalHand.length) return this.finishMatch();
    let best: { card: FishCard; index: number; score: number } | undefined;
    for (const card of this.rivalHand) for (const index of open) {
      const score = this.evaluateMove(index, card) + Math.random() * 1.5;
      if (!best || score > best.score) best = { card, index, score };
    }
    if (!best) return this.finishMatch();
    this.rivalHand = this.rivalHand.filter((fish) => fish.id !== best.card.id);
    this.placeCard(best.index, best.card);
    if (this.checkEnd()) return;
    this.turn = "player";
    this.render("Your turn — choose a fish.");
  }

  private evaluateMove(index: number, card: FishCard): number {
    const next = this.neighbor(index, card.direction);
    if (next === null) return 0;
    const target = this.board[next];
    if (!target || target.direction === DIRECTIONS[card.direction].opposite) return 0;
    const beyond = this.neighbor(next, card.direction);
    return (beyond !== null && REEFS.has(beyond) ? 9 : 0) + (target.owner === "player" ? 3 : 1);
  }

  private placeCard(index: number, card: FishCard): void {
    this.board[index] = card;
    const targetIndex = this.neighbor(index, card.direction);
    if (targetIndex === null) return;
    const target = this.board[targetIndex];
    if (!target || target.direction === DIRECTIONS[card.direction].opposite) return;
    const destination = this.neighbor(targetIndex, card.direction);
    if (destination === null) this.board[targetIndex] = null;
    else if (!this.board[destination]) {
      this.board[destination] = target;
      this.board[targetIndex] = null;
    }
  }

  private neighbor(index: number, direction: Direction): number | null {
    const row = Math.floor(index / BOARD_SIZE) + DIRECTIONS[direction].row;
    const column = (index % BOARD_SIZE) + DIRECTIONS[direction].column;
    return row < 0 || row >= BOARD_SIZE || column < 0 || column >= BOARD_SIZE ? null : row * BOARD_SIZE + column;
  }

  private getScores(): { player: number; rival: number } {
    let player = 0;
    let rival = 0;
    for (const index of REEFS) {
      if (this.board[index]?.owner === "player") player += 1;
      if (this.board[index]?.owner === "rival") rival += 1;
    }
    return { player, rival };
  }

  private checkEnd(): boolean {
    if (!this.playerHand.length && !this.rivalHand.length) { this.finishMatch(); return true; }
    return false;
  }

  private finishMatch(): void {
    this.finished = true;
    const score = this.getScores();
    this.render(score.player > score.rival ? "You rule the reef!" : score.rival > score.player ? "The rival rules this tide." : "The tide ends in a draw.");
  }

  private drawResult(player: number, rival: number): void {
    const panel = this.add.rectangle(462, 342, 460, 190, COLORS.deep, 0.97).setStrokeStyle(5, COLORS.pink);
    const title = player > rival ? "YOU RULE THE REEF" : rival > player ? "RIVAL VICTORY" : "TIED TIDE";
    const heading = this.add.text(462, 300, title, this.textStyle(28, "#39ff14", true)).setOrigin(0.5);
    const score = this.add.text(462, 345, `${player} PEARLS  ·  ${rival} PEARLS`, this.textStyle(18, "#ff5ca8", true)).setOrigin(0.5);
    const button = this.add.rectangle(462, 397, 190, 44, COLORS.green).setInteractive({ useHandCursor: true });
    const label = this.add.text(462, 397, "PLAY AGAIN", this.textStyle(16, "#00233a", true)).setOrigin(0.5);
    button.on("pointerdown", () => this.resetMatch());
    this.ui?.add([panel, heading, score, button, label]);
  }

  private textStyle(size: number, color: string, bold = false): Phaser.Types.GameObjects.Text.TextStyle {
    return { color, fontFamily: "monospace", fontSize: `${size}px`, fontStyle: bold ? "bold" : "normal" };
  }
}
