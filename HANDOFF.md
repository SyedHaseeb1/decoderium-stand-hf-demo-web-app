# STAND-HF E-CRF Portal: Front-End Handoff to Backend

This document is for the backend team. It explains what the front end reads today, where that data lives, and what needs an API. The front end is pure HTML, CSS and vanilla JavaScript. It has no build step.

Related documents:
- `data/README.md`: short description of each JSON file.
- `AGENTS.md`: project rules, page structure and access model.
- `../docs/`: product specifications.

---

## 1. How data reaches the screen today

1. Every data-dependent page includes `assets/boot.js` and runs its scripts only after the data has loaded.
2. `boot.js` fetches the JSON files in `data/` and stores them in one object, `window.STANDHF_DATA`:

   | `STANDHF_DATA` key | Source file |
   | --- | --- |
   | `accessControl` | `data/access-control.json` |
   | `users` | `data/users.json` |
   | `gdmt` | `data/gdmt.json` |
   | `clinicalOptions` | `data/clinical-options.json` |
   | `locationStandards` | `data/location-and-title-standards.json` |
   | `demoNames` | `data/demo-names.json` |

3. Scripts read from `STANDHF_DATA`. The notification feed and the release notes are fetched on their own (`assets/header.js` and `assets/whatsnew.js`).
4. If a fetch fails, `boot.js` redirects to `error/` (the error page). It passes the current page in `?from=`, so "Try again" returns the user to the same screen. The error page does not load `boot.js`, so the redirect cannot loop.

**To move to the API:** replace the fetches in `assets/boot.js` with API calls, and keep the same `STANDHF_DATA` shape. Most of the front end will then need no changes.

---

### 1a. App shell

- `app/index.html` is the entry point after sign-in. It draws the header and side menu once, and loads each screen (Dashboard, Records, Admin) into a frame.
- Menu and header links to a screen change the frame, so the header and menu are not rebuilt when moving between screens.
- Each screen detects that it is inside the shell (`html.embedded`), skips its own header and menu, and skips header-only fields such as the signed-in name.
- A screen opened directly (for example `dashboard/index.html`) still works on its own with its own header and menu.
- Auth checks inside the frame send the whole window to sign-in (`window.top`).

## 2. Data files and their shapes

### `access-control.json`: roles, permissions, sites
- `roleNames`: `{ superadmin, investigator, central }` display names.
- `permissions`: list of `[key, label]` pairs.
- `superNo`: permissions the Super Admin must not have (`load_demo`, `clear_all`).
- `zones`: master list of zone names.
- `sites`: list of `{ code, name, zone, city }`. **The zone belongs to the site.**
- `perms`: default permissions per role, as `{ role: { permissionKey: true } }`.
- `_migrated_inv_export_v2`: one-time migration flag. It can be dropped.

### `users.json`: user accounts
```json
{ "users": [ {
  "username": "emily.carter",
  "name": "Emily Carter",
  "role": "investigator",
  "sites": ["RIC"],
  "active": true,
  "mustChangePassword": false,
  "personal": { "designation": "Consultant Cardiologist", "phone": "03001230001", "email": "emily.carter@standhf.example" }
} ] }
```
- `role`: `superadmin`, `investigator` or `central`.
- An **investigator has exactly one site**. A **central** user has all sites. A **super admin** has no sites.
- Accounts created by the Create User form also carry `password` (a temporary one) and `passwordCreatedAt`. See section 5.

### `gdmt.json`: GDMT drugs and statuses
- `pillars`: four items, one per pillar. Each has `key` (`arni`, `bb`, `mra`, `sg`), `label` (short, for dashboards), `formLabel` (for the Records form), and `drugs`.
- Each drug has `name`, `strengths`, `defaultFreq` and optional `aliases` (old spellings still in saved records).
- `statuses`: `Active`, `Not started`, `Stopped`. These are keys. See section 4.
- `notUsedReasons`: `{ key: label }`, reasons a pillar is not used (`hypo`, `brady`, `renal`, `k`, `intol`, `cost`, `pref`, `phys`).

### `clinical-options.json`: dropdown options
- `etiologies`: HF etiology values.
- `nyhaClasses`: `I`, `II`, `III`, `IV`.
- `stopReasons`: reasons a drug is stopped.

These client-dependent lists can change at any time, so they should come from the API.

### `location-and-title-standards.json`: approved names
- `pakistanCities`, `pakistanZones`, `clinicalDesignations`: approved lists.
- `cityAliases`, `zoneAliases`, `designationAliases`: map a typed spelling to its approved value.

### `demo-names.json`: demo data only
- `patientNames`: names for the demo patient loader.

The investigator dropdown is built from the users with role `investigator` in `users.json`.

### `notifications.json`: demo notifications
- Keyed by username: `{ "emily.carter": [ { id, site, type, title, text, time, link } ] }`.
- `type`: `deleted`, `due`, `overdue`, `missing`, `admin` or `info`.
- `link`: `{ page, patient?, tab? }` to open a record.

### `whatsnew.json`: release notes
- `date`, `version`, and `content`: a list of `{ cat, items[] }`.
- The version controls when the sign-in dialog shows again. Change it with each release.

### `dummy_data.json`: demo patients
- `pts`: 44 patients, spread unevenly across the four sites (RIC 13, LHR 9, KHI 10, ISB 12). Each site's investigator owns that site's patients.
- Each patient has `id` (for example `RIC-001`), `site`, `owner` (username), `inv` (investigator name), `name`, `contact`, `consent`, `age`, `sex`, `etio`, `etioO`, `sync`, `files`, `audit` and `v`.
- `v` has three visits: `b` (Baseline), `m3` (3 months) and `m6` (6 months). Each visit has `date`, `done`, the clinical measures (`wt`, `hr`, `sbp`, `dbp`, `nyha`, `msts`, `lvef`), `g` (GDMT per pillar: `drug`, `strength`, `freq`, `dose`, `status`), and the reasons (`rs`, `rsO`, `stop`).
- `off`: whether the demo was set to offline.

---

## 3. Lists kept in code on purpose

These are fixed or belong to the screen, so they stay in the front end:
- **Sex** (`Male`, `Female`) and **dosing frequencies** (`OD`, `BD`, `TDS`).
- **Visit tabs**: Baseline, 3 Months, 6 Months, and their keys.
- Screen text, field labels and messages.
- Validation rules and input limits (`assets/validator.js`, the Records page).
- Login tab-to-role mapping and role descriptions.
- Header icons, menu structure, chart colours.

---

## 4. Keys the front end checks by name

The code checks these values directly. The backend can change them only with a front-end release:
- GDMT statuses `Active`, `Stopped` and `Not started`. `Active` counts a drug toward the pillar totals and requires a strength and frequency. `Stopped` should have a reason (the form warns if it is missing). `Not started` is the default.
- Pillar keys `arni`, `bb`, `mra`, `sg`.
- Visit keys `b`, `m3`, `m6`.
- Role keys `superadmin`, `investigator`, `central`.

Values that the client may change (reason lists, stop reasons, etiology, NYHA classes, sites, zones, drugs) are already read from data. Changing them needs no front-end change.

---

## 5. Data saved in the browser today (replace with API calls)

| Storage | Key | What it holds |
| --- | --- | --- |
| localStorage | `standhf_access_v1` | Full access store: sites, users, permissions. Written by the Admin page. |
| localStorage | `standhf_ecrf_v1` | All patient records, including visits and audit history. |
| localStorage | `standhf_central_audit_v1` | Audit trail of central team actions. |
| localStorage | `standhf_notes_read_<username>` | Which notifications the user has read. |
| localStorage | `standhf_whatsnew_hidden`, `standhf_theme`, `standhf_remember_user`, `standhf_pt_list_collapsed`, `standhf_sec_collapsed`, `standhf_nav_collapsed`, `standhf_view`, `standhf_manual_offline`, `standhf_early_dismiss_all` | Per-browser UI preferences. These can stay in the browser. |
| IndexedDB | `standhf_files_v1` | Uploaded prescription files (PDF, JPG, PNG; up to 5 files, 10 MB each per visit). |
| sessionStorage | `standhf_auth`, `standhf_user`, `standhf_role`, `standhf_username`, `standhf_must_change_pw` | The signed-in session. Replace with a server session or token. |

**Things the backend needs to know:**
- A user created in the Admin page is saved only in that browser. It must be sent to the server.
- The Admin page also saves edits to sites and user access in the browser.
- Passwords for form-created users are stored in plain text in the browser. The server must hash them.
- Demo accounts have no password, so any password signs them in. Real accounts must be checked on the server.
- When an admin deletes a demo user, `accessStore()` adds the demo user back on the next page load. This does not affect new users.

---

## 6. Known issues to fix before go-live

- **Dashboard export filters** (`dashboard/index.html`, around lines 1790–1802) hardcode the pillar and etiology options. They should be built from `gdmt.json` and `clinical-options.json`.
- **Stale status check** (`dashboard/index.html`, around line 1262) looks for `Prescribed` and `Maintained`, which are not GDMT statuses.
- **Demo builder** (`records/index.html`, around line 800) uses its own strength and frequency lists. It is demo only.

---

## 7. Demo and generator tooling

- `data/generate_data.js` regenerates `dummy_data.json`. It no longer writes the access or reference files. Those are maintained by hand.
- `data/generate_pdf.py` builds the data package PDF.
- The Load demo button on the Records page calls `loadDemo()`, which fetches `dummy_data.json` and falls back to generated data if the fetch fails.

---

## 8. Checks before handoff

Run these after any data change:
- Each page loads with no console errors: login, setup, records, dashboard and admin.
- Investigators see only their own site's patients (for example, Adnan Khan sees only the 10 KHI patients).
- Every patient's `site` exists in `access-control.json`, and its `owner` is a user assigned to that site.
- Every drug, strength, frequency and status in the patients exists in `gdmt.json`.
- No visit is dated after the day the data was made, and visits are in order (Baseline, 3 months, 6 months).

The data check used during development was a one-off script. It should be added to the project before the backend work starts.
