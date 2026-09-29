import { STARTERS, ORIGINAL_FISH_TEXTURES, type FishCard, type Owner } from "./starterFish.ts";

export const ROSTER_KEY = "king-of-the-reef-enabled-fish-v1";

export function enabledTextures(): string[] {
  const all = STARTERS.map((fish) => fish.texture);
  try {
    const saved: unknown = JSON.parse(globalThis.localStorage?.getItem(ROSTER_KEY) ?? "null");
    const settings = saved as { enabled?: unknown; known?: unknown } | null;
    const selected = Array.isArray(saved) ? saved : settings?.enabled;
    const known = Array.isArray(saved) ? ORIGINAL_FISH_TEXTURES : settings?.known;
    if (!Array.isArray(selected) || !Array.isArray(known)) return all;
    const valid = new Set(selected.filter((value): value is string => typeof value === "string" && all.includes(value)));
    // Newly released cards start enabled without re-enabling anything the user disabled.
    return all.filter((texture) => valid.has(texture) || !known.includes(texture));
  } catch { return all; }
}

export function isFishEnabled(texture: string): boolean {
  return enabledTextures().includes(texture);
}

export function saveEnabledTextures(textures: readonly string[]): boolean {
  const known = new Set(STARTERS.map((fish) => fish.texture));
  const unique = [...new Set(textures)].filter((texture) => known.has(texture));
  try { globalThis.localStorage.setItem(ROSTER_KEY, JSON.stringify({ enabled: unique, known: [...known] })); return true; }
  catch { return false; }
}

export function toggleFish(texture: string, pools: readonly (readonly string[])[]): { changed: boolean; enabled: boolean; reason?: string } {
  const current = enabledTextures();
  if (!STARTERS.some((fish) => fish.texture === texture)) return { changed: false, enabled: false, reason: "Unknown fish." };
  if (!current.includes(texture)) {
    if (!saveEnabledTextures([...current, texture])) return { changed: false, enabled: false, reason: "Could not save roster settings. Try again." };
    return { changed: true, enabled: true };
  }
  if (current.length <= 5) return { changed: false, enabled: true, reason: "Keep at least five fish enabled for battle." };
  for (const pool of pools) {
    const remaining = pool.filter((entry) => entry !== texture && current.includes(entry));
    if (remaining.length < 3) return { changed: false, enabled: true, reason: "Each region needs at least three enabled catches." };
  }
  if (!saveEnabledTextures(current.filter((entry) => entry !== texture))) return { changed: false, enabled: true, reason: "Could not save roster settings. Try again." };
  return { changed: true, enabled: false };
}

export function createEnabledDeck(owner: Owner): FishCard[] {
  const enabled = new Set(enabledTextures());
  return STARTERS.filter((fish) => enabled.has(fish.texture)).flatMap((fish) => [0, 1].map((copy) => ({
    ...fish, id: `${owner}-${fish.id}-${copy + 1}`, owner, condition: "healthy" as const,
  })));
}
