# Documentation conventions

These documents describe the existing Odysseus backend so it can be rewritten
on a different stack. Every document uses the tags below. Put the tag inline,
next to the thing it applies to.

## Tags

| Tag | Meaning |
|---|---|
| `[PG]` | Needs PostgreSQL. Does not work on SQLite without a rewrite. Say why. |
| `[GIS]` | Needs PostGIS geometry. Stays on PostgreSQL. |
| `[SIDE-EFFECT]` | The code does more than its name says. Writes other tables, emits sockets, fires DMX, starts timers, mutates the Redux store, or calls an external system. |
| `[BOOKSHELF]` | Uses a Bookshelf model feature that plain SQL does not have: relations, virtuals, lifecycle hooks, `hasTimestamps`, serialization. |
| `[STORY-DB]` | Belongs to the Story DB. This becomes a separate system. |
| `[DEAD]` | Unused, unreachable, or superseded code. Give the evidence. |
| `[BUG]` | Defect found while reading. Describe the failure. |

## Rules for writing

- Write in ASD-STE100 simplified technical english. Short sentences. One idea
  per sentence. Active voice. No marketing words.
- Give a file path and line number for every claim: `src/routes/person.js:42`.
- Do not guess. If you cannot tell what code does, write "Unclear:" and say
  what you checked.
- Document what the code does now, not what it should do.
