# Side-effect catalog

This document lists every place in the Odysseus backend where an operation does more than its name, its HTTP method or its signature suggests.

Read `docs/rewrite/CONVENTIONS.md` first. This document uses the tags defined there. The mechanism behind the store-driven entries is described in `docs/rewrite/rules-engine.md`.

**Total entries: 42.**

Severity means "how surprising, multiplied by how much damage".

| Severity | Meaning |
|---|---|
| Critical | Can destroy game state, crash the process, or drive hardware with no audit trail. |
| High | Changes state that the caller did not name. Hard to find from the call site. |
| Medium | Surprising, but the blast radius is one subsystem. |
| Low | Worth knowing during a rewrite. Low damage. |
| By design | Not a defect. The behaviour is deliberate. It is listed because other entries inherit it. |

---

## Summary table

| # | Trigger | Location | Unexpected effect | Why it surprises | Severity | Rewrite guidance |
|---|---|---|---|---|---|---|
| 1 | Any HTTP request, any Socket.IO connection | whole of `src/` | No authentication. No authorization. No rate limit. | By design. The game runs on a closed network and every client is game equipment. Every route is open, so a client defect has the blast radius of the whole API. | By design `[BY-DESIGN]` | Keep the open model. Record the blast radius of each route instead. |
| 2 | Any store write at all | `src/store/storePersistance.ts:20-30` | The **entire** Redux store is serialised into one `store` table row every 5 s. | The caller writes one blob; the system rewrites about 1 MB of JSON. Concurrent writers overwrite each other's blobs. Up to 5 s of every change is lost on a crash. | Critical | Store one row per blob. Write on change, not on a global timer. |
| 3 | `POST /data/:type/:id`, `PATCH /data/:type/:id` | `src/routes/data.js:105,128` | The write runs the rules engine. That can fire DMX, switch mains power sockets, call EmptyEpsilon, write the `ship`, `ship_log` and `grid_action` tables, and cascade into other blobs. | The route reads as a key-value store. It is the main control surface of the whole ship. | Critical | Keep the generic route for reads. Give every effect-bearing write a named command route. |
| 4 | Any exception inside a `watch` callback | `src/store/store.ts:69` | The process dies. | `interval()` and `timeout()` catch exceptions but `watch()` does not, and there is no `uncaughtException` handler. A missing field in one blob kills the backend. | Critical | Wrap rule callbacks. Add a process-level handler. |
| 5 | `POST /emit/:eventName` | `src/index.ts:149` | Emits **any** Socket.IO event name with **any** body to every connected client. | The route has no allow-list. A caller can forge `shipUpdated`, `logEntryAdded`, `eventFinished` or any other event. | Critical | Delete it, or restrict it to an allow-list of event names. |
| 6 | `SIGINT` / `SIGTERM` | `src/store/storePersistance.ts:32-45` | The handler saves the store and then calls `process.exit(0)`. | It exits from inside a state-persistence function. Nothing else can run a shutdown step, and the exit code is always 0 even when the save failed. | High | Separate "flush" from "exit". Let the entry point own the exit. |
| 7 | `POST /dmx/event/:channel` | `src/routes/dmx.js:28` + `src/dmx.ts:232` | Fires DMX **and** switches TP-Link mains sockets on or off. | The route says "DMX". It also cuts mains power to lights and displays. | High | Make the mains control explicit and separate. |
| 8 | Any `fireEvent(...)` anywhere | `src/dmx.ts:211-233` | Every DMX event is also matched against `tplink/dmxconfig` and can switch a mains socket. The call is not awaited. | 30 call sites across rules and routes think they only fire a lighting cue. | High | Make the mapping a subscriber on an event bus, not a hidden call inside `fireEvent`. |
| 9 | `GET /person/:id?login=true&hacker_id=X` | `src/routes/person.js:85-115` | Inserts an `audit_log` row, then starts a 1-5 minute timer that inserts a `ship_log` row **and fires DMX channel 257**. | A GET writes two tables and, minutes later, fires a physical alarm. | High | Make it `POST /session/hacker-login`. Persist the pending detection. |
| 10 | `GET /person/card/:id?login=true` | `src/routes/person.js:125-138` | Inserts an `audit_log` row. The `save()` is not awaited. | A GET writes a table, and a failure is silent. | High | Make it a POST. Await the write. |
| 11 | `POST /operation` | `src/routes/operation.ts:170` | Writes `entry` (the medical file), `artifact_entry`, updates `operation_result`, and appends to the `misc/science_analysis_in_progress` Redux blob. | The route name says one table. It touches four. | High | Split into explicit sub-flows. |
| 12 | `PUT /starmap/beacon/decode/:id` | `src/models/ship.js:83-103` | `Beacon.activate()` sets `is_active = false` on **every other** beacon row, fires DMX 250, and writes a `ship_log` entry. | Decoding one beacon rewrites the whole `starmap_beacon` table. | High | Keep the transaction; name the method `activateExclusively`. |
| 13 | `POST /fleet/:id/jump/validate` | `src/eventhandler.js:166-193` | When `metadata.should_add_log_entries` is true, a failed validation inserts `ship_log` rows. | "Validate" is a read-only word. | High | Move the log writes to the caller. |
| 14 | `PATCH /fleet/:id/metadata` | `src/routes/fleet.js:90` | Uses lodash `set()` with a caller-supplied `key_path` on the ship metadata object. | Any key path can be written, including nested ones the code does not expect. Any client can set `jump_range`, `scan_range` or `probe_count`. | High | Use an allow-list of key paths. |
| 15 | `POST /state/break-task` | `src/index.ts:116-138` | Breaks the task, waits 500 ms with a bare `sleep`, then damages EmptyEpsilon. The rules then break more tasks. | The 500 ms sleep is a race workaround, not a synchronisation. `breakEE(type, min, max)` is called with the arguments in the wrong order for hull. | High | Make the sequence explicit and awaited. |
| 16 | `POST /state/full-push` | `src/index.ts:106` | Fans out into about 29 parallel EmptyEpsilon writes and overwrites the whole live game state. | One HTTP call replaces every system health, heat, weapon count, landing pad, alert level and the hull. | High | Keep it. Add a confirmation step before it runs. |
| 17 | `GET /emptyepsilon/damage-dmx` | `src/integrations/emptyepsilon/client.ts:246` | Sends `POST /exec.lua` with a raw Lua string to the EmptyEpsilon server. | A GET performs remote code execution on another host. | High | Rename it. Keep the Lua strings in one place. |
| 18 | Any `Post`, `LogEntry`, `AuditLogEntry` or `Vote` save | `src/models/post.js:29-40`, `src/models/log.js:24-35,56`, `src/models/vote.js:56-61` | The Bookshelf `created`, `updated` and `destroying` hooks emit Socket.IO events. | A plain `.save()` in any rule or route broadcasts to every client. `getSocketIoClient()` throws when the socket is not initialised. | High [BOOKSHELF] | Emit from the service layer, not from the model. |
| 19 | Any `Ship` save where `id === 'odysseus'` | `src/models/ship.js:146-156` | The `updated` hook re-fetches the ship **with geometry** and emits `shipUpdated`. | An unrelated metadata patch triggers an extra `SELECT` with a PostGIS geometry column and a broadcast. | High [BOOKSHELF] [GIS] | Same as entry 18. |
| 20 | Any `Ship` fetch | `src/models/ship.js:157-162` | The `fetching` hook injects a correlated `COUNT(*)` sub-query over the `person` table into every ship query. | Nothing in the call site mentions `person`. | Medium [BOOKSHELF] [PG] | Make it an explicit `withPersonCount()` scope. |
| 21 | `ship.jumpFleet(...)` during a jump | `src/models/ship.js:160-172`, called from `src/rules/ship/jump.js:84` | One raw SQL statement moves **every** visible present ship row to the new grid and geometry. | A "ship jump" moves the whole fleet. | Medium [PG] [GIS] | Keep the behaviour. Name the method for it. |
| 22 | `ship/ee` changes (the 1 s EE poll) | `src/rules/ship/eeHealth.js:96` | A health drop breaks engineering tasks at random, which writes `box` and `game` blobs, which writes `task` blobs, which changes life support health and fires DMX. | One number from an external game triggers a four-level store cascade. | Critical | See `rules-engine.md`, cascade C7. Make one side authoritative. |
| 23 | A task becomes `fixed` | `src/rules/ship/eeHealth.js:125` | Calls EmptyEpsilon `setSystemHealth`, then forces a full EE re-poll, which writes `ship/ee`, which re-enters the rules. | Fixing a task in the task list changes the state of a separate game server. | High | Same as entry 22. |
| 24 | `ship/ee` changes | `src/rules/ship/autoRepairHull.ts:32` | Silently writes the hull back up to 2 hit points whenever it drops below 2. | The game master's hull value is overwritten with no log in any UI. The purpose is to keep EmptyEpsilon's own damage DMX firing. | High | Keep the behaviour. Show it in the admin UI. |
| 25 | `box/drifting_value` out of range | `src/rules/boxes/driftingValue.js:19-30` | Every second, with probability 0.055, reduces EmptyEpsilon impulse health by 1 percentage point. That cascades into breaking impulse tasks. | A physical dial that nobody is watching slowly destroys the engines. | High | Keep it. Document the rate: about 3.3 points per minute on average. |
| 26 | Life support reaches `critical` | `src/rules/ship/lifesupport.js:83` | Sets the EmptyEpsilon alert level to red. The promise is not awaited. | A life support calculation changes the bridge alert state. | Medium | Make the effect explicit and awaited. |
| 27 | `box/bigbattery` changes | `src/rules/ship/fighters.ts:55` | Repairs destroyed fighters in EmptyEpsilon and writes a **randomly worded** ship log entry. | Plugging in a battery changes an external game and writes a log line whose text is picked from five templates at random. | Medium | Keep. Make the log text deterministic. |
| 28 | `box/<airlock>` write with a `command` field | `src/rules/boxes/airlock.js:89-113` | The rule immediately writes the same blob back with `command: null`. `forceDepressurize` writes `access_denied` on **both** airlocks. | The caller's write is mutated a tick later. One airlock's command locks the other. | Medium | Use a command queue, not a field in the state blob. |
| 29 | Any store write | `src/rules/tasks/box-game-tasks.js:37` | A watcher on the root `['data']` path runs after **every** dispatch and scans every `box` and `game` blob. | A write to an unrelated blob costs a full scan. The rule also writes `task` blobs, which re-enters itself. | Medium | Watch `data.box` and `data.game` only. |
| 30 | `ship/jump` write | `src/rules/ship/jump.js:574` | The rule writes `ship/jump` back, which re-enters the same watcher. Some transitions write it twice. | A self-feedback loop guarded only by state comparisons and time deadlines. | Medium | Model as an explicit state machine with persisted deadlines. |
| 31 | End of a jump | `src/rules/ship/jump.js:220-237` | Decrements `ship.metadata.jump_crystal_count` in the database, writes ship log warnings, and fires DMX 251 or 252. The promise chain is not awaited. | A jump status change writes a table and fires an alarm. | Medium | Await it. Move the crystal accounting out of the transition handler. |
| 32 | Restart of the process | `src/rules/ship/eeHealthDmx.js:128-130` | `previousHealthStatus` is empty after a restart, so the first pass fires a DMX event for every health type at once. | A restart produces a burst of alarm cues. | Medium | Persist the last reported status, or suppress the first pass. |
| 33 | Restart during a `calibration_speedup` artifact | `src/rules/artifacts/artifact.ts:106-114` | The revert timer is lost. `ship/calibration.multiplier` stays at 100 forever, so every calibration finishes instantly. | An in-memory `setTimeout` holds game-critical state. | Medium [BUG] | Store an expiry timestamp and compute the multiplier. |
| 34 | Restart during a scan | `src/eventhandler.js:99,150` | The scan timer is lost. `loadEvents()` re-adds the event, `getTimeUntilEvent` returns a negative value, and `addScanObjectEvent` throws. The scan never completes and the `event` row stays active. | The probe was already consumed. | Medium [BUG] | Persist the deadline and let a poller complete overdue scans. |
| 35 | Restart during the 3.6 s window after `JumpEnd` | `src/rules/ship/jump.js:208-212` | `jump_ui_enabled`, `social_ui_enabled`, `infoboard_enabled` and `ee_sync_enabled` stay `false`. | Three player-facing UIs stay dark with no obvious cause. | Medium [BUG] | Compute the flags from the jump state instead of toggling them on a timer. |
| 36 | `PATCH /data/:type/:id` without a `version` in the body | `src/routes/data.js:131` + `:18` | Always returns 409 Conflict. | The route builds `{...current, version: undefined, ...body}`, so the version is `undefined` unless the caller supplies one, and the check then fails. | Medium [BUG] | Read the version from the current blob, or from an `If-Match` header. |
| 37 | `?force=false` on `POST` or `PATCH /data/:type/:id` | `src/routes/data.js:107,130` | Forces the write. | `force` is the raw query string. The string `"false"` is truthy. | Medium [BUG] | Parse the boolean. |
| 38 | `PUT /log` with a message containing "incoming jump into current sector" | `src/routes/log.js:44-47` | Fires DMX channel 255. | The route matches on free-form log text, case-insensitively, to decide whether to fire a physical alarm. | Medium | Use an explicit event type field. |
| 39 | `PUT /post/:id?sendMessage=true` and `PUT /vote/:id?sendMessage=true` | `src/routes/post.js:71-77`, `src/routes/vote.js:172-181` | Fires DMX (258 / 259), sends a private Socket.IO message impersonating the fleet secretary, and, for votes, inserts an `info_entry` row. | Approving a news post rings a chime and sends a message as another person. | Medium | Keep. Name the effects in the API documentation. |
| 40 | Closing a vote | `src/rules/social/votes.js:11-15` | Writes the vote row (which broadcasts) and inserts a results `info_entry` row. | A background poller creates content. | Low | Fine. Make the poller a job. |
| 41 | Every 10 s | `src/rules/social/infoboard.js:39-53` | Rewrites the `survivors-count` info entry row unconditionally, which fires the model hook and broadcasts. | A row is written 8640 times per day even when the number never changes. | Low | Compare before writing. |
| 42 | `npm run redux:seed` | `db/redux/seed-redux.ts:8` | `knex('store').del()` deletes **all** rows of the `store` table before seeding. | The script name says "seed". It first destroys the live game state. | Low | Require an explicit confirmation flag. |

---

## Detailed entries

### 1. No authentication, authorization or rate limit — by design `[BY-DESIGN]`

The command `grep -rni "passport|jwt|authenticate|authorization|req.user" src` finds nothing. The only middleware in `src/index.ts:50-75` is `bodyParser.json()`, the logger, `cors()`, the Prometheus middleware, and one that attaches `io` to the request. `cors()` has no origin restriction.

```js
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(cors());
```
`src/index.ts:50-52`

Every route in the summary table is open to any client that can reach the port. The Socket.IO `/data` namespace is also open (`src/store/storeSocket.ts:35`).

This is a design decision, not a defect. `00-overview.md` section 2 gives the reasons. The game runs on a closed network. Every client on it is game equipment built by the game crew.

This entry stays in the catalog for one reason: every other entry inherits its blast radius. A client defect, or a test tool pointed at the live server, can fire DMX, switch mains power, or damage the ship.

**Rewrite guidance.** Keep the open model while the network stays closed. Do not add authentication. Instead, make the effect-bearing routes explicit, so a wrong call is easy to see.

---

### 2. Global throttled persistence of the whole store — Critical

```ts
const saveFrequency = parseInt(process.env.SAVE_STATE_FREQUENCY_MS, 10) || 5000;
const throttledSaveState = throttle(saveState, saveFrequency, { leading: false, trailing: true });

export function enablePersistance() {
	store.subscribe(() => {
		const { data } = store.getState();
		if (isEmpty(data)) return;
		throttledSaveState(data, 'data');
	});
}
```
`src/store/storePersistance.ts:11-30`

```ts
async function saveState(data: Record<string, unknown>, id: string) {
	const oldState = await Store.forge({ id }).fetch();
	const method = oldState ? 'update' : 'insert';
	return Store.forge({ id }).save({ data }, { method });
}
```
`src/store/storePersistance.ts:7-11`

Consequences:

- **One row, one column.** The whole store is one JSONB value with primary key `'data'` (`db/migrations/20190225175509_redux-store.js:4`). It holds 671 blobs, including the 99 manual task descriptions and the 160 mini-game configurations.
- **Last writer wins, at the whole-store level.** There are no per-blob transactions and no row-level locking. Two backend processes on the same database would each overwrite the other completely.
- **A 5 second loss window.** `leading: false` means the first write after an idle period is delayed by the full period. A crash loses up to 5 s of everything.
- **The store is never idle.** `jumpstate.js` writes every second (`src/rules/ship/jumpstate.js:169`). `ee-temp.js` also writes every second (`src/rules/ship/ee-temp.js:63`). `tasks.js` writes every 2 s, and the airlocks write every 60 s each. The 5 s write therefore runs for the whole game, whether or not anything meaningful changed.
- **`saveState` is a read-then-write with no transaction.** Two concurrent calls can both see "no row" and both try to insert.
- The persistence subscriber runs on **every** dispatch, and `isEmpty(data)` walks the object each time.

**Rewrite guidance.** One row per `(type, id)`. Write only the blob that changed, inside the same transaction as the dispatch. Keep a version column for the optimistic check that `src/routes/data.js:18` already implements in memory.

---

### 3. A generic data write drives the whole ship — Critical

```js
router.post('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	const { force } = req.query;
	const data = req.body;
	setData(type, id, data, force);
	res.json(getData(type, id));
});
```
`src/routes/data.js:105-111`

`setData` dispatches. The dispatch runs about 25 `watch` subscribers plus the persistence and socket subscribers. Depending on the blob, the write can:

| Blob written | Effects reached |
|---|---|
| `ship/jump` | `jump.js` — 14 DMX channels, ship log rows, `ship` and `grid_action` table writes, a fleet-wide SQL update, EmptyEpsilon alert level, plus airlock and big-battery rules. |
| `ship/ee` | `eeHealth.js` (breaks tasks), `eeHealthDmx.js` (45 DMX channels), `autoRepairHull.ts` (writes to EmptyEpsilon), `airlock.js` (depressurizes the hangar bay). |
| `box/<fusebox>` | `fuseboxes.js` — fuse DMX channels, which switch mains power; and life support task breakage. |
| `box/buttonboard` | `buttonboard.js` — fixes up to 20 logical boxes at once. |
| `box/bigbattery` | `fighters.ts` — repairs fighters in EmptyEpsilon and writes ship log rows. |
| `artifact/<id>` | `artifact.ts` — rewinds the jump cooldown, adds calibration slots, writes the `ship` table, fires DMX. |
| `tplink/dmxconfig` | Re-scans every configured mains socket. |
| any blob | `box-game-tasks.js` runs a full scan of `box` and `game`. |

**Rewrite guidance.** Keep `GET /data/...` as a read API. Replace the writes with named commands: `POST /jump/initiate`, `POST /box/:id/state`, `POST /artifact/:id/activate`. Each command then owns its documented effects.

---

### 4. A throwing rule kills the process — Critical

```ts
if (currentObject !== previousObject) {
	if (initialized) {
		const myPrevious = previousObject;
		// Use setTimeout instead of nextTick to not starve IO in case of infinite loop
		setTimeout(() => callback(currentObject, myPrevious, currentState), 0);
	}
	previousObject = currentObject;
}
```
`src/store/store.ts:66-72`

There is no `try/catch`. There is no `process.on('uncaughtException')` anywhere in `src/` or `db/`. An exception inside any rule callback is an uncaught exception in a timer tick, which terminates Node.

**This compounds with entry 2.** The only code that saves the Redux state on exit is the `SIGINT`/`SIGTERM` handler in `src/store/storePersistance.ts:42-43`. An uncaught exception does not raise a signal, so it does not run that handler. A rule that throws therefore kills the process **and** skips the shutdown save. The game loses everything written since the last 5-second throttled flush.

The three known throw sites (`airlock.js:48`, `box-game-tasks.js:39`, `box-game-tasks.js:44`) are all reachable from an ordinary `POST /data/:type/:id` call with a malformed body. Any caller can stop the backend and roll the game state back by up to five seconds.

A rewrite must do three things, not one. It must catch exceptions per rule callback. It must install a process-level handler. It must also make persistence not depend on a clean shutdown.

Known instances:

- `src/rules/boxes/airlock.js:48` reads `this.data.config.jump_close_delay` without a guard. A `box/airlock_main` blob written without a `config` object crashes the backend. [BUG]
- `src/rules/tasks/box-game-tasks.js:39,44` read `previous.box[id]` and `previous.game[id]` without checking that `previous.box` and `previous.game` exist. [BUG]
- `src/rules/ship/eeHealth.js:129` had this defect until commit `20146e3`, whose message is "Fix potential server crash".

Contrast with `src/rules/helpers.js:26` and `:47`, where `interval()` and `timeout()` do catch and log.

**Rewrite guidance.** Wrap every rule invocation. Log the rule name, the path and the blob. Add a supervisor.

---

### 5. `POST /emit/:eventName` — Critical

```ts
app.post('/emit/:eventName', (req, res) => {
	const { eventName } = req.params;
	io.emit(eventName, req.body || {});
	res.sendStatus(204);
});
```
`src/index.ts:149-153`

Any caller can emit any event name with any payload to every connected client. The clients trust these events. Real event names that this can forge include `shipUpdated`, `logEntryAdded`, `postAdded`, `voteUpdated`, `auditLogEntryAdded`, `eventFinished` and `shipAlertLevelUpdated`.

**Rewrite guidance.** Delete it. If the game masters need a manual trigger, give them a fixed list of allowed event names.

---

### 6. Graceful shutdown calls `process.exit(0)` — High

```ts
const persistInMemoryState = async () => {
	const { data } = store.getState();
	if (isEmpty(data)) return;
	await saveState(data, 'data');
	logger.info('Redux state saved to database, exiting process');
	process.exit(0);
};

export function enableGracefulShutdown() {
	process.on('SIGINT', persistInMemoryState);
	process.on('SIGTERM', persistInMemoryState);
}
```
`src/store/storePersistance.ts:32-45`

Problems:

1. A state-persistence module owns the process lifecycle. No other component can register a shutdown step.
2. `if (isEmpty(data)) return;` returns **without exiting**. A signal received before `initState` therefore does nothing at all, and the process keeps running.
3. The exit code is always 0. A failed `saveState` rejects, the `async` handler produces an unhandled rejection, and the process never exits.
4. Nothing closes the HTTP server, the Socket.IO server or the database pool. In-flight requests are dropped.

**Rewrite guidance.** Emit a shutdown event. Let subscribers flush. Exit from the entry point with a timeout.

---

### 7 and 8. DMX events switch mains power — High

```ts
export function fireEvent(channel: Channel | string, value = DMX_MAX_VALUE) {
	...
	dmx.update(UNIVERSE_NAME, { [channel]: value });
	setTimeout(() => dmx.update(UNIVERSE_NAME, { [channel]: 0 }), EVENT_DURATION);

	// Send TP-link power socker on/off. Intentionally not awaited.
	processDmxSignal(findChannelName(channel));
}
```
`src/dmx.ts:211-233`

```ts
for (let dmxSignal of dmxSignals) {
	if (dmxSignal.dmx === signal) {
		setTimeout(async () => {
			try {
				const ip = dmxSignal.ip;
				const device = await client.getDevice({ host: ip });
				await device.setPowerState(dmxSignal.powerstate);
			} catch (error) {
				logger.error(`Error sending DMX signal ${signal} to TP-link devices: ${error}`);
			}
		});
	}
}
```
`src/tplink/tplink-control.ts:52-67`

Five real devices are wired this way (`db/redux/tplink/index.ts:8`): the medbay examination light, the science lab research lights, the security room camera displays, the engine room displays and the engine room plasma ball. `JumpStart` turns three of them off. `JumpEnd` and `JumpEndBreaking` turn them back on.

The failure mode: `fireEvent` does not await `processDmxSignal`, and `processDmxSignal` schedules the actual switch in a `setTimeout`. A failure is logged and swallowed. A socket can stay in the wrong state with no retry and no alarm. If the process dies between `JumpStart` and `JumpEnd`, three rooms stay dark permanently. [BUG]

The DMX reset is the same shape: `setTimeout(() => dmx.update(..., 0), 1000)`. A crash inside that second leaves the channel latched at 255.

`POST /dmx/event/:channel` (`src/routes/dmx.js:28`) is the manual entry point into all of this.

**Rewrite guidance.** Make the DMX layer emit an event. Let a separate mains controller subscribe, retry, and expose its last known state.

---

### 9. `GET /person/:id` writes two tables and arms a physical alarm — High

```js
router.get('/:id', handleAsyncErrors(async (req, res) => {
	const isLogin = req.query.login === 'true';
	const hackerId = req.query.hacker_id;
	const personId = req.params.id;
	const person = await Person.forge({ id: personId }).fetchWithRelated();

	const isHackerLogin = isLogin && person && hackerId;
	if (isHackerLogin) {
		const hacker = await Person.forge({ id: hackerId }).fetchWithRelated();
		const detectionTimeMs = getHackingDetectionTime(hacker);
		await AuditLogEntry.forge().save({
			person_id: personId,
			hacker_id: hackerId,
			type: 'HACKER_LOGIN'
		});

		const intrusionDetectedMessage = getRandomHackingIntrustionDetectionMessage();

		// TODO: If the hacker logs out, we should be able to match to this timeout, cancel it,
		// and run the function immediately
		setTimeout(() => {
			addShipLogEntry('WARNING', intrusionDetectedMessage);
			dmx.fireEvent(dmx.CHANNELS.DataHubHackingDetected);
		}, detectionTimeMs);
```
`src/routes/person.js:85-109`

Effects of one GET:

1. Inserts an `audit_log` row. That fires the `created` model hook, which emits `auditLogEntryAdded` to every Socket.IO client (`src/models/log.js:56`).
2. Arms a `setTimeout` of 1, 2 or 5 minutes, taken from `misc/hacker_detection_times` (`db/redux/misc/index.ts:56`).
3. When it fires: inserts a `ship_log` row (another broadcast) and fires DMX channel 257.

The timer is in memory. A restart cancels the alarm silently. The `TODO` at line 104 acknowledges that a logout cannot cancel it either.

**Rewrite guidance.** `POST /session/hacker-login`. Persist a `detection_due_at` row and let a poller fire the alarm.

---

### 10. `GET /person/card/:id` writes an audit row, unawaited — High

```js
if (isLogin && person) {
	AuditLogEntry.forge().save({
		person_id: person.get('id'),
		type: 'LOGIN'
	});
}
res.json(person);
```
`src/routes/person.js:129-137`

The `save()` is not awaited and has no `.catch`. A database failure becomes an unhandled rejection and the client still receives 200. Every Social Hub card login goes through this route.

---

### 11. `POST /operation` writes four things — High

```ts
const operationResult = await OperationResult.forge().save(
	{ ...req.body, is_analysed: true },
	{ method: 'insert' }
);

const operationResultType = operationResult.get('type');

if (operationResultType === 'MEDIC') {
	await addOperationResultToMedicalEntry(operationResult);
}

if (operationResultType === 'SCIENCE') {
	await scheduleAddOperationResultToArtifactEntry(operationResult);
}

await processXrayOperation(operationResult);
```
`src/routes/operation.ts:174-194`

- `is_analysed: true` is forced on every insert, whatever the caller sent (line 177).
- `addOperationResultToMedicalEntry` (line 58) inserts an `entry` row in the person's **medical file**. The insert is attributed to the hard-coded person id `20263` (`EVA_ID`, line 20). It also marks the operation complete.
- `processXrayOperation` (line 28) inserts a medical entry containing an image link. The image depends on two flags in the `misc/medical` Redux blob. Person `20110` gets `brainscan.gif` when `show_20110_tumor` is set. Person `20070` gets `kontaminaatio.gif` when `show_20070_alien` is set (lines 38-44). A game-master toggle in the Redux store therefore changes the content that a medical scan produces.
- `scheduleAddOperationResultToArtifactEntry` (line 84) appends an entry to the `misc/science_analysis_in_progress` Redux blob. The completion time depends on the author's skill level **and** on whether the big battery is plugged into the science lab (`src/utils/science.ts:89-92`). A physical battery position changes how long a database analysis takes.
- Later, `src/rules/science/analysis.js` inserts the `artifact_entry` row.

`PUT /operation/:id` (line 208) runs the medical and X-ray steps again, so an update can insert another medical entry.

---

### 12. Decoding one beacon rewrites the whole beacon table — High

```js
activate: function (velianMessage) {
	// Set this beacon as active and others as inactive
	return knex.transaction(async trx =>
		Promise.all([
			knex('starmap_beacon').transacting(trx).update({ is_active: false }).whereNot('id', this.get('id')),
			knex('starmap_beacon').transacting(trx).update({ is_active: true, is_decrypted: true }).where('id', this.get('id'))
		]).then(() => trx.commit())
			.then(() => {
				dmx.fireEvent(dmx.CHANNELS.LoraBeaconSignalDecrypted);
				if (velianMessage) {
					shipLogger.warning(`Received a distress signal from area Alpha-5-D2-100: ${velianMessage}`, { showPopup: true });
					return;
				}
				shipLogger.success(`Decryption key '${this.get('id')}' successfully decrypted ...`, { showPopup: true });
			})
```
`src/models/ship.js:83-103`

Callers: `PUT /starmap/beacon/decode/:id` (`src/routes/starmap.js:43`) and `PUT /starmap/velian-distress-signal` (`src/routes/starmap.js:64`). The second one additionally writes the `misc/velian` Redux blob with `force = true` (line 65), bypassing the version check.

---

### 13. "Validate" writes ship log rows — High

```js
export async function validateJumpTarget(shipId, metadata, shouldValidateRange = true) {
	...
	const shouldAddLogEntries = get(metadata, 'should_add_log_entries', false);
	if (!grid) {
		if (shouldAddLogEntries) addShipLogEntry('ERROR', `Jump initialization failed: Unknown jump target.`, shipId);
		return { isValid: false, message: 'Given sub-sector does not exist' };
	}
```
`src/eventhandler.js:166-193`

The flag lives in the request body, not in the route. `POST /fleet/:id/jump/validate` (`src/routes/fleet.js:112`) passes the body straight through. A caller can therefore make a "validation" insert `ship_log` rows, each of which broadcasts over Socket.IO through the model hook.

---

### 14. `PATCH /fleet/:id/metadata` writes an arbitrary key path — High

```js
router.patch('/:id/metadata', handleAsyncErrors(async (req, res) => {
	const { id } = req.params;
	const { key_path, value } = req.body;
	if (!key_path || value === undefined) throw new Error('key_path or value not found in req body');
	const ship = await Ship.forge({ id }).fetch();
	if (!ship) throw new Error('Ship not found');
	const metadata = clone(ship.get('metadata') || {});
	set(metadata, key_path, value);
	await ship.save({ metadata }, { method: 'update', patch: true });
	res.sendStatus(204);
}));
```
`src/routes/fleet.js:90-100`

`set()` is lodash. The `key_path` comes from the request body. Game-critical values live in this object: `jump_range`, `scan_range`, `probe_count`, `jump_crystal_count`. Any client can set any of them. `clone()` is a shallow copy, so `set()` on a nested path mutates the model's own object as well.

The save also fires the `updated` hook (entry 19), which re-fetches the ship with geometry and broadcasts.

---

### 15. `POST /state/break-task` — High

```ts
const healthAmount = task.eeType === 'hull' ? task.eeHealth - 0.01 : task.eeHealth;
logger.info(`Breaking task ${taskId} and reducing EE health type ${task.eeType} by ${healthAmount}`);

breakTask(task);
// Allow time for rules to pick up breakage of box and as a result break the corresponding task
await sleep(500);
breakEE(task.eeType, task.eeHealth, healthAmount);
res.sendStatus(204);
```
`src/index.ts:129-136`

Two defects:

1. The 500 ms `sleep` is a guess at how long the cascade `breakTask -> box blob -> box-game-tasks -> task blob` takes. Under load it is not enough. [BUG]
2. `breakEE(type, min, max)` (`src/rules/ship/jump.js:521`) picks a random damage in `[min, max]`. The call passes `(task.eeHealth, healthAmount)`. For hull, `healthAmount = eeHealth - 0.01`, so `min > max` and `random(min, max)` returns a value **below** `max`, that is, less damage than either bound. The comment says the intent was the opposite. [BUG]

---

### 16. `POST /state/full-push` overwrites the live game — High

```ts
public async pushFullGameState(state: Record<string, any>) {
	const commands = this.fullStateToApiCommands(state);
	const alertLevel = alertStates[state.general.alertLevel];
	await Promise.all([
		...commands.map(({ command, target, value }) => this.setGameState(command, target, value)),
		this.setAlertLevel(alertLevel),
		this.setHullHealthPercent(get(state, 'general.shipHullPercent', 1)),
	]);
	return { success: true };
}
```
`src/integrations/emptyepsilon/client.ts:211-220`

`fullStateToApiCommands` (line 260) produces 9 heat writes, 9 health writes, 5 weapon writes and 4 landing pad writes. With the alert level and the hull, that is 29 parallel HTTP requests to a game server. The code elsewhere describes that server as fragile (`src/integrations/emptyepsilon/state.ts:8`, and the request-splitting workaround at `client.ts:88`).

`setGameState` returns `undefined` when `ship/metadata.ee_connection_enabled` is false (line 197). `Promise.all` then resolves and the route reports `{success: true}` even though nothing was sent. [BUG]

---

### 17. A GET runs Lua on the EmptyEpsilon server — High

```ts
public async isDamageDmxEnabled() {
	if (!this.dmxExecUrl) {
		logger.info('EE DMX remote control not configured, skipping isDamageDmxEnabled');
		return true;
	}
	try {
		const { data } = await axios.post(this.dmxExecUrl, 'return HardwareController():isDamageDmxEnabled()');
		return data === true;
	} catch (err) { ... }
}
```
`src/integrations/emptyepsilon/client.ts:246-258`

Reached from `GET /emptyepsilon/damage-dmx` (`src/routes/emptyepsilon.ts:97`). `enableDamageDmx` and `disableDamageDmx` (lines 222 and 234) do the same with mutating Lua.

Both of those have a second defect: the `if (!this.dmxExecUrl)` branch logs but does not `return`. The code then calls `axios.post(undefined, ...)`, which throws and is swallowed by the `catch`. The caller sees a success. [BUG]

---

### 18 and 19. Bookshelf model hooks broadcast on every save — High

```js
initialize() {
	this.on('destroying', model => {
		logger.success('Deleted post', model.get('id'));
		getSocketIoClient().emit('postDeleted', { id: model.get('id') });
	});
	this.on('created', model => { ... getSocketIoClient().emit('postAdded', model); });
	this.on('updated', model => { ... getSocketIoClient().emit('postUpdated', model); });
}
```
`src/models/post.js:26-41`

The same pattern is in `src/models/log.js:21-36` (`LogEntry`), `src/models/log.js:55-62` (`AuditLogEntry`) and `src/models/vote.js:55-62` (`Vote`).

Consequences:

- Every `shipLogger.info(...)` call inside a rule broadcasts to every client. There are 20 such calls in `src/rules/ship/jump.js` alone.
- `getSocketIoClient()` **throws** when `io` is not set (`src/websocket.ts:20`). Any model save before `initSocketIoClient` runs kills the caller. Today `initSocketIoClient` runs first (`src/index.ts:47`), so this is latent.
- The hooks run inside the caller's transaction. A broadcast can therefore announce a row that a later rollback removes.

The `Ship` model is worse:

```js
this.on('updated', async model => {
	const id = model.get('id');
	if (id !== 'odysseus') return;
	const io = getSocketIoClient();
	if (!io) { logger.warn('Could not emit shipUpdated ...'); return; }
	const newShip = await Ship.forge({ id }).fetchWithRelated({ withGeometry: true });
	io.emit('shipUpdated', newShip);
});
```
`src/models/ship.js:146-156`

Every Odysseus update triggers an extra `SELECT`. That query includes the PostGIS geometry column and the person-count sub-query (entry 20). It is followed by a broadcast of the whole model. `src/rules/ship/jump.js` and `src/rules/artifacts/artifact.ts:91` both save the ship. The `if (!io)` guard is dead code: `getSocketIoClient()` throws instead of returning a falsy value. [DEAD]

---

### 20. Every ship query carries a hidden person count sub-query — Medium

```js
this.on('fetching fetching:collection', (model, columns, options) => {
	options.query.select(knex.raw(
		`(SELECT COUNT(*) FROM person WHERE person.ship_id = ship.id AND person.is_visible IS TRUE AND person.status = ?) AS person_count`,
		[PERSON_IS_ALIVE_STATUS]
	));
});
this.on('saving', (model, columns, options) => {
	// Unset person_count before updating the model, as the column
	// does not exist
	if (model.get('person_count')) model.unset('person_count');
});
```
`src/models/ship.js:157-167`

A correlated sub-query is added to **every** ship fetch, including the ones inside the jump rule. The `saving` hook then has to remove the resulting virtual column, because there is no such column in the table. A fetch-modify-save round trip therefore silently drops `person_count`. [BOOKSHELF] [PG] — a plain SQL rewrite must add this column explicitly where it is wanted, and nowhere else.

---

### 21. `jumpFleet` moves every ship — Medium

```js
jumpFleet: async function ({ grid_id, metadata, the_geom }) {
	// Jump rest of the fleet first
	await Bookshelf.knex.raw(
		`UPDATE ship SET grid_id = ?, the_geom = ?, updated_at = NOW() WHERE is_visible = TRUE AND status = ?`,
		[grid_id, the_geom, SHIP_PRESENT_STATUS]
	);

	// Jump odysseus separately to trigger updated hook
```
`src/models/ship.js:160-172`

The raw statement bypasses Bookshelf, so no hooks fire for the fleet — only for Odysseus. That is deliberate (comment at line 171) but it means the fleet ships move with no broadcast. [PG] [GIS]

Called from `performShipJump` (`src/rules/ship/jump.js:84`), which is itself called without `await` at line 337. A failure there is an unhandled rejection during the most important moment of the game. [BUG]

---

### 22. EmptyEpsilon health drives task breakage — Critical

```js
watch(['data', 'ship', 'ee'], (ee, previous, state) => {
	for (const type of TYPES) {
		try {
			const previousHealth = getEEHealth(previous, type);
			const nowHealth = getEEHealth(ee, type);
			...
			if (nowHealth < previousHealth) {
				logger.info(`Detected EE ${type} health drop from ${previousHealth} to ${nowHealth}`);
				breakTasks(type, nowHealth);
			}
		} catch (err) {
			logger.warn(`Could not break tasks for EE ${type} health:`, err, previous);
		}
	}
});
```
`src/rules/ship/eeHealth.js:96-122`

The EE poll writes `ship/ee` up to once per second. Any drop breaks tasks until the task-derived health matches. Each break writes a `box` or `game` blob, which triggers `box-game-tasks.js`, which writes a `task` blob, which triggers `lifesupport.js` and `eeHealthDmx.js`, which fires DMX.

The hull special case returns from the **whole callback**, not from the current loop iteration:

```js
if (type === 'hull' && shouldIgnoreHullDamage) {
	logger.info('Hull is completely broken, not breaking any more tasks');
	return;
}
```
`src/rules/ship/eeHealth.js:108-111`

`hull` is the last element of `TYPES` (line 21), so today nothing is skipped. Reordering the array would silently break the other types. [BUG]

The `try/catch` here means a bad EE payload is logged and ignored, which hides the failure.

---

### 23. Fixing a task writes to EmptyEpsilon — High

```js
watch(['data', 'task'], async (tasks, previousTasks, state) => {
	for (const id of Object.keys(tasks)) {
		const task = tasks[id];
		const previous = previousTasks[id];
		if (task.eeType && task.eeHealth && task.status === 'fixed' && previous?.status !== 'fixed') {
			const ee = store.getState().data.ship.ee;
			const type = task.eeType;
			const health = clamp(getEEHealth(ee, type) + task.eeHealth, -1, 1);
			...
			if (isFinite(health)) {
				await setEEHealth(type, health);
```
`src/rules/ship/eeHealth.js:125-142`

`setEEHealth` (line 36) calls EmptyEpsilon and then forces a full state re-poll. The callback is `async` and `watch()` does not await it, so several of these can be in flight at once. Each one reads `getEEHealth(ee, type)` from a possibly stale snapshot. So two tasks fixed in the same tick can both compute the same base, and one increment is lost. [BUG]

---

### 24. The hull is silently repaired — High

```ts
// Keep hull at above 1 health so that the next hit will cause the hull damage DMX to be triggered
async function autoRepairHull(current: Record<string, any>) {
	const hullHealth = current?.general?.shipHull;
	if (typeof hullHealth !== 'number') return;

	if (hullHealth < MIN_DESIRED_HULL_HEALTH) {
		await repairHullThrottled(hullHealth, MIN_DESIRED_HULL_HEALTH);
	} else {
		repairHullThrottled.cancel();
	}
}

watch(['data', 'ship', 'ee'], autoRepairHull);
```
`src/rules/ship/autoRepairHull.ts:20-32`

The hull can never go below 2 hit points. A game master who sets the hull to 0 sees it jump back to 2 within 2 s. The reason is in the comment: EmptyEpsilon fires its own damage DMX only when the hull actually takes damage.

`eeHealth.js:88-93` has a matching special case so that this oscillation does not break hull tasks forever.

---

### 25. A drifting dial destroys the engines — High

```js
if (Math.random() < box.engineBreakProb) {
	const ee = store.getState().data.ship.ee;
	const engineHealth = ee.systems.health.impulseHealth;
	if (engineHealth > 0) {
		logger.info(`Dropping impulse engine health by 1% due to drifting value out-of-range (${box.value})`);
		try {
			await getEmptyEpsilonClient().setGameState('setSystemHealth', 'impulse', Math.max(engineHealth - 0.01, 0));
			await updateEmptyEpsilonState();
		} catch (err) {
			logger.error('Error dropping impulse engine health', err);
		}
	}
}
```
`src/rules/boxes/driftingValue.js:19-31`

Runs every second. The seed sets `engineBreakProb` to 0.055 (`db/redux/box/driftingValue.js:17`), which is about 3.3 percentage points of impulse health per minute. Each drop cascades through entry 22 and breaks impulse tasks.

The presets in the seed name the intended durations: 10, 15, 20, 30, 45 and 60 minutes to reach 0 % (`db/redux/box/driftingValue.js:83-100`).

---

### 26. Life support raises the EmptyEpsilon alert level — Medium

```js
case CRITICAL:
	fireEvent(CHANNELS.LifeSupportCritical);
	shipLogger.warning(`Life support level critical. Oxygen level low.`, { showPopup: true });
	getEmptyEpsilonClient().setAlertLevel('red');
	break;
```
`src/rules/ship/lifesupport.js:80-84`

The promise is not awaited and has no `.catch`. `setAlertLevel` rejects on any HTTP error (`src/integrations/emptyepsilon/client.ts:165`), which becomes an unhandled rejection.

The whole `checkLevel` call is delayed by 4.5 minutes from the health change (`src/rules/ship/lifesupport.js:28`), so the alert appears long after the cause.

---

### 27. Plugging in a battery repairs fighters and writes a random log line — Medium

```ts
async function repairFighter(landingPad: number) {
	logger.info(`Battery connected, repairing fighter ${landingPad}`);
	await getEmptyEpsilonClient().setLandingPadState(landingPad, LandingPadStates.Docked);
	await shipLogger.info(getRandomLogEntry(fighterNames[landingPad - 1]));
}
```
`src/rules/ship/fighters.ts:21-25`

`getRandomLogEntry` picks one of five templates at random (line 16). The rule runs on every `box/bigbattery` change, and the depletion timer changes that blob every 60 s. The function is `async`, and the watcher does not await it. So two overlapping runs can repair the same pad twice and write two log entries. [BUG]

`isBatteryConnectedAndCharged` honours `emergency_assumed_at_positions` (`src/utils/bigbattery-helpers.ts:39`), so a game master preset can make the battery "connected everywhere" and repair all three fighters at once.

---

### 28. An airlock command mutates the caller's write — Medium

```js
command(command) {
	if (!command) return;
	this.patchData({ command: null, last_command: command, last_command_at: now() });
	const counter = ++this.commandCounter;  // the increment cancels any current transitions
```
`src/rules/boxes/airlock.js:89-93`

The rule watches its own blob, so this write re-enters the watcher. The second pass sees `command === null` and stops. This is a deliberate one-step feedback loop.

`forceDepressurize` reaches both airlocks:

```js
async denyAccess() {
	for (const name of airlockNames) {
		airlocks[name].patchData({ access_denied: true });
	}
},
```
`src/rules/boxes/airlock.js:323-327`

The comment at line 100 explains why: "access override for special scene".

The known unexplained loop is recorded in the code:

```js
// KLUGE: Just doing this.command('pressurize') apparently triggers an infinite loop!
this.patchData({ fighters: 'docked', status: 'pressurizing', command: 'pressurize' });
```
`src/rules/boxes/airlock.js:197-198`

[BUG] The root cause is not documented. A rewrite must find it.

Each airlock also writes its own blob every 60 s:

```js
// Also, apparently restarting the backend can cause the UI to miss some state updates. We work around this by pushing
// dummy updates at regular intervals.
setInterval(() => this.patchData({ heartbeat: now() }), 60000);
```
`src/rules/boxes/airlock.js:69-71`

---

### 29. A watcher on the root of the store — Medium

```js
watch(['data'], (data, previous) => {
	for (const id of Object.keys(data.box || [])) {
		if (previous.box[id] && data.box[id].status !== previous.box[id].status) {
			updateTask(data.box[id], data);
		}
	}
	for (const id of Object.keys(data.game || [])) {
		if (previous.game[id] && data.game[id].status !== previous.game[id].status) {
			updateTask(data.game[id], data);
		}
	}
});
```
`src/rules/tasks/box-game-tasks.js:37-48`

`data` is a new object on every dispatch. So this callback runs after every single store write in the system, including the once-per-second writes from `jumpstate.js` and `ee-temp.js`. Each run scans 322 blobs.

The rule writes `task` blobs, which are inside `data`, so it re-enters itself. The status comparison stops the second pass.

`previous.box[id]` and `previous.game[id]` are read without checking that `previous.box` and `previous.game` exist. [BUG] See entry 4.

---

### 30. The jump rule writes the blob it watches — Medium

```js
watch(['data', 'ship', 'jump'], (current, previous, state) => {
	if (current.status !== previous.status) {
		handleTransition(current, current.status, previous.status);
	}
	handleStatic(current);
});
```
`src/rules/ship/jump.js:574-579`

`handleTransition` writes `ship/jump` for the `jumping>cooldown`, `jump_initiated>prep_complete` and any `>jump_initiated` cases. `handleStatic` writes it for `broken`, `cooldown`, `preparation`, `prep_complete`, `ready`, `jump_initiated` and `jumping`.

The `ready` case writes unconditionally when the flag is set:

```js
case 'ready':
	if (jump.breaking_jump) {
		logger.error("Jump drive in 'ready' state with breaking_jump flag, fixing");
		saveBlob({ ...jump, status: 'ready', breaking_jump: false });
	}
	break;
```
`src/rules/ship/jump.js:424-433`

There are two explicit race guards against the asynchronous `saveBlob`:

```js
case 'broken':
	// Avoid race condition when transitioning
	if (Date.now() > jump.updated_at + 500) {
```
`src/rules/ship/jump.js:363-365`, and the same at line 399.

`updated_at` is written by the reducer, not by the rule. The guard therefore depends on an implementation detail of the store.

---

### 31. A jump decrements a database counter — Medium

```js
const hasCrystalGenerator = get(getData('misc', 'artifact_actions'), 'actions.CRYSTAL_GENERATOR.is_used');
if (hasCrystalGenerator) break;
Ship.forge({ id: 'odysseus' })
	.fetch()
	.then(model => {
		const metadata = model.get('metadata');
		const jumpCrystalCount = get(metadata, 'jump_crystal_count', 1);
		const jump_crystal_count = jumpCrystalCount - 1;
		if (jump_crystal_count === 0) {
			shipLogger.warning(`Out of jump crystals`);
			dmx.fireEvent(dmx.CHANNELS.LoraJumpCrystalsDepleted);
		} else if (jump_crystal_count <= JUMP_CRYSTAL_LOW_THRESHOLD) {
			...
		}
		model.save({ metadata: { ...metadata, jump_crystal_count } }, { method: 'update', patch: true });
	});
```
`src/rules/ship/jump.js:218-237`

The chain has no `.catch`. The `model.save` inside is also unawaited. The counter can go negative; the code only tests for exactly 0 and exactly 5. A game-master edit of `misc/artifact_actions` in the Redux store changes whether the database counter moves at all.

---

### 32. A restart fires a burst of health DMX events — Medium

```js
const previousHealthStatus = {};
const previousHealthValue = {};
const lastEventTime = {};
```
`src/rules/ship/eeHealthDmx.js:128-130`

These are module-level and in memory. After a restart, `previousHealthStatus[type]` is `undefined` for all nine reported types. The first `updateHealthValues` pass sees `status !== undefined` for every type. It fires an event for each, subject only to the per-channel 60 s cooldown, which is also empty.

The same shape applies to `oldLevel` in `src/rules/ship/lifesupport.js:67` and `isOutOfRange` in `src/rules/boxes/driftingValue.js:8`.

---

### 33. A lost timer leaves calibration at 100x forever — Medium [BUG]

```ts
function updateCalibrationSpeedup(current: Artifact, previous: Artifact) {
	if (isActivated(current)) {
		const calibration = store.getState().data.ship.calibration;
		const originalMultiplier = calibration.multiplier;
		saveBlob({ ...calibration, multiplier: current.speedup_multiplier || 100 });
		setTimeout(
			() => { saveBlob({ ...calibration, multiplier: originalMultiplier }); },
			(current.speedup_duration_secs || 60) * 1000
		);
```
`src/rules/artifacts/artifact.ts:98-114`

Two defects:

1. A restart in the 60 s window loses the revert. `ship/calibration.multiplier` stays at 100 and every engineering calibration finishes instantly for the rest of the game.
2. The revert writes the **captured** `calibration` object, not the current one. A `calibration_slot` artifact used during the same 60 s adds a slot, and the revert removes it again.

---

### 34. A lost timer strands a scan and consumes a probe — Medium [BUG]

```js
// Set timer to execute scan
eventTimers.set(id, setTimeout(() => {
	performGridScan(gridId);
	finishEvent(event);
}, occursIn));
currentEvents.set(event.get('id'), event);
```
`src/eventhandler.js:150-154`

The probe was already spent before the timer was armed:

```js
const shipMetadata = ship.get('metadata');
const newProbeCount = probeCount - 1;
ship.save({ metadata: { ...shipMetadata, probe_count: newProbeCount } }, { type: 'update', patch: true })
	.then(() => { ... });
```
`src/eventhandler.js:133-147`

The `save` is not awaited. `{ type: 'update' }` is also the wrong option name — Bookshelf expects `method` — so this is an upsert by guess, not a forced update. [BUG]

On restart, `loadEvents()` (`src/index.ts:162`) refetches active events and calls `addEvent`. `getTimeUntilEvent` returns a negative number, and `addScanObjectEvent` throws `Event ... occurs in the past` (line 93). The throw happens inside an unawaited `.then` callback in `loadEvents`, so it is an unhandled rejection. The scan is lost, the probe is lost, and the `event` row stays `is_active = true` forever.

---

### 35. A lost timer leaves three UIs disabled — Medium [BUG]

```js
// Enable systems around the time when the JumpEnd audio reaches climax
setTimeout(() => setSystemsEnabled(true), JUMP_END_TO_CLIMAX);

// Enable Empty Epsilon state synchronization if connection status is healthy
if (getEmptyEpsilonClient().getConnectionStatus().isConnectionHealthy) {
	setTimeout(() => setEeSyncEnabled(true), 3000);
} else {
	logger.error('Could not enable Empty Epsilon state synchronization, connection is not healthy');
}
```
`src/rules/ship/jump.js:207-215`

`setSystemsEnabled(false)` runs at the start of the jump (`src/rules/ship/jump.js:312`) and writes `ship/metadata` with `jump_ui_enabled`, `social_ui_enabled` and `infoboard_enabled` all `false`. The re-enable is a 3.6 s timer. A restart inside that window leaves the jump UI, the social UI and the infoboards disabled with no automatic recovery.

The `else` branch is worse. When the EmptyEpsilon connection is unhealthy at the end of a jump, `ee_sync_enabled` stays `false` permanently, and the ship state stops updating. Only a manual edit fixes it.

---

### 36. `PATCH /data/:type/:id` always conflicts — Medium [BUG]

```js
router.patch('/:type/:id', (req, res) => {
	const { type, id } = req.params;
	const { force } = req.query;
	const data = { ...getData(type, id), ...{ version: undefined }, ...req.body };
	setData(type, id, data, force);
	res.json(getData(type, id));
});
```
`src/routes/data.js:128-134`

```js
export function setData(dataType, dataId, data, force = false) {
	if (!force) {
		const oldData = getData(dataType, dataId);
		if (oldData.version && oldData.version !== data.version) {
			throw new httpErrors.Conflict(...);
		}
	}
```
`src/routes/data.js:17-23`

The spread sets `version: undefined` and the body usually has no `version`. The check then compares a real number against `undefined` and throws 409. Every PATCH without an explicit version fails unless `?force=` is used.

---

### 37. `?force=false` forces the write — Medium [BUG]

`const { force } = req.query;` gives the raw string. `setData` tests `if (!force)`. The strings `"false"`, `"0"` and `"no"` are all truthy in JavaScript, so any value at all disables the version check.

---

### 38. A DMX alarm keyed on log text — Medium

```js
logEntry = await LogEntry.forge().save(req.body, { method: 'insert' });
const message = logEntry.get('message');
if (typeof message === 'string' && message.toLowerCase().includes('incoming jump into current sector')) {
	dmx.fireEvent(dmx.CHANNELS.IncomingJumpWarning);
}
```
`src/routes/log.js:42-47`

Substring matching on free-form prose decides whether a physical alarm fires. Any log entry that quotes the phrase, including one describing that the alarm fired, triggers it again.

---

### 39. Approving a post or a vote does five things — Medium

Post (`src/routes/post.js:57-79`):

1. Saves the row, which fires the `updated` hook and broadcasts `postUpdated`.
2. Emits `postUpdated` a second time from the route (line 60). Clients receive the event twice. [BUG]
3. Fires DMX 258 when the status changed to `APPROVED`.
4. Sends a private Socket.IO message from `FLEET_SECRETARY_ID` to the author.
5. Refuses to do step 4 when the author is the fleet secretary, because "stuff breaks in very unexpected ways" (comment at line 66).

Vote (`src/routes/vote.js:163-181`): the same, plus `createVoteCreatedInfoboardEntry(vote)`, which inserts an `info_entry` row that expires in at most one hour (line 67).

---

### 40. A background poller creates content — Low

```js
async function closeVote(vote) {
	logger.info('Closing vote', vote.get('id'));
	await vote.save({ is_active: false }, { method: 'update', patch: true });
	await createVoteResultsInfoEntry(vote);
}
```
`src/rules/social/votes.js:11-15`

`createVoteResultsInfoEntry` inserts an `info_entry` row with the results text and a `metadata.vote_results` array (line 62).

Two defects in the same function:

```js
results.forEach(result => result.votesPercentage = Math.round((result.votes / results[0].votes) * 100));
```
`src/rules/social/votes.js:49` — divides by the leading option's vote count. When that is 0, the result is `NaN` or `Infinity`. [BUG]

```js
for (const vote of activeVotes.models) {
	const closesIn = new Date(vote.get('active_until')) - Date.now();
	if (closesIn < 1) return await closeVote(vote);
	if (closesIn > POLL_FREQUENCY_MS * 2) return;
	closeVoteTimers.set(vote.get('id'), setTimeout(() => closeVote(vote), closesIn));
}
```
`src/rules/social/votes.js:73-87` — both `return` statements should be `continue`. Only the first vote in the collection is ever handled. The same defect is in `src/rules/social/infoboard.js:26,29`. [BUG]

---

### 41. A row is rewritten 8640 times a day — Low

```js
const body = entry.get('body');
const replacement = `<span class="survivors">${totalSoulsAlive}</span>`;
const pattern = /<span class="survivors">.*?<\/span>/;
const updatedBody = body.replace(pattern, replacement);
await entry.save({ body: updatedBody }, { method: 'update', patch: true });
```
`src/rules/social/infoboard.js:48-52`

No comparison. Every 10 s the row is written, `hasTimestamps` bumps `updated_at`, and the `updated` model hook broadcasts. `getTotalSoulsAlive()` is a `person` table aggregate that runs at the same rate.

---

### 42. `redux:seed` deletes the store table — Low

```ts
async function seed() {
	logger.info('Initializing Redux with empty state');
	await knex('store').del();
	initState({});
	...
```
`db/redux/seed-redux.ts:6-9`

`npm run db:seed` runs `knex seed:run && npm run redux:seed` (`package.json:25`). The Redux part first deletes every row of the `store` table. Against a live database this destroys the running game.

The script also calls `process.exit(0)` and `process.exit(1)` directly (lines 22 and 26).

---

## Cross-cutting patterns

### Floating promises and swallowed errors

Every one of these is a silent failure path.

| Location | What is not awaited or not caught |
|---|---|
| `src/dmx.ts:232` | `processDmxSignal(...)` — the TP-Link switch. Comment says "Intentionally not awaited". |
| `src/rules/ship/jump.js:337` | `performShipJump(...)` — the whole fleet move and the `grid_action` insert. |
| `src/rules/ship/jump.js:220-237` | The jump crystal fetch, save and warnings. No `.catch`. |
| `src/rules/ship/jump.js:529,539` | `setHullHealthPercent` and `setGameState` inside `breakEE`. The `try/catch` around them cannot catch a rejection. [BUG] |
| `src/rules/ship/lifesupport.js:83` | `setAlertLevel('red')`. |
| `src/rules/ship/eeHealth.js:125` | The watcher itself is `async`; `watch()` ignores the returned promise. |
| `src/rules/ship/fighters.ts:55` | Same. |
| `src/rules/artifacts/artifact.ts:84,122` | `updateScanRangeExtender` is `async`; the watcher ignores the promise. It also has a bare `throw new Error('Ship not found')`. |
| `src/routes/person.js:130` | `AuditLogEntry.forge().save(...)`. |
| `src/eventhandler.js:135` | `ship.save(...)` for the probe count. |
| `src/eventhandler.js:24` | `events.forEach(addEvent)` — `addEvent` is `async` and can throw. |
| `src/routes/science.js:91` | `ArtifactEntry.forge().save(...)` assigned without `await`; the route responds with a promise object. [BUG] |
| `src/routes/science.js:144-155` | The `HEALTH_BOOST` branch responds from inside a `.then`, and the surrounding handler returns before it. |
| `src/index.ts:165` | `Store.forge({id:'data'}).fetch()` has no `.catch`. A database failure at startup produces a process that never listens. |
| `src/routes/science.js:63-70` | The `catch` around the artifact insert swallows every error that is not a duplicate key, then falls through to `res.json(undefined)`. [BUG] |

Errors that are caught and then hidden:

- `src/rules/helpers.js:26-33` — `interval()` logs and continues. A rule that throws on every tick logs forever and does nothing.
- `src/rules/ship/eeHealth.js:118-120` — a `catch` inside the per-type loop turns a bad EE payload into a warning.
- `src/rules/ship/eeHealthDmx.js:167-170` — a `catch` per health type.
- `src/rules/boxes/airlock.js:84-86` — a `catch` around every DMX fire.
- `src/integrations/emptyepsilon/client.ts:151-154` — `getGameState` returns `{error}` instead of throwing. `updateEmptyEpsilonState` then silently skips the update (`state.ts:22`).
- `src/integrations/emptyepsilon/client.ts:197-200` — `setGameState` returns `undefined` when the connection is disabled. Callers that `await` it see success.

### In-memory state lost on restart

The full list is in `docs/rewrite/rules-engine.md`, "Timers and background loops". The game-critical items are:

1. Scan completion timers (`src/eventhandler.js:10-11`). The probe is already spent. Entry 34.
2. The `calibration_speedup` revert (`src/rules/artifacts/artifact.ts:106`). Entry 33.
3. The jump post-processing timers (`src/rules/ship/jump.js:208,212,317`). Entry 35.
4. The hacker detection alarm (`src/routes/person.js:106`). Entry 9.
5. The life support notification delay and `oldLevel` (`src/rules/ship/lifesupport.js:28,67`).
6. Airlock transitions (`src/rules/boxes/airlock.js`). Recovered by the constructor's `command('stop')`, which forces a known state rather than resuming.
7. The DMX status and cooldown maps (`src/rules/ship/eeHealthDmx.js:128-130`). Entry 32.
8. `previousState` in the EmptyEpsilon client (`src/integrations/emptyepsilon/client.ts:39`). `setHullHealthPercent` throws until the first successful poll (line 173). Any hull write in the first second after start fails. [BUG]
9. The emulator's `mockState` (`src/integrations/emptyepsilon/emulator.ts:22`). In an emulated deployment, every EmptyEpsilon value resets on restart.

The science analysis queue is the one background job that **is** persisted, in the `misc/science_analysis_in_progress` blob. It survives a restart because `src/rules/science/analysis.js` polls the store rather than holding timers.

### Startup ordering

```ts
Store.forge({ id: 'data' })
	.fetch()
	.then(model => {
		const data = model ? model.get('data') : {};
		initState(data);
		logger.info('Redux state initialized');
		enablePersistance();
		enableGracefulShutdown();
		loadRules();
		initializeTplinkScanning();
		startServer();

		const EE_UPDATE_INTERVAL = parseInt(process.env.EMPTY_EPSILON_UPDATE_INTERVAL_MS || '1000', 10);
		interval(updateEmptyEpsilonState, EE_UPDATE_INTERVAL);
	});
```
`src/index.ts:165-180`

What this order gives:

- `http.listen` runs **after** the state and the rules are ready. A request that arrives earlier is refused at the TCP level. That is the safe outcome: there is no window in which a route reads an empty store.
- `initialized` is set by `initState` (`src/store/store.ts:78`), so no rule callback can run before the state loads.

What it does not give:

- `loadMessaging(io)` (line 159) and `loadEvents(io)` (line 162) run **before** the state loads. `loadEvents` starts a database query and can arm scan timers before the rules exist. A scan that completes in that window fires DMX from `performGridScan` (`src/eventhandler.js:241`) with no rules loaded.
- `initStoreSocket(io)` (line 185) runs on the module tick, so `previousData` is captured from the empty pre-`initState` store (`src/store/storeSocket.ts:51`). The first throttled push after `initState` therefore emits `dataUpdate` for **every** blob in the store. That is 671 blobs, each emitted to three rooms, so 2013 emit calls in one tick. [SIDE-EFFECT]
- There is no `.catch` on the fetch. A database failure leaves a process that binds no port and logs nothing after the last startup line. [BUG]
- `loadSwagger(app)` (line 183) registers routes after `errorHandlingMiddleware` (line 156). Express matches in registration order, so the error middleware sits between the application routes and the Swagger routes.
