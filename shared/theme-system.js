/* Damaros — system color-scheme only. No manual override or persistence. */
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: light)");

  function apply() {
    root.setAttribute("data-theme", mq.matches ? "light" : "dark");
  }

  apply();

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", apply);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(apply);
  }
})();
