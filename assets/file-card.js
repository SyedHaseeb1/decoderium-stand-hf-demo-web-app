/* File card component: one look for every uploaded file (visit uploads, summary, anywhere).
   FileCard.html(file, { size: "sm" | "", onRemove: true|false })  -> markup
   FileCard.list(files, options)                                     -> markup for several files
   FileCard.fillThumbs(root)                                         -> loads image thumbnails from the file store
   Click handling: data-a="view" opens the file, data-a="remove" removes it (handled by the page). */
(function(){
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var sizeTxt=function(b){return b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB'};
  var html=function(f,o){
    o=o||{};
    var pdf=f.type==='application/pdf';
    var attrs=' data-fid="'+esc(f.id)+'" data-ct="'+esc(f.type)+'" data-name="'+esc(f.name)+'"';
    return '<div class="file-card'+(o.size==='sm'?' sm':'')+'">'+
      '<div class="file-card-media" data-thumb="'+esc(f.id)+'" data-ct="'+esc(f.type)+'" data-a="view"'+attrs+'><i class="ms">'+(pdf?'picture_as_pdf':'image')+'</i></div>'+
      '<div class="file-card-body"><button type="button" class="file-card-name" data-a="view"'+attrs+'>'+esc(f.name)+'</button>'+
        '<span class="file-card-meta">'+sizeTxt(f.size||0)+' · '+esc(f.at||'')+'</span></div>'+
      (o.onRemove?'<button type="button" class="file-card-del" data-a="remove" data-fid="'+esc(f.id)+'" aria-label="Remove '+esc(f.name)+'" title="Remove file"><i class="ms">close</i></button>':'')+
    '</div>'};
  var fillThumbs=function(root){
    (root||document).querySelectorAll('[data-thumb]').forEach(async function(el){
      if(el.dataset.ct==='application/pdf'||el.querySelector('img'))return;
      try{var b=await (window.getFile?window.getFile(el.dataset.thumb):null);if(!b)return;
        el.innerHTML='<img alt="" src="'+URL.createObjectURL(b)+'">'}catch(e){}})};
  window.FileCard={
    html:html,
    list:function(files,o){return (files||[]).map(function(f){return html(f,o)}).join('')},
    fillThumbs:fillThumbs,
    sizeTxt:sizeTxt};
})();
