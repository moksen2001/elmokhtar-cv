# Tests de bout en bout du prototype Focal-Shift (Playwright, Chromium).
# Prérequis : servir le dépôt, ex. (setsid nohup python3 -m http.server 8822 --bind 127.0.0.1 </dev/null >/dev/null 2>&1 &)
# Usage : python3 tools/focal/test_focal.py [--shots DIR] [--pv DIR]
import asyncio, sys, os
from playwright.async_api import async_playwright

URL = os.environ.get('FOCAL_URL', 'http://127.0.0.1:8822/focal-shift-demo/')
SHOTS = sys.argv[sys.argv.index('--shots') + 1] if '--shots' in sys.argv else '/tmp/focal/shots'
PV = sys.argv[sys.argv.index('--pv') + 1] if '--pv' in sys.argv else None
os.makedirs(SHOTS, exist_ok=True)
FAIL = []

def check(cond, msg):
    print(('  ok   ' if cond else '  FAIL ') + msg)
    if not cond: FAIL.append(msg)

async def settle(pg, ms=700):
    await pg.wait_for_timeout(ms)

async def go(pg, route, ms=900):
    await pg.evaluate(f"location.hash = '#{route}'")
    await settle(pg, ms)

TOP = "(() => { const v = document.querySelector('.tabview:not([hidden])') || document.getElementById('views'); const s = v.querySelectorAll(':scope > .screen'); return s[s.length - 1]; })()"

async def layout_ok(pg, label, phone):
    r = await pg.evaluate(f"""(() => {{
      const top = {TOP}; const sc = top && top.querySelector('.sc');
      const de = document.documentElement;
      const over = de.scrollWidth > innerWidth + 1 || (sc && sc.scrollWidth > sc.clientWidth + 1);
      let wide = [];
      if (sc) sc.querySelectorAll('*').forEach(e => {{ const b = e.getBoundingClientRect(); if (b.width && b.right > innerWidth + 1 && !e.closest('.rail, .mchips, .track, .kitrow, .cmpwrap, .gal, .lb')) wide.push(e.className || e.tagName); }});
      return {{ over, wide: wide.slice(0, 5), docScroll: de.scrollHeight - innerHeight, y: scrollY }};
    }})()""")
    check(not r['over'] and not r['wide'], f"{label} : pas de débordement horizontal {r['wide'] if r['wide'] else ''}")
    if phone:
        await pg.mouse.wheel(0, 600); await pg.evaluate('window.scrollTo(0, 400)'); await settle(pg, 150)
        y = await pg.evaluate('scrollY + document.scrollingElement.scrollTop')
        check(r['docScroll'] <= 0 and y == 0, f"{label} : le document ne défile pas (seules les vues internes défilent)")

async def images_ok(pg, label):
    await pg.evaluate(f"(() => {{ const t = {TOP}; t && t.querySelectorAll('img').forEach(i => {{ const b = i.getBoundingClientRect(); if (b.bottom > 0 && b.top < innerHeight && b.width) {{ i.loading = 'eager'; }} }}); }})()")
    for _ in range(20):
        bad = await pg.evaluate(f"""(() => {{ const t = {TOP}; if (!t) return []; return Array.from(t.querySelectorAll('img')).filter(i => {{ const b = i.getBoundingClientRect(); const st = getComputedStyle(i); return b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth && b.width > 2 && st.visibility !== 'hidden'; }}).filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.currentSrc || i.src); }})()""")
        if not bad: break
        await settle(pg, 250)
    check(not bad, f"{label} : images visibles chargées {bad[:3] if bad else ''}")

async def text(pg, sel='body'):
    return await pg.evaluate(f"(() => {{ const t = {TOP}; return (t || document.body).innerText; }})()")

async def click_top(pg, sel, nth=0):
    app = await pg.evaluate("document.documentElement.classList.contains('app')")
    base = '.tabview:not([hidden]) ' if app else '#views '
    loc = pg.locator(f"{base}> .screen:last-child {sel}").nth(nth)
    await loc.scroll_into_view_if_needed()
    await loc.click()

async def run(p, phone):
    tag = 'm' if phone else 'd'
    print(f"\n=== {'iPhone 13' if phone else 'Ordinateur 1440×900'} ===")
    b = await p.chromium.launch(args=['--font-render-hinting=none'])
    ctx = await b.new_context(**p.devices['iPhone 13']) if phone else await b.new_context(viewport={'width': 1440, 'height': 900})
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
    n = [0]
    async def shot(name):
        n[0] += 1; await pg.screenshot(path=f"{SHOTS}/t-{tag}-{n[0]:02d}-{name}.png")

    await pg.goto(URL); await settle(pg, 2200)
    check(await pg.locator('.consent').count() == 1, 'bandeau de consentement affiché au premier passage')
    await shot('accueil')
    await pg.locator('.consent [data-consent="denied"]').click(); await settle(pg, 500)
    check(await pg.evaluate("JSON.parse(localStorage.getItem('focal-shift-v2')).consent") == 'denied', 'refus du consentement mémorisé')
    await layout_ok(pg, 'accueil', phone); await images_ok(pg, 'accueil')
    if phone:
        check(await pg.locator('#tabbar').is_visible(), "barre d'onglets visible")
        check(await pg.evaluate("matchMedia('(max-width: 600px)').matches && document.documentElement.classList.contains('app')"), 'coque application active')

    # Bascule Louer / Acheter
    await pg.locator('.mode [data-mode="buy"]:visible').first.click(); await settle(pg, 900)
    t = await text(pg)
    check(('occasion' in t) or ('à vendre' in t), 'mode Acheter : contenu d’occasion')
    await pg.locator('.mode [data-mode="rent"]:visible').first.click(); await settle(pg, 900)

    # Explorer + filtres + recherche
    if phone: await pg.locator('#tabbar a[data-tab="explore"]').click()
    else: await pg.locator('#topbar a[data-nav="explore"]').click()
    await settle(pg, 1000)
    t = await text(pg); check('25 annonces' in t, 'catalogue location : 25 annonces')
    await click_top(pg, '[data-f="cat"][data-v="son"]'); await settle(pg, 700)
    t = await text(pg); check('6 annonces' in t, 'filtre catégorie Son : 6 annonces')
    if phone:
        await click_top(pg, '[data-act="filters"]'); await settle(pg, 600)
        await pg.locator('.sheet [data-sf="city"][data-v="Boulogne-Billancourt"]').click()
        await pg.locator('.sheet [data-sok]').click(); await settle(pg, 800)
    else:
        await click_top(pg, '[data-f="city"][data-v="Boulogne-Billancourt"]'); await settle(pg, 700)
    t = await text(pg); check('4 annonces' in t, 'filtre ville Boulogne : 4 annonces de son')
    check('city=Boulogne' in await pg.evaluate('location.hash'), 'filtres reflétés dans l’URL (lien profond)')
    await shot('explorer-filtres')
    await go(pg, '/explorer?q=fx3', 1100)
    t = await text(pg); check('FX3' in t and 'pour « fx3 »' in t, 'recherche « fx3 »')
    await layout_ok(pg, 'explorer', phone); await images_ok(pg, 'explorer')

    # Fiche produit : galerie, durée, total, réservation
    await click_top(pg, 'a.card[data-id="1"] h3'); await settle(pg, 1300)
    check('#/p/1' in await pg.evaluate('location.hash'), 'ouverture de la fiche FX3 depuis une carte')
    await images_ok(pg, 'fiche produit'); await layout_ok(pg, 'fiche produit', phone)
    total0 = await pg.evaluate(f"{TOP}.querySelector('[data-v=\"total\"]').textContent")
    await click_top(pg, '[data-dur="7"]'); await settle(pg, 900)
    total1 = await pg.evaluate(f"{TOP}.querySelector('[data-v=\"total\"]').textContent")
    t = await text(pg)
    check(total0 != total1 and '−20' in t, f'durée 1 semaine : total recalculé ({total0} → {total1}) avec remise de 20 %')
    await shot('fiche-location')
    await click_top(pg, '[data-zoom="0"]') if await pg.locator(f"#views [data-zoom], .tabview:not([hidden]) [data-zoom]").count() else None
    await settle(pg, 500)
    check(await pg.locator('.lb').count() == 1, 'visionneuse plein écran ouverte')
    await pg.keyboard.press('Escape'); await settle(pg, 400)
    if phone: await pg.locator('.pbar [data-act="reserve"]').click()
    else: await click_top(pg, '.book [data-act="reserve"]')
    await settle(pg, 1000)
    check('#/reserver/1' in await pg.evaluate('location.hash'), 'passage au récapitulatif de réservation')
    t = await text(pg); check('Paiement simulé' in t, 'mention « Paiement simulé »')
    check(await pg.locator('input[autocomplete*="cc"], input[name*="card"], input[name*="cvv"]').count() == 0, 'aucun champ de carte bancaire')
    await click_top(pg, '[data-cgu]'); await click_top(pg, '[data-pay]'); await settle(pg, 2200)
    t = await text(pg); check('C’est réservé' in t, 'confirmation de location')
    await shot('confirmation-location')

    # Achat
    await go(pg, '/p/21', 1300)
    if phone: await pg.locator('.pbar [data-act="buy"]').click()
    else: await click_top(pg, '.book [data-act="buy"]')
    await settle(pg, 900)
    await click_top(pg, 'input[name="ship"][value="liv"]'); await settle(pg, 300)
    t = await text(pg); check('15 €' in t, 'option livraison assurée ajoutée au total')
    await click_top(pg, '[data-cgu]'); await click_top(pg, '[data-pay]'); await settle(pg, 2200)
    t = await text(pg); check('Commande confirmée' in t, 'confirmation d’achat')

    # Comparateur
    await go(pg, '/explorer?cat=boitier', 1100)
    for i in ('1', '9'):
        await click_top(pg, f'a.card[data-id="{i}"] [data-cmp]'); await settle(pg, 250)
    await settle(pg, 400)
    check(await pg.locator('#tray.on').count() == 1, 'plateau de comparaison visible')
    await pg.locator('#tray .btn-amber').click(); await settle(pg, 1000)
    rows = await pg.evaluate(f"{TOP}.querySelectorAll('.cmp tbody tr').length")
    check(rows >= 8, f'comparateur : tableau de {rows} lignes')
    await shot('comparateur'); await layout_ok(pg, 'comparateur', phone)

    # Conseil
    await go(pg, '/conseil', 900)
    await click_top(pg, '[data-c="usage"][data-v="video"]'); await settle(pg, 700)
    await click_top(pg, '[data-c="mode"][data-v="location"]'); await settle(pg, 400)
    await click_top(pg, '[data-next]'); await settle(pg, 500)
    await click_top(pg, '[data-c="niveau"][data-v="intermediaire"]'); await settle(pg, 700)
    await click_top(pg, '[data-c="mobilite"][data-v="modere"]'); await settle(pg, 700)
    await click_top(pg, '[data-next]'); await settle(pg, 1300)
    t = await text(pg); check('Meilleur choix' in t, 'conseil : recommandations affichées')
    await click_top(pg, '[data-kit]'); await settle(pg, 500)
    t = await text(pg); check('Kit ajouté' in t, 'conseil : kit ajouté aux favoris')
    await shot('conseil-resultats'); await images_ok(pg, 'conseil')

    # Demande de projet → offres → acceptation
    if phone: await pg.locator('#tabbar a[data-tab="demande"]').click()
    else: await pg.locator('#topbar a[href="#/demande"]').click()
    await settle(pg, 1000)
    await click_top(pg, '[data-d="type"][data-v="Interview"]'); await settle(pg, 300)
    await click_top(pg, '[data-next]'); await settle(pg, 600)
    await click_top(pg, '[data-cat="lumiere"]'); await click_top(pg, '[data-cat="son"]'); await settle(pg, 300)
    await click_top(pg, '[data-next]'); await settle(pg, 600)
    await click_top(pg, '[data-next]'); await settle(pg, 1200)
    check('#/demande/1' in await pg.evaluate('location.hash'), 'demande publiée')
    t = await text(pg); check('regardent votre demande' in t, 'attente des offres animée')
    await settle(pg, 3200)
    c1 = await pg.evaluate(f"{TOP}.querySelectorAll('.offer').length")
    await settle(pg, 8000)
    c2 = await pg.evaluate(f"{TOP}.querySelectorAll('.offer').length")
    check(1 <= c1 < c2, f'offres qui arrivent une à une ({c1} puis {c2})')
    await shot('demande-offres')
    boxes = pg.locator(f"{'.tabview:not([hidden])' if phone else '#views'} > .screen:last-child [data-ocmp]")
    await boxes.nth(0).check(); await boxes.nth(1).check(); await settle(pg, 200)
    await click_top(pg, '[data-cmpo]'); await settle(pg, 700)
    check(await pg.locator('.sheet .cmp').count() == 1, 'comparaison des offres')
    await pg.locator('.sheet [data-acc]').first.click(); await settle(pg, 900)
    await pg.locator('.sheet [data-pay]').click(); await settle(pg, 2200)
    t = await text(pg); check('C’est réservé' in t, 'offre acceptée et payée (simulé)')

    # Propriétaire : simulateur + annonce en 3 étapes
    await go(pg, '/proposer', 1000)
    v0 = await pg.evaluate(f"{TOP}.querySelector('[data-verdict]').textContent")
    await pg.evaluate(f"(() => {{ const r = {TOP}.querySelector('[data-s=\"jm\"]'); r.value = 12; r.dispatchEvent(new Event('input', {{bubbles: true}})); }})()"); await settle(pg, 700)
    v1 = await pg.evaluate(f"{TOP}.querySelector('[data-verdict]').textContent")
    check(v0 != v1, 'simulateur de revenus réactif')
    await shot('proprietaire'); await layout_ok(pg, 'propriétaire', phone)
    await go(pg, '/proposer/annonce', 900)
    await click_top(pg, '[data-lref="Sony A7 IV"]'); await settle(pg, 400)
    await click_top(pg, '[data-next]'); await settle(pg, 500)
    t = await text(pg); check('Estimation de revente' in t, 'annonce : estimation affichée')
    await click_top(pg, '[data-next]'); await settle(pg, 500)
    await click_top(pg, '[data-lp="1"]'); await settle(pg, 300)
    await click_top(pg, '[data-next]'); await settle(pg, 1000)
    t = await text(pg); check('Annonce envoyée' in t, 'annonce envoyée en vérification')

    # Réservations, favoris, profil, crédits, confidentialité
    if phone:
        await click_top(pg, '.done ~ div a[href="#/"]'); await settle(pg, 800)
        check(await pg.locator('#tabbar:not(.hide)').count() == 1, "barre d'onglets réaffichée hors tunnel")
        await pg.locator('#tabbar a[data-tab="resa"]').click()
    else: await pg.locator('#topbar a[data-nav="resa"]').click()
    await settle(pg, 900)
    n_bk = await pg.evaluate(f"{TOP}.querySelectorAll('.bk').length")
    check(n_bk >= 4, f'réservations listées ({n_bk})')
    await shot('reservations')
    await go(pg, '/favoris', 900)
    n_f = await pg.evaluate(f"{TOP}.querySelectorAll('.card').length"); check(n_f >= 4, f'favoris ({n_f})')
    await images_ok(pg, 'favoris')
    if phone: await pg.locator('#tabbar a[data-tab="profil"]').click()
    else: await pg.locator('#topbar a[data-nav="profil"]').click()
    await settle(pg, 900)
    t = await text(pg); check('Crédits photos' in t and 'Retour au CV' in t, 'profil : menu complet')
    await shot('profil')
    await go(pg, '/credits', 1000)
    n_c = await pg.evaluate(f"{TOP}.querySelectorAll('.credit-row').length"); check(n_c == 57, f'crédits photos : {n_c} images créditées')
    t = await text(pg); check('CC BY' in t and 'Wikimedia Commons' in t, 'crédits : licences et auteurs')
    await images_ok(pg, 'crédits'); await layout_ok(pg, 'crédits', phone)
    await go(pg, '/confidentialite', 800)
    await click_top(pg, '[data-consent="granted"]'); await settle(pg, 700)
    check(await pg.evaluate("JSON.parse(localStorage.getItem('focal-shift-v2')).consent") == 'granted', 'consentement modifiable')

    # Navigation : retour navigateur, piles par onglet, lien profond
    if phone:
        await pg.locator('#tabbar a[data-tab="explore"]').click(); await settle(pg, 700)
        await go(pg, '/p/14', 1200)
        await pg.locator('#tabbar').evaluate('e => e')
        await pg.evaluate("Nav.tabTap('home')"); await settle(pg, 700)
        await pg.evaluate("Nav.tabTap('explore')"); await settle(pg, 700)
        check('#/p/14' in await pg.evaluate('location.hash'), 'onglet Explorer : pile conservée au retour')
        await pg.go_back(); await settle(pg, 900)
        check('/p/14' not in await pg.evaluate('location.hash'), 'bouton retour : retour à l’écran précédent')
        await go(pg, '/p/31', 1200)
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': 4, 'y': 400}]})
        for x in range(20, 320, 30):
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x, 'y': 402}]}); await pg.wait_for_timeout(16)
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await settle(pg, 1000)
        check('/p/31' not in await pg.evaluate('location.hash'), 'glissement depuis le bord gauche : retour')
    else:
        await go(pg, '/p/14', 1000); await pg.go_back(); await settle(pg, 900)
        check('/p/14' not in await pg.evaluate('location.hash'), 'bouton retour du navigateur')
    pg2 = await ctx.new_page(); await pg2.goto(URL + '#/p/27'); await settle(pg2, 1500)
    t = await pg2.evaluate('document.body.innerText'); check('RF 85' in t, 'lien profond #/p/27')
    await pg2.close()

    check(not errs, 'aucune erreur JavaScript ni console' + ('' if not errs else ' : ' + ' | '.join(errs[:4])))

    if PV:
        os.makedirs(PV, exist_ok=True)
        if not phone:
            await pg.evaluate("localStorage.clear()"); await pg.goto(URL + '#/'); await pg.evaluate("localStorage.setItem('focal-shift-v2', JSON.stringify({consent:'denied', note:true}))"); await pg.reload(); await settle(pg, 4200)
            await pg.screenshot(path=f'{PV}/desktop-home.png')
            await go(pg, '/p/9', 2200); await pg.mouse.move(1400, 880); await settle(pg, 400); await pg.screenshot(path=f'{PV}/desktop-product.png')
    await b.close()

async def pv_phone(p):
    if not PV: return
    b = await p.chromium.launch(args=['--font-render-hinting=none'])
    ctx = await b.new_context(**dict(p.devices['iPhone 13'], viewport={'width': 390, 'height': 844}))  # écran entier, comme l'app installée
    await ctx.add_init_script("if (!localStorage.getItem('focal-shift-v2')) localStorage.setItem('focal-shift-v2', JSON.stringify({consent:'denied', install:false}))")
    pg = await ctx.new_page()
    await pg.goto(URL + '#/'); await settle(pg, 4200); await pg.screenshot(path=f'{PV}/m-home.png')
    await go(pg, '/explorer', 900); await go(pg, '/p/1', 2200); await pg.screenshot(path=f'{PV}/m-product.png')
    await pg.evaluate("Nav.tabTap('demande')"); await settle(pg, 900)
    await go(pg, '/demande/1', 1500)
    await pg.evaluate(f"{TOP}.querySelector('.sc').scrollTo(0, 330)"); await settle(pg, 900)
    await pg.screenshot(path=f'{PV}/m-demande.png')
    await b.close()

async def main():
    async with async_playwright() as p:
        await run(p, False)
        await run(p, True)
        await pv_phone(p)
    print('\n' + ('TOUS LES TESTS PASSENT' if not FAIL else f'{len(FAIL)} ÉCHEC(S) : ' + ' ; '.join(FAIL)))
    sys.exit(1 if FAIL else 0)

asyncio.run(main())
