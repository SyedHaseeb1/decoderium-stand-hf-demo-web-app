/* Boot loader: fetches the app data (data/*.json) first, then runs the page's scripts in document order.
   Load this file once, before the data-dependent scripts. Those are written as placeholders:
     <script type="text/plain" data-src="access.js"></script>      a file in assets/ (path relative to assets/)
     <script type="text/plain">…page code…</script>               inline code (marked with data-inline)
   Each placeholder's attributes (for example data-root) are copied onto the script that runs it. */
(function(){
  var self=document.currentScript;
  var assetsUrl=new URL('.', self.src);
  var dataUrl=new URL('../data/', self.src);
  /* Simulated API wait (ms) so the shimmer stays visible after sign-in. It applies only to the first page
     loaded after sign-in (login sets standhf_fresh_login); moving between pages loads straight away.
     Set per page with data-api-delay on this script. Remove it when the real API calls are in. */
  var apiDelay=0;
  try{
    var attrDelay=self.getAttribute('data-api-delay');
    var alwaysDelay=self.getAttribute('data-api-delay-always');
    /* The shimmer shows the first time a screen opens in this session, and on the first screen after sign-in */
    var seenKey='standhf_seen_'+location.pathname;
    var fresh=sessionStorage.getItem('standhf_fresh_login')==='1';
    var firstTime=sessionStorage.getItem(seenKey)!=='1';
    if(alwaysDelay){
      apiDelay=parseInt(alwaysDelay,10)||0;
    } else if(attrDelay && (fresh || firstTime)){
      apiDelay=parseInt(attrDelay,10)||0;
    }
    sessionStorage.setItem(seenKey,'1');
    sessionStorage.removeItem('standhf_fresh_login');
  }catch(e){}
  /* Inside the app shell (app/index.html) the header and side menu belong to the shell, so a page skips its own */
  var embedded=false;
  try{ embedded=!!(window.top!==window && window.frameElement && window.frameElement.id==='view'); }catch(e){}
  if(embedded){
    document.documentElement.classList.add('embedded');
    /* Tabs inside a screen call standhfUpdateNav; nav.js is not loaded here, so hand the update to the shell */
    window.standhfUpdateNav=function(){
      try{ if(window.parent && window.parent.standhfShellSync) window.parent.standhfShellSync(); }catch(e){}
    };
    /* Shell signals: "waiting" while this screen waits for its data, "ready" once it has drawn it and painted */
    var shellSignal=function(name){ try{ if(window.parent && window.parent[name]) window.parent[name](); }catch(e){} };
    var shellReady=function(){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ shellSignal('standhfShellReady'); }); }); };
    if(apiDelay>0) shellSignal('standhfShellWaiting');
    /* Dropdowns in the screen: opening one closes the others (nav.js does this only outside the shell) */
    document.addEventListener('pointerdown',function(e){
      var t=e.target;
      document.querySelectorAll('.cb-list:not([hidden])').forEach(function(ul){
        var wrap=ul.closest('.cb');
        if(wrap&&wrap.contains(t))return;
        if(typeof window.cbClose==='function'&&wrap)window.cbClose(wrap);else ul.hidden=true;
      });
      document.querySelectorAll('.sort-menu:not([hidden])').forEach(function(el){
        if(t.closest&&t.closest('.list-sort,.sort-menu'))return;
        el.hidden=true;
      });
    },{capture:true,passive:true});
    /* The shell's theme button saves the choice; apply it to this screen straight away */
    window.addEventListener('storage',function(e){
      if(e.key!=='standhf_theme') return;
      if(e.newValue==='logo') document.documentElement.setAttribute('data-theme','logo');
      else document.documentElement.removeAttribute('data-theme');
    });
    /* A dialog opened in the frame dims the whole shell (header and menu too), not only the frame */
    var shellDim=function(count){ try{ if(window.parent && window.parent.standhfShellDim) window.parent.standhfShellDim(count); }catch(e){} };
    var syncDim=function(){
      var count=document.querySelectorAll('dialog[open]').length;
      shellDim(count);
    };
    if(window.HTMLDialogElement){
      var openModal=HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal=function(){
        openModal.apply(this,arguments);
        syncDim();
      };
      var closeModal=HTMLDialogElement.prototype.close;
      HTMLDialogElement.prototype.close=function(){
        closeModal.apply(this,arguments);
        setTimeout(syncDim, 0);
      };
    }
    document.addEventListener('close',function(e){
      if(e.target && e.target.tagName==='DIALOG'){ setTimeout(syncDim, 0); }
    },true);
    document.addEventListener('cancel',function(e){
      if(e.target && e.target.tagName==='DIALOG'){ setTimeout(syncDim, 0); }
    },true);
  }

  var fetchJson=function(name){
    return fetch(new URL(name+'.json', dataUrl)).then(function(r){
      if(!r.ok) throw new Error(name+'.json '+r.status);
      return r.json();
    });
  };

  /* Data failed to load: send the user to the error page, which keeps their place (?from=) and has a Try again button.
     location.replace keeps the failed page out of the history, so Back does not return to it. */
  var showError=function(err){
    var here=location.pathname+location.search+location.hash;
    var u = new URL('../error/?from='+encodeURIComponent(here), assetsUrl);
    if(err && err.message) u.searchParams.set('msg', err.message);
    if(!navigator.onLine) u.searchParams.set('code', 'offline');
    location.replace(u.href);
  };

  /* Runs one placeholder. Files load in order (async=false), inline code runs at once. */
  var runNode=function(n){
    if(embedded && n.hasAttribute('data-src') && /(^|\/)(header|nav)\.js/.test(n.getAttribute('data-src'))){
      return Promise.resolve();
    }
    var s=document.createElement('script');
    [].slice.call(n.attributes).forEach(function(a){
      if(a.name!=='type' && a.name!=='data-src') s.setAttribute(a.name,a.value);
    });
    if(n.hasAttribute('data-src')){
      return new Promise(function(resolve,reject){
        s.onload=function(){resolve()};
        s.onerror=function(){reject(new Error('Failed to load '+n.getAttribute('data-src')))};
        s.async=false;
        s.src=new URL(n.getAttribute('data-src'), assetsUrl).href;
        document.body.appendChild(s);
      });
    }
    s.textContent=n.textContent;
    document.body.appendChild(s);
    return Promise.resolve();
  };

  var ready=new Promise(function(resolve){
    if(document.readyState!=='loading') resolve();
    else document.addEventListener('DOMContentLoaded',function(){resolve()});
  });

  Promise.all([ready, Promise.all([
    fetchJson('access-control'),
    fetchJson('users'),
    fetchJson('gdmt'),
    fetchJson('clinical-options'),
    fetchJson('location-and-title-standards'),
    fetchJson('demo-names')
  ])]).then(function(res){
    var d=res[1];
    window.STANDHF_DATA={accessControl:d[0], users:d[1], gdmt:d[2], clinicalOptions:d[3], locationStandards:d[4], demoNames:d[5]};
    return new Promise(function(resolve){ setTimeout(resolve, apiDelay); }).then(function(){
      if(embedded){ /* the shell draws the header and menu, so drop this page's placeholders for them */
        ['side','app-header'].forEach(function(id){ var el=document.getElementById(id); if(el) el.innerHTML=''; });
      }
      var nodes=[].slice.call(document.querySelectorAll('script[type="text/plain"]'));
      return nodes.reduce(function(p,n){return p.then(function(){return runNode(n)})},Promise.resolve());
    }).then(function(){ if(embedded) shellReady(); });
  }).catch(function(e){
    console.error('[boot]',e);
    showError(e);
  });
})();
