# Fishing

Fishing spaces offer three seeded local creatures. Choose **Fish** on one creature or **Skip** the stop. Trying commits the stop to that one creature.

## Controls And Outcome

- Hold the primary mouse button or touch on the fishing lane, or hold **Right**, to accelerate against a constant leftward pull. Release to coast, slow down and accelerate back left. **Left** pulls back faster. Changing direction takes time; holding both cancels input thrust but leaves the leftward pull. The weighted zone stops at the lane boundaries. Dragging does not teleport the zone; pointer hold uses the same thrust as Right. Releasing outside the lane, canceling a touch, pausing or losing focus clears the hold. Up and Down do not move it.
- Keep the fish entirely inside the zone to increase catch progress. Progress decreases when it is outside.
- Progress starts at 30%, with a one-second grace period. Fill it to 100% to recruit the selected card. Reach zero, or the displayed 60-second limit, and the fish escapes.
- An escaped fish automatically closes fishing, consumes the attempt, and gives no card. Ordinary fishing stops have one attempt; [Fish Camp](FISH_CAMP.md) has two separate attempts. There is no retry of a spent attempt and no abandon control.
- Skip is available only before trying. Once committed, there is no alternative target selection.
- Pause/Resume and the Escape key pause without abandoning. Losing window focus or hiding the tab also pauses. Escape cannot dismiss an unfinished catch.
- Save the full attempt periodically and when pausing or navigating away, including zone momentum. Reloading resumes the same target, positions, progress and random sequence, paused until the player resumes. Ordinary stops advance after either outcome; camp returns to its remaining-attempt counter. Existing saved attempts without a control version keep direct controls for that attempt; new attempts use weighted controls.

Weighted controls use fixed 60 Hz integration: right thrust 1.9, passive left acceleration 0.75, additional left thrust 1.0, and speed capped at 0.85 lane widths per second. Net right acceleration is 1.15. These are feel-tuning values; fish profiles, zone width and catch-meter rates are unchanged. [Camp and control validation](FISH_CAMP.md) records synthetic tracking and browser checks without claiming human success rates.

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
