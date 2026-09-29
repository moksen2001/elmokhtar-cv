#!/usr/bin/env python3
"""ENH9 - "Apple grey & blue" re-skin: palette, fonts and a few style tweaks.

Runs LAST in tools/build.sh so it can override everything injected before it.
Idempotent: strips its own <style id="enh9"> block before re-injecting, and the
string replacements only ever map old values to new ones.
The original look is saved on the git branch `backup-design-v1`.
"""
import re

FONTS = ("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@200;300;400;500;600;700;800"
         "&family=Inter:wght@400;500;600&display=swap")

DARK = """--bg:#0A1528;--surface:#0F1D35;--surface-2:#15284A;--ink:#EEF2F8;--ink-2:#C3CDDD;--muted:#8D9AB2;
  --line:#1E2E4C;--teal:#8FB3F0;--teal-2:#B3CBF5;--teal-soft:#13294D;--sun:#EEF2F8;--sun-soft:#15284A;
  --on-teal:#0A1528;--on-sun:#0A1528;--shadow:0 1px 2px rgba(0,0,0,.35),0 16px 40px rgba(0,0,0,.45);"""

CSS = """<style id="enh9">
/* ==== ENH9: Apple grey & blue re-skin (backup of the old design: git branch backup-design-v1) ==== */
:root{
  --bg:#F5F5F7;--surface:#FFFFFF;--surface-2:#EDEDF0;--ink:#1D1D1F;--ink-2:#424245;--muted:#6E6E73;--line:#E0E0E5;
  --teal:#0050A8;--teal-2:#003F87;--teal-soft:#E6EDF7;--sun:#1D1D1F;--sun-soft:#EDEDF0;--on-teal:#FFFFFF;--on-sun:#FFFFFF;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 12px 32px rgba(0,0,0,.07);
  --display:"Inter Tight","Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --body:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){%(dark)s}}
:root[data-theme="dark"]{%(dark)s}

/* type: Inter / Inter Tight, tighter headings */
body{letter-spacing:-.006em;font-feature-settings:"cv11"}
h1,h2{letter-spacing:-.025em}
h3,h4{letter-spacing:-.012em}
.hero h1{font-weight:700;letter-spacing:-.035em}
h2{font-weight:700}

/* labels: sentence case instead of monospace capitals */
.eyebrow,.fact dt,.caps .lbl,.proj .ctx2,.pill,.dlg-body h4,.more-certs .lbl,.row small,.fx-badge,.nt .org,
.qv-top .k,.qv h3,.case-h .c,.stp .l,.vstrip h3{text-transform:none;letter-spacing:0;font-family:var(--body)}
.eyebrow{font-size:.98rem;font-weight:600}
.eyebrow::before{display:none}
.fact dt,.proj .ctx2,.case-h .c,.stp .l,.more-certs .lbl,.caps .lbl,.nt .org,.qv-top .k{font-size:.8rem;font-weight:500}
.dlg-body h4,.qv h3,.vstrip h3{font-size:.98rem;font-weight:600}
.pill,.fx-badge{font-size:.72rem;font-weight:600}
.row small{font-size:.74rem}

/* surfaces: borderless white panels on grey, no cursor glow */
.card{border-color:transparent}
.card::after{display:none}

/* buttons: pills, no shine sweep */
.btn{border-radius:980px;font-weight:500}
.btn.primary::before{display:none}
.quick-btn{font-family:var(--body);font-size:.95rem}

/* bits that had hard-coded green/amber */
.proj .vis .demo-b{background:rgba(29,29,31,.8);color:#fff;border-color:rgba(255,255,255,.14);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.proj .vis .demo-b::before{background:#2997FF}
dialog::backdrop{background:rgba(0,0,0,.4)}
.gallery figcaption{background:rgba(29,29,31,.72)}
.row a.go.mail,.row .dl>summary.go:hover,.row .dl>summary.go:focus-visible{background:var(--teal);color:#fff}

/* ==== "Nuit centrée" (direction D): centred hero, light display type ==== */
h2{font-weight:300;letter-spacing:-.03em}
.hero{background:radial-gradient(ellipse 85% 70% at 50% 0%,#DCE7F7 0%,transparent 70%)}
:root[data-theme="dark"] .hero{background:radial-gradient(ellipse 85% 70% at 50% 0%,#15315E 0%,transparent 72%)}
.orbs{display:none}
.hero-grid{grid-template-columns:1fr;justify-items:center;text-align:center;gap:0}
.hero-grid>div:first-child{display:flex;flex-direction:column;align-items:center}
.portrait{order:-1;justify-self:center;width:auto;max-width:none;margin-bottom:26px}
.portrait .photo{width:112px;height:112px;aspect-ratio:1;border-radius:50%;padding:4px;background:transparent;box-shadow:none;border:1px solid color-mix(in srgb,var(--ink) 25%,transparent)}
.portrait .photo img{border-radius:50%}
.portrait .float-badge,.portrait .route{display:none}
.status{background:none;padding:0;font-weight:500;font-size:.95rem}
.status .pulse{display:none}
.hero h1{font-weight:200;font-size:clamp(2.9rem,8.2vw,6.2rem);letter-spacing:-.045em;margin-top:14px;line-height:1}
.hero h1 br{display:none}
.hero h1 .l2{font-weight:500;color:var(--ink)}
.hero h1 .l2::before{content:" "}
.lede{margin-inline:auto;max-width:40ch}
.hero-sub{margin-inline:auto;max-width:60ch}
.cta{justify-content:center}
.hero .rot{display:grid;justify-items:center;margin-top:2px}
.hero .rot span{justify-self:center}
:root[data-theme="dark"] .btn{background:transparent;border-color:rgba(255,255,255,.2);color:var(--ink)}
:root[data-theme="dark"] .btn.primary{background:#fff;border-color:#fff;color:#0A1528}
:root[data-theme="dark"] .btn.primary:hover{background:#DCE7F7;border-color:#DCE7F7}
:root[data-theme="dark"] .btn:not(.primary):hover{border-color:rgba(255,255,255,.45)}
:root[data-theme="dark"] .card{border-color:var(--line)}
.tldr .k{font-weight:300}
section .head h2{font-weight:400}
@media (max-width:760px){.hero h1{font-size:clamp(2.6rem,13vw,3.6rem)}.hero h1 br{display:inline}.hero h1 .l2::before{content:none}}
</style>""".replace("%(dark)s", DARK)


def run(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'\s*<style id="enh9">.*?</style>', "", s, flags=re.S)
    # fonts
    s = re.sub(r'https://fonts\.googleapis\.com/css2\?family=(?:Bricolage|Inter\+Tight)[^"]*', FONTS, s, count=1)
    # dark text that sat on the amber accent -> follows the new secondary colour
    s = re.sub(r'#1b1405', 'var(--on-sun)', s, flags=re.I)
    # browser chrome colour
    s = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#0A1528">', s)
    i = s.index("</head>")
    s = s[:i] + CSS + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)


for p in ("index.html", "en/index.html"):
    run(p)
print("enhance9: apple re-skin applied")
