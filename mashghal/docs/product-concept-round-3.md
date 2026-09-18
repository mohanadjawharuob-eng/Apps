# Round-3 product concept and system description

**Source.** ChatGPT, the same conversation that produced the twelve-panel
poster. Delivered as
`Mashghal_Product_Concept_and_System_Description.docx` on 18 September 2026
and converted here — the tree diagrams and record schemas were Heading-1
paragraphs in the .docx, one line each, and are fenced as code.

**Its companion** is `design-brief-round-3.md`, which specifies the screens.
This one says what the system IS: the relationship model, the node types, the
data model, and the reality rules.

**What this file is.** A brief, with the same standing as its companion —
where it disagrees with `CLAUDE.md`, `CLAUDE.md` is the app. It is the fullest
statement anyone has written of what Mashghal is FOR, which is why it is kept
verbatim rather than summarised. Its §29 ("What Mashghal Is Not") and
§28 (the reality rules) are the two sections most worth re-reading before
adding anything.

---

# Mashghal — My Archaeological Workspace

Concept and Product Description

A personal operations system for archaeological, GIS, maritime, photogrammetry, fieldwork, and research workflows.

# 1. What Mashghal Is

Mashghal is a personal workspace designed around how one person actually performs professional technical and archaeological work. It is not primarily a calendar, task manager, note-taking application, file manager, or generic project-management tool.

The central idea is that professional work is made of connected things: projects, procedures, datasets, files, archaeological sites, equipment, software, people, references, actions, and outputs. Mashghal brings those things into one workspace and makes their relationships visible and usable.

The mental model is: a hub for everything related to work.

Instead of replacing specialized applications such as QGIS, ArcGIS Pro, RealityScan, CloudCompare, SonarWiz, Python, Excel, or field-data applications, Mashghal organizes and connects the work that happens across them.

# 2. The Core Structure

Mashghal is organized around seven primary concepts.

Projects — why the work exists and the professional context surrounding it.

Workflows — how the work is carried out as procedures and repeatable processes.

Actions — what needs to happen next, including manual work and things the user is waiting for.

Assets — the things the work uses or produces: datasets, files, sites, artifacts, features, surveys, devices, applications, and other resources.

People — people involved in projects or people whose response/action is required.

Library — reusable knowledge such as methods, scripts, formulas, references, and templates.

Outputs — what the work produces, including filed material, reports, and logged hours.

Schedule is a derived view over dated records, while the command bar provides direct access across the workspace.

# 3. The Relationship Model

The important part of Mashghal is not the individual modules. It is the relationships between them.

A project can contain workflows, actions, people, assets, and outputs. A workflow can use software, files, URLs, hardware, scripts, and human actions. An asset can belong to multiple projects and be used by multiple workflows. A library method can explain a workflow step and be reusable in another project.

Conceptually:

Project → Workflow → Actions → Assets → Outputs

Project → People → Waiting/communication

Workflow → Software / Files / URLs / Hardware / Human actions

Library Entry → Project / Workflow / Asset

Time Entry → Project → Job / Claimant

# 4. Projects — The Context Layer

A Project is the main container for a body of professional work. It answers: What am I working on, why does it exist, and what belongs to it?

A project can contain:

Objectives and description

Tasks and actions

Workflows and workflow runs

Datasets and files

Maps and spatial information

Sites, artifacts, features, or surveys

People and organizations

Software and services

Equipment

Notes and references

Outputs and reports

Deadlines and milestones

Activity/history

A project should feel like a living workspace rather than a static folder.

# 5. Jobs and Projects

A Job groups work for an employer, organization, claimant, or other professional context. A Job can contain multiple Projects.

This distinction is important because a project represents the work itself, while a Job represents the larger professional relationship or source of the work.

# 6. Workflows — The ModelBuilder for the User

The Workflow Builder is one of Mashghal's defining ideas. It is inspired by the visual logic of ArcGIS ModelBuilder, but it is intended to describe the user's entire working process, not only GIS geoprocessing.

A workflow can represent a procedure such as:

Find the source dataset → copy it → inspect it → reproject it → process it → QA/QC → export → archive.

Import photographs → organize them → rename them → process them in RealityScan → inspect the reconstruction → export point cloud → create orthophoto.

Load aerial imagery → georeference → assign project CRS → digitize → validate → export GeoPackage → upload to Portal.

The workflow therefore becomes a visual representation of how the user works.

# 7. Workflow Node Types

Workflows can combine different kinds of nodes.

## GIS nodes

```
Buffer
Clip
Union
Intersect
Dissolve
Rasterize
Reproject
```

Calculate Field

Spatial Join

DEM/contour operations and other GIS processing

## Software nodes

Open QGIS

Open ArcGIS Pro

Open RealityScan

Open CloudCompare

Open SonarWiz

Open Python or another recorded application

## File nodes

```
Find
Import
Copy
Move
Rename
Convert
Export
Backup
Archive
Compress
```

Watch a folder

## URL/service nodes

Open ArcGIS Online/Portal

Open a project site

Open documentation

Open a database or recorded web service

## Script nodes

```
Python
PowerShell
Bash
SQL
```

QGIS scripts

Processing models

## Hardware nodes

Connect GPS

Connect camera

Connect SSD

Connect survey equipment

Use field equipment

## Human action nodes

Inspect anomalies

Review a result

Confirm a coordinate

Take photographs

Check field notes

Contact a researcher

Verify an interpretation

# 8. Workflow Runs

A Workflow is a reusable procedure. A Workflow Run is one actual execution of that procedure.

This distinction allows Mashghal to preserve the original procedure while recording what happened during a particular run.

Not started

```
Ready
Running
Waiting
Blocked
Complete
Failed
Skipped
```

A failed run should preserve where the failure occurred rather than changing the reusable workflow itself.

# 9. Reusable Workflows

A workflow should be reusable across projects. Inputs, outputs, variables, coordinate systems, quality requirements, and project-specific values should be configurable rather than hard-coded into the procedure.

This allows the same general process to be reused for different surveys, sites, datasets, or projects.

# 10. Assets — The Things the Work Is Made Of

Assets are semantic objects rather than merely files.

The same registry is viewed through six useful categories:

```
Devices
Apps
Sites
Files
Library
Connections
```

Examples of assets include an orthophoto, point cloud, aerial photograph, GeoPackage, archaeological site, survey, artifact, feature, camera, GPS, laptop, external SSD, QGIS installation, ArcGIS Portal connection, or reusable method.

# 11. Asset Relationships

Assets become useful when their relationships are recorded.

An archaeological site can be connected to surveys, photographs, notes, features, artifacts, projects, and outputs.

A photogrammetry project can connect source photographs, a RealityScan project, a point cloud, mesh, orthophoto, and QA/QC actions.

A GIS project can connect aerial imagery, historical maps, building footprints, GeoPackages, maps, software, and Portal locations.

An equipment record can connect to projects, workflows, manuals, accessories, software, maintenance, and last recorded use.

# 12. Equipment Management

Mashghal should treat equipment as part of the professional workspace, not as an unrelated inventory list.

Potential equipment records include cameras, GPS receivers, total stations, MBES systems, side-scan sonar, ROVs, laptops, tablets, external SSDs, field kits, and related accessories.

Equipment records can contain specifications, manuals, drivers, software, accessories, projects, workflows, maintenance/upkeep, and recorded use.

Where technically possible, an equipment connection may be represented as an executable connection. Mashghal must not pretend that hardware is connected, available, located, or functioning unless that information is actually known.

# 13. Connections — More Than Bookmarks

Connections link Mashghal to the external tools and places where work actually happens.

Desktop applications

Web applications and services

Local files and folders

Project directories

ArcGIS Online/Portal

Cloud/document locations

Hardware

Documentation and external references

A connection can contain an opening method or launcher. When the user chooses an asset, Mashghal can use its open handle to open a URL, launch a local application, open a file, navigate to a path, or copy a path when that is the supported operation.

A connection is therefore an operational relationship, not simply a saved bookmark.

# 14. Workbench — The Place to Actually Work

The Workbench is a context-rich working surface. It brings the relevant pieces of a project together so the user does not have to repeatedly navigate between unrelated records.

A Workbench context may include:

Current project

Current workflow

Relevant datasets/files

Map or GIS context

Notes

Tasks/actions

People

Relevant URLs

Software launchers

Recent or related assets

The Workbench should make it possible to have the work context in one place while specialized applications remain responsible for specialized operations.

# 15. Knowledge Library

The Library is the user's reusable knowledge base. It is not simply a place for miscellaneous notes.

It can contain:

Methods and procedures — for example, how to georeference historical aerial imagery.

Scripts — Python EXIF extraction, batch renaming, ArcPy, GDAL, PowerShell, SQL, etc.

Formulas — spreadsheet formulas and the assumptions behind them.

References — papers, manuals, standards, tutorials, documentation, and useful links.

Templates — report skeletons, metadata sheets, naming conventions, field forms, and other reusable structures.

Library entries should be connectable to projects, datasets/assets, and workflow steps. The purpose is to allow knowledge developed during one project to become reusable in another.

# 16. Actions — What Happens Next

Actions represent concrete things that need to happen. They are deliberately different from assets.

Examples:

Inspect the point cloud.

Georeference the 1956 aerial imagery.

Upload the GeoPackage to Portal.

Check building polygons.

Contact a researcher.

Wait for a response.

Archive the completed dataset.

Perform recurring equipment upkeep.

A point cloud is an Asset. Inspecting the point cloud is an Action.

# 17. People and Waiting

People are first-class records because professional work often depends on people.

Mashghal should be able to represent who is involved with a project, what their relationship is to the work, and when the user is waiting for something from them.

A waiting state should remain explicit rather than being inferred from inactivity.

# 18. Schedule

The calendar is a component of Mashghal, not its foundation.

Schedule is a derived view over actual dated records such as deadlines, meetings, training, fieldwork, milestones, equipment bookings, and workflow dates.

The same underlying date must produce the same information wherever it appears. Undated work remains undated rather than receiving an estimated date.

# 19. Outputs

Outputs represent what the user's work produced.

Filed material and destinations

Reports and report files

Maps and processed datasets

Other documented outputs

Logged work hours

Hours can be recorded through time entries with start/end times, project, claimant, and description. Total hours should be calculated from those entries rather than manually maintained as an authoritative figure.

# 20. Provenance and History

Mashghal should preserve useful provenance around important assets and outputs.

For example, a final orthophoto could be connected to its source photographs, photogrammetry project, processing software, processing date, project, and output location.

The purpose is not to duplicate the files, but to preserve the story of how the work moved from source material to result.

# 21. Templates

Common archaeological and technical procedures should be reusable as templates.

Site documentation

Photogrammetry processing

GIS project setup

Survey recording

Metadata creation

Report creation

File naming and organization

Fieldwork preparation

# 22. Field Mode

The mobile version should become especially useful during fieldwork.

Field Mode can focus on:

Current project

GPS/location where available

Photographs

Field forms

```
Observations
Measurements
Notes
```

Offline data

Current survey

Equipment

Quick actions

The mobile interface should be simpler than desktop, but it should operate on the same underlying workspace.

# 23. Desktop and Mobile

Desktop is optimized for complex work: workflow construction, GIS/data work, automation, large datasets, and detailed project management.

Mobile is optimized for fieldwork, quick actions, photographs, GPS, notes, forms, task updates, and monitoring.

The two interfaces should not become separate applications. They are different views over the same workspace.

# 24. Search and Command

Mashghal needs a universal command/search interface so the user does not have to remember where every object lives.

The command bar can search projects, workflows, actions, assets, people, files, library entries, outputs, schedule records, software, and connections.

It can also answer deterministic questions based only on recorded workspace data, such as:

What am I waiting for?

What is late?

Which workflows use QGIS?

What files belong to this project?

Find the script that renames photographs.

What reports were produced for this project?

How many hours were logged for this claimant?

The current product specification intentionally does not require AI/model features. Search and command behavior should therefore be deterministic and based on the recorded workspace.

# 25. Automation

An important long-term role for Mashghal is to connect a sequence of actions that normally requires repetitive manual coordination.

For example:

Detect new photographs → rename → organize → backup → open processing software → process → export → move result → create/associate output → create QA action.

Automation should be explicit, inspectable, and logged. The system should not silently invent actions, dependencies, dates, or statuses.

# 26. Archaeological Data Model

As the workspace becomes more archaeology-specific, Mashghal can represent archaeological entities as first-class assets.

```
Site
Survey
Feature
Artifact
```

These entities can then participate in the same relationship system as files, projects, equipment, workflows, people, and outputs.

# 27. Local-First Architecture

The actual current application is deliberately lightweight and local-first.

One HTML file.

Offline operation.

No required server.

No required account.

No required backend.

No runtime dependency on external libraries, CDNs, or fetched assets.

Data stored locally in the browser/device.

Optional encrypted GitHub gist synchronization.

No mandatory cloud workspace or team-sharing system.

This architecture keeps the workspace under the user's control and makes offline operation a first-class requirement.

# 28. Data Ownership and Reality Rules

Mashghal should never pretend to know something it does not know.

Unknown information should be represented explicitly as unknown. The application should not estimate or average missing values, infer productivity, predict completion dates, or silently create statuses from elapsed time.

Derived figures should be calculated from canonical records. If a figure appears in two parts of the application, both places should use the same calculation.

# 29. What Mashghal Is Not

Not just a calendar.

Not just a task manager.

Not just a file manager.

Not just a note-taking application.

Not simply a project-management board.

Not a replacement for QGIS, ArcGIS Pro, RealityScan, CloudCompare, SonarWiz, Python, or other specialist software.

Not a generic productivity dashboard.

Not a team-management platform.

Its purpose is to sit above and between these tools as the user's personal operational hub.

# 30. The Product Mental Model

PROJECTS — explain WHY the work exists.

WORKFLOWS — explain HOW the work is carried out.

ACTIONS — explain WHAT HAPPENS NEXT.

ASSETS — represent WHAT the work is made of and made with.

PEOPLE — represent WHO is involved or who the user is waiting on.

LIBRARY — stores WHAT IS WORTH REUSING.

OUTPUTS — record WHAT THE WORK PRODUCED.

SCHEDULE — shows WHEN KNOWN DATES OCCUR.

HOME — shows WHAT MATTERS RIGHT NOW.

COMMAND BAR — provides DIRECT ACCESS TO THE WHOLE WORKSPACE.

# 31. The Bigger Picture

Mashghal is best understood as a personal operating system for archaeological and technical work.

The goal is not to make another application in which the user manually records everything they do. The goal is to create a coherent workspace in which the things that already exist in professional work become connected.

A project should know which workflows belong to it. A workflow should know what it uses. An asset should know where it is used. A person should be connected to the work that depends on them. A reusable method should be available from the workflow step where it matters. An output should retain its relationship to the work that produced it.

The result is a single workspace that gives the user a persistent operational map of their professional life while still allowing specialized tools to do the specialized work.

# 32. Implementation Principle

Build the workspace model before building isolated screens.

Use canonical records for Projects, Jobs, People, Actions, Assets, Workflows, Workflow Runs, Library Entries, Schedule records, Outputs, and Time Entries.

Then build relationships and shared derived selectors over those records.

The interface becomes a set of views into the same workspace rather than a collection of disconnected modules.

The simplest description of the product is therefore:

Mashghal is a hub for everything related to work.
