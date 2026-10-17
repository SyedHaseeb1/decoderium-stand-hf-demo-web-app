# 11. Testing and QA

## Levels

| Level | What | Tools (proposed) |
|-------|------|------------------|
| Unit | Validation rules, active-pillar score, visit windows, Study ID generation | xUnit (.NET), Jest or Vitest (frontend) |
| API integration | Auth, role and site scoping on each endpoint, audit writes | xUnit with a test database |
| UI end-to-end | Visit completion, validation messages, export | Playwright |
| Offline scenarios (v1.1) | Save offline, reconnect, sync, conflict cases | Playwright with network throttling |
| Role testing | Each of the five roles against each screen | Manual checklist and automated tests |
| UAT | Clinical staff on real tablets | Client-run |

## Acceptance criteria for the pilot

- All hard-error rules block completion; soft warnings appear and do not block.
- A site user cannot read or edit another site's patient, including through the API.
- Every correction creates an audit row with a reason.
- The export matches the data for a set of test patients, row for row.
- The visit form can be completed on a 10-inch tablet in landscape and portrait.

## Test data

- Synthetic patients only. Never copy production data into test.
- A seed script creates sites, users for each role, and a set of patients at each visit stage.

## Defects

- Severity: Critical (data loss, access breach), High (blocks a workflow), Medium (workaround exists), Low (cosmetic).
- Critical and High defects block release.

## Tasks

See QA-* in [TASKS.md](TASKS.md).
