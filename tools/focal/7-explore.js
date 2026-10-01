/* =====================================================================
   Explorer : recherche, filtres, résultats ; comparateur
   ===================================================================== */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SYN = { cravate: 'son wireless ew-dp', micro: 'son', lumiere: 'lumiere amaran godox pavotube', 'lumiere douce': 'amaran softbox godox', camera: 'boitier', appareil: 'boitier', hybride: 'boitier', gimbal: 'rs 4 stabilisation', stabilisateur: 'rs 4 stabilisation', trepied: 'sachtler manfrotto', 'plein format': 'fx3 a7 r6', macro: 'macro 90', portrait: '85 50 portrait', video: 'fx3 a7s zv-e10' };
function searchText(it) { return norm([it.brand, it.model, CAT1[it.cat], it.spec, user(it.o).name, user(it.o).city, it.mount].join(' ')); }
function filterItems(f) {
  const q = norm(f.q || '').trim();
  const words = q ? (SYN[q] ? SYN[q].split(' ').concat(q.split(' ')) : q.split(/\s+/)) : [];
  let r = ITEMS.filter(it => it.mode === S.mode);
  if (f.cat) r = r.filter(it => it.cat === f.cat);
  if (f.city) r = r.filter(it => user(it.o).city === f.city);
  if (f.o) r = r.filter(it => it.o === +f.o);
  if (f.max) r = r.filter(it => (S.mode === 'rent' ? it.day : it.price) <= +f.max);
  if (f.checked === '1') r = r.filter(it => it.checked);
  if (f.state) r = r.filter(it => (f.state === 'tb' ? ['neuf', 'excellent'].includes(it.state) : true));
  if (words.length) {
    const scored = r.map(it => { const t = searchText(it); const sc = words.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0); return [it, sc]; }).filter(x => x[1] > 0);
    scored.sort((a, b) => b[1] - a[1]); r = scored.map(x => x[0]);
  }
  const p = it => (S.mode === 'rent' ? it.day : it.price);
  if (f.sort === 'prix') r = r.slice().sort((a, b) => p(a) - p(b));
  if (f.sort === 'prixd') r = r.slice().sort((a, b) => p(b) - p(a));
  if (f.sort === 'km') r = r.slice().sort((a, b) => user(a.o).km - user(b.o).km);
  if (f.sort === 'note') r = r.slice().sort((a, b) => (user(b.o).rating || 0) - (user(a.o).rating || 0));
  if (!f.sort && !words.length) r = r.slice().sort((a, b) => (b.checked - a.checked) || (user(b.o).rating || 0) - (user(a.o).rating || 0));
  return r;
}
const maxPrice = () => Math.max(...ITEMS.filter(i => i.mode === S.mode).map(i => S.mode === 'rent' ? i.day : i.price));
function filterForm(f) {
  const n = c => ITEMS.filter(i => i.mode === S.mode && (!c || i.cat === c)).length;
  const mp = maxPrice(), cur = f.max ? +f.max : mp;
  return `
    <div><h4>Catégorie</h4><div class="flist">${[['', 'Tout le matériel'], ...Object.entries(CATS)].map(([k, v]) => `<button type="button" data-f="cat" data-v="${k}" aria-pressed="${(f.cat || '') === k}">${v}<small>${n(k)}</small></button>`).join('')}</div></div>
    <div><h4>${S.mode === 'rent' ? 'Prix par jour' : 'Prix'} maximum</h4><div class="outv num" style="font-size:1.15rem" data-maxv>${cur >= mp ? 'Sans limite' : eur0(cur)}</div><input class="range" type="range" min="${S.mode === 'rent' ? 10 : 100}" max="${mp}" step="${S.mode === 'rent' ? 5 : 50}" value="${cur}" data-f="max" aria-label="Prix maximum"></div>
    <div><h4>Ville du propriétaire</h4><div class="flist">${[['', 'Toutes'], ...CITIES.map(c => [c, c])].map(([k, v]) => `<button type="button" data-f="city" data-v="${k}" aria-pressed="${(f.city || '') === k}">${v}</button>`).join('')}</div></div>
    <div><h4>Garanties</h4><label class="check"><input type="checkbox" data-f="checked" ${f.checked === '1' ? 'checked' : ''}> Contrôlé par Focal-Shift</label><label class="check" style="margin-top:8px"><input type="checkbox" data-f="state" ${f.state === 'tb' ? 'checked' : ''}> Très bon état ou mieux</label></div>`;
}
SCREENS.explore = (p, q) => {
  const f = Object.assign({}, q); delete f.focus;
  const app = isApp();
  const chips = `<div class="mchips">${[['', 'Tout'], ...Object.entries(CATS)].map(([k, v]) => `<button class="chip" type="button" data-f="cat" data-v="${k}" aria-pressed="${(f.cat || '') === k}">${k ? ico(k) : ''}${v}</button>`).join('')}</div>`;
  const html = app
    ? `<div style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center">${`<div class="qbox" style="grid-template-columns:1fr;padding:2px"><label style="padding:0 8px">${ico('search')}<input type="search" data-q value="${esc(f.q || '')}" placeholder="FX3, micro, lumière…" aria-label="Rechercher" autocomplete="off"></label></div>`}<button class="btn btn-line" type="button" data-act="filters" style="padding:0 12px">${ico('filter')}<span data-fcount>Filtres</span></button></div>
       <div style="margin:14px 0">${modeToggle()}</div>${chips}<div class="resbar" style="margin-top:16px"><span class="count" data-count></span></div><div class="grid" data-res></div>`
    : `<div class="crumbs"><a href="#/">Accueil</a><span>/</span><span>Explorer</span></div>
       <div style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap;margin-bottom:26px"><div><h1>${S.mode === 'rent' ? 'Matériel à louer' : 'Matériel d’occasion'}</h1><p class="muted" style="margin:8px 0 0">${S.mode === 'rent' ? 'Chez des propriétaires vérifiés, assurance comprise.' : 'Contrôlé, garanti, prix total affiché avant de payer.'}</p></div>${modeToggle()}</div>
       <div class="cat-layout"><aside class="filters" data-filters aria-label="Filtres">${filterForm(f)}</aside>
       <div><div class="resbar"><span class="count" data-count></span><div class="qbox" style="grid-template-columns:1fr;padding:2px;max-width:280px"><label style="padding:0 8px">${ico('search')}<input type="search" data-q value="${esc(f.q || '')}" placeholder="Affiner la recherche" aria-label="Rechercher" autocomplete="off" style="height:36px"></label></div>
       <select class="select" data-f="sort" aria-label="Trier"><option value="">Pertinence</option><option value="prix">Prix croissant</option><option value="prixd">Prix décroissant</option><option value="km">Les plus proches</option><option value="note">Mieux notés</option></select></div>
       <div class="grid" data-res></div></div></div>`;
  let first = true, tmr;
  return {
    title: 'Explorer', root: true, sub: 'Louez ou achetez entre créateurs.',
    html,
    mount(el, e) {
      const res = $('[data-res]', el), cnt = $('[data-count]', el);
      const sel = $('select[data-f="sort"]', el); if (sel) sel.value = f.sort || '';
      const draw = () => {
        const r = filterItems(f);
        const n = r.length;
        cnt.textContent = `${n} annonce${n > 1 ? 's' : ''}${f.q ? ` pour « ${f.q} »` : ''}`;
        const nf = ['cat', 'city', 'max', 'checked', 'state', 'sort'].filter(k => f[k]).length;
        const fc = $('[data-fcount]', el); if (fc) fc.textContent = nf ? `Filtres (${nf})` : 'Filtres';
        res.innerHTML = skCards(Math.min(6, Math.max(2, n)));
        clearTimeout(tmr);
        tmr = setTimeout(() => {
          res.classList.remove('stag'); void res.offsetWidth; res.classList.add('stag');
          res.innerHTML = n ? r.map((it, i) => card(it, { i, cmp: true })).join('') : `<div class="empty" style="grid-column:1/-1">${ico('search')}<h3>Aucune annonce ne correspond</h3><p class="muted small" style="margin:6px 0 16px">Essayez sans filtre, ou décrivez votre projet : les propriétaires vous proposeront ce qu’ils ont.</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn btn-line" type="button" data-act="freset">Effacer les filtres</button><a class="btn btn-ink" href="#/demande">Publier un besoin</a></div></div>`;
          stagger(res);
        }, first ? 280 : 200);
        first = false;
        const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
        const np = '/explorer' + (qs ? '?' + qs : '');
        if (e.path !== np && curPath() === e.path) { history.replaceState(null, '', '#' + np); e.path = np; }
      };
      e.redraw = draw;
      const setF = (k, v) => { if (v === '' || v == null) delete f[k]; else f[k] = v; draw(); $$(`[data-f="${k}"][data-v]`, el).forEach(b => b.setAttribute('aria-pressed', (f[k] || '') === b.dataset.v)); };
      el.addEventListener('click', ev => {
        const b = ev.target.closest('[data-f][data-v]'); if (b && el.contains(b)) { setF(b.dataset.f, b.dataset.v); if (isApp()) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }
        if (ev.target.closest('[data-act="freset"]')) { Object.keys(f).forEach(k => delete f[k]); $$('[data-q]', el).forEach(i => { i.value = ''; }); Nav.refresh(); }
        if (ev.target.closest('[data-act="filters"]')) openFilters(f, setF);
      });
      el.addEventListener('input', ev => {
        const t = ev.target;
        if (t.matches('[data-q]')) { clearTimeout(t._t); t._t = setTimeout(() => setF('q', t.value.trim()), 220); }
        if (t.matches('input[data-f="max"]')) { const v = +t.value, mp = maxPrice(); $('[data-maxv]', el).textContent = v >= mp ? 'Sans limite' : eur0(v); clearTimeout(t._t); t._t = setTimeout(() => setF('max', v >= mp ? '' : String(v)), 150); }
      });
      el.addEventListener('change', ev => {
        const t = ev.target;
        if (t.matches('select[data-f="sort"]')) setF('sort', t.value);
        if (t.matches('input[data-f="checked"]')) setF('checked', t.checked ? '1' : '');
        if (t.matches('input[data-f="state"]')) setF('state', t.checked ? 'tb' : '');
      });
      draw();
      if (q.focus) setTimeout(() => { const i = $('[data-q]', el); i && i.focus(); }, 520);
    },
  };
};
function openFilters(f, setF) {
  const mp = maxPrice(), cur = f.max ? +f.max : mp;
  const s = openSheet({
    title: 'Filtres',
    html: `<div class="wq"><span class="label">${S.mode === 'rent' ? 'Prix par jour' : 'Prix'} maximum</span><div class="outv num" data-mv>${cur >= mp ? 'Sans limite' : eur0(cur)}</div><input class="range" type="range" min="${S.mode === 'rent' ? 10 : 100}" max="${mp}" step="${S.mode === 'rent' ? 5 : 50}" value="${cur}" data-sf="max" aria-label="Prix maximum"></div>
      <div class="wq"><span class="label">Ville du propriétaire</span><div class="chips">${[['', 'Toutes'], ...CITIES.map(c => [c, c])].map(([k, v]) => `<button class="chip" type="button" data-sf="city" data-v="${k}" aria-pressed="${(f.city || '') === k}">${v}</button>`).join('')}</div></div>
      <div class="wq"><span class="label">Trier par</span><div class="chips">${[['', 'Pertinence'], ['prix', 'Prix croissant'], ['km', 'Les plus proches'], ['note', 'Mieux notés']].map(([k, v]) => `<button class="chip" type="button" data-sf="sort" data-v="${k}" aria-pressed="${(f.sort || '') === k}">${v}</button>`).join('')}</div></div>
      <div class="wq"><span class="label">Garanties</span><label class="check"><input type="checkbox" data-sf="checked" ${f.checked === '1' ? 'checked' : ''}> Contrôlé par Focal-Shift</label><label class="check" style="margin-top:10px"><input type="checkbox" data-sf="state" ${f.state === 'tb' ? 'checked' : ''}> Très bon état ou mieux</label></div>`,
    foot: `<button class="btn btn-line" type="button" data-sr>Tout effacer</button><button class="btn btn-ink" type="button" data-sok style="flex:1">Voir les résultats</button>`,
    onMount(el, sh) {
      const tmp = Object.assign({}, f);
      el.addEventListener('click', ev => {
        const b = ev.target.closest('[data-sf][data-v]');
        if (b) { tmp[b.dataset.sf] = b.dataset.v; $$(`[data-sf="${b.dataset.sf}"][data-v]`, el).forEach(x => x.setAttribute('aria-pressed', x === b)); }
        if (ev.target.closest('[data-sr]')) { ['city', 'sort', 'max', 'checked', 'state'].forEach(k => setF(k, '')); sh.close(); }
        if (ev.target.closest('[data-sok]')) { ['city', 'sort', 'max', 'checked', 'state'].forEach(k => { if ((tmp[k] || '') !== (f[k] || '')) setF(k, tmp[k] || ''); }); sh.close(); }
      });
      el.addEventListener('input', ev => { const t = ev.target; if (t.matches('[data-sf="max"]')) { const v = +t.value; $('[data-mv]', el).textContent = v >= mp ? 'Sans limite' : eur0(v); tmp.max = v >= mp ? '' : String(v); } });
      el.addEventListener('change', ev => { const t = ev.target; if (t.matches('[data-sf="checked"]')) tmp.checked = t.checked ? '1' : ''; if (t.matches('[data-sf="state"]')) tmp.state = t.checked ? 'tb' : ''; });
    },
  });
}

/* ---------- Comparateur ---------- */
SCREENS.compare = () => {
  const list = S.compare.map(byId).filter(Boolean);
  if (list.length < 2) {
    const sugg = ITEMS.filter(i => i.mode === S.mode && i.cat === (list[0] ? list[0].cat : 'boitier') && !S.compare.includes(i.id)).slice(0, 4);
    return { title: 'Comparateur', live: true, html: `${isApp() ? '' : '<h1 style="margin-bottom:10px">Comparateur</h1>'}<p class="muted">Ajoutez deux ou trois annonces avec le bouton « Comparer » pour les voir côte à côte.</p>${list.length ? `<p class="small">Déjà sélectionnée : <b>${esc(fullName(list[0]))}</b>.</p>` : ''}<div class="grid stag" style="margin-top:20px">${sugg.map((it, i) => card(it, { i, cmp: true })).join('')}</div>` };
  }
  const rent = list.every(i => i.mode === 'rent'), buy = list.every(i => i.mode === 'buy');
  const best = (f, low = true) => { const v = list.map(f).filter(x => x != null); if (!v.length) return null; return low ? Math.min(...v) : Math.max(...v); };
  const row = (label, f, o = {}) => {
    const b = o.best ? best(o.best, o.low !== false) : null;
    return `<tr><th scope="row">${label}</th>${list.map(it => { const v = f(it); return `<td class="${b != null && o.best(it) === b && list.length > 1 ? 'best' : ''}">${v == null || v === '' ? '<span class="muted">—</span>' : v}</td>`; }).join('')}</tr>`;
  };
  const dots = v => v == null ? null : `<span class="dots5" aria-label="${v} sur 5">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= v ? 'on' : ''}"></i>`).join('')}</span>`;
  const SC = ['Autofocus', 'Basse lumière', 'Stabilisation', 'Rafale', 'Vidéo', 'Prise en main'];
  const hasScores = list.some(i => i.scores);
  const html = `${isApp() ? '' : `<div class="crumbs"><a href="#/">Accueil</a><span>/</span><a href="#/explorer">Explorer</a><span>/</span><span>Comparateur</span></div><h1 style="margin-bottom:24px">Comparer ${list.length} annonces</h1>`}
    <div class="cmpwrap"><table class="cmp"><thead><tr><th></th>${list.map(it => `<th scope="col"><div class="cmphead">${pic(photosOf(it)[0], { sizes: '240px' })}<span class="xs muted">${esc(it.brand)}</span><a href="#/p/${it.id}" style="text-decoration:none"><h3>${esc(it.model)}</h3></a><button class="btn btn-ghost xs" type="button" data-cmp="${it.id}" aria-pressed="true" style="justify-self:start;min-height:30px;padding:0 6px;color:var(--mute)">${ico('close', 's')}Retirer</button></div></th>`).join('')}</tr></thead><tbody>
      ${row('Prix', it => it.mode === 'rent' ? `${eur0(it.day)} / jour` : eur0(it.price), { best: it => it.mode === 'rent' ? it.day : it.price })}
      ${rent ? row('Caution', it => eur0(quote(it, today, today).dep), { best: it => quote(it, today, today).dep }) : ''}
      ${buy ? row('Économie sur le neuf', it => `−${Math.round((1 - it.price / it.ref) * 100)} %`, { best: it => it.price / it.ref }) : ''}
      ${buy ? row('Garantie', it => it.warranty ? `${it.warranty} mois` : '', { best: it => it.warranty, low: false }) : ''}
      ${row('Prix neuf de référence', it => eur0(it.ref))}
      ${row('État', it => STATE[it.state])}
      ${row('Contrôlé par Focal-Shift', it => it.checked ? ico('check', 's') + ' Oui' : 'Non')}
      ${row('Propriétaire', it => `${esc(user(it.o).name)}<br><span class="muted small">${user(it.o).rating ? '★ ' + String(user(it.o).rating).replace('.', ',') + ', ' : ''}${user(it.o).n} transactions</span>`, { best: it => user(it.o).rating || 0, low: false })}
      ${row('Distance', it => km(user(it.o).km), { best: it => user(it.o).km })}
      ${row('Monture', it => it.mount ? `<span class="mono">${it.mount}</span>` : '')}
      ${row('Poids', it => it.weight ? `<span class="mono">${it.weight} g</span>` : '', { best: it => it.weight })}
      ${row('Acheté en', it => `<span class="mono">${it.year}</span>`)}
      ${hasScores ? SC.map((l, k) => row(l, it => it.scores ? dots(it.scores[k]) : null, { best: it => it.scores ? it.scores[k] : null, low: false })).join('') : ''}
      <tr><th></th>${list.map(it => `<td><a class="btn btn-ink" href="#/p/${it.id}" style="min-height:38px">Voir l’annonce</a></td>`).join('')}</tr>
    </tbody></table></div>
    <p class="xs muted" style="margin-top:12px">En gras, la meilleure valeur de chaque ligne. Notes techniques indicatives du référentiel Focal-Shift.</p>`;
  return { title: 'Comparateur', live: true, html };
};
