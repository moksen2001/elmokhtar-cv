// Comportements communs : menu, animations au défilement, compteurs, notifications, dépôt d'image.
(function () {
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav-principale');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var ouvert = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!ouvert));
      nav.classList.toggle('ouvert', !ouvert);
      document.body.classList.toggle('menu-ouvert', !ouvert);
    });
  }

  /* ---------- Menu du compte ---------- */
  var avatarBtn = document.querySelector('.avatar-bouton');
  if (avatarBtn) {
    var liste = document.getElementById(avatarBtn.getAttribute('aria-controls'));
    var fermer = function () { avatarBtn.setAttribute('aria-expanded', 'false'); liste.hidden = true; };
    avatarBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var ouvert = avatarBtn.getAttribute('aria-expanded') === 'true';
      avatarBtn.setAttribute('aria-expanded', String(!ouvert));
      liste.hidden = ouvert;
      if (!ouvert) { var premier = liste.querySelector('a, button'); if (premier) premier.focus(); }
    });
    document.addEventListener('click', function (e) { if (!liste.contains(e.target)) fermer(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !liste.hidden) { fermer(); avatarBtn.focus(); } });
  }

  /* ---------- En-tête qui se détache au défilement ---------- */
  var header = document.querySelector('.site-header');
  var surScroll = function () { header.classList.toggle('defile', window.scrollY > 8); };
  window.addEventListener('scroll', surScroll, { passive: true });
  surScroll();

  /* ---------- Apparition au défilement (décalée dans les groupes) ---------- */
  var elements = document.querySelectorAll('[data-reveal]');
  document.querySelectorAll('[data-reveal-groupe]').forEach(function (g) {
    g.querySelectorAll('[data-reveal]').forEach(function (el, i) { el.style.setProperty('--delai', (i * 90) + 'ms'); });
  });
  if (reduit || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elements.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Compteurs animés ---------- */
  var nf = new Intl.NumberFormat('fr-FR');
  var animerCompteur = function (el) {
    var cible = parseFloat(el.dataset.compteur) || 0, suffixe = el.dataset.suffixe || '';
    if (reduit || cible === 0) { el.textContent = nf.format(cible) + suffixe; return; }
    var debut = null, duree = 1400;
    var pas = function (t) {
      if (!debut) debut = t;
      var p = Math.min(1, (t - debut) / duree), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = nf.format(Math.round(cible * ease)) + suffixe;
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  };
  var compteurs = document.querySelectorAll('[data-compteur]');
  if ('IntersectionObserver' in window) {
    var obsC = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) { if (en.isIntersecting) { animerCompteur(en.target); obsC.unobserve(en.target); } });
    }, { threshold: 0.5 });
    compteurs.forEach(function (el) { obsC.observe(el); });
  } else compteurs.forEach(animerCompteur);

  /* ---------- Notifications ---------- */
  document.querySelectorAll('.toast').forEach(function (t, i) {
    var retirer = function () { t.classList.add('sortie'); setTimeout(function () { t.remove(); }, 400); };
    t.querySelector('.toast-fermer').addEventListener('click', retirer);
    if (!t.classList.contains('toast-erreur')) setTimeout(retirer, 6000 + i * 800);
  });

  /* ---------- Confirmations et suivi des clics clés ---------- */
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-confirm]');
    if (c && !window.confirm(c.dataset.confirm)) e.preventDefault();
    var t = e.target.closest('[data-track]');
    if (t && window.fsTrack) window.fsTrack(t.dataset.track, { page: document.body.className.replace('page-', '') });
  });

  /* ---------- Dépôt de l'image de référence (V2) ---------- */
  document.querySelectorAll('[data-depot]').forEach(function (zone) {
    var input = zone.querySelector('input[type=file]');
    var img = zone.querySelector('.depot-apercu');
    var montrer = function () {
      var f = input.files[0];
      if (!f || !/^image\/(jpeg|png|webp)$/.test(f.type)) { img.hidden = true; zone.classList.remove('rempli'); return; }
      img.src = URL.createObjectURL(f);
      img.alt = 'Aperçu de votre image de référence';
      img.hidden = false;
      zone.classList.add('rempli');
    };
    input.addEventListener('change', montrer);
    ['dragenter', 'dragover'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('survol'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('survol'); }); });
    zone.addEventListener('drop', function (e) {
      if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; montrer(); }
    });
  });

  /* ---------- Dates : la fin n'est jamais avant le début ---------- */
  var d1 = document.getElementById('date_debut'), d2 = document.getElementById('date_fin');
  if (d1 && d2) d1.addEventListener('change', function () {
    d2.min = d1.value;
    if (!d2.value || d2.value < d1.value) d2.value = d1.value;
  });

  var resume = document.getElementById('resume-erreurs');
  if (resume) resume.focus();

  document.querySelectorAll('[data-track-form]').forEach(function (f) {
    var fait = false;
    f.addEventListener('input', function () {
      if (!fait && window.fsTrack) { fait = true; window.fsTrack('formulaire_commence', { formulaire: f.dataset.trackForm }); }
    });
  });
})();

// Accueil : bascule entre le matériel à louer et à acheter, sans recharger la page
(function () {
  var onglets = document.querySelectorAll('.dispo-onglets [role=tab]');
  if (!onglets.length) return;
  onglets.forEach(function (t) {
    t.addEventListener('click', function () {
      onglets.forEach(function (o) {
        var actif = o === t;
        o.setAttribute('aria-selected', String(actif));
        document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
      });
      if (window.fsTrack) window.fsTrack('accueil_bascule', { mode: t.id === 'ong-louer' ? 'location' : 'achat' });
    });
  });
})();
