import { CHARMS, CHARM_IDS, LEGACY_CHARM_IDS, type CharmId } from "../data/tideCharms.ts";
import { oceanRarity } from "../data/oceanPool.ts";
import { reefRarity } from "../data/reefPool.ts";
import { bermudaRarity } from "../data/bermudaPool.ts";
import { random } from "./maps.ts";

export type ShopOffer = { id: string; price: number } & ({ kind: "fish"; texture: string } | { kind: "charm"; charm: CharmId });

/** Fixed seeded stock: one fish, one charm, and one of either. Never reroll after buying. */
export function generateShop(seed: string, nodeId: string, region: number, fish: string[], poolVersion: 1 | 2 | 3 = 3, oceanPricing = false, charmPoolVersion: 1 | 2 = 2, balanced = false): ShopOffer[] {
  const rng = random(`${seed}:${nodeId}:shop`);
  const charms = [...(charmPoolVersion === 1 ? LEGACY_CHARM_IDS : CHARM_IDS)];
  const stock: ShopOffer[] = [];
  for (let i = 0; i < 3; i++) {
    const id = `${nodeId}:${i}`;
    const markup = region * (balanced ? 2 : 4) + Math.floor(rng() * 4) * 2;
    if (i === 0 || (i === 2 && rng() < 0.5)) {
      const texture = fish[i === 0 ? 0 : 1];
      const rarity = region === 2 ? bermudaRarity(texture) : oceanPricing ? oceanRarity(texture) ?? reefRarity(texture, poolVersion) : reefRarity(texture, poolVersion);
      const price = balanced ? (rarity === "Extremely Rare" ? 80 : rarity === "Rare" ? 60 : rarity === "Common" ? 30 : 42) : (rarity === "Extremely Rare" ? 100 : rarity === "Rare" ? 76 : rarity === "Common" ? 40 : 54);
      stock.push({ id, kind: "fish", texture, price: price + markup });
    } else {
      const charm = charms.splice(Math.floor(rng() * charms.length), 1)[0];
      stock.push({ id, kind: "charm", charm, price: (balanced ? Math.round(CHARMS[charm].price / 2) + 2 : CHARMS[charm].price + 8) + markup });
    }
  }
  stock.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
  for (let i = 1; i < stock.length; i++) stock[i].price = Math.max(stock[i].price, stock[i - 1].price + 2);
  return stock;
}
