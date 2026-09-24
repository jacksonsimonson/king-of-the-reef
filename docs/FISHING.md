# Fishing

Fishing spaces offer three seeded local creatures. Choose **Try** on one creature or **Skip** the stop. Trying commits the stop to that one creature.

## Controls And Outcome

- Hold **Left / Right** to move the catch zone along a horizontal lane. Release to stop; holding both cancels movement. Mouse movement, clicks, Up and Down do not move the zone.
- Keep the fish entirely inside the zone to increase catch progress. Progress decreases when it is outside.
- Progress starts at 30%, with a one-second grace period. Fill it to 100% to recruit the selected card. Reach zero, or the displayed 60-second limit, and the fish escapes.
- Escape automatically closes fishing, consumes that map stop, and gives no card. There is no retry and no abandon control.
- Skip is available only before trying. Once committed, there is no alternative target selection.
- Pause/Resume and the Escape key pause without abandoning. Losing window focus or hiding the tab also pauses. Escape cannot dismiss an unfinished catch.
- Save the full attempt periodically and when pausing or navigating away. Reloading resumes the same target, positions, progress and random sequence, paused until the player resumes. Success recruits once and advances the map; failure advances without recruitment.

## Regional Movement

| Region | Multiplier |
| --- | --- |
| Shoreline | 1.00x |
| Open Ocean | 1.35x |
| Bermuda Triangle | 1.70x |

The multiplier increases fish speed and target travel distance, and shortens the time between moves. Zone size, player speed and catch-meter rates stay constant. These are initial playtest values.

## Creature Groups

| Pattern | Behavior | Assigned Creatures |
| --- | --- | --- |
| Gradual Mover | Smooth movement between nearby positions | Minnow, Ocean Sunfish, Garden Eel, Boxfish |
| Darter | Fast bursts with pauses | Octopus, Tidepool Blenny, Shore Shrimp, Hypno Squid, Mantis Shrimp, Invisible Ink Squid |
| Runner | Long alternating runs | Anchovy, Sardine, Swordfish, Barracuda, Needlefish, Electric Eel, Moray Eel |
| Drifter | Slow, broad sweeps | Lure, Lionfish, Pufferfish, Seahorse |
| Lurker | Long waits followed by short sudden movement | Goby, Crab, Sea Star, Hermit Crab, Flounder, Sea Urchin |

Assign new creatures in src/game/fishing/model.ts. Coverage tests require every implemented creature to have one valid group. Patterns use the same configurable speed/range/interval structure, so a group can be tuned without editing individual cards.

## Rendering And Validation

The lane is a native 672x320 canvas using integer pixel geometry and the existing region scenery. Card previews retain 64px source art at exactly 2x. Neither canvas nor text is fractionally scaled; smaller windows scroll.

Simulation advances at a fixed 60 steps per second, independent of display refresh rate. Long frame stalls pause instead of silently losing the catch. Tests verify controls, terminal outcomes, save/resume, one-attempt rules, recruitment, creature coverage, and increased aggregate travel at each regional multiplier. Browser checks cover the keyboard flow, automatic loss exit, no retry or abandon controls, skip, single rewards, reload-resume and all three regional appearances.
