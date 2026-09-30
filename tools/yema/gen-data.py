import os
import json
C=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'catalog.json')))
# views: f=face, q=3/4, b=fond, d=cadran, s=profil ; variants: option value -> image indices shown first
O={
'superman-heritage':dict(k='sh',v='fqds',mv=('auto',None),st=['plongee','vintage'],
 fr="La plongeuse iconique de 1963, réinterprétée : cadran beige, lunette tournante graduée et bracelet acier. Dernières pièces disponibles.",
 en="The iconic 1963 diver, reinterpreted: beige dial, graduated rotating bezel and steel bracelet. Last pieces available."),
'superman-steel-blue-cmm-10':dict(k='ssb',v='fbqds',mv=('manu','CMM.10'),st=['plongee','manufacture','moderne'],
 fr="La Superman en acier et cadran bleu, animée par le calibre manufacture CMM.10. Bracelet acier Scales Slim ou caoutchouc FKM intégré.",
 en="The steel Superman with a blue dial, powered by the in-house CMM.10 calibre. Scales Slim steel bracelet or integrated FKM rubber strap."),
'superman-gilt-cmm-10':dict(k='sgi',v='fbqd',mv=('manu','CMM.10'),st=['plongee','vintage','manufacture'],
 fr="Cadran noir aux inscriptions dorées et calibre manufacture CMM.10. Un bracelet caoutchouc FKM intégré est offert avec cette montre.",
 en="Black dial with gilt printing and the in-house CMM.10 calibre. An integrated FKM rubber strap comes free with this watch."),
'superman-worldtime-gmt-coke':dict(k='sgmt',v='fqd',mv=('auto',None),st=['plongee','voyage'],
 fr="Une Superman GMT à lunette « Coke » noire et rouge pour suivre un second fuseau horaire en voyage.",
 en="A Superman GMT with a black-and-red “Coke” bezel to track a second time zone on the road."),
'superman-bronze-cmm-10':dict(k='sbz',v='fbqds',mv=('manu','CMM.10'),st=['plongee','vintage','manufacture'],
 fr="Boîtier bronze de 38,5 mm, cadran vert et calibre CMM.10. Première série de 50 montres par modèle, une par client.",
 en="38.5 mm bronze case, green dial and CMM.10 calibre. First batch of 50 watches per model, one per customer."),
'rallygraf-meca-quartz-ii-reverse-panda':dict(k='rrp',v='fqdFQ',mv=('quartz','Méca-quartz'),st=['chrono','vintage'],var={'Leather Strap':[0,1,2],'Steel Mesh':[3,4,2]},
 fr="Une version contemporaine du chronographe de course légendaire de YEMA, porté par des pilotes de légende. Cadran noir, compteurs blancs.",
 en="A contemporary take on YEMA’s legendary motorsports chronograph worn by racing legends. Black dial, white sub-dials."),
'rallygraf-meca-quartz-ii-panda':dict(k='rpa',v='fqdFQ',mv=('quartz','Méca-quartz'),st=['chrono','vintage'],var={'Leather Strap':[0,1,2],'Steel Mesh':[3,4,2]},
 fr="Le chronographe de course de YEMA en version « panda » : cadran blanc, compteurs noirs, mouvement méca-quartz.",
 en="YEMA’s racing chronograph in “panda” form: white dial, black sub-dials, meca-quartz movement."),
'rallygraf-alpine-cup-series':dict(k='ral',v='fqdFQ',mv=('quartz','Quartz'),st=['chrono','moderne'],var={'Rally Steel Bracelet':[0,1,2],'Rally Leather Strap':[3,4,2]},pre=True,
 fr="Chronométreur officiel de l’Alpine Elf Cup Series, YEMA signe ce chronographe en hommage à l’esprit course d’Alpine. En précommande.",
 en="As Official Timekeeper of the Alpine Elf Cup Series, YEMA designed this chronograph as a tribute to Alpine’s racing spirit. Pre-order."),
'flygraf-pilot':dict(k='fpi',v='fqdFQ',mv=('auto','Sellita SW200'),st=['pilote','vintage'],var={'Steel Bracelet':[0,1,2],'Khaki Leather Strap':[3,4,2]},
 fr="Cadran secteur à l’esprit militaire et mouvement Sellita SW200, réputé pour sa fiabilité.",
 en="A sector dial with a military spirit, powered by the reliable Sellita SW200 movement."),
'flygraf-bi-compax-french-air-force':dict(k='fbc',v='fqds',mv=('quartz','Seiko VK61'),st=['pilote','chrono'],
 fr="Développé avec l’Armée de l’Air et de l’Espace, équipé du calibre hybride Seiko VK61 pour un chronographe fluide.",
 en="Developed with the French Air and Space Force and fitted with Seiko’s VK61 hybrid calibre for a smooth chronograph."),
'flygraf-cpa10':dict(k='fcp',v='fbqs',mv=('manu',None),st=['pilote','manufacture'],
 fr="Montre de pilote à mouvement manufacture. Un bracelet cuir vintage est offert ; aussi disponible « comme neuve ».",
 en="A pilot’s watch with an in-house movement. A vintage leather strap comes free; also available “like new”."),
'navygraf-marine-nationale-cmm-10':dict(k='nmn',v='fbqs',mv=('manu','CMM.10'),st=['plongee','manufacture'],res='70 h',
 fr="Élue meilleure montre française de 2024 : la montre officielle de la Marine nationale, calibre manufacture aux performances chronométriques et 70 h de réserve de marche.",
 en="Voted best French-made watch of 2024: the official French Navy watch, with a chronometer-grade in-house calibre and 70 h power reserve."),
'navygraf-heritage':dict(k='nhe',v='fFqds',mv=('auto',None),st=['plongee','vintage'],var={'Steel Bracelet':[0,2,3,4],'Rubber Strap':[1,3,4]},
 fr="Des proportions affinées et des détails discrets : plus proche que jamais de la Navygraf des années 1970.",
 en="Refined proportions and subtle design cues: closer than ever to the Navygraf of the 1970s."),
'navygraf-meteorite-cmm-10-le':dict(k='nme',v='fbqds',mv=('manu','CMM.10'),st=['plongee','manufacture'],ltd=150,
 fr="Limitée à 150 exemplaires numérotés : chaque cadran est taillé dans la Muonionalusta, l’une des plus anciennes météorites connues. Calibre manufacture CMM.10.",
 en="Limited to 150 individually numbered pieces: every dial is cut from Muonionalusta, one of the oldest known meteorites. In-house CMM.10 calibre."),
'wristmaster-slim-cmm-20':dict(k='wms',v='fbqs',mv=('manu','CMM.20'),st=['moderne','manufacture'],
 fr="Une montre fine au bracelet intégré, animée par le calibre manufacture CMM.20. Pochette de voyage YEMA offerte.",
 en="A slim watch with an integrated bracelet, powered by the in-house CMM.20 calibre. YEMA travel pouch included."),
'skin-diver-cmm-20':dict(k='skd',v='fbqs',mv=('manu','CMM.20'),st=['plongee','vintage','manufacture'],
 fr="La Skin Diver et son calibre manufacture CMM.20. Un bracelet cuir vintage est offert avec cette montre.",
 en="The Skin Diver with its in-house CMM.20 calibre. A vintage leather strap comes free with this watch."),
}
TR={'Leather Strap':('Cuir','Leather strap'),'Steel Mesh':('Milanais acier','Steel mesh'),'Rally Steel Bracelet':('Acier Rally','Rally steel bracelet'),'Rally Leather Strap':('Cuir Rally','Rally leather strap'),
 'Steel Bracelet':('Acier','Steel bracelet'),'Khaki Leather Strap':('Cuir kaki','Khaki leather strap'),'Rubber Strap':('Caoutchouc','Rubber strap'),
 'Scales Slim Steel':('Acier Scales Slim','Scales Slim steel'),'Rubber FKM VITON® Integrated (Small)':('Caoutchouc FKM (S)','FKM rubber (S)'),'Rubber FKM VITON® Integrated (Large)':('Caoutchouc FKM (L)','FKM rubber (L)'),
 'new':('Neuve','New'),'LIKE NEW (YOU SAVE 15%)':('Comme neuve −15 %','Like new −15%')}
out=[]
for c in C:
    o=O[c['id']]
    opts=[]
    for name,vals in c['options']:
        n=name.upper()
        key={'SIZE':'size','BRACELET':'strap','CONDITION':'cond'}[n]
        vv=[]
        for v in vals:
            if key=='size': vv.append([v.replace('mm',' mm'),v.replace('mm',' mm')])
            else: vv.append(list(TR[v]))
        ent={'k':key,'v':vv}
        if key=='strap' and 'var' in o: ent['img']=[o['var'][v] for v in vals]
        opts.append(ent)
    size=float(c['options'][0][1][0].replace('mm',''))
    d=dict(id=o['k'],slug=c['id'],n=c['title'],col=c['collection'],p=int(c['price']),url=c['url'],views=o['v'],n_img=len(c['imgs']),
           mv=o['mv'][0],cal=o['mv'][1],st=o['st'],size=size,opts=opts,fr=o['fr'],en=o['en'])
    for x in ('ltd','pre','res'):
        if x in o: d[x]=o[x]
    if 'manufacture' in c['tags'] and 'manufacture' not in d['st']: d['st'].append('manufacture')
    out.append(d)
js='const WATCHES='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'3-data.js'),'w').write(js)
print(len(js)); print([ (d['id'],d['n_img'],len(d['views'])) for d in out if d['n_img']!=len(d['views'])])
