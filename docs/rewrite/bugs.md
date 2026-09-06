# Known defects

Every defect found while writing the rewrite documentation. The detail for each
one stays in the document that found it. This file is the index.

**Verification column:**
- **Verified** — the code was read again and the defect confirmed in this
  session. The reproduction is stated.
- **Reported** — found during documentation, cited to a file and line, but not
  independently re-checked. Confirm before you act on it.

Severity is about the effect on a live game, not about how bad the code looks.

## Summary

| # | Defect | Location | Severity | Verification |
|---|---|---|---|---|
| 1 | `artifact_entry.artifact_id` foreign key points at `person.id` | `db/migrations/20190612214620_artifact-updates.js:14` | Critical | Verified |
| 2 | A throwing rule kills the process and skips the state save | `src/store/store.ts:76` | Critical | Verified |
| 3 | `?force=false` forces the write | `src/routes/data.js:107,130` | High | Verified |
| 4 | `PATCH /data/:type/:id` always returns 409 | `src/routes/data.js:130` | High | Verified |
| 5 | `GET /sip/contact/:id` ignores `:id` and returns every contact | `src/routes/sip.js:45` | High | Verified |
| 6 | `PUT /science/artifact/entry` does not await the insert | `src/routes/science.js:91` | High | Verified |
| 7 | `moveShips` does not wait for the ship saves | `src/models/ship.js:288` | High | Reported |
| 8 | Duplicate Socket.IO emits on post and vote writes | `src/models/post.js:33` + `src/routes/post.js:56` | High | Verified |
| 9 | `GET /story/person/:id` returns 400 for every survivor | `src/routes/story-admin.ts:128` | High | Reported |
| 10 | `PUT /event` responds with and emits the pre-update object | `src/routes/event.js:37` | High | Reported |
| 11 | `return` instead of `continue` in the infoboard poller | `src/rules/social/infoboard.js:26,29` | Medium | Verified |
| 12 | `return` instead of `continue` in the vote poller | `src/rules/social/votes.js` | Medium | Reported |
| 13 | `VoteEntry` declares a single-column key for a composite key | `src/models/vote.js` | Medium | Reported |
| 14 | `GET /log/audit` ignores its page-size parameter | `src/models/log.js:72` | Medium | Reported |
| 15 | Dynasty filter tests the wrong column | `src/models/person.js:261` | Medium | Reported |
| 16 | `GET /person/groups` returns bare id strings | `src/models/person.js:37` | Medium | Reported |
| 17 | `Grid` declares `hasTimestamps` but the table has no such columns | `src/models/ship.js:26` | Medium | Reported |
| 18 | `Event.setActive` does not return its promise | `src/models/event.js` | Medium | Reported |
| 19 | `BloodTestResult.fetchWithRelated` does not return its result | `src/models/artifact.js` | Medium | Reported |
| 20 | `PUT /science/artifact` swallows every non-duplicate error | `src/routes/science.js:65` | Medium | Verified |
| 21 | `GET /story/plots` is not wrapped in `handleAsyncErrors` | `src/routes/story-admin.ts:143` | Medium | Reported |
| 22 | `PUT /infoboard/priority` collapses every row to one priority | `src/routes/infoboard.js:20` | Medium | Reported |
| 23 | `activate()` commits before the work it guards | `src/models/ship.js:95` | Medium | Reported |
| 24 | Story message send is not atomic | `src/models/story-messages.ts` | Medium | Reported |
| 25 | Lost timers strand game state after a restart | 5 sites, see below | Medium | Reported |
| 26 | `PUT /person/:id/entry` lets the body override the path owner | `src/routes/person.js:223` | Medium | Reported |
| 27 | Private message falls back to a namespace broadcast | `src/messaging.ts` | Medium | Reported |
| 28 | `setHullHealthPercent` throws before the first poll | `src/integrations/emptyepsilon/client.ts:171` | Medium | Reported |
| 29 | Vote percentage divides by zero | `src/rules/social/votes.js:49` | Low, latent | Verified |
| 30 | `axios` config object sent as the request body | `odysseus-admin` `src/components/Fleet.vue:502,517,529` | Low, client | Reported |
| 31 | DMX section dividers collide with channel 0 | `src/dmx.ts:12` | Low | Reported |
| 32 | Dead credential-bearing code block | `odysseus-HANSCA` `src/store.js:69-166` | Low, client | Reported |

Related but not defects: the `box` and `task` tables are dead while the live
Redux store uses the same two names as blob types. See `database-schema.md`.

---

## Critical

### 1. `artifact_entry.artifact_id` foreign key points at `person.id`

**Location:** `db/migrations/20190612214620_artifact-updates.js:14`

```js
t.string('artifact_id').references('id').inTable('person').notNullable();
```

The column must reference `artifact.id`. It references `person.id`.

**Why it has never failed:** survivor person ids happen to span the small
artifact id range, so every artifact id written so far also exists as a person
id. The constraint passes by coincidence.

**Effect:** the database does not protect artifact entries. An entry can point
at an artifact that does not exist. Deleting a person cascades into artifact
entries that have nothing to do with that person.

**This needs a decision, not just a fix.** Correcting the foreign key can fail
against existing data, because some `artifact_id` values may have no matching
`artifact` row. Copying the schema faithfully carries the defect into the new
system. Before choosing, run:

```sql
SELECT COUNT(*) FROM artifact_entry ae
LEFT JOIN artifact a ON a.id = ae.artifact_id
WHERE a.id IS NULL;
```

A count of zero means the fix is safe to apply directly.

---

### 2. A throwing rule kills the process and skips the state save

**Location:** `src/store/store.ts:76`

```js
setTimeout(() => callback(currentObject, myPrevious, currentState), 0);
```

There is no `try/catch`. An exception in a rule callback is thrown from a bare
timer callback.

`grep -rn "uncaughtException\|unhandledRejection" src/ db/` returns nothing.
The only process handlers are `SIGINT` and `SIGTERM`
(`src/store/storePersistance.ts:42-43`).

**The two facts compound.** An uncaught exception raises no signal, so it does
not run the shutdown handler that is the only code that saves the Redux state
on exit. A rule that throws therefore kills the backend **and** discards
everything written since the last 5-second throttled flush.

`src/rules/helpers.js` shows the authors knew about this: `interval()` and
`timeout()` both wrap their callbacks in `try/catch`. `watch()` does not.

**Known reachable throw sites:** `src/rules/boxes/airlock.js:48`,
`src/rules/tasks/box-game-tasks.js:39`, `src/rules/tasks/box-game-tasks.js:44`.
All three are reachable from an ordinary unauthenticated
`POST /data/:type/:id` with a malformed body.

**Fix needs three parts:** catch per rule callback, install a process-level
handler, and make persistence not depend on a clean shutdown.

---

## High

### 3. `?force=false` forces the write

**Location:** `src/routes/data.js:107` and `:130`, with `src/routes/data.js:17`

```js
const { force } = req.query;      // a string, not a boolean
setData(type, id, data, force);
```
```js
export function setData(dataType, dataId, data, force = false) {
	if (!force) { /* version check */ }
```

`req.query.force` is the raw query-string value. The string `"false"` is
truthy, so `!force` is false and the version check is skipped. Every value
bypasses optimistic locking, including `false`, `0` and `no`. Only omitting the
parameter enforces it.

**Effect:** a client that passes `force=false` to be explicit gets the opposite
of what it asked for, and silently overwrites concurrent changes.

---

### 4. `PATCH /data/:type/:id` always returns 409

**Location:** `src/routes/data.js:130`

```js
const data = { ...getData(type, id), ...{ version: undefined }, ...req.body };
setData(type, id, data, force);
```

The spread sets `version` to `undefined`. Unless the body carries its own
`version`, `data.version` stays `undefined`. `setData` then compares
`oldData.version !== data.version`. The reducer assigns a version to every blob
on first write, so `oldData.version` is always set and the comparison always
fails.

**Effect:** `PATCH` on any existing blob returns 409 unless the caller supplies
a `version` in the body or passes `force`. The documented purpose of the route
— "Keeps those fields which are not present in payload" — does not work as
described.

---

### 5. `GET /sip/contact/:id` ignores `:id` and returns every contact

**Location:** `src/routes/sip.js:44-48`

```js
const sipContact = await SipContact.forge({ id: req.params.id }).fetchAll();
if (!sipContact) throw new NotFound('Tag not found');
res.json(sipContact);
```

Three defects in four lines:

1. `fetchAll()` returns the whole collection. The `id` given to `forge()` is not
   used as a filter. The route returns every SIP contact.
2. `if (!sipContact)` never fires. A Bookshelf collection is always truthy, even
   when empty, so the 404 is unreachable.
3. The error message says "Tag not found", copied from `src/routes/tag.js`.

`GET /tag/:id` shows the correct shape: `.fetch()` with a `where`.

---

### 6. `PUT /science/artifact/entry` does not await the insert

**Location:** `src/routes/science.js:91`

```js
artifactEntry = ArtifactEntry.forge().save(req.body, { method: 'insert' });
```

The `await` is missing on the insert branch only. The update branch beside it
has one.

**Effect:** `res.json(artifactEntry)` serialises a Promise, so the client gets
`{}` instead of the saved row. The response is sent before the write completes,
so a failed insert is never reported and the request looks successful.

---

### 7. `moveShips` does not wait for the ship saves

**Location:** `src/models/ship.js:288`

```js
await Promise.all([ships.map(ship => ship.moveTo(...))]);
```

The array of promises is wrapped in another array. `Promise.all` receives one
element, which is an array, not a promise, and resolves immediately.

**Effect:** `POST /fleet/move` responds before the ships have moved.

---

### 8. Duplicate Socket.IO emits on post and vote writes

**Location:** `src/models/post.js:33-39` and `src/routes/post.js:56,60`

The `Post` model's `initialize()` registers `on('created')` and `on('updated')`
hooks that emit `postAdded` and `postUpdated`. The route then emits the same
two events again through `req.io`. Clients receive each event twice. The same
pattern exists for votes.

**Note for the migration:** this is the Bookshelf trap in its clearest form.
The hooks are invisible at the call site. A plain-SQL rewrite drops them and
leaves only the route emit — which is the correct behaviour, but reached by
accident rather than by decision. Pick one emission point deliberately.

---

### 9. `GET /story/person/:id` returns 400 for every survivor

**Location:** `src/routes/story-admin.ts:128`

The response schema requires `medical_elder_gene` to be a boolean. The column
is NULL for every survivor, so validation fails and the route returns 400.

---

### 10. `PUT /event` responds with and emits the pre-update object

**Location:** `src/routes/event.js:37`

The saved model is never assigned back to the outer variable, so both the JSON
response and the `eventUpdated` socket payload carry the stale object. Clients
that trust the emit show the old value until they refetch.

---

## Medium

### 11 and 12. `return` instead of `continue` in the pollers

**Location:** `src/rules/social/infoboard.js:26,29`

```js
for (const infoEntry of activeInfoEntries.models) {
	const closesIn = new Date(infoEntry.get('active_until')) - Date.now();
	if (closesIn < 1) return await closeInfoEntry(infoEntry);
	if (closesIn > POLL_FREQUENCY_MS * 2) return;
	...
}
```

Both statements exit the whole function instead of moving to the next entry.

**Effect:** line 26 closes at most one expired entry per poll. Line 29 is worse,
because it depends on collection order — the first entry that expires far in the
future ends the loop, so every entry after it never gets a close timer and stays
on the board past its `active_until`.

`src/rules/social/votes.js` has the same defect.

### 13. `VoteEntry` declares a single-column key for a composite key

The real primary key is `(person_id, vote_id)`
(`db/migrations/20181207151445_social-initial.js:75-82`), but the model declares
`idAttribute: 'person_id'`. Any Bookshelf operation that addresses a row by id
can match the wrong row.

### 14. `GET /log/audit` ignores its page-size parameter

The route passes `{ page, pageSize }`, but `fetchPageWithRelated`
(`src/models/log.js:72-78`) reads only `page` and hardcodes `pageSize: 50`. The
same method also issues conflicting `orderBy` calls.

### 15. Dynasty filter tests the wrong column

`src/models/person.js:261` filters `whereRaw('status IS NOT NULL')` in the
`dynasty` distinct query, copied from the `status` query above it. It should
test `dynasty IS NOT NULL`.

### 16. `GET /person/groups` returns bare id strings

The `Group` model overrides `serialize()` to return `this.get('id')`
(`src/models/person.js:37-39`). `res.json()` calls `toJSON()`, which calls
`serialize()`, so the endpoint returns a plain array of strings instead of
group objects.

### 17. `Grid` declares `hasTimestamps` but the table has no such columns

`src/models/ship.js:26` sets `hasTimestamps: true`. The `grid` table has no
`created_at` or `updated_at`. Any save through the model writes columns that do
not exist.

### 18 and 19. Methods that do not return their promises

`Event.setActive` and `BloodTestResult.fetchWithRelated` both omit `return`.
Callers that `await` them get `undefined` immediately and continue before the
work is done.

### 20. `PUT /science/artifact` swallows every non-duplicate error

`src/routes/science.js:63-70` catches around the insert, matches only the
duplicate-catalog-id message, and falls through with `artifact` still
`undefined`. The route then responds 200 with an undefined body. Any other
failure is invisible to the caller.

### 21. `GET /story/plots` is not wrapped in `handleAsyncErrors`

`src/routes/story-admin.ts:143` is the only route in the file without the
wrapper. A rejection there is an unhandled rejection rather than a 500.

### 22. `PUT /infoboard/priority` collapses every row to one priority

The update targets all rows where `priority > 0` rather than one row by id.

### 23. `activate()` commits before the work it guards

`src/models/ship.js:95-105` calls `trx.commit()` inside the first `.then()`,
before the DMX, log and socket work runs. The trailing
`.catch(() => trx.rollback())` cannot roll back a committed transaction, so a
later failure leaves the commit in place.

### 24. Story message send is not atomic

`upsertMessage` marks the message `sent: 'Yes'` before the send can fail. A
failed send leaves a message recorded as sent.

### 25. Lost timers strand game state after a restart

In-memory timers with no persistence. A restart inside the window leaves state
stuck:

| Timer | Location | Stuck state after restart |
|---|---|---|
| Artifact calibration speedup | `src/rules/artifacts/artifact.ts:106` | `ship/calibration.multiplier` stays at 100 forever |
| Grid or object scan | `src/eventhandler.js:99,150` | Scan never completes, probe already spent, `event.is_active` stays true |
| Post-jump UI re-enable | `src/rules/ship/jump.js:208,212` | `jump_ui_enabled`, `social_ui_enabled`, `infoboard_enabled`, `ee_sync_enabled` all stay false — three player UIs stay dark |
| DMX channel reset | `src/dmx.ts:229` | Channel stays at its fired value |
| Hacker intrusion detection | `src/routes/person.js:106` | Alert never fires |

`rules-engine.md` has the full table of 42 timers.

### 26. `PUT /person/:id/entry` lets the body override the path owner

The spread order means a `person_id` in the body wins over the path parameter,
so an entry can be written against a different person than the URL names.

### 27. Private message falls back to a namespace broadcast

`src/messaging.ts` broadcasts to the whole `/messaging` namespace when the
recipient is offline. A private message becomes visible to every connected
client.

### 28. `setHullHealthPercent` throws before the first poll

`src/integrations/emptyepsilon/client.ts:171` multiplies by a cached
`shipHullMax` that is unset until the first successful poll. A call in the first
second after start throws.

---

## Low and latent

### 29. Vote percentage divides by zero

`src/rules/social/votes.js:49`:

```js
results.forEach(result => result.votesPercentage =
	Math.round((result.votes / results[0].votes) * 100));
```

`results` is sorted descending, so `results[0].votes` is the maximum. The
`totalVotes === 0` guard at line 31 returns early, so this is not reachable in
the ordinary no-votes case.

**It is reachable when vote entries exist but none match any option of this
vote** — orphaned `vote_option_id` values, or nulls. Then the maximum is 0 and
every percentage becomes `NaN`. Ranked low because it needs inconsistent data,
but a rewrite should guard the divisor anyway.

### 30. `axios` config object sent as the request body

`odysseus-admin`, `src/components/Fleet.vue:502`, `:517`, `:529`. The third
argument shape is wrong for these calls, so the config object is sent as the
body. Client-side defect, listed because the rewrite touches these endpoints.

### 31. DMX section dividers collide with channel 0

`src/dmx.ts:12-177` uses pseudo-entries such as `__JUMP_DRIVE_SIGNALS__: 0` as
section headers inside the channel map. They are indistinguishable from a real
channel 0.

### 32. Dead credential-bearing code block

`odysseus-HANSCA`, `src/store.js:69-166`. Unreachable code that still contains
credentials. Remove it rather than porting it.

---

## Where the detail lives

| Area | Document |
|---|---|
| Route defects, groups A and B | `routes-fleet-starmap-person.md`, `routes-science-data-misc.md` |
| Schema and foreign keys | `database-schema.md` |
| Model and Bookshelf defects | `models-bookshelf.md` |
| Rules, timers, cascades | `rules-engine.md` |
| Ranked side effects | `side-effects-catalog.md` |
| Story DB defects | `story-db.md` |
| Client-side defects | `api-consumers.md` |
