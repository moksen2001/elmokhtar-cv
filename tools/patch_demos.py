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
   init="HB.init(function(){return cur&&['s-splash','s-profil','s-home'].indexOf(cur.id)<0?1:0},function(){goHome()});",extra=[]),
}
for d,j in JOBS.items():
    f=R/d/'index.html'; s=f.read_text(encoding='utf-8')
    s=re.sub(r'\n/\*HB\*/.*?/\*END-HB\*/','',s,flags=re.S)
    s=s.replace("'use strict';","'use strict';\n/*HB*/"+hb+j['init']+"/*END-HB*/",1)
    for a,b in [j['hook']]+j['extra']:
        if b not in s:
            assert a in s,(d,a); s=s.replace(a,b,1)
    s=re.sub(r'/\*VT\*/.*?/\*END-VT\*/\n?','',s,flags=re.S)
    s=s.replace('</style>',VT+'\n</style>',1)
    f.write_text(s,encoding='utf-8'); print(d,len(s.encode()))
