# 19. Functional Acceptance Criteria

One section per screen or form. For each one: who uses it, the fields, the validation, and the checks the client signs off on.

**Rules used throughout**
- **Hard error** blocks saving as complete and blocks "mark complete". Drafts can be saved with hard errors.
- **Soft warning** is shown as an amber notice. The user can continue.
- All numeric ranges are **placeholders** until the client confirms them (Q-01). Marked TBC.
- Sources: `[BRIEF sN]` developer brief slide, `[FSD 2.x]` FSD section, `[FR §n]` functional requirements, `[06]` [06-validation-rules.md](06-validation-rules.md).

---

## A. Login

**Who:** all three roles.
**Source:** `[FSD 2.2]`, `[BRIEF s7]`.

| Field | Required | Rule |
|-------|:-:|------|
| Username | Yes | Not empty |
| Password | Yes | Not empty |

**Acceptance**

1. Correct username and password open the home screen for that user's role.
2. Wrong username or password shows one message: "Username or password is incorrect". It does not say which one was wrong.
3. Empty username or password is blocked with a message next to the empty field. No request is sent.
4. After N failed attempts (N TBC) the account is locked for a set time. The locked message is clear. (Lockout is not yet built in the prototype.)
5. A deactivated user cannot log in.
6. Idle session ends after a set time (TBC). The user is sent back to login with a message.
7. Logout ends the session. Going back in the browser does not show data.
8. First login after a password reset asks for a new password.
9. Password must meet the policy (exact rules TBC). A weak password is rejected with the reason shown.

**Not in the pilot:** SSO and MFA (Q-02).

---

## B. Change password

**Who:** any logged-in user, for their own password.

| Field | Required | Rule |
|-------|:-:|------|
| Current password | Yes | Must match |
| New password | Yes | Meets policy (TBC) |
| Confirm new password | Yes | Must match new password |

**Acceptance**

1. Wrong current password is rejected.
2. Mismatch between new and confirm is rejected.
3. Password used before cannot be reused (count TBC).
4. Success returns the user to home with a confirmation message.

---

## C. Super Admin: reset a user's password

**Who:** Super Admin only.

**Acceptance**

1. Reset generates a temporary password, shown once.
2. The user must change it at next login.
3. The reset is recorded in the audit trail.

---

## D. Users (create, edit, deactivate)

**Who:** Super Admin creates all users. Central team adds Site Investigators only (see section E).
**Source:** `[FSD 2.8]`, `[BRIEF s7]`.

| Field | Required | Rule |
|-------|:-:|------|
| Username | Yes | Unique |
| Role | Yes | One of the three roles |
| Sites | Yes for Site Investigator | One or more active sites. Not needed for Super Admin or Central team |
| Active | Yes | On or off |

**Acceptance**

1. Creating a user with a duplicate username is rejected.
2. A Site Investigator with no site assigned is rejected.
3. Deactivating a user blocks login. The user is not deleted, and their past records stay.
4. Super Admin cannot change its own role or deactivate its own account.
5. At least one active Super Admin must remain. Deactivating the last one is rejected.
6. Every create, edit and deactivate is recorded in the audit trail.

---

## E. Central team: add site investigators

**Who:** Central team.
**Source:** `[BRIEF s7]`, `[03-roles-access.md]`.

**Acceptance**

1. The user list shows Site Investigators only. Super Admin and Central team accounts are not shown.
2. Central team can add a Site Investigator, assign sites, and switch access on or off.
3. Central team cannot create or edit Super Admin or Central team accounts. The attempt is rejected.

---

## F. Roles and permissions

**Who:** Super Admin edits the matrix. Central team and Site Investigator rows can be changed by Super Admin.
**Source:** `[03-roles-access.md]`.

| Permission | Site Investigator (default) | Central team (default) |
|------------|:-:|:-:|
| See patients at every site | No | Yes |
| Add patients | Yes | No |
| Enter and edit visit data | Yes | No |
| Mark visits complete or reopen | Yes | Yes |
| Export CSV | No | Yes |
| Add site investigators and assign sites | No | Yes |
| Manage users | No | No |
| Manage sites | No | No |

**Acceptance**

1. Super Admin's row is fixed and cannot be edited.
2. Changing a permission takes effect on the next request.
3. Each change is recorded in the audit trail.

---

## G. Sites

**Who:** Super Admin.
**Source:** `[FSD 2.8]`, `[05-data-model.md]`.

| Field | Required | Rule |
|-------|:-:|------|
| Site code | Yes | Unique. Used in Study ID (for example RIC, LHR) |
| Site name | Yes | Not empty |
| Active | Yes | On or off |

**Acceptance**

1. Duplicate site code is rejected.
2. Deactivating a site keeps its patients. Super Admin can still read them. Site Investigators assigned only to that site lose access.
3. Sites are deactivated, never deleted.

---

## H. Home screen (per role)

**Who:** all roles. Each sees different sections.
**Source:** `[03-roles-access.md]`, `[07-ui-design.md]`.

| Section | Super Admin | Central team | Site Investigator |
|---------|:-:|:-:|:-:|
| Study statistics | All sites | All sites | Own sites |
| Patient list with Baseline, 3M, 6M status | All | All | Own patients |
| Overdue visits | All | All | Own patients |
| Users | All | Investigators only | Hidden |
| Sites | All | View only | Hidden |
| Permissions | Yes | Hidden | Hidden |
| Export | Yes (TBC) | Yes | Hidden |
| Add patient button | No | No | Yes |

**Acceptance**

1. Each role sees only the sections in its column.
2. Overdue visit = due window has passed and the visit is not complete.
3. Numbers on the home screen match a manual count on test data.

---

## I. Patient registration (add patient)

**Who:** Site Investigator (own site). Central team and Super Admin cannot add patients.
**Source:** `[FSD 2.3]`, `[BRIEF s4]`, `[06]`.

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| Study ID | Auto | Generated from site code plus sequence. Read only | - |
| Site | Yes | Only the user's assigned sites | Hard |
| Patient name | Yes | Not empty | Hard. New from UI change |
| Contact number | Yes | Format TBC (Q-19) | Hard. New from UI change |
| Investigator name | Yes | Not empty | Hard |
| Consent date | Yes | Not empty | Hard |
| Age | Yes | 18 or more (TBC) | Hard |
| Sex | Yes | Male or Female | Hard |
| HF etiology | Yes | Ischemic, Non-ischemic or Other | Hard |
| Etiology other (text) | If "Other" | Not empty | Hard |

**Acceptance**

1. Saving generates a unique Study ID, for example `RIC-0001`. It shows on screen after saving.
2. A missing required field is blocked, and the field name is shown next to it.
3. A Site Investigator cannot pick a site they are not assigned to.
4. Age below 18 is blocked (TBC).
5. The patient appears in the site's list straight away.
6. Editing a saved patient needs a reason. The change is recorded in the audit trail.
7. Patient name and contact number are required. Saving without either is blocked, and the missing field is named.

---

## J. Patient list

**Who:** all roles, scoped by site.
**Source:** `[FSD 2.3]`.

**Acceptance**

1. Site Investigator sees only own-site patients.
2. Central team and Super Admin see all sites.
3. Each row shows Study ID, site, Baseline status, 3M status, 6M status and next due date.
4. Search by Study ID works.

---

## K. Baseline visit

**Who:** Site Investigator. Central team can mark complete or reopen.
**Source:** `[BRIEF s3]`, `[FSD 2.4]`, `[06]`.

Contains: visit details, vitals and function, LVEF, GDMT section (see section N), prescription upload (see section R), and no events. Baseline records prior history only (TBC).

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| Visit date | Yes | Not before consent date | Hard |
| Weight (kg) | Yes | Placeholder range (TBC) | Soft warning outside range |
| Heart rate (bpm) | Yes | Placeholder 30 to 220 | Soft warning outside range |
| Systolic BP (mmHg) | Yes | Placeholder 50 to 260 | Soft warning outside range |
| Diastolic BP (mmHg) | Yes | Must be lower than systolic | Hard |
| NYHA class | Yes | I, II, III or IV | Hard |
| NYHA IV | If IV | Confirm exclusion criteria | Soft warning |
| 1MSTS repetitions in 60 s | Yes | Placeholder 0 to 60 | Soft warning outside range |
| 1MSTS stopped early (reason) | No | Prototype list (TBC) | - |
| 1MSTS repeated | No | Yes or no | - |
| LVEF (%) | Yes | Placeholder 5 to 80 | Hard if missing. Soft if out of range |
| LVEF above 40% | - | Outside registry inclusion (TBC) | Soft warning |
| Echo date | No | Within 30 days before enrollment (TBC) | Soft warning |

**Acceptance**

1. Saving a draft works even with hard errors. The draft shows which fields are missing.
2. "Mark complete" lists all missing or invalid fields. It does not complete the visit while any hard error exists.
3. A soft warning shows as an amber notice. Completion is still allowed.
4. Completing the visit locks it. Site users cannot edit a locked visit.
5. Reopening needs a reason. The reopen and the reason are recorded in the audit trail.
6. Every value changed after saving needs a reason. The old and new values are recorded.

---

## L. 3-month visit

**Who:** Site Investigator. Central team can mark complete or reopen.
**Source:** `[BRIEF s3]`, `[FSD 2.4, 2.6]`, `[06]`.

Contains: visit details, vitals and function (no LVEF), GDMT section, events section, prescription upload (see section R).

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| Visit date | Yes | Must be after Baseline date | Hard |
| Visit window | - | Day 90 ±14 from Baseline (TBC) | Soft warning outside window |
| Weight, heart rate, BP, NYHA, 1MSTS | As Baseline | As Baseline | As Baseline |
| LVEF | Not shown | Not captured at 3M | - |
| Events (see section M) | Yes | Entered at 3M and 6M only | Hard |

**Acceptance**

1. Visit date before Baseline date is blocked.
2. Visit outside the window shows a soft warning.
3. LVEF is not shown and cannot be entered at 3M.
4. Mark complete and lock work as in section K.

---

## M. Clinical events (inside 3-month and 6-month visits)

**Who:** Site Investigator enters. Central team reads.
**Source:** `[BRIEF s5]`, `[FSD 2.6]`, `[06]`.

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| HF hospitalization | Yes (yes or no) | Since previous visit | - |
| Other hospitalization | Yes (yes or no) | Since previous visit | - |
| Death | Yes (yes or no) | Since previous visit | - |
| Major intervention or event | No | Free text | - |

**Acceptance**

1. Events cannot be entered at Baseline. Attempting it returns a hard error.
2. Death recorded at 3M or 6M shows a soft warning: confirm no further visits. The warning does not block saving.
3. Whether death blocks further visits is TBC. Until then, no further visits are blocked.

---

## N. GDMT section (inside every visit)

**Who:** Site Investigator enters. Central team reads.
**Source:** `[BRIEF s6]`, `[FSD 2.5]`, `[06]`.

Four cards, one per pillar: ARNI (sacubitril and valsartan), evidence-based beta-blocker, MRA, SGLT2 inhibitor. The ARNI pillar is first. ACE-I and ARB are not ARNI.

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| Status | Yes | Started, Continued, Stopped or Not started | Hard |
| Generic drug | If Started or Continued | Dropdown only, no free text | Hard |
| Daily dose | If Started or Continued | Not empty | Hard |
| Start date | If Started or Continued | Not empty | Soft warning |
| Reason | If Not started or Stopped | At least one reason from the list | Soft warning |

Reason list: Hypotension, Bradycardia, Renal dysfunction, Hyperkalemia, Intolerance, Cost or access, Patient preference, Physician decision, Other (free text).

Active score = count of pillars with status Started or Continued (0 to 4). Shown on the visit and on the patient record.

**Acceptance**

1. Every pillar must have a status before the visit can be marked complete.
2. Started or Continued without a drug or dose is a hard error.
3. Drug dropdown lists only active drugs for that pillar. ARNI list does not include ACE-I or ARB.
4. Active score updates as statuses change, and reads 0 to 4.
5. Not started or Stopped without a reason gives a soft warning.

---

## O. Visit reopen

**Who:** Central team and Site Investigator (permission per matrix).

**Acceptance**

1. Reopen needs a written reason.
2. Reopen is recorded in the audit trail with the user and time.
3. After reopen, the visit can be edited and completed again.

---

## P. Audit trail view

**Who:** Central team and Super Admin. Site Investigators do not see it.
**Source:** `[BRIEF s9]`, `[FSD 2.1]`.

Each row: who changed it, what field, old value, new value, date and time, reason.

**Acceptance**

1. Changes can be viewed per patient and per user.
2. Each correction has a reason. A correction without a reason cannot be saved.
3. Rows cannot be edited or deleted.
4. Site Investigators get "not allowed" if they open the view.

---

## Q. CSV export

**Who:** Central team (all sites). Site Investigator only own rows (TBC).
**Source:** `[FSD 2.7]`, `[10-export.md]`.

**Acceptance**

1. Output is one row per patient-visit.
2. Columns match `10-export.md`. Column list confirmed with the data manager (EXP-02).
3. Each row shows site, visit status, GDMT pillars, clinical assessments and events.
4. Incomplete visits are excluded (TBC).
5. Each download is recorded in the audit trail.
6. Values are not changed during export.

---

## R. Prescription upload (Baseline, 3M, 6M)

**Who:** Site Investigator uploads at their own site. Central team and Super Admin can view.
**Source:** UI change (new). File limits are defaults until Q-20 is answered.

| Field | Required | Rule | Type |
|-------|:-:|------|------|
| File | No | PDF, JPEG or PNG | Hard |
| File size | - | Default 10 MB per file (TBC) | Hard |
| Number of files | - | No limit set (TBC) | - |

Acceptance

1. The "Upload prescription" button is on the Baseline, 3M and 6M forms.
2. A PDF, JPEG or PNG under the size limit uploads and appears in the visit's file list.
3. Any other file type is rejected with the allowed types shown.
4. A file over the size limit is rejected with the limit shown.
5. Uploading is not allowed on a locked visit. The user is told to reopen it first.
6. Each upload is recorded in the audit trail with the user, time and file name.
7. Upload does not block mark complete.

## S. Patient record (information and files)

**Who:** all roles, scoped by site.
**Source:** UI change (new).

Shows, for each of the three visits: visit information, GDMT score, events, and the uploaded files. Patient name and contact number are shown at the top.

Acceptance

1. All patient details, including patient name and contact number, appear on the record.
2. Each visit lists its files with name, type, size and upload date.
3. A file opens or downloads from the record for users with access to that site.
4. Site Investigators cannot open files from another site. The attempt is refused.
5. Each file view is recorded in the audit trail (TBC, Q-20).

## Open client items that affect these forms

| Item | Affects |
|------|---------|
| Q-01 numeric ranges | All vitals and LVEF rules (K, L) |
| Q-02 login method | A |
| Q-04 edit after sync | I (edit rules) |
| Q-06 and Q-07 multi-site and role scope | D, F, Q |
| Q-08 audit scope | P |
| Q-16 drug list | N |
| Q-17 visit windows | K, L |
| Q-18 LVEF cutoff and minimum age | I, K |
| Q-19 contact number format | I |
| Q-20 file size, types, count, retention, who can delete | R, S |
| Q-21 where files are stored (personal data, hosting) | R, S |
