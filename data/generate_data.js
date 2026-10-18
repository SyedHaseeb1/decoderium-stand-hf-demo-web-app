/**
 * STAND-HF Electronic CRF Registry Portal
 * Dummy Data Generator Script
 * 
 * Generates protocol-compliant, high-fidelity JSON dummy data for:
 * - srs/data/dummy_data.json
 * (access.json and lookups.json are maintained by hand; the app reads them directly)
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);

// Reference current date (anchored to current simulation timestamp: Oct 13, 2026)
const NOW = new Date('2026-10-13T12:00:00Z');
const DAY_MS = 86400000;

function daysAgo(n) {
  const d = new Date(NOW.getTime() - n * DAY_MS);
  return d.toISOString().slice(0, 10);
}

function formatDateGB(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTimeGB(d) {
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Access Store
const ACCESS_DATA = {
  zones: ['North', 'Central', 'South'],
  sites: [
    { code: 'RIC', name: 'Riverside Cardiac Centre', zone: 'North', city: 'Rawalpindi' },
    { code: 'LHR', name: 'Lakeview Heart Clinic', zone: 'Central', city: 'Lahore' },
    { code: 'KHI', name: 'Harbor Heart Institute', zone: 'South', city: 'Karachi' },
    { code: 'ISB', name: 'Highland Cardiology', zone: 'North', city: 'Islamabad' }
  ],
  users: [
    { username: 'michael.johnson', name: 'Michael Johnson', role: 'superadmin', sites: [], zones: [], active: true },
    { username: 'emily.carter', name: 'Emily Carter', role: 'investigator', sites: ['RIC', 'LHR'], zones: ['North', 'Central'], active: true },
    { username: 'robert.wilson', name: 'Robert Wilson', role: 'central', sites: [], zones: ['North', 'Central', 'South'], active: true },
    { username: 'adnan.khan', name: 'Adnan Khan', role: 'investigator', sites: ['KHI', 'ISB'], zones: ['South', 'North'], active: true }
  ],
  perms: {
    superadmin: {
      view_all_sites: true,
      export_data: true,
      assign_investigators: true,
      manage_users: true,
      manage_sites: true
    },
    investigator: {
      add_patient: true,
      enter_data: true,
      mark_complete: true,
      load_demo: true,
      clear_all: true
    },
    central: {
      view_all_sites: true,
      export_data: true
    }
  }
};

// Lookups
const LOOKUPS_DATA = {
  drugs: {
    arni: [
      { name: 'Sacubitril Valsartan', strengths: ['25mg', '50mg', '100mg', '200mg'], defaultFreq: 'BD' }
    ],
    bb: [
      { name: 'Bisoprolol fumarate', strengths: ['2.5mg', '5mg', '10mg'], defaultFreq: 'OD' },
      { name: 'Carvedilol', strengths: ['3.125mg', '6.25mg', '12.5mg', '25mg'], defaultFreq: 'BD' },
      { name: 'Nebivolol', strengths: ['1.5mg', '2.5mg', '5mg', '10mg'], defaultFreq: 'OD' }
    ],
    mra: [
      { name: 'Spironolactone', strengths: ['12.5mg', '25mg', '50mg'], defaultFreq: 'OD' },
      { name: 'Eplerenone', strengths: ['25mg', '50mg'], defaultFreq: 'OD' },
      { name: 'Finerenone', strengths: ['10mg', '20mg', '40mg'], defaultFreq: 'OD' }
    ],
    sg: [
      { name: 'Dapagliflozin', strengths: ['10mg'], defaultFreq: 'OD' },
      { name: 'Empagliflozin', strengths: ['10mg'], defaultFreq: 'OD' },
      { name: 'Sotagliflozin', strengths: ['200mg', '400mg'], defaultFreq: 'OD' }
    ]
  },
  frequencies: ['OD', 'BD', 'TDS'],
  statuses: ['Active', 'Not started', 'Stopped'],
  sex: ['Male', 'Female'],
  etiologies: ['Ischemic', 'Non-ischemic', 'Other'],
  nyhaClasses: ['I', 'II', 'III', 'IV'],
  stopReasons: [
    'Chest pain',
    'Presyncope / syncope',
    'Intolerable dyspnea',
    'Severe dizziness',
    'Loss of balance',
    'Marked pallor / diaphoresis',
    'Participant request',
    'Investigator safety concern'
  ],
  gdmtReasons: {
    hypo: 'Hypotension',
    brady: 'Bradycardia',
    renal: 'Renal dysfunction',
    k: 'Hyperkalemia',
    intol: 'Intolerance',
    cost: 'Cost / access',
    pref: 'Patient preference',
    phys: 'Physician decision'
  }
};

// Patient Names Pool (Realistic Pakistani cardiology patient names)
const PATIENT_NAMES = [
  'Ali Raza', 'Sana Iqbal', 'Usman Tariq', 'Ayesha Noor',
  'Bilal Ahmed', 'Hina Yousaf', 'Farhan Akhtar', 'Zainab Shah',
  'Imran Hussain', 'Mariam Javed', 'Omar Farooq', 'Nadia Qureshi',
  'Asad Mehmood', 'Sadia Rashid', 'Hamza Siddiqui', 'Kiran Abbas',
  'Tariq Nawaz', 'Rabia Saleem', 'Waqar Younas', 'Fatima Zaidi',
  'Danish Malik', 'Saima Bashir', 'Adnan Latif', 'Uzma Rehman',
  'Kashif Iqbal', 'Maryam Ghani', 'Shahid Afridi', 'Noreen Akram',
  'Faisal Mahmood', 'Lubna Pervaiz', 'Naveed Anwar', 'Huma Shafiq',
  'Junaid Sheikh', 'Amna Hayat', 'Saad Karim', 'Rukhsana Bibi',
  'Yasir Ali', 'Tahira Parveen', 'Zubair Ahmad', 'Khadija Nasir',
  'Irfan Ullah', 'Sobia Riaz', 'Mudassar Rana', 'Rizwan Haider'
];

// Site & Investigator assignments
const SITE_CONFIG = {
  RIC: { investigator: 'Emily Carter', username: 'emily.carter', initials: 'EC' },
  LHR: { investigator: 'Sana Iqbal', username: 'sana.iqbal', initials: 'SI' },
  KHI: { investigator: 'Adnan Khan', username: 'adnan.khan', initials: 'AK' },
  ISB: { investigator: 'Usman Tariq', username: 'usman.tariq', initials: 'UT' }
};

const SITES = ['RIC', 'LHR', 'KHI', 'ISB'];

// Helper to generate a patient
function generatePatient(index) {
  const site = SITES[index % 4];
  const siteIndex = Math.floor(index / 4) + 1;
  const id = `${site}-${String(siteIndex).padStart(3, '0')}`;
  const invConfig = SITE_CONFIG[site];
  const name = PATIENT_NAMES[index % PATIENT_NAMES.length];
  const contact = `0300555${String(100 + index).padStart(4, '0')}`;
  const age = 38 + ((index * 7) % 45); // Ages 38 to 82
  const sex = index % 3 === 0 ? 'Female' : 'Male';
  const etio = index % 5 === 4 ? 'Other' : index % 2 === 0 ? 'Ischemic' : 'Non-ischemic';
  const etioO = etio === 'Other' ? (index % 2 === 0 ? 'Valvular Heart Disease' : 'Dilated Cardiomyopathy') : '';
  const uid = `uid_${site.toLowerCase()}_${siteIndex}_${Math.random().toString(36).slice(2, 8)}`;
  const sync = index === 42 || index === 43 ? 'Pending' : 'Synced';

  // Longitudinal Cohort Definition
  // Cohort 1 (index 0-15, 16 pts): Fully Completed all 3 visits (b, m3, m6)
  // Cohort 2 (index 16-27, 12 pts): Baseline & M3 completed, M6 due / in progress / overdue / not started
  // Cohort 3 (index 28-37, 10 pts): Baseline completed, M3 due / in progress / overdue / not started
  // Cohort 4 (index 38-43, 6 pts): Recently enrolled, Baseline complete or in progress, 2 enrolled < 7 days ago
  let enrollmentDaysAgo;
  let bDone = true;
  let m3Done = false;
  let m6Done = false;
  let m3Partial = false;
  let m6Partial = false;

  if (index < 16) {
    // Cohort 1: Enrolled 185 to 220 days ago (All 3 complete)
    enrollmentDaysAgo = 190 + (index % 30);
    bDone = true;
    m3Done = true;
    m6Done = true;
  } else if (index < 28) {
    // Cohort 2: Enrolled 105 to 240 days ago (Baseline & M3 complete, M6 variable)
    if (index === 18) {
      enrollmentDaysAgo = 215; // > 180 + 21 = 201 days ago -> Overdue M6
      m6Partial = true;
    } else if (index === 19) {
      enrollmentDaysAgo = 245; // > 180 + 21 + 30 = 231 days ago, no data -> Missed M6
    } else {
      enrollmentDaysAgo = 110 + ((index - 16) * 6);
      if (index === 16 || index === 17) m6Partial = true; // In progress M6
    }
    bDone = true;
    m3Done = true;
  } else if (index < 38) {
    // Cohort 3: Enrolled 35 to 130 days ago (Baseline complete, M3 variable)
    if (index === 31) {
      enrollmentDaysAgo = 125; // > 90 + 14 = 104 days ago -> Overdue M3
      m3Partial = true;
    } else {
      enrollmentDaysAgo = 40 + ((index - 28) * 6);
      if (index === 28 || index === 29) m3Partial = true; // In progress M3
    }
    bDone = true;
  } else {
    // Cohort 4: Enrolled 3 to 25 days ago
    if (index >= 41) {
      enrollmentDaysAgo = 2 + (index - 41) * 2; // 2, 4, 6 days ago (New in last 7 days!)
    } else {
      enrollmentDaysAgo = 12 + (index - 38) * 4;
    }
    bDone = true;
  }

  const consentDate = daysAgo(enrollmentDaysAgo);
  const createdTimestamp = new Date(consentDate + 'T09:00:00Z').getTime();
  let updatedTimestamp = createdTimestamp;

  const audit = [];
  const logAudit = (f, o, n, daysAfterConsent, hour) => {
    const actDate = new Date(createdTimestamp + daysAfterConsent * DAY_MS);
    actDate.setHours(hour, 15, 0, 0);
    updatedTimestamp = Math.max(updatedTimestamp, actDate.getTime());
    audit.push({
      by: invConfig.investigator,
      at: actDate.getTime(),
      t: formatDateTimeGB(actDate),
      f,
      o,
      n
    });
  };

  logAudit('patient', '', 'created', 0, 9);
  logAudit('name', '', name, 0, 9);
  logAudit('contact', '', contact, 0, 9);
  logAudit('consent', '', consentDate, 0, 9);

  // Baseline Visit Data
  const bDate = consentDate;
  const bWt = 65 + (index % 25);
  const bHr = 76 + (index % 16);
  const bSbp = 112 + (index % 24);
  const bDbp = 70 + (index % 14);
  const bNyha = index % 4 === 0 ? 'II' : index % 3 === 0 ? 'IV' : 'III';
  const bLvef = 22 + (index % 15); // 22% - 36%
  const bMsts = 8 + (index % 10);  // 8 - 17 reps
  const bStop = bNyha === 'IV' ? 'Intolerable dyspnea' : '';

  // Baseline GDMT
  // Most have 3 or 4 pillars active at baseline
  const bArniActive = index % 5 !== 3;
  const bBbActive = true;
  const bMraActive = index % 6 !== 2;
  const bSgActive = index % 4 !== 1;

  const bArniDrug = 'Sacubitril Valsartan';
  const bArniStr = index % 2 === 0 ? '50mg' : '25mg';
  const bBbDrug = index % 3 === 0 ? 'Bisoprolol fumarate' : index % 3 === 1 ? 'Carvedilol' : 'Nebivolol';
  const bBbStr = bBbDrug === 'Bisoprolol fumarate' ? '2.5mg' : bBbDrug === 'Carvedilol' ? '6.25mg' : '2.5mg';
  const bBbFreq = bBbDrug === 'Carvedilol' ? 'BD' : 'OD';
  const bMraDrug = index % 2 === 0 ? 'Spironolactone' : 'Eplerenone';
  const bMraStr = '25mg';
  const bSgDrug = index % 2 === 0 ? 'Dapagliflozin' : 'Empagliflozin';
  const bSgStr = '10mg';

  const bReasons = {};
  let bRsO = '';
  if (!bArniActive) {
    bReasons.hypo = true;
    bRsO = 'Borderline blood pressure (SBP < 100 mmHg), titrating after stability';
  }
  if (!bMraActive) {
    bReasons.k = true;
    bRsO = 'Baseline potassium 5.2 mEq/L';
  }
  if (!bSgActive) {
    bReasons.cost = true;
  }

  const bVisit = {
    date: bDate,
    done: bDone,
    wt: bWt,
    hr: bHr,
    sbp: bSbp,
    dbp: bDbp,
    nyha: bNyha,
    lvef: bLvef,
    msts: bMsts,
    stop: bStop,
    g: {
      arni: {
        drug: bArniDrug,
        strength: bArniStr,
        freq: 'BD',
        dose: `${bArniStr} BD`,
        status: bArniActive ? 'Active' : 'Not started'
      },
      bb: {
        drug: bBbDrug,
        strength: bBbStr,
        freq: bBbFreq,
        dose: `${bBbStr} ${bBbFreq}`,
        status: bBbActive ? 'Active' : 'Not started'
      },
      mra: {
        drug: bMraDrug,
        strength: bMraStr,
        freq: 'OD',
        dose: `${bMraStr} OD`,
        status: bMraActive ? 'Active' : 'Not started'
      },
      sg: {
        drug: bSgDrug,
        strength: bSgStr,
        freq: 'OD',
        dose: `${bSgStr} OD`,
        status: bSgActive ? 'Active' : 'Not started'
      }
    },
    rs: bReasons,
    rsO: bRsO,
    ev: {
      hf: index % 7 === 1,
      all: index % 9 === 2,
      int: index % 8 === 0 ? 'Coronary Angiography' : ''
    },
    ini: invConfig.initials
  };

  logAudit('b.visit', 'open', 'completed', 0, 11);
  logAudit('b.file', '', `prescription-${id}-b.png`, 0, 11);

  // Month 3 Visit Data
  let m3Visit = {};
  if (m3Done || m3Partial) {
    const m3DaysAfter = 88 + (index % 5); // 88-92 days (within 90 ± 14 days window)
    const m3Date = daysAgo(enrollmentDaysAgo - m3DaysAfter);
    const m3Wt = bWt - 1.5;
    const m3Hr = Math.max(60, bHr - 4);
    const m3Sbp = bSbp - 2;
    const m3Dbp = bDbp - 1;
    const m3Nyha = bNyha === 'IV' ? 'III' : bNyha === 'III' ? 'II' : 'I';
    const m3Msts = bMsts + 4 + (index % 3);

    // M3 GDMT titration (more quadruple therapy)
    const m3ArniActive = true;
    const m3BbActive = true;
    const m3MraActive = index % 8 !== 3;
    const m3SgActive = true;

    const m3Reasons = {};
    let m3RsO = '';
    if (!m3MraActive) {
      m3Reasons.renal = true;
      m3RsO = 'eGFR transient decrease, monitoring in 4 weeks';
    }

    m3Visit = {
      date: m3Date,
      done: m3Done,
      wt: m3Wt,
      hr: m3Hr,
      sbp: m3Sbp,
      dbp: m3Dbp,
      nyha: m3Nyha,
      msts: m3Msts,
      stop: '',
      g: {
        arni: {
          drug: 'Sacubitril Valsartan',
          strength: '50mg',
          freq: 'BD',
          dose: '50mg BD',
          status: m3ArniActive ? 'Active' : 'Stopped'
        },
        bb: {
          drug: bBbDrug,
          strength: bBbDrug === 'Bisoprolol fumarate' ? '5mg' : bBbStr,
          freq: bBbFreq,
          dose: `${bBbDrug === 'Bisoprolol fumarate' ? '5mg' : bBbStr} ${bBbFreq}`,
          status: m3BbActive ? 'Active' : 'Stopped'
        },
        mra: {
          drug: bMraDrug,
          strength: '25mg',
          freq: 'OD',
          dose: '25mg OD',
          status: m3MraActive ? 'Active' : 'Stopped'
        },
        sg: {
          drug: bSgDrug,
          strength: '10mg',
          freq: 'OD',
          dose: '10mg OD',
          status: m3SgActive ? 'Active' : 'Stopped'
        }
      },
      rs: m3Reasons,
      rsO: m3RsO,
      ev: {
        hf: index === 3 || index === 14,
        all: index === 8,
        death: false,
        int: index === 3 ? 'IV Furosemide in Emergency' : ''
      },
      ini: invConfig.initials
    };

    if (m3Done) {
      logAudit('m3.visit', 'open', 'completed', m3DaysAfter, 14);
      logAudit('m3.file', '', `prescription-${id}-m3.png`, m3DaysAfter, 14);
    } else {
      logAudit('m3.wt', '', String(m3Wt), m3DaysAfter, 10);
    }
  }

  // Month 6 Visit Data
  let m6Visit = {};
  if (m6Done || m6Partial) {
    const m6DaysAfter = 178 + (index % 6); // 178-183 days (within 180 ± 21 days window)
    const m6Date = daysAgo(enrollmentDaysAgo - m6DaysAfter);
    const m6Wt = bWt - 2.5;
    const m6Hr = Math.max(58, bHr - 8);
    const m6Sbp = bSbp - 4;
    const m6Dbp = bDbp - 2;
    const m6Nyha = 'I';
    const m6Lvef = Math.min(50, bLvef + 8 + (index % 5)); // Significant LVEF improvement (+8 to +12)
    const m6Msts = bMsts + 9 + (index % 4);              // Significant 1MSTS improvement (+9 to +12 reps)

    // M6 GDMT (High quadruple rate: ~85% of cohort 1)
    const m6ArniActive = true;
    const m6BbActive = true;
    const m6MraActive = index !== 7;
    const m6SgActive = true;

    const m6Reasons = {};
    let m6RsO = '';
    if (!m6MraActive) {
      m6Reasons.hyper = true;
      m6RsO = 'Persistent serum potassium > 5.5 mEq/L, discontinued MRA';
    }

    m6Visit = {
      date: m6Date,
      done: m6Done,
      wt: m6Wt,
      hr: m6Hr,
      sbp: m6Sbp,
      dbp: m6Dbp,
      nyha: m6Nyha,
      lvef: m6Lvef,
      msts: m6Msts,
      stop: '',
      g: {
        arni: {
          drug: 'Sacubitril Valsartan',
          strength: index % 2 === 0 ? '100mg' : '50mg',
          freq: 'BD',
          dose: `${index % 2 === 0 ? '100mg' : '50mg'} BD`,
          status: m6ArniActive ? 'Active' : 'Stopped'
        },
        bb: {
          drug: bBbDrug,
          strength: bBbDrug === 'Bisoprolol fumarate' ? '10mg' : '12.5mg',
          freq: bBbFreq,
          dose: `${bBbDrug === 'Bisoprolol fumarate' ? '10mg' : '12.5mg'} ${bBbFreq}`,
          status: m6BbActive ? 'Active' : 'Stopped'
        },
        mra: {
          drug: bMraDrug,
          strength: '25mg',
          freq: 'OD',
          dose: '25mg OD',
          status: m6MraActive ? 'Active' : 'Stopped'
        },
        sg: {
          drug: bSgDrug,
          strength: '10mg',
          freq: 'OD',
          dose: '10mg OD',
          status: m6SgActive ? 'Active' : 'Stopped'
        }
      },
      rs: m6Reasons,
      rsO: m6RsO,
      ev: {
        hf: index === 5,
        all: false,
        death: index === 15, // Patient 15 experienced cardiac death at M6
        int: index === 5 ? 'Heart Failure Hospitalization (3 days)' : index === 15 ? 'In-hospital resuscitation attempted' : ''
      },
      ini: invConfig.initials
    };

    if (m6Done) {
      logAudit('m6.visit', 'open', 'completed', m6DaysAfter, 16);
      logAudit('m6.file', '', `prescription-${id}-m6.png`, m6DaysAfter, 16);
    } else {
      logAudit('m6.wt', '', String(m6Wt), m6DaysAfter, 11);
    }
  }

  // Files metadata
  const files = {
    b: [
      {
        id: `f_${id.toLowerCase()}_b`,
        name: `prescription-${id}-b.png`,
        type: 'image/png',
        size: 38400 + ((index * 321) % 15000),
        at: formatDateTimeGB(new Date(createdTimestamp + 3600000))
      }
    ],
    m3: (m3Done || m3Partial) ? [
      {
        id: `f_${id.toLowerCase()}_m3`,
        name: `prescription-${id}-m3.png`,
        type: 'image/png',
        size: 41200 + ((index * 451) % 16000),
        at: formatDateTimeGB(new Date(createdTimestamp + 90 * DAY_MS))
      }
    ] : [],
    m6: (m6Done || m6Partial) ? [
      {
        id: `f_${id.toLowerCase()}_m6`,
        name: `prescription-${id}-m6.png`,
        type: 'image/png',
        size: 44500 + ((index * 211) % 18000),
        at: formatDateTimeGB(new Date(createdTimestamp + 180 * DAY_MS))
      }
    ] : []
  };

  return {
    created: createdTimestamp,
    updated: updatedTimestamp,
    owner: invConfig.username,
    id,
    site,
    inv: invConfig.investigator,
    consent: consentDate,
    age,
    sex,
    etio,
    etioO,
    uid,
    name,
    contact,
    sync,
    audit,
    files,
    v: {
      b: bVisit,
      m3: m3Visit,
      m6: m6Visit
    }
  };
}

// Generate all 44 patients
const patients = [];
for (let i = 0; i < 44; i++) {
  patients.push(generatePatient(i));
}

// Full DB representation (exactly matching localStorage standhf_ecrf_v1)
const DB_OBJECT = {
  pts: patients,
  off: false
};

// Write files
fs.writeFileSync(path.join(DATA_DIR, 'dummy_data.json'), JSON.stringify(DB_OBJECT, null, 2));

console.log('Successfully generated:');
console.log('- srs/data/dummy_data.json (' + patients.length + ' patients)');
