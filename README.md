# eAM Scheduling Tool

A browser-based maintenance operations scheduling workbench built for Oracle eAM (Enterprise Asset Management) planners and schedulers. Connect directly to Oracle EBS to pull work orders and resources, visually schedule operations across a Mon-Sat work week, and push the completed schedule back to Oracle.

**Two modes:** Direct Oracle EBS integration via SQL proxy (REST API ready for ISG), or standalone Excel import/export.

---

## What's New (v3.0 - Oracle Integration)

### Oracle EBS Connection
- **Direct Oracle integration** - Pull WOs, operations, and resources from Oracle eAM
- **SQL Proxy mode** - Works now via lightweight Node.js proxy (no ISG required)
- **REST API mode** - Future-ready for Oracle ISG deployment
- **Push to Oracle** - Send completed schedule assignments and status updates back to EBS
- **Org-level filtering** - Filter by Oracle organization (e.g., FAC)
- **WO status selector** - Admin configurable: choose which WO statuses to pull (Released, Unreleased, On Hold, etc.)

### Multi-Provider AI Scheduling
- **4 AI providers supported:** Anthropic Claude, OpenAI GPT/o-series, Google Gemini, Groq
- **Latest models auto-populated** in dropdown (Claude Opus 4.6, GPT-4o, Gemini 2.5, etc.)
- **2-stage AI workflow:**
  - **Planner Agent** - Analyzes WOs, matches employee skills to operations, proposes full schedule
  - **Reviewer Agent** - Validates proposed schedule for skill mismatches, capacity overloads, dependency violations. Grades A/B/C
- **Approve/Reject flow** - Preview the AI schedule before committing. Reject undoes all changes
- **Skill-based assignment** - AI reads operation descriptions and matches to employee skills (e.g., "weld frame" -> employee with Welding skill)

### Admin Page
- **Employee skills management** - Assign skills from predefined library or custom tags
- **Supervisor assignment** - Set supervisor per department
- **Custom AI scheduling rules** - Editable text area for shop-specific constraints (e.g., "Never schedule Firestone on Fridays", "PM WOs take priority over CM")
- **Per-user configuration** - Skills and rules saved per admin username in localStorage

### Dashboard (KPI Metrics)
- **3 role-based views:** Planner/Scheduler, Maintenance Manager, Leadership
- **World-class maintenance KPIs:**
  - Schedule Compliance % (target: 90%+)
  - PM Compliance % (target: 95%+)
  - Backlog Weeks (target: 2-4 weeks)
  - Resource Utilization % (target: 85-90%)
  - Planned vs Reactive % (target: 80/20)
  - Overdue WO count and aging
  - Priority distribution analysis
  - Department comparison and supervisor performance

### Plan Week Workflow
- **Week-ahead planning** - Default to current week + 1
- **Confirm WOs for the week** - Drag from backlog (left) to confirmed (right)
- **Dates auto-snap** - When confirming a WO, dates snap to the planning week
- **Original dates preserved** - Remove from confirmed restores Oracle dates
- **Gantt only shows confirmed** - Clean view of just this week's work

### Enhanced Assignment Panel
- **Multi-day assignment** - Check multiple days (Mon-Sat) and assign in one click
- **Multi-employee assignment** - Select multiple employees for the same operation
- **WO dates auto-adjust** - WO start/end dynamically updates based on actual operation assignments
- **Vendor/contractor support** - Operations without BOM resource employees flagged as vendor work

### Export & Email
- **Web Share API** - Email schedule with attachment via native OS share (Outlook, Gmail, Apple Mail)
- **Fallback** - Download + mailto for older browsers
- **Multi-sheet Excel export** - KPI Summary, Work Orders, Capacity, Schedule Summary

---

## Features (Core)

### Scheduling
- **Drag-and-drop** operations from backlog to employee day cells
- **Split assignments** - Assign one operation to multiple employees and/or across multiple days
- **Quick Split buttons** - One-click patterns (1 person x days, people x 1 day, grid)
- **Auto-scheduler** - AI-powered or local scheduling with PM-first priority logic
- **Dependency management** - Finish-to-start dependencies with visual SVG connection lines
- **Status tracking** - Scheduled, In Progress, Complete, Allocated

### PM/CM Classification
- Automatic detection of PM vs CM work orders
- PM-first scheduling within the same priority level
- Visual PM/CM badges throughout the interface

### Views
- **Dashboard** - KPI metrics by role (Planner/Manager/Leadership)
- **Plan Week** - Triage and confirm WOs for the week
- **Gantt** - Timeline view with drag-to-resize, zoom (week/month/quarter)
- **Work Orders** - Detailed WO list with operations and assignments
- **Employees/Resources** - Employee cards with skills, crafts, availability
- **Capacity** - Heatmap and detail table by department/craft/day
- **Summary** - Weekly schedule overview
- **Admin** - Employee skills, supervisors, AI rules, Oracle connection
- **Guide** - Built-in user documentation

### Capacity & Availability
- Per-employee hours-per-day with availability overrides (vacation, sick, reduced hours)
- Resource pool mode for headcount-based planning
- Named mode for individual employee assignment
- Visual load bars showing daily utilization
- Overload warnings when assignments exceed capacity

### Import / Export
- **Oracle EBS** - Direct pull/push via SQL proxy or REST API
- **Excel import** - Any workbook with WO and employee sheets (flexible column matching)
- **Excel export** - Versioned, department-filtered, multi-sheet workbooks
- **Re-importable** - Exported files can be re-imported to restore schedules

---

## Quick Start

### Option A: Oracle EBS Connection (Recommended)

1. **Start the proxy server:**
   ```bash
   npm install oracledb
   node oracle-proxy.js
   ```
2. **Open** `index.html` in Chrome/Edge
3. **Settings** (gear icon) -> Oracle EBS Connection
4. Enter: Host (`192.168.56.102`), Port (`8000`), Protocol (HTTP), credentials, Org ID
5. Set Proxy URL to `http://localhost:3001/api`
6. Select **SQL Proxy** mode -> **Test Connection**
7. Go to **Import Data** -> **Oracle Sync** tab -> **Pull from Oracle**

### Option B: Excel Import (Standalone)

1. **Open** `index.html` in any modern browser
2. **Upload** your Excel workbook with work orders and employees
3. **Schedule** - use Plan Week to confirm, then Gantt to assign

No installation required for Option B.

---

## Oracle Proxy Setup

The proxy server (`oracle-proxy.js`) bridges the browser to your Oracle EBS database:

```
Browser (joeyi) --> localhost:3001 (proxy) --> Oracle DB :1521 (EBSDB)
```

### Requirements
- Node.js 18+
- `oracledb` npm package (thin mode - no Oracle Client needed)
- Network access to Oracle DB on port 1521

### Configuration
Edit `oracle-proxy.js` to set your DB connection:
```javascript
const DB_CONFIG = {
  user: 'apps',
  password: 'apps',
  connectString: '192.168.56.102:1521/EBSDB'
};
```

### Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/query` | POST | Execute SQL against Oracle DB |
| `/api/test` | GET | Test database connectivity |
| `/api/*` | * | Forward to EBS HTTP (REST/ISG) |

---

## Excel Format

### Work Orders Sheet

| Column | Required | Description |
|--------|----------|-------------|
| WO Number | Y | Unique work order identifier |
| Op Seq | Y | Operation sequence number |
| Craft/Resource | Y | Required craft (Mechanic, Electrician, etc.) |
| Est Hours | Y | Estimated hours for the operation |
| Description | | Operation description |
| Department | | Organizational department |
| Priority | | 1-5 (1 = Emergency, 5 = Low) |
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
| Employee Name | Y | Full name |
| Craft/Resource | Y | Trade/craft (must match WO operations) |
| Department | | Organizational department |
| Hours Per Day | | Default available hours (default: 8) |
| Supervisor | | Reporting supervisor |
| Skills | | Comma-separated skill list |

Column names are matched flexibly using pattern matching.

---

## AI Scheduling

### Supported Providers

| Provider | Models | API Key Required |
|----------|--------|-----------------|
| Anthropic | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 | Yes |
| OpenAI | GPT-4o, GPT-4o-mini, o3, o3-mini, o1 | Yes |
| Google | Gemini 2.5 Pro/Flash, 2.0 Flash | Yes |
| Groq | Llama 3.3 70B, Mixtral, Gemma2 | Yes (free tier) |

### 2-Stage Workflow
1. **Planner Agent** reads WOs, operations, employee skills, availability, and your custom rules. Proposes assignments via tool calls.
2. **Reviewer Agent** independently validates the schedule. Checks skill matches, capacity, dependencies. Grades A/B/C.
3. **You approve or reject.** Reject undoes everything.

### Custom Rules (Admin Page)
```
# PM WOs take priority over CM during shutdown weeks
# Never schedule Firestone on Fridays - safety inspections
# Maximum 10 hours per employee per day
# Body Shop: complete brake jobs before cosmetic ops
# Leave 10% capacity buffer for emergency walk-ins
```

---

## Technology

- Single HTML file (~550KB)
- Vanilla JavaScript (no framework)
- [SheetJS](https://sheetjs.com/) for Excel import/export (CDN)
- [oracledb](https://www.npmjs.com/package/oracledb) thin driver for Oracle DB (proxy only)
- LocalStorage for persistence
- Web Share API for email with attachment
- Multi-provider AI: Anthropic, OpenAI, Google, Groq APIs

---

## File Structure

| File | Purpose |
|------|---------|
| `index.html` | Main application (Oracle EBS integrated) |
| `oracle-proxy.js` | Node.js proxy for Oracle DB connection |
| `joeyi_v2_backup.html` | Previous version backup (Excel-only) |
| `eam_scheduler_upload.html` | Original legacy version |
| `eam_scheduler_template.xlsx` | Sample template workbook |

---

## License

**Proprietary** - Copyright (c) 2026 mcdougaj. All rights reserved.

This software is available for evaluation and internal use. Commercial licensing is required for redistribution, SaaS hosting, or multi-site deployment.

See [LICENSE](LICENSE) for full terms. Contact [mcdougaj](https://github.com/mcdougaj) for licensing inquiries.
