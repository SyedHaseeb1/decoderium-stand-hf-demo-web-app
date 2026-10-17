# 15. Work Breakdown and Assignment

Purpose: split the STAND-HF E-CRF Portal into modules that two developers can build in parallel, then merge. This is the source for the ClickUp list. Task IDs here map to [TASKS.md](TASKS.md) where a task already exists there.

Scope of this file: **backend, data, business rules and API contracts only.** UI is built separately and joined in the integration phase, so no task here is a screen. Each module lists the API surface the UI will call.

---

## 1. How to load this into ClickUp

| ClickUp level | Maps to | Example |
|---------------|---------|---------|
| Space | Project | STAND-HF E-CRF |
| Folder | Epic (module) | `A2. Roles and Permissions` |
| List | Feature inside the module | `ROL-02 Permission matrix` |
| Task | Unit of work, 1 to 3 days max | `ROL-02.1 Store permission keys per role` |
| Subtask | Checklist step | `Seed default matrix from 03-roles-access.md` |

Custom fields to add on every task:

- **Owner:** Dev A or Dev B. One owner per task.
- **Module:** the epic code, for example `A3`.
- **Priority:** P1 pilot, P2 Phase 1 full, P3 Phase 2 or later.
- **Size:** S (up to 1 day), M (2 to 3 days), L (4 to 5 days).
- **Depends on:** task IDs. A task cannot start until its dependencies are merged, unless the note says it can stub.
- **Blocked by:** open client question (`Q-xx`) from [14-open-questions.md](14-open-questions.md).
- **Status:** To do, In progress, In review, Merged, Done.

Rule: a task is assigned to one developer, and a module belongs to one developer. Two people should not edit the same module folder.

---

## 2. Ownership split

| Owner | Modules | Theme |
|-------|---------|-------|
| **Dev A** | F (shared foundation, leads), A1 to A6 | Who can do what, the home data, the patient registry and the visit records |
| **Dev B** | B1 to B5 | Clinical rules, GDMT, events, audit, export |
| **Later (either dev)** | B6 offline, P2 dashboards | Start after the pilot integration passes |

Load: Dev A carries more P1 work (login, roles, admin, home data, registry and visits) and also owns the shared foundation. Dev B starts with B1, which needs no database, so Dev B is free to take on more early. Sizes are in the Size column of each module. Compare the totals per owner in ClickUp once the tasks are loaded.

If Dev B finishes early, move **B5 export** earlier or pair on **A6 visits**. Reassign by changing the Owner field. Do not reassign mid-task without a handover note.

---

## 3. Shared contracts (Day 1 to 2, both devs, one PR)

Agree these before either dev builds on them. Put them in one shared contracts folder. Changes after this go through a PR reviewed by the other dev.

**F-05 Contracts file (Size S, Owner: Dev A writes, Dev B reviews)**

- **Enums:** `Role` (SuperAdmin, CentralTeam, SiteInvestigator), `VisitType` (Baseline, M3, M6), `NyhaClass` (I to IV), `Pillar` (Arni, BetaBlocker, Mra, Sglt2i), `PillarStatus` (Started, Continued, Stopped, NotStarted), `HfEtiology` (Ischemic, NonIschemic, Other), `Sex`, `IncompleteReason`.
- **Entities:** as in [05-data-model.md](05-data-model.md). Keep the `Version` column on Visit from the start.
- **User context:** `UserContext { UserId, Role, SiteIds[] }`. Built by Dev A from the JWT. Dev B reads it, never builds it.
- **Service interfaces that Dev B provides and Dev A calls:**

| Interface | Input | Output | Used by |
|-----------|-------|--------|---------|
| `IValidationService` | Patient or Visit or GdmtSet | `{ errors[], warnings[] }` | A5 registry, A6 visits |
| `IStudyIdGenerator` | site code | next Study ID | A5 registry |
| `IVisitScheduleService` | baseline date | due and window dates for M3 and M6 | A6 visits, A4 home and worklist |
| `IGdmtScoreService` | visit's four pillar entries | active score 0 to 4 | A6 visits, A4 home and worklist |
| `IAuditService` | entity, field, old, new, reason, UserContext | append | A1 login, A2 roles, A3 admin, A5 registry, A6 visits |
| `IExportService` | filter, UserContext | CSV stream | B5 (uses A's scope check) |

- **Site-scope check:** Dev A provides `ISiteScope.Allowed(UserContext, siteId)`. Dev B's export and audit-view endpoints call it. Dev B does not write its own access rule.

**F-04 API conventions (Size S, Owner: Dev A)**

- Error format: one shape for all endpoints, `{ code, message, fieldErrors[] }`.
- Hard error = HTTP 422 with `severity: "hard"`. Soft warning = returned in the 200 body under `warnings[]`, not an error.
- Auth: `Authorization: Bearer <jwt>` on every endpoint except login.
- Document each endpoint in one line in the API contract file (ARC-04) so the UI team can code against it.

---

## 4. Modules

Legend: the **Depends on** column lists task IDs. "Stub" means the dependent dev can build against the interface with a fake and swap in the real one at integration.

### F. Shared foundation (Owner: Dev A, Dev B reviews)

Work in the first 2 days. Dev B starts B1 at the same time, since B1 needs no database.

| ID | Task | Size | Pri | Depends on | Done when | Maps to |
|----|------|------|-----|------------|-----------|---------|
| F-01 | Create .NET 8 solution, project layout, EF Core, PostgreSQL connection | M | P1 | none | API starts, connects to local Postgres, health endpoint returns 200 | ENV-04, ENV-06 |
| F-02 | Initial schema from the data model, with migration | M | P1 | F-01 | `dotnet ef database update` builds all entities in 05-data-model.md | ARC-03 |
| F-03 | Seed script: 3 sites, one user per role, synthetic patients at each visit stage | S | P1 | F-02 | Seed runs twice without error (idempotent) | ENV-07 |
| F-04 | API conventions and error format | S | P1 | F-01 | Error shape documented and returned by a test endpoint | ARC-04 |
| F-05 | Shared contracts file (enums, entities, interfaces) | S | P1 | F-01 | Both devs compile against it, merged to main | ARC-02 |
| F-06 | CI: build and test on each PR | S | P1 | F-01 | A failing test blocks merge | DEP-05 |

---

### A1. Login and sessions (Owner: Dev A)

Login accepts username and password. The auth mechanism is still open (Q-02). Build username and password with JWT, which the FSD chose. SSO and MFA are a later task.

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| AUTH-01 | Login endpoint with username and password (ASP.NET Identity) | M | P1 | F-02 | Correct password returns JWT. Wrong password returns 401 with no hint which field failed. |
| AUTH-02 | JWT issue and validation, with role and site claims and expiry | S | P1 | AUTH-01 | Token carries `role` and `sites[]`. Expired token returns 401. |
| AUTH-03 | Account lockout after N failed logins (N from config, TBC) | S | P1 | AUTH-01 | After N failures the account is locked for the set time. Lockout is audited. |
| AUTH-04 | Password policy and change-password endpoint | S | P1 | AUTH-01 | Rejects a weak password. Old password cannot be reused. |
| AUTH-05 | Super Admin resets a user's password | S | P1 | AUTH-04 | Reset forces a change on next login. Action is audited. |
| AUTH-06 | Logout and session timeout | S | P1 | AUTH-02 | Logout invalidates the token server side. Idle timeout length from config. |
| AUTH-07 | SSO and MFA | L | P2 | Q-02 | Deferred. Not in pilot. |

Blocked by: Q-02 for AUTH-07 only. The rest can start now.

---

### A2. Roles and permissions (Owner: Dev A)

Three roles in code: **Super Admin**, **Central team**, **Site Investigator**. Data Manager and Read-only were removed on Oct 10 (see [03-roles-access.md](03-roles-access.md)). The permission matrix is in that doc, and the rule table below comes from it.

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| ROL-01 | Define the three roles and seed them | S | P1 | F-05 | Roles exist in DB and enum. |
| ROL-02 | Permission keys, stored per role, editable except Super Admin | M | P1 | ROL-01 | Keys: `SeeAllSites`, `AddPatients`, `EditVisitData`, `MarkVisitComplete`, `ExportCsv`, `ManageInvestigators`, `ManageUsers`, `ManageSites`. Super Admin matrix is fixed in code and cannot be changed through the API. |
| ROL-03 | Authorization policy on every endpoint, driven by permission keys | M | P1 | ROL-02, AUTH-02 | Every endpoint has a policy attribute. A test lists endpoints without one and fails. |
| ROL-04 | Site scoping: `ISiteScope` filters every patient and visit query by UserContext sites | M | P1 | ROL-03 | Site Investigator for site X cannot read or write site Y through any endpoint, including by guessing an ID. |
| ROL-05 | Guard rules: Super Admin cannot change own role or deactivate own account; at least one active Super Admin must remain; Central team cannot create or edit Super Admin or Central team accounts | S | P1 | ROL-02 | Each rule returns a clear error and is covered by a test. |

Open: Q-06 (can a user be assigned to more than one site?) is answered "yes" in 03-roles-access.md. Build for many sites per user.

---

### A3. Admin: sites and users (Owner: Dev A)

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| ADM-01 | Sites: create, edit, deactivate (never delete) | S | P1 | ROL-03 | Deactivated site stays in DB. Its patients stay readable by Super Admin. |
| ADM-02 | Users: create, edit, deactivate, assign role and sites | M | P1 | ROL-05, ADM-01 | Deactivated user cannot log in. Changes audited. |
| ADM-03 | Central team adds Site Investigators and assigns sites; sees only investigators in the user list | S | P1 | ADM-02 | Central team list returns investigators only. Adding a Central team account returns 403. |
| ADM-04 | Permission matrix read and update endpoints (Super Admin only edits, Central team's row is editable by Super Admin) | S | P1 | ROL-02 | Matrix returned as JSON. Change is audited. |

---

### A4. Home and dashboard data, per role (Owner: Dev A)

The home screen shows different sections depending on role. This module provides the data. The UI decides layout.

**Section visibility by role:**

| Section | Super Admin | Central team | Site Investigator |
|---------|:-:|:-:|:-:|
| Study statistics (enrollment, visit completion) | All sites | All sites | Own sites only |
| Recruitment by month and site (P2 in docs, optional in pilot) | All sites | All sites | Own sites only |
| Patient worklist with Baseline, 3M, 6M chips and next due date | All patients | All patients | Own patients |
| Overdue visits list | All | All | Own patients |
| Users list | All users | Investigators only | Hidden |
| Sites list | All | Read only | Hidden |
| Permissions tab | Yes | Hidden | Hidden |
| Export CSV entry | Yes (TBC) | Yes | Hidden |
| Add patient button | Hidden | Hidden | Yes |

Super Admin does not add patients or enter visit data (03-roles-access.md). Confirm that the Export row for Super Admin with the client (TBC).

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| DSH-A-01 | Home summary endpoint: returns only the sections the caller's role allows | M | P1 | ROL-04, A5, A6 | Each role's response matches the table above. Tested for all three roles. |
| DSH-A-02 | Worklist endpoint: patients with status for each visit and next due date | M | P1 | A5, B1 (due dates) | Status is computed by `IVisitScheduleService`. Sorted by next due date. |
| DSH-A-03 | Overdue visits endpoint | S | P1 | DSH-A-02 | Overdue = due window passed and visit not completed. |
| DSH-A-04 | Recruitment by month and site | S | P3 | A5 | Deferred unless client asks for it in pilot. |

---

### A5. Patient registry (Owner: Dev A)

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| REG-01 | Create patient: Study ID auto-generated from site code, site set from UserContext | M | P1 | B1 (`IStudyIdGenerator`), ROL-04 | Study ID is unique and read-only. A site user cannot set another site. Stub the generator until B1-01 merges. |
| REG-02 | Required fields: consent date, investigator, age, sex, etiology | S | P1 | B1 (`IValidationService`) | Missing required field returns a hard error with the field name. |
| REG-03 | List and search patients, filtered by site scope | S | P1 | ROL-04 | Site user sees only own sites. Central and Super Admin see all. |
| REG-04 | Edit patient details, every change audited with a reason | M | P1 | AUD-02 (Dev B), REG-02 | Edit without a reason is rejected. Old and new values stored. |
| REG-05 | Deactivate patient (never delete) | S | P2 | Q-04 | Blocked until Q-04 is answered. |

Consent rule (Baseline visit date must not be before consent) is enforced in the visit module, not here.

---

### A6. Visits (Owner: Dev A)

One patient record holds three visits: Baseline, M3, M6. Each visit is a row with a type.

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| VIS-01 | Create visit rows for a patient: Baseline first, then M3 and M6 become available in order | M | P1 | REG-01 | M3 cannot be created before Baseline is complete. Each type is unique per patient. |
| VIS-02 | Save visit data (draft): visit date, weight, HR, SBP, DBP, NYHA, 1MSTS reps, 1MSTS stop reason, LVEF (Baseline and M6 only), echo date | M | P1 | VIS-01, B1 (`IValidationService`) | Saving a draft with hard errors is allowed. Only "mark complete" blocks. LVEF on M3 returns 422. |
| VIS-03 | Due dates and visit windows per visit | S | P1 | B1 (`IVisitScheduleService`) | Returns window start and end for M3 (day 90 ±14) and M6 (day 180 ±21). Values from config (Q-17). |
| VIS-04 | Mark complete: runs the full validator, hard errors block, returns the list of missing items | M | P1 | VIS-02, B1, B2 (`IGdmtScoreService`) | Incomplete visit returns the missing-field list. Complete visit sets lock. |
| VIS-05 | Reopen a completed visit with a required reason; logged | S | P1 | VIS-04, AUD-01 | Reopen without reason rejected. Reopen audited. |
| VIS-06 | Lock: completed visit cannot be edited by site users | S | P1 | VIS-04 | Site user edit on completed visit returns 423 or 403 (pick one, document it). Central team's edit rule per matrix. |
| VIS-07 | Patient record endpoint: all three visits, GDMT active score per visit, events per visit | M | P1 | VIS-02, B2, B3 | One response with the full patient record. |
| VIS-08 | Visit date rules: not before consent; M3 and M6 after Baseline | S | P1 | B1 (`IValidationService`) | Rule returns a hard error. Covered by test. |

Stub plan: while B1 and B2 are being built, Dev A can stub `IValidationService` (always returns no errors) and `IGdmtScoreService` (returns 0). Swap at integration.

---

### B1. Clinical rules library (Owner: Dev B, starts Day 1, no DB needed)

Pure logic first. No database, so Dev B does not wait for F-02. This is the highest-leverage module: other modules call it.

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| B1-01 | Study ID generator: site code plus sequence. Sequence comes from a store interface, not hard-coded | S | P1 | F-05 | Generates `RIC-0001` style IDs. Sequence is unique per site. Test covers 2 sites. |
| B1-02 | Visit schedule calculator: M3 and M6 due dates and windows from Baseline date | S | P1 | F-05 | Matches the windows in 06-validation-rules.md. Values from config. |
| B1-03 | Validation config file: numeric ranges and soft or hard level per field (placeholders) | S | P1 | F-05 | Changing a range is a config edit, not a code change. Ranges marked TBC. Covers Q-01. |
| B1-04 | Validation engine, patient rules | S | P1 | B1-03 | Consent date required (hard). Age 18 or more (hard, TBC). Sex and etiology required (hard). |
| B1-05 | Validation engine, visit rules | M | P1 | B1-03, B1-02 | Visit date required. Visit date not before consent. DBP below SBP (hard). HR, SBP, weight, 1MSTS, LVEF ranges (soft warnings). NYHA required (hard). LVEF required at Baseline and M6 (hard). Echo within 30 days before enrollment (soft). |
| B1-06 | Validation engine, GDMT and events rules | S | P1 | GDM-02 (entry shape) | Started or Continued needs drug and dose (hard). Start date (soft). Not started or Stopped needs a reason (soft). Events only at M3 and M6 (hard). |
| B1-07 | Returns `{ errors[], warnings[] }` with field names and codes | S | P1 | B1-04, B1-05, B1-06 | Shape matches the contract in F-05. |
| B1-08 | Unit tests for every rule, both the pass and fail case | M | P1 | B1-07 | Test count per rule shown in the PR. QA-01. |

Blocked by: Q-01 for final ranges. The engine works with placeholders, so this is not blocking.

---

### B2. GDMT module (Owner: Dev B)

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| GDM-01 | Drug master table and seed list, one row per generic drug with its pillar | S | P1 | F-02 | Dropdown endpoint returns active drugs for a pillar. Admin can deactivate a drug. |
| GDM-02 | Pillar entries per visit: status, drug, daily dose, start date, note. One entry per pillar per visit | M | P1 | GDM-01, VIS-01 | Writing an entry for a pillar twice in one visit overwrites it and audits the change. |
| GDM-03 | Active pillar score: count of Started or Continued, 0 to 4 | S | P1 | GDM-02 | Score with 4 Started = 4. With 1 Started and 3 NotStarted = 1. Stated rule TBC for "Continued", kept as counted. |
| GDM-04 | Incomplete-therapy reasons: codes from the brief, plus Other with free text | S | P1 | GDM-02 | Reasons required when a pillar is NotStarted or Stopped. Codes: Hypotension, Bradycardia, Renal dysfunction, Hyperkalemia, Intolerance, Cost or access, Patient preference, Physician decision, Other. |
| GDM-05 | ARNI pillar uses sacubitril and valsartan, never ACE-I or ARB | S | P1 | GDM-01 | ARNI drug list excludes ACE-I and ARB entries. Test covers it. |
| GDM-06 | Score at site and study level | M | P2 | GDM-03, Phase 2 dashboards | Deferred. Phase 2. |

Blocked by: Q-16 for the final drug list. Seed with a placeholder list. Dev A's VIS work does not wait.

---

### B3. Clinical events (Owner: Dev B)

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| EVT-01 | Event record: HF hospitalization, other hospitalization, death (yes or no), major intervention (free text) | S | P1 | VIS-01 | Four fields saved against one visit. |
| EVT-02 | Events allowed only on M3 and M6 | S | P1 | EVT-01 | Event on Baseline returns hard error. |
| EVT-03 | Death recorded at M3 or M6 raises a soft warning: confirm no further visits | S | P1 | EVT-01 | Warning returned. Does not block save. Whether death blocks further visits is TBC. |

---

### B4. Audit trail (Owner: Dev B)

Build the table in the pilot even if the UI is basic, because adding it later leaves gaps (05-data-model.md).

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| AUD-01 | Append-only audit table and writer. No update or delete path in app code. DB user has insert and select only on this table | M | P1 | F-02 | Test confirms no update or delete method exists on the writer. |
| AUD-02 | Correction log: who, entity, field, old, new, timestamp, reason (required) | S | P1 | AUD-01 | Correction with no reason is rejected at the service level. |
| AUD-03 | Audit calls wired into: login failures, lockouts, role changes, user and site changes, patient edits, visit completion, visit reopen | M | P1 | AUD-02, Dev A's modules | Each listed action produces one audit row. Checklist in PR. |
| AUD-04 | Audit view endpoints: by patient, by user. Central roles only | M | P1 | AUD-01, ROL-03 | Site Investigator gets 403. Central team sees all. |
| AUD-05 | Log exports and log role changes as a view filter | S | P2 | AUD-04 | Deferred. Q-08. |

Blocked by: Q-08 (is the audit trail full in Phase 1 or future scope?). The pilot version is the basic one.

---

### B5. Export (Owner: Dev B)

| ID | Task | Size | Pri | Depends on | Done when |
|----|------|------|-----|------------|-----------|
| EXP-01 | CSV export, one row per patient-visit, columns from 10-export.md | M | P1 | VIS-07, GDM-03, EVT-01 | Row count equals visit count. Dates as ISO. UTF-8 with header. |
| EXP-02 | Confirm column list with the data manager | S | P1 | client | Blocks final sign-off only. Build from the draft list. |
| EXP-03 | Scope check: central roles get all sites, site users get their own (TBC) | S | P1 | ROL-04, ROL-03 | Site Investigator export returns only own rows (or 403, per TBC). |
| EXP-04 | Export excludes drafts that are not completed (TBC) and records each download in the audit log | S | P1 | AUD-01 | Draft row absent from output. Download creates an audit row. |
| EXP-05 | XLSX export with the same columns, dates as real dates, headers frozen | M | P2 | EXP-01 | Same row count as CSV. |
| EXP-06 | Export test: row-by-row check against seeded patients | S | P1 | F-03, EXP-01 | QA-05. Passes on seed data. |

---

### B6. Offline and sync (v1.1, Owner: either dev, after pilot integration)

Not in pilot. Start after integration passes. Full detail is in TASKS.md (OFF-01 to OFF-09) and 08-offline-sync.md.

| ID | Task | Size | Pri | Depends on |
|----|------|------|-----|------------|
| OFF-01 | Service worker and app shell | M | P2 | UI shell |
| OFF-02 | Local store for drafts | M | P2 | OFF-01 |
| OFF-03 | Encrypt drafts with Web Crypto | M | P2 | ARC-05 (key decision) |
| OFF-04 | Sync queue and HTTPS sync endpoint | L | P2 | VIS-02, AUTH-02 |
| OFF-05 | Sync status per record: Synced, Pending, Failed | S | P2 | OFF-04 |
| OFF-06 | Conflict handling: prevent duplicates, keep latest verified, log the other | M | P2 | OFF-04, AUD-01 |
| OFF-07 | Request persistent storage | S | P2 | OFF-02 |
| OFF-08 | Offline session window | S | P2 | Q-02 |
| OFF-09 | Offline test scenarios with throttling | M | P2 | OFF-06 |

---

### P. Phase 2 (after pilot, owner TBD)

DSH-01 to DSH-04 from TASKS.md: recruitment tracking, missing-visit alerts, GDMT coverage, patient trajectories. Mostly reads over data the modules above already store. Assign once the pilot is live.

---

## 5. Integration checkpoints

Merge in this order. Each checkpoint has a test that both devs run.

| # | Checkpoint | Who | Pass test |
|---|------------|-----|-----------|
| I-0 | Foundation merged | Dev A (F), Dev B (B1 started) | API starts, DB migrates, seed runs, contracts compile for both |
| I-1 | Login and roles, plus rules library | Dev A (A1, A2), Dev B (B1) | Three roles log in. Site Investigator cannot reach another site's patient endpoint. Rules unit tests pass |
| I-2 | Patient and visit core | Dev A (A3, A5, A6 start), Dev B (B2, B4) | Create patient with generated Study ID. Save Baseline draft. Mark complete with validator and GDMT score. Audit rows written |
| I-3 | Dashboard and events | Dev A (A4), Dev B (B3, B5 start) | Each role's home response matches the section table. Events save only on M3 and M6 |
| I-4 | Export and audit view | Dev B (B4 view, B5), Dev A (review) | CSV row count equals visit count. Audit view blocked for site users |
| I-5 | Pilot acceptance | Both | Acceptance list in [11-testing-qa.md](11-testing-qa.md), section "Acceptance criteria for the pilot" |

**Merge rules**

- Each dev works in their own module folders. Shared folders (contracts, migrations) change only through a PR the other dev reviews.
- Migrations: one dev owns the migration sequence at a time. Announce in the team channel before adding one.
- Stubs: any stub must be marked `// STUB: remove at I-n` so it is not left in.

---

## 6. Sprint sequence

Two-week pilot per [13-timeline-phases.md](13-timeline-phases.md) is tight for this scope. Plan with the sprint order below and cut P2 items if the pilot date holds. Scope decision belongs to PRJ-03.

| Sprint | Dev A | Dev B |
|--------|-------|-------|
| 0 (days 1 to 2) | F-01 to F-05 | B1-01, B1-02, B1-03 |
| 1 | AUTH-01 to AUTH-06, ROL-01 to ROL-03 | B1-04 to B1-08, GDM-01, GDM-03 |
| 2 | ROL-04, ROL-05, ADM-01 to ADM-03, REG-01 to REG-03 | GDM-02, GDM-04, GDM-05, EVT-01 to EVT-03, AUD-01, AUD-02 |
| 3 | VIS-01 to VIS-06, REG-04, AUD-03 | AUD-03 (review), AUD-04, EXP-01, EXP-03, EXP-04 |
| 4 | VIS-07, VIS-08, DSH-A-01 to DSH-A-03 | EXP-06, bug fixes, B1 final ranges (after Q-01) |
| Integration | I-1 to I-5 | I-1 to I-5 |

---

## 7. Definition of done (every task)

- Code merged to the main branch through a reviewed PR.
- Unit tests for any business rule touched. Integration test for any endpoint touched.
- Authorization policy on every new endpoint. ROL-03 test still passes.
- Endpoint line added to the API contract file (ARC-04).
- Audit row written for every write action listed in AUD-03.
- Task status moved to Done in ClickUp, and the matching line in TASKS.md moved to Complete with the date.

---

## 8. Open client questions that block tasks

| Question | Blocks |
|----------|--------|
| Q-01 Numeric ranges | B1-03 final values, VAL-04 |
| Q-02 Auth: SSO, local, MFA | AUTH-07, OFF-08 |
| Q-04 Edit or delete after sync | REG-05 |
| Q-06 and Q-07 site scope for roles | ROL-04 rules for multi-site users, EXP-03 |
| Q-08 Audit trail in Phase 1 | AUD-05, scope of AUD-03 |
| Q-11 Ethics approval | Go-live gate only, not a build block |
| Q-16 Drug list | GDM-01 final seed |
| Q-17 Visit windows | B1-02 final values |
