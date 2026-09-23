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
}

export function drawFishCard({
  scene,
  container,
  fish,
  x,
  y,
  size,
  selected = false,
}: DrawFishCardOptions): Phaser.GameObjects.Rectangle {
  const large = size >= 100;
  const frameColor = fish.owner === "player" ? COLORS.playerBlue : COLORS.rivalRed;
  const border = large ? (selected ? 6 : 4) : 3;
  const insetSize = large ? size - 12 : size - 16;
  const targetSize = large ? 128 : 64;

  const outer = scene.add.rectangle(x, y, size, size, COLORS.water)
    .setStrokeStyle(border, frameColor);
  const inset = scene.add.rectangle(x, y, insetSize, insetSize, COLORS.deep)
    .setStrokeStyle(2, 0x001725);

  const source = scene.textures.get(fish.texture).getSourceImage() as HTMLImageElement;
  const integerScale = Math.max(1, Math.floor(targetSize / Math.max(source.width, source.height)));
  const sprite = scene.add.image(x, y, fish.texture).setScale(integerScale);
  sprite.setFlipX(fish.owner === "rival");

  const arrows = fish.directions.map((direction) =>
    drawCardArrow(scene, x, y, size, insetSize, direction),
  );

  container.add([outer, inset, sprite, ...arrows]);
  return outer;
}

function drawCardArrow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  outerSize: number,
  insetSize: number,
  direction: Direction,
): Phaser.GameObjects.Graphics {
  const arrow = scene.add.graphics();
  const vector = VECTORS[direction];
  const perpendicularX = -vector.row;
  const perpendicularY = vector.column;
  const centerRadius = (outerSize + insetSize) / 4;
  const arrowLength = outerSize >= 100 ? 22 : 16;
  const halfWidth = outerSize >= 100 ? 11 : 8;
  const tipRadius = centerRadius + arrowLength / 2;
  const baseRadius = centerRadius - arrowLength / 2;
  const tipX = x + vector.column * tipRadius;
  const tipY = y + vector.row * tipRadius;
  const baseX = x + vector.column * baseRadius;
  const baseY = y + vector.row * baseRadius;

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
