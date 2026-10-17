# 10. Data Export

Source: `[BRIEF s4, s9] [FR §7] [FSD §2.7]`, Developer Brief v2. Updated **Oct 18, 2026**.

---

## 1. Access Governance & Permissions

Data export capabilities are governed by the `export_data` permission in `assets/access.js`:

- **Super Admin (`superadmin`)**: Full export capability across all study centres and zones.
- **Central Team (`central`)**: Full export capability across all study centres and zones for study oversight and reporting.
- **Site Investigator (`investigator`)**: **Disabled by default**. 
  - When disabled, Site Investigators **do not see the export screen, tabs, or buttons**:
    - "Data Export" link in the sidebar is hidden.
    - "Data Export & Reports" tab on the dashboard is omitted.
    - "Data Export" action button in the header is omitted.
    - "Export CSV" button in Participant Records is hidden.
    - Direct URL access to `#export` redirects automatically to Overview.
  - **Dynamic Admin Control**: The Super Admin can dynamically grant or revoke "Export CSV" for Site Investigators via the **Role Permissions Matrix** in `System Administration -> Permissions` (`admin/index.html#perms`).

---

## 2. Export Interfaces

The portal provides two export interfaces for authorized users:

### A. Interactive Data Export Studio (`dashboard/#export`)
Located in the executive dashboard view:
- **Zone Filter**: All Zones, North Zone, Central Zone, South Zone.
- **Centre Filter**: All Centres or individual hospital sites (`RIC`, `LHR`, `KHI`, `ISB`).
- **Date Range**: Filter by Consent Date or Visit Date with start and end dates.
- **Visit Type**: Filter by Baseline (B), Month 3 (M3), and Month 6 (M6).
- **Export Presets**:
  - *Standard Summary CSV*: One row per patient containing patient demographics, clinical vitals across all completed visits, active GDMT score, and clinical events.
  - *Longitudinal Multi-visit CSV*: One row per patient-visit for detailed statistical modeling.

### B. Quick CSV Export (`records/`)
Located on the Participant Records page (`#bCsv`):
- Downloads a standardized CSV dataset of all patient records within the user's permitted site scope.
- Button is automatically hidden if the active user lacks the `export_data` capability (`el.hidden = !can('export_data')`).

---

## 3. Columns & Data Contract

| Column | Description |
|--------|-------------|
| `study_id` | Unique Study Identifier (e.g. `RIC-001`) |
| `site_code` | Hospital Centre Code (`RIC`, `LHR`, `KHI`, `ISB`) |
| `investigator` | Principal or Site Investigator full name |
| `consent_date` | Date of written informed consent (`YYYY-MM-DD`) |
| `patient_name` | Patient full name |
| `contact_number` | Patient 11-digit mobile contact number |
| `age` | Patient age in years |
| `sex` | Biological sex (`Male`, `Female`) |
| `hf_etiology` | Etiology of heart failure (`Ischemic`, `Non-ischemic`, `Other`) |
| `visit_type` | Visit interval (`b`, `m3`, `m6`) |
| `visit_status` | Status of visit (`Completed`, `In progress`) |
| `weight_kg` | Body weight in kilograms |
| `heart_rate` | Resting heart rate in beats per minute |
| `sbp` | Systolic blood pressure (mmHg) |
| `dbp` | Diastolic blood pressure (mmHg) |
| `nyha_class` | NYHA functional class (`I`, `II`, `III`, `IV`) |
| `msts_1_reps` | 1-minute sit-to-stand repetitions |
| `msts_stop_reason` | Clinical reason if 1MSTS was stopped early |
| `lvef_percent` | Left ventricular ejection fraction (%) [Baseline and 6M only] |
| `arni_status`, `bb_status`, `mra_status`, `sglt2i_status` | Individual pillar statuses (`Active`, `Not started`, `Stopped`) |
| `arni_drug`, `bb_drug`, `mra_drug`, `sglt2i_drug` | Prescribed generic drug names |
| `arni_strength`, `bb_strength`, `mra_strength`, `sglt2i_strength` | Dosage strength |
| `arni_freq`, `bb_freq`, `mra_freq`, `sglt2i_freq` | Prescribed daily frequency (`OD`, `BD`, `TDS`) |
| `active_pillars` | Total active foundational GDMT pillar score (0 to 4) |
| `incomplete_reasons` | Semicolon-separated clinical reasons for non-prescribed pillars |
| `hf_hospitalization`, `other_hospitalization`, `death` | Binary indicators (`0` or `1`) for adverse clinical events |
| `major_intervention` | Documented major cardiovascular interventions |

---

## 4. Audit Trail & Compliance

1. Every data export event writes an entry to the audit log:
   - User identity and role
   - Timestamp (ISO 8601 & formatted local time)
   - Scope and record count
   - Applied filters (Zone, Centre, Date range)
2. Incomplete or draft visits are clearly designated by `visit_status = "In progress"` in the dataset.
3. No patient values are altered or imputed during export generation.
