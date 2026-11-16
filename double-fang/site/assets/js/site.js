/* Shared by every page: theme, the privacy choice, and the footer year.
   Nothing here talks to a server. The only storage used is localStorage: df-theme and df-consent. */
(function () {
  'use strict';

  var root = document.documentElement;
  var DF = window.DF = window.DF || {};
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Theme: System / Light / Dark. Light is the brand default. ---------- */
  var themeHooks = [];
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  function themeChoice() { return store.get('df-theme') || 'light'; }
  function applyTheme(choice) {
    var night = choice === 'dark' || (choice === 'system' && sysDark.matches);
    root.setAttribute('data-mode', night ? 'night' : 'day');
    themeHooks.forEach(function (fn) { fn(); });
  }
  DF.onTheme = function (fn) { themeHooks.push(fn); };
  each('.theme-switch input', function (radio) {
    radio.checked = radio.value === themeChoice();
    radio.addEventListener('change', function () { store.set('df-theme', radio.value); applyTheme(radio.value); });
  });
  sysDark.addEventListener('change', function () { if (themeChoice() === 'system') applyTheme('system'); });

  /* ---------- Privacy choice ----------
     Analytics are off until someone says yes. Load any future analytics only from inside
     DF.onConsent(function (c) { if (c.analytics) { ... } }). The choice is asked again after a year. */
  var YEAR = 365 * 24 * 60 * 60 * 1000;
  var banner = document.getElementById('consent');
  var consentHooks = [];
  var opener = null;
  function readConsent() {
    try {
      var c = JSON.parse(store.get('df-consent') || 'null');
      if (c && c.v === 1 && typeof c.analytics === 'boolean' && Date.now() - c.t < YEAR) return c;
    } catch (e) {}
    return null;
  }
  DF.consent = readConsent();
  DF.onConsent = function (fn) { consentHooks.push(fn); if (DF.consent) fn(DF.consent); };
  function choose(analytics) {
    DF.consent = { v: 1, analytics: analytics, t: Date.now() };
    store.set('df-consent', JSON.stringify(DF.consent));
    banner.hidden = true;
    consentHooks.forEach(function (fn) { fn(DF.consent); });
    if (opener) { opener.focus(); opener = null; }
  }
  if (banner) {
    banner.querySelector('[data-consent="essential"]').addEventListener('click', function () { choose(false); });
    banner.querySelector('[data-consent="all"]').addEventListener('click', function () { choose(true); });
    if (!DF.consent) banner.hidden = false;
    each('[data-open-consent]', function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        banner.hidden = false;
        banner.querySelector('button').focus();
      });
    });
  }

  each('#year', function (el) { el.textContent = new Date().getFullYear(); });
})();
