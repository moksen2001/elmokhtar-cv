// Espace propriétaire : prix suggéré à partir du kit coché et du nombre de jours.
(function () {
  var f = document.getElementById('form-offre');
  if (!f) return;
  var jours = parseInt(f.dataset.jours, 10), budget = parseFloat(f.dataset.budget);
  var prix = document.getElementById('prix_total'), aide = document.getElementById('prix-aide');
  var fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  var modifieParUtilisateur = false;
  prix.addEventListener('input', function () { modifieParUtilisateur = true; conseil(); });

  function somme() {
    var s = 0;
    f.querySelectorAll('input[name="materiel[]"]:checked').forEach(function (c) { s += parseFloat(c.dataset.prixJour) * jours; });
    return s;
  }
  function conseil() {
    var s = somme(), p = parseFloat(prix.value) || 0;
    var txt = 'Tarif catalogue pour ' + jours + ' jour' + (jours > 1 ? 's' : '') + ' : ' + fmt.format(s) + '.';
    if (p > budget) txt += ' Au-dessus du budget annoncé (' + fmt.format(budget) + ') : votre offre risque d’être écartée.';
    aide.textContent = txt;
  }
  f.addEventListener('change', function (e) {
    if (e.target.name === 'materiel[]' && !modifieParUtilisateur) prix.value = Math.round(somme());
    conseil();
  });
  prix.value = Math.round(somme());
  conseil();
})();
