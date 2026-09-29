# User-Supplied Sprite Sources

`green-sea-turtle-left-facing.png` is the original 64×64 sprite supplied by the user. The game only mirrors it horizontally so the turtle faces right. No eye, palette, or drawing changes are added.

`hawksbill-sea-turtle-right-facing.png` is the original 64×64 Hawksbill sprite supplied by the user. It already faces right and is used without eye, palette, or drawing changes.

`stingray.png` is the original 64×64 Stingray sprite supplied by the user and is used without eye, palette, orientation, or drawing changes.

The Spotted Eagle Ray, Bottlenose Dolphin, Yellow Tang, Butterflyfish, Moorish Idol, Clown Triggerfish, Cleaner Wrasse, Flying Gurnard, Trumpetfish, Arrow Crab, and Pom-Pom Crab files are the supplied 64×64 sprites. They already face right or have no meaningful horizontal facing, so they are used unchanged.

`remora-left-facing.png` is the supplied 64×64 Remora sprite. The game only mirrors it horizontally so the fish faces right.

`needlefish.png` is the supplied 64×64 Needlefish sprite. It already faces right and is used unchanged.

`scripts/prepare_reef_foundations.py --rebuild --check` applies the orientation and prepares the game asset.
