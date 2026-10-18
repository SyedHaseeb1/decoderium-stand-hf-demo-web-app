/* "What's new" for the client demo. Shown on the sign-in page.
   To announce a new change: edit data/whatsnew.json and change its version.
   The checkbox "Don't show until the next change" hides it until VERSION changes. */
(function(){
  var KEY='standhf_whatsnew_hidden';
  var src=document.currentScript&&document.currentScript.src;
  /* Date, version and the list of changes live in data/whatsnew.json */
  function show(data){
  var DATE=data.date, VERSION=data.version, CONTENT=data.content;  /* DATE: shown to the client. VERSION: changes whenever the list changes, so the alert returns */
  var seen=function(){try{return localStorage.getItem(KEY)===VERSION}catch(e){return false}};
  var remember=function(v){try{if(v)localStorage.setItem(KEY,VERSION);else localStorage.removeItem(KEY)}catch(e){}};
  if(seen())return;
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var wrap=document.createElement('div');
  wrap.className='whatsnew';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-modal','true');
  wrap.setAttribute('aria-labelledby','wnTitle');
  wrap.innerHTML=
    '<div class="wn-card">'+
      '<div class="wn-head"><h2 id="wnTitle">What\'s new in this demo</h2><small>Changes as of '+esc(DATE)+'</small></div>'+
      '<div class="wn-body">'+CONTENT.map(function(g){
        return '<section class="wn-group"><h3>'+esc(g.cat)+'</h3><ul>'+g.items.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ul></section>';
      }).join('')+'</div>'+
      '<div class="wn-foot">'+
        '<label class="wn-check"><input type="checkbox" id="wnHide"><span>Don\'t show until the next change</span></label>'+
        '<button type="button" class="btn primary" id="wnGo">Continue to sign in</button>'+
      '</div>'+
    '</div>';
  document.body.appendChild(wrap);
  document.getElementById('wnGo').addEventListener('click',function(){
    remember(document.getElementById('wnHide').checked);
    wrap.remove();
  });
  document.getElementById('wnGo').focus();
  }
  if(!src)return;
  fetch(new URL('../data/whatsnew.json', src)).then(function(r){return r.ok?r.json():null}).then(function(d){if(d)show(d)}).catch(function(){});
})();
