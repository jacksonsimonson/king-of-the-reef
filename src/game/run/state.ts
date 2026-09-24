import { STARTERS, type FishCard } from "../data/starterFish.ts";
import { drawReefCard } from "../data/reefPool.ts";
import { FishingModel, movementFor, validSnapshot, type FishingSnapshot } from "../fishing/model.ts";
import { generateMap, random, REGIONS, SPACE_INFO, type MapNode, type RegionMap } from "./maps.ts";

export interface Run {
  version: 1; seed: string; region: number; maps: RegionMap[]; current: string;
  visited: string[]; pending: string | null; school: FishCard[]; shells: number;
  resolve: number; status: "active" | "won" | "lost"; log: string; serial: number;
  fishing?: { nodeId: string; texture: string; snapshot: FishingSnapshot };
}
export const SAVE_KEY = "king-of-the-reef-voyage-v1";
export function recruit(run: Run, texture: string): void {
  const definition = STARTERS.find((fish) => fish.texture === texture);
  if (!definition) throw new Error("Unknown creature");
  run.school.push({ ...definition, id: `run-${++run.serial}`, owner: "player", condition: "healthy" });
}
export function createRun(seed: string): Run {
  const maps = REGIONS.map((_, i) => generateMap(seed, i));
  const run: Run = { version: 1, seed, region: 0, maps, current: maps[0].nodes[0].id, visited: [maps[0].nodes[0].id], pending: null, school: [], shells: 18, resolve: 3, status: "active", log: "A new school gathers in the shallows. Choose your first fishing spot.", serial: 0 };
  for (const texture of ["minnow", "anchovy", "goby", "crab", "blenny", "shrimp", "sea-star", "octopus"]) recruit(run, texture);
  return run;
}
export function activeNode(run: Run): MapNode {
  return run.maps[run.region].nodes.find((node) => node.id === (run.pending ?? run.current))!;
}
export function reachable(run: Run): string[] {
  if (run.status !== "active" || run.pending) return [];
  return activeNode(run).next;
}
export function enterNode(run: Run, id: string): boolean {
  if (!reachable(run).includes(id)) return false;
  run.pending = id;
  return true;
}
export function offers(run: Run): string[] {
  const pool: string[] = [...REGIONS[run.region].pool];
  const rng = random(`${run.seed}:${run.pending}:offers`);
  if (run.region === 0) {
    const result: string[] = [];
    while (result.length < 3) result.push(drawReefCard(rng, result));
    return result;
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
function finishNode(run: Run, message: string): void {
  if (!run.pending) return;
  run.current = run.pending;
  run.visited.push(run.pending);
  run.pending = null;
  run.log = message;
}
export function canRelease(run: Run, id: string): boolean {
  const fish = run.school.find((f) => f.id === id);
  return Boolean(fish && run.school.length > 5 && (fish.condition === "killed" || run.school.filter((f) => f.condition === "healthy").length > 1));
}
export function beginFishing(run: Run, texture: string): boolean {
  if (run.status !== "active" || !run.pending || run.fishing || activeNode(run).type !== "fishing" || !offers(run).includes(texture)) return false;
  const seed = Math.floor(random(run.seed + ":" + run.pending + ":fishing")() * 4294967296);
  run.fishing = { nodeId: run.pending, texture, snapshot: new FishingModel(movementFor(texture), REGIONS[run.region].id, seed).snapshot() };
  return true;
}
export function finishFishing(run: Run, snapshot: FishingSnapshot): boolean {
  const attempt = run.fishing;
  if (!attempt || run.status !== "active" || run.pending !== attempt.nodeId || activeNode(run).type !== "fishing"
    || !validSnapshot(snapshot) || snapshot.status === "playing" || snapshot.movement !== movementFor(attempt.texture)
    || snapshot.region !== REGIONS[run.region].id
    || (snapshot.status === "caught" ? snapshot.progress < 1 : snapshot.progress > 0 && snapshot.elapsed < 60)) return false;
  const name = STARTERS.find((fish) => fish.texture === attempt.texture)!.name;
  if (snapshot.status === "caught") recruit(run, attempt.texture);
  delete run.fishing;
  finishNode(run, snapshot.status === "caught" ? name + " Caught! Joined Your School." : name + " Escaped. This Fishing Stop Is Used Up.");
  return true;
}
export function resolveVisit(run: Run, choice: string, selected: string[] = []): boolean {
  if (!run.pending || run.status !== "active") return false;
  const node = activeNode(run);
  if (node.type === "battle" || node.type === "boss") return false;
  if (node.type === "fishing") {
    if (choice !== "leave" || run.fishing) return false;
    finishNode(run, "You Skipped This Fishing Stop.");
  } else if (node.type === "shop") {
    if (choice !== "leave") {
      if (!offers(run).includes(choice) || (node.type === "shop" && run.shells < 18)) return false;
      if (node.type === "shop") run.shells -= 18;
      recruit(run, choice);
      finishNode(run, `${run.school.at(-1)!.name} joined your school.`);
    } else finishNode(run, "You followed the current onward.");
  } else if (node.type === "hydration") {
    if (choice !== "rest" || selected.length > 3 || new Set(selected).size !== selected.length
      || !selected.every((id) => run.school.some((fish) => fish.id === id && fish.condition === "killed"))) return false;
    run.school.forEach((fish) => { if (selected.includes(fish.id)) fish.condition = "healthy"; });
    run.resolve = Math.min(3, run.resolve + 1);
    finishNode(run, `Hydrated ${selected.length} card${selected.length === 1 ? "" : "s"} and recovered one resolve.`);
  } else if (node.type === "release") {
    if (choice === "leave") finishNode(run, "You kept your school together.");
    else {
      if (!canRelease(run, choice)) return false;
      const fish = run.school.find((f) => f.id === choice)!;
      run.school = run.school.filter((f) => f.id !== choice);
      finishNode(run, `${fish.name} was released back into the ocean.`);
    }
  } else if (node.type === "event") {
    if (choice === "salvage") {
      run.shells += 14;
      if (run.resolve > 1) run.resolve--;
      finishNode(run, "Recovered 14 shells from the wreck. The dangerous dive cost one resolve (minimum one).");
    } else if (choice === "rescue") {
      recruit(run, offers(run)[0]);
      finishNode(run, `You rescued a ${run.school.at(-1)!.name} from the drifting net.`);
    } else return false;
  } else return false;
  return true;
}
export function battleResult(run: Run, player: number, rival: number, killedIds: string[] = []): void {
  if (!run.pending || run.status !== "active") return;
  const node = activeNode(run);
  if (node.type !== "battle" && node.type !== "boss") return;
  for (const fish of run.school) if (killedIds.includes(fish.id)) fish.condition = "killed";
  if (player < rival) {
    run.resolve--;
    run.log = "The rival won. Lost one resolve. Killed cards need hydration.";
    if (run.resolve <= 0) { run.status = "lost"; run.pending = null; return; }
    if (node.type === "battle") finishNode(run, run.log);
    return;
  }
  if (node.type === "boss" && player === rival) {
    run.log = "The Colossal held the reef. Rematch to pass; no resolve lost.";
    return;
  }
  run.shells += player > rival ? (node.type === "boss" ? 25 : 12) : 4;
  finishNode(run, player > rival ? "Victory! Your school secured the reef and earned shells." : "A tied tide. Earned 4 shells and sailed onward.");
  if (node.type === "boss") {
    if (run.region === 2) { run.status = "won"; run.log = "You reached the heart of the Triangle. The three seas are yours."; }
    else {
      run.region++;
      run.current = run.maps[run.region].nodes[0].id;
      run.visited.push(run.current);
      run.log = `The Colossal yields. Welcome to ${REGIONS[run.region].name}.`;
    }
  }
}
export function loadRun(): Run | null {
  try {
    const run: Run = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
    if (!run || run.version !== 1 || typeof run.seed !== "string" || !Number.isInteger(run.region) || run.region < 0 || run.region > 2 || !Array.isArray(run.school) || run.school.length < 5 || !Array.isArray(run.visited) || !["active", "won", "lost"].includes(run.status)) return null;
    // Rebuild topology, but preserve existing encounter types when rates change.
    const savedMaps = run.maps;
    run.maps = REGIONS.map((_, i) => generateMap(run.seed, i));
    run.maps.forEach((map, i) => map.nodes.forEach((node) => {
      const saved = savedMaps?.[i]?.nodes?.find((n) => n.id === node.id);
      if (saved && Object.hasOwn(SPACE_INFO, saved.type)) node.type = saved.type;
    }));
    if (!run.maps[run.region].nodes.some((node) => node.id === run.current)) return null;
    if (run.pending && !run.maps[run.region].nodes.find((node) => node.id === run.current)?.next.includes(run.pending)) return null;
    if (!run.school.every((fish) => STARTERS.some((s) => s.texture === fish.texture) && ["healthy", "killed", "knocked-out"].includes(fish.condition))) return null;
    // Preserve schools from the earlier recovery model.
    run.school.forEach((fish) => { if ((fish.condition as string) === "knocked-out") fish.condition = "killed"; });
    if (![run.shells, run.resolve, run.serial].every(Number.isFinite)) return null;
    if (run.fishing && (run.fishing.nodeId !== run.pending || activeNode(run).type !== "fishing"
      || !offers(run).includes(run.fishing.texture) || !validSnapshot(run.fishing.snapshot)
      || run.fishing.snapshot.movement !== movementFor(run.fishing.texture) || run.fishing.snapshot.region !== REGIONS[run.region].id)) return null;
    return run;
  } catch { return null; }
}
export function saveRun(run: Run): boolean {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(run)); return true; }
  catch { return false; }
}
