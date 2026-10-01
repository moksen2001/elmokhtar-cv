# Génère tools/focal/3-data.js à partir du jeu de démo du prototype PHP (database/focal_shift.sql)
# et des photos Wikimedia Commons sélectionnées (photos.json).
import json, os, base64, io
from PIL import Image, ImageStat
D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(D, '../../focal-shift-demo/')
photos = json.load(open(os.path.join(D, 'photos.json')))

def lqip(src):
    im = Image.open(ROOT + src).convert('RGB')
    w, h = im.size
    small = im.copy(); small.thumbnail((20, 20))
    b = io.BytesIO(); small.save(b, 'WEBP', quality=40)
    # couleur des coins : fond uni ? (photo produit sur fond clair/sombre)
    px = im.load(); pts = [px[3, 3], px[w - 4, 3], px[3, h - 4], px[w - 4, h - 4], px[w // 2, 3], px[w // 2, h - 4]]
    avg = tuple(sum(p[i] for p in pts) // len(pts) for i in range(3))
    spread = max(max(abs(p[i] - avg[i]) for i in range(3)) for p in pts)
    mean = tuple(int(x) for x in ImageStat.Stat(im).mean)
    return dict(q='data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(),
                c='#%02x%02x%02x' % mean, bg=('#%02x%02x%02x' % avg) if spread < 26 else None)

P = {}
for o in photos:
    x = lqip(o['src'])
    P.setdefault(o['key'], []).append(dict(s=o['src'], t=o['thumb'], w=o['w'], h=o['h'], **x))

credits = [dict(k=o['key'], s=o['thumb'], title=o['title'], author=o['author'], lic=o['license'], url=o['url'], note=o['note']) for o in photos]

# Utilisateurs (note recalculée à partir des avis, comme dans le prototype)
users = {
 1: dict(id=1, name='Camille R.', city='Paris 11e', bio='Cheffe opératrice. Mon kit interview dort entre deux tournages.', rating=5.0, n=38, since=2024, km=4.2, resp='répond en 1 h'),
 2: dict(id=2, name='Studio Lumen', city='Montreuil', bio='Petit studio photo, lumières continues et flashs.', rating=4.3, n=112, since=2023, km=7.5, resp='répond en 2 h', pro=True),
 3: dict(id=3, name='Hugo T.', city='Vincennes', bio='Vidéaste mariage, écosystème Sony.', rating=5.0, n=21, since=2024, km=6.0, resp='répond en 30 min'),
 4: dict(id=4, name='Nadia B.', city='Boulogne-Billancourt', bio='Ingénieure son, micros et enregistreurs.', rating=4.0, n=17, since=2025, km=9.8, resp='répond en 3 h'),
 5: dict(id=5, name='Léa M.', city='Paris 18e', bio='Vidéaste indépendante.', rating=None, n=0, since=2026, km=0.6, resp='répond en 1 h'),
}
# Référentiel produits (prix neuf, scores conseil)
prod = {
 'FX3': ('Sony', 4600, 2021, 715, [5,5,4,3,5,2], 'Caméra cinéma compacte plein format, taillée pour la vidéo.'),
 'EOS R6 Mark II': ('Canon', 2800, 2022, 670, [5,5,5,5,4,4], 'Hybride plein format polyvalent, très rapide et facile à prendre en main.'),
 'A7S III': ('Sony', 4200, 2020, 699, [4,5,4,3,5,2], 'Référence vidéo en faible lumière.'),
 'A7 IV': ('Sony', 2800, 2021, 658, [5,4,4,3,4,3], 'Hybride plein format équilibré entre photo et vidéo.'),
 'X-T5': ('Fujifilm', 1900, 2022, 557, [4,3,5,4,3,3], 'APS-C très défini, commandes physiques, idéal pour le voyage et la rue.'),
 'ZV-E10': ('Sony', 750, 2021, 343, [4,3,1,3,4,5], 'Hybride léger pensé pour les créateurs de contenu.'),
 'EOS R50': ('Canon', 800, 2023, 375, [4,3,1,4,3,5], 'Hybride compact et simple pour débuter.'),
 'FE 24-70 mm f/2.8 GM II': ('Sony', 2400, 2022, 695, None, 'Zoom standard professionnel.'),
 '35 mm f/1.4 DG DN Art': ('Sigma', 850, 2020, 645, None, 'Focale fixe lumineuse polyvalente.'),
 'RF 85 mm f/1.2 L': ('Canon', 2900, 2019, 1195, None, 'Focale portrait haut de gamme.'),
 'FE 90 mm f/2.8 Macro G': ('Sony', 1100, 2015, 602, None, 'Macro pour le produit et le détail.'),
 'XF 23 mm f/2 R WR': ('Fujifilm', 500, 2016, 180, None, 'Petite focale tout-temps, parfaite en voyage.'),
 'RF 50 mm f/1.8 STM': ('Canon', 230, 2020, 160, None, 'Focale fixe légère et abordable.'),
 'Amaran 200x S + softbox': ('Aputure', 520, 2022, None, None, 'Lumière continue bicolore.'),
 'RS 4': ('DJI', 550, 2024, 1500, None, 'Stabilisateur trois axes.'),
 'Wireless GO II': ('Rode', 300, 2021, None, None, 'Micro-cravate sans fil double.'),
 'MKE 600 + perche': ('Sennheiser', 480, 2016, None, None, 'Micro canon pour perche.'),
 'F6 enregistreur 32 bits': ('Zoom', 700, 2020, None, None, 'Enregistreur multipiste 32 bits flottants.'),
}
photo_key = {'FX3':'fx3','EOS R6 Mark II':'r6m2','A7S III':'a7s3','A7 IV':'a7iv','X-T5':'xt5','ZV-E10':'zve10','EOS R50':'r50',
 'FE 24-70 mm f/2.8 GM II':'gm2470','35 mm f/1.4 DG DN Art':'sig35','RF 85 mm f/1.2 L':'rf85','FE 90 mm f/2.8 Macro G':'fe90',
 'XF 23 mm f/2 R WR':'xf23','RF 50 mm f/1.8 STM':'rf50','Amaran 200x S + softbox':'amaran','RS 4':'rs4','Wireless GO II':'wgo2',
 'MKE 600 + perche':'mke600','F6 enregistreur 32 bits':'zoomf6','SL150 III + parapluie':'godox','MC Pro (kit de 4)':'mcpro',
 'PavoTube II 15C (x2)':None,'Kit 3 pieds de lumière':'stands','Kit 3 pieds + rotules':'tripods','Ace M trépied vidéo':'sachtler',
 'Table produit + fond infini':'table','VideoMic NTG':'ntg','EW-DP ME2 (x2)':'ewdp'}
# (id, proprio, cat, marque, modele, monture, spec, prix_achat, annee, etat, prix_jour, prix_vente, mode, garantie, controle, accessoires, declenchements)
L = [
 (1,1,'boitier','Sony','FX3','E','plein format cinéma, 4K 120p, faible lumière',4200,2023,'excellent',95,None,'location',0,1,'Deux batteries, cage, chargeur',None),
 (2,1,'objectif','Sony','FE 24-70 mm f/2.8 GM II','E','zoom standard polyvalent interview',2400,2023,'excellent',45,None,'location',0,1,'Bouchons, pare-soleil',None),
 (3,1,'lumiere','Aputure','Amaran 200x S + softbox',None,'lumière clé douce bicolore interview',520,2022,'bon',25,None,'location',0,1,'Softbox, pied, sac',None),
 (4,1,'son','Rode','Wireless GO II',None,'micro-cravate sans fil interview',300,2022,'bon',15,190,'vente',3,1,'Deux émetteurs, récepteur, bonnettes, câbles',None),
 (5,2,'lumiere','Godox','SL150 III + parapluie',None,'lumière clé continue portrait studio',380,2023,'excellent',20,None,'location',0,1,'Parapluie, pied, télécommande',None),
 (6,2,'lumiere','Aputure','MC Pro (kit de 4)',None,'panneaux RGB ambiance couleur nuit clip',1100,2024,'neuf',40,None,'location',0,1,'Mallette de recharge, diffuseurs',None),
 (7,2,'lumiere','Nanlite','PavoTube II 15C (x2)',None,'tubes RGB ambiance couleur nuit clip',440,2022,'bon',22,None,'location',0,0,'Deux tubes, chargeurs, sangles',None),
 (8,2,'accessoire','Manfrotto','Kit 3 pieds de lumière',None,'pieds lumière',210,2021,'correct',8,None,'location',0,0,'Housse',None),
 (9,2,'boitier','Canon','EOS R6 Mark II','RF','hybride photo portrait 24 Mpx',2600,2023,'excellent',60,None,'location',6,1,'Deux batteries, chargeur',18000),
 (10,2,'objectif','Canon','RF 85 mm f/1.2 L','RF','focale fixe portrait flou arrière-plan',2900,2022,'excellent',55,None,'location',0,1,'Bouchons, pare-soleil, étui',None),
 (11,3,'boitier','Sony','A7S III','E','plein format vidéo, faible lumière nuit',3800,2021,'bon',80,2300,'vente',6,1,'Batterie, chargeur, boîte d’origine',30500),
 (12,3,'objectif','Sigma','35 mm f/1.4 DG DN Art','E','focale fixe lumineuse flou arrière-plan nuit',850,2022,'excellent',25,620,'vente',6,1,'Bouchons, pare-soleil, étui',None),
 (13,3,'objectif','Sony','FE 90 mm f/2.8 Macro G','E','macro produit détails',1100,2021,'bon',28,None,'location',0,1,'Bouchons, pare-soleil',None),
 (14,3,'stabilisation','DJI','RS 4',None,'stabilisateur gimbal mouvement fluide clip mariage',550,2024,'excellent',30,None,'location',0,1,'Valise, batterie, mini-trépied',None),
 (15,3,'son','Rode','VideoMic NTG',None,'micro canon caméra ambiance',250,2022,'bon',12,None,'location',0,0,'Bonnette, câble',None),
 (16,4,'son','Sennheiser','MKE 600 + perche',None,'micro canon perche interview documentaire',480,2021,'excellent',20,None,'location',0,1,'Perche, bonnette, câble XLR',None),
 (17,4,'son','Zoom','F6 enregistreur 32 bits',None,'enregistreur multipiste interview documentaire',700,2022,'excellent',25,None,'location',0,1,'Carte SD, batteries',None),
 (18,4,'son','Sennheiser','EW-DP ME2 (x2)',None,'micro-cravate sans fil interview mariage',1300,2023,'excellent',40,None,'location',0,1,'Deux émetteurs, récepteur, piles',None),
 (19,1,'stabilisation','Sachtler','Ace M trépied vidéo',None,'trépied tête fluide interview',650,2020,'bon',18,None,'location',0,1,'Housse',None),
 (20,2,'accessoire','Neewer','Table produit + fond infini',None,'fond infini table produit',160,2023,'bon',10,None,'location',0,0,'Fond blanc, pinces',None),
 (21,3,'boitier','Sony','A7 IV','E','plein format photo vidéo polyvalent',2800,2023,'excellent',55,1650,'vente',6,1,'Deux batteries, chargeur, boîte d’origine',12400),
 (22,2,'boitier','Fujifilm','X-T5','X','APS-C léger voyage rue',1900,2023,'excellent',45,1390,'vente',12,1,'Batterie, chargeur, facture',5100),
 (23,1,'boitier','Sony','ZV-E10','E','léger créateur contenu vlog',750,2022,'bon',18,470,'vente',3,0,'Batterie, dragonne',21000),
 (24,4,'boitier','Canon','EOS R50','RF','compact simple débutant',800,2024,'excellent',22,None,'location',6,1,'Batterie, chargeur, boîte d’origine',2300),
 (25,2,'objectif','Fujifilm','XF 23 mm f/2 R WR','X','focale fixe légère voyage rue',500,2021,'bon',12,360,'vente',3,0,'Bouchons, pare-soleil',None),
 (26,2,'objectif','Canon','RF 50 mm f/1.8 STM','RF','focale fixe légère portrait',230,2022,'excellent',8,150,'vente',3,1,'Bouchons',None),
 (27,1,'objectif','Canon','RF 85 mm f/1.2 L','RF','portrait haut de gamme flou d’arrière-plan',2900,2021,'excellent',60,None,'location',0,1,'Bouchons, pare-soleil, étui',None),
 (28,2,'objectif','Sony','FE 90 mm f/2.8 Macro G','E','macro produit packshot détail',1100,2020,'excellent',28,None,'location',0,1,'Bouchons, pare-soleil',None),
 (29,4,'son','Zoom','F6 enregistreur 32 bits',None,'multipiste interview documentaire',700,2022,'excellent',30,None,'location',0,1,'Carte SD, batteries, sacoche',None),
 (30,1,'son','Sennheiser','MKE 600 + perche',None,'micro canon perche interview extérieur',480,2021,'bon',16,None,'location',0,0,'Bonnette, câble XLR',None),
 (31,3,'stabilisation','DJI','RS 4',None,'stabilisateur trois axes mouvement fluide',550,2024,'excellent',26,None,'location',0,1,'Valise, batteries, trépied',None),
 (32,2,'lumiere','Aputure','Amaran 200x S + softbox',None,'lumière continue bicolore interview',520,2023,'excellent',22,None,'location',0,1,'Softbox, pied, mallette',None),
 (33,5,'objectif','Fujifilm','XF 23 mm f/2 R WR','X','focale fixe légère voyage rue',500,2020,'bon',12,320,'vente',3,0,'Bouchons, pare-soleil',None),
 (34,4,'boitier','Sony','ZV-E10','E','léger vlog créateur de contenu',750,2023,'excellent',18,520,'vente',6,1,'Deux batteries, chargeur, dragonne',8200),
 (35,3,'objectif','Sony','FE 24-70 mm f/2.8 GM II','E','zoom standard professionnel polyvalent',2400,2023,'excellent',45,1780,'vente',6,1,'Bouchons, pare-soleil, étui, facture',None),
 (36,5,'accessoire','Manfrotto','Kit 3 pieds + rotules',None,'trépieds studio et reportage',420,2021,'bon',10,None,'location',0,0,'Housse de transport',None),
]
items = []
for (i, o, cat, br, mo, mt, spec, pa, an, et, pj, pv, mode, gar, ctl, acc, dec) in L:
    pr = prod.get(mo)
    k = photo_key.get(mo)
    it = dict(id=i, o=o, cat=cat, brand=br, model=mo, mount=mt, spec=spec, paid=pa, year=an, state=et,
              day=pj if mode == 'location' else None, price=pv if mode == 'vente' else None, mode='rent' if mode == 'location' else 'buy',
              warranty=gar, checked=bool(ctl), acc=acc, shots=dec, ph=k,
              ref=pr[1] if pr else pa, weight=pr[3] if pr else None, scores=pr[4] if pr else None,
              blurb=pr[5] if pr else None)
    items.append(it)
# Avis (après transactions)
reviews = [
 dict(l=1, a='Léa M.', t=1, n=5, txt='Matériel impeccable, état des lieux fait en deux minutes. Camille m’a même prêté une batterie supplémentaire.', d='19/09/2026', on='FX3'),
 dict(l=2, a='Hugo T.', t=1, n=5, txt='Objectif comme neuf, exactement conforme à l’annonce. Remise en main propre très simple.', d='05/09/2026', on='FE 24-70 GM II'),
 dict(l=5, a='Léa M.', t=2, n=4, txt='Bonne lumière, mallette complète. Petit retard au rendez-vous de remise, mais rien de grave.', d='23/09/2026', on='SL150 III'),
 dict(l=9, a='Hugo T.', t=2, n=5, txt='Studio Lumen connaît son matériel et donne de vrais conseils de réglage. Je relouerai.', d='22/08/2026', on='EOS R6 Mark II'),
 dict(l=21, a='Léa M.', t=3, n=5, txt='Boîtier vendu au prix annoncé, compteur conforme, emballage sérieux. Reçu en deux jours.', d='12/09/2026', on='A7 IV'),
 dict(l=13, a='Camille R.', t=4, n=4, txt='Nadia répond vite et le kit était complet. Le sac de transport aurait mérité un nettoyage.', d='29/08/2026', on='Zoom F6'),
 dict(l=3, a='Hugo T.', t=1, n=5, txt='Deuxième location chez Camille, toujours aussi fluide. Prix juste pour du matériel contrôlé.', d='26/09/2026', on='Amaran 200x S'),
 dict(l=23, a='Léa M.', t=2, n=4, txt='Objectif conforme, léger jeu sur la bague de zoom signalé dans l’annonce. Prix honnête.', d='16/09/2026', on='XF 23 mm'),
]
styles = [
 dict(code='interview', name='Interview lumière douce', d='Visage éclairé en douceur, fond légèrement flou, son propre et proche.', ph='h-reportage', need=[
   ('lumiere','Une source douce et large évite les ombres dures sur le visage.',[3,32]),('son','Le micro-cravate garde la voix proche même si la pièce résonne.',[18]),
   ('objectif','Un zoom standard cadre serré ou large sans bouger la caméra.',[2]),('stabilisation','Un trépied à tête fluide stabilise les plans fixes longs.',[19])]),
 dict(code='portrait', name='Portrait studio lumineux', d='Peau nette, arrière-plan très flou, lumière enveloppante.', ph='h-studio', need=[
   ('lumiere','Une lumière continue avec parapluie enveloppe le sujet.',[5]),('objectif','Une focale fixe lumineuse isole le sujet de l’arrière-plan.',[27]),
   ('accessoire','Des pieds de lumière pour positionner les sources.',[8])]),
 dict(code='clip', name='Clip de nuit, néons colorés', d='Ambiance sombre et saturée, couleurs franches, caméra en mouvement.', ph='h-nuit', need=[
   ('lumiere','Des tubes RGB créent les couleurs néon directement dans le cadre.',[7]),('boitier','Un capteur plein format limite le bruit dans les scènes sombres.',[1]),
   ('stabilisation','Un stabilisateur rend les mouvements de caméra fluides.',[31]),('lumiere','Des panneaux RGB pour colorer le décor.',[6])]),
 dict(code='packshot', name='Packshot produit détaillé', d='Détails nets, fond uniforme, lumière maîtrisée sans reflets.', ph='table', need=[
   ('objectif','Un objectif macro révèle les textures et petits détails.',[28]),('accessoire','Un fond infini supprime les arêtes et distractions.',[20]),
   ('lumiere','Une source diffuse réduit les reflets sur les surfaces brillantes.',[32])]),
 dict(code='mariage', name='Film de mariage en mouvement', d='Plans fluides, voix des mariés captées, lumière naturelle.', ph='h-r6', need=[
   ('stabilisation','Suivre les mariés en mouvement sans secousses.',[14]),('son','Des micros sans fil captent les vœux et discours.',[18]),
   ('boitier','Un plein format lumineux pour les églises et salles sombres.',[9])]),
]
demandes = [
 dict(id=1, who='Léa', mine=True, title='Interview d’une artiste dans son atelier', type='Interview', desc='Tournage d’une interview de 20 minutes en intérieur, pièce assez lumineuse mais qui résonne.', budget=150, d0=5, d1=5, city='Paris 18e', has='Sony A7 IV, objectif 28-70', cats=['lumiere','son'], ago='il y a 2 jours',
      offers=[dict(o=1, kit='Amaran 200x S + softbox, Rode Wireless GO II', items=[3,4], total=45, dep=300, mode='Main propre', km=4.2, msg='Je peux vous montrer le réglage de la softbox à la remise.'),
              dict(o=4, kit='Sennheiser EW-DP ME2 (x2), Zoom F6', items=[18,17], total=65, dep=500, mode='Point relais', km=9.8, msg='Deux cravates : pratique si vous filmez aussi la question.'),
              dict(o=2, kit='Godox SL150 III + parapluie, pieds de lumière', items=[5,8], total=28, dep=200, mode='Main propre', km=7.5, msg='')]),
 dict(id=2, who='Mehdi', title='Clip de rap de nuit à Belleville', type='Clip', desc='Deux nuits de tournage en extérieur, ambiance néons.', budget=400, d0=12, d1=13, city='Paris 20e', has='Aucun matériel', cats=['boitier','lumiere','stabilisation'], ago='hier',
      offers=[dict(o=3, kit='Sony A7S III, Sigma 35 mm f/1.4, DJI RS 4', items=[11,12,14], total=270, dep=1500, mode='Main propre', km=6.0, msg='Batteries supplémentaires incluses pour les deux nuits.')]),
 dict(id=3, who='Inès', title='Photos produit pour une marque de bijoux', type='Photo ou vidéo produit', desc='Une journée de packshots, 30 références.', budget=120, d0=8, d1=8, city='Montreuil', has='Canon R6 Mark II', cats=['objectif','accessoire'], ago='il y a 5 h', offers=[]),
]
out = dict(P=P, users=users, items=items, reviews=reviews, styles=styles, demandes=demandes, credits=credits)
js = '/* Données de démo : reprises du jeu d’essai du prototype PHP/MySQL (database/focal_shift.sql). Généré par gen-data.py */\nconst DB=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(D, '3-data.js'), 'w').write(js)
print('data.js', len(js), 'items', len(items), 'no-photo', [i['id'] for i in items if not i['ph']])
