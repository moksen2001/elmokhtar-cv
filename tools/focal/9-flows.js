/* =====================================================================
   Conseil par usage, kits par projet, demande de projet et offres
   ===================================================================== */
const USAGES = { voyage: ['Voyage', { poids: 3, simplicite: 1, basse_lumiere: 1, stabilisation: 1 }], rue: ['Photo de rue', { poids: 2, af: 2, simplicite: 1 }], portrait: ['Portrait', { af: 2, basse_lumiere: 2, stabilisation: 1 }], sport: ['Sport', { af: 3, rafale: 3 }], nature: ['Nature', { af: 2, rafale: 2, stabilisation: 1 }], video: ['Vidéo', { video: 3, stabilisation: 2, basse_lumiere: 1 }] };
const CRIT = { af: ['autofocus', 'un autofocus rapide et fiable', 'un autofocus moins véloce'], basse_lumiere: ['basse lumière', 'une excellente tenue en basse lumière', 'plus de bruit en faible lumière'], stabilisation: ['stabilisation', 'une stabilisation efficace', 'pas de stabilisation dans le boîtier'], rafale: ['rafale', 'une rafale rapide pour l’action', 'une rafale limitée'], video: ['vidéo', 'des capacités vidéo avancées', 'des fonctions vidéo plus simples'], simplicite: ['prise en main', 'une prise en main simple', 'des réglages plus exigeants'], poids: ['légèreté', 'un poids plume', 'un poids plus élevé'] };
const SKEYS = ['af', 'basse_lumiere', 'stabilisation', 'rafale', 'video', 'simplicite'];
let CQ = { usage: null, mode: null, budget: null, jours: 3, niveau: null, mobilite: null, marque: '', etat: '' };
/* Moteur de règles reco-v1.0 (metier.php : recommander), filtre de mode corrigé */
function recommend(r) {
  const w = Object.assign({}, USAGES[r.usage][1]);
  if (r.niveau === 'debutant') w.simplicite = (w.simplicite || 0) + 2;
  if (r.niveau === 'intermediaire') w.simplicite = (w.simplicite || 0) + 1;
  if (r.mobilite === 'leger') w.poids = (w.poids || 0) + 3;
  if (r.mobilite === 'modere') w.poids = (w.poids || 0) + 1;
  const buy = r.mode === 'achat'; let excl = 0;
  const seen = new Set();
  const cands = ITEMS.filter(m => m.cat === 'boitier' && m.mode === (buy ? 'buy' : 'rent')).map(m => {
    const prix = buy ? m.price : m.day * r.jours;
    if (prix > r.budget) { excl++; return null; }
    const v = { poids: m.weight ? clamp(6 - (m.weight - 300) / 110, 1, 5) : 3 };
    SKEYS.forEach((k, i) => { v[k] = m.scores ? m.scores[i] : 3; });
    let tot = 0, max = 0; const con = [];
    Object.entries(w).forEach(([c, x]) => { tot += v[c] * x; max += 5 * x; con.push([c, v[c], x]); });
    let sc = max ? tot / max * 100 : 0;
    if (r.marque && r.marque === m.brand) sc += 4;
    if (r.etat === 'comme_neuf' && ['neuf', 'excellent'].includes(m.state)) sc += 3;
    if (m.checked) sc += 2;
    con.sort((a, b) => b[1] * b[2] - a[1] * a[2]);
    const forts = con.filter(c => c[1] >= 4).slice(0, 2).map(c => c[0]), faibles = con.filter(c => c[1] <= 3).map(c => c[0]);
    return { m, prix, score: Math.min(99, Math.round(sc)), pros: (forts.length ? forts : [con[0][0]]).map(c => CRIT[c][1]), con: faibles.length ? CRIT[faibles[faibles.length - 1]][2] : null };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.prix - b.prix).filter(c => { const k = c.m.model; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
  cands.forEach(c => {
    const lenses = ITEMS.filter(o => o.cat === 'objectif' && o.mount === c.m.mount && o.mode === c.m.mode);
    lenses.sort((a, b) => (r.mobilite !== 'libre' ? (a.weight || 999) - (b.weight || 999) : 0) || ((buy ? a.price : a.day) - (buy ? b.price : b.day)));
    c.lens = lenses[0] || null;
  });
  return { res: cands, excl, w };
}
SCREENS.conseil = (p, q) => {
  let step = +(q.e || 0);
  const steps = [
    () => `<span class="stepno">Question 1 sur 5</span><h2 style="margin-bottom:18px">Vous photographiez ou filmez surtout…</h2><div class="opt-grid">${Object.entries(USAGES).map(([k, [l]]) => `<button class="opt" type="button" data-c="usage" data-v="${k}" aria-pressed="${CQ.usage === k}">${ico(k, 'l')}<b>${l}</b></button>`).join('')}</div>`,
    () => `<span class="stepno">Question 2 sur 5</span><h2 style="margin-bottom:18px">Plutôt louer ou acheter ?</h2><div class="opt-grid" style="grid-template-columns:1fr 1fr">${[['location', 'Louer', 'Pour un projet ponctuel'], ['achat', 'Acheter d’occasion', 'Pour un usage régulier']].map(([k, l, s]) => `<button class="opt" type="button" data-c="mode" data-v="${k}" aria-pressed="${CQ.mode === k}"><b>${l}</b><small>${s}</small></button>`).join('')}</div>
      <div data-bud ${CQ.mode ? '' : 'hidden'} style="margin-top:24px"><span class="label">Budget maximum ${CQ.mode === 'location' ? 'pour la période' : ''}</span><div class="outv num" data-bv>${eur0(CQ.budget || (CQ.mode === 'achat' ? 1500 : 200))}</div><input class="range" type="range" data-b min="${CQ.mode === 'achat' ? 300 : 40}" max="${CQ.mode === 'achat' ? 3000 : 600}" step="${CQ.mode === 'achat' ? 50 : 10}" value="${CQ.budget || (CQ.mode === 'achat' ? 1500 : 200)}" aria-label="Budget">
      ${CQ.mode === 'location' ? `<span class="label" style="display:block;margin-top:16px">Durée</span><div class="chips">${[1, 2, 3, 7].map(n => `<button class="chip" type="button" data-c="jours" data-v="${n}" aria-pressed="${CQ.jours === n}">${plural(n, 'jour')}</button>`).join('')}</div>` : ''}</div>`,
    () => `<span class="stepno">Question 3 sur 5</span><h2 style="margin-bottom:18px">Votre niveau</h2><div class="opt-grid">${[['debutant', 'Débutant', 'Je veux que ce soit simple'], ['intermediaire', 'Intermédiaire', 'Je connais les bases'], ['expert', 'Expert', 'Je règle tout moi-même']].map(([k, l, s]) => `<button class="opt" type="button" data-c="niveau" data-v="${k}" aria-pressed="${CQ.niveau === k}"><b>${l}</b><small>${s}</small></button>`).join('')}</div>`,
    () => `<span class="stepno">Question 4 sur 5</span><h2 style="margin-bottom:18px">Le poids compte-t-il ?</h2><div class="opt-grid">${[['leger', 'Très léger', 'Je le porte toute la journée'], ['modere', 'Modéré', 'Un compromis me va'], ['libre', 'Sans contrainte', 'La qualité avant tout']].map(([k, l, s]) => `<button class="opt" type="button" data-c="mobilite" data-v="${k}" aria-pressed="${CQ.mobilite === k}"><b>${l}</b><small>${s}</small></button>`).join('')}</div>`,
    () => `<span class="stepno">Question 5 sur 5, facultative</span><h2 style="margin-bottom:18px">Vos préférences</h2><span class="label">Marque</span><div class="chips" style="margin:10px 0 20px">${[['', 'Aucune'], ['Canon', 'Canon'], ['Fujifilm', 'Fujifilm'], ['Sony', 'Sony']].map(([k, l]) => `<button class="chip" type="button" data-c="marque" data-v="${k}" aria-pressed="${CQ.marque === k}">${l}</button>`).join('')}</div><span class="label">État souhaité</span><div class="chips" style="margin-top:10px">${[['', 'Peu importe'], ['comme_neuf', 'Comme neuf ou très bon']].map(([k, l]) => `<button class="chip" type="button" data-c="etat" data-v="${k}" aria-pressed="${CQ.etat === k}">${l}</button>`).join('')}</div><p class="small muted" style="margin-top:18px">Une préférence ajoute un léger bonus ; elle ne masque jamais un meilleur choix.</p>`,
  ];
  const need = ['usage', 'mode', 'niveau', 'mobilite', null];
  const html = `<div class="wiz" style="margin:0 auto">${isApp() ? '' : '<h1>Quel appareil pour ce que vous voulez faire ?</h1><p class="lead" style="margin:10px 0 24px">Cinq questions, sans jargon. Nous écartons ce qui ne convient pas, puis nous expliquons les trois meilleurs choix disponibles.</p>'}
    <div class="prog" aria-hidden="true">${steps.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div><div data-w></div>
    <div class="wnav"><button class="btn btn-line" type="button" data-prev>Retour</button><button class="btn btn-ink" type="button" data-next>Continuer</button></div></div>`;
  return {
    title: 'Conseil', sub: 'Cinq questions, trois choix expliqués.', hideTabs: false, html,
    mount(el) {
      const w = $('[data-w]', el), prev = $('[data-prev]', el), next = $('[data-next]', el);
      const draw = (back) => {
        w.innerHTML = `<div class="wstep${back ? ' back' : ''}">${steps[step]()}</div>`;
        $$('.prog i', el).forEach((x, i) => x.classList.toggle('on', i <= step));
        prev.style.visibility = step ? 'visible' : 'hidden';
        next.textContent = step === 4 ? 'Voir mes recommandations' : 'Continuer';
        next.disabled = !!(need[step] && !CQ[need[step]]);
      };
      el.addEventListener('click', ev => {
        const o = ev.target.closest('[data-c]');
        if (o) {
          const k = o.dataset.c, v = k === 'jours' ? +o.dataset.v : o.dataset.v; CQ[k] = v;
          if (k === 'mode') { CQ.budget = v === 'achat' ? 1500 : 200; draw(); return; }
          $$(`[data-c="${k}"]`, el).forEach(x => x.setAttribute('aria-pressed', x === o));
          next.disabled = false;
          if (['usage', 'niveau', 'mobilite'].includes(k) && !RM.matches) setTimeout(() => { if (step < 4) { step++; draw(); } }, 260);
        }
      });
      el.addEventListener('input', ev => { if (ev.target.matches('[data-b]')) { CQ.budget = +ev.target.value; $('[data-bv]', el).textContent = eur0(CQ.budget); } });
      prev.onclick = () => { if (step) { step--; draw(true); } };
      next.onclick = () => {
        if (step < 4) { step++; draw(); return; }
        if (!CQ.budget) CQ.budget = CQ.mode === 'achat' ? 1500 : 200;
        track('conseil_complete', { usage: CQ.usage, mode: CQ.mode });
        Nav.go('/conseil/resultats');
      };
      draw();
    },
  };
};
SCREENS.conseilRes = () => {
  if (!CQ.usage || !CQ.mode) { CQ = Object.assign(CQ, { usage: 'video', mode: 'location', budget: 300, jours: 3, niveau: 'intermediaire', mobilite: 'modere' }); }
  const { res, excl, w } = recommend(CQ);
  const buy = CQ.mode === 'achat';
  const ring = s => { const c = 2 * Math.PI * 27; return `<div class="ring" aria-label="Score ${s} sur 100"><svg viewBox="0 0 64 64"><circle class="bg" cx="32" cy="32" r="27"/><circle class="fg" cx="32" cy="32" r="27" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - s / 100)}"/></svg><b>${s}</b></div>`; };
  const summary = `${USAGES[CQ.usage][0]}, ${buy ? 'achat' : `location ${plural(CQ.jours, 'jour')}`}, ${eur0(CQ.budget)} max, ${{ debutant: 'débutant', intermediaire: 'intermédiaire', expert: 'expert' }[CQ.niveau] || 'niveau libre'}`;
  const html = `<div style="max-width:980px">${isApp() ? '' : '<div class="crumbs"><a href="#/conseil">Conseil</a><span>/</span><span>Vos recommandations</span></div><h1>Trois choix pour vous</h1>'}
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:${isApp() ? '0' : '12px'} 0 22px"><span class="tag">${esc(summary)}</span><a class="link small" href="#/conseil" data-act="back">Modifier mes réponses</a></div>
    ${res.length ? res.map((c, i) => `<div class="box reco">
      ${pic(photosOf(c.m)[0], { sizes: '200px' })}
      <div class="rb"><span class="xs muted">${i === 0 ? '<span class="tag amber" style="height:20px">Meilleur choix</span> ' : ''}${esc(c.m.brand)}</span><h3 style="font-size:1.15rem;margin:4px 0 2px"><a href="#/p/${c.m.id}" style="text-decoration:none">${esc(c.m.model)}</a></h3>
        <div class="small muted">${esc(c.m.blurb || '')}</div>
        <ul class="pros">${c.pros.map(p => `<li class="p">${ico('check')}<span>Pour vous : ${p}</span></li>`).join('')}${c.con ? `<li class="c">${ico('minus')}<span>Compromis : ${c.con}</span></li>` : ''}</ul>
        <div class="small" style="margin-top:10px"><b class="num">${eur0(c.prix)}</b> ${buy ? '' : `pour ${plural(CQ.jours, 'jour')}`}${c.m.weight ? ` · <span class="mono">${c.m.weight} g</span>` : ''}${c.lens ? ` · Kit conseillé : + ${esc(fullName(c.lens))} (${eur0(buy ? c.lens.price : c.lens.day * CQ.jours)})` : ''}</div>
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn btn-ink" type="button" data-kit="${c.m.id},${c.lens ? c.lens.id : ''}">${ico('plus', 's')}Ajouter le kit</button><a class="btn btn-line" href="#/p/${c.m.id}">Voir l’annonce</a></div>
      </div>${ring(c.score)}</div>`).join('') : `<div class="empty">${ico('info')}<h3>Aucun boîtier dans ce budget</h3><p class="muted small">Augmentez le budget ou publiez votre besoin : un propriétaire peut avoir mieux.</p><a class="btn btn-ink" href="#/demande">Publier un besoin</a></div>`}
    ${res.length > 1 ? `<div style="margin-top:20px"><button class="btn btn-line" type="button" data-cmpall="${res.map(c => c.m.id).join(',')}">${ico('compare', 's')}Comparer ces ${res.length} boîtiers</button></div>` : ''}
    <div class="box" style="margin-top:24px"><h2>Comment ces recommandations sont calculées</h2><p class="small">Nous écartons d’abord le matériel non disponible ${buy ? 'à l’achat' : 'à la location'} ou hors budget${excl ? ` (${plural(excl, 'annonce écartée', 'annonces écartées')} pour le budget)` : ''}. Chaque critère reçoit ensuite un poids selon vos réponses : ${Object.entries(w).map(([k, x]) => `${CRIT[k][0]} ×${x}`).join(', ')}.</p><p class="small muted" style="margin:0">Vos préférences de marque et d’état ajoutent un léger bonus. Aucun résultat n’est sponsorisé. Moteur de règles reco-v1.0, repris du prototype PHP.</p></div></div>`;
  return {
    title: 'Vos recommandations', html,
    mount(el) {
      requestAnimationFrame(() => setTimeout(() => $$('.ring .fg', el).forEach(c => { c.style.strokeDashoffset = c.dataset.off; }), 120));
      el.addEventListener('click', ev => {
        const k = ev.target.closest('[data-kit]');
        if (k) { const ids = k.dataset.kit.split(',').filter(Boolean).map(Number); ids.forEach(id => { if (!S.favs.includes(id)) S.favs.push(id); }); save(); syncCounts(); $$('[data-fav]').forEach(b => b.setAttribute('aria-pressed', S.favs.includes(+b.dataset.fav))); k.innerHTML = ico('check', 's') + 'Kit ajouté aux favoris'; k.classList.replace('btn-ink', 'btn-amber'); toast(plural(ids.length, 'élément') + ' ajouté' + (ids.length > 1 ? 's' : '') + ' à vos favoris', 'heart'); track('add_kit', { items: ids }); }
        const c = ev.target.closest('[data-cmpall]');
        if (c) { S.compare = c.dataset.cmpall.split(',').map(Number); save(); Nav.go('/comparer'); }
        const bk = ev.target.closest('[data-act="back"]'); if (bk) { ev.preventDefault(); Nav.back(); }
      });
    },
  };
};

/* ---------- Kits par projet ---------- */
SCREENS.kit = ([code]) => {
  const st = DB.styles.find(s => s.code === code) || DB.styles[0];
  const rows = st.need.map(([cat, why, ids]) => ({ cat, why, items: ids.map(byId) }));
  const all = rows.map(r => r.items[0]);
  const day = all.reduce((s, it) => s + it.day, 0);
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/">Accueil</a><span>/</span><span>Kits par projet</span></div>`}
    <div class="kithd" style="display:grid;grid-template-columns:${isApp() ? '1fr' : '1fr 1fr'};gap:${isApp() ? 18 : 40}px;align-items:center">
      ${pic(DB.P[st.ph][0], { cls: 'r43', eager: true, cover: true, sizes: '(max-width:600px) 100vw, 640px' })}
      <div>${isApp() ? '' : `<span class="tag ink">Kit par projet</span><h1 style="margin:14px 0 10px">${esc(st.name)}</h1>`}<p class="lead">${esc(st.d)}</p>
        <div class="box" style="margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><span class="xs muted">Le kit complet</span><div class="outv num">${eur0(day)} <span class="small muted" style="font-weight:400">/ jour</span></div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line" type="button" data-addall>${ico('heart', 's')}Tout en favoris</button><a class="btn btn-amber" href="#/demande?kit=${st.code}">Demander ce kit</a></div></div></div>
    </div>
    <h2 style="margin:48px 0 18px;font-size:1.3rem">Ce que contient le kit, et pourquoi</h2>
    <div class="grid kitgrid stag">${rows.map((r, i) => r.items.map((it, k) => `<div class="kitcell"><span class="stepno">${String(i + 1).padStart(2, '0')} · ${CAT1[r.cat]}</span><p class="small">${esc(r.why)}</p>${card(it, { i: i + k, cmp: true })}</div>`).join('')).join('')}</div>`;
  return {
    title: st.name, html,
    mount(el) { $('[data-addall]', el).onclick = ev => { all.forEach(it => { if (!S.favs.includes(it.id)) S.favs.push(it.id); }); save(); syncCounts(); $$('[data-fav]').forEach(b => b.setAttribute('aria-pressed', S.favs.includes(+b.dataset.fav))); ev.currentTarget.innerHTML = ico('check', 's') + 'Ajouté'; toast('Kit ajouté à vos favoris', 'heart'); }; },
  };
};

/* ---------- Demande de projet ---------- */
const TYPES = ['Interview', 'Clip', 'Mariage', 'Photo ou vidéo produit', 'Documentaire', 'Court métrage', 'Portrait photo', 'Autre projet'];
let DR = null;
function newDraft(kit) {
  const st = kit && DB.styles.find(s => s.code === kit);
  const t = st ? { interview: 'Interview', portrait: 'Portrait photo', clip: 'Clip', packshot: 'Photo ou vidéo produit', mariage: 'Mariage' }[st.code] : '';
  return { type: t, title: st ? st.name : '', desc: st ? st.d : '', cats: st ? Array.from(new Set(st.need.map(n => n[0]))) : [], has: '', budget: st ? 250 : 150, a: iso(addDays(today, 6)), b: iso(addDays(today, 6)), city: 'Paris 18e', step: 0 };
}
function allDemandes() { return DB.demandes.concat(S.extraDem); }
function visibleOffers(d) { if (!d.created) return d.offers; const t = Date.now() - d.created; return d.offers.filter(o => t >= o.delay); }
function pendingOffers() { return S.extraDem.reduce((s, d) => s + visibleOffers(d).filter(o => !(S.seenOffers[d.id] || []).includes(o.o)).length, 0); }
function makeOffers(d) {
  const n = nDays(fromIso(d.a), fromIso(d.b));
  const by = {};
  ITEMS.filter(it => it.mode === 'rent' && d.cats.includes(it.cat) && it.o !== 5).forEach(it => { (by[it.o] = by[it.o] || []).push(it); });
  const MSG = { 1: 'Je peux vous montrer les réglages à la remise.', 2: 'Studio à Montreuil, vous pouvez tester sur place avant de partir.', 3: 'Batteries supplémentaires incluses.', 4: 'Je fournis les piles et une bonnette de rechange.' };
  const offers = Object.entries(by).map(([o, list]) => {
    const pick = d.cats.map(c => list.filter(i => i.cat === c).sort((a, b) => a.day - b.day)[0]).filter(Boolean);
    if (!pick.length) return null;
    const brut = pick.reduce((s, i) => s + i.day * n, 0), rate = n >= 7 ? .2 : n >= 3 ? .1 : 0;
    const total = Math.round(brut * (1 - rate) * 1.08);
    const dep = Math.max(...pick.map(i => Math.min(R.depMax, Math.max(R.depMin, i.paid * .1))));
    const u = user(+o);
    return { o: +o, items: pick.map(i => i.id), kit: pick.map(i => shortName(i) === i.model ? `${i.brand} ${i.model}` : `${i.brand} ${i.model}`).join(', '), total, dep: Math.round(dep), mode: +o === 2 ? 'Main propre ou studio' : (u.km > 8 ? 'Point relais' : 'Main propre'), km: u.km, msg: MSG[o], match: pick.length };
  }).filter(Boolean).filter(x => x.total <= d.budget * 1.2).sort((a, b) => b.match - a.match || a.total - b.total).slice(0, 3);
  [2600, 6200, 10500].forEach((t, i) => { if (offers[i]) offers[i].delay = t; });
  return offers;
}
SCREENS.demande = (p, q) => {
  if (!DR || q.kit) DR = newDraft(q.kit);
  const mine = allDemandes().filter(d => d.mine);
  const others = DB.demandes.filter(d => !d.mine);
  const steps = [
    () => `<span class="stepno">Étape 1 sur 3</span><h2 style="margin-bottom:16px">Votre projet</h2>
      <div class="wq"><span class="label">Type de tournage</span><div class="chips">${TYPES.map(t => `<button class="chip" type="button" data-d="type" data-v="${t}" aria-pressed="${DR.type === t}">${t}</button>`).join('')}</div></div>
      <label class="field"><span>En une phrase</span><input class="input" data-in="title" value="${esc(DR.title)}" placeholder="Ex. Interview d’une artiste dans son atelier" maxlength="90"></label>
      <label class="field"><span>Détails utiles <span class="muted" style="font-weight:400">(facultatif)</span></span><textarea class="textarea" data-in="desc" placeholder="Intérieur ou extérieur, durée, ambiance recherchée…">${esc(DR.desc)}</textarea></label>`,
    () => `<span class="stepno">Étape 2 sur 3</span><h2 style="margin-bottom:16px">Ce qu’il vous faut</h2>
      <div class="wq"><span class="label">Vous cherchez</span><div class="chips">${Object.entries(CAT1).map(([k, v]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="${DR.cats.includes(k)}">${ico(k)}${v}</button>`).join('')}</div></div>
      <label class="field"><span>Ce que vous avez déjà <span class="muted" style="font-weight:400">(pour des offres compatibles)</span></span><input class="input" data-in="has" value="${esc(DR.has)}" placeholder="Ex. Sony A7 IV, objectif 28-70"></label>
      <div class="wq"><span class="label">Budget maximum pour la période</span><div class="outv num" data-bv>${eur0(DR.budget)}</div><input class="range" type="range" min="40" max="800" step="10" value="${DR.budget}" data-bud aria-label="Budget"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="field"><span>Dates</span><button class="datebtn" type="button" data-act="ddates" style="grid-template-columns:1fr;margin:0"><span><small>Tournage</small><b data-dd>${period(fromIso(DR.a), fromIso(DR.b))}</b></span></button></div>
      <label class="field"><span>Lieu</span><select class="select" data-in="city">${CITIES.concat(['Paris 20e', 'Saint-Denis']).map(c => `<option ${DR.city === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>`,
    () => `<span class="stepno">Étape 3 sur 3</span><h2 style="margin-bottom:16px">Vérifiez avant de publier</h2>
      <div class="box"><span class="tag">${esc(DR.type || 'Projet')}</span><h3 style="font-size:1.2rem;margin:10px 0 6px">${esc(DR.title || 'Sans titre')}</h3>${DR.desc ? `<p class="small muted">${esc(DR.desc)}</p>` : ''}
      <div class="dsum" style="margin-top:12px"><div><small>Cherche</small><b>${DR.cats.map(c => CAT1[c]).join(', ') || '—'}</b></div><div><small>Budget</small><b>${eur0(DR.budget)}</b></div><div><small>Quand</small><b>${period(fromIso(DR.a), fromIso(DR.b))}</b></div><div><small>Où</small><b>${esc(DR.city)}</b></div></div>
      ${DR.has ? `<p class="small" style="margin:12px 0 0">Déjà possédé : ${esc(DR.has)}</p>` : ''}</div>
      <p class="small muted" style="margin-top:14px">Votre demande est visible des propriétaires vérifiés qui ont ce type de matériel. Vos coordonnées ne sont jamais affichées ; vous ne payez rien avant d’avoir choisi une offre.</p>`,
  ];
  const ok = s => s === 0 ? !!(DR.type && DR.title.trim().length > 3) : s === 1 ? DR.cats.length > 0 : true;
  const html = `<div style="display:grid;grid-template-columns:${isApp() ? '1fr' : 'minmax(0,1fr) 360px'};gap:48px;align-items:start">
    <div class="wiz">${isApp() ? '' : '<h1>Décrivez votre projet</h1><p class="lead" style="margin:10px 0 22px">Les propriétaires qui ont le bon matériel vous proposent un kit complet, prix total et caution compris. Gratuit et sans engagement.</p>'}
      <div class="prog" aria-hidden="true"><i></i><i></i><i></i></div><div data-w></div>
      <div class="wnav"><button class="btn btn-line" type="button" data-prev>Retour</button><button class="btn btn-ink" type="button" data-next>Continuer</button></div></div>
    <aside>
      ${mine.length ? `<h2 style="font-size:1.15rem;margin:${isApp() ? '28px' : '6px'} 0 12px">Mes demandes</h2><div class="dlist">${mine.map(d => drow(d)).join('')}</div>` : ''}
      <h2 style="font-size:1.15rem;margin:28px 0 6px">Près de chez vous</h2><p class="small muted" style="margin:0 0 12px">Vous avez ce matériel ? Répondez et louez-le.</p><div class="dlist">${others.map(d => drow(d)).join('')}</div>
    </aside></div>`;
  return {
    title: 'Publier un besoin', root: true, sub: 'Les propriétaires vous font une offre.', live: true, html,
    mount(el) {
      const w = $('[data-w]', el), prev = $('[data-prev]', el), next = $('[data-next]', el);
      const draw = back => {
        w.innerHTML = `<div class="wstep${back ? ' back' : ''}">${steps[DR.step]()}</div>`;
        $$('.prog i', el).forEach((x, i) => x.classList.toggle('on', i <= DR.step));
        prev.style.visibility = DR.step ? 'visible' : 'hidden';
        next.textContent = DR.step === 2 ? 'Publier ma demande' : 'Continuer';
        next.classList.toggle('btn-amber', DR.step === 2); next.classList.toggle('btn-ink', DR.step !== 2);
        next.disabled = !ok(DR.step);
      };
      el.addEventListener('click', ev => {
        const t = ev.target.closest('[data-d]'); if (t) { DR[t.dataset.d] = t.dataset.v; $$('[data-d]', el).forEach(x => x.setAttribute('aria-pressed', x === t)); if (!DR.title) { DR.title = { Interview: 'Interview en intérieur', Clip: 'Tournage d’un clip', Mariage: 'Film de mariage', 'Photo ou vidéo produit': 'Photos produit', Documentaire: 'Tournage documentaire', 'Court métrage': 'Court métrage', 'Portrait photo': 'Séance portrait', 'Autre projet': '' }[DR.type]; const i = $('[data-in="title"]', el); if (i) i.value = DR.title; } next.disabled = !ok(DR.step); }
        const c = ev.target.closest('[data-cat]'); if (c) { const k = c.dataset.cat, i = DR.cats.indexOf(k); if (i >= 0) DR.cats.splice(i, 1); else DR.cats.push(k); c.setAttribute('aria-pressed', DR.cats.includes(k)); next.disabled = !ok(DR.step); }
        if (ev.target.closest('[data-act="ddates"]')) openDemDates(el);
      });
      el.addEventListener('input', ev => { const t = ev.target; if (t.dataset.in) { DR[t.dataset.in] = t.value; next.disabled = !ok(DR.step); } if (t.matches('[data-bud]')) { DR.budget = +t.value; $('[data-bv]', el).textContent = eur0(DR.budget); } });
      el.addEventListener('change', ev => { const t = ev.target; if (t.dataset.in) DR[t.dataset.in] = t.value; });
      prev.onclick = () => { if (DR.step) { DR.step--; draw(true); } };
      next.onclick = () => {
        if (DR.step < 2) { DR.step++; draw(); const sc = el.querySelector('.sc'); if (isApp() && sc) sc.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const id = 100 + S.extraDem.length + 1;
        const d = { id, mine: true, who: 'Léa', title: DR.title.trim(), type: DR.type, desc: DR.desc.trim(), budget: DR.budget, a: DR.a, b: DR.b, city: DR.city, has: DR.has.trim() || 'Rien de précisé', cats: DR.cats.slice(), created: Date.now(), ago: 'à l’instant' };
        d.offers = makeOffers(d);
        S.extraDem.unshift(d); save(); DR = null;
        track('generate_lead', { lead_type: 'besoin', categories: d.cats.join(',') });
        Nav.go('/demande/' + id, { push: true });
      };
      draw();
    },
  };
};
function drow(d) {
  const n = visibleOffers(d).length, when = d.a ? period(fromIso(d.a), fromIso(d.b)) : period(addDays(today, d.d0), addDays(today, d.d1));
  return `<a class="drow" href="#/demande/${d.id}"><div><span class="xs muted">${esc(d.type)} · ${esc(d.city)}</span><div class="strong" style="margin:2px 0">${esc(d.title)}</div><span class="small muted">${when}, ${eur0(d.budget)} max</span></div><span class="tag ${n ? 'amber' : ''}">${plural(n, 'offre')}</span></a>`;
}
function openDemDates(el) {
  let x = fromIso(DR.a), y = fromIso(DR.b);
  openSheet({ title: 'Dates du tournage', html: `<div data-sc>${calendar(0, x, y, 2)}</div>`, foot: `<span style="flex:1" class="small" data-sp>${period(x, y)}</span><button class="btn btn-ink" type="button" data-ok>Valider</button>`,
    onMount(sh, s) { const sc = $('[data-sc]', sh); calPicker(sc, 0, () => [x, y], (p, r, part) => { x = p; y = r; sc.innerHTML = calendar(0, x, part ? null : y, 2); $('[data-sp]', sh).textContent = part ? 'Choisissez la fin' : period(x, y); $('[data-ok]', sh).disabled = !!part; });
      $('[data-ok]', sh).onclick = () => { DR.a = iso(x); DR.b = iso(y); const dd = $('[data-dd]', el); if (dd) dd.textContent = period(x, y); s.close(); }; } });
}
function offerCard(d, o, isNew) {
  const u = user(o.o), n = d.a ? nDays(fromIso(d.a), fromIso(d.b)) : (d.d1 - d.d0 + 1);
  const items = (o.items || []).map(byId).filter(Boolean);
  return `<article class="offer${isNew ? ' new' : ''}" data-offer="${o.o}">${isNew ? '<span class="tag amber newb">Nouvelle offre</span>' : ''}
    <div class="hd"><span class="avatar a${u.id}">${initials(u.name)}</span><div><b>${esc(u.name)}</b><div class="xs muted">${u.rating ? '★ ' + String(u.rating.toFixed(1)).replace('.', ',') + ' · ' + u.n + ' locations' : 'Nouveau'} · Identité vérifiée</div></div><label class="check xs" style="align-items:center"><input type="checkbox" data-ocmp="${o.o}"> Comparer</label></div>
    ${items.length ? `<div class="kitrow">${items.map(i => `<a href="#/p/${i.id}" title="${esc(fullName(i))}">${pic(photosOf(i)[0], { sizes: '100px' })}</a>`).join('')}</div>` : ''}
    <div><b class="small">${esc(o.kit)}</b></div>
    <div class="facts"><span>${ico('pin', 's')}${esc(o.mode)}, ${km(o.km)}</span><span>${ico('lock', 's')}Caution ${eur0(o.dep)}</span><span>${ico('cal', 's')}${plural(n, 'jour')}</span></div>
    ${o.msg ? `<p class="msg">« ${esc(o.msg)} »</p>` : ''}
    <div class="ft"><div><span class="xs muted">Prix total, frais compris</span><div class="tot num">${eur0(o.total)}</div></div><button class="btn btn-amber" type="button" data-accept="${o.o}">Accepter cette offre</button></div>
  </article>`;
}
SCREENS.demandeView = ([id]) => {
  const d = allDemandes().find(x => x.id === +id);
  if (!d) return { title: 'Demande', html: '<div class="empty"><h3>Demande introuvable</h3><a class="btn btn-ink" href="#/demande">Publier un besoin</a></div>' };
  const a = d.a ? fromIso(d.a) : addDays(today, d.d0), b = d.a ? fromIso(d.b) : addDays(today, d.d1);
  let sort = 'prix';
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/demande">Demandes</a><span>/</span><span>${esc(d.title)}</span></div>`}
    <div style="max-width:880px">
      <span class="tag ${d.mine ? 'amber' : ''}">${d.mine ? 'Ma demande' : 'Demande de ' + esc(d.who)} · ${esc(d.type)}</span>
      <h1 style="margin:12px 0 8px">${esc(d.title)}</h1>${d.desc ? `<p class="lead" style="font-size:1.02rem">${esc(d.desc)}</p>` : ''}
      <div class="dsum" style="margin:18px 0 28px"><div><small>Cherche</small><b>${d.cats.map(c => CAT1[c]).join(', ')}</b></div><div><small>Budget</small><b>${eur0(d.budget)}</b></div><div><small>Quand</small><b>${period(a, b)}</b></div><div><small>Où</small><b>${esc(d.city)}</b></div><div><small>Possède déjà</small><b>${esc(d.has)}</b></div></div>
      ${d.mine ? `<div class="sec-h" style="margin-bottom:12px"><div><h2 style="font-size:1.3rem" data-oc></h2></div><select class="select" data-sort style="width:auto;min-height:40px" aria-label="Trier les offres"><option value="prix">Prix</option><option value="km">Distance</option><option value="note">Note</option></select></div>
      <div class="offers" data-offers></div><div data-waitbox></div>
      <div style="margin-top:16px"><button class="btn btn-line" type="button" data-cmpo disabled>${ico('compare', 's')}Comparer les offres cochées</button></div>`
      : `<div class="box"><h2>Vous avez ce matériel ?</h2><p class="small muted">Proposez un kit avec un prix total, une caution et un mode de remise. ${d.offers.length ? plural(d.offers.length, 'propriétaire a', 'propriétaires ont') + ' déjà répondu.' : 'Personne n’a encore répondu.'}</p><button class="btn btn-ink" type="button" data-reply>Répondre avec mon matériel</button></div>`}
    </div>`;
  let iv, shown = new Set();
  return {
    title: d.mine ? 'Ma demande' : 'Demande', hideTabs: false, html,
    mount(el) {
      const rep = $('[data-reply]', el); if (rep) rep.onclick = () => { rep.disabled = true; rep.innerHTML = ico('check', 's') + 'Réponse envoyée (démo)'; toast('Votre offre a été transmise à ' + d.who); };
      if (!d.mine) return;
      const box = $('[data-offers]', el), wait = $('[data-waitbox]', el), oc = $('[data-oc]', el);
      const draw = () => {
        const vis = visibleOffers(d).slice();
        const key = { prix: o => o.total, km: o => o.km, note: o => -(user(o.o).rating || 0) }[sort];
        vis.sort((x, y) => key(x) - key(y));
        const fresh = vis.filter(o => !shown.has(o.o));
        oc.textContent = vis.length ? plural(vis.length, 'offre reçue', 'offres reçues') : 'En attente d’offres';
        if (fresh.length || box.children.length !== vis.length) {
          const before = new Set(shown);
          box.innerHTML = vis.map(o => offerCard(d, o, d.created && !before.has(o.o) && shown.size + fresh.length > 0 && before.size >= 0 && !before.has(o.o) && !RM.matches)).join('');
          vis.forEach(o => shown.add(o.o));
          if (fresh.length && d.created && isApp() && navigator.vibrate) navigator.vibrate(12);
        }
        const all = d.offers.length, left = all - vis.length;
        wait.innerHTML = d.created && left > 0 ? `<div class="wait" style="margin-top:14px"><div class="radar"><i></i><i></i><b></b></div><div><b>Les propriétaires regardent votre demande</b><div class="small muted">${plural(left, 'propriétaire prépare', 'propriétaires préparent')} une offre. Vous pouvez quitter cette page.</div></div></div>`
          : (!all ? `<div class="wait">${ico('info')}<div><b>Pas encore d’offre</b><div class="small muted">Aucun kit ne correspond à ce budget pour l’instant. Élargissez le budget ou parcourez le catalogue.</div><a class="link small" href="#/explorer">Explorer le matériel</a></div></div>` : '');
        S.seenOffers[d.id] = vis.map(o => o.o); save(); syncBadges();
        if (left <= 0) clearInterval(iv);
      };
      if (!d.created) visibleOffers(d).forEach(o => shown.add(o.o));
      draw(); iv = setInterval(() => { if (el.isConnected) draw(); }, 700);
      el._iv = iv;
      $('[data-sort]', el).addEventListener('change', ev => { sort = ev.target.value; box.innerHTML = ''; draw(); });
      const cb = $('[data-cmpo]', el);
      el.addEventListener('change', ev => { if (ev.target.matches('[data-ocmp]')) { const n = $$('[data-ocmp]:checked', el).length; cb.disabled = n < 2; cb.innerHTML = ico('compare', 's') + (n >= 2 ? `Comparer ${n} offres` : 'Comparer les offres cochées'); } });
      cb.onclick = () => openOfferCompare(d, $$('[data-ocmp]:checked', el).map(x => +x.dataset.ocmp));
      el.addEventListener('click', ev => { const b = ev.target.closest('[data-accept]'); if (b) acceptOffer(d, +b.dataset.accept); });
    },
    destroy() { clearInterval(iv); },
  };
};
function openOfferCompare(d, ids) {
  const os = d.offers.filter(o => ids.includes(o.o));
  const best = (f, lo = true) => (lo ? Math.min : Math.max)(...os.map(f));
  const row = (l, f, b, lo = true) => `<tr><th scope="row">${l}</th>${os.map(o => `<td class="${b && b(o) === best(b, lo) ? 'best' : ''}">${f(o)}</td>`).join('')}</tr>`;
  openSheet({ title: 'Comparer les offres', wide: true,
    html: `<div class="cmpwrap"><table class="cmp"><thead><tr><th></th>${os.map(o => `<th>${esc(user(o.o).name)}</th>`).join('')}</tr></thead><tbody>
      ${row('Kit', o => esc(o.kit))}${row('Prix total', o => eur0(o.total), o => o.total)}${row('Caution', o => eur0(o.dep), o => o.dep)}${row('Remise', o => esc(o.mode))}${row('Distance', o => km(o.km), o => o.km)}${row('Note', o => user(o.o).rating ? '★ ' + String(user(o.o).rating.toFixed(1)).replace('.', ',') : 'Nouveau', o => user(o.o).rating || 0, false)}
      <tr><th></th>${os.map(o => `<td><button class="btn btn-amber" type="button" data-acc="${o.o}" style="min-height:38px">Accepter</button></td>`).join('')}</tr></tbody></table></div><p class="xs muted" style="margin-top:10px">En gras, la meilleure valeur de chaque ligne.</p>`,
    onMount(el, s) { el.addEventListener('click', ev => { const b = ev.target.closest('[data-acc]'); if (b) { s.close(); setTimeout(() => acceptOffer(d, +b.dataset.acc), 300); } }); },
  });
}
function acceptOffer(d, oid) {
  const o = d.offers.find(x => x.o === oid), u = user(o.o);
  const a = d.a ? fromIso(d.a) : addDays(today, d.d0), b = d.a ? fromIso(d.b) : addDays(today, d.d1);
  openSheet({ title: 'Accepter l’offre de ' + u.name,
    html: `<div class="lines num"><div><span>${esc(o.kit)}</span><span></span></div><div><span>${period(a, b)}</span><span></span></div><div class="tot"><span>Total</span><span>${eur(o.total)}</span></div><div class="cau"><span>Caution, bloquée puis libérée</span><span>${eur0(o.dep)}</span></div></div>
      <div class="simpay">${ico('info')}<div><b>Paiement simulé.</b> Aucun moyen de paiement n’est demandé dans ce prototype.</div></div>`,
    foot: `<button class="btn btn-amber btn-l btn-block" type="button" data-pay>Payer ${eur(o.total)} (simulé)</button>`,
    onMount(el, s) {
      $('[data-pay]', el).onclick = ev => {
        const btn = ev.currentTarget; btn.disabled = true; btn.innerHTML = '<span class="spin"></span>Paiement en cours';
        setTimeout(() => {
          const ref = 'FS-D-' + String(Math.floor(1000 + Math.random() * 8999));
          S.bookings.unshift({ ref, item: (o.items || [])[0] || 3, items: o.items, kit: o.kit, a: iso(a), b: iso(b), total: o.total, dep: o.dep, status: 'confirmée', ship: 'main', at: iso(today) });
          d.accepted = oid; save(); s.close();
          track('purchase', { transaction_id: ref, value: o.total, currency: 'EUR', source: 'offre' });
          setTimeout(() => Nav.go('/ok/' + ref, { push: true }), 250);
        }, 1000);
      };
    },
  });
}
