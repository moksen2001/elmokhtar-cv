import subprocess, re, sys
import os; D=os.path.dirname(os.path.abspath(__file__))+'/'
rd=lambda f:open(D+f).read()
head=rd('1-head.html'); body=rd('2-body.html')
FILES=['0-open.js','3-data.js','4-core.js','5-nav.js','6-screens.js','7-shop.js','8-ar.js','9-collection.js','10-club.js','11-profile.js','12-init.js']
js=''.join(rd(f) for f in FILES)
js=js.replace('<script>','',1); js=js[:js.rindex('</script>')]
tail='</script>\n</body>\n</html>\n'
css=head[head.index('<style>')+7:head.index('</style>')]
ES=['npx','-y','esbuild@0.23.0']
mini='--min' in sys.argv
if mini:
    css=subprocess.run(ES+['--loader=css','--minify'],input=css,capture_output=True,text=True,check=True).stdout
    r=subprocess.run(ES+['--loader=js','--minify','--target=es2020'],input=js,capture_output=True,text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    js=r.stdout
head=head[:head.index('<style>')+7]+css+head[head.index('</style>'):]
out=head+body+'<script>\n/* Yema Watch Club — prototype interactif · El Mokhtar Berrada · build minifié (sources lisibles dans tools/yema, build : python3 tools/yema/build.py --min) */\n'+js+tail
open(D+'../../yema-demo/index.html','w').write(out)
open('/tmp/yema-check.js','w').write(js)
import glob
img=sum(os.path.getsize(p) for p in glob.glob(D+'../../yema-demo/img/**/*.webp',recursive=True))
print('images',img)
print(len(out.encode()))
