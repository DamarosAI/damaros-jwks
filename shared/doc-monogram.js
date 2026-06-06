(function () {
  var grid = document.querySelector('.mono-grid[data-mono-src]');
  if (!grid || grid.children.length) return;
  var src = grid.getAttribute('data-mono-src');
  for (var i = 0; i < 90; i++) {
    var im = document.createElement('img');
    im.src = src;
    im.alt = '';
    grid.appendChild(im);
  }
})();
