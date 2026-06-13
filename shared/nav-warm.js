/* Sync head script: mark return visits before first paint. */
(function () {
  var d = document.documentElement;
  try {
    if (sessionStorage.getItem('damaros-warm') === '1') d.classList.add('nav-warm');
  } catch (e) { /* private mode */ }
  d.classList.add('page-enter');
})();
