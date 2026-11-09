/* =============================================
   REFYCON PRO - Aviso de cookies + eventos de conversión
   1) CONSENTIMIENTO (Consent Mode v2)
      - Todo arranca en "denied" gracias al fragmento que va al
        principio del <head> de cada página (antes de Tag Manager).
      - Dos finalidades: analítica (Google Analytics) y publicidad
        (Google Ads). El visitante puede aceptar todo, rechazar todo o
        configurar cada una.
      - Elección guardada en localStorage "refycon_consent" como JSON
        {"v":2,"a":true|false,"ad":true|false}.
      - window.refyconCookieSettings() o cualquier elemento con
        data-cookie-settings vuelve a abrir el aviso.
   2) EVENTOS PARA TAG MANAGER / GOOGLE ADS (dataLayer)
      - clic_llamar      (enlace tel:)
      - clic_whatsapp    (enlace wa.me)
      - clic_email       (enlace mailto:)
      - envio_formulario (formulario de presupuesto enviado y válido)
      Cada evento lleva: pagina, idioma y, si existen, servicio y zona.
      Las etiquetas de GTM respetan el consentimiento automáticamente.
   ============================================= */
(function () {
  var KEY = 'refycon_consent';
  var TEXTS = {
    es: { msg: 'Usamos cookies de analítica (Google Analytics) para mejorar la web y de publicidad (Google Ads) para medir nuestros anuncios. Solo se activan si las aceptas.', ok: 'Aceptar', no: 'Rechazar', cfg: 'Configurar', save: 'Guardar', more: 'Política de Cookies',
          a: 'Analítica', ad: 'Publicidad', aD: 'Saber cuántas personas visitan la web y qué páginas ven.', adD: 'Medir si nuestros anuncios de Google traen solicitudes de presupuesto.' },
    en: { msg: 'We use analytics cookies (Google Analytics) to improve the website and advertising cookies (Google Ads) to measure our ads. They are only enabled if you accept them.', ok: 'Accept', no: 'Reject', cfg: 'Settings', save: 'Save', more: 'Cookie Policy',
          a: 'Analytics', ad: 'Advertising', aD: 'How many people visit the website and which pages they view.', adD: 'Whether our Google ads bring in quote requests.' },
    fr: { msg: 'Nous utilisons des cookies d’analyse (Google Analytics) pour améliorer le site et des cookies publicitaires (Google Ads) pour mesurer nos annonces. Ils ne sont activés que si vous les acceptez.', ok: 'Accepter', no: 'Refuser', cfg: 'Paramétrer', save: 'Enregistrer', more: 'Politique de cookies',
          a: 'Analyse', ad: 'Publicité', aD: 'Combien de personnes visitent le site et quelles pages elles consultent.', adD: 'Si nos annonces Google génèrent des demandes de devis.' },
    de: { msg: 'Wir verwenden Analyse-Cookies (Google Analytics), um die Website zu verbessern, und Werbe-Cookies (Google Ads), um unsere Anzeigen zu messen. Sie werden nur aktiviert, wenn Sie zustimmen.', ok: 'Akzeptieren', no: 'Ablehnen', cfg: 'Einstellungen', save: 'Speichern', more: 'Cookie-Richtlinie',
          a: 'Analyse', ad: 'Werbung', aD: 'Wie viele Personen die Website besuchen und welche Seiten sie ansehen.', adD: 'Ob unsere Google-Anzeigen Angebotsanfragen bringen.' },
    it: { msg: 'Utilizziamo cookie di analisi (Google Analytics) per migliorare il sito e cookie pubblicitari (Google Ads) per misurare i nostri annunci. Vengono attivati solo se li accetti.', ok: 'Accetta', no: 'Rifiuta', cfg: 'Impostazioni', save: 'Salva', more: 'Cookie Policy',
          a: 'Analisi', ad: 'Pubblicità', aD: 'Quante persone visitano il sito e quali pagine vedono.', adD: 'Se i nostri annunci Google portano richieste di preventivo.' },
    nl: { msg: 'We gebruiken analytische cookies (Google Analytics) om de website te verbeteren en advertentiecookies (Google Ads) om onze advertenties te meten. Ze worden alleen geactiveerd als u ze accepteert.', ok: 'Accepteren', no: 'Weigeren', cfg: 'Instellingen', save: 'Opslaan', more: 'Cookiebeleid',
          a: 'Analyse', ad: 'Advertenties', aD: 'Hoeveel mensen de website bezoeken en welke pagina’s ze bekijken.', adD: 'Of onze Google-advertenties offerteaanvragen opleveren.' },
    ru: { msg: 'Мы используем аналитические файлы cookie (Google Analytics) для улучшения сайта и рекламные (Google Ads) для оценки нашей рекламы. Они включаются только с вашего согласия.', ok: 'Принять', no: 'Отклонить', cfg: 'Настроить', save: 'Сохранить', more: 'Политика cookie',
          a: 'Аналитика', ad: 'Реклама', aD: 'Сколько людей посещают сайт и какие страницы смотрят.', adD: 'Приносит ли наша реклама Google заявки.' }
  };

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'es').slice(0, 2).toLowerCase();
    return TEXTS[l] ? l : 'es';
  }

  /* ---------- almacenamiento ---------- */
  function getChoice() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { return null; }
    if (!raw) return null;
    if (raw === 'granted') return { v: 1, a: true, ad: false };   // elección antigua (solo analítica)
    if (raw === 'denied') return { v: 1, a: false, ad: false };
    try { var o = JSON.parse(raw); return (o && o.v === 2) ? o : null; } catch (e) { return null; }
  }
  function setChoice(o) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: 2, a: !!o.a, ad: !!o.ad })); } catch (e) { /* sin almacenamiento: se volverá a preguntar */ }
  }

  /* ---------- Google Consent Mode ---------- */
  function gtagSafe() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(arguments);
  }
  function deleteCookies(re) {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (re.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }
  function apply(o) {
    var ad = o.ad ? 'granted' : 'denied';
    gtagSafe('consent', 'update', {
      analytics_storage: o.a ? 'granted' : 'denied',
      ad_storage: ad, ad_user_data: ad, ad_personalization: ad
    });
    if (!o.a) deleteCookies(/^(_ga|_gid$)/);
    if (!o.ad) deleteCookies(/^(_gcl_|_gac_)/);
  }

  /* ---------- aviso ---------- */
  function injectStyles() {
    if (document.getElementById('cc-styles')) return;
    var css = '' +
      '.cc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:780px;margin:0 auto;' +
      'background:#111827;color:#fff;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.35);padding:18px 20px;' +
      'font-family:Inter,"Segoe UI",Arial,sans-serif;font-size:13px;line-height:1.55}' +
      '.cc-main{display:flex;gap:16px;align-items:center}' +
      '.cc-banner p{margin:0;flex:1;color:rgba(255,255,255,.85)}' +
      '.cc-banner a{color:#60a5fa;text-decoration:underline}' +
      '.cc-actions{display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap}' +
      '.cc-btn{border:2px solid #2563eb;border-radius:6px;padding:10px 14px;font-size:12px;font-weight:700;' +
      'text-transform:uppercase;letter-spacing:.6px;cursor:pointer;font-family:inherit;min-width:96px}' +
      '.cc-btn.cc-ok{background:#2563eb;color:#fff}' +
      '.cc-btn.cc-no,.cc-btn.cc-cfg,.cc-btn.cc-save{background:transparent;color:#fff;border-color:rgba(255,255,255,.6)}' +
      '.cc-btn:focus-visible{outline:2px solid #60a5fa;outline-offset:2px}' +
      '.cc-prefs{display:none;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.15)}' +
      '.cc-prefs.open{display:block}' +
      '.cc-opt{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;cursor:pointer}' +
      '.cc-opt input{margin-top:3px;width:16px;height:16px;accent-color:#2563eb;flex-shrink:0}' +
      '.cc-opt strong{display:block;color:#fff}' +
      '.cc-opt span{color:rgba(255,255,255,.7)}' +
      '@media (max-width:768px){.cc-banner{bottom:72px;left:10px;right:10px}.cc-main{flex-direction:column;align-items:stretch}' +
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
    var cur = getChoice() || { a: false, ad: false };
    var b = document.createElement('div');
    b.id = 'cc-banner';
    b.className = 'cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-live', 'polite');
    b.setAttribute('aria-label', t.more);
    b.innerHTML =
      '<div class="cc-main">' +
        '<p>' + t.msg + ' <a href="/cookies.html">' + t.more + '</a></p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-no">' + t.no + '</button>' +
          '<button type="button" class="cc-btn cc-cfg" aria-expanded="false">' + t.cfg + '</button>' +
          '<button type="button" class="cc-btn cc-ok">' + t.ok + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="cc-prefs">' +
        '<label class="cc-opt"><input type="checkbox" class="cc-a"' + (cur.a ? ' checked' : '') + '><div><strong>' + t.a + '</strong><span>' + t.aD + '</span></div></label>' +
        '<label class="cc-opt"><input type="checkbox" class="cc-ad"' + (cur.ad ? ' checked' : '') + '><div><strong>' + t.ad + '</strong><span>' + t.adD + '</span></div></label>' +
        '<button type="button" class="cc-btn cc-save">' + t.save + '</button>' +
      '</div>';
    b.querySelector('.cc-ok').addEventListener('click', function () { choose({ a: true, ad: true }); });
    b.querySelector('.cc-no').addEventListener('click', function () { choose({ a: false, ad: false }); });
    b.querySelector('.cc-cfg').addEventListener('click', function () {
      var p = b.querySelector('.cc-prefs'); var open = p.classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    b.querySelector('.cc-save').addEventListener('click', function () {
      choose({ a: b.querySelector('.cc-a').checked, ad: b.querySelector('.cc-ad').checked });
    });
    document.body.appendChild(b);
  }

  function choose(o) {
    setChoice(o);
    apply(o);
    var b = document.getElementById('cc-banner');
    if (b) b.parentNode.removeChild(b);
  }

  window.refyconCookieSettings = showBanner;

  /* ---------- eventos de conversión ---------- */
  function pageInfo(extra) {
    var o = { pagina: location.pathname, idioma: lang() };
    for (var k in extra) if (extra[k]) o[k] = extra[k];
    return o;
  }
  function push(event, extra) {
    window.dataLayer = window.dataLayer || [];
    var o = pageInfo(extra || {}); o.event = event;
    window.dataLayer.push(o);
  }
  function trackClicks() {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (/^tel:/i.test(href)) push('clic_llamar');
      else if (/wa\.me\/|api\.whatsapp\.com/i.test(href)) push('clic_whatsapp');
      else if (/^mailto:/i.test(href)) push('clic_email');
    }, true);
    document.addEventListener('submit', function (e) {
      var f = e.target;
      if (!f || !f.getAttribute || !/formspree\.io/.test(f.getAttribute('action') || '')) return;
      var val = function (n) { var el = f.querySelector('[name="' + n + '"]'); return el && el.value ? String(el.value).slice(0, 60) : ''; };
      push('envio_formulario', {
        servicio: val('servicio') || val('tipo_reforma') || val('tipo_bano') || val('tipo_cocina'),
        zona: val('zona')
      });
    }, true);
  }

  function init() {
    var c = getChoice();
    if (c) apply(c);
    if (!c || c.v !== 2) showBanner();   // nunca eligió, o eligió antes de existir la opción de publicidad
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); showBanner(); });
    }
    trackClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
