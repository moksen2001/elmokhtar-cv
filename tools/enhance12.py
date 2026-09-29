#!/usr/bin/env python3
"""ENH12 - (1) redesigned "IA" section, (2) project previews everywhere,
(3) clear section changes: alternating bands, numbered eyebrows, animated
section titles and a "current section" label in the header.
Idempotent; runs after enhance11.
"""
import re

CSS = r"""<style id="enh12">
/* ==== ENH12 ==== */
/* ---------- section changes ---------- */
main{counter-reset:sec}
section.block{counter-increment:sec;position:relative;border-top:1px solid var(--line)}
:root{--band:#FFFFFF}
:root[data-theme="dark"]{--band:#0F203E}
section.block:nth-of-type(even){background:var(--band)}
:root[data-theme="light"] section.block:nth-of-type(even){--surface:#F5F5F7;--surface-2:#EBEBEF}
:root[data-theme="dark"] section.block:nth-of-type(even){--surface:#12254A;--surface-2:#183058;--line:#223A62}
section.block .head .eyebrow::before{display:inline-block!important;content:counter(sec,decimal-leading-zero);width:auto;height:auto;background:none;
  color:var(--muted);font-variant-numeric:tabular-nums;font-weight:500;padding-right:12px;margin-right:12px;border-right:1px solid var(--line)}
section.block .head .eyebrow{display:inline-flex;align-items:center}
@keyframes h2in{from{clip-path:inset(0 0 100% 0);transform:translateY(22px)}to{clip-path:inset(0 0 -10% 0);transform:none}}
@keyframes ebin{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
section.block .head.rv:not(.pre) h2{animation:h2in .9s cubic-bezier(.2,.8,.2,1) .08s both}
section.block .head.rv:not(.pre) .eyebrow{animation:ebin .7s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){section.block .head h2,section.block .head .eyebrow{animation:none!important}}
/* header: name of the section you are in */
.cursec{display:none}
@media (min-width:761px){
  .cursec{display:inline-flex;align-items:center;gap:10px;margin-left:14px;height:24px;overflow:hidden;font-size:.88rem;color:var(--muted);white-space:nowrap}
  .cursec::before{content:"";width:1px;height:18px;background:var(--line)}
  .cursec span{display:inline-block;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s}
  .cursec b{font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums;margin-right:6px}
  .cursec.out span{transform:translateY(-110%);opacity:0}
  .cursec.in span{transform:translateY(110%);opacity:0;transition:none}
  .cursec.hide{visibility:hidden}
}

/* ---------- IA section ---------- */
#ia .ai-grid{grid-template-columns:1fr;gap:40px}
#ia .method{background:none!important;color:var(--ink)!important;border:0!important;box-shadow:none;padding:0!important;
  display:grid;grid-template-columns:minmax(220px,.75fr) 2fr;grid-template-rows:auto 1fr;gap:12px 44px;align-items:start}
#ia .method::after{display:none}
#ia .method h3{font:500 1.55rem/1.2 var(--display);letter-spacing:-.02em;grid-column:1}
#ia .method>p{grid-column:1;opacity:1;color:var(--ink-2);font-size:1.02rem;margin-top:0}
#ia .steps{grid-column:2;grid-row:1/span 2;margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:0}
#ia .steps li{display:block;position:relative;padding-right:26px}
#ia .steps li::before{content:"0" counter(st);display:grid;place-items:center;width:54px;height:54px;border-radius:50%;
  border:1px solid var(--teal);color:var(--teal);font:300 1.15rem/1 var(--display);background:var(--band);padding:0;position:relative;z-index:1}
#ia .steps li::after{content:"";position:absolute;left:62px;right:6px;top:27px;height:1px;background:linear-gradient(90deg,var(--teal),transparent)}
#ia .steps li:last-child::after{display:none}
#ia .steps b{display:block;margin-top:16px;font:500 1.15rem/1.3 var(--display)}
#ia .steps span{display:block;opacity:1;color:var(--ink-2);font-size:.93rem;margin-top:6px;line-height:1.55}
#ia .made{background:none!important;border:0!important;box-shadow:none;padding:0!important;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
#ia .made::after{display:none}
#ia .made h3{grid-column:1/-1;padding:14px 0 0;font:500 1.1rem var(--display);display:flex;align-items:center;gap:10px}
#ia .mk{display:flex;flex-direction:column;gap:8px;padding:20px 22px;border:1px solid var(--line);border-radius:18px;background:var(--surface);
  transition:transform .35s cubic-bezier(.2,.8,.2,1),border-color .35s,box-shadow .35s}
#ia .mk:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--teal) 60%,var(--line));box-shadow:var(--shadow)}
#ia .mk time{order:-1;font-size:.8rem;color:var(--teal);padding:0}
#ia .mk b{font:500 1.12rem/1.3 var(--display)}
#ia .mk span{color:var(--ink-2);font-size:.92rem;line-height:1.55}
#ia .made h3:nth-of-type(2)~.mk{grid-column:1/-1;background:linear-gradient(120deg,color-mix(in srgb,var(--teal) 16%,var(--surface)),var(--surface) 60%)}
@media (max-width:900px){
  #ia .method{grid-template-columns:1fr}
  #ia .steps{grid-column:1;grid-row:auto;grid-template-columns:1fr;gap:22px;margin-top:10px}
  #ia .steps li{display:grid;grid-template-columns:54px 1fr;gap:0 16px;padding:0}
  #ia .steps li::after{left:27px;top:60px;bottom:-22px;right:auto;width:1px;height:auto;background:linear-gradient(180deg,var(--teal),transparent)}
  #ia .steps li>div{grid-column:2}
  #ia .steps b{margin-top:4px}
  #ia .made{grid-template-columns:1fr}
}

/* ---------- showcase: full preview on top, caption below ---------- */
@media (min-width:761px){
  .sc-stage{display:flex;flex-direction:column;min-height:0}
  .sc-stage::after{display:none}
  .sc-media{position:relative;aspect-ratio:16/10;overflow:hidden;flex:none}
  .sc-m img{object-position:50% 50%!important}
  .sc-cap{position:relative;color:var(--ink);padding:22px 26px 24px;border-top:1px solid var(--line);flex:1}
  .sc-cap .k{color:var(--muted)}.sc-cap .k .ct{color:var(--ink)}
  .sc-cap h3{color:var(--ink);font-size:clamp(1.35rem,2vw,1.75rem)}
  .sc-cap p{color:var(--ink-2)}
  .sc-cap .btn{background:transparent;border-color:var(--line);color:var(--ink)}
  .sc-cap .btn.primary{background:var(--ink);border-color:var(--ink);color:var(--bg)}
  .sc-cap .aw{background:var(--teal-soft);color:var(--teal)}
}
/* ---------- project cards (phones) use the new previews ---------- */
.proj .vis img.pv{object-fit:cover;object-position:50% 30%}
</style>"""

JS = r"""<script id="enh12">(function(){
var L=(document.documentElement.lang||'fr').slice(0,2)==='en'?'en':'fr', PRE=L==='en'?'../':'';
/* showcase: group the image layers so the caption sits below them */
var st=document.querySelector('.sc-stage');
if(st && !st.querySelector('.sc-media')){ var md=document.createElement('div'); md.className='sc-media'; st.insertBefore(md,st.firstChild);
  [].slice.call(st.querySelectorAll(':scope > .sc-m')).forEach(function(m){ md.appendChild(m); }); var nv=st.querySelector(':scope > .sc-nav'); if(nv) md.appendChild(nv); }
/* previews in the project cards (used by the phone carousel) */
var PV={'p-agent':'agent','p-focal':'focal','p-baykat':'baykat','p-jubox':'jubox','p-yema':'yema','p-veille':'veille'};
[].forEach.call(document.querySelectorAll('.projects .proj'),function(c){
  var k=PV[c.getAttribute('data-p')], v=c.querySelector('.vis'); if(!k||!v) return;
  var src=PRE+'img/preview/'+k+'.jpg', im=v.querySelector('img');
  if(im){ im.src=src; im.className='pv'; return; }   /* keep the same element: other scripts hold a reference to it */
  var badge=v.querySelector('.demo-b'); v.innerHTML=''; if(badge) v.appendChild(badge);
  im=document.createElement('img'); im.className='pv'; im.src=src; im.alt=''; im.loading='lazy'; im.decoding='async'; v.appendChild(im);
});
/* header label: current section */
var brand=document.querySelector('.top .brand'); if(!brand||!('IntersectionObserver' in window)) return;
var lab=document.createElement('span'); lab.className='cursec hide'; lab.setAttribute('aria-hidden','true'); lab.innerHTML='<span></span>';
brand.parentNode.insertBefore(lab,brand.nextSibling);
var secs=[].slice.call(document.querySelectorAll('main section.block')), inner=lab.firstChild, cur=null;
function name(s){ var e=s.querySelector('.head .eyebrow'); return e?e.textContent.trim():''; }
function set(s){
  if(s===cur) return; cur=s;
  if(!s){ lab.classList.add('hide'); return; }
  var n=secs.indexOf(s)+1, t=name(s); if(!t){ return; }
  lab.classList.remove('hide'); lab.classList.add('out');
  setTimeout(function(){ inner.innerHTML='<b>'+String(n).padStart(2,'0')+'</b>'; inner.appendChild(document.createTextNode(t));
    lab.classList.remove('out'); lab.classList.add('in'); void lab.offsetWidth; lab.classList.remove('in'); },220);
}
var hero=document.querySelector('.hero');
var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) set(e.target===hero||e.target.id==='contact'?null:e.target); }); },{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(function(s){ io.observe(s); }); if(hero) io.observe(hero); var ct=document.getElementById('contact'); if(ct) io.observe(ct);
})();</script>"""


def run(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'\s*<style id="enh12">.*?</style>', "", s, flags=re.S)
    s = re.sub(r'<script id="enh12">.*?</script>\n?', "", s, flags=re.S)
    i = s.index("</head>"); s = s[:i] + CSS + "\n" + s[i:]
    # must run before enhance11's showcase script reads the cards? No: showcase uses its own MEDIA map,
    # so order does not matter. Inject at the end of body.
    i = s.rindex("</body>"); s = s[:i] + JS + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)


for p in ("index.html", "en/index.html"):
    run(p)
print("enhance12: IA, previews, section changes applied")
