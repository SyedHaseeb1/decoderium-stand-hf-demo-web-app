# TASKS

Modular task tracker for the STAND-HF E-CRF Portal.

**How to use**
- Tasks are grouped by module. IDs use the module code: `ENV-03`, `REG-02`.
- When a task is done, move the line from **To do** to **Complete** and add the date.
- Priority: **P1** pilot, **P2** Phase 1 full, **P3** Phase 2 or later.
- Owner: fill in when assigned.

**Status as of Oct 18, 2026:** 55 done, 72 to do. Items marked "prototype" are built in the browser-only prototype; server, real backend authentication and database persistence are still to do. Update the counts when tasks move.

---

## To do

### PRJ: Project management
- [ ] PRJ-03 Confirm the pilot scope with the client (P1)
- [ ] PRJ-04 Set up a shared task board or issue tracker (P1)

### ENV: Environment and setup
- [ ] ENV-04 Install PostgreSQL server: `pacman -S postgresql`, initdb, enable service (P1)
- [ ] ENV-05 Free disk space on `/home` (92% used, 17 GB free) (P1)
- [ ] ENV-06 Create the .NET solution and project structure (P1)
- [ ] ENV-07 Set up local test database and seed script (P1)
- [ ] ENV-08 Decide whether Docker is needed for dev (P3)

### ARC: Architecture
- [ ] ARC-01 Decide frontend framework: Blazor WASM, Angular or React (P1, see D-01)
- [ ] ARC-02 Confirm backend stack: ASP.NET Core (.NET 8) and PostgreSQL (P1)
- [ ] ARC-03 Finalise the data model from [05-data-model.md](05-data-model.md) (P1)
- [ ] ARC-04 Define the API contract and error format (P1)
- [ ] ARC-05 Decide the encryption approach for offline drafts (P2)

### AUTH: Authentication and sessions
- [ ] AUTH-02 Implement JWT sessions with expiry (P1)
- [ ] AUTH-03 Account lockout after failed logins (P1)
- [ ] AUTH-07 SSO and MFA, if the client confirms (P2, depends on Q-02)

### ADM: Admin (sites and users)

### ROL: Roles and access control
- [ ] ROL-02 Authorization policy on every API endpoint (P1)
- [ ] ROL-04 Confirm Data Manager and Read-only scope (P1, depends on Q-07)

### REG: Patient registry
- [ ] REG-05 Deactivate patient, not delete (P2, depends on Q-04)

### VIS: Visit forms

### GDM: GDMT module
- [ ] GDM-05 Score at site and study level (P2)

### EVT: Events module

### VAL: Validation
- [ ] VAL-02 Client and server validation with the same rules (P1)
- [ ] VAL-04 Insert confirmed ranges once Q-01 is answered (P1, depends on Q-01)

### AUD: Audit trail
- [ ] AUD-01 Append-only audit table (P1)
- [ ] AUD-03 Required reason on correction (P1)
- [ ] AUD-05 Full audit view with filters (P2)
- [ ] AUD-06 Log exports and role changes (P2)

### EXP: Export
- [ ] EXP-02 Confirm column list with data manager (P1)
- [ ] EXP-03 XLSX export (P2)

### UI: UI and UX
- [ ] UI-09 Full Figma design, if required (P2)

### OFF: Offline and sync (v1.1)
- [ ] OFF-01 Service worker and app shell (P2)
- [ ] OFF-02 IndexedDB local store (P2)
- [ ] OFF-03 Encrypted drafts with Web Crypto (P2, depends on ARC-05)
- [ ] OFF-04 Sync queue and HTTPS sync (P2)
- [ ] OFF-05 Sync status per record (P2)
- [ ] OFF-06 Conflict handling (P2)
- [ ] OFF-07 Request persistent storage (P2)
- [ ] OFF-08 Offline session window (P2, depends on Q-02)
- [ ] OFF-09 Offline test scenarios with throttling (P2)

### DSH: Dashboards (Phase 2)
- [ ] DSH-04 Patient trajectories (P3)

### SEC: Security and compliance
- [ ] SEC-01 Confirm encryption for offline drafts is required, not "where feasible" (P1, depends on Q-10 or FSD fix)
- [ ] SEC-02 Ethics approval confirmed (P1, depends on Q-11)
- [ ] SEC-03 Data-protection plan and retention policy (P1, depends on Q-05)
- [ ] SEC-04 Code review of auth and access control (P1)
- [ ] SEC-05 Dependency scan before each release (P1)
- [ ] SEC-06 Penetration test before full rollout (P2)
- [ ] SEC-07 Confirm 21 CFR Part 11 scope (P2, depends on Q-12)

### QA: Testing
- [ ] QA-01 Unit tests for validation, score and visit windows (P1)
- [ ] QA-02 API tests for auth and site scoping (P1)
- [ ] QA-03 End-to-end test of visit completion (P1)
- [ ] QA-04 Role testing for all five roles (P1)
- [ ] QA-05 Export row-by-row check (P1)
- [ ] QA-06 Tablet test in portrait and landscape (P1)
- [ ] QA-07 UAT with clinical staff (P1)

### DEP: Deployment and operations
- [ ] DEP-01 Choose hosting provider (P1, depends on D-05)
- [ ] DEP-02 Domain and SSL (P1)
- [ ] DEP-03 Managed PostgreSQL and daily backups (P1)
- [ ] DEP-04 Restore test before pilot go-live (P1)
- [ ] DEP-05 CI/CD pipeline to test and pilot (P1)
- [ ] DEP-06 Uptime check and error logging (P1)
- [ ] DEP-07 Versioning and release notes process (P1)
- [ ] DEP-08 Secrets in cloud secret store (P1)

### PLT: Pilot and rollout
- [ ] PLT-01 Choose one or two pilot sites (P1, depends on Q-14)
- [ ] PLT-02 Train pilot users (P1)
- [ ] PLT-03 Run paper CRF in parallel during pilot (P1)
- [ ] PLT-04 Pilot go-live checklist signed off (P1)
- [ ] PLT-05 Review pilot feedback and plan v1.1 (P1)

### DOC: Documentation
- [ ] DOC-01 User guide for coordinators (P1)
- [ ] DOC-02 Admin guide (P1)
- [ ] DOC-03 Developer setup guide (P1)
- [ ] DOC-04 Release notes template (P1)
- [ ] DOC-05 Handover documentation (P2)

### CLI: Client clarifications
- [ ] CLI-01 Q-01 validation ranges (P1)
- [ ] CLI-02 Q-02 auth approach (P1)
- [ ] CLI-03 Q-06 and Q-07 access model (P1)
- [ ] CLI-04 Q-08 audit trail in Phase 1 (P1)
- [ ] CLI-05 Q-09 offline in pilot or v1.1 (P1)
- [ ] CLI-06 Q-10 price status (P2)
- [ ] CLI-07 Q-11 ethics approval (P1)
- [ ] CLI-08 Q-14 pilot sites (P1)

---

## Complete

- [x] PRJ-02 Create git repository and first commit (P1) (prototype, 2026-10-10)
- [x] UI-02 Login screen with role, username and password (P1) (prototype, 2026-10-10)
- [x] UI-03 Investigator dashboard with patient list and status chips (P1) (prototype, 2026-10-10)
- [x] UI-04 Add patient form in the E-CRF screen (P1) (prototype, 2026-10-10)
- [x] UI-05 Patient record screen with three visit tabs (P1) (prototype, 2026-10-10)
- [x] UI-07 Admin screens: dashboard, users, sites, permissions (P1) (prototype, 2026-10-10)
- [x] REG-01 Study ID generation: site code plus sequence (P1) (prototype, 2026-10-10)
- [x] REG-02 Add patient form with consent date, age, sex, etiology (P1) (prototype, 2026-10-10)
- [x] REG-03 Patient list filtered by site (P1) (prototype, 2026-10-10)
- [x] REG-04 Edit patient details with audit (P1) (prototype, 2026-10-10)
- [x] VIS-01 Baseline form: vitals, NYHA, 1MSTS, LVEF, echo date (P1) (prototype, 2026-10-10)
- [x] VIS-02 3M form: vitals, NYHA, 1MSTS, no LVEF (P1) (prototype, 2026-10-10)
- [x] VIS-03 6M form: vitals, NYHA, 1MSTS, LVEF (P1) (prototype, 2026-10-10)
- [x] VIS-04 Due-date and visit-window logic (P1, depends on Q-17) (prototype, 2026-10-10)
- [x] VIS-05 Mark complete and reopen with audit (P1) (prototype, 2026-10-10)
- [x] VIS-06 Patient record view with three visits (P1) (prototype, 2026-10-10)
- [x] GDM-02 Four pillars per visit: drug, dose, start date, status (P1) (prototype, 2026-10-10)
- [x] GDM-03 Active-pillar score 0 to 4 (P1) (prototype, 2026-10-10)
- [x] GDM-04 Incomplete-therapy reasons with "Other" (P1) (prototype, 2026-10-10)
- [x] ADM-01 Create and edit sites (P1) (prototype, 2026-10-10)
- [x] ADM-02 Create, edit and deactivate users (P1) (prototype, 2026-10-10)
- [x] ADM-03 Assign roles and sites to users (P1) (prototype, 2026-10-10)
- [x] ROL-01 Define three roles in code: Super Admin, Site Investigator, Central team (client confirmed three roles) (P1) (prototype, 2026-10-10)
- [x] ROL-03 Site scoping on all patient queries (P1) (prototype, 2026-10-10)
- [x] VAL-01 Hard-error rules and canonical central validator with hard length limits on all fields (P1) (prototype, 2026-10-14)
- [x] VAL-03 Soft warnings with amber notices (P2) (prototype, 2026-10-10)
- [x] AUD-02 Log every correction: who, old, new, timestamp (P1) (prototype, 2026-10-10)
- [x] DSH-01 Recruitment tracking: enrolment by month and site (P3) (prototype, 2026-10-10)
- [x] DSH-02 Missing-visit alerts: overdue follow-up list (P3) (prototype, 2026-10-10)
- [x] ENV-01 .NET SDK 8.0.131 installed (2026-10-09)
- [x] ENV-02 Node 20.20.2, npm and yarn installed (2026-10-09)
- [x] ENV-03 Git 2.55.0 and GitHub CLI installed and authenticated (2026-10-09)
- [x] ENV-09 VS Code installed (2026-10-09)
- [x] PRJ-01 Project docs created in `docs/` (2026-10-09)
- [x] AUTH-01 Implement login with username and password (P1) (prototype, 2026-10-18)
- [x] AUTH-04 Password policy and change-password flow in `setup/` (P1) (prototype, 2026-10-18)
- [x] AUTH-05 Password reset by Super Admin with temporary credentials (P1) (prototype, 2026-10-18)
- [x] AUTH-06 Logout and session timeout in the UI (P1) (prototype, 2026-10-18)
- [x] ADM-04 Enforce site-bound scoping for investigators (1 investigator -> 1 site) (P1) (prototype, 2026-10-18)
- [x] GDM-01 Drug master table, drug-specific strength and frequency dropdowns (P1) (prototype, 2026-10-18)
- [x] EVT-01 HF hospitalization, other hospitalization, death, major intervention (P1) (prototype, 2026-10-18)
- [x] EVT-02 Events only at 3M and 6M (P1) (prototype, 2026-10-18)
- [x] AUD-04 Basic audit view for central roles and summary log (P1) (prototype, 2026-10-18)
- [x] EXP-01 CSV export, one row per patient-visit (P1) (prototype, 2026-10-18)
- [x] EXP-04 Interactive Data Export Studio with zone, centre, period, and visit filters (P1) (prototype, 2026-10-18)
- [x] UI-01 Clickable mockup of key screens with role dashboards (P1) (prototype, 2026-10-18)
- [x] UI-06 Visit form with four sections, tablet layout, sticky intake header, and auto-collapse (P1) (prototype, 2026-10-18)
- [x] UI-08 Brand Logo theme default with theme switcher and high-contrast tokens (P2) (prototype, 2026-10-18)
- [x] DSH-03 GDMT 4-pillar coverage dashboard and adherence analytics (P3) (prototype, 2026-10-18)
- [x] REG-06 Site and investigator dropdown selection with single-item auto-select and no free text (P1) (prototype, 2026-10-18)
- [x] UI-10 Self-hosted Roboto WOFF2 typography and zero-flash shimmer navigation (P1) (prototype, 2026-10-18)
- [x] UI-11 Unified full-screen modal backdrop and blur overlay across shell and frame (P1) (prototype, 2026-10-18)
- [x] API-01 Backend Changelog API service (`/api/changelog`) receiving content lists and suppressing UI dialog (P1) (prototype, 2026-10-18)
- [x] AUTH-08 Login form supporting username and official email with validator.js validation and mixed demo accounts (P1) (prototype, 2026-10-18)
- [x] NOTIF-02 Admin follow-up notification lead threshold configuration with dynamic calculation rule and live notification generator (P1) (prototype, 2026-10-18)
