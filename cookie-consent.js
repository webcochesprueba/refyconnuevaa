/* =============================================
   REFYCON PRO - Aviso de cookies (consentimiento)
   - Google Analytics (GA4/GTM) arranca en "denied" gracias al
     fragmento de consentimiento que va al principio del <head>.
   - Este archivo muestra el aviso, guarda la elección y actualiza
     el consentimiento de Google.
   - window.refyconCookieSettings() vuelve a abrir el aviso.
   ============================================= */
(function () {
  var KEY = 'refycon_consent';
  var TEXTS = {
    es: { msg: 'Usamos cookies de analítica (Google Analytics) para saber cómo se usa la web y mejorarla. Solo se activan si las aceptas.', ok: 'Aceptar', no: 'Rechazar', more: 'Política de Cookies' },
    en: { msg: 'We use analytics cookies (Google Analytics) to understand how the website is used and improve it. They are only enabled if you accept them.', ok: 'Accept', no: 'Reject', more: 'Cookie Policy' },
    fr: { msg: 'Nous utilisons des cookies d’analyse (Google Analytics) pour comprendre l’utilisation du site et l’améliorer. Ils ne sont activés que si vous les acceptez.', ok: 'Accepter', no: 'Refuser', more: 'Politique de cookies' },
    de: { msg: 'Wir verwenden Analyse-Cookies (Google Analytics), um die Nutzung der Website zu verstehen und sie zu verbessern. Sie werden nur aktiviert, wenn Sie zustimmen.', ok: 'Akzeptieren', no: 'Ablehnen', more: 'Cookie-Richtlinie' },
    it: { msg: 'Utilizziamo cookie di analisi (Google Analytics) per capire come viene usato il sito e migliorarlo. Vengono attivati solo se li accetti.', ok: 'Accetta', no: 'Rifiuta', more: 'Cookie Policy' },
    nl: { msg: 'We gebruiken analytische cookies (Google Analytics) om te begrijpen hoe de website wordt gebruikt en deze te verbeteren. Ze worden alleen geactiveerd als u ze accepteert.', ok: 'Accepteren', no: 'Weigeren', more: 'Cookiebeleid' },
    ru: { msg: 'Мы используем аналитические файлы cookie (Google Analytics), чтобы понимать, как используется сайт, и улучшать его. Они включаются только с вашего согласия.', ok: 'Принять', no: 'Отклонить', more: 'Политика cookie' }
  };

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
    return TEXTS[l] ? l : 'es';
  }
  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento: se volverá a preguntar */ }
  }
  function gtagSafe() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
  function deleteAnalyticsCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || /^_gid$/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function apply(choice) {
    if (choice === 'granted') {
      gtagSafe('consent', 'update', { analytics_storage: 'granted' });
    } else {
      gtagSafe('consent', 'update', { analytics_storage: 'denied' });
      deleteAnalyticsCookies();
    }
  }

  function injectStyles() {
    if (document.getElementById('cc-styles')) return;
    var css = '' +
      '.cc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:760px;margin:0 auto;' +
      'background:#111827;color:#fff;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.35);padding:18px 20px;' +
      'display:flex;gap:16px;align-items:center;font-family:Inter,"Segoe UI",Arial,sans-serif;font-size:13px;line-height:1.55}' +
      '.cc-banner p{margin:0;flex:1;color:rgba(255,255,255,.85)}' +
      '.cc-banner a{color:#60a5fa;text-decoration:underline}' +
      '.cc-actions{display:flex;gap:10px;flex-shrink:0}' +
      '.cc-btn{border:2px solid #2563eb;border-radius:6px;padding:10px 18px;font-size:12px;font-weight:700;' +
      'text-transform:uppercase;letter-spacing:.8px;cursor:pointer;font-family:inherit;min-width:110px}' +
      '.cc-btn.cc-ok{background:#2563eb;color:#fff}' +
      '.cc-btn.cc-no{background:transparent;color:#fff;border-color:rgba(255,255,255,.6)}' +
      '.cc-btn:focus-visible{outline:2px solid #60a5fa;outline-offset:2px}' +
      '@media (max-width:768px){.cc-banner{flex-direction:column;align-items:stretch;bottom:72px;left:10px;right:10px}' +
      '.cc-actions .cc-btn{flex:1}}';
    var st = document.createElement('style');
    st.id = 'cc-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showBanner() {
    if (document.getElementById('cc-banner')) return;
    injectStyles();
    var t = TEXTS[lang()];
    var b = document.createElement('div');
    b.id = 'cc-banner';
    b.className = 'cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-live', 'polite');
    b.setAttribute('aria-label', t.more);
    b.innerHTML =
      '<p>' + t.msg + ' <a href="/cookies.html">' + t.more + '</a></p>' +
      '<div class="cc-actions">' +
      '<button type="button" class="cc-btn cc-no">' + t.no + '</button>' +
      '<button type="button" class="cc-btn cc-ok">' + t.ok + '</button>' +
      '</div>';
    b.querySelector('.cc-ok').addEventListener('click', function () { choose('granted'); });
    b.querySelector('.cc-no').addEventListener('click', function () { choose('denied'); });
    document.body.appendChild(b);
  }

  function choose(v) {
    setChoice(v);
    apply(v);
    var b = document.getElementById('cc-banner');
    if (b) b.parentNode.removeChild(b);
  }

  window.refyconCookieSettings = showBanner;

  function init() {
    var c = getChoice();
    if (c === 'granted' || c === 'denied') {
      apply(c);
    } else {
      showBanner();
    }
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
