/* =====================================================================
   Focal-Shift — noyau : utilitaires, état, règles métier, composants
   ===================================================================== */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const isApp = () => document.documentElement.classList.contains('app');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- Icônes (traits 1,8 px) ---------- */
const IC = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  filter: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  compare: '<rect x="3.5" y="5" width="7" height="14" rx="1.5"/><rect x="13.5" y="5" width="7" height="14" rx="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  hand: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.8L4 14.5a1.6 1.6 0 0 1 2.6-1.8L7 13"/>',
  euro: '<path d="M17.5 6.5A6.5 6.5 0 1 0 17.5 17.5M5 10h8M5 14h8"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5L9 15M15 9l2.5-2.5"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  tag: '<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9 8.5"/>',
  doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h6"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  msg: '<path d="M4 5h16v11H9l-5 4z"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  // catégories
  boitier: '<path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.6"/>',
  objectif: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.4"/><path d="M12 3.8v4.8M19.1 8l-4.2 2.4M19.1 16l-4.2-2.4M12 20.2v-4.8M4.9 16l4.2-2.4M4.9 8l4.2 2.4"/>',
  lumiere: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1 2.1V16h5.2v-.1c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  son: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  stabilisation: '<path d="M12 21v-6M8 21h8M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 9.5V6h3.5M18 9.5V6h-3.5"/>',
  accessoire: '<path d="M12 4v5M7 21l5-12 5 12M8.7 17h6.6"/>',
  // usages conseil
  voyage: '<path d="M10.5 13.5L3.5 11l1.5-1.5 7 1 4-4.5a2 2 0 0 1 3 3L14.5 13l1 7-1.5 1.5-2.5-7"/>',
  rue: '<path d="M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
  portrait: '<circle cx="12" cy="9" r="4"/><path d="M5 20.5c1.4-3.5 4-5 7-5s5.6 1.5 7 5"/>',
  sport: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6c3 2.5 3 9.5 0 12M18 6c-3 2.5-3 9.5 0 12"/>',
  nature: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7"/>',
  video: '<rect x="3.5" y="6.5" width="12" height="11" rx="2"/><path d="M15.5 10.5l5-3v9l-5-3z"/>',
};
const ico = (n, c = '') => `<svg class="ico ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------- Formats ---------- */
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eur = v => (Math.abs(v - Math.round(v)) < .005 ? nf0.format(Math.round(v)) : nf2.format(v)) + ' €';
const eur0 = v => nf0.format(Math.round(v)) + ' €';
const km = v => String(v).replace('.', ',') + ' km';
const DAY = 864e5;
const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const dot = s => (/[.!?]$/.test(s) ? s : s + '.');
const dShort = d => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const dLong = d => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const nDays = (a, b) => Math.round((b - a) / DAY) + 1;
const period = (a, b) => (iso(a) === iso(b) ? 'le ' + dShort(a) : `du ${dShort(a)} au ${dShort(b)}`);
const plural = (n, s, p) => `${n} ${n > 1 ? (p || s + 's') : s}`;
const initials = n => n.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ---------- Référentiels ---------- */
const CATS = { boitier: 'Boîtiers', objectif: 'Objectifs', lumiere: 'Lumière', son: 'Son', stabilisation: 'Stabilisation', accessoire: 'Accessoires' };
const CAT1 = { boitier: 'Boîtier', objectif: 'Objectif', lumiere: 'Lumière', son: 'Son', stabilisation: 'Stabilisation', accessoire: 'Accessoire' };
const STATE = { neuf: 'Comme neuf', excellent: 'Très bon', bon: 'Bon', correct: 'Acceptable' };
const STATE_D = { neuf: 'Aucune trace d’usage, emballage d’origine possible.', excellent: 'Micro-traces invisibles à un mètre, fonctionnement parfait.', bon: 'Traces d’usage visibles, optique et capteur sans défaut.', correct: 'Usure marquée ou petit défaut esthétique, entièrement fonctionnel.' };
const CITIES = ['Paris 11e', 'Paris 18e', 'Montreuil', 'Vincennes', 'Boulogne-Billancourt'];
const ITEMS = DB.items;
const byId = id => ITEMS.find(i => i.id === +id);
const user = id => DB.users[id];
const fullName = it => `${it.brand} ${it.model}`;
const shortName = it => it.model.replace(/ \+ .*/, '').replace(/ \(.*\)/, '');

/* ---------- Règles de prix (reprises de includes/metier.php) ---------- */
const R = { ownerFee: .12, renterFee: .08, buyerFee: .05, ship: 15, depMin: 250, depMax: 3000, insDay: .0025 };
function quote(it, a, b) {
  const n = nDays(a, b), brut = it.day * n;
  const rate = n >= 7 ? .2 : n >= 3 ? .1 : 0;
  const disc = Math.round(brut * rate * 100) / 100, loc = brut - disc;
  const fee = Math.round(loc * R.renterFee * 100) / 100;
  const ins = Math.round(Math.max(5, it.paid * R.insDay * n) * 100) / 100;
  const dep = Math.round(Math.min(R.depMax, Math.max(R.depMin, it.paid * .1)));
  return { n, brut, rate, disc, fee, ins, dep, total: Math.round((loc + fee + ins) * 100) / 100, net: Math.round(loc * (1 - R.ownerFee) * 100) / 100 };
}
function buyQuote(it, ship) {
  const fee = Math.round(it.price * R.buyerFee * 100) / 100;
  const s = ship ? R.ship : 0;
  return { price: it.price, fee, ship: s, total: it.price + fee + s };
}
/* Simulateur de cote (functions.php : calcul_cote) */
const HYP = { boitier: [.25, .15, .022], objectif: [.15, .08, .020], lumiere: [.22, .12, .045], son: [.20, .10, .040], stabilisation: [.25, .15, .050], accessoire: [.30, .15, .050] };
const COEF = { neuf: 1, excellent: .92, bon: .82, correct: .68 };
function cote(cat, prix, age, etat, jm) {
  const [d1, dn, tj] = HYP[cat];
  let v = age <= 0 ? prix : prix * (1 - d1) * Math.pow(1 - dn, Math.max(0, age - 1));
  v = Math.max(v * COEF[etat], prix * .15);
  const pj = Math.round(prix * tj), rev = pj * jm * 12 * (1 - R.ownerFee);
  const usure = Math.min(.1, jm * 12 * .0015), v12 = Math.max(v * (1 - dn) * (1 - usure), prix * .12);
  return { v, pj, rev, v12, tot: rev + v12, monthly: pj * jm * (1 - R.ownerFee) };
}
/* Estimation de revente (metier.php : estimer) */
function estimate(cat, prix, annee, etat, acc, coef = 1) {
  const [d1, dn] = HYP[cat]; const age = Math.max(0, today.getFullYear() - annee);
  let ca = age === 0 ? 1 : (1 - d1) * Math.pow(1 - dn, Math.max(0, age - 1)); ca = Math.max(ca, .18);
  const base = prix * ca * COEF[etat] * coef;
  const A = { boite: ['Boîte d’origine', .02], facture: ['Facture d’achat', .03], batterie: ['Batterie supplémentaire', 35], chargeur: ['Chargeur d’origine', 20], sac: ['Sac ou étui', 25] };
  let va = 0; acc.forEach(k => { const [, x] = A[k]; va += x < 1 ? base * x : x; });
  const c = base + va;
  return { ca, ce: COEF[etat], age, va: Math.round(va), lo: Math.round(c * .9), mid: Math.round(c), hi: Math.round(c * 1.08) };
}

/* ---------- Disponibilités (périodes déjà réservées, relatives à aujourd’hui) ---------- */
const BOOKED = { 1: [[10, 12]], 9: [[3, 4], [16, 18]], 2: [[10, 12]], 14: [[6, 7]], 3: [[2, 2], [20, 22]], 18: [[9, 11]], 27: [[13, 14]], 32: [[5, 6]] };
function bookedSet(id) {
  const s = new Set();
  (BOOKED[id] || []).forEach(([a, b]) => { for (let i = a; i <= b; i++) s.add(iso(addDays(today, i))); });
  S.bookings.filter(b => b.item === id && b.status !== 'annulée').forEach(b => { for (let d = fromIso(b.a); d <= fromIso(b.b); d = addDays(d, 1)) s.add(iso(d)); });
  return s;
}
function rangeFree(id, a, b) { const s = bookedSet(id); for (let d = new Date(a); d <= b; d = addDays(d, 1)) if (s.has(iso(d))) return false; return true; }
function firstFree(id, len = 3, from = 2) {
  for (let i = from; i < 60; i++) { const a = addDays(today, i), b = addDays(a, len - 1); if (rangeFree(id, a, b)) return [a, b]; }
  return [addDays(today, from), addDays(today, from + len - 1)];
}

/* ---------- État persistant (navigateur) ---------- */
const KEY = 'focal-shift-v2';
const S = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { s = {}; }
  const d0 = iso(addDays(today, 10)), d1 = iso(addDays(today, 12));
  return Object.assign({
    mode: 'rent', favs: [27, 14, 21], compare: [], consent: null, note: true, install: true,
    bookings: [
      { ref: 'FS-L-0001', item: 1, a: d0, b: d1, total: 300.52, dep: 420, status: 'confirmée', ship: 'main', at: iso(addDays(today, -1)) },
      { ref: 'FS-L-0002', item: 3, a: iso(addDays(today, -16)), b: iso(addDays(today, -15)), total: 59.6, dep: 250, status: 'terminée', ship: 'main', at: iso(addDays(today, -20)) },
    ],
    orders: [{ ref: 'FS-A-0007', item: 21, total: 1747.5, status: 'livrée', ship: 'livraison', at: iso(addDays(today, -19)) }],
    mine: [1], extraDem: [], listings: [], dates: null, seenOffers: {},
  }, s);
})();
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 60); }
function track(ev, p) { window.dataLayer.push(Object.assign({ event: ev }, p || {})); }

/* ---------- Composants ---------- */
function photosOf(it) { return it && it.ph ? DB.P[it.ph] || [] : []; }
const NOPHOTO = '<svg viewBox="0 0 120 90" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="18" y="20" width="84" height="12" rx="6"/><rect x="18" y="48" width="84" height="12" rx="6"/><path d="M30 32v16M90 32v16M60 60v18M48 78h24"/></svg>';
/* Photo avec flou progressif. o: {sizes, cls, eager, cover} */
function pic(p, o = {}) {
  if (!p) return `<div class="ph nophoto ${o.cls || ''}" role="img" aria-label="${esc(o.alt || 'Photo à venir')}">${NOPHOTO}<span class="np">Photo à venir</span></div>`;
  const fit = !o.cover && p.bg && (p.h / p.w > .82);
  const lite = fit && parseInt(p.bg.slice(1, 3), 16) > 200;
  if (!fit && !o.pos && p.h > p.w * 1.1) o.pos = '50% 10%';
  const st = `--c:${p.c};--q:url(${p.q})${p.bg ? `;--bg:${p.bg}` : ''}`;
  const sizes = o.sizes || '(max-width: 600px) 50vw, 300px';
  return `<div class="ph ${fit ? 'fit' : ''}${lite ? ' lite' : ''} ${o.cls || ''}" style="${st}"><img src="${p.t}" srcset="${p.t} 400w, ${p.s} 900w" sizes="${sizes}" alt="${esc(o.alt || '')}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false" ${o.pos ? `style="object-position:${o.pos}"` : ''} onload="this.parentNode.classList.add('ok')" onerror="this.parentNode.classList.add('ok')"></div>`;
}
const stars = r => r ? `<span class="stars">${ico('star')}${String(r.toFixed(1)).replace('.', ',')}</span>` : '<span class="tag">Nouveau</span>';
const priceHtml = it => it.mode === 'rent'
  ? `${eur0(it.day)} <small>/ jour</small>`
  : `${eur0(it.price)}<s>${eur0(it.ref)} neuf</s>`;
function card(it, o = {}) {
  const u = user(it.o), fav = S.favs.includes(it.id), cmp = S.compare.includes(it.id);
  const disc = it.mode === 'buy' ? Math.round((1 - it.price / it.ref) * 100) : 0;
  const ov = [];
  if (disc >= 25) ov.push(`<span class="tag amber">−${disc} %</span>`);
  if (it.checked) ov.push(`<span class="tag">${ico('shield')}Contrôlé</span>`);
  return `<a class="card" href="#/p/${it.id}" data-id="${it.id}" style="--i:${o.i || 0}">
    <div style="position:relative">${pic(photosOf(it)[0], { cls: 'r43', alt: fullName(it), sizes: o.sizes })}
      <div class="ov">${ov.join('')}</div>
      <button class="heart" type="button" data-fav="${it.id}" aria-pressed="${fav}" aria-label="Ajouter ${esc(fullName(it))} aux favoris">${ico('heart')}</button>
      ${o.cmp ? `<button class="cmp-toggle" type="button" data-cmp="${it.id}" aria-pressed="${cmp}">${ico('compare', 's')}<span>Comparer</span></button>` : ''}
    </div>
    <div class="meta">
      <span class="brand">${esc(it.brand)}</span>
      <div class="t1"><h3>${esc(it.model)}</h3></div>
      <span class="where">${esc(u.city)}, ${km(u.km)} · ${u.rating ? '★ ' + String(u.rating.toFixed(1)).replace('.', ',') : 'Nouveau'}</span>
      <span class="price num">${priceHtml(it)}</span>
    </div></a>`;
}
function skCards(n) { return Array.from({ length: n }, () => '<div class="sk-card"><div class="sk img"></div><div class="sk l"></div><div class="sk l2"></div></div>').join(''); }
function rail(inner, o = {}) {
  return `<div class="rail-wrap"><div class="rail ${o.cls || ''}" data-rail ${o.cw ? `style="--cw:${o.cw}"` : ''}>${inner}</div></div>`;
}
function railNav() { return `<div class="rail-nav web-only"><button type="button" data-rail-go="-1" aria-label="Précédent">${ico('back', 's')}</button><button type="button" data-rail-go="1" aria-label="Suivant">${ico('next', 's')}</button></div>`; }
function secHead(title, sub, more, nav) {
  return `<div class="sec-h"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div style="display:flex;gap:14px;align-items:center">${more ? `<a class="more link" href="${more[1]}">${more[0]}</a>` : ''}${nav ? railNav() : ''}</div></div>`;
}

/* Nombre animé */
function countTo(el, to, fmt = eur) {
  if (!el) return;
  const from = parseFloat(el.dataset.cv || el.textContent.replace(/[^0-9,]/g, '').replace(',', '.') || '0'); el.dataset.cv = to;
  if (RM.matches || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 520;
  const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* Toast */
let toastT;
function toast(msg, icon = 'check') {
  const t = $('#toast'); t.innerHTML = ico(icon) + '<span>' + esc(msg) + '</span>';
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}

/* Favoris (avec éclat) */
function toggleFav(id, btn) {
  const i = S.favs.indexOf(id), on = i < 0;
  if (on) S.favs.push(id); else S.favs.splice(i, 1);
  save(); syncCounts();
  $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', on));
  if (btn && on && !RM.matches) {
    const svg = btn.querySelector('.ico'); svg.classList.remove('pop'); void svg.offsetWidth; svg.classList.add('pop');
    const b = document.createElement('span'); b.className = 'burst';
    b.innerHTML = Array.from({ length: 8 }, (_, k) => `<i style="--a:${k * 45}deg"></i>`).join('');
    btn.appendChild(b); setTimeout(() => b.remove(), 650);
  }
  if (navigator.vibrate && isApp() && on) navigator.vibrate(8);
  toast(on ? 'Ajouté aux favoris' : 'Retiré des favoris', on ? 'heart' : 'check');
  track(on ? 'add_to_wishlist' : 'remove_from_wishlist', { item_id: id });
}
function toggleCmp(id) {
  const i = S.compare.indexOf(id);
  if (i >= 0) S.compare.splice(i, 1);
  else { if (S.compare.length >= 3) { toast('Trois annonces au maximum : retirez-en une.', 'info'); return; } S.compare.push(id); }
  save();
  $$(`[data-cmp="${id}"]`).forEach(b => b.setAttribute('aria-pressed', S.compare.includes(id)));
  renderTray();
}
function renderTray() {
  const t = $('#tray'), n = S.compare.length;
  const scr = Nav.top && Nav.top();
  const ok = ['explore', 'favs', 'kit', 'home', 'conseilRes'].concat(isApp() ? [] : ['product']);
  const hide = !n || !scr || !ok.includes(scr.scr.route);
  t.classList.toggle('on', !hide);
  if (!n) return;
  t.innerHTML = `<div class="thumbs">${S.compare.map(id => pic(photosOf(byId(id))[0], { sizes: '60px' })).join('')}</div><b>${plural(n, 'annonce')} à comparer</b><button class="btn btn-amber" type="button" data-go="#/comparer"${n < 2 ? ' disabled' : ''}>Comparer</button><button class="iconbtn" type="button" data-act="cmp-clear" aria-label="Vider la comparaison" style="color:#fff">${ico('close', 's')}</button>`;
}
function syncCounts() {
  const c = $('#favcnt'); if (c) { c.hidden = !S.favs.length; c.textContent = S.favs.length; }
}
