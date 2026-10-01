/* =====================================================================
   Fiche produit, calendrier, réservation, achat, confirmation
   ===================================================================== */
function credit(p) {
  const c = DB.credits.find(x => x.s === p.t); if (!c) return '';
  return `Photo : ${esc(c.author)}, ${esc(c.lic)}, Wikimedia Commons${c.note ? ` (${esc(c.note)})` : ''}. <a class="link" href="#/credits">Crédits</a>`;
}
function gallery(it, vtName) {
  const ph = photosOf(it), label = fullName(it);
  if (!ph.length) return `<div class="gal"><div class="main">${pic(null, { cls: 'r43', alt: label })}</div><p class="credit">Le propriétaire n’a pas encore ajouté de photo ; l’équipe la demande avant la mise en ligne.</p></div>`;
  return `<div class="gal" data-gal>
    <div class="main"><div class="track" data-track>${ph.map((p, i) => `<div data-zoom="${i}">${pic(p, { alt: label + ', photo ' + (i + 1), eager: i === 0, sizes: '(max-width:600px) 100vw, 760px', cls: '' })}</div>`).join('')}</div>
      ${ph.length > 1 ? `<button class="arr l" type="button" data-gs="-1" aria-label="Photo précédente">${ico('back')}</button><button class="arr r" type="button" data-gs="1" aria-label="Photo suivante">${ico('next')}</button>` : ''}
      <span class="count" data-gc>01 / ${String(ph.length).padStart(2, '0')}</span>
      ${ph.length > 1 ? `<div class="dots">${ph.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
    </div>
    ${ph.length > 1 ? `<div class="thumbs">${ph.map((p, i) => `<button type="button" data-gt="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}">${pic(p, { sizes: '80px' })}</button>`).join('')}</div>` : ''}
    <p class="credit" data-gcred>${credit(ph[0])}</p>
  </div>`;
}
function mountGallery(el, it) {
  const g = $('[data-gal]', el); if (!g) return;
  const tr = $('[data-track]', g), ph = photosOf(it);
  const cur = () => Math.round(tr.scrollLeft / tr.clientWidth);
  const upd = () => { const i = cur(); $('[data-gc]', g).textContent = `${String(i + 1).padStart(2, '0')} / ${String(ph.length).padStart(2, '0')}`; $$('[data-gt]', g).forEach((b, k) => b.setAttribute('aria-current', k === i)); $$('.dots i', g).forEach((d, k) => d.classList.toggle('on', k === i)); const c = $('[data-gcred]', g); if (c && ph[i]) c.innerHTML = credit(ph[i]); };
  tr.addEventListener('scroll', () => { cancelAnimationFrame(tr._r); tr._r = requestAnimationFrame(upd); }, { passive: true });
  g.addEventListener('click', ev => {
    const s = ev.target.closest('[data-gs]'); if (s) { tr.scrollTo({ left: (cur() + +s.dataset.gs + ph.length) % ph.length * tr.clientWidth, behavior: 'smooth' }); return; }
    const t = ev.target.closest('[data-gt]'); if (t) { tr.scrollTo({ left: +t.dataset.gt * tr.clientWidth, behavior: 'smooth' }); return; }
    const z = ev.target.closest('[data-zoom]'); if (z) openLightbox(ph, +z.dataset.zoom, fullName(it));
  });
}

/* Calendrier de plage de dates */
function calendar(id, a, b, months = 2) {
  const bk = bookedSet(id), out = [];
  for (let m = 0; m < months; m++) {
    const first = new Date(today.getFullYear(), today.getMonth() + m, 1), dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const off = (first.getDay() + 6) % 7;
    let d = '';
    for (let i = 0; i < off; i++) d += '<span></span>';
    for (let k = 1; k <= dim; k++) {
      const day = new Date(first.getFullYear(), first.getMonth(), k), s = iso(day);
      const past = day < addDays(today, 1), isB = bk.has(s);
      const cls = [isB ? 'booked' : '', a && iso(a) === s ? 'a' : '', b && iso(b) === s ? 'b' : '', a && b && day > a && day < b ? 'in' : '', iso(today) === s ? 'today' : ''].join(' ');
      d += `<button type="button" data-day="${s}" class="${cls}" ${past || isB ? 'disabled' : ''} aria-label="${day.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${isB ? ', déjà réservé' : ''}" aria-pressed="${!!(a && (iso(a) === s || (b && iso(b) === s)))}">${k}</button>`;
    }
    out.push(`<div><div class="mh">${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div><div class="wd">${['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map(x => `<span>${x}</span>`).join('')}</div><div class="days">${d}</div></div>`);
  }
  return `<div class="cal" style="--m:${months}">${out.join('')}</div><div class="cal-legend"><span><i style="background:var(--ink)"></i>Vos dates</span><span><i style="background:var(--sunk);box-shadow:inset 0 0 0 1px #bbb"></i>Déjà réservé</span><span>Remise de 10 % dès 3 jours, 20 % dès 7 jours</span></div>`;
}
/* Sélecteur : clic 1 = début, clic 2 = fin ; refuse une plage qui chevauche une réservation */
function calPicker(root, id, get, set) {
  let pending = null;
  root.addEventListener('click', ev => {
    const b = ev.target.closest('[data-day]'); if (!b || b.disabled) return;
    const d = fromIso(b.dataset.day);
    if (!pending) { pending = d; set(d, d, true); return; }
    let a = pending, z = d; if (z < a) [a, z] = [z, a];
    pending = null;
    if (!rangeFree(id, a, z)) { toast('Ces dates chevauchent une réservation existante.', 'info'); set(d, d, true); pending = d; return; }
    set(a, z, false);
  });
}

function ownerBlock(u, it) {
  return `<div class="ownercard"><span class="avatar a${u.id}">${initials(u.name)}</span><div><div class="n">${esc(u.name)} ${u.pro ? '<span class="tag">Pro</span>' : ''}</div><div class="small muted">${esc(u.city)}, ${km(u.km)} de vous · ${u.rating ? '★ ' + String(u.rating.toFixed(1)).replace('.', ',') + ' sur ' + u.n + ' transactions' : 'Nouveau membre'}</div><div class="xs" style="margin-top:4px;display:flex;gap:10px;flex-wrap:wrap"><span class="tag ok">${ico('shield')}Identité vérifiée</span><span class="tag">${ico('clock')}${u.resp}</span></div></div>
    <a class="btn btn-line web-only" href="#/explorer?o=${u.id}">Ses annonces</a></div>${u.bio ? `<p class="small muted" style="margin:14px 0 0">« ${esc(u.bio)} »</p>` : ''}`;
}
function rentLines(q) {
  return `<div class="lines num" aria-live="polite">
    <div><span data-l="base">${eur0(q.brut / q.n)} × ${plural(q.n, 'jour')}</span><span data-v="brut">${eur(q.brut)}</span></div>
    <div class="neg" ${q.disc ? '' : 'hidden'} data-row="disc"><span>Remise durée (−${Math.round(q.rate * 100)} %)</span><span data-v="disc">−${eur(q.disc)}</span></div>
    <div><span>Frais de service (8 %)</span><span data-v="fee">${eur(q.fee)}</span></div>
    <div><span>Assurance casse et vol</span><span data-v="ins">${eur(q.ins)}</span></div>
    <div class="tot"><span>Total</span><span data-v="total">${eur(q.total)}</span></div>
    <div class="cau"><span>Caution, bloquée puis libérée</span><span>${eur0(q.dep)}</span></div>
  </div>`;
}
function updLines(root, q) {
  $$('[data-l="base"]', root).forEach(e => { e.textContent = `${eur0(q.brut / q.n)} × ${plural(q.n, 'jour')}`; });
  $$('[data-row="disc"]', root).forEach(e => { e.hidden = !q.disc; $('span', e).textContent = `Remise durée (−${Math.round(q.rate * 100)} %)`; });
  ['brut', 'fee', 'ins', 'total'].forEach(k => $$(`[data-v="${k}"]`, root).forEach(e => countTo(e, q[k])));
  $$('[data-v="disc"]', root).forEach(e => countTo(e, q.disc, v => '−' + eur(v)));
}

SCREENS.product = ([id]) => {
  const it = byId(id); if (!it) return SCREENS.home();
  const u = user(it.o), app = isApp(), rent = it.mode === 'rent';
  let [a, b] = S.dates && rangeFree(it.id, fromIso(S.dates[0]), fromIso(S.dates[1])) && fromIso(S.dates[0]) > today ? S.dates.map(fromIso) : firstFree(it.id, 3);
  let q = rent ? quote(it, a, b) : null;
  const ph = photosOf(it), disc = !rent ? Math.round((1 - it.price / it.ref) * 100) : 0;
  const revs = DB.reviews.filter(r => r.t === it.o);
  const kit = ITEMS.filter(x => x.mode === it.mode && x.id !== it.id && x.cat !== it.cat && (!x.mount || !it.mount || x.mount === it.mount)).sort((x, y) => (user(y.o).rating || 0) - (user(x.o).rating || 0)).slice(0, 8);
  const sim = ITEMS.filter(x => x.mode === it.mode && x.id !== it.id && x.cat === it.cat).slice(0, 8);
  const durs = [[1, '1 jour'], [2, 'Week-end'], [3, '3 jours'], [7, '1 semaine']];
  const durChips = `<div class="chips" data-durs>${durs.map(([n, l]) => `<button class="chip" type="button" data-dur="${n}" aria-pressed="${q && q.n === n}">${l}</button>`).join('')}</div>`;
  const bookCard = rent
    ? `<div class="pr num">${eur0(it.day)} <small>/ jour</small></div><div class="sub">Au lieu d’acheter ${eur0(it.ref)} neuf · remise dès 3 jours</div><div class="bown"><span class="avatar s a${u.id}">${initials(u.name)}</span><div><b class="small">${esc(u.name)}</b><div class="xs muted">${esc(u.city)}, ${km(u.km)} · ${u.rating ? '★ ' + String(u.rating.toFixed(1)).replace('.', ',') : 'Nouveau'} · identité vérifiée</div></div></div>
       <button class="datebtn" type="button" data-act="dates"><span><small>Du</small><b data-da>${dLong(a)}</b></span><span><small>Au</small><b data-db>${dLong(b)}</b></span></button>
       ${durChips}${rentLines(q)}
       <div class="acts"><button class="btn btn-amber btn-l" type="button" data-act="reserve">Réserver</button><button class="heart inline" type="button" data-fav="${it.id}" aria-pressed="${S.favs.includes(it.id)}" aria-label="Favori">${ico('heart')}</button><button class="iconbtn heart inline" type="button" data-cmp="${it.id}" aria-pressed="${S.compare.includes(it.id)}" aria-label="Comparer">${ico('compare')}</button></div>
       <div class="note-ok">${ico('lock', 's')}<span>Aucun débit avant la confirmation du propriétaire. Annulation gratuite jusqu’à 48 h avant.</span></div>`
    : `<div class="pr num">${eur0(it.price)}</div><div class="sub"><s>${eur0(it.ref)} neuf</s> · <b style="color:var(--ok)">−${disc} %, soit ${eur0(it.ref - it.price)} économisés</b></div><div class="bown"><span class="avatar s a${u.id}">${initials(u.name)}</span><div><b class="small">${esc(u.name)}</b><div class="xs muted">${esc(u.city)}, ${km(u.km)} · ${u.rating ? '★ ' + String(u.rating.toFixed(1)).replace('.', ',') : 'Nouveau'} · identité vérifiée</div></div></div>
       <div class="lines num"><div><span>Prix</span><span>${eur(it.price)}</span></div><div><span>Frais de service (5 %)</span><span>${eur(it.price * .05)}</span></div><div><span>Livraison assurée ou main propre</span><span>0 à 15 €</span></div><div class="tot"><span>Total dès</span><span>${eur(it.price * 1.05)}</span></div></div>
       ${it.warranty ? `<div class="note-ok" style="margin:0 0 14px">${ico('shield', 's')}<span>Garantie Focal-Shift ${it.warranty} mois, 14 jours pour signaler un écart avec l’annonce.</span></div>` : ''}
       <div class="acts"><button class="btn btn-amber btn-l" type="button" data-act="buy">Acheter</button><button class="heart inline" type="button" data-fav="${it.id}" aria-pressed="${S.favs.includes(it.id)}" aria-label="Favori">${ico('heart')}</button><button class="iconbtn heart inline" type="button" data-cmp="${it.id}" aria-pressed="${S.compare.includes(it.id)}" aria-label="Comparer">${ico('compare')}</button></div>
       <div class="note-ok">${ico('lock', 's')}<span>Le paiement est conservé par Focal-Shift et versé au vendeur après votre réception.</span></div>`;
  const checks = [
    it.checked ? 'Contrôle physique par l’équipe Focal-Shift' : 'Annonce vérifiée, contrôle physique sur demande',
    'Identité du propriétaire vérifiée',
    it.shots ? `Compteur : ${nf0.format(it.shots)} déclenchements` : (it.cat === 'objectif' ? 'Optique, autofocus et monture testés' : 'Fonctionnement testé à la remise'),
    'Numéro de série enregistré',
    rent ? 'État des lieux photographié au départ et au retour' : (it.warranty ? `Garantie ${it.warranty} mois` : 'Retour possible sous 14 jours si non conforme'),
    rent ? 'Assurance casse et vol incluse dans le devis' : 'Paiement versé après réception',
  ];
  const specs = [['Marque et modèle', fullName(it)], ['Catégorie', CAT1[it.cat]], it.mount && ['Monture', it.mount], it.weight && ['Poids', it.weight + ' g'], ['Acheté en', it.year], ['État', STATE[it.state]], ['Prix neuf de référence', eur0(it.ref)], it.shots && ['Déclenchements', nf0.format(it.shots)]].filter(Boolean);
  const SC = ['Autofocus', 'Basse lumière', 'Stabilisation', 'Rafale', 'Vidéo', 'Prise en main'];
  const titleBlock = `<div class="ptitle"><div class="brand">${esc(it.brand)} · ${CAT1[it.cat]}${it.mount ? ', monture ' + it.mount : ''}</div><h1>${esc(it.model)}</h1></div>
      <div class="pmeta"><span class="tag ${rent ? 'amber' : 'ink'}">${rent ? 'À louer' : 'À vendre'}</span><span class="tag">État : ${STATE[it.state]}</span>${it.checked ? `<span class="tag ok">${ico('shield')}Contrôlé</span>` : ''}${it.warranty && !rent ? `<span class="tag">Garantie ${it.warranty} mois</span>` : ''}</div>`;
  const main = `
    ${app ? '' : `<div class="crumbs"><a href="#/">Accueil</a><span>/</span><a href="#/explorer">${rent ? 'Louer' : 'Acheter'}</a><span>/</span><a href="#/explorer?cat=${it.cat}">${CATS[it.cat]}</a><span>/</span><span>${esc(it.model)}</span></div>`}
    ${app ? '' : titleBlock}
    <div class="pgrid"><div>
      ${gallery(it)}
      ${app ? titleBlock : ''}
      ${it.blurb ? `<p class="lead" style="font-size:1.05rem">${esc(it.blurb)} ${esc(it.spec.charAt(0).toUpperCase() + it.spec.slice(1))}.</p>` : `<p class="lead" style="font-size:1.05rem">${esc(it.spec.charAt(0).toUpperCase() + it.spec.slice(1))}.</p>`}
      ${app && rent ? `<div class="psec"><h2>Vos dates</h2><button class="datebtn" type="button" data-act="dates"><span><small>Du</small><b data-da>${dLong(a)}</b></span><span><small>Au</small><b data-db>${dLong(b)}</b></span></button>${durChips}${rentLines(q)}</div>` : ''}
      ${app && !rent ? `<div class="psec"><h2>Prix</h2><div class="pr num" style="font-family:var(--display);font-variation-settings:'wdth' 115;font-size:2rem;font-weight:780">${eur0(it.price)} <s class="muted" style="font-size:1rem;font-weight:400">${eur0(it.ref)} neuf</s></div><p class="small" style="color:var(--ok);font-weight:600;margin-top:4px">−${disc} %, soit ${eur0(it.ref - it.price)} économisés</p>${it.warranty ? `<p class="small muted">Garantie Focal-Shift ${it.warranty} mois.</p>` : ''}</div>` : ''}
      <div class="psec"><h2>${rent ? 'Proposé par' : 'Vendu par'}</h2>${ownerBlock(u, it)}</div>
      <div class="psec"><h2>Ce qui a été vérifié</h2><ul class="checks">${checks.map(c => `<li>${ico('check')}<span>${esc(c)}</span></li>`).join('')}</ul><p class="small muted" style="margin:14px 0 0"><b>${STATE[it.state]}</b> : ${esc(STATE_D[it.state])}</p></div>
      ${rent ? `<div class="psec"><h2>Disponibilités</h2><div data-cal>${calendar(it.id, a, b, app ? 1 : 2)}</div></div>` : ''}
      <div class="psec"><h2>Caractéristiques</h2><dl class="specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${it.acc ? `<p class="small" style="margin:14px 0 0"><b>Fourni avec :</b> ${esc(it.acc)}.</p>` : ''}</div>
      ${it.scores ? `<div class="psec"><h2>Notes techniques</h2><div class="scores">${SC.map((l, k) => `<div class="row"><span>${l}</span><span class="b"><i style="width:${it.scores[k] * 20}%"></i></span><b class="num">${it.scores[k]}/5</b></div>`).join('')}</div><p class="xs muted" style="margin:12px 0 0">Notes indicatives du référentiel Focal-Shift, utilisées par le <a class="link" href="#/conseil">conseil par usage</a>.</p></div>` : ''}
      ${revs.length ? `<div class="psec"><h2>Avis sur ${esc(u.name)}</h2><div style="display:grid;gap:12px">${revs.slice(0, 3).map(revCard).join('')}</div></div>` : ''}
    </div>
    <aside class="book web-only" aria-label="${rent ? 'Réservation' : 'Achat'}">${bookCard}</aside></div>
    ${kit.length ? `<section class="sec">${secHead('Compléter le kit', rent ? 'Compatible et disponible aux mêmes dates.' : 'Compatible avec cette annonce.', null, !app)}${rail(kit.map((x, i) => card(x, { i, sizes: '(max-width:600px) 66vw, 264px' })).join(''))}</section>` : ''}
    ${sim.length ? `<section class="sec">${secHead('Annonces similaires', '', ['Tout voir', '#/explorer?cat=' + it.cat], !app)}${rail(sim.map((x, i) => card(x, { i, sizes: '(max-width:600px) 66vw, 264px' })).join(''))}</section>` : ''}`;
  const bar = rent
    ? `<div class="p"><b class="num" data-v="total">${eur(q.total)}</b><span data-pbs>${plural(q.n, 'jour')}, ${period(a, b)}</span></div><button class="btn btn-amber btn-l" type="button" data-act="reserve">Réserver</button>`
    : `<div class="p"><b class="num">${eur0(it.price)}</b><span>Garantie ${it.warranty || 0} mois · ${esc(u.city)}</span></div><button class="btn btn-amber btn-l" type="button" data-act="buy">Acheter</button>`;
  return {
    title: it.model, hideTabs: true, navOver: true, overAt: 300, large: false, bar: app ? bar : '', pcls: 'pp', html: main,
    actions: `<button class="iconbtn heart" type="button" data-fav="${it.id}" aria-pressed="${S.favs.includes(it.id)}" aria-label="Favori" style="position:static;color:var(--ink);filter:none">${ico('heart')}</button><button class="iconbtn" type="button" data-act="share" aria-label="Partager">${ico('share')}</button>`,
    mount(el) {
      track('view_item', { item_id: it.id, item_name: fullName(it), price: rent ? it.day : it.price });
      mountGallery(el, it);
      if (Nav.vtId === it.id) { const im = $('[data-gal] .ph', el); if (im) im.style.viewTransitionName = 'pimg'; Nav.vtId = null; }
      const setR = (x, y, partial) => {
        a = x; b = y;
        const c = $('[data-cal]', el); if (c) c.innerHTML = calendar(it.id, a, partial ? null : b, app ? 1 : 2);
        if (partial) return;
        S.dates = [iso(a), iso(b)]; save();
        q = quote(it, a, b);
        $$('[data-da]', el).forEach(e => { e.textContent = dLong(a); }); $$('[data-db]', el).forEach(e => { e.textContent = dLong(b); });
        $$('[data-dur]', el).forEach(d => d.setAttribute('aria-pressed', +d.dataset.dur === q.n));
        updLines(el, q);
        const pbs = $('[data-pbs]', el); if (pbs) pbs.textContent = `${plural(q.n, 'jour')}, ${period(a, b)}`;
      };
      el._setR = setR;
      const c = $('[data-cal]', el); if (c) calPicker(c, it.id, () => [a, b], setR);
      el.addEventListener('click', ev => {
        const d = ev.target.closest('[data-dur]');
        if (d) { const n = +d.dataset.dur; let x = a; let y = addDays(x, n - 1); if (!rangeFree(it.id, x, y)) { [x, y] = firstFree(it.id, n, 1); toast('Dates décalées : ' + period(x, y), 'cal'); } setR(x, y); }
        const act = ev.target.closest('[data-act]'); if (!act) return;
        const k = act.dataset.act;
        if (k === 'dates') openDates(it, a, b, setR);
        if (k === 'reserve') { track('begin_checkout', { item_id: it.id, value: q.total }); Nav.go(`/reserver/${it.id}?a=${iso(a)}&b=${iso(b)}`); }
        if (k === 'buy') { track('begin_checkout', { item_id: it.id, value: it.price }); Nav.go(`/acheter/${it.id}`); }
        if (k === 'share') { const url = location.href; if (navigator.share) navigator.share({ title: fullName(it), url }).catch(() => {}); else { navigator.clipboard && navigator.clipboard.writeText(url).catch(() => {}); toast('Lien copié'); } }
      });
    },
  };
};
function openDates(it, a, b, setR) {
  let x = a, y = b;
  openSheet({
    title: 'Choisir vos dates', wide: !isApp(),
    html: `<p class="small muted" style="margin-top:0">Touchez le premier puis le dernier jour. Les jours barrés sont déjà réservés.</p><div data-sc>${calendar(it.id, x, y, isApp() ? 2 : 2)}</div>`,
    foot: `<div style="flex:1"><b class="num" data-st>${plural(nDays(x, y), 'jour')}</b><div class="xs muted" data-sp>${period(x, y)}</div></div><button class="btn btn-ink" type="button" data-ok>Valider ces dates</button>`,
    onMount(el, sh) {
      const sc = $('[data-sc]', el);
      calPicker(sc, it.id, () => [x, y], (p, r, partial) => {
        x = p; y = r; sc.innerHTML = calendar(it.id, x, partial ? null : y, 2);
        $('[data-st]', el).textContent = partial ? 'Choisissez la fin' : plural(nDays(x, y), 'jour'); $('[data-sp]', el).textContent = partial ? 'à partir du ' + dShort(x) : period(x, y);
        $('[data-ok]', el).disabled = !!partial;
      });
      $('[data-ok]', el).onclick = () => { setR(x, y); sh.close(); };
    },
  });
}

/* ---------- Réservation (location) ---------- */
SCREENS.checkout = ([id], qs) => {
  const it = byId(id), u = user(it.o);
  let a = qs.a ? fromIso(qs.a) : firstFree(it.id)[0], b = qs.b ? fromIso(qs.b) : firstFree(it.id)[1];
  const q = quote(it, a, b);
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/p/${it.id}">${esc(it.model)}</a><span>/</span><span>Réservation</span></div><h1 style="margin-bottom:24px">Confirmer et payer</h1>`}
    <div class="ck"><div>
      <div class="box"><div class="sumitem">${pic(photosOf(it)[0], { sizes: '120px' })}<div><span class="xs muted">${esc(it.brand)}</span><h3>${esc(it.model)}</h3><div class="small muted">Chez ${esc(u.name)}, ${esc(u.city)}</div></div></div></div>
      <div class="box"><h2>Vos dates</h2><div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><b>${period(a, b).replace(/^./, c => c.toUpperCase())}</b><div class="small muted">${plural(q.n, 'jour')} de location</div></div><a class="btn btn-line" href="#/p/${it.id}" data-act="back-dates">Modifier</a></div></div>
      <div class="box"><h2>Remise du matériel</h2><div class="radios">
        <label class="radio"><input type="radio" name="ship" value="main" checked><span><b>En main propre</b><small>${esc(u.city)}, à ${km(u.km)}. État des lieux photographié ensemble.</small></span><b>Gratuit</b></label>
        <label class="radio"><input type="radio" name="ship" value="liv"><span><b>Livraison assurée</b><small>Aller et retour par coursier, la veille du début.</small></span><b>+ 15 €</b></label>
      </div></div>
      <div class="box"><h2>Paiement</h2><div class="simpay">${ico('info')}<div><b>Paiement simulé.</b> Ce prototype ne demande aucun moyen de paiement. En production, le paiement passe par un prestataire agréé et la caution est une simple empreinte bancaire.</div></div>
        <label class="check" style="margin-top:16px"><input type="checkbox" data-cgu> J’accepte les conditions de location, dont l’état des lieux au départ et au retour.</label></div>
    </div>
    <div><div class="box" style="position:sticky;top:16px"><h2>Récapitulatif</h2><div data-lines>${rentLines(q)}</div><div class="lines num" style="margin-top:-6px" data-shiprow hidden><div><span>Livraison assurée</span><span>15 €</span></div></div>
      <button class="btn btn-amber btn-l btn-block" type="button" data-pay disabled>Payer ${eur(q.total)} (simulé)</button>
      <p class="xs muted" style="margin:10px 0 0">Annulation gratuite jusqu’à 48 h avant le début. La caution n’est débitée qu’en cas de dommage constaté contradictoirement.</p></div></div></div>`;
  return {
    title: 'Réservation', hideTabs: true, html,
    mount(el) {
      let tot = q.total, ship = 'main';
      const pay = $('[data-pay]', el), cgu = $('[data-cgu]', el);
      const upd = () => { tot = q.total + (ship === 'liv' ? 15 : 0); $('[data-shiprow]', el).hidden = ship !== 'liv'; countTo($('[data-v="total"]', el), tot); pay.textContent = `Payer ${eur(tot)} (simulé)`; pay.disabled = !cgu.checked; };
      el.addEventListener('change', ev => { if (ev.target.name === 'ship') ship = ev.target.value; upd(); });
      $('[data-act="back-dates"]', el).addEventListener('click', ev => { ev.preventDefault(); Nav.back(); });
      pay.addEventListener('click', () => {
        pay.disabled = true; pay.innerHTML = '<span class="spin"></span>Paiement en cours';
        setTimeout(() => {
          const ref = 'FS-L-' + String(Math.floor(1000 + Math.random() * 8999));
          S.bookings.unshift({ ref, item: it.id, a: iso(a), b: iso(b), total: tot, dep: q.dep, status: 'confirmée', ship, at: iso(today) });
          S.dates = null; save();
          track('purchase', { transaction_id: ref, value: tot, currency: 'EUR', items: [{ item_id: it.id, item_name: fullName(it) }] });
          Nav.go('/ok/' + ref, { replace: true });
        }, 1100);
      });
    },
  };
};

/* ---------- Achat ---------- */
SCREENS.buy = ([id]) => {
  const it = byId(id), u = user(it.o);
  const q = buyQuote(it, false);
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/p/${it.id}">${esc(it.model)}</a><span>/</span><span>Achat</span></div><h1 style="margin-bottom:24px">Finaliser l’achat</h1>`}
    <div class="ck"><div>
      <div class="box"><div class="sumitem">${pic(photosOf(it)[0], { sizes: '120px' })}<div><span class="xs muted">${esc(it.brand)}</span><h3>${esc(it.model)}</h3><div class="small muted">Vendu par ${esc(u.name)}, ${esc(u.city)} · ${STATE[it.state]}</div></div></div></div>
      <div class="box"><h2>Livraison</h2><div class="radios">
        <label class="radio"><input type="radio" name="ship" value="main" checked><span><b>Remise en main propre</b><small>${esc(u.city)}, à ${km(u.km)}. Vous vérifiez le matériel avant de valider.</small></span><b>Gratuit</b></label>
        <label class="radio"><input type="radio" name="ship" value="liv"><span><b>Livraison assurée</b><small>Colis suivi et assuré à la valeur, 2 à 3 jours ouvrés.</small></span><b>+ 15 €</b></label>
      </div></div>
      <div class="box"><h2>Paiement</h2><div class="simpay">${ico('info')}<div><b>Paiement simulé.</b> Aucun moyen de paiement n’est demandé dans ce prototype. Le montant est conservé par Focal-Shift et versé au vendeur après votre réception.</div></div>
        <label class="check" style="margin-top:16px"><input type="checkbox" data-cgu> J’accepte les conditions de vente.</label></div>
    </div>
    <div><div class="box" style="position:sticky;top:16px"><h2>Récapitulatif</h2><div class="lines num"><div><span>Prix</span><span>${eur(q.price)}</span></div><div><span>Frais de service (5 %)</span><span>${eur(q.fee)}</span></div><div><span>Livraison</span><span data-ship>Gratuit</span></div><div class="tot"><span>Total</span><span data-v="total">${eur(q.total)}</span></div></div>
      ${it.warranty ? `<div class="note-ok" style="margin:0 0 14px">${ico('shield', 's')}<span>Garantie ${it.warranty} mois et 14 jours pour signaler un écart.</span></div>` : ''}
      <button class="btn btn-amber btn-l btn-block" type="button" data-pay disabled>Payer ${eur(q.total)} (simulé)</button></div></div></div>`;
  return {
    title: 'Achat', hideTabs: true, html,
    mount(el) {
      let ship = 'main'; const pay = $('[data-pay]', el), cgu = $('[data-cgu]', el);
      const upd = () => { const t = buyQuote(it, ship === 'liv').total; $('[data-ship]', el).textContent = ship === 'liv' ? '15 €' : 'Gratuit'; countTo($('[data-v="total"]', el), t); pay.textContent = `Payer ${eur(t)} (simulé)`; pay.disabled = !cgu.checked; return t; };
      el.addEventListener('change', ev => { if (ev.target.name === 'ship') ship = ev.target.value; upd(); });
      pay.addEventListener('click', () => {
        const t = upd(); pay.disabled = true; pay.innerHTML = '<span class="spin"></span>Paiement en cours';
        setTimeout(() => {
          const ref = 'FS-A-' + String(Math.floor(1000 + Math.random() * 8999));
          S.orders.unshift({ ref, item: it.id, total: t, status: 'payée', ship, at: iso(today) }); save();
          track('purchase', { transaction_id: ref, value: t, currency: 'EUR', items: [{ item_id: it.id }] });
          Nav.go('/ok/' + ref, { replace: true });
        }, 1100);
      });
    },
  };
};

/* ---------- Confirmation ---------- */
function bookingTimeline(b, it) {
  const u = user(it.o), a = fromIso(b.a), z = fromIso(b.b), past = z < today, run = a <= today && !past;
  const st = b.status === 'terminée' || past ? 3 : run ? 2 : 1;
  const L = [['Réservation confirmée', `${dot('Le ' + dShort(fromIso(b.at)))} ${u.name} a accepté vos dates.`], [b.ship === 'liv' ? 'Livraison et état des lieux' : 'Remise en main propre', `${dLong(a)}, ${b.ship === 'liv' ? 'livraison la veille' : esc(u.city)}. Photos datées validées par vous deux.`], ['Retour', `${dot(dLong(z))} État des lieux de retour.`], ['Caution libérée', `${eur0(b.dep)} débloqués automatiquement si tout est conforme.`]];
  return `<ol class="tl">${L.map(([t, d], i) => `<li class="${i < st ? 'ok' : i === st ? 'now' : ''}"><i>${i < st ? ico('check') : ''}</i><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol>`;
}
function orderTimeline(o) {
  const st = o.status === 'livrée' ? 3 : 1;
  const L = [['Paiement reçu', 'Conservé par Focal-Shift jusqu’à votre réception.'], [o.ship === 'liv' ? 'Expédition' : 'Rendez-vous de remise', o.ship === 'liv' ? 'Colis suivi et assuré, sous 2 jours ouvrés.' : 'Le vendeur vous propose un créneau dans la messagerie.'], ['Réception', 'Vous confirmez que le matériel est conforme.'], ['Vendeur payé', 'Vous gardez 14 jours pour signaler un écart.']];
  return `<ol class="tl">${L.map(([t, d], i) => `<li class="${i < st ? 'ok' : i === st ? 'now' : ''}"><i>${i < st ? ico('check') : ''}</i><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ol>`;
}
SCREENS.done = ([ref]) => {
  const b = S.bookings.find(x => x.ref === ref), o = S.orders.find(x => x.ref === ref), l = S.listings.find(x => x.ref === ref);
  let body = '';
  if (b) {
    const it = byId(b.item), u = user(it.o);
    body = `<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div><h1>C’est réservé.</h1><p class="lead" style="margin:12px auto 0">${esc(fullName(it))} chez ${esc(u.name)}, ${dot(period(fromIso(b.a), fromIso(b.b)))}</p><div class="ref">Référence ${esc(ref)} · ${eur(b.total)} payés (simulé)</div></div>
      <div class="box" style="max-width:620px;margin:28px auto 0"><h2>La suite</h2>${bookingTimeline(b, it)}</div>`;
  } else if (o) {
    const it = byId(o.item);
    body = `<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div><h1>Commande confirmée.</h1><p class="lead" style="margin:12px auto 0">${esc(fullName(it))} est réservé pour vous : personne d’autre ne peut l’acheter.</p><div class="ref">Référence ${esc(ref)} · ${eur(o.total)} payés (simulé)</div></div>
      <div class="box" style="max-width:620px;margin:28px auto 0"><h2>La suite</h2>${orderTimeline(o)}</div>`;
  } else if (l) {
    body = `<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></div><h1>Annonce envoyée.</h1><p class="lead" style="margin:12px auto 0">${esc(l.name)} est en vérification. L’équipe contrôle chaque annonce avant sa mise en ligne, sous 48 h.</p><div class="ref">Référence ${esc(ref)}</div></div>`;
  } else body = `<div class="done"><h1>Référence introuvable</h1><p class="muted">Cette confirmation n’existe plus dans ce navigateur.</p></div>`;
  const cta = b ? ['Voir mes réservations', '#/reservations'] : o ? ['Voir mes achats', '#/reservations?t=achats'] : l ? ['Voir mes annonces', '#/annonces'] : ['Accueil', '#/'];
  return { title: 'Confirmation', hideTabs: true, terminal: true, large: false, html: `<div class="narrow" style="max-width:760px;margin:0 auto">${body}<div style="display:flex;gap:10px;justify-content:center;margin-top:28px;flex-wrap:wrap"><a class="btn btn-ink btn-l" href="${cta[1]}">${cta[0]}</a><a class="btn btn-line btn-l" href="#/">Retour à l’accueil</a></div></div>` };
};
