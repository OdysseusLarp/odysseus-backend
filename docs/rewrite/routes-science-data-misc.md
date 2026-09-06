# Science, Data, and Miscellaneous Routes

This document covers the science artifact routes and the generic key-value data store. It also covers the infoboard, DMX hardware control, tags, and HANSCA operation results. It also covers SIP, the EmptyEpsilon integration, and the EOS Datahub messaging system. It also covers the small set of routes defined directly in `src/index.ts`. No route in this document checks a credential. This is a design decision. See the trust model in `00-overview.md` section 2. The route entries below do not repeat it. The `/data` store is the center of the system. It is a Redux store held in server memory. It mirrors every change to Socket.IO clients. It flushes to a single Postgres row every 5 seconds. Several routes read or write this store as a side effect. The route path alone does not show this. The DMX routes fire physical lighting and sound cues in the LARP venue. The EmptyEpsilon routes talk to an external spaceship simulator over HTTP. A built-in mock server (an emulator) runs when no real server is configured. The messaging system implements private and channel chat for players. It uses a dedicated Socket.IO namespace, backed by a `com_message` table. It does not talk to any external "EOS Datahub" service. That name refers to the in-game player-facing web client, not a separate backend system.

## Route table

| Method | Path | Purpose | Tags |
|---|---|---|---|
| GET | `/science/artifact` | List all science artifacts, optionally filtered by visibility | `[BOOKSHELF]` |
| GET | `/science/artifact/catalog/:id` | Get one artifact by catalog ID | `[BOOKSHELF]` |
| GET | `/science/artifact/:id` | Get one artifact by numeric ID | `[BOOKSHELF]` |
| PUT | `/science/artifact` | Insert or update an artifact | `[BOOKSHELF]` |
| PUT | `/science/artifact/entry` | Insert or update an artifact entry | `[BOOKSHELF]`, `[BUG]` |
| PUT | `/science/artifact/use/:code` | Trigger a hard-coded artifact effect by secret code | `[SIDE-EFFECT]` |
| GET | `/data` | List all data blobs of all types | none |
| GET | `/data/:type` | List all data blobs of one type | none |
| GET | `/data/:type/:id` | Get one data blob | none |
| POST | `/data/:type/:id` | Overwrite one data blob | `[SIDE-EFFECT]` |
| PATCH | `/data/:type/:id` | Merge fields into one data blob | `[SIDE-EFFECT]` |
| DELETE | `/data/:type/:id` | Delete one data blob | `[SIDE-EFFECT]` |
| PUT | `/infoboard/priority` | Set the currently active infoboard priority | `[PG]` |
| GET | `/infoboard/display` | Get one infoboard/news/log entry to show now (rotates by clock) | `[BOOKSHELF]` |
| GET | `/infoboard/enabled` | List all enabled infoboard entries | `[BOOKSHELF]` |
| GET | `/infoboard/` | List all infoboard entries and the current priority | `[BOOKSHELF]` |
| PUT | `/infoboard/` | Create a new infoboard entry | `[BOOKSHELF]` |
| PUT | `/infoboard/:id` | Update an infoboard entry | `[BOOKSHELF]` |
| DELETE | `/infoboard/:id` | Delete an infoboard entry | `[BOOKSHELF]`, `[SIDE-EFFECT]` |
| GET | `/dmx/channels` | List all known DMX channel names and numbers | none |
| POST | `/dmx/event/:channel` | Fire a one-second DMX event on a channel | `[SIDE-EFFECT]` |
| GET | `/tag` | List all tags | `[BOOKSHELF]` |
| GET | `/tag/:id` | Get one tag | `[BOOKSHELF]` |
| PUT | `/tag` | Insert or update a tag | `[BOOKSHELF]` |
| DELETE | `/tag/:id` | Delete a tag | `[BOOKSHELF]` |
| GET | `/operation` | List operation results (default: incomplete only) | `[BOOKSHELF]` |
| GET | `/operation/:id` | Get one operation result | `[BOOKSHELF]` |
| POST | `/operation` | Create an operation result, triggers automatic medical/science processing | `[SIDE-EFFECT]`, `[BOOKSHELF]` |
| PUT | `/operation/:id` | Update an operation result, re-runs automatic processing | `[SIDE-EFFECT]`, `[BOOKSHELF]` |
| GET | `/sip/config` | Get SIP server URL/realm from environment | none |
| GET | `/sip/contact` | List all SIP contacts | `[BOOKSHELF]` |
| GET | `/sip/contact/:id` | Get SIP contacts (bug: ignores :id) | `[BOOKSHELF]`, `[BUG]` |
| PUT | `/sip/contact` | Insert or update a SIP contact | `[BOOKSHELF]` |
| PUT | `/state` | Send one command to EmptyEpsilon | `[SIDE-EFFECT]` |
| GET | `/emptyepsilon/damage-dmx` | Get whether EE's own damage DMX is enabled | none |
| POST | `/emptyepsilon/damage-dmx` | Enable/disable EE's own damage DMX | `[SIDE-EFFECT]` |
| GET | `/messaging/unread` | List all unread private/channel messages | `[BOOKSHELF]` |
| POST | `/messaging/send` | Admin: send a private message as any user | `[SIDE-EFFECT]`, `[BOOKSHELF]` |
| (socket) `/messaging` namespace | Real-time chat: connect, message, messagesSeen, fetchHistory, fetchUnseenMessages, searchUsers, getUserList | `[SIDE-EFFECT]`, `[BOOKSHELF]` |
| GET | `/` | Redirect to `/api-docs` | none |
| GET | `/ping` | Health check, returns "pong" | none |
| GET | `/metrics` | Prometheus metrics for HTTP and Socket.IO | none |
| PUT | `/state` | (listed above, mounted at root) | |
| POST | `/state/full-push` | Push full ship/EE data blob to EmptyEpsilon, overwriting its state | `[SIDE-EFFECT]` |
| POST | `/state/break-task` | Break a task and reduce the matching EmptyEpsilon system health | `[SIDE-EFFECT]` |
| POST | `/emit/:eventName` | Emit an arbitrary Socket.IO event to all clients | `[SIDE-EFFECT]` |

---

## Science routes (`/science`, mounted at `src/index.ts:86`)

### `GET /science/artifact`
**Source:** `src/routes/science.js:19`

**Purpose:** List all science artifacts, with their entries.

**Request:** Query param `is_visible` (string `"true"`/`"false"`). Any other value counts as undefined and applies no filter. The route does not validate this with a schema.

**Response:** `200` with a JSON array of Artifact models. Each includes an `entries` relation, and each entry includes `person` limited to `id, first_name, last_name`.

**Database reads:** `artifact` `[BOOKSHELF]`, `artifact_entry` `[BOOKSHELF]`, `person` (via entry.person relation, columns limited) `[BOOKSHELF]`.

**Redux store reads:** None.

**Database writes:** None.

**Redux store writes:** None.

**Side effects:** None.

**Rewrite notes:** `Artifact.fetchAllWithRelated` (`src/models/artifact.js:58`) orders by `-created_at` when no filter is given. It does not order the results when a filter is given. This ordering is inconsistent. A rewrite should preserve it or fix it. There is no pagination (`TODO` at `src/routes/science.js:20`).

### `GET /science/artifact/catalog/:id`
**Source:** `src/routes/science.js:34`

**Purpose:** Get a single artifact by its human-assigned catalog ID (e.g. printed on a physical prop), with entries.

**Request:** Path param `id` (string), used as `catalog_id`. Not validated.

**Response:** `200` with the Artifact model as JSON. If there is no match, `200` with a `null` body. This happens because Bookshelf's `fetch` with `requireFetch = false` (set at `db/index.ts:12`) returns `null` instead of throwing a 404.

**Database reads:** `artifact`, `artifact_entry`, `person` (via relation) `[BOOKSHELF]`.

**Database writes:** None. **Redux store:** not touched.

**Side effects:** None.

**Rewrite notes:** No 404 is returned when the artifact does not exist — the caller must handle `null`. `[BUG]` inconsistent with `/tag/:id` and `/operation/:id`, which do throw 404.

### `GET /science/artifact/:id`
**Source:** `src/routes/science.js:45`

**Purpose:** Get a single artifact by its numeric database ID, with entries.

**Request:** Path param `id` (numeric string, coerced by Bookshelf/Knex). Not validated.

**Response:** `200` with Artifact JSON, or `200` with `null` if not found (same `requireFetch = false` behavior).

**Database reads:** `artifact`, `artifact_entry`, `person` `[BOOKSHELF]`.

**Database writes:** None.

**Side effects:** None.

**Rewrite notes:** Same missing-404 behavior as above. `[BUG]`

### `PUT /science/artifact`
**Source:** `src/routes/science.js:57`

**Purpose:** Insert a new artifact, or update an existing one if `id` is given.

**Request:** JSON body is the full Artifact shape (`src/models/artifact.js:32`): `id`, `catalog_id`, `name`, `discovered_by`, `discovered_at`, `discovered_from`, `type`, `text`, `gm_notes`, `is_visible`, `test_material`, `test_microscope`, `test_age`, `test_history`, `test_xrf`. Comment at `src/routes/science.js:59` says "TODO: Validate input". The route validates nothing. Any field is passed straight to Bookshelf `save`.

**Response:** `200` with the resulting Artifact model. On insert with a duplicate `catalog_id`, it responds `409 CONFLICT` with `{ message: 'Catalog ID must be unique' }`. It detects this by matching the Postgres constraint error text `artifact_catalog_id_unique`, defined in `db/migrations/20190611170541_tags-and-operations.js:2-4`.

**Database reads:** `artifact` (to check `id` exists) `[BOOKSHELF]`.

**Database writes:** `artifact` insert or update (patch) `[BOOKSHELF]`.

**Redux store:** not touched.

**Side effects:** None.

**Rewrite notes:** `[BUG]` `Artifact.forge().save(...)` can throw an error that does not match the duplicate-catalog-id message. In that case, the `catch` block at `src/routes/science.js:65-69` swallows the error silently. `artifact` stays `undefined`. `res.json(artifact)` at line 74 then returns `200` with an empty body. The caller never sees the real error. `[PG]` The constraint-name match (`artifact_catalog_id_unique`) is Postgres-specific error text. A different database engine uses a different message.

### `PUT /science/artifact/entry`
**Source:** `src/routes/science.js:85`

**Purpose:** Insert a new artifact entry (a text log item attached to an artifact), or update an existing one.

**Request:** JSON body: `id`, `artifact_id`, `person_id`, `entry`. Not validated ("TODO: Validate input" at line 87).

**Response:** `200` with the ArtifactEntry. `[BUG]` The insert branch (`src/routes/science.js:91`) calls `ArtifactEntry.forge().save(...)` without `await`. The returned value is a Promise, not the saved model. `res.json(artifactEntry)` at line 95 then serializes an unresolved Promise, which produces `{}` in JSON. The update branch (line 93) does correctly `await`.

**Database reads:** `artifact_entry` (to check `id` exists) `[BOOKSHELF]`.

**Database writes:** `artifact_entry` insert or update (patch) `[BOOKSHELF]`. Because of the missing `await`, the insert is fired but the route responds before it necessarily completes.

**Side effects:** None.

**Rewrite notes:** `[BUG]` The missing `await` on insert (`src/routes/science.js:91`) is a genuine defect. The response body on insert is wrong. The request may complete before the database write does.

### `PUT /science/artifact/use/:code`
**Source:** `src/routes/science.js:106`

**Purpose:** A hard-coded "cheat code" endpoint. It is used by two specific narrative artifacts: `CRYSTAL_GENERATOR` (stop consuming jump crystals) and `HEALTH_BOOST` (heal the ship to 100%). Any other code is a no-op.

**Request:** Path param `code` (string, one of `CRYSTAL_GENERATOR`, `HEALTH_BOOST`, or anything else). No body used. The code string is the only gate. A client that knows the code triggers the effect.

**Response:** `200` always, with `{ message: string }` describing what happened: already used, not usable, success, EE not connected, or EE error. `HEALTH_BOOST`'s success message is sent only after the async EmptyEpsilon call resolves (`src/routes/science.js:144-155`). The surrounding `switch` branch has no `return` after the async `.then()`, only a `break`. The response is sent later, from inside the `.then`/`.catch` callback.

**Database reads:** None directly. Reads the `misc/artifact_actions` and `ship/metadata` Redux data blobs (`src/routes/science.js:107,138`) via `getData` `[SIDE-EFFECT: reads store]`.

**Database writes:** None directly.

**Redux store writes:** `misc/artifact_actions` is overwritten via `setData('misc', 'artifact_actions', data)` (`src/routes/science.js:123,151`). This marks the used action `is_usable: false, is_used: true, used_at: <timestamp>`. This uses `getData`/`setData` without `force`, so a concurrent version mismatch throws `409`.

**Side effects:** `[SIDE-EFFECT]`

- `CRYSTAL_GENERATOR`: on first successful use, calls `shipLogger.success(log_message, { showPopup: true })` (`src/routes/science.js:124`). This inserts a row into `ship_log` (see `src/models/log.js:87-95`). That model's `created` lifecycle hook then emits Socket.IO event `logEntryAdded` globally (`src/models/log.js:28-31`).
- `HEALTH_BOOST`: calls `getEmptyEpsilonClient().setHullHealthPercent(1)` (`src/routes/science.js:144`). This is an external HTTP call to the EmptyEpsilon `set.lua` endpoint (see the EmptyEpsilon section below). It then writes the "used" state and logs success the same way as `CRYSTAL_GENERATOR`.
- Both paths write to the Redux `misc/artifact_actions` blob. That blob is broadcast to all `/data` Socket.IO subscribers within 100ms (see the Data routes section). It is also persisted to Postgres within 5 seconds.

**Rewrite notes:** Business logic is hard-coded per artifact code string. A general "artifact effect" system does not exist. `HEALTH_BOOST` depends on EmptyEpsilon's `previousState` being populated (see `EmptyEpsilonClient.setHullHealthPercent`, `src/integrations/emptyepsilon/client.ts:171-176`). If EE has never successfully returned game state, this throws "No hull max health available". The `catch` at `src/routes/science.js:154-155` swallows that error and reports a generic error message to the client.

---

## Data routes (`/data`, mounted at `src/index.ts:87`, router `src/routes/data.js`)

This is the whole system's generic Redux key/value store, addressed by `(type, id)`. Most game systems use it as their backbone. This includes ship state, boxes, tasks, artifacts, and tplink. They use it to store live, frequently-changing state. This differs from the relatively static Postgres-backed models, such as Person, Artifact, and Tag.

**Data model:** Every blob has:

- `type` (string) — a namespace/category, e.g. `misc`, `ship`, `box`, `task`, `tplink`.
- `id` (string) — the blob's key within its type.
- `version` (integer, auto-managed) — starts at 1 on first write, incremented by 1 on every subsequent `SET_DATA` (`src/store/reducers/dataReducer.ts:17-21`). Used for optimistic locking.
- `updated_at` (number, auto-managed) — `Date.now()` epoch millis set on every write (`src/store/reducers/dataReducer.ts:16`), NOT an ISO string like the Postgres model timestamps.
- Any other arbitrary JSON fields the caller sends.

The Redux store (`src/store/store.ts`) lives entirely in server memory (`configureStore` from `redux-starter-kit`). It is seeded once at boot from a single row in the `store` Postgres table (`id = 'data'`, see `src/index.ts:165-169` and `src/models/store.js`). It is written back periodically (see Persistence below). There is no per-write durability. A crash between two 5-second saves loses those writes.

**`SET_DATA` versioning behavior** (`src/routes/data.js:17-31`, reducer at `src/store/reducers/dataReducer.ts:5-24`):

- `setData(type, id, data, force=false)` first fetches the current blob, unless `force` is set. It compares `oldData.version` to `data.version`. If they differ and `oldData.version` is set, it throws `http-errors` `409 Conflict`. The error message names the expected and provided versions (`src/routes/data.js:20-22`). A client must read-modify-write with the version it last saw, or pass `?force=true` to skip the check.
- The reducer, not the version check, always recomputes `version`. The new value is `oldData.version + 1`, or `1` if unset. It also stamps `updated_at`. This happens regardless of what the caller sent in those two fields. A caller-supplied `version`/`updated_at` in the body is only used for the optimistic-lock comparison. It is never actually stored.
- `force=true` (any truthy query string, e.g. `?force=true`, `?force=1`) skips the version check entirely and always writes.

### `GET /data`
**Source:** `src/routes/data.js:54`

**Purpose:** Return every data blob of every type as one flat array.

**Request:** No params.

**Response:** `200` with a flat JSON array of all blobs (all types, all ids).

**Database reads:** None (reads only the in-memory Redux store).

**Redux store reads:** entire `state.data` tree.

**Database writes / Redux writes:** None.

**Side effects:** None.

**Rewrite notes:** There is no pagination. On a large deployment, this returns the entire live game state in one response.

### `GET /data/:type`
**Source:** `src/routes/data.js:69`

**Purpose:** Return every data blob of one type.

**Request:** Path param `type` (string). The route does not validate it and has no enum check. Any string is accepted. An unknown type returns `[]`.

**Response:** `200` with a JSON array of blobs of that type.

**Redux store reads:** `state.data[type]`.

**Side effects:** None.

### `GET /data/:type/:id`
**Source:** `src/routes/data.js:85`

**Purpose:** Return one data blob.

**Request:** Path params `type`, `id`.

**Response:** `200` with the blob JSON. If not found, `200` with `{}` (`getData`, `src/routes/data.js:8-15`, returns `{}` rather than a 404 when missing).

**Redux store reads:** `state.data[type][id]`.

**Side effects:** None.

**Rewrite notes:** This is a design choice, next to a `[BUG]`. Missing data looks the same as an existing empty-object blob. This endpoint never returns a 404.

### `POST /data/:type/:id`
**Source:** `src/routes/data.js:105`

**Purpose:** Fully overwrite one data blob.

**Request:** Path params `type`, `id`. Query param `force` (any truthy string skips the version check). Body: an arbitrary JSON object, whatever the caller wants stored. This layer validates it with no schema. Individual consumers may separately validate with zod, e.g. `ScienceAnalysisTimes` in `src/store/types.ts`. The route itself does not.

**Response:** `200` with the resulting stored blob (re-read after write). `409 Conflict` (via `errorHandlingMiddleware`, `src/routes/helpers.ts:13-25`) if `version` mismatches and `force` not set.

**Database reads:** None directly (Redux only).

**Redux store reads:** current blob (for the version check).

**Database writes:** None directly — see Persistence below for the deferred write to the `store` table.

**Redux store writes:** `SET_DATA` action dispatched (`src/routes/data.js:25-30`), replacing `state.data[type][id]` entirely and bumping `version`/`updated_at`.

**Side effects:** `[SIDE-EFFECT]`

- The Redux store subscription in `src/store/storeSocket.ts:34-53` fires on every dispatch. It is throttled to at most once per 100ms, via lodash `throttle`, trailing-edge only (`src/store/storeSocket.ts:32`). It diffs the whole `data` tree against the previous snapshot. For every changed `(type,id)`, it emits Socket.IO event `dataUpdate` with args `(type, id, blob)` on the `/data` namespace. It sends this to three rooms: `/data/{type}/{id}`, `/data/{type}`, and `/data` (`src/store/storeSocket.ts:13-15`). Deletions emit `dataDelete` the same way, through the same shared machinery. This does not apply to POST.
- The Redux store subscription in `src/store/storePersistance.ts:19-28` also fires on every dispatch. It is throttled to once per `SAVE_STATE_FREQUENCY_MS`, default 5000ms, trailing-edge only. It writes the **entire** `data` tree as one JSON blob to Postgres table `store`, row `id='data'` (`src/store/storePersistance.ts:6-10`). `[PG]` This uses a JSON column but no Postgres-specific features. It would work on any database with a JSON or text column.
- Both subscribers are throttled independently, so a burst of writes is coalesced. Clients see the *latest* value via Socket.IO within about 100ms. The on-disk copy may lag up to 5 seconds behind. A server crash in that window loses the write permanently. There is no WAL or journal for this data.

**Rewrite notes:** The entire "whole store as one JSON blob, saved on a timer" persistence model is hard to port as-is to a differently-structured backend. A rewrite should decide, per type, whether each blob deserves its own table or row with real transactional writes. Clients use the three-room broadcast pattern (`/data/{type}/{id}`, `/data/{type}`, `/data`) to subscribe at different granularities. A rewrite must keep this pattern for compatibility, unless it also rewrites every client.

### `PATCH /data/:type/:id`
**Source:** `src/routes/data.js:128`

**Purpose:** Merge fields into an existing blob (shallow merge), keeping fields not present in the request body.

**Request:** Path params `type`, `id`. Query param `force`. Body: partial JSON object.

**Response:** `200` with the merged blob, or `409` on version mismatch.

**Database reads:** none directly.

**Redux store reads:** current blob (`getData(type,id)`), merged as `{ ...current, version: undefined, ...body }` (`src/routes/data.js:131`). This explicitly resets `version` to `undefined` before applying the body. It then applies the caller's `version`, if any, for the optimistic-lock check inside `setData`. The final stored `version` is still always recomputed by the reducer.

**Redux store writes:** same `SET_DATA` mechanism as POST.

**Side effects:** `[SIDE-EFFECT]` Identical fan-out to POST: Socket.IO `dataUpdate` broadcast on `/data` namespace, and 5-second-throttled full-store persistence to the `store` Postgres table.

**Rewrite notes:** Same as POST.

### `DELETE /data/:type/:id`
**Source:** `src/routes/data.js:146`

**Purpose:** Delete one data blob.

**Request:** Path params `type`, `id`.

**Response:** `200` with `{}` always (no distinction between "deleted" and "did not exist").

**Redux store writes:** `DELETE_DATA` action (`src/routes/data.js:33-39`) removes `state.data[type][id]` if present. The reducer (`src/store/reducers/dataReducer.ts:25-32`) no-ops silently if the type does not exist.

**Side effects:** `[SIDE-EFFECT]` Same Socket.IO fan-out mechanism as POST/PATCH. It emits `dataDelete` with args `(type, id)` to the same three rooms. It uses the same 5-second-throttled persistence to `store`.

**Rewrite notes:** Same persistence caveats as POST.

---

## Infoboard routes (`/infoboard`, mounted at `src/index.ts:88`)

The infoboard is a rotating public display: think in-universe news ticker. It is driven by a "priority" value, a set of enabled entries, and approved news posts.

### `PUT /infoboard/priority`
**Source:** `src/routes/infoboard.js:20`

**Purpose:** Change the currently active infoboard priority level for all entries with `priority > 0`.

**Request:** Body `{ priority: number }`. The route does not validate this. It has no type check and no range check. Any JSON value is passed to Knex `.update()`.

**Response:** `200` empty body (`res.sendStatus(200)`).

**Database reads:** none.

**Database writes:** `infoboard_priority` — raw Knex update, `UPDATE infoboard_priority SET priority = ? WHERE priority > 0` (`src/routes/infoboard.js:21`) `[PG]` plain SQL, portable.

**Side effects:** None (no socket emit here, unlike `/infoboard/:id` delete).

**Rewrite notes:** This is close to a `[BUG]`. It updates all rows where `priority > 0` to the same new value, instead of targeting one row by id. It collapses every `priority > 0` row to the same priority. The table appears to hold a single active-priority row. See the `InfoPriority` model (`src/models/infoentry.js:29-32`), which calls `.fetch()` with no `where`, implying a singleton table. This behavior is presumably intentional. It is worth confirming against the actual row count in `infoboard_priority`.

### `GET /infoboard/display`
**Source:** `src/routes/infoboard.js:31`

**Purpose:** Compute and return the single item to show right now. This can be an infoboard entry, a news post, or a recent ship log popup. It rotates automatically based on wall-clock time.

**Request:** No params.

**Response:** `200` with one of three shapes: a `LogEntry`, an `InfoEntry`, or a `Post`. The `LogEntry` case applies if a ship log entry was created in the last minute with `metadata.showPopup: true`. The shape differs by branch. Callers must handle a polymorphic response. The response can be `null` or an error if `count` is 0 (see Rewrite notes).

**Database reads:**

- `infoboard_priority` (current priority, `InfoPriority.forge().fetch()`) `[BOOKSHELF]`
- `infoboard_entry` where `priority = <current priority>` and `enabled = true` (`src/routes/infoboard.js:37`) `[BOOKSHELF]`
- `post` where `type = 'NEWS'` and `status = 'APPROVED'`, ordered by `created_at DESC`, first page of 5 (`src/routes/infoboard.js:38-41`) `[BOOKSHELF]`
- `ship_log`, most recent row by `id DESC` (`src/routes/infoboard.js:49`) `[BOOKSHELF]`

**Database writes:** None.

**Redux store:** not touched.

**Side effects:** None (read-only; the log entry is only read, not modified).

**Rewrite notes:**

- Selection algorithm: `selector = floor(minutes*6 + seconds/10)`. This is a value from 0 to 359. It cycles every hour and changes every 10 seconds (`src/routes/infoboard.js:35`). `count = entries.length + (priority < 5 ? news.length : 0)`. News is excluded once priority reaches 5 (`src/routes/infoboard.js:50`). `realSelector = selector % count`. `count` can be 0: with no enabled entries and no news, or with priority 5 or higher and no entries. In that case, `realSelector` is `NaN` or a divide-by-zero. The subsequent indexing (`entries.models[realSelector]` or `news[realSelector - entries.length]`) returns `undefined`. The route then responds `200` with an empty body. `[BUG]` There is no explicit handling of the zero-content case.
- News posts are also filtered in JS for `show_on_infoboard !== false` (`src/routes/infoboard.js:44-47`). This filter runs after the database has already limited the result to 5 rows. If all 5 most recent approved news posts have `show_on_infoboard: false`, older eligible posts are never seen. `[BUG]` This is a pagination and filtering order issue.
- Ship-log popups only work for entries created in the trailing 60 seconds. A client polling less often than once a minute can miss a popup. A client polling more than once in that window shows the same popup repeatedly.

### `GET /infoboard/enabled`
**Source:** `src/routes/infoboard.js:73`

**Purpose:** List all enabled infoboard entries (regardless of current priority).

**Response:** `200` array of InfoEntry.

**Database reads:** `infoboard_entry` where `enabled = true` `[BOOKSHELF]`.

**Rewrite notes:** `Unclear:` the call is `InfoEntry.forge({ enabled: true }).fetchAll()`. This sets `enabled: true` as the model's attributes, then calls `fetchAll()` without an explicit `.where()`. Bookshelf's `fetchAll` does use the model's set attributes as a `WHERE` filter. So this behaves the same as `.where({enabled:true}).fetchAll()`. The style is inconsistent with the rest of the file, which uses explicit `.where()`.

### `GET /infoboard/`
**Source:** `src/routes/infoboard.js:83`

**Purpose:** List every infoboard entry (all priorities, enabled or not) plus the current priority value.

**Response:** `200` `{ priority: InfoPriority, infoboards: InfoEntry[] }`.

**Database reads:** `infoboard_priority`, `infoboard_entry` (all rows) `[BOOKSHELF]`.

### `PUT /infoboard/`
**Source:** `src/routes/infoboard.js:96`

**Purpose:** Create a new infoboard entry.

**Request:** Body is the full InfoEntry shape: `priority`, `enabled`, `title`, `body`, `type`, `meta`, `active_until`. There is no validation. A "TODO: Validate input" comment appears on the id-based update route, but not here. This route has none at all.

**Response:** `200` with the created InfoEntry.

**Database writes:** `infoboard_entry` insert `[BOOKSHELF]`.

**Side effects:** None.

### `PUT /infoboard/:id`
**Source:** `src/routes/infoboard.js:110`

**Purpose:** Update an existing infoboard entry.

**Request:** Path param `id`. Body: partial InfoEntry fields (patch).

**Response:** `200` with updated InfoEntry, or `404` (`http-errors` `NotFound`) if `id` does not exist.

**Database reads:** `infoboard_entry` by id `[BOOKSHELF]`.

**Database writes:** `infoboard_entry` update (patch) `[BOOKSHELF]`.

**Side effects:** None.

### `DELETE /infoboard/:id`
**Source:** `src/routes/infoboard.js:126`

**Purpose:** Delete an infoboard entry.

**Request:** Path param `id` (parsed with `parseInt`).

**Response:** `404` if not found; `204` on success.

**Database reads:** `infoboard_entry` by id `[BOOKSHELF]`.

**Database writes:** `infoboard_entry` delete `[BOOKSHELF]`.

**Side effects:** `[SIDE-EFFECT]` Emits Socket.IO event `infoEntryDeleted` with `{ id }` to all connected clients (default namespace, no room), via `req.io.emit(...)` (`src/routes/infoboard.js:131`). This is the global Socket.IO server attached to every request by middleware in `src/index.ts:72-75`. It is not the `/data` namespace used by the generic store.

---

## DMX routes (`/dmx`, mounted at `src/index.ts:89`)

DMX is a lighting and show-control protocol. It triggers physical effects in the LARP venue: lights, screens via captain display signals, and ambience audio cues. It also triggers TP-Link smart plugs, indirectly.

### `GET /dmx/channels`
**Source:** `src/routes/dmx.js:14`

**Purpose:** Return the full map of channel name -> channel number, for admin UI display.

**Response:** `200` with the `CHANNELS` object (`src/dmx.ts:12-177`).

**Database reads/writes:** None.

**Side effects:** None.

### `POST /dmx/event/:channel`
**Source:** `src/routes/dmx.js:28`

**Purpose:** Fire a DMX "event": set a channel to a value, then reset it to 0 after one second. Any known channel can be fired. This can start real physical effects, such as breach klaxons or a jump sequence. There is no confirmation step.

**Request:** Path param `channel`: either the channel's **name** (looked up in `CHANNELS`) or its **numeric string** value. Query param `value` (optional, integer 1-255, default 255 if omitted entirely — see below). Validation returns `400 Bad Request` (`http-errors`) if the channel resolves to nothing, is not finite, or is out of `[0, DMX_MAX_CHANNEL=511]`. It also returns `400` if `value` is provided but is not finite, or is out of `(0, DMX_MAX_VALUE=255]`.

**Response:** `200` with `{}` on success.

**Database reads/writes:** None.

**Redux store:** not touched.

**Side effects:** `[SIDE-EFFECT]`

- Calls `fireEvent(channelInt, value)` (`src/dmx.ts:211-233`), which:
  1. Re-validates channel and value ranges, as defense in depth. It logs and aborts silently if invalid; it does not throw. The route itself already validated, so this check should not trigger from the route. `fireEvent` is also called from many other places in the codebase, not in scope here.
  2. Calls `dmx.update(UNIVERSE_NAME='backend', { [channel]: value })`. If `process.env.DMX_DRIVER` is set, this targets a real DMX USB or serial device, using the `dmx` npm package (`src/dmx.ts:188-191`). If no driver is configured, it targets a mock that only logs (`src/dmx.ts:192-198`).
  3. Schedules a `setTimeout` 1000ms later (`EVENT_DURATION`, `src/dmx.ts:7`) that resets that channel back to 0. This timer is **not tracked or cancellable**, and is **not persisted**. A server restart within that window loses the reset. This can leave physical hardware stuck "on". This is a robustness gap, close to a `[BUG]`, not a functional bug in normal operation.
  4. Calls `processDmxSignal(channelName)` (`src/tplink/tplink-control.ts:39-68`). This is not awaited; it is "fire and forget" (comment at `src/dmx.ts:231`). It looks up the channel's name in the `tplink/dmxconfig` Redux data blob's `signals` array (`src/tplink/tplink-control.ts:46`). For every matching signal, it schedules an async TP-Link smart-plug HTTP command, via a bare `setTimeout` with no delay argument, so on the next tick. That command (`device.setPowerState(...)`, via the `tplink-smarthome-api` package) turns the physical plug at the configured IP address on or off. Errors here are only logged. They never reach the caller of `/dmx/event/:channel`.
- Full list of channel names and numbers is in `src/dmx.ts:12-177`, grouped roughly as:
  - general ambience, breach, gas-leak, and radiation events (150-172, 290-291)
  - captain display and scanners (160-164)
  - jump drive state machine signals (100-117)
  - fuse box broken/fixed per room (120-129)
  - system health-status quads (normal/damaged/critical/disabled plus an analog value) per ship system: front/rear shield, impulse, missile system, reactor, maneuver, beam weapons, hull, and life support (life support has no "disabled" state); general status (200-249)
  - drifting-value in/out-of-range (145-146)
  - airlock lock/pressurize events for the main airlock and hangar bay (190-199, 289)
  - ship notification LoRa/data-hub/black-hole events (250-260)
  - alien artifact activation signals (302-307)
  - task break/fix signals (320-321)
  - manually-triggered narrative events (330-338): anomaly jump, deep-space signal, Solaris 7 transmission, ending music, thermic fusion regulator announcement, Starcaller launch/EMP, anthem, and EVA message to scientists

**Rewrite notes:** The DMX channel map is a flat, hand-maintained numeric registry (`src/dmx.ts:12-177`). It has "divider" pseudo-entries, such as `__JUMP_DRIVE_SIGNALS__: 0`, used only as section headers in code. These dividers collide with channel 0 conceptually. A reverse lookup or migration must exclude them. See `findChannelName` (`src/dmx.ts:201-209`). If channel 0 were ever fired, it would match the first key with value 0 it finds. That key is one of these dividers. This is a `[BUG]` risk. It is unreachable via the route, though, because channel 0 fails the route's own `!channelInt` truthiness check at `src/routes/dmx.js:36`, since 0 is falsy. The TP-Link fan-out coupling, from DMX channel name to smart plug, is entirely runtime-configured via the `tplink/dmxconfig` data blob, not in code. A rewrite must preserve that data-driven mapping, or migrate the config.

---

## Tag routes (`/tag`, mounted at `src/index.ts:91`)

Tags represent physical RFID/NFC tags used to identify people, samples, or artifacts at HANSCA operation stations.

### `GET /tag`
**Source:** `src/routes/tag.js:16`

**Request:** Query param `operations` (`"true"` to include related OperationResults).

**Response:** `200` array of Tag, with `operations` relation if requested.

**Database reads:** `tag`, and `operation_result` if `operations=true` `[BOOKSHELF]`.

**Side effects:** None.

### `GET /tag/:id`
**Source:** `src/routes/tag.js:30`

**Response:** `200` Tag JSON; `404` (`NotFound`) if missing. Query param `operations` as above.

**Database reads:** `tag`, `operation_result` (if requested) `[BOOKSHELF]`.

### `PUT /tag`
**Source:** `src/routes/tag.js:45`

**Purpose:** Insert or update a tag.

**Request:** Body: `id`, `type`, `description`, `metadata`. No validation.

**Response:** `200` with the Tag. `[BUG]` On the insert branch (`src/routes/tag.js:50-51`), the transaction result is assigned to `tag` and awaited correctly. On the update branch (`src/routes/tag.js:53-54`), the transaction result is awaited but not assigned to `tag`. So on update, `res.json(tag)` at line 56 serializes the stale `tag` object fetched before the update: the record fetched at line 48, before `.save()` ran. In Bookshelf, `.save()` mutates the same model's attributes in place. So `tag` could still reflect updated values, if it were the same JS object reference being saved inside the transaction. `Unclear:` whether `Tag.forge().save(...)` inside the transaction operates on the same in-memory model instance as the outer `tag` variable, or a new one. As written, `Tag.forge()` creates a new, empty model; it does not call `tag.save(...)`. So it is a new model instance. The outer `tag` variable is not updated by the transaction. The response returns pre-update data on the update path. This is a real bug: `src/routes/tag.js:53-54` calls `Tag.forge().save(...)` instead of `tag.save(...)`.

**Database writes:** `tag` insert or update, wrapped in a Knex transaction (`Bookshelf.transaction`) `[BOOKSHELF]`.

**Side effects:** None.

### `DELETE /tag/:id`
**Source:** `src/routes/tag.js:66`

**Response:** `404` if missing; `204` on success.

**Database reads/writes:** `tag` fetch + delete `[BOOKSHELF]`.

**Side effects:** None.

---

## Operation routes (`/operation`, mounted at `src/index.ts:92`, "HANSCA Operation")

Operation results represent the outcome of an in-game action performed at a HANSCA terminal. Examples: taking a blood sample, doing an X-ray, or analyzing an artifact sample. Creating or updating one can automatically post results into a person's medical file or an artifact's research log. For science samples, it also schedules a delayed reveal.

### `GET /operation`
**Source:** `src/routes/operation.ts:131`

**Request:** Query params: `relations` (`"true"` to include `author`, `tag`, `person`, `artifact` relations); `include_complete` (`"true"` to include already-complete results). By default, these are excluded via `where({ is_complete: false })`.

**Response:** `200` array of OperationResult.

**Database reads:** `operation_result`, plus `person` (x2 relations: `author`, `person` via `bio_id`), `tag`, `artifact` (via `catalog_id`) if `relations=true` `[BOOKSHELF]`.

**Side effects:** None.

### `GET /operation/:id`
**Source:** `src/routes/operation.ts:150`

**Response:** `200` OperationResult; `404` if missing.

**Database reads:** same relations as above, single row, if `relations=true` `[BOOKSHELF]`.

### `POST /operation`
**Source:** `src/routes/operation.ts:170`

**Purpose:** Record a new operation result. Depending on `type`/`additional_type`, this automatically does one of three things. It pushes results into the subject's medical file. It schedules a delayed artifact-analysis reveal. Or, for medical X-rays, it attaches a scan image and marks the operation complete.

**Request:** Body is the OperationResult shape (`bio_id`, `catalog_id`, `tag_id`, `author_id`, `description`, `sample_id`, `type`, `additional_type`, `metadata`). The route does not validate this by schema. It unconditionally forces `is_analysed: true` on every new operation result, regardless of what the client sent (`src/routes/operation.ts:177`). The comment there reads: "All operations are now analysed by default and results get posted automatically".

**Response:** `200` with the created OperationResult. Its state may have been further changed by the automatic processing described below, before the response is sent, since all of that processing is awaited.

**Database reads:** `person` (for medical/xray processing), `artifact` (for science processing) `[BOOKSHELF]`.

**Database writes:**

1. `operation_result` insert (`src/routes/operation.ts:174-180`).
2. If `type === 'MEDIC'`: possibly `person_entry` insert (medical file entry) and `operation_result` update, via `addOperationResultToMedicalEntry` (see below).
3. If `type === 'SCIENCE'`: possibly a deferred write to the `misc/science_analysis_in_progress` Redux blob (see below). There is no direct table write at POST time for science. The artifact entry itself is written later, by a timer.
4. Always: possible `person_entry` insert plus `operation_result` update, via `processXrayOperation`. This is X-ray-specific, regardless of the top-level `type`. Internally it is gated by `additional_type === 'XRAY_SCAN'` and `type === 'MEDIC'`.

**Redux store reads/writes:** see `scheduleAddOperationResultToArtifactEntry` below.

**Side effects:** `[SIDE-EFFECT]`

- **Medical/blood or gene sample** (`addOperationResultToMedicalEntry`, `src/routes/operation.ts:58-82`): this runs if `additional_type === 'BLOOD_SAMPLE'`, `is_analysed` is true, and `is_complete` is false. It fetches the `person` by `bio_id`. It builds blood test result text via `getBloodTestResultText` (`src/utils/medical-test-results.ts:65-101`, reading a `person_blood_test_result` row, see below). It inserts a `person_entry` row of `type: 'MEDICAL'`, authored by the hard-coded `EVA_ID = '20263'` (a narrative NPC "EVA" AI persona). It then marks the operation `is_complete: true`. The same happens for `additional_type === 'GENE_SAMPLE'`, using `getGeneSampleResultText`. That function does not query the database. It deterministically derives a PDF filename from a SHA-1 hash of the person's ID (`src/utils/medical-test-results.ts:5-9`), and returns an HTML link to that static file path. The PDF itself must already exist on whatever serves `/gene-samples/*.pdf`; that is not part of this backend's routes.
  - Reads `person_blood_test_result` `[BOOKSHELF]`, via `new BloodTestResult().where({ person_id }).fetch()` (`src/routes/operation.ts:23`). If no row exists, it uses the fallback text `'Blood could not be analysed'` (`src/routes/operation.ts:24`), rather than erroring.
- **Science sample scheduling** (`scheduleAddOperationResultToArtifactEntry`, `src/routes/operation.ts:84-121`): skipped entirely if `additional_type === 'OTHER_SAMPLE'` (`src/routes/operation.ts:89-92`). Otherwise:
  1. Fetches the `author` Person with relations, needed for `groups`, to compute skill level (`src/routes/operation.ts:86`).
  2. Computes `analysisTime = getScienceAnalysisTime(author)` (`src/utils/science.ts:78-104`). This looks up the author's highest skill group (`skill:novice`/`skill:master`/`skill:expert`, `src/utils/groups.ts`). It reads the `misc/science_analysis_times` Redux blob and validates it with a zod schema (`ScienceAnalysisTimes`, `src/store/types.ts:22-32`). On schema failure, it logs an error and defaults to 20 minutes. It adds a `batteryless_operation_penalty` from the same blob, unless the "big battery" prop is currently connected and charged at the `SCIENCE` location. That check (`isBatteryConnectedAndCharged`, `src/utils/bigbattery-helpers.ts:34-44`) reads the `box/bigbattery` Redux blob; it is a physical prop state check.
  3. Computes `analysisCompletesAt = Date.now() + analysisTime`.
  4. Reads the current `misc/science_analysis_in_progress` Redux blob (`getPath`, `src/routes/operation.ts:100`). If that blob is missing or falsy, it logs a warning. It then calls `addOperationResultsToArtifactEntry` (the actual reveal function, see the analysis section below) immediately and synchronously, skipping the delay entirely (`src/routes/operation.ts:101-105`). This is inconsistent with the normal delayed path.
  5. Otherwise, it appends a new record `{ artifact_catalog_id, author_name, completes_at, operation_additional_type, operation_result_id, started_at }` to that blob's `analysis_in_progress` array. It calls `saveBlob(...)` (`src/rules/helpers.js:8-17`), which defers a `SET_DATA` dispatch to `process.nextTick`. This writes to the Redux store asynchronously, on the same `misc/science_analysis_in_progress` blob, without reading it fresh at write time. This risks a lost update if two operations are scheduled in the same tick. The `nextTick` deferral reduces this window but does not close it.
  6. **No timer is started here.** The actual timer is a global polling interval, defined in `src/rules/science/analysis.js` (see the "Science artifact analysis flow" section below). It is independent of this HTTP request. It runs continuously as part of app startup (`loadRules()`, `src/index.ts:173`), checking this same blob every 5 seconds.
- **X-ray processing** (`processXrayOperation`, `src/routes/operation.ts:28-56`): this runs if `additional_type === 'XRAY_SCAN'`, `type === 'MEDIC'`, and `is_complete` is false. It fetches the `person` by `bio_id`. It chooses an image file, normally `skeleton.gif`. Hard-coded overrides swap in `brainscan.gif` for person id `20110`, if the `misc/medical` Redux blob's `show_20110_tumor` flag is truthy. They swap in `kontaminaatio.gif` for person id `20070`, if `show_20070_alien` is truthy (`src/routes/operation.ts:38-44`). It inserts a `person_entry` of `type: 'MEDICAL'`, with a Markdown image embed pointing at `/images/<file>.gif`. That is a static path, not served by any route in scope here. The entry is authored by `EVA_ID`. It then marks the operation `is_complete: true, is_analysed: true`.

**Rewrite notes:** This route conflates three unrelated automatic pipelines: medical result posting, science analysis scheduling, and X-ray image attachment. All three sit behind one generic `type`/`additional_type` dispatch, with hard-coded string constants and one hard-coded author ID (`EVA_ID`). The science pipeline's fallback-to-immediate-processing branch (step 4 above) is an inconsistency worth flagging to product owners before porting. Is instant reveal-on-missing-blob the intended behavior, or a defensive hack that happens to work?

### `PUT /operation/:id`
**Source:** `src/routes/operation.ts:208`

**Purpose:** Update an operation result, for example when a GM completes manual review. This re-runs the medical and X-ray automatic processing. It does not re-run the science scheduling; that only runs on POST.

**Request:** Path param `id`. Body: partial OperationResult fields (patch).

**Response:** `200` with the updated OperationResult; `404` if missing.

**Database reads:** `operation_result` by id; then same reads as `addOperationResultToMedicalEntry`/`processXrayOperation` if applicable.

**Database writes:** `operation_result` update (patch). Then possibly a `person_entry` insert plus a second `operation_result` update, from the medical/xray helpers. This is the same as POST, minus the science scheduling path.

**Side effects:** `[SIDE-EFFECT]` Same medical-entry and X-ray-image side effects as `POST /operation`, described above. Science (`type === 'SCIENCE'`) results are never rescheduled from this route. Scheduling only happens from POST.

**Rewrite notes:** If a GM edits an operation result of `type: 'SCIENCE'` after creation, no new analysis is scheduled. The original POST-time scheduling stands. Editing `additional_type` after the fact does not retroactively trigger scheduling either.

---

## Science artifact analysis flow (cross-cutting)

This spans `src/routes/operation.ts` (scheduling, described above) and `src/rules/science/analysis.js` (the timer/poller) plus `src/utils/science.ts` (the actual reveal logic).

- **Where the timer lives:** `src/rules/science/analysis.js:40` calls `interval(processInProgressAnalysis, POLL_FREQUENCY=5000)` at module load time. This happens as soon as `src/rules/rules.js` imports this file. That import runs via `loadRules()` at `src/index.ts:173`, itself called only after the Redux store has been seeded from Postgres (`src/index.ts:164-174`). `interval` (`src/rules/helpers.js:26-34`) is a thin wrapper over `setInterval`. It catches and logs exceptions, so one failure does not kill the timer.
- **What happens on restart:** `misc/science_analysis_in_progress` is a normal Redux data blob. It is persisted to the `store` table like any other blob. This is subject to the same up-to-5-second lag and at-most-every-5-second throttled save described in the Data routes section. It is reloaded into Redux at boot (`src/index.ts:165-169`), before `loadRules()` starts the poller. So analyses in progress at last-save time survive a restart. They resume being polled once the poller starts. Any analysis whose `completes_at` has already passed while the server was down completes immediately, on the first poll tick after restart. Analyses scheduled but not yet flushed to Postgres in the final under-5-seconds before an unclean shutdown or crash are lost. The operation result then stays `is_analysed: true, is_complete: false` forever, with no in-progress record, unless someone notices and re-triggers it manually.
- **Poll logic** (`src/rules/science/analysis.js:9-38`): every 5 seconds, it reads `misc/science_analysis_in_progress`. It splits `analysis_in_progress` into `completedOperations` (`completes_at <= now`) and `remainingOperations`. If nothing is complete, it does nothing, not even a blob rewrite. For each completed entry, it re-fetches the `operation_result` row fresh by id (`src/rules/science/analysis.js:26`), not from the blob's cached data, and calls `addOperationResultsToArtifactEntry` (`src/utils/science.ts:25-76`). If the operation result row can no longer be found, it logs an error and skips the entry. The entry is still removed from the in-progress list regardless; see the next point. Finally, it always calls `saveBlob`, replacing the blob to contain only `remainingOperations` (`src/rules/science/analysis.js:34-37`). This happens even for entries that failed to resolve. A bad or missing `operation_result_id` silently disappears from the queue without ever producing a result.
- **The actual reveal** (`addOperationResultsToArtifactEntry`, `src/utils/science.ts:25-76`): it looks up the artifact by `catalog_id`. If not found, it silently returns with no log. It chooses which of the artifact's pre-written canned test-result fields to reveal, based on `additional_type`: `test_material`, `test_microscope`, `test_age`, `test_xrf` for `XRF_SCAN`, or `test_history`. `OTHER_SAMPLE` is skipped entirely; this should be unreachable here, since `OTHER_SAMPLE` is also filtered out at scheduling time. It builds a formatted entry string, prefixed with the literal `542`, an in-universe marker also seen in medical results. It always inserts an `artifact_entry` row authored by the hard-coded `EVA_ID`, even when the artifact has no canned result for that test type. It then falls back to "No significant findings were discovered." It marks the source `operation_result` row `is_complete: true`.

**Database writes (this flow, end to end):** `artifact_entry` insert, `operation_result` update `[BOOKSHELF]`.

**Redux store writes:** `misc/science_analysis_in_progress` overwritten every 5-second tick that has at least one completion.

**Side effects:** `[SIDE-EFFECT]` No Socket.IO emit is made directly by this flow. Clients discover the new `artifact_entry` only by re-fetching `/science/artifact*`. There is no push notification for "your sample analysis completed."

---

## SIP routes (`/sip`, mounted at `src/index.ts:93`)

SIP (Session Initiation Protocol) contacts back an in-fiction "video call" feature between rooms/characters.

### `GET /sip/config`
**Source:** `src/routes/sip.js:20`

**Purpose:** Expose SIP server connection details from environment variables so clients can configure their SIP softphone.

**Response:** `200` `{ url: string|null, realm: string|null }` from `process.env.SIP_URL`/`process.env.SIP_REALM`.

**Database/Redux:** None.

**Side effects:** None.

### `GET /sip/contact`
**Source:** `src/routes/sip.js:33`

**Response:** `200` array of SipContact.

**Database reads:** `sip_contact` `[BOOKSHELF]`.

### `GET /sip/contact/:id`
**Source:** `src/routes/sip.js:44`

**Purpose:** Intended to get a single SIP contact by ID.

**Response:** `200` with... all contacts. `[BUG]` The handler calls `SipContact.forge({ id: req.params.id }).fetchAll()` (`src/routes/sip.js:45`). `fetchAll()` ignores the model's set attributes. This usage is inconsistent with `/infoboard/enabled`'s use of the same pattern. `fetchAll()` returns a Collection, which is always truthy, even when empty. So the `if (!sipContact) throw ...` check at `src/routes/sip.js:46` can never fire. The response always returns all SIP contacts, or an empty array. It never returns a 404, and never filters to the requested `id`. The error message also incorrectly says `'Tag not found'`, copy-pasted from `tag.js`, instead of a SIP-contact-specific message.

**Database reads:** `sip_contact` (all rows) `[BOOKSHELF]`.

**Rewrite notes:** `[BUG]` This route does not do what its path implies. A correct implementation would use `.fetch()` (singular) with a `where`, as `GET /tag/:id` does.

### `PUT /sip/contact`
**Source:** `src/routes/sip.js:58`

**Purpose:** Insert or update a SIP contact.

**Request:** Body: `id`, `name`, `type`, `video_allowed`, `is_visible`. Not validated.

**Response:** `200` with the SipContact. The same potential stale-reference issue as `PUT /tag` exists here too. The update branch (`src/routes/sip.js:66-67`) calls `SipContact.forge().save(...)` inside the transaction. That is a new model instance, not `sipContact.save(...)`. So, as with tags, `[BUG]` the returned `sipContact` object on the update path may not reflect the just-written values. This depends on Bookshelf's exact object-identity semantics (see the note under `PUT /tag`).

**Database writes:** `sip_contact` insert or update, wrapped in a transaction `[BOOKSHELF]`.

**Side effects:** None.

---

## EmptyEpsilon integration

EmptyEpsilon is a third-party, open source spaceship bridge simulator. This backend treats it as the "physics/damage model" for the ship. It exposes a Lua-scripted HTTP interface: `get.lua`, `set.lua`, and optionally `exec.lua` for DMX passthrough. This backend polls it and pushes to it.

**Client:** `src/integrations/emptyepsilon/client.ts`. Configuration is via env vars `EMPTY_EPSILON_HOST`/`EMPTY_EPSILON_PORT`. Separately, `EMPTY_EPSILON_DMX_HOST`/`EMPTY_EPSILON_DMX_PORT` configure the DMX passthrough endpoint, which can point at a different host than the main game server. If host or port are not set, the client switches into emulated mode and starts a built-in mock server (see Emulator below). `isEmulated` state is recorded, but not currently exposed via any route in scope. `getConnectionStatus()` does return it (`src/integrations/emptyepsilon/client.ts:67-73`), but the only reader in scope, the connection status blob writer in `state.ts`, stores the whole object.

**Polling ("what is polled, how often"):**

- `src/index.ts:176-179`: after Redux state is loaded, an interval is started via `interval(updateEmptyEpsilonState, EE_UPDATE_INTERVAL)`, where `EE_UPDATE_INTERVAL = process.env.EMPTY_EPSILON_UPDATE_INTERVAL_MS` or default `1000` ms.
- `updateEmptyEpsilonState` (`src/integrations/emptyepsilon/state.ts:6-30`):
  1. Reads the `ship/metadata` Redux blob. If `ee_connection_enabled` is falsy, it returns immediately, without calling EE at all (`src/integrations/emptyepsilon/state.ts:10-11`). Per the comment, this flag must be enabled before the EE server itself is even started. The EE HTTP server "is buggy and will crash the game server if it gets a request before fully loading".
  2. Otherwise, it calls `client.getGameState()`. This makes two parallel GET requests to `get.lua`: `fetchGameState` and `fetchLandingPadStatuses` (`src/integrations/emptyepsilon/client.ts:90-100,112-155`). They are split into two calls because, per a comment, one combined request was too large and caused "socket closed connection" errors. The requests use `axios`, with EE-specific Lua query-parameter expressions per field, e.g. `getSystemHealth("reactor")`. These are listed in `getGameStateRequestParameters`/`getLandingPadStateRequestParameters` (`src/integrations/emptyepsilon/client.ts:296-338`).
  3. The flat key/value response is reshaped into a nested object, by field-name pattern matching: `Health`→`systems.health`, `Heat`→`systems.heat`, `Count`→`weapons`, `landingPadStatus*`→`landingPads`, else `general`. It is then validated against the zod schema `EmptyEpsilonState` (`src/integrations/emptyepsilon/types.ts:3-50`). On schema failure, it throws. The outer catch handles this and sets the connection unhealthy.
  4. Computes derived field `general.shipHullPercent = shipHull / shipHullMax`.
  5. Writes the EE connection status (healthy/unhealthy, last error, `isEmulated`) to the `ship/ee_metadata` Redux blob, via `setData(..., force=true)`. It does this only if the status changed since the last poll (`isEqual` check, `src/integrations/emptyepsilon/state.ts:19-20`). This always uses `force=true`, bypassing the optimistic-lock version check entirely, because this is a server-internal writer, not a client request.
  6. If the GET failed (`'error' in state`), it stops here. There is no update to `ship/ee`.
  7. If `ee_sync_enabled` is falsy, it stops here too. This is a separate flag from `ee_connection_enabled`, also on `ship/metadata`. The connection can be healthy and polled while sync to the visible state blob is paused.
  8. Otherwise, if the new state differs from the current `ship/ee` blob (`isEqual` check, ignoring metadata keys), it overwrites `ship/ee` via `setData(..., force=true)`.

**Redux store writes (background, not a route):** `ship/ee_metadata` and `ship/ee`, both via `setData(force=true)`. Both are subject to the same `/data` Socket.IO broadcast and 5-second Postgres persistence described in the Data routes section. EE connection health and full game state changes are pushed to every `/data`-subscribed client roughly every second, whenever they change.

**What happens when the connection fails:** `setIsConnectionHealthy(false, error)` is called (`src/integrations/emptyepsilon/client.ts:152,75-86`). It only logs and updates internal state if the health value or error message actually changed, to avoid log spam (`src/integrations/emptyepsilon/client.ts:78`). The poll silently continues on its normal interval. There is no backoff, no circuit breaker, and no cap on retries. Every tick after a failure retries at the same 1-second cadence. Downstream, any UI relying on `ship/ee` simply stops receiving updates and sees stale data. `ship/ee_metadata.isConnectionHealthy` flips to `false`; that is the only signal clients get.

**`PUT /state`** (`setStateRouteHandler`, mounted at root in `src/index.ts:97`, defined `src/routes/emptyepsilon.ts:23-51`):
### `PUT /state`
**Source:** `src/routes/emptyepsilon.ts:23`

**Purpose:** Generic command dispatch to mutate EmptyEpsilon's live game state (set a system's health/heat, set weapon storage count, or set the ship alert level).

**Request:** Body `{ command: string, target?: string, value: any }`. The route layer does not validate `command`. It is validated only inside `client.setGameState`, for the generic branch, against an allow-list: `setSystemHealth`, `setSystemHeat`, `setWeaponStorage`, `setLandingPadState`. `setAlertLevel` and `setHull` are special-cased ahead of that allow-list check, and bypass it. There is no zod schema. The types of `target`/`value` are passed straight through to a Lua string-interpolated URL.

**Response:** `204` on success. `500` on failure. Both the `setAlertLevel` and generic branches log the error server-side, then respond `500` with no body. The `setHull` branch responds `500` with no logging at all (`src/routes/emptyepsilon.ts:41`).

**Database/Redux reads:** For the non-alert, non-hull branch, `client.setGameState` reads `ship/metadata`'s `ee_connection_enabled` flag. If it is false, it warns and returns `undefined`, without making any HTTP call or telling the client. The route still responds however the intermediate promise resolves. `undefined` is not an error, so it proceeds to `res.sendStatus(204)`, even though nothing happened (`src/integrations/emptyepsilon/client.ts:195-200`). This is a silent no-op, close to a `[BUG]`.

**Side effects:** `[SIDE-EFFECT]`

- `[BUG]` External HTTP GET to EmptyEpsilon's `set.lua`, with a Lua command string built by simple interpolation (e.g. `setSystemHealth("reactor",0.8)`). The code does not escape or sanitize `target`/`value` beyond what `axios`'s query serialization does for the URL itself. Both values go into the query string as raw text, not as separate parameters. A `target` value containing `"` or `)` changes the Lua expression sent to EE. This is an input-handling defect worth fixing in a rewrite: validate or escape `target`/`value` before building the Lua command string.
- If `command === 'setAlertLevel'`: on success, it emits Socket.IO event `shipAlertLevelUpdated` with the new value. This goes to all clients on the default namespace, via `req.io.emit(...)` (`src/routes/emptyepsilon.ts:31`). This is separate from, and in addition to, any `/data` update, since alert level is not read from Redux here.

**Rewrite notes:** Three different commands are jammed into one endpoint, via a `command` string field acting as a pseudo-RPC method name. A rewrite might prefer three distinct endpoints or methods.

### `GET /emptyepsilon/damage-dmx`
**Source:** `src/routes/emptyepsilon.ts:60`

**Purpose:** Query whether EmptyEpsilon's own built-in damage-triggered DMX (separate system from this backend's own `/dmx` routes) is enabled.

**Response:** `200` `{ damageDmxEnabled: boolean }`.

**Side effects:** `[SIDE-EFFECT]` External HTTP POST to EE's `exec.lua`, a Lua RCE-style endpoint, with the literal script `return HardwareController():isDamageDmxEnabled()` (`src/integrations/emptyepsilon/client.ts:252`). `exec.lua` is unconfigured when `dmxExecUrl` is unset: neither the main host/port implies emulation with an exec URL, nor are the `EMPTY_EPSILON_DMX_HOST`/`PORT` env vars set. In that case, it logs and returns `true` as a hard-coded default (`src/integrations/emptyepsilon/client.ts:246-249`). This means an unconfigured deployment always reports "enabled", regardless of reality. On any error, such as a network problem or a bad response, it also defaults to `true` (`src/integrations/emptyepsilon/client.ts:255-257`). It fails open.

### `POST /emptyepsilon/damage-dmx`
**Source:** `src/routes/emptyepsilon.ts:80`

**Request:** Body `{ enableDamageDmx: boolean }`, validated: `400` via `http-errors` if not boolean (`src/routes/emptyepsilon.ts:82-84`). This is one of the very few validated bodies in this whole scope.

**Response:** `200` `{ enableDamageDmx }`, echoing the input. It does not confirm success or failure from EE, beyond logging exceptions internally.

**Side effects:** `[SIDE-EFFECT]` External HTTP POST to EE's `exec.lua`, with `HardwareController():enableDamageDmx()` or `...disableDamageDmx()` (`src/integrations/emptyepsilon/client.ts:222-244`). Failures are only logged server-side (`logger.error`, no re-throw). The client always gets `200`, even if the underlying EE call failed.

### Built-in emulator
**Source:** `src/integrations/emptyepsilon/emulator.ts`

**Purpose:** When no real EmptyEpsilon server is configured (`EMPTY_EPSILON_HOST`/`PORT` unset), this starts an in-process HTTP mock. It uses `nock` to intercept requests to the fake host `ee-emulation.local`. The rest of the system, polling, `/state`, and damage-dmx routes, then functions against a fake, but stateful, in-memory game state. That state (`mockState`) is seeded from the `mockEmptyEpsilonGameState` fixture (`src/integrations/emptyepsilon/emulator.ts:22`).

- Mocks `get.lua`. It handles the same two query shapes the real client issues: general state and landing pad status. These are told apart by whether the query string contains `landingPadStatus1` (`src/integrations/emptyepsilon/emulator.ts:25-53`).
- Mocks `set.lua`. It parses the Lua-ish command out of the raw request path with regexes, a fragile string-parsing approach, e.g. `req.replace(/.*"(\w.*)".*/, '$1')`. This updates `mockState` in place, for `setSystemHealth`, `setSystemHeat`, `setWeaponStorage`, `setHull`, `setLandingPadStatus`, and `commandSetAlertLevel` (`src/integrations/emptyepsilon/emulator.ts:56-97`). Unknown commands get `{ ERROR: 'Something went wrong' }`.
- Mocks `exec.lua` for `enableDamageDmx`/`disableDamageDmx`/`isDamageDmxEnabled`, tracked with a local closure variable `isDamageDmxEnabled` (`src/integrations/emptyepsilon/emulator.ts:99-123`).

**Rewrite notes:** This emulator is test and demo infrastructure embedded in production code paths. It is invoked from the production `EmptyEpsilonClient` constructor, not just from test setup (`src/integrations/emptyepsilon/client.ts:58`). It is worth deciding whether a rewrite keeps a bundled emulator, or always requires a real or staging EE instance.

### `POST /state/full-push`
**Source:** `src/index.ts:106`

**Purpose:** Push the entire `ship/ee` Redux blob to EmptyEpsilon, as a batch of individual `set.lua` commands. This completely overwrites EE's live state, to match the backend's last-known snapshot.

**Request:** No body used; reads `ship/ee` from the Redux store.

**Response:** `200` `{ success: true }` on success. Throws (500 via global error handler) if the `ship/ee` blob is empty (`isEmpty` check, `src/index.ts:110`).

**Database reads:** none. **Redux store reads:** `ship/ee`.

**Side effects:** `[SIDE-EFFECT]` `pushFullGameState` (`src/integrations/emptyepsilon/client.ts:211-220`) fires one `setGameState` HTTP call in parallel, per system-heat field, per system-health field, per weapon-count field, and per landing pad. This uses `fullStateToApiCommands` (`src/integrations/emptyepsilon/client.ts:260-294`). It also fires one `setAlertLevel` call and one `setHullHealthPercent` call. This can be 20 or more simultaneous HTTP requests to EE for one API call. Any individual failure rejects the whole `Promise.all`. By the time that happens, some of the other commands have already been applied to EE. There is no atomicity or rollback.

**Rewrite notes:** There is no confirmation that EE actually accepted every command. `Promise.all` fails fast on the first rejection. It does not wait to see, or report, which of the roughly 20 parallel commands succeeded.

### `POST /state/break-task`
**Source:** `src/index.ts:116`

**Purpose:** GM/admin action: forcibly mark a task "broken", and damage the matching EmptyEpsilon ship system to match. This simulates a random hardware failure event.

**Request:** Body `{ taskId: string }`. It looks up `task/<taskId>` from Redux (`getData('task', taskId)`, `src/index.ts:120`), not the Postgres `task` table. The `Task` model in `src/models/task.js` is unrelated to, and unused by, this route. If the task blob does not exist, or lacks `eeType`/`eeHealth` fields, it responds `404` (`src/index.ts:121-124`).

**Response:** `204` on success, `404` if the task data is missing/incomplete.

**Redux store reads:** `task/<taskId>` blob (fields `eeType`, `eeHealth`, `id`).

**Side effects:** `[SIDE-EFFECT]`

1. Computes `healthAmount`. If `task.eeType === 'hull'`, it uses `task.eeHealth - 0.01`. This is an intentional under-count. The comment at `src/index.ts:126-128` explains: it avoids rounding that would make health lower than necessary and trigger the breaking of even more hull tasks. Otherwise, it uses `task.eeHealth` unmodified.
2. Calls `breakTask(task)` (`src/rules/breakTask.js:16-39`). This looks up the underlying `game`/`box` Redux blob referenced by the task. If it is not already `status: 'broken'`, it computes additional per-box-type context. Examples: regenerating a wiring puzzle's expected solution for `reactor_wiring` box types, or picking a new random target for physical button-board boxes. It then overwrites that blob's `status` to `'broken'`, via `saveBlob`, deferred to the next tick.
3. `await sleep(500)`: a hard-coded half-second delay (`src/index.ts:134`). The comment explains: "Allow time for rules to pick up breakage of box and as a result break the corresponding task." This is a race-condition workaround. `breakTask`'s Redux write is deferred, via `saveBlob`/`timeout`, to the next tick. A separate, out-of-scope rule elsewhere in `src/rules/` is expected to observe that change, and in turn flip the actual `task` blob's own status. This route does not itself update the task blob, only the underlying box/game blob. It hopes a listener reacts in time.
4. Calls `breakEE(task.eeType, task.eeHealth, healthAmount)` (`src/rules/ship/jump.js:521-542`). This reads the current `ship.ee.general.shipHullPercent` (for `eeType==='hull'`), or `ship.ee.systems.health[eeType+'Health']`, from Redux. It subtracts a random damage amount in the range `[min,max]=[task.eeHealth, healthAmount]`. Note: `min` and `max` here are literally `task.eeHealth` and the just-computed `healthAmount`. For non-hull types these are equal, so `random(min,max)` always returns exactly that value. For hull, they differ by 0.01. The result is clamped to `[-1,1]`. It pushes the new value to EmptyEpsilon via `setHullHealthPercent` or `setGameState('setSystemHealth', ...)`. This is fire-and-forget, wrapped in try/catch; errors are only logged (`src/rules/ship/jump.js:521-542`).

**Rewrite notes:** This route straddles three different state stores: Redux `task`, Redux `box`/`game`, and remote EmptyEpsilon. It uses an explicit `sleep(500)` as an inter-process synchronization primitive, instead of an event or callback. Any rewrite needs a proper state machine or event-driven trigger here, instead of a timing assumption. The Postgres `task`/`isTaskActive` model (`src/models/task.js`) is unrelated to this flow. It only documents a different, static definition of tasks. Do not conflate the two "task" concepts when rewriting.

---

## Messaging (`/messaging`, mounted at `src/index.ts:90`, router + Socket.IO namespace defined in `src/messaging.ts`)

This document's title mentions an "EOS Datahub" messaging system, but nothing in `src/messaging.ts` makes any external HTTP call. "EOS Datahub" also appears in DMX channel names: `DataHubHackingDetected`, `DataHubNewsApproved`, `DataHubVoteApproved`. It appears to be the in-fiction, in-game name players use for the player-facing terminal or web client that this backend serves. It is not a separate third-party system. This module is the backend for that client's private-messaging and channel-chat feature. It uses its own Socket.IO namespace (`/messaging`), plus two plain HTTP admin routes.

### `GET /messaging/unread`
**Source:** `src/messaging.ts:46`

**Purpose:** Admin operation: list every message across the whole system marked unseen.

**Response:** `200` array of ComMessage, with `sender`, `receiver`, `channel` relations.

**Database reads:** `com_message` where `seen = false`, plus `person` (x2, sender/receiver) and `com_channel` `[BOOKSHELF]`.

**Side effects:** None.

### `POST /messaging/send`
**Source:** `src/messaging.ts:65`

**Purpose:** Admin operation: send a private message as any user (impersonation, for GM use, e.g. "in-character" messages from an NPC). The caller chooses the `sender` person id. The server does not check it.

**Request:** Body validated with zod: `{ sender: string, target: string, message: string }` (`SendMessageRequest`, `src/messaging.ts:51-55`) — `400` via `errorHandlingMiddleware`'s `ZodError` branch (`src/routes/helpers.ts:19-21`) if invalid.

**Response:** `204` on success.

**Database writes:** `com_message` insert, via the same code path as the Socket.IO `message` event (`onSendMessage`, see below) `[BOOKSHELF]`.

**Side effects:** `[SIDE-EFFECT]` Creates a "mock socket" (`createAdminMockSocket`, `src/messaging.ts:21-30`), whose `emit` is a no-op. So the HTTP caller itself never receives a socket echo. Real connected recipients do, though. If the target user is currently connected to the `/messaging` namespace, the message is emitted to both the target's and the (mock) sender's socket sets. Since the sender is a mock with no real sockets, only the target actually receives it in practice (`onSendMessage`, `src/messaging.ts:167-205`).

### `/messaging` Socket.IO namespace
**Source:** `src/messaging.ts:82-97` (setup), handlers throughout the file.

**Handshake:** Middleware at `src/messaging.ts:87-93` requires an `id` query parameter. That id must match an existing `person.id`. If no such person exists, the connection is rejected with `Error('Invalid user')`. This check finds mistakes, such as a typo or a stale id. Person ids are printed on physical props, so they are not secret.

**Events (client → server):**

- `message` → `onSendMessage` (`src/messaging.ts:167-205`): inserts a `com_message` row, with `person_id` as the sender, plus either `target_person` for `type:'private'` or `target_channel` for `type:'channel'`. Any other `type` throws, uncaught. This is close to a `[BUG]`: an unhandled promise rejection. There is no error response to the client, since Socket.IO event handlers here have no response mechanism. The error is only visible server-side, if there is an unhandledRejection logger; none was found in the reviewed code. It rejects self-messaging silently, only logging a warning (`src/messaging.ts:181-183`).
- `messagesSeen` → `onMessagesSeen` (`src/messaging.ts:212-226`): bulk-updates `com_message.seen = true` for the given ID list, and re-fetches them. It emits `messagesSeen` back to all of the calling user's own connected sockets, for multi-tab and multi-device support. It does not emit this to the other party.
- `fetchHistory` → `onFetchHistory` (`src/messaging.ts:250-266`): returns up to 500,000 messages, for either a private conversation (`getPrivateHistory`) or a channel (`getChannelHistory`). See `fetchPageWithRelated` (`src/models/communications.js:37-45`): this page size is a literal workaround for a prior bug, where only the first page was ever reachable. The comment reads: "Feature that caused us great distress... Quick and dirty fix: increase pageSize to a large number".
- `fetchUnseenMessages` → emits `unseenMessages` with all of the caller's unseen private messages.
- `searchUsers` → emits `userList`, filtered by a case-insensitive name substring match: `LOWER(CONCAT(first_name,' ',last_name)) LIKE %name%`. This is merged with everyone the user has message history with, deduplicated by ID. Each entry is tagged with a live `is_online` flag.
- `getUserList` → same initial user list logic as on connect.

**Events (server → client):**

- On connect: `userList`, the initial list. This includes everyone the user has messaged before, plus all `role:admin` group members, each tagged `is_online`. It also sends `unseenMessages`.
- Global broadcast to all connected `/messaging` sockets, on every connect and disconnect: `status` event `{ state: 'connected'|'disconnected', user }` (`src/messaging.ts:132,280`). Every client sees every other user's presence changes.
- `message` — to specific sockets (see the private-vs-channel logic above). Channel messages broadcast to the whole namespace, regardless of actual channel membership. The comment reads: "Send to general channel for now" (`src/messaging.ts:201-203`). Multi-channel routing is not actually implemented; everyone gets every channel message.

**Database reads/writes:** `com_message`, `com_channel` (relation only, no channel CRUD routes exist in this scope), `person` (handshake, sender/target/channel relations, admin group members), `group`+`person_group` (admin user list, via `Group.where({ id: 'role:admin' }).fetch({ withRelated: ['persons'] })`, `src/messaging.ts:315-316`) `[BOOKSHELF]`.

**Rewrite notes:** Presence (`status` events) and channel messages are both broadcast namespace-wide, with no room-based scoping. This does not scale past a small number of concurrent users or channels. Any client sees traffic for every channel, not just ones they are "in"; there is no concept of joining a channel in this code. The `com_message` schema stores 'seen' at the row level. The fetch limit of 500,000, a literal workaround and not a designed pagination system, should be replaced with real pagination in a rewrite.

---

## Root-mounted misc routes (`src/index.ts`)

### `GET /`
**Source:** `src/index.ts:78`

**Purpose:** Redirect to the Swagger UI.

**Response:** `302` redirect to `/api-docs`.

**Side effects:** None.

### `GET /ping`
**Source:** `src/index.ts:193`

**Purpose:** Liveness check.

**Response:** `200` body `"pong"` (plain text).

**Side effects:** None.

### `GET /metrics`
**Source:** `src/index.ts:61-67`

**Purpose:** Prometheus metrics endpoint (via `express-prometheus-middleware`). It covers default Node process metrics and HTTP request duration histograms (buckets `[0.1, 0.5, 1, 1.5]` seconds). It also covers Socket.IO connection and event counters, via `prometheusIoMetrics(io)` (`src/index.ts:69`). Any caller can read these metrics, including request paths and durations.

**Side effects:** None (metrics collection is passive).

### `POST /emit/:eventName`
**Source:** `src/index.ts:149`

**Purpose:** A raw escape hatch. It lets a caller broadcast any Socket.IO event name, with any body, to every connected client on the default namespace. A wrong call forges events such as `logEntryAdded`, `shipAlertLevelUpdated`, or `infoEntryDeleted`, since the frontend cannot tell a forged event from a real one.

**Request:** Path param `eventName` (any string). Body: any JSON (or omitted, defaults to `{}`).

**Response:** `204`.

**Database/Redux:** None.

**Side effects:** `[SIDE-EFFECT]` `io.emit(eventName, req.body || {})` — global broadcast, default Socket.IO namespace (distinct from `/data` and `/messaging` namespaces), no room scoping.

**Rewrite notes:** This is a generic event bus with no restriction on the event name. A rewrite should restrict it to a fixed list of allowed event names, or remove it. Either fix closes the ability to forge an arbitrary client-trusted event.

---

## Open questions

- `Unclear:` whether `Bookshelf.transaction(...)` wrapping a `ModelClass.forge().save(...)` returns or mutates the same model instance referenced by the outer `tag`/`sipContact` variable, or a new, detached one. This pattern is used in `PUT /tag` (`src/routes/tag.js:53-54`) and `PUT /sip/contact` (`src/routes/sip.js:66-67`). I did not run the app to confirm this at runtime, per instructions. If it is a new instance, both routes have a `[BUG]`: the JSON response on update reflects pre-update data.
- `Unclear:` what serves the static file paths referenced in generated content: `/images/skeleton.gif`, `/images/brainscan.gif`, `/images/kontaminaatio.gif` (`src/routes/operation.ts:34-48`), and `/gene-samples/*.pdf` (`src/utils/medical-test-results.ts:3-9`). No route in this scope serves them. They may be served by a separate static file layer, a CDN, or a different, out-of-scope Express route or middleware.
- `Unclear:` where or how the "some separate rule" mentioned in the `/state/break-task` comment (`src/index.ts:133`) actually reacts to a broken box/game blob. It is supposed to update the corresponding `task` Redux blob. This lives outside the file list given for this task, likely elsewhere in `src/rules/`, and was not opened.
- `Unclear:` whether `infoboard_priority` is truly a singleton table, a single row that is always updated, or can hold multiple rows. `PUT /infoboard/priority`'s `WHERE priority > 0` bulk-update (`src/routes/infoboard.js:21`) and `InfoPriority.forge().fetch()`'s lack of any `where` clause both suggest a singleton. I did not query the live database, or find a migration constraint enforcing a single row.
- The task's file list did not include `src/rules/rules.js`, `src/eventhandler.ts`, or `src/rules/ship/jump.js` in full. I opened small, targeted excerpts of `jump.js` and `breakTask.js`, only because `POST /state/break-task` directly calls into them. Anything else those files do is out of scope and undocumented here.

## Cross-cutting observations

- `[BY-DESIGN]` **No route in this document checks a credential.** This is the trust model described in `00-overview.md` section 2, not a defect. The one partial exception is the `/messaging` Socket.IO handshake. It checks that a person id exists. It does not check that the caller is that person. Any client that can reach the server can call every HTTP route documented here. This includes routes that change ship physics (`PUT /state`) and fire physical hardware (`POST /dmx/event/:channel`). It also includes routes that broadcast any Socket.IO event (`POST /emit/:eventName`) and send a message as any player (`POST /messaging/send`).
- **Input validation is the exception, not the rule.** Only three places use a schema library, zod. They are `SendMessageRequest` in `src/messaging.ts:51`, the `EmptyEpsilonState` response parsing, and the `ScienceAnalysisTimes`/`HackerDetectionTimes`/`ScienceAnalysisInProgress` internal blob shapes in `src/store/types.ts`. The `EmptyEpsilonState` case parses a response, not a request. Every other body in scope is passed straight to Bookshelf `.save()` or a raw Knex query, with only ad-hoc, partial checks. Several have no checks at all, marked with `// TODO: Validate input` in the source.
- **The Redux store is a second, informally-schemaed database that happens to live in memory.** Its "tables" (`type`) and "rows" (`id`) are strings. They are agreed upon only by convention, across dozens of call sites: `misc/artifact_actions`, `ship/metadata`, `ship/ee`, `box/bigbattery`, `task/<id>`, `tplink/dmxconfig`, and others. There is no central registry of what types or ids exist, or what shape their data takes. The exception is the small number with a zod schema in `src/store/types.ts`. A rewrite needs to either enumerate every `(type,id)` combination in use across the whole codebase, not just this scope, or accept an equivalently free-form store.
- **Optimistic locking (`version`) is opt-in and frequently bypassed.** Any server-internal writer can pass `force=true` to `setData`/`saveBlob`'s underlying dispatch and skip the check entirely. An example is the entire EmptyEpsilon polling loop (`src/integrations/emptyepsilon/state.ts:20,28`). Only genuine external HTTP callers hitting `/data/:type/:id` without `?force=true` are subject to the 409 conflict path.
- **Fire-and-forget side effects are common and largely unmonitored.** Examples: DMX's TP-Link fan-out (`src/dmx.ts:231-232`), several `setTimeout`-deferred `saveBlob` calls (`src/rules/artifacts/artifact.ts:37-44,106-114`), and multiple EmptyEpsilon calls. All of these swallow their own errors into a `logger.error` call. There is no retry, no alert, and no caller-visible failure. A rewrite should decide, deliberately, which of these need real reliability guarantees, such as at-least-once delivery, retries, or dead-letter handling. It should also decide which are acceptably best-effort for a live LARP show.
- **The number "542" appears as a literal string prefix** in generated medical (`src/utils/medical-test-results.ts:82,105`) and science (`src/utils/science.ts:61,63`) result text. `Unclear:` what in-fiction meaning this number has. It looks like an in-game document or form code shared by both systems. Ask the game design team before dropping it in a rewrite.
- **The same narrative NPC ID (`EVA_ID = '20263'`) is hard-coded independently in two files** (`src/routes/operation.ts:20` and `src/utils/science.ts:10`), rather than shared from one constant. This is a small but real duplication risk, if this ID ever needs to change.
