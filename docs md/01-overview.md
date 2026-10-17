# 01. Project Overview

## Purpose

Replace the paper One-Page CRF for the STAND-HF Registry with a secure, offline-capable E-CRF portal. The portal captures longitudinal data for stable HFrEF (heart failure with reduced ejection fraction) patients across Baseline, 3-month and 6-month visits, in about 100 cardiology sites `[BRIEF s1, s2]`.

The guiding principle is "clinical workflow first, software second" `[BRIEF s2]`.

## Parties

- **Client:** Highnoon Laboratories Limited, Lahore `[PROP]`
- **Vendor:** Decoderium Technologies Pvt. Ltd., Islamabad `[PROP]`
- **Principal Investigator:** Dr. Hamid Sharif, RIC Rawalpindi `[FSD]`

## Core workflow

Open patient, complete visit, save, sync, export `[BRIEF s2]`.

## Deliverable form

A **web app built as a Progressive Web App (PWA)**, used on tablets and laptops. Native iOS and Android apps are out of scope `[BRIEF s8] [FSD §6]`. A native wrapper can be added later if needed.

## Phases

| Phase | Content | Source |
|-------|---------|--------|
| Pilot (v1) | Core capture, roles, audit basics, CSV export, hosted online. See [13-timeline-phases.md](13-timeline-phases.md). | Team decision |
| Phase 1 (full) | Core E-CRF, offline sync, full audit trail, export | `[BRIEF s9] [PROP]` |
| Phase 2 | Dashboards, missing-visit alerts, analytics | `[BRIEF s9] [PROP]` |
| Future | SMS/email alerts, change logging, cosmetic changes | `[FSD §3]`, TBC |

## Out of scope

- 1-month visit (removed in v2.0) `[BRIEF s3] [FSD §6]`
- Hospital EMR, HIS or LIS integration `[FSD §6]`
- Native mobile apps `[FSD §6]`
- Multi-language support `[FSD §6]`
- Automated SMS or email reminders `[FSD §6]`
- On-premise installation; cloud hosting is assumed `[FSD §6]`
- 21 CFR Part 11 validation package, unless separately requested `[FSD §7]`

## Success criteria (draft, TBC with client)

- Coordinators can complete a Baseline visit on a tablet in one sitting.
- No record is lost when connectivity drops (from Phase 1 onward).
- Every correction is traceable (from Phase 1 onward, with a basic version in the pilot).
- Central team can export one row per patient-visit for analysis.
- Site users see only their own site's patients.
