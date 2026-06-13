/* Intercept same-origin navigations with a short exit fade; restore on bfcache. */
(function () {
  var LEAVE_MS = 200;
  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function markWarm() {
    try { sessionStorage.setItem('damaros-warm', '1'); } catch (e) { /* private mode */ }
    document.documentElement.classList.add('nav-warm');
  }

  function revealEnter() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add('page-enter-ready');
      });
    });
  }

  function isInternalLink(a, e) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
    try {
      var u = new URL(a.href, location.href);
      return u.origin === location.origin && u.pathname !== location.pathname;
    } catch (err) { return false; }
  }

  function leaveThen(url) {
    if (REDUCED) { location.href = url; return; }
    document.body.classList.add('page-leaving');
    markWarm();
    setTimeout(function () { location.href = url; }, LEAVE_MS);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!isInternalLink(a, e)) return;
    e.preventDefault();
    leaveThen(a.href);
  }, true);

  window.addEventListener('pageshow', function (e) {
    document.body.classList.remove('page-leaving');
    if (e.persisted) {
      markWarm();
      document.documentElement.classList.add('page-enter-ready');
      document.body.classList.add('world-ready');
      document.body.classList.remove('doc-intro', 'intro-hold');
      document.documentElement.classList.remove('intro-hold');
    }
  });

  markWarm();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealEnter);
  } else revealEnter();
})();
