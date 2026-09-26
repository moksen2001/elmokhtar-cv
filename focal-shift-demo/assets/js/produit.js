// Fiche produit : onglets Acheter / Louer et devis de location instantané (recalculé ensuite par le serveur).
(function () {
  var onglets = document.querySelectorAll('.al-onglets [role=tab]');
  onglets.forEach(function (t) {
    t.addEventListener('click', function () {
      onglets.forEach(function (o) {
        var actif = o === t;
        o.setAttribute('aria-selected', String(actif));
        document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
      });
    });
  });

  var f = document.getElementById('form-devis');
  if (!f) return;
  var fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  var d = f.dataset, prises = JSON.parse(d.prises || '[]');
  var debut = document.getElementById('debut'), fin = document.getElementById('fin');
  var $ = function (id) { return document.getElementById(id); };

  function maj() {
    if (debut.value) { fin.min = debut.value; if (!fin.value || fin.value < debut.value) fin.value = debut.value; }
    if (!debut.value || !fin.value) return;
    var conflit = prises.some(function (p) { return p.date_debut <= fin.value && p.date_fin >= debut.value; });
    $('alerte-dates').hidden = !conflit;
    $('alerte-dates').textContent = conflit ? 'Ces dates chevauchent une réservation existante. Choisissez d’autres dates.' : '';
    var jours = Math.round((new Date(fin.value) - new Date(debut.value)) / 86400000) + 1;
    var brut = d.prixJour * jours, taux = jours >= 7 ? 0.2 : (jours >= 3 ? 0.1 : 0), remise = brut * taux, loc = brut - remise;
    var frais = loc * d.frais, assurance = Math.max(5, d.valeur * d.assurance * jours);
    var caution = Math.min(d.cautionMax, Math.max(d.cautionMin, d.valeur * 0.1));
    $('devis').hidden = false;
    $('d-lib').textContent = 'Location, ' + jours + ' jour' + (jours > 1 ? 's' : '');
    $('d-brut').textContent = fmt.format(brut);
    $('d-ligne-remise').hidden = !remise;
    $('d-remise').textContent = '− ' + fmt.format(remise);
    $('d-frais').textContent = fmt.format(frais);
    $('d-assurance').textContent = fmt.format(assurance);
    $('d-total').textContent = fmt.format(loc + frais + assurance);
    $('d-caution').textContent = fmt.format(caution);
  }
  debut.addEventListener('change', maj); fin.addEventListener('change', maj);
})();

// Dates reprises depuis la page Location : le devis s'affiche immédiatement
(function () {
  var d = document.getElementById('debut'), f = document.getElementById('fin');
  if (d && f && d.value && f.value) d.dispatchEvent(new Event('change'));
})();
