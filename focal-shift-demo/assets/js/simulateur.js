// Simulateur de cote : calcul instantané côté navigateur, mêmes hypothèses que le serveur (injectées en JSON).
(function () {
  var C = window.FS_COTE;
  var f = document.getElementById('sim-form');
  var $ = function (id) { return document.getElementById(id); };
  var fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  var anneeCourante = new Date().getFullYear();
  var dejaSuivi = false;

  function calcul(cat, prix, age, etat, jm) {
    var h = C.hyp[cat], d1 = h[0], dn = h[1], tj = h[2];
    var valeur = age <= 0 ? prix : prix * (1 - d1) * Math.pow(1 - dn, Math.max(0, age - 1));
    valeur = Math.max(valeur * C.etat[etat], prix * 0.15);
    var prixJour = Math.round(prix * tj);
    var revenu = prixJour * jm * 12 * (1 - C.commission);
    var usure = Math.min(0.10, jm * 12 * 0.0015);
    var valeur12 = Math.max(valeur * (1 - dn) * (1 - usure), prix * 0.12);
    return { valeur: valeur, prixJour: prixJour, revenu: revenu, valeur12: valeur12, total: revenu + valeur12 };
  }

  function lireForm() {
    return {
      cat: f.categorie.value,
      prix: Math.max(0, parseFloat(f.prix.value) || 0),
      age: Math.max(0, anneeCourante - parseInt(f.annee.value, 10)),
      etat: f.querySelector('[name=etat]:checked').value,
      jm: parseInt(f.jours.value, 10)
    };
  }

  function maj() {
    var v = lireForm();
    $('s-jours-val').textContent = v.jm;
    if (v.prix < 50) { $('sim-verdict').textContent = 'Indiquez un prix d’achat d’au moins 50 €.'; return; }
    var r = calcul(v.cat, v.prix, v.age, v.etat, v.jm);

    // Seuil : nombre de jours par mois à partir duquel louer puis revendre dépasse la vente immédiate (+10 %)
    var seuil = null;
    for (var j = 0; j <= 20; j++) { if (calcul(v.cat, v.prix, v.age, v.etat, j).total > r.valeur * 1.10) { seuil = j; break; } }

    var louer = r.total > r.valeur * 1.10;
    var ecart = Math.abs(r.total - r.valeur);
    $('sim-verdict').textContent = louer
      ? 'Louer rapporte environ ' + fmt.format(ecart) + ' de plus sur un an que vendre aujourd’hui.'
      : (r.total > r.valeur ? 'Vendre et louer se valent à ce rythme : l’écart ne couvre pas le risque et le temps passé.' : 'À ce rythme de location, vendre maintenant est plus intéressant.');
    $('sim-verdict').className = 'sim-verdict ' + (louer ? 'verdict-louer' : 'verdict-vendre');

    var max = Math.max(r.valeur, r.total);
    $('barre-vente').style.width = (r.valeur / max * 100) + '%';
    $('barre-loc').style.width = (r.revenu / max * 100) + '%';
    $('barre-rev12').style.width = (r.valeur12 / max * 100) + '%';
    $('m-vente').textContent = fmt.format(r.valeur);
    $('m-loc').textContent = fmt.format(r.total) + ' (' + fmt.format(r.revenu) + ' de location + ' + fmt.format(r.valeur12) + ' de revente)';
    $('balance').setAttribute('aria-label', 'Vendre maintenant : ' + fmt.format(r.valeur) + '. Louer 12 mois puis revendre : ' + fmt.format(r.total) + '.');

    $('d-prixjour').textContent = fmt.format(r.prixJour) + ' par jour';
    $('d-revenu').textContent = fmt.format(r.revenu);
    $('d-valeur12').textContent = fmt.format(r.valeur12);
    $('d-seuil').textContent = seuil === null ? 'jamais, avec ces hypothèses' : seuil + ' jour' + (seuil > 1 ? 's' : '') + ' par mois';
    $('sim-enregistre').textContent = '';

    if (!dejaSuivi && window.fsTrack) { dejaSuivi = true; window.fsTrack('simulation_lancee', { categorie: v.cat }); }
  }

  // Préremplissage depuis une estimation (paramètres d'URL)
  var q = new URLSearchParams(location.search);
  if (q.get('categorie')) f.categorie.value = q.get('categorie');
  if (q.get('prix')) f.prix.value = q.get('prix');
  if (q.get('annee')) f.annee.value = q.get('annee');
  if (q.get('etat')) { var r = f.querySelector('[name=etat][value="' + q.get('etat') + '"]'); if (r) r.checked = true; }
  if (q.get('modele')) document.getElementById('s-modele').value = q.get('modele');

  f.addEventListener('input', maj);
  f.addEventListener('change', maj);
  f.addEventListener('submit', function (e) { e.preventDefault(); });

  $('sim-enregistrer').addEventListener('click', function () {
    var v = lireForm();
    var data = new FormData();
    data.append('csrf', C.csrf); data.append('categorie', v.cat); data.append('prix', v.prix);
    data.append('age', v.age); data.append('etat', v.etat); data.append('jours', v.jm);
    fetch('simulateur.php?action=enregistrer', { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        $('sim-enregistre').textContent = r.ok ? 'Estimation enregistrée anonymement. Merci, elle aide à affiner les hypothèses.' : 'L’estimation n’a pas été enregistrée : rechargez la page puis réessayez.';
        if (r.ok && window.fsTrack) window.fsTrack('simulation_enregistree', { categorie: v.cat, recommandation: r.recommandation });
      })
      .catch(function () { $('sim-enregistre').textContent = 'Connexion interrompue : l’estimation n’a pas été enregistrée.'; });
  });

  maj();
})();
