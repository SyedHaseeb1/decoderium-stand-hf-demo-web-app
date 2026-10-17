# 17. Module Tree (FSD Section 2)

Main modules follow FSD v1.0 section 2 (Scope of Work). Sub-modules and task IDs come from [16-dev-task-plan.md](16-dev-task-plan.md). Owner is in brackets.

```
STAND-HF E-CRF Portal
│
├── 0. Foundation  [Dev 1]
│   ├── Project setup and database ............ S-01
│   ├── Shared contracts (roles, entities) .... S-02
│   └── CI on every PR ........................ F-06
│
├── 2.1 User roles and access control
│   ├── Three roles and permission matrix  [Dev 1] ..... 1.6
│   ├── Site scope on every endpoint  [Dev 1] .......... 1.10
│   ├── Central team manages investigators  [Dev 1] .... 1.9
│   ├── Home shell and /me  [Dev 1] .................... 1.4
│   └── Home dashboard data per role  [Dev 2]
│       ├── Statistics, worklist, overdue ........ 2.1
│       └── Dashboard on real data ............... 2.9
│
├── 2.2 Authentication and security  [Dev 1]
│   ├── Username and password login ............. 1.1
│   ├── Lockout and session timeout ............. 1.2
│   └── Password change and reset ............... 1.3
│
├── 2.3 Patient registry  [Dev 2]
│   ├── Seed data (synthetic patients) .......... 2.2
│   └── Add patient, Study ID, edit with reason . 2.3
│       (patient name and contact number, required)
│
├── 2.4 Visit forms (Baseline, 3M, 6M)  [Dev 2]
│   ├── Clinical rules and validation ........... 2.4
│   ├── Visit forms: save, complete, lock ....... 2.5
│   ├── Prescription upload (Baseline, 3M, 6M) . 2.10
│   └── Patient record: info and files ......... 2.8
│
├── 2.5 GDMT module  [Dev 2]
│   └── Four pillars, active score, reasons ..... 2.6
│
├── 2.6 Clinical events module  [Dev 2]
│   └── Hospitalizations, death, intervention ... 2.7
│
├── 2.7 Data export  [Dev 1]
│   └── CSV, one row per patient-visit .......... 1.13
│
├── 2.8 Basic administration  [Dev 1]
│   ├── Users (create, edit, deactivate) ........ 1.5
│   ├── Sites (create, edit, deactivate) ........ 1.7
│   └── Assign sites to users ................... 1.8
│
├── 2.9 Audit trail  [Dev 1]  (brief requires it; not in FSD section 2)
│   ├── Append-only audit writer ................ 1.11
│   └── Audit view for central roles ............ 1.12
│
└── Later
    ├── Offline sync (FSD puts it in Phase 1; plan has it in v1.1)
    └── Phase 2 dashboards: recruitment, GDMT coverage, trajectories
```

---

## Owner count

| Owner | Main modules | Tasks |
|-------|--------------|-------|
| Dev 1 | 0, 2.1 (roles, shell), 2.2, 2.7, 2.8, 2.9 | S-01, S-02, F-06, 1.1 to 1.13 |
| Dev 2 | 2.1 (dashboard data), 2.3, 2.4, 2.5, 2.6 | 2.1 to 2.9, S-03 |

---

## Points to confirm

- **Audit trail** is not in FSD section 2. It is future scope in the FSD, but the brief and proposal require it in Phase 1. It is shown as 2.9 so it stays visible.
- **Offline sync** is in Phase 1 in the FSD. The plan puts it in v1.1, after the pilot.
- The overview PDF ([15-work-breakdown-overview.pdf](15-work-breakdown-overview.pdf)) still has the older owner split. Say the word and I'll regenerate it to match this tree.
