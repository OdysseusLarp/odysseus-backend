# API consumers

This document lists every client that calls the Odysseus backend API. It
covers all 12 sibling repositories under `/Users/nicou/git/`. Use it to find
which endpoints and socket events a rewrite must keep working.

Method: each repo was read for its README, its package manifest, its backend
URL configuration, and every HTTP and socket.io call site. Paths built from
template literals or variables are resolved to their concrete form where
possible. Paths that stay dynamic at runtime are marked "Unresolved" or
explained in the notes.

Tags used below follow `docs/rewrite/CONVENTIONS.md`: `[STORY-DB]`, `[DEAD]`,
`[BUG]`.

## Summary

Nine of the twelve repos call the backend over HTTP, socket.io, or both.
`odysseus-server-configs` is deployment configuration, not application code,
but it confirms which apps are actually deployed and how the reverse proxy
and socket.io upgrade path work. `odysseus-geoserver` never calls the
backend's HTTP API; it reads the same Postgres/PostGIS database directly.
`odysseus-hackbar` is an unfinished stub with no network code at all, and
`odysseus-story-llm-tools` is an offline LLM prototyping tool with zero
backend calls. Exactly one repo, `odysseus-admin-story-tool`, depends on the
`/story/*` Story DB routes.

| Repo | What it is | Tech stack | Talks to backend | Criticality |
|---|---|---|---|---|
| odysseus-admin | GM (game master) admin UI | Vue 2, Vuex, TypeScript, axios, socket.io-client v2 | REST + socket.io (`/data`) | Critical — main control plane for a live game |
| odysseus-admin-story-tool | Story DB admin UI for GM/story staff | React 17, SWR, `fetch` | REST only | Critical for story staff; entirely `/story/*` |
| odysseus-data-hub | Player-facing "Social Hub" (news, personnel, voting, map, messaging, phone) | Angular 7, socket.io-client v2, jsSIP, OpenLayers | REST + socket.io (`/`, `/data`, `/messaging`) | Critical — main player-facing app |
| odysseus-hackbar | Unfinished hacking-minigame prop UI | Plain HTML/CSS/JS, no dependencies | None | Not yet coupled to the backend |
| odysseus-HANSCA | Hand-scanner prop app for Engineers/Scientists/Medics | Vue 2, Vuex, vue-onsenui, axios, Web NFC | REST only, polling (no socket.io) | Critical — used constantly by in-game staff |
| odysseus-jump-ui | Bridge console for jump drive, starmap, ship log | Angular 7, socket.io-client v2, OpenLayers, generated OpenAPI client | REST + socket.io (`/`, `/data`) + direct GeoServer WMS | Critical — bridge crew tool |
| odysseus-mct | Engineering telemetry dashboard | NASA Open MCT fork, socket.io-client v2 | REST + socket.io (`/data`) | Critical — engineering crew tool |
| odysseus-misc-ui | Kiosk screens: airlock, task list/details/map, infoboard, NFC power source, starfield, fighter status | Vue 2, Vuex, axios, socket.io-client v2 | REST + socket.io (`/data`) | Critical — several physical prop screens |
| odysseus-python | Physical task-box controllers and the jump-reactor console | Python, `requests`, `python-socketio` v4 | REST + socket.io (`/data`) | Critical — physical hardware props |
| odysseus-geoserver | GeoServer config serving starmap WMS/WFS layers | GeoServer 2.15 (Java), PostGIS | None (reads shared Postgres directly) | Critical for the map, but coupled at the database, not the API |
| odysseus-server-configs | nginx/docker-compose deployment configuration | nginx, Docker, bash | None (it IS the reverse proxy) | Confirms deployment topology, not an API consumer itself |
| odysseus-story-llm-tools | Offline LLM tool for character-sheet search/summarization | Python, LangChain, ChromaDB, OpenAI | None | No coupling to the backend |

## Per-repository detail

### odysseus-admin

**What it is:** A Vue 2 SPA for the game master (GM) to manage game state
during a live event: ship data, jump drive, fleet, personnel, ship log,
infoboard, operations/science samples, EmptyEpsilon integration, airlocks,
and DMX events.

**Tech stack:** Vue 2.7 (TypeScript, class components), Vuex 3 with
vuex-persist, Vue Router 3, Bootstrap-Vue, axios 1.5, socket.io-client 2.2.
Deployed under the `/adminui/` path.

**Backend base URL config:**
- `src/store.ts:13` — default: `http://localhost:8888` on `localhost`,
  otherwise `window.location.origin` (same-origin deploy).
- Overridable at runtime through a "Choose backend URI" modal,
  `src/components/BackendChooser.vue:1-88`, persisted in Vuex
  (`src/store.ts:22-27`, includes optional basic-auth credentials and an
  `autoRefresh` poll interval, default 15s).
- `src/plugins/axios.js:62-83` sets `axios.defaults.baseURL`/`auth` whenever
  the Vuex backend state changes.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/data` | `src/store/DataBlobSync.ts:9` | Initial full data-blob fetch |
| GET | `/data/ship/jump` | `src/App.vue:108` | Status overview poll |
| GET | `/data/ship/metadata` | `src/App.vue:109` | Status overview poll |
| GET | `/data/ship/ee_metadata` | `src/App.vue:110` | Status overview poll |
| GET | `/operation` | `src/App.vue:111` | Status overview poll |
| GET | `/post?status=PENDING` | `src/App.vue:112` | Status overview poll |
| GET | `/vote?status=PENDING` | `src/App.vue:113` | Status overview poll |
| GET | `/messaging/unread` | `src/App.vue:114` | Status overview poll |
| GET | `/operation?relations=true&include_complete=true` | `src/components/Operations.vue:361` | |
| PUT | `/operation/:id` | `src/components/Operations.vue:397` | Can only set complete, not incomplete |
| GET | `/tag` | `src/components/Operations.vue:385` | |
| PUT | `/tag` | `src/components/Operations.vue:321` | Create/update |
| DELETE | `/tag/:id` | `src/components/Operations.vue:305` | |
| GET | `/fleet?show_hidden=true` | `src/components/Fleet.vue:451-453` | |
| GET | `/fleet/odysseus` | `src/views/JumpDrive.vue:572-574` | Hardcoded fleet id `odysseus` |
| POST | `/fleet/odysseus/jump/validate?validate_distance=false` | `src/components/Fleet.vue:386` | |
| POST | `/fleet/move` | `src/components/Fleet.vue:402` | Body `{shipIds, jumpTarget}` |
| POST | `/fleet/:id/destroy` | `src/components/Fleet.vue:423` | Fired once per selected ship |
| PATCH | `/fleet/odysseus/metadata` | `src/components/Fleet.vue:448` | Body `{key_path, value}` |
| PUT | `/fleet/set-visible` | `src/components/Fleet.vue:502` | `[BUG]` axios config object sent as body, not as config |
| GET | `/person` | `src/components/Social.vue:373` | Search |
| GET | `/person/:id` | `src/components/Social.vue:412` | |
| GET | `/person/bio/:id` | `src/components/Social.vue:429` | |
| PUT | `/person/:id` | `src/components/Social.vue:549` | |
| PUT | `/person/:id/group/:groupId` | `src/components/Social.vue:573` | |
| DELETE | `/person/:id/group/:groupId` | `src/components/Social.vue:574` | |
| PUT | `/person/:id/kill` | `src/components/Social.vue:654` | |
| PUT | `/person/set-visible` | `src/components/Fleet.vue:517` | `[BUG]` same config-as-body issue |
| GET | `/science/artifact/catalog/:id` | `src/components/Social.vue:450` | |
| PUT | `/science/artifact` | `src/components/Social.vue:558` | Path written with trailing slash |
| GET | `/infoboard` | `src/components/Infoboard.vue:277` | |
| PUT | `/infoboard` or `/infoboard/:id` | `src/components/Infoboard.vue:226-229` | Id-conditional |
| DELETE | `/infoboard/:id` | `src/components/Infoboard.vue:238` | |
| PUT | `/infoboard/priority` | `src/components/Infoboard.vue:246` | Body `{priority}` |
| PUT | `/post` | `src/components/Infoboard.vue:263` | Body `{id, show_on_infoboard}` |
| GET | `/post` | `src/components/Infoboard.vue:290` | Filters `type === "NEWS"`, takes first 5 |
| GET | `/log` | `src/components/ShipLog.vue:212` | |
| PUT | `/log` | `src/components/ShipLog.vue:181` | Body `{type, message, metadata?}` |
| DELETE | `/log/:id` | `src/components/ShipLog.vue:195` | |
| GET | `/dmx/channels` | `src/components/DmxEvents.vue:59` | |
| POST | `/dmx/event/:channel` | `src/components/DmxEvents.vue:81` | |
| POST | `/dmx/event/JumpEndingSoon` | `src/views/JumpDrive.vue:573` | Hardcoded event name |
| PATCH | `/data/:type/:id?force=true` | `src/components/DataBlobEditor.vue:162-163`, `src/views/JumpDrive.vue:517,546`, `src/components/AirlockControl.vue:90,99,112`, `src/components/EmptyEpsilon.vue:481,499` | Generic data-blob editor; also drives airlocks and EE toggles |
| DELETE | `/data/:type/:id` | `src/components/DataBlobList.vue:120-122` | |
| PUT | `/state` | `src/components/EmptyEpsilon.vue:433,464` | Body `{command, value, target?}`; generic EE state setter |
| POST | `/state/break-task` | `src/components/EmptyEpsilon.vue:367` | Body `{taskId}` |
| POST | `/emptyepsilon/damage-dmx` | `src/components/EmptyEpsilon.vue:446` | Body `{enableDamageDmx}` |
| POST | `/emit/refreshMap` | `src/components/Fleet.vue:529` | `[BUG]` same config-as-body issue |

`pushFullGameState()` (`src/components/EmptyEpsilon.vue:517-576`) does **not**
call `POST /state/full-push`. It instead fires many sequential `PUT /state`
calls with a hardcoded 400ms delay between each. A rewrite must preserve this
choreography, or move this UI onto the bulk endpoint deliberately.

**Socket.io usage:**
- Namespace `/data`, no query filter: `src/store/DataBlobSync.ts:31`
  (`io('${uri}/data', {})`). This joins the root `/data` room, so this client
  receives every data change on the whole server.
- Listens: `dataUpdate` → commits full value (`src/store/DataBlobSync.ts:32`);
  `dataDelete` → deletes blob (`:36`).
- Emits: none.
- `src/components/DmxEvents.vue:41` imports `socket.io-client` but never
  calls it — dead import.

**Other backends it talks to:** None directly. EmptyEpsilon and EOS Datahub
are only referenced through the backend's own REST routes.

**Story DB usage:** None. No `/story/*` calls found.

**Notes:**
- Polls a 7-request status bundle every `autoRefresh` seconds (default 15,
  user-configurable, 0 disables) — `src/App.vue:84-89`.
- `src/store/DataBlobSync.ts:14-23` retries the initial `/data` fetch every
  5s forever on failure.
- Hardcoded values: fleet id `"odysseus"`, DMX event `"JumpEndingSoon"`,
  `SAFE_JUMP_LIMIT`, a landing-pad name map (`EmptyEpsilon.vue:377-395`).
- `src/bigbattery.ts` defines a `BIG_BATTERY_LOCATIONS` enum with no other
  reference found in `src/` — likely dead code.
- Three call sites pass an axios options object as the request body instead
  of as config (`Fleet.vue:502,517,529`) — a working bug in the current
  client, not the backend; keep in mind when comparing old vs. new traffic.

### odysseus-admin-story-tool `[STORY-DB]`

**What it is:** A React admin UI for GM/story staff to browse and edit Story
DB content — events, plots, in-character messages, and story-specific
person/artifact detail. `README.md:1-8` names the Odysseus Backend as a
dependency.

**Tech stack:** Create React App, React 17, React Router 6, SWR, `fetch`,
React-Bootstrap 5. No socket.io-client dependency.

**Backend base URL config:**
- `src/api/index.js:1-3` — `process.env.REACT_APP_ODYSSEUS_API_URL + path`.
- `.env.development:1` → `http://localhost:8888`.
- `.env.production:1` → `https://apps.odysseuslarp.dev`.
- `package.json:34` (`build:live`) → `https://odysseus-server.live.odysseuslarp.dev`.
- `apiGetRequest` (`src/api/index.js:5-9`) never checks `response.ok` — a
  JSON error body flows through as if it were success data.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/story/events/:id` | `src/components/Event.js:29-31` | |
| GET | `/story/events` | `src/components/Events.js:17-19` | Also reused in create/edit modals |
| GET | `/story/messages/:id` | `src/components/Message.js:21-23` | |
| GET | `/story/messages` | `src/components/Messages.js:17-19` | |
| GET | `/story/plots/:id` | `src/components/Plot.js:17-19` | |
| GET | `/story/plots` | `src/components/Plots.js:17-19` | |
| GET | `/story/person/:id` | `src/components/Character.js:31` | Merged with `/person/:id` for the Character detail page |
| GET | `/story/artifact/:id` | `src/components/Artifact.js:24` | Merged with `/science/artifact/:id` for the Artifact detail page |
| POST | `/story/events` | `src/api/events.js:13-19` | Upsert — same endpoint for create and edit |
| POST | `/story/messages` | `src/api/messages.js:22-28` | Upsert |
| POST | `/story/plots` | `src/api/plots.js:13-19` | Upsert |
| GET | `/fleet?show_hidden=true` | `src/components/Fleet.js:17-19`, `Character.js:32` | |
| GET | `/fleet/:id` | `src/components/Ship.js:14-17` | |
| GET | `/science/artifact` | `src/components/Artifacts.js:17-19` and modals | |
| GET | `/science/artifact/:id` | `src/components/Artifact.js:18-21` | |
| PUT | `/science/artifact` | `src/api/artifact.js:9-15` | Body `{id, gm_notes}` |
| GET | `/person?show_hidden=true&is_character=true/false` | `src/components/Characters.js:18-25` and modals | PC/NPC lists |
| GET | `/person/:id` | `src/components/Character.js:30` | |
| GET | `/person/search/:query` | `src/components/Artifact.js:28-30` | Looks up an artifact's discoverer |
| GET | `/person?show_hidden=true&ship_id=:id&title=...` | `src/components/Ship.js:24-27` | Hardcoded title strings `"Grand Admiral of the EOC starfleet"` / `"Star Captain"` to find each ship's captain |
| GET | `/person?show_hidden=true&is_character=false&ship_id=:id` | `src/components/Ship.js:29-32` | Ship's NPC passengers |
| PUT | `/person/:id` | `src/api/character.js:8-14` | Body `{gm_notes}` |
| POST | `/messaging/send/` | `src/api/messages.js:63-69` | One call per receiver, `Promise.all`, no retry |

No DELETE calls exist anywhere in this app — story events, plots, and
messages can only be created and edited, never deleted, from this tool.

**Socket.io usage:** None. No `socket.io-client` dependency and no `io(`
calls anywhere.

**Other backends it talks to:** None found.

**Story DB usage:** This is the Story DB admin front end. It is the only
repo of the twelve that calls `/story/*`. Both the create and edit flows for
events/plots/messages POST to the same `/story/*` route; the backend decides
insert vs. update from the body's `id` field. The Character and Artifact
detail pages fetch a `/story/*` record and a core `/person` or
`/science/artifact` record and merge them client-side — a Story DB split
must keep both reachable from this page, or provide a single combined
endpoint.

**Notes:**
- Hardcoded person id `"20112"` for the Odysseus captain
  (`src/components/Ship.js:42`), and hardcoded person `title` strings to find
  each ship's captain (`Ship.js:25`).
- Message sending fans out one POST per receiver with no rollback if some
  fail after the message was already stored (`src/api/messages.js:33-89`).
- No pagination handling anywhere; every list endpoint is assumed to return
  the full collection in one response.

### odysseus-data-hub

**What it is:** An Angular 7 SPA called "Odysseus Social Hub" internally
(`package.json` name `odysseus-social-hub`; the repo folder is named
`odysseus-data-hub`). It is a player-facing app: news, personnel directory,
voting, fleet map, in-character messaging, ship's log, artifact cataloging,
a VoIP phone, and a "Velian" hacking minigame. It is **not** the "EOS
Datahub" external system the backend integrates with, and does not wrap it —
no MQTT/AMQP reference exists anywhere in this repo. The name is coincidental.

**Tech stack:** Angular 7, RxJS, Angular Material, OpenLayers, socket.io-client
v2, jsSIP. REST client generated at build time from the backend's own
`/api-docs.json`.

**Backend base URL config:**
- `src/environments/environment.ts:8` (dev `http://localhost:8888`),
  `environment.prod.ts:2-4`, `environment.live.ts:2-5` — drives socket.io and
  GeoServer calls.
- `src/app/api/gateway/spec.ts:4` plus `src/environments/spec.prod.ts:4`,
  `spec.live.ts:4` — a **second**, independently maintained host config for
  the generated REST client. `gateway.init()` is never called to reconcile
  the two; `spec.prod.ts:2-4` calls this a hack in a comment.
- No auth: `spec.ts` `securityDefinitions` is empty; no tokens sent on any
  REST call.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/data/metadata/ship` | `state.service.ts:45` | `social_ui_enabled` feature flag gates the whole app |
| GET | `/data/velian/misc` | `state.service.ts:69` | Velian minigame state |
| GET | `/data/tag_uid_to_artifact_catalog_id/misc` | `artifact-create.component.ts:60` | NFC-UID → artifact catalog id lookup table |
| PATCH | `/data/velian/misc` | `velian.component.ts:47` | Body `{version, hackingComplete: true}` |
| GET | `/person` | `personnel.component.ts:49` | Paginated |
| GET | `/person/filters` | `personnel.component.ts:62` | |
| GET | `/person/:id` | `personnel-details.component.ts:56`, `messages.component.ts:76` | |
| GET | `/person/card/:id` | `state.service.ts:78` | Login |
| POST | `/person/:id/entry` | `personnel-details.component.ts:80` | |
| PUT | `/starmap/velian-distress-signal` | `velian.component.ts:73` | |
| GET | `/fleet` | `fleet.component.ts:17` | |
| GET | `/fleet/:id` | `fleet-details.component.ts:18`, `map.component.ts:238` | Hardcodes id `odysseus` |
| GET | `/post` | `captains-log.component.ts:27`, `news.component.ts:33` | `status=APPROVED` |
| PUT | `/post` | `captains-log.component.ts:37`, `news.component.ts:42` | |
| GET | `/vote` | `vote.component.ts` | `status=APPROVED` |
| GET | `/vote/:id` | `vote-details.component.ts:113` | |
| PUT | `/vote/:id/cast` | `vote-details.component.ts:101` | |
| PUT | `/vote/create` | `vote-create.component.ts:127` | |
| GET | `/log` | `ship-log.component.ts:44` | Fixed page size 150 |
| POST | `/log/audit` | `state.service.ts:54` | `{person_id, type: 'LOGOUT'}`, fire-and-forget |
| GET | `/science/artifact` | `artifacts.component.ts:19` | |
| GET | `/science/artifact/:id` | `artifact-details.component.ts:44` | |
| PUT | `/science/artifact` | `artifact-create.component.ts:122` | |
| GET | `/science/artifact/catalog/:id` | `artifact-create.component.ts:83,114` | Scan lookup + duplicate check |
| PUT | `/science/artifact/entry` | `artifact-details.component.ts:53` | |
| GET | `/sip/config` | `sip.service.ts:99` | Fetched once at startup |
| GET | `/sip/contact` | `sip.service.ts:103` | Fetched once at startup |

Generated but unused elsewhere in this app: `/event*`, `/tag*`,
`/infoboard*`, `/operation*`, `/dmx/*`, `/messaging/unread` and
`/messaging/send` (real-time messaging uses the socket namespace below
instead), `/emit/:eventName`, `/metrics`, `/state`, `/state/full-push`, and
all of `/story/*`.

**Socket.io usage:**

| Namespace | Room/query | Listens | Emits | Source |
|---|---|---|---|---|
| `/` (default) | none | `logEntryAdded`, `voteAdded`, `voteUpdated`, `refreshMap` | none | `socket.service.ts:50,61,63-66,72-74` |
| `/data` | `data: '/data/ship/metadata'` | `dataUpdate` → gates the app on `social_ui_enabled` | none | `socket.service.ts:51-54,68-70` |
| `/data` | `data: '/data/ship/jumpstate'` | `dataUpdate` → jump countdown | none | `socket.service.ts:56-59,76-82` |
| `/data` | `data: '/data/misc/velian'` | `dataUpdate` → Velian state, connected lazily | none | `socket.service.ts:102-111` |
| `/messaging` | `query: {id: personId}` | `message`, `userList`, `latestMessages`, `status`, `messagesSeen`, `unseenMessages` | `message`, `searchUsers`, `messagesSeen`, `fetchHistory`, `getUserList` | `messaging.service.ts:96-109,50-73,135-140,167` |

The `/messaging` namespace is **not** in the backend's documented public
surface (`docs/rewrite/route-inventory.md` lists only `/` and `/data`), but
it is real: it is set up server-side in `src/messaging.ts:82-84`
(`io.of('/messaging')`), authenticated by a `handshake.query.id` (person id),
with server events `message`, `userList`, `latestMessages`, `unseenMessages`,
`messagesSeen`, `status` (`src/messaging.ts:116-282`). This is the only
client of the twelve that uses it, and this app has no other way to send or
receive in-character messages in real time.

**Other backends it talks to:**
- GeoServer, direct `HttpClient` calls to `${geoserverUrl}/wms` for
  `GetFeatureInfo` on layers `odysseus:starmap_all`,
  `odysseus:starmap_grid_info`, `odysseus:starmap_bg_star`,
  `odysseus:starmap_grid`, `odysseus:starmap_object`, `odysseus:starmap_fleet`
  (`map.component.ts:42-44,92-97,268-298`).
- A SIP/WebRTC server: `sip.service.ts:142` opens a WebSocket directly to a
  SIP server whose `url`/`realm` come from `GET /sip/config`; media and
  signaling bypass the backend entirely once the config is fetched.

**Story DB usage:** `src/app/api/Storyadmin.ts` has full generated bindings
for `/story/*` but nothing in the app calls them. No live dependency.

**Notes:**
- Undocumented data-blob contracts a rewrite must keep:
  `metadata/ship.social_ui_enabled` (boolean, gates the whole app),
  `misc/velian` (matches `VelianState` interface, `state.service.ts:9-20`,
  includes a `version` field for optimistic concurrency),
  `misc/tag_uid_to_artifact_catalog_id.tagUidToArtifactCatalogId` (an
  uppercased-NFC-UID → catalog-id map).
- No auth tokens anywhere. "Login" is `GET /person/card/:id`, cached in
  `sessionStorage` and replayed on reload.
- `messaging.service.ts:154`: channel messaging "was never fully implemented
  and was not used in 2019 or 2024 runs" — only 1:1 private messages are
  exercised in practice.
- Fixed page size 150 on `/log`.

### odysseus-hackbar

**What it is:** An unfinished front-end stub for a hacking-minigame
progress-bar prop UI. Three files total (`index.html`, `main.js`,
`style.css`), no `package.json`, no README, no `.git`.

**Tech stack:** Plain HTML/CSS/vanilla JS, no dependencies, no build system.

**Backend base URL config:** None found.

**REST endpoints used:** None found.

**Socket.io usage:** None found.

**Other backends it talks to:** None found.

**Story DB usage:** None.

**Notes:** `main.js` is a self-contained countdown timer (`Date.now()`,
`setInterval`) with no network code. `index.html:9-10` has a placeholder
`<div id="app"><h1>App content goes here</h1></div>` — the real
content, presumably where backend integration would land (e.g. to react to
an `eventFinished` or `dataUpdate` signal), is not implemented yet. Nothing
here for a rewrite to preserve, but this repo may simply be mid-development
rather than a final, deployed prop.

### odysseus-HANSCA

**What it is:** "HANSCA" — a hand-scanner prop app for in-game Engineers,
Scientists, and Medics. It scans NFC tags (bio IDs, artifacts, injuries,
engineering objects), records samples, runs XRF/X-ray scans, and plays
mini-games to "repair" ship systems.

**Tech stack:** Vue 2.6, Vuex 3, vue-onsenui, axios, Web NFC (`NDEFReader`).
No socket.io-client dependency.

**Backend base URL config:**
- `src/axios-settings.js:4-13` — `axios.defaults.baseURL = VUE_APP_BACKEND_URL`,
  plus optional basic auth from `VUE_APP_BACKEND_USER`/`VUE_APP_BACKEND_PASS`.
- `.env:2` → `http://localhost:8888`; `.env.production:1` →
  `https://apps.odysseuslarp.dev/`; `.env.live:2` →
  `https://odysseus-server.live.odysseuslarp.dev/`.
- `[DEAD]` `src/store.js:69-166` has a hardcoded, unused Vuex `backend`
  module ("Copy-paste from odysseus-misc-ui") with a plaintext credential
  (`uri: "https://odysseus.nicou.me/"`, `username: "odysseus"`,
  `password: "saunatonttu"`) at `src/store.js:74-78`. No component dispatches
  its actions — evidence: no `dispatch(` or `$store.` reference to it
  anywhere outside `store.js` itself.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/tag/:id` | `src/components/EngineeringScanObject.vue:60`, `MedicalDiagnosis.vue:60`, `ScienceInspectObject.vue:61` | `:id` is the raw scanned NFC string, e.g. `engi:xxx` |
| GET | `/science/artifact/catalog/:id` | `MedicalScanner.vue:145`, `MedicalSample.vue:38`, `ScienceArtifactDetails.vue:123` | |
| GET | `/data/box/bigbattery` | `MedicalScanner.vue:148` | Polled every 5000ms; comment says "No socket.io in HANSCA so let's go with polling" (`MedicalScanner.vue:105`) |
| POST | `/dmx/event/:channel` | `MedicalScanner.vue:198` | Hardcoded channels `163`/`164`, bypassing `/dmx/channels` |
| POST | `/operation` | `MedicalScanner.vue:237`, `MedicalSample.vue:139` | Creates scan/sample records |
| GET | `/operation?include_complete=true&relations=true` | `SampleList.vue:53` | |
| GET | `/person/bio/:id` | `Greeter.vue:66`, `MedicalRecords.vue:90` | Login and medical record lookup; login expects a `groups` array |
| GET | `/data/misc/hansca` | `Greeter.vue:40` | App config blob; only `analyseBaseTime` is read |
| GET | `/data/game/:id` | `GameScanner.vue:120` | Expects `game_config`, `status`, `type`, `config` |
| GET | `/data/game_config/:id` | `GameScanner.vue:126` | Per-role config keyed by group name |
| PATCH | `/data/<game.type>/<game.id>?force=true` | `GameScanner.vue:166,196` | `<type>`/`<id>` come from the server's own game blob (Unresolved to a static string) |
| GET | `/data/misc/flappy_drone/` | `games/FlappyDrone.vue:46` | Trailing slash in this GET, none on the matching PATCH |
| PATCH | `/data/misc/flappy_drone?force=true` | `games/FlappyDrone.js:105` | Body `{amount}` |
| GET | `<config.preCondition>/` | `GameScanner.vue:233` | Fully server-driven path, e.g. `/data/misc/flappy_drone` |

`[DEAD]` `src/store.js:105-166` (`saveDataBlob`, `fetchDataBlob`,
`syncDataBlobs` — `POST/GET /data/:type/:id`, `GET /data/:type`, `GET /data`)
is never dispatched anywhere in the app.

**Socket.io usage:** None. Confirmed by an explicit comment
(`MedicalScanner.vue:105`) and by the absence of `socket.io-client` from
`package.json`. This app polls REST instead.

**Other backends it talks to:** None. "EOC Datahub" and "EVA" appear only as
in-game flavor text, not as separate systems.

**Story DB usage:** None.

**Notes:**
- `getBlob`/`patchBlob` (`src/blob.js`) are generic wrappers over
  `GET`/`PATCH /<type>/<id>?force=true`, with no conflict handling — a
  rewrite must keep exactly this shape or every scanner screen breaks.
- Role gating is entirely client-side, driven by the `groups` array from
  login: `role:medic`, `role:science`, `role:engineer`, `role:admin`,
  `skill:expert`, `skill:master`.
- `analyseBaseTime` (from `/data/misc/hansca`) times a purely cosmetic
  client-side progress bar; it is not enforced server-side.
- `Locator.vue`, `RadiationDetector.vue`, `Scanner.vue`, `ShipDatabase.vue`
  are standalone demo/mock tools with no backend calls — safe to ignore.

### odysseus-jump-ui

**What it is:** "Odysseus Long Range (Lora) Science Voyager (Jump UI)" — a
bridge-simulator screen for the ship's FTL jump drive and starmap/science
console: ship position/status, jump-drive countdown, a GeoServer starmap,
grid/object/fleet detail panels, ship log, jump-coordinate calculation,
beacon decoding, and countdown/message popups.

**Tech stack:** Angular 7, Angular Material, OpenLayers, socket.io-client 2.2.
REST client generated from `/api-docs.json` via `openapi-client`.

**Backend base URL config:** Two independent configs that must be kept in
sync by hand:
1. `src/environments/environment.ts:8` (`http://localhost:8888`),
   `environment.prod.ts:3`, `environment.live.ts:3` — drives socket.io and
   the GeoServer URL.
2. `src/app/api/gateway/spec.ts:4-6` (`host: 'localhost:8888'`), swapped at
   build time via `angular.json:36-39,64-67` for prod/live — drives the
   generated REST client. `gateway.init()` is never called to reconcile it
   with `environment.apiUrl`; `spec.prod.ts:1-2` calls this out as a hack.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/event` | `state.service.ts:189` | |
| PUT | `/event` | `grid-details.component.ts:95-102`, `object-details.component.ts:85-92` | Creates `SCAN_GRID`/`SCAN_OBJECT` events, `ship_id: 'odysseus'` hardcoded |
| GET | `/log` | `state.service.ts:199` | No pagination params sent |
| GET | `/fleet/odysseus` | `state.service.ts:194` | Hardcoded ship id |
| POST | `/fleet/odysseus/jump/validate` | `jump-dialog.component.ts:127-132` | `should_add_log_entries: false` |
| GET | `/data/jump/ship` | `state.service.ts:205` | |
| GET | `/data/metadata/ship` | `state.service.ts:210` | |
| PATCH | `/data/jump/ship` | `jump-dialog.component.ts:69,93,109` | Sends `status`; uses optimistic-concurrency `version` |
| PUT | `/starmap/beacon/decode/:id` | `beacon-dialog.component.ts:41` | `:id` is the 13-character key typed by the user |

Generated but never called in this app: `getEventId`, all of `/data`
(bulk/type-only/delete), all of `/fleet` except the two rows above,
`/starmap/grid`, `/starmap/grid/:id`, `/starmap/velian-distress-signal`,
`/log/audit`, `/person/*`, `/post/*`, `/vote/*`, `/tag/*`, `/operation/*`,
`/infoboard/*`, `/dmx/*`, `/messaging/*`, `/sip/*`, `/state*`,
`/emit/:eventName`, `/metrics`, all of `/story/*`, and `/emptyepsilon/*`.

**Socket.io usage:**
- `/` (default): `io(environment.apiUrl)` (`socketio.service.ts:43`).
  Listens: `eventAdded`, `eventUpdated`, `eventFinished`, `logEntryAdded`,
  `shipUpdated`, `refreshMap` (`:57-65`). Never emits (a generic `emit`
  helper exists at `:96-98` but nothing calls it).
- `/data`, `data: '/data/ship/jump'` (`:44-47`) — jump status.
- `/data`, `data: '/data/ship/jumpstate'` (`:49-52`) — jump cooldown state.
- `/data`, `data: '/data/ship/metadata'` (`:53-56`) — reads
  `jump_ui_enabled`.
- All three `/data` connections listen only for `dataUpdate` (`:90`);
  `dataDelete` is never handled.

**Other backends it talks to:** GeoServer, direct `HttpClient` calls to
`${geoserverUrl}/wms`, both `ImageWMS` layers (`odysseus:starmap_all`,
`odysseus:starmap_grid_info`, `odysseus:starmap_bg_star`,
`odysseus:starmap_grid`, `odysseus:starmap_object`, `odysseus:starmap_fleet`)
and `GetFeatureInfo` on click (`map.component.ts:41,90-95,294-311`). **The
map, starmap, and fleet visualization bypasses the backend's `/starmap` and
`/fleet` REST routes entirely** — it reads spatial data from GeoServer and
only re-queries it when the backend's `refreshMap` socket event fires.
No direct EmptyEpsilon connection found.

**Story DB usage:** `src/app/api/Storyadmin.ts` is generated but never
imported outside itself. No live dependency.

**Notes:**
- Hardcoded ship id `'odysseus'` in three places (`state.service.ts:194`,
  `jump-dialog.component.ts:128`, event creation at
  `grid-details.component.ts:97`, `object-details.component.ts:87`).
- Hardcoded data-blob keys `jump/ship` and `metadata/ship`.
- 409 (stale `version`) on the jump PATCH is surfaced only as a generic
  error, with no retry.
- No auth: `spec.ts` `securityDefinitions` is empty.
- Map feature properties (`count_civilian`, `count_military`, `ships`,
  `nameGenerated`, `nameKnown`, `celestial_body`, `is_discovered`,
  `is_scanned`, ...) come from GeoServer, not the backend REST API — keeping
  them working depends on whatever process keeps GeoServer's tables in sync
  with the backend's database, which is outside this repo.

### odysseus-mct

**What it is:** "Odysseus engineering UI," a live telemetry dashboard built
on NASA's Open MCT framework (a fork, per `package.json`). It renders ship
systems (jump drive, reactor, shields, hull, life support) as an Open MCT
telemetry dictionary.

**Tech stack:** Plain Node/Express static file server + browser JS (no
bundler). `openmct` (custom fork), `socket.io-client` 2.2.

**Backend base URL config:** A plain, hand-edited JS object,
`odysseus/dictionary.js:159-164`:
```js
"backend": {
    "url" : "http://localhost:8888",
    "username": "",
    "password": ""
}
```
CI rewrites this at build time with `sed`
(`.github/workflows/build-and-deploy-backend.yml:27-28`), swapping
`odysseus-server.live.odysseuslarp.dev` for `apps.odysseuslarp.dev`.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `${backend.url}/data/${type}/${id}` | `odysseus/backend-data-source.js:27` | The only HTTP call in the app; `type`/`id` come from each dictionary entry's `source`. Cached client-side for 1000ms per key. Basic-auth header sent if a password is configured. |

Resolved `type`/`id` pairs actually requested, from `odysseus/dictionary.js`:
`ship/jumpstate`, `ship/ee` (for `reactor`, `impulse`, `maneuver`,
`frontshield`, `rearshield`, `missilesystem`, `beamweapons`, `hull`),
`ship/ee_temp` (same type list), `ship/lifesupport`, `box/drifting_value`
("easter egg", `dictionary.js:541-546`). No POST/PUT/DELETE calls exist
anywhere in the repo — this app is read-only against the backend.

**Socket.io usage:**
- `/data` namespace: `io('${backend.url}/data?data=/data/${type}/${id}')`
  (`odysseus/backend-data-source.js:66`), one socket per `type`/`id` pair,
  reference-counted and closed when the last Open MCT subscriber unmounts
  (`:9,63-101`).
- Listens: `dataUpdate` (`:74-82`); `disconnect` clears the cache (`:67-70`).
- No listener for `dataDelete` anywhere — a deleted backend blob just goes
  stale in the UI.
- Emits: none.

**Other backends it talks to:** `odysseus-misc-ui` is embedded as an iframe
inside the Open MCT layout (`odysseus-template.json:665,677,689`,
`http://localhost:8082/#/tasks` etc.) — README says a deploy script replaces
this base URL with the relative `odysseus-misc-ui` path, but no such script
was found in this repo; Unclear where that substitution actually happens.

**Story DB usage:** None.

**Notes:**
- Only two real backend call sites exist: the HTTP GET and the socket
  subscribe, both in `odysseus/backend-data-source.js`.
- All type/id/field mappings live in the static `odysseus/dictionary.js` —
  a rewrite must keep `ship/jumpstate`, `ship/ee`, `ship/ee_temp`,
  `ship/lifesupport`, `box/drifting_value` and their field paths stable, or
  update this file in lockstep.
- `request()` (`odysseus/backend-data-source.js:107-125`) fakes a
  "historical" data point with a fresh GET stamped `Date.now()` only for
  time ranges ending within the last 10 seconds; anything older always
  returns empty. **This app has no real historical telemetry.**
- `realtime-telemetry-plugin.js` and `historical-telemetry-plugin.js`, plus
  the whole `example-server/` mock backend, are leftover Open MCT tutorial
  code, commented out at `index.html:138-139` — `[DEAD]`, not wired to
  anything Odysseus-related.
- 1-second client cache assumes the backend tolerates roughly 1Hz polling
  per telemetry point.

### odysseus-misc-ui

**What it is:** A single Vue 2 app bundling several kiosk/display views:
Airlock, Task List/Details/Map, Infoboard, PowerSource (NFC reader),
Starfield (video screen), Fighterstatus (EmptyEpsilon landing-pad board).
Confirmed by `README.md` and `src/router.js:1-63`. A separate, standalone
static page, `public/artifact-1.html`, is also bundled but is not part of
the Vue router.

**Tech stack:** Vue 2.7, vue-router 3, Vuex 3 with vuex-persist,
bootstrap-vue, axios 1.3, socket.io-client 2.2. `public/artifact-1.html` is
plain HTML/JS with `fetch`, no framework.

**Backend base URL config:**
- `VUE_APP_BACKEND_URI`, read at `src/store.js:18`. `.env:1` →
  `http://localhost:8888`; `.env.prod:1` → `https://apps.odysseuslarp.dev`;
  `.env.live:1` → `https://odysseus-server.live.odysseuslarp.dev`.
- Applied globally at `src/main.js:18`
  (`axios.defaults.baseURL = store.state.backend.uri`); also settable at
  runtime via `src/components/BackendChooser.vue:37-64` (reloads the page).
- `public/artifact-1.html` has its own **hardcoded**, separately-maintained
  base URL, `const API_URL = 'http://localhost:8888'`, unaffected by any env
  var or the in-app backend chooser.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `/data`, `/data/:type`, `/data/:type/:id` | `src/store.js:76-108` | Full/partial sync before/alongside socket updates; retries every 5s forever on failure; reconciles a returned array against local state to synthesize deletes |
| GET | `/data/:type/:id` | `src/store.js:63-74` | Fallback re-fetch after a failed POST |
| POST | `/data/:type/:id` | `src/store.js:49-61` | Optimistic local write, then POST, falls back to GET on failure. Used by TaskListView reorder/toggle |
| PATCH | `/data/box/:boxId?force=true` | `src/views/AirlockView.vue:349` | Body `{command: open\|close\|pressurize\|depressurize\|evacuate}` |
| GET | `/person/bio/:id` | `src/views/PowerSource.vue:86` | 4 parallel NFC scans, all must return `medical_elder_gene === true` |
| GET | `/infoboard/display` | `src/views/InfoboardView.vue:505` | Polled roughly every 10s independent of socket updates |
| PUT | `/science/artifact/use/:artifactKey` | `public/artifact-1.html` | Hardcoded `artifactKey = 'HEALTH_BOOST'`, hardcoded backend URL — **an undocumented, hidden consumer not linked from the app's router** |

**Socket.io usage:** Namespace `/data`, connected as
`io('${uri}/data?data=${path}', {})` (`src/storeSync.js:24`, socket.io-client
v2 query-param style). Each view opens its own connection via
`startDataBlobSync(type, id)`:
- AirlockView: `box/<boxId>`, `ship/jumpstate` (`AirlockView.vue:366-367`)
- InfoboardView: `ship/jump`, `ship/jumpstate`, `ship/metadata`
  (`InfoboardView.vue:295-297`)
- TaskListView: `task` (all), `ship/calibration` (`TaskListView.vue:168-169`)
- Starfield: `ship/jumpstate` (`Starfield.vue:37`)
- Fighterstatus: `ship/jumpstate`, `ship/ee` (`Fighterstatus.vue:170-171`)

Listens: `dataUpdate` → `setDataBlob`, `dataDelete` → `deleteDataBlob`
(`src/storeSync.js:25-32`). Never emits. Each `startDataBlobSync` call opens
a brand-new socket — no sharing across calls.

**Other backends it talks to:** None directly. Fighterstatus reads a
`ship/ee` blob that the backend has already normalized from EmptyEpsilon;
this UI never talks to EmptyEpsilon itself. Landing pad names
(`"ESSODY-F18"`, `"ESSODY-F23"`, `"ESSODY-F36"`, `"ESS Starcaller"`) are
hardcoded (`Fighterstatus.vue:118-129`).

**Story DB usage:** None.

**Notes:**
- `syncDataBlobs` retries every 5s forever with no backoff or cap
  (`src/store.js:105-108`).
- Bulk `GET /data...` responses are diffed client-side to synthesize
  deletes (`src/store.js:89-100`) — the rewrite must keep returning full
  arrays for bulk `/data` fetches, or this breaks.
- TaskDetailsView and TaskMapView read a task selection from `localStorage`
  (key `odysseus.selectedTask`), written by TaskListView — not an API
  contract, but relevant if the deployment relies on cross-window
  communication for a second physical screen.
- `public/artifact-1.html` is easy to miss during an API audit: it is a
  static file in `public/`, not part of the build's route table, with its
  own hardcoded backend URL and artifact key.

### odysseus-python

**What it is:** Physical task-box controllers for the Odysseus LARP, plus a
shared backend client library (`odysseus/`), and a `reactorconsole/`
sub-tool (the jump reactor console) that bridges the same client to local
Raspberry Pi/Arduino logic over ZMQ.

**Tech stack:** Python 3.11, `requests`, `python-socketio==4.1.0` (an old,
Engine.IO v3-era client), `pigpio`, `pyzmq`, `ardubus_core`.

**Backend base URL config:** No hardcoded default anywhere. `TaskBoxRunner`
requires `--url` on the CLI (`odysseus/taskbox.py:334,353-354`). The only
concrete address in the repo is in the launch wrapper:
`reactorconsole/reactorconsole.sh:10` →
`./backendcoms.py --id jump_reactor --url http://192.168.1.2`.

**REST endpoints used:**

| Method | Path | Source | Notes |
|---|---|---|---|
| GET | `{url}/data/box/{id}` | `odysseus/taskbox.py:99` | Polled every `poll_interval` (default 60s). If the body is `{}` and an `initial_state` is configured, immediately POSTs to seed it (`:252-254`) — this "unknown box → `{}`, not 404" contract must be preserved |
| POST | `{url}/data/box/{id}` | `odysseus/taskbox.py:114` | Writes full state. A 409 is treated as a concurrent-modification signal (`:121-122`); any other non-200 raises |

No other backend route is used anywhere in this repo.

**Socket.io usage:** `/data` namespace, room `/data/box/<id>` only, via
`self.sio.connect(url + '?data=/data/box/' + id, namespaces=['/data'], ...)`
(`odysseus/taskbox.py:73-77`). Listens: `dataUpdate` (`:79-84`) — treated
only as a "something changed" signal; the runner always does a fresh GET
afterward to avoid stale-state races (design comment at `:12-23`). Does not
listen for `dataDelete`. Never emits. Basic-auth header is built manually
and passed to `sio.connect(headers=...)` — an old API surface tied to the
pinned `python-socketio==4.1.0`.

**Other backends it talks to:** `pigpio` (local GPIO daemon), ZMQ IPC
(`reactorconsole` only, local process bridge, not network), and an Arduino
over serial via `ardubus_core` — none of these are Odysseus systems.

**Story DB usage:** None.

**Notes:**
- Optimistic concurrency: state responses must include a monotonically
  increasing `version` field; `_wait_until` checks `type`, `id`, and
  `version` before accepting a push-triggered re-poll
  (`odysseus/taskbox.py:291-297`).
- If the backend is unreachable at startup, the script crashes; if
  connectivity is lost after a successful start, the client keeps running
  indefinitely on stale local state (`odysseus/taskbox.py:22-23,263-267`).
- `self.session.verify = False` whenever an HTTP proxy is configured
  (`odysseus/taskbox.py:52`) — disables TLS verification entirely.
- `odysseus/log.py:16-22`'s `error()` docstring claims it logs "locally +
  to the remote server," but the implementation only prints locally —
  `[DEAD]`/never-implemented, no remote error channel actually exists from
  this client.
- `python-socketio==4.1.0` is a very old pin; verify it can still complete a
  handshake against a rewritten socket.io server before assuming
  compatibility.

### odysseus-geoserver

**What it is:** A GeoServer (`kartoza/geoserver:2.15.0`) configuration/data
repository, no application code. `README.md:1-3`: "Geoserver confs to show
starmap. Uses local postgis."

**Tech stack:** GeoServer 2.15 (Java/Tomcat), PostGIS, Docker/ECR.

**Backend base URL config:** Not applicable — this service has no HTTP
client code. It connects directly to the shared Postgres/PostGIS database as
a datastore: `data_dir/workspaces/odysseus/odysseus/datastore.xml` — host
`odysseus-database`, port `5432`, database `postgres`, `dbtype: postgis`,
namespace `odysseus`.

**REST endpoints used:** None. No call to any Odysseus backend HTTP route
exists anywhere in this repo.

**Socket.io usage:** None.

**Other backends it talks to:** The shared Postgres/PostGIS database
(`odysseus-database:5432`) — the same database the backend writes to via
Knex, per `README.md:8-11` (which instructs seeding `starmap_bg` and
`starmap_object` from `odysseus-backend/db/seeds/03-starmap-and-fleet.js`).
`build-and-push-geoserver.sh:5` pushes the built image to AWS ECR — infra
only.

**Story DB usage:** None.

**Notes: direction of data flow.** The backend writes to the shared
Postgres/PostGIS database. GeoServer reads directly from that same database
and serves it as WMS/WFS/GWC layers. There is no HTTP or socket.io traffic
between this repo and the backend in either direction — the coupling is
entirely at the database layer. Feature-type definitions
(`data_dir/workspaces/odysseus/odysseus/*/featuretype.xml`) name these
tables/views, which a rewritten backend must keep populated for the map to
keep working: `starmap_bg`, `starmap_object`, `starmap_object_visible`,
`starmap_fleet`, `grid`, `starmap_jump_range`, `starmap_grid_alert`,
`starmap_grid_info`.

### odysseus-server-configs

**What it is:** The deployment/ops repo for the production server(s):
nginx configs, docker-compose files, and helper scripts.

**Tech stack:** nginx, Docker/docker-compose, AWS ECR, Certbot.

**Backend base URL config:** `home/odysseus/docker-compose.yml:6-14` runs
`odysseus-backend:latest`, container port 8888 bound to
`127.0.0.1:8888:8888`, healthcheck `GET http://127.0.0.1:8888/ping`
(`:25`). `nginx/sites-available/default:10-11` reverse-proxies the whole
public domain root to `http://localhost:8888` with no path rewriting. A
second, parallel setup (`postgame-backends.yml`) runs three more archived
backend containers (`backend-run1/2/3`, ports 9001/9002/9003) for past game
runs, each with its own subdomain
(`astropioneer`/`celestianengineer`/`orbitalexplorer`.odysseuslarp.dev, per
`runs.txt`).

**REST endpoints used:** No per-route rewrites — nginx proxies the entire
path space (`/`) straight through, so every backend REST route is reachable
unchanged at the public domain. One explicit location exists for
`GET /api-docs.json` (`nginx/sites-available/default:38-41`, `auth_basic
off`), repeated per postgame run.

**Socket.io usage:** `nginx/sites-available/default:44-50` proxies
`/socket.io` to `http://localhost:8888/socket.io` with the Upgrade/Connection
headers set for websockets. This single location covers both the default
namespace and `/data` (and `/messaging`) — Engine.IO's transport path is the
same regardless of namespace. No sticky-session config exists; each vhost
proxies to exactly one backend instance.

**Other backends it talks to:**
- GeoServer, proxied at `/geoserver` → `http://localhost:8070/geoserver`
  (`nginx/sites-available/default:90-97`), run as a separate container
  (`odysseus-gs`) outside `docker-compose.yml`.
- Open MCT, proxied at `/mct/` → `http://localhost:8080/`
  (`default:100-102`), run via `home/odysseus/run-openmct.sh`.
- EmptyEpsilon: two instances run directly on the host (not containerized,
  not proxied), per `README.md:161-173`.
- Static client apps served directly by nginx via `alias` — this confirms
  which apps are actually deployed: `/storyadmin` → odysseus-admin-story-tool,
  `/social` → odysseus-data-hub, `/jumpui` → odysseus-jump-ui, `/hansca` →
  odysseus-HANSCA, `/adminui` → odysseus-admin, `/misc` → odysseus-misc-ui
  (`nginx/sites-available/default:52-87`).
- Postgres (`odysseus-database:latest`), `127.0.0.1:5432`
  (`docker-compose.yml:30-52`).

**Story DB usage:** No separate database exists for Story DB data — it is
in the same Postgres instance as everything else. The `/story` route gets
no special nginx handling; it rides the generic catch-all proxy.

**Notes:** Confirms the deployment topology for the whole system: one nginx
front door, TLS via Certbot, fronting the backend (8888), GeoServer (8070),
Open MCT (8080), and Postgres (5432, localhost-only), plus six static
client bundles. `home/odysseus/odysseus/{admin-story,adminui,data,hansca,
jumpui,misc-ui,social}` are placeholder directories matching the nginx
`alias` targets — actual builds are deployed separately. No nginx location
references a `/var/www/odysseus/data` directory, so that placeholder's
purpose is unclear.

### odysseus-story-llm-tools

**What it is:** A small collection of standalone Python scripts using
LangChain + OpenAI to search and summarize static, locally-stored
character-sheet text files. `README.md:3`. Not a service — no server, no
git history, run ad hoc.

**Tech stack:** Python, LangChain, ChromaDB (local, persisted to
`chroma_db/`), OpenAI API. No dependency manifest exists
(`requirements.txt`/`pyproject.toml` are both absent).

**Backend base URL config:** None. The only env var used anywhere is
`OPENAI_API_KEY` (`.env:1`, `.env.example:1`).

**REST endpoints used:** None. An exhaustive grep for every backend route
prefix and for `requests.`/`fetch`/`httpx`/`http://` found zero matches
outside README prose.

**Socket.io usage:** None.

**Other backends it talks to:** OpenAI, via LangChain
(`src/plot-and-relationship-summary/extract-plots.py:14`,
`src/search-from-characters/ask-question.py:23,25`, and others).

**Story DB usage:** None. All "story" data here is local, static markdown
under `docs/characters/` — manually-authored character sheet templates,
embedded into a local Chroma vector store for semantic search. No code path
reads from or writes to the backend's `/story/*` routes.

**Notes:** Zero coupling to the backend. A backend or Story DB rewrite has
nothing to break here. `extract-plots.py` is a stub (imports only, no
executable logic). The checked-in `.env` contains a live-looking OpenAI key
— a secret-hygiene issue, unrelated to this task, flagged for awareness.

## Consolidated endpoint -> consumer matrix

Every route the backend serves (per `docs/rewrite/route-inventory.md`),
with every client repo found to call it.

| Endpoint | Consumers |
|---|---|
| `GET /` | Browser only (redirect to `/api-docs`) |
| `GET /ping` | odysseus-server-configs (docker healthcheck) |
| `GET /metrics` | No client repo found; presumably scraped by a Prometheus server not in these repos |
| `GET /api-docs` | Developers, manually; also feeds the OpenAPI codegen in odysseus-jump-ui and odysseus-data-hub at build time |
| `PUT /state` | odysseus-admin |
| `POST /state/full-push` | No known consumer (see below) |
| `POST /state/break-task` | odysseus-admin |
| `POST /emit/:eventName` | odysseus-admin (`refreshMap`) |
| `POST /emptyepsilon/damage-dmx` | odysseus-admin |
| `GET /emptyepsilon/damage-dmx` | No known consumer |
| `GET /fleet` | odysseus-admin, odysseus-admin-story-tool, odysseus-data-hub |
| `GET /fleet/:id` | odysseus-admin, odysseus-admin-story-tool, odysseus-jump-ui, odysseus-data-hub |
| `PUT /fleet/set-visible` | odysseus-admin |
| `POST /fleet/move` | odysseus-admin |
| `PUT /fleet/:id` | No known consumer |
| `PATCH /fleet/:id/metadata` | odysseus-admin |
| `POST /fleet/:id/jump/validate` | odysseus-admin, odysseus-jump-ui |
| `POST /fleet/:id/destroy` | odysseus-admin |
| `GET /starmap/grid` | No known consumer — starmap data is instead served to clients via GeoServer WMS/WFS |
| `GET /starmap/grid/:id` | No known consumer, same reason |
| `PUT /starmap/beacon/decode/:id` | odysseus-jump-ui |
| `PUT /starmap/velian-distress-signal` | odysseus-data-hub |
| `GET /person` | odysseus-admin, odysseus-admin-story-tool, odysseus-data-hub |
| `GET /person/filters` | odysseus-data-hub |
| `GET /person/groups` | No known consumer |
| `GET /person/:id` | odysseus-admin, odysseus-admin-story-tool, odysseus-data-hub |
| `GET /person/card/:id` | odysseus-data-hub (login) |
| `GET /person/bio/:id` | odysseus-admin, odysseus-misc-ui, odysseus-HANSCA |
| `GET /person/search/:name` | odysseus-admin-story-tool |
| `PUT /person/set-visible` | odysseus-admin |
| `PUT /person/:id` | odysseus-admin, odysseus-admin-story-tool |
| `PUT /person/:id/family` | No known consumer |
| `POST /person/:id/entry` | odysseus-data-hub |
| `PUT /person/:id/kill` | odysseus-admin |
| `PUT /person/:id/group/:groupId` | odysseus-admin |
| `DELETE /person/:id/group/:groupId` | odysseus-admin |
| `GET /event` | odysseus-jump-ui |
| `GET /event/:id` | No known consumer |
| `PUT /event` | odysseus-jump-ui |
| `GET /post` | odysseus-admin, odysseus-data-hub |
| `GET /post/:id` | No known consumer |
| `PUT /post` | odysseus-admin, odysseus-data-hub |
| `GET /vote` | odysseus-admin, odysseus-data-hub |
| `GET /vote/:id` | odysseus-data-hub |
| `PUT /vote/create` | odysseus-data-hub |
| `PUT /vote/:id` | No known consumer (only `/:id/cast` is used) |
| `PUT /vote/:id/cast` | odysseus-data-hub |
| `GET /log` | odysseus-admin, odysseus-jump-ui, odysseus-data-hub |
| `PUT /log` | odysseus-admin |
| `GET /log/audit` | No known consumer |
| `POST /log/audit` | odysseus-data-hub |
| `DELETE /log/:id` | odysseus-admin |
| `GET /science/artifact` | odysseus-admin-story-tool, odysseus-data-hub |
| `GET /science/artifact/catalog/:id` | odysseus-admin, odysseus-data-hub, odysseus-HANSCA |
| `GET /science/artifact/:id` | odysseus-admin-story-tool, odysseus-data-hub |
| `PUT /science/artifact` | odysseus-admin, odysseus-admin-story-tool, odysseus-data-hub |
| `PUT /science/artifact/entry` | odysseus-data-hub |
| `PUT /science/artifact/use/:code` | odysseus-misc-ui (`public/artifact-1.html`, undocumented) |
| `GET /data` | odysseus-admin, odysseus-misc-ui |
| `GET /data/:type` | odysseus-misc-ui (generic sync helper) |
| `GET /data/:type/:id` | odysseus-mct, odysseus-python, odysseus-jump-ui, odysseus-data-hub, odysseus-HANSCA, odysseus-misc-ui |
| `POST /data/:type/:id` | odysseus-python, odysseus-misc-ui |
| `PATCH /data/:type/:id` | odysseus-admin, odysseus-jump-ui, odysseus-data-hub, odysseus-HANSCA, odysseus-misc-ui |
| `DELETE /data/:type/:id` | odysseus-admin |
| `PUT /infoboard/priority` | odysseus-admin |
| `GET /infoboard/display` | odysseus-misc-ui |
| `GET /infoboard/enabled` | No known consumer |
| `GET /infoboard` | odysseus-admin |
| `PUT /infoboard` | odysseus-admin |
| `PUT /infoboard/:id` | odysseus-admin |
| `DELETE /infoboard/:id` | odysseus-admin |
| `GET /dmx/channels` | odysseus-admin |
| `POST /dmx/event/:channel` | odysseus-admin, odysseus-HANSCA |
| `GET /messaging/unread` | odysseus-admin |
| `POST /messaging/send` | odysseus-admin-story-tool |
| `GET /tag` | odysseus-admin |
| `GET /tag/:id` | odysseus-HANSCA |
| `PUT /tag` | odysseus-admin |
| `DELETE /tag/:id` | odysseus-admin |
| `GET /operation` | odysseus-admin, odysseus-HANSCA |
| `GET /operation/:id` | No known consumer |
| `POST /operation` | odysseus-HANSCA |
| `PUT /operation/:id` | odysseus-admin |
| `GET /sip/config` | odysseus-data-hub |
| `GET /sip/contact` | odysseus-data-hub |
| `GET /sip/contact/:id` | No known consumer |
| `PUT /sip/contact` | No known consumer |
| `GET /story/artifact/:id` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/events` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/events/:id` `[STORY-DB]` | odysseus-admin-story-tool |
| `POST /story/events` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/messages` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/messages/:id` `[STORY-DB]` | odysseus-admin-story-tool |
| `POST /story/messages` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/person/:id` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/plots` `[STORY-DB]` | odysseus-admin-story-tool |
| `GET /story/plots/:id` `[STORY-DB]` | odysseus-admin-story-tool |
| `POST /story/plots` `[STORY-DB]` | odysseus-admin-story-tool |

## Backend endpoints with no known consumer

None of these were found called by any of the 12 client repos. This does
not mean they are dead: some may be used by hand through the Swagger UI at
`/api-docs`, by curl during operations, or reserved for a client not
covered here.

- `POST /state/full-push` — the one place a full push would make sense
  (`odysseus-admin`'s "push full game state" button) does **not** call it;
  it fires many individual `PUT /state` calls instead
  (`odysseus-admin/src/components/EmptyEpsilon.vue:517-576`). This is the
  strongest candidate for `[DEAD]` in this list, but confirm with the GM
  team before removing it — it may still be run by hand for a full reset.
- `GET /emptyepsilon/damage-dmx`
- `PUT /fleet/:id` (admin uses `PATCH /:id/metadata` instead)
- `GET /starmap/grid`, `GET /starmap/grid/:id` — starmap data reaches every
  client through GeoServer, not this route. Keep this route only if some
  unlisted consumer (hardware, curl) needs raw JSON grid data.
- `GET /person/groups`
- `PUT /person/:id/family`
- `GET /event/:id`
- `GET /post/:id`
- `PUT /vote/:id` (only `/vote/:id/cast` is used)
- `GET /log/audit`
- `GET /infoboard/enabled`
- `GET /operation/:id`
- `GET /sip/contact/:id`
- `PUT /sip/contact`

## Socket.io contract

| Namespace | Room / query filter | Used by |
|---|---|---|
| `/` (default) | none | odysseus-jump-ui (`eventAdded`, `eventUpdated`, `eventFinished`, `logEntryAdded`, `shipUpdated`, `refreshMap`), odysseus-data-hub (`logEntryAdded`, `voteAdded`, `voteUpdated`, `refreshMap`) |
| `/data` | none (root `/data` room, all types/ids) | odysseus-admin |
| `/data` | `/data/<type>` | odysseus-misc-ui (`task`) |
| `/data` | `/data/<type>/<id>` | odysseus-mct (many, per dictionary entry), odysseus-python (`box/<taskbox id>`), odysseus-jump-ui (`ship/jump`, `ship/jumpstate`, `ship/metadata`), odysseus-data-hub (`ship/metadata`, `ship/jumpstate`, `misc/velian`), odysseus-misc-ui (`box/<boxId>`, `ship/jumpstate`, `ship/jump`, `ship/metadata`, `ship/calibration`, `ship/ee`) |
| `/messaging` | `?id=<personId>` | odysseus-data-hub only |

Server-emitted events on `/data`: `dataUpdate(type, id, data)`,
`dataDelete(type, id)` (`src/store/storeSocket.ts:14,23`). Most clients
handle `dataUpdate`; only odysseus-admin and odysseus-misc-ui also handle
`dataDelete`. odysseus-mct, odysseus-python, and odysseus-jump-ui never
handle `dataDelete` — a deleted blob just goes stale in those UIs.

The `/messaging` namespace is not part of the originally documented
socket.io surface (`docs/rewrite/route-inventory.md` lists only `/` and
`/data`) but is a real, separate namespace set up in
`src/messaging.ts:82-84`. It authenticates by a `handshake.query.id` (person
id) and carries all real-time in-character messaging for
odysseus-data-hub — server events `message`, `userList`, `latestMessages`,
`unseenMessages`, `messagesSeen`, `status` (`src/messaging.ts:116-282`).
A rewrite must keep this namespace, or move odysseus-data-hub onto a
replacement, since REST `/messaging/send` alone does not give this app
real-time delivery.

No client repo emits or listens for a root-namespace event through the
generic `POST /emit/:eventName` mechanism other than odysseus-admin, which
uses it once, to fire `refreshMap` (`odysseus-admin/src/components/Fleet.vue:529`).

## Story DB consumers `[STORY-DB]`

Only one client repo depends on the Story DB:

- **odysseus-admin-story-tool** is the Story DB admin front end. It reads
  and writes `/story/events`, `/story/events/:id`, `/story/messages`,
  `/story/messages/:id`, `/story/plots`, `/story/plots/:id`,
  `/story/person/:id`, and `/story/artifact/:id`. Every list and detail page
  in this app depends on these routes staying available with the same
  response shape. Both create and edit flows POST to the same `/story/*`
  route — the backend decides insert vs. update from whether the request
  body carries an `id`; a separate system taking over Story DB must
  either replicate this upsert-by-body-id behavior or this app's edit
  flow must change.
- The Character and Artifact detail pages in this same app
  (`src/components/Character.js:30-32`, `src/components/Artifact.js:18-24`)
  fetch a `/story/*` record and a core-data record (`/person/:id` or
  `/science/artifact/:id`) and merge them client-side into one page. A
  split Story DB system must keep both halves reachable together — either
  by this client making two calls to two systems, or by a composed view
  from a gateway.

No other repo of the twelve calls any `/story/*` route:
odysseus-admin, odysseus-data-hub, odysseus-jump-ui, and odysseus-data-hub's
generated API client all have unused, generated `/story/*` bindings that no
component ever calls (confirmed by grep for their import in each repo).
odysseus-story-llm-tools, despite its name, never calls the backend's Story
DB at all — it works entirely from local static markdown files and has no
network dependency on the backend. odysseus-geoserver, odysseus-hackbar,
odysseus-HANSCA, odysseus-mct, odysseus-misc-ui, odysseus-python, and
odysseus-server-configs have no Story DB reference of any kind.

This means a Story DB split mainly needs to keep one client working:
odysseus-admin-story-tool. The main risk is not breadth of consumers but
depth of coupling in that one app — the upsert-by-body-id write contract and
the client-side merge of story data with core person/artifact data.
