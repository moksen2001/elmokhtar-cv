// Connexion et inscription : afficher le mot de passe, jauge de robustesse, comptes de démonstration.
(function () {
  document.querySelectorAll('.mdp-voir').forEach(function (b) {
    var input = b.parentElement.querySelector('input');
    b.addEventListener('click', function () {
      var visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      b.setAttribute('aria-pressed', String(!visible));
      b.setAttribute('aria-label', visible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
      b.classList.toggle('actif', !visible);
    });
  });

  var mdp = document.querySelector('input[autocomplete="new-password"]');
  var jauge = document.querySelector('.force span');
  if (mdp && jauge) {
    mdp.addEventListener('input', function () {
      var v = mdp.value, score = 0;
      if (v.length >= 8) score++;
      if (v.length >= 12) score++;
      if (/\d/.test(v) && /[a-zA-Z]/.test(v)) score++;
      if (/[^a-zA-Z0-9]/.test(v)) score++;
      jauge.style.width = (score * 25) + '%';
      jauge.dataset.niveau = score;
    });
  }

  document.querySelectorAll('[data-demo]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.getElementById('email').value = b.dataset.demo;
      document.getElementById('mot_de_passe').value = 'demo1234';
      document.getElementById('mot_de_passe').focus();
    });
  });
})();
