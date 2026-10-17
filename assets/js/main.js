/* AUPPHS-FA MUN III — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: transparent over hero, solid after scroll ---------- */
  var header = document.querySelector('.site-header');
  var hasHero = !!document.querySelector('.hero');
  if (header) {
    if (!hasHero) header.classList.add('is-solid');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var backdrop = document.querySelector('.nav-backdrop');
  function openNav() { body.classList.add('nav-open'); toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu'); body.style.overflow = 'hidden'; }
  function closeNav() { body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu'); body.style.overflow = ''; }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { body.classList.contains('nav-open') ? closeNav() : openNav(); });
    if (backdrop) backdrop.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('nav-open')) { closeNav(); toggle.focus(); } });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeNav(); });
  }

  /* ---------- Dropdown (Committees) ---------- */
  document.querySelectorAll('.has-sub > button').forEach(function (btn) {
    var li = btn.parentElement;
    btn.addEventListener('click', function () {
      var open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (!li.contains(e.target)) { li.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });

  /* ---------- Scroll reveal with stagger ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
  // Auto-stagger children of any [data-stagger] container
  document.querySelectorAll('[data-stagger]').forEach(function (wrap) {
    Array.prototype.forEach.call(wrap.children, function (child, i) { child.style.setProperty('--i', i % 8); });
  });

  /* ---------- Hero parallax (subtle) ---------- */
  var heroImg = document.querySelector('.hero__media img');
  if (heroImg && !reduce && window.innerWidth > 768) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = 'scale(1.06) translateY(' + (y * 0.18) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Countdown ---------- */
  var cd = document.querySelector('[data-countdown]');
  if (cd) {
    var target = new Date(cd.getAttribute('data-countdown')).getTime();
    var end = new Date(cd.getAttribute('data-countdown-end') || cd.getAttribute('data-countdown')).getTime();
    var cells = { d: cd.querySelector('[data-d]'), h: cd.querySelector('[data-h]'), m: cd.querySelector('[data-m]'), s: cd.querySelector('[data-s]') };
    var note = document.querySelector('[data-countdown-note]');
    function set(el, v) {
      v = String(v).padStart(2, '0');
      if (el.textContent !== v) { el.textContent = v; el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick'); }
    }
    function tick() {
      var now = Date.now(), diff = target - now;
      if (diff <= 0) {
        cd.style.display = 'none';
        if (note) note.textContent = now < end ? 'The conference is in session.' : 'Thank you to everyone who took part in AUPPHS-FA MUN III.';
        return;
      }
      set(cells.d, Math.floor(diff / 864e5));
      set(cells.h, Math.floor(diff / 36e5) % 24);
      set(cells.m, Math.floor(diff / 6e4) % 60);
      set(cells.s, Math.floor(diff / 1e3) % 60);
      setTimeout(tick, 1000 - (now % 1000));
    }
    tick();
  }

  /* ---------- Schedule tabs ---------- */
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    function activate(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false'); t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !selected; if (selected) { panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = ''; } }
      });
      if (history.replaceState) history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (next !== null) { e.preventDefault(); var t = tabs[(next + tabs.length) % tabs.length]; t.focus(); activate(t); }
      });
    });
    var fromHash = location.hash && document.querySelector('[aria-controls="' + location.hash.slice(1) + '"]');
    activate(fromHash || tabs[0]);
  }

  /* ---------- Footer year ---------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
