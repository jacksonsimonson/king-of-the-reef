# King of the Reef

A fish-based tactical card roguelike about building a school of fish and battling for control of valuable reefs.

## Project status

King of the Reef is in early development. The repository currently contains the original playable combat experiment recovered from its first browser prototype.

The current prototype uses a 4×4 board, directional card pushing, two objective spaces, a simple computer opponent, scoring, and rematches. The planned core battle format is a 5×5 board with three reefs.

## Vision

The game combines:

- Positional card combat inspired by the push-and-control structure of Joustus
- A branching roguelike map
- A fishing minigame used to acquire fish cards
- Shops, random events, hydration spaces, and boss encounters
- A growing collection of fish with distinct tactical identities

The goal is to take inspiration from positional card games without reproducing Joustus exactly. Fish species, reef control, currents, environmental tiles, weight, and roguelike progression will give the game its own identity.

## Play the recovered prototype

Open `dist/index.html` in a browser.

The prototype is intentionally preserved as the project's starting point. It will be replaced incrementally by a TypeScript, Vite, and Phaser implementation.

## Documentation

- [Game design](docs/GAME_DESIGN.md)
- [Roadmap](docs/ROADMAP.md)
- [Idea backlog](docs/IDEA_BACKLOG.md)
- [Design decisions](docs/DECISIONS.md)
- [Changelog](CHANGELOG.md)

## Planned technology

- TypeScript
- Vite
- Phaser
- GitHub Pages
- Pixel-art visual direction

## Visual direction

The intended presentation uses a slightly faded bright-yellow foundation with sharp red accents, readable card silhouettes, and simple pixel art.

## Development approach

Features are implemented in small, playable batches. Speculative ideas remain in the idea backlog until they are accepted into the game design and scheduled on the roadmap.
