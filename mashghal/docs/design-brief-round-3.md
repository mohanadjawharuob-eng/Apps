# Round-3 UI/UX & interaction specification

**Source.** ChatGPT, the same conversation that produced the twelve-panel
poster, answering `spec-request-round-3.md`. Delivered as
`Mashghal_UI_UX_Interaction_Specification.docx` on 18 September 2026 and
converted here — the tree diagrams and record schemas were Heading-1
paragraphs in the .docx, one line each, and are fenced as code.

**Its companion** is `product-concept-round-3.md`, which describes the system
rather than the screens. They arrived together and answer different halves;
read both.

**What this file is.** A brief — *what was asked for*, not a record of what
the app does. Where it disagrees with `CLAUDE.md`, `CLAUDE.md` is the app and
this is the ask. Several of its proposals were deliberately folded or refused
(eight project tabs into five pages, a per-kind action menu into
`nextActions()`, five hardcoded palette headings into `borrowGroups()`, four
archaeology nouns into one write-in field plus `atId`), and the reasons live in
`CLAUDE.md` rather than here. Nothing in it overrides the six hard constraints
in `spec-request-round-3.md` §2: one HTML file, offline, no dependencies;
no server and no account; nothing invented; figures derived; a 390px phone;
light and dark at 4.5:1 measured.

---

Mashghal — UI/UX & Interaction Specification

Purpose: developer handoff for the existing Mashghal application.

Visual reference: the supplied “My Archaeological Workspace” poster.

Core rule: the poster establishes the visual identity and major information architecture; this document defines what those screens actually do, how they behave, and what data they read.

# Home

## 1. The one question this screen answers

“What matters about my work right now, and where can I continue immediately?”

Home is mission control. It should let the user understand the current state of work quickly and jump directly into something.

## 2. Layout regions, in order

### At laptop width

A. Header — greeting, current date, command bar access.

B. Attention strip — late actions, due-today actions, waiting-on items, unfiled work. This is the priority region.

C. Active Projects — project cards, state, derived progress, next relevant action.

D. Continue Working — last opened project/workflow/asset.

E. Quick Run — frequently used software, workflows, folders/URLs.

F. Recent Things — recently modified/opened assets.

## 3. Every component

Attention item → action/project/person record; tap opens the relevant record.

Project card → project/work/action records; tap opens Project.

Continue Working → activity/history; tap reopens the exact object.

Quick Run → app/connection/workflow records; tap invokes the available launcher/open handle.

Recent Thing → asset/activity records; tap opens asset.

Progress is derived from actual records, never manually stored.

## 4. Row/card anatomy

Left: type icon or state edge.

Main: name + one-line context.

Secondary: project/person/workflow/source.

Right: derived date/figure/status.

Far right: open indicator.

State must be shown by both a coloured left edge and a text pill; never colour alone.

## 5. States

Late — “Late”

Due today — “Today”

Waiting — “Waiting”

Fine — “On track”

Unavailable opener — “This item has no usable open location.”

Missing local path — “The recorded path could not be opened.”

Do not infer additional states.

## 6. Empty-state strings

“Your workspace is empty.”

“Create a project, add a thing, or save something reusable.”

“Nothing needs your attention right now.”

“Nothing has been opened here yet.”

## 7. Phone at 390px

Vertical order: Header → Attention → Active Projects → Continue Working → Quick Run → Recent Things.

Project cards become compact rows. Quick Run becomes a horizontal strip. Recent Things becomes a simple list. Bottom navigation remains fixed.

## 8. What must NOT be on screen

No productivity percentage, productivity heatmap, streaks, predicted completion, motivational scoring, or inferred productivity metrics.

# Projects

## 1. The one question this screen answers

“What bodies of work am I responsible for, and what belongs to each?”

Projects are primary containers for professional context, not merely task lists.

## 2. Layout regions

A. Header — Projects, New Project, search/filter.

B. Project list — biggest region, worst-first.

C. Jobs switcher — employers/claimants; a Job is not a Project.

D. Filters — Active, Waiting, Completed, Archived.

## 3. Components

Project row: identity, state, derived progress, next action, relevant date, Job. Tap opens Project.

New Project should initially require only the information needed to create a project: name, Job if known, optional description/context.

## 4. Row/card anatomy

Left: project icon + state edge.

Main: project name.

Below: description / Job.

Right: derived progress.

Far right: state pill + chevron.

## 5. States

Empty: “No projects yet.”

One: use the available width naturally.

Many: display late/attention-required, active, waiting, completed, archived.

Drifting: only if explicitly marked; never infer it.

Error: “This project could not be opened.”

## 6. Empty-state strings

“No projects yet.”

“Create a project to give your work a home.”

“No jobs recorded yet.”

“Jobs group projects by employer or claimant.”

## 7. Phone

Full-width project rows. Filters become chips or a bottom sheet. Project tabs may horizontally scroll:

Overview · Work · Tasks · Things · People

## 8. What must NOT be on screen

Do not turn Projects into a kanban board. Do not add generic task statistics, project health scores, automatic deadlines, productivity graphs, or unrelated files.

# Project Pages

## 1. The one question this screen answers

“What is this project, what is happening inside it, and what is connected to it?”

## 2. Layout

A. Project identity header.

B. Navigation: Overview · Work · Tasks · Things · People.

C. Active tab content — biggest region.

D. Related/secondary information.

## 3. Components

Overview: description, state, major workflows, attention items, recent outputs, key people.

Work: workflows and runs, current/completed/blocked stages.

Tasks: project-specific actions.

Things: datasets, files, sites, artifacts, surveys, equipment, documents.

People: people associated with the project and what the user is waiting for.

## 4. Row/card anatomy

Left: type/state icon.

Middle: object + context.

Right: date/state/action.

## 5. States

No workflows: “No workflows are attached to this project.”

No tasks: “Nothing is waiting to be done here.”

No things: “No things are connected to this project yet.”

No people: “No people are connected to this project yet.”

Waiting: “Waiting on [person]”

Completed: “Completed”

## 6. Empty-state strings

“This project has no recorded work yet.”

“No workflows are attached to this project.”

“Nothing is waiting to be done here.”

“No things are connected to this project yet.”

“No people are connected to this project yet.”

## 7. Phone

Compact header, horizontally scrollable project navigation, full-width active content. Related Things/People can open as sheets.

## 8. What must NOT be on screen

Do not duplicate the Assets registry inside every project. Project pages show relationships to assets, not copies.

# Workflows

## 1. The one question this screen answers

“What repeatable procedures do I have, and which ones are currently being run?”

A Workflow is a reusable procedure. A Workflow Run is one execution.

## 2. Layout

A. Header — Workflows, New Workflow.

B. Procedure list.

C. Active/recent runs.

D. Templates/reusable workflows.

## 3. Components

Workflow row: name, purpose, step count, connected projects, latest run, run state.

Tap opens the workflow. “Run” creates a Workflow Run from the procedure.

## 4. Row/card anatomy

Left: workflow icon/state.

Main: workflow name.

Below: purpose.

Right: step count / last run.

Far right: Run/Open.

## 5. States

“No workflows yet.”

“Running”

“Waiting”

“Blocked”

“Complete”

“Failed”

A failed run should preserve the failure point rather than simply changing the reusable Workflow.

## 6. Empty-state string

“No workflows yet.”

“Create a procedure you can run again.”

## 7. Phone

Full-width workflow list. Opening a workflow launches the canvas full-screen. Inspector becomes a bottom sheet. Title and run controls remain accessible.

## 8. What must NOT be on screen

Do not make Workflows another task list. The list answers which procedures exist; the canvas answers how the procedure works.

# Workflow Node Canvas

## 1. The one question this screen answers

“What happens, in what order, using which things, and where can the procedure branch?”

## 2. Layout

A. Canvas — overwhelmingly biggest.

B. Top toolbar — Add, Connect, Run, Undo, Redo, Zoom, Fit.

C. Right inspector.

D. Node palette — Software, Files, URLs, GIS tools, Hardware, Human action.

## 3. Components

Process node: cut-corner rectangle, represents an operation.

Thing node: oval, represents a data/object/resource.

Sequence edge: execution/order.

Association edge: relationship.

Node types: Software, File, URL, GIS operation, Script, Hardware, Human action.

### Example

1956 aerial → Georeference raster → project CRS → QA/QC → GeoPackage

## 4. Node anatomy

Header: node type + name.

Body: input/output/context.

Footer: run state.

Ports: connection points.

Selected node receives a clear outline.

## 5. States

“Needs configuration”

“Ready”

“Running”

“Waiting”

“Blocked”

“Complete”

“Failed”

“These nodes cannot be connected.”

## 6. Empty-state

“Start building your workflow.”

“Add a step, then connect it to the thing it uses.”

## 7. Phone

Do not squeeze the desktop canvas into 390px. Keep it pannable with readable minimum node dimensions. Inspector and palette become bottom sheets. Connecting uses explicit Connect mode.

### Long-press node

Edit · Duplicate · Connect · Add related thing · Delete

## 8. What must NOT be on screen

No automatic smart rearrangement, hidden auto-connections, AI-generated workflows, or inferred dependencies. The user owns the procedure.

# Actions

## 1. The one question this screen answers

“What is the next concrete thing that needs to happen?”

Actions include late, unfiled, in-your-hands, waiting-on, typed tasks, recurring upkeep, and manual workflow steps.

## 2. Layout

A. Attention summary — Late, Today, Waiting, Unfiled.

B. Action lists — biggest.

C. Recurring upkeep.

D. Recently completed.

## 3. Components

Action fields: title, type, project, thing, person if waiting, due date if known, completion state, notes.

Tap opens action. Checkbox/toggle can complete directly where no extra information is needed.

## 4. Row/card anatomy

Left: checkbox/state edge.

Main: action + context.

Right: date/status.

Type icon and project/person context underneath.

### Waiting example

“Waiting for Maria — Cyprus training confirmation”

## 5. States

“Late”

“Today”

“Waiting”

“In your hands”

“Unfiled”

“Complete”

“Recurring”

## 6. Empty-state strings

“Nothing needs doing.”

“Actions will appear here when work needs your attention.”

“You are not waiting on anyone.”

“Nothing is unfiled.”

## 7. Phone

Single vertical feed. State groups are collapsible. Completion is one tap. Editing is a sheet. Swipe may expose Complete/Snooze only when appropriate.

## 8. What must NOT be on screen

Do not turn Actions into a calendar. Not every object is an action: a point cloud is a Thing; “inspect the point cloud” is an Action.

# Assets

## 1. The one question this screen answers

“What things does my work depend on, and how can I open or inspect them?”

### Assets are one registry viewed six ways

Devices · Apps · Sites · Files · Library · Connections

## 2. Layout

A. Asset type navigation.

B. Search/filter.

C. Asset list — biggest.

D. Detail drawer/page.

## 3. Components

Every asset has a stable identity and common metadata:

id, type, name, description, createdAt, updatedAt, tags, relationships, openHandle, notes.

Type-specific records provide additional fields.

## 4. Row/card anatomy

Left: type icon.

Main: name.

Secondary: type + project/relationship.

Right: state/date/metadata.

Far right: open indicator.

## 5. States

“Available”

“In use”

“Missing”

“Unknown”

Do not infer availability from age.

## 6. Empty-state

“No assets in this section.”

“Add a thing when your work needs it.”

## 7. Phone

Six sections become horizontal tabs/chips. Rows are full-width. Details open as full-screen sheets/pages.

## 8. What must NOT be on screen

Do not duplicate asset records because the same thing appears in multiple projects. One orthophoto remains one orthophoto; projects point to it.

# Devices

## 1. The one question this screen answers

“What physical equipment do I have or use, and what work is it connected to?”

## 2. Layout

Device type/filter → device list → selected-device details.

## 3. Components

Device: name, type, state, last known use if recorded, software, projects.

Details: specifications, identifiers if deliberately recorded, accessories, manuals, software, projects, maintenance/upkeep, files/notes.

## 4. Row/card anatomy

Left: equipment icon.

Middle: name + type.

Right: state.

Secondary: project/use context and last recorded use.

## 5. States

“Available”

“In use”

“Maintenance”

“Missing”

“Unknown”

## 6. Empty-state

“No devices recorded.”

“Add equipment you use in the field or at the desk.”

## 7. Phone

Compact equipment cards; tap opens detail. Maintenance appears before secondary specifications.

## 8. What must NOT be on screen

No fake battery, automatic location, inferred availability, or IoT dashboard without real hardware integration.

# Apps

## 1. The one question this screen answers

“What software do I use, and can Mashghal get me to it?”

## 2. Layout

Search → categories → application list — largest → selected application details.

## 3. Components

### App record

id, name, category, platform, version, launcher, website, projects, workflows, related library entries.

Tap invokes available launcher.

## 4. Row anatomy

Left: hand-drawn software icon.

Main: app name + purpose.

Right: open arrow/status.

## 5. States

“Installed”

“Web”

“Launcher unavailable”

“Unknown”

## 6. Empty-state

“No applications recorded.”

“Add software you use regularly.”

## 7. Phone

Simple launcher list. Frequent apps may appear at top.

## 8. What must NOT be on screen

Do not pretend Mashghal can launch software without a usable launcher. If it cannot launch:

“No local launcher is recorded.”

# Sites

## 1. The one question this screen answers

“What archaeological or geographic places are part of my work?”

## 2. Layout

Search/filter → site list → selected site summary → relationships.

## 3. Components

### Site

id, name, alternativeNames, location, coordinates, period, siteType, description, projects, surveys, features, artifacts, files, notes.

Only known fields should appear.

## 4. Row anatomy

Left: site icon.

Main: name + site type.

Right: location/status.

Optional small inline SVG extent when coordinates exist.

## 5. States

“Located”

“Location unknown”

“Active”

“Archived”

Do not infer period or site type.

## 6. Empty-state

“No sites recorded.”

“Add a site when a place becomes part of your work.”

## 7. Phone

List first, detail second. Map/extent opens as a sheet.

## 8. What must NOT be on screen

No decorative archaeological map and no invented coordinates/classification.

# Files

## 1. The one question this screen answers

“Where are the actual files my work depends on, and what do they represent?”

## 2. Layout

Search → file type/filter → file list — biggest → file details/provenance.

## 3. Components

### File

id, name, path, extension, size, createdAt, modifiedAt, optional checksum, projectIds, workflowIds, asset relationships.

## 4. Row anatomy

Left: file type.

Main: filename + context.

Right: size/date.

Secondary: project.

Far right: open indicator.

## 5. States

“Available”

“Path unavailable”

“Unknown”

## 6. Empty-state

“No files recorded.”

“Add a file or record one from your work.”

## 7. Phone

Filename gets maximum width. Metadata underneath. Actions become a sheet: Open, Copy path, Rename, Relate, Archive — only where supported.

## 8. What must NOT be on screen

Do not make Files a second file explorer. Mashghal stores knowledge about files and their relationships.

# Library (Asset View)

## 1. The one question this screen answers

“What reusable knowledge have I saved?”

Library must be a real reusable knowledge repository, not merely subject-tagged assets.

## 2. Layout

Search → type filters → subject/purpose filters → recently used → all entries.

## 3. Components

### Entry types

Formula — formula, application, assumptions, example.

Script — language, code, purpose, inputs, outputs, notes.

Method — prose, prerequisites, procedure, cautions, related workflows.

Reference — title, author, publication, type, URL/path, notes.

Template — type, contents/location, usage notes.

## 4. Row/card anatomy

Type icon → title → one-line purpose → subject/type/language.

### Example

“Batch rename archaeological photographs”

Python · File management · Photography

## 5. States

“Reusable”

“Needs review” only if explicitly marked.

“Archived”

“The recorded source could not be opened.”

“Not recorded”

## 6. Empty-state

“Your library is empty.”

“Save a method, script, formula, reference, or template you will want again.”

## 7. Phone

Entry reader: title/type/subject → purpose → content → related project/thing/workflow.

For code: monospace, horizontal scrolling where needed, wrapping off by default, optional line numbers, first part visible, “Show full code”, “Copy code”.

## 8. What must NOT be on screen

Do not create a deep wiki hierarchy. Use type + subject + purpose + search + relationships. Do not turn Library into a generic notes app, bookmark manager, document dump, feed, or AI assistant.

# Connections

## 1. The one question this screen answers

“What external software, services, locations and hardware can Mashghal connect to or open?”

## 2. Layout

Software connections → web services → hardware → paths/locations → status.

## 3. Components

### Connection

id, type, name, target, launcher/open method, associated projects, workflows, assets.

## 4. Row anatomy

Left: connection icon.

Main: name + type.

Right: available/open state.

## 5. States

“Connected”

“Available”

“Unavailable”

“No opener recorded”

## 6. Empty-state

“No connections recorded.”

“Add a software, service, device, or location you use with your work.”

## 7. Phone

Grouped list. Tap opens/tests the available handle where possible. Configuration is a sheet.

## 8. What must NOT be on screen

No fake live status. If offline status cannot be checked:

“Status cannot be checked offline.”

# Schedule

## 1. The one question this screen answers

“What dated work, deadlines and commitments are coming up?”

Schedule is a view of dated records, not the primary data model.

## 2. Layout

A. Month navigation.

B. Month grid.

C. Upcoming list — biggest useful region.

## 3. Components

Calendar days derive from actual project dates, action due dates, meetings/events, workflow dates, training, fieldwork and deadlines.

Tap day → filter Upcoming.

Tap event → open source record.

Nothing is typed directly into the calendar.

## 4. Row/card anatomy

Left: date marker.

Main: event + context.

Right: time/state.

## 5. States

“Nothing is scheduled.”

“Late”

“Today”

“Upcoming”

Undated records stay undated.

## 6. Empty-state

“Nothing is scheduled.”

“Dates appear here when work has an actual date.”

## 7. Phone

Compact month grid. Upcoming is primary. Tapping a day opens a bottom sheet with that day’s events.

## 8. What must NOT be on screen

No predicted dates, estimated completion, productivity heatmaps, automatic rescheduling, or inferred deadlines.

# Outputs

## 1. The one question this screen answers

“What has my work produced, filed, reported, and how much work has been logged?”

## 2. Layout

### Three views

```
Filed
Reports
Hours
```

Output list is primary.

## 3. Components

Filed: file, destination, project, date, filing state.

Reports: title, project, report type, status, file/location.

Hours: time entries with start, end, project, claimant, description.

Hours are calculated from start/end, not stored as authoritative totals.

## 4. Row/card anatomy

Left: output type.

Main: output name.

Right: date/status.

Secondary: project/context/derived value.

### Example

“Tripoli GIS — Historical imagery analysis”

09:00–13:30 · 4h 30m

## 5. States

“Filed”

“Draft”

“Submitted”

“Logged”

“Unfiled”

“No file recorded.”

## 6. Empty-state strings

“Nothing has been filed yet.”

“No reports recorded.”

“No work hours have been logged.”

## 7. Phone

Three segmented controls: Filed · Reports · Hours.

Hours prioritize project, claimant, time interval and derived duration.

## 8. What must NOT be on screen

No salary prediction, productivity score, efficiency score, estimated unpaid hours, invented hourly value, or performance graph.

# Library (Dedicated Section)

## 1. The one question this screen answers

“What have I learned or built once that I want to be able to use again?”

## 2. Layout

Search → type filters → subject filters → recently used → all library entries.

### Search placeholder

“Search methods, scripts, formulas, references…”

## 3. Components

### LibraryEntry base

id, type, title, purpose, subjects, tags, content, language, source, assumptions, projectIds, assetIds, workflowIds, createdAt, updatedAt.

### Type-specific content

method, script, formula, reference, template.

## 4. Row/card anatomy

Shared base card, but type-specific reader/content.

## 5. States

“Reusable”

“Needs review” only when explicit.

“Broken link/path”

“Not recorded”

## 6. Empty-state strings

“Your library is empty.”

“Save something you will want to use again.”

### Add

“What are you saving?”

“Method”

“Script”

“Formula”

“Reference”

“Template”

## 7. Phone

Long entries use a reader. Scripts get monospace code, copy action, source action if available, and relationship actions:

“Add to workflow”

“Link to project”

## 8. What must NOT be on screen

No complex wiki hierarchy, generic notes interface, or AI assistant.

# Command Bar

## 1. The one question this screen answers

“Can I get directly to anything in Mashghal, or ask a deterministic question about my records?”

## 2. Layout

### Modal command surface

A. Search input.

B. Results.

C. Optional result detail.

## 3. Components

Search projects, jobs, actions, workflows, runs, assets, people, library, outputs, schedule and settings where relevant.

### Examples

“Open Tripoli GIS”

“Find the batch rename script”

“What am I waiting for?”

“What is late?”

“What files belong to Tripoli GIS?”

“Which workflows use QGIS?”

“What reports were produced for this project?”

“How many hours were logged for this claimant?”

## 4. Row/card anatomy

Left: type icon.

Main: result name + matching context.

Right: type/context/shortcut.

## 5. States

### Initial

“Search your workspace.”

“Try a project, file, workflow, person, or library entry.”

### No result

“Nothing matched.”

### Ambiguous

“Which one did you mean?”

### Unsupported

“I can search your records, but I cannot answer that from the recorded data.”

## 6. Empty-state

“Search your workspace.”

## 7. Phone

Full-screen modal with keyboard immediately available. Selecting result navigates to destination.

## 8. What must NOT be on screen

No chatbot, generative answers, semantic guessing, AI search, or invented conclusions. Command bar is a deterministic interface to recorded data.

# Settings

## 1. The one question this screen answers

“How does Mashghal behave, store its data, and connect to optional sync?”

## 2. Layout

Appearance → Data/storage → Sync → Behavior → Keyboard/accessibility → About.

## 3. Components

Appearance: Light, Dark, System.

Data: Export workspace, Import workspace, Clear local data.

Sync: optional encrypted GitHub gist mechanism.

Accessibility: reduced motion, text sizing where supported, contrast.

About: Mashghal, version, storage information if known.

## 4. Row/card anatomy

Left: setting icon.

Main: setting + description.

Right: toggle/value/chevron.

Destructive operations require confirmation.

## 5. States

### Sync

“Not configured”

“Configured”

“Last sync: [actual date/time]”

“Last sync: Unknown”

### Import

“The workspace could not be imported.”

### Export

“Workspace exported.”

## 6. Empty-state

“Sync is not configured.”

“Your workspace is stored locally on this device.”

“No workspace data to export.”

## 7. Phone

Single-column settings. Destructive operations use full-width confirmation sheets. Long sync configuration uses sequential sheets.

## 8. What must NOT be on screen

No account profile, team management, permissions, notifications, server settings, API-key management, or AI settings.

# Cross-App Interaction Rules

Row tapping should be consistent by object type, not universally identical.

Record → open record.

Executable/openable thing → invoke its open handle.

Editor object → select it.

The visual affordance should tell the user which behavior applies.

# Drag And Drop

Use drag only where it expresses a real relationship.

### Good

- workflow node → canvas

- workflow connection → node port

- asset → project relationship

- library entry → workflow/project

- file → project/workflow

### On phone, replace most drag operations with

Select → “Move/Link to…” sheet

Do not use dragging merely to reorder importance or silently change dates.

# Keyboard

Ctrl/Cmd + K — Command bar

Ctrl/Cmd + N — New item in current section

Ctrl/Cmd + S — Save/commit current edit

Ctrl/Cmd + Z — Undo

Ctrl/Cmd + Shift + Z — Redo

Esc — Close/cancel

/ — Focus search when no text field is active

Enter — Open selected result

Space — Toggle selected action

Delete — Delete selected item after confirmation

# Workflow Canvas Interaction Model

Add Node → palette → choose type → node appears at current viewport center. Do not automatically connect it.

Connect → select source → select destination → choose edge type if ambiguous.

Branching is allowed: one process node can have multiple outgoing sequence edges.

Loops are allowed and should visually distinguish backward connections.

### Desktop right-click and phone long-press

Edit · Duplicate · Connect · Add related thing · Disconnect · Delete

Routine reversible actions should not require confirmation. Destructive operations should. Undo should be available where appropriate.

# Visual System

Keep the deep navy identity while implementing a genuine light theme.

Use one identity colour per section.

State = coloured left edge + word pill.

Body text contrast must meet 4.5:1.

### More visual

- project progress geometry

- survey/site extent sparkline or crop when actual geometry exists

- small provenance graphs

- workflow canvas

- restrained derived time visualization

Avoid decorative maps/photos/illustrations where data-driven visuals are possible.

# Iconography

Every icon is a hand-written inline SVG. No icon library.

Icons should be simple and secondary to text.

# Density

### Dense

Assets, Actions, Projects, Workflows, command results, Equipment, Connections.

### Open

Project Overview, Library reader, Method pages, Output detail, Settings, empty states.

### Principle

“Dense for scanning. Open for understanding.”

# Motion

Default transition: 120ms.

Use slightly more motion only where spatial change matters, especially workflow canvas pan/zoom/selection.

Always honor prefers-reduced-motion.

# Data Model Recommendation

Do not make every screen its own database. Use canonical records and relationships.

### Conceptual structure

```
Workspace
├── Jobs
├── Projects
│   ├── Workflows
│   ├── Actions
│   ├── People
│   ├── Assets
│   └── Outputs
├── Workflows
│   ├── Nodes
│   ├── Edges
│   └── Runs
├── Actions
├── Assets
│   ├── Devices
│   ├── Apps
│   ├── Sites
│   ├── Files
│   ├── Library Entries
│   └── Connections
├── People
├── Schedule records
└── Outputs
├── Filed
├── Reports
└── Time Entries
```

## Project

```
Project {
id
name
description
jobId
status
startDate
endDate
createdAt
updatedAt
}
```

### Relationships

```
project.workflowIds[]
project.actionIds[]
project.assetIds[]
project.personIds[]
project.outputIds[]
```

## Job

```
Job {
id
name
description
claimantId
status
}
```

A Job can contain multiple Projects.

## Person

```
Person {
id
name
organization
contactMethods[]
notes
}
```

```
PersonRelationship {
personId
projectId
purpose
status
outstanding
}
```

## Action

```
Action {
id
title
type
projectId
personId
assetId
workflowRunId
dueDate
completedAt
status
recurringRule
notes
}
```

### Types

```
task
waiting
unfiled
in_hand
upkeep
workflow_manual_step
```

Do not store a separate isLate boolean. Derive it from dueDate, completion and current date.

## Asset

```
Asset {
id
type
name
description
createdAt
updatedAt
}
```

### Typed records

```
FileAsset
DeviceAsset
AppAsset
SiteAsset
LibraryAsset
ConnectionAsset
```

## Workflow

```
Workflow {
id
name
description
version
}
```

```
WorkflowNode {
id
workflowId
type
label
positionX
positionY
config
}
```

```
WorkflowEdge {
id
workflowId
fromNodeId
toNodeId
type
}
```

### Edge types

sequence

association

```
WorkflowRun {
id
workflowId
projectId
startedAt
completedAt
status
}
```

```
WorkflowRunNode {
runId
nodeId
status
startedAt
completedAt
outputAssetIds[]
}
```

## Library Entry

```
LibraryEntry {
id
type
title
purpose
subjects[]
tags[]
content
language
source
assumptions
projectIds[]
assetIds[]
workflowIds[]
createdAt
updatedAt
}
```

### Types

```
method
script
formula
reference
template
```

## Time / Hours

```
TimeEntry {
id
projectId
claimantId
startedAt
endedAt
description
}
```

Duration = endedAt - startedAt.

Claimant totals = sum of relevant TimeEntry durations.

Do not store totalHours as authoritative.

# Relationships Are The Core

Mashghal is not simply Projects + Tasks + Files + Notes.

### It is a network of relationships

```
Person
  ↓ waiting on
Project ─ Workflow ─ Software
│          │
│          └─ uses
│             Thing
│               ↓
├──────────── Output
│
└──────────── Action
```

```
Library Entry
├─ came from PROJECT
├─ explains WORKFLOW STEP
├─ applies to ASSET
└─ reusable elsewhere
```

# Derived Selectors

Build the data model and derived selectors before building screen-specific calculations.

### Useful selectors

getProjectProgress(projectId)

getProjectActions(projectId)

getProjectThings(projectId)

getProjectPeople(projectId)

getLateActions()

getWaitingActions()

getUnfiledActions()

getUpcomingSchedule()

getProjectOutputs(projectId)

getLibraryEntriesBySubject()

getLibraryEntriesByType()

searchLibrary(query)

getWorkflowRuns(workflowId)

getClaimantHours(claimantId)

Every screen should use the same derived functions so that the same figure/state is identical everywhere.

# Final Product Mental Model

PROJECTS explain WHY the work exists.

WORKFLOWS explain HOW the work is carried out.

ACTIONS explain WHAT HAPPENS NEXT.

ASSETS represent WHAT THE WORK IS MADE OF AND MADE WITH.

PEOPLE represent WHO IS INVOLVED OR WHO THE USER IS WAITING ON.

LIBRARY stores WHAT IS WORTH REUSING.

OUTPUTS record WHAT THE WORK PRODUCED.

SCHEDULE shows WHEN KNOWN DATES OCCUR.

HOME shows WHAT MATTERS RIGHT NOW.

COMMAND BAR provides DIRECT ACCESS TO THE WHOLE WORKSPACE.

Underneath all of it is one workspace connected by relationships.

### Implementation principle

Do not build the UI first and invent data underneath it. Build canonical records, relationships, and shared derived selectors first; then make each screen a view over that same underlying workspace.
