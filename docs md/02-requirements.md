# 02. Requirements

Priority: **P1** = needed for the pilot, **P2** = Phase 1 full, **P3** = Phase 2 or later.

## Patient registry (REQ-REG)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-REG-01 | Add a patient; auto-generate a unique Study ID linked to the site code | P1 | `[BRIEF s4] [SRS]` |
| REQ-REG-02 | Capture site code, investigator, consent date (required) | P1 | `[BRIEF s5] [PROP §2]` |
| REQ-REG-03 | Capture age, sex, HF etiology (ischemic, non-ischemic, other) | P1 | `[BRIEF s5] [FSD §2.3]` |
| REQ-REG-04 | Patient list filtered by site for site users; all sites for central roles | P1 | `[FSD §2.3]` |
| REQ-REG-05 | Track consent (the brief says "consent tracking") | P1 | `[BRIEF s4]` |

## Visit workflow (REQ-VIS)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-VIS-01 | One patient record with three visits: Baseline, 3 months, 6 months | P1 | `[BRIEF s3]` |
| REQ-VIS-02 | Baseline: consent, demographics, vitals, NYHA, 1MSTS, LVEF, GDMT | P1 | `[BRIEF s3] [FR §2]` |
| REQ-VIS-03 | 3 months: vitals, NYHA, 1MSTS, GDMT status, events. No LVEF. | P1 | `[FR §2] [PROP §2]` |
| REQ-VIS-04 | 6 months: vitals, NYHA, 1MSTS, LVEF, GDMT status, events | P1 | `[FR §2]` |
| REQ-VIS-05 | Fields per visit: visit date, weight (kg), heart rate, blood pressure (systolic and diastolic), NYHA class I to IV, 1MSTS repetitions | P1 | `[FR §3] [FSD §2.4]` |
| REQ-VIS-06 | LVEF (%) at Baseline and 6 months only | P1 | `[BRIEF s5] [FR §3]` |
| REQ-VIS-07 | Automatic due-date tracking: Baseline, then 3M, then 6M | P1 | `[BRIEF s3]` |
| REQ-VIS-08 | Visit window display (prototype: day 90 ±14, day 180 ±21) | P1 | `[PROTO]` TBC |
| REQ-VIS-09 | Visit completion locks the visit; reopening is logged | P1 | `[PROTO]` |

## GDMT module (REQ-GDM)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-GDM-01 | Four pillars per visit: ARNI (sacubitril/valsartan, not ACE-I/ARB), evidence-based beta-blocker, MRA, SGLT2 inhibitor | P1 | `[BRIEF s6] [FR §4]` |
| REQ-GDM-02 | Per drug: generic name (dropdown, no free text), daily dose, status (started, continued, stopped) | P1 | `[BRIEF s6] [FR §4]` |
| REQ-GDM-03 | Active pillars auto-calculated as 0/4 to 4/4 from therapy recorded at that visit | P1 | `[BRIEF s6]` |
| REQ-GDM-04 | Score visible at patient and site level | P2 | `[FR §4]` |
| REQ-GDM-05 | Reasons when a pillar is incomplete: hypotension, bradycardia, renal dysfunction, hyperkalemia, intolerance, cost/access, patient preference, physician decision, other | P1 | `[BRIEF s6] [FSD §2.5]` |

## Clinical events (REQ-EVT)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-EVT-01 | At 3M and 6M only, since the previous visit: HF hospitalization, other hospitalization, death, major intervention or event | P1 | `[BRIEF s5] [FR §5]` |
| REQ-EVT-02 | Baseline records prior history only (prototype) | P1 | `[PROTO]` TBC |

## Validation (REQ-VAL)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-VAL-01 | Numeric range checks for HR, BP, weight, LVEF, 1MSTS | P1 | `[BRIEF s9] [FR §10]` |
| REQ-VAL-02 | Visit date cannot precede enrollment | P1 | `[FR §10]` |
| REQ-VAL-03 | Soft warnings (not hard blocks) for unusual but possible values | P1 | `[BRIEF s9]` |
| REQ-VAL-04 | Field ranges are not yet confirmed | P1 | `[PROP §4]` TBC |

See [06-validation-rules.md](06-validation-rules.md).

## Audit trail (REQ-AUD)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-AUD-01 | Every correction logs who changed it, old value, new value, timestamp | P1 | `[BRIEF s9] [FR §11]` |
| REQ-AUD-02 | A reason or comment is required for every correction | P1 | `[BRIEF s9]` |
| REQ-AUD-03 | Audit view for central roles | P2 | `[FSD §2.1]` |
| REQ-AUD-04 | Logging of record creation and edits by user (future scope in FSD) | P3 | `[FSD §3]` conflict, see open questions |

## Export (REQ-EXP)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-EXP-01 | CSV export, one row per patient-visit | P1 | `[BRIEF s4] [FR §7]` |
| REQ-EXP-02 | XLSX export with the same structure | P2 | `[BRIEF s9] [FSD §2.7]` |
| REQ-EXP-03 | Export includes site, visit status, GDMT pillars, clinical assessments, events | P1 | `[FR §7]` |

See [10-export.md](10-export.md).

## Offline and sync (REQ-OFF)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-OFF-01 | Fully functional online and offline (PWA) | P2 | `[BRIEF s8]` |
| REQ-OFF-02 | Flow: open patient, enter data offline, store encrypted local draft, auto-sync when online | P2 | `[BRIEF s8]` |
| REQ-OFF-03 | Sync status per record: Synced, Pending Sync, Sync Failed | P2 | `[BRIEF s8]` |
| REQ-OFF-04 | Conflict handling: prevent duplicates, keep the latest verified record | P2 | `[BRIEF s8]` |

See [08-offline-sync.md](08-offline-sync.md).

## Roles and access (REQ-ROL)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-ROL-01 | Five roles: Super Admin, PI/Central Team, Site Investigator/Coordinator, Data Manager, Read-only User | P1 | `[BRIEF s7]` |
| REQ-ROL-02 | Site users see only their own site's patients; central roles see all sites | P1 | `[BRIEF s7]` |
| REQ-ROL-03 | Access enforced on every API endpoint | P1 | `[FSD §2.2]` |

See [03-roles-access.md](03-roles-access.md).

## Dashboards (REQ-DSH, Phase 2)

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| REQ-DSH-01 | Recruitment tracking across all sites | P3 | `[BRIEF s9] [PROP §Phase 2]` |
| REQ-DSH-02 | Missing-visit alerts against the Baseline, 3M, 6M schedule | P3 | `[PROP]` |
| REQ-DSH-03 | GDMT coverage at site and study level | P3 | `[BRIEF s4]` |
| REQ-DSH-04 | Patient trajectories across visits | P3 | `[BRIEF s4]` |

## Non-functional (REQ-NFR)

| ID | Requirement | Source |
|----|-------------|--------|
| REQ-NFR-01 | Supports about 100 sites | `[BRIEF s1]` |
| REQ-NFR-02 | Minimum clicks and fields; dropdowns over free text | `[BRIEF s2]` |
| REQ-NFR-03 | Tablet and laptop friendly | `[BRIEF s2]` |
| REQ-NFR-04 | HTTPS for all traffic; encrypted local storage for drafts | `[BRIEF s8]` |
| REQ-NFR-05 | Works on current Chrome, Edge, Safari and Firefox; older browsers unsupported | `[FSD §7]` |
