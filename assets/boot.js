/* Boot loader: fetches the app data (data/*.json) first, then runs the page's scripts in document order.
   Load this file once, before the data-dependent scripts. Those are written as placeholders:
     <script type="text/plain" data-src="access.js"></script>      a file in assets/ (path relative to assets/)
     <script type="text/plain">…page code…</script>               inline code (marked with data-inline)
   Each placeholder's attributes (for example data-root) are copied onto the script that runs it. */
(function(){
  var self=document.currentScript;
  var assetsUrl=new URL('.', self.src);
  var dataUrl=new URL('../data/', self.src);

  var fetchJson=function(name){
    return fetch(new URL(name+'.json', dataUrl)).then(function(r){
      if(!r.ok) throw new Error(name+'.json '+r.status);
      return r.json();
    });
  };

  var showError=function(){
    var box=document.createElement('div');
    box.setAttribute('role','alert');
    box.style.cssText='position:fixed;left:16px;right:16px;top:16px;z-index:10000;padding:14px 16px;border-radius:12px;background:#b3261e;color:#fff;font:500 14px/1.4 Roboto,sans-serif;text-align:center';
    box.textContent='Could not load the app data. Check your connection and refresh the page.';
    document.body.appendChild(box);
  };

  /* Runs one placeholder. Files load in order (async=false), inline code runs at once. */
  var runNode=function(n){
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
    var nodes=[].slice.call(document.querySelectorAll('script[type="text/plain"]'));
    return nodes.reduce(function(p,n){return p.then(function(){return runNode(n)})},Promise.resolve());
  }).catch(function(e){
    console.error('[boot]',e);
    showError();
  });
})();
