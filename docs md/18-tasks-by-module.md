# 18. Tasks by Module

Tasks under each module in [17-module-tree.md](17-module-tree.md). IDs match [16-dev-task-plan.md](16-dev-task-plan.md). Each task shows **owner**, **needs** (merged first), and **done when**.

Tick a box when the task is merged.

---

## 0. Foundation  [Dev 1]

- [ ] **S-01** Project setup: .NET 8 API, PostgreSQL, EF Core
  - Owner: Dev 1 · Needs: nothing
  - Done when: API starts, database migrates, CI runs
- [ ] **S-02** Shared contracts: roles, user context, permission keys, error format, User, Site, Patient, Visit entities
  - Owner: Dev 1 writes, Dev 2 reviews · Needs: S-01
  - Done when: both devs compile against it, merged to main
- [ ] **S-04** File store for prescription uploads, encrypted at rest (location TBC, Q-21)
  - Owner: Dev 1 · Needs: S-01
  - Done when: a file can be saved and read back by ID, scoped to its site
- [ ] **S-03** Read the role-visibility rules in `07-ui-design.md` and `03-roles-access.md`
  - Owner: Dev 2 · Needs: nothing
  - Done when: open questions for the client are noted
- [ ] **F-06** CI: build and test on every PR
  - Owner: Dev 1 · Needs: S-01
  - Done when: a failing test blocks merge

---

## 2.1 User roles and access control

- [ ] **1.6** Three roles and permission matrix
  - Owner: Dev 1 · Needs: 1.5
  - Done when: matrix edits save. Super Admin row is fixed. Guard rules return clear errors (own role, last Super Admin, Central team cannot manage Super Admin or Central accounts)
- [ ] **1.10** Site scope on every endpoint (`ISiteScope`)
  - Owner: Dev 1 · Needs: 1.8
  - Done when: a site user cannot read or write another site's patient by guessing an ID
- [ ] **1.9** Central team manages investigators
  - Owner: Dev 1 · Needs: 1.6, 1.8
  - Done when: Central team's user list shows investigators only
- [ ] **1.4** Home shell and `/me`
  - Owner: Dev 1 · Needs: 1.1
  - Done when: each role sees only its own menu items
- [ ] **2.1** Home dashboard data per role
  - Owner: Dev 2 · Needs: S-02 (uses fake user per role until 1.1 merges)
  - Done when: each role's response matches the section table in `16-dev-task-plan.md`
- [ ] **2.9** Dashboard on real data, plus missing-visit list
  - Owner: Dev 2 · Needs: 2.5, 2.1
  - Done when: numbers match a manual count on seed data

---

## 2.2 Authentication and security  [Dev 1]

- [ ] **1.1** Login with username and password, returns JWT with role and site claims
  - Owner: Dev 1 · Needs: S-01, S-02
  - Done when: correct login returns token. Wrong login returns 401 with no hint which field failed
- [ ] **1.2** Lockout after N failed logins, idle session timeout
  - Owner: Dev 1 · Needs: 1.1
  - Done when: locked account is rejected. Timeout length comes from config
- [ ] **1.3** Password change, password policy, Super Admin resets a user's password
  - Owner: Dev 1 · Needs: 1.1
  - Done when: weak password rejected. Reset forces change at next login

---

## 2.3 Patient registry  [Dev 2]

- [ ] **2.2** Seed data: synthetic sites and patients at each visit stage
  - Owner: Dev 2 · Needs: S-02
  - Done when: seed runs twice without error
- [ ] **2.3** Add patient with auto Study ID, required fields (patient name, contact number, consent date, investigator, age, sex, etiology), list and edit with reason
  - Owner: Dev 2 · Needs: 2.2, 1.8 (for real site scope)
  - Done when: Study ID is unique. Site user cannot add a patient at another site. Edit without reason is rejected

---

## 2.4 Visit forms (Baseline, 3M, 6M)  [Dev 2]

- [ ] **2.4** Clinical rules: validation config, visit-window calculator, validation engine
  - Owner: Dev 2 · Needs: S-02
  - Done when: changing a range is a config edit. Each rule has a pass test and a fail test
- [ ] **2.5** Visit forms: save draft, mark complete, lock, reopen with reason
  - Owner: Dev 2 · Needs: 2.3, 2.4
  - Done when: incomplete visit lists missing fields. Locked visit cannot be edited by site users. LVEF only at Baseline and 6M
- [ ] **2.10** Prescription upload on Baseline, 3M and 6M: PDF, JPEG, PNG; size limit TBC; blocked on locked visits; each upload audited
  - Owner: Dev 2 · Needs: 2.5, S-04, 1.10
  - Done when: accepted and rejected types and sizes match section R of `19-functional-acceptance.md`
- [ ] **2.8** Patient record view: all three visits with GDMT score, events and uploaded files. Patient name and contact number at top
  - Owner: Dev 2 · Needs: 2.5, 2.6, 2.7
  - Done when: one response per patient with the full record

---

## 2.5 GDMT module  [Dev 2]

- [ ] **2.6** Four pillars per visit: drug list, status, dose, start date, active score 0 to 4, reasons when not started or stopped
  - Owner: Dev 2 · Needs: 2.4 (rules), 2.5 (visit row). Drug list and score logic can start earlier
  - Done when: score counts Started or Continued. ARNI list excludes ACE-I and ARB

---

## 2.6 Clinical events module  [Dev 2]

- [ ] **2.7** Hospitalizations (HF and other), death, major intervention (free text), only at 3M and 6M
  - Owner: Dev 2 · Needs: 2.5
  - Done when: event at Baseline returns a hard error. Death at 3M or 6M gives a soft warning

---

## 2.7 Data export  [Dev 1]

- [ ] **1.13** CSV export, one row per patient-visit, scope-checked, each download logged
  - Owner: Dev 1 · Needs: 2.5, 2.6, 2.7, 1.10
  - Done when: row count equals visit count. Download creates an audit row

---

## 2.8 Basic administration  [Dev 1]

- [ ] **1.5** Users: Super Admin creates, edits, deactivates users
  - Owner: Dev 1 · Needs: 1.1, 1.4
  - Done when: deactivated user cannot log in. Users are deactivated, never deleted
- [ ] **1.7** Sites: create, edit, deactivate
  - Owner: Dev 1 · Needs: 1.4
  - Done when: deactivated site keeps its patients, and Super Admin can still read them
- [ ] **1.8** Assign sites to users
  - Owner: Dev 1 · Needs: 1.5, 1.7
  - Done when: a Site Investigator assigned to site X sees only X in `/me`

---

## 2.9 Audit trail  [Dev 1]  (brief requires it; not in FSD section 2)

- [ ] **1.11** Append-only audit writer
  - Owner: Dev 1 · Needs: S-01, 1.1
  - Done when: the writer has no update or delete path. A test confirms it
- [ ] **1.12** Audit view for central roles
  - Owner: Dev 1 · Needs: 1.11
  - Done when: Site Investigator gets 403. Central team sees all changes

---

## Later

- [ ] **Offline sync** (FSD: Phase 1. Plan: v1.1). Owner: either dev. Needs: pilot done
- [ ] **Phase 2 dashboards** (recruitment, GDMT coverage, trajectories). Owner: either dev. Needs: pilot done

---

## Totals

| Owner | Tasks |
|-------|-------|
| Dev 1 | S-01, S-02, S-04, F-06, 1.1 to 1.13 = 17 tasks |
| Dev 2 | S-03, 2.1 to 2.10 = 11 tasks |
| Later | 2 items |

Dev 1 has more tasks. Task 1.13 (export) waits on Dev 2's forms.
