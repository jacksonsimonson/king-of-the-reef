# Creature balancing guidelines

This is the working balance framework for King of the Reef and part of the [Game Design](GAME_DESIGN.md). Use it before adding or reshuffling creature edges, full-card abilities, rarity, or acquisition weights. It defines a review method, not a claim that the current roster is balanced. It does not change gameplay by itself.

## 1. What balanced means here

A creature earns its place by creating useful reef-control decisions in ordinary play. Equal edge counts, equal rarity, and equal win rates do not imply equal usefulness. Aim for several viable answers to a position, with understandable strengths and weaknesses.

- Position and timing should matter more than simply drawing the rarest creature.
- A card must have a useful baseline without a particular rare ally, charm, status, or terrain tile. Synergy improves that baseline; it should not be the only reason to play it.
- Strong control must leave an accessible response or a meaningful setup cost. A nominal counter found only on an extremely rare fish is not sufficient.
- Every added edge needs a reason. More edges can improve defense and coverage, but may also move allies, change the user's position, or fire in an unfavorable order.
- Later regions increase complexity and tactical variety; they should not make the starting school obsolete through universal numerical superiority.
- Species identity guides how a role looks and behaves. It does not excuse a card that is consistently useless or oppressive.

No mana or per-card deployment cost exists: each creature consumes the same scarce placement. A weak card therefore pays the same action cost as a strong one. Rarity, price, fishing difficulty, and permanent casualties are acquisition/run costs, not substitutes for fair battle decisions.

## 2. Rules to use when comparing cards

Check [Edge Effects](EDGE_EFFECTS.md), [Terrain](TERRAIN.md), and the actual combat resolver before judging a combination. If text and code disagree, resolve that discrepancy before tuning values.

| Region | Board | Plays per side | Special tiles | Rival |
| --- | --- | --- | --- | --- |
| Shoreline | 5×5 | 5 | 2–4 | Beginner |
| Open Ocean | 6×6 | 6 | 3–5 | Tactical |
| Bermuda | 7×7 | 7 | 4–6 | Expert |

All boards have three scoring reefs. Both whirlpool endpoints count toward specials. Hands hold up to five cards and refill from reserves. Larger boards have lower potential occupancy density despite the extra placements: do not assume crowd-dependent effects become stronger in later regions.

Important accounting rules:

- Double means stronger penetration, **not two spaces of movement**. Standard and Double each push one space.
- A friendly fish moved onto an empty reef can be as valuable as removing an enemy. Moving an enemy off a reef and replacing it with an ally changes the score difference by two, not one.
- Only the final score wins the battle. Earlier control matters because it shapes replies, not because it earns points each turn.
- Edges resolve in stored order from the creature's current location. Swap, Follow Current, Bounce, and Dive can change where later edges act. Evaluate complete sequences, not isolated badges.
- Offensive edges can affect allies unless their rules explicitly restrict targets. Full-card abilities have their own targeting rules.
- Shock disables edges, not full-card abilities. Movement does not retrigger on-play abilities. Whirlpool travel is after placement effects, subject to the actual entry/survival rules.
- Killing a creature also affects later Voyage battles. Compare both immediate reef value and recovery pressure; record casualties on wins as well as losses.
- Most fish cannot deploy directly onto reefs. Reefborn changes that action economy fundamentally.

## 3. Give each creature a job

Choose one primary role and at most one secondary role. Write one sentence explaining when a player would choose this creature over another available fish.

| Role | Ordinary contribution | Required limitation to inspect |
| --- | --- | --- |
| Reef setter | Moves an ally or itself into scoring position | Needs a reachable approach, direction, or setup |
| Displacer | Moves enemy reef holders or opens a lane | Defense, occupancy, or approach can disrupt it |
| Holder | Retains a useful position after arrival | Reaching the reef must remain a real problem |
| Predator | Removes threats and creates space | Access and kill conditions should matter |
| Support | Protects allies or improves future choices | Has useful placement/edge play even without its ideal ally |
| Flexible mover | Solves several positional problems | Less certainty, coverage, or defense than a specialist |

Do not require every school to contain each role. Do require the obtainable regional pool to support several routes to claiming and contesting reefs. A new creature should fill an actual gap or offer a meaningful tradeoff, not just have an unused badge arrangement.

## 4. Use a profile, not a single power number

For each candidate, rate the following dimensions as 0 (absent), 1 (limited), 2 (reliable), or 3 (exceptional), with a concrete board example. Ratings are provisional review labels, not measured probabilities. Do not add them into a universal score: losing a core weakness can be more important than several small gains.

| Dimension | Question |
| --- | --- |
| Reef access | Can it put itself or an ally onto a reef, and how much setup does that require? |
| Disruption | Can it take scoring positions away from opponents? |
| Staying power | How many ordinary replies can contest it after it scores? |
| Reach and coverage | How many useful placements, directions, or targets can it act on? |
| Independence | Does it work with mixed ordinary cards and sparse terrain? |
| Future value | Does it preserve fish, protect allies, reveal information, or improve later draws? |

Record complexity separately: the number of interactions a player must predict is a usability cost, not permission to add more power. A card rated 3 in both access and staying power, or disruption and coverage, needs an explicit counterplay review before assignment.

Use an existing simple card in the same role as an anchor. Compare the candidate with that anchor, its nearest same-region peer, and a cheaper/common alternative. A candidate that is at least as good in every relevant situation and better in several is a likely strict upgrade. Change its tradeoffs or retire/rework the redundant design; rarity alone does not solve it.

## 5. Edge assignment reference

These are starting review categories, not numerical costs or a ranking that holds on every board. Include an edge's defense as well as its activated effect. Blank sides are genuine approach weaknesses, but their importance depends on board geometry and the rest of the card.

| Edge | Value to account for | Main balance checks |
| --- | --- | --- |
| Standard | One-space push plus directional defense | Basic friendly setup and enemy displacement; compare added coverage against lost blank sides |
| Double | One-space push that bypasses Standard-strength defense | Do not price as extra distance; inspect how common the remaining counters are |
| Shield (`weak` in data) | Strong directional defense with no attack | Can the creature reach a reef? Can opponents approach another side? |
| Bite / Bigger Fish | Conditional removal and lasting Voyage casualty | Needs a successful normal-push destination; evaluate denial and attrition together |
| Swap | Exchanges two positions and relocates the acting fish | Reef stealing and later-edge combinations; do not treat as merely one push |
| Hook | Reaches across one empty space and bypasses Standard-strength markers | Useful gaps, safe approach squares, and friendly reef setup |
| Wave | Up to three rays of displacement, resolved farthest first | Empty/sparse board floor versus clustered ceiling; allies and board-edge deaths |
| Shock | Long-lived edge shutdown, blocked only by facing active Shield | Can leave a reef holder still scoring; compare early versus last-play value and allied harm |
| Spines | Retaliation against specific successful enemy pushes | Not a defensive block; being displaced can still lose a reef. Do not count rare retaliation as its entire useful baseline |
| Ram | Farthest-first line pushes with Standard-strength checks | Sparse-board floor, crowd ceiling, blocked lanes, and off-board casualties |
| Follow Current | Double-strength push plus movement into the vacated tile | Can contest and occupy in one action; inspect subsequent edges from the new position |
| Bounce | Standard push attempt plus independent backward retreat | Retreat can work without a target or successful push; inspect cheap reef entry and escape paths |
| Dive | Self-movement over an adjacent fish into an empty tile | Both owners can provide the stepping stone; defense bypass is movement, not removal |

Never grant a discount simply because an effect “needs positioning”: positioning is the normal gameplay. Discount only a demonstrably restrictive condition, and verify that the result still has ordinary uses.

## 6. Full-card ability assignment reference

Evaluate the complete card again after adding an ability. It is not a free rarity decoration. Give a creature one clear innate identity before considering charm-granted combinations.

| Ability | Contribution | Assignment guardrail |
| --- | --- | --- |
| Revelation | Reveals an opposing hand card until it is played | Early information is useful; late information can be worthless. Keep the underlying edges playable |
| Rally | After pushing an enemy, inspects/reorders the next reserve draw | Requires reserve and future decisions; does not add a placement. Avoid a powerless base card |
| Anchor | Resists forced movement, including friendly setup | A real drawback only if access remains difficult. Test direct deployment, self-movement, and predation |
| Reefborn | Direct placement onto an empty reef | High-priority access review, especially on the last play; avoid automatic defense/scoring upgrades |
| Bulwark | All-side defense that persists through Shock | Do not count existing Shields as fully additive; ensure accessible contesting routes without rare-only counters |
| Piercing | Bypasses edge defenses and Bulwark | Power grows with offensive coverage and target count. Test Wave/Ram and removal combinations separately |
| Escort | Adds Shields to adjacent allies' empty sides before edges | Compare one ordinary ally against a packed formation; account for filling the intended weaknesses of other cards |
| Ambush | Shocks adjacent enemies before edges | Can disable counters before attacking. Evaluate as a combined attack, not an isolated debuff |
| Wake | Defense-ignoring enemy pushes after edges from the survivor's location | Self-movement can reach a new group; test reef clearing and multiple casualties |
| Sovereign | Two reef points instead of one | One survivor can tie two ordinary reef holders. Access and staying power must be evaluated together |

Priority combination reviews: Reefborn + Sovereign; Reefborn + Anchor/Bulwark; Sovereign + Anchor/Bulwark; Piercing + multi-target or lethal edges; Ambush + removal; self-movement + Wake; Escort + already durable reef holders. These combinations are not automatically banned, but none passes on rarity or an edge-count budget alone. Include temporary charm grants and a full three-charm inventory in stress tests.

## 7. Rarity, region, and acquisition

Common cards should teach dependable roles and remain viable later. Uncommon cards can combine a role with a modest alternative use. Rare and Extremely Rare cards can offer unusual sequences or stronger conditional ceilings, while preserving a recognizable weakness. Scarcity should create excitement, not an unavoidable win when drawn.

The existing regional edge-count budgets describe the current assignment pass. For future balancing, this framework takes precedence over using those counts as proof of fairness. Four edges are not inherently better than two, and a blank side is not sufficient counterplay on its own. Existing assignments stay unchanged until a content PR explicitly changes them.

Balance acquisition separately after battle function is sound. Record encounter availability, shop price, fishing challenge, regional weights, and duplicate copies. A costly fish must justify the purchase, but raising its price should not be the first fix for an oppressive battle effect. Test mixed-region schools: Shoreline creatures remain in the Voyage after leaving Shoreline. Quick Match's large/random pool is useful for discovery, not a substitute for representative Voyage schools.

## 8. A practical comparison suite

Maintain a small reusable set of legal positions rather than building an exhaustive simulator first. The first [offline pilot](BALANCE_PILOT.md) implements a limited deterministic subset. Full role-specific follow-up, paired matches, and manual play remain to be done.

For each changed role, compare the old card, candidate, and two peers in the same positions. Keep the surrounding school, hands, terrain, remaining placements, and random seed fixed. Include:

1. Early sparse board with no adjacent enemy: can the card prepare useful future play?
2. An ally one move from a reef: can it help without requiring a specific species?
3. An enemy reef holder with an exposed approach, then with Standard and Shield defenses.
4. A blocked landing, a board edge, and a crowded lane: distinguish real restrictions from theoretical ones.
5. One play left per side, tested in both acting orders; also test the final unanswerable placement.
6. One relevant regional terrain interaction, then a normal board without that enabling terrain.
7. Shocked edges and an ability-bearing target; verify the difference between disabling edges and disabling a card.
8. A representative mixed school with no enabling charm, then a plausible charm combination and repeated copies.

Run key scenarios on 5×5, 6×6, and 7×7 using their actual reef locations and placement budgets. Swap player/rival roles and vary orientation; actual boards and directional cards are not rotationally symmetric. Separate first/last-action advantage from card advantage. Do not quietly give the rival access to hidden player cards during evaluation.

Record immediate reef-score difference, score after a plausible opponent reply, final result where practical, friendly/enemy casualties, useful legal placements, and whether an ordinary obtainable reply exists. “Useful” means the move improves scoring, contests control, preserves a needed creature, or sets up a concrete next play compared with spending the placement on a peer. Mere legality or an effect animation does not count.

For a manageable initial pass, use roughly 12–20 positions per role, then paired seeded battles only for suspicious or substantially changed designs. This is a workload suggestion, not a statistically sufficient sample. Tactical/Expert AI can expose regressions but may overvalue or misunderstand a new mechanic; confirm important results manually. Never weaken a mechanic solely because the current AI cannot use it.

## 9. Review signals and decisions

Use measurements as investigation triggers, not automatic nerf commands. The following are provisional targets to calibrate with playtesting:

- **Ordinary relevance:** aim for a useful contribution in at least two-thirds of a role's representative positions, without rare support. Report the numerator and denominator; revise the suite if it favors one design.
- **Dominance:** flag a card chosen over same-role peers in nearly every relevant state, even if its overall win rate is ordinary. Check whether the alternative ever offers a real advantage.
- **Counterplay:** flag scoring positions that commonly cannot be contested with ordinary regional tools. A response that needs several remaining placements is not a counter on the final turn.
- **Swing:** investigate repeated multi-reef swings, multi-kills, or action-saving sequences; count the required setup and the opportunity for a reply.
- **Run health:** track killed cards, recovery purchases/stops, healthy school size, and resolve. A card can be fair in one battle and still make a voyage unsustainable.
- **Player choice:** note skipped catches, declined shop offers, and fish repeatedly left unplayed when drawn. Separate affordability, role saturation, hidden information, and bad luck from weak card design.

For paired matches, report wins, ties, losses, first/second order, seeds, school composition, and sample size. Use `(wins + 0.5 × ties) / games` only as one comparison statistic. Small samples are directional evidence, not proof of a percentage advantage. Do not target identical raw win rates across rarity tiers or compare different opponent difficulties as if they were controlled trials.

If a card is weak, first improve its ordinary role: direction, approach, support edge, or less restrictive activation. If too strong, first restore a meaningful weakness: coverage, protection, guaranteed access, or an over-efficient combination. Change one major axis at a time. Do not solve every problem by adding/removing rarity or inventing another mechanic.

## 10. Creature review worksheet

Copy this into the relevant content PR or a temporary comparison note; a new permanent document per creature is unnecessary.

```text
Creature / stable texture ID / region / rarity:
Current edges IN RESOLUTION ORDER / innate ability:
Proposed edges IN RESOLUTION ORDER / innate ability:
Primary role / secondary role:
Why choose it over its two closest peers?
Ordinary useful play without special support:
Access / disruption / staying power / coverage / independence / future value (0–3 + examples):
Intended weakness and ordinary counterplay:
Early-turn / final-turn behavior:
Self-movement and edge-order interactions:
Terrain / charm / duplicate-copy risks:
Mixed-region usefulness / Voyage casualty impact:
Positions tested / useful results / peer comparisons:
Paired matches or manual observations (include sample and acting order):
Acquisition changes, if any, and why:
Save/version compatibility:
Decision: retain / reshape / defer; remaining uncertainty:
```

Illustrative designs, not approved assignments: a reef holder with two Shields and no self-entry differs meaningfully from a setter with Hook and a Standard support edge. Adding Reefborn to the holder removes its setup cost and demands a new review. Adding Sovereign as well is not “just one more ability”; it changes both access and payoff. Conversely, a Spines-only novelty that seldom influences ordinary choices needs a useful positional baseline before more rarity or artwork.

## 11. Rollout order and acceptance

Start with a roster inventory grouped by role, not by rarity. Identify strict upgrades, redundant layouts, missing ordinary counters, and creatures whose only value depends on a rare interaction. Select a small pilot of roughly 6–10 creatures across contrasting roles; compare, playtest, and refine the rubric before reshuffling the whole catalog.

Each content batch should include the worksheet conclusions, meaningful combat/interaction tests, obtainable catalog entries, readable descriptions, and any required save-definition/pool versioning. Preserve stable IDs and old-run behavior deliberately; do not silently rewrite saved creatures or seeded offers. Follow the existing reef-content and reef-verify workflows when actual data changes begin.

Continue the creature-role passes and validate the first pilot before bespoke Colossal design. **Colossals are deferred until last**, after the other intended main systems and ordinary creature roster are established. Their eventual mechanics should test those established tools rather than force the roster to be balanced around one boss gimmick.

## First inventory and pilot

See [Roster balance pilot](BALANCE_PILOT.md), the [complete role inventory](ROSTER_ROLE_INVENTORY.md), and [measured fixtures](BALANCE_PILOT_RESULTS.md). Relative weights use Standard = 1 as a revisable reference, never an objective cost or universal rarity budget. Region introductions, clear primary roles, and deliberate friendly harm are now explicit review dimensions. The first stress probe cannot apply the two-thirds usefulness target across unlike roles; holders and information support need role-specific follow-up objectives.
