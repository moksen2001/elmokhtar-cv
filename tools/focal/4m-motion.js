/* =====================================================================
   Motion : petit moteur d'animation sans bibliothèque
   - révélations au défilement (IntersectionObserver, une seule fois,
     échelonnées par lot), branchées automatiquement sur tout ce qui entre
     dans #views (MutationObserver) ;
   - titres révélés ligne par ligne (masque) ;
   - iris d'ouverture (une fois par session) et « déclenchement » d'iris
     avant une confirmation ;
   - bandeau défilant pausable.
   Rien n'est actif si prefers-reduced-motion ou sans IntersectionObserver :
   la classe .js-motion n'est alors jamais posée et tout reste visible.
   ===================================================================== */
const Motion = (() => {
  const de = document.documentElement;
  const on = !RM.matches && 'IntersectionObserver' in window && 'MutationObserver' in window;
  if (on) de.classList.add('js-motion');
  const SEL = '.sec-h, .how, .owner, .band, .ticker, .card, .cat, .kit, .rev, .psec, .book, .box, .reco, .bk, .drow, .menu, .empty, .install';
  const OPEN_AT = 520; // ms depuis le début du chargement : l'iris est à moitié ouvert

  /* ----- Iris d'ouverture : posé par le script de <head> (logo sur lames fermées), il s'ouvre
     quand l'application a rendu son premier écran (Motion.ready). Disparaît seul à 3 s en CSS. ----- */
  let intro = de.classList.contains('fs-intro'), opened = !intro, openAt = 0;
  const queue = [];
  // f s'exécute quand la page devient visible (iris à moitié ouvert), ou tout de suite
  const whenOpen = f => { if (opened) setTimeout(f, Math.max(0, openAt + 200 - performance.now())); else queue.push(f); };
  const open = () => { if (opened) return; opened = true; openAt = performance.now(); queue.splice(0).forEach(f => setTimeout(f, 200)); };
  const hold = () => (opened ? Math.max(0, openAt + 200 - performance.now()) : 400);
  if (!opened) setTimeout(open, 3000); // même délai que le filet de sécurité CSS
  const introEnd = () => { intro = false; de.classList.remove('fs-intro', 'fs-intro-go', 'fs-intro-skip'); const el = $('div.intro'); if (el) el.remove(); };
  const introSkip = () => { if (!intro) return; intro = false; introOff(); de.classList.add('fs-intro-skip'); open(); setTimeout(introEnd, 200); };
  const introOff = () => ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(t => removeEventListener(t, introSkip, true));
  if (intro) ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(t => addEventListener(t, introSkip, { capture: true, passive: true }));
  function ready() {
    if (!intro) return;
    // le logo reste visible au moins ~0,35 s, puis l'iris s'ouvre (0,78 s)
    const wait = Math.max(0, 350 - performance.now());
    setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!intro) return;
      de.classList.add('fs-intro-go'); open();
      setTimeout(() => { introOff(); introEnd(); }, 820);
    })), wait);
  }

  /* ----- Révélations ----- */
  const io = on && new IntersectionObserver(entries => {
    const vis = entries.filter(e => e.isIntersecting)
      .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
    vis.forEach(e => io.unobserve(e.target));
    if (vis.length) whenOpen(() => vis.forEach((e, k) => show(e.target, Math.min(k, 7) * 75)));
  }, { rootMargin: '0px 0px -6% 0px' });
  function show(el, d) {
    el.style.setProperty('--rd', d + 'ms');
    el.classList.add('rv-in');
    if (el._onReveal) { const f = el._onReveal; el._onReveal = null; setTimeout(f, d); }
    setTimeout(() => { el.classList.add('settled'); el.style.removeProperty('--rd'); }, d + 1500);
  }
  function scan(root, instantAbove) {
    const list = root.matches(SEL) ? [root] : [];
    list.push(...root.querySelectorAll(SEL));
    const vh = innerHeight;
    list.forEach(el => {
      if (el.classList.contains('rv') || (el.parentElement && el.parentElement.closest('.rv'))) return;
      if (instantAbove && el.getBoundingClientRect().top < vh) return; // déjà à l'écran à l'ouverture : pas de seconde animation
      el.classList.add('rv'); io.observe(el);
    });
  }
  let booted = false;
  if (on) {
    new MutationObserver(recs => {
      // écran retiré : on libère les éléments encore observés
      for (const r of recs) for (const n of r.removedNodes) if (n.nodeType === 1 && n.classList.contains('screen')) n.querySelectorAll('.rv:not(.rv-in)').forEach(e => io.unobserve(e));
      for (const r of recs) for (const n of r.addedNodes) {
        if (n.nodeType !== 1 || n._still) continue;
        const screen = n.classList.contains('screen');
        // Téléphone : un écran poussé arrive déjà composé (comme une app native), seul le contenu sous la ligne de flottaison se révèle
        scan(n, screen && booted && isApp());
      }
      booted = true;
    }).observe($('#views'), { childList: true, subtree: true });
  }

  /* ----- Titre en masque, ligne par ligne ----- */
  function split(el, o = {}) {
    if (!on || !el || el._split) { if (o.then) o.then(); return; }
    el._split = true;
    const walk = node => Array.from(node.childNodes).forEach(c => {
      if (c.nodeType === 1) return walk(c);
      if (c.nodeType !== 3) return;
      const f = document.createDocumentFragment();
      c.textContent.split(/( +)/).forEach(p => {
        if (!p) return;
        if (/^ +$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
        const w = document.createElement('span'), i = document.createElement('span');
        w.className = 'ln-w'; i.textContent = p; w.appendChild(i); f.appendChild(w);
      });
      c.replaceWith(f);
    });
    walk(el);
    el.classList.add('split');
    const go = () => {
      const ws = $$('.ln-w', el), tops = ws.map(w => w.offsetTop); // une lecture groupée…
      let l = -1, t = -1e9;
      ws.forEach((w, k) => { if (tops[k] - t > 4) { t = tops[k]; l++; } w.style.setProperty('--l', l); }); // …puis une écriture groupée
      requestAnimationFrame(() => { el.classList.add('go'); if (o.then) o.then(); });
      setTimeout(() => el.classList.add('ln-end'), 1300 + l * 110);
    };
    if (o.now) go(); else whenOpen(() => setTimeout(go, o.delay || 0));
  }

  /* ----- Iris « déclencheur » : se ferme, on change d'écran dessous, il se rouvre ----- */
  function iris(cls) {
    const d = document.createElement('div'); d.className = 'iris ' + cls; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<div class="bl-g">' + [0, 1, 2, 3, 4, 5].map(k => `<i style="--k:${k}"></i>`).join('') + '</div>';
    document.body.appendChild(d); return d;
  }
  function shutter(cb) {
    if (!on) { cb(); return; }
    const d = iris('shut');
    setTimeout(cb, 330);
    setTimeout(() => d.remove(), 960);
  }

  /* ----- Bandeau défilant : vitesse constante, pause au survol, au focus, au toucher, hors écran ----- */
  function ticker(root) {
    const t = $('.ticker', root); if (!t) return () => {};
    const set = $('.tk-set', t), btn = $('.tk-p', t);
    let ob = null, ht;
    const size = () => { const w = set.getBoundingClientRect().width; if (w) t.style.setProperty('--tkd', Math.round(w / 34) + 's'); };
    if (on) {
      requestAnimationFrame(size);
      document.fonts && document.fonts.ready.then(size);
      ob = new IntersectionObserver(es => es.forEach(e => t.classList.toggle('tk-off', !e.isIntersecting)));
      ob.observe(t);
      t.addEventListener('touchstart', () => { clearTimeout(ht); t.classList.add('hold'); }, { passive: true });
      t.addEventListener('touchend', () => { clearTimeout(ht); ht = setTimeout(() => t.classList.remove('hold'), 1600); }, { passive: true });
    }
    btn.addEventListener('click', () => {
      const p = t.classList.toggle('paused');
      btn.setAttribute('aria-pressed', p); btn.setAttribute('aria-label', p ? 'Relancer le défilement' : 'Mettre en pause le défilement');
    });
    return () => { ob && ob.disconnect(); clearTimeout(ht); };
  }

  return {
    on, split, shutter, ticker, hold, ready,
    /* fonction appelée au moment où l'élément se révèle (rien si l'élément n'est pas animé) */
    onReveal(el, f) { if (on && el) el._onReveal = f; },
    /* lance f quand l'iris d'ouverture laisse voir la page */
    after(f) { whenOpen(f); },
    /* fondu bref d'un texte qui change (légende, verdict) */
    swap(el) { if (on && el && el.animate) el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16, 1, .3, 1)' }); },
    /* marque un écran reconstruit sur place : pas de seconde révélation */
    still(el) { el._still = true; },
    loud: false,
  };
})();
