# Icônes de l'application : monogramme F à empattements, en bois clair veiné, dans un cadre
# de mise au point en chêne, sur fond ardoise (charte « club éditorial »). Dessinées sans police.
# Usage : python3 tools/focal/icons.py
import os, math
from PIL import Image, ImageDraw, ImageFilter
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../focal-shift-demo/icons')
os.makedirs(OUT, exist_ok=True)
SLATE, SLATE_HI = (27, 33, 39), (38, 46, 54)
OAK, WOOD_L, WALNUT = (184, 138, 90), (217, 185, 140), (140, 98, 57)
S = 1024

def wood(w, h):
    """Bois clair veiné : dégradé chaud + veines ondulées discrètes."""
    im = Image.new('RGB', (w, h)); px = im.load()
    for y in range(h):
        for x in range(w):
            g = math.sin((x * 0.018) + math.sin(y * 0.006) * 2.2 + math.sin(y * 0.021) * .5)
            v = (g + 1) / 2                      # 0..1 veine
            t = x / w
            base = [WOOD_L[i] * (1 - t * .18) + OAK[i] * (t * .18) for i in range(3)]
            k = 1 - .1 * (v ** 6)                # veines plus sombres, fines
            px[x, y] = tuple(int(c * k) for c in base)
    return im

def draw(size, pad_ratio=0.0, radius=0.0):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bg = Image.new('RGBA', (S, S), SLATE + (255,))
    # léger halo ardoise plus clair en haut à gauche
    glow = Image.new('L', (S, S), 0); ImageDraw.Draw(glow).ellipse([-300, -360, 820, 700], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    bg = Image.composite(Image.new('RGBA', (S, S), SLATE_HI + (255,)), bg, glow)
    mask = Image.new('L', (S, S), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * radius), fill=255)
    im.paste(bg, (0, 0), mask)
    k = 1 - pad_ratio * 2; o = S * pad_ratio
    P = lambda x, y: (o + x * k, o + y * k)
    # F à empattements (masque), rempli de bois
    fm = Image.new('L', (S, S), 0); d = ImageDraw.Draw(fm)
    def rect(x0, y0, x1, y1): d.rectangle([*P(x0, y0), *P(x1, y1)], fill=255)
    rect(392, 286, 482, 738)          # fût
    rect(330, 286, 700, 344)          # barre haute
    rect(652, 286, 700, 404)          # empattement de la barre haute
    rect(392, 494, 620, 548)          # barre médiane
    rect(588, 456, 620, 586)          # empattement médian
    rect(330, 696, 560, 738)          # pied
    im.paste(wood(S, S), (0, 0), fm)
    # cadre de mise au point, filets chêne
    c = ImageDraw.Draw(im); t, L = 14, 104
    for (cx, cy, sx, sy) in [(180, 180, 1, 1), (844, 180, -1, 1), (180, 844, 1, -1), (844, 844, -1, -1)]:
        for (x0, y0, x1, y1) in [(cx, cy, cx + sx * L, cy + sy * t), (cx, cy, cx + sx * t, cy + sy * L)]:
            x0, x1 = sorted([x0, x1]); y0, y1 = sorted([y0, y1]); c.rectangle([*P(x0, y0), *P(x1, y1)], fill=OAK)
    return im.resize((size, size), Image.LANCZOS)

draw(192).save(f'{OUT}/icon-192.png')
draw(512).save(f'{OUT}/icon-512.png')
draw(512, pad_ratio=0.1).save(f'{OUT}/maskable-512.png')
draw(180).convert('RGB').save(f'{OUT}/apple-touch-icon.png')
draw(64, radius=0.18).save(f'{OUT}/favicon-64.png')
print(sorted(os.listdir(OUT)))
