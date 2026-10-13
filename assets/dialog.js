/* Shared dialog for confirmations and alerts.
   appDialog.confirm({ title, message, items, icon, tone, confirmText, cancelText }) -> Promise<boolean>   (items: optional bullet list)
   appDialog.alert({ title, message, icon, tone, confirmText })              -> Promise<true>
   tone: "neutral" | "info" | "warning" | "danger"  (danger colours the confirm button red) */
(function(){
  var dlg=null;
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var ensure=function(){
    if(!dlg){dlg=document.createElement('dialog');dlg.className='app-dialog';dlg.setAttribute('aria-modal','true');document.body.appendChild(dlg)}
    return dlg};
  var open=function(o,kind){
    return new Promise(function(resolve){
      var d=ensure(), tone=o.tone||'neutral', done=false;
      var okClass=tone==='danger'?'ad-ok danger':'ad-ok pri';
      var okText=o.confirmText||(kind==='alert'?'OK':'Confirm');
      var labelled='ad-title-'+Date.now();
      d.setAttribute('aria-labelledby',labelled);
      d.innerHTML=
        '<div class="ad-body">'+
          '<span class="ad-icon ad-'+tone+'"><i class="ms">'+esc(o.icon||(tone==='danger'?'warning':'info'))+'</i></span>'+
          '<div class="ad-text"><b class="ad-title" id="'+labelled+'">'+esc(o.title||'')+'</b>'+
            (o.message?'<p class="ad-msg">'+esc(o.message)+'</p>':'')+
            (o.items&&o.items.length?'<ul class="ad-list">'+o.items.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ul>':'')+'</div>'+
        '</div>'+
        '<div class="ad-actions">'+
          (kind==='confirm'?'<button type="button" class="ad-cancel" data-r="0">'+esc(o.cancelText||'Cancel')+'</button>':'')+
          '<button type="button" class="'+okClass+'" data-r="1">'+esc(okText)+'</button>'+
        '</div>';
      var finish=function(v){if(done)return;done=true;if(d.open)d.close();resolve(v)};
      d.onclick=function(e){
        var b=e.target.closest('[data-r]');
        if(b){finish(b.dataset.r==='1');return}
        if(e.target===d)finish(kind==='alert');};
      d.oncancel=function(e){e.preventDefault();finish(kind==='alert')};
      d.onclose=function(){finish(kind==='alert')};
      d.showModal();
      d.querySelector('.ad-ok').focus();
    })};
  window.appDialog={
    confirm:function(o){return open(o||{},'confirm')},
    alert:function(o){return open(o||{},'alert')}};
})();

/* Sign out, used by every sign-out button. Asks first, and warns when records are not synced yet. */
window.standhfSignOut=function(loginUrl){
  var pending=0;
  try{
    var d=JSON.parse(localStorage.getItem('standhf_ecrf_v1')||'null');
    if(d&&Array.isArray(d.pts))pending=d.pts.filter(function(p){return p&&p.sync==='Pending'}).length;
  }catch(e){}
  window.appDialog.confirm({
    tone:pending?'warning':'neutral',
    icon:pending?'cloud_off':'logout',
    title:'Sign out of STAND-HF?',
    message:pending?'Records that are not synced yet stay saved on this device.':'You will need to sign in again to continue.',
    items:pending?[pending+(pending>1?' records are':' record is')+' not synced yet']:[],
    confirmText:'Sign out',
    cancelText:'Stay signed in'
  }).then(function(ok){
    if(!ok)return;
    try{sessionStorage.removeItem('standhf_auth')}catch(e){}
    location.replace(loginUrl);
  });
};
