(function (global) {
  /* Three offset, tilted ellipses — flat outer lid, staggered phases, counter-rotation. */
  function ringSpec(R) {
    return [
      { ox: 0, oy: -R * 0.07, rx: R * 1.08, ry: R * 0.16, rot: 0, dir: 1, speed: 0.032, phase: 0 },
      { ox: R * 0.08, oy: R * 0.06, rx: R * 0.54, ry: R * 0.13, rot: -0.34, dir: -1, speed: 0.044, phase: 2.15 },
      { ox: -R * 0.06, oy: R * 0.05, rx: R * 0.21, ry: R * 0.08, rot: 0.28, dir: 1, speed: 0.055, phase: 4.45 }
    ];
  }

  function perimeter(rx, ry) {
    return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  }

  function dotCount(ring, dotR) {
    return Math.max(34, Math.round(perimeter(ring.rx, ring.ry) / (dotR * 2.05)));
  }

  function xy(ring, theta, t, cx, cy) {
    var a = theta + ring.phase + t * ring.speed * ring.dir;
    var ca = Math.cos(a), sa = Math.sin(a);
    var cr = Math.cos(ring.rot), sr = Math.sin(ring.rot);
    var lx = ca * ring.rx, ly = sa * ring.ry;
    return {
      x: cx + ring.ox + cr * lx - sr * ly,
      y: cy + ring.oy + sr * lx + cr * ly
    };
  }

  global.DamarosLuna = { ringSpec: ringSpec, dotCount: dotCount, xy: xy };
})(typeof window !== "undefined" ? window : this);
