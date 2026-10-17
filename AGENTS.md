# STAND-HF E-CRF Portal — Unified Agent Guidelines (`AGENTS.md`)

> **Universal Agent Standard**: This file serves as the canonical Single Source of Truth (SSOT) for all AI coding harnesses and models — including **Antigravity (AGY)**, **Claude Code**, **OpenCode**, **Cursor**, and **Copilot**. All harness configurations (`CLAUDE.md`, `GEMINI.md`, `OPENCODE.md`, `.cursorrules`) are symlinked directly to this document to guarantee consistent behavior with zero duplication.

---

## 1. Project Overview & Context

- **Product**: **STAND-HF E-CRF Portal** (Registry Electronic Case Report Form).
- **Domain**: Clinical cardiology registry tracking Heart Failure (HF) patients across multiple medical centres in Pakistan.
- **Sponsor**: Highnoon Laboratories Limited.
- **Developer**: Decoderium Technologies.
- **Current State**: High-fidelity, browser-first interactive prototype (pure HTML/CSS/JS, client-side persistence in `localStorage`/`sessionStorage`), preparing for pilot deployment and subsequent full-stack integration.

---

## 2. Directory Structure & Path Resolution

The repository is structured to support both repo-level and workspace-level execution:

```
Stand-HF/                          <-- Workspace Root
├── docs/                          <-- Comprehensive Specifications (01-20, TASKS.md)
│   ├── 01-overview.md             <-- Study context, phases, objectives
│   ├── 02-requirements.md         <-- Functional & non-functional requirements
│   ├── 03-roles-access.md         <-- 5 user roles & site-scoping rules
│   ├── 04-architecture.md         <-- Tech stack, hosting, data flow
│   ├── 05-data-model.md           <-- Entities, visits, GDMT, events
│   ├── 06-validation-rules.md     <-- Hard errors vs. soft warnings
│   ├── 07-ui-design.md            <-- Screen specifications & tablet UX
│   ├── 15-work-breakdown.md       <-- Detailed module work breakdown
│   ├── 16-dev-task-plan.md        <-- Developer sprint tasks
│   ├── 19-functional-acceptance.md<-- Acceptance criteria per screen
│   ├── 20-build-status.md         <-- Current prototype status & gaps
│   └── TASKS.md                   <-- Modular task tracker (To do / Complete)
├── srs/                           <-- Web Application Git Repository (origin: decoderium-stand-hf-demo-web-app)
│   ├── AGENTS.md                  <-- CANONICAL RULES (This file)
│   ├── CLAUDE.md -> AGENTS.md     <-- Symlink for Claude Code
│   ├── GEMINI.md -> AGENTS.md     <-- Symlink for AGY / Gemini CLI
│   ├── OPENCODE.md -> AGENTS.md   <-- Symlink for OpenCode
│   ├── .cursorrules -> AGENTS.md  <-- Symlink for Cursor
│   ├── docs -> ../docs            <-- Symlink to project documentation
│   ├── index.html                 <-- Root redirect to login/
│   ├── login/index.html           <-- Authentication & role selection
│   ├── setup/index.html           <-- Password setup, verification, and first-time forced change
│   ├── dashboard/index.html       <-- Metrics, follow-up queues, study tiles, role views, export studio
│   ├── records/index.html         <-- Patient registry, visit forms (B, M3, M6), audit, export
│   ├── admin/index.html           <-- User management, site assignments, permissions matrix
│   └── assets/                    <-- Shared design system & script infrastructure
│       ├── base.css               <-- CSS tokens, components, responsive layout
│       ├── access.js              <-- Role permissions, users, sites, session helpers
│       ├── header.js              <-- Global header, connection monitor, notifications
│       ├── nav.js                 <-- Side rail menu & mobile drawer
│       ├── lookups.js             <-- Clinical options, medications, codes
│       ├── dialog.js              <-- Modal dialog utilities
│       ├── file-card.js           <-- Attachment card renderer
│       └── notifications-data.js  <-- Role-scoped mock notifications
```

### Path Resolution Rules
- **When working in `srs/`**: Project documentation is available directly at `./docs/` (symlink) or `../docs/`.
- **When working in `Stand-HF/`**: Web application code is located in `./srs/` and documentation in `./docs/`.

---

## 3. Technology Stack & Core Invariants

1. **Pure Front-End Architecture**:
   - Standard HTML5, CSS3, and modern Vanilla JavaScript (ES6+).
   - **NO build steps or bundlers**: Do NOT introduce npm packages, Webpack, Vite, React, Angular, or Vue into `srs/`. All files run directly in the browser or via any standard static server.
2. **Design System & Styling**:
   - All styling must strictly utilize CSS design tokens defined in [`assets/base.css`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/assets/base.css):
     - Colors: `var(--primary)`, `var(--primary-hover)`, `var(--card)`, `var(--ink)`, `var(--ink-2)`, `var(--border)`, `var(--danger)`, `var(--warn)`, `var(--success)`.
     - Brand accents: `var(--brand-red)`, `var(--brand-magenta)`, `var(--brand-soft)`.
   - Typography: Google Font **Roboto** (`400`, `500`, `700`).
   - Iconography: Google **Material Symbols Rounded** using `<span class="ms">icon_name</span>` (self-hosted locally in `assets/fonts/material-symbols-rounded.woff2` for offline performance).
3. **Responsive & Tablet Priority**:
   - The primary field device is clinical tablets (10" landscape and portrait).
   - Touch targets must be at least 44x44px (`min-height: 44px`).
   - Support orientation changes seamlessly.

---

## 4. Script Loading Order (Strict Dependency Chain)

Every HTML page (`records/index.html`, `dashboard/index.html`, `admin/index.html`) must load scripts in this exact order to prevent runtime errors:

```html
<!-- 1. Access, roles, and session storage -->
<script src="../assets/access.js"></script>

<!-- 2. Dummy notification feeds -->
<script src="../assets/notifications-data.js"></script>

<!-- 3. Domain lookups and file cards (for records / data entry) -->
<script src="../assets/lookups.js"></script>
<script src="../assets/file-card.js"></script>

<!-- 4. Dialog & modal utilities -->
<script src="../assets/dialog.js"></script>

<!-- 5. Header (must specify data-root="../" for relative assets) -->
<script src="../assets/header.js" data-root="../"></script>

<!-- 6. Side navigation and mobile drawer -->
<script src="../assets/nav.js"></script>

<!-- 7. Page-specific logic -->
<script>
  // Page initialization...
</script>
```

---

## 5. Security, Roles & Site Scoping Rules

### 5.1 Role Hierarchy
- **Super Admin (`superadmin`)**: Global system oversight, user/site administration. Cannot directly modify patient clinical visit entries (reserved for clinical staff).
- **Central Team (`central`)**: Oversees all clinical sites, views all patient records, exports study data, marks visits complete.
- **Site Investigator (`investigator`)**: Treats patients at assigned sites. Adds patients and completes visit CRFs for their assigned site(s). By default, `export_data` is disabled (export screen, tab, and buttons are hidden), but can be dynamically enabled/disabled by Super Admin in the Role Permissions Matrix.
- **Study Coordinator**: Assists Site Investigator with data entry at assigned sites.
- **Data Manager**: Validates completeness, issues queries, exports datasets.

### 5.2 Mandatory Site-Scoping & Export Invariant
> [!CRITICAL]
> **Data Isolation & Export Rules**:
> 1. Users with role `investigator` or site-bound roles **MUST NEVER** see, edit, search, or aggregate patient records from any site outside their assigned site list (`mySites()`). Super Admin and Central Team can view records across all sites.
> 2. Users without the `export_data` capability (by default: `investigator`) must never see or access the Data Export Studio, export navigation links, export buttons, or `#export` route. If they attempt to open `#export`, the system redirects them to Overview.

Key helpers in [`assets/access.js`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/assets/access.js):
- `session()`: Returns `{ username, name, role }`.
- `currentUser()`: Retrieves full user profile from store.
- `can(permission)`: Checks role capabilities (e.g., `add_patient`, `enter_data`, `export_data`, `manage_users`).
- `mySites()`: Returns an array of site codes the current user has access to (e.g., `['RIC', 'LHR']`).
- `recordVisible(patient)` / `inScope(patient)`: Returns `true` if the record belongs to the user's permitted sites/ownership.

### 5.3 Authentication Gate
All protected pages must enforce the session gate at the very top of `<head>`:
```javascript
try {
  if (sessionStorage.getItem('standhf_auth') !== '1') location.replace('../login/');
} catch(e) {
  location.replace('../login/');
}
```

---

## 6. Clinical Validation Rules & Conventions

Follow clinical validation specifications in [`docs/06-validation-rules.md`](file:///home/syedhaseeaio/Documents/Stand-HF/docs/06-validation-rules.md):

1. **Hard Errors (Block Save)**:
   - Required fields missing.
   - Patient Name: Minimum 2 characters; letters, spaces, dots, apostrophes, and hyphens only.
   - Contact Number: **Exactly 11 digits** (e.g. 03001234567); non-digits and non-separators stripped as typed.
   - Consent Date: Mandatory date; **cannot be in the future**.
   - Patient Age: Must be between 18 and 150. Values outside this range are rejected.
   - Active GDMT Pillar: Requires generic drug, strength, and frequency selection.
2. **Soft Warnings (Allow Save with Confirmation)**:
   - Age 111–150 triggers an advisory: "Please verify patient age."
   - Extreme physiological or lab values outside standard clinical bounds require verification.
   - Non-active GDMT pillars require at least one documented reason.
3. **Visit Schedule & Form Structure**:
   - **Section B (Clinical & Functional)**: Single card containing Weight, Heart rate, Systolic BP, Diastolic BP, NYHA class, LVEF (%) [N/A at 3M], 1MSTS repetitions, and 1MSTS stop reason. Visit date, Echo date, and 1MSTS repeated are removed from UI.
   - **Section C (Foundational GDMT)**: 4 pillars with Generic drug, Strength dropdown, Frequency dropdown (`OD`, `BD`, `TDS`), and Status dropdown. Choosing a generic drug automatically marks Status as `'Active'`. Start date is removed. On large desktop monitors (>1366px without touch), Strength and Frequency dropdowns sit side-by-side; on tablet and mobile (<=1366px or touch tablets), they shift to vertical stacking so each dropdown expands across 100% of the card width.
   - **Baseline (B)**: Enrollment visit (auto-defaults date to consent date).
   - **Month 3 (M3)**: 90 days ± 14 days from Baseline.
   - **Month 6 (M6)**: 180 days ± 14 days from Baseline.

---

## 7. Model-Agnostic Agent Guidelines

Whether running on **Gemini 2.5/3.8 (Flash / Pro)**, **Claude 3.5/3.7 (Sonnet / Haiku)**, or **OpenAI (GPT-4o / o1)**:

1. **Maintain Code Integrity**:
   - Preserve existing functions, comments, and structure. Do not perform gratuitous rewrites.
   - Maintain the existing naming patterns and DOM helper conventions (e.g., `const $ = id => document.getElementById(id)`).
2. **Check Before Modifying**:
   - Check `docs/TASKS.md` and `docs/20-build-status.md` before implementing features.
   - Avoid introducing duplicate logic across pages; leverage `assets/` shared modules.
3. **Verification Checklist**:
   - [ ] Verify script loading order in any modified HTML page.
   - [ ] Verify role permissions (`can()`) and site scoping (`inScope()`).
   - [ ] Verify responsive layout across tablet (1024px, 768px) and mobile (<640px).
   - [ ] Verify offline handling resilience (no unhandled network errors).
