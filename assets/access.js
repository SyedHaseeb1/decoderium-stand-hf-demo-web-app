/* STAND-HF access: sites, users, role permissions and the signed-in session.
   Shared by the sign-in page, the administration page and the E-CRF.
   Data is kept in this browser (prototype). */
/* Roles, permissions and sites are read from data/access-control.json, demo users from data/users.json (loaded by assets/boot.js) */
const ACCESS_DATA=window.STANDHF_DATA.accessControl;
const USERS_DATA=window.STANDHF_DATA.users.users;
const ACCESS_KEY='standhf_access_v1';
const ROLE_NAMES=ACCESS_DATA.roleNames;
const PERMS=ACCESS_DATA.permissions;
const ALL_PERMS=Object.fromEntries(PERMS.map(([k])=>[k,true]));
/* Super Admin and Central team oversee the study; clinical patient data entry belongs strictly to assigned site investigators */
const SUPER_NO=ACCESS_DATA.superNo;
const DEFAULT_ACCESS=Object.assign(JSON.parse(JSON.stringify(ACCESS_DATA)),{users:JSON.parse(JSON.stringify(USERS_DATA))});

const AUDIT_CENTRAL_KEY='standhf_central_audit_v1';
function centralAuditLog(){
  try{return JSON.parse(localStorage.getItem(AUDIT_CENTRAL_KEY)||'[]')}catch(e){return []}
}
function logCentralAction(action,details,target){
  try{
    const list=centralAuditLog();
    const s=session();
    list.unshift({
      id:'aud-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
      username:s.username||'unknown',
      name:s.name||'Central Team User',
      role:s.role||'central',
      action:action||'Export',
      details:details||'',
      target:target||'All Sites',
      t:new Date().toLocaleString('en-GB'),
      timestamp:Date.now()
    });
    localStorage.setItem(AUDIT_CENTRAL_KEY,JSON.stringify(list.slice(0,500)));
  }catch(e){}
}

function accessStore(){
  try{
    const s=JSON.parse(localStorage.getItem(ACCESS_KEY)||'null');
    if(s&&Array.isArray(s.sites)&&Array.isArray(s.users)&&s.perms){
      if(!Array.isArray(s.zones))s.zones=['North','Central','South'];
      s.sites.forEach(st=>{if(!st.zone)st.zone='Central'});
      /* Ensure superadmin role has no clinical patient form modification permissions */
      if(s.perms.superadmin){
        SUPER_NO.forEach(p=>{delete s.perms.superadmin[p]});
        s.perms.superadmin.view_all_sites=true;
        s.perms.superadmin.export_data=true;
        s.perms.superadmin.manage_users=true;
        s.perms.superadmin.manage_sites=true;
      }
      /* Ensure central role has essential defaults if not set */
      if(s.perms.central){
        // Central Team sees every site; locked on (not editable in the matrix)
        s.perms.central.view_all_sites = true;
        if(s.perms.central.export_data === undefined) s.perms.central.export_data = true;
        s.perms.central.load_demo = s.perms.central.load_demo === undefined ? true : s.perms.central.load_demo;
        s.perms.central.clear_all = s.perms.central.clear_all === undefined ? true : s.perms.central.clear_all;
      }
      /* Site Investigators are locked to their assigned site(s); this cannot be enabled from the matrix */
      if(s.perms.investigator) s.perms.investigator.view_all_sites = false;
      /* Visit data entry: Site Investigators always on, Central Team always off (locked in the matrix) */
      if(s.perms.investigator) s.perms.investigator.enter_data = true;
      if(s.perms.central) s.perms.central.enter_data = false;
      /* Adding patients: Central Team always off (locked in the matrix) */
      if(s.perms.central) s.perms.central.add_patient = false;
      /* Ensure other roles have essential defaults if not set */
      Object.keys(s.perms).forEach(role => {
          if(role !== 'central' && role !== 'superadmin'){
              if(s.perms[role].load_demo === undefined) s.perms[role].load_demo = true;
              if(s.perms[role].clear_all === undefined) s.perms[role].clear_all = true;
          }
      });
      /* One-time migration: default investigator role export_data to false (per Developer Brief v2), while preserving any subsequent admin toggles */
      if(!s._migrated_inv_export_v2){
        if(s.perms.investigator) delete s.perms.investigator.export_data;
        s._migrated_inv_export_v2=true;
        try{localStorage.setItem(ACCESS_KEY,JSON.stringify(s))}catch(e){}
      }
      /* Add permissions introduced later; keep anything an admin has already set */
      Object.entries(DEFAULT_ACCESS.perms).forEach(([r,defs])=>{
        if(r==='superadmin')return;
        s.perms[r]=s.perms[r]||{};
        Object.entries(defs).forEach(([k,v])=>{if(!(k in s.perms[r]))s.perms[r][k]=v});
      });
      /* Users carry sites only (zones belong to sites). An investigator has strictly 1 site.
         Synchronize official email between root property and personal.email */
      s.users.forEach(u=>{
        delete u.zones;
        if(!u.email && u.personal && u.personal.email) u.email = u.personal.email;
        if(u.email && (!u.personal || !u.personal.email)){
          u.personal = u.personal || {};
          u.personal.email = u.email;
        }
        if(u.role==='investigator'){
          const stCode=(Array.isArray(u.sites)&&u.sites.length)?u.sites[0]:(u.site||'');
          const found=s.sites.find(st=>st.code===stCode);
          u.sites=found?[found.code]:[];
        }
      });
      /* Demo accounts added after a browser saved its list are added here, so they can sign in */
      DEFAULT_ACCESS.users.forEach(u=>{
        var existing = s.users.find(x => x.username === u.username || (x.email && x.email === u.email));
        if(!existing) s.users.push(JSON.parse(JSON.stringify(u)));
        else if(!existing.email && u.email){
          existing.email = u.email;
          existing.personal = existing.personal || {};
          existing.personal.email = u.email;
        }
      });
      return s;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_ACCESS));
}
function saveAccess(s){if(s)s._migrated_inv_export_v2=true;try{localStorage.setItem(ACCESS_KEY,JSON.stringify(s))}catch(e){}}

const sessionVal=k=>{try{return sessionStorage.getItem(k)||''}catch(e){return ''}};
function session(){return{username:sessionVal('standhf_username'),name:sessionVal('standhf_user'),role:sessionVal('standhf_role')}}

/* Locate user by either username handle OR official email (case-insensitive) */
function findUser(identifier){
  if(!identifier) return null;
  var id = String(identifier).toLowerCase().trim();
  var s = accessStore();
  if(!s || !Array.isArray(s.users)) return null;
  return s.users.find(function(x){
    var uMatch = (x.username || '').toLowerCase().trim() === id;
    var eMatch = (x.email || (x.personal && x.personal.email) || '').toLowerCase().trim() === id;
    return uMatch || eMatch;
  }) || null;
}

function currentUser(){
  const s=session();
  const u=(s.username||'').toLowerCase().trim();
  const name=(s.name||'').toLowerCase().trim();
  const store=accessStore();
  if(!store||!Array.isArray(store.users))return null;
  return store.users.find(x=>{
    const xu=(x.username||'').toLowerCase().trim();
    const xe=(x.email||(x.personal&&x.personal.email)||'').toLowerCase().trim();
    if(u&&(xu===u||xe===u))return true;
    if(name&&(x.name||'').toLowerCase().trim()===name)return true;
    return false;
  })||null;
}

function generateTempPassword(){
  var num = Math.floor(1000 + Math.random() * 9000);
  return 'Stand#' + num;
}

function updateUserPassword(identifier, newPass){
  var s = accessStore();
  var u = findUser(identifier);
  if(!u) return false;
  var live = s.users.find(function(x){ return x.username === u.username; });
  if(!live) return false;
  live.password = newPass;
  live.mustChangePassword = false;
  live.passwordUpdatedAt = new Date().toISOString();
  saveAccess(s);
  return true;
}

function updateUserProfile(identifier, updates){
  var s = accessStore();
  var u = findUser(identifier);
  if(!u) return false;
  var live = s.users.find(function(x){ return x.username === u.username; });
  if(!live) return false;
  live.personal = live.personal || {};
  if(updates.phone !== undefined) live.personal.phone = updates.phone;
  if(updates.email !== undefined) { live.personal.email = updates.email; live.email = updates.email; }
  if(updates.avatar !== undefined) live.avatar = updates.avatar;
  if(updates.profileUpdatedAt !== undefined) live.profileUpdatedAt = updates.profileUpdatedAt;
  saveAccess(s);
  return true;
}

function verifyUserPassword(identifier, pass){
  var u = findUser(identifier);
  if(!u) return false;
  if(!u.password) return true; // legacy demo accounts without explicit password
  return u.password === pass;
}

/* Super Admin and Central oversee the study; only allowed Site Investigators can enter or edit clinical forms */
function can(perm){
  const r=session().role;
  if(!r)return false;
  if(r==='investigator' && perm==='mark_complete') return true;
  // Site Investigators never see patients outside their assigned site(s)
  if(r==='investigator' && perm==='view_all_sites') return false;
  
  // 'enter_data' allows entry and edit
  if(perm==='enter_data') return r==='investigator';

  if(r==='superadmin'){
    if(SUPER_NO.includes(perm))return false;
    return true;
  }
  
  const perms=accessStore().perms[r]||{};
  if(r==='central'){
    // Central Team sees every site; this is locked on in the matrix
    if(perm==='view_all_sites'||perm==='view_admin') return true;
    return !!perms[perm];
  }
  
  return !!perms[perm];
}

/* Helper: resolve hospital centre under an investigator's assigned site, or all sites for oversight */
function userAssignedSites(u, s){
  s = s || accessStore();
  if(!u){
    const sess = session();
    if(sess.role === 'superadmin' || sess.role === 'central' || can('view_all_sites')){
      return s.sites.map(st => st.code);
    }
    u = currentUser();
    if(!u && s.sites.length) return [s.sites[0].code];
    if(!u) return [];
  }
  if(u.role === 'superadmin' || u.role === 'central' || can('view_all_sites')){
    return s.sites.map(st => st.code);
  }
  // Site Investigator: strictly 1 assigned hospital site
  const explicit = Array.isArray(u.sites) ? u.sites : (u.site ? [u.site] : []);
  if(explicit.length){
    const primary = explicit[0];
    if(s.sites.some(st => st.code === primary)) return [primary];
  }
  return [];
}

/* Helper: look up a hospital centre by its site code */
function siteByCode(code){
  if(!code) return null;
  const s = accessStore();
  const c = String(code).toUpperCase().trim();
  return (s.sites || []).find(st => st.code === c) || null;
}
if(typeof window !== 'undefined') window.siteByCode = siteByCode;

/* Check if the current user is an authorized Site Investigator for adding patients */
function canAddPatient(siteCode){
  const r = session().role;
  if(r === 'central') return false; // Central Directorate is strictly read-only oversight
  if(r === 'superadmin') return true; // Super Admin has administrative oversight and enrollment capability
  if(r !== 'investigator') return false;
  if(!can('add_patient')) return false;
  const allowed = userAssignedSites(currentUser());
  if(!allowed.length) return false;
  if(!siteCode) return true;
  return allowed.includes(siteCode.toUpperCase().trim());
}

/* Normalize doctor display names for matching across title variations (Dr., Doctor, Prof.) */
function normDoctorName(s){
  return String(s || '').toLowerCase()
    .replace(/^(dr\.?|doctor|prof\.?|professor)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Check if a patient record belongs to the signed-in investigator (by username or doctor name) */
function isPatientOwnedByCurrentInvestigator(p){
  if(!p) return false;
  const sess = session();
  const u = currentUser();
  const myUsernames = [
    (sess.username || '').toLowerCase(),
    (u && u.username ? u.username : '').toLowerCase()
  ].filter(Boolean);

  const myNames = [
    (sess.name || '').trim(),
    (u && u.name ? u.name : '').trim()
  ].filter(Boolean);

  const pOwner = (p.owner || '').trim().toLowerCase();
  const pInv = (p.inv || '').trim();

  // Match username
  if(pOwner && myUsernames.includes(pOwner)) return true;

  // Match investigator name (exact or title-normalized)
  for(const myName of myNames){
    if(!myName) continue;
    if(pInv && (pInv.toLowerCase() === myName.toLowerCase() || normDoctorName(pInv) === normDoctorName(myName))) {
      return true;
    }
  }

  return false;
}

/* Check if the current user is an authorized Site Investigator who can edit this patient's forms */
function canEditPatient(p){
  const r=session().role;
  if(r!=='investigator')return false;
  if(!can('enter_data'))return false;
  if(!p)return true;
  return recordVisible(p);
}

/* Sites the signed-in user may see and enter data for (a central team member sees every site) */
function mySites(){
  const s=accessStore();
  if(can('view_all_sites'))return s.sites.map(x=>x.code);
  return userAssignedSites(currentUser(), s);
}

/* Which records a user may see:
   - Super Admin: all sites and all zones (global oversight)
   - Central Team: all sites
   - Site Investigator: STRICTLY their own patients at their assigned medical centres */
function recordVisible(p){
  if(!p) return false;
  const r=session().role;
  if(r==='superadmin') return true;
  if(r==='central'){
    if(can('view_all_sites')) return true;
    return !!p.site && userAssignedSites(currentUser()).includes(p.site);
  }
  if(r==='investigator'){
    const allowed=userAssignedSites(currentUser());
    // Record's site must be in the investigator's assigned sites
    if(p.site && allowed.length && !allowed.includes(p.site)) return false;
    // Record must belong to the logged-in investigator
    return isPatientOwnedByCurrentInvestigator(p);
  }
  return mySites().includes(p.site);
}
const inScope=p=>recordVisible(p);

/* =========================================================
   STAND-HF Canonical Contact / Phone Number Standards
   - Max 11 digits (e.g. 03001234567). Non-digits dropped.
   - Valid Pakistani phone number: 10 to 11 digits.
   - Enforced uniformly across all forms, patients, and users.
   ========================================================= */
function contactClean(s){
  if(typeof window !== 'undefined' && window.STANDHF_VALIDATOR) return window.STANDHF_VALIDATOR.contactClean(s);
  return String(s || '').replace(/\D/g, '').slice(0, 11);
}
function contactOk(s){
  if(typeof window !== 'undefined' && window.STANDHF_VALIDATOR) return window.STANDHF_VALIDATOR.contactOk(s);
  var d = String(s || '').replace(/\D/g, '');
  return d.length >= 10 && d.length <= 11;
}
function contactError(val, required){
  if(typeof window !== 'undefined' && window.STANDHF_VALIDATOR) return window.STANDHF_VALIDATOR.contactError(val, required);
  var raw = String(val || '').trim();
  if(!raw){
    return required ? 'Enter contact number' : '';
  }
  var d = raw.replace(/\D/g, '');
  if(d.length > 11) return 'Contact number cannot exceed 11 digits';
  if(d.length < 10) return 'Contact number is too short (10–11 digits required)';
  if(!contactOk(raw)) return 'Contact number must be valid digits';
  return '';
}

function isContactField(el){
  if(!el || !el.matches || !el.matches('input')) return false;
  if(el.type === 'tel') return true;
  var p = el.dataset ? el.dataset.p : '';
  if(p === 'contact' || el.id === 'nContact' || el.id === 'nuPhone' || el.id === 'euPhone') return true;
  var n = el.name || '';
  if(n === 'phone' || n === 'contact' || n === 'mobile') return true;
  if(el.hasAttribute('data-contact')) return true;
  return false;
}

// Global uniform contact number typing and paste restrictions
document.addEventListener('input', function(e){
  var el = e.target;
  if(isContactField(el)){
    var clean = contactClean(el.value);
    if(clean !== el.value) el.value = clean;
  }
});

document.addEventListener('keydown', function(e){
  var el = e.target;
  if(isContactField(el)){
    if(['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Escape'].includes(e.key)) return;
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    if(!/^\d$/.test(e.key)){ e.preventDefault(); return; }
    var selLen = (el.selectionEnd != null && el.selectionStart != null) ? (el.selectionEnd - el.selectionStart) : 0;
    var digits = el.value.replace(/\D/g, '');
    if(digits.length >= 11 && selLen === 0){ e.preventDefault(); }
  }
});

document.addEventListener('paste', function(e){
  var el = e.target;
  if(isContactField(el)){
    e.preventDefault();
    var txt = (e.clipboardData || window.clipboardData) ? (e.clipboardData || window.clipboardData).getData('text') : '';
    var clean = String(txt || '').replace(/\D/g, '');
    var start = el.selectionStart != null ? el.selectionStart : el.value.length;
    var end = el.selectionEnd != null ? el.selectionEnd : el.value.length;
    var curVal = el.value;
    var combined = (curVal.slice(0, start) + clean + curVal.slice(end)).replace(/\D/g, '').slice(0, 11);
    el.value = combined;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
});

/* ------------------------------------------------------------------------
   Follow-up Notification Lead Threshold (Days Before) & Alert Generator
   Governs how many days prior to a scheduled follow-up milestone (e.g. Day 90 / Day 180)
   the portal automatically generates follow-up due notifications.
   ------------------------------------------------------------------------ */
function followupAlertThresholdDays(){
  try {
    var s = accessStore();
    if(s && typeof s.followupThresholdDays === 'number' && s.followupThresholdDays >= 3 && s.followupThresholdDays <= 14){
      return s.followupThresholdDays;
    }
  } catch(e){}
  try {
    var raw = localStorage.getItem('standhf_followup_threshold_days');
    if(raw) {
      var n = parseInt(raw, 10);
      if(n >= 3 && n <= 14) return n;
    }
  } catch(e){}
  return 14; // protocol default: 14 days prior
}

function setFollowupAlertThresholdDays(days){
  var n = parseInt(days, 10);
  if(isNaN(n) || n < 3 || n > 14) return false;
  try {
    var s = accessStore();
    s.followupThresholdDays = n;
    saveAccess(s);
  } catch(e){}
  try {
    localStorage.setItem('standhf_followup_threshold_days', String(n));
  } catch(e){}
  if(typeof window !== 'undefined' && typeof window.dispatchEvent === 'function'){
    window.dispatchEvent(new CustomEvent('standhf_threshold_changed', { detail: { days: n } }));
  }
  return true;
}

/**
 * Dynamic Follow-up Notifications Generator
 * Evaluates patient registry against the admin-configured threshold days.
 * Generates due / overdue alerts when visits fall within the configured lead window.
 */
function liveNotesFor(username){
  var notes = [];
  try {
    var ptsRaw = localStorage.getItem('standhf_ecrf_v1');
    if(!ptsRaw) return notes;
    var pts = JSON.parse(ptsRaw);
    if(!Array.isArray(pts)) return notes;

    var u = findUser(username) || currentUser();
    var isGlobal = (typeof can === 'function' && can('view_all_sites')) || (u && (u.role === 'superadmin' || u.role === 'central'));
    var userSites = (typeof mySites === 'function') ? mySites() : (u && Array.isArray(u.sites) ? u.sites : []);

    var leadDays = followupAlertThresholdDays();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var parseD = function(s){
      if(!s) return null;
      var d = new Date(s + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d;
    };
    var addD = function(d, n){ return new Date(d.getTime() + n * 86400000); };

    pts.forEach(function(p){
      if(!isGlobal && (!p.site || userSites.indexOf(p.site) < 0)) return;
      if(!p.v) return;

      var bDateStr = (p.v.b && p.v.b.date) || p.consent;
      var bDate = parseD(bDateStr);
      if(!bDate) return;

      var visits = [
        { k: 'm3', name: '3-Month', days: 90, win: 14 },
        { k: 'm6', name: '6-Month', days: 180, win: 21 }
      ];

      visits.forEach(function(v){
        var vr = p.v[v.k];
        if(vr && vr.done) return;

        var targetDate = addD(bDate, v.days);
        var leadTriggerDate = addD(targetDate, -leadDays);
        var overdueDate = addD(targetDate, v.win);

        if(today >= leadTriggerDate){
          var targetStr = targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          var daysDiff = Math.round((targetDate.getTime() - today.getTime()) / 86400000);

          if(today > overdueDate){
            var overDays = Math.round((today.getTime() - overdueDate.getTime()) / 86400000);
            notes.push({
              id: 'live-od-' + (p.uid || p.id) + '-' + v.k,
              site: p.site,
              type: 'overdue',
              title: v.name + ' visit overdue',
              text: p.id + ' (' + (p.name || 'Participant') + ') missed scheduled follow-up on ' + targetStr + '. Overdue by ' + overDays + ' days.',
              time: 'Action required',
              link: { page: 'records', patient: p.id, tab: v.k }
            });
          } else {
            notes.push({
              id: 'live-due-' + (p.uid || p.id) + '-' + v.k,
              site: p.site,
              type: 'due',
              title: v.name + ' follow-up due',
              text: p.id + ' (' + (p.name || 'Participant') + ') follow-up scheduled for ' + targetStr + ' (' + (daysDiff > 0 ? daysDiff + ' days remaining' : 'due today') + '). Alert generated ' + leadDays + ' days prior per admin threshold.',
              time: daysDiff > 0 ? ('In ' + daysDiff + 'd') : 'Today',
              link: { page: 'records', patient: p.id, tab: v.k }
            });
          }
        }
      });
    });
  } catch(e){
    console.warn('[liveNotesFor] Evaluation error:', e);
  }
  return notes;
}

if(typeof window !== 'undefined'){
  window.followupAlertThresholdDays = followupAlertThresholdDays;
  window.setFollowupAlertThresholdDays = setFollowupAlertThresholdDays;
  window.liveNotesFor = liveNotesFor;
}
