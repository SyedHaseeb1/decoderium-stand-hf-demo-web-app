# 03. Roles and Access

Source: `[BRIEF s7]`, consistent with `[PROP §2]` and Developer Brief v2. Updated **Oct 18, 2026**.

## Roles

| Role | Responsibilities | Scope |
|------|------------------|-------|
| **Super Admin** (`superadmin`) | Complete system administration: configure sites, zones, and user accounts; manage the Role Permissions Matrix; reset passwords with temporary credentials; view national study metrics, site league standings, and audit logs; export study data. Clinical visit forms are reserved for clinical staff. | All sites, all zones |
| **Central Team** (`central`) | National study directorate oversight: read-only visibility into all centres and patient records across Pakistan; inspect user and site directories; view study-wide GDMT performance; export datasets; review audit trails. | All sites, all zones (oversight) |
| **Site Investigator** (`investigator`) | Clinical staff at hospital centres: enroll consented patients; complete Baseline, Month 3, and Month 6 visit CRFs; document GDMT titration; record clinical events; upload prescriptions. Scoped strictly to their single assigned centre. | Assigned site only |

---

## Permissions & Role Governance

All capabilities are governed by `can(perm)` in `assets/access.js`. Super Admin can toggle capabilities for `investigator` and `central` via the **Role Permissions Matrix** in `System Administration -> Permissions` (`admin/index.html#perms`).

| Permission | Super Admin | Central Team | Site Investigator |
|------------|:-----------:|:------------:|:-----------------:|
| See records at every site (`view_all_sites`) | Yes | Yes | No (assigned site only) |
| Add new patients (`add_patient`) | No (clinical staff) | No | Yes |
| Enter and edit visit data (`enter_data`) | No (clinical staff) | No | Yes |
| Mark visits complete or reopen (`mark_complete`) | No | Yes | Yes |
| Export study data (`export_data`) | Yes | Yes | **No (default)** — configurable by Admin |
| Assign investigators and sites (`assign_investigators`) | Yes | No (read-only view) | No |
| Manage users (`manage_users`) | Yes | No (read-only view) | No |
| Manage sites (`manage_sites`) | Yes | No (read-only view) | No |
| Load demo dataset (`load_demo`) | No | No | Yes (demo environment) |
| Clear all data (`clear_all`) | No | No | Yes (demo environment) |

> [!IMPORTANT]
> **Site Investigator Export Rule**:
> By default, `export_data` is disabled for Site Investigators. When disabled, the investigator **does not even see the export screen**:
> - The "Data Export" link in the sidebar is hidden.
> - The "Data Export & Reports" tab on the dashboard is omitted.
> - The "Data Export" header button is omitted.
> - The "Export CSV" button in Participant Records is hidden.
> - Direct navigation to `#export` redirects automatically to Overview.
> If the Super Admin enables "Export CSV" in the Role Permissions Matrix, these features dynamically appear for Site Investigators.

---

## Role-Differentiated Views

- **Site Investigator Dashboard**:
  - Displays assigned hospital centre banner.
  - 5 Personal KPI tiles: My Patients, New Enrollees, Baseline Complete %, Follow-ups Due (with alert tag for overdue visits), Pending Sync.
  - 4 Focused tabs: Overview, Upcoming Visits Queue, Clinical Performance (centre GDMT metrics), Assigned Site Info.
- **Executive Dashboard (Super Admin & Central Team)**:
  - National overview metrics: Total Patients Enrolled, Monthly Intake Rate, Baseline Completion %, Follow-up Alert Queue, Sync Status.
  - 5 Executive tabs: Overview, Clinical Performance (interactive 4-pillar GDMT analytics), Sites & League Table (centre recruitment & follow-up rankings), Follow-up Queue, and the interactive **Data Export Studio**.

---

## Data Export Governance

Export functionality is accessible via the **Data Export Studio** on the Executive Dashboard and the CSV export button in Participant Records.

- **Scope:** Filter by Zone (`North`, `Central`, `South`), Centre (`RIC`, `LHR`, `KHI`, `ISB`), Date Range (Consent Date or Visit Date), and Visit Types (`Baseline`, `Month 3`, `Month 6`).
- **Formats:** Standardized CSV (one row per patient or longitudinal visit rows).
- **Audit Logging:** Every export event is written to the audit log with the user, timestamp, record count, and applied filters.

---

## Security & Scoping Rules

1. **Mandatory Site Isolation**: Site Investigators can never view, search, edit, or aggregate records outside their assigned site (`mySites()`).
2. **One-Investigator-One-Site**: Each Site Investigator account is bound to strictly one clinical hospital centre.
3. **Session Authentication Gate**: All application pages enforce authentication against `sessionStorage.getItem('standhf_auth') === '1'`. Unauthenticated sessions are redirected to `login/`.
4. **First-Time Password Initialization**: Users flagged with `mustChangePassword === true` (new accounts or after an admin reset) are redirected to `setup/` to set a secure password before accessing the portal.
5. **Super Admin Account Safeguard**: The Super Admin cannot deactivate its own account, and at least one active Super Admin must always exist in the system.
6. **Audit Trail Immutability**: All corrections to clinical visit entries, visit reopenings, user management actions, and export triggers require an audit log entry.
7. **Authentication Identity (Dual Login)**: Users may authenticate using either their unique **Official Email** (mandatory upon account creation) or their **Username** (optional, auto-derived from email prefix if omitted).
