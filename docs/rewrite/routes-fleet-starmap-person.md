# Routes: fleet, starmap, person, event, post, vote, log

This document covers seven route files: `src/routes/fleet.js`, `src/routes/starmap.js`, `src/routes/person.js`, `src/routes/event.js`, `src/routes/post.js`, `src/routes/vote.js`, `src/routes/log.js`. These routes cover the fleet of ships, the starmap grid, and beacons. They also cover player characters (persons), timed game events, Social Hub posts, votes, and the ship log. All seven mount points are wired in `src/index.ts:79-85` with no prefix stripping. The paths below already include the mount prefix. No route in this document checks a credential. This is a design decision. See the trust model in `00-overview.md` section 2. The route entries below do not repeat it. Many routes trigger side effects that are not visible from the route handler alone. Examples: Bookshelf model lifecycle hooks that emit Socket.IO events, and, for `PUT /event`, a separate timer-driven subsystem in `src/eventhandler.js`.

## Route table

| Method | Path | Purpose | Tags |
|---|---|---|---|
| GET | /fleet | List all ships, optionally including hidden ones | `[PG]` `[GIS]` `[BOOKSHELF]` |
| GET | /fleet/{id} | Get one ship by id | `[PG]` `[GIS]` `[BOOKSHELF]` |
| PUT | /fleet/set-visible | Mark all ships visible | `[PG]` `[SIDE-EFFECT]` |
| POST | /fleet/move | Move a set of ships to a grid or planet orbit | `[PG]` `[GIS]` `[BOOKSHELF]` `[SIDE-EFFECT]` `[BUG]` |
| PUT | /fleet/{id} | Update arbitrary ship fields | `[PG]` `[GIS]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| PATCH | /fleet/{id}/metadata | Set one key inside a ship's metadata JSON | `[BOOKSHELF]` `[SIDE-EFFECT]` |
| POST | /fleet/{id}/jump/validate | Check whether a jump target is reachable | `[PG]` `[GIS]` `[BOOKSHELF]` |
| POST | /fleet/{id}/destroy | Destroy a ship and kill everyone aboard | `[PG]` `[SIDE-EFFECT]` |
| GET | /starmap/grid | Get the grid Odysseus currently occupies | `[PG]` `[BOOKSHELF]` |
| GET | /starmap/grid/{id} | Get one grid by id, with its ships | `[PG]` `[BOOKSHELF]` |
| PUT | /starmap/beacon/decode/{id} | Decrypt a beacon signal | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| PUT | /starmap/velian-distress-signal | Handle the scripted Velian distress signal | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| GET | /person | List persons, paginated and filtered | `[PG]` `[BOOKSHELF]` |
| GET | /person/filters | List distinct values usable as person filters | `[PG]` |
| GET | /person/groups | List all groups | `[PG]` `[BOOKSHELF]` `[BUG]` |
| GET | /person/{id} | Get one person by id, optionally as a hacker login | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| GET | /person/card/{id} | Get one person by card id | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| GET | /person/bio/{id} | Get one person by bio id | `[PG]` `[BOOKSHELF]` |
| GET | /person/search/{name} | Search persons by name substring | `[PG]` `[BOOKSHELF]` |
| PUT | /person/set-visible | Mark all persons visible except a blacklist | `[PG]` |
| PUT | /person/{id} | Update arbitrary person fields | `[PG]` `[BOOKSHELF]` |
| PUT | /person/{id}/family | Update a family relation pivot row | `[PG]` `[BOOKSHELF]` `[BUG]` |
| POST | /person/{id}/entry | Add a personal/military/medical log entry | `[PG]` |
| PUT | /person/{id}/kill | Kill a person | `[PG]` `[SIDE-EFFECT]` |
| PUT | /person/{id}/group/{groupId} | Add a person to a group | `[PG]` `[SIDE-EFFECT]` |
| DELETE | /person/{id}/group/{groupId} | Remove a person from a group | `[PG]` `[SIDE-EFFECT]` |
| GET | /event | List active events | `[PG]` |
| GET | /event/{id} | Get one event by id | `[PG]` |
| PUT | /event | Create or update an event | `[PG]` `[SIDE-EFFECT]` `[BUG]` |
| GET | /post | List Social Hub posts | `[PG]` `[BOOKSHELF]` |
| GET | /post/{id} | Get one post by id | `[PG]` `[BOOKSHELF]` |
| PUT | /post | Create or update a post | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` `[BUG]` |
| GET | /vote | List votes | `[PG]` `[BOOKSHELF]` |
| GET | /vote/{id} | Get one vote by id | `[PG]` `[BOOKSHELF]` |
| PUT | /vote/create | Create a vote with options | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| PUT | /vote/{id} | Update a vote (approve/reject/edit) | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| PUT | /vote/{id}/cast | Cast a vote | `[PG]` `[BOOKSHELF]` `[BUG]` |
| GET | /log | List ship log entries, paginated | `[PG]` |
| PUT | /log | Create or update a ship log entry | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| GET | /log/audit | List audit log entries, paginated | `[PG]` `[BOOKSHELF]` `[BUG]` |
| POST | /log/audit | Create an audit log entry | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |
| DELETE | /log/{id} | Delete a ship log entry | `[PG]` `[BOOKSHELF]` `[SIDE-EFFECT]` |

---

## Fleet routes (`src/routes/fleet.js`, mounted at `/fleet` in `src/index.ts:79`)

### `GET /fleet`
**Source:** `src/routes/fleet.js:16`

**Purpose:** List all ships in the fleet, with current grid location.

**Request:** Query param `show_hidden` (string `"true"`/other). No body. The route does not validate this param. Any value other than the literal string `"true"` counts as false.

**Response:** `200` with a JSON array of ship objects (Bookshelf collection `toJSON()`). There is no error path. An empty fleet returns `[]`.

**Database reads:** `[PG] [BOOKSHELF]` Reads the `ship` table through `Ship.fetchAllWithRelated` (`src/models/ship.js:175-181`), ordered by `id`. Joins `grid` through the `position` relation (`hasOne(Grid, 'id', 'grid_id')`, `src/models/ship.js:169-171`). Every fetch, single or collection, also runs a correlated subquery against `person` to compute `person_count` (`src/models/ship.js:157-162`): `SELECT COUNT(*) FROM person WHERE person.ship_id = ship.id AND person.is_visible IS TRUE AND person.status = 'Present and accounted for'`. `[GIS]` When `show_hidden` is absent or false, the query filters `is_visible = true`. The route adds geometry only when `withGeometry` is requested. The fleet list does not request it (`getColumns(false)` returns `undefined`, `src/models/ship.js:116-119`). So this route does not return `the_geom`/`geom`, even though the model supports it.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** A Bookshelf `fetching`/`fetching:collection` event listener injects the `person_count` column (`src/models/ship.js:157-162`). This is invisible from the route code. It is a real SQL subquery per ship, not an N+1 loop. But every ship fetch carries this extra subquery, even when nothing needs it. The model fixes the sort order to `id`. A caller cannot change it.

### `GET /fleet/{id}`
**Source:** `src/routes/fleet.js:30`

**Purpose:** Get one ship, with its current grid location and geometry.

**Request:** Path param `id` (ship id string, e.g. `odysseus`). The route does not validate it. An unknown id returns a resolved Bookshelf model with all attributes `null` or absent, not a 404 (`requireFetch` is disabled globally, `db/index.ts:11`).

**Response:** `200` with a ship JSON object. If `id` does not exist, the response is still `200`, with an almost empty object (`id` absent, `position` relation absent). There is no explicit 404 handling.

**Database reads:** `[PG] [GIS] [BOOKSHELF]` `Ship.fetchWithRelated({ withGeometry: true })` (`src/models/ship.js:182-185`). Selects `ship.*` plus `ST_AsGeoJSON(ship.the_geom)::jsonb AS geom` (`src/models/ship.js:116-119`). Joins `grid` through the `position` relation. Runs the same `person_count` subquery as the list route.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]`-adjacent: this route returns `200` for a non-existent ship id instead of `404`. This is a project-wide pattern (see `requireFetch = false` in `db/index.ts:11`), not specific to this route. But it means client code cannot rely on the HTTP status to detect a missing ship.

### `PUT /fleet/set-visible`
**Source:** `src/routes/fleet.js:41`

**Purpose:** Mark every ship as visible (discovered).

**Request:** No path, query, or body params used.

**Response:** `204` empty on success.

**Database reads:** None.

**Database writes:** `[PG]` Raw SQL `UPDATE ship SET is_visible = true` for all rows, with no `WHERE` clause (`src/models/ship.js:238`). This bypasses Bookshelf entirely (raw `knex.raw`), so no model events fire.

**Side effects:** `[SIDE-EFFECT]` Emits Socket.IO event `refreshMap` (default namespace, broadcast to all clients) after the update (`src/models/ship.js:239`).

**Rewrite notes:** Because this is raw SQL, no `Ship` "updated" hook runs. So `shipUpdated` is not emitted, even for Odysseus. Only the generic `refreshMap` event fires. A rewrite must reproduce this narrower signal on purpose, not just "save every ship."

### `POST /fleet/move`
**Source:** `src/routes/fleet.js:54`

**Purpose:** Move a set of ships to a target grid, optionally landing on a specific planet's orbit within that grid.

**Request:** Body `{ shipIds: string[], jumpTarget: { sub_quadrant, sector, sub_sector, planet_orbit? } }`. The route validates only the shape: `shipIds` must be an array, `jumpTarget` must be a plain object (`src/routes/fleet.js:56-57`, using `lodash.isPlainObject`). It does not validate the field contents (grid coordinates, ship id validity).

**Response:** `204` empty on success. Throws a generic `BadRequest` (400) if the two shape checks fail. If the grid lookup fails, or the geometry cannot be computed, the route still returns `204`. See writes and side effects below. It only logs an error server-side (`src/models/ship.js:287`).

**Database reads:** `[PG] [GIS] [BOOKSHELF]` `moveShips` (`src/models/ship.js:274-291`) reads: ships matching `id IN (shipIds)` from `ship`; `grid` filtered by `sub_quadrant`/`sector`/`sub_sector`; if `planet_orbit` is given, `starmap_object` filtered by `name_generated`. If no target planet is given, it calls `Grid.getRandomJumpTarget()` (`src/models/ship.js:37-40`), which runs `SELECT ST_Translate(ST_Centroid(grid.the_geom), FLOOR(RANDOM()*300000-150000), FLOOR(RANDOM()*300000-150000)) AS jump_target FROM grid WHERE grid.id = ?`. This produces a **random** geometry, different on every call.

**Database writes:** `[PG] [BOOKSHELF]` For each matched ship, `ship.moveTo(gridId, targetGeometry)` calls `this.save({ grid_id, the_geom }, { patch: true })` (`src/models/ship.js:203-205`). This is one `UPDATE ship` per ship through Bookshelf, so the Odysseus `updated` hook fires if Odysseus is among the moved ships.

**Side effects:** `[SIDE-EFFECT]` Emits Socket.IO `refreshMap` (broadcast) at the end of `moveShips` (`src/models/ship.js:290`). If Odysseus is one of the moved ships, its Bookshelf `updated` hook also emits `shipUpdated` with the refetched ship (`src/models/ship.js:146-156`).

**Rewrite notes:** `[BUG]` `src/models/ship.js:288`: `await Promise.all([ships.map(ship => ship.moveTo(...))]);` wraps the array of promises inside another array instead of spreading it. `Promise.all` only waits on its own single array argument, which is not a thenable. So this line resolves almost immediately and does **not** wait for the individual `ship.moveTo` saves to finish. The saves still run, because they were already invoked. But the following `logger.success` call and the `refreshMap` socket emit can fire early. They can run before all ships are actually updated in the database. This is a race condition. Also note: `getRandomJumpTarget` produces a different random point on every call. Retries or duplicate requests move ships to different coordinates each time. The operation is not idempotent.

### `PUT /fleet/{id}`
**Source:** `src/routes/fleet.js:71`

**Purpose:** Update arbitrary fields on one ship.

**Request:** Path param `id`. Body: any ship fields (comment at `src/routes/fleet.js:73`: `// TODO: Validate input`). The route does not validate field names or types. Anything in the body is passed to `save()`.

**Response:** `200` with the updated ship (refetched with relations and geometry). Throws a generic `Error` (500, not 404) if the ship id does not exist (`src/routes/fleet.js:75`, a plain `Error`, not `NotFound`).

**Database reads:** `[PG] [GIS] [BOOKSHELF]` Fetches the ship once to check it exists, then refetches with `fetchWithRelated({ withGeometry: true })` after saving.

**Database writes:** `[PG] [BOOKSHELF]` `ship.save(req.body, { method: 'update', patch: true })`. This is a patch update of `ship` with whatever keys the caller sent, including protected-looking fields like `id`, `status`, `the_geom`.

**Side effects:** `[SIDE-EFFECT]` If `id === 'odysseus'`, the `updated` hook fires and emits Socket.IO `shipUpdated` with a freshly refetched Odysseus model (`src/models/ship.js:146-156`). For any other ship id, no socket event fires from this route.

**Rewrite notes:** There is no field allowlist. A client can overwrite `id`, `grid_id`, `the_geom`, or `person_count`. However, `person_count` is unset again in the `saving` hook at `src/models/ship.js:163-167`, because it is not a real column. This route is a generic "patch any column" endpoint. It is hard to port safely without deciding which fields should actually be writable from outside.

### `PATCH /fleet/{id}/metadata`
**Source:** `src/routes/fleet.js:90`

**Purpose:** Set a single nested key inside a ship's `metadata` JSON blob.

**Request:** Path param `id`. Body `{ key_path: string, value: any }`. The route validates only that both are present (`src/routes/fleet.js:93`). `key_path` is passed straight to `lodash.set`, so it can address arbitrarily deep or newly created nested paths, including array indices.

**Response:** `204` empty. Throws a generic `Error` if `key_path` or `value` is missing, or if the ship is not found (both 500, not 400/404).

**Database reads:** `[PG] [BOOKSHELF]` Fetches the ship by id, with no relations.

**Database writes:** `[PG] [BOOKSHELF]` Clones the current `metadata`, applies `lodash.set(metadata, key_path, value)`, then `ship.save({ metadata }, { method: 'update', patch: true })`.

**Side effects:** `[SIDE-EFFECT]` Same as `PUT /fleet/{id}`: if `id === 'odysseus'`, this emits `shipUpdated` through the model's `updated` hook.

**Rewrite notes:** The route does not validate `key_path`. A client can therefore build any nested structure inside `metadata`. A path such as `__proto__` also reaches keys that `lodash.set` should not write. The value only goes into the JSON column, so the effect stays in the stored object. A rewrite should give `metadata` an explicit schema, not a free-form path setter.

### `POST /fleet/{id}/jump/validate`
**Source:** `src/routes/fleet.js:112`

**Purpose:** Check whether a ship could jump or scan to a target grid or orbit, without performing the jump.

**Request:** Path param `id` (ship id). Query param `validate_distance` (any value other than the literal string `"false"` means "validate"; default is true). Body: `JumpTargetInput` `{ sub_quadrant, sector, sub_sector, planet_orbit?, should_add_log_entries? }`. The route does not validate its shape.

**Response:** `200` with `{ isValid: boolean, message?: string }`.

**Database reads:** `[PG] [GIS] [BOOKSHELF]` `validateJumpTarget` (`src/eventhandler.js:166-193`) reads `grid` filtered by the three grid-coordinate fields. If `planet_orbit` is given, it calls `grid.containsObject(planetName)` (`src/models/ship.js:42-49`), which runs `SELECT ST_WITHIN((SELECT the_geom FROM starmap_object WHERE name_generated = ? AND celestial_body NOT IN ('star','black hole')), the_geom) AS has_object FROM grid WHERE id = ?`. It also fetches the ship with relations, to read its current grid position for range checking.

**Database writes:** None directly from this call, **but see side effects.**

**Side effects:** `[SIDE-EFFECT]` If `should_add_log_entries` is true in the body and validation fails, this GET-like validation call writes to the `ship_log` table through `addShipLogEntry('ERROR', ...)` (`src/eventhandler.js:173,177-178,188-189`). An endpoint that looks read-only, named "validate," can insert a ship log row. Through the `LogEntry` model's `created` hook, it also emits Socket.IO `logEntryAdded` (see the Log routes section).

**Rewrite notes:** The name and shape of this endpoint (`POST .../validate`) suggest a pure check. But it can conditionally write to the database and emit a socket event as a side effect. Range validation logic (`validateRange`, `src/eventhandler.js:202-211`) is a bounding-box check in grid-index space (`x`,`y` integer coordinates), not a geometric distance in `the_geom` units. A rewrite that assumes PostGIS distance functions are used here would be wrong.

### `POST /fleet/{id}/destroy`
**Source:** `src/routes/fleet.js:125`

**Purpose:** Destroy a ship and kill everyone recorded aboard it.

**Request:** Path param `id`. No body used.

**Response:** `204` empty on success. `400 BadRequest` if `id === 'odysseus'` (hardcoded protection, `src/routes/fleet.js:127`) or if the ship's `status` is already `'Destroyed'`. `404 NotFound` if the ship does not exist.

**Database reads:** `[PG]` Fetches the ship by id (plain `fetch()`, no relations). `destroyShip()` (`src/models/ship.js:206-230`) then runs a plain `knex('person').select('id').where('ship_id', ...)` to list persons aboard.

**Database writes:** `[PG]` Inside one `knex.transaction` (`src/models/ship.js:212-226`), in order: (1) `UPDATE ship SET status = 'Destroyed' WHERE id = ?`; (2) `UPDATE person SET status = 'Killed in action' WHERE id IN (...)`; (3) one `INSERT INTO person_entry (person_id, type='PERSONAL', entry="542 - Killed in action on board of <ship name>", added_by=<FLEET_SECRETARY_ID>)` per person aboard. All raw `knex`, bypassing Bookshelf model hooks.

**Side effects:** `[SIDE-EFFECT]` After the transaction commits: fires DMX channel `FleetShipDestroyed` (`src/dmx.ts:146`, fired at `src/models/ship.js:227`); emits Socket.IO `refreshMap` (broadcast, `src/models/ship.js:228`). Because the writes are raw SQL, the `Ship` and `Person` model `updated`/`created` hooks do **not** fire. So `shipUpdated` is not emitted, even if Odysseus's crew changes. No `LogEntry` socket events fire for the `person_entry` inserts either: those go directly to `person_entry`, not `ship_log`, so `logEntryAdded` correctly does not apply here. Note the word "log" here means the per-person entry log, not the ship log.

**Rewrite notes:** `env.FLEET_SECRETARY_ID` is a required but unvalidated environment variable, used as a foreign-key value (`added_by`). If it is unset, the insert stores `NULL` or `undefined`. The person-count read for `destroyShip` and the actual kill loop are not covered by a single atomic read-then-transact guarantee. A person added to the ship between the `SELECT` and the transaction's `UPDATE` would not be marked dead. This is a small race window.

---

## Starmap routes (`src/routes/starmap.js`, mounted at `/starmap` in `src/index.ts:80`)

### `GET /starmap/grid`
**Source:** `src/routes/starmap.js:14`

**Purpose:** Get the grid (sub-sector) that Odysseus currently occupies, with its ships.

**Request:** No params.

**Response:** `200` with a grid JSON object, including its `ships` relation. If Odysseus does not exist, calling `.get('grid_id')` on `undefined` throws. This is an unhandled exception, likely a raw 500 with a stack trace, not a clean JSON error (see Rewrite notes).

**Database reads:** `[PG] [BOOKSHELF]` Fetches `ship` where `id = 'odysseus'`, then `Grid.forge({ id: <grid_id> }).fetchWithRelated()` (`src/models/ship.js:30-32`), which is `this.fetch({ withRelated: ['ships'] })`. This reads `grid` joined to all `ship` rows with that `grid_id`.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]` This route is not wrapped in `handleAsyncErrors`, unlike every other route in this file. If `Ship.forge({ id: 'odysseus' }).fetch()` returns `null` (Odysseus missing) or the promise rejects, Express's default handling for unhandled async rejections applies, instead of the project's JSON `errorHandlingMiddleware` (`src/routes/helpers.ts:13-25`).

### `GET /starmap/grid/{id}`
**Source:** `src/routes/starmap.js:26`

**Purpose:** Get one grid by id, with its ships.

**Request:** Path param `id` (grid's integer id).

**Response:** `200` with a grid object, or an almost empty one if the id does not exist, since `requireFetch` is disabled.

**Database reads:** `[PG] [BOOKSHELF]` `Grid.fetchWithRelated()`, same as above.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]` This route is also not wrapped in `handleAsyncErrors` (`src/routes/starmap.js:26-28`), the same gap as `GET /starmap/grid` above.

### `PUT /starmap/beacon/decode/{id}`
**Source:** `src/routes/starmap.js:37`

**Purpose:** Decrypt a beacon using its id as the decryption key.

**Request:** Path param `id` (beacon id, doubles as its decryption key).

**Response:** `204` empty on success. `404 NotFound` if no beacon with that id exists. `409 Conflict` if the beacon is already decrypted.

**Database reads:** `[PG] [BOOKSHELF]` `Beacon.where({ id }).fetchWithRelated()` (`src/models/ship.js:80-82`) reads `starmap_beacon` joined to its `grid`.

**Database writes:** `[PG]` `beacon.activate()` (`src/models/ship.js:83-106`) runs, inside one `knex.transaction`: (1) `UPDATE starmap_beacon SET is_active = false WHERE id != <this id>` (all other beacons); (2) `UPDATE starmap_beacon SET is_active = true, is_decrypted = true WHERE id = <this id>`. Both are raw SQL, bypassing Bookshelf hooks.

**Side effects:** `[SIDE-EFFECT]` After the transaction: fires DMX `LoraBeaconSignalDecrypted` (`src/models/ship.js:97`); writes a `ship_log` row through `shipLogger.success(...)`, naming the beacon's grid (`src/models/ship.js:102`). This, through the `LogEntry` model's `created` hook, emits Socket.IO `logEntryAdded` (`src/models/log.js:28-31`). Finally it emits Socket.IO `refreshMap` (`src/models/ship.js:104`).

**Rewrite notes:** `[BUG]` `activate()` builds a promise chain with `.then(...).catch(() => trx.rollback())`. But it also calls `trx.commit()` inside the first `.then()`. This happens before the DMX, log, and socket work runs (`src/models/ship.js:95-105`). The commit happens, then further work runs outside the transaction. If that later work throws, the `.catch` calls `trx.rollback()` on an already-committed transaction. This is a no-op, not a real rollback of the writes. The two `UPDATE` statements are not truly all-or-nothing with the rest of the side effects. The `.catch` also swallows any error from the DMX, log, or socket chain silently. `activate()` has no error path back to `res` beyond what already resolved.

### `PUT /starmap/velian-distress-signal`
**Source:** `src/routes/starmap.js:55`

**Purpose:** Handle a single scripted plot beat: decode the hardcoded `VELIAN` beacon using a player-submitted distress message.

**Request:** Body `{ message: string }`, required. Reads the current "misc/velian" data blob from the in-memory Redux-style store (`src/routes/data.js`) to check a `canSendSignal`/`hasSentSignal` flag pair.

**Response:** `204` empty on success. `400 BadRequest` if the signal was already sent and cannot be resent, or if `message` is missing. `404 NotFound` if the `VELIAN` beacon row does not exist. `409 Conflict` if already decrypted.

**Database reads:** `[PG] [BOOKSHELF]` `Beacon.where({ id: 'VELIAN' }).fetchWithRelated()`.

**Database writes:** `[PG]` Same as `beacon.activate()` above, this time called with the player's message (`src/routes/starmap.js:64`). This routes into `shipLogger.warning` instead of `shipLogger.success` (`src/models/ship.js:98-101`), and writes a `ship_log` row with the player's raw message interpolated into the log text, unescaped.

**Side effects:** `[SIDE-EFFECT]` Same DMX, ship log, and `refreshMap` side effects as beacon decode above, through `activate()`. It also writes `{ hasSentSignal: true }` into the process-local Redux-style store under `misc/velian` through `setData(..., true)` (`src/routes/data.js:17-31`), force-overwriting any version check. `[STORY-DB]`-adjacent. This store (`src/store/store.ts`, not read in full for this document) is a separate system from the relational tables. It is in-memory, and possibly persisted. It is referenced here through `getData`/`setData` (`src/routes/data.js`).

**Rewrite notes:** The player-submitted `message` goes directly into a ship log message string. `src/eventhandler.js` is not involved here. The string is built in `src/models/ship.js:99`: `` `Received a distress signal from area Alpha-5-D2-100: ${velianMessage}` ``. It carries `showPopup: true` metadata. That string is later stored and broadcast verbatim, with no sanitization. `canSendSignal` is read but only used in a negative check (`!velianData.canSendSignal && velianData.hasSentSignal`). If `canSendSignal` was never set (default falsy) and `hasSentSignal` is also falsy, the guard passes, even though `canSendSignal` was never turned on. It is unclear whether `canSendSignal` is meant to gate the *first* call at all. The check only blocks a *second* call combined with the absence of `canSendSignal`. This event's data lives in the generic `/data` blob store (`src/routes/data.js`). That store is out of this document's route scope. But it is a direct dependency of this route.

---

## Person routes (`src/routes/person.js`, mounted at `/person` in `src/index.ts:81`)

### `GET /person`
**Source:** `src/routes/person.js:32`

**Purpose:** List persons, paginated, with optional visibility and field filters.

**Request:** Query params: `page` (default 1), `entries` (page size, default 1000), `show_hidden` (`"true"`/else), `name` (substring, case-insensitive), `dynasty`, `home_planet`, `ship_id`, `status`, `title`, `political_party`, `is_character`. None are validated for type. `page` and `entries` are parsed with `parseInt` and can produce `NaN` if the caller sends garbage; the route does not handle that case.

**Response:** `200` with `{ persons: [...], rowCount, pageCount, page, pageSize }`.

**Database reads:** `[PG] [BOOKSHELF]` `Person.fetchListPage` (`src/models/person.js:150-186`): a filtered, paginated `SELECT` from `person`, with a `LEFT JOIN`-style `withRelated` on `ship` (only `id`, `name` columns). The name filter uses `whereRaw('LOWER(CONCAT(first_name, ' ', last_name)) LIKE ?', ['%name%'])`. The other filters become plain equality `WHERE` clauses through `lodash.forOwn`, over whatever keys survive the `pick`+`snakeCase` mapping in the route (`src/routes/person.js:37-40`). So any of `dynasty, home_planet, ship_id, status, title, is_character, political_party` becomes an exact-match filter. Only a fixed column list is selected: no `full_name` virtual, no medical or military fields.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BOOKSHELF]` Pagination (`fetchPage`) and the `-column` order-by shorthand used elsewhere in this codebase come from a **custom fork of Bookshelf**. This fork is at `package.json:36`: `git+https://github.com/OdysseusLarp/bookshelf.git#c5ab3cb8...`. It is not the published `bookshelf` npm package. A rewrite cannot assume vanilla Bookshelf semantics for `fetchPage`/`orderBy('-x')`. It must read the fork's source to know its exact paging math. That includes the row-count query shape and off-by-one behaviour.

### `GET /person/filters`
**Source:** `src/routes/person.js:61`

**Purpose:** List the distinct values available for each person filter field, for building filter UI.

**Request:** No params.

**Response:** `200` with `{ filters: [{ name, key, items: [{name, value}] }, ...] }` for `title`, `dynasty`, `political_party`, `home_planet`, `ship_id` (joined to ship name), `status`.

**Database reads:** `[PG]` `getFilterableValues` (`src/models/person.js:256-321`) runs six separate `knex('person').distinct(...)` queries in parallel, each filtered to `is_visible = true` and a non-null column check through `whereRaw`. The `ship_id` query also joins `ship` and filters `ship.is_visible = true`.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]`-ish: the `dynasty` distinct query filters `whereRaw('status IS NOT NULL')` instead of `dynasty IS NOT NULL` (`src/models/person.js:261`), apparently copied from the `status` query above it. This can admit rows with a null `dynasty` into the result set. A later client-side filter (`.filter(d => d && d.dynasty)` at `src/models/person.js:282`) masks the visible bug, but the SQL intent is wrong, and the extra rows are wasted work.

### `GET /person/groups`
**Source:** `src/routes/person.js:72`

**Purpose:** List all groups.

**Request:** No params.

**Response:** `200` with a JSON array. See Rewrite notes: this is not full group objects.

**Database reads:** `[PG] [BOOKSHELF]` `Group.forge().fetchAll()` reads all rows of the `group` table.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]` `[BOOKSHELF]` The `Group` model overrides `serialize()` to return just `this.get('id')` (`src/models/person.js:37-39`). Because `res.json()` calls `toJSON()`, which calls `serialize()`, this endpoint returns a plain array of group id strings. For example, it returns `["role:admin", "dynasty:tenacity"]`, not `{id, created_at, updated_at}` objects. This is true even though the `@typedef Group` doc comment implies a richer object. The same override also collapses the `groups` relation whenever it is embedded in a `Person` (`src/models/person.js:147-149`, `withRelated` at line 75). A rewrite must decide whether `/person/groups` should keep returning bare ids or return full rows.

### `GET /person/{id}`
**Source:** `src/routes/person.js:85`

**Purpose:** Get one person with family, medical, and military-adjacent data. This route also doubles as a Social Hub "login" endpoint that can trigger a simulated hacking detection.

**Request:** Path param `id`. Query params `login` (`"true"`/else) and `hacker_id` (a person id). The caller sets both. The route does not check either against a session, so `hacker_id` is whatever the client claims.

**Response:** `200` with the person JSON, or, if `login=true` and `hacker_id` is present and both persons exist, the person JSON plus `{ hacker: { detectionTimeMs, intrusionDetectedMessage } }` (`src/routes/person.js:111`).

**Database reads:** `[PG] [BOOKSHELF]` `Person.fetchWithRelated()` (`src/models/person.js:187-203`) joins four relations. It joins `person_entry` (as `entries`), with each entry's `added_by` person columns limited to `id,first_name,last_name`. It joins `ship` through `belongsTo`. It joins `groups` through `belongsToMany`, via `person_group`, serialized as bare ids per above. It joins `family` through a `belongsToMany` self-join via `person_family`, with columns limited to `id, first_name, last_name, ship_id, status, is_visible, is_character`. On a hacker login, it also fetches the hacker person the same way. It also reads a "detection times" config blob from the in-memory store through `getHackingDetectionTime` (`src/utils/hacking.ts:31-50`). That function is backed by `src/store/store`, a dependency outside this document's scope.

**Database writes:** `[PG] [BOOKSHELF]` On a hacker login: inserts one row into `audit_log` through `AuditLogEntry.forge().save({ person_id, hacker_id, type: 'HACKER_LOGIN' })` (`src/routes/person.js:96-100`), immediately, not deferred to the timer below.

**Side effects:** `[SIDE-EFFECT]` On a hacker login: the `AuditLogEntry` `created` hook emits Socket.IO `auditLogEntryAdded` right away (`src/models/log.js:56-61`). Separately, a `setTimeout` is scheduled for `detectionTimeMs` (from `getHackingDetectionTime`). It later calls `addShipLogEntry('WARNING', <random intrusion message>)`, which writes to `ship_log` and, through its `created` hook, emits `logEntryAdded`, and fires DMX channel `DataHubHackingDetected` (`src/routes/person.js:105-109`). This is a GET-shaped route, semantically a lookup. But it inserts an audit row synchronously. It also schedules a future database write and DMX fire, as side effects of reading a person.

**Rewrite notes:** The timer in `src/routes/person.js:106` is untracked: no id is returned, and there is no way to cancel it. The code comment itself confirms this is known-incomplete (`// TODO: If the hacker logs out, we should be able to match to this timeout, cancel it, and run the function immediately`). A server restart during the detection window silently loses the pending detection, since it lives only in a Node.js timer, not the database. `[GIS]` does not apply to this route. Nothing on this route checks that `hacker_id` refers to a person actually engaged in hacking, versus any arbitrary id the client supplies. "Hacker" attribution is fully client-asserted.

### `GET /person/card/{id}`
**Source:** `src/routes/person.js:125`

**Purpose:** Look up a person by their physical card id. This is the normal, non-hacked, Social Hub login path.

**Request:** Path param `id` (uppercased before lookup, `src/routes/person.js:127`). Query param `login` (`"true"`/else).

**Response:** `200` with the person JSON, or `200` with a `null`-ish body if no person has that card id. Again, there is no 404, because `requireFetch = false`.

**Database reads:** `[PG] [BOOKSHELF]` `Person.forge({ card_id }).fetchWithRelated()`, the same relation set as `GET /person/{id}`.

**Database writes:** `[PG] [BOOKSHELF]` If `login=true` and the person is found: inserts one `audit_log` row `{ person_id, type: 'LOGIN' }` (`src/routes/person.js:130-133`). This insert's promise is not awaited (`AuditLogEntry.forge().save(...)` with no `await`, `src/routes/person.js:130`). The response can be sent before the audit row commits.

**Side effects:** `[SIDE-EFFECT]` The un-awaited insert's `created` hook still eventually emits Socket.IO `auditLogEntryAdded` once it resolves (`src/models/log.js:56-61`), just not necessarily before the HTTP response returns.

**Rewrite notes:** If `login=true` and no person is found, the route only logs a server-side warning (`src/routes/person.js:135`). It still returns `200` with an almost empty body. A failed login attempt is not reported as an error to the caller.

### `GET /person/bio/{id}`
**Source:** `src/routes/person.js:147`

**Purpose:** Look up a person by their "bio id" (a third identifier alongside internal id and card id).

**Request:** Path param `id`, used as-is, with no case normalization, unlike `card_id`.

**Response:** `200` with the person JSON, or an almost empty object if not found.

**Database reads:** `[PG] [BOOKSHELF]` `Person.forge({ bio_id: id }).fetchWithRelated()`.

**Database writes:** None.

**Side effects:** None.

### `GET /person/search/{name}`
**Source:** `src/routes/person.js:158`

**Purpose:** Search persons by a case-insensitive substring of their full name.

**Request:** Path param `name`, lower-cased before use.

**Response:** `200` with a JSON array of matching persons. No relations are included, since this uses `.search()`, not `.fetchWithRelated()`.

**Database reads:** `[PG]` `Person.prototype.search` (`src/models/person.js:204-209`): `WHERE is_visible = true AND LOWER(CONCAT(first_name,' ',last_name)) LIKE '%name%'`. `showHidden` defaults to `false` in the model, but the route never passes it. So hidden persons are always excluded here. This differs from the main list route, which supports `show_hidden`.

**Database writes:** None.

**Side effects:** None.

### `PUT /person/set-visible`
**Source:** `src/routes/person.js:171`

**Purpose:** Mark all persons visible, except a fixed blacklist.

**Request:** No params.

**Response:** `204` empty.

**Database reads:** None.

**Database writes:** `[PG]` Raw `knex('person').where('id', 'not in', blacklistedIds).update({ is_visible: true })` (`src/models/person.js:323-327`). `blacklistedIds` comes from splitting the `PERMANENTLY_HIDDEN_PERSONS` environment variable on commas. If that env var is unset, `blacklistedIds` is `['']`. This edge case still works with `NOT IN ('')`, since no id equals an empty string, but it is worth flagging as implicit behaviour.

**Side effects:** None. Compare `PUT /fleet/set-visible`, which does emit `refreshMap`. Persons have no equivalent broadcast here. The code comment `// TODO: Send ship log message?` at `src/models/person.js:325` confirms this was noticed and left undone.

**Rewrite notes:** This is asymmetric with the fleet equivalent: no socket event, no log entry, despite doing an analogous bulk visibility change.

### `PUT /person/{id}`
**Source:** `src/routes/person.js:185`

**Purpose:** Update arbitrary fields on one person.

**Request:** Path param `id`. Body: any person fields, unvalidated (`// TODO: Validate input`, `src/routes/person.js:187`).

**Response:** `200` with the updated person. This is the same in-memory model instance, mutated by `save()`. It is not a fresh relation-laden refetch. This contrasts with the fleet equivalent, which does refetch with relations. Throws a generic `Error` (500) if not found.

**Database reads:** `[PG] [BOOKSHELF]` Plain fetch by id, no relations.

**Database writes:** `[PG] [BOOKSHELF]` `person.save(req.body, { method: 'update', patch: true })`. This patches whatever keys are sent, including `id`, `status`, `card_id`, and so on.

**Side effects:** None. No lifecycle hooks are registered on the `Person` model beyond relations and virtuals; see `src/models/person.js:128-235`, which has no `initialize()` at all.

**Rewrite notes:** The response shape differs subtly from `PUT /fleet/{id}`, since no relations are included on the response here. A rewrite copying the fleet pattern would change behaviour. There is no allowlist of writable fields, the same concern as the ship equivalent.

### `PUT /person/{id}/family`
**Source:** `src/routes/person.js:204`

**Purpose:** Update the "relation" text on an existing family pivot row between two persons. This route is explicitly documented as work-in-progress.

**Request:** Path param `id` (person1). Body `{ familyMemberId, relation }`. Note: the route actually reads `id` and `relation` from `req.body` (`src/routes/person.js:205`), not the `familyMemberId` name from the doc comment. The variable used for person2 is `id` from `req.body`. This shadows the path param name in the code (`const { id, relation } = req.body;`). Meanwhile, `req.params.id` is used separately for person1. None of this is validated.

**Response:** `200` with person1 refetched with the `family` relation. Throws a generic `Error` if either person is missing.

**Database reads:** `[PG] [BOOKSHELF]` Fetches both persons by id, with no relations. Then, after the update, it refetches person1 with `withRelated: 'family'` (default, unfiltered column set here). This is unlike `fetchWithRelated`'s trimmed columns.

**Database writes:** `[PG] [BOOKSHELF]` `person1.family().updatePivot({ relation }, { query: { where: { person2_id: id } } })` (`src/routes/person.js:210`). This updates the `person_family` pivot table row or rows matching `person1_id = person1.id AND person2_id = id`, setting `relation`. It does **not** insert a new pivot row if none exists. This follows Bookshelf's `updatePivot` semantics, which only affects existing rows. It also does not touch the reverse-direction row (`person1_id = id AND person2_id = person1.id`). So the family relation can become asymmetric.

**Side effects:** None beyond the write.

**Rewrite notes:** The `@route` doc comment says "WIP - Not working properly yet" (`src/routes/person.js:195`). Treat this route as known-broken or incomplete by the original authors, not just by inference. It silently no-ops if no matching pivot row exists yet, with no error. This likely surprises callers expecting "create or update" semantics. That semantics is implied by the PUT verb and the docstring "Update or insert."

### `POST /person/{id}/entry`
**Source:** `src/routes/person.js:223`

**Purpose:** Add a new personal, military, or medical log entry for a person.

**Request:** Path param `id`. Body: any `Entry` fields (`type`, `entry`, `added_by`, ...), unvalidated (`// TODO: Validate input`).

**Response:** `200` with the inserted entry.

**Database reads:** None.

**Database writes:** `[PG] [BOOKSHELF]` `Entry.forge().save({ person_id: id, ...req.body }, { method: 'insert' })`, inserting into `person_entry`. Note: `person_id` is forced from the path param. But every other field comes straight from the body. This includes `id` itself, if the client sends one, spread in after `person_id`. So a client-supplied `person_id` in the body silently overrides the path param's value, because of object spread order (`{ person_id: id, ...req.body }`: if `req.body.person_id` exists, it wins).

**Side effects:** None. There are no lifecycle hooks on `Entry` (`src/models/person.js:16-25`).

**Rewrite notes:** `[BUG]` The spread order means the path-param `id` is not actually enforced as the entry's owner. This happens if the caller includes their own `person_id` in the body. The endpoint's name and shape imply "entry for path person," but the body can redirect it to any person id.

### `PUT /person/{id}/kill`
**Source:** `src/routes/person.js:237`

**Purpose:** Mark a person deceased and record it in their personal entries.

**Request:** Path param `id`. No body used.

**Response:** `204` empty. `404 NotFound` if the person is missing. `400 BadRequest` if already `'Deceased'`.

**Database reads:** `[PG]` Plain fetch by id.

**Database writes:** `[PG]` `person.killPerson()` (`src/models/person.js:222-234`), inside one `knex.transaction`: (1) `UPDATE person SET status = 'Deceased' WHERE id = ?`; (2) `INSERT INTO person_entry (person_id, type='PERSONAL', entry='542 - Deceased', added_by=<FLEET_SECRETARY_ID>)`. Both are raw SQL, bypassing Bookshelf hooks.

**Side effects:** None. No socket emit, no DMX fire, unlike the ship equivalent (`ship.destroyShip()`, which does both). There is no ship log entry either.

**Rewrite notes:** This is asymmetric with `POST /fleet/{id}/destroy`: killing a person produces no visible real-time signal to connected clients at all. Only a later `GET /person/{id}` poll would reveal the status change.

### `PUT /person/{id}/group/{groupId}`
**Source:** `src/routes/person.js:256`

**Purpose:** Add a person to a group.

**Request:** Path params `id`, `groupId`. No body used.

**Response:** `204` empty. `404 NotFound` if either person or group does not exist.

**Database reads:** `[PG]` Fetches person and group by id in parallel, plain fetches, no relations.

**Database writes:** `[PG]` `person.addToGroup(groupId)` (`src/models/person.js:210-215`): raw `INSERT INTO person_group (person_id, group_id) VALUES (?, ?)`. There is no uniqueness check in code; it relies on any database constraint, not confirmed here.

**Side effects:** `[SIDE-EFFECT]` Writes to `person_group`, a side table. The route's own name does not obviously imply this table, beyond the word "group". This is the documented purpose. It is listed here for completeness, not as a surprise.

**Rewrite notes:** There is no handling of the case where the person is already in the group, so a duplicate insert is possible. Behaviour then depends entirely on the `person_group` table's constraints, which are not defined in this file.

### `DELETE /person/{id}/group/{groupId}`
**Source:** `src/routes/person.js:278`

**Purpose:** Remove a person from a group.

**Request:** Path params `id`, `groupId`.

**Response:** `204` empty. `404 NotFound` if either person or group does not exist. Note: the membership itself is not checked, only that both entities exist.

**Database reads:** `[PG]` Same parallel fetch as the add-to-group route.

**Database writes:** `[PG]` `person.deleteFromGroup(groupId)` (`src/models/person.js:216-221`): raw `DELETE FROM person_group WHERE person_id = ? AND group_id = ?`.

**Side effects:** None beyond the write.

---

## Event routes (`src/routes/event.js`, mounted at `/event` in `src/index.ts:82`)

### `GET /event`
**Source:** `src/routes/event.js:14`

**Purpose:** List all currently active events.

**Request:** No params.

**Response:** `200` with a JSON array of events where `is_active = true`.

**Database reads:** `[PG]` `Event.forge().where({ is_active: true }).fetchAll()`.

**Database writes:** None.

**Side effects:** None.

### `GET /event/{id}`
**Source:** `src/routes/event.js:25`

**Purpose:** Get one event by id.

**Request:** Path param `id`.

**Response:** `200` with the event JSON, or an almost empty object if not found.

**Database reads:** `[PG]` Plain fetch by id.

**Database writes:** None.

**Side effects:** None.

### `PUT /event`
**Source:** `src/routes/event.js:37`

**Purpose:** Create a new timed event, or update an existing one. The real behaviour is driven by `src/eventhandler.js`, which schedules an in-process timer to perform the event's effect later.

**Request:** Body: `{ id?, type, status, ship_id?, occurs_at, metadata, is_active? }`, unvalidated (`// TODO: Validate input`). Supported `type` values, per `addEvent` (`src/eventhandler.js:34-47`), are `SCAN_OBJECT` and `SCAN_GRID` only. Any other `type` throws inside the fire-and-forget `addEvent`/`updateEvent` call (see below).

**Response:** `200` with the event. `[BUG]` On the update path, the JSON body returned and the `eventUpdated` socket payload are both the **pre-update** event object, not the saved one. See Database writes below.

**Database reads:** `[PG]` Fetches the event by `id` first, if `id` is present in the body, to decide insert vs. update.

**Database writes:** `[PG]` Inside one `Bookshelf.transaction`: on create, `Event.forge().save(req.body, { method: 'insert', transacting })` (`src/routes/event.js:43-44`); on update, `Event.forge().save(req.body, { method: 'update', transacting, patch: true })` (`src/routes/event.js:47-48`). This saves a **new, separate** `Event.forge()` model instance, not the `event` variable fetched earlier in the function. The result of this save is passed into `.tap(updateEvent)`, but it is never assigned back to the outer `event` variable.

**Side effects:** `[SIDE-EFFECT]` `.tap(addEvent)` / `.tap(updateEvent)` (`src/routes/event.js:44,48`) hand the correctly up-to-date saved model into `src/eventhandler.js`:

- `addEvent`/`updateEvent` dispatch on `event.type` to `addScanObjectEvent` or `addScanGridEvent` (`src/eventhandler.js:34-47`, `61-70`).
- Both schedule a `setTimeout` firing at `occurs_at` (`src/eventhandler.js:99-102`, `150-153`), stored in a module-level `eventTimers` Map keyed by event id. This is in-process state, lost on restart. It is not persisted or resumed, except through `loadEvents` at boot (`src/eventhandler.js:19-27`). That function only re-arms events already `is_active = true` found at startup.
- `addScanObjectEvent` immediately, synchronously, before the timer fires, writes a `ship_log` INFO row naming the target object (`src/eventhandler.js:104-108`), through `addShipLogEntry`, which emits Socket.IO `logEntryAdded`.
- `addScanGridEvent` immediately validates the ship's probe count and jump/scan range, and fires DMX `LoraGridScanInitiated` (`src/eventhandler.js:130`). Asynchronously, not awaited (`.then()` chain at `src/eventhandler.js:135-147`), it decrements the ship's `metadata.probe_count` by 1. It writes a `ship_log` WARNING row if probes are now low or zero. It separately writes a `ship_log` INFO row noting that a probe was sent (`src/eventhandler.js:156-159`).
- When the timer eventually fires, `performObjectScan` sets `starmap_object.is_scanned = true` and writes a `ship_log` SUCCESS row (`src/eventhandler.js:227-236`).
- `performGridScan` inserts a new `grid_action` row (`type: 'SCAN'`), fires DMX `LoraGridScanCompleted`, and writes a `ship_log` SUCCESS row (`src/eventhandler.js:238-247`).
- `finishEvent` (`src/eventhandler.js:77-87`) then calls `event.setActive(false)` and emits Socket.IO `eventFinished` (default namespace, broadcast) with `{ success, event }`.

**Rewrite notes:** `[BUG]` This is the response/emit staleness described above, under Database writes. A rewrite must make sure the outer variable is reassigned to the freshly saved model, before responding or emitting. `[BUG]` `Event.setActive` (`src/models/event.js:20-22`) does not `return` the result of `this.save(...)`. So `await event.setActive(false)` in `finishEvent` (`src/eventhandler.js:84`) does not actually wait for the save to complete, before emitting `eventFinished`. This is a race between the database write and the socket broadcast. `addScanGridEvent`'s probe-count decrement is fire-and-forget relative to the function's own return (`src/eventhandler.js:135-147` has no `await`). So `PUT /event`'s HTTP response can return before the probe count is actually decremented. Timer state (`eventTimers`, `currentEvents`) is process-local. Running more than one backend instance, or restarting mid-event, means events do not reliably fire exactly once. `SCAN_GRID` validation (probe count, jump range) happens only on create, and it is not re-validated at the moment the timer fires, minutes or hours later. A ship that moved out of range, or ran out of probes through another path, still gets its scan performed.

---

## Post routes (`src/routes/post.js`, mounted at `/post` in `src/index.ts:83`)

### `GET /post`
**Source:** `src/routes/post.js:18`

**Purpose:** List Social Hub posts, optionally filtered by status.

**Request:** Query param `status` (for example `PENDING`/`APPROVED`/`REJECTED`), not validated against the actual allowed set.

**Response:** `200` with a JSON array, newest first.

**Database reads:** `[PG] [BOOKSHELF]` `Post.forge().orderBy('-created_at').where(where).fetchAllWithRelated()`. This joins `person` through the `author` relation (`hasOne(Person, 'id', 'person_id')`, `src/models/post.js:42-43`).

**Database writes:** None.

**Side effects:** None.

### `GET /post/{id}`
**Source:** `src/routes/post.js:30`

**Purpose:** Get one post by id, with its author.

**Request:** Path param `id`.

**Response:** `200` with the post JSON, or an almost empty object if missing.

**Database reads:** `[PG] [BOOKSHELF]` `Post.forge({ id }).fetchWithRelated()`.

**Database writes:** None.

**Side effects:** None.

### `PUT /post`
**Source:** `src/routes/post.js:43`

**Purpose:** Create a new post, or update an existing one, for example a moderator approve or reject, optionally notifying the author.

**Request:** Query param `sendMessage` (`"true"`/else). `sendMessage=true` sends a private message to the post's author as "the fleet secretary." The route does not check who the caller is. Body, restricted server-side to an allowlist through `pick`: `title, body, person_id, type, status, is_visible, show_on_infoboard` (`src/routes/post.js:46`). Unlike `PUT /fleet/{id}` and `PUT /person/{id}`, this route does not accept arbitrary fields.

**Response:** `200` with the post: a freshly inserted model on create, the same mutated instance on update, with no relation refetch.

**Database reads:** `[PG] [BOOKSHELF]` Fetches by `id` first, no relations, if `id` is present, to decide insert vs. update.

**Database writes:** `[PG] [BOOKSHELF]` Create: `Post.forge().save(data, { method: 'insert' })`, defaulting `status` to `STATUS_APPROVED` for `type === 'CAPTAINS_LOG'` or `STATUS_PENDING` otherwise, if the caller did not send a status (`src/routes/post.js:53-54`). Update: `post.save(data, { method: 'update', patch: true })`.

**Side effects:** `[SIDE-EFFECT]` **Duplicate socket emission on every write.** The route explicitly emits `req.io.emit('postAdded', post)` on create, and `req.io.emit('postUpdated', post)` on update (`src/routes/post.js:56,60`). The `Post` model's own `created`/`updated` hooks independently emit the exact same event names, through `getSocketIoClient().emit(...)` (`src/models/post.js:33-40`). Every create or update of a post therefore broadcasts `postAdded`/`postUpdated` **twice** to all connected clients. Additionally, when a post transitions to `APPROVED` and `sendMessage=true`: fires DMX `DataHubNewsApproved` (`src/routes/post.js:71`); calls `adminSendMessage(FLEET_SECRETARY_ID, { target: post.person_id, type: 'private', message })` (`src/routes/post.js:73-77`), which inserts a `com_message` row (`src/messaging.ts:74-76,167-205`). This depends on whether the target person has an open Socket.IO connection in the `/messaging` namespace. If connected, it emits `message` privately to that person's socket or sockets, and to the sender's (none, for this admin-mock sender). If the target is **not** connected, it broadcasts the message to the entire `/messaging` namespace instead, through `messaging.emit('message', ...)` (`src/messaging.ts:201-204`). A "private" message can be seen by every connected client, if the recipient happens to be offline at that moment.

**Rewrite notes:** `[BUG]` The double socket emission, route plus model hook, is redundant at best and a source of duplicate UI updates at worst. A rewrite should pick exactly one emission point. `[BUG]` The "private" message fallback broadcast in `messaging.ts` is a pre-existing condition. It is triggered by this route's `sendMessage` feature, not introduced by post.js itself. But it is a real confidentiality issue, reachable from this route. The messaging system in general (`src/messaging.ts`) is out of this document's file scope, but it is a direct, load-bearing dependency of both `post.js` and `vote.js`.

---

## Vote routes (`src/routes/vote.js`, mounted at `/vote` in `src/index.ts:84`)

### `GET /vote`
**Source:** `src/routes/vote.js:93`

**Purpose:** List votes, optionally filtered by status.

**Request:** Query param `status`, unvalidated.

**Response:** `200` with a JSON array, active votes first, then newest first (`orderBy('-is_active').orderBy('-created_at')`, `src/models/vote.js:75`).

**Database reads:** `[PG] [BOOKSHELF]` Joins `person` (`author`), `vote_entry` (`entries`), `vote_option` (`options`): three relations per vote, in one `fetchAll({ withRelated })` call. Bookshelf batches related fetches into one query per relation, not per row.

**Database writes:** None.

**Side effects:** None.

### `GET /vote/{id}`
**Source:** `src/routes/vote.js:105`

**Purpose:** Get one vote with its author, entries, and options.

**Request:** Path param `id`.

**Response:** `200` with the vote JSON, or an almost empty object if missing.

**Database reads:** `[PG] [BOOKSHELF]` `Vote.forge({ id }).fetchWithRelated()`.

**Database writes:** None.

**Side effects:** None.

### `PUT /vote/create`
**Source:** `src/routes/vote.js:117`

**Purpose:** Create a new vote together with its answer options.

**Request:** Body restricted through `pick` to `VOTE_FIELDS` (`title, person_id, description, is_active, is_public, duration_minutes, active_until, allowed_voters, status`), plus a required `options: string[]` array that must be non-empty (`src/routes/vote.js:118-119`, the only validated field).

**Response:** `204` empty. The created vote is not returned to the caller.

**Database reads:** None.

**Database writes:** `[PG]` Inside one `Bookshelf.transaction`, the route does two things. First, it inserts into `vote`, with `is_active` forced to `status === 'APPROVED'`. This ignores any `is_active` value the caller sent (`src/routes/vote.js:125`); it **overwrites** the picked `is_active` field. Second, it inserts one `vote_option` row per string in `options`, all in parallel through `Promise.all` inside the same transaction.

**Side effects:** `[SIDE-EFFECT]` The `Vote` model's `created` hook fires inside the transaction, before commit (see Rewrite notes). It emits Socket.IO `voteAdded` with the new vote model (`src/models/vote.js:56-59`). The route **also** separately emits `req.io.emit('voteCreated', null)` after the transaction resolves (`src/routes/vote.js:134`). This produces two different event names for the same creation: `voteAdded` with data, and `voteCreated` with `null`. These go to different possible listeners.

**Rewrite notes:** `[BUG]`-adjacent race: Bookshelf's `created` event fires synchronously, as part of the `.save()` promise resolving. This happens **inside** the `Bookshelf.transaction` callback. It happens before that callback's returned promise causes the transaction to commit. A socket listener that reacts to `voteAdded` by immediately querying the vote from another connection could read the row before it is committed. `status` defaults to `STATUS_PENDING` if absent (`src/routes/vote.js:122`), but `is_active` is force-derived from `status`, regardless of what the client sent for `is_active`. A client cannot create a vote that is both `status: 'PENDING'` and `is_active: true`, or vice versa. This is enforced, not merely defaulted.

### `PUT /vote/{id}`
**Source:** `src/routes/vote.js:148`

**Purpose:** Update a vote. The primary use is moderation, approve or reject, which can compute an expiry and notify the creator.

**Request:** Path param `id`. Query param `sendMessage`. `sendMessage=true` sends a message to the vote's creator as "the fleet secretary," the same as `PUT /post`. The route does not check who the caller is. Body restricted to `VOTE_FIELDS` through `pick`.

**Response:** `200` with the updated vote, same mutated instance, no relation refetch. `404 NotFound` if the vote does not exist.

**Database reads:** `[PG] [BOOKSHELF]` Plain fetch by id, no relations.

**Database writes:** `[PG] [BOOKSHELF]` If the caller approves (`status: 'APPROVED'`) without sending `active_until`, the route computes it server-side from `duration_minutes` (`moment().add(activeMinutes, 'minutes')`). It sets `active_until` to `null` instead, if `duration_minutes` is not an integer (`src/routes/vote.js:155-161`). Then `vote.save(data, { method: 'update', patch: true })`.

**Side effects:** `[SIDE-EFFECT]` The `Vote` model's `updated` hook emits Socket.IO `voteUpdated` (`src/models/vote.js:60-63`). Unlike `post.js`, this route does **not** additionally emit its own duplicate event; only the model hook fires. If newly approved (`wasChangedToApproved`) and `sendMessage`, three things happen. First, it fires DMX `DataHubVoteApproved` (`src/routes/vote.js:173`). Second, it inserts an `infoboard_entry` row through `createVoteCreatedInfoboardEntry` (`src/routes/vote.js:67-84`, `src/models/infoentry.js:18-21`). That entry's body string comes from a hardcoded `voteFilterToTextMap` lookup describing who may vote (`src/routes/vote.js:27-63`). It falls back to the raw `allowed_voters` string if not found in the map. Third, whether approved or rejected, it calls `adminSendMessage(FLEET_SECRETARY_ID, ...)`, with the same `com_message` insert and possible namespace-wide broadcast behaviour described under `PUT /post`.

**Rewrite notes:** Notice the asymmetry with `post.js`: posts double-emit `postUpdated`, votes do not double-emit `voteUpdated`. The two nearly-identical moderation flows, post and vote approve/reject, are implemented inconsistently. `createVoteCreatedInfoboardEntry` clamps the infoboard entry's `active_until` to at most one hour from now, even if the vote itself runs longer (`src/routes/vote.js:70-72`). This is a deliberate but non-obvious business rule.

### `PUT /vote/{id}/cast`
**Source:** `src/routes/vote.js:194`

**Purpose:** Record a person's vote choice.

**Request:** Path param `id` (vote id). Body: whatever fields the caller sends, inserted directly. The caller sets `person_id` in the body. The route does not check it against the caller's identity. So a client can cast a vote as any person. A `// TODO: Validate input` comment explicitly calls out that `vote_option_id` membership and one-vote-per-person are not checked (`src/routes/vote.js:195`).

**Response:** `200` with the inserted vote entry. Throws a generic `Error` (500, not 400) if the vote is not active. **Unclear and bug-prone:** if `id` does not match any vote, `Vote.forge({id}).fetch()` resolves to `null` (no `requireFetch`). The next line then calls `.get('is_active')` on `null`. This throws a `TypeError`, not a clean `NotFound` (`src/routes/vote.js:196-197`).

**Database reads:** `[PG]` Plain fetch of the vote by id.

**Database writes:** `[PG] [BOOKSHELF]` `VoteEntry.forge().save(req.body, { method: 'insert' })` inserts into `vote_entry`.

**Side effects:** None beyond the write. There are no lifecycle hooks on `VoteEntry` (`src/models/vote.js:29-33`).

**Rewrite notes:** `[BUG]` The `vote_entry` table's actual primary key is the composite `(person_id, vote_id)` (`db/migrations/20181207151445_social-initial.js:75-82`), but the Bookshelf model declares `idAttribute: 'person_id'` only (`src/models/vote.js:31`). Bookshelf has no native concept of a composite id here. This particular route only inserts, with an explicit `method: 'insert'`, so the mismatch does not misfire in this call. But it means something important for future code. Any future code that calls `.fetch()`/`.destroy()`/`.save()` without an explicit `method`, on a `VoteEntry` model keyed only by `person_id`, is affected. It will silently operate on, or collide with, the wrong row. This happens whenever the same person has cast entries in more than one vote. `vote_option_id` membership is never checked against the vote's actual `vote_option` rows. Because of this, a client can insert an entry pointing at an option that belongs to a different vote entirely.

---

## Log routes (`src/routes/log.js`, mounted at `/log` in `src/index.ts:85`)

### `GET /log`
**Source:** `src/routes/log.js:20`

**Purpose:** List ship log entries, most recent first, paginated.

**Request:** Query params `page` (default 1), `entries` (page size, default 150), parsed with `parseInt`, unvalidated.

**Response:** `200` with a paginated collection (`{ models: [...], pagination: {...} }` shape from the custom Bookshelf fork's `fetchPage`, serialized as-is by `res.json`).

**Database reads:** `[PG]` `LogEntry.forge().orderBy('-created_at').fetchPage({ page, pageSize })` on `ship_log`.

**Database writes:** None.

**Side effects:** None.

### `PUT /log`
**Source:** `src/routes/log.js:34`

**Purpose:** Insert a new ship log entry, or update an existing one if an `id` is supplied and found.

**Request:** Body: any `LogEntry` fields (`ship_id, message, metadata, type, id?`), unvalidated.

**Response:** `200` with the entry, inserted or updated.

**Database reads:** `[PG] [BOOKSHELF]` If `id` is present, fetches the entry first, to decide insert vs. update.

**Database writes:** `[PG] [BOOKSHELF]` Insert: `LogEntry.forge().save(req.body, { method: 'insert' })`. Update: `logEntry.save(req.body, { method: 'update', patch: true })`.

**Side effects:** `[SIDE-EFFECT]` `[BOOKSHELF]` The `LogEntry` model's hooks fire regardless of which path the route took: `created` emits Socket.IO `logEntryAdded` (`src/models/log.js:28-31`); `updated` emits `logEntryUpdated` (`src/models/log.js:32-35`). Additionally, only on the **insert** path, the route itself checks the new message text, case-insensitively, for the substring `"incoming jump into current sector"`. If found, it fires DMX channel `IncomingJumpWarning` (`src/routes/log.js:43-46`). This is a plain-text string match against arbitrary, unvalidated caller-supplied content, not a structured flag.

**Rewrite notes:** The DMX trigger is purely a substring match on free text. Any client sending a message containing that phrase fires the physical lighting cue. This applies to any log type, from any code path that calls `PUT /log` directly, not just internal game logic. This is a fragile, content-based side effect, rather than an explicit `type`/`metadata` flag.

### `GET /log/audit`
**Source:** `src/routes/log.js:61`

**Purpose:** List audit log entries (logins, hacker logins), paginated.

**Request:** Query params `page`, `entries`, same defaults as `GET /log`.

**Response:** `200` with a paginated collection.

**Database reads:** `[PG] [BOOKSHELF]` `AuditLogEntry.forge().orderBy('-created_at').fetchPageWithRelated({ page, pageSize })`. Joins `person` (as `person`) and `person` again (as `hacker`), each limited to `id, first_name, last_name, is_character` (`src/models/log.js:39-40,69-78`).

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** `[BUG]` The route passes `{ page, pageSize }` to `fetchPageWithRelated`. But the model method's actual signature only reads a `page` argument. It hardcodes `pageSize: 50` internally (`src/models/log.js:72-78`: `fetchPageWithRelated: function (page) { return this.orderBy('created_at').fetchPage({ pageSize: 50, page, withRelated }); }`). The caller's `entries` query param is silently ignored for this endpoint, unlike `GET /log`, which does honour it. Also note the model hardcodes ascending `orderBy('created_at')` here (`src/models/log.js:73`). The route's own `.orderBy('-created_at')` call on the forged model (`src/routes/log.js:64`) is overridden or duplicated. This happens through the model method's own internal `.orderBy('created_at')`. Unclear which one wins, without checking the Bookshelf fork's query-builder chaining semantics for repeated `orderBy` calls. At minimum, the two calls disagree on direction, descending versus ascending. So the actual sort order for this endpoint could not be confirmed from reading the code alone.

### `POST /log/audit`
**Source:** `src/routes/log.js:75`

**Purpose:** Insert an audit log entry directly.

**Request:** Body: any `AuditLogEntry` fields (`person_id, hacker_id?, type, metadata?`), unvalidated.

**Response:** `200` with the inserted entry.

**Database reads:** None.

**Database writes:** `[PG] [BOOKSHELF]` `AuditLogEntry.forge().save(req.body)`. Note: there is no explicit `method: 'insert'` here, unlike every other create call in these seven files. Bookshelf infers insert versus update from whether the model already has an id set. Since `req.body` typically has no `id`, this resolves to an insert in practice. But it is the one create call in this document that relies on Bookshelf's inference, rather than stating its intent.

**Side effects:** `[SIDE-EFFECT]` `created` hook emits Socket.IO `auditLogEntryAdded` (`src/models/log.js:56-61`).

**Rewrite notes:** If a caller supplies an `id` in the body that matches an existing row, this call could silently become an update. It would not be an insert. This happens because `method` is not pinned. This has not been observed to be exploited elsewhere in these files, but it is worth calling out, since every sibling route pins `method` explicitly.

### `DELETE /log/{id}`
**Source:** `src/routes/log.js:86`

**Purpose:** Delete a ship log entry.

**Request:** Path param `id`, parsed with `parseInt`.

**Response:** `204` empty. `404 NotFound` if the entry does not exist.

**Database reads:** `[PG]` Plain fetch by id.

**Database writes:** `[PG]` `logEntry.destroy()`: `DELETE FROM ship_log WHERE id = ?`.

**Side effects:** `[SIDE-EFFECT]` `[BOOKSHELF]` The model's `destroying` hook is deliberately used instead of `destroyed`, per the code comment. This is because `destroyed` no longer has the id available in this Bookshelf fork or version. The hook emits Socket.IO `logEntryDeleted` with `{ id }` (`src/models/log.js:23-27`).

**Rewrite notes:** None beyond the general pattern already covered above.

---

## Open questions

- `src/routes/data.js` (`getData`/`setData`, backing the in-memory Redux-style store) and `src/store/store.ts` are direct runtime dependencies of `starmap.js` (`velian-distress-signal`) and `person.js` (`getHackingDetectionTime`). They are out of this document's assigned scope. This document does not trace their persistence guarantees in depth. Is this store durable across restarts? When and how is it flushed to `Store` in `src/models/store.js`?
- `src/messaging.ts` (`adminSendMessage`, `onSendMessage`, the `/messaging` Socket.IO namespace) is a direct dependency of the `post.js` and `vote.js` moderation flows. This document reads it far enough to cover the `com_message` write. It also covers the "broadcast to whole namespace if target offline" behaviour. But its full connection-lifecycle behaviour is out of scope here.
- `GET /starmap/grid` and `GET /starmap/grid/:id` are not wrapped in `handleAsyncErrors`. It is not clear from the code whether this is intentional or an oversight. Every other route in the same file uses the wrapper, which is why this is flagged as notable, not assumed harmless.
- `GET /log/audit`'s effective sort order (`src/routes/log.js:64` versus `src/models/log.js:73`) could not be confirmed by reading the code alone. Confirming it would require running the code. It would also require reading the custom Bookshelf fork's query-builder source. That would show how repeated `.orderBy()` calls on the same query combine or override each other.
- The custom Bookshelf fork (`git+https://github.com/OdysseusLarp/bookshelf.git#c5ab3cb8...`, `package.json:36`) provides the `fetchPage`/`fetchPageWithRelated`/`orderBy('-column')` shorthand used throughout these routes and models. This pass did not verify its exact pagination result shape, the row-count query, or off-by-one behaviour at page boundaries, against its source. It is only inferred from call sites.
- `starmap_grid_info` (a PostgreSQL view named in the task's guidance) does not appear anywhere in `src/routes/fleet.js`, `src/routes/starmap.js`, or their imported models (`src/models/ship.js`, `src/models/map-object.js`). No route in this document's scope uses it. Checked with `grep -rn "starmap_grid_info" src/`, with no matches.
- `PERMANENTLY_HIDDEN_PERSONS` and `FLEET_SECRETARY_ID` are read from `process.env`, with no check that they are set or that they reference real rows. Behaviour when unset was reasoned about from the code, but not executed.

## Cross-cutting observations

- **Destructive and moderation-grade routes have full blast radius from any client.** `PUT /post`, `PUT /vote/{id}`, `PUT /vote/{id}/cast`, `PUT /person/{id}/kill`, and `POST /fleet/{id}/destroy` perform destructive or moderation-grade actions. Any client that can reach the HTTP server can call them. A defect in any one client can do the same damage as an intended call. So can a wrong id, a bad build, or a test tool pointed at the live server.
- **`requireFetch` is disabled globally** (`db/index.ts:11`), so a Bookshelf `.fetch()` for a non-existent row resolves to `null` or an empty model, instead of rejecting. Most single-resource GET routes in this document therefore return `200` with an almost empty body for unknown ids, rather than `404`. Routes that do return `404` (for example `POST /fleet/{id}/destroy`, `PUT /person/{id}/group/{groupId}`, `DELETE /log/{id}`) do so for a different reason. The route code explicitly checks for a falsy fetch result. It then throws `NotFound` itself. This is not a framework-level behaviour. This is inconsistent across routes. Some routes throw a generic `Error` instead of `NotFound`, for the same "not found" situation. A generic `Error` becomes a 500. Examples are `PUT /fleet/{id}:75`, `PUT /person/{id}:189`, and `PUT /person/{id}/family:209`.
- **Raw `knex`/`knex.raw` writes bypass all Bookshelf model lifecycle hooks.** Every "hidden" socket emission in this document comes from a Bookshelf model's `initialize()` hook. `Ship`, `LogEntry`, `Post`, `Vote`, and `AuditLogEntry` all register `on('created'|'updated'|'destroying', ...)`. Some writes use raw SQL instead: ship or person visibility toggles, `destroyShip`, `killPerson`, beacon `activate`, and group membership. Raw SQL writes produce **no** socket emission, even when they change the same kind of data a Bookshelf-mediated save would. A rewrite must treat "which write path was used" as part of the intentional behaviour. It is not an implementation detail. It changes what real-time signal clients receive.
- **Inconsistent double-emission pattern between near-identical moderation flows.** `post.js`'s `PUT /post` explicitly emits `postAdded`/`postUpdated` in the route. The `Post` model's own hooks also emit the same events, so this is a real duplicate. `vote.js`'s `PUT /vote/{id}` relies on the model hook alone for `voteUpdated`, with no route-level duplicate. But `PUT /vote/create` *also* emits a second, differently-shaped event (`voteCreated`, payload `null`) alongside the model's `voteAdded`. `event.js`'s `PUT /event` relies entirely on `req.io.emit` in the route (`eventAdded`/`eventUpdated`), since the `Event` model has no lifecycle hooks at all. This is three different conventions for "notify clients of a moderated resource change," inside one small set of files.
- **The "approve and message the author" pattern is duplicated near-verbatim** between `post.js` (`PUT /post`) and `vote.js` (`PUT /vote/{id}`). Both routes pick a `sendMessage` query flag. Both check `wasChangedTo(Approved|Rejected)`. Both guard against the fleet secretary messaging themself. Both conditionally fire a DMX channel and call `adminSendMessage`. A rewrite could extract this into one shared moderation-notification helper.
- **`FLEET_SECRETARY_ID` is a load-bearing, unvalidated environment variable.** It is used as a literal foreign-key value in raw-SQL inserts. This happens in four different inserts, across files in and out of this document's scope. Examples are `person_entry.added_by` in both `ship.js:destroyShip` and `person.js:killPerson`, and the messaging "sender" identity for post and vote notifications. If it is unset, these inserts do not fail loudly; they store `NULL` or `undefined` silently.
- **Several "read" or "validate" routes have write or side-effect behaviour.** `POST /fleet/{id}/jump/validate` can write to `ship_log` when `should_add_log_entries` is set. `GET /person/{id}` can insert an `audit_log` row, when used as a hacker login. It can also schedule a future DMX fire and `ship_log` write. A route named "get" or "validate" in this codebase cannot be assumed side-effect-free, without reading its full call chain.
- **Un-awaited or improperly-awaited async writes recur as a pattern**, not a one-off. `GET /person/card/{id}`'s audit insert is missing `await` (`src/routes/person.js:130`). `Event.setActive` is missing `return` (`src/models/event.js:20-22`). `POST /fleet/move` double-wraps `Promise.all([array])` (`src/models/ship.js:288`). `addScanGridEvent`'s probe-count decrement has no `await` on the `.then()` chain (`src/eventhandler.js:135-147`). In each case, the HTTP response, or a dependent step, can resolve before the write it depends on has actually committed.
- **Field allowlisting is inconsistent.** `post.js` and `vote.js` (for `/create` and `/:id`) use `lodash.pick` against an explicit field list, before saving. `fleet.js` (`PUT /fleet/{id}`), `person.js` (`PUT /person/{id}`, `PUT /person/{id}/family`, `POST /person/{id}/entry`), `event.js` (`PUT /event`), and `log.js` (`PUT /log`) all pass `req.body` straight into `save()`. Each one has either a `// TODO: Validate input` comment or no comment at all. This means a client can set any column that exists on the underlying table, including ones like `id`, timestamps, or `status`.
- **This project depends on a custom fork of Bookshelf.js**, not the published package (`package.json:36`). `fetchPage`, `fetchPageWithRelated`, and the `orderBy('-column')` descending shorthand used throughout these route files and their models come from that fork. A rewrite that assumes vanilla Bookshelf or Knex semantics for these calls should read the fork's source first, rather than the public Bookshelf documentation.
