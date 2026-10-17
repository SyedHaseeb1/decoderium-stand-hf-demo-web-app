# 07. UI Design

Design principles: fast clinical entry in outpatient departments, minimum clicks and cognitive load, tablet and laptop friendly, dropdowns and structured lookups over free text `[BRIEF s2, s6]`.

Updated: **Oct 18, 2026**.

---

## 1. Primary Screen Specifications

| # | Screen | Purpose | Prototype Status |
|---|--------|---------|------------------|
| 1 | **Login** (`login/`) | Role tabs (`Site Investigator`, `Central Team`, `Super Admin`), username and password, quick-fill demo credentials, forgot-password support modal, session gating. | **Complete**. Enforces first-time password setup redirection. |
| 1b | **Password Setup** (`setup/`) | First-time password setup and voluntary user password changes. Validates length (6+ chars) and confirmation match. | **Complete**. Direct return to role dashboard upon success. |
| 2 | **Site Investigator Dashboard** (`dashboard/`) | Personal outpatient clinical hub: 5 KPI tiles, Overview recruitment chart, Upcoming visits queue, Clinical performance, and Assigned centre details. | **Complete**. Role-scoped to the investigator's assigned centre. Export controls are hidden by default. |
| 3 | **New Participant Registration** (`records/?new=1`) | Structured intake: auto-generated Study ID, site selector, investigator name, consent date, patient name, 11-digit contact number, age, sex, etiology. | **Complete**. Sticky header bar with quick return to records. |
| 4 | **Participant Records & CRFs** (`records/`) | Longitudinal registry: patient list with search and badges, Baseline (B), Month 3 (M3), Month 6 (M6) visit CRFs, summary, and audit log. | **Complete**. Auto-collapsing list on tablet input; 4-pillar GDMT titration; prescription attachments. |
| 5 | **Executive Dashboard** (`dashboard/`) | National oversight for Super Admin and Central Team: 5 study KPIs, national recruitment curves, GDMT 4-pillar coverage, Site League Table, and follow-up alert queue. | **Complete**. Integrated interactive dashboard. |
| 6 | **System Administration** (`admin/`) | User management (1-investigator-to-1-site scoping, password resets), Site directory, and the **Role Permissions Matrix** (`#perms`). | **Complete**. Super Admin edits; Central Team has read-only administrative inspection. |
| 7 | **Data Export Studio** (`dashboard/#export`) | Comprehensive data extraction studio: filter by Zone, Centre, Date Range, Visit Type, and format (Summary vs. Detailed). | **Complete**. Gated by `export_data` permission. Site Investigators do not see this screen by default. |
| 8 | **Audit Trail** (`records/` & `admin/`) | Full tracking of patient record modifications, visit reopenings, user management actions, and data export events. | **Complete**. Integrated in patient summary tabs and admin logs. |

---

## 2. Navigation Structure

- **Desktop Sidebar Navigation Rail**:
  - Pinned on the left side, collapsible to compact icon mode with persistent state (`localStorage`).
  - Top header displays the official STAND-HF brand logo.
  - Dedicated sponsor card displays **Powered by Sacuvia™ (Sacubitril + Valsartan)** (`sponsor-logo.png`).
- **Tablet & Mobile Drawer (<=1024px)**:
  - Slide-out drawer opened from the topbar menu button, with a darkened backdrop scrim.
  - Tapping outside or selecting a destination automatically closes the drawer.
- **Role Scoping in Navigation**:
  - *Site Investigator*: General (Dashboard, Add new patient, Participant records), Reports (Performance, Sites & League). "Data Export" is omitted by default.
  - *Super Admin & Central Team*: General (Dashboard, Participant records), Reports (Performance, Sites & League, Data Export), Administration (Users & Teams, Sites, Permissions). "Add new patient" is omitted (clinical intake is reserved for investigators).

---

## 3. Clinical Visit Form Architecture

The longitudinal visit CRF uses a single scrollable workflow divided into four structured sections:

1. **Section A: Prescription Attachments**:
   - Drag-and-drop dropzone supporting PDF, JPEG, and PNG (up to 10 MB per file).
   - Generates document cards with image thumbnails, PDF icons, download actions, and confirmed removal. Locked visits lock attachment operations.
2. **Section B: Clinical & Functional Assessment**:
   - Single unified card: Weight (kg), Heart rate (bpm), Systolic BP, Diastolic BP, NYHA class (I–IV), LVEF (%) [captured at Baseline and Month 6; omitted at Month 3], 1MSTS repetitions in 60s, and 1MSTS stop reason.
   - Non-clinical metadata (Visit date, Echo date, 1MSTS repeated) are removed from the UI.
3. **Section C: Foundational GDMT**:
   - 4 foundational cards: ARNI (Sacubitril + Valsartan), Beta-Blocker, MRA, SGLT2 Inhibitor.
   - Generic drug dropdown, drug-specific strength dropdown, frequency dropdown (`OD`, `BD`, `TDS`), and status dropdown. Selecting a drug automatically marks status as `'Active'`.
   - **Responsive Dropdown Stacking**: On tablet and mobile viewports (<=1366px or touch tablets), Strength and Frequency dropdowns stack vertically to occupy 100% card width, eliminating horizontal truncation.
   - Incomplete pillars require at least one documented clinical reason.
4. **Section D: Clinical Events (3M & 6M only)**:
   - Structured checkboxes for Heart Failure hospitalization, Other cardiovascular hospitalization, Death, and Major cardiovascular intervention.
5. **Action Bar**:
   - Pinned at bottom: "Mark visit complete" (validates mandatory fields and locks the form) and "Reopen visit" (requires documented clinical justification).

---

## 4. Tablet & Clinical Outpatient Usability

- **Touch Target Standard**: All interactive buttons, tabs, comboboxes, and form inputs maintain a minimum touch area of **44x44px** (`min-height: 44px`).
- **Auto-Collapsing Patient Drawer**: On tablet and mobile screens (<1024px), focusing or tapping any form field in patient records automatically collapses the left-hand patient list to maximize screen real estate.
- **Sticky Intake Header**: In New Participant Registration mode, the top action bar stays permanently visible while scrolling through demographic inputs.
- **Visual Feedback**:
  - Real-time inline field validation and top-level error summary banners.
  - Soft warnings (amber alert badges) for extreme physiological values (e.g. LVEF >40%, age >110).

---

## 5. Visual Styling & Themes

- **Brand Logo Theme (Default)**:
  - Deep cardiology navy background accents with vibrant brand red (`var(--brand-red)`) and magenta (`var(--brand-magenta)`).
  - High-contrast clinical cards, crisp borders (`var(--border)`), and readable typography (Google Font Roboto 400/500/700).
- **Classic Theme**:
  - Accessible via the header theme toggle, utilizing traditional clinical blue accents.
- **Offline & Connectivity Pill**:
  - Real-time network monitor in top header. Switches between "Online" (green) and "Offline" (amber bar at top of page) with automatic reconnection handling.
