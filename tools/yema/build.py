import subprocess, re, sys
import os; D=os.path.dirname(os.path.abspath(__file__))+'/'
rd=lambda f:open(D+f).read()
head=rd('1-head.html'); body=rd('2-body.html')
js=''.join(rd(f) for f in ['3-core.js','4-engine.js','5-ar.js','6-club.js','8-alive.js','7-init.js'])
js=js.replace('<script>','',1); js=js[:js.rindex('</script>')]
tail='</script>\n</body>\n</html>\n'
css=head[head.index('<style>')+7:head.index('</style>')]
ES=['npx','-y','esbuild@0.23.0']
mini='--min' in sys.argv
if mini:
    css=subprocess.run(ES+['--loader=css','--minify'],input=css,capture_output=True,text=True,check=True).stdout
    r=subprocess.run(ES+['--loader=js','--minify-whitespace','--minify-syntax','--target=es2020'],input=js,capture_output=True,text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    js=r.stdout
head=head[:head.index('<style>')+7]+css+head[head.index('</style>'):]
out=head+body+'<script>\n/* Yema Watch Club — prototype interactif · El Mokhtar Berrada · build minifié (sources lisibles dans tools/yema, build : python3 tools/yema/build.py --min) */\n'+js+tail
open(D+'../../yema-demo/index.html','w').write(out)
open('/tmp/yema-check.js','w').write(js)
print(len(out.encode()))
