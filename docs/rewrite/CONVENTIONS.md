# Documentation conventions

These documents describe the existing Odysseus backend so it can be rewritten on a different stack. Every document uses the tags below. Put the tag inline, next to the thing it applies to.

## Tags

| Tag | Meaning |
|---|---|
| `[PG]` | Needs PostgreSQL. Does not work on SQLite without a rewrite. Say why. |
| `[GIS]` | Needs PostGIS geometry. Stays on PostgreSQL. |
| `[SIDE-EFFECT]` | The code does more than its name says. Writes other tables, emits sockets, fires DMX, starts timers, mutates the Redux store, or calls an external system. |
| `[BOOKSHELF]` | Uses a Bookshelf model feature that plain SQL does not have: relations, virtuals, lifecycle hooks, `hasTimestamps`, serialization. |
| `[STORY-DB]` | Belongs to the Story DB. This becomes a separate system. |
| `[BY-DESIGN]` | The behaviour looks like a defect, but it is a deliberate decision. Point to the decision. See the trust model in `00-overview.md`, section 2. |
| `[DEAD]` | Unused, unreachable, or superseded code. Give the evidence. |
| `[BUG]` | Defect found while reading. Describe the failure. |

## Rules for writing

- Write in ASD-STE100 simplified technical english. Short sentences. One idea per sentence. Active voice. No marketing words.
- Keep sentences shorter than 20 words. Split a long sentence into two.
- Give a file path and line number for every claim: `src/routes/person.js:42`.
- Do not guess. If you cannot tell what code does, write "Unclear:" and say what you checked.
- Document what the code does now, not what it should do.

## Rules for markdown

- Do not wrap paragraphs by hand. Write one paragraph on one line. The client that shows the file wraps the text.
- The same rule applies to list items and table rows. One item on one line.
- Wrap only code blocks, because the line breaks are part of the code.

## The trust model

The backend has no authentication, no authorization and no rate limit. This is a design decision. `00-overview.md`, section 2, gives the reasons.

Do not record this as a defect, a risk or a finding. Do not add "Auth: none" to each route. Do not tell the rewrite to add authentication.

You must still record what one request can do. A client defect does the same damage as an attack. Write the effect, not the threat.
