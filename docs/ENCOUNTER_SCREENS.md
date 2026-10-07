# Encounter screens

Entering a noncombat map node replaces the chart with a dedicated encounter screen. The map detail panel only previews a node or offers a return to an unfinished visit; it no longer contains shop, hydration, fishing-selection, release, or event interactions.

| Visit | Screen and original pixel illustration |
| --- | --- |
| Shop | The Shell Exchange: striped market stall, shell sign, bottled wares, and hermit merchant |
| Hydration | The Living Spring: stepped stone arch, luminous water, and a healing basin |
| Fishing | The Quiet Jetty: pier, hanging net, fishing line, and passing fish |
| Release | An Open Current: a school swimming out through kelp |
| Event | Secrets of the Wreck: broken ship and treasure chest |

Each scene inherits its sea's backdrop and palette. Art is drawn at native canvas resolution on a four-pixel grid. Narrow windows scroll the illustration and wrap cards; neither text nor artwork is fractionally scaled.

## Navigation and persistence

- **View chart** inspects the route without completing the visit. **Resume visit** returns to the encounter. No purchase, healing, or release happens just by navigating.
- Reloading or reopening the voyage resumes its pending encounter. Purchased offers stay sold out and shell balances are saved. A shop stays open until **Sail On**.
- Hydration and release require an explicit confirmation. Unconfirmed card selections are temporary and reset when leaving/reloading the screen. Hydration can restore up to three cards and one resolve, including zero cards if only resolve is needed.
- The existing fishing activity remains a focused dialog launched from its dedicated encounter screen. Unfinished attempts reopen paused.
- Completing an encounter returns to the chart; gameplay rewards, prices, release restrictions, and save format are unchanged.

## Verification performed

Browser checks used isolated local fixtures, then the real voyage entry point: one-time shop purchase and reload, chart/resume, three-card hydration cap and confirmation, release confirmation, salvage rewards, fishing launch and paused reload, and native scene artwork. Full automated verification still covers the underlying shop, voyage, fishing, and save rules. Full-route balance and narrow-device playtesting remain follow-up checks.
