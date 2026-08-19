// Antonin Seichepine - Portfolio
// Menu mobile + filtres de la page Projets + bannière cookies

document.addEventListener('DOMContentLoaded', function () {
  // Menu mobile
  var toggle = document.querySelector('.pnav-toggle');
  var links = document.querySelector('.pnav-links');
  if (toggle && links) {
    function setMenuOpen(open) {
      links.classList.toggle('open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    toggle.addEventListener('click', function () {
      setMenuOpen(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenuOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }

  // Consentement GA4 et contenus externes facultatifs (mode basique)
  var CONSENT_KEY = 'cookie_consent';
  var CONSENT_VERSION = 3;
  var CONSENT_DURATION_MONTHS = 6;
  var GA_MEASUREMENT_ID = 'G-J38ZWT67FQ';
  var GA_SCRIPT_ID = 'google-analytics-gtag';
  var GA_LOADED_FLAG = '__portfolioGa4Loaded';
  var GA_DISABLE_FLAG = 'ga-disable-' + GA_MEASUREMENT_ID;
  var GA_COOKIE_MAX_AGE_SECONDS = 34128000; // Environ 13 mois
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var declineBtn = document.getElementById('cookie-decline');
  var reopenBtn = document.getElementById('reopen-cookie-settings');
  var externalConsentBtns = document.querySelectorAll('[data-open-cookie-settings]');

  function removeStoredConsent() {
    try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
  }

  function readConsent() {
    var rawConsent = null;
    try { rawConsent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (!rawConsent) return null;

    try {
      var consent = JSON.parse(rawConsent);
      var expiresAt = Date.parse(consent.expiresAt);
      var isValid = consent &&
        consent.version === CONSENT_VERSION &&
        (consent.analytics === 'granted' || consent.analytics === 'denied') &&
        (consent.externalContent === 'granted' || consent.externalContent === 'denied') &&
        typeof consent.decidedAt === 'string' &&
        typeof consent.expiresAt === 'string' &&
        Number.isFinite(expiresAt) &&
        expiresAt > Date.now();

      if (isValid) return consent;
    } catch (e) {
      // Les anciennes valeurs et versions sont volontairement considérées
      // comme obsolètes afin de redemander un consentement éclairé.
    }

    removeStoredConsent();
    return null;
  }

  function saveConsent(analyticsStatus, externalContentStatus) {
    var decidedAt = new Date();
    var expiresAt = new Date(decidedAt.getTime());
    expiresAt.setUTCMonth(expiresAt.getUTCMonth() + CONSENT_DURATION_MONTHS);

    var consent = {
      version: CONSENT_VERSION,
      analytics: analyticsStatus,
      externalContent: externalContentStatus,
      decidedAt: decidedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(consent)); } catch (e) {}
    return consent;
  }

  function hasAnalyticsConsent(consent) {
    return Boolean(consent && consent.version === CONSENT_VERSION && consent.analytics === 'granted');
  }

  function hasExternalContentConsent(consent) {
    return Boolean(consent && consent.version === CONSENT_VERSION && consent.externalContent === 'granted');
  }

  function expireCookie(name, domain) {
    var cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/; SameSite=Lax';
    if (domain) cookie += '; domain=' + domain;
    if (window.location.protocol === 'https:') cookie += '; Secure';
    document.cookie = cookie;
  }

  function deleteGoogleAnalyticsCookies() {
    var cookieNames = document.cookie.split(';').map(function (part) {
      return part.split('=')[0].trim();
    }).filter(function (name) {
      return name === '_ga' || name.indexOf('_ga_') === 0;
    });

    var domains = [''];
    var hostnameParts = window.location.hostname.split('.');
    while (hostnameParts.length > 1) {
      var domain = hostnameParts.join('.');
      domains.push(domain, '.' + domain);
      hostnameParts.shift();
    }

    cookieNames.forEach(function (name) {
      domains.forEach(function (domain) { expireCookie(name, domain); });
    });
  }

  function disableGoogleAnalytics() {
    window[GA_DISABLE_FLAG] = true;

    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }

    deleteGoogleAnalyticsCookies();
  }

  function loadGoogleAnalytics(consent) {
    if (!hasAnalyticsConsent(consent)) return;
    if (window[GA_LOADED_FLAG] || document.getElementById(GA_SCRIPT_ID)) return;

    window[GA_DISABLE_FLAG] = false;
    window[GA_LOADED_FLAG] = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: GA_COOKIE_MAX_AGE_SECONDS,
      cookie_update: false,
      send_page_view: true
    });

    var script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    script.setAttribute('data-consent-category', 'analytics');
    script.addEventListener('error', function () {
      window[GA_LOADED_FLAG] = false;
      script.remove();
    });
    document.head.appendChild(script);
  }

  function hasLoadedInstagramContent() {
    return Boolean(document.querySelector('[data-instagram-iframe]'));
  }

  function disableExternalContent() {
    document.querySelectorAll('[data-instagram-embed]').forEach(function (container) {
      var iframe = container.querySelector('[data-instagram-iframe]');
      var placeholder = container.querySelector('[data-instagram-placeholder]');
      if (iframe) iframe.remove();
      if (placeholder) placeholder.style.display = 'flex';
    });
  }

  function loadExternalContent(consent) {
    if (!hasExternalContentConsent(consent)) return;

    document.querySelectorAll('[data-instagram-embed]').forEach(function (container) {
      if (container.querySelector('[data-instagram-iframe]')) return;

      var source = container.getAttribute('data-instagram-src');
      if (!source) return;

      var placeholder = container.querySelector('[data-instagram-placeholder]');
      var iframe = document.createElement('iframe');
      iframe.src = source;
      iframe.title = 'Page Instagram MSY Workshop - aperçu';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('data-instagram-iframe', '');
      iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;';

      if (placeholder) placeholder.style.display = 'none';
      container.appendChild(iframe);
    });
  }

  function applyConsent(consent) {
    if (hasAnalyticsConsent(consent)) {
      loadGoogleAnalytics(consent);
    } else {
      disableGoogleAnalytics();
    }

    if (hasExternalContentConsent(consent)) {
      loadExternalContent(consent);
    } else {
      disableExternalContent();
    }
  }

  function openConsentSettings() {
    if (!banner) return;
    banner.hidden = false;
    if (declineBtn) declineBtn.focus();
  }

  var storedConsent = readConsent();
  if (banner) {
    if (!storedConsent) {
      banner.hidden = false;
    } else {
      applyConsent(storedConsent);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        var consent = saveConsent('granted', 'granted');
        applyConsent(consent);
        banner.hidden = true;
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        var optionalContentWasLoaded = Boolean(
          window[GA_LOADED_FLAG] ||
          document.getElementById(GA_SCRIPT_ID) ||
          hasLoadedInstagramContent()
        );
        var consent = saveConsent('denied', 'denied');
        applyConsent(consent);
        banner.hidden = true;

        if (optionalContentWasLoaded) {
          window.setTimeout(function () { window.location.reload(); }, 0);
        }
      });
    }
  }

  if (reopenBtn) {
    reopenBtn.addEventListener('click', openConsentSettings);
  }

  externalConsentBtns.forEach(function (button) {
    button.addEventListener('click', openConsentSettings);
  });

  // Filtres Projets (Tout / Études de cas / Créations)
  var filterBtns = document.querySelectorAll('.fbtn[data-filter]');
  if (filterBtns.length) {
    var cases = document.querySelector('[data-group="cases"]');
    var creations = document.querySelector('[data-group="creations"]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('on');
        btn.setAttribute('aria-pressed', 'true');
        var f = btn.getAttribute('data-filter');
        if (cases) cases.style.display = (f === 'all' || f === 'cases') ? '' : 'none';
        if (creations) creations.style.display = (f === 'all' || f === 'creations') ? '' : 'none';
      });
    });
  }

  // Formulaire de contact (Formspree) - envoi en AJAX pour rester sur la page
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('contact-form-status');
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var data = new FormData(contactForm);
      if (submitBtn) submitBtn.disabled = true;
      fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (status) {
          if (response.ok) {
            contactForm.reset();
            status.textContent = 'Message envoye, merci ! Je reponds vite.';
            status.style.color = 'var(--color-green)';
          } else {
            status.textContent = 'Une erreur est survenue. Reessayez ou ecrivez-moi directement par email.';
            status.style.color = '#c0392b';
          }
          status.style.display = 'block';
        }
      }).catch(function () {
        if (status) {
          status.textContent = 'Une erreur est survenue. Reessayez ou ecrivez-moi directement par email.';
          status.style.color = '#c0392b';
          status.style.display = 'block';
        }
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }
});
