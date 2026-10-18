/* Shared app header. Every page places <div id="app-header" data-page="…"> and loads this file
   after access.js and before nav.js. Items and data follow the signed-in user and the access rules.
   Attributes on the placeholder:
     data-search   placeholder text for the search box
     data-timeline present on pages that show the Today / Week / Month selector (named so it does not match [data-period] buttons)
     data-own      present on pages that show their own sync status in the pill
   Connection: the header shows the offline bar and the Online/Offline pill, and announces changes
   with the "standhf:connection" event (detail: { online, quiet }). */
var HEADER_SRC=document.currentScript&&document.currentScript.src;
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
  /* Time period selector (Today / Week / Month) hidden as requested — default shows all-time data */
  /*
  var segment=ds.timeline!==undefined?
    '<div class="segment" role="group" aria-label="Period"><button type="button" data-period="1">Today</button><button type="button" data-period="7" class="on">Week</button><button type="button" data-period="30">Month</button></div>':'';
  */
  var segment='';

  /* Theme handling: force Logo Theme */
  document.documentElement.setAttribute('data-theme', 'logo');

  var initManual=sessionStorage.getItem('standhf_manual_offline')==='1';
  var initOn=!initManual&&(typeof navigator!=='undefined'?navigator.onLine!==false:true);
  var initPillText='● '+(initOn?'Online':(initManual?'Offline (simulated)':'Offline'));
  var initPillClass='pill '+(initOn?'synced':'pending');
  var initPillTitle=initOn?'Connected to network · Click to simulate offline mode':'Offline mode active · Click to reconnect';

  host.className='app-header';
  host.innerHTML=
    '<div class="warn offline-bar" id="offBar" role="status" '+(initOn?'hidden':'')+'><i class="ms">cloud_off</i><span>You are offline. Changes are saved on this device and will sync when the connection returns.</span><button type="button" class="off-retry-btn" id="offRetry" title="Check connection">Check connection</button></div>'+
    '<header class="topbar">'+
      (ds.search ? '<label class="search"><i class="ms">search</i><input id="search" type="search" placeholder="'+esc(ds.search)+'" autocomplete="off" maxlength="70"></label>' : '')+
      segment+
      '<button type="button" class="'+initPillClass+'" id="sync" role="button" aria-live="polite" title="'+initPillTitle+'"'+(ds.own!==undefined?' data-own="1"':'')+'>'+initPillText+'</button>'+
      '<div class="notify"><button type="button" class="bell" id="bell" aria-label="Notifications" title="Notifications"><i class="ms">notifications</i><span class="badge" id="bellCount" hidden>0</span></button><div class="notify-panel" id="notifyPanel" role="dialog" aria-label="Notifications" hidden></div></div>'+
      '<div class="profile-wrap">'+
        '<button type="button" class="avatar-btn'+(sess.role==='superadmin'?' role-super':'')+'" id="profBtn" aria-label="Profile" title="Profile" aria-expanded="false">'+
          (user && user.avatar ? '<img src="'+esc(user.avatar)+'" alt="Avatar" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;aspect-ratio:1/1">' : '<i class="ms">account_circle</i>')+
        '</button>'+
        '<div class="profile-panel" id="profPanel" role="dialog" aria-label="Profile" hidden>'+
          '<div class="pp-head"><span class="avatar pp-avatar" id="avatar" aria-hidden="true">'+
            (user && user.avatar ? '<img src="'+esc(user.avatar)+'" alt="Avatar" class="avatar-img" style="width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;aspect-ratio:1/1">' : esc(initials))+
          '</span><div class="pp-id"><b id="userName">'+esc(name)+'</b><small id="userRole">'+esc(roleLabel)+'</small></div></div>'+
          '<dl class="pp-list">'+
            (user && (user.email || (user.personal && user.personal.email)) ? '<div><dt>Email</dt><dd>'+esc(user.email || user.personal.email)+'</dd></div>' : '')+
            (sess.username ? '<div><dt>Username</dt><dd>'+esc(sess.username)+'</dd></div>' : '')+
            '<div><dt>Sites</dt><dd>'+esc(scope)+'</dd></div>'+
          '</dl>'+
          '<a href="'+root+'setup/" class="btn" style="width:100%;justify-content:center;margin-bottom:8px;font-size:13px;gap:6px"><i class="ms" style="font-size:18px">manage_accounts</i>Edit Profile &amp; Password</a>'+
          '<button type="button" class="btn pp-out" id="bOut"><i class="ms">logout</i>Sign out</button>'+
        '</div>'+
      '</div>'+
    '</header>';

  /* Sign out ends the session on every page */
  document.getElementById('bOut').addEventListener('click',function(){
    window.standhfSignOut(root+'login/')});

  /* Profile: round icon opens the profile panel */
  var pp=document.getElementById('profPanel'), pb=document.getElementById('profBtn');
  pb.addEventListener('click',function(e){e.stopPropagation();pp.hidden=!pp.hidden;pb.setAttribute('aria-expanded',String(!pp.hidden))});
  document.addEventListener('pointerdown',function(e){
    if(!pp.hidden && !e.target.closest('.profile-wrap')){
        pp.hidden=true;
        pb.setAttribute('aria-expanded','false');
    }
  }, true);
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
  },15000);
  probeNet().then(function(on){applyNet(on,true)});
  /* Notifications: the dummy list for this user, limited to the sites they may see */
  var ICON={deleted:'delete',due:'event',overdue:'warning',missing:'event_busy',admin:'person_add',info:'description'};
  var TAG={deleted:['bad','Deleted'],due:['info','Due'],overdue:['bad','Overdue'],missing:['np-warn','Missing'],admin:['info','Admin'],info:['good','Info']};
  var readKey='standhf_notes_read_'+(sess.username||'guest');
  var readSet=function(){try{return JSON.parse(localStorage.getItem(readKey)||'[]')}catch(e){return[]}};
  var writeRead=function(a){try{localStorage.setItem(readKey,JSON.stringify(a))}catch(e){}};
  var notesFor=function(){
    var all=((dummyNotes||{})[sess.username]||[]).concat(window.liveNotesFor?window.liveNotesFor(sess.username):[]);
    var allSites=(typeof can==='function')&&can('view_all_sites');
    var mine=(typeof mySites==='function')?mySites():[];
    return all.filter(function(n){return allSites||mine.indexOf(n.site)>=0})};
  /* Demo notifications per user: loaded from data/notifications.json, then the bell is repainted */
  var dummyNotes={};
  if(HEADER_SRC)fetch(new URL('../data/notifications.json', HEADER_SRC)).then(function(r){return r.ok?r.json():{}}).then(function(d){dummyNotes=d||{};if(typeof paintNotes==='function')paintNotes()}).catch(function(){});
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
      (list.length > 2 ?
        '<div style="padding:6px 12px 8px 12px;border-bottom:1px solid var(--border)">'+
          '<label class="search" style="margin:0;width:100%;max-width:none;padding:4px 8px;min-height:30px;background:var(--soft);border:1.5px solid transparent;display:flex;align-items:center;gap:6px;border-radius:8px;transition:all 0.2s ease">'+
            '<i class="ms" style="font-size:16px;color:var(--ink-2)">search</i>'+
            '<input id="notifySearchInput" type="search" placeholder="Search alerts or site updates..." autocomplete="off" maxlength="70" style="font-size:12px;border:none;background:transparent;outline:none;width:100%;color:var(--ink)">'+
          '</label>'+
        '</div>' : '')+
      '<div id="npItemsWrap">'+(list.length?rows:'<div class="np-empty"><i class="ms">notifications_none</i><span>No notifications for your sites.</span></div>')+'</div>';
  };
  var openNote=function(n){
    var url=root+(n.link.page==='admin'?'admin/index.html':'records/index.html');
    if(n.link.patient)url+='?patient='+encodeURIComponent(n.link.patient)+(n.link.tab?'&tab='+encodeURIComponent(n.link.tab):'');
    location.href=url;
  };
  bell.addEventListener('click',function(e){e.stopPropagation();panel.hidden=!panel.hidden;if(!panel.hidden)paintNotes()});
  window.addEventListener('standhf_threshold_changed',function(){if(typeof paintNotes==='function')paintNotes()});
  window.addEventListener('storage',function(e){if(e.key==='standhf_followup_threshold_days'||e.key==='standhf_ecrf_v1'){if(typeof paintNotes==='function')paintNotes()}});
  panel.addEventListener('input',function(e){
    if(e.target&&e.target.id==='notifySearchInput'){
      var q=e.target.value.toLowerCase().trim();
      panel.querySelectorAll('.np-item').forEach(function(el){
        var match=!q||el.textContent.toLowerCase().includes(q);
        el.style.display=match?'':'none';
      });
    }
  });
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
  document.addEventListener('pointerdown',function(e){
    if(!panel.hidden && !e.target.closest('.notify')){
        panel.hidden=true;
    }
  }, true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')panel.hidden=true});
  paintNotes();

  /* Universal Expandable Search Component Handler (Doctor UX) */
  document.addEventListener('click', function(e){
    var icon = e.target.closest('.search-expandable .search-icon');
    if(icon){
      var wrap = icon.closest('.search-expandable');
      if(wrap){
        var inp = wrap.querySelector('input[type="search"]');
        if(wrap.classList.contains('is-expanded') && (!inp || !inp.value.trim())){
          wrap.classList.remove('is-expanded');
          if(inp) inp.blur();
          return;
        }
        if(inp){
          wrap.classList.add('is-expanded');
          inp.focus();
        }
      }
      return;
    }

    var clr = e.target.closest('.search-expandable .search-clear');
    if(clr){
      var wrap = clr.closest('.search-expandable');
      if(wrap){
        var inp = wrap.querySelector('input[type="search"]');
        if(inp){
          var wasEmpty = !inp.value.trim();
          inp.value = '';
          wrap.classList.remove('has-value');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          if(wasEmpty){
            wrap.classList.remove('is-expanded');
            inp.blur();
          } else {
            inp.focus();
          }
        }
      }
      return;
    }

    document.querySelectorAll('.search-expandable.is-expanded').forEach(function(wrap){
      if(!wrap.contains(e.target)){
        var inp = wrap.querySelector('input[type="search"]');
        if(inp && !inp.value.trim()){
          wrap.classList.remove('is-expanded');
          wrap.classList.remove('has-value');
        }
      }
    });
  });

  document.addEventListener('input', function(e){
    if(e.target && e.target.matches && e.target.matches('.search-expandable input[type="search"]')){
      var wrap = e.target.closest('.search-expandable');
      if(wrap){
        wrap.classList.toggle('has-value', !!e.target.value.trim());
        wrap.classList.add('is-expanded');
      }
    }
  }, true);

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && e.target && e.target.matches && e.target.matches('.search-expandable input[type="search"]')){
      var wrap = e.target.closest('.search-expandable');
      if(wrap){
        if(e.target.value){
          e.target.value = '';
          wrap.classList.remove('has-value');
          e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        wrap.classList.remove('is-expanded');
        e.target.blur();
      }
    }
  });
})();
