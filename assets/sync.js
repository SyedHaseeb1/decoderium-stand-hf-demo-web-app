/* App-level offline queue and auto-sync. Loaded on every page that shows the header, so the queue
   flushes wherever the user is in the app. The queue lives in localStorage, so it survives reloads
   and is shared by every open tab and frame.
   Records stay in the registry store (standhf_ecrf_v1); a record is Pending while its id is in the queue.
   Events: "standhf:queue" (a record was queued) and "standhf:sync" (queue flushed, detail: { count }). */
var StandhfSync=(function(){
  var STORE_KEY='standhf_ecrf_v1';
  var QUEUE_KEY='standhf_sync_queue_v1';
  var NOTICE_KEY='standhf_sync_notice_v1';

  /* Shows a message on whichever page the user is on. Uses the page's #snack when it has one */
  var toast=function(msg){
    /* Inside the shell the shell's own toast is shown, so an embedded page stays quiet and the message appears once */
    if(window.top!==window)return;
    var el=document.getElementById('snack');
    if(!el){
      el=document.createElement('div');
      el.id='snack';el.className='snack';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
      document.body.appendChild(el);
    }
    el.textContent=msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t=setTimeout(function(){el.classList.remove('show')},2600);
  };
  var syncMessage=function(n){return 'Back online: '+n+' record'+(n>1?'s':'')+' synced'};
  /* Tells this window and, through the notice key, every other open tab and frame */
  var notifySynced=function(n){
    window.dispatchEvent(new CustomEvent('standhf:sync',{detail:{count:n}}));
    toast(syncMessage(n));
    writeJSON(NOTICE_KEY,{count:n,t:Date.now()});
  };

  var readJSON=function(key,fallback){
    try{var v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v}catch(e){return fallback}
  };
  var writeJSON=function(key,value){
    try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}
  };
  var queue=function(){var q=readJSON(QUEUE_KEY,[]);return Array.isArray(q)?q:[]};
  var store=function(){return readJSON(STORE_KEY,null)};

  /* Offline when the simulate toggle is on, the browser reports no network, or the header's last probe failed */
  var offline=function(){
    if(sessionStorage.getItem('standhf_manual_offline')==='1')return true;
    /* The header's real connectivity check decides; navigator.onLine is only a fallback on pages without the header */
    if(typeof window.isStandhfOnline==='function')return !window.isStandhfOnline();
    return typeof navigator!=='undefined'&&navigator.onLine===false;
  };

  var isPending=function(pid){return queue().some(function(q){return q.pid===pid})};

  /* Queue a record that was changed while offline. One entry per record; the first change time is kept */
  var enqueue=function(pid,change){
    var q=queue();
    var item=q.find(function(x){return x.pid===pid});
    if(item)item.t=Date.now();   /* a new change while a send is in flight must stay queued after that send */
    else q.push({pid:pid,change:change||'edit',t:Date.now()});
    writeJSON(QUEUE_KEY,q);
    var s=store();
    if(s&&Array.isArray(s.pts)){
      s.pts.forEach(function(p){if(p&&p.id===pid)p.sync='Pending'});
      writeJSON(STORE_KEY,s);
    }
    window.dispatchEvent(new CustomEvent('standhf:queue',{detail:{pid:pid}}));
  };

  /* The queue is the only source of Pending. A record the store marks Pending but the queue does not know
     (seeded or restored data) joins the queue, so it syncs with the rest instead of staying Pending forever */
  var reconcile=function(){
    var s=store();
    if(!s||!Array.isArray(s.pts))return;
    var q=queue(),known={};
    q.forEach(function(x){known[x.pid]=true});
    var added=false;
    s.pts.forEach(function(p){
      if(p&&p.sync==='Pending'&&!known[p.id]){q.push({pid:p.id,change:'restored',t:Date.now()});known[p.id]=true;added=true}
    });
    if(added)writeJSON(QUEUE_KEY,q);
  };

  /* Where one queued record is sent. Today the registry is in this browser, so the default only confirms the save.
     When the API exists, replace it with a function that sends one record and resolves on success or rejects on failure. */
  var transport=function(pid){return Promise.resolve(pid)};
  var setTransport=function(fn){transport=fn};

  /* Remove sent entries and mark their records Synced. An entry changed again during the send (newer t) stays queued */
  var commit=function(sent){
    var done={};sent.forEach(function(x){done[x.pid]=x.t});
    writeJSON(QUEUE_KEY,queue().filter(function(x){return done[x.pid]!==x.t}));
    var s=store();
    if(s&&Array.isArray(s.pts)){
      s.pts.forEach(function(p){if(p&&done[p.id]!==undefined&&!isPending(p.id))p.sync='Synced'});
      writeJSON(STORE_KEY,s);
    }
  };

  /* Send the queue one record at a time. A failed record stays queued and is retried on the next cycle.
     Only one run at a time, so the timer and the connection event cannot send the same record twice */
  var busy=false;
  var flush=function(){
    if(busy)return Promise.resolve(0);
    reconcile();
    var q=queue();
    if(!q.length||offline())return Promise.resolve(0);
    busy=true;
    var sent=[];
    return q.reduce(function(chain,item){
      return chain.then(function(){
        return Promise.resolve().then(function(){return transport(item.pid)}).then(function(){sent.push(item)},function(){});
      });
    },Promise.resolve()).then(function(){
      busy=false;
      if(!sent.length)return 0;
      commit(sent);
      notifySynced(sent.length);
      return sent.length;
    });
  };

  window.addEventListener('online',function(){setTimeout(flush,1500)});
  /* Every page shows connection changes and sync results, wherever the user is */
  window.addEventListener('standhf:connection',function(e){
    var d=e.detail||{};
    if(!d.online){if(!d.quiet)toast('Offline: changes are saved on this device');return}
    var started=Date.now();
    flush();
    /* Say "Back online" only when no sync result was shown for this reconnect, so the user sees one message */
    setTimeout(function(){
      var n=readJSON(NOTICE_KEY,null);
      if(!d.quiet&&!(n&&n.t>=started-100))toast('Back online');
    },400);
  });
  /* Another tab or frame changed the queue, the store or a sync result: refresh this page and show the result */
  window.addEventListener('storage',function(e){
    if(e.key===QUEUE_KEY||e.key===STORE_KEY)window.dispatchEvent(new CustomEvent('standhf:queue',{detail:{}}));
    if(e.key===NOTICE_KEY){var n=readJSON(NOTICE_KEY,null);if(n&&n.count)toast(syncMessage(n.count))}
  });
  /* Timer as a backstop, so a missed connection event cannot leave records Pending */
  setInterval(flush,3000);

  reconcile();
  return {offline:offline,enqueue:enqueue,flush:flush,setTransport:setTransport,isPending:isPending,queued:queue,
    pendingCount:function(){return queue().length}};
})();
