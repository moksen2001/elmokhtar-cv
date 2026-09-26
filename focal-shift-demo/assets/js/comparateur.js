// Tri des offres sur la page d'une demande (prix croissant, distance croissante, note décroissante).
(function () {
  var liste = document.getElementById('liste-offres');
  if (!liste) return;
  document.querySelectorAll('[data-tri]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cle = b.dataset.tri;
      var items = Array.prototype.slice.call(liste.children);
      items.sort(function (a, c) {
        var x = parseFloat(a.dataset[cle]), y = parseFloat(c.dataset[cle]);
        return cle === 'note' ? y - x : x - y;
      });
      items.forEach(function (i) { liste.appendChild(i); });
      document.querySelectorAll('[data-tri]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      if (window.fsTrack) window.fsTrack('offres_triees', { critere: cle });
    });
  });
})();
