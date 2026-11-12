#!/usr/bin/env python3
"""ENH16 - command palette (Ctrl/Cmd+K, "/" or the search button in the header).

One field to reach anything: sections, experiences, projects, live demos, certificates and
actions (download the CV, e-mail, theme, language, quick read). The index is read from the
page itself when the palette opens, so it follows content changes and parked sections.
Idempotent; runs after enhance14.py and before enhance15.py.
"""
import re, os, json
ROOT=os.path.join(os.path.dirname(__file__),'..')
T={
 'fr':dict(btn="Rechercher dans le CV",ph="Rechercher une expérience, un projet, une action…",empty="Aucun résultat. Essayez « Servier », « démo » ou « CV ».",
   g=["Sections","Parcours","Projets","Démos interactives","Certifications","Actions"],hint=["naviguer","ouvrir","fermer"],
   demos=[["Agent IA · contrôle documentaire Trade Finance","agent-demo/"],["Gaïndé · app des supporters du Sénégal","fsf-demo/"],["Focal-Shift · location de matériel photo et vidéo","focal-shift-demo/"],["Baykat · investissement agricole participatif","baykat-demo/"],["JUBOX · jeux éducatifs pour enfants","jubox-demo/"],["Yema Watch Club · boutique et essai en réalité augmentée","yema-demo/"]],
   act=dict(cv="Télécharger mon CV (PDF)",mail="M'écrire un e-mail",li="Ouvrir mon profil LinkedIn",theme="Changer de thème (clair / sombre)",lang="Switch to English",quick="Lecture rapide · 30 secondes",top="Revenir en haut de la page"),
   kw=dict(cv="pdf télécharger curriculum resume",mail="contact courriel email écrire",li="linkedin réseau",theme="sombre clair dark light mode",lang="english anglais langue",quick="résumé express 30 s",top="haut début accueil")),
 'en':dict(btn="Search this CV",ph="Search an experience, a project, an action…",empty="No result. Try “Servier”, “demo” or “CV”.",
   g=["Sections","Experience","Projects","Live demos","Certifications","Actions"],hint=["navigate","open","close"],
   demos=[["AI agent · Trade Finance document checking","agent-demo/"],["Gaïndé · Senegal supporters' app","fsf-demo/?lang=en"],["Focal-Shift · photo and video gear rental","focal-shift-demo/"],["Baykat · agricultural crowd-investing","baykat-demo/"],["JUBOX · educational games for children","jubox-demo/"],["Yema Watch Club · shop and AR try-on","yema-demo/"]],
   act=dict(cv="Download my CV (PDF)",mail="Send me an e-mail",li="Open my LinkedIn profile",theme="Toggle theme (light / dark)",lang="Passer en français",quick="Quick read · 30 seconds",top="Back to top"),
   kw=dict(cv="pdf download resume curriculum",mail="contact email write",li="linkedin network",theme="dark light mode",lang="french français language",quick="summary express 30 s",top="top start home")),
}
CSS=r"""<style id="enh16">
.kbtn{all:unset;box-sizing:border-box;height:34px;display:inline-flex;align-items:center;gap:8px;padding:0 10px 0 11px;border-radius:17px;border:1px solid var(--line);color:var(--ink-2);font:500 .82rem var(--body);cursor:pointer;transition:color .2s,border-color .2s,background-color .2s}
.kbtn:hover{color:var(--ink);border-color:var(--teal)}
.kbtn:focus-visible{outline:2px solid var(--teal);outline-offset:2px}
.kbtn svg{width:15px;height:15px;flex:none}
.kbtn kbd{font:600 .68rem var(--body);padding:2px 6px;border-radius:6px;background:var(--surface-2);color:var(--muted)}
@media (max-width:1020px){.kbtn span,.kbtn kbd{display:none}.kbtn{width:34px;padding:0;justify-content:center;border-radius:50%}}
.kp{position:fixed;inset:0;z-index:400;display:grid;justify-items:center;align-items:start;padding:min(14vh,120px) 16px 16px;background:rgba(4,10,22,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:kpF .16s ease-out both}
.kp[hidden]{display:none}
.kp-box{width:min(640px,100%);max-height:min(70vh,560px);display:flex;flex-direction:column;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden;animation:kpB .22s cubic-bezier(.2,.9,.25,1) both}
.kp-in{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line)}
.kp-in svg{width:19px;height:19px;flex:none;color:var(--muted)}
.kp-in input{all:unset;flex:1;min-width:0;font:400 1.05rem var(--body);color:var(--ink)}
.kp-in input::placeholder{color:var(--muted)}
.kp-in button{all:unset;cursor:pointer;font:600 .7rem var(--body);padding:4px 8px;border-radius:6px;background:var(--surface-2);color:var(--muted)}
.kp-in button:focus-visible{outline:2px solid var(--teal)}
.kp-list{flex:1;overflow-y:auto;padding:8px;overscroll-behavior:contain;scrollbar-width:thin}
.kp-g{padding:10px 12px 6px;font:600 .7rem var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.kp-i{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;font:500 .95rem var(--body);color:var(--ink-2)}
.kp-i .ic{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--surface-2);color:var(--teal)}
.kp-i .ic svg{width:16px;height:16px}
.kp-i .tx{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.kp-i small{flex:none;max-width:42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:400 .78rem var(--body);color:var(--muted)}
.kp-i mark{background:none;color:var(--teal);font-weight:700}
.kp-i[aria-selected="true"]{background:var(--teal-soft);color:var(--ink)}
.kp-i[aria-selected="true"] .ic{background:var(--teal);color:var(--on-teal)}
.kp-e{padding:28px 16px;text-align:center;color:var(--muted);font:400 .95rem var(--body)}
.kp-f{display:flex;gap:18px;padding:10px 18px;border-top:1px solid var(--line);font:400 .74rem var(--body);color:var(--muted)}
.kp-f kbd{font:600 .68rem var(--body);padding:2px 6px;margin-right:6px;border-radius:5px;background:var(--surface-2)}
@media (max-width:760px){.kp{padding:12px 10px}.kp-box{max-height:calc(100dvh - 24px)}.kp-f{display:none}.kp-i small{display:none}}
@keyframes kpF{from{opacity:0}to{opacity:1}}
@keyframes kpB{from{opacity:0;transform:translateY(-10px) scale(.98)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.kp,.kp-box{animation:none}}
</style>"""
JS=r"""<script id="enh16">(function(){
var T=__T__,PRE=__PRE__,d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var IC={sec:'<path d="M4 6h16M4 12h16M4 18h10"/>',xp:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',pr:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',demo:'<path d="M8 5.5v13l10.5-6.5z"/>',cert:'<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.6 5 2.6-1.5-7.5"/>',act:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'};
var sv=function(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>'};
var tx=function(e){return e?e.textContent.replace(/\s+/g,' ').trim():''};
var norm=function(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};
var esc=function(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var tools=$('.tools');if(!tools)return;
var mac=/Mac|iPhone|iPad/.test(navigator.platform||'');
var btn=d.createElement('button');btn.type='button';btn.className='kbtn';btn.setAttribute('aria-label',T.btn);btn.setAttribute('aria-haspopup','dialog');
btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><span>'+T.btn.split(' ')[0]+'</span><kbd>'+(mac?'⌘K':'Ctrl K')+'</kbd>';
tools.insertBefore(btn,tools.firstChild);
var kp=d.createElement('div');kp.className='kp';kp.hidden=true;
kp.innerHTML='<div class="kp-box" role="dialog" aria-modal="true" aria-label="'+esc(T.btn)+'"><div class="kp-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input type="text" role="combobox" aria-expanded="true" aria-controls="kp-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+esc(T.ph)+'" aria-label="'+esc(T.btn)+'"><button type="button" aria-label="'+esc(T.hint[2])+'">Esc</button></div><div class="kp-list" id="kp-list" role="listbox"></div><div class="kp-f"><span><kbd>↑↓</kbd>'+T.hint[0]+'</span><span><kbd>↵</kbd>'+T.hint[1]+'</span><span><kbd>Esc</kbd>'+T.hint[2]+'</span></div></div>';
d.body.appendChild(kp);
var inp=$('input',kp),list=$('.kp-list',kp),items=[],shown=[],sel=0,last=null;
var jump=function(el){return function(){el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'})}};
function index(){
 var a=[],G=T.g;
 $$('section.block[id]:not([data-parked])').forEach(function(s){var h=$('h2',s);if(h)a.push({g:0,k:'sec',t:tx(h),s:tx($('.eyebrow',s)),run:jump(s)})});
 $$('#parcours article.rel').forEach(function(r){var o=$('.org',r),org=o?tx(o.firstElementChild):'';a.push({g:1,k:'xp',t:tx($('h3',r)),s:org,w:tx($('.caps',r))+' '+tx($('.when',r)),run:jump(r)})});
 $$('#formation h3').forEach(function(h){var c=h.closest('.card,article,li')||h;a.push({g:1,k:'xp',t:tx(h),s:tx($('#formation .eyebrow')),run:jump(c)})});
 var seen={};$$('button.proj[data-p]').forEach(function(b){var id=b.getAttribute('data-p');if(seen[id])return;seen[id]=1;a.push({g:2,k:'pr',t:tx($('h3',b)),s:tx($('.tag,.kind,.eyebrow',b)),w:tx(b),run:function(){var s=$('#projets');if(s)s.scrollIntoView({block:'start'});setTimeout(function(){b.click()},60)}})});
 T.demos.forEach(function(x){a.push({g:3,k:'demo',t:x[0],s:'↗',w:'demo prototype live',run:function(){location.href=PRE+x[1]}})});
 $$('#certifications .cert .ct').forEach(function(c){var t=tx($('b',c));a.push({g:4,k:'cert',t:t,s:tx($('small',c)),w:(t.match(/\b[A-Z]/g)||[]).join(''),run:jump(c.closest('.cert'))})});
 var A=T.act,K=T.kw,cv=$('.dl-menu a[href$=".pdf"]'),ml=$('a[href^="mailto:"]'),li=$('a[href*="linkedin.com/in/elmokhtar"]'),th=$('.theme-btn'),lg=$('.lang-sw a:not([aria-current])'),qk=$('.quick-btn');
 if(cv)a.push({g:5,k:'act',t:A.cv,w:K.cv,run:function(){var l=d.createElement('a');l.href=cv.href;l.download='';d.body.appendChild(l);l.click();l.remove()}});
 if(ml)a.push({g:5,k:'act',t:A.mail,w:K.mail,run:function(){location.href=ml.href}});
 if(li)a.push({g:5,k:'act',t:A.li,w:K.li,run:function(){window.open(li.href,'_blank','noopener')}});
 if(qk)a.push({g:5,k:'act',t:A.quick,w:K.quick,run:function(){qk.click()}});
 if(th)a.push({g:5,k:'act',t:A.theme,w:K.theme,run:function(){th.click()}});
 if(lg)a.push({g:5,k:'act',t:A.lang,w:K.lang,run:function(){location.href=lg.href}});
 a.push({g:5,k:'act',t:A.top,w:K.top,run:function(){scrollTo({top:0,behavior:'smooth'})}});
 a.forEach(function(x){x.n=norm(x.t+' '+(x.s||'')+' '+(x.w||'')+' '+G[x.g])});
 return a;
}
function hl(t,q){if(!q)return esc(t);var n=norm(t),i=n.indexOf(q);return i<0||n.length!==t.length?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length))}
function draw(){
 var q=norm(inp.value.trim()),ws=q.split(/\s+/).filter(Boolean);
 shown=items.filter(function(x){return ws.every(function(w){return x.n.indexOf(w)>=0})});
 if(q)shown.sort(function(a,b){return (norm(b.t).indexOf(ws[0])===0)-(norm(a.t).indexOf(ws[0])===0)||a.g-b.g});
 else shown=shown.filter(function(x){return x.g===0||x.g===3||x.g===5});
 if(sel>=shown.length)sel=0;
 var h='',g=-1;shown.forEach(function(x,i){if(x.g!==g&&!q){g=x.g;h+='<div class="kp-g" role="presentation">'+T.g[g]+'</div>'}
  h+='<div class="kp-i" role="option" id="kp-o'+i+'" data-i="'+i+'" aria-selected="'+(i===sel)+'"><span class="ic">'+sv(x.k)+'</span><span class="tx">'+hl(x.t,ws[0])+'</span>'+(x.s?'<small>'+esc(q?(x.s==='↗'?T.g[3]:x.s):x.s)+'</small>':'')+'</div>'});
 list.innerHTML=h||'<div class="kp-e">'+T.empty+'</div>';
 inp.setAttribute('aria-activedescendant',shown.length?'kp-o'+sel:'');
 var c=$('[aria-selected="true"]',list);if(c)c.scrollIntoView({block:'nearest'});
}
function open(){if(!kp.hidden)return;last=d.activeElement;items=index();sel=0;inp.value='';kp.hidden=false;d.documentElement.style.overflow='hidden';draw();inp.focus()}
function close(back){if(kp.hidden)return;kp.hidden=true;d.documentElement.style.overflow='';if(back!==false&&last&&last.focus)last.focus()}
function run(i){var x=shown[i];if(!x)return;close(false);setTimeout(x.run,30)}
btn.addEventListener('click',open);
$('.kp-in button',kp).addEventListener('click',close);
kp.addEventListener('mousedown',function(e){if(e.target===kp)close()});
list.addEventListener('click',function(e){var o=e.target.closest('.kp-i');if(o)run(+o.getAttribute('data-i'))});
list.addEventListener('mousemove',function(e){var o=e.target.closest('.kp-i');if(o&&+o.getAttribute('data-i')!==sel){sel=+o.getAttribute('data-i');$$('.kp-i',list).forEach(function(n,i){n.setAttribute('aria-selected',i===sel)})}});
inp.addEventListener('input',function(){sel=0;draw()});
inp.addEventListener('keydown',function(e){
 if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(shown.length,1);draw()}
 else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+shown.length)%Math.max(shown.length,1);draw()}
 else if(e.key==='Enter'){e.preventDefault();run(sel)}
 else if(e.key==='Tab'){e.preventDefault()}
});
d.addEventListener('keydown',function(e){
 if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();kp.hidden?open():close();return}
 if(e.key==='Escape'&&!kp.hidden){e.stopPropagation();close();return}
 if(e.key==='/'&&kp.hidden&&!e.metaKey&&!e.ctrlKey&&!e.altKey){var t=e.target,n=t&&t.tagName;if(n==='INPUT'||n==='TEXTAREA'||n==='SELECT'||(t&&t.isContentEditable))return;if(d.querySelector('dialog[open],[aria-modal="true"]:not(.kp-box):not([hidden])'))return;e.preventDefault();open()}
},true);
})();</script>"""
for rel,lang,pre in (('index.html','fr',''),('en/index.html','en','../')):
    f=os.path.join(ROOT,rel); s=open(f,encoding='utf-8').read()
    s=re.sub(r'<style id="enh16">.*?</style>\n?','',s,flags=re.S)
    s=re.sub(r'<script id="enh16">.*?</script>\n?','',s,flags=re.S)
    js=JS.replace('__T__',json.dumps(T[lang],ensure_ascii=False)).replace('__PRE__',json.dumps(pre))
    s=s.replace('</head>',CSS+'\n</head>',1)
    i=s.rindex('</body>'); s=s[:i]+js+'\n'+s[i:]
    open(f,'w',encoding='utf-8').write(s); print('enh16',rel)
