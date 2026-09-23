import Phaser from "phaser";
import type { Direction, FishCard } from "../data/starterFish";

const COLORS = {
  deep: 0x00233a,
  water: 0x063d58,
  playerBlue: 0x1597ff,
  rivalRed: 0xff3b3b,
  arrow: 0xf2fff7,
};

const VECTORS: Record<Direction, { row: number; column: number }> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

export interface DrawFishCardOptions {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  fish: FishCard;
  x: number;
  y: number;
  size: number;
  selected?: boolean;
  silhouette?: boolean;
}

export function drawFishCard({
  scene,
  container: parent,
  fish,
  x,
  y,
  size,
  selected = false,
  silhouette = false,
}: DrawFishCardOptions): Phaser.GameObjects.Container {
  const large = size >= 100;
  const frameColor = fish.owner === "player" ? COLORS.playerBlue : COLORS.rivalRed;
  const border = large ? (selected ? 6 : 4) : 3;
  const insetSize = large ? size - 12 : size - 16;
  const card = scene.add.container(x, y).setSize(size, size);

  const outer = scene.add.rectangle(0, 0, size, size, COLORS.water)
    .setStrokeStyle(border, frameColor);
  const inset = scene.add.rectangle(0, 0, insetSize, insetSize, COLORS.deep)
    .setStrokeStyle(2, 0x001725);

  const integerScale = large ? 2 : 1;
  const sprite = scene.add.image(0, 0, fish.texture).setScale(integerScale);
  sprite.setFlipX(fish.owner === "rival");
  if (silhouette) {
    outer.setAlpha(0.3);
    inset.setAlpha(0.3);
    sprite.setTintFill(fish.owner === "player" ? 0x0a568a : 0x8a2020).setAlpha(0.42);
  }

  const arrows = fish.directions.map((direction) =>
    drawCardArrow(scene, size, insetSize, direction),
  );

  card.add([outer, inset, sprite, ...arrows]);
  parent.add(card);
  card.setDepth(2);
  return card;
}

function drawCardArrow(
  scene: Phaser.Scene,
  outerSize: number,
  insetSize: number,
  direction: Direction,
): Phaser.GameObjects.Graphics {
  const arrow = scene.add.graphics();
  const vector = VECTORS[direction];
  const perpendicularX = -vector.row;
  const perpendicularY = vector.column;
  const innerEdge = insetSize / 2;
  const outerEdge = outerSize / 2;
  const protrusion = outerSize >= 100 ? 8 : 6;
  const halfWidth = outerSize >= 100 ? 12 : 8;
  // The sprite canvas ends before innerEdge. Starting the arrow at innerEdge
  // guarantees that no opaque fish pixel can overlap it. The tip deliberately
  // extends beyond the outer card border for a stronger directional silhouette.
  const baseRadius = innerEdge;
  const tipRadius = outerEdge + protrusion;
  const tipX = vector.column * tipRadius;
  const tipY = vector.row * tipRadius;
  const baseX = vector.column * baseRadius;
  const baseY = vector.row * baseRadius;

  arrow.fillStyle(COLORS.arrow, 1);
  arrow.lineStyle(2, COLORS.deep, 1);
  arrow.beginPath();
  arrow.moveTo(tipX, tipY);
  arrow.lineTo(baseX + perpendicularX * halfWidth, baseY + perpendicularY * halfWidth);
  arrow.lineTo(baseX - perpendicularX * halfWidth, baseY - perpendicularY * halfWidth);
  arrow.closePath();
  arrow.fillPath();
  arrow.strokePath();
  return arrow;
}
