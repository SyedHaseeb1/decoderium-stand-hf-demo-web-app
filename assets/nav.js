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
  const isCentral=ss('standhf_role')==='central';
  const onNew=/[?&]new=1/.test(location.search);
  const page=document.body.dataset.page;
  /* Which nav item is active: admin sections follow the URL hash */
  const pageKey=()=>{
    if(page==='admin'){const h=location.hash.slice(1);return ['users','sites','perms'].includes(h)?'adm-'+h:(isCentral?'adm-users':'dashboard')}
    return page==='dashboard'?'dashboard':(onNew?'add':'records');
  };
  const current=pageKey();
  const drawerQuery=window.matchMedia('(max-width: 1000px)');

  const groups=[
    {label:'General',items:[
      {key:'dashboard',label:'Dashboard',href:isSuper?ADMIN+'#dash':DASH,icon:'space_dashboard',show:isInv||isSuper},
      {key:'add',label:'Add patient',href:ECRF+'?new=1',icon:'person_add',show:!isSuper},
      {key:'records',label:'Patient records',href:ECRF,icon:'edit_note',show:true}
    ]},
    {label:'Reports',items:[
      {key:'performance',label:'Performance',href:DASH+'#performance',icon:'monitoring',show:isInv},
      {key:'sites',label:'Sites',href:DASH+'#sites',icon:'location_on',show:isInv}
    ]},
    {label:'Administration',items:[
      {key:'adm-users',label:'Users',href:ADMIN+'#users',icon:'group',show:isSuper||can('assign_investigators')},
      {key:'adm-sites',label:'Sites',href:ADMIN+'#sites',icon:'location_on',show:isSuper},
      {key:'adm-perms',label:'Permissions',href:ADMIN+'#perms',icon:'shield_person',show:isSuper}
    ]}
  ];
  const link=i=>`<a class="nav${i.key===current?' active':''}" data-key="${i.key}" href="${i.href}"${i.key===current?' aria-current="true"':''} title="${i.label}"><i class="ms">${i.icon}</i><span class="side-text">${i.label}</span></a>`;
  root.innerHTML=`
    <div class="side-top">
      <span class="logo" aria-hidden="true"><i class="ms">monitor_heart</i></span>
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
  root.addEventListener('click',e=>{if(e.target.closest('a.nav'))setDrawer(false)});

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

  /* Admin sections change the hash, so keep the active item in step */
  window.addEventListener('hashchange',()=>{
    const cur=pageKey();
    root.querySelectorAll('a.nav[data-key]').forEach(a=>{const on=a.dataset.key===cur;a.classList.toggle('active',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')});
  });

  document.getElementById('navOut').onclick=()=>{try{sessionStorage.removeItem('standhf_auth')}catch(e){}location.replace(LOGIN)};
})();
