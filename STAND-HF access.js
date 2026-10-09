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
  sites:[
    {code:'RIC',name:'Riverside Cardiac Centre'},
    {code:'LHR',name:'Lakeview Heart Clinic'},
    {code:'KHI',name:'Harbor Heart Institute'},
    {code:'ISB',name:'Highland Cardiology'}
  ],
  users:[
    {username:'michael.johnson',name:'Michael Johnson',role:'superadmin',sites:[],active:true},
    {username:'emily.carter',name:'Emily Carter',role:'investigator',sites:['RIC','LHR'],active:true},
    {username:'robert.wilson',name:'Robert Wilson',role:'central',sites:[],active:true}
  ],
  perms:{
    superadmin:ALL_PERMS,
    investigator:{add_patient:true,enter_data:true,mark_complete:true},
    central:{view_all_sites:true,export_data:true,mark_complete:true,assign_investigators:true}
  }
};

function accessStore(){
  try{
    const s=JSON.parse(localStorage.getItem(ACCESS_KEY)||'null');
    if(s&&Array.isArray(s.sites)&&Array.isArray(s.users)&&s.perms){
      /* Add permissions introduced later; keep anything an admin has already set */
      Object.entries(DEFAULT_ACCESS.perms).forEach(([r,defs])=>{
        if(r==='superadmin')return;
        s.perms[r]=s.perms[r]||{};
        Object.entries(defs).forEach(([k,v])=>{if(!(k in s.perms[r]))s.perms[r][k]=v});
      });
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
  if(r==='superadmin')return !SUPER_NO.includes(perm);
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
const inScope=p=>mySites().includes(p.site);
