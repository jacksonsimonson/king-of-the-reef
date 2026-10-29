# Battle-ability assignments and relative balance budget

This is the assignment specification for the twenty battle-only abilities in [the shortlist](CARD_ABILITY_IDEAS.md), based on the current roster. It does not itself enable abilities or change saved cards. Exact runtime assignments require implementation, interaction tests, versioned saves and mixed-school comparisons. Balance assessments here are hypotheses, not measured win rates.

Use one innate ability per creature. Keep the common four directional guides unchanged: **Shoal goes to Clownfish**, whose existing two-edge package can pay for it. This replaces the tentative Minnow/Anchovy host. Retain existing Revelation and Rally creatures. No Colossal assignments.

Directions below are absolute card directions. Shield is the existing `weak` edge; Bite is `bigger-fish`; Follow is `follow-current`. An omitted side is blank. Preserve the listed clockwise resolution order except when Battle Plan explicitly reverses it.

| Creature / ability | Current edges | Proposed edges | Why this pays for the ability / remaining weakness |
| --- | --- | --- | --- |
| Flying Fish — Slipstream | Up Dive; right Double | Up Dive; right Standard | Trade penetration for flexible self-positioning. No Shields, no direct reef deployment; occupied landing spaces still stop it. High access budget. |
| Remora — Towline | Up Shield; right Hook | Up Shield; right Standard | Replace fixed distant pulling with one optional allied pull; keep a close-range job when no distant ally exists. Three exposed approaches, no enemy long-range pull. Moderate support budget. |
| Pufferfish — Inflate | Up Shield; right Standard; down Shield | Up Shield; right Standard | Remove lower permanent protection for one temporary movement block. After that, ordinary right/lower/left approaches remain. Moderate staying-power budget. |
| Decorator Crab — Borrowed Armor | Up Hook; right Shield | Up Hook | Replace its fixed Shield with one selected blank-side Shield; do not increase total armor. Flexible protection, restricted reach, two remaining blank sides. Moderate flexibility budget. |
| Sea Star — Spreading Arms | Right Standard; down Hook | Right Standard; down Hook | Retain these initially: delayed one-side growth is modest, never activates on arrival, and is worthless on the final play. Test against unmodified Sea Star before accepting this addition. Low provisional budget, not a claim of a free upgrade. |
| Mantis Shrimp — Focused Strike | Up Shield; right Double | Right Double | Trade its only armor for one strong directional attack. Bulwark, Anchor and blocked destinations still counter it. High penetration budget with three blank sides. |
| Orca — Pack Hunt | Up Standard; right Bite; down Follow | Up Standard; right Bite | Lose self-chase in exchange for a conditional supported kill. Another ally and legal Bite exit are still required; it cannot occupy the victim's reef automatically. High removal budget. |
| Whale Shark — Gentle Giant | Up Shield; right Wave; down Shield | Up Shield; right Wave | Lose one permanent defensive side to gain control over compulsory friendly fire. Left and lower approaches remain open. Moderate control budget. |
| Clownfish — Shoal | Up Standard; left Standard | Up Standard | Lose lateral delivery for conditional extra scoring. Any ally qualifies, but removing holder or supporter breaks the bonus. No armor or self-entry. High scoring budget. |
| Staghorn Coral — Reef Network | Up Spines; down Standard; left Spines | Up Spines; down Standard | Lose left retaliation for a support-scoring role; use the revised Network rule below. Retaliation does not prevent displacement. High scoring budget. |
| Bottlenose Dolphin — Sonar | Up Standard; right Double | Up Standard; right Standard | Trade penetration for reserve information; keep cooperative delivery. No guaranteed score or removal. Moderate information budget. |
| Humpback Whale — Relay | Up Wave; right Ram; down Wave | Up Wave; right Standard | Remove a whole fan and line shove for unconditional replacement-draw selection. Still shapes the board when reserve inspection is irrelevant. Moderate/high consistency budget. |
| Anglerfish — False Lure | Right Hook; down Bite | Right Hook; down Standard | Remove lethal jaws for hand disruption and information. Still delivers or dislodges targets. One forced exchange per owner per tide; no skipped plays. High disruption budget. |
| Pelagic Octopus — Mimicry | Up Dive; down Hook; left Bounce | Up Dive; down Standard | Two blank sides for copying; lose fixed long-range pull and retreat. Initial copy whitelist: Standard, Hook, Shield. Must find a nearby model and survive its own sequence. High adaptability budget. |
| Compass Jelly — True North | Up Swap; right Shock; left Swap | Up Swap; right Standard | Remove the second Swap and Shock before granting four orientations. One exchange, one ordinary follow-up; defended targets still counter it. High flexibility budget. |
| Phantom Shark — Afterimage | Up Bounce; right Bite | Up Bounce; right Bite | Retain initially because the decoy scores nothing, expires quickly and never blocks movement. It may provide little benefit after a late removal; do not weaken the independent predator role without evidence. Low provisional denial budget. |
| Cleaner Wrasse — Grooming | Right Standard; left Standard | Right Standard | Lose leftward delivery for ally cleansing and reorientation. A useful ordinary push remains when alone. No movement or edge retriggers from grooming. Moderate support budget. |
| Rust Lobster — Snare Line | Up Spines; right Hook; down Shield | Up Spines; right Hook | Remove lower armor for one temporary, visible threat zone. Rival can avoid it or lead with an expendable edge; no hard placement denial. Moderate denial budget. |
| Seahorse — Muster | Up Hook; down Hook | Up Hook; down Standard | Trade one long-range pull for an optional blind hand exchange. No reserve selection, extra draw or additional placement. Keep ordinary delivery when exhausted. Moderate consistency budget. |
| Map Serpent — Battle Plan | Up Swap; right Hook; down Follow | Up Swap; down Follow | Remove intermediate reach before allowing normal/reverse sequence. Defenses and blocked landing spaces still break the planned route. High sequence budget. |

## Refinement needed for Reef Network

The earlier rule awarded a bonus only after already holding two reefs. On a three-reef board with ordinary one-point holders, that usually just increases an already-winning margin. That is too weak a reason to add an ability.

Instead: **a Network creature off a reef contributes one point while orthogonally adjacent to a reef occupied by an ally**. On a reef it contributes its ordinary reef score instead; no extra Network point. At most one off-reef Network point per owner, regardless of copies. A Sovereign-bearing Network creature cannot supply that off-reef bonus. Taking the reef or moving/removing the coral breaks the connection. This creates a useful alternative scoring formation while requiring two vulnerable board pieces. It never creates a reef or a self-sufficient scoring token. Test it directly against Shoal: support can be placed normally, so it needs an appropriately weak edge profile and open approaches.

## Balance gates before enabling the assignments

1. **Independent value:** every host must still have an ordinary board job without its ideal ally, hidden card, reserve or token trigger. Low-value final-play abilities need viable edges, not compensation through guaranteed extra points.
2. **Role scenarios:** test exposed and Shielded reef holders, allied delivery, occupied landing spaces, sparse boards and ordinary counters. Include friendly harm; optional effects must not secretly become unconditional bonuses.
3. **Matched comparisons:** old host versus new host in otherwise identical mixed schools, shared seeds, both tide starters and current 4/5/6 budgets. Include no charms and plausible three-charm inventories. Track actual plays, score contribution, casualties and failed/unused activations. Investigate large changes rather than using one universal pass/fail win-rate target.
4. **Priority combinations:** direct-reef charm with Shoal/Network; Anchor with Inflate; Piercing with Pack Hunt; Mimicry plus edge charms; orientation plus stored-order reversal; multiple reveals/exchanges; decoy/snare expiry with an exhausted opponent. No extra placements or repeated triggers.
5. **Player choices and AI:** equivalent legal options, no hidden-hand/deck peeking beyond the ability's rules, clear previews, cancellation where applicable, and readable status/expiry displays.
6. **Compatibility:** existing saved schools, rival pools, offers and in-progress battles keep prior rules. New content needs a new balance version, not rewriting the existing version-six catalog. Tide reset clears temporary growth, armor, markers and used tokens.

The two retain-edge candidates (Sea Star and Phantom Shark) are intentionally explicit audit points. If testing shows clear upgrades over ordinary peers, reduce their edges or narrow their effects; do not justify them through rarity. Likewise, aggressive cuts on Humpback, Compass Jelly and Map Serpent may prove excessive and should be relaxed only after comparative evidence.
