/* =====================================================================
   Navigation : routeur par ancre (#/…), piles par onglet sur téléphone,
   transitions iOS, retour par glissement depuis le bord, feuilles.
   ===================================================================== */
const SCREENS = {};
const TABS = { home: '/', explore: '/explorer', demande: '/demande', resa: '/reservations', profil: '/profil' };
const ROUTES = [
  [/^\/$/, 'home'],
  [/^\/explorer$/, 'explore'],
  [/^\/p\/(\d+)$/, 'product'],
  [/^\/reserver\/(\d+)$/, 'checkout'],
  [/^\/acheter\/(\d+)$/, 'buy'],
  [/^\/ok\/([\w-]+)$/, 'done'],
  [/^\/comparer$/, 'compare'],
  [/^\/conseil$/, 'conseil'],
  [/^\/conseil\/resultats$/, 'conseilRes'],
  [/^\/kit\/(\w+)$/, 'kit'],
  [/^\/demande$/, 'demande'],
  [/^\/demande\/(\d+)$/, 'demandeView'],
  [/^\/proposer$/, 'proposer'],
  [/^\/proposer\/annonce$/, 'listing'],
  [/^\/reservations$/, 'resa'],
  [/^\/reservation\/([\w-]+)$/, 'resaView'],
  [/^\/favoris$/, 'favs'],
  [/^\/profil$/, 'profil'],
  [/^\/annonces$/, 'myListings'],
  [/^\/credits$/, 'credits'],
  [/^\/confidentialite$/, 'privacy'],
  [/^\/a-propos$/, 'about'],
];
function parse(path) {
  const [p, q] = path.split('?');
  const query = Object.fromEntries(new URLSearchParams(q || ''));
  for (const [re, name] of ROUTES) { const m = p.match(re); if (m) return { name, params: m.slice(1), query, path }; }
  return { name: 'home', params: [], query, path: '/' };
}
const curPath = () => decodeURI(location.hash.slice(1)) || '/';
const tabOfRoot = p => Object.keys(TABS).find(k => TABS[k] === p.split('?')[0]);

const Nav = {
  mode: null, tab: 'home', stacks: {}, web: [], intent: null, scrolls: {}, lock: false,
  init() {
    this.mode = isApp() ? 'app' : 'web';
    $('#views').innerHTML = '';
    this.stacks = {}; this.web = [];
    if (this.mode === 'app') Object.keys(TABS).forEach(t => {
      const v = document.createElement('div'); v.className = 'tabview'; v.dataset.tab = t; v.hidden = true; $('#views').appendChild(v); this.stacks[t] = [];
    });
    const p = curPath(), rt = tabOfRoot(p);
    if (this.mode === 'app') {
      const t = rt || tabFor(parse(p).name);
      this.tab = t; this.stacks[t].push(this.build(rt ? p : TABS[t]));
      if (!rt) this.stacks[t].push(this.build(p));
      this.showTab(t, false);
    } else {
      const e = this.build(p); this.web.push(e); $('#views').appendChild(e.el); this.reveal(e, true);
    }
    this.chrome();
  },
  top() { return this.mode === 'app' ? (this.stacks[this.tab] || []).slice(-1)[0] : this.web.slice(-1)[0]; },
  go(path, o = {}) {
    closeSheets();
    this.intent = o;
    if (curPath() === path) { this.intent = null; if (o.refresh) this.refresh(); return; }
    if (o.replace) location.replace('#' + path); else location.hash = path;
  },
  tabTap(t) {
    if (this.mode !== 'app') return this.go(TABS[t]);
    const st = this.stacks[t];
    if (t === this.tab) {
      if (st.length > 1) { this.go(st[0].path); }
      else { const sc = $('.sc', st[0].el); sc && sc.scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' }); }
      return;
    }
    const target = st.length ? st[st.length - 1].path : TABS[t];
    if (curPath() === target) return this.showTab(t);
    this.go(target, { tab: t });
  },
  back() { if ((this.mode === 'app' ? this.stacks[this.tab].length : this.web.length) > 1) history.back(); else this.go('/'); },
  build(path) {
    const r = parse(path), f = SCREENS[r.name] || SCREENS.home;
    const scr = f(r.params, r.query, r) || {};
    scr.path = path; scr.route = r.name;
    const el = document.createElement('section');
    el.className = 'screen' + (scr.root ? ' root' : '') + (scr.hideTabs ? ' notabs' : '') + (scr.bar ? ' hasbar' : '');
    el.setAttribute('aria-label', scr.title || 'Focal-Shift');
    let h = '<div class="sc" tabindex="-1">';
    if (this.mode === 'app') {
      h += `<div class="navbar${scr.navOver ? ' over' : ''}"><div class="l"><button class="back" type="button" data-act="back" aria-label="Retour">${ico('back')}</button></div><div class="ct">${esc(scr.title || '')}</div><div class="r">${scr.actions || ''}</div></div>`;
      if (scr.large !== false && !scr.navOver && scr.title && !scr.customHead) h += `<div class="mtitle"><h1>${esc(scr.title)}</h1>${scr.sub ? `<p>${scr.sub}</p>` : ''}</div>`;
    }
    h += `<div class="page ${scr.pcls || ''}">${scr.html || ''}</div>`;
    if (this.mode === 'web') h += footer();
    h += '</div>' + (scr.bar ? `<div class="pbar">${scr.bar}</div>` : '');
    el.innerHTML = h;
    const e = { path, scr, el };
    el._e = e;
    return e;
  },
  mount(e) {
    if (e.mounted) return; e.mounted = true;
    const sc = $('.sc', e.el);
    if (this.mode === 'app') {
      const nb = $('.navbar', e.el), mt = $('.mtitle', e.el);
      const lim = () => (mt ? mt.offsetHeight - 6 : (e.scr.navOver ? (e.scr.overAt || 260) : 4));
      let raf = 0;
      sc.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; nb.classList.toggle('solid', sc.scrollTop > lim()); }); }, { passive: true });
    }
    try { e.scr.mount && e.scr.mount(e.el, e); } catch (err) { console.error(err); }
    stagger(e.el);
  },
  reveal(e, first) {
    this.mount(e);
    if (e.scr.onShow) e.scr.onShow(e.el);
    document.title = (e.scr.title && e.route !== 'home' && e.path !== '/' ? e.scr.title + ' · ' : '') + 'Focal-Shift · matériel photo et vidéo entre créateurs';
    this.chrome();
    track('page_view', { page_path: '/' + e.path });
    if (!first) requestAnimationFrame(() => { const sc = $('.sc', e.el); sc && sc.focus({ preventScroll: true }); });
  },
  refresh() {
    const t = this.top(); if (!t) return;
    const sc = $('.sc', t.el), y = sc ? sc.scrollTop : 0;
    const n = this.build(t.path); t.el.replaceWith(n.el); t.scr.destroy && t.scr.destroy(); Object.assign(t, n); t.mounted = false; t.el._e = t;
    this.mount(t); if (t.scr.onShow) t.scr.onShow(t.el);
    const sc2 = $('.sc', t.el); if (sc2) sc2.scrollTop = y;
    this.chrome();
  },
  chrome() {
    const t = this.top(); if (!t) return;
    const tb = $('#tabbar');
    if (this.mode === 'app') {
      tb.classList.toggle('hide', !!t.scr.hideTabs);
      $$('a', tb).forEach(a => a.toggleAttribute('aria-current', false));
      const a = $(`a[data-tab="${this.tab}"]`, tb); a && a.setAttribute('aria-current', 'page');
      const tc = t.scr.theme; document.querySelector('meta[name=theme-color]').content = tc || '#f2f2ef';
    }
    const m = { explore: 'explore', product: 'explore', conseil: 'conseil', conseilRes: 'conseil', proposer: 'proposer', listing: 'proposer', resa: 'resa', resaView: 'resa', favs: 'fav', profil: 'profil' }[t.scr.route];
    $$('#topbar [data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === m));
    renderTray(); syncCounts(); syncBadges();
  },
  /* ----- Téléphone : piles par onglet ----- */
  showTab(t, anim = true) {
    const prev = this.tab; this.tab = t;
    $$('.tabview').forEach(v => { v.hidden = v.dataset.tab !== t; });
    const st = this.stacks[t];
    if (!st.length) st.push(this.build(TABS[t]));
    const view = $(`.tabview[data-tab="${t}"]`);
    st.forEach((e, i) => { if (!e.el.isConnected) view.appendChild(e.el); e.el.classList.toggle('below', i < st.length - 1); });
    const top = st[st.length - 1];
    if (anim && prev !== t && !RM.matches) { top.el.classList.remove('tab-in'); void top.el.offsetWidth; top.el.classList.add('tab-in'); setTimeout(() => top.el.classList.remove('tab-in'), 300); }
    if (top.mounted && (top.scr.live || top.stale)) { top.stale = false; this.refresh(); this.reveal(this.top()); }
    else this.reveal(top, !anim);
  },
  push(path, replace) {
    const st = this.stacks[this.tab], view = $(`.tabview[data-tab="${this.tab}"]`);
    const prev = st[st.length - 1], e = this.build(path);
    if (replace) { st.pop(); st.push(e); view.appendChild(e.el); prev.el.remove(); prev.scr.destroy && prev.scr.destroy(); this.reveal(e); return; }
    st.push(e); view.appendChild(e.el); this.reveal(e);
    if (RM.matches) { prev.el.classList.add('below'); return; }
    e.el.classList.add('push-in'); prev.el.classList.add('push-under');
    this.lock = true;
    setTimeout(() => { e.el.classList.remove('push-in'); prev.el.classList.remove('push-under'); prev.el.classList.add('below'); this.lock = false; }, 500);
  },
  pop(n = 1, fromSwipe) {
    const st = this.stacks[this.tab];
    while (n-- > 0 && st.length > 1) {
      const out = st.pop(), under = st[st.length - 1];
      under.el.classList.remove('below');
      const done = () => { out.el.remove(); out.scr.destroy && out.scr.destroy(); };
      if (n === 0 && !RM.matches && !fromSwipe) {
        out.el.classList.add('pop-out'); under.el.classList.add('pop-under');
        setTimeout(() => { under.el.classList.remove('pop-under'); done(); }, 420);
      } else done();
      if (n === 0 || st.length === 1) { if (under.scr.live || under.stale) { under.stale = false; this.refresh(); this.reveal(this.top()); } else this.reveal(under); }
    }
  },
  handle() {
    closeSheets(); closeLightbox();
    const path = curPath(), it = this.intent || {}; this.intent = null;
    if (this.mode === 'web') return this.handleWeb(path, it);
    if (it.tab) { this.showTab(it.tab); return; }
    const st = this.stacks[this.tab];
    if (st[st.length - 1].path === path) return;
    if (st.length > 1 && st[st.length - 2].path === path && !it.push) return this.pop(1, it.swipe);
    const deeper = st.findIndex(e => e.path === path);
    if (deeper >= 0 && !it.push) return this.pop(st.length - 1 - deeper);
    const other = Object.keys(this.stacks).find(t => t !== this.tab && this.stacks[t].length && this.stacks[t][this.stacks[t].length - 1].path === path);
    if (other && !it.push) return this.showTab(other);
    const rt = tabOfRoot(path);
    if (rt && rt !== this.tab) {
      if (this.top().scr.terminal) this.pop(st.length);
      const s2 = this.stacks[rt]; if (s2.length > 1) { s2.splice(1).forEach(e => e.el.remove()); }
      if (path !== TABS[rt]) { s2.length = 0; s2.push(this.build(path)); }
      return this.showTab(rt);
    }
    if (rt && rt === this.tab) { if (st.length > 1) this.pop(st.length - 1); if (st[0].path !== path) { st[0].path = path; this.refresh(); } return; }
    this.push(path, it.replace);
  },
  /* ----- Ordinateur : une seule pile, fondu ----- */
  handleWeb(path, it) {
    const cur = this.web[this.web.length - 1];
    if (cur && cur.path === path) return;
    if (cur) { const sc = $('.sc', cur.el); this.scrolls[cur.path] = sc ? sc.scrollTop : 0; }
    const isBack = this.web.length > 1 && this.web[this.web.length - 2].path === path && !it.push;
    const e = this.build(path);
    const swap = () => {
      if (cur) { cur.el.remove(); cur.scr.destroy && cur.scr.destroy(); }
      if (isBack) this.web.pop(); else if (it.replace) this.web[this.web.length - 1] = e; else this.web.push(e);
      if (isBack) this.web[this.web.length - 1] = e;
      if (this.web.length > 30) this.web.splice(0, this.web.length - 30);
      $('#views').appendChild(e.el);
      this.reveal(e);
      const sc = $('.sc', e.el);
      if (isBack && this.scrolls[path] != null) sc.scrollTop = this.scrolls[path];
      else if (!this.vt && !RM.matches) e.el.classList.add('enter-fade');
    };
    if (this.vt && document.startViewTransition && !RM.matches) { const vt = this.vt; this.vt = null; document.startViewTransition(() => { swap(); }).finished.finally(() => $$('[style*="view-transition-name"]').forEach(x => x.style.viewTransitionName = '')); void vt; }
    else { this.vt = null; swap(); }
  },
};
function tabFor(name) {
  return { explore: 'explore', product: 'explore', compare: 'explore', demande: 'demande', demandeView: 'demande', resa: 'resa', resaView: 'resa', profil: 'profil', favs: 'profil', credits: 'profil', privacy: 'profil', about: 'profil', proposer: 'profil', listing: 'profil', myListings: 'profil' }[name] || 'home';
}
function syncBadges() {
  const n = pendingOffers();
  const a = $('#tabbar a[data-tab="demande"]'); if (!a) return;
  let b = $('.bdg', a);
  if (n && !b) { b = document.createElement('span'); b.className = 'bdg'; a.appendChild(b); }
  if (b) { if (n) b.textContent = n; else b.remove(); }
}
function stagger(root) {
  $$('.stag', root).forEach(g => { Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10))); });
}

/* ---------- Pied de page (ordinateur) ---------- */
function footer() {
  return `<footer class="foot"><div class="in">
    <div><span class="logo">Focal<i></i>Shift</span><p class="muted small" style="margin-top:12px;max-width:30em">Location, achat et revente de matériel photo et vidéo entre créateurs, à Paris et en petite couronne.</p></div>
    <div><h4>Utiliser Focal-Shift</h4><a href="#/explorer">Explorer le matériel</a><a href="#/demande">Publier un besoin</a><a href="#/conseil">Conseil en 5 questions</a><a href="#/comparer">Comparateur</a></div>
    <div><h4>Propriétaires</h4><a href="#/proposer">Proposer mon matériel</a><a href="#/proposer">Simulateur de revenus</a><a href="#/annonces">Mes annonces</a></div>
    <div><h4>Le prototype</h4><a href="#/a-propos">À propos du projet</a><a href="#/credits">Crédits photos</a><a href="#/confidentialite">Confidentialité et cookies</a><a href="../#projets">Retour au CV d’El Mokhtar Berrada</a></div>
    <p class="fine">Prototype réalisé lors du challenge professionnel de fin d’études du MBA ESG (septembre 2026, équipe 4). Annonces, membres et prix sont fictifs ; le paiement est simulé. Photos de matériel sous licences libres Wikimedia Commons, voir les crédits.</p>
  </div></footer>`;
}

/* ---------- Feuilles (bottom sheets) et fenêtres ---------- */
const sheets = [];
function openSheet(o) {
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const el = document.createElement('div'); el.className = 'sheet' + (o.wide ? ' wide' : '');
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', o.title || '');
  el.innerHTML = `<span class="grab"></span><div class="sh"><h2>${esc(o.title || '')}</h2><button class="iconbtn" type="button" data-x aria-label="Fermer">${ico('close')}</button></div><div class="sb">${o.html || ''}</div>${o.foot ? `<div class="sf">${o.foot}</div>` : ''}`;
  document.body.append(scrim, el);
  const prevFocus = document.activeElement;
  requestAnimationFrame(() => { scrim.classList.add('on'); el.classList.add('on'); });
  const s = { el, scrim, closed: false, close(v) {
    if (s.closed) return; s.closed = true; scrim.classList.remove('on'); el.classList.remove('on'); el.style.transform = '';
    setTimeout(() => { scrim.remove(); el.remove(); }, 420); sheets.splice(sheets.indexOf(s), 1);
    o.onClose && o.onClose(v); prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll: true });
  } };
  sheets.push(s);
  scrim.onclick = () => s.close(); $('[data-x]', el).onclick = () => s.close();
  // glisser vers le bas pour fermer (téléphone)
  let y0 = null, dy = 0, t0 = 0, fromBody = false;
  const sb = $('.sb', el);
  el.addEventListener('touchstart', ev => {
    if (!isApp()) return;
    const inBody = sb.contains(ev.target);
    if (inBody && sb.scrollTop > 0) return;
    if (ev.target.closest('input, textarea, select, .range, .cal button')) return;
    y0 = ev.touches[0].clientY; dy = 0; t0 = performance.now(); fromBody = inBody;
  }, { passive: true });
  el.addEventListener('touchmove', ev => {
    if (y0 == null) return;
    dy = ev.touches[0].clientY - y0;
    if (dy <= 0) { if (fromBody) y0 = null; dy = 0; el.style.transform = ''; return; }
    if (fromBody && dy < 8) return;
    el.classList.add('drag'); el.style.transform = `translateY(${dy}px)`; scrim.style.opacity = String(1 - Math.min(.8, dy / 400));
    ev.cancelable && ev.preventDefault();
  }, { passive: false });
  el.addEventListener('touchend', () => {
    if (y0 == null) return; y0 = null; el.classList.remove('drag'); scrim.style.opacity = '';
    const v = dy / (performance.now() - t0);
    if (dy > 110 || v > .6) s.close(); else el.style.transform = '';
  });
  el.tabIndex = -1; setTimeout(() => { const f = $('[autofocus]', el) || el; f.focus({ preventScroll: true }); }, 60);
  o.onMount && o.onMount(el, s);
  return s;
}
function closeSheets() { sheets.slice().forEach(s => s.close()); }

/* ---------- Visionneuse (galerie plein écran, zoom) ---------- */
let lbEl = null;
function openLightbox(list, start, label) {
  closeLightbox();
  const el = document.createElement('div'); el.className = 'lb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Photos de ' + label);
  el.innerHTML = `<div class="bar"><span class="mono" data-c>${start + 1} / ${list.length}</span><button class="iconbtn" type="button" data-x aria-label="Fermer">${ico('close')}</button></div>
    <div class="track">${list.map(p => `<div class="slide"><img src="${p.s}" alt="${esc(label)}" draggable="false"></div>`).join('')}</div>
    <p class="cap">Touchez deux fois ou cliquez pour zoomer. Glissez pour changer de photo.</p>`;
  document.body.appendChild(el); lbEl = el;
  const tr = $('.track', el);
  requestAnimationFrame(() => { el.classList.add('on'); tr.scrollLeft = start * tr.clientWidth; });
  $('[data-x]', el).onclick = closeLightbox;
  tr.addEventListener('scroll', () => { $('[data-c]', el).textContent = `${Math.round(tr.scrollLeft / tr.clientWidth) + 1} / ${list.length}`; }, { passive: true });
  $$('.slide', el).forEach(sl => {
    const img = $('img', sl); let z = 1, px = 0, py = 0, lastTap = 0, drag = null;
    const apply = () => { img.style.transform = `translate(${px}px, ${py}px) scale(${z})`; sl.classList.toggle('z', z > 1); tr.style.overflowX = z > 1 ? 'hidden' : ''; };
    const toggle = (cx, cy) => {
      if (z > 1) { z = 1; px = py = 0; }
      else { const r = img.getBoundingClientRect(); z = 2.4; px = (r.left + r.width / 2 - cx) * (z - 1); py = (r.top + r.height / 2 - cy) * (z - 1); }
      apply();
    };
    img.addEventListener('click', ev => { if (!isApp()) toggle(ev.clientX, ev.clientY); });
    img.addEventListener('touchend', ev => { const t = Date.now(); if (t - lastTap < 280) { const c = ev.changedTouches[0]; toggle(c.clientX, c.clientY); ev.preventDefault(); } lastTap = t; });
    img.addEventListener('pointerdown', ev => { if (z > 1) { drag = { x: ev.clientX - px, y: ev.clientY - py }; img.setPointerCapture(ev.pointerId); } });
    img.addEventListener('pointermove', ev => { if (drag) { px = ev.clientX - drag.x; py = ev.clientY - drag.y; apply(); } });
    img.addEventListener('pointerup', () => { drag = null; });
  });
}
function closeLightbox() { if (!lbEl) return; const el = lbEl; lbEl = null; el.classList.remove('on'); setTimeout(() => el.remove(), 260); }

/* ---------- Retour par glissement depuis le bord gauche (téléphone) ---------- */
function edgeSwipe() {
  let st = null;
  document.addEventListener('touchstart', ev => {
    if (Nav.mode !== 'app' || Nav.lock || sheets.length || lbEl) return;
    const t = ev.touches[0]; if (t.clientX > 24) return;
    const stack = Nav.stacks[Nav.tab]; if (stack.length < 2) return;
    st = { x: t.clientX, y: t.clientY, top: stack[stack.length - 1].el, under: stack[stack.length - 2].el, dx: 0, t0: performance.now(), on: false };
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    if (!st) return;
    const t = ev.touches[0], dx = t.clientX - st.x, dy = t.clientY - st.y;
    if (!st.on) { if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { st = null; return; } if (dx < 8) return; st.on = true; st.top.classList.add('dragging'); st.under.classList.add('under-drag'); }
    st.dx = Math.max(0, dx); const w = innerWidth, k = st.dx / w;
    st.top.style.transform = `translateX(${st.dx}px)`;
    st.under.style.transform = `translateX(${-28 * (1 - k)}%)`; st.under.style.filter = `brightness(${.92 + .08 * k})`;
    ev.cancelable && ev.preventDefault();
  }, { passive: false });
  document.addEventListener('touchend', () => {
    if (!st) return; const s = st; st = null; if (!s.on) return;
    const w = innerWidth, v = s.dx / (performance.now() - s.t0), go = s.dx > w * .35 || v > .5;
    const tr = 'transform .3s cubic-bezier(.32,.72,0,1), filter .3s';
    s.top.style.transition = tr; s.under.style.transition = tr;
    requestAnimationFrame(() => {
      s.top.style.transform = go ? `translateX(${w}px)` : 'translateX(0)';
      s.under.style.transform = go ? 'translateX(0)' : 'translateX(-28%)'; s.under.style.filter = go ? '' : 'brightness(.92)';
    });
    setTimeout(() => {
      [s.top, s.under].forEach(el => { el.style.transition = ''; el.style.transform = ''; el.style.filter = ''; el.classList.remove('dragging', 'under-drag'); });
      if (go) { Nav.intent = { swipe: true }; history.back(); }
    }, 310);
  });
}

/* ---------- Carrousels : glisser à la souris, flèches ---------- */
function railDrag() {
  let d = null;
  document.addEventListener('pointerdown', ev => {
    if (ev.pointerType !== 'mouse' || ev.button !== 0) return;
    const r = ev.target.closest('[data-rail]'); if (!r) return;
    d = { r, x: ev.clientX, s: r.scrollLeft, moved: false };
  });
  document.addEventListener('pointermove', ev => {
    if (!d) return; const dx = ev.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; d.r.classList.add('dragging'); }
    if (d.moved) d.r.scrollLeft = d.s - dx;
  });
  document.addEventListener('pointerup', () => {
    if (!d) return; const r = d.r, moved = d.moved; d = null;
    if (moved) { r.classList.remove('dragging'); const w = r.firstElementChild ? r.firstElementChild.getBoundingClientRect().width + 18 : 280; r.scrollTo({ left: Math.round(r.scrollLeft / w) * w, behavior: 'smooth' }); r._noclick = true; setTimeout(() => { r._noclick = false; }, 60); }
  });
  document.addEventListener('click', ev => { const r = ev.target.closest('[data-rail]'); if (r && r._noclick) { ev.preventDefault(); ev.stopPropagation(); } }, true);
}
