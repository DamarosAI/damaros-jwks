/* Sync head script: warm fast path only for in-session link navigations (not reload). */
(function () {
  var d = document.documentElement;
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  var navType = (nav && nav.type) || 'navigate';
  var warm = false;
  try {
    if (navType === 'reload') {
      sessionStorage.removeItem('damaros-warm');
    } else if (navType === 'navigate' && sessionStorage.getItem('damaros-warm') === '1') {
      warm = true;
    }
  } catch (e) { /* private mode */ }
  if (warm) d.classList.add('nav-warm');
  d.classList.add('page-enter');
})();
