// Formulaires en étapes (estimation, conseil) : progression, retour arrière, validation par étape.
// Sans JavaScript, toutes les étapes restent visibles et le formulaire fonctionne normalement.
(function () {
  document.querySelectorAll('form[data-etapes]').forEach(function (form) {
    var etapes = Array.prototype.slice.call(form.querySelectorAll('[data-etape]'));
    if (etapes.length < 2) return;
    var i = 0, prec = form.querySelector('[data-precedent]'), suiv = form.querySelector('[data-suivant]'), valider = form.querySelector('[data-valider]');
    var barre = document.querySelector('[data-progression]'), texte = document.querySelector('[data-progression-texte]');
    // Revenir sur la première étape contenant une erreur
    var enErreur = etapes.findIndex(function (e) { return e.querySelector('[aria-invalid], .erreur'); });
    if (enErreur > 0) i = enErreur;

    function afficher() {
      etapes.forEach(function (e, n) { e.hidden = n !== i; e.classList.toggle('etape-active', n === i); });
      prec.hidden = i === 0; suiv.hidden = i === etapes.length - 1; valider.hidden = i !== etapes.length - 1;
      if (barre) barre.style.width = ((i + 1) / etapes.length * 100) + '%';
      if (texte) texte.textContent = 'Étape ' + (i + 1) + ' sur ' + etapes.length + ' : ' + etapes[i].querySelector('legend').textContent.trim();
    }
    function valide() {
      var champs = etapes[i].querySelectorAll('input, select, textarea'), ok = true;
      champs.forEach(function (c) { if (!c.checkValidity()) { ok = false; c.setAttribute('aria-invalid', 'true'); } else c.removeAttribute('aria-invalid'); });
      if (!ok) { var premier = etapes[i].querySelector('[aria-invalid]'); if (premier) premier.focus(); }
      return ok;
    }
    suiv.addEventListener('click', function () { if (!valide()) return; i++; afficher(); etapes[i].querySelector('input, select').focus(); });
    prec.addEventListener('click', function () { i--; afficher(); });
    afficher();
  });

  // Estimation : l'année minimale suit l'année de sortie du modèle choisi
  var p = document.getElementById('f-produit'), a = document.getElementById('f-annee');
  if (p && a) p.addEventListener('change', function () { var o = p.selectedOptions[0]; if (o && o.dataset.annee) { a.min = o.dataset.annee; if (+a.value < +o.dataset.annee) a.value = o.dataset.annee; } });
})();
