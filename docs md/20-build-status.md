# 20. Build Status

What the prototype does today, where each part lives, and what is still open. Source: the static web app in the `srs` repository (HTML5, CSS3, modern Vanilla JavaScript, browser persistence via `localStorage`/`sessionStorage`, no external runtime dependencies).

Status date: **18 Oct 2026**.

---

## 1. Pages & Architecture

| Page | Path | Who | What it does |
|------|------|-----|--------------|
| Login | `login/` | All | Role-based tab login (`Site Investigator`, `Central Team`, `Super Admin`), demo account quick-fill, forgot-password support dialog, authentication gate. First-time users or password-reset accounts are automatically forced to `setup/`. |
| Password Setup | `setup/` | All | First-time password initialization and user-driven password updates. Validates minimum length (6+ chars), confirmation match, and updates `localStorage` account flags. |
| Dashboard | `dashboard/` | All signed-in users | **Role-differentiated dashboard**: <br>• **Site Investigator**: Welcome banner with assigned centre, 5 KPI cards (My Patients, New, Baseline Complete %, Follow-ups Due, Pending Sync), 4 dedicated tabs (Overview, Upcoming Visits, Clinical Performance, Assigned Site), quick actions (Add patient, Patient records). Data Export is hidden by default.<br>• **Super Admin & Central Team**: Executive oversight with 5 multi-centre KPI cards, Overview, GDMT 4-Pillar coverage analytics, Site League ranking table, follow-up queue, and interactive **Data Export Studio**. |
| Patient Records | `records/` | Site Investigator, Central Team | Full registry workflow: Patient list with search and badges, intake form with sticky header, visit forms (Baseline, Month 3, Month 6), prescription dropzone/viewer, auto-calculated summary, and audit log. |
| Admin | `admin/` | Super Admin, Central Team | User management (1-investigator-to-1-site scoping, temporary password generation), Site directory (`RIC`, `LHR`, `KHI`, `ISB` with zones), and the **Role Permissions Matrix** (allowing Super Admin to dynamically grant/revoke capabilities like `export_data`). Central Team has read-only administrative visibility. |

### Script Loading Sequence
Every protected HTML page loads scripts in strict order:
1. `access.js` (Roles, permissions, user directory, session storage)
2. `notifications-data.js` (User-scoped notifications)
3. `lookups.js` & `file-card.js` (Domain lookups, GDMT medications, attachments)
4. `dialog.js` (Accessible modal utilities)
5. `header.js` (Top navigation, live network monitor, notifications bell, user profile, theme selector)
6. `nav.js` (Side navigation rail, tablet drawer, Sacuvia sponsor card)
7. Page-specific scripts and event listeners.

---

## 2. Shared Infrastructure

| File | Role |
|------|------|
| `assets/access.js` | Source of truth for users, sites, role permissions, and active sessions. Provides `can()`, `mySites()`, `inScope()`, `currentUser()`, `session()`, and migration handling. |
| `assets/header.js` | Universal topbar: search input, Today / Week / Month period selector (dashboard), network status indicator, notification drawer, theme toggle, user profile avatar, and sign-out. |
| `assets/nav.js` | Side navigation rail on desktop; slide-out drawer on tablets and mobile (<=1024px). Displays STAND-HF branding, Sacuvia™ sponsor badge, and role-scoped navigation links. |
| `assets/base.css` | Complete design system: CSS variables, **Brand Logo Theme** default (`--brand-red`, `--brand-magenta`, `--brand-soft`), classic theme, touch tablet targets (>=44px), card elevation, modals, comboboxes, and responsive breakpoints. |
| `assets/dash-charts.js` | Lightweight SVG chart generation for enrollment trends, GDMT 4-pillar coverage, and clinical score distributions. |
| `assets/lookups.js` | Clinical medication catalogues, generic drug options, standard dosages, frequencies (`OD`, `BD`, `TDS`), NYHA definitions, and discontinuation reasons. |

---

## 3. Patient Records & E-CRF (`records/`)

### Patient List & Tablet Navigation
- Left-hand patient rail with search (by Study ID, patient name, or investigator) and visit status chips (`B`, `3M`, `6M`).
- **Tablet auto-collapse**: When a user taps or focuses any form field on tablet/mobile (<1024px), the patient drawer automatically collapses to give 100% screen width to clinical data entry.

### New Participant Registration
- **Sticky intake header**: Top action bar with "Back to Participant Records" and "New Participant Registration" stays pinned while scrolling.
- **Fields**: Study ID (auto-generated e.g. `RIC-001`), Site (filtered to user's assigned site), Investigator name, Consent date (cannot be in future), Patient name (min 2 characters, letters only), Contact number (strictly 11 digits, non-digits stripped as typed), Age (18–150; warning at 111–150), Sex, HF Etiology (with "Other" specification).
- One-click validation surfaces missing or invalid fields in a summary banner and directly beside each input.

### Longitudinal Visits (Baseline, Month 3, Month 6)
- **Visit schedule**: Month 3 unlocks when Baseline is complete; Month 6 unlocks when Month 3 is complete. Baseline date auto-defaults to consent date; Month 3 window is Day 90 ±14; Month 6 window is Day 180 ±14.
- **Section A (Prescription Attachments)**: Drag-and-drop file upload (PDF, JPEG, PNG up to 10 MB). Displays file cards with thumbnails, download, and deletion (with confirmation and audit logging). Locked visits block file modification.
- **Section B (Clinical & Functional)**: Single card containing Weight (kg), Heart rate (bpm), Systolic BP, Diastolic BP (must be lower than systolic), NYHA class (I–IV), LVEF (%) [captured at Baseline and Month 6; omitted at Month 3], 1MSTS repetitions in 60s, and 1MSTS stop reason. Visit date, Echo date, and 1MSTS repeated have been removed from UI.
- **Section C (Foundational GDMT)**: 4 foundational pillars:
  1. ARNI (Sacubitril + Valsartan)
  2. Evidence-Based Beta-Blocker (Carvedilol, Bisoprolol, Metoprolol Succinate)
  3. MRA (Spironolactone, Eplerenone)
  4. SGLT2 Inhibitor (Dapagliflozin, Empagliflozin)
  - Selecting a generic drug automatically changes status to `'Active'`.
  - Drug-specific strength dropdown and frequency dropdown (`OD`, `BD`, `TDS`).
  - **Responsive stacking**: On tablets and mobile screens (<=1366px or touch devices), Strength and Frequency dropdowns stack vertically to occupy 100% of card width, eliminating horizontal clipping.
  - Non-active pillars require at least one documented clinical reason (Hypotension, Bradycardia, Renal dysfunction, Hyperkalemia, Cost/access, etc.).
  - Auto-calculated active pillar score (0 to 4).
- **Section D (Clinical Events - 3M & 6M only)**: Checkboxes for HF hospitalization, other cardiovascular hospitalization, death, and major cardiovascular intervention.
- **Mark Complete**: Validates all sections, checks for required fields, locks form upon completion.
- **Reopen Visit**: Requires entering an explicit clinical rationale, which is appended to the patient audit trail.

---

## 4. Dashboards & Analytics (`dashboard/`)

### Unified Responsive Architecture
The dashboard automatically renders the appropriate interface based on the signed-in role:

1. **Site Investigator View**:
   - Welcome banner with assigned hospital centre.
   - 5 KPI summary cards: My Patients, New Patients, Baseline Complete %, Follow-ups Due (with alert tag for overdue visits), Pending Sync.
   - Tabs: **Overview** (recruitment chart, upcoming queue preview, recent activity), **Upcoming Visits** (sortable visit queue with contact details and direct E-CRF deep links), **Clinical Performance** (GDMT pillar adherence and vital improvements), **Assigned Site** (centre statistics).
   - Export controls: The "Data Export & Reports" tab and "Data Export" header button are **hidden by default** for Site Investigators.

2. **Executive Oversight View (Super Admin & Central Team)**:
   - 5 National KPI cards: Total Patients Enrolled, New Intake, Baseline Completion Rate, Follow-up Alert Queue, System Sync.
   - Tabs: **Overview**, **Clinical Performance** (comprehensive 4-pillar GDMT breakdown), **Sites & League Table** (centre ranking, recruitment rates, follow-up compliance), **Follow-up Queue**, and **Data Export & Reports**.
   - **Data Export Studio**: Full-featured export hub allowing central users to filter by Zone (`North`, `Central`, `South`), Centre (`RIC`, `LHR`, `KHI`, `ISB`), Date Range, and Visit Type. Supports downloading standardized CSV datasets (Summary and Longitudinal Multi-visit formats).

---

## 5. Administration & Role Governance (`admin/`)

- **Users Management**: Create, edit, and deactivate accounts. Site Investigators are strictly scoped to 1 clinical site. Includes password reset with auto-generated temporary credentials.
- **Sites Management**: Manage registry centres (`RIC`, `LHR`, `KHI`, `ISB`), assign zones, and track active centre status.
- **Role Permissions Matrix (`#perms`)**:
  - Super Admin can dynamically toggle permissions for Site Investigator and Central Team.
  - "Export CSV" is an interactive permission toggle. If Super Admin enables it for Site Investigators, the Export tab and export buttons appear immediately for investigators; if disabled, they are completely removed from the UI.
- **Central Directorate View**: Central Team has read-only administrative access to inspect user assignments and site directories without modifying configurations.

---

## 6. Security, Roles & Site Scoping Status

- **Role Hierarchy**:
  - `superadmin`: Global administrative oversight; cannot alter clinical visit data directly.
  - `central`: National clinical oversight, all-site viewing, data export, visit verification. Read-only in admin.
  - `investigator`: Site-bound clinical staff. Can add patients and complete visits for assigned site only. Export disabled by default.
- **Data Isolation**: Verified in `access.js` (`mySites()`, `inScope()`, `recordVisible()`). Site Investigators can never access records outside their centre.
- **Audit Logging**: All record creations, visit updates, visit re-openings, administrative modifications, and data exports write entries to the audit log with username, timestamp, and action description.

---

## 7. Known Gaps & Next Steps for Full-Stack Integration

| Area | Current Prototype State | Backend / Production Target |
|------|-------------------------|-----------------------------|
| Backend API | Browser client-side storage (`localStorage`) | ASP.NET Core (.NET 8) REST API with PostgreSQL |
| Authentication | Client-side session and temporary passwords | JWT bearer tokens, argon2/bcrypt hashing, rate-limited lockout |
| Offline Sync | Real-time browser connection monitor + pending simulation | Service Worker + IndexedDB queue with background sync |
| File Storage | Browser base64 storage (10 MB limit) | S3-compatible cloud object storage with virus scanning |
| Ethics & Regulatory | Built to GCP and 21 CFR Part 11 principles | Full regulatory sign-off, validation protocol execution |
