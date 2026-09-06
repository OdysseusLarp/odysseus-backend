# Database schema

This document describes the final shape of the Odysseus database. It folds
all migrations in `db/migrations/` (read in timestamp order) into one
picture per table. Tags are defined in `docs/rewrite/CONVENTIONS.md`.

The database runs PostgreSQL 12 with PostGIS 3 (`db/Dockerfile:1-3`). The
app connects through Knex (`knexfile.ts:5`, client `pg`) and Bookshelf.js
(`db/index.ts:6-7`).

---

## `grid`

**Defined in:** `db/migrations/20180826172852_initial.js:5-10` (first version, dropped).
Recreated in `db/migrations/20181118152323_starmap-and-fleet.js:7-17`.
Altered in `db/migrations/20190305184226_starmap-updates.js:28-30` (added `sub_quadrant`).

**Purpose:** One cell of the starmap grid (a sub-sector). Ships, planets and
other objects are placed inside a grid cell's geometry.

**Columns:**

| Name | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | integer (serial) | no | auto | PK |
| zoom | smallint | yes | - | |
| quadrant | text | yes | - | |
| sector | text | yes | - | |
| sub_sector | text | yes | - | |
| name | text | yes | - | |
| x | smallint | yes | - | helper for finding nearby grids |
| y | smallint | yes | - | |
| the_geom | geometry(Geometry,3857) `[GIS]` | no | - | polygon of the grid cell, EPSG:3857 |
| sub_quadrant | text | yes | - | added later |

**Primary key / indexes / FKs:** PK `id`. No foreign keys. No non-geometry
indexes. `[BUG]` The table has **no `created_at`/`updated_at` columns**
(`db/migrations/20181118152323_starmap-and-fleet.js:7-17` never calls
`t.timestamps`), but the `Grid` Bookshelf model declares
`hasTimestamps: true` (`src/models/ship.js:24-27`). A `Grid.forge().save()`
would fail because Bookshelf would try to write timestamp columns that do
not exist. This is latent: no code in `src/` ever calls `.save()` on
`Grid` (grep of `src/` shows only `.fetch()`/`.where()` use).

**PostgreSQL-specific features used:** `[GIS]` `the_geom` geometry column
and the GIST index created on it (see PostGIS map below).

**SQLite portability:** POSTGRES-ONLY. `the_geom` and every view built on
it require PostGIS. Non-geometry columns are otherwise plain and portable.

**Written by:** Seeded directly with `knex('grid').insert(...)` in
`db/seeds/01-starmap-and-fleet.js:85-86`. Never written by application
routes (`src/routes/starmap.js` only reads it).

**Story DB:** No.

---

## `box`

**Defined in:** `db/migrations/20180920221859_boxes-and-tasks.js:3-8` (first
version, dropped). Recreated in `db/migrations/20181029181054_box.js:2-8`.
Column `id` changed from integer to varchar in
`db/migrations/20181117183256_box-id-to-string.js:2`.

**Purpose:** Was meant to hold generic JSON state per "box" (physical prop).
`[DEAD]`

**Columns:**

| Name | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | varchar(255) | no | - | PK |
| value | jsonb `[PG]` | yes | `{ "value": null }` | converted from json in `20230309190627_json-to-jsonb.js:19` |
| version | bigint | yes | 1 | intended for optimistic locking |
| created_at / updated_at | timestamp | yes | - | |

**Primary key / indexes / FKs:** PK `id`. No FKs.

**PostgreSQL-specific features used:** `[PG]` `jsonb`.

**SQLite portability:** PORTABLE WITH CHANGES. `jsonb` -> `TEXT` with
JSON1 functions.

**Written by:** Nothing. `[DEAD]` `src/models/box.js:11-14` defines the
`Box` model and a `getBoxValueById` helper
(`src/models/box.js:16-19`), but nothing in `src/` imports
`getBoxValueById` or the `Box` model (`grep -rn "getBoxValueById" src/`
returns only its own definition). The runtime "box" data used throughout
`src/rules/boxes/*` (e.g. `src/rules/boxes/fuseboxes.js:8`,
`src/rules/boxes/bigbattery.ts:58`) is a Redux state path
(`data.box.*`) persisted in the `store` table, not this table.

**Story DB:** No.

---

## `task`

**Defined in:** `db/migrations/20180920221859_boxes-and-tasks.js:10-19`.
Altered in `db/migrations/20181022003206_task-updates.js:6` (added
`is_active`).

**Purpose:** Was meant to hold task definitions. `[DEAD]`

**Columns:**

| Name | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | integer (serial) | no | auto | PK |
| name | text | yes | - | |
| description | text | yes | - | |
| type | varchar(255) | yes | - | e.g. "SCHEDULED", "GM" |
| systems | text[] `[PG]` | yes | - | array of system names |
| is_active | boolean | yes | - | |
| created_at / updated_at | timestamp | yes | - | |

**Primary key / indexes / FKs:** PK `id`. No FKs.

**PostgreSQL-specific features used:** `[PG]` native `text[]` array column.

**SQLite portability:** PORTABLE WITH CHANGES. Array column must become a
JSON-encoded TEXT column (SQLite has no array type).

**Written by:** Nothing. `[DEAD]` `src/models/task.js:15-20` defines the
`Task` model and `isTaskActive`, but nothing else in `src/` imports either
(same evidence pattern as `box` above). Runtime task data lives at Redux
path `data.task.*` (e.g. `src/rules/ship/eeHealth.js:125`,
`src/rules/ship/lifesupport.js:109`), persisted in the `store` table.

**Story DB:** No.

---

## `task_requirement`

**Defined in:** `db/migrations/20180920221859_boxes-and-tasks.js:21-27`.
Dropped in `db/migrations/20181022003206_task-updates.js:2`. **Does not
exist in the final schema.** Mentioned only for migration history
completeness.

---

## `person`

**Defined in:** `db/migrations/20181029232235_personnel-initial.js:6-22`.
Altered by: `20190117222559_person-updates.js` (dynasty_rank to integer,
add `ship_id`, drop `current_ship`/`previous_ship`),
`20190423200411_person-updates.js` (add `is_visible`, `bio_id`, rename
`chip_id`->`card_id`, add indexes), `20190526104729_person-updates.js`
(drop NOT NULL on several columns, drop `dynasty_rank`, add many
military/medical/political columns), `20240103180509_character-updates.ts`
(character/story fields), `20240217115233_add-personal-secret-info-column.ts`,
`20240421130146_add-military-academy-column.ts`.

**Purpose:** Every person in the game: NPC survivors and player characters.
Central table referenced by nearly every other subsystem.

**Columns (final):**

| Name | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | varchar(255) | no | - | PK, citizen ID string |
| bio_id | varchar(255) | yes | - | unique, "hard" auth ID (`20190423200411:5`) |
| card_id | varchar(255) | yes | - | unique, "soft" auth ID; renamed from `chip_id`, NOT NULL dropped in `20190526104729:2` |
| first_name | varchar(255) | no | - | |
| last_name | varchar(255) | yes | - | NOT NULL dropped in `20190526104729:4` |
| title | varchar(255) | yes | - | |
| status | varchar(255) | no | - | free text, e.g. "Present and accounted for", "Deceased" |
| occupation | varchar(255) | yes | - | |
| home_planet | varchar(255) | no | - | |
| dynasty | varchar(255) | yes | - | |
| birth_year | integer | yes | - | NOT NULL dropped in `20190526104729:3` |
| ship_id | varchar(255) | yes | - | FK -> `ship.id`, added `20190117222559:5` |
| is_visible | boolean | yes | true | added `20190423200411:3` |
| citizen_id | varchar(255) | yes | - | cosmetic ID, no function |
| religion | varchar(255) | yes | - | |
| citizenship | varchar(255) | yes | - | |
| social_class | varchar(255) | yes | - | |
| political_party | varchar(255) | yes | - | |
| military_rank | varchar(255) | yes | - | |
| military_remarks | text | yes | - | |
| military_service_history | text | yes | - | |
| medical_fitness_level | varchar(255) | yes | - | |
| medical_last_fitness_check | integer | yes | - | |
| medical_blood_type | varchar(255) | yes | - | |
| medical_allergies | text | yes | - | |
| medical_active_conditions | text | yes | - | |
| medical_current_medication | text | yes | - | |
| created_year | integer | yes | - | |
| is_character | boolean | yes | - | false/null for NPC survivors |
| link_to_character | text | yes | - | Google Doc link, added `20240103180509:5` |
| summary | text | yes | - | |
| gm_notes | text | yes | - | |
| shift | text | yes | - | |
| role | text | yes | - | |
| role_additional | text | yes | - | |
| special_group | text | yes | - | |
| character_group | text | yes | - | |
| medical_elder_gene | boolean | yes | false | |
| personal_secret_info | text | yes | - | added `20240217115233:6` |
| military_academies | text | yes | - | added `20240421130146:6` |
| created_at / updated_at | timestamp | yes | - | |

Removed during history: `dynasty_rank` (added as string, changed to
integer, dropped in `20190526104729:24`), `current_ship`/`previous_ship`
(dropped `20190117222559:6-7`), `chip_id` (renamed to `card_id`).

**Primary key / unique / indexes / FKs:** PK `id`. Unique on `bio_id` and
`card_id`. Indexes: `(first_name, last_name)`, `(bio_id)`, `(card_id)`
(`20190423200411:5-6,11`). FK `ship_id` -> `ship.id` (no `ON DELETE`
specified, default `NO ACTION`).

**PostgreSQL-specific features used:** None beyond standard types.

**SQLite portability:** PORTABLE. Plain columns, one FK, standard
indexes.

**Written by:** `src/routes/person.js` (PUT `/:id`, PUT `/set-visible`,
PUT `/:id/kill` -> `Person.killPerson()` in `src/models/person.js:222-234`
which also inserts into `person_entry`). Bulk-loaded by
`db/seeds/02-personnel.ts:266-272` from `db/data/survivors.csv` and
`db/data/characters.csv` via `src/utils/person-parser.ts`.

**Story DB:** Read/joined heavily by `[STORY-DB]` code
(`src/models/story-person.ts`, `story-events.ts`, `story-messages.ts`,
`story-plots.ts`) but the table itself is core personnel data, not
story-only.

---

## `person_family`

**Defined in:** `db/migrations/20181029232235_personnel-initial.js:24-31`.

**Purpose:** Family relation between two persons (self-referencing
many-to-many with a relation label).

**Columns:** `person1_id` varchar FK -> `person.id` ON DELETE CASCADE,
`person2_id` varchar FK -> `person.id` ON DELETE CASCADE, `relation`
varchar NOT NULL, `created_at`/`updated_at`.

**Primary key / FKs:** Composite PK `(person1_id, person2_id)`. Both
columns FK to `person.id`, `ON DELETE CASCADE`.

**PostgreSQL-specific features used:** None.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/person.js:210` (`PUT /:id/family` ->
`person1.family().updatePivot(...)`, a Bookshelf `belongsToMany` pivot
update). Bulk-loaded by seed from `db/data/characters.csv`
(`db/seeds/02-personnel.ts:275`, parsed in
`src/utils/person-parser.ts:81-94,118-126`).

**Story DB:** No (the story tool has its own, separate
`story_person_relations` table, see below).

---

## `medical_entry`

**Defined in:** `db/migrations/20181029232235_personnel-initial.js:45-51`.

**Purpose:** Was a standalone medical log entry, linked to persons through
the join table `person_medical_entry`.

**Columns:** `id` serial PK, `time` varchar, `details` text,
`created_at`/`updated_at`.

**SQLite portability:** PORTABLE.

**Written by:** Nothing. `[DEAD]` The join table `person_medical_entry`
that linked this table to `person` was dropped in
`db/migrations/20190526104729_person-updates.js:27` (`DROP TABLE
person_medical_entry`), but `medical_entry` itself was never dropped. No
model or route references `medical_entry` anywhere in `src/` (confirmed by
grep; only `person_entry`, a different table created in the same
migration, is used). The table is orphaned: it still exists in the
database but is unreachable from any other table and unused by code.

**Story DB:** No.

---

## `person_entry`

**Defined in:** `db/migrations/20190526104729_person-updates.js:32-41`
(replaced the medical/military-specific tables dropped in the same
migration).

**Purpose:** Free-text log entries attached to a person: MEDICAL,
MILITARY or PERSONAL notes.

**Columns:** `id` serial PK, `person_id` varchar FK -> `person.id` NOT
NULL, `added_by` varchar FK -> `person.id`, `type` varchar
("MEDICAL"/"MILITARY"/"PERSONAL"), `entry` text, timestamps.

**Indexes:** `(person_id)`, `(type)`.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/person.js:225` (`POST /:id/entry`),
`src/models/person.js:222-234` (`killPerson`, inserts a "Deceased" entry),
`src/models/ship.js:216-224` (`destroyShip`, inserts "Killed in action"
entries for every person on a destroyed ship),
`src/routes/operation.ts:425,442,451` (auto-posts XRAY/blood/gene test
result text as medical entries). Bulk-loaded by seed from
`characters.csv` "personal_file"/"medical_records"/
"military_service_history" columns
(`src/utils/person-parser.ts:128-137`).

**Story DB:** No.

---

## `group` and `person_group`

**Defined in:** `db/migrations/20190607183607_person-groups.js:2-12`.

**Purpose:** Named tags a person can belong to (e.g. role/skill groups
used for filtering and vote eligibility).

**`group` columns:** `id` varchar PK, timestamps.
**`person_group` columns:** `person_id` varchar FK -> `person.id` ON
DELETE CASCADE, `group_id` varchar FK -> `group.id` ON DELETE CASCADE,
timestamps. Composite PK `(person_id, group_id)`.

**Bookshelf note:** `Group.serialize` (`src/models/person.js:37-39`)
overrides serialization to return just the group ID string instead of an
object - a rewrite that returns `SELECT * FROM group` rows verbatim would
produce a different JSON shape than the current API. See models doc.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/person.js:264` (`PUT /:id/group/:groupId` ->
`person.addToGroup()`, raw INSERT in `src/models/person.js:210-215`) and
`src/routes/person.js:286` (`DELETE /:id/group/:groupId` ->
`deleteFromGroup`, raw DELETE in `src/models/person.js:216-221`).
Seeded from `characters.csv` "role:*"/"skill:*" boolean columns
(`src/utils/person-parser.ts:63-75,159-162`).

**Story DB:** No.

---

## `person_blood_test_result`

**Defined in:** `db/migrations/20190703173511_blood-test-results.js:2-19`.

**Purpose:** Static reference blood values per person, used to generate
the human-readable blood test report text.

**Columns:** `id` serial PK, `person_id` varchar FK -> `person.id` NOT
NULL, `blood_type`/`hemoglobin`/`leukocytes`/`kalium`/`natrium`/`hcg`/
`acn_enzyme`/`sub_abuse` all varchar, `details` text, timestamps.

**SQLite portability:** PORTABLE.

**Written by:** Only seeded, from `db/data/blood-test-results.csv`
(`db/seeds/02-personnel.ts:227-243,306`). Read by
`src/routes/operation.ts:397-401` (`getBloodTestResult`) when a MEDIC
blood-sample operation completes.

**Story DB:** No.

---

## `ship`

**Defined in:** `db/migrations/20181118152323_starmap-and-fleet.js:19-29`.
Altered by: `20181206215751_ship-metadata.js` (`metadata` json),
`20181219174555_starmap-objects.js:11-15` (`the_geom`, `class`, `type`),
`20190526090936_ship-updates.js` (drop `game_state`, add
`fighter_count`/`transporter_count`/`description`/`is_visible`, relax
timestamp NOT NULL), `20230309190627_json-to-jsonb.js:23` (`metadata` ->
jsonb).

**Purpose:** A ship in the fleet, including the player ship "odysseus".

**Columns (final):**

| Name | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | varchar(255) | no | - | PK, e.g. `odysseus` |
| name | varchar(255) | no | - | unique |
| status | varchar(255) | yes | - | e.g. "Present and accounted for", "Destroyed" |
| grid_id | integer | yes | - | FK -> `grid.id` |
| metadata | jsonb `[PG]` | yes | - | arbitrary ship metadata (jump range, crystal count...) |
| the_geom | geometry(Geometry,3857) `[GIS]` | yes | - | ship position |
| class | varchar(255) | yes | - | ship class/model |
| type | varchar(255) | yes | - | e.g. "Military", "Civilian" |
| fighter_count | integer | yes | 0 | |
| transporter_count | integer | yes | 0 | |
| description | text | yes | - | |
| is_visible | boolean | yes | - | |
| created_at / updated_at | timestamp | yes | - | NOT NULL dropped in `20190526090936:9-10` |

Removed: `game_state` (json, dropped `20190526090936:3`).

**Primary key / indexes / FKs:** PK `id`. Unique `name`. Index
`(grid_id)`. FK `grid_id` -> `grid.id` (no `ON DELETE`).

**PostgreSQL-specific features used:** `[PG]` `jsonb` metadata; `[GIS]`
`the_geom` and the GIST index on it (see PostGIS map).

**SQLite portability:** PORTABLE WITH CHANGES for `metadata`
(jsonb -> TEXT + JSON1). POSTGRES-ONLY for `the_geom` unless the geometry
column is stripped out and moved to a PostGIS-only side table.

**Written by:** `src/routes/fleet.js` (PUT `/:id`, PATCH `/:id/metadata`,
POST `/:id/destroy` -> `Ship.destroyShip()`
`src/models/ship.js:206-230`), `src/models/ship.js:189-202`
(`jumpFleet`/`moveTo`, used by `src/rules/ship/jump.js`),
`src/models/ship.js:1000` (`setShipsVisible`). Seeded from
`db/data/ship.csv` via `COPY` in `db/seeds/01-starmap-and-fleet.js:121`.

**Story DB:** No.

---

## `grid_action`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:62-69`.

**Purpose:** Records that a ship visited or scanned a grid cell. Drives
`is_discovered`/visibility logic for the starmap.

**Columns:** `id` serial PK, `grid_id` integer FK -> `grid.id` ON DELETE
CASCADE, `ship_id` varchar FK -> `ship.id` ON DELETE CASCADE, `type`
varchar ("VISITED"/"SCANNED"/"SCAN"/"JUMP"), timestamps.

**Indexes:** `(grid_id)`.

**SQLite portability:** PORTABLE.

**Written by:** Only seeded (`db/seeds/01-starmap-and-fleet.js:24-50,93`,
the hardcoded `discoveredGrids` list). No route in `src/routes/` inserts
into it directly; it is read by the `starmap_object_visible` and
`starmap_grid_info` views.

**Story DB:** No.

---

## `starmap_beacon`

**Defined in:** `db/migrations/20190608124755_starmap-signal.js:2-8`.
Altered: `is_visible` was never added here (that's `sip_contact`); no
further column changes found.

**Purpose:** A distress-signal beacon placed in a grid; activating it
decrypts the signal.

**Columns:** `id` varchar PK (also the decryption key), `grid_id`
integer FK -> `grid.id`, `is_active` boolean NOT NULL, `is_decrypted`
boolean NOT NULL, timestamps.

**SQLite portability:** PORTABLE.

**Written by:** `src/models/ship.js:83-105` (`Beacon.activate`, called
from `src/routes/starmap.js:44,65` for `PUT /beacon/decode/:id` and
`PUT /velian-distress-signal`) - sets the target beacon active and
**all others inactive** in one transaction `[SIDE-EFFECT]`, then fires a
DMX event and a ship log message. Seeded with 7 fixed beacons
(`db/seeds/01-starmap-and-fleet.js:100-108`).

**Story DB:** No.

---

## `starmap_bg`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:18-28`.

**Purpose:** Decorative background stars for the starmap renderer (not
gameplay objects).

**Columns:** `id` serial PK, `gs_size`/`gs_size_scale`/`gs_size_halo`/
`gs_fill_opacity` real NOT NULL, `gs_rotation` bigint NOT NULL,
`gs_color`/`gs_color_halo` varchar, `the_geom` geometry(Geometry,3857)
`[GIS]` NOT NULL.

**Indexes:** GIST index `starmap_bg_geoindex` on `the_geom`.

**SQLite portability:** POSTGRES-ONLY (geometry column).

**Written by:** Only seeded, via `COPY starmap_bg FROM
'/fixtures/starmap_bg.csv'` (`db/seeds/01-starmap-and-fleet.js:117`),
sourced from `db/data/starmap_bg.csv` and baked into the Docker image by
`db/Dockerfile:10`. Never written by application code; read only by the
map renderer (Geoserver/OpenLayers), not by any `src/` code (grep found
no reference to `starmap_bg` in `src/`).

**Story DB:** No.

---

## `starmap_object`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:31-58`.
Altered: `20190305184226_starmap-updates.js:25-26` (`distance`,
`surface_gravity`).

**Purpose:** Planets, moons, asteroids, comets and stars on the starmap.

**Columns (final):** `id` serial PK, `name_generated` varchar NOT NULL,
`is_scanned` boolean NOT NULL default false, `description` text,
`ring_system` boolean, `radius` bigint NOT NULL, `mass` numeric(35,0) NOT
NULL, `habitable_zone`/`name_known`/`celestial_body`/`atmosphere`/
`satellite_of`/`category` varchar, `temperature` bigint,
`orbital_period`/`rotation` real, `orbiter_count` bigint, `atm_pressure`
double precision, `gs_size`/`gs_size_scale`/`gs_size_halo`/
`gs_fill_opacity` real NOT NULL, `gs_rotation` bigint NOT NULL,
`gs_color`/`gs_color_halo` varchar, `the_geom` geometry(Geometry,3857)
`[GIS]` NOT NULL, `distance` real, `surface_gravity` real.

**Indexes:** `(name_generated, satellite_of, celestial_body)`, GIST index
`starmap_object_geoindex` on `the_geom`.

**PostgreSQL-specific features used:** `[GIS]` geometry column and GIST
index; `numeric(35,0)` for `mass` (arbitrary precision, portable to
SQLite only as TEXT or REAL with precision loss).

**SQLite portability:** POSTGRES-ONLY (geometry column and the views
built on it). Non-geometry columns are otherwise portable except
`numeric(35,0)`, which loses precision as SQLite REAL (a double).

**Written by:** Only seeded, via `COPY starmap_object FROM
'/fixtures/starmap_object.csv'` (`db/seeds/01-starmap-and-fleet.js:118`).
Read via the `MapObject` Bookshelf model (`src/models/map-object.js:16`,
`tableName: 'starmap_object'`) by `src/rules/ship/jump.js:71` (jump
target lookup) and `src/models/ship.js:281` (`moveShips`). `is_scanned`
is never updated by any code found in `src/`, despite the column
existing for exactly that purpose - possible dead write path.

**Story DB:** No.

---

## `com_channel`

**Defined in:** `db/migrations/20181207151445_social-initial.js:27-31`.

**Purpose:** Named chat channels (e.g. "general", "engineers").

**Columns:** `id` varchar PK (channel name), `description` varchar,
timestamps.

**SQLite portability:** PORTABLE.

**Written by:** Only seeded, 3 fixed channels
(`db/seeds/03-social.js:22-26,45`), with the seed's own comment: `// TODO:
Remove channels as they are no longer used, but removing them might break
something` (`db/seeds/03-social.js:20-21`). Read through
`ComMessage.channel()` (`src/models/communications.js:28-30`) used in
`src/messaging.ts` for channel history lookups. `[DEAD]`-adjacent: still
wired, but the seed comment says it is legacy.

**Story DB:** No.

---

## `com_channel_event`

**Defined in:** `db/migrations/20181207151445_social-initial.js:34-40`.
`metadata` converted json -> jsonb in `20230309190627_json-to-jsonb.js:21`.

**Purpose:** Was meant to log channel join/leave events. `[DEAD]`

**Columns:** `id` serial PK, `type` varchar, `metadata` jsonb `[PG]`,
timestamps. Index `(created_at)`.

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT).

**Written by:** Nothing. `[DEAD]` `ComChannelEvent` is defined in
`src/models/communications.js:83-86` but that identifier appears nowhere
else in `src/` (grep confirms only the definition itself).

**Story DB:** No.

---

## `com_message`

**Defined in:** `db/migrations/20181207151445_social-initial.js:43-52`.

**Purpose:** Chat/private messages between persons or to a channel.

**Columns:** `id` serial PK, `person_id` varchar FK -> `person.id` ON
DELETE CASCADE (sender), `target_person` varchar FK -> `person.id` ON
DELETE CASCADE, `target_channel` varchar FK -> `com_channel.id`,
`message` text NOT NULL, `seen` boolean, timestamps.

**Indexes:** `(person_id, target_person, target_channel)`.

**SQLite portability:** PORTABLE.

**Written by:** `src/messaging.ts:192,220,223,239,261,263`. This is the
one social table with no Express route file of its own; it is driven by
`src/messaging.ts`, called from the SIP/messaging layer.

**Story DB:** No.

---

## `post`

**Defined in:** `db/migrations/20181207151445_social-initial.js:12-23`.
Altered: `20190119154117_vote-and-post-approval.js:10` (`status` enum
column), `20190701181716_infoboard-news-filtering.js:3`
(`show_on_infoboard`).

**Purpose:** News/opinion posts and captain's log entries shown in the
Social Hub and on infoboards.

**Columns:** `id` serial PK, `title` varchar NOT NULL, `body` text NOT
NULL, `person_id` varchar FK -> `person.id` ON DELETE CASCADE (author),
`type` varchar NOT NULL (e.g. "NEWS", "OPINION", "CAPTAINS_LOG"),
`is_visible` boolean NOT NULL default false, `status` varchar NOT NULL
default 'PENDING' `[PG-ish]` (see note below), `show_on_infoboard`
boolean default true, timestamps.

**Indexes:** `(title, person_id)`.

**PostgreSQL-specific features used:** The migration uses
`t.enum('status', [...])` (`20190119154117_vote-and-post-approval.js:10`)
without `useNative`, which makes Knex create a plain `varchar`/`text`
column with a `CHECK` constraint, not a native Postgres `ENUM` type. Not
actually PG-only.

**SQLite portability:** PORTABLE. The CHECK-constraint enum translates
directly to a SQLite CHECK constraint.

**Written by:** `src/routes/post.js` (`PUT /`, insert or patch),
`src/models/post.js:16-19` (event listeners, side effects only - see
models doc). Seeded with 2 fixed posts (`db/seeds/03-social.js:1-18,44`).

**Story DB:** No.

---

## `vote`, `vote_option`, `vote_entry`

**Defined in:** `db/migrations/20181207151445_social-initial.js:55-82`.
Altered: `20190119154117_vote-and-post-approval.js:2-8` (`status` enum,
`is_public`, `allowed_groups`), `20190602174900_voting-updates.js:2-6`
(`duration_minutes`, `allowed_voters`, drop `allowed_groups`).

**`vote` columns:** `id` serial PK, `person_id` varchar FK ->
`person.id` ON DELETE CASCADE, `title` varchar NOT NULL, `description`
text NOT NULL, `active_until` timestamp, `is_active` boolean NOT NULL
default false, `status` varchar NOT NULL default 'PENDING' (CHECK-based
enum, same caveat as `post.status`), `is_public` boolean NOT NULL
default true, `duration_minutes` integer, `allowed_voters` varchar,
timestamps. (`allowed_groups varchar(255)[]` `[PG]` was added then
dropped again - not in final schema.)

**`vote_option` columns:** `id` serial PK, `vote_id` integer FK ->
`vote.id` ON DELETE CASCADE, `text` varchar NOT NULL, timestamps.

**`vote_entry` columns:** `person_id` varchar FK -> `person.id` ON
DELETE CASCADE, `vote_id` integer FK -> `vote.id` ON DELETE CASCADE,
`vote_option_id` integer FK -> `vote_option.id` ON DELETE CASCADE,
timestamps. Composite PK `(person_id, vote_id)` - **note:** a person can
only have one row per vote, but `vote_option_id` is not part of the key,
so the "one vote per person per option" rule is enforced purely by
choosing this PK shape, not by an explicit unique constraint on
"one vote total". Index `(vote_option_id)`.

**PostgreSQL-specific features used:** None left in the final schema
(the `[PG]` array column was removed).

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/vote.js` (`PUT /create` transactionally
inserts `vote` + `vote_option` rows, `PUT /:id/cast` inserts
`vote_entry`), `src/models/vote.js:55-63` (event listeners, side
effects). `src/routes/vote.js:71-84`
(`createVoteCreatedInfoboardEntry`) `[SIDE-EFFECT]` inserts into
`infoboard_entry` when a vote is approved.

**Story DB:** No.

---

## `ship_log`

**Defined in:** `db/migrations/20181207151445_social-initial.js:85-93`.
`metadata` converted to jsonb in `20230309190627_json-to-jsonb.js:24`.

**Purpose:** Ship log / event feed shown in-game (alerts, warnings,
successes).

**Columns:** `id` serial PK, `ship_id` varchar FK -> `ship.id` ON DELETE
CASCADE, `message` text NOT NULL, `type` varchar (styling/filtering:
ALERT/WARNING/SUCCESS/INFO), `metadata` jsonb `[PG]`, timestamps.

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT).

**Written by:** `src/models/log.js:87-95` (`addShipLogEntry`/
`shipLogger`, used from dozens of call sites across `src/rules/`),
`src/routes/log.js` (`PUT /`, `DELETE /:id`). Model event listeners emit
Socket.IO events on create/update/destroy `[SIDE-EFFECT]`
(`src/models/log.js:21-36`). Seeded with 1 fixed entry
(`db/seeds/03-social.js:29-34,46`).

**Story DB:** No.

---

## `audit_log`

**Defined in:** `db/migrations/20190602174900_voting-updates.js:8-15`.
`metadata` converted to jsonb in `20230309190627_json-to-jsonb.js:18`.

**Purpose:** Login/logout audit trail, including hacker logins.

**Columns:** `id` serial PK, `type` varchar NOT NULL ("LOGIN"/"LOGOUT"/
"HACKER_LOGIN"), `person_id` varchar FK -> `person.id` NOT NULL,
`hacker_id` varchar FK -> `person.id`, `metadata` jsonb `[PG]`,
timestamps.

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT).

**Written by:** `src/routes/person.js:96-100,130-133`,
`src/routes/log.js:76` (`POST /log/audit`). Event listener emits a
Socket.IO event on create `[SIDE-EFFECT]` (`src/models/log.js:55-61`).
Deleted wholesale on every starmap seed run
(`db/seeds/01-starmap-and-fleet.js:74`, "delete audit logs since they
have references to persons").

**Story DB:** No.

---

## `artifact`

**Defined in:** `db/migrations/20190113195533_science-artifacts.js:5-8`
(first version). Altered:
`20190611170541_tags-and-operations.js:2-5` (`catalog_id`),
`20190612214620_artifact-updates.js:4-9` (`discovered_at`,
`discovered_by`, `discovered_from`, `type`, `text`),
`20240103174232_artifact-updates.ts:4-6` (`gm_notes`, `is_visible`),
`20240428103808_add-artifact-test-columns.ts:5-10` (`test_material`,
`test_microscope`, `test_age`, `test_history`, `test_xrf`).

**Purpose:** Science artifacts found during the game and their metadata.

**Columns (final):** `id` serial PK, `name` varchar NOT NULL,
`catalog_id` varchar unique, `discovered_at`/`discovered_by`/
`discovered_from`/`type` varchar, `text` text, `gm_notes` text,
`is_visible` boolean NOT NULL default true, `test_material`/
`test_microscope`/`test_history`/`test_xrf` text, `test_age` integer,
timestamps.

**Indexes:** `(catalog_id)`.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/science.js` (`PUT /artifact`, insert-or-update
with a unique-catalog-id conflict handled by string-matching the Postgres
error message - `src/routes/science.js:275-278`, `[BUG]`-adjacent
fragility: this breaks silently if the constraint name or Postgres error
text ever changes, and would need reworking for SQLite's different error
message). Seeded from `db/data/artifacts.csv`
(`db/seeds/04-science-engi-medical.ts:6-29,353-360`, with a manual
`setval('artifact_id_seq', ...)` afterwards to fix the PK sequence
`[PG]`).

**Story DB:** Read by `[STORY-DB]` `src/models/story-artifact.ts`,
`story-events.ts`, `story-plots.ts` for cross-links, but the table itself
belongs to the science subsystem.

---

## `artifact_entry`

**Defined in:** `db/migrations/20190612214620_artifact-updates.js:12-19`.

**Purpose:** Free-text research log entries attached to an artifact.

**Columns:** `id` serial PK, `artifact_id` varchar NOT NULL,
`person_id` varchar FK -> `person.id`, `entry` text, timestamps.

**`[BUG]`:** `artifact_id` is declared as `t.string('artifact_id')
.references('id').inTable('person')`
(`db/migrations/20190612214620_artifact-updates.js:14`) - it references
`person.id`, not `artifact.id`. The column clearly should be an integer
FK to `artifact.id` (it is used that way everywhere in code, e.g.
`src/models/artifact.js:19-20` `hasOne(Artifact, 'id', 'artifact_id')`
and the seed inserts artifact PKs into it,
`db/seeds/04-science-engi-medical.ts:20-23`). This works today only by
coincidence: `db/data/survivors.csv` has ~17,925 rows
(`wc -l db/data/survivors.csv`), so person IDs `'1'` through roughly
`'17925'` all exist, and `db/data/artifacts.csv` has only ~114 rows
(`wc -l db/data/artifacts.csv`), so every `artifact_id` value (1-114)
happens to also be a valid `person.id` string. A rewrite must fix the FK
target to `artifact.id`.

**Indexes:** `(person_id)`.

**SQLite portability:** PORTABLE (once the FK bug above is fixed).

**Written by:** `src/routes/science.js:300,302` (`PUT
/artifact/entry`). Seeded from the "entry" column of
`db/data/artifacts.csv` (`db/seeds/04-science-engi-medical.ts:19-24`).

**Story DB:** No.

---

## `tag`

**Defined in:** `db/migrations/20190611170541_tags-and-operations.js:8-13`.
`metadata` converted to jsonb in `20230309190627_json-to-jsonb.js:26`.

**Purpose:** A physical NFC/QR tag definition (medic wound tags, DNA/blood
sample tags, engineering tags...).

**Columns:** `id` varchar PK (tag's own printed content), `type`
varchar, `description` text, `metadata` jsonb `[PG]`, timestamps.

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT).

**Written by:** `src/routes/tag.js` (`PUT /`, `DELETE /:id`, both inside
a Bookshelf transaction). Seeded from `db/data/tags.csv`
(`db/seeds/04-science-engi-medical.ts:31-41,356-357`).

**Story DB:** No.

---

## `operation_result`

**Defined in:** `db/migrations/20190611170541_tags-and-operations.js:15-27`.
Altered: `20190619110037_operation-author.js:4` (`author_id`),
`20190624175352_operation-additional-type.js:4` (`additional_type`).
`metadata` converted to jsonb in `20230309190627_json-to-jsonb.js:22`.

**Purpose:** Result of scanning a tag: a DNA test, blood test, diagnosis,
engineering reading etc. The core "HANSCA" gameplay mechanic.

**Columns:** `id` serial PK, `bio_id` varchar FK -> `person.bio_id`,
`catalog_id` varchar FK -> `artifact.catalog_id`, `tag_id` varchar FK ->
`tag.id`, `description` text, `sample_id` varchar, `is_analysed` boolean
default false, `is_complete` boolean default false, `type` varchar NOT
NULL, `additional_type` varchar, `author_id` varchar FK -> `person.id`,
`metadata` jsonb `[PG]`, timestamps.

**Note:** Two of its foreign keys target non-PK unique columns
(`person.bio_id`, `artifact.catalog_id`) rather than the primary keys.
This is valid in Postgres (both are unique) but is a smell worth calling
out explicitly for a rewrite (see Schema smells).

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT). FKs to
non-PK unique columns are supported in SQLite too, but need those columns
declared UNIQUE.

**Written by:** `src/routes/operation.ts` (`POST /`, `PUT /:id`). Heavy
`[SIDE-EFFECT]` chain on insert/update: automatically posts results into
`person_entry` (blood/gene/xray results,
`src/routes/operation.ts:433-456,403-431`), schedules delayed artifact
entry submission through the Redux store
(`src/routes/operation.ts:84-121`, `saveBlob`), see models doc for
full detail.

**Story DB:** No.

---

## `sip_contact`

**Defined in:** `db/migrations/20190611182245_sip-contacts.js:2-8`.
Altered: `20190625105818_sip-contact-visibility.js:3` (`is_visible`).

**Purpose:** SIP phone directory entries shown in the in-universe phone
app.

**Columns:** `id` varchar PK (also the SIP number), `name` varchar,
`type` varchar, `video_allowed` boolean default false, `is_visible`
boolean, timestamps.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/sip.js:58-68` (`PUT /contact`, inside a
Bookshelf transaction). Seeded with ~23 fixed contacts
(`db/seeds/02-personnel.ts:279-304`).

**Story DB:** No.

---

## `infoboard_entry`

**Defined in:** `db/migrations/201903061700_infoentry.js:3-10`. Altered:
`201903141800_infoentry-text.js:2-7` (`body` to text),
`20240509151944_add-active-until-infoboard.ts:6` (`active_until`),
`20240615063627_add-infoboard-entry-details.ts:5-6` (`identifier`,
`metadata`).

**Purpose:** Rotating messages shown on infoboard screens around the
venue.

**Columns:** `id` serial PK, `priority` integer NOT NULL, `enabled`
boolean NOT NULL, `title` varchar NOT NULL, `body` text NOT NULL,
`active_until` timestamp, `identifier` varchar unique, `metadata` jsonb
`[PG]`, timestamps.

**SQLite portability:** PORTABLE WITH CHANGES (jsonb -> TEXT).

**Written by:** `src/routes/infoboard.js` (`PUT /`, `PUT /:id`,
`DELETE /:id`), `src/routes/vote.js:71-84` (auto-creates an entry when a
vote is approved). Seeded with 1 fixed entry
(`db/seeds/05-infoboard.js:1-9,15-16`) that references the
`identifier: "survivors-count"` template placeholder `%%survivor_count%%`
(templating logic itself is outside `db/`, presumably in the frontend).

**Story DB:** No.

---

## `infoboard_priority`

**Defined in:** `db/migrations/201903061701_infopriority.js:2-5`.

**Purpose:** A single global priority value that selects which
`infoboard_entry` rows are currently shown.

**Columns:** `priority` integer NOT NULL, timestamps.

**`[BUG]`-adjacent schema smell:** No primary key and no unique
constraint are declared on this table at all. The application treats it
as a singleton (always fetches/updates "the" row,
`src/routes/infoboard.js:20-22,36,84`), but nothing in the schema
prevents a second row from being inserted, which would make
`InfoPriority.forge().fetch()` (`src/models/infoentry.js:29-32`)
ambiguous.

**SQLite portability:** PORTABLE.

**Written by:** `src/routes/infoboard.js:21` (`PUT /priority`, updates
all rows where `priority > 0`). Seeded with exactly 1 row
(`db/seeds/05-infoboard.js:14-15`).

**Story DB:** No.

---

## `store`

**Defined in:** `db/migrations/20190225175509_redux-store.js:4-9`.
`data` converted to jsonb in `20230309190627_json-to-jsonb.js:25`.

**Purpose:** Persistence for the server's in-memory Redux store
(`src/store/store.ts`). One row per Redux reducer/slice name. This is how
`box`/`task`/`ship`/`misc` runtime state (used throughout `src/rules/`)
actually survives a server restart, **not** the `box`/`task` Postgres
tables described above.

**Columns:** `id` varchar PK (reducer name), `data` jsonb `[PG]`,
timestamps.

**PostgreSQL-specific features used:** `[PG]` `jsonb`, storing an
arbitrary and large nested JSON blob (the entire Redux state tree for
that slice).

**SQLite portability:** PORTABLE WITH CHANGES. `jsonb` -> `TEXT` +
JSON1. Given this table holds one huge blob per slice rather than
structured rows, it is one of the easiest tables to move to SQLite.

**Written by:** The Redux persistence layer in `src/store/` (outside
`db/` and `src/models/`, not read in this pass - flagged for the
routes/store rewrite doc). `src/routes/data.js` exposes generic
read/write endpoints (`GET /data/:type/:id`, `POST /data/:type/:id`) that
sit in front of the in-memory store, not directly in front of this table.

**Story DB:** No.

---

## `person_ship`

**Defined in:** `db/migrations/20181118152323_starmap-and-fleet.js:32-37`.

**Purpose:** Was a many-to-many join table between `person` and `ship`.
`[DEAD]`

**Columns:** `person_id` varchar FK -> `person.id` ON DELETE CASCADE,
`ship_id` varchar FK -> `ship.id` ON DELETE CASCADE, timestamps.
Composite PK `(person_id, ship_id)`.

**Written by:** Nothing. `[DEAD]` No model, route, or seed in the
repository references `person_ship` (confirmed by grep across `src/` and
`db/`). It was superseded by the direct `person.ship_id` column added in
`db/migrations/20190117222559_person-updates.js:5` (a person can only be
on one ship at a time in practice, so the many-to-many table was never
needed once that column existed).

**SQLite portability:** PORTABLE (if kept at all - recommend dropping).

**Story DB:** No.

---

## `story_events`

**Defined in:** `db/migrations/20240103185349_add-story-admin-tables.ts:4-23`.

**Purpose:** `[STORY-DB]` A scripted story beat GMs can trigger (DMX
effects, NPC actions) tied to a jump number.

**Columns:** `id` serial PK, `name` text NOT NULL, `character_groups`
text, `size`/`importance`/`type`/`status` varchar, `dmx_event_num`
integer, `gm_actions` text, `after_jump` integer, `locked` boolean NOT
NULL default false, `npc_location` text, `npc_count` integer NOT NULL
default 0, `description`/`gm_note_npc`/`gm_notes` text.

**No timestamps.** No `created_at`/`updated_at` columns, unlike almost
every other table in this schema - a naming/consistency smell.

**SQLite portability:** PORTABLE.

**Written by:** `[STORY-DB]` `src/models/story-events.ts:181-203`
(`upsertStoryEvent`, a transaction that deletes and reinserts all of the
event's link-table rows on every save - see models doc). Seeded from
`db/data/events.csv` (`db/seeds/06-story-admin.ts:657`).

---

## `story_plots`

**Defined in:** `db/migrations/20240103185349_add-story-admin-tables.ts:59-76`.

**Purpose:** `[STORY-DB]` A larger scripted storyline spanning multiple
events/messages/characters.

**Columns:** `id` serial PK, `name` text NOT NULL, `character_groups`/
`themes`/`gm_actions`/`description`/`gm_notes`/`copy_from_characters`
text, `size`/`importance` varchar, `text_npc_first_message` boolean NOT
NULL default false, `after_jump` integer, `locked` boolean NOT NULL
default false. No timestamps.

**SQLite portability:** PORTABLE.

**Written by:** `[STORY-DB]` `src/models/story-plots.ts:181-202`
(`upsertStoryPlot`, same delete-and-reinsert pattern as
`upsertStoryEvent`). Seeded from `db/data/plots.csv`
(`db/seeds/06-story-admin.ts:656`).

---

## `story_messages`

**Defined in:** `db/migrations/20240109184905_add-story-admin-messages.ts:4-27`.

**Purpose:** `[STORY-DB]` A pre-written in-game message (Text NPC, EVA,
Fleet Coms, ship log, news...) that a GM sends manually.

**Columns:** `id` serial PK, `name` varchar NOT NULL, `sender_person_id`
varchar FK -> `person.id` ON DELETE CASCADE, `type` varchar NOT NULL,
`after_jump` integer, `locked` boolean NOT NULL default false, `sent`
varchar NOT NULL default 'Not yet' (free text: "Yes"/"No need"/"Not
yet"/"Repeatable"), `message` text NOT NULL, `gm_notes` text. No
timestamps.

**SQLite portability:** PORTABLE.

**Written by:** `[STORY-DB]` `src/models/story-messages.ts:170-187`
(`upsertStoryMessage`). Seeded from `db/data/messages.csv`
(`db/seeds/06-story-admin.ts:658`), with `sender_character_id` resolved
from a full-name string to a `person.id` via an in-memory name map built
before the insert (`db/seeds/06-story-admin.ts:507-525`).

---

## `story_person_events`, `story_artifact_events`, `story_event_plots`, `story_person_plots`, `story_artifact_plots`, `story_person_messages`, `story_plot_messages`, `story_event_messages`

**Defined in:** `db/migrations/20240103185349_add-story-admin-tables.ts:26-127`
(the event/plot link tables) and
`db/migrations/20240109184905_add-story-admin-messages.ts:29-75`
(the message link tables).

**Purpose:** `[STORY-DB]` Pure many-to-many join tables wiring persons,
artifacts, events, plots and messages together for the story tool. Every
one of them is `(foreign_id, foreign_id)` composite PK, both columns FK
with `ON DELETE CASCADE`, no extra columns, no timestamps.

| Table | Columns (both FK, composite PK) |
|---|---|
| story_person_events | person_id -> person.id, event_id -> story_events.id |
| story_artifact_events | artifact_id -> artifact.id, event_id -> story_events.id |
| story_event_plots | event_id -> story_events.id, plot_id -> story_plots.id |
| story_person_plots | person_id -> person.id, plot_id -> story_plots.id |
| story_artifact_plots | artifact_id -> artifact.id, plot_id -> story_plots.id |
| story_person_messages | person_id -> person.id, message_id -> story_messages.id |
| story_plot_messages | plot_id -> story_plots.id, message_id -> story_messages.id |
| story_event_messages | event_id -> story_events.id, message_id -> story_messages.id |

**SQLite portability:** PORTABLE.

**Written by:** `[STORY-DB]` Rewritten wholesale (delete all rows for the
parent, then bulk insert) inside `upsertStoryEvent`
(`src/models/story-events.ts:186-200`), `upsertStoryPlot`
(`src/models/story-plots.ts:185-199`) and `upsertStoryMessage`
(`src/models/story-messages.ts:174-185`). Seeded from the `*_ids`
comma-separated columns of `events.csv`/`plots.csv`/`messages.csv`
(`db/seeds/06-story-admin.ts:542-613`).

---

## `story_person_relations`

**Defined in:** `db/migrations/20240109191454_add-story-admin-relations.ts:4-19`.

**Purpose:** `[STORY-DB]` A free-text relation between two persons, used
by the story admin tool (separate from the gameplay `person_family`
table).

**Columns:** `id` serial PK, `first_person_id` varchar FK -> `person.id`
ON DELETE CASCADE, `second_person_id` varchar FK -> `person.id` ON
DELETE CASCADE, `relation` text. No timestamps.

**SQLite portability:** PORTABLE.

**Written by:** `[STORY-DB]` Only seeded/reset, from
`db/data/relations.csv` (`db/seeds/06-story-admin.ts:615-629,641,659`,
with an explicit `ALTER SEQUENCE ... RESTART WITH 1` `[PG]`). Never
inserted into from an HTTP route - `src/routes/story-admin.ts` only reads
relations via `getStoryPersonDetails`
(`src/models/story-person.ts:94-142`).

---

## Views

### `starmap_object_star`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:72`,
recreated identically in
`db/migrations/20190305184226_starmap-updates.js:6`.

`CREATE VIEW starmap_object_star AS SELECT * FROM starmap_object WHERE
celestial_body = 'star'`. `[GIS]` (selects the geometry column
untouched). Not queried anywhere in `src/` (grep found no matches) -
consumed externally, presumably by a map-tile server (Geoserver/WMS), the
same tooling referenced by the "styled differently on geoserver" comment
in `db/migrations/20190608124755_starmap-signal.js:11`.

### `starmap_object_visible`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:75-86`,
recreated identically in
`db/migrations/20190305184226_starmap-updates.js:9-20`.

Non-star objects located inside the union of every grid cell that has a
`grid_action` row (visited/scanned). Uses `ST_Within`, `ST_Union`,
`ARRAY(...)`. `[GIS]`. Not queried anywhere in `src/`.

### `starmap_fleet`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:89-98`.
Rewritten repeatedly:
`db/migrations/20190526090936_ship-updates.js:14-23` (added `ships`
jsonb array via `json_agg`, dropped cargo/research counts, switched type
strings from uppercase to title case),
`db/migrations/20190530150943_starmap-visible-ships.js:3-12` (added
`is_visible = TRUE` filter),
`db/migrations/20190608124755_starmap-signal.js:39-48` (final version:
added `status = 'Present and accounted for'` filter).

One row per distinct ship position (`the_geom`), with `has_odysseus`,
`count_military`, `count_civilian` and a `jsonb` array of ship names at
that position, restricted to visible, present-and-accounted-for ships.
`[GIS]` `[PG]` (`json_agg`, `::jsonb` cast). Not queried anywhere in
`src/` - external map consumer only.

### `starmap_jump_range`

**Defined in:** `db/migrations/20181219174555_starmap-objects.js:101-111`.
Recreated (only to survive the `ship.metadata` jsonb type change, SQL
unchanged) in `db/migrations/20230309190627_json-to-jsonb.js:2-12`.

Computes a buffer polygon around Odysseus's current grid using
`ST_Buffer`, `ST_Perimeter`, and `metadata->>'jump_range'` cast to float.
`[GIS]` `[PG]` (`->>` jsonb operator). Not queried anywhere in `src/`.

### `starmap_grid_info`

**Defined in:** `db/migrations/20190305184226_starmap-updates.js:36-55`.
Rewritten in `db/migrations/20190311175110_starmap-grid-info-fix.js:2-21`
(added `LIMIT 1` to the `is_discovered` subquery to avoid a
multiple-rows error), `db/migrations/20190608124755_starmap-signal.js:13-35`
(added `has_beacon`), `db/migrations/20190622221132_fix-grid-scan.js:2-25`
(final version: switched the object-count subqueries from
`starmap_object_visible` to plain `starmap_object`, so counts are no
longer restricted to visited/scanned space).

Per-grid-cell counts of planets/comets/natural satellites/asteroids
(via `ST_Contains`), plus `is_discovered` (any SCAN/JUMP grid_action) and
`has_beacon` (any active `starmap_beacon`). `[GIS]`. Not queried anywhere
in `src/` - external map consumer only.

### `starmap_grid_alert`

**Defined in:** `db/migrations/20190623162550_starmap-alerting-grid.js:2-8`.

Grids that currently have an active beacon:
`SELECT grid.id, grid.name, grid.the_geom FROM starmap_beacon JOIN grid
... WHERE is_active = TRUE`. `[GIS]`. Not queried anywhere in `src/`.

---

## Table groups

**Ship / starmap / GIS:** `grid`, `ship`, `grid_action`, `starmap_beacon`,
`starmap_bg`, `starmap_object`, plus every view in the Views section.

**Personnel:** `person`, `person_family`, `person_entry`, `medical_entry`
`[DEAD]`, `person_ship` `[DEAD]`, `person_blood_test_result`, `group`,
`person_group`.

**Social:** `post`, `com_channel`, `com_channel_event` `[DEAD]`,
`com_message`, `vote`, `vote_option`, `vote_entry`, `ship_log`,
`audit_log`.

**Boxes + tasks (mostly dead; real state lives in `store`):** `box`
`[DEAD]`, `task` `[DEAD]`, `task_requirement` (dropped, gone).

**Science / artifacts:** `artifact`, `artifact_entry`, `tag`,
`operation_result`.

**Infoboard:** `infoboard_entry`, `infoboard_priority`.

**Comms / SIP:** `sip_contact`.

**Story `[STORY-DB]`:** `story_events`, `story_plots`, `story_messages`,
`story_person_relations`, and all 8 story link tables.

**Redux store:** `store`.

**Misc:** `knex_migrations`/`knex_migrations_lock` (Knex's own bookkeeping
tables, not documented above - out of scope, no application code touches
them).

---

## PostGIS dependency map

Everything below needs the `postgis` extension
(`db/migrations/20180826172852_initial.js:3`, `CREATE EXTENSION IF NOT
EXISTS postgis`) and would have to stay on PostgreSQL if the rest of the
database moved to SQLite.

**Tables with a geometry column:**

| Table | Column | Type |
|---|---|---|
| grid | the_geom | geometry(Geometry,3857) |
| ship | the_geom | geometry(Geometry,3857) |
| starmap_bg | the_geom | geometry(Geometry,3857) |
| starmap_object | the_geom | geometry(Geometry,3857) |

**GIST indexes:** `geo_index` on the original `grid` (dropped),
`ship_geoindex`, `starmap_bg_geoindex`, `starmap_object_geoindex`
(all created in `db/migrations/20181219174555_starmap-objects.js:114-116`).

**Views that require PostGIS:** `starmap_object_star`,
`starmap_object_visible` (`ST_Within`, `ST_Union`), `starmap_fleet`
(reads `the_geom` for grouping, no ST_* calls but depends on the geometry
column), `starmap_jump_range` (`ST_Buffer`, `ST_Perimeter`),
`starmap_grid_info` (`ST_Contains`), `starmap_grid_alert` (reads
`the_geom`, no ST_* call). Full list and definitions in the Views section
above.

**Every `ST_*` call site in `src/`:**

| Call | File:line |
|---|---|
| `ST_Translate(ST_Centroid(...))` | `src/models/ship.js:38` (`Grid.getRandomJumpTarget`) |
| `ST_WITHIN(...)` | `src/models/ship.js:44` (`Grid.containsObject`) |
| `ST_AsGeoJSON(ship.the_geom)::jsonb` | `src/models/ship.js:118` (`getColumns`, adds a `geom` field to ship fetches for the frontend map) |

No other `ST_*` calls exist in `src/` (confirmed by
`grep -rn "ST_" src/`). All other `ST_*` usage is inside the migration
files that create the views.

**What would have to stay on PostgreSQL if the rest moved to SQLite:**
`grid`, `ship`'s geometry column and position-related methods, `starmap_bg`,
`starmap_object`, and all 6 views. In practice `ship` has both portable
columns (id, name, status, metadata...) and one PostGIS column
(`the_geom`); a split would mean either keeping all of `ship` on Postgres,
or splitting `the_geom` into a separate `ship_position` table that stays
on Postgres while the rest of `ship` moves. The starmap views are not
read by the Node application at all (see each view's entry above) - they
exist purely for an external GIS/map-tile consumer, which simplifies a
migration: the app-facing code only needs `src/models/ship.js:38,44,118`
rewritten, not the views themselves, unless that external consumer must
be preserved too.

---

## PostgreSQL-only feature inventory

| Feature | Where | SQLite alternative |
|---|---|---|
| PostGIS geometry + `ST_*` functions | `grid`, `ship`, `starmap_bg`, `starmap_object`, 6 views, `src/models/ship.js:38,44,118` | None built-in. Keep this slice on PostgreSQL, or use SpatiaLite (a large, separate effort). |
| `jsonb` columns | `box.value`, `ship.metadata`, `ship_log.metadata`, `com_channel_event.metadata`, `event.metadata`, `operation_result.metadata`, `store.data`, `tag.metadata`, `audit_log.metadata`, `infoboard_entry.metadata` (all converted in `db/migrations/20230309190627_json-to-jsonb.js`) | `TEXT` column + SQLite JSON1 functions (`json_extract`, `json_set`, etc.) |
| `jsonb` operators (`->>`, `::jsonb` cast, `json_agg`) | `starmap_jump_range` view, `starmap_fleet` view | JSON1 `json_extract`; no direct equivalent to `json_agg` aggregate, needs `json_group_array` |
| `text[]` / `varchar(255)[]` native arrays | `task.systems` (`db/migrations/20180920221859_boxes-and-tasks.js:17`), `vote.allowed_groups` (removed later) | JSON-encoded TEXT column |
| `numeric(35,0)` arbitrary precision | `starmap_object.mass` (`db/migrations/20181219174555_starmap-objects.js:38`) | TEXT (exact) or REAL (lossy, SQLite has no arbitrary-precision numeric) |
| Sequences / `setval` / `ALTER SEQUENCE ... RESTART` | `db/seeds/04-science-engi-medical.ts:360`, `db/seeds/06-story-admin.ts:645,674-676` | `sqlite_sequence` table manipulation, or avoid by using `INSERT ... RETURNING` patterns and never hand-picking IDs |
| `CREATE VIEW` | 6 starmap views (see Views section) | SQLite supports views natively; only the PostGIS-dependent ones are blocked |
| `now()` / `knex.fn.now()` defaults on timestamps | Every `hasTimestamps: true` table | `CURRENT_TIMESTAMP` in SQLite, equivalent |
| `RETURNING` clause | `src/models/story-events.ts:184` etc. (`.returning('id')`), Knex/Bookshelf `.save()` internals | SQLite >= 3.35 supports `RETURNING` natively |
| `t.enum()` without `useNative` | `post.status`, `vote.status` | Actually a CHECK constraint under the hood already, portable as-is |
| `knex.raw('CREATE EXTENSION ...')`, `USING GIST` index syntax | `db/migrations/20180826172852_initial.js:3,11`, `db/migrations/20181219174555_starmap-objects.js:114-116` | N/A, PostGIS-only |
| `ALTER COLUMN ... TYPE ... USING ...` cast | `db/migrations/20181117183256_box-id-to-string.js:2`, `20230309190627_json-to-jsonb.js:19-27` | SQLite has very limited `ALTER TABLE`; column type changes typically require a rebuild (`CREATE TABLE new; INSERT ... SELECT; DROP; RENAME`) |

---

## Views and generated data

See the "Views" section above for full SQL history and current
definitions of: `starmap_object_star`, `starmap_object_visible`,
`starmap_fleet`, `starmap_jump_range`, `starmap_grid_info`,
`starmap_grid_alert`. None of the six views are read by any code in
`src/` - they exist for an external GIS/map consumer (Geoserver-style
tooling implied by `db/migrations/20190608124755_starmap-signal.js:11`).
A rewrite that only needs to serve the Node application's own API
surface can drop all six views; a rewrite that must keep serving the map
renderer needs to keep PostgreSQL (or reimplement the equivalent queries
in the map server itself).

No other generated/computed data (no triggers, no materialized views, no
stored procedures) exist anywhere in `db/migrations/`.

---

## Seed data

Seeds run in filename order (Knex convention): `01-starmap-and-fleet.js`,
`02-personnel.ts`, `03-social.js`, `04-science-engi-medical.ts`,
`05-infoboard.js`, `06-story-admin.ts`. Every seed is **destructive**: it
deletes existing rows (via `.del()` or `DELETE`/`TRUNCATE`-equivalent raw
SQL) before inserting, so re-running a seed always resets that slice of
data. None are purely additive/idempotent-on-conflict except the
story-admin upsert *functions* used at runtime (`onConflict('id').merge()`
in `src/models/story-events.ts:184` etc.) - the seed script itself still
deletes-then-inserts.

**`01-starmap-and-fleet.js`:** Deletes `event`, `ship`, `starmap_beacon`,
`grid`, `starmap_object`, `starmap_bg` (`db/seeds/01-starmap-and-fleet.js:77-82`),
nulls out `person.ship_id` and clears `audit_log` first
(`:72-75`, because `person`/`audit_log` FK into `ship`/`person`). Loads
`starmap_bg`/`starmap_object`/`ship` via Postgres `COPY ... FROM
'/fixtures/*.csv'` `[PG]` (`:117-118,121`), which requires those CSVs to
be present on the database server's filesystem - that is why
`db/Dockerfile:10` bakes them into the image. Falls back to a
`seedServer` path using `psql` + shell scripts
(`db/seeds/01-starmap-and-fleet.js:127-142`) if the local `COPY` fails
(e.g. seeding a managed/remote Postgres without local file access) `[PG]`.
Loads `grid` from `db/data/grid.csv` through plain JS inserts
(`:8-20,85-86`), not `COPY`. Hardcodes 22 pre-discovered grid IDs
(`:24-46`), Odysseus ship metadata (`:55-68`) and 7 beacons
(`:100-108`).

**`02-personnel.ts`:** Deletes `person_blood_test_result`,
`artifact_entry`, `operation_result`, `sip_contact`, `person_group`,
`person_entry`, `person_family`, `person`, `group`
(`db/seeds/02-personnel.ts:245-254`, in FK-safe order). Parses
`db/data/survivors.csv` and `db/data/characters.csv` through
`src/utils/person-parser.ts` (`parseData`), which also derives
`person_family`, `person_entry` and `person_group` rows from the wide
"1_name/1_relationship...18_name/18_relationship",
"personal_file/medical_records/military_service_history", and
"role:*/skill:*" columns of `characters.csv`. Inserts persons in chunks
of 500/100 to stay under PostgreSQL's per-statement parameter limit
`[PG]` (`db/seeds/02-personnel.ts:266-272`). Also seeds 23 fixed
`sip_contact` rows and loads `person_blood_test_result` from
`db/data/blood-test-results.csv`.

**`03-social.js`:** Deletes `ship_log`, `com_message`, `com_channel`,
`post`, `vote_entry`, `vote_option`, `vote` (`db/seeds/03-social.js:37-43`).
Inserts 2 fixed posts, 3 fixed channels, 1 fixed log entry.

**`04-science-engi-medical.ts`:** Deletes `artifact_entry`, `artifact`,
`tag` (`db/seeds/04-science-engi-medical.ts:45-47`). Loads
`db/data/artifacts.csv`, splitting the "entry" column off into
`artifact_entry` rows, and `db/data/tags.csv`. Manually resets the
`artifact` PK sequence afterwards (`:51`) since IDs are assigned
client-side (`i + 1`) rather than left to the database `[PG]`.

**`05-infoboard.js`:** Deletes and reinserts `infoboard_entry` (1 row)
and `infoboard_priority` (1 row).

**`06-story-admin.ts`:** Deletes all 8 story link tables, then
`story_person_relations`, `story_messages`, `story_events`,
`story_plots`, in FK-safe order, and resets the
`story_person_relations` sequence to 1 (`db/seeds/06-story-admin.ts:632-645`)
`[PG]`. Loads `person` rows into an in-memory `Map` first
(`:507-516`) so that CSVs referring to people by full name
(`plots.csv`, `events.csv`, `messages.csv`, `relations.csv`) can be
resolved to `person.id`. Validates every CSV row against a Zod schema
before inserting (`:16-79`). Resets the `story_plots`/`story_events`/
`story_messages` sequences to `max(id) + 1` at the end
(`:671-676`) `[PG]`, because IDs come from the CSV, not the database.

**`db/data/gene-samples/`** is not loaded into the database at all. It is
a standalone shell script (`convert.sh`) that hashes person IDs to
produce PDF filenames served as static files under `/gene-samples/`,
referenced from `src/utils/medical-test-results.ts:3`.

---

## Schema smells

- **`[DEAD]` `box` / `task` tables.** Defined, migrated, modeled
  (`src/models/box.js`, `src/models/task.js`) but never used by any route
  or rule. The identically-named runtime concepts (`data.box.*`,
  `data.task.*`) actually live in the `store` table via the Redux
  persistence layer. Confusingly similar names, completely different
  storage. See `box` and `task` entries above for evidence.
- **`[DEAD]` `person_ship` table.** Superseded by `person.ship_id`,
  never referenced anywhere in `src/`. See `person_ship` entry above.
- **`[DEAD]` `medical_entry` table.** Orphaned after its join table
  (`person_medical_entry`) was dropped in
  `db/migrations/20190526104729_person-updates.js:27`. See `medical_entry`
  entry above.
- **`[DEAD]` `com_channel_event` table.** Modeled
  (`src/models/communications.js:83-86`) but never instantiated anywhere.
- **`[BUG]` `artifact_entry.artifact_id` references `person.id` instead
  of `artifact.id`.** Works today only because of coincidental ID-range
  overlap between the two tables. See `artifact_entry` entry above.
- **No primary key on `infoboard_priority`.** Table is used as a
  singleton by convention only; nothing in the schema prevents a second
  row.
- **No timestamps on `grid`, `story_events`, `story_plots`,
  `story_messages`, `story_person_relations`, and all 8 story link
  tables**, while every other table in the schema has
  `created_at`/`updated_at`. Inconsistent, and for `grid` it directly
  contradicts the `Grid` Bookshelf model's `hasTimestamps: true`
  (`src/models/ship.js:24-27`) - see the `[BUG]` note in the `grid` entry.
- **Foreign keys to non-primary-key columns.** `operation_result.bio_id`
  -> `person.bio_id` and `operation_result.catalog_id` ->
  `artifact.catalog_id` both target unique-but-not-primary columns
  (`db/migrations/20190611170541_tags-and-operations.js:17-18`). Valid in
  Postgres, but unusual, and a rewrite should double check SQLite's FK
  support for this pattern when those columns are declared `UNIQUE`.
- **Inconsistent status/state modeling.** `status` columns are free-text
  strings in most tables (`person.status`, `ship.status`,
  `event.status`) but a CHECK-constrained pseudo-enum in `vote.status`
  and `post.status`. No single convention across the schema.
- **`starmap_object.is_scanned`** exists but no code in `src/` was found
  that ever sets it to `true` after creation - possibly a dead write path
  that was superseded by the `grid_action`-based "visited/scanned"
  tracking used by the (also apparently unread) `starmap_object_visible`
  view.
- **Duplicate discovery/visibility tracking.** `starmap_object.is_scanned`,
  `grid_action` rows, and `starmap_object_visible`/`starmap_grid_info`
  views all appear to model overlapping "has this been discovered"
  concepts, using two different mechanisms (a boolean column vs. an
  event/action-log table) without an obvious single source of truth.
- **Case-drift in `ship.type` values across view history.** Early
  `starmap_fleet` view versions matched `type = 'MILITARY'` (uppercase,
  `db/migrations/20181219174555_starmap-objects.js:93-96`); later versions
  match `'Military'`/`'Civilian'` (title case,
  `db/migrations/20190526090936_ship-updates.js:18-20`) matching current
  seed data (`db/data/ship.csv` uses "Civilian"). No CHECK constraint
  enforces a fixed vocabulary for `ship.type` at any point.
