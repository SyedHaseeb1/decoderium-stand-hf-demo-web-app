/* "What's new" for the client demo. Shown on the sign-in page.
   To announce a new change: edit CONTENT and change VERSION.
   The checkbox "Don't show until the next change" hides it until VERSION changes. */
(function(){
  var DATE='2026-10-13';          /* the date these changes were made (shown to the client) */
  var VERSION='2026-10-13-b';     /* changes whenever the list changes, so the alert returns */
  var KEY='standhf_whatsnew_hidden';
  var CONTENT=[
    {cat:'Sign-in', items:[
      'Full-screen sign-in with the photo background and the STAND-HF logo',
      'Fits tablets and phones, and keeps the field you type in visible when the keyboard opens',
      'Remember my username, and a Forgot your password link',
      'Sponsor links on the sign-in page'
    ]},
    {cat:'Patient records', items:[
      'Sync capsule beside the page title: yellow while records wait to sync, then a toast when all are synced',
      'Patient name and contact number are required on the participant form',
      'Prescription upload on all three visits (Baseline, 3 months, 6 months): PDF, JPG or PNG, up to 5 files and 10 MB each',
      'Uploaded prescriptions are shown in the patient summary',
      'GDMT: the daily dose is now a dropdown for each drug, instead of free text',
      'Load demo: 44 patients split between the investigators, with full data, prescriptions and audit history',
      'Investigators can use Load demo and Clear all',
      'Patient list collapses and expands smoothly',
      'Confirmation dialogs for Delete record, Remove file and Clear all'
    ]},
    {cat:'Dashboards and admin', items:[
      'Super Admin: Performance by team with an Access column, and each investigator name opens their profile',
      'Investigator profile: each site investigator\'s own patients, overdue follow-ups and recent activity',
      'CSV export for each site investigator, and a summary of all investigators',
      'Super Admin: Export all patients, one row per visit across all sites',
      'Compact top stat cards, with the Pending sync card moved to the records header',
    ]},
    {cat:'Header and navigation', items:[
      'Round profile icon with a panel: name, role, username, sites and Sign out',
      'Super Admin profile icon has a black ring',
      'Search collapses to an icon on tablets and expands on tap',
      'Central loader on the app pages, and smaller logos in the side navigation'
    ]},
    {cat:'Installable app', items:[
      'Favicon and app icons',
      'Web app manifest and service worker, so the app can be installed to the home screen (install needs HTTPS)'
    ]}
  ];
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
})();
