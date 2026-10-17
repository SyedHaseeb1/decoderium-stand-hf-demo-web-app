# 13. Timeline and Phases

## Phase summary

| Phase | Scope | Estimate | Basis |
|-------|-------|----------|-------|
| **Pilot (v1)** | Login, admin, registry, visit forms (hard validation), GDMT, events, basic audit, CSV export, hosted online | 2 weeks, about 10 working days, 3 people. Tight. | Team decision, see below |
| **v1.1** | Offline drafts, sync, conflict handling, soft warnings | About 3 to 4 weeks | My estimate: offline sync alone is 16 to 20 days |
| **Phase 1 (full)** | Everything in Phase 1, plus full audit trail and XLSX | 9 to 12 weeks total | `[PROP]` 60 to 65 days; my estimate 68 to 90 person-days |
| **Phase 2** | Dashboards and alerts | 3 to 4 weeks | `[PROP]` 20 to 25 days |

**The FSD's 18-day plan** covers too little for the scope and is not used for planning `[FSD §4]`.

## Pilot plan (two weeks)

| Days | Work |
|------|------|
| 1 | Kick-off. Confirm scope freeze, pilot sites, clinical ranges, auth approach. Environment ready (PostgreSQL installed, repo created). |
| 2 | Clickable mockup of five screens reviewed with client. Data model finalised. |
| 3 to 5 | Auth, admin, roles, site scoping. Patient registry. |
| 6 to 8 | Visit forms, GDMT, events, hard validation, basic audit. |
| 9 | CSV export. Deployment to pilot host. |
| 10 | Smoke test on tablets. Fixes. Pilot go-live at one or two sites with paper CRF in parallel. |

## Preconditions

- Client confirms validation ranges and auth approach by day 2.
- Hosting and domain ready by day 1.
- Pilot sites and tablets identified.
- Scope frozen at kick-off.
- Ethics or data-protection approval before live patient data. Verify first (see [09-security-compliance.md](09-security-compliance.md)).

## Risks

| Risk | Effect | Mitigation |
|------|--------|-----------|
| Scope creep into pilot | Date slips | Scope freeze; changes go to v1.1 |
| Clinical ranges delayed | Validation rework | Use placeholders marked TBC; config-driven limits |
| Offline expected in pilot | Pilot cannot ship in two weeks | Pilot sites with reliable internet; paper CRF in parallel |
| Schema changes after pilot | Data migration | Design audit and version fields now |
| Ethics approval missing | Cannot go live | Check on day 1 |

## Cost reference

Costs are in [FSD §8] and are not confirmed. The FSD prices all of Phase 1 and Phase 2 at PKR 450,000 for development, PKR 42,500 for year 1 hosting and PKR 20,000 for deployment. This does not match the proposal's effort estimate. Revisit once the pilot scope is agreed.
