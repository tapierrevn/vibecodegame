# vibecode.game

> Discover great games faster.  
> A modern, content-driven game discovery platform built with Astro.

<p align="left">
  <a href="https://github.com/tapierrevn/vibecodegame"><img src="https://img.shields.io/badge/repo-vibecodegame-111827?style=flat&logo=github" alt="Repository" /></a>
  <a href="https://github.com/tapierrevn/vibecodegame/issues"><img src="https://img.shields.io/github/issues/tapierrevn/vibecodegame?style=flat" alt="Issues" /></a>
  <img src="https://img.shields.io/badge/Astro-6.x-ff5d01?style=flat&logo=astro" alt="Astro" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat" alt="MIT License" />
</p>

---

## Overview

`vibecode.game` is focused on helping players explore games through structured content, clean UI, and fast navigation.

### Core goals

- Curate games with rich metadata
- Highlight developers and creators
- Publish editorial content (guides, updates, deep dives)
- Keep performance and SEO first-class

---

## Product Status

**Current stage:** Early production build  
**Focus area:** Content foundation + ratings/reviews roadmap

### In progress

- [x] Core Astro setup and content architecture
- [x] Developer and game content modeling
- [ ] Ratings & reviews feature
- [ ] Advanced filtering/sorting
- [ ] Personalized user features

---

## Preview (Screenshots)

> Replace these placeholders with real screenshots once available.

- `docs/screenshots/home.png` - Home / discovery view
- `docs/screenshots/game-detail.png` - Game detail page
- `docs/screenshots/developer-profile.png` - Developer profile page

Example markdown once screenshots exist:

```md
![Home](docs/screenshots/home.png)
![Game Detail](docs/screenshots/game-detail.png)
![Developer Profile](docs/screenshots/developer-profile.png)
```

---

## Tech Stack

- [Astro](https://astro.build/) - fast static-first rendering
- [Tailwind CSS](https://tailwindcss.com/) - utility-first styling
- [TypeScript](https://www.typescriptlang.org/) - type safety
- [React](https://react.dev/) - interactive UI islands
- [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) - testing

---

## Quick Start

### 1) Clone

```bash
git clone https://github.com/tapierrevn/vibecodegame.git
cd vibecodegame
```

### 2) Install dependencies

```bash
pnpm install
```

### 3) Run local dev server

```bash
pnpm dev
```

Open: `http://localhost:4321`

---

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Astro checks
- `pnpm lint` / `pnpm lint:fix` - Linting
- `pnpm format` / `pnpm format:check` - Formatting
- `pnpm test` - Unit tests
- `pnpm test:e2e` - End-to-end tests
- `pnpm validate` - Lint + check + build

---

## Project Structure

```text
.
|- src/
|  |- components/        # Reusable UI components
|  |- config/            # Site and app settings
|  |- content/           # Games, developers, blog content
|  |- layouts/           # Layout templates
|  `- pages/             # Routes and page entries
|- public/               # Static files
|- scripts/              # Utility/build scripts
|- wrangler.toml         # Cloudflare config
`- package.json
```

---

## Deployment

### Vercel

- Import repository in Vercel
- Build command: `pnpm build`
- Output directory: `dist`
- Add required environment variables

### Cloudflare

- Verify values in `wrangler.toml` (`name`, account/project settings)
- Build with `pnpm build`
- Deploy using Wrangler commands/workflow

---

## Contributing

Contributions, ideas, and bug reports are welcome.

- Repository: [tapierrevn/vibecodegame](https://github.com/tapierrevn/vibecodegame)
- Issues: [github.com/tapierrevn/vibecodegame/issues](https://github.com/tapierrevn/vibecodegame/issues)

---

## License

MIT - see `LICENSE`.
