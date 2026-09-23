# King of the Reef

A fish-based tactical card roguelike about building a school of fish and battling for control of valuable reefs.

## Project status

King of the Reef is in early development. The current playable build uses a 5×5 board, three reef objectives, directional fish-card pushing, a computer opponent, scoring, and rematches.

## Vision

The game combines:

- Positional card combat inspired by the push-and-control structure of Joustus
- A branching roguelike map
- A fishing minigame used to acquire fish cards
- Shops, random events, hydration spaces, and boss encounters
- A growing collection of fish with distinct tactical identities

The goal is to take inspiration from positional card games without reproducing Joustus exactly. Fish species, reef control, currents, environmental tiles, weight, and roguelike progression will give the game its own identity.

## Run locally

Install dependencies and start the development server:

```powershell
npm.cmd install
npm.cmd run dev
```

The terminal will display the local URL. Stop the server with `Ctrl+C`.

## Documentation

- [Game design](docs/GAME_DESIGN.md)
- [Roadmap](docs/ROADMAP.md)
- [Idea backlog](docs/IDEA_BACKLOG.md)
- [Design decisions](docs/DECISIONS.md)
- [Changelog](CHANGELOG.md)

## Technology

- TypeScript
- Vite
- Phaser
- GitHub Pages
- GitHub Actions deployment
- Pixel-art visual direction

## Visual direction

The intended presentation uses deep ocean blue, lighter aquatic green, shiny pink objective pearls, readable card silhouettes, and simple pixel art.

## Development approach

Features are implemented in small, playable batches. Speculative ideas remain in the idea backlog until they are accepted into the game design and scheduled on the roadmap.
