# Work Breakdown: Overview

Two developers, each owning whole modules. Backend and rules only. UI is built separately and joined later.

Task-level detail: [15-work-breakdown.md](15-work-breakdown.md)

---

## Modules

| # | Module | Sub-modules | Owner | Depends on |
|---|--------|-------------|-------|------------|
| 1 | **Foundation** | Project setup, database, shared contracts, CI | Dev A | nothing |
| 2 | **Login** | Login, tokens, lockout, password reset | Dev A | 1 |
| 3 | **Roles and permissions** | Three roles, permission matrix, site scope, guard rules | Dev A | 2 |
| 4 | **Admin: sites and users** | Sites, users, Central team adds investigators | Dev A | 3 |
| 5 | **Patient registry** | Add patient, Study ID, edit with reason, list by site | Dev A | 1, 8 |
| 6 | **Visits** | Baseline, 3M, 6M, save draft, complete and lock, reopen | Dev A | 5, 8, 9 |
| 7 | **Home screen** | Statistics, patient list, overdue visits, per-role sections | Dev A | 3, 5, 6 |
| 8 | **Clinical rules** | Study ID generator, due dates, validation engine | Dev B | nothing (starts day 1) |
| 9 | **GDMT** | Drug list, pillar entries, active score, incomplete reasons | Dev B | 8 |
| 10 | **Events** | Hospitalizations, death, major intervention (3M and 6M only) | Dev B | 6 |
| 11 | **Audit trail** | Append-only log, correction reason, audit view | Dev B | 1 |
| 12 | **Export** | CSV, scope check, download log | Dev B | 6, 9, 10 |
| 13 | **Offline sync** (v1.1) | Local drafts, sync queue, conflicts | Either | pilot done |
| 14 | **Dashboards** (Phase 2) | Recruitment, missing visits, GDMT coverage | Either | pilot done |

**Dev A:** modules 1 to 7
**Dev B:** modules 8 to 12
**After the pilot:** modules 13 and 14, whoever is free

---

## What each role sees on the home screen

| Section | Super Admin | Central team | Site Investigator |
|---------|:-:|:-:|:-:|
| Study statistics | All sites | All sites | Own sites |
| Patient list with visit status | All | All | Own patients |
| Overdue visits | All | All | Own patients |
| Users | All | Investigators only | Hidden |
| Sites | All | View only | Hidden |
| Permissions | Yes | Hidden | Hidden |
| Export | Yes (TBC) | Yes | Hidden |
| Add patient | No | No | Yes |

---

## Open questions that block parts of this

- Numeric ranges for vitals and LVEF (Q-01)
- Login method: local, SSO, MFA (Q-02)
- Whether a user can belong to more than one site (Q-06, Q-07)
- Full audit trail in pilot or later (Q-08)
- Final drug list (Q-16)
- Visit windows (Q-17)

Work continues with placeholder values until these are answered.
