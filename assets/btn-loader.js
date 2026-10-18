/* Button loader: shows a spinner inside a button while an action is pending.
   btnWait(btn, ms, done) keeps the button busy for ms, then calls done().
   btnStop(btn) clears the busy state (e.g. when the action fails).
   btnRun(btn, task) runs task() while the button is busy and always clears it, even on error.
   apiWait(ms) resolves after ms, to simulate server latency until real API calls exist. */
(function(){
  window.btnWait = function(btn, ms, done){
    if(!btn){ if(done) done(); return; }
    btn.classList.add('is-loading');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    if(!btn.querySelector('.btn-spinner')) btn.insertAdjacentHTML('afterbegin', '<span class="btn-spinner" aria-hidden="true"></span>');
    setTimeout(function(){ if(done) done(); }, ms);
  };
  window.btnStop = function(btn){
    if(!btn) return;
    btn.classList.remove('is-loading');
    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    var s = btn.querySelector('.btn-spinner');
    if(s) s.remove();
  };
  /* btnRun(btn, task): busy while task() runs; always clears the button, even if task() throws */
  window.btnRun = async function(btn, task){
    if(btn){
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if(!btn.querySelector('.btn-spinner')) btn.insertAdjacentHTML('afterbegin', '<span class="btn-spinner" aria-hidden="true"></span>');
    }
    try { return await task(); }
    finally { window.btnStop(btn); }
  };
  window.apiWait = function(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); };
})();
