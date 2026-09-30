# Links to the AI-agent and Baykat demos: card visuals, "interactive demo" badges, panel call-to-actions.
# Idempotent; run after enhance7.py.
import re

T = {
 'fr': dict(badge="Démo interactive",
   agent_note="Démo simulée, à titre illustratif (ni l'outil officiel ni l'outil final de Société Générale, données fictives) : choisissez un dossier de Lettre de Crédit, regardez l'agent IA lire le MT700 et repérer les anomalies en montrant la preuve, puis validez chaque point en un clic pour obtenir le message prêt à envoyer",
   agent_btn="Tester l'agent",
   bk_note="Le prototype de 2023 repensé en 2026, parcours complet : inscription par code SMS, catalogue de campagnes filtrable, fiche coopérative, vérification d'identité, paiement Wave, Orange Money ou carte, reçu, portefeuille et échéancier. Données fictives.",
   bk_btn="Tester le prototype", bk_alt="Nouvelle version de l'application Baykat : connexion et accueil",
   jb_note="Les maquettes XD du hackathon rendues jouables en 2026 : six jeux avec sons et voix (Anima, Yaram, Zik, Math Kid, Docteur Kid, Savoir-vivre), autocollants et espace parents.",
   ym_note="Les 20 écrans des maquettes rendus cliquables comme une vraie app, avec les montres et les prix réels de YEMA : catalogue, essayage en réalité augmentée (caméra ou mode démo), choix de la taille et du bracelet, achat de bout en bout (paiement simulé), suivi de commande, collection avec authenticité vérifiée, Club VIP et conciergerie. Projet étudiant non affilié à YEMA.",
   ym_btn="Tester le prototype",
   jb_btn="Jouer à JUBOX", jb_alt="JUBOX rendu jouable : accueil des jeux et jeu Anima"),
 'en': dict(badge="Interactive demo",
   agent_note="Simulated demo, for illustration only (not Société Générale's official or final tool, fictional data): pick a Letter of Credit file, watch the AI agent read the MT700 and flag discrepancies with the evidence, then validate each point in one click to get the message ready to send",
   agent_btn="Try the agent",
   bk_note="The 2023 prototype redesigned in 2026 (in French), full journey: SMS-code sign-up, filterable campaign catalogue, cooperative profile, ID check, Wave, Orange Money or card payment, receipt, portfolio and payout schedule. Fictional data.",
   bk_btn="Try the prototype", bk_alt="Redesigned Baykat app: sign-in and home screens",
   jb_note="The hackathon XD mockups made playable in 2026 (in French): six games with sound and voice (Anima, Yaram, Zik, Math Kid, Docteur Kid, Savoir-vivre), stickers and a parents' area.",
   ym_note="All 20 mockup screens made clickable like a real app, with YEMA's actual watches and prices: catalogue, augmented-reality try-on (camera or demo mode), size and strap choice, end-to-end purchase (simulated payment), order tracking, collection with verified authenticity, VIP Club and concierge. Student project not affiliated with YEMA.",
   ym_btn="Try the prototype",
   jb_btn="Play JUBOX", jb_alt="Playable JUBOX: game home screen and the Anima game"),
}
CSS = r"""
/* ==== ENH8: demo badges ==== */
.demo-b{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;color:var(--sun);background:var(--sun-soft);padding:4px 10px;border-radius:999px}
.demo-b::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--sun);box-shadow:0 0 0 0 var(--sun);animation:dpulse 2s infinite}
@keyframes dpulse{70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
.proj .vis img.bk,.proj .vis img.jb{object-position:center}
.proj .vis .demo-b{position:absolute;left:12px;top:12px;z-index:2;background:#0C1413;color:#E6AE48;border:1px solid #3A3220;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.proj .vis .demo-b::before{background:#E6AE48}
@media (prefers-reduced-motion:reduce){.demo-b::before{animation:none}}
"""

def cta(note,href,btn):
    return '<!--ENH8:cta--><div class="demo-cta"><p>%s</p><a class="btn" href="%s" target="_blank" rel="noopener">%s ↗</a></div><!--/ENH8:cta-->'%(note,href,btn)

def run(path,lang):
    t=T[lang]; pre='../' if lang=='en' else ''
    s=open(path,encoding='utf-8').read()
    s=re.sub(r'/\* ==== ENH8-START ==== \*/.*?/\* ==== ENH8-END ==== \*/\n?','',s,flags=re.S)
    s=re.sub(r'<!--ENH8:(\w+)-->.*?<!--/ENH8:\1-->','',s,flags=re.S)
    s=s.replace('</style>','/* ==== ENH8-START ==== */'+CSS+'/* ==== ENH8-END ==== */\n</style>',1)
    # Baykat card visual: typographic tile -> real screens of the redesigned app
    s=re.sub(r'(<button class="card proj[^"]*" data-p="p-baykat">\s*<div class="vis">)(?:<div class="typo baykat">.*?</div>|<img [^>]*class="bk"[^>]*>)',
             lambda m:m.group(1)+'<img src="%simg/baykat-app.jpg" alt="%s" loading="lazy" decoding="async" class="bk">'%(pre,t['bk_alt']),s,count=1,flags=re.S)
    # JUBOX card visual: typographic tile -> screens of the playable version
    s=re.sub(r'(<button class="card proj[^"]*" data-p="p-jubox">\s*<div class="vis">)(?:<div class="typo jubox">.*?</div>|<img [^>]*class="jb"[^>]*>)',
             lambda m:m.group(1)+'<img src="%simg/jubox-app.jpg" alt="%s" loading="lazy" decoding="async" class="jb">'%(pre,t['jb_alt']),s,count=1,flags=re.S)
    # badges on cards that have a demo
    for pid in ('p-agent','p-focal','p-baykat','p-jubox','p-yema'):
        i=s.index('data-p="%s"'%pid); j=s.index('<div class="vis">',i)+len('<div class="vis">')
        s=s[:j]+'<!--ENH8:b--><span class="demo-b">%s</span><!--/ENH8:b-->'%t['badge']+s[j:]
    # panel call-to-actions (after the first meta line of each panel)
    for pid,note,href,btn in (('p-agent',t['agent_note'],pre+'agent-demo/'+('?lang=en' if lang=='en' else ''),t['agent_btn']),
                              ('p-baykat',t['bk_note'],pre+'baykat-demo/',t['bk_btn']),
                              ('p-jubox',t['jb_note'],pre+'jubox-demo/',t['jb_btn']),
                              ('p-yema',t['ym_note'],pre+'yema-demo/'+('?lang=en' if lang=='en' else ''),t['ym_btn'])):
        i=s.index('<div id="%s"'%pid); mi=s.index('<div class="meta">',i); me=s.index('</div>',mi)+6
        s=s[:me]+cta(note,href,btn)+s[me:]
    open(path,'w',encoding='utf-8').write(s); print('ok',path)

run('index.html','fr'); run('en/index.html','en')
