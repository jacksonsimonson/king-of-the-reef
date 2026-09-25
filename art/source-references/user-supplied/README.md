# User-Supplied Sprite Sources

`green-sea-turtle-left-facing.png` is the original 64×64 sprite supplied by the user. The game only mirrors it horizontally so the turtle faces right. No eye, palette, or drawing changes are added.

`hawksbill-sea-turtle-right-facing.png` is the original 64×64 Hawksbill sprite supplied by the user. It already faces right and is used without eye, palette, or drawing changes.

`scripts/prepare_reef_foundations.py --rebuild --check` applies the orientation and prepares the game asset.
