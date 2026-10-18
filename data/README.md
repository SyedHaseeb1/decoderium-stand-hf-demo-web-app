# STAND-HF E-CRF & Dashboard Developer Data Package

This directory contains verified, protocol-compliant JSON dummy datasets and schema specifications for developers building or testing the **STAND-HF Dashboard** and **Patient Registry Forms** independently from the core web application.

---

## 1. File Inventory

| File | Description | Purpose |
| :--- | :--- | :--- |
| [`dummy_data.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/dummy_data.json) | Complete dataset of **44 patients** across all 4 clinical sites | Primary data file containing patient demographics, longitudinal visits (`b`, `m3`, `m6`), Section B clinical metrics, Section C GDMT pillars, Section D adverse events, audit trail, and prescription attachments. |
| [`access-control.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/access-control.json) | Roles, permissions and sites (with their zones) | System access model (Super Admin, Central Team, Site Investigators) and hospital sites (`RIC`, `LHR`, `KHI`, `ISB`). |
| [`users.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/users.json) | Demo user accounts: name, role and the single site an investigator is assigned to (central team sees all sites) |
| [`gdmt.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/gdmt.json) | GDMT drugs per pillar (name, strengths, default frequency, aliases), GDMT statuses, and the reasons a patient is not on a pillar |
| [`clinical-options.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/clinical-options.json) | Dropdown options outside GDMT: HF etiology, NYHA class and stop reasons |
| [`location-and-title-standards.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/location-and-title-standards.json) | Approved city, zone and clinical title lists, and the spellings they map to |
| [`notifications.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/notifications.json) | Demo notifications per user |
| [`whatsnew.json`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/whatsnew.json) | Release notes & changelog API payload (UI popup dialog now permanently hidden; served via `/api/changelog`) |
| [`generate_data.js`](file:///home/syedhaseeaio/Documents/Stand-HF/srs/data/generate_data.js) | Node.js generation script | Re-generates or expands the synthetic data with reproducible seeds. |

---

## 2. Quickstart: How to Use with Separate Dashboard Projects

### Option A: Direct LocalStorage Seeding (Matches Existing Prototype)
If you are developing or running a browser-based frontend that uses browser storage:
```javascript
// Load and seed the exact storage key used by the portal
fetch('/path/to/dummy_data.json')
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('standhf_ecrf_v1', JSON.stringify(data));
    console.log('Dummy data seeded:', data.pts.length, 'patients');
  });
```

### Option B: Direct Import in Frontend Frameworks (React, Vue, Vite, Next.js)
```typescript
import dataset from './data/dummy_data.json';

// Array of 44 patients
const patients = dataset.pts; 
```

### Option C: Mock REST API Server (e.g. `json-server`)
```bash
# Install json-server
npx -y json-server --watch srs/data/dummy_data.json --port 4000
```
Provides endpoints:
- `GET /pts` -> List all patients
- `GET /pts/:id` -> Single patient details

---

## 3. Patient Entity Schema & Data Contract

Each element in `pts` represents a single patient enrolled in the registry:

```typescript
interface PatientRecord {
  id: string;              // Study ID: '{SITE}-{SEQ}' (e.g. 'RIC-001')
  site: string;            // Site code: 'RIC' | 'LHR' | 'KHI' | 'ISB'
  inv: string;             // Principal/Site Investigator full name
  owner: string;           // Username of owner (e.g. 'emily.carter')
  name: string;            // Patient full name (Required, 2+ letters)
  contact: string;         // Contact number (Required, exactly 11 digits: e.g. '03005550100')
  consent: string;         // Consent date ('YYYY-MM-DD', never in the future)
  age: number;             // Age in years (18 to 150)
  sex: 'Male' | 'Female';  // Patient biological sex
  etio: 'Ischemic' | 'Non-ischemic' | 'Other'; // Heart failure etiology
  etioO: string;           // Specified etiology if etio === 'Other'
  uid: string;             // Client internal UUID
  sync: 'Synced' | 'Pending'; // Offline synchronization state
  created: number;         // Epoch timestamp (ms)
  updated: number;         // Epoch timestamp (ms)
  
  audit: AuditEntry[];     // Granular audit history
  files: {                 // Prescription file attachments
    b: FileAttachment[];
    m3: FileAttachment[];
    m6: FileAttachment[];
  };
  
  v: {                     // Longitudinal study visits
    b: VisitRecord;        // Baseline Visit
    m3: VisitRecord;       // Month 3 Follow-up (Day 90 ± 14)
    m6: VisitRecord;       // Month 6 Follow-up (Day 180 ± 21)
  };
}
```

---

## 4. Visit Record Schema (`v.b`, `v.m3`, `v.m6`)

Each visit represents a scheduled clinical evaluation:

```typescript
interface VisitRecord {
  date?: string;           // Visit date ('YYYY-MM-DD'). Defaults to consent for Baseline.
  done?: boolean;          // true = visit completed & locked; false/undefined = open
  
  // Section B: Clinical & Functional Assessment
  wt?: number;             // Weight (kg, e.g. 74.5)
  hr?: number;             // Resting heart rate (bpm, 30-220)
  sbp?: number;            // Systolic blood pressure (mmHg, must be > dbp)
  dbp?: number;            // Diastolic blood pressure (mmHg)
  nyha?: 'I'|'II'|'III'|'IV'; // NYHA Functional Classification
  lvef?: number;           // LVEF (%): Measured at Baseline and M6 only. N/A at M3!
  msts?: number;           // 1-Minute Sit-to-Stand test repetitions (0-60)
  stop?: string;           // Early termination reason (or empty string if completed)
  
  // Section C: Foundational GDMT (4 Pillars)
  g?: {
    arni?: GdmtPillar;     // Pillar 1: ARNI (Sacubitril Valsartan)
    bb?: GdmtPillar;       // Pillar 2: Beta-blocker (Bisoprolol, Carvedilol, Nebivolol)
    mra?: GdmtPillar;      // Pillar 3: MRA (Spironolactone, Eplerenone, Finerenone)
    sg?: GdmtPillar;       // Pillar 4: SGLT2 inhibitor (Dapagliflozin, Empagliflozin, etc.)
  };
  rs?: GdmtReasons;        // Reason flags if any pillar is 'Not started' or 'Stopped'
  rsO?: string;            // Free-text other clinical reason
  
  // Section D: Clinical Adverse Events
  ev?: {
    hf?: boolean;          // Heart Failure hospitalization
    all?: boolean;         // All-cause (other) hospitalization
    death?: boolean;       // Patient death (evaluated at 3M and 6M)
    int?: string;          // Major intervention / procedure text
  };
  ini?: string;            // Site investigator initials (e.g. 'EC', 'AK')
}

interface GdmtPillar {
  drug: string;            // Generic drug name from lookups
  strength: string;        // Strength (e.g. '50mg', '10mg')
  freq: 'OD' | 'BD' | 'TDS'; // Frequency
  dose: string;            // Computed legacy daily dose string (e.g. '50mg BD')
  status: 'Active' | 'Not started' | 'Stopped';
}

interface GdmtReasons {
  hypo?: boolean;          // Hypotension
  brady?: boolean;         // Bradycardia
  renal?: boolean;         // Renal dysfunction
  k?: boolean;             // Hyperkalemia
  intol?: boolean;         // Drug intolerance / side effects
  cost?: boolean;          // Cost / financial barrier
  pref?: boolean;          // Patient preference
  phys?: boolean;          // Physician clinical judgment
}
```

---

## 5. Dashboard Metric & KPI Calculation Rules

The dashboard computes several critical indicators from this dataset. Implement these formulas in your dashboard components:

### 1. Active GDMT Pillars Count
```javascript
const PL = ['arni', 'bb', 'mra', 'sg'];
function activePillars(visit) {
  if (!visit || !visit.g) return 0;
  return PL.filter(p => visit.g[p]?.status === 'Active').length;
}
```

### 2. Quadruple Therapy Coverage (4/4 Pillars Rate)
Protocol target is **$\ge 70\%$**. Calculated at each patient's **latest completed visit**:
```javascript
function calculateGdmtRate(patientList) {
  const latestPillars = patientList.map(p => {
    const last = ['m6', 'm3', 'b'].find(k => p.v?.[k]?.done);
    return last ? activePillars(p.v[last]) : null;
  }).filter(x => x !== null);
  
  const fourPillarsCount = latestPillars.filter(count => count === 4).length;
  const rate = latestPillars.length ? Math.round((100 * fourPillarsCount) / latestPillars.length) : 0;
  return { fourPillarsCount, total: latestPillars.length, rate };
}
```

### 3. Visit Milestone Status (`vstat`)
Used for follow-up queues and badges:
```javascript
function getVisitStatus(patient, visitKey) {
  const v = patient.v?.[visitKey] || {};
  if (v.done) return 'Completed';
  
  const baselineDate = patient.v?.b?.done ? patient.v.b.date : null;
  if (visitKey === 'b') return hasData(v) ? 'In Progress' : 'Not Started';
  if (!baselineDate) return 'Not Started';
  
  const targetDays = visitKey === 'm3' ? 90 : 180;
  const windowDays = visitKey === 'm3' ? 14 : 21;
  const now = new Date();
  const bDate = new Date(baselineDate + 'T00:00:00');
  
  const targetDate = new Date(bDate.getTime() + targetDays * 864e5);
  const openDate = new Date(bDate.getTime() + (targetDays - windowDays) * 864e5);
  const closeDate = new Date(bDate.getTime() + (targetDays + windowDays) * 864e5);
  const missedDate = new Date(bDate.getTime() + (targetDays + windowDays + 30) * 864e5);
  
  if (now > missedDate && !hasData(v)) return 'Missed';
  if (now > closeDate) return 'Overdue';
  if (hasData(v)) return 'In Progress';
  if (now >= openDate) return 'Due';
  return 'Not Started';
}
```

### 4. Primary Functional Outcomes (Delta Baseline $\rightarrow$ 6M)
- **$\Delta$ 1MSTS**: $\text{msts}_{6M} - \text{msts}_{\text{Baseline}}$ (Repetitions in 60s)
- **$\Delta$ LVEF**: $\text{lvef}_{6M} - \text{lvef}_{\text{Baseline}}$ (Percentage points)

```javascript
const completedCohort = patientList.filter(p => p.v?.b?.done && p.v?.m6?.done);

const deltaMsts = completedCohort
  .filter(p => p.v.b.msts != null && p.v.m6.msts != null)
  .map(p => p.v.m6.msts - p.v.b.msts);
const meanDeltaMsts = deltaMsts.reduce((a, b) => a + b, 0) / deltaMsts.length; // e.g. +10.5 reps

const deltaLvef = completedCohort
  .filter(p => p.v.b.lvef != null && p.v.m6.lvef != null)
  .map(p => p.v.m6.lvef - p.v.b.lvef);
const meanDeltaLvef = deltaLvef.reduce((a, b) => a + b, 0) / deltaLvef.length; // e.g. +9.9 points
```

### 5. Adverse Clinical Event Aggregation
```javascript
const events = {
  hfHospitalizations: patientList.filter(p => ['m3', 'm6'].some(k => p.v?.[k]?.ev?.hf)).length,
  allCauseHospitalizations: patientList.filter(p => ['m3', 'm6'].some(k => p.v?.[k]?.ev?.all)).length,
  deaths: patientList.filter(p => ['m3', 'm6'].some(k => p.v?.[k]?.ev?.death)).length
};
```

---

## 6. Access Control & Role Scoping Rules

- **`superadmin`** (`michael.johnson`): Global administrative oversight. Views all sites and patients; manages users, sites, and permissions; exports research datasets; cannot edit clinical patient data.
- **`central`** (`robert.wilson`): Clinical trial monitor / directorate. Views all sites and patients; exports complete research datasets; read-only administrative inspection.
- **`investigator`** (`emily.carter`): Site investigator assigned to `RIC` (Rawalpindi). **Must only see patients where `site === 'RIC'`**. By default, `export_data` is disabled.
- **`investigator`** (`adnan.khan`): Site investigator assigned to `KHI` (Karachi). **Must only see patients where `site === 'KHI'`**. By default, `export_data` is disabled.

---

## 7. User Account Entity & API Contract (`users.json`)

User accounts support dual sign-in via either **Official Email** (required) or **Username** (optional):

```typescript
interface UserAccount {
  email: string;              // Official Email (Required, unique identifier)
  username?: string;          // System handle (Optional; auto-derived from email prefix if blank)
  name: string;               // Full name of investigator or administrator (Required)
  role: 'superadmin' | 'central' | 'investigator'; // System authorization role
  sites: string[];            // Assigned site codes (e.g. ['RIC']; central carries all sites)
  active: boolean;            // Account active status
  mustChangePassword: boolean;// True for initial temporary password setup flow
  password?: string;          // Stored password or initial temporary credential
  passwordCreatedAt?: string; // ISO timestamp
  personal?: {
    designation?: string;     // Standardized clinical title
    phone?: string;           // 11-digit mobile contact number
    email?: string;           // Synchronized official email address
  };
}
```

Authentication accepts either the user's `email` or `username` along with their password.
