#!/usr/bin/env python3
"""Agent IA et JUBOX n'ont pas de sources séparées : ce script y injecte (idempotent)
le pont d'historique (tools/shared/hb.js) et le fondu entre pages."""
import re, pathlib
R=pathlib.Path(__file__).parent.parent; hb=(R/'tools'/'shared'/'hb.js').read_text(encoding='utf-8')
VT='/*VT*/@view-transition{navigation:auto}/*END-VT*/'
JOBS={
 'agent-demo':dict(hook=("function go(n){\n closeSheet();","function go(n){\n closeSheet();HB.sync();"),
   init="HB.init(()=>S.step-1,()=>go(S.step-1));",extra=[("function stepbar(){","function stepbar(){HB.sync();")]),
 'jubox-demo':dict(hook=("  app.dataset.bar=(id==='s-pause')?'w':'';","  app.dataset.bar=(id==='s-pause')?'w':'';HB.sync();"),
   init="HB.init(function(){return cur&&['s-splash','s-profil','s-home'].indexOf(cur.id)<0?1:0},function(){goHome()});",
   extra=[('<span class="floaty" style="left:12%;bottom:18%;animation-delay:-4s">','<span class="floaty" style="left:7%;top:47%;animation-delay:-4s">')]),
}
EMO_CSS='/*EMO*/img.emo{display:inline-block;width:1.14em;height:1.14em;margin:0 .02em;vertical-align:-.2em;object-fit:contain;-webkit-user-drag:none;user-select:none;filter:drop-shadow(0 .05em .06em rgba(11,47,90,.2))}/*END-EMO*/'
EMO_JS=r'''<script>/*EMO*/
/* JUBOX : les emojis du système (différents sur chaque appareil) sont remplacés par un même jeu
   d'images en volume (Fluent Emoji, Microsoft, licence MIT). L'emoji reste en texte alternatif. */
(function(){var M=__MAP__,ks=Object.keys(M).sort(function(a,b){return b.length-a.length});
var re=new RegExp(ks.map(function(k){return k.replace(/\uFE0F/g,'')+'\uFE0F?'}).join('|'),'gu');
function parse(root){if(!root||root.nodeType!==1)return;var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),l=[],n;
 while(n=w.nextNode()){var p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|TITLE|OPTION|NOSCRIPT)$/.test(p.nodeName))continue;re.lastIndex=0;if(re.test(n.nodeValue))l.push(n)}
 l.forEach(function(t){var f=document.createDocumentFragment(),s=t.nodeValue,i=0,m;re.lastIndex=0;
  while(m=re.exec(s)){var cp=M[m[0]]||M[m[0].replace(/\uFE0F/g,'')];if(!cp)continue;if(m.index>i)f.appendChild(document.createTextNode(s.slice(i,m.index)));
   var im=document.createElement('img');im.className='emo';im.src='emo/'+cp+'.webp';im.alt=m[0];im.draggable=false;im.decoding='async';f.appendChild(im);i=m.index+m[0].length}
  if(i<s.length)f.appendChild(document.createTextNode(s.slice(i)));if(t.parentNode)t.parentNode.replaceChild(f,t)})}
parse(document.body);
new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='characterData'){parse(m.target.parentNode)}else for(var i=0;i<m.addedNodes.length;i++){var n=m.addedNodes[i];parse(n.nodeType===1?n:n.parentNode)}})}).observe(document.body,{childList:true,subtree:true,characterData:true});
})();/*END-EMO*/</script>'''
DC_CSS='/*DC*/.ph-t,.eyebrow,.how-g h3,.q thead th,.row .mk,.hand small,.sumg dt,.sugg b,.cmts b,.q td.amt::before,.q td.dt::before{text-transform:none;letter-spacing:0;font-size:.8rem}.eyebrow{font-weight:600}/*END-DC*/'
for d,j in JOBS.items():
    f=R/d/'index.html'; s=f.read_text(encoding='utf-8')
    s=re.sub(r'\n/\*HB\*/.*?/\*END-HB\*/','',s,flags=re.S)
    s=s.replace("'use strict';","'use strict';\n/*HB*/"+hb+j['init']+"/*END-HB*/",1)
    for a,b in [j['hook']]+j['extra']:
        if b not in s:
            assert a in s,(d,a); s=s.replace(a,b,1)
    s=re.sub(r'/\*VT\*/.*?/\*END-VT\*/\n?','',s,flags=re.S)
    s=s.replace('</style>',VT+'\n</style>',1)
    s=re.sub(r'/\*EMO\*/.*?/\*END-EMO\*/\n?','',s,flags=re.S)
    s=re.sub(r'<script></script>\n?','',s)
    s=re.sub(r'/\*DC\*/.*?/\*END-DC\*/\n?','',s,flags=re.S)
    if d=='agent-demo': s=s.replace('</style>',DC_CSS+'\n</style>',1)
    if d=='jubox-demo':
        import json
        m={k.replace('\ufe0f',''):v for k,v in json.loads((R/'tools'/'shared'/'emo.json').read_text(encoding='utf-8')).items()}
        s=s.replace('</style>',EMO_CSS+'\n</style>',1)
        i=s.rindex('</body>'); s=s[:i]+EMO_JS.replace('__MAP__',json.dumps(m,ensure_ascii=False,separators=(',',':')))+'\n'+s[i:]
    f.write_text(s,encoding='utf-8'); print(d,len(s.encode()))
