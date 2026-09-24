import type Phaser from "phaser";

export function pixelTextStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: '"Reef Pixel"', fontSize: `${Math.max(8, Math.round(size / 8) * 8)}px`, color, fontStyle: "normal", padding: { top: 0, bottom: 0 } };
}

/** Beveled, stepped frame drawn at native coordinates, including on wide panels. */
export function pixelPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, fill = 0x10333e): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const left = Math.round(x - width / 2), top = Math.round(y - height / 2);
  g.fillStyle(0x071924).fillRect(left + 4, top, width - 8, height).fillRect(left, top + 4, width, height - 8);
  g.fillStyle(0x537f79).fillRect(left + 4, top + 4, width - 8, height - 8);
  g.fillStyle(0xd4be83).fillRect(left + 4, top + 4, width - 8, 4).fillRect(left + 4, top + 8, 4, height - 16);
  g.fillStyle(0x173d49).fillRect(left + 8, top + height - 8, width - 12, 4).fillRect(left + width - 8, top + 8, 4, height - 16);
  g.fillStyle(fill).fillRect(left + 8, top + 8, width - 16, height - 16);
  return g;
}

export function pixelPearl(scene: Phaser.Scene, x: number, y: number, unit = 4): Phaser.GameObjects.Graphics {
  const pattern = ["...oooo...", ".ooppppoo.", ".owwppppo.", "owwwpppppo", "oppppppppo", "oppppppppo", "oppppppppo", ".oppppppo.", ".ooppppoo.", "...oooo..."];
  const colors: Record<string, number> = { o: 0xffb8d8, p: 0xff5ca8, w: 0xffffff };
  const g = scene.add.graphics();
  pattern.forEach((row, yy) => [...row].forEach((bit, xx) => {
    if (colors[bit]) g.fillStyle(colors[bit]).fillRect(Math.round(x - 5 * unit + xx * unit), Math.round(y - 5 * unit + yy * unit), unit, unit);
  }));
  return g;
}
