# STAND-HF E-CRF Portal: Project Docs

Index for the project documentation. Read in order for a full picture, or jump to the file you need.

| # | File | Purpose |
|---|------|---------|
| 01 | [01-overview.md](01-overview.md) | What we are building, for whom, and the phases |
| 02 | [02-requirements.md](02-requirements.md) | Functional and non-functional requirements with source references |
| 03 | [03-roles-access.md](03-roles-access.md) | The five user roles and the site-scoping rule |
| 04 | [04-architecture.md](04-architecture.md) | Stack, environments, and technical decisions |
| 05 | [05-data-model.md](05-data-model.md) | Entities and key fields (draft) |
| 06 | [06-validation-rules.md](06-validation-rules.md) | Hard errors, soft warnings, and open ranges |
| 07 | [07-ui-design.md](07-ui-design.md) | Screens and tablet design rules |
| 08 | [08-offline-sync.md](08-offline-sync.md) | Offline drafts, sync, and conflict handling (v1.1) |
| 09 | [09-security-compliance.md](09-security-compliance.md) | Security controls and compliance questions |
| 10 | [10-export.md](10-export.md) | CSV and XLSX export format |
| 11 | [11-testing-qa.md](11-testing-qa.md) | Test strategy and acceptance |
| 12 | [12-deployment-ops.md](12-deployment-ops.md) | Hosting, backups, releases, and patches |
| 13 | [13-timeline-phases.md](13-timeline-phases.md) | Phases, estimates, and the pilot plan |
| 14 | [14-open-questions.md](14-open-questions.md) | Items to confirm with the client |
| 15 | [15-work-breakdown-overview.md](15-work-breakdown-overview.md) | One-page module split and developer assignment |
| 15a | [15-work-breakdown.md](15-work-breakdown.md) | Full task list with dependencies (ClickUp source) |
| 16 | [16-dev-task-plan.md](16-dev-task-plan.md) | Two developers' ordered task lists, with dependencies and stubs |
| 17 | [17-module-tree.md](17-module-tree.md) | Main modules and sub-modules as a tree, with task IDs and owners |
| 18 | [18-tasks-by-module.md](18-tasks-by-module.md) | Tasks under each module, with owner and dependencies |
| 19 | [19-functional-acceptance.md](19-functional-acceptance.md) | Functional acceptance per screen and form: fields, validations, checks |
| 20 | [20-build-status.md](20-build-status.md) | What the prototype does today, where it lives, and the known gaps |
| - | [TASKS.md](TASKS.md) | Modular task tracker: To do and Complete |

## Source documents

- **Developer Brief v2.0** (client requirements, slide numbers cited as `[BRIEF sN]`)
- **Proposal v2.0** (Oct 1, 2026, cited as `[PROP]`)
- **SRS v1.0** (Oct 1, 2026, cited as `[SRS]`)
- **FSD v1.0** (Oct 6, 2026, marked "For Stakeholder Sign-off", cited as `[FSD §n]`). Not yet signed off, and it has known gaps (see [14-open-questions.md](14-open-questions.md)).
- **Functional Requirements (ODT)** (cited as `[FR]`)
- **Prototype HTML** (cited as `[PROTO]`). Demo only; not production code.

## Conventions

- **TBC** means the value or decision is not yet confirmed by the client.
- **Hard error** blocks saving or completing a visit. **Soft warning** lets the user continue.
- Task IDs use the module code from [TASKS.md](TASKS.md), for example `REG-03`.
