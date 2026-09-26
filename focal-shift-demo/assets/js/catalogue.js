// Catalogue : filtres appliqués au changement, favoris sans rechargement, filtres repliés sur mobile.
(function () {
  document.querySelectorAll('[data-auto-submit]').forEach(function (form) {
    var minuteur;
    form.addEventListener('change', function (e) {
      if (e.target.type === 'text') return;
      clearTimeout(minuteur);
      minuteur = setTimeout(function () { form.submit(); }, e.target.type === 'range' ? 500 : 150);
    });
  });
  document.querySelectorAll('input[type=range][data-sortie]').forEach(function (r) {
    var o = document.getElementById(r.dataset.sortie);
    r.addEventListener('input', function () { o.textContent = r.value > 0 ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(r.value) : 'Sans limite'; });
  });
  var boite = document.querySelector('[data-filtres-mobile]');
  if (boite && window.matchMedia('(max-width: 900px)').matches) boite.removeAttribute('open');

  document.querySelectorAll('form[data-favori]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = f.querySelector('button');
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          b.setAttribute('aria-pressed', String(r.favori));
          b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
          b.setAttribute('aria-label', (r.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'));
          if (window.fsTrack && r.favori) window.fsTrack('favori_ajoute', {});
        })
        .catch(function () { f.submit(); });
    });
  });
})();
