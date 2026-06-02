/* Pause canvas RAF loops when tab hidden or element off-screen; scroll reveals via IO. */
(function (global) {
  function isMobile() {
    return matchMedia("(hover: none), (pointer: coarse)").matches || window.innerWidth <= 900;
  }

  function perf() {
    var mobile = isMobile();
    return {
      mobile: mobile,
      dpr: mobile ? 1 : Math.min(2, window.devicePixelRatio || 1),
      glow: mobile ? 0 : 1
    };
  }

  function loop(opts) {
    var rafId = 0, running = true, tabVisible = !document.hidden, inView = true;
    var root = opts.root || null;
    var margin = opts.rootMargin || (isMobile() ? "40px 0px" : "100px 0px");

    function active() {
      return running && tabVisible && inView && !opts.reduced;
    }

    function tick(now) {
      rafId = 0;
      if (!active()) return;
      opts.onFrame(now);
      rafId = requestAnimationFrame(tick);
    }

    function kick() {
      if (!rafId && active()) rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    document.addEventListener("visibilitychange", function () {
      tabVisible = !document.hidden;
      if (tabVisible) kick();
    });

    if (root && "IntersectionObserver" in global) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) kick();
      }, { root: null, rootMargin: margin, threshold: 0 }).observe(root);
    }

    return { start: kick, stop: stop, kick: kick };
  }

  var CAROUSEL_SEL = ".stats, .spine-cards, .who-cards";

  function inCarousel(el) {
    return !!(el.closest && el.closest(CAROUSEL_SEL));
  }

  function revealOnScroll(opts) {
    opts = opts || {};
    var selector = opts.selector || ".reveal, .draw, .flow-in";
    var els = [].slice.call(document.querySelectorAll(selector));
    if (!els.length) return;

    var reduced = opts.reduced;
    if (reduced == null) reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    if (!("IntersectionObserver" in global)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var mobile = opts.mobile != null ? opts.mobile : isMobile();

    /* Vertical page scroll — one-shot reveal per element */
    var vert = els.filter(function (el) { return !mobile || !inCarousel(el); });
    if (vert.length) {
      var vMargin = mobile ? "0px 0px -6% 0px" : "0px 0px -12% 0px";
      var vIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          vIo.unobserve(entry.target);
        });
      }, { root: null, rootMargin: vMargin, threshold: mobile ? 0.06 : 0.1 });
      vert.forEach(function (el) { vIo.observe(el); });
    }

    /* Mobile horizontal carousels — fade cards as they snap into view */
    if (mobile) {
      [].slice.call(document.querySelectorAll(CAROUSEL_SEL)).forEach(function (track) {
        var cards = track.querySelectorAll(".flow-in, .stat, .scard, .wcard");
        if (!cards.length) return;
        var cIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add("in");
          });
        }, { root: track, threshold: 0.52, rootMargin: "0px 8px" });
        cards.forEach(function (c) { cIo.observe(c); });
      });
    }
  }

  global.DamarosAnim = { loop: loop, isMobile: isMobile, perf: perf, revealOnScroll: revealOnScroll };
})(typeof window !== "undefined" ? window : this);
