# User-Supplied Sprite Sources

`green-sea-turtle-left-facing.png` is the original 64×64 sprite supplied by the user. The game uses a horizontal orientation change so the turtle faces right, followed by palette normalization without resizing. The source remains unchanged for provenance and future rebuilds.

`hawksbill-sea-turtle-right-facing.png` is the original 64×64 Hawksbill sprite supplied by the user. It already faces right, so only palette normalization and the explicit white eye highlight are applied.

`scripts/prepare_reef_foundations.py --rebuild --check` applies the orientation and prepares the game asset.
