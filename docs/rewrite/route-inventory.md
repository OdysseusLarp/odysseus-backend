# Complete route inventory

Every HTTP endpoint the backend serves, extracted from the source. Use this as a checklist. The detail for each route is in the API reference documents named in the last column.

Mount points are in `src/index.ts:78-98`.

**Total: 102 endpoints.**

## Root and operational

| Method | Path | Source | Detail in |
|---|---|---|---|
| GET | `/` | `src/index.ts:78` | redirect to `/api-docs` |
| GET | `/ping` | `src/index.ts:193` | health check |
| GET | `/metrics` | `src/index.ts:61` | Prometheus, from middleware |
| GET | `/api-docs` | `src/docs.ts:20` | Swagger UI, generated from JSDoc |
| PUT | `/state` | `src/index.ts:97` | `routes-science-data-misc.md` |
| POST | `/state/full-push` | `src/index.ts:106` | `routes-science-data-misc.md` |
| POST | `/state/break-task` | `src/index.ts:116` | `routes-science-data-misc.md` |
| POST | `/emit/:eventName` | `src/index.ts:149` | `routes-science-data-misc.md` |
| POST | `/emptyepsilon/damage-dmx` | `src/routes/emptyepsilon.ts:96` | `routes-science-data-misc.md` |
| GET | `/emptyepsilon/damage-dmx` | `src/routes/emptyepsilon.ts:97` | `routes-science-data-misc.md` |

## `/fleet` — ships (8)

| Method | Path | Source |
|---|---|---|
| GET | `/fleet` | `src/routes/fleet.js:16` |
| GET | `/fleet/:id` | `src/routes/fleet.js:30` |
| PUT | `/fleet/set-visible` | `src/routes/fleet.js:41` |
| POST | `/fleet/move` | `src/routes/fleet.js:54` |
| PUT | `/fleet/:id` | `src/routes/fleet.js:71` |
| PATCH | `/fleet/:id/metadata` | `src/routes/fleet.js:90` |
| POST | `/fleet/:id/jump/validate` | `src/routes/fleet.js:112` |
| POST | `/fleet/:id/destroy` | `src/routes/fleet.js:125` |

Note: `PUT /fleet/set-visible` is declared before `PUT /fleet/:id`, so the literal path wins. `POST /fleet/move` and `POST /fleet/:id/...` do not collide.

## `/starmap` — grids and beacons (4)

| Method | Path | Source |
|---|---|---|
| GET | `/starmap/grid` | `src/routes/starmap.js:14` |
| GET | `/starmap/grid/:id` | `src/routes/starmap.js:26` |
| PUT | `/starmap/beacon/decode/:id` | `src/routes/starmap.js:37` |
| PUT | `/starmap/velian-distress-signal` | `src/routes/starmap.js:55` |

## `/person` — personnel (14)

| Method | Path | Source |
|---|---|---|
| GET | `/person` | `src/routes/person.js:32` |
| GET | `/person/filters` | `src/routes/person.js:61` |
| GET | `/person/groups` | `src/routes/person.js:72` |
| GET | `/person/:id` | `src/routes/person.js:85` |
| GET | `/person/card/:id` | `src/routes/person.js:125` |
| GET | `/person/bio/:id` | `src/routes/person.js:147` |
| GET | `/person/search/:name` | `src/routes/person.js:158` |
| PUT | `/person/set-visible` | `src/routes/person.js:171` |
| PUT | `/person/:id` | `src/routes/person.js:185` |
| PUT | `/person/:id/family` | `src/routes/person.js:204` |
| POST | `/person/:id/entry` | `src/routes/person.js:223` |
| PUT | `/person/:id/kill` | `src/routes/person.js:237` |
| PUT | `/person/:id/group/:groupId` | `src/routes/person.js:256` |
| DELETE | `/person/:id/group/:groupId` | `src/routes/person.js:278` |

Note: `GET /person/filters` and `GET /person/groups` are declared before `GET /person/:id`. A person with the id `filters` would be unreachable.

## `/event` — scheduled scans (3)

| Method | Path | Source |
|---|---|---|
| GET | `/event` | `src/routes/event.js:14` |
| GET | `/event/:id` | `src/routes/event.js:25` |
| PUT | `/event` | `src/routes/event.js:37` |

## `/post` — social media posts (3)

| Method | Path | Source |
|---|---|---|
| GET | `/post` | `src/routes/post.js:18` |
| GET | `/post/:id` | `src/routes/post.js:30` |
| PUT | `/post` | `src/routes/post.js:43` |

## `/vote` — ship voting (5)

| Method | Path | Source |
|---|---|---|
| GET | `/vote` | `src/routes/vote.js:93` |
| GET | `/vote/:id` | `src/routes/vote.js:105` |
| PUT | `/vote/create` | `src/routes/vote.js:117` |
| PUT | `/vote/:id` | `src/routes/vote.js:148` |
| PUT | `/vote/:id/cast` | `src/routes/vote.js:194` |

## `/log` — ship log and audit log (5)

| Method | Path | Source |
|---|---|---|
| GET | `/log` | `src/routes/log.js:20` |
| PUT | `/log` | `src/routes/log.js:34` |
| GET | `/log/audit` | `src/routes/log.js:61` |
| POST | `/log/audit` | `src/routes/log.js:75` |
| DELETE | `/log/:id` | `src/routes/log.js:86` |

## `/science` — artifacts (6)

| Method | Path | Source |
|---|---|---|
| GET | `/science/artifact` | `src/routes/science.js:19` |
| GET | `/science/artifact/catalog/:id` | `src/routes/science.js:34` |
| GET | `/science/artifact/:id` | `src/routes/science.js:45` |
| PUT | `/science/artifact` | `src/routes/science.js:57` |
| PUT | `/science/artifact/entry` | `src/routes/science.js:85` |
| PUT | `/science/artifact/use/:code` | `src/routes/science.js:106` |

## `/data` — generic Redux data store (6)

| Method | Path | Source |
|---|---|---|
| GET | `/data` | `src/routes/data.js:54` |
| GET | `/data/:type` | `src/routes/data.js:69` |
| GET | `/data/:type/:id` | `src/routes/data.js:85` |
| POST | `/data/:type/:id` | `src/routes/data.js:105` |
| PATCH | `/data/:type/:id` | `src/routes/data.js:128` |
| DELETE | `/data/:type/:id` | `src/routes/data.js:146` |

## `/infoboard` — news screens (7)

| Method | Path | Source |
|---|---|---|
| PUT | `/infoboard/priority` | `src/routes/infoboard.js:20` |
| GET | `/infoboard/display` | `src/routes/infoboard.js:31` |
| GET | `/infoboard/enabled` | `src/routes/infoboard.js:73` |
| GET | `/infoboard` | `src/routes/infoboard.js:83` |
| PUT | `/infoboard` | `src/routes/infoboard.js:96` |
| PUT | `/infoboard/:id` | `src/routes/infoboard.js:110` |
| DELETE | `/infoboard/:id` | `src/routes/infoboard.js:126` |

## `/dmx` — lights and sound (2)

| Method | Path | Source |
|---|---|---|
| GET | `/dmx/channels` | `src/routes/dmx.js:14` |
| POST | `/dmx/event/:channel` | `src/routes/dmx.js:28` |

## `/messaging` — in-game chat, admin routes (2)

| Method | Path | Source |
|---|---|---|
| GET | `/messaging/unread` | `src/messaging.ts:46` |
| POST | `/messaging/send` | `src/messaging.ts:65` |

## `/tag` — NFC tags (4)

| Method | Path | Source |
|---|---|---|
| GET | `/tag` | `src/routes/tag.js:16` |
| GET | `/tag/:id` | `src/routes/tag.js:30` |
| PUT | `/tag` | `src/routes/tag.js:45` |
| DELETE | `/tag/:id` | `src/routes/tag.js:66` |

## `/operation` — science operations (4)

| Method | Path | Source |
|---|---|---|
| GET | `/operation` | `src/routes/operation.ts:131` |
| GET | `/operation/:id` | `src/routes/operation.ts:150` |
| POST | `/operation` | `src/routes/operation.ts:170` |
| PUT | `/operation/:id` | `src/routes/operation.ts:208` |

## `/sip` — phone directory (4)

| Method | Path | Source |
|---|---|---|
| GET | `/sip/config` | `src/routes/sip.js:20` |
| GET | `/sip/contact` | `src/routes/sip.js:33` |
| GET | `/sip/contact/:id` | `src/routes/sip.js:44` |
| PUT | `/sip/contact` | `src/routes/sip.js:58` |

## `/story` — Story DB `[STORY-DB]` (11)

| Method | Path | Source |
|---|---|---|
| GET | `/story/artifact/:id` | `src/routes/story-admin.ts:35` |
| GET | `/story/events` | `src/routes/story-admin.ts:50` |
| GET | `/story/events/:id` | `src/routes/story-admin.ts:61` |
| POST | `/story/events` | `src/routes/story-admin.ts:76` |
| GET | `/story/messages` | `src/routes/story-admin.ts:88` |
| GET | `/story/messages/:id` | `src/routes/story-admin.ts:100` |
| POST | `/story/messages` | `src/routes/story-admin.ts:115` |
| GET | `/story/person/:id` | `src/routes/story-admin.ts:128` |
| GET | `/story/plots` | `src/routes/story-admin.ts:143` |
| GET | `/story/plots/:id` | `src/routes/story-admin.ts:155` |
| POST | `/story/plots` | `src/routes/story-admin.ts:170` |

All of these move to the separate Story DB system. See `story-db.md`.

## Socket.IO surface

Not HTTP, but part of the public API.

| Namespace | Purpose | Source |
|---|---|---|
| `/` (default) | Ad-hoc events, for example `eventFinished`. Any event can be injected through `POST /emit/:eventName`. | `src/websocket.ts:8` |
| `/data` | Redux store change feed. Client joins a room named by the `data` query parameter: `/data`, `/data/<type>`, or `/data/<type>/<id>`. Server emits `dataUpdate(type, id, object)` and `dataDelete(type, id)`, throttled to 100 ms. | `src/store/storeSocket.ts:36` |
| `/messaging` | In-game chat. The handshake query must carry a person `id`; an unknown id is rejected (`src/messaging.ts:86`). Client events: `fetchHistory`, `fetchUnseenMessages`, and message sending. Server emits `message`. Messages are stored in `com_message`. | `src/messaging.ts:82` |

## Verification method

The tables above were produced with:

```sh
grep -nE "router\.(get|post|put|patch|delete)\(" src/routes/*.js src/routes/*.ts src/messaging.ts
grep -nE "^app\.(get|post|put|use)\(" src/index.ts
grep -nE "emptyEpsilonRouter\.(get|post)\(" src/routes/emptyepsilon.ts
```

Re-run these commands to confirm no endpoint is missing after a source change.
