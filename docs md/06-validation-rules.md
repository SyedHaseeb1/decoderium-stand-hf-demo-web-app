# 06. Validation Rules

Rules fall into two types:
- **Hard error:** blocks saving or marking the visit complete.
- **Soft warning:** shown to the user, who can continue `[BRIEF s9] [FR §10]`.

**All numeric ranges are placeholders until the client confirms them** `[PROP §4]`. Values marked `[PROTO]` come from the prototype and are not approved.

## Patient rules

| Field | Rule | Type | Source |
|-------|------|------|--------|
| Consent date | Required | Hard | `[PROP §2]` |
| Patient name | Required | Hard | UI change (new) |
| Contact number | **Exactly 11 digits** (e.g. 03001234567) | Hard | `[E-CRF Changes p.2]` |
| Age | 18 or more | Hard | `[PROTO]` TBC |
| Sex, HF etiology | Required | Hard | `[FSD §2.3]` |
| Study ID | Auto-generated, read-only | Hard | `[BRIEF s4]` |
| Consent date vs. Baseline visit date | Baseline date must not be before consent | Hard | `[PROTO]` |

## Visit rules

| Field | Rule | Type | Source |
|-------|------|------|--------|
| Visit date | Handled automatically in background (defaults to consent date for Baseline) | System | `[E-CRF Changes p.3]` |
| Visit date (3M, 6M) | Must be after Baseline date | Hard | `[PROTO]` |
| Visit window, 3M | Day 90 ±14 from Baseline | Soft | `[PROTO]` TBC |
| Visit window, 6M | Day 180 ±21 from Baseline | Soft | `[PROTO]` TBC |
| Weight | Numeric range TBC | Hard range, soft warning | `[BRIEF s9]` |
| Heart rate | Placeholder 30 to 220 bpm | Soft | `[PROTO]` TBC |
| Systolic BP | Placeholder 50 to 260 mmHg | Soft | `[PROTO]` TBC |
| Diastolic BP | Must be lower than systolic | Hard | `[PROTO]` |
| 1MSTS repetitions | Placeholder 0 to 60 | Soft | `[PROTO]` TBC |
| NYHA class | Required | Hard | `[FR §3]` |
| NYHA IV | Confirm exclusion criteria | Soft | `[PROTO]` |
| LVEF (%) | Required at Baseline and 6M (moved to Section B primary assessment grid) | Hard for presence, soft for range | `[E-CRF Changes p.3]` |
| LVEF at 3M | Not captured (N/A at 3 months) | - | `[BRIEF s5]` |
| Echo date | Removed from form | - | `[E-CRF Changes p.3]` |
| 1MSTS repeated | Removed from form | - | `[E-CRF Changes p.3]` |
| Baseline LVEF | Above 40% is outside registry inclusion | Soft | `[PROTO]` TBC |

## Prescription upload rules

Applies to the Baseline, 3M and 6M forms. Upload is optional and does not block completion (TBC).

| Rule | Type | Source |
|------|------|--------|
| File type: PDF, JPEG or PNG only | Hard | UI change (new) |
| File size per file: limit TBC (default 10 MB) | Hard | UI change (new), Q-20 |
| Upload to a locked visit | Hard. Site users must reopen the visit first | Follows the lock rule |
| File stored against a visit of a patient at the user's own site | Hard | Site scope rule |

## GDMT rules

| Rule | Type | Source |
|------|------|--------|
| Status | Auto-selected as 'Active' when a generic medicine is chosen; default 'Not started' | System / Auto | `[E-CRF Changes p.4,5]` |
| Active pillar generic drug | Required from pillar dropdown list | Hard | `[E-CRF Changes p.6]` |
| Active pillar strength | Required from drug-specific strength dropdown | Hard | `[E-CRF Changes p.5,6]` |
| Active pillar frequency | Required from frequency dropdown (`OD`, `BD`, `TDS`) | Hard | `[E-CRF Changes p.5,6]` |
| Start date | Removed from each pillar card | - | `[E-CRF Changes p.4,5]` |
| Not started or Stopped pillar needs at least one reason | Documented in Section C reasons | Soft | `[BRIEF s6]` |

## Events rules

| Rule | Type | Source |
|------|------|--------|
| Events entered only at 3M and 6M | Hard | `[BRIEF s5]` |
| Death recorded at 3M or 6M | Soft warning: confirm no further visits | Proposed |

## Audit rules

| Rule | Type | Source |
|------|------|--------|
| Any correction to a saved value requires a reason | Hard | `[BRIEF s9]` |

## Open questions

- Exact numeric ranges for HR, BP, weight, LVEF and 1MSTS (TBC, `[PROP §4]`)
- Visit window definitions (TBC)
- Inclusion rules: LVEF cutoff and age (TBC)
- Whether a death at 3M should block further visits (TBC)
