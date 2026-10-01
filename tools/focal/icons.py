# Icônes de l'application (monogramme F dans un cadre de mise au point), dessinées sans police.
import os
from PIL import Image, ImageDraw
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../focal-shift-demo/icons')
os.makedirs(OUT, exist_ok=True)
AMBER, INK = (245, 180, 0), (22, 22, 22)
def draw(size, pad_ratio=0.0, radius=0.0):
    S = 1024; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius), fill=AMBER)
    k = 1 - pad_ratio * 2; o = S * pad_ratio
    P = lambda x, y: (o + x * k, o + y * k)
    def rect(x0, y0, x1, y1): d.rectangle([*P(x0, y0), *P(x1, y1)], fill=INK)
    # F expansé
    rect(330, 268, 470, 756)          # fût
    rect(330, 268, 712, 392)          # barre haute
    rect(330, 470, 640, 584)          # barre médiane
    # coins de mise au point
    t, L = 34, 120
    for (cx, cy, sx, sy) in [(176, 176, 1, 1), (848, 176, -1, 1), (176, 848, 1, -1), (848, 848, -1, -1)]:
        x0, x1 = sorted([cx, cx + sx * L]); y0, y1 = sorted([cy, cy + sy * t]); rect(x0, y0, x1, y1)
        x0, x1 = sorted([cx, cx + sx * t]); y0, y1 = sorted([cy, cy + sy * L]); rect(x0, y0, x1, y1)
    return im.resize((size, size), Image.LANCZOS)
draw(192).save(f'{OUT}/icon-192.png')
draw(512).save(f'{OUT}/icon-512.png')
draw(512, pad_ratio=0.1).save(f'{OUT}/maskable-512.png')
draw(180).convert('RGB').save(f'{OUT}/apple-touch-icon.png')
draw(64, radius=0.18).save(f'{OUT}/favicon-64.png')
print(sorted(os.listdir(OUT)))
