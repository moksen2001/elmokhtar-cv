/**
 * Gestion du consentement (RGPD / CNIL) et envoi des événements analytiques.
 * - Par défaut : tout est refusé (voir gtag('consent','default') dans header.php).
 * - "Tout refuser" est aussi simple que "Tout accepter".
 * - Le choix est stocké 6 mois dans un cookie first-party "fs_consent".
 * - GTM n'est chargé qu'après accord ; les événements en file d'attente ne partent qu'avec l'accord.
 */
(function () {
  var COOKIE = 'fs_consent';
  var banner = document.getElementById('consent');
  var details = banner.querySelector('.consent-details');

  function lire() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    try { return m ? JSON.parse(decodeURIComponent(m[1])) : null; } catch (e) { return null; }
  }

  function ecrire(analytics) {
    var valeur = encodeURIComponent(JSON.stringify({ analytics: analytics, date: new Date().toISOString().slice(0, 10) }));
    document.cookie = COOKIE + '=' + valeur + '; max-age=' + 60 * 60 * 24 * 182 + '; path=/; SameSite=Lax';
  }

  function chargerGTM() {
    if (!window.FS_GTM_ID || window.__gtmCharge) return;
    window.__gtmCharge = true;
    dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(window.FS_GTM_ID);
    document.head.appendChild(s);
  }

  function appliquer(choix) {
    var accord = !!(choix && choix.analytics);
    gtag('consent', 'update', { analytics_storage: accord ? 'granted' : 'denied' });
    if (accord) {
      chargerGTM();
      (window.FS_QUEUE || []).forEach(function (ev) { dataLayer.push(ev); });
      window.FS_QUEUE = [];
    }
    window.FS_ACCORD = accord;
  }

  /** Fonction publique utilisée par app.js pour les événements côté navigateur. */
  window.fsTrack = function (event, params) {
    if (window.FS_ACCORD) dataLayer.push(Object.assign({ event: event }, params || {}));
  };

  function ouvrir() {
    banner.hidden = false;
    var cb = details.querySelector('[name=analytics]');
    var c = lire();
    cb.checked = !!(c && c.analytics);
    banner.querySelector('button').focus();
  }

  function fermer(analytics) {
    ecrire(analytics);
    appliquer({ analytics: analytics });
    banner.hidden = true;
    details.hidden = true;
  }

  banner.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.consent === 'accept') fermer(true);
    else if (t.dataset.consent === 'refuse') fermer(false);
    else if (t.dataset.consent === 'save') fermer(details.querySelector('[name=analytics]').checked);
    else if ('consentDetails' in t.dataset) { details.hidden = !details.hidden; }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !banner.hidden) fermer(false); });
  document.querySelectorAll('[data-open-consent]').forEach(function (b) { b.addEventListener('click', ouvrir); });

  var existant = lire();
  if (existant) appliquer(existant); else banner.hidden = false;
})();
