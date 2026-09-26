# Feeding the book from a file

**Settings → Feed it from a file**, or `Ctrl+K` → *Feed the book from a file*.

The dialog's own **What the file looks like** prints this same table, built from
the code that validates the file rather than typed out beside it — so the two
cannot disagree. This page exists for whoever is *writing* the file, which is
often not the person pressing the button.

## The promise

- **It adds; it never replaces.** A backup replaces the whole book and is for
  moving it between machines. This adds to the book you are in.
- **The same name is the same record.** A row whose name is already in the book
  is reused rather than copied, and the report marks it *Already here*. That is
  what makes feeding a second file safe: it can name a project the first one
  added, and draw a line to it.
- **Nothing is written until you have read what it would do.** The preview lists
  every record, every line, and everything it cannot use with the reason.
- **It names what it cannot place.** An unknown list, an unknown field, a date
  that is not a date, a reference to nothing, a word outside a vocabulary: each
  is reported against the row it came from. Nothing is guessed at.
- **The apply hands back an undo**, on the message it prints.

## The shape

A JSON object. Every list is optional, so a file may carry one of them or all of
them. The singular reads too — `project` and `projects` are the same list.

```json
{
  "profile": { "name": "…", "headline": "…" },
  "jobs":    [ { "key": "aub", "name": "American University of Beirut" } ],
  "roles":   [ { "name": "GIS analyst", "job": "aub", "startedOn": "2024-02" } ],
  "links":   [ { "a": "project:anfeh", "rel": "uses", "b": "skill:QGIS" } ]
}
```

### `key`, and why a reference is never an id

Nobody writing a file by hand can know the app's own ids, so **a reference to
another record is a name or a key**. `key` is an optional short handle a row
carries so other rows can point at it without writing its name out again; a row
with no `key` is pointed at by its name. **Both spellings always resolve** — a
row carrying `"key": "aub"` and named *American University of Beirut* is
reachable either way, and one line in a file may use one while its neighbour
uses the other.

A reference resolves against **this file and against what is already in the
book**, in that order.

### The lists

| List | Fields |
|---|---|
| `jobs` | `name` `kind` `place` `site` `note` |
| `roles` | `name` `job`→ `startedOn`* `endedOn`* `place` `basis` `note` |
| `education` | `name` `org` `startedOn`* `endedOn`* `result` `note` |
| `training` | `name` `org` `on`* `hours` `kind` `ref` `note` |
| `skills` | `name` `group` `level`¹ `note` |
| `projects` | `name` `job`→ `role`→ `status`² `startedOn`* `endedOn`* `note` |
| `workflows` | `name` `kind` `note` `steps` (a list of names) |
| `runs` | `workflow`→ `project`→ `startedOn`* `endedOn`* `outcome` `note` |
| `actions` | `name` `project`→ `kind`³ `when`* `waitOn` `chaseDays` `chasedOn`* `doneAt`* `note` |
| `people` | `name` `role` `org` `email` `note` |
| `assets` | `name` `kind` `state`⁴ `place` `lastUsedOn`* `path` `url` `note` |
| `outputs` | `name` `kind` `project`→ `on`* `path` `url` `note` |
| `folders` | `name` `folder`→ (the folder it is in, if any) |
| `library` | `name` `kind`⁵ `lang` `body` `path` `url` `topics` (a list) `from` `note` `cite` `folder`→ |
| `portfolio` | `name` `on`* `note` |
| `cvs` | `name` `aim` `note` |
| `hours` | `project`→ `on`** `minutes` `note` |
| `notes` | `name` `kind` (note · meeting · idea) `project`→ `on`** `body` `folder`→ `tags` (a list) |

`→` a name or a key · `*` a date · `**` a full day

1. `level`: `learning` `working` `strong` `teaching` — or left out. Nothing
   infers one.
2. `status`: `active` `waiting` `drifting` `completed` `archived`
3. `kind`: `do` `send` `watch` `file`
4. `state`: `ready` `out` `fixing` `lost`
5. `library.kind`: `script` `formula` `method` `template` `reference` `place`
   `link` `file`. A `file` row is the record only: the bytes of a PDF or a
   picture are dropped onto the page, never carried in a JSON file.

`runs` and `hours` have no name of their own; every other list needs one, and a
row without one is refused by its position in the list.

### Dates

A year, a year and month, or a full day: `2024`, `2024-02`, `2024-02-19`.
`hours.on` wants a full day, because a day's work is logged on a day. A date
that is not a date — `2024-13-99` — is named and its row left out, never stored
to be discovered later on no screen at all.

### `profile`

An object, not a list: `name` `headline` `fields` `interests` `email` `phone`
`site` `place` `summary`. **It fills what is blank and leaves what you have
already written alone**, and the preview says which of the two each field is —
an import may fill a gap and may not rewrite what you typed.

### `library` and a reference

A reference's **name is its title**, the same as when one is typed in, so a row
carrying only a `cite` object is not nameless. `cite` holds `type` plus any of
`authors` `year` `title` `container` `editors` `edition` `volume` `issue`
`pages` `publisher` `place` `institution` `doi` `isbn` `issn` `url` `accessed`
`extra`.

`type`: `article` `book` `chapter` `thesis` `report` `conference` `manual`
`standard` `dataset` `map` `web`.

```json
{ "kind": "reference",
  "cite": { "type": "article", "authors": "Carayon, N.", "year": "2011",
            "title": "Le port antique", "container": "Archaeonautica",
            "pages": "27-46" } }
```

A `body` is **never trimmed at the front** — leading whitespace is what a Python
block means.

### `links`

`{ "a": "kind:name", "rel": "…", "b": "kind:name" }`, where the kind is the
singular (`project:`, `skill:`, `lib:`) and the name is a name or a key.

| `rel` | what it says |
|---|---|
| `uses` | a project, workflow or run uses a skill, an asset or a library entry |
| `learned` | training taught a skill |
| `about` | a library entry is about a skill or a subject |
| `shows` | a portfolio item shows a project, an output or a role |
| `picks` | a CV includes a role, a skill, a project or a training |
| `cites` | an output or a library entry cites a reference |
| `withp` | a project or an action involves a person |

A line already drawn is not drawn twice, so re-feeding a file adds nothing.

## What it will not take

A **whole backup** — one carrying `version`, `settings` and `forgotten`. Adding
one to a book that already holds it would duplicate every record without a
word, so it is refused by name and points at **Restore a backup** instead.
