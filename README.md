# King of the Reef

A fish-based tactical card roguelike about building a school of fish and battling for control of valuable reefs.

## Project status

King of the Reef is in early development. The current playable build uses a 5×5 board, three reef objectives, directional fish-card pushing, a computer opponent, scoring, and rematches.

## Vision

The game combines:

- Positional card combat inspired by the push-and-control structure of Joustus
- A branching roguelike map
- A fishing minigame used to acquire fish cards
- Shops, random events, hydration spaces, and Colossal encounters
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
- [Voyage maps and roguelike rules](docs/VOYAGE.md)
- [Edge-effect rules](docs/EDGE_EFFECTS.md)
- [Roadmap](docs/ROADMAP.md)
- [Idea backlog](docs/IDEA_BACKLOG.md)
- [Design decisions](docs/DECISIONS.md)
- [Pixel-art sprite guide](docs/PIXEL_ART_GUIDE.md)
- [Changelog](CHANGELOG.md)

## Technology

- TypeScript
- Vite
- Phaser
- GitHub Pages
- GitHub Actions deployment
- Pixel-art visual direction

## Hosting

- The standalone playable build is deployed through [GitHub Pages](https://jacksonsimonson.github.io/king-of-the-reef/).
- The long-term public home is the [Jackson Game Dev hub](https://jackson-game-dev.cheme911.chatgpt.site/), which is intended to host King of the Reef alongside future games.

## Visual direction

The intended presentation uses deep ocean blue, lighter aquatic green, shiny pink objective pearls, readable card silhouettes, and simple pixel art.

## Development approach

Features are implemented in small, playable batches. Speculative ideas remain in the idea backlog until they are accepted into the game design and scheduled on the roadmap.

Start work on a `codex/` feature branch, validate with `npm test` and `npm run build`, then merge completed, authorized work into `main`. Voyage in the main menu starts or resumes a three-region run; each region ends at a Colossal.
