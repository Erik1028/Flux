// The hero's backdrop: a VRAM sparkline drawn the way Flux draws its own (a line over a soft fill),
// stepping once a second like the app refreshes. Made-up numbers; still when motion is reduced.
(function () {
  var cv = document.getElementById('trace');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N = 90, data = [], v = 0.42, seed = 1028;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function next() {
    v += (rnd() - 0.48) * 0.05;
    if (rnd() < 0.04) v += 0.16;                 // a game loads
    if (rnd() < 0.04) v -= 0.14;                 // and closes
    v = Math.max(0.18, Math.min(0.86, v));
    return v;
  }
  for (var i = 0; i < N; i++) data.push(next());

  function draw(shift) {
    var w = cv.clientWidth, h = cv.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var step = w / (N - 2), top = h * 0.40, span = h * 0.5;
    function y(k) { return top + span * (1 - data[k]); }
    ctx.beginPath();
    for (var k = 0; k < N; k++) {
      var x = (k - shift) * step;
      if (k === 0) ctx.moveTo(x, y(k)); else ctx.lineTo(x, y(k));
    }
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(52,211,153,.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo((N - 1 - shift) * step, h); ctx.lineTo(-shift * step, h); ctx.closePath();
    var g = ctx.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, 'rgba(52,211,153,.16)'); g.addColorStop(1, 'rgba(52,211,153,0)');
    ctx.fillStyle = g;
    ctx.fill();
  }

  draw(0);
  addEventListener('resize', function () { draw(0); });
  if (still) return;
  var t0 = performance.now(), last = -1;
  function frame(t) {
    var p = (t - t0) / 1000;                      // one sample per second, slid in over a quarter second
    while (p >= 1) { data.shift(); data.push(next()); t0 += 1000; p -= 1; last = -1; }
    var s = p < 0.25 ? p / 0.25 : 1;
    if (!document.hidden && s !== last) { draw(s); last = s; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
