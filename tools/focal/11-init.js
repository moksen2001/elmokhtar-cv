/* =====================================================================
   Démarrage et événements globaux
   ===================================================================== */
document.addEventListener('click', ev => {
  const t = ev.target;
  const fav = t.closest('[data-fav]'); if (fav) { ev.preventDefault(); ev.stopPropagation(); toggleFav(+fav.dataset.fav, fav); return; }
  const cmp = t.closest('[data-cmp]'); if (cmp) { ev.preventDefault(); ev.stopPropagation(); toggleCmp(+cmp.dataset.cmp); const top = Nav.top(); if (top && top.scr.route === 'compare') Nav.refresh(); return; }
  const md = t.closest('[data-mode]'); if (md) { setMode(md.dataset.mode); return; }
  const go = t.closest('[data-go]'); if (go) { Nav.go(go.dataset.go.replace(/^#/, '')); return; }
  const rg = t.closest('[data-rail-go]');
  if (rg) { const sec = rg.closest('.sec, section'); const r = sec && $('[data-rail]', sec); if (r) r.scrollBy({ left: +rg.dataset.railGo * r.clientWidth * .8, behavior: RM.matches ? 'auto' : 'smooth' }); return; }
  const cs = t.closest('[data-consent]'); if (cs) { setConsent(cs.dataset.consent); return; }
  const tab = t.closest('#tabbar a[data-tab]'); if (tab) { ev.preventDefault(); if (navigator.vibrate) navigator.vibrate(4); Nav.tabTap(tab.dataset.tab); return; }
  const act = t.closest('[data-act]');
  if (act) {
    const k = act.dataset.act;
    if (k === 'back') { ev.preventDefault(); Nav.back(); return; }
    if (k === 'note-x') { S.note = false; save(); $('#pnote').hidden = true; return; }
    if (k === 'cmp-clear') { S.compare = []; save(); $$('[data-cmp]').forEach(b => b.setAttribute('aria-pressed', false)); renderTray(); const top = Nav.top(); if (top && top.scr.route === 'compare') Nav.refresh(); return; }
    if (k === 'install-x') { S.install = false; save(); const h = $('[data-install]'); if (h) h.remove(); return; }
    if (k === 'install') { if (window.__bip) { window.__bip.prompt(); window.__bip = null; } S.install = false; save(); const h = $('[data-install]'); if (h) h.remove(); return; }
    if (k === 'install-how') { openSheet({ title: 'Installer l’application', html: `<p>Focal-Shift s’installe comme une application, sans passer par un store.</p><ul class="checks" style="grid-template-columns:1fr"><li>${ico('share')}<span><b>iPhone :</b> dans Safari, touchez Partager puis « Sur l’écran d’accueil ».</span></li><li>${ico('phone')}<span><b>Android :</b> dans Chrome, ouvrez le menu puis « Installer l’application ».</span></li></ul>` }); return; }
    if (k === 'reset') { try { localStorage.removeItem(KEY); } catch (e) {} location.hash = '#/'; location.reload(); return; }
    if (k === 'home-dates') {
      const it = { id: 0 }; let [a, b] = S.dates ? S.dates.map(fromIso) : [addDays(today, 3), addDays(today, 5)];
      openDates(it, a, b, (x, y) => { S.dates = [iso(x), iso(y)]; save(); const h = $('[data-hdates]'); if (h) h.textContent = period(x, y); });
      return;
    }
  }
  // Transition partagée carte → fiche (ordinateur)
  const c = t.closest('a.card[data-id]');
  if (c && Nav.mode === 'web' && document.startViewTransition && !RM.matches && !ev.metaKey && !ev.ctrlKey) {
    const im = $('.ph', c); if (im) { im.style.viewTransitionName = 'pimg'; Nav.vt = true; Nav.vtId = +c.dataset.id; }
  }
});
$('#tsearch').addEventListener('submit', ev => { ev.preventDefault(); const q = ev.target.q.value.trim(); Nav.go('/explorer' + (q ? '?q=' + encodeURIComponent(q) : ''), { push: true }); ev.target.q.blur(); });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { if (lbEl) closeLightbox(); else if (sheets.length) sheets[sheets.length - 1].close(); } });
window.addEventListener('hashchange', () => Nav.handle());
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); window.__bip = ev; });
document.addEventListener('gesturestart', ev => ev.preventDefault());

let lastApp = isApp();
addEventListener('resize', () => {
  clearTimeout(window.__rz); window.__rz = setTimeout(() => {
    const app = matchMedia('(max-width: 600px)').matches;
    if (app !== lastApp) { lastApp = app; document.documentElement.classList.toggle('app', app); closeSheets(); Nav.init(); }
  }, 150);
});

(function boot() {
  $('#pnote').hidden = !S.note;
  $$('#tmode').forEach(x => { x.dataset.v = S.mode; $$('button', x).forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode)); });
  Nav.init(); railDrag(); edgeSwipe(); syncCounts();
  setTimeout(consentBanner, 1400);
  // Les offres continuent d’arriver même quand on est ailleurs dans l’application
  setInterval(() => { if (S.extraDem.length) syncBadges(); }, 1500);
})();
