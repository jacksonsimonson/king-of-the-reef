import type { FishCard } from "../data/starterFish.ts";
import { REGIONS } from "../run/maps.ts";
import { drawSeascape } from "../run/art.ts";
import { cardElement } from "../ui/cardElement.ts";
import { AREA_MOVEMENT, FishingModel, MOVEMENTS, STEP, ZONE_WIDTH, type FishingSnapshot } from "./model.ts";

export class FishingSession {
  private dialog = document.createElement("dialog");
  private canvas = document.createElement("canvas");
  private status = document.createElement("p");
  private action = document.createElement("button");
  private progress = document.createElement("progress");
  private keys = new Set<string>();
  private model: FishingModel;
  private phase: "playing" | "paused" | "caught" = "paused";
  private frame = 0;
  private lastTime = 0;
  private accumulator = 0;
  private saveTime = 0;
  private controller = new AbortController();
  private disposed = false;
  private scenery = document.createElement("canvas");
  constructor(private fish: FishCard, snapshot: FishingSnapshot, seed: string, resumed: boolean,
    private onSave: (snapshot: FishingSnapshot) => void,
    private onFinish: (snapshot: FishingSnapshot) => void, private onClose: () => void) {
    this.model = FishingModel.restore(snapshot);
    this.dialog.className = "voyage-dialog fishing-dialog";
    this.dialog.setAttribute("aria-label", "Fishing for " + fish.name);
    const heading = document.createElement("h3"); heading.textContent = "Fishing · " + REGIONS.find((r) => r.id === snapshot.region)!.name;
    const layout = document.createElement("div"); layout.className = "fishing-layout";
    const info = document.createElement("div"); info.className = "fishing-info";
    const name = document.createElement("h4"); name.textContent = fish.name;
    const pattern = document.createElement("p"); pattern.className = "fishing-pattern"; pattern.textContent = MOVEMENTS[this.model.movement].name;
    const description = document.createElement("p"); description.textContent = MOVEMENTS[this.model.movement].description;
    const difficulty = document.createElement("p"); difficulty.textContent = "Water Movement: " + AREA_MOVEMENT[snapshot.region] + "x";
    const controls = document.createElement("p"); controls.textContent = "Hold Left / Right to move your zone. Release to stop. Keep the fish inside to fill the catch meter within 60 seconds.";
    info.append(cardElement(fish), name, pattern, description, difficulty);
    const stage = document.createElement("div"); stage.className = "fishing-stage";
    this.canvas.width = 672; this.canvas.height = 320; this.canvas.className = "fishing-canvas";
    this.canvas.tabIndex = 0; this.canvas.setAttribute("aria-label", "Fishing lane. Use Left and Right arrows to follow the fish. Escape pauses.");
    this.scenery.width = 672; this.scenery.height = 320; drawSeascape(this.scenery, snapshot.region, seed);
    stage.append(this.canvas, controls); layout.append(info, stage);
    this.status.className = "fishing-status"; this.status.setAttribute("role", "status");
    this.progress.max = 1; this.progress.value = this.model.progress; this.progress.setAttribute("aria-label", "Catch progress");
    this.action.className = "voyage-button"; this.action.type = "button";
    this.action.onclick = () => {
      if (this.phase === "caught") { this.close(); return; }
      if (this.phase === "playing") this.pause(); else this.resume();
    };
    this.dialog.append(heading, layout, this.progress, this.status, this.action); document.body.append(this.dialog);
    const options = { signal: this.controller.signal };
    this.dialog.addEventListener("keydown", (event) => {
      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        if (this.phase === "playing" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) this.keys.add(event.key);
      }
    }, options);
    window.addEventListener("keyup", (event) => this.keys.delete(event.key), options);
    window.addEventListener("blur", () => this.pause(), options);
    this.dialog.addEventListener("focusout", () => this.keys.clear(), options);
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); }, options);
    this.dialog.addEventListener("cancel", (event) => { event.preventDefault(); if (this.phase === "caught") this.close(); else this.pause(); }, options);
    this.dialog.showModal(); this.updateStatus(); this.draw();
    if (resumed) this.action.focus(); else this.resume();
  }
  destroy(): void {
    if (this.disposed) return;
    if (this.model.status === "playing") this.onSave(this.model.snapshot());
    this.disposed = true; cancelAnimationFrame(this.frame); this.controller.abort(); this.keys.clear();
    this.dialog.close(); this.dialog.remove();
  }
  private close(): void { this.destroy(); this.onClose(); }
  private pause(): void {
    this.keys.clear();
    if (this.phase !== "playing") return;
    this.phase = "paused"; cancelAnimationFrame(this.frame); this.accumulator = 0;
    this.onSave(this.model.snapshot()); this.updateStatus(); this.draw();
  }
  private resume(): void {
    this.canvas.focus();
    this.phase = "playing"; this.keys.clear(); this.lastTime = performance.now(); this.accumulator = 0;
    this.updateStatus(); this.frame = requestAnimationFrame(this.tick);
  }
  private tick = (now: number): void => {
    if (this.disposed || this.phase !== "playing") return;
    if (now - this.lastTime > 250) { this.pause(); return; }
    this.accumulator += Math.max(0, now - this.lastTime) / 1000; this.lastTime = now;
    while (this.accumulator >= STEP && this.model.status === "playing") {
      this.model.step(this.keys.has("ArrowLeft"), this.keys.has("ArrowRight")); this.accumulator -= STEP;
    }
    this.progress.value = this.model.progress;
    if (this.model.status !== "playing") {
      this.onFinish(this.model.snapshot());
      if (this.model.status === "escaped") { this.close(); return; }
      this.phase = "caught"; this.keys.clear(); this.updateStatus(); this.draw(); this.action.focus(); return;
    }
    if (this.model.elapsed - this.saveTime >= 0.5) { this.onSave(this.model.snapshot()); this.saveTime = this.model.elapsed; }
    this.draw(); this.frame = requestAnimationFrame(this.tick);
  };
  private updateStatus(): void {
    const labels = {
      playing: ["Pause", "One Attempt. Keep The Fish In Your Zone. Escape Pauses."],
      paused: ["Resume", "Paused. Your Attempt Will Resume From Here."],
      caught: ["Return To Map", this.fish.name + " Caught! Added To Your School."],
    };
    [this.action.textContent, this.status.textContent] = labels[this.phase];
  }
  private draw(): void {
    const ctx = this.canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false; ctx.drawImage(this.scenery, 0, 0);
    ctx.fillStyle = "#061f2de6"; ctx.fillRect(16, 32, 640, 256);
    const x = 40, y = 104, width = 592, height = 88;
    ctx.fillStyle = "#98b9ae"; ctx.fillRect(x - 4, y - 4, width + 8, height + 8);
    ctx.fillStyle = "#061d2c"; ctx.fillRect(x, y, width, height);
    for (let i = 1; i < 8; i++) { ctx.fillStyle = "#163a4c"; ctx.fillRect(x + i * 74, y, 2, height); }
    const zoneX = x + Math.round((this.model.zone - ZONE_WIDTH / 2) * width);
    const zoneWidth = Math.round(ZONE_WIDTH * width);
    ctx.fillStyle = this.model.contained ? "#73ddae" : "#609ca7"; ctx.fillRect(zoneX, y + 4, zoneWidth, height - 8);
    ctx.fillStyle = this.model.contained ? "#295c51" : "#214351"; ctx.fillRect(zoneX + 4, y + 8, zoneWidth - 8, height - 16);
    const fishX = x + Math.round(this.model.fish * width);
    const pattern = ["......####....", "#...########..", "##.#######.##.", "##############", "##.##########.", "#...########..", "......####...."];
    ctx.fillStyle = "#fff0bf";
    pattern.forEach((row, py) => [...row].forEach((p, px) => { if (p === "#") ctx.fillRect(fishX - 14 + px * 2, y + 36 + py * 2, 2, 2); }));
    ctx.fillStyle = "#ffffff"; ctx.fillRect(fishX + 6, y + 40, 2, 2);
    ctx.fillStyle = "#355565"; ctx.fillRect(x, 232, width, 16);
    ctx.fillStyle = "#eed49b"; ctx.fillRect(x, 232, Math.round(width * this.model.progress), 16);
    ctx.font = '16px "Reef Pixel"'; ctx.textAlign = "center";
    ctx.fillText("FOLLOW THE FISH", 336, 72); ctx.fillText("CATCH " + Math.round(this.model.progress * 100) + "% · " + Math.max(0, Math.ceil(60 - this.model.elapsed)) + "s", 336, 276);
    if (this.phase !== "playing") {
      ctx.fillStyle = "#061d2cee"; ctx.fillRect(240, 112, 192, 72);
      ctx.fillStyle = "#eed49b"; ctx.fillText(this.phase === "paused" ? "PAUSED" : "CAUGHT!", 336, 156);
    }
  }
}
