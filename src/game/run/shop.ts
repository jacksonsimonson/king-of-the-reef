import { CHARMS, CHARM_IDS, type CharmId } from "../data/tideCharms.ts";
import { reefRarity } from "../data/reefPool.ts";
import { random } from "./maps.ts";

export type ShopOffer = { id: string; price: number } & ({ kind: "fish"; texture: string } | { kind: "charm"; charm: CharmId });

/** Fixed seeded stock: one fish, one charm, and one of either. Never reroll after buying. */
export function generateShop(seed: string, nodeId: string, region: number, fish: string[]): ShopOffer[] {
  const rng = random(`${seed}:${nodeId}:shop`);
  const charms = [...CHARM_IDS];
  const stock: ShopOffer[] = [];
  for (let i = 0; i < 3; i++) {
    const id = `${nodeId}:${i}`;
    const markup = region * 4 + Math.floor(rng() * 4) * 2;
    if (i === 0 || (i === 2 && rng() < 0.5)) {
      const texture = fish[i === 0 ? 0 : 1];
      const rarity = reefRarity(texture);
      const price = rarity === "Extremely Rare" ? 100 : rarity === "Rare" ? 76 : rarity === "Common" ? 40 : 54;
      stock.push({ id, kind: "fish", texture, price: price + markup });
    } else {
      const charm = charms.splice(Math.floor(rng() * charms.length), 1)[0];
      stock.push({ id, kind: "charm", charm, price: CHARMS[charm].price + 8 + markup });
    }
  }
  stock.sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
  for (let i = 1; i < stock.length; i++) stock[i].price = Math.max(stock[i].price, stock[i - 1].price + 2);
  return stock;
}
