/* =====================================================================
   Compte : réservations, favoris, profil, propriétaire, crédits, RGPD
   ===================================================================== */
function segTabs(opts, cur, attr) {
  const i = Math.max(0, opts.findIndex(o => o[0] === cur));
  return `<div class="seg" role="tablist" style="--n:${opts.length}"><span class="thumb" style="width:calc((100% - 6px) / ${opts.length});transform:translateX(${i * 100}%)"></span>${opts.map(([k, l]) => `<button type="button" role="tab" ${attr}="${k}" aria-pressed="${k === cur}" aria-selected="${k === cur}">${l}</button>`).join('')}</div>`;
}
function bkRow(b) {
  const it = byId(b.item), past = fromIso(b.b) < today, st = b.status === 'confirmée' && past ? 'terminée' : b.status;
  return `<a class="bk" href="#/reservation/${b.ref}">${pic(photosOf(it)[0], { sizes: '130px' })}<div><span class="xs muted mono">${esc(b.ref)}</span><h3 style="margin:2px 0">${esc(b.kit || fullName(it))}</h3><div class="small muted">${period(fromIso(b.a), fromIso(b.b))} · ${esc(user(it.o).name)}</div></div><div style="text-align:right"><span class="tag ${st === 'confirmée' ? 'amber' : st === 'terminée' ? '' : 'ok'}">${st.charAt(0).toUpperCase() + st.slice(1)}</span><div class="strong num" style="margin-top:6px">${eur(b.total)}</div></div></a>`;
}
function orRow(o) {
  const it = byId(o.item);
  return `<a class="bk" href="#/reservation/${o.ref}">${pic(photosOf(it)[0], { sizes: '130px' })}<div><span class="xs muted mono">${esc(o.ref)}</span><h3 style="margin:2px 0">${esc(fullName(it))}</h3><div class="small muted">Commandé le ${dShort(fromIso(o.at))} · ${o.ship === 'liv' || o.ship === 'livraison' ? 'Livraison assurée' : 'Main propre'}</div></div><div style="text-align:right"><span class="tag ${o.status === 'livrée' ? '' : 'amber'}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span><div class="strong num" style="margin-top:6px">${eur(o.total)}</div></div></a>`;
}
SCREENS.resa = (p, q) => {
  const t = q.t === 'achats' ? 'achats' : 'locations';
  const up = S.bookings.filter(b => fromIso(b.b) >= today), past = S.bookings.filter(b => fromIso(b.b) < today);
  const body = t === 'locations'
    ? (S.bookings.length ? `${up.length ? `<h2 style="font-size:1.1rem;margin:4px 0 12px">À venir</h2>${up.map(bkRow).join('')}` : ''}${past.length ? `<h2 style="font-size:1.1rem;margin:28px 0 12px">Passées</h2>${past.map(bkRow).join('')}` : ''}` : emptyState('cal', 'Aucune location', 'Trouvez le matériel de votre prochain tournage.', ['Explorer', '#/explorer']))
    : (S.orders.length ? S.orders.map(orRow).join('') : emptyState('tag', 'Aucun achat', 'Le matériel d’occasion est contrôlé et garanti.', ['Voir l’occasion', '#/explorer']));
  return {
    title: 'Réservations', root: true, live: true, sub: 'Vos locations et vos achats.',
    html: `${isApp() ? '' : '<h1 style="margin-bottom:20px">Mes réservations</h1>'}${segTabs([['locations', `Locations (${S.bookings.length})`], ['achats', `Achats (${S.orders.length})`]], t, 'data-rt')}<div class="stag" style="max-width:860px">${body}</div>`,
    mount(el, e) { el.addEventListener('click', ev => { const b = ev.target.closest('[data-rt]'); if (b) { const np = '/reservations' + (b.dataset.rt === 'achats' ? '?t=achats' : ''); history.replaceState(null, '', '#' + np); e.path = np; Nav.refresh(); } }); },
  };
};
function emptyState(icon, t, d, cta) { return `<div class="empty">${ico(icon)}<h3>${t}</h3><p class="muted small" style="margin:6px 0 16px">${d}</p>${cta ? `<a class="btn btn-ink" href="${cta[1]}">${cta[0]}</a>` : ''}</div>`; }
SCREENS.resaView = ([ref]) => {
  const b = S.bookings.find(x => x.ref === ref), o = S.orders.find(x => x.ref === ref);
  const r = b || o; if (!r) return { title: 'Réservation', html: emptyState('info', 'Introuvable', 'Cette réservation n’existe plus dans ce navigateur.', ['Mes réservations', '#/reservations']) };
  const it = byId(r.item), u = user(it.o);
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/reservations">Réservations</a><span>/</span><span>${esc(ref)}</span></div>`}<div style="max-width:760px">
    <div class="box"><div class="sumitem">${pic(photosOf(it)[0], { sizes: '120px' })}<div><span class="xs muted mono">${esc(ref)}</span><h3>${esc(r.kit || fullName(it))}</h3><div class="small muted">${b ? period(fromIso(b.a), fromIso(b.b)) + ' · ' : ''}${esc(u.name)}, ${esc(u.city)}</div></div></div></div>
    <div class="box"><h2>Suivi</h2>${b ? bookingTimeline(b, it) : orderTimeline(o)}</div>
    <div class="box"><h2>Montant</h2><div class="lines num" style="margin:0"><div class="tot" style="border:0;padding:0;margin:0"><span>Payé (simulé)</span><span>${eur(r.total)}</span></div>${b ? `<div class="cau"><span>Caution, empreinte non débitée</span><span>${eur0(b.dep)}</span></div>` : ''}</div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="btn btn-ink" type="button" data-msg>${ico('msg', 's')}Écrire à ${esc(u.name)}</button><a class="btn btn-line" href="#/p/${it.id}">Voir l’annonce</a></div></div>`;
  return { title: ref, html, mount(el) { $('[data-msg]', el).onclick = () => toast('Messagerie liée à la transaction : simulée dans ce prototype', 'msg'); } };
};
SCREENS.favs = () => {
  const list = S.favs.map(byId).filter(Boolean);
  return {
    title: 'Favoris', live: true, sub: plural(list.length, 'annonce') + ' gardée' + (list.length > 1 ? 's' : ''),
    html: `${isApp() ? '' : `<h1 style="margin-bottom:22px">Favoris</h1>`}${list.length ? `<div class="grid stag">${list.map((it, i) => card(it, { i, cmp: true })).join('')}</div>` : emptyState('heart', 'Aucun favori', 'Touchez le cœur d’une annonce pour la retrouver ici.', ['Explorer', '#/explorer'])}`,
    onShow(el) { $$('.card', el).forEach(c => { if (!S.favs.includes(+c.dataset.id)) c.remove(); }); },
  };
};
SCREENS.profil = () => {
  const myD = allDemandes().filter(d => d.mine).length, myL = ITEMS.filter(i => i.o === 5).length + S.listings.length;
  const li = (href, icon, label, badge, act) => act ? `<button type="button" data-act="${act}">${ico(icon)}<span>${label}</span>${badge != null ? `<span class="badge">${badge}</span>` : '<span></span>'}${ico('next', 'chev')}</button>` : `<a href="${href}" ${/^\.\.|^http/.test(href) ? 'target="_top"' : ''}>${ico(icon)}<span>${label}</span>${badge != null ? `<span class="badge">${badge}</span>` : '<span></span>'}${ico(/^\.\./.test(href) ? 'ext' : 'next', 'chev')}</a>`;
  const html = `<div style="max-width:720px">
    <div class="prof"><span class="avatar a5">LM</span><div><h2 style="font-size:1.5rem">Léa M.</h2><div class="small muted">Vidéaste indépendante, Paris 18e</div><div style="margin-top:6px"><span class="tag ok">${ico('shield')}Identité vérifiée</span></div></div></div>
    <div class="menu">${li('#/favoris', 'heart', 'Favoris', S.favs.length)}${li('#/reservations', 'cal', 'Réservations et achats', S.bookings.length + S.orders.length)}${li('#/demande', 'msg', 'Mes demandes', myD)}${li('#/comparer', 'compare', 'Comparateur', S.compare.length || null)}</div>
    <div class="mhd">Propriétaire</div>
    <div class="menu">${li('#/proposer/annonce', 'plus', 'Proposer mon matériel')}${li('#/annonces', 'list', 'Mes annonces', myL)}${li('#/proposer', 'euro', 'Simulateur de revenus')}</div>
    <div class="mhd">Aide</div>
    <div class="menu">${li('#/conseil', 'spark', 'Conseil en 5 questions')}${li('#/kit/interview', 'video', 'Kits par projet')}</div>
    <div class="mhd">Le prototype</div>
    <div class="menu">${li('#/a-propos', 'info', 'À propos du projet')}${li('#/confidentialite', 'lock', 'Confidentialité et cookies')}${li('#/credits', 'image', 'Crédits photos', DB.credits.length)}${isApp() ? li('', 'phone', 'Installer l’application', null, 'install-how') : ''}${li('../#projets', 'back', 'Retour au CV d’El Mokhtar')}</div>
    ${isApp() ? `<div class="about"><b>Prototype du challenge professionnel de fin d’études</b><p class="small" style="margin:6px 0 10px;color:#cfcfca">MBA ESG, septembre 2026. Données fictives, paiement simulé.</p><a href="../#projets">← Retour au CV</a></div>` : ''}
    <button class="btn btn-ghost small" type="button" data-act="reset" style="margin-top:18px;color:var(--mute)">Réinitialiser la démo</button></div>`;
  return { title: 'Profil', root: true, live: true, html };
};
SCREENS.myListings = () => {
  const own = ITEMS.filter(i => i.o === 5);
  const rev = 2 * 10 * .88;
  const html = `${isApp() ? '' : '<h1 style="margin-bottom:8px">Mes annonces</h1>'}<p class="muted" style="margin-bottom:20px">Ce mois-ci : 2 jours loués, ${eur(rev)} reversés après commission.</p>
    <div style="max-width:860px">${S.listings.map(l => `<div class="bk">${pic(l.ph ? DB.P[l.ph][0] : null, { sizes: '130px' })}<div><span class="xs muted mono">${esc(l.ref)}</span><h3 style="margin:2px 0">${esc(l.name)}</h3><div class="small muted">${l.mode === 'rent' ? eur0(l.day) + ' / jour' : eur0(l.price)} · ${esc(STATE[l.state])}</div></div><span class="tag amber">${ico('clock')}En vérification</span></div>`).join('')}
    ${own.map(it => `<a class="bk" href="#/p/${it.id}">${pic(photosOf(it)[0], { sizes: '130px' })}<div><span class="xs muted">${it.mode === 'rent' ? 'Location' : 'Vente'}</span><h3 style="margin:2px 0">${esc(fullName(it))}</h3><div class="small muted">${it.mode === 'rent' ? eur0(it.day) + ' / jour' : eur0(it.price)} · ${STATE[it.state]}</div></div><span class="tag ok">${ico('check')}En ligne</span></a>`).join('')}</div>
    <a class="btn btn-amber" href="#/proposer/annonce" style="margin-top:20px">${ico('plus', 's')}Nouvelle annonce</a>`;
  return { title: 'Mes annonces', live: true, html };
};

/* ---------- Propriétaire : simulateur + annonce en 3 étapes ---------- */
function simBlock() {
  return `<div class="sim" data-sim>
    <div class="box"><h2>Votre matériel</h2>
      <label class="field"><span>Catégorie</span><select class="select" data-s="cat">${Object.entries(CAT1).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="field"><span>Prix d’achat</span><input class="input num" type="number" inputmode="numeric" min="50" step="10" value="2800" data-s="prix"></label><label class="field"><span>Acheté en</span><select class="select" data-s="an">${[0, 1, 2, 3, 4, 5, 6].map(k => `<option ${k === 1 ? 'selected' : ''}>${today.getFullYear() - k}</option>`).join('')}</select></label></div>
      <div class="wq"><span class="label">État</span><div class="chips">${Object.entries(STATE).map(([k, v]) => `<button class="chip" type="button" data-se="${k}" aria-pressed="${k === 'excellent'}">${v}</button>`).join('')}</div></div>
      <div class="wq" style="margin:0"><span class="label">Jours de location par mois : <b class="num" data-jv>4</b></span><input class="range" type="range" min="0" max="15" value="4" data-s="jm" aria-label="Jours de location par mois"></div>
    </div>
    <div class="box"><p class="verdict" data-verdict></p>
      <div class="bars"><div class="row"><div class="t"><span>Le vendre maintenant</span><b class="num" data-mv></b></div><div class="track"><i class="sell" data-bv></i></div></div>
      <div class="row"><div class="t"><span>Le louer 12 mois, puis le revendre</span><b class="num" data-ml></b></div><div class="track"><i class="rent" data-br></i><i class="resale" data-brs></i></div><div class="xs muted" data-mld></div></div></div>
      <dl class="kv" style="margin-top:20px"><dt>Prix de location conseillé</dt><dd class="num" data-pj></dd><dt>Revenu mensuel net</dt><dd class="num" data-mo></dd><dt>Louer devient plus intéressant à partir de</dt><dd data-seuil></dd></dl>
      <p class="xs muted" style="margin:16px 0 0">Hypothèses prudentes : décote annuelle par catégorie, usure de 0,15 % par jour loué, commission propriétaire de 12 %. Le revenu n’est jamais garanti.</p></div>
  </div>`;
}
function mountSim(el) {
  const box = $('[data-sim]', el); if (!box) return;
  let etat = 'excellent';
  const run = () => {
    const cat = $('[data-s="cat"]', box).value, prix = Math.max(50, +$('[data-s="prix"]', box).value || 0), age = today.getFullYear() - +$('[data-s="an"]', box).value, jm = +$('[data-s="jm"]', box).value;
    $('[data-jv]', box).textContent = jm;
    const r = cote(cat, prix, age, etat, jm);
    let seuil = null; for (let j = 0; j <= 20; j++) { if (cote(cat, prix, age, etat, j).tot > r.v * 1.1) { seuil = j; break; } }
    const louer = r.tot > r.v * 1.1, mx = Math.max(r.v, r.tot);
    $('[data-verdict]', box).textContent = louer ? `Louer rapporte environ ${eur0(r.tot - r.v)} de plus sur un an que vendre aujourd’hui.` : (r.tot > r.v ? 'Vendre ou louer se valent à ce rythme : l’écart ne couvre pas le temps passé.' : 'À ce rythme, vendre maintenant est plus intéressant.');
    countTo($('[data-mv]', box), Math.round(r.v), eur0); countTo($('[data-ml]', box), Math.round(r.tot), eur0);
    $('[data-mld]', box).textContent = `${eur0(r.rev)} de locations + ${eur0(r.v12)} de revente dans un an`;
    $('[data-bv]', box).style.width = (r.v / mx * 100) + '%'; $('[data-br]', box).style.width = (r.rev / mx * 100) + '%'; $('[data-brs]', box).style.width = (r.v12 / mx * 100) + '%';
    $('[data-pj]', box).textContent = eur0(r.pj) + ' / jour'; countTo($('[data-mo]', box), Math.round(r.monthly), eur0);
    $('[data-seuil]', box).textContent = seuil == null ? 'jamais, avec ces hypothèses' : plural(seuil, 'jour') + ' par mois';
  };
  box.addEventListener('input', run); box.addEventListener('change', run);
  box.addEventListener('click', ev => { const b = ev.target.closest('[data-se]'); if (b) { etat = b.dataset.se; $$('[data-se]', box).forEach(x => x.setAttribute('aria-pressed', x === b)); run(); } });
  run();
}
SCREENS.proposer = () => ({
  title: 'Proposer mon matériel', sub: 'Louez ou vendez ce qui dort chez vous.',
  html: `${isApp() ? '' : '<div class="crumbs"><a href="#/">Accueil</a><span>/</span><span>Propriétaires</span></div>'}
    <div style="display:grid;grid-template-columns:${isApp() ? '1fr' : '1.1fr .9fr'};gap:40px;align-items:center;margin-bottom:36px">
      <div>${isApp() ? '' : '<h1>Votre matériel dort ? Faites-le travailler.</h1>'}<p class="lead" style="margin-top:${isApp() ? 0 : 14}px">Publier est gratuit. Une commission de 12 % n’est prélevée que si une location a lieu, 5 % sur une vente.</p>
        <ul class="checks" style="grid-template-columns:1fr;margin:18px 0 22px">${['Assurance casse et vol et caution séparée dans chaque devis', 'État des lieux photographié, validé par les deux parties', 'Vous choisissez vos jours libres et vos remises', 'Payé après le retour du matériel, net affiché d’avance'].map(t => `<li>${ico('check')}<span>${t}</span></li>`).join('')}</ul>
        <a class="btn btn-amber btn-l" href="#/proposer/annonce">Publier une annonce</a></div>
      ${pic(DB.P['h-studio'][0], { cls: 'r43', cover: true, sizes: '(max-width:600px) 100vw, 520px', alt: 'Studio photo avec boîtes à lumière' })}
    </div>
    <h2 style="margin-bottom:6px">Vendre ou louer ? Comparez en net.</h2><p class="muted" style="margin-bottom:18px">Le simulateur du prototype, avec les mêmes hypothèses que l’estimation serveur.</p>${simBlock()}`,
  mount(el) { mountSim(el); },
});
const REF = Object.entries({ 'Sony FX3': ['boitier', 4600, 'fx3', 1.10], 'Canon EOS R6 Mark II': ['boitier', 2800, 'r6m2', 1.08], 'Sony A7S III': ['boitier', 4200, 'a7s3', 1.02], 'Sony A7 IV': ['boitier', 2800, 'a7iv', 1.10], 'Fujifilm X-T5': ['boitier', 1900, 'xt5', 1.12], 'Sony ZV-E10': ['boitier', 750, 'zve10', 1], 'Canon EOS R50': ['boitier', 800, 'r50', 1], 'Sony FE 24-70 mm f/2.8 GM II': ['objectif', 2400, 'gm2470', 1.05], 'Sigma 35 mm f/1.4 DG DN Art': ['objectif', 850, 'sig35', 1], 'Canon RF 85 mm f/1.2 L': ['objectif', 2900, 'rf85', .98], 'Sony FE 90 mm f/2.8 Macro G': ['objectif', 1100, 'fe90', .95], 'Fujifilm XF 23 mm f/2 R WR': ['objectif', 500, 'xf23', 1.05], 'Canon RF 50 mm f/1.8 STM': ['objectif', 230, 'rf50', 1], 'Aputure Amaran 200x S': ['lumiere', 520, 'amaran', 1], 'DJI RS 4': ['stabilisation', 550, 'rs4', 1.05], 'Rode Wireless GO II': ['son', 300, 'wgo2', 1.05], 'Sennheiser MKE 600': ['son', 480, 'mke600', .95], 'Zoom F6': ['son', 700, 'zoomf6', 1] });
let LD = null;
SCREENS.listing = () => {
  if (!LD) LD = { step: 0, ref: null, mode: 'rent', state: 'excellent', year: today.getFullYear() - 2, acc: ['chargeur'], day: null, price: null, days: [1, 1, 1, 1, 1, 1, 1] };
  const R0 = () => LD.ref ? REF.find(r => r[0] === LD.ref) : null;
  const steps = [
    () => `<span class="stepno">Étape 1 sur 3</span><h2 style="margin-bottom:16px">Quel matériel ?</h2>
      <label class="field"><span>Modèle</span><input class="input" data-lq placeholder="Tapez une marque ou un modèle : A7 IV, RS 4…" value="${esc(LD.ref || '')}" autocomplete="off"></label>
      <div class="chips" data-lsugg style="margin:-4px 0 18px">${REF.slice(0, 8).map(([n]) => `<button class="chip" type="button" data-lref="${esc(n)}" aria-pressed="${LD.ref === n}">${esc(n)}</button>`).join('')}</div>
      ${R0() ? `<div class="box" style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center;margin-bottom:18px">${pic(DB.P[R0()[1][2]][0], { cls: 'r43', sizes: '130px' })}<div><b>${esc(LD.ref)}</b><div class="small muted">${CAT1[R0()[1][0]]} · prix neuf ${eur0(R0()[1][1])}. Caractéristiques remplies depuis le référentiel.</div></div></div>` : ''}
      <div class="wq"><span class="label">Vous voulez</span><div class="opt-grid" style="grid-template-columns:repeat(3,1fr)">${[['rent', 'Le louer', 'Revenu régulier'], ['buy', 'Le vendre', 'Argent tout de suite'], ['both', 'Les deux', 'Louer en attendant un acheteur']].map(([k, l, s]) => `<button class="opt" type="button" data-lm="${k}" aria-pressed="${LD.mode === k}"><b>${l}</b><small>${s}</small></button>`).join('')}</div></div>`,
    () => { const r = R0()[1], e = estimate(r[0], r[1], LD.year, LD.state, LD.acc, r[3]);
      return `<span class="stepno">Étape 2 sur 3</span><h2 style="margin-bottom:16px">Dans quel état ?</h2>
      <div class="opt-grid" style="margin-bottom:18px">${Object.entries(STATE).map(([k, v]) => `<button class="opt" type="button" data-ls="${k}" aria-pressed="${LD.state === k}"><b>${v}</b><small>${STATE_D[k]}</small></button>`).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="field"><span>Acheté en</span><select class="select" data-ly>${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<option ${LD.year === today.getFullYear() - k ? 'selected' : ''}>${today.getFullYear() - k}</option>`).join('')}</select></label><div></div></div>
      <div class="wq"><span class="label">Fourni avec</span><div class="chips">${[['boite', 'Boîte d’origine'], ['facture', 'Facture'], ['batterie', 'Batterie en plus'], ['chargeur', 'Chargeur'], ['sac', 'Sac ou étui']].map(([k, v]) => `<button class="chip" type="button" data-la="${k}" aria-pressed="${LD.acc.includes(k)}">${v}</button>`).join('')}</div></div>
      <div class="box"><span class="label">Estimation de revente</span><div class="est" style="margin-top:10px"><div><small>Basse</small><b class="num">${eur0(e.lo)}</b></div><div class="c"><small>Centrale</small><b class="num">${eur0(e.mid)}</b></div><div><small>Haute</small><b class="num">${eur0(e.hi)}</b></div></div>
      <p class="xs muted" style="margin:12px 0 0">Prix neuf ${eur0(r[1])} × ancienneté ${String(e.ca.toFixed(2)).replace('.', ',')} × état ${String(e.ce).replace('.', ',')} × demande ${String(r[3]).replace('.', ',')}${e.va ? ` + accessoires ${eur0(e.va)}` : ''}. Version de règle est-v1.0.</p></div>`; },
    () => { const r = R0()[1], e = estimate(r[0], r[1], LD.year, LD.state, LD.acc, r[3]); const pj = LD.day || Math.round(r[1] * HYP[r[0]][2]); const pv = LD.price || e.mid;
      return `<span class="stepno">Étape 3 sur 3</span><h2 style="margin-bottom:16px">Prix et disponibilités</h2>
      ${LD.mode !== 'buy' ? `<div class="box"><span class="label">Prix par jour</span><div style="display:flex;align-items:center;gap:12px;margin-top:8px"><button class="iconbtn" type="button" data-lp="-1" aria-label="Moins" style="box-shadow:inset 0 0 0 1px var(--line-2)">${ico('minus')}</button><span class="outv num" data-lpv>${eur0(pj)}</span><button class="iconbtn" type="button" data-lp="1" aria-label="Plus" style="box-shadow:inset 0 0 0 1px var(--line-2)">${ico('plus')}</button></div><p class="small muted" style="margin:8px 0 0">Conseillé : ${eur0(Math.round(r[1] * HYP[r[0]][2]))}. Vous touchez <b data-lnet>${eur(pj * .88)}</b> par jour loué.</p>
        <span class="label" style="display:block;margin-top:16px">Jours où il est disponible</span><div class="days7" style="margin-top:8px">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<button class="chip" type="button" data-ld="${i}" aria-pressed="${!!LD.days[i]}">${d}</button>`).join('')}</div></div>` : ''}
      ${LD.mode !== 'rent' ? `<div class="box"><label class="field" style="margin:0"><span>Prix de vente</span><input class="input num" type="number" inputmode="numeric" value="${pv}" data-lpr></label><p class="small muted" style="margin:8px 0 0">Fourchette estimée : ${eur0(e.lo)} à ${eur0(e.hi)}. Commission de 5 % à la vente.</p></div>` : ''}
      <div class="box"><span class="label">Photos</span><p class="small muted" style="margin:4px 0 12px">Face, dos, écran, monture et défauts éventuels. Dans ce prototype, la photo du référentiel sert d’exemple.</p><div class="upl">${pic(DB.P[r[2]][0], { cover: true, sizes: '120px' })}${['Dos', 'Monture', 'Défauts'].map(t => `<div class="slot">${ico('image')}<br>${t}</div>`).join('')}</div></div>`; },
  ];
  const html = `<div class="wiz" style="margin:0 auto">${isApp() ? '' : '<h1>Nouvelle annonce</h1><p class="lead" style="margin:10px 0 22px">Trois étapes, environ deux minutes. L’équipe vérifie chaque annonce avant sa mise en ligne.</p>'}<div class="prog"><i></i><i></i><i></i></div><div data-w></div><div class="wnav"><button class="btn btn-line" type="button" data-prev>Retour</button><button class="btn btn-ink" type="button" data-next>Continuer</button></div></div>`;
  return {
    title: 'Nouvelle annonce', hideTabs: true, html,
    mount(el) {
      const w = $('[data-w]', el), prev = $('[data-prev]', el), next = $('[data-next]', el);
      const draw = back => {
        w.innerHTML = `<div class="wstep${back ? ' back' : ''}">${steps[LD.step]()}</div>`;
        $$('.prog i', el).forEach((x, i) => x.classList.toggle('on', i <= LD.step));
        prev.style.visibility = LD.step ? 'visible' : 'hidden'; next.textContent = LD.step === 2 ? 'Envoyer en vérification' : 'Continuer';
        next.classList.toggle('btn-amber', LD.step === 2); next.classList.toggle('btn-ink', LD.step !== 2); next.disabled = !LD.ref;
      };
      el.addEventListener('click', ev => {
        const t = ev.target;
        const rf = t.closest('[data-lref]'); if (rf) { LD.ref = rf.dataset.lref; LD.day = null; LD.price = null; draw(); return; }
        const m = t.closest('[data-lm]'); if (m) { LD.mode = m.dataset.lm; $$('[data-lm]', el).forEach(x => x.setAttribute('aria-pressed', x === m)); }
        const s = t.closest('[data-ls]'); if (s) { LD.state = s.dataset.ls; LD.price = null; draw(); }
        const a = t.closest('[data-la]'); if (a) { const k = a.dataset.la, i = LD.acc.indexOf(k); if (i >= 0) LD.acc.splice(i, 1); else LD.acc.push(k); LD.price = null; draw(); }
        const p = t.closest('[data-lp]'); if (p) { const r = R0()[1]; LD.day = Math.max(5, (LD.day || Math.round(r[1] * HYP[r[0]][2])) + (+p.dataset.lp)); countTo($('[data-lpv]', el), LD.day, eur0); $('[data-lnet]', el).textContent = eur(LD.day * .88); }
        const d = t.closest('[data-ld]'); if (d) { const i = +d.dataset.ld; LD.days[i] = LD.days[i] ? 0 : 1; d.setAttribute('aria-pressed', !!LD.days[i]); }
      });
      el.addEventListener('input', ev => {
        const t = ev.target;
        if (t.matches('[data-lq]')) { const q = norm(t.value); const m = REF.filter(([n]) => norm(n).includes(q)).slice(0, 8); $('[data-lsugg]', el).innerHTML = m.length ? m.map(([n]) => `<button class="chip" type="button" data-lref="${esc(n)}" aria-pressed="${LD.ref === n}">${esc(n)}</button>`).join('') : '<span class="small muted">Modèle absent du référentiel : l’équipe le créera à la vérification.</span>'; }
        if (t.matches('[data-lpr]')) LD.price = +t.value;
      });
      el.addEventListener('change', ev => { if (ev.target.matches('[data-ly]')) { LD.year = +ev.target.value; LD.price = null; draw(); } });
      prev.onclick = () => { if (LD.step) { LD.step--; draw(true); } };
      next.onclick = () => {
        if (LD.step < 2) { LD.step++; draw(); return; }
        const r = R0()[1], e = estimate(r[0], r[1], LD.year, LD.state, LD.acc, r[3]);
        const ref = 'FS-N-' + String(Math.floor(1000 + Math.random() * 8999));
        S.listings.unshift({ ref, name: LD.ref, ph: r[2], mode: LD.mode === 'buy' ? 'buy' : 'rent', day: LD.day || Math.round(r[1] * HYP[r[0]][2]), price: LD.price || e.mid, state: LD.state });
        save(); LD = null; track('listing_submitted', { ref });
        Nav.go('/ok/' + ref, { replace: true });
      };
      draw();
    },
  };
};

/* ---------- Crédits photos ---------- */
SCREENS.credits = () => {
  const keyName = {};
  ITEMS.forEach(it => { if (it.ph) (keyName[it.ph] = keyName[it.ph] || new Set()).add(fullName(it)); });
  const amb = { 'h-doc': 'Accueil', 'h-son': 'Accueil', 'h-nuit': 'Accueil, kit Clip de nuit', 'h-photo': 'Accueil', 'h-studio': 'Kit Portrait studio, page Propriétaires', 'h-reportage': 'Kit Interview', 'h-r6': 'Kit Film de mariage', table: 'Kit Packshot' };
  const row = c => `<div class="credit-row">${pic(DB.P[c.k].find(p => p.t === c.s), { sizes: '90px' })}<div><b>${esc(keyName[c.k] ? Array.from(keyName[c.k]).join(', ') : amb[c.k] || '')}</b>${c.note ? `<p><span class="ntag">${esc(c.note)}</span></p>` : ''}<p>« ${esc(c.title.replace(/\.(jpe?g|png)$/i, ''))} »</p><p>${esc(c.author)} · <a class="link" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.lic)}, Wikimedia Commons</a></p></div></div>`;
  const gear = DB.credits.filter(c => !c.k.startsWith('h-')), mood = DB.credits.filter(c => c.k.startsWith('h-'));
  const exact = new Set(gear.filter(c => !c.note || /monté sur/.test(c.note)).map(c => c.k));
  return {
    title: 'Crédits photos',
    html: `${isApp() ? '' : '<h1 style="margin-bottom:12px">Crédits photos</h1>'}<div style="max-width:780px"><p class="lead" style="font-size:1.02rem">Toutes les photos viennent de Wikimedia Commons, sous licence libre (CC0, domaine public, CC BY ou CC BY-SA). Elles sont redimensionnées et converties en WebP, sans autre modification. Sur une vraie place de marché, chaque propriétaire publierait ses propres photos.</p>
      <p class="small muted">${exact.size} modèles sont illustrés par une photo du modèle exact. Quand aucune photo libre n’existait, nous montrons le modèle le plus proche de la même marque, signalé ci-dessous ; une seule annonce (Nanlite PavoTube II 15C) n’a pas de photo et affiche une silhouette neutre.</p></div>
      <h2 style="margin:28px 0 4px;font-size:1.2rem">Matériel (${gear.length})</h2><div class="credits">${gear.map(row).join('')}</div>
      <h2 style="margin:36px 0 4px;font-size:1.2rem">Ambiances (${mood.length})</h2><div class="credits">${mood.map(row).join('')}</div>`,
  };
};

/* ---------- Confidentialité, à propos ---------- */
SCREENS.privacy = () => ({
  title: 'Confidentialité', live: true,
  html: `<div style="max-width:720px">${isApp() ? '' : '<h1 style="margin-bottom:16px">Confidentialité et cookies</h1>'}
    <div class="box"><h2>Votre choix actuel</h2><p>Mesure d’audience : <b>${S.consent === 'granted' ? 'acceptée' : S.consent === 'denied' ? 'refusée' : 'pas encore choisie'}</b>.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ink" type="button" data-consent="granted">Accepter la mesure</button><button class="btn btn-line" type="button" data-consent="denied">Refuser</button></div></div>
    <div class="box"><h2>Ce que fait le prototype</h2><ul class="checks" style="grid-template-columns:1fr">${['Google Consent Mode v2 : tout est refusé par défaut, avant tout chargement de balise.', 'La mesure ne s’active qu’après « Accepter » ; refuser est aussi simple qu’accepter.', 'Deux traces seulement : votre choix (6 mois) et l’état de la démo, dans ce navigateur.', 'Aucune donnée bancaire, rien d’identifiant dans la couche de données.', 'Vos favoris, réservations et demandes restent dans votre navigateur ; « Réinitialiser la démo » les efface.'].map(t => `<li>${ico('check')}<span>${t}</span></li>`).join('')}</ul></div>
    <p class="small muted">Plan de marquage repris du prototype : page_view, view_item, add_to_wishlist, begin_checkout, purchase, generate_lead, conseil_complete.</p></div>`,
});
SCREENS.about = () => ({
  title: 'À propos du projet',
  html: `<div style="max-width:760px">${isApp() ? '' : '<h1 style="margin-bottom:16px">À propos du projet</h1>'}
    <div class="about" style="margin:0 0 18px"><b>Prototype du challenge professionnel de fin d’études (MBA ESG, sept. 2026) · données fictives</b><p class="small" style="margin:8px 0 0"><a href="../#projets">← Retour au CV d’El Mokhtar Berrada</a></p></div>
    <p class="lead" style="font-size:1.05rem">Focal-Shift est le projet de l’équipe 4 (Carole, Cécile, El Mokhtar, Amina, Grâce) pour le hackathon de trois jours qui valide le MBA ESG et le titre RNCP « Manager de l’Innovation Numérique ».</p>
    <p>La question posée : comment réunir achat, revente et location de matériel photo et vidéo premium dans un parcours fiable, local et accessible, pour prolonger la vie des équipements ? Notre réponse : un seul compte pour acheter, louer ou proposer du matériel, un conseil par usage, des prix complets affichés d’avance et des états des lieux documentés. Et surtout la demande par projet : on décrit son tournage, les propriétaires répondent avec un kit.</p>
    <div class="dsum" style="margin:20px 0"><div><small>Objectif du pilote à 6 mois</small><b>750 transactions en Île-de-France</b></div><div><small>Modèle</small><b>Commission à la transaction</b></div><div><small>Budget d’acquisition</small><b>50 000 €</b></div></div>
    <p>Pendant le hackathon, nous avons construit un prototype PHP/MySQL (21 tables, API REST, consentement RGPD avant toute balise). Cette version en est la démonstration statique : mêmes annonces, mêmes règles de prix, de conseil et de simulation, réécrites pour tourner dans le navigateur. Le paiement est simulé.</p>
    <p class="small muted">Mon rôle : prototype, RGPD et plan de marquage. Photos : Wikimedia Commons, voir les <a class="link" href="#/credits">crédits</a>.</p></div>`,
});

/* ---------- Consentement (bandeau minimal) ---------- */
function consentBanner() {
  if (S.consent) return;
  const el = document.createElement('div'); el.className = 'consent'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Mesure d’audience');
  el.innerHTML = `<b>Mesure d’audience</b><p>Focal-Shift ne mesure la fréquentation qu’avec votre accord. Aucun cookie publicitaire. <a class="link" href="#/confidentialite">En savoir plus</a></p><div class="row"><button class="btn btn-line" type="button" data-consent="denied">Refuser</button><button class="btn btn-ink" type="button" data-consent="granted">Accepter</button></div>`;
  document.body.appendChild(el); requestAnimationFrame(() => el.classList.add('on'));
}
function setConsent(v) {
  S.consent = v; save();
  gtag('consent', 'update', { analytics_storage: v });
  track('consent_' + v);
  const b = $('.consent'); if (b) { b.classList.remove('on'); setTimeout(() => b.remove(), 400); }
  toast(v === 'granted' ? 'Merci, mesure d’audience activée' : 'Mesure d’audience refusée');
  const t = Nav.top(); if (t && t.scr.route === 'privacy') Nav.refresh();
}
