#!/usr/bin/env python3
"""ENH9 - "Apple grey & blue" re-skin: palette, fonts and a few style tweaks.

Runs LAST in tools/build.sh so it can override everything injected before it.
Idempotent: strips its own <style id="enh9"> block before re-injecting, and the
string replacements only ever map old values to new ones.
The original look is saved on the git branch `backup-design-v1`.
"""
import re

FONTS = ("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800"
         "&family=Inter:wght@400;500;600&display=swap")

DARK = """--bg:#000000;--surface:#1C1C1E;--surface-2:#2C2C2E;--ink:#F5F5F7;--ink-2:#D1D1D6;--muted:#98989D;
  --line:#38383A;--teal:#0A84FF;--teal-2:#409CFF;--teal-soft:#0B2742;--sun:#F5F5F7;--sun-soft:#2C2C2E;
  --on-teal:#FFFFFF;--on-sun:#1D1D1F;--shadow:0 1px 2px rgba(0,0,0,.4),0 12px 32px rgba(0,0,0,.5);"""

CSS = """<style id="enh9">
/* ==== ENH9: Apple grey & blue re-skin (backup of the old design: git branch backup-design-v1) ==== */
:root{
  --bg:#F5F5F7;--surface:#FFFFFF;--surface-2:#EDEDF0;--ink:#1D1D1F;--ink-2:#424245;--muted:#6E6E73;--line:#E0E0E5;
  --teal:#0066CC;--teal-2:#0055B3;--teal-soft:#E8F1FB;--sun:#1D1D1F;--sun-soft:#EDEDF0;--on-teal:#FFFFFF;--on-sun:#FFFFFF;
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
</style>""" % {"dark": DARK}


def run(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'\s*<style id="enh9">.*?</style>', "", s, flags=re.S)
    # fonts
    s = re.sub(r'https://fonts\.googleapis\.com/css2\?family=(?:Bricolage|Inter\+Tight)[^"]*', FONTS, s, count=1)
    # dark text that sat on the amber accent -> follows the new secondary colour
    s = re.sub(r'#1b1405', 'var(--on-sun)', s, flags=re.I)
    # browser chrome colour
    s = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#F5F5F7">', s)
    i = s.index("</head>")
    s = s[:i] + CSS + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)


for p in ("index.html", "en/index.html"):
    run(p)
print("enhance9: apple re-skin applied")
