#!/usr/bin/env python3
"""Génère les versions WebP des images du site CV (les originaux restent pour les aperçus de lien).
À relancer après l'ajout d'une image : python3 tools/webp.py"""
import glob, os
from PIL import Image
ROOT=os.path.join(os.path.dirname(__file__),'..')
SKIP=('-og.jpg','og-image')
n=b0=b1=0
for f in sorted(glob.glob(ROOT+'/img/*.jpg')+glob.glob(ROOT+'/img/preview/*.jpg')+glob.glob(ROOT+'/img/logos/*.png')):
    if any(k in f for k in SKIP): continue
    out=os.path.splitext(f)[0]+'.webp'
    im=Image.open(f)
    if f.endswith('.png'): im.convert('RGBA').save(out,'WEBP',lossless=True,method=6)
    else: im.convert('RGB').save(out,'WEBP',quality=80,method=6)
    if os.path.getsize(out)>=os.path.getsize(f): os.remove(out); continue
    n+=1; b0+=os.path.getsize(f); b1+=os.path.getsize(out)
# portrait : affiché en pastille de 112 px, une version 336 px suffit (écrans 3x)
p=Image.open(ROOT+'/img/portrait.jpg').convert('RGB'); w=336
p.resize((w,round(p.height*w/p.width)),Image.LANCZOS).save(ROOT+'/img/portrait-s.webp','WEBP',quality=82,method=6)
print(n,'images',b0,'->',b1,'| portrait-s',os.path.getsize(ROOT+'/img/portrait-s.webp'))
