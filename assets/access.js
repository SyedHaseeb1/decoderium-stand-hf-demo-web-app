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
/* Super Admin oversees the study; patient data entry belongs to site and central staff */
const SUPER_NO=['add_patient','enter_data','mark_complete'];
const DEFAULT_ACCESS={
  zones:['North','Central','South'],
  sites:[
    {code:'RIC',name:'Riverside Cardiac Centre',zone:'North',city:'Rawalpindi'},
    {code:'LHR',name:'Lakeview Heart Clinic',zone:'Central',city:'Lahore'},
    {code:'KHI',name:'Harbor Heart Institute',zone:'South',city:'Karachi'},
    {code:'ISB',name:'Highland Cardiology',zone:'North',city:'Islamabad'}
  ],
  users:[
    {username:'michael.johnson',name:'Michael Johnson',role:'superadmin',sites:[],zones:[],active:true},
    {username:'emily.carter',name:'Emily Carter',role:'investigator',sites:['RIC','LHR'],zones:['North','Central'],active:true},
    {username:'robert.wilson',name:'Robert Wilson',role:'central',sites:[],zones:['North','Central','South'],active:true},
    {username:'adnan.khan',name:'Adnan Khan',role:'investigator',sites:['KHI','ISB'],zones:['South','North'],active:true}
  ],
  perms:{
    superadmin:ALL_PERMS,
    investigator:{add_patient:true,enter_data:true,mark_complete:true,load_demo:true,clear_all:true},
    central:{view_all_sites:true,export_data:true}
  }
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
        s.perms.central.view_all_sites=true;
        s.perms.central.export_data=true;
      }
      /* Add permissions introduced later; keep anything an admin has already set */
      Object.entries(DEFAULT_ACCESS.perms).forEach(([r,defs])=>{
        if(r==='superadmin')return;
        s.perms[r]=s.perms[r]||{};
        Object.entries(defs).forEach(([k,v])=>{if(!(k in s.perms[r]))s.perms[r][k]=v});
      });
      /* Demo accounts added after a browser saved its list are added here, so they can sign in */
      DEFAULT_ACCESS.users.forEach(u=>{if(!s.users.some(x=>x.username===u.username))s.users.push(JSON.parse(JSON.stringify(u)))});
      return s;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_ACCESS));
}
function saveAccess(s){try{localStorage.setItem(ACCESS_KEY,JSON.stringify(s))}catch(e){}}

const sessionVal=k=>{try{return sessionStorage.getItem(k)||''}catch(e){return ''}};
function session(){return{username:sessionVal('standhf_username'),name:sessionVal('standhf_user'),role:sessionVal('standhf_role')}}
function currentUser(){const u=session().username;return accessStore().users.find(x=>x.username===u)||null}

/* Super Admin can do everything; other roles follow their saved permissions */
function can(perm){
  const r=session().role;
  if(!r)return false;
  if(r==='superadmin')return true;
  const perms=accessStore().perms[r]||{};
  return !!perms[perm];
}
/* Sites the signed-in user may see and enter data for */
function mySites(){
  const s=accessStore();
  if(can('view_all_sites'))return s.sites.map(x=>x.code);
  const u=currentUser();
  return u?u.sites.slice():[];
}
/* Which records a user may see: Super Admin all; a Site Investigator only the records they created; others their sites */
function recordVisible(p){
  const r=session().role;
  if(r==='superadmin')return true;
  if(r==='investigator')return p.owner?p.owner===session().username:p.inv===session().name;
  return mySites().includes(p.site)}
const inScope=p=>recordVisible(p);
