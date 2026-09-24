import type { RegionId } from "../run/maps.ts";

export type Movement = "gradual" | "darter" | "runner" | "drifter" | "lurker";
export const AREA_MOVEMENT: Record<RegionId, number> = { shoreline: 1, ocean: 1.35, bermuda: 1.7 };
export const MOVEMENTS: Record<Movement, { name: string; description: string; speed: number; range: number; interval: number }> = {
  gradual: { name: "Gradual Mover", description: "Drifts smoothly between nearby positions.", speed: 0.20, range: 0.24, interval: 1.6 },
  darter: { name: "Darter", description: "Short, sharp bursts with pauses between them.", speed: 0.65, range: 0.32, interval: 1.1 },
  runner: { name: "Runner", description: "Long, sustained runs from one end to the other.", speed: 0.34, range: 0.65, interval: 2.5 },
  drifter: { name: "Drifter", description: "Slow, broad sweeps across the water.", speed: 0.12, range: 0.45, interval: 2.4 },
  lurker: { name: "Lurker", description: "Waits in place, then makes a short sudden move.", speed: 0.40, range: 0.16, interval: 2.6 },
};
export const FISH_MOVEMENT: Record<string, Movement> = {
  minnow: "gradual", anchovy: "runner", sardine: "runner", goby: "lurker",
  octopus: "darter", crab: "lurker", blenny: "darter", shrimp: "darter",
  "sea-star": "lurker", swordfish: "runner", barracuda: "runner", "hypno-squid": "darter",
  lure: "drifter", "ocean-sunfish": "gradual", "garden-eel": "gradual", "hermit-crab": "lurker",
  flounder: "lurker", lionfish: "drifter", "mantis-shrimp": "darter", pufferfish: "drifter",
  boxfish: "gradual", needlefish: "runner", seahorse: "drifter", "electric-eel": "runner",
  "sea-urchin": "lurker", "invisible-ink-squid": "darter", "moray-eel": "runner",
};
export function movementFor(texture: string): Movement {
  const movement = FISH_MOVEMENT[texture];
  if (!movement) throw new Error("Assign a fishing movement pattern to " + texture);
  return movement;
}
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const ZONE_WIDTH = 0.25;
export const FISH_RADIUS = 0.025;
export const STEP = 1 / 60;

/** Normalized horizontal coordinates; rendering snaps to native pixels separately. */
export class FishingModel {
  fish = 0.5;
  zone = 0.5;
  progress = 0.3;
  elapsed = 0;
  distance = 0;
  status: "playing" | "caught" | "escaped" = "playing";
  private target = 0.5;
  private timer = 0.7;
  private burst = 0;
  private velocity = 0;
  private runDirection = 1;
  private rngState: number;
  readonly movement: Movement;
  readonly region: RegionId;
  constructor(movement: Movement, region: RegionId, seed: number) {
    this.movement = movement; this.region = region; this.rngState = seed >>> 0;
  }
  private rng(): number {
    this.rngState = (this.rngState + 0x6D2B79F5) >>> 0;
    let n = Math.imul(this.rngState ^ (this.rngState >>> 15), 1 | this.rngState);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  }
  snapshot(): FishingSnapshot {
    const { movement, region, fish, zone, progress, elapsed, distance, status, target, timer, burst, velocity, runDirection, rngState } = this;
    return { movement, region, fish, zone, progress, elapsed, distance, status, target, timer, burst, velocity, runDirection, rngState };
  }
  static restore(saved: FishingSnapshot): FishingModel {
    if (!validSnapshot(saved)) throw new Error("Invalid fishing save");
    return Object.assign(new FishingModel(saved.movement, saved.region, saved.rngState), saved);
  }
  get contained(): boolean { return Math.abs(this.fish - this.zone) + FISH_RADIUS <= ZONE_WIDTH / 2; }
  step(left: boolean, right: boolean): void {
    if (this.status !== "playing") return;
    this.elapsed += STEP;
    this.zone = clamp(this.zone + (Number(right) - Number(left)) * 0.8 * STEP, ZONE_WIDTH / 2, 1 - ZONE_WIDTH / 2);
    const profile = MOVEMENTS[this.movement], multiplier = AREA_MOVEMENT[this.region];
    this.timer -= STEP; this.burst -= STEP;
    if (this.timer <= 0) {
      this.timer = profile.interval * (0.75 + this.rng() * 0.5) / Math.sqrt(multiplier);
      let direction = this.rng() < 0.5 ? -1 : 1;
      if (this.movement === "runner") { this.runDirection *= -1; direction = this.runDirection; }
      const excursion = profile.range * multiplier * (0.5 + this.rng() * 0.5);
      this.target = clamp(this.fish + direction * excursion, FISH_RADIUS, 1 - FISH_RADIUS);
      this.burst = 0.35;
    }
    const old = this.fish;
    const delta = this.target - this.fish;
    const speed = profile.speed * multiplier;
    if (this.movement === "darter" || this.movement === "lurker") {
      this.velocity = this.burst > 0 ? Math.sign(delta) * speed : 0;
    } else {
      const desired = Math.sign(delta) * Math.min(speed, Math.abs(delta) * 3);
      this.velocity += clamp(desired - this.velocity, -1.4 * multiplier * STEP, 1.4 * multiplier * STEP);
    }
    const travel = this.velocity * STEP;
    this.fish = clamp(Math.abs(travel) > Math.abs(delta) ? this.target : this.fish + travel, FISH_RADIUS, 1 - FISH_RADIUS);
    this.distance += Math.abs(this.fish - old);
    if (this.elapsed > 1) this.progress = clamp(this.progress + (this.contained ? 0.085 : -0.065) * STEP, 0, 1);
    if (this.progress >= 1) this.status = "caught";
    else if (this.progress <= 0 || this.elapsed >= 60) this.status = "escaped";
  }
}
export interface FishingSnapshot {
  movement: Movement; region: RegionId; fish: number; zone: number; progress: number; elapsed: number;
  distance: number; status: "playing" | "caught" | "escaped"; target: number; timer: number; burst: number;
  velocity: number; runDirection: number; rngState: number;
}
export function validSnapshot(s: FishingSnapshot): boolean {
  return Boolean(s && Object.hasOwn(MOVEMENTS, s.movement) && Object.hasOwn(AREA_MOVEMENT, s.region)
    && ["playing", "caught", "escaped"].includes(s.status)
    && [s.fish, s.zone, s.progress, s.elapsed, s.distance, s.target, s.timer, s.burst, s.velocity, s.runDirection, s.rngState].every(Number.isFinite)
    && s.fish >= FISH_RADIUS && s.fish <= 1 - FISH_RADIUS && s.target >= FISH_RADIUS && s.target <= 1 - FISH_RADIUS
    && s.zone >= ZONE_WIDTH / 2 && s.zone <= 1 - ZONE_WIDTH / 2 && s.progress >= 0 && s.progress <= 1
    && s.elapsed >= 0 && s.elapsed <= 61 && s.distance >= 0 && Math.abs(s.velocity) <= 2
    && (s.runDirection === -1 || s.runDirection === 1) && Number.isInteger(s.rngState) && s.rngState >= 0 && s.rngState <= 4294967295);
}
