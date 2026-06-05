/* ============================================================
 * Damaros — micro-interaction layer.
 *   The polish lives in timing + restraint, not effect volume.
 *
 *   1. Magnetic CTAs        [data-magnetic]   (wrapper element)
 *   2. Pointer spotlight    [data-spotlight]  (sets --mx/--my/--sp)
 *   3. Count-up stats       [data-count]      (on first reveal)
 *   4. Spine scroll progress[data-spine-scroll] > [data-spine-fill]
 *   5. Nav scrolled state + scrollspy  [data-nav] / [data-spy]
 *
 *   Hover effects are pointer:fine only; everything degrades to a
 *   correct static state under prefers-reduced-motion or on touch.
 * ============================================================ */
(function () {
  var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ---- 1. Magnetic CTAs (wrapper translates; inner button keeps its own hover) ---- */
  function initMagnetic() {
    if (!FINE || REDUCED) return;
    [].forEach.call(document.querySelectorAll("[data-magnetic]"), function (el) {
      var strength = parseFloat(el.getAttribute("data-magnetic")) || 0.28;
      var rx = 0, ry = 0, tx = 0, ty = 0, id = 0;
      function loop() {
        rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
        el.style.transform = "translate(" + rx.toFixed(2) + "px," + ry.toFixed(2) + "px)";
        if (Math.abs(tx - rx) > 0.12 || Math.abs(ty - ry) > 0.12) id = raf(loop);
        else { el.style.transform = tx || ty ? "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px)" : ""; id = 0; }
      }
      el.addEventListener("pointermove", function (ev) {
        var r = el.getBoundingClientRect();
        tx = (ev.clientX - (r.left + r.width / 2)) * strength;
        ty = (ev.clientY - (r.top + r.height / 2)) * strength;
        if (!id) id = raf(loop);
      });
      el.addEventListener("pointerleave", function () { tx = 0; ty = 0; if (!id) id = raf(loop); });
    });
  }

  /* ---- 2. Pointer spotlight on panels ---- */
  function initSpotlight() {
    if (!FINE) return;
    [].forEach.call(document.querySelectorAll("[data-spotlight]"), function (el) {
      el.addEventListener("pointermove", function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        el.style.setProperty("--sp", "1");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--sp", "0"); });
    });
  }

  /* ---- 3. Count-up stats ---- */
  function fmt(v, commas, prefix, suffix, dec) {
    var s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
    if (commas) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (prefix || "") + s + (suffix || "");
  }
  function initCount() {
    var els = [].slice.call(document.querySelectorAll("[data-count]"));
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var commas = el.hasAttribute("data-commas");
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (REDUCED || isNaN(target)) { el.textContent = fmt(target || 0, commas, prefix, suffix, dec); return; }
      var dur = 1150, t0 = performance.now();
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(target * e, commas, prefix, suffix, dec);
        if (k < 1) raf(tick); else el.textContent = fmt(target, commas, prefix, suffix, dec);
      })(performance.now());
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 4. Execution-spine scroll progress ---- */
  var spineTrack, spineQueued = false;
  function updateSpine() {
    spineQueued = false;
    if (!spineTrack) return;
    var r = spineTrack.getBoundingClientRect(), vh = window.innerHeight || 800;
    var p = (vh * 0.62 - r.top) / (r.height || 1);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    spineTrack.style.setProperty("--spine", p.toFixed(3));
  }
  function initSpine() {
    spineTrack = document.querySelector("[data-spine-scroll]");
    if (!spineTrack) return;
    if (REDUCED) { spineTrack.style.setProperty("--spine", "1"); return; }
    var onScroll = function () { if (!spineQueued) { spineQueued = true; raf(updateSpine); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateSpine();
  }

  /* ---- 5. Nav scrolled state + scrollspy ---- */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (nav) {
      var onS = function () { window.scrollY > 14 ? nav.setAttribute("data-scrolled", "") : nav.removeAttribute("data-scrolled"); };
      onS(); window.addEventListener("scroll", onS, { passive: true });
    }
    var links = [].slice.call(document.querySelectorAll("[data-spy]"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute("href");
      if (id && id.charAt(0) === "#" && document.querySelector(id)) map[id] = l;
    });
    var spy = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = "#" + en.target.id;
        links.forEach(function (l) { l.removeAttribute("aria-current"); });
        if (map[id]) map[id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(map).forEach(function (id) { var sec = document.querySelector(id); if (sec) spy.observe(sec); });
  }

  function init() {
    initMagnetic(); initSpotlight(); initCount(); initSpine(); initNav();
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
