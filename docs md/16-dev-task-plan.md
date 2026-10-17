# 16. Developer Task Plan (with dependencies)

Two developers. Each has one ordered list of tasks. Work down the list. Each task says what it **needs** (must be merged first) and what it **can start with** (a stub if the need is not merged yet).

- **Dev 1: Access and admin.** Login, home shell, users, roles, sites, site assignment, then audit and export.
- **Dev 2: Dashboard and data forms.** Dashboard data per role, then patient registry, visit forms, GDMT, events. The forms are built once and used by everything else.

Sources: FSD v1.0 section 2 (Scope of Work), SRS v1.0 Phase 01 and 02, [03-roles-access.md](03-roles-access.md), [07-ui-design.md](07-ui-design.md).

---

## Shared start (days 1 to 2, both devs)

| ID | Task | Owner | Done when |
|----|------|-------|-----------|
| S-01 | Project setup: .NET 8 API, PostgreSQL, EF Core, CI | Dev 1 | API starts, DB migrates, CI runs on each PR |
| S-02 | Shared contracts: role enum (SuperAdmin, CentralTeam, SiteInvestigator), user context (user id, role, site ids), permission keys, error format, User, Site, Patient, Visit entities | Dev 1 writes, Dev 2 reviews | Both devs compile against it, merged to main |
| S-04 | File store for prescription uploads, encrypted at rest. Location TBC (Q-21) | Dev 1 | a file can be saved and read back by ID, scoped to its site |
| S-03 | Dev 2 reads the role-visibility table in [07-ui-design.md](07-ui-design.md) and [03-roles-access.md](03-roles-access.md). No code yet | Dev 2 | Questions noted for the client |

Dev 2 starts real work on day 2 while Dev 1 finishes S-01 and S-02.

---

## Dev 1: Access and admin

Order matters here. Users need roles. Site assignment needs both users and sites. Work top to bottom.

| # | ID | Task | Needs first | Can start with | Done when |
|-|--|--------------------------------------|-----------------|-----------------|------------------------|
| 1 | 1.1 | **Login:** username and password, returns a JWT with role and site claims | S-01, S-02 | nothing | Correct login returns token. Wrong login returns 401 with no hint which field failed |
| 2 | 1.2 | **Lockout and session timeout:** lock after N failed logins (N from config, TBC). Idle timeout | 1.1 | nothing | Locked account rejected. Timeout length from config |
| 3 | 1.3 | **Password:** change password, password policy, Super Admin resets a user's password | 1.1 | nothing | Weak password rejected. Reset forces change at next login |
| 4 | 1.4 | **Home shell:** login lands on home. `GET /me` returns role and sites. Role gate on menus and routes | 1.1 | fake user context | Each role sees only its own menu items |
| 5 | 1.5 | **Users:** Super Admin creates, edits, deactivates users. Deactivated user cannot log in | 1.1, 1.4, S-02 | nothing (sites assigned later) | Create and deactivate work. Deactivate, never delete |
| 6 | 1.6 | **Roles and permissions:** three roles. Permission matrix stored per role. Super Admin row is fixed. Guard rules: Super Admin cannot change own role or deactivate own account; at least one active Super Admin; Central team cannot manage Super Admin or Central accounts | 1.5 | nothing | Matrix edits saved. Each guard rule returns a clear error and has a test |
| 7 | 1.7 | **Sites:** Super Admin creates, edits, deactivates sites (never delete) | 1.4 | nothing | Deactivated site keeps its patients. Super Admin can still read them |
| 8 | 1.8 | **Assign sites to users:** one user can have many sites. Site Investigator gets only assigned sites | 1.5, 1.7 | nothing | Site Investigator assigned to site X sees only X in `/me` |
| 9 | 1.9 | **Central team manages investigators:** adds Site Investigators, assigns their sites, switches access on or off. Sees only investigators in the user list | 1.6, 1.8 | nothing | Central team's user list returns investigators only |
| 10 | 1.10 | **Site scope on every endpoint:** `ISiteScope` filters patient and visit queries by the caller's sites. Shared with Dev 2 | 1.8 | fake sites | A site user cannot read or write another site's patient by guessing an ID |
| 11 | 1.11 | **Audit writer:** append-only audit table and writer. Used by login, roles, users, sites | S-01, 1.1 | nothing | Writer has no update or delete path. Test confirms it |
| 12 | 1.12 | **Audit view:** central roles see changes per patient and per user. Site users get 403 | 1.11 | nothing | Site Investigator gets 403. Central team sees all |
| 13 | 1.13 | **CSV export:** one row per patient-visit, scope-checked, each download logged | 2.5, 2.6, 2.7 (forms), 1.10 | nothing | Row count equals visit count. Download creates an audit row |

Dev 1 picks up 1.11 and 1.12 as soon as tasks 1 to 10 are merged, which is while Dev 2 is still on the forms. Task 13 waits for the forms.

---

## Dev 2: Dashboard and data forms

Dashboard first, because it only reads data and shows what each role may see. Then the forms, which are built once and reused. Dev 2 can start all of this without waiting for login, using a fake user per role.

| # | ID | Task | Needs first | Can start with | Done when |
|-|--|--------------------------------------|-----------------|-----------------|------------------------|
| 1 | 2.1 | **Dashboard data per role:** study statistics, patient worklist with Baseline, 3M and 6M status and next due date, overdue visits. Each role's response follows the section table below | S-02 | fake user per role (Super Admin, Central team, Site Investigator), seeded sites | Each role's response matches the table. Tested for all three roles |
| 2 | 2.2 | **Seed data:** synthetic sites, patients at each visit stage. Used by every test after this | S-02 | nothing | Seed runs twice without error |
| 3 | 2.3 | **Patient registry:** add patient, auto Study ID from site code, required fields (patient name, contact number, consent date, investigator, age, sex, etiology), list and edit with reason | 2.2, 1.8 (for real site scope) | fake site list, `ISiteScope` stub | Study ID unique. Site user cannot create a patient at another site. Edit without reason rejected |
| 4 | 2.4 | **Clinical rules:** validation config (numeric ranges as placeholders, hard and soft level per field), visit-window calculator (M3 day 90 ±14, M6 day 180 ±21), validation engine returns `{ errors[], warnings[] }` | S-02 | nothing | Changing a range is a config edit. Each rule has a pass and a fail test |
| 5 | 2.5 | **Visit forms:** Baseline, 3M, 6M. Save draft (only "mark complete" is blocked by hard errors). Mark complete and lock. Reopen with reason. LVEF only at Baseline and 6M. Visit date not before consent | 2.3, 2.4 | nothing | Incomplete visit lists missing fields. Locked visit cannot be edited by site users |
| 6 | 2.6 | **GDMT:** drug list per pillar (ARNI, beta-blocker, MRA, SGLT2 inhibitor), per visit status, drug, dose, start date. Active score 0 to 4. Reasons when a pillar is not started or stopped | 2.4 (rules), 2.5 (visit row) | drug list and score logic can be built before 2.5 | Score is count of Started or Continued. ARNI list excludes ACE-I and ARB |
| 7 | 2.7 | **Clinical events:** hospitalizations (HF and other), death, major intervention (free text). Only at 3M and 6M. Death at 3M or 6M gives a soft warning | 2.5 | nothing | Event at Baseline returns a hard error |
| 8 | 2.8 | **Patient record view:** all three visits with GDMT score, events and uploaded files, in one response. Patient name and contact number at the top | 2.5, 2.6, 2.7, 2.10 | nothing | One response per patient with full record. Site users cannot open another site's files |
| 9 | 2.9 | **Dashboard on real data:** switch 2.1 from seed to live visit data. Add missing-visit list | 2.5, 2.1 | seed data | Numbers match a manual count on seed data |
| 10 | 2.10 | **Prescription upload** on Baseline, 3M and 6M forms: PDF, JPEG or PNG, size limit (TBC), not allowed on locked visits, each upload audited | 2.5, S-04, 1.10 | file store stub | Accepted and rejected types and sizes behave as in section R of `19-functional-acceptance.md`. Upload audited |

Forms (tasks 3 to 8) are built once and used by the dashboard (2.1, 2.9), by audit (1.11 and 1.12), and by export (1.13). Do not build a second copy in any module.

---

## Cross-developer dependencies

| Who needs it | From | When | Stub until merged |
|----------------------------|----------------------------|------------|--------------------------------|
| Dev 2 dashboard (2.1) | Dev 1 login and `/me` (1.1, 1.4) | Day 3 | Fake user per role |
| Dev 2 registry (2.3) | Dev 1 sites and site assignment (1.7, 1.8) | After 1.8 | Seeded site list |
| Dev 2 registry and forms | Dev 1 site scope (1.10) | After 1.10 | Simple filter by site id |
| Dev 1 export (1.13) | Dev 2 visit, GDMT and event forms (2.5, 2.6, 2.7) | After 2.7 | Export reads seed visits |
| Dev 1 audit (1.11) | Nothing from Dev 2 at first. Forms call the writer when merged | Early | Forms write nothing until 1.11 merges |
| Dev 2 forms (2.5) | Dev 2's own clinical rules (2.4) | Within Dev 2 | none |

Dev 1's home shell (1.4) shows the sections; Dev 2's dashboard (2.1) provides the data. Merge the two together at the integration checkpoint, not one by one.

---

## Dashboard sections by role (for task 2.1)

| Section | Super Admin | Central team | Site Investigator |
|---------|:-:|:-:|:-:|
| Study statistics | All sites | All sites | Own sites |
| Patient worklist with visit status | All | All | Own patients |
| Overdue visits | All | All | Own patients |
| Users list | All | Investigators only | Hidden |
| Sites list | All | View only | Hidden |
| Permissions tab | Yes | Hidden | Hidden |
| Export | Yes (TBC) | Yes | Hidden |
| Add patient button | No | No | Yes |

Super Admin does not add patients or enter visit data ([03-roles-access.md](03-roles-access.md)). Super Admin's export access is TBC with the client.

---

## Integration points

| # | After | Test |
|-----|------------------|----------------------------------------------------------------------|
| I-1 | 1.1, 1.4, 2.1 | Three roles log in. Each sees its own dashboard response |
| I-2 | 1.8, 2.3 | Site Investigator creates a patient at own site, cannot at another |
| I-3 | 2.5, 2.6, 2.7, 1.11 | Visit completes with validation and score. Audit rows written |
| I-4 | 1.13 | Export row count equals visit count |
| I-5 | All | Pilot acceptance list in [11-testing-qa.md](11-testing-qa.md) |

---

## Open client questions that block tasks

| Question | Blocks |
|----------|--------|
| Q-01 numeric ranges | 2.4 final values |
| Q-02 login method (local, SSO, MFA) | 1.1 (local assumed), SSO later |
| Q-06 and Q-07 multi-site and role scope | 1.8, 1.9, 1.13 |
| Q-08 audit trail in pilot | 1.11 and 1.12 scope |
| Q-16 drug list | 2.6 final seed |
| Q-17 visit windows | 2.4 final values |
