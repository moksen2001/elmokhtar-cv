/* =====================================================================
   Accueil
   ===================================================================== */
const HERO = [
  { k: 'h-son', cap: 'Ambiances sonores en pleine nature', kit: [30, 29], pos: '64% 50%', af: [55, 36] },
  { k: 'h-nuit', cap: 'Photo de rue, de nuit', kit: [1], pos: '50% 50%', af: [46, 38] },
  { k: 'h-doc', cap: 'Documentaire, prise de son au couchant', kit: [16, 17], pos: '50% 30%', af: [66, 30] },
  { k: 'h-photo', cap: 'Portrait sur le vif', kit: [9, 27], pos: '50% 40%', af: [56, 34] },
];
const POP = { rent: [27, 1, 9, 14, 32, 18, 2, 24, 17, 6, 19, 5], buy: [11, 21, 22, 35, 12, 34, 23, 4, 25, 26, 33] };
const CAT_PH = { boitier: ['a7iv', 0], objectif: ['gm2470', 0], lumiere: ['amaran', 0], son: ['wgo2', 0], stabilisation: ['rs4', 0], accessoire: ['tripods', 0] };
const COPY = {
  rent: { h: 'Le matériel de votre prochain tournage, chez un créateur près de chez vous.', l: 'Louez à la journée des boîtiers, objectifs, lumières et micros contrôlés, auprès de propriétaires vérifiés à Paris et en petite couronne. Assurance incluse, caution restituée au retour.', ph: 'FX3, micro-cravate, lumière douce…' },
  buy: { h: 'Du matériel d’occasion contrôlé, jusqu’à 45 % sous le prix du neuf.', l: 'Achetez à des créateurs qui revendent leur matériel : état noté, compteur vérifié, garantie jusqu’à 12 mois et prix total affiché avant de payer.', ph: 'A7 IV, X-T5, 24-70 mm…' },
};
const kitPrice = ids => ids.map(byId).reduce((s, it) => s + (it.day || 0), 0);

function heroVF(o = {}) {
  return `<div class="vf" data-hero aria-roledescription="carrousel" aria-label="Projets tournés avec du matériel loué">
    ${HERO.map((h, i) => { const p = DB.P[h.k][0]; return `<div class="slide${i === 0 ? ' on' : ''}" data-i="${i}"><img src="${p.s}" alt="${esc(h.cap)}" style="object-position:${h.pos}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false"></div>`; }).join('')}
    <div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="af" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="rec" aria-hidden="true"><b></b><span>REC</span></div>
    <div class="dots" aria-hidden="true">${HERO.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
    <div class="exif"><div><div class="cap" data-cap>${esc(HERO[0].cap)}</div><div class="mono" data-kit></div></div></div>
    ${o.inner || ''}
  </div>`;
}
function heroKit(i) { const h = HERO[i]; return h.kit.map(id => shortName(byId(id))).join(' + ') + ' · dès ' + eur0(kitPrice(h.kit)) + '/jour'; }
function runHero(root) {
  const vf = $('[data-hero]', root); if (!vf) return () => {};
  const slides = $$('.slide', vf), dots = $$('.dots i', vf), af = $('.af', vf);
  let i = 0, timers = [];
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  const focus = s => {
    $('[data-kit]', vf).textContent = heroKit(i); $('[data-cap]', vf).textContent = HERO[i].cap;
    if (RM.matches) { s.classList.add('sharp'); return; }
    const p = HERO[i].af || [50, 46]; af.style.left = p[0] + '%'; af.style.top = p[1] + '%';
    af.classList.remove('lock', 'hunt'); void af.offsetWidth; af.classList.add('hunt');
    later(() => { s.classList.add('sharp'); }, 380);
    later(() => { af.classList.add('lock'); }, 1150);
    later(() => { af.classList.remove('hunt'); }, 2300);
    later(() => { s.classList.add('drift'); }, 1400);
  };
  const img = $('img', slides[0]);
  const start = () => focus(slides[0]);
  if (img.complete) setTimeout(start, 120); else img.addEventListener('load', start, { once: true });
  const iv = setInterval(() => {
    if (!vf.isConnected || vf.closest('.below') || document.hidden) return;
    const prev = slides[i]; i = (i + 1) % slides.length; const s = slides[i];
    s.classList.remove('sharp', 'drift'); prev.classList.remove('on');
    setTimeout(() => prev.classList.remove('sharp', 'drift'), 1200);
    s.classList.add('on'); dots.forEach((d, k) => { d.classList.remove('on'); if (k === i) { void d.offsetWidth; d.classList.add('on'); } });
    focus(s);
  }, 6000);
  return () => { clearInterval(iv); timers.forEach(clearTimeout); };
}

/* Comment ça marche : trois étapes animées */
function howBlock() {
  const d = DB.demandes[0];
  return `<div class="how">
    <div>
      <h2>Pas besoin de connaître les références.</h2>
      <p class="muted" style="margin-top:10px">Décrivez ce que vous tournez. Les propriétaires qui ont le bon matériel vous proposent un kit complet, prix total et caution compris.</p>
      <ol class="steps" data-steps>
        <li class="on" data-s="0"><span class="n">1</span><div><b>Décrivez votre projet</b><p>Le tournage, les dates, le lieu, le budget et ce que vous avez déjà.</p></div><span class="bar"></span></li>
        <li data-s="1"><span class="n">2</span><div><b>Recevez des offres</b><p>Des kits compatibles, en général en moins de 24 h.</p></div><span class="bar"></span></li>
        <li data-s="2"><span class="n">3</span><div><b>Comparez et réservez</b><p>Prix, distance, état : vous choisissez, la caution est bloquée puis libérée.</p></div><span class="bar"></span></li>
      </ol>
      <a class="btn btn-ink" href="#/demande" style="margin-top:18px">Publier un besoin</a>
    </div>
    <div class="demo" aria-hidden="true">
      <div class="st on" data-st="0">
        <div class="mini"><span class="xs muted">Votre projet</span><div class="strong" style="margin:4px 0 12px;font-size:1.05rem"><span data-type>${esc(d.title)}</span></div>
          <div class="chips"><span class="chip" aria-pressed="true">${ico('lumiere')}Lumière</span><span class="chip" aria-pressed="true">${ico('son')}Son</span><span class="chip">${ico('objectif')}Objectif</span></div></div>
        <div class="mini" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div><span class="xs muted">Budget</span><div class="strong">150 €</div></div><div><span class="xs muted">Quand</span><div class="strong">${dShort(addDays(today, 5))}</div></div><div><span class="xs muted">Où</span><div class="strong">Paris 18e</div></div></div>
        <div class="mini small muted">Déjà possédé : ${esc(d.has)}</div>
      </div>
      <div class="st" data-st="1">
        <div class="small strong" style="margin-bottom:10px">3 offres reçues</div>
        ${d.offers.map(o => { const u = user(o.o); return `<div class="mini off"><span class="avatar s a${o.o}">${initials(u.name)}</span><div><b class="small">${esc(u.name)}</b><div class="xs muted">${esc(o.kit)}</div></div><b>${eur0(o.total)}</b></div>`; }).join('')}
      </div>
      <div class="st" data-st="2">
        <div class="mini" style="box-shadow:inset 0 0 0 2px var(--ink)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="display:flex;gap:10px;align-items:center"><span class="avatar s a1">CR</span><div><b class="small">Camille R.</b><div class="xs muted">4,2 km, main propre</div></div></div><span class="tag ok">${ico('check')}Réservé</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">${[3, 4].map(id => pic(photosOf(byId(id))[0], { cls: 'r43', sizes: '200px' })).join('')}</div>
          <div class="lines" style="margin-bottom:0"><div><span>Kit pour 1 jour</span><span>45 €</span></div><div class="cau"><span>Caution, bloquée puis libérée</span><span>300 €</span></div></div>
        </div>
      </div>
    </div>
  </div>`;
}
function runHow(root) {
  const box = $('[data-steps]', root); if (!box) return () => {};
  const lis = $$('li', box), sts = $$('[data-st]', root);
  let k = 0, iv;
  const set = n => { k = n; lis.forEach((l, i) => l.classList.toggle('on', i === n)); sts.forEach((s, i) => s.classList.toggle('on', i === n));
    lis[n].querySelector('.bar').replaceWith(Object.assign(document.createElement('span'), { className: 'bar' })); };
  const loop = () => { clearInterval(iv); iv = setInterval(() => { const el = box; if (!el.isConnected || el.closest('.below') || document.hidden) return; set((k + 1) % 3); }, 4200); };
  lis.forEach((l, i) => l.addEventListener('click', () => { set(i); loop(); }));
  loop();
  return () => clearInterval(iv);
}

function ownerBand() {
  return `<div class="owner">
    <div>
      <h2>Votre matériel dort entre deux tournages ? Il peut payer le prochain.</h2>
      <p class="lead" style="margin-top:14px">Publiez gratuitement. Assurance, caution et état des lieux photographié protègent chaque location ; vous êtes payé une fois le matériel rendu.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><a class="btn btn-amber" href="#/proposer/annonce">Proposer mon matériel</a><a class="btn btn-line" href="#/proposer">Simuler mes revenus</a></div>
    </div>
    <div class="simi">
      <div class="small" style="color:#bdbdb7">Un Sony A7 IV acheté 2 800 €, loué</div>
      <div style="display:flex;align-items:baseline;gap:10px;margin:6px 0 2px"><span class="outv" style="color:#fff" data-jm-v>4 jours</span><span style="color:#bdbdb7" class="small">par mois</span></div>
      <input class="range" type="range" min="1" max="12" value="4" data-jm aria-label="Jours de location par mois">
      <div class="small" style="color:#bdbdb7;margin-top:14px">vous rapporte, commission de 12 % déduite</div>
      <div class="big num" data-jm-out>218 €</div>
      <div class="small" style="color:#bdbdb7;margin-top:2px">par mois, à 62 € la journée</div>
    </div>
  </div>`;
}
function catTile(c) {
  const [k, n] = CAT_PH[c], cnt = ITEMS.filter(i => i.cat === c && i.mode === S.mode).length;
  return `<a class="cat" href="#/explorer?cat=${c}">${pic(DB.P[k][n], { sizes: '(max-width:600px) 34vw, 200px', cover: true })}<b>${CATS[c]}</b><span>${cnt} ${S.mode === 'rent' ? 'à louer' : 'à vendre'}</span></a>`;
}
function kitTile(st) {
  const ids = st.need.map(n => n[2][0]), day = ids.reduce((s, id) => s + (byId(id).day || 0), 0);
  return `<a class="kit" href="#/kit/${st.code}">${pic(DB.P[st.ph][0], { sizes: '(max-width:600px) 60vw, 280px', cover: true })}<div class="cap"><b>${esc(st.name)}</b><span>${esc(st.d)}</span><span class="mono">${plural(ids.length, 'élément')} · dès ${eur0(day)}/jour</span></div></a>`;
}
function revCard(r) {
  return `<div class="rev"><span class="stars">${'★★★★★'.slice(0, r.n)}<span class="muted" style="font-weight:400">${'★★★★★'.slice(r.n)}</span></span><q>${esc(r.txt)}</q><div class="who"><span class="avatar s">${initials(r.a)}</span><div><b>${esc(r.a)}</b><div class="xs muted">${esc(r.on)}, chez ${esc(user(r.t).name)}</div></div></div></div>`;
}

SCREENS.home = () => {
  const m = S.mode, C = COPY[m], app = isApp();
  const pop = POP[m].map(byId);
  let cleanup = [];
  const head = app ? `<div class="apphead" style="display:none"><span class="logo">Focal<i></i>Shift</span>${modeToggle()}</div>` : '';
  const hero = app ? `
    ${installHint()}
    <a class="mhero" href="#/demande">${heroVF({ inner: `<div class="txt"><b>Décrivez votre tournage. Les propriétaires vous font une offre.</b><span class="btn btn-amber" style="min-height:40px">Publier un besoin</span></div>` })}</a>
    <button class="msearch" type="button" data-go="#/explorer?focus=1">${ico('search')}${esc(C.ph)}</button>`
    : `<section class="hero">
      <div>
        <span class="tag ink" style="height:28px">${m === 'rent' ? 'Location entre créateurs, Paris et petite couronne' : 'Occasion contrôlée, garantie incluse'}</span>
        <h1 class="d-xl"><span class="swap">${esc(C.h)}</span></h1>
        <p class="lead">${esc(C.l)}</p>
        <form class="qbox" data-qform role="search">
          <label>${ico('search')}<input name="q" placeholder="${esc(C.ph)}" aria-label="Rechercher du matériel" autocomplete="off"></label>
          ${m === 'rent' ? `<button class="dates" type="button" data-act="home-dates">${ico('cal', 's')}<span data-hdates>${S.dates ? period(fromIso(S.dates[0]), fromIso(S.dates[1])) : 'Dates'}</span></button>` : ''}
          <button class="btn btn-ink" type="submit">Chercher</button>
        </form>
        <div class="qsugg"><span>Souvent cherché :</span>${(m === 'rent' ? [['Micro-cravate', 'son'], ['Lumière douce', 'lumiere'], ['Stabilisateur', 'stabilisation'], ['Plein format', 'boitier']] : [['Boîtier', 'boitier'], ['Objectif', 'objectif'], ['Son', 'son']]).map(([t, c]) => `<a class="chip" href="#/explorer?cat=${c}">${t}</a>`).join('')}</div>
        <div class="hero-alt">${ico('msg')}<span>Vous hésitez ? <a class="link" href="#/demande">Décrivez votre projet</a>, les propriétaires vous répondent, ou <a class="link" href="#/conseil">répondez à 5 questions</a>.</span></div>
      </div>
      ${heroVF()}
    </section>`;
  const html = `${head}${hero}
    <section class="sec">${secHead('Par catégorie', '', ['Tout explorer', '#/explorer'], !app)}${rail(['boitier', 'objectif', 'lumiere', 'son', 'stabilisation', 'accessoire'].map(catTile).join(''), { cls: 'cats stag' })}</section>
    <section class="sec">${secHead(m === 'rent' ? 'Disponible près de chez vous' : 'Les meilleures affaires d’occasion', m === 'rent' ? 'Chez des propriétaires vérifiés, à moins de 10 km de Paris 18e.' : 'Prix du neuf affiché, état contrôlé, garantie comprise.', ['Voir tout', '#/explorer'], !app)}${rail(pop.map((it, i) => card(it, { i, sizes: '(max-width:600px) 66vw, 264px' })).join(''), { cls: 'stag' })}</section>
    <section class="sec">${howBlock()}</section>
    <section class="sec">${secHead('Des kits pensés par projet', 'Composés avec le matériel réellement disponible cette semaine.', null, !app)}${rail(DB.styles.map(kitTile).join(''), { cls: 'kits stag' })}</section>
    <section class="sec"><div class="band"><span class="q">5 ?</span><div><h2 style="font-size:1.35rem">Quel boîtier pour ce que vous voulez faire ?</h2><p>Cinq questions sans jargon, trois choix compatibles et expliqués, avec l’objectif qui va avec.</p></div><a class="btn btn-ink" href="#/conseil">Commencer le conseil</a></div></section>
    <section class="sec">${ownerBand()}</section>
    <section class="sec">${secHead('Après chaque location', 'Avis laissés après une transaction réellement effectuée.', null, !app)}${rail(DB.reviews.map(revCard).join(''), { cls: 'revs' })}</section>`;
  return {
    title: 'Accueil', root: true, customHead: true, large: false, pcls: app ? '' : '',
    html: html,
    mount(el) {
      if (app) { const ah = $('.apphead', el); const nb = $('.navbar', el); nb.replaceWith(ah); ah.style.display = ''; }
      cleanup.push(runHero(el), runHow(el));
      const typ = $('[data-type]', el);
      const r = $('[data-jm]', el);
      if (r) r.addEventListener('input', () => {
        const j = +r.value, c = cote('boitier', 2800, 0, 'excellent', j);
        $('[data-jm-v]', el).textContent = plural(j, 'jour'); countTo($('[data-jm-out]', el), Math.round(c.monthly), eur0);
      });
      const f = $('[data-qform]', el);
      if (f) f.addEventListener('submit', ev => { ev.preventDefault(); const q = f.q.value.trim(); Nav.go('/explorer' + (q ? '?q=' + encodeURIComponent(q) : '')); });
      void typ;
    },
    destroy() { cleanup.forEach(f => f && f()); },
  };
};
function modeToggle(cls = '') {
  return `<div class="mode ${cls}" data-v="${S.mode}" role="group" aria-label="Je veux"><span class="thumb"></span><button type="button" data-mode="rent" aria-pressed="${S.mode === 'rent'}">Louer</button><button type="button" data-mode="buy" aria-pressed="${S.mode === 'buy'}">Acheter</button></div>`;
}
function setMode(m) {
  if (S.mode === m) return;
  S.mode = m; save(); track('mode_change', { mode: m });
  $$('.mode').forEach(x => { x.dataset.v = m; $$('button', x).forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m)); });
  const t = Nav.top();
  setTimeout(() => {
    if (t && ['home', 'explore'].includes(t.scr.route)) Nav.refresh();
    // les autres écrans dépendant du mode se mettront à jour à leur prochain affichage
    Object.values(Nav.stacks || {}).forEach(st => st.forEach(e => { if (e !== t && ['home', 'explore'].includes(e.scr.route)) e.stale = true; }));
  }, 260);
}
function installHint() {
  if (!S.install || !S.consent || matchMedia('(display-mode: standalone)').matches || navigator.standalone) return '';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return `<div class="install" data-install><span class="ic">F</span><div><b class="small">Installer l’application</b><div class="xs muted">${ios ? 'Touchez Partager, puis « Sur l’écran d’accueil ».' : 'Ajoutez Focal-Shift à votre écran d’accueil.'}</div></div>${window.__bip ? '<button class="btn btn-ink" type="button" data-act="install" style="min-height:36px;padding:0 12px">Installer</button>' : `<button class="iconbtn" type="button" data-act="install-x" aria-label="Masquer">${ico('close', 's')}</button>`}</div>`;
}
