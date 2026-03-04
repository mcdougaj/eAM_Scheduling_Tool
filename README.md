# eAM Scheduling Tool

A browser-based maintenance operations scheduling workbench built for Oracle eAM (Enterprise Asset Management) planners. Upload your work order data from a spreadsheet and visually schedule operations to employees across a Mon–Sat work week.

**No server required** — runs entirely in the browser as a single HTML file.

![Schedule Board](docs/screenshot-board.png)

---

## Features

### Core Scheduling
- **Drag-and-drop** operations from backlog to employee day cells
- **Split assignments** — assign one operation to multiple employees and/or across multiple days
- **Quick Split buttons** — one-click patterns for common splits (1 person × days, people × 1 day, grid)
- **Auto-scheduler** — one-click scheduling with PM-first priority logic
- **Dependency management** — finish-to-start dependencies with visual SVG connection lines
- **Status tracking** — cycle through Scheduled → In Progress → Complete

### PM/CM Classification
- Automatic detection of PM vs CM work orders from WO Type and PM flag columns
- **PM-first scheduling** — within the same priority level, PMs are scheduled before CMs
- Visual PM/CM badges throughout the interface

### Schedule Board Views
- **By Employee** — rows are employees, balance workloads
- **By Department** — rows are WOs grouped by dept, supervisor handoff view
- **By Priority** — rows are WOs grouped by priority level, daily standup view
- **By Resource** — rows are employees grouped by craft, capacity planning view

### Capacity & Availability
- Per-employee hours-per-day with availability overrides (vacation, sick, reduced hours)
- Visual load bars showing daily utilization
- Overload warnings when assignments exceed capacity

### Import / Export
- **Import** any Excel workbook with WO and employee sheets (flexible column matching)
- **Export** versioned, department-filtered Excel workbooks
- Filename format: `[Dept]_Schedule_WK[YYYY-MM-DD]_v[N].xlsx`

### Additional Features
- Dark / light theme
- Feature toggles (dependencies, date warnings, PM badges, cross-dept indicators)
- KPI dashboard with utilization, compliance, and backlog metrics
- Built-in user guide (📖 Guide tab)
- Optional AI assistant (requires Anthropic API key)

---

## Quick Start

1. **Download** `eam_scheduler_upload.html`
2. **Open** in any modern browser (Chrome, Edge, Firefox)
3. **Upload** your Excel workbook with work orders and employees
4. **Schedule** — use drag-and-drop, click-to-assign, or auto-schedule

That's it. No installation, no server, no dependencies.

---

## Template

A sample template workbook (`eam_scheduler_template.xlsx`) is included with:
- 24 work orders (14 PM, 10 CM) across 5 departments
- 135 operations with realistic dependencies and hour estimates
- 15 employees across 6 crafts
- Pre-formatted with color coding and instructions sheet

---

## Excel Format

### Work Orders Sheet

| Column | Required | Description |
|--------|----------|-------------|
| WO Number | ✓ | Unique work order identifier |
| Op Seq | ✓ | Operation sequence number |
| Craft/Resource | ✓ | Required craft (Mechanic, Electrician, etc.) |
| Est Hours | ✓ | Estimated hours for the operation |
| Description | | Operation description |
| Department | | Organizational department |
| Priority | | 1–5 (1 = Emergency, 5 = Low) |
| WO Type | | PM, CM, or similar |
| PM | | Yes/No flag for preventive maintenance |
| Asset Number | | Equipment identifier |
| Scheduled Start | | WO start date |
| Scheduled End | | WO end date |
| Supervisor | | Responsible planner/supervisor |
| Dependencies | | Comma-separated predecessor op sequences |

### Employees Sheet

| Column | Required | Description |
|--------|----------|-------------|
| Employee Name | ✓ | Full name |
| Craft/Resource | ✓ | Trade/craft (must match WO operations) |
| Department | | Organizational department |
| Hours Per Day | | Default available hours (default: 8) |
| Supervisor | | Reporting supervisor |
| Skills | | Comma-separated skill list |

Column names are matched flexibly using pattern matching — exact names aren't required.

---

## Split Assignments

Operations can be split across multiple employees and/or days:

- **Click** any backlog op → assign modal opens with row-based builder
- **Quick Split: 1 person × days** — spreads hours across workdays
- **Quick Split: people × 1 day** — splits between craft-matched employees
- **Quick Split: grid** — combines people and days
- **Manual** — add rows, set employee/day/hours per row
- **Assign All** — creates all rows as separate assignments in one click

Partially assigned ops stay in the backlog with remaining hours displayed.

---

## Technology

- Single HTML file (~260KB)
- Vanilla JavaScript (no framework)
- [SheetJS](https://sheetjs.com/) for Excel import/export (loaded via CDN)
- LocalStorage for persistence
- Optional: Anthropic Claude API for AI assistant

---

## License

**Proprietary** — Copyright (c) 2026 mcdougaj. All rights reserved.

This software is available for evaluation and internal use. Commercial licensing is required for redistribution, SaaS hosting, or multi-site deployment.

See [LICENSE](LICENSE) for full terms. Contact [mcdougaj](https://github.com/mcdougaj) for licensing inquiries.
