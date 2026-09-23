import Phaser from "phaser";
import type { CardEdge, Direction, EdgeEffect, FishCard } from "../data/starterFish";

const COLORS = {
  deep: 0x00233a,
  water: 0x063d58,
  playerBlue: 0x1597ff,
  rivalRed: 0xff3b3b,
};

const EFFECT_COLORS: Record<EdgeEffect, number> = {
  standard: 0xf2fff7,
  double: 0x62e9ff,
  weak: 0xffd65c,
  "bigger-fish": 0xff6b5f,
  swap: 0xc987ff,
  hook: 0xffa34d,
  wave: 0x55bfff,
};

const VECTORS: Record<Direction, { row: number; column: number }> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

const STANDARD_ARROW_PATTERN = [
  "....#...",
  "....##..",
  ".....##.",
  "########",
  "########",
  ".....##.",
  "....##..",
  "....#...",
];

const DOUBLE_ARROW_PATTERN = [
  "#...#...",
  ".#...#..",
  "..#...#.",
  "...#...#",
  "...#...#",
  "..#...#.",
  ".#...#..",
  "#...#...",
];

const SHIELD_PATTERN = [
  "########",
  "########",
  "########",
  "########",
  ".######.",
  ".######.",
  "..####..",
  "...##...",
];

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

  const edgeBadges = fish.edges.map((edge) =>
    drawEdgeBadge(scene, size, edge),
  );

  card.add([outer, inset, sprite, ...edgeBadges]);
  parent.add(card);
  card.setDepth(2);
  return card;
}

export function drawEdgeBadge(
  scene: Phaser.Scene,
  outerSize: number,
  edge: CardEdge,
): Phaser.GameObjects.Container {
  const large = outerSize >= 100;
  const badgeSize = large ? 20 : 14;
  const radius = outerSize / 2;
  const vector = VECTORS[edge.direction];
  const angle = isArrow(edge.effect) ? directionAngle(edge.direction) : 0;
  const badge = drawEffectBadge(scene, edge.effect, badgeSize, angle)
    .setPosition(vector.column * radius, vector.row * radius);
  return badge;
}

export function drawEffectBadge(
  scene: Phaser.Scene,
  effect: EdgeEffect,
  badgeSize = 30,
  angle = 0,
): Phaser.GameObjects.Container {
  const badge = scene.add.container(0, 0);
  const color = EFFECT_COLORS[effect];
  const box = scene.add.rectangle(0, 0, badgeSize, badgeSize, COLORS.deep, 0.96)
    .setStrokeStyle(badgeSize >= 28 ? 3 : 2, color, 1);
  const icon = drawEdgeIcon(scene, effect, badgeSize);
  icon.setAngle(angle);
  badge.add([box, icon]);
  return badge;
}

function directionAngle(direction: Direction): number {
  if (direction === "down") return 90;
  if (direction === "left") return 180;
  if (direction === "up") return 270;
  return 0;
}

function drawEdgeIcon(scene: Phaser.Scene, effect: EdgeEffect, badgeSize: number): Phaser.GameObjects.Graphics {
  const color = EFFECT_COLORS[effect];
  if (effect === "standard") return drawPixelPattern(scene, STANDARD_ARROW_PATTERN, color, badgeSize);
  if (effect === "double") return drawPixelPattern(scene, DOUBLE_ARROW_PATTERN, color, badgeSize);
  if (effect === "weak") return drawPixelPattern(scene, SHIELD_PATTERN, color, badgeSize);

  const icon = scene.add.graphics();
  const extent = badgeSize >= 28 ? 8 : badgeSize >= 20 ? 6 : 4;
  const stroke = badgeSize >= 28 ? 3 : badgeSize >= 20 ? 2 : 1;
  icon.fillStyle(color, 1);
  icon.lineStyle(stroke, color, 1);

  if (effect === "bigger-fish") {
    const toothHalf = extent >= 6 ? 2 : 1;
    for (const x of [-extent + 2, 0, extent - 2]) {
      icon.fillTriangle(x - toothHalf, -extent, x + toothHalf, -extent, x, -1);
      icon.fillTriangle(x - toothHalf, extent, x + toothHalf, extent, x, 1);
    }
  } else if (effect === "swap") {
    const y = Math.max(2, Math.floor(extent / 2));
    icon.fillRect(-extent, -y - 1, extent + 2, 2);
    icon.fillTriangle(1, -y - 3, extent, -y, 1, -y + 3);
    icon.fillRect(-2, y - 1, extent + 2, 2);
    icon.fillTriangle(-1, y - 3, -extent, y, -1, y + 3);
  } else if (effect === "hook") {
    icon.beginPath();
    icon.moveTo(-extent, -extent + 1);
    icon.lineTo(2, -extent + 1);
    icon.lineTo(extent, -2);
    icon.lineTo(extent, 2);
    icon.lineTo(2, extent);
    icon.lineTo(-2, extent);
    icon.lineTo(-extent + 1, 2);
    icon.strokePath();
    icon.fillTriangle(-extent, -extent, -extent, 0, -1, -extent + 1);
  } else {
    const waveOffset = Math.max(2, extent - 2);
    for (const y of [-waveOffset, 0, waveOffset]) {
      icon.beginPath();
      icon.moveTo(-extent, y + 1);
      icon.lineTo(-Math.floor(extent / 2), y - 1);
      icon.lineTo(0, y + 1);
      icon.lineTo(Math.floor(extent / 2), y - 1);
      icon.lineTo(extent, y + 1);
      icon.strokePath();
    }
  }

  return icon;
}

function drawPixelPattern(
  scene: Phaser.Scene,
  pattern: string[],
  color: number,
  badgeSize: number,
): Phaser.GameObjects.Graphics {
  const icon = scene.add.graphics();
  const pixelSize = badgeSize >= 28 ? 2 : 1;
  const patternSize = pattern.length * pixelSize;
  const start = -patternSize / 2;
  icon.fillStyle(color, 1);
  pattern.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") icon.fillRect(start + x * pixelSize, start + y * pixelSize, pixelSize, pixelSize);
    });
  });
  return icon;
}

function isArrow(effect: EdgeEffect): boolean {
  return effect === "standard" || effect === "double";
}
