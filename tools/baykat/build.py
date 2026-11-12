#!/usr/bin/env python3
"""Injecte la version ordinateur dans baykat-demo/index.html (idempotent)."""
import re, pathlib
here=pathlib.Path(__file__).parent; f=here.parent.parent/'baykat-demo'/'index.html'
s=f.read_text(encoding='utf-8'); css=(here/'desk.css').read_text(encoding='utf-8'); js='\n'+(here.parent/'shared'/'hb.js').read_text(encoding='utf-8')+(here/'desk.js').read_text(encoding='utf-8')
# CSS
s=re.sub(r'\n/\*DESK-CSS\*/.*?/\*END-DESK-CSS\*/\n','',s,flags=re.S)
s=s.replace('</style>','\n/*DESK-CSS*/\n'+css+'/*END-DESK-CSS*/\n</style>',1)
# JS
s=re.sub(r'\n/\*DESK-JS\*/.*?/\*END-DESK-JS\*/\n','',s,flags=re.S)
i=s.rindex('})();\n</script>'); s=s[:i]+'\n/*DESK-JS*/'+js+'/*END-DESK-JS*/\n'+s[i:]
# hooks de rendu
def once(a,b):
    global s
    if b in s: return
    assert a in s, a
    s=s.replace(a,b,1)
once("if(R[id])next.innerHTML=R[id]();","if(R[id])next.innerHTML=R[id]();DK(id,next);")
once("const sc=el.scrollTop;el.innerHTML=R[id]();el.scrollTop=sc}","const sc=el.scrollTop;el.innerHTML=R[id]();DK(id,el);el.scrollTop=sc}")
once("$('#s-suivi').innerHTML=R.suivi();","$('#s-suivi').innerHTML=R.suivi();DK('suivi',$('#s-suivi'));")
# bandeau
BTN='<span class="viewsw" role="group" aria-label="Affichage"><button type="button" data-view="desk" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M8.5 20h7M12 16.5V20"/></svg>Ordinateur</button><button type="button" data-view="phone" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 17.5h2"/></svg>Téléphone</button></span><button class="imp-btn" type="button" aria-expanded="false" aria-controls="panel">Ce que j’ai amélioré</button>'
s=re.sub(r'<span class="viewsw".*?Ce que j’ai amélioré</button>','',s,flags=re.S)
s=s.replace('<button class="jump" type="button" data-panel-jump>',BTN+'<button class="jump" type="button" data-panel-jump>',1)
# anti-flash : classe posée avant le premier rendu
PRE='<script>/*DESK-PRE*/try{if(matchMedia("(min-width:960px)").matches&&localStorage.getItem("bk-view")!=="phone")document.documentElement.classList.add("desk")}catch(e){}</script>'
s=re.sub(r'<script>/\*DESK-PRE\*/.*?</script>\n?','',s,flags=re.S)
s=s.replace('<style>',PRE+'\n<style>',1)
# panneau : mention de la version ordinateur
LI='<li data-desk-li><b>Version ordinateur</b>&#8239;: barre latérale, colonnes et grilles pour les grands écrans. Le parcours reste le même, et le bandeau permet de passer de l’affichage Ordinateur à Téléphone.</li>' # DESK-LI
s=re.sub(r'\s*<li data-desk-li>.*?</li>','',s,flags=re.S)
s=s.replace('</ol>\n      <div class="jumps">','\n        '+LI+'\n      </ol>\n      <div class="jumps">',1)
f.write_text(s,encoding='utf-8'); print('baykat-demo/index.html',len(s.encode()))
