# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Backend for the Odysseus LARP — a live-action role-play game that simulates a
spaceship. It is not a normal web application. It is a real-time game server
with a REST API attached. Around ten front-end applications and some physical
hardware depend on it, and it drives stage lighting and sound over DMX.

Most behaviour is not in the route handlers. It is in the rules engine, which
reacts to state changes. Read "Architecture" below before changing anything.

## Commands

```sh
npm start                # dev server with nodemon, NODE_ENV=development, port from APP_PORT
npm run build            # tsc to dist/
npm run lint             # eslint src test db
npm run lint:fix         # eslint --fix

npm run db:start         # start local PostGIS in Docker (first run pulls ~700MB)
npm run db:migrate       # knex migrate:latest
npm run db:rollback      # knex migrate:rollback
npm run db:migrate:down  # roll back one migration
npm run db:seed          # knex seed:run, then the Redux seed
npm run redux:seed       # seed the Redux store blobs only
```

Setup: copy `.env.dist` to `.env`, then `npm run db:start && npm run db:migrate
&& npm run db:seed && npm start`. Server comes up at http://localhost:8888,
Swagger UI at `/api-docs`.

**There are no tests.** `npm test` is wired to ava + nyc and the Babel config
has a `test` environment, but there is no `test/` directory and no test files.
Do not report test results without checking that a suite actually exists. When
changing behaviour, verify against a running instance.

## Code style

Tabs, single quotes, semicolons, 120 columns (`.editorconfig`, `.prettierrc.js`,
`.eslintrc.cjs`). A husky pre-commit hook runs lint-staged on `*.js`.

TypeScript is `strict: false` and `allowJs: true`. About half the tree is
untyped `.js` from 2018-2019; the `.ts` files are mostly from 2024. Match the
surrounding file rather than converting it.

`@/` is a path alias for `src/` (`tsconfig.json` `paths`, resolved through
`tsconfig-paths/register`). Newer files use it; older ones use relative imports.

## Architecture

### Two state systems with different semantics

**A. Relational state** — Bookshelf models over PostgreSQL tables. Persons,
ships, grids, map objects, posts, votes, logs, artifacts, tags, infoboard
entries, SIP contacts, story data. Written directly by route handlers.

**B. Live game state** — a Redux store in process memory (`src/store/`).
Boxes, tasks, ship systems, jump state, the EmptyEpsilon mirror. Addressed as
`data[type][id]`, exposed over the `/data` routes and the `/data` Socket.IO
namespace.

Store B is persisted by serialising **the entire store into a single row** of
the `store` table every 5 seconds (`src/store/storePersistance.ts`). This means
no per-object transactions, a 5-second data-loss window, and that two backend
processes cannot run at once without clobbering each other. The process is
stateful and single-instance.

### The rules engine

`loadRules()` (`src/rules/rules.js`) reads every *subdirectory* of `src/rules/`
and `require`s every file in it. Registering a rule is a side effect of the
import — there is no registry. Files directly in `src/rules/` are libraries, not
rules.

A rule calls `watch(path, callback)` (`src/store/store.ts`). When the object at
that path changes by reference, the callback runs via `setTimeout(..., 0)`.
Callbacks usually write back to the store, which triggers other rules. Cascades
and feedback loops exist and are mapped in `docs/rewrite/rules-engine.md`.

Consequence to keep in mind: **an ordinary `POST /data/:type/:id` can fire DMX
lighting, switch mains power through TP-Link plugs, damage the EmptyEpsilon
simulation, and write several tables.** The route name tells you nothing about
the blast radius.

### Startup order

`src/index.ts` loads persisted state from the `store` table, then initialises
the Redux state, enables persistence, loads rules, starts TP-Link scanning,
starts the HTTP listener, and starts the EmptyEpsilon poll loop. Swagger and the
Socket.IO store bridge are set up *outside* that promise, so they run before the
state exists.

### External integrations

- **EmptyEpsilon** — a spaceship simulator, polled over HTTP every
  `EMPTY_EPSILON_UPDATE_INTERVAL_MS`. If `EMPTY_EPSILON_HOST` is unset, an
  in-process emulator runs instead (`src/integrations/emptyepsilon/emulator.ts`).
  Development and production therefore take different code paths.
- **DMX** and **TP-Link** — physical effects. Disabled when the driver env vars
  are empty, but the code paths still run.
- **GeoServer** — see below. It reads this database directly.

## Traps

These cost time if you do not know them up front.

- **`requireFetch = false`** (`db/index.ts`). A missing row returns `null`
  instead of throwing. Most route code does not check, so a bad id yields 200
  with a null body rather than a 404.
- **Bookshelf model hooks fire invisibly.** Several models register
  `on('created')`, `on('updated')`, `on('fetching')` and `on('destroying')`
  listeners in `initialize()`. `Ship` injects a `person_count` subquery into
  every fetch and emits `shipUpdated` on save. Raw `knex` writes bypass all of
  it, so the ORM path and the raw path have different side effects — see
  `Ship.jumpFleet` (`src/models/ship.js`), which relies on this deliberately.
- **`watch()` has no `try/catch`** and there is no `uncaughtException` handler.
  A throwing rule kills the process, and because a crash raises no signal it
  also skips the `SIGINT`/`SIGTERM` handler that saves state. `interval()` and
  `timeout()` in `src/rules/helpers.js` do catch; `watch()` was missed.
- **No authentication anywhere.** The only exception is the `/messaging`
  Socket.IO handshake, which reads a person id from the query string — that
  identifies, it does not authenticate.
- **Two dependencies are git forks**, not npm packages: `bookshelf`
  (`OdysseusLarp/bookshelf`, supplies `fetchPage` and `orderBy('-x')`) and
  `express-swagger-generator`. Neither has a drop-in upstream equivalent.
- **`dist/` is a stale build** containing files that no longer exist in `src/`.
  Never read it as a source of truth.
- **`personal/` is one developer's working files**, not part of the application.
- The dead `box` and `task` *tables* share their names with live Redux blob
  types. Check which one is meant.
- Route ordering matters in several files: literal paths such as
  `/person/filters` are declared before `/person/:id`.

## Database

PostgreSQL 12 + PostGIS. Knex migrations in `db/migrations/`, seeds in
`db/seeds/`, CSV source data in `db/data/`. Redux blob seeds live separately in
`db/redux/`.

**GeoServer reads this same database directly** (`odysseus-geoserver`, its
`datastore.xml` points at the same host, database and schema). It publishes 13
WMS/WFS layers over `grid`, `starmap_bg` and eight SQL views that the migrations
create. Those tables and views are a public integration surface, not internal
storage — renaming or reshaping them breaks the map in every client. This is
also why several `starmap_*` views are referenced nowhere in `src/`.

Both map clients fetch map data from GeoServer over WMS/WFS, bypassing the
`/starmap` REST routes entirely.

API documentation is generated from JSDoc comments above the route handlers.
Keep them in sync when changing a route.

## Related repositories

All are siblings under `~/git/`. Ports are the development defaults.

| Repository | Port | What it is | Talks to backend via |
|---|---|---|---|
| `odysseus-admin` | 8090 | GM admin UI over the whole backend | REST + Socket.IO |
| `odysseus-admin-story-tool` | 3000 | Story GM tool for plots, characters, events | REST (`/story` + 13 game endpoints) |
| `odysseus-data-hub` | 4200 | Player-facing hub: social, messaging, map | REST + Socket.IO (`/data`, `/messaging`) |
| `odysseus-jump-ui` | 4300 | Jump controls and navigation | REST + Socket.IO, GeoServer for map |
| `odysseus-HANSCA` | 8080 | Handheld scanner for engineers, medics, scientists | REST |
| `odysseus-mct` | 8060 | Engineering console: faults, jump drive, ship status | REST + Socket.IO |
| `odysseus-misc-ui` | 8082 | Infoscreens, airlocks, engineering MCT | REST + Socket.IO |
| `odysseus-geoserver` | 8070 | Map tile server | **direct PostGIS access, not the API** |
| `odysseus-hackbar` | — | In-game hacking prop | none |
| `odysseus-story-llm-tools` | — | LLM tooling; reads hand-written Markdown only | none |
| `odysseus-python` | — | Python client library for the backend (Poetry) | REST |
| `odysseus-server-configs` | — | Deployment configuration and topology | none |

## Deployment

`.github/workflows/build-and-deploy-backend.yml` builds a Docker image on push
to `master`, pushes it to Amazon ECR (eu-west-1), then SSHes to the server and
runs `docker compose pull && docker compose up -d`. The image sets the
Europe/Helsinki timezone and runs `npm run start:prod`, which waits for the
database before starting.

## Rewrite documentation

`docs/rewrite/` holds a detailed specification of the current system, written
for a planned rewrite: all 102 endpoints, the consolidated schema with SQLite
portability verdicts, every Bookshelf model with plain-SQL equivalents, the
rules engine and its cascades, a ranked catalog of 42 unexpected side effects,
the Story DB coupling analysis, and a client-to-endpoint matrix.

Start at `docs/rewrite/00-overview.md`. `docs/rewrite/bugs.md` lists 32 known
defects — check it before assuming behaviour you see is intentional.
