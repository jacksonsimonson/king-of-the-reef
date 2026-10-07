import { drawSeascape } from "./art.ts";
import type { RegionId, Space } from "./maps.ts";

export type EncounterSpace = Extract<Space, "shop" | "hydration" | "fishing" | "release" | "event">;
const TITLES: Record<EncounterSpace, string> = {
  shop: "The Shell Exchange", hydration: "The Living Spring", fishing: "The Quiet Jetty",
  release: "An Open Current", event: "Secrets of the Wreck",
};
export function isEncounterSpace(type: Space): type is EncounterSpace { return Object.hasOwn(TITLES, type); }
export function encounterTitle(type: Space): string { return isEncounterSpace(type) ? TITLES[type] : "Continue your voyage"; }

/** Original scene art drawn at native resolution on a four-pixel grid. */
export function drawEncounterArt(canvas: HTMLCanvasElement, type: Space, region: RegionId, seed: string): void {
  drawSeascape(canvas, region, seed);
  const ctx = canvas.getContext("2d")!;
  const center = Math.floor(canvas.width / 8) * 4;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(center + x, y, w, h);
  };
  const stone = region === "bermuda" ? "#796889" : region === "ocean" ? "#567e99" : "#6b9b92";
  const light = region === "bermuda" ? "#d4ace5" : "#afe1d5";
  const wood = "#916a55", dark = "#163c46", gold = "#f3d495";
  // Foreground seabed and rooted coral frame every encounter.
  rect(-canvas.width, 224, canvas.width * 2, 32, "#173c48");
  for (const x of [-272, 240]) {
    rect(x, 164, 12, 64, stone); rect(x - 20, 180, 12, 28, stone);
    rect(x - 20, 204, 40, 12, stone); rect(x + 16, 168, 12, 40, stone);
    rect(x - 28, 224, 72, 8, dark);
  }
  const fish = (x: number, y: number, color: string) => {
    rect(x, y, 28, 12, color); rect(x + 4, y - 4, 16, 20, color);
    rect(x - 8, y - 4, 8, 20, color); rect(x + 20, y, 4, 4, dark);
  };
  if (type === "shop") {
    // Striped canopy, shell signage, counter, jars and a hermit merchant.
    rect(-188, 196, 376, 28, dark); rect(-172, 188, 344, 28, wood);
    rect(-148, 80, 12, 120, wood); rect(136, 80, 12, 120, wood);
    for (let i = 0; i < 10; i++) {
      rect(-180 + i * 36, 64, 36, 32, i % 2 ? "#e6bf90" : "#bf7777");
      rect(-180 + i * 36, 96, 32, 12, i % 2 ? "#f6d5a1" : "#d68e85");
    }
    rect(-152, 52, 304, 12, gold); rect(-48, 20, 96, 32, wood);
    for (let i = 0; i < 5; i++) rect(-24 + i * 12, 28 + Math.abs(i - 2) * 4, 8, 16, gold);
    for (const x of [-112, -68, 76, 120]) {
      rect(x, 156, 24, 28, "#519f9b"); rect(x + 4, 148, 16, 8, gold); rect(x + 4, 160, 4, 16, light);
    }
    rect(-20, 128, 60, 52, "#ae829e"); rect(-12, 120, 44, 60, "#c597ad");
    rect(0, 136, 24, 24, "#765c85"); rect(8, 144, 8, 8, gold);
    rect(-36, 164, 68, 20, "#ecad87"); rect(-28, 152, 8, 16, "#ecad87"); rect(-8, 148, 8, 20, "#ecad87");
    rect(-28, 152, 4, 4, dark); rect(-8, 148, 4, 4, dark);
    rect(-48, 172, 16, 8, "#ecad87"); rect(-56, 160, 12, 12, "#ecad87");
    rect(-148, 212, 296, 8, gold);
  } else if (type === "hydration") {
    // A luminous spring framed by a stepped stone arch and shell basin.
    rect(-136, 192, 272, 28, stone); rect(-116, 184, 232, 28, light);
    rect(-96, 192, 192, 20, "#439fc0"); rect(-72, 196, 144, 8, "#96f4eb");
    for (let step = 0; step < 6; step++) {
      rect(-136 + step * 12, 160 - step * 20, 24, 40, stone);
      rect(112 - step * 12, 160 - step * 20, 24, 40, stone);
    }
    rect(-68, 48, 136, 20, stone); rect(-48, 40, 96, 12, light);
    rect(-20, 68, 40, 124, "#337c9f"); rect(-12, 68, 8, 120, "#80dedc"); rect(4, 76, 8, 116, "#b9fff1");
    for (const [x, y] of [[-60, 120], [44, 96], [-40, 76], [68, 148]]) {
      rect(x, y, 12, 12, "#69c6cb"); rect(x, y, 4, 4, "#d6fff1");
    }
    fish(-200, 120, gold); fish(168, 144, "#e6a6b0");
  } else if (type === "fishing") {
    rect(-216, 104, 260, 16, wood); rect(-200, 120, 12, 104, "#604f48"); rect(-20, 120, 12, 104, "#604f48");
    for (let x = -216; x < 44; x += 28) rect(x, 104, 4, 16, gold);
    rect(4, 56, 8, 48, wood); rect(12, 56, 96, 4, wood); rect(104, 60, 4, 112, gold);
    rect(100, 168, 16, 8, "#e38986");
    for (let x = -164; x < -80; x += 12) rect(x, 124, 4, 64, light);
    for (let y = 124; y < 192; y += 12) rect(-164, y, 84, 4, light);
    fish(56, 204, gold); fish(164, 140, "#e6a6b0"); fish(168, 192, light);
  } else if (type === "release") {
    for (let i = 0; i < 5; i++) {
      rect(-192 + i * 28, 84 + i * 12, 8, 140 - i * 12, stone);
      rect(-200 + i * 28, 104 + i * 12, 28, 8, light);
      fish(-40 + i * 44, 176 - i * 24, i % 2 ? light : gold);
    }
    rect(-72, 204, 232, 4, "#67b9bd"); rect(-12, 220, 208, 4, "#67b9bd");
  } else if (type === "event") {
    for (let i = 0; i < 5; i++) rect(-164 + i * 16, 148 + i * 12, 280 - i * 32, 12, i % 2 ? wood : "#624e50");
    rect(-68, 36, 12, 132, wood); rect(-56, 48, 108, 8, gold);
    for (let i = 0; i < 6; i++) rect(-52, 60 + i * 12, 92 - i * 12, 12, "#a1b1a0");
    rect(64, 180, 80, 40, "#886844"); rect(68, 172, 72, 12, gold); rect(64, 188, 80, 8, gold); rect(100, 184, 12, 20, gold);
    rect(88, 156, 8, 8, gold); rect(120, 140, 8, 8, light);
  }
}
