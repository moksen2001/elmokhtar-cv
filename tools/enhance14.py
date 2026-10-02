# Parked sections: kept in the HTML but not displayed (and not counted in the section numbering).
# To bring one back, remove its id from PARKED below and run `sh tools/build.sh`.
#   chiffres = "Ce que disent les chiffres"  ·  cas = "Trois cas concrets"  ·  ia = "Comment je travaille avec l'IA"
# Idempotent; run after enhance13.py.
import re
PARKED = ["chiffres", "cas", "ia"]
CSS = '<style id="enh14">section.block[data-parked]{display:none!important}</style>'

def run(path):
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'<style id="enh14">.*?</style>\n?', "", s, flags=re.S)
    s = re.sub(r'(<section class="block" id="[a-z]+")(?: data-parked| aria-hidden="true")+', r"\1", s)
    for pid in PARKED:
        tag = '<section class="block" id="%s"' % pid
        assert tag in s, (path, pid)
        s = s.replace(tag, tag + " data-parked aria-hidden=\"true\"", 1)
    i = s.index("</head>"); s = s[:i] + CSS + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)

run("index.html"); run("en/index.html"); print("enhance14: parked", PARKED)
