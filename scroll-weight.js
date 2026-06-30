/*
 * Section-by-section wheel scrolling on desktop.
 * One wheel gesture (including a long trackpad fling) advances exactly one
 * labeled section up or down. Touch / coarse-pointer / narrow viewports keep
 * native scrolling. Inner scrollable panels keep their own gesture.
 */
(function () {
  var coarse = window.matchMedia("(max-width:760px),(pointer:coarse)");
  if (coarse.matches) return;

  var reduced = window.matchMedia("(prefers-reduced-motion:reduce)");
  var HEADER = 62;
  var DURATION = 420;
  var LOCK_MS = 60;

  var sections = [];
  var animating = false;
  var lockUntil = 0;

  document.documentElement.style.scrollSnapType = "none";

  function collect() {
    sections = Array.prototype.slice.call(
      document.querySelectorAll(".dm-site section[data-screen-label]")
    );
    sections.forEach(function (s) {
      s.style.scrollSnapAlign = "none";
      s.style.scrollSnapStop = "normal";
    });
  }

  function maxScroll() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function centerTarget(el) {
    var r = el.getBoundingClientRect();
    var elTop = r.top + window.scrollY;
    var top = elTop - Math.max(HEADER, (window.innerHeight - r.height) / 2);
    return Math.max(0, Math.min(top, maxScroll()));
  }

  function glideTo(target) {
    target = Math.max(0, Math.min(target, maxScroll()));
    var html = document.documentElement;
    var prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    if (reduced.matches || DURATION === 0) {
      window.scrollTo(0, target);
      html.style.scrollBehavior = prevBehavior;
      lockUntil = performance.now() + LOCK_MS;
      return;
    }

    animating = true;
    var startY = window.scrollY;
    var dist = target - startY;
    var startT = performance.now();

    function frame(now) {
      var p = Math.min(1, (now - startT) / DURATION);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        animating = false;
        lockUntil = now + LOCK_MS;
        html.style.scrollBehavior = prevBehavior;
      }
    }
    requestAnimationFrame(frame);
  }

  function currentIndex() {
    var mid = window.scrollY + window.innerHeight / 2;
    var idx = 0;
    var best = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      var center = r.top + window.scrollY + r.height / 2;
      var dist = Math.abs(center - mid);
      if (dist < best) {
        best = dist;
        idx = i;
      }
    }
    return idx;
  }

  function innerHandles(node, dir) {
    while (node && node.nodeType === 1 && node !== document.body) {
      var oy = getComputedStyle(node).overflowY;
      if (
        (oy === "auto" || oy === "scroll" || oy === "overlay") &&
        node.scrollHeight > node.clientHeight + 2
      ) {
        if (dir > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1)
          return true;
        if (dir < 0 && node.scrollTop > 1) return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function advance(dir, e) {
    if (e && innerHandles(e.target, dir)) return false;
    if (sections.length < 2) return false;

    var idx = currentIndex();
    var next = dir > 0 ? idx + 1 : idx - 1;
    if (next < 0 || next >= sections.length) return false;

    if (e) e.preventDefault();
    glideTo(centerTarget(sections[next]));
    return true;
  }

  function onWheel(e) {
    if (e.ctrlKey) return;
    var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
    if (!dir) return;

    var now = performance.now();
    if (animating || now < lockUntil) {
      e.preventDefault();
      return;
    }

    advance(dir, e);
  }

  collect();
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("resize", collect, { passive: true });
  window.addEventListener("load", function () {
    setTimeout(collect, 300);
  });
})();
