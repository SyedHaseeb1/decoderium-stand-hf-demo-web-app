/* STAND-HF shared sidebar: the same navigation on every investigator screen.
   Desktop: a column that can collapse to icons.
   Tablet and phone (up to 1000px): a drawer opened from the menu button in the top bar.
   Pages provide <aside class="side" id="side">, a <header class="topbar">, and <body data-page="dashboard|records">. */
(function(){
  const root=document.getElementById('side');
  if(!root)return;
  const ss=k=>{try{return sessionStorage.getItem(k)||''}catch(e){return ''}};
  const isInv=ss('standhf_role')==='investigator';
  const DASH='../dashboard/', ECRF='../records/', LOGIN='../login/', ADMIN='../admin/';
  const isSuper=ss('standhf_role')==='superadmin';
  /* Pages with data-nav="compact" (the reduced doctor dashboard) hide the Reports group */
  const compact=document.body.dataset.nav==='compact';
  const isCentral=ss('standhf_role')==='central';
  const onNew=/[?&]new=1/.test(location.search);
  const page=document.body.dataset.page;
  /* Which nav item is active: admin and dashboard sections follow the URL hash */
  const pageKey=()=>{
    if(page==='admin'){const h=location.hash.slice(1);return ['users','sites','perms'].includes(h)?'adm-'+h:'adm-users'}
    if(page==='dashboard'){
      if(window.standhfDashNavKey) return window.standhfDashNavKey;  // set by the open tab
      const h=location.hash.slice(1).toLowerCase();
      if(['performance','clinical','report','reports','analytics'].includes(h)) return 'performance';
      if(['sites','league'].includes(h)) return 'sites';
      if(['export','exports','downloads','download'].includes(h)) return 'export';
      return 'dashboard';
    }
    const isNew=(typeof window.standhfIsNewMode==='function'&&window.standhfIsNewMode())||(/[?&]new=1/.test(location.search));
    return isNew?'add':'records';
  };
  const current=pageKey();
  const drawerQuery=window.matchMedia('(max-width: 1000px)');

  const groups=[
    {label:'General',items:[
      {key:'dashboard',label:'Dashboard',href:DASH,icon:'space_dashboard',show:true},
      {key:'add',label:'Add new patient',href:ECRF+'?new=1',icon:'person_add',show:isInv},
      {key:'records',label:'Participant records',href:ECRF,icon:'folder_shared',show:true}
    ]},
    {label:'Reports',items:[
      {key:'performance',label:'Performance',href:DASH+'#performance',icon:'monitoring',show:!compact},
      {key:'sites',label:'Sites & League',href:DASH+'#sites',icon:'leaderboard',show:!compact},
      {key:'export',label:'Data Export',href:DASH+'#export',icon:'file_download',show:!compact}
    ]},
    {label:'Administration',items:[
      {key:'adm-users',label:'Users & Teams',href:ADMIN+'#users',icon:'group',show:isSuper},
      {key:'adm-sites',label:'Sites',href:ADMIN+'#sites',icon:'location_on',show:isSuper},
      {key:'adm-perms',label:'Permissions',href:ADMIN+'#perms',icon:'shield_person',show:isSuper}
    ]}
  ];
  const link=i=>`<a class="nav${i.key===current?' active':''}" data-key="${i.key}" href="${i.href}"${i.key===current?' aria-current="true"':''} title="${i.label}"><i class="ms">${i.icon}</i><span class="side-text">${i.label}</span></a>`;
  const navScript=document.querySelector('script[src$="nav.js"]');
  const logoSrc=(navScript?navScript.getAttribute('src'):'../assets/nav.js').replace(/nav\.js.*$/,'STAND-HF-logo.svg');
  root.innerHTML=`
    <div class="side-top">
      <span class="logo logo-img"><img src="${logoSrc}" alt="STAND-HF"></span>
      <button type="button" class="side-toggle" id="sideToggle" aria-expanded="true" title="Collapse navigation" aria-label="Collapse navigation"><i class="ms">menu_open</i></button>
    </div>
    ${groups.map(g=>{const shown=g.items.filter(i=>i.show);return shown.length?`<div class="side-label">${g.label}</div>${shown.map(link).join('')}`:''}).join('')}
    <div class="side-label">Other</div>
    <button type="button" class="nav" id="navOut"><i class="ms">logout</i><span class="side-text">Sign out</span></button>`;

  const app=document.querySelector('.app'),toggle=document.getElementById('sideToggle');

  /* Drawer scrim and the menu button in the top bar (shown only in drawer mode) */
  const scrim=document.createElement('div');
  scrim.className='scrim';scrim.id='scrim';scrim.hidden=true;
  document.body.appendChild(scrim);
  const menuBtn=document.createElement('button');
  menuBtn.type='button';menuBtn.className='menu-btn';menuBtn.id='menuBtn';
  menuBtn.setAttribute('aria-label','Open menu');menuBtn.setAttribute('aria-expanded','false');menuBtn.title='Open menu';
  menuBtn.innerHTML='<i class="ms">menu</i>';
  const bar=document.querySelector('.topbar');
  if(bar)bar.prepend(menuBtn);

  const setDrawer=o=>{
    root.classList.toggle('open',o);
    scrim.hidden=!o;
    document.body.classList.toggle('drawer-open',o);
    menuBtn.setAttribute('aria-expanded',String(o));
    if(o)root.querySelector('.nav')?.focus({preventScroll:true});
  };
  menuBtn.onclick=()=>setDrawer(true);
  scrim.onclick=()=>setDrawer(false);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('open'))setDrawer(false)});
  root.addEventListener('click',e=>{
    const a=e.target.closest('a.nav');
    if(!a)return;
    setDrawer(false);
    if(page==='records'){
      if(a.dataset.key==='records'){
        e.preventDefault();
        if(typeof window.standhfOpenRecords==='function') window.standhfOpenRecords();
        else location.href=ECRF;
      } else if(a.dataset.key==='add'){
        e.preventDefault();
        if(typeof window.standhfOpenNew==='function') window.standhfOpenNew();
        else location.href=ECRF+'?new=1';
      }
    } else if(page==='dashboard'){
      if(['performance','sites','gdmt','export'].includes(a.dataset.key)){
        if(location.hash === '#'+a.dataset.key){
          e.preventDefault();
          if(typeof window.standhfApplyHash==='function') window.standhfApplyHash(a.dataset.key);
        }
      }
    }
  });

  /* Desktop: collapse to icons, remembered per browser */
  const setCollapsed=c=>{
    app.classList.toggle('collapsed',c);
    const label=c?'Expand navigation':'Collapse navigation';
    toggle.setAttribute('aria-expanded',String(!c));toggle.setAttribute('aria-label',label);toggle.title=label;
    toggle.querySelector('.ms').textContent=c?'menu':'menu_open';
  };
  let saved=false;try{saved=localStorage.getItem('standhf_nav_collapsed')==='1'}catch(e){}
  setCollapsed(saved);
  toggle.onclick=()=>{
    if(drawerQuery.matches){setDrawer(false);return}
    const c=!app.classList.contains('collapsed');setCollapsed(c);try{localStorage.setItem('standhf_nav_collapsed',c?'1':'0')}catch(e){}
  };

  /* Leaving drawer mode closes the drawer */
  drawerQuery.addEventListener('change',()=>{if(!drawerQuery.matches)setDrawer(false)});

  /* Update active nav button state across all pages and events */
  window.standhfUpdateNav=()=>{
    const cur=pageKey();
    root.querySelectorAll('a.nav[data-key]').forEach(a=>{
      const on=a.dataset.key===cur;
      a.classList.toggle('active',on);
      if(on)a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    });
  };
  window.addEventListener('hashchange',window.standhfUpdateNav);
  window.addEventListener('popstate',window.standhfUpdateNav);

  document.getElementById('navOut').onclick=()=>window.standhfSignOut(LOGIN);
})();

/* Central loader: shown until the page is ready, then removed */
(function(){
  var loader=document.createElement('div');
  loader.className='loader';loader.id='loader';loader.setAttribute('role','status');loader.setAttribute('aria-label','Loading');
  loader.innerHTML='<span class="spinner" aria-hidden="true"></span>';
  if(document.body)document.body.appendChild(loader);
  var hide=function(){loader.classList.add('done');setTimeout(function(){loader.remove()},250)};
  if(document.readyState==='complete')hide();
  else{window.addEventListener('load',hide);setTimeout(hide,1500)}
})();

/* Show the central loader for a moment, then run the action (used by Load demo) */
window.withLoader=function(ms,fn){
  var l=document.createElement('div');
  l.className='loader';l.setAttribute('role','status');l.setAttribute('aria-label','Loading');
  l.innerHTML='<span class="spinner" aria-hidden="true"></span>';
  document.body.appendChild(l);
  setTimeout(function(){
    fn();
    l.classList.add('done');
    setTimeout(function(){l.remove()},250);
  },ms);
};

/* Dropdowns: a touch or click outside an open dropdown closes it (so only one stays open) */
document.addEventListener('pointerdown',function(e){
  var t=e.target;
  document.querySelectorAll('.cb-list:not([hidden])').forEach(function(ul){
    var wrap=ul.closest('.cb');
    if(wrap&&wrap.contains(t))return;
    if(typeof cbClose==='function'&&wrap)cbClose(wrap);else ul.hidden=true;
  });
  /* Each panel stays open only for taps on its own button or inside it */
  var keep=[['.sort-menu','.list-sort,.sort-menu'],['.notify-panel','.notify'],['.profile-panel','.profile-wrap']];
  keep.forEach(function(k){
    document.querySelectorAll(k[0]+':not([hidden])').forEach(function(el){
      if(t.closest&&t.closest(k[1]))return;
      el.hidden=true;
    });
  });
},{capture:true,passive:true});

