import { random, type RegionId, type Space } from "./maps.ts";

const ICONS: Record<Space, string[]> = {
  start: ["0001000", "0011100", "0111110", "0001000", "0001000", "0111110", "1111111"],
  battle: ["1000001", "1100011", "0110110", "0011100", "0011100", "0110110", "1100011"],
  fishing: ["0001111", "0010001", "0100001", "0100001", "1000101", "1000011", "1000000"],
  shop: ["0111110", "1100011", "1111111", "1010101", "1000001", "1011101", "1111111"],
  event: ["0111110", "1100011", "0000011", "0001110", "0001100", "0000000", "0001100"],
  hydration: ["0001000", "0011100", "0011100", "0111110", "1111111", "1111111", "0111110"],
  release: ["0001000", "0001100", "1111110", "0001100", "0001000", "1000001", "0111110"],
  boss: ["1001001", "1101011", "1111111", "0111110", "0101010", "0111110", "0011100"],
};
export function drawIcon(canvas: HTMLCanvasElement, type: Space, color: string): void {
  canvas.width = 28; canvas.height = 28;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = color;
  ICONS[type].forEach((row, y) => [...row].forEach((bit, x) => {
    if (bit === "1") ctx.fillRect(x * 4, y * 4, 4, 4);
  }));
}

// Native canvas geometry, snapped to a four-pixel grid. No stretched textures.
export function drawSeascape(canvas: HTMLCanvasElement, region: RegionId, seed: string): void {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width, h = canvas.height;
  const rng = random(`${seed}:${region}:scenery`);
  const rect = (x: number, y: number, width: number, height: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x / 4) * 4, Math.round(y / 4) * 4, Math.max(4, Math.round(width / 4) * 4), Math.max(4, Math.round(height / 4) * 4));
  };
  const palettes = {
    shoreline: ["#286d78", "#205f70", "#195467", "#144859", "#103f51", "#0c3646"],
    ocean: ["#163d59", "#143850", "#113047", "#10273c", "#101e32", "#0c182b"],
    bermuda: ["#272442", "#29233f", "#2c2242", "#302146", "#332349", "#302044"],
  };
  const palette = palettes[region];
  for (let x = 0; x < w; x += 4) rect(x, 0, 4, h, palette[Math.min(5, Math.floor(x / w * 6))]);
  // Current contours, broken into stepped dashes.
  for (let i = 0; i < 130; i++) {
    const x = rng() * w, y = rng() * h;
    rect(x, y, 12 + rng() * 36, 4, region === "bermuda" ? "#453254" : region === "ocean" ? "#1b3c50" : "#286277");
  }
  if (region === "shoreline") {
    for (let y = 0; y < h; y += 8) {
      const coast = 62 + Math.sin(y / 73) * 23 + Math.sin(y / 21) * 8;
      rect(0, y, coast + 32, 8, "#67a598");
      rect(0, y, coast + 16, 8, "#a3c8ae");
      rect(0, y, coast, 8, "#c4b483");
      rect(0, y, coast - 16, 8, "#918c60");
    }
    for (let i = 0; i < 42; i++) {
      const x = w * (0.28 + rng() * 0.7), y = i % 2 ? h - 32 - rng() * 48 : 38 + rng() * 32;
      const coral = ["#ca887c", "#b27892", "#679f91"][i % 3];
      rect(x, y, 8, 32, coral);
      rect(x - 12, y + 4, 8, 20, coral); rect(x - 12, y + 20, 28, 8, coral);
      rect(x + 16, y - 8, 8, 28, coral);
      rect(x - 8, y + 32, 36, 8, "#315861");
    }
    for (let i = 0; i < 15; i++) {
      const x = 150 + rng() * w * 0.45, y = h - 60 + rng() * 30;
      rect(x, y - 24, 4, 44, "#448778"); rect(x - 8, y - 8, 12, 4, "#448778"); rect(x + 4, y - 20, 12, 4, "#448778");
    }
  } else if (region === "ocean") {
    for (let i = 0; i < 9; i++) {
      const x = w * 0.32 + rng() * w * 0.38, y = 20 + rng() * 44;
      for (let level = 0; level < 5; level++) rect(x - level * 8, y + level * 8, 16 + level * 16, 8, level < 2 ? "#bbd8db" : "#779daf");
      rect(x - 32, y + 40, 80, 8, "#3c6b87");
      rect(x - 16, y + 48, 44, 12, "#2a4d67");
    }
    for (let i = 0; i < 20; i++) {
      const x = w * 0.55 + rng() * w * 0.45, tall = 20 + rng() * 70;
      rect(x, h - tall, 24 + rng() * 28, tall, "#162f40");
      rect(x + 8, h - tall - 8, 16, 8, "#284653");
      if (i % 3 === 0) rect(x + 12, h - tall - 24, 4, 8, "#5cb0ad");
    }
  } else {
    // Wrecks, vortex rings and forked lightning frame the navigable routes.
    for (let i = 0; i < 12; i++) {
      const x = 30 + rng() * w * 0.8, y = i % 2 ? h - 68 : 32;
      rect(x, y + 24, 68, 12, "#68516c"); rect(x + 8, y + 36, 48, 8, "#483950");
      rect(x + 28, y - 4, 4, 32, "#826778"); rect(x + 32, y, 20, 16, "#493c56");
    }
    const heartX = w - 100, heartY = Math.floor(h / 2);
    ctx.strokeStyle = "#765491"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(heartX, heartY - 155); ctx.lineTo(heartX - 145, heartY + 110); ctx.lineTo(heartX + 74, heartY + 110); ctx.closePath(); ctx.stroke();
    for (let i = 0; i < 24; i++) {
      const x = 200 + rng() * (w - 300), y = i % 2 ? h - 108 : 14;
      for (let step = 0; step < 9; step++) {
        const shift = step < 4 ? step * 4 : (8 - step) * 4;
        rect(x + shift, y + step * 8, 8, 12, step % 3 ? "#a291bd" : "#d4c6e4");
        if (step === 3) {
          rect(x + shift + 8, y + step * 8, 16, 4, "#a291bd");
          rect(x + shift + 20, y + step * 8 + 4, 4, 16, "#a291bd");
        }
      }
    }
    // Stepped whirlpools, curling rogue waves and waterspouts at the chart edges.
    for (let i = 0; i < 6; i++) {
      const x = 160 + i * (w - 380) / 6, y = i % 2 ? h - 55 : 62;
      for (let ring = 5; ring > 0; ring--) {
        const r = ring * 6;
        const shade = ring % 2 ? "#695081" : "#372c55";
        rect(x - r, y - r / 2, r * 2, 4, shade);
        rect(x - r, y + r / 2, r * 2, 4, shade);
        rect(x - r, y - r / 2, 4, r, shade);
        rect(x + r, y - r / 2, 4, r, shade);
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = 280 + i * (w - 540) / 4, y = i % 2 ? h - 76 : 20;
      for (let step = 0; step < 8; step++) {
        const span = 48 - step * 5, sway = Math.round(Math.sin(step) * 4);
        rect(x - span / 2 + sway, y + step * 7, span, 4, step % 2 ? "#726286" : "#9784aa");
      }
      rect(x - 32, y + 60, 64, 4, "#635681");
    }
    for (let i = 0; i < 5; i++) {
      const x = 80 + i * (w - 200) / 5, y = i % 2 ? h - 28 : 84;
      for (let step = 0; step < 7; step++) {
        rect(x + step * 8, y - step * 4, 8, 12 + step * 4, "#3f5579");
        rect(x + step * 8, y - step * 4, 8, 4, "#99b3c4");
      }
      rect(x + 48, y - 28, 24, 4, "#b1c1d2");
      rect(x + 68, y - 24, 4, 12, "#99b3c4");
    }
    for (let ring = 0; ring < 4; ring++) {
      ctx.strokeStyle = "#55416f";
      ctx.strokeRect(heartX - 35 - ring * 14, heartY - 35 - ring * 14, 70 + ring * 28, 70 + ring * 28);
    }
  }
  // Tiny fish silhouettes supply scale without competing with node symbols.
  for (let i = 0; i < 22; i++) {
    const x = 140 + rng() * (w - 220), y = 100 + rng() * (h - 200);
    rect(x, y, 12, 4, region === "bermuda" ? "#665277" : "#477888");
    rect(x - 4, y - 4, 4, 12, region === "bermuda" ? "#665277" : "#477888");
  }
}
