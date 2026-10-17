/* STAND-HF access: sites, users, role permissions and the signed-in session.
   Shared by the sign-in page, the administration page and the E-CRF.
   Data is kept in this browser (prototype). */
const ACCESS_KEY='standhf_access_v1';
const ROLE_NAMES={superadmin:'Super Admin',investigator:'Site Investigator',central:'Central team'};
const PERMS=[
  ['view_all_sites','See patients at every site'],
  ['add_patient','Add patients'],
  ['enter_data','Enter and edit visit data'],
  ['mark_complete','Mark visits complete or reopen them'],
  ['export_data','Export CSV'],
  ['load_demo','Load demo data'],
  ['clear_all','Clear all data'],
  ['assign_investigators','Add site investigators and assign their sites'],
  ['manage_users','Manage users'],
  ['manage_sites','Manage sites']
];
const ALL_PERMS=Object.fromEntries(PERMS.map(([k])=>[k,true]));
/* Super Admin and Central team oversee the study; clinical patient data entry belongs strictly to assigned site investigators */
const SUPER_NO=['load_demo','clear_all'];
const DEFAULT_ACCESS={
  zones:['North','Central','South'],
  sites:[
    {code:'RIC',name:'Riverside Cardiac Centre',zone:'North',city:'Rawalpindi'},
    {code:'LHR',name:'Lakeview Heart Clinic',zone:'Central',city:'Lahore'},
    {code:'KHI',name:'Harbor Heart Institute',zone:'South',city:'Karachi'},
    {code:'ISB',name:'Highland Cardiology',zone:'North',city:'Islamabad'}
  ],
  users:[
    {username:'michael.johnson',name:'Michael Johnson',role:'superadmin',sites:[],zones:[],active:true,mustChangePassword:false},
    {username:'emily.carter',name:'Emily Carter',role:'investigator',sites:['RIC'],zones:['North'],active:true,mustChangePassword:false},
    {username:'robert.wilson',name:'Robert Wilson',role:'central',sites:[],zones:['North','Central','South'],active:true,mustChangePassword:false},
    {username:'adnan.khan',name:'Adnan Khan',role:'investigator',sites:['KHI'],zones:['South'],active:true,mustChangePassword:false}
  ],
  perms:{
    superadmin:{view_all_sites:true,add_patient:true,enter_data:true,mark_complete:true,export_data:true,assign_investigators:true,manage_users:true,manage_sites:true},
    investigator:{add_patient:true,enter_data:true,mark_complete:true,load_demo:true,clear_all:true},
    central:{view_all_sites:true,export_data:true}
  },
  _migrated_inv_export_v2: true
};

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
      const zMap={RIC:'North',ISB:'North',LHR:'Central',KHI:'South'};
      s.sites.forEach(st=>{if(!st.zone)st.zone=zMap[st.code]||'Central'});
      /* Ensure central role is strictly read-only monitoring + export */
      if(s.perms.central){
        delete s.perms.central.assign_investigators;
        delete s.perms.central.add_patient;
        delete s.perms.central.enter_data;
        delete s.perms.central.mark_complete;
        delete s.perms.central.load_demo;
        delete s.perms.central.clear_all;
        s.perms.central.view_all_sites=true;
        s.perms.central.export_data=true;
      }
      /* Ensure superadmin role has no clinical patient form modification permissions */
      if(s.perms.superadmin){
        SUPER_NO.forEach(p=>{delete s.perms.superadmin[p]});
        s.perms.superadmin.view_all_sites=true;
        s.perms.superadmin.export_data=true;
        s.perms.superadmin.assign_investigators=true;
        s.perms.superadmin.manage_users=true;
        s.perms.superadmin.manage_sites=true;
      }
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
      /* Normalize investigator accounts so 1 investigator has strictly 1 site */
      s.users.forEach(u=>{
        if(u.role==='investigator'){
          let stCode=(Array.isArray(u.sites)&&u.sites.length)?u.sites[0]:(u.site||'');
          let found=s.sites.find(st=>st.code===stCode);
          if(!found&&Array.isArray(u.zones)&&u.zones.length){
            found=s.sites.find(st=>(st.zone||'').toLowerCase()===(u.zones[0]||'').toLowerCase());
          }
          if(!found&&s.sites.length){
            found=s.sites[0];
          }
          if(found){
            u.sites=[found.code];
            u.zones=[found.zone||'Central'];
          }
        }
      });
      /* Demo accounts added after a browser saved its list are added here, so they can sign in */
      DEFAULT_ACCESS.users.forEach(u=>{if(!s.users.some(x=>x.username===u.username))s.users.push(JSON.parse(JSON.stringify(u)))});
      return s;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_ACCESS));
}
function saveAccess(s){if(s)s._migrated_inv_export_v2=true;try{localStorage.setItem(ACCESS_KEY,JSON.stringify(s))}catch(e){}}

const sessionVal=k=>{try{return sessionStorage.getItem(k)||''}catch(e){return ''}};
function session(){return{username:sessionVal('standhf_username'),name:sessionVal('standhf_user'),role:sessionVal('standhf_role')}}
function currentUser(){
  const s=session();
  const u=(s.username||'').toLowerCase().trim();
  const name=(s.name||'').toLowerCase().trim();
  const store=accessStore();
  if(!store||!Array.isArray(store.users))return null;
  return store.users.find(x=>{
    const xu=(x.username||'').toLowerCase().trim();
    if(u&&xu===u)return true;
    if(name&&(x.name||'').toLowerCase().trim()===name)return true;
    return false;
  })||null;
}

function generateTempPassword(){
  var num = Math.floor(1000 + Math.random() * 9000);
  return 'Stand#' + num;
}

function updateUserPassword(username, newPass){
  var s = accessStore();
  var u = s.users.find(function(x){ return x.username === username; });
  if(!u) return false;
  u.password = newPass;
  u.mustChangePassword = false;
  u.passwordUpdatedAt = new Date().toISOString();
  saveAccess(s);
  return true;
}

function updateUserProfile(username, updates){
  var s = accessStore();
  var u = s.users.find(function(x){ return x.username === username; });
  if(!u) return false;
  u.personal = u.personal || {};
  if(updates.phone !== undefined) u.personal.phone = updates.phone;
  if(updates.avatar !== undefined) u.avatar = updates.avatar;
  if(updates.profileUpdatedAt !== undefined) u.profileUpdatedAt = updates.profileUpdatedAt;
  saveAccess(s);
  return true;
}

function verifyUserPassword(username, pass){
  var s = accessStore();
  var u = s.users.find(function(x){ return x.username === username; });
  if(!u) return false;
  if(!u.password) return true; // legacy demo accounts without explicit password
  return u.password === pass;
}

/* Super Admin and Central oversee the study; only allowed Site Investigators can enter or edit clinical forms */
function can(perm){
  const r=session().role;
  if(!r)return false;
  if(r==='superadmin'){
    if(SUPER_NO.includes(perm))return false;
    return true;
  }
  if(r==='central'){
    /* Read-only super admins: can see everything and export, but cannot edit or create */
    if(perm==='view_all_sites'||perm==='export_data'||perm==='view_admin')return true;
    return false;
  }
  const perms=accessStore().perms[r]||{};
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
  // Fallback: match from zone or fallback to first registered site
  const uZones = Array.isArray(u.zones) ? u.zones : (u.zone ? [u.zone] : []);
  if(uZones.length){
    const match = s.sites.find(st => {
      const z = (st.zone || '').toLowerCase();
      return uZones.some(uz => (uz || '').toLowerCase() === z);
    });
    if(match) return [match.code];
  }
  if(s.sites.length) return [s.sites[0].code];
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

/* Sites the signed-in user may see and enter data for (includes all hospitals in their assigned zones) */
function mySites(){
  const s=accessStore();
  if(can('view_all_sites'))return s.sites.map(x=>x.code);
  return userAssignedSites(currentUser(), s);
}

/* Which records a user may see:
   - Super Admin: all sites and all zones (global oversight)
   - Central Team: all sites and records under their assigned zones
   - Site Investigator: STRICTLY their own patients at their assigned medical centres */
function recordVisible(p){
  if(!p) return false;
  const r=session().role;
  if(r==='superadmin') return true;
  if(r==='central'){
    const allowed=userAssignedSites(currentUser());
    if(!allowed.length) return true;
    return !p.site || allowed.includes(p.site);
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
