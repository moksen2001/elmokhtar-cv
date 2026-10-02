# Phones: testimonials become a swipeable carousel (one card per author, dots synced), no autoplay.
# Idempotent; run after enhance12.py.
import re
CSS = r"""<style id="enh13">
@media (max-width:760px){
  #temoignages .voices .who{display:none}
  #temoignages .voices>*{min-width:0}
  #temoignages .stage{width:100%;min-width:0;background:none!important;border:0!important;box-shadow:none!important;padding:0!important;overflow:visible;transform:none!important}
  #temoignages .stage .q{display:none}
  #temoignages .panels{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin-inline:-20px;padding:4px 20px 6px;
    scroll-padding-inline:20px;scrollbar-width:none;-webkit-overflow-scrolling:touch;align-items:stretch}
  #temoignages .panels::-webkit-scrollbar{display:none}
  #temoignages .panel{grid-area:auto;flex:0 0 86%;scroll-snap-align:start;visibility:visible!important;opacity:1!important;transform:none!important;
    transition:none!important;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:22px 20px;display:flex;flex-direction:column}
  #temoignages .panel blockquote{font-size:.97rem;line-height:1.5;margin-top:14px;flex:1}
  #temoignages .panel blockquote p + p{margin-top:8px}
  #temoignages .panel .rel2{font-size:.76rem;align-self:flex-start}
  #temoignages .panel .sig{display:grid;grid-template-columns:42px 1fr;align-items:center;gap:12px;margin-top:18px}
  #temoignages .panel .sig img{width:42px;height:42px}
  #temoignages .panel .sig small{font-size:.78rem;line-height:1.35;display:block}
  #temoignages .panel .sig .btn{grid-column:1/-1;width:100%;justify-content:center;padding-block:11px}
  #temoignages .panel .lang{margin-top:10px}
  #temoignages .dots{justify-content:center;margin-top:14px}
  #temoignages .dots i{cursor:pointer;height:6px}
  #temoignages .dots i.on::after{animation:none;transform:scaleX(1)}
}
</style>"""
JS = r"""<script id="enh13">(function(){
  var mq=matchMedia('(max-width:760px)'), box=document.querySelector('#temoignages .panels'), dw=document.querySelector('#temoignages .dots');
  if(!box||!dw) return;
  var ps=[].slice.call(box.querySelectorAll('.panel')), ds=[].slice.call(dw.children);
  function sync(){ if(!mq.matches) return; var w=ps[0].offsetWidth+12, i=Math.max(0,Math.min(ps.length-1,Math.round(box.scrollLeft/w)));
    ds.forEach(function(d,j){ d.classList.toggle('on',j===i); }); ps.forEach(function(p){ p.removeAttribute('aria-hidden'); }); }
  var t; box.addEventListener('scroll',function(){ clearTimeout(t); t=setTimeout(sync,60); },{passive:true});
  ds.forEach(function(d,j){ d.addEventListener('click',function(){ if(mq.matches) box.scrollTo({left:ps[j].offsetLeft-20,behavior:'smooth'}); }); });
  function apply(){ if(mq.matches){ dw.classList.add('paused'); sync(); } }
  apply(); mq.addEventListener && mq.addEventListener('change',apply);
})();</script>"""
def run(path):
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'<style id="enh13">.*?</style>\n?','',s,flags=re.S)
    s=re.sub(r'<script id="enh13">.*?</script>\n?','',s,flags=re.S)
    i=s.index('</head>'); s=s[:i]+CSS+'\n'+s[i:]
    i=s.rindex('</body>'); s=s[:i]+JS+'\n'+s[i:]
    open(path,'w',encoding='utf-8').write(s)
run('index.html'); run('en/index.html'); print('enhance13: testimonials carousel on phones')
