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

  // Bannière de consentement cookies
  var CONSENT_KEY = 'cookie_consent';
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');
  var declineBtn = document.getElementById('cookie-decline');
  var reopenBtn = document.getElementById('reopen-cookie-settings');

  function applyConsent(value) {
    // Point d'entrée unique : si un outil de mesure d'audience est ajouté un
    // jour (Plausible, GA, etc.), son chargement doit être conditionné à
    // value === 'accepted' ici, pas ailleurs dans le code.
  }

  if (banner) {
    var consent = null;
    try { consent = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (!consent) {
      banner.hidden = false;
    } else {
      applyConsent(consent);
    }
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
        applyConsent('accepted');
        banner.hidden = true;
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch (e) {}
        applyConsent('declined');
        banner.hidden = true;
      });
    }
  }
  if (reopenBtn) {
    reopenBtn.addEventListener('click', function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
      if (banner) banner.hidden = false;
    });
  }

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
