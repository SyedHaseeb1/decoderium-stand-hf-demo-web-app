/* Shared app header. Every page places <div id="app-header" data-page="…"> and loads this file
   after access.js and before nav.js. Items and data follow the signed-in user and the access rules.
   Attributes on the placeholder:
     data-search   placeholder text for the search box
     data-timeline present on pages that show the Today / Week / Month selector (named so it does not match [data-period] buttons)
     data-own      present on pages that show their own sync status in the pill
   Connection: the header shows the offline bar and the Online/Offline pill, and announces changes
   with the "standhf:connection" event (detail: { online, quiet }). */
(function(){
  var host=document.getElementById('app-header');
  if(!host)return;
  var root=(document.currentScript&&document.currentScript.dataset.root)||'../';
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

  /* Who is signed in, and what they may see (from the access rules) */
  var sess=(typeof session==='function')?session():{name:'',role:''};
  var user=(typeof currentUser==='function')?currentUser():null;
  var name=(user&&user.name)||sess.name||'Signed in';
  var roleLabel=(typeof ROLE_NAMES!=='undefined'&&ROLE_NAMES[sess.role])||'Study user';
  var scope=(typeof can==='function'&&can('view_all_sites'))?'All sites':((typeof mySites==='function'?mySites():[]).join(', ')||'No site assigned');
  var initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(function(w){return w[0].toUpperCase()}).join('')||'?';

  var ds=host.dataset;
  var segment=ds.timeline!==undefined?
    '<div class="segment" role="group" aria-label="Period"><button type="button" data-period="1">Today</button><button type="button" data-period="7" class="on">Week</button><button type="button" data-period="30">Month</button></div>':'';

  var initManual=sessionStorage.getItem('standhf_manual_offline')==='1';
  var initOn=!initManual&&(typeof navigator!=='undefined'?navigator.onLine!==false:true);
  var initPillText='● '+(initOn?'Online':(initManual?'Offline (simulated)':'Offline'));
  var initPillClass='pill '+(initOn?'synced':'pending');
  var initPillTitle=initOn?'Connected to network · Click to simulate offline mode':'Offline mode active · Click to reconnect';

  host.className='app-header';
  host.innerHTML=
    '<div class="warn offline-bar" id="offBar" role="status" '+(initOn?'hidden':'')+'><i class="ms">cloud_off</i><span>You are offline. Changes are saved on this device and will sync when the connection returns.</span><button type="button" class="off-retry-btn" id="offRetry" title="Check connection">Check connection</button></div>'+
    '<header class="topbar">'+
      '<label class="search"><i class="ms">search</i><input id="search" type="search" placeholder="'+esc(ds.search||'Search')+'" autocomplete="off"></label>'+
      segment+
      '<button type="button" class="'+initPillClass+'" id="sync" role="button" aria-live="polite" title="'+initPillTitle+'"'+(ds.own!==undefined?' data-own="1"':'')+'>'+initPillText+'</button>'+
      '<div class="notify"><button type="button" class="bell" id="bell" aria-label="Notifications" title="Notifications"><i class="ms">notifications</i><span class="badge" id="bellCount" hidden>0</span></button><div class="notify-panel" id="notifyPanel" role="dialog" aria-label="Notifications" hidden></div></div>'+
      '<div class="profile-wrap">'+
        '<button type="button" class="avatar-btn'+(sess.role==='superadmin'?' role-super':'')+'" id="profBtn" aria-label="Profile" title="Profile" aria-expanded="false"><i class="ms">account_circle</i></button>'+
        '<div class="profile-panel" id="profPanel" role="dialog" aria-label="Profile" hidden>'+
          '<div class="pp-head"><span class="avatar pp-avatar" id="avatar" aria-hidden="true">'+esc(initials)+'</span><div class="pp-id"><b id="userName">'+esc(name)+'</b><small id="userRole">'+esc(roleLabel)+'</small></div></div>'+
          '<dl class="pp-list">'+
            '<div><dt>Username</dt><dd>'+esc(sess.username||'')+'</dd></div>'+
            '<div><dt>Sites</dt><dd>'+esc(scope)+'</dd></div>'+
          '</dl>'+
          '<button type="button" class="btn pp-out" id="bOut"><i class="ms">logout</i>Sign out</button>'+
        '</div>'+
      '</div>'+
    '</header>';

  /* Sign out ends the session on every page */
  document.getElementById('bOut').addEventListener('click',function(){
    try{sessionStorage.removeItem('standhf_auth')}catch(e){}
    location.href=root+'login/'});

  /* Profile: round icon opens the profile panel */
  var pp=document.getElementById('profPanel'), pb=document.getElementById('profBtn');
  pb.addEventListener('click',function(e){e.stopPropagation();pp.hidden=!pp.hidden;pb.setAttribute('aria-expanded',String(!pp.hidden))});
  document.addEventListener('click',function(e){if(!e.target.closest('.profile-wrap')){pp.hidden=true;pb.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){pp.hidden=true;pb.setAttribute('aria-expanded','false')}});

  /* Connection */
  var last=initOn;
  window.isStandhfOnline=function(){return last!==null?last:initOn};
  var isLocalHost=function(){
    try{
      return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname)||location.protocol==='file:';
    }catch(e){return true}
  };

  var probeNet=function(){
    if(sessionStorage.getItem('standhf_manual_offline')==='1')return Promise.resolve(false);
    if(typeof navigator!=='undefined'&&navigator.onLine===false)return Promise.resolve(false);
    var c=new AbortController(),t=setTimeout(function(){c.abort()},2500);
    var probeUrl=isLocalHost()?
      'https://www.google.com/generate_204':
      new URL(root+'assets/base.css',location.href);
    var fetchOpts=isLocalHost()?
      {method:'GET',mode:'no-cors',cache:'no-store',signal:c.signal}:
      {method:'HEAD',cache:'no-store',signal:c.signal};

    return fetch(probeUrl,fetchOpts)
      .then(function(){clearTimeout(t);return true})
      .catch(function(){clearTimeout(t);return false})};

  var applyNet=function(on,quiet){
    if(!quiet&&last===on)return;
    last=on;
    var bar=document.getElementById('offBar');
    if(bar)bar.hidden=on;
    var pill=document.getElementById('sync');
    if(pill&&!pill.dataset.own){
      var isManual=sessionStorage.getItem('standhf_manual_offline')==='1';
      pill.textContent='● '+(on?'Online':(isManual?'Offline (simulated)':'Offline'));
      pill.className='pill '+(on?'synced':'pending');
      pill.title=on?
        'Connected to network · Click to simulate offline mode':
        (isManual?'Offline simulation active · Click to reconnect':'Network offline · Click to retry connection');
      pill.setAttribute('aria-label',pill.title);
    }
    window.dispatchEvent(new CustomEvent('standhf:connection',{detail:{online:on,quiet:!!quiet}}))};

  var pillEl=document.getElementById('sync');
  if(pillEl&&!pillEl.dataset.own){
    pillEl.addEventListener('click',function(){
      var isManual=sessionStorage.getItem('standhf_manual_offline')==='1';
      if(isManual||!last){
        sessionStorage.removeItem('standhf_manual_offline');
        probeNet().then(function(on){applyNet(on,false)});
      }else{
        sessionStorage.setItem('standhf_manual_offline','1');
        applyNet(false,false);
      }
    });
  }

  var offRetry=document.getElementById('offRetry');
  if(offRetry){
    offRetry.addEventListener('click',function(){
      sessionStorage.removeItem('standhf_manual_offline');
      probeNet().then(function(on){applyNet(on,false)});
    });
  }

  window.addEventListener('online',function(){
    if(sessionStorage.getItem('standhf_manual_offline')!=='1'){
      probeNet().then(function(on){applyNet(on,false)});
    }
  });
  window.addEventListener('offline',function(){applyNet(false,false)});
  setInterval(function(){
    probeNet().then(function(on){applyNet(on,false)});
  },5000);
  probeNet().then(function(on){applyNet(on,true)});
  /* Notifications: the dummy list for this user, limited to the sites they may see */
  var ICON={deleted:'delete',due:'event',overdue:'warning',missing:'event_busy',admin:'person_add',info:'description'};
  var TAG={deleted:['bad','Deleted'],due:['info','Due'],overdue:['bad','Overdue'],missing:['np-warn','Missing'],admin:['info','Admin'],info:['good','Info']};
  var readKey='standhf_notes_read_'+(sess.username||'guest');
  var readSet=function(){try{return JSON.parse(localStorage.getItem(readKey)||'[]')}catch(e){return[]}};
  var writeRead=function(a){try{localStorage.setItem(readKey,JSON.stringify(a))}catch(e){}};
  var notesFor=function(){
    var all=((window.NOTIFICATIONS_DUMMY||{})[sess.username]||[]).concat(window.liveNotesFor?window.liveNotesFor(sess.username):[]);
    var allSites=(typeof can==='function')&&can('view_all_sites');
    var mine=(typeof mySites==='function')?mySites():[];
    return all.filter(function(n){return allSites||mine.indexOf(n.site)>=0})};
  var panel=document.getElementById('notifyPanel'), bell=document.getElementById('bell');
  var paintNotes=function(){
    var list=notesFor(), read=readSet();
    var unread=list.filter(function(n){return read.indexOf(n.id)<0}).length;
    var badge=document.getElementById('bellCount');
    badge.textContent=unread; badge.hidden=!unread;
    var rows=list.map(function(n){
      var isNew=read.indexOf(n.id)<0, t=TAG[n.type]||['info','Info'];
      return '<button type="button" class="np-item'+(isNew?' unread':'')+'" data-note="'+esc(n.id)+'">'+
        '<span class="np-ico np-'+esc(n.type)+'"><i class="ms">'+(ICON[n.type]||'notifications')+'</i></span>'+
        '<span class="np-body">'+
          '<span class="np-top"><b>'+esc(n.title)+'</b>'+(isNew?'<i class="np-dot" aria-label="Unread"></i>':'')+'</span>'+
          '<span class="np-text">'+esc(n.text)+'</span>'+
          '<span class="np-meta"><span class="tag '+t[0]+'">'+t[1]+'</span><span class="np-site">'+esc(n.site)+'</span><small>'+esc(n.time)+'</small></span>'+
        '</span></button>'}).join('');
    panel.innerHTML=
      '<div class="np-head"><b>Notifications</b>'+(unread?'<span class="tag info">'+unread+' new</span>':'')+
        (unread?'<button type="button" class="link np-all" id="notesAll">Mark all read</button>':'')+'</div>'+
      (list.length?rows:'<div class="np-empty"><i class="ms">notifications_none</i><span>No notifications for your sites.</span></div>');
  };
  var openNote=function(n){
    var url=root+(n.link.page==='admin'?'admin/index.html':'records/index.html');
    if(n.link.patient)url+='?patient='+encodeURIComponent(n.link.patient)+(n.link.tab?'&tab='+encodeURIComponent(n.link.tab):'');
    location.href=url};
  bell.addEventListener('click',function(e){e.stopPropagation();panel.hidden=!panel.hidden;if(!panel.hidden)paintNotes()});
  panel.addEventListener('click',function(e){
    var all=e.target.closest('#notesAll');
    if(all){var ids=notesFor().map(function(n){return n.id});writeRead(readSet().concat(ids.filter(function(i){return readSet().indexOf(i)<0})));paintNotes();return}
    var item=e.target.closest('[data-note]');
    if(!item)return;
    var n=notesFor().filter(function(x){return x.id===item.dataset.note})[0];
    if(!n)return;
    var r=readSet();if(r.indexOf(n.id)<0){r.push(n.id);writeRead(r)}
    paintNotes();
    openNote(n)});
  document.addEventListener('click',function(e){if(!e.target.closest('.notify'))panel.hidden=true});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')panel.hidden=true});
  paintNotes();

  /* Tablet: the search collapses to an icon and expands on tap */
  var sb=host.querySelector('.topbar .search'), si=document.getElementById('search');
  if(sb&&si){
    sb.addEventListener('click',function(){if(!sb.classList.contains('open')){sb.classList.add('open');si.focus()}});
    si.addEventListener('blur',function(){if(!si.value)sb.classList.remove('open')});
    si.addEventListener('keydown',function(e){if(e.key==='Escape'){si.value='';si.blur();sb.classList.remove('open')}});
  }
})();
