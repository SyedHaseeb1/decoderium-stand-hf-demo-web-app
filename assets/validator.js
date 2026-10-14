/* ==========================================================================
   STAND-HF Canonical Central Validator & Field Engine (assets/validator.js)
   Single Source of Truth (SSOT) for all field limits, sanitizers, typing filters,
   and clinical validation rules across the STAND-HF E-CRF Portal.
   ========================================================================== */

(function(global){
  'use strict';

  // Core regular expressions
  const NAME_RE = /^\p{L}[\p{L}\s.'-]*$/u;
  const DRUG_RE = /^[\p{L}\d][\p{L}\d\s()\/.,+-]*$/u;
  const SITE_RE = /^[A-Z0-9]{2,5}$/;
  const USERNAME_RE = /^[a-z0-9._]+$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const INI_RE = /^[A-Z]{1,5}$/;

  function todayStart(){
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseDate(s){
    if(!s) return null;
    return new Date(s + 'T00:00:00');
  }

  /* ------------------------------------------------------------------------
     1. FIELD SCHEMAS & HARD LIMITS (Never leave fields open for infinite length)
     ------------------------------------------------------------------------ */
  const SCHEMAS = {
    // Person Names (Patient, Doctor, User, Investigator)
    person_name: {
      type: 'text',
      maxLength: 100,
      minLength: 2,
      inputmode: 'text',
      placeholder: 'Full legal name',
      filterRe: /[^\p{L}\s.'-]/gu,
      clean: s => String(s || '').replace(/[^\p{L}\s.'-]/gu, '').replace(/\s+/g, ' ').slice(0, 100),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter full name' : '' };
        if(raw.length < 2) return { ok: false, lvl: 'e', msg: 'Enter at least 2 characters' };
        if(raw.length > 100) return { ok: false, lvl: 'e', msg: 'Name cannot exceed 100 characters' };
        if(!NAME_RE.test(raw)) return { ok: false, lvl: 'e', msg: "Letters, spaces, . ' - only" };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Contact / Phone Number (Uniform 10-11 Pakistani digits)
    phone: {
      type: 'tel',
      maxLength: 11,
      minLength: 10,
      inputmode: 'numeric',
      placeholder: 'e.g. 03001234567',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 11),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter contact number' : '' };
        const digits = raw.replace(/\D/g, '');
        if(digits.length > 11) return { ok: false, lvl: 'e', msg: 'Contact number cannot exceed 11 digits' };
        if(digits.length < 10) return { ok: false, lvl: 'e', msg: 'Contact number is too short (10–11 digits required)' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Email Address
    email: {
      type: 'email',
      maxLength: 100,
      minLength: 5,
      inputmode: 'email',
      placeholder: 'e.g. user@hospital.pk',
      filterRe: /[^\w.@+-]/g,
      clean: s => String(s || '').trim().slice(0, 100),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter email address' : '' };
        if(raw.length > 100) return { ok: false, lvl: 'e', msg: 'Email cannot exceed 100 characters' };
        if(!EMAIL_RE.test(raw)) return { ok: false, lvl: 'e', msg: 'Enter a valid email address' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // System Username / Handle
    username: {
      type: 'text',
      maxLength: 30,
      minLength: 3,
      inputmode: 'text',
      placeholder: 'e.g. tariq.nawaz',
      filterRe: /[^a-z0-9._]/g,
      clean: s => String(s || '').toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 30),
      validate: (val, req) => {
        const raw = String(val || '').trim().toLowerCase();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter username' : '' };
        if(raw.length < 3) return { ok: false, lvl: 'e', msg: 'At least 3 characters required' };
        if(raw.length > 30) return { ok: false, lvl: 'e', msg: 'Username cannot exceed 30 characters' };
        if(!USERNAME_RE.test(raw)) return { ok: false, lvl: 'e', msg: 'Lowercase letters, numbers, dot or underscore only' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Password
    password: {
      type: 'password',
      maxLength: 100,
      minLength: 1,
      inputmode: 'text',
      clean: s => String(s || '').slice(0, 100),
      validate: (val, req) => {
        const raw = String(val || '');
        if(!raw && req) return { ok: false, lvl: 'e', msg: 'Password is required' };
        if(raw.length > 100) return { ok: false, lvl: 'e', msg: 'Password cannot exceed 100 characters' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Medical Centre Code (2 to 5 alphanumeric)
    site_code: {
      type: 'text',
      maxLength: 5,
      minLength: 2,
      inputmode: 'text',
      placeholder: 'e.g. RIC',
      filterRe: /[^A-Za-z0-9]/g,
      clean: s => String(s || '').toUpperCase().replace(/[^A-Za-z0-9]/g, '').slice(0, 5),
      validate: (val, req) => {
        const raw = String(val || '').trim().toUpperCase();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter centre code' : '' };
        if(raw.length < 2 || raw.length > 5 || !SITE_RE.test(raw)) {
          return { ok: false, lvl: 'e', msg: 'Use 2 to 5 letters or numbers (e.g. RIC)' };
        }
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Hospital / Medical Centre Name
    site_name: {
      type: 'text',
      maxLength: 150,
      minLength: 3,
      inputmode: 'text',
      placeholder: 'e.g. Rawalpindi Institute of Cardiology',
      filterRe: /[^\p{L}\d\s().,'&/+-]/gu,
      clean: s => String(s || '').replace(/[^\p{L}\d\s().,'&/+-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 150),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter hospital centre name' : '' };
        if(raw.length < 3) return { ok: false, lvl: 'e', msg: 'Enter at least 3 characters' };
        if(raw.length > 150) return { ok: false, lvl: 'e', msg: 'Hospital name cannot exceed 150 characters' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Geographic Zone
    zone: {
      type: 'text',
      maxLength: 100,
      minLength: 2,
      clean: s => String(s || '').replace(/[^\p{L}\d\s().,'&/+-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 100),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Select geographic zone' : '' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Clinical Designation / Title
    designation: {
      type: 'text',
      maxLength: 100,
      clean: s => String(s || '').replace(/[^\p{L}\d\s().,'&/+-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 100),
      validate: (val) => {
        const raw = String(val || '').trim();
        if(raw.length > 100) return { ok: false, lvl: 'e', msg: 'Designation cannot exceed 100 characters' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Patient Age (Years: 18 - 150)
    age: {
      type: 'number',
      maxLength: 3,
      inputmode: 'numeric',
      placeholder: '18 - 150',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 3),
      validate: (val, req) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter patient age' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole years only' };
        if(n < 18) return { ok: false, lvl: 'e', msg: 'Must be 18 or older' };
        if(n > 150) return { ok: false, lvl: 'e', msg: 'Please check age (maximum 150)' };
        if(n > 110) return { ok: true, lvl: 'w', msg: 'Please verify patient age' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Consent Date (Cannot be future, year >= 1990)
    consent_date: {
      type: 'date',
      maxLength: 10,
      clean: s => String(s || '').trim().slice(0, 10),
      validate: (val, req, ctx) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter consent date' : '' };
        const d = parseDate(raw);
        if(!d || isNaN(d.getTime())) return { ok: false, lvl: 'e', msg: 'Enter a valid date' };
        if(d > todayStart()) return { ok: false, lvl: 'e', msg: 'Consent date cannot be in the future' };
        if(d.getFullYear() < 1990) return { ok: false, lvl: 'e', msg: 'Check the year (must be >= 1990)' };
        if(ctx && ctx.baselineDate && d > parseDate(ctx.baselineDate)) {
          return { ok: false, lvl: 'e', msg: 'Consent date cannot be after baseline visit date' };
        }
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Patient Weight (kg: 10 - 350, up to 1 decimal, expected 30 - 250)
    wt: {
      type: 'number',
      maxLength: 5,
      inputmode: 'decimal',
      placeholder: '30 - 250',
      clean: s => String(s || '').replace(/[^\d.]/g, '').slice(0, 5),
      validate: (val, req) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter weight' : '' };
        if(!/^\d{1,3}(\.\d)?$/.test(raw)) return { ok: false, lvl: 'e', msg: 'Up to 3 digits and 1 decimal place' };
        const n = Number(raw);
        if(n < 10 || n > 350) return { ok: false, lvl: 'e', msg: 'Weight out of clinical range (10 - 350 kg)' };
        if(n < 30 || n > 250) return { ok: true, lvl: 'w', msg: 'Expected 30 to 250 kg' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Heart Rate (bpm: 20 - 250, integer, expected 30 - 220)
    hr: {
      type: 'number',
      maxLength: 3,
      inputmode: 'numeric',
      placeholder: '30 - 220',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 3),
      validate: (val, req) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter heart rate' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole numbers only' };
        if(n < 20 || n > 250) return { ok: false, lvl: 'e', msg: 'Heart rate out of physiological range (20 - 250 bpm)' };
        if(n < 30 || n > 220) return { ok: true, lvl: 'w', msg: 'Expected 30 to 220 bpm' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Systolic Blood Pressure (mmHg)
    sbp: {
      type: 'number',
      maxLength: 3,
      inputmode: 'numeric',
      placeholder: '50 - 260',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 3),
      validate: (val, req, ctx) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter systolic BP' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole numbers only' };
        if(ctx && ctx.dbp != null && ctx.dbp !== '' && n <= Number(ctx.dbp)) {
          return { ok: false, lvl: 'e', msg: 'Systolic BP must be higher than diastolic BP' };
        }
        if(n < 40 || n > 300) return { ok: false, lvl: 'e', msg: 'Systolic BP out of physiological range' };
        if(n < 50 || n > 260) return { ok: true, lvl: 'w', msg: 'Unusual value, please check (expected 50 - 260)' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Diastolic Blood Pressure (mmHg)
    dbp: {
      type: 'number',
      maxLength: 3,
      inputmode: 'numeric',
      placeholder: '20 - 160',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 3),
      validate: (val, req, ctx) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter diastolic BP' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole numbers only' };
        if(ctx && ctx.sbp != null && ctx.sbp !== '' && n >= Number(ctx.sbp)) {
          return { ok: false, lvl: 'e', msg: 'Diastolic BP must be lower than systolic BP' };
        }
        if(n < 20 || n > 200) return { ok: false, lvl: 'e', msg: 'Diastolic BP out of physiological range' };
        if(n < 20 || n > 160) return { ok: true, lvl: 'w', msg: 'Unusual value, please check (expected 20 - 160)' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // LVEF (%: 5 - 80, Baseline <= 40)
    lvef: {
      type: 'number',
      maxLength: 2,
      inputmode: 'numeric',
      placeholder: '5 - 80',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 2),
      validate: (val, req, ctx) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter LVEF (%)' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole numbers only' };
        if(n < 1 || n > 90) return { ok: false, lvl: 'e', msg: 'LVEF out of clinical range (1 - 90%)' };
        if(ctx && ctx.visitKey === 'b' && n > 40) {
          return { ok: true, lvl: 'w', msg: 'Above 40%: outside inclusion (40% or less)' };
        }
        if(n < 5 || n > 80) return { ok: true, lvl: 'w', msg: 'Expected 5 to 80%' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // 1-Minute Sit-to-Stand (Repetitions: 0 - 60)
    msts: {
      type: 'number',
      maxLength: 3,
      inputmode: 'numeric',
      placeholder: '0 - 60',
      filterRe: /\D/g,
      clean: s => String(s || '').replace(/\D/g, '').slice(0, 3),
      validate: (val, req) => {
        const raw = String(val ?? '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Enter 1MSTS repetitions' : '' };
        const n = Number(raw);
        if(!Number.isInteger(n)) return { ok: false, lvl: 'e', msg: 'Whole numbers only' };
        if(n < 0 || n > 100) return { ok: false, lvl: 'e', msg: 'Out of range (0 - 100)' };
        if(n > 60) return { ok: true, lvl: 'w', msg: 'Expected 0 to 60 repetitions' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // GDMT Drug
    drug: {
      type: 'text',
      maxLength: 80,
      minLength: 2,
      inputmode: 'text',
      filterRe: /[^\p{L}\d\s()\/.,+-]/gu,
      clean: s => String(s || '').replace(/[^\p{L}\d\s()\/.,+-]/gu, '').slice(0, 80),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Select generic drug' : '' };
        if(raw.length < 2) return { ok: false, lvl: 'e', msg: 'Enter at least 2 characters' };
        if(!DRUG_RE.test(raw)) return { ok: false, lvl: 'e', msg: 'Letters, numbers and ( ) / - only' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // GDMT Strength
    strength: {
      type: 'text',
      maxLength: 30,
      clean: s => String(s || '').trim().slice(0, 30),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Select strength' : '' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // GDMT Frequency
    freq: {
      type: 'text',
      maxLength: 10,
      clean: s => String(s || '').trim().slice(0, 10),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Select frequency' : '' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Free Text / Reason / Other Specify
    notes: {
      type: 'text',
      maxLength: 150,
      clean: s => String(s || '').slice(0, 150),
      validate: (val, req) => {
        const raw = String(val || '').trim();
        if(!raw && req) return { ok: false, lvl: 'e', msg: 'Required' };
        if(raw.length > 150) return { ok: false, lvl: 'e', msg: 'Cannot exceed 150 characters' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Staff Initials
    ini: {
      type: 'text',
      maxLength: 5,
      clean: s => String(s || '').toUpperCase().replace(/[^A-Za-z]/g, '').slice(0, 5),
      validate: (val, req) => {
        const raw = String(val || '').trim().toUpperCase();
        if(!raw) return { ok: !req, lvl: req ? 'e' : '', msg: req ? 'Initials required' : '' };
        if(!INI_RE.test(raw)) return { ok: false, lvl: 'e', msg: 'Capital letters only, up to 5' };
        return { ok: true, lvl: '', msg: '' };
      }
    },

    // Search Box
    search: {
      type: 'search',
      maxLength: 100,
      clean: s => String(s || '').slice(0, 100),
      validate: () => ({ ok: true, lvl: '', msg: '' })
    }
  };

  /* ------------------------------------------------------------------------
     2. AUTOMATIC SCHEMA IDENTIFICATION FROM DOM OR PATH
     ------------------------------------------------------------------------ */
  function matchSchema(keyOrEl){
    if(!keyOrEl) return null;
    let key = '';
    let el = null;

    if(typeof keyOrEl === 'string'){
      key = keyOrEl;
    } else if(keyOrEl && keyOrEl.nodeType === 1){
      el = keyOrEl;
      key = el.dataset.p || el.id || el.name || '';
      const cbWrap = el.closest ? el.closest('[data-cb]') : null;
      if(cbWrap && cbWrap.dataset.cb) {
        const cb = cbWrap.dataset.cb;
        if(cb === 'inv') return SCHEMAS.person_name;
        if(cb === 'site') return SCHEMAS.site_code;
        if(cb === 'zone' || cb === 'user-zone') return SCHEMAS.zone;
        if(cb === 'designation') return SCHEMAS.designation;
      }
    }

    if(!key) return null;
    if(SCHEMAS[key]) return SCHEMAS[key];

    // Contact / Phone
    if(key === 'contact' || key === 'phone' || key === 'nContact' || key === 'nuPhone' || key === 'euPhone' || key === 'mobile') return SCHEMAS.phone;

    // Person Names
    if(key === 'name' || key === 'nName' || key === 'nuName' || key === 'euName' || key === 'inv' || key === 'nInv') return SCHEMAS.person_name;

    // Email
    if(key === 'email' || key === 'nuEmail' || key === 'euEmail') return SCHEMAS.email;

    // Username
    if(key === 'username' || key === 'nuUser' || key === 'user' || key === 'nuUsername' || key === 'euUsername') return SCHEMAS.username;

    // Password
    if(key === 'password' || key === 'pass') return SCHEMAS.password;

    // Designation / Title
    if(key === 'designation' || key === 'nuDesig' || key === 'euDesig') return SCHEMAS.designation;

    // Site / Hospital
    if(key === 'nsCode' || key === 'esCode' || key === 'site' || key === 'code') return SCHEMAS.site_code;
    if(key === 'nsName' || key === 'esName' || key === 'site_name') return SCHEMAS.site_name;

    // Zones
    if(key === 'zone' || key === 'nsZone' || key === 'esZone' || key === 'nuZoneInput' || key === 'euZoneInput') return SCHEMAS.zone;

    // Age & Consent
    if(key === 'age' || key === 'nAge') return SCHEMAS.age;
    if(key === 'consent' || key === 'nConsent') return SCHEMAS.consent_date;

    // Clinical measurements
    if(/(^|\.)wt$/.test(key)) return SCHEMAS.wt;
    if(/(^|\.)hr$/.test(key)) return SCHEMAS.hr;
    if(/(^|\.)sbp$/.test(key)) return SCHEMAS.sbp;
    if(/(^|\.)dbp$/.test(key)) return SCHEMAS.dbp;
    if(/(^|\.)lvef$/.test(key)) return SCHEMAS.lvef;
    if(/(^|\.)msts$/.test(key)) return SCHEMAS.msts;

    // GDMT fields
    if(/\.drug$/.test(key)) return SCHEMAS.drug;
    if(/\.strength$/.test(key)) return SCHEMAS.strength;
    if(/\.freq$/.test(key)) return SCHEMAS.freq;

    // Notes / Initials / Search
    if(/etioO|rsO|\.ev\.int/.test(key) || key === 'nEtioO') return SCHEMAS.notes;
    if(/\.ini$/.test(key)) return SCHEMAS.ini;
    if(key === 'search' || key === 'siteSearchInput' || key === 'usrSearchInput') return SCHEMAS.search;

    return null;
  }

  /* ------------------------------------------------------------------------
     3. REAL-TIME INPUT ENFORCEMENT & HARD MAXLENGTH CAPS
     ------------------------------------------------------------------------ */
  function enforceInput(el){
    if(!el || !el.matches || !el.matches('input, textarea')) return;
    if(el.type === 'checkbox' || el.type === 'radio' || el.type === 'file' || el.type === 'button' || el.type === 'submit') return;
    const schema = matchSchema(el);
    if(schema){
      // Strictly enforce physical maxlength on the element
      if(schema.maxLength && (!el.hasAttribute('maxlength') || Number(el.getAttribute('maxlength')) > schema.maxLength)){
        el.setAttribute('maxlength', String(schema.maxLength));
      }
      // Set inputmode for virtual keyboards
      if(schema.inputmode && !el.hasAttribute('inputmode')){
        el.setAttribute('inputmode', schema.inputmode);
      }
    } else {
      // General safety fallback: NEVER leave any text input open for infinite length!
      if(!el.hasAttribute('maxlength') && el.type !== 'date'){
        el.setAttribute('maxlength', '150');
      }
    }
  }

  // Global Input Sanitization (drops forbidden chars, caps length on the fly)
  document.addEventListener('input', function(e){
    const el = e.target;
    if(!el || !el.matches || !el.matches('input, textarea')) return;
    const schema = matchSchema(el);

    enforceInput(el);

    if(schema && typeof schema.clean === 'function'){
      const cleaned = schema.clean(el.value);
      if(cleaned !== el.value){
        el.value = cleaned;
      }
    }
  }, true);

  // Global Keydown Restriction (prevents entering non-numeric chars or exceeding limits)
  document.addEventListener('keydown', function(e){
    const el = e.target;
    if(!el || !el.matches || !el.matches('input, textarea')) return;
    if(el.type === 'date') return;
    const schema = matchSchema(el);
    if(!schema) return;

    // Standard navigation and control keys are always allowed
    if(['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)){
      return;
    }
    if(e.ctrlKey || e.metaKey || e.altKey) return;

    // Numeric schema restriction
    if(schema.inputmode === 'decimal'){
      if(!/^[\d.]$/.test(e.key) || (e.key === '.' && el.value.includes('.'))){
        e.preventDefault();
        return;
      }
    } else if(schema.type === 'number' || schema.type === 'tel' || schema.inputmode === 'numeric'){
      if(!/^\d$/.test(e.key)){
        e.preventDefault();
        return;
      }
    }

    // Hard length limit guard
    if(schema.maxLength){
      const selLen = (el.selectionEnd != null && el.selectionStart != null) ? (el.selectionEnd - el.selectionStart) : 0;
      if(el.value.length >= schema.maxLength && selLen === 0){
        e.preventDefault();
      }
    }
  }, true);

  // Global Paste Restriction (cleans and slices pasted content safely)
  document.addEventListener('paste', function(e){
    const el = e.target;
    if(!el || !el.matches || !el.matches('input, textarea')) return;
    const schema = matchSchema(el);

    e.preventDefault();
    const clip = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const curVal = el.value;

    const combined = curVal.slice(0, start) + clip + curVal.slice(end);
    const cleaned = (schema && typeof schema.clean === 'function')
      ? schema.clean(combined)
      : combined.slice(0, (schema && schema.maxLength) ? schema.maxLength : 150);

    el.value = cleaned;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, true);

  // Auto-scan on focusin
  document.addEventListener('focusin', function(e){
    enforceInput(e.target);
  }, true);

  /* ------------------------------------------------------------------------
     4. PUBLIC API EXPORTS
     ------------------------------------------------------------------------ */
  const STANDHF_VALIDATOR = {
    SCHEMAS,
    matchSchema,
    enforceInput,
    clean: (key, val) => {
      const s = matchSchema(key);
      return s && typeof s.clean === 'function' ? s.clean(val) : String(val || '');
    },
    validate: (key, val, req, ctx) => {
      const s = matchSchema(key);
      if(!s || typeof s.validate !== 'function') return { ok: true, lvl: '', msg: '' };
      return s.validate(val, req, ctx);
    },
    // Canonical phone standards compatibility
    contactClean: s => SCHEMAS.phone.clean(s),
    contactOk: s => {
      const d = String(s || '').replace(/\D/g, '');
      return d.length >= 10 && d.length <= 11;
    },
    contactError: (val, req) => SCHEMAS.phone.validate(val, req).msg
  };

  // Expose to window and global
  global.STANDHF_VALIDATOR = STANDHF_VALIDATOR;
  global.Validator = STANDHF_VALIDATOR;

  // Provide global canonical helpers directly
  if(typeof global.contactClean !== 'function') global.contactClean = STANDHF_VALIDATOR.contactClean;
  if(typeof global.contactOk !== 'function') global.contactOk = STANDHF_VALIDATOR.contactOk;
  if(typeof global.contactError !== 'function') global.contactError = STANDHF_VALIDATOR.contactError;

})(typeof window !== 'undefined' ? window : this);
