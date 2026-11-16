/* Home page behavior. Loads after site.js. No scroll listeners: every scroll-linked effect
   runs in one requestAnimationFrame loop, and only while its section is on screen. */
(function () {
  'use strict';

  var root = document.documentElement;
  var DF = window.DF = window.DF || {};
  var mm = function (q) { return window.matchMedia(q).matches; };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var fine = mm('(pointer: fine)');
  var hoverable = mm('(hover: hover) and (pointer: fine)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ramp = function (v, a, b) { return b === a ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a), 0, 1); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var token = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* One rAF loop; each ticker runs only while its section is on screen. */
  var tickers = new Set(), looping = false;
  function loop(t) {
    tickers.forEach(function (fn) { fn(t); });
    if (tickers.size) requestAnimationFrame(loop); else looping = false;
  }
  function run(fn) { tickers.add(fn); if (!looping) { looping = true; requestAnimationFrame(loop); } }
  function whileVisible(el, fn) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) run(fn); else tickers.delete(fn); });
    }, { rootMargin: '120px 0px' });
    io.observe(el);
    return io;
  }
  function onceVisible(el, fn, threshold) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { threshold: threshold || 0.3 });
    io.observe(el);
  }

  /* Anything that caches page positions re-measures here, never on scroll. */
  var measurers = [];
  function onMeasure(fn) { measurers.push(fn); fn(); }
  function measureAll() { measurers.forEach(function (fn) { fn(); }); }
  window.addEventListener('resize', measureAll);
  if ('ResizeObserver' in window) new ResizeObserver(measureAll).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);

  /* ---------- Menu ---------- */
  var burger = $('#burger'), menu = $('#menu'), mainEl = $('#main'), footEl = $('footer');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mainEl.inert = open; footEl.inert = open;
    if (open) setTimeout(function () { $('a', menu).focus(); }, 80);
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav-links a');
  var navFor = { inside: 'services' };
  var navIO = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = navFor[e.target.id] || e.target.id;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(function (s) { navIO.observe(s); });

  /* ---------- Reveals ---------- */
  var revealIO = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(function (el) { revealIO.observe(el); });

  /* ---------- Pointer effects ---------- */
  if (fine) {
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
  function tilt(area, target, deg) {
    if (!fine || reduce || !area || !target) return;
    area.addEventListener('pointermove', function (e) {
      var r = area.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      target.style.setProperty('--ry', (x * deg).toFixed(2) + 'deg');
      target.style.setProperty('--rx', (-y * deg).toFixed(2) + 'deg');
    });
    area.addEventListener('pointerleave', function () { target.style.setProperty('--rx', '0deg'); target.style.setProperty('--ry', '0deg'); });
  }
  tilt($('.hero'), $('#browser-shell'), 7);
  tilt($('.cell-web'), $('#phone'), 16);
  tilt($('.cell-model'), $('.orbit-stage'), 26);

  /* ---------- Contact topic, shared by the builds list, the globe and the legal pages ---------- */
  function setTopic(key) {
    var sel = $('#f-topic');
    if (!key || !$('option[value="' + key + '"]', sel)) return;
    sel.value = key;
    sel.dispatchEvent(new Event('change'));
  }
  DF.setTopic = setTopic;

  /* ---------- Hero: the site that builds itself ---------- */
  (function hero() {
    var section = $('.hero');
    var bands = $$('.band', section);
    var bandBtn = $('[data-band="3"] .btn', section);
    var pieces = $$('.piece', section);
    var browser = $('#browser');
    var promptEl = $('#prompt-text'), statusEl = $('#status-text'), pctEl = $('#status-pct'), urlEl = $('#url-text');
    var PROMPT = $('#prompt-ghost').textContent;
    var PIECE_AT = [0.3, 0.36, 0.41, 0.46, 0.54, 0.64];
    var BANDS = [[-1, 0, 0.16, 0.24], [0.24, 0.3, 0.48, 0.54], [0.54, 0.6, 0.76, 0.82], [0.82, 0.88, 9, 9]];
    var STATUS = [[0.28, 'Reading your brief'], [0.5, 'Writing the copy'], [0.66, 'Laying out sections'], [0.84, 'Checking it on phones'], [9, 'Live']];
    var last = { chars: -1, pieces: -1, status: '', pct: -1, live: null, bands: [] };

    function build(p) {
      var chars = Math.round(ramp(p, 0.04, 0.26) * PROMPT.length);
      if (chars !== last.chars) { promptEl.textContent = PROMPT.slice(0, chars); last.chars = chars; }
      var n = 0; while (n < PIECE_AT.length && p >= PIECE_AT[n]) n++;
      if (n !== last.pieces) { pieces.forEach(function (el, i) { el.classList.toggle('on', i < n); }); last.pieces = n; }
      var s = 0; while (p >= STATUS[s][0]) s++;
      if (STATUS[s][1] !== last.status) { statusEl.textContent = STATUS[s][1]; last.status = STATUS[s][1]; }
      var pct = Math.round(ramp(p, 0, 0.84) * 100);
      if (pct !== last.pct) { pctEl.textContent = pct + '%'; last.pct = pct; }
      var live = p >= 0.84;
      if (live !== last.live) { browser.classList.toggle('live', live); urlEl.textContent = live ? 'https://gableandslate.example' : 'gableandslate.example'; last.live = live; }
    }
    function writeBands(p) {
      bands.forEach(function (b, i) {
        var r = BANDS[i];
        var o = ramp(p, r[0], r[1]) * (1 - ramp(p, r[2], r[3]));
        o = Math.round(o * 100) / 100;
        if (o === last.bands[i]) return;
        last.bands[i] = o;
        b.style.opacity = o;
        b.style.transform = 'translateY(' + ((1 - o) * (p < r[1] ? 24 : -24)).toFixed(1) + 'px)';
        b.style.visibility = o === 0 ? 'hidden' : 'visible';
        b.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
      });
      bandBtn.tabIndex = last.bands[3] > 0.5 ? 0 : -1;
    }

    var conn = navigator.connection || {};
    var still = reduce || mm('(max-width: 760px)') || (mm('(pointer: coarse)') && mm('(max-width: 1100px)')) ||
      conn.saveData || /2g|3g/.test(conn.effectiveType || '');

    requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.remove('load'); }); });

    if (still) {
      $$('.band:not([data-band="0"])', section).forEach(function (b) { b.hidden = true; });
      if (reduce) { build(1); return; }
      build(0);
      onceVisible(browser, function () {
        var t0 = performance.now();
        run(function play(t) {
          var p = Math.min(1, (t - t0) / 5200);
          build(p);
          if (p >= 1) tickers.delete(play);
        });
      }, 0.2);
      return;
    }

    section.classList.add('scrub');
    var top = 0, span = 1, lastY = null;
    onMeasure(function () {
      top = section.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, section.offsetHeight - window.innerHeight);
      lastY = null;
    });
    build(0); writeBands(0);
    whileVisible(section, function () {
      var y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
      var p = clamp((y - top) / span, 0, 1);
      writeBands(p);
      build(p);
    });
  })();

  /* ---------- Premise: words light up as you read ---------- */
  (function premise() {
    var el = $('#premise-text');
    var words = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (ch) {
      if (ch.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      ch.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        frag.appendChild(s); words.push(s);
      });
      el.replaceChild(frag, ch);
    });
    if (reduce) { words.forEach(function (w) { w.classList.add('lit'); }); return; }
    var lastN = -1;
    whileVisible(el, function () {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = ramp(vh * 0.85 - r.top, 0, r.height + vh * 0.3);
      var n = Math.round(p * words.length);
      if (n === lastN) return;
      words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      lastN = n;
    });
  })();

  /* ---------- The fogged porthole, then the portal into the blue world ---------- */
  (function portal() {
    var section = $('#services'), wrapEl = $('#portal'), stage = $('.portal-stage', wrapEl);
    var world = $('#portal-world'), head = $('#world-head'), out = $('#portal-out'), hole = $('#porthole'), ring = $('#portal-ring');
    var canvas = $('#fog'), finger = $('#finger'), btn = $('#fog-btn');
    if (reduce) return;                                   /* the plain layout in the stylesheet takes over */
    section.classList.add('scrub-portal');

    /* Fog: a white haze on a canvas. Wiping erases it and shows the sky behind. */
    var ctx = canvas.getContext('2d');
    var D = 0, dpr = 1, big = null, small = null, fogged = false, touched = false;
    var GN = 20, grid = null, marked = 0, total = 1, drips = [], last = null, demo = null, demoDone = false;

    function brush(r) {
      var c = document.createElement('canvas'), s = Math.ceil(r * 2 * dpr);
      c.width = c.height = s;
      var x = c.getContext('2d'), g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.62, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0, 0, s, s);
      return { img: c, r: r };
    }
    function paint() {
      var i, x, y, r, g;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, D, D);
      ctx.fillStyle = 'rgba(253,253,254,0.9)';
      ctx.fillRect(0, 0, D, D);
      ctx.globalCompositeOperation = 'destination-out';
      for (i = 0; i < 24; i++) {                          /* thinner patches, so the fog is uneven */
        x = Math.random() * D; y = Math.random() * D; r = D * (0.12 + Math.random() * 0.2);
        g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(0,0,0,' + (0.05 + Math.random() * 0.08).toFixed(3) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (i = 0; i < D * 1.1; i++) {                     /* condensation specks */
        x = Math.random() * D; y = Math.random() * D; r = 0.4 + Math.random() * Math.random() * 1.5;
        ctx.fillStyle = 'rgba(0,0,0,' + (0.07 + Math.random() * 0.15).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
      }
      grid = new Uint8Array(GN * GN); marked = 0; total = 0;
      for (i = 0; i < GN * GN; i++) {
        var gx = (i % GN + 0.5) / GN - 0.5, gy = (Math.floor(i / GN) + 0.5) / GN - 0.5;
        if (gx * gx + gy * gy <= 0.25) total++; else grid[i] = 2;
      }
      drips.length = 0; fogged = true;
      hole.classList.remove('clear');
      btn.textContent = 'Clear it for me';
    }
    function stamp(x, y, b) {
      ctx.drawImage(b.img, x - b.r, y - b.r, b.r * 2, b.r * 2);
      var gx = Math.floor(x / D * GN), gy = Math.floor(y / D * GN), k = Math.max(0, Math.round(b.r / D * GN * 0.7)), i, j, id;
      for (j = gy - k; j <= gy + k; j++) for (i = gx - k; i <= gx + k; i++) {
        if (i < 0 || j < 0 || i >= GN || j >= GN) continue;
        id = j * GN + i;
        if (grid[id] === 0) { grid[id] = 1; marked++; }
      }
    }
    function stroke(x0, y0, x1, y1, b) {
      ctx.globalCompositeOperation = 'destination-out';
      var n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (b.r * 0.3)));
      for (var s = 1; s <= n; s++) stamp(lerp(x0, x1, s / n), lerp(y0, y1, s / n), b);
    }
    function dripTick() {                                 /* a few drops run down from where you wiped */
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      for (var i = drips.length - 1; i >= 0; i--) {
        var d = drips[i];
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.5, 0, 6.2832); ctx.fill();
        d.y += d.v; d.v *= 0.992; d.x += Math.sin(d.y * 0.11) * 0.18;
        if (--d.life <= 0 || d.y > D) drips.splice(i, 1);
      }
      if (!drips.length) tickers.delete(dripTick);
    }
    function clear() {
      fogged = false; stopDemo();
      hole.classList.add('clear');
      btn.textContent = 'Fog it up again';
      drips.length = 0;
    }
    function check() { if (fogged && marked / total > 0.42) clear(); }
    btn.addEventListener('click', function () { if (fogged) clear(); else { touched = true; paint(); } });

    function at(e) { var r = hole.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    hole.addEventListener('pointerdown', function (e) {
      if (!fogged) return;
      touched = true; stopDemo();
      last = at(e);
      stroke(last.x, last.y, last.x, last.y, big); check();
    });
    hole.addEventListener('pointermove', function (e) {
      if (!fogged) return;
      var p = at(e);
      if (e.pointerType !== 'mouse' && !last) return;     /* touch wipes only while a finger is down */
      if (last && (p.x !== last.x || p.y !== last.y)) {
        if (!touched) { touched = true; stopDemo(); }
        stroke(last.x, last.y, p.x, p.y, big);
        if (drips.length < 14 && Math.random() < 0.07) {
          drips.push({ x: p.x + (Math.random() - 0.5) * big.r * 1.5, y: p.y + big.r * 0.7, v: 0.6 + Math.random() * 1.2, life: 50 + Math.random() * 90 });
          run(dripTick);
        }
        check();
      }
      last = p;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) { hole.addEventListener(type, function () { last = null; }); });

    /* The fourth wall: a finger on the far side of the glass writes "hi", once. */
    var SEG = [
      { pen: 0, d: 560, pts: [[0.66, 0.94], [0.33, 0.31]] },
      { pen: 1, d: 380, pts: [[0.33, 0.31], [0.33, 0.66]] },
      { pen: 0, d: 200, pts: [[0.33, 0.66], [0.33, 0.5]] },
      { pen: 1, d: 460, pts: [[0.33, 0.5], [0.355, 0.455], [0.4, 0.44], [0.44, 0.465], [0.455, 0.52], [0.455, 0.66]] },
      { pen: 0, d: 240, pts: [[0.455, 0.66], [0.6, 0.47]] },
      { pen: 1, d: 280, pts: [[0.6, 0.47], [0.6, 0.66]] },
      { pen: 0, d: 190, pts: [[0.6, 0.66], [0.6, 0.36]] },
      { pen: 1, d: 170, pts: [[0.6, 0.36], [0.6, 0.364]] },
      { pen: 0, d: 480, pts: [[0.6, 0.36], [0.84, 0.98]] }
    ];
    function along(pts, u) {
      var n = pts.length - 1, f = Math.min(n - 1e-6, Math.max(0, u) * n), i = Math.floor(f), k = f - i;
      return [lerp(pts[i][0], pts[i + 1][0], k) * D, lerp(pts[i][1], pts[i + 1][1], k) * D];
    }
    function finishSeg(s) {                               /* draw whatever is left of a stroke we ran past */
      if (!s.pen) return;
      var from = demo.prev ? demo.u : 0, q = demo.prev || along(s.pts, 0);
      for (var k = 1; k <= 12; k++) { var p = along(s.pts, lerp(from, 1, k / 12)); stroke(q[0], q[1], p[0], p[1], small); q = p; }
    }
    function demoTick(t) {
      if (!demo) { tickers.delete(demoTick); return; }
      if (!demo.t0) demo.t0 = t;
      var el = t - demo.t0;
      while (demo.i < SEG.length && el >= demo.start + SEG[demo.i].d) {
        finishSeg(SEG[demo.i]); demo.start += SEG[demo.i].d; demo.i++; demo.prev = null;
      }
      if (demo.i >= SEG.length) { stopDemo(); return; }
      var s = SEG[demo.i], u = ease((el - demo.start) / s.d), p = along(s.pts, u);
      if (s.pen) { var q = demo.prev || along(s.pts, 0); stroke(q[0], q[1], p[0], p[1], small); demo.prev = p; demo.u = u; }
      var o = s.pen ? 1 : demo.i === 0 ? u * 0.62 : demo.i === SEG.length - 1 ? 0.62 * (1 - u) : 0.62;
      finger.style.opacity = o.toFixed(2);
      finger.style.transform = 'translate3d(' + p[0].toFixed(1) + 'px,' + p[1].toFixed(1) + 'px,0) rotate(18deg) scale(' + (s.pen ? 1 : 1.12) + ')';
    }
    function stopDemo() { demo = null; finger.style.opacity = 0; tickers.delete(demoTick); }
    new IntersectionObserver(function (en, io) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () {
        if (!fogged || touched || demoDone) return;
        demoDone = true; demo = { t0: 0, i: 0, start: 0, prev: null, u: 0 };
        run(demoTick);
      }, 500);
    }, { threshold: 0.85 }).observe(hole);

    /* Portal: the porthole opens until the sky fills the screen. */
    var top = 0, span = 1, r0 = 100, rMax = 1000, lastY = null, lastOpen = null;
    onMeasure(function () {
      top = wrapEl.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, wrapEl.offsetHeight - stage.offsetHeight);
      rMax = Math.hypot(stage.offsetWidth, stage.offsetHeight) / 2 + 4;
      lastY = null;
      var d = hole.offsetWidth;
      if (!d || d === D) return;
      D = d; r0 = D / 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.height = Math.round(D * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      big = brush(D * 0.085); small = brush(D * 0.036);
      hole.style.setProperty('--fw', (D * 0.115).toFixed(1) + 'px');
      if (!hole.classList.contains('clear')) paint();
    });
    whileVisible(wrapEl, function () {
      var y = window.scrollY;
      if (y === lastY) return;
      lastY = y;
      var p = clamp((y - top) / span, 0, 1);
      var t = ease(ramp(p, 0.2, 0.82));
      var r = r0 * Math.pow(rMax / r0, t);
      var open = t >= 1;
      if (open !== lastOpen || !open) {
        var clip = open ? 'none' : 'circle(' + r.toFixed(1) + 'px at 50% 50%)';
        world.style.webkitClipPath = clip; world.style.clipPath = clip;
        head.style.transform = 'scale(' + (0.42 + 0.58 * t).toFixed(4) + ')';
        head.style.opacity = ramp(t, 0.04, 0.5).toFixed(3);
        ring.style.transform = 'scale(' + (r / r0).toFixed(4) + ')';
        lastOpen = open;
      }
      ring.style.opacity = (1 - ramp(p, 0.5, 0.74)).toFixed(3);
      var o = 1 - ramp(p, 0.12, 0.28);
      out.style.opacity = o.toFixed(3);
      out.style.transform = 'scale(' + (1 + 0.16 * ramp(p, 0.12, 0.4)).toFixed(4) + ')';
      out.style.visibility = o === 0 ? 'hidden' : 'visible';
      canvas.style.opacity = o.toFixed(3);
      if (p > 0.3 && fogged) clear();
    });
  })();

  /* ---------- Chat demo ---------- */
  (function chat() {
    var box = $('#chat');
    var script = [
      ['user', 'Can I get a haircut Friday after 5?'],
      ['bot', 'Friday has 5:30 or 6:15 open with Priya. Which one works?'],
      ['user', '6:15 please'],
      ['bot', 'Booked for 6:15. I will text you a reminder Thursday.']
    ];
    var timer = null;
    function bubble(cls, text) {
      var el = document.createElement('div');
      el.className = 'msg ' + cls;
      el.textContent = text;
      box.appendChild(el);
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('on'); }); });
      return el;
    }
    function play(i) {
      if (i === 0) box.textContent = '';
      if (i >= script.length) { timer = setTimeout(function () { play(0); }, 4200); return; }
      var m = script[i];
      if (m[0] === 'bot') {
        var t = bubble('bot typing', '');
        t.setAttribute('aria-label', 'Assistant is typing');
        t.innerHTML = '<i></i><i></i><i></i>';
        timer = setTimeout(function () { t.remove(); bubble('bot', m[1]); timer = setTimeout(function () { play(i + 1); }, 1300); }, 1100);
      } else {
        bubble('user', m[1]);
        timer = setTimeout(function () { play(i + 1); }, 900);
      }
    }
    if (reduce) { script.forEach(function (m) { bubble(m[0], m[1]).classList.add('on'); }); return; }
    new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && !timer) play(0);
        else if (!e.isIntersecting && timer) { clearTimeout(timer); timer = null; }
      });
    }, { threshold: 0.3 }).observe(box);
  })();

  /* ---------- Content fan ---------- */
  (function fan() {
    var el = $('#fan'), cell = el.closest('.cell');
    if (reduce) { el.classList.add('open'); return; }
    new IntersectionObserver(function (en) {
      en.forEach(function (e) { el.classList.toggle('open', e.isIntersecting); });
    }, { threshold: 0.6 }).observe(el);
    cell.addEventListener('pointerenter', function () { el.classList.remove('open'); });
    cell.addEventListener('pointerleave', function () { el.classList.add('open'); });
  })();

  /* ---------- Inside one build: the stack comes apart as you scroll ---------- */
  (function inside() {
    var section = $('#inside'), stageEl = $('.inside-stage', section), scene = $('#stack-scene'), stack = $('#stack');
    var sheets = $$('.sheet', stack);                      /* bottom to top */
    var caps = $$('.cap', section);                        /* intro, five layers top to bottom, outro */
    if (reduce) return;
    section.classList.add('scrub');
    var GAP = 78, PULL = 84, LIFT = 46, FIRST = 0.22, LAST = 0.88, STEP = (LAST - FIRST) / 5;
    var top = 0, span = 1, fit = 1, lastY = null, mx = 0, my = 0, tmx = 0, tmy = 0, lastCap = -1, lastFocus = -2;
    onMeasure(function () {
      top = section.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, section.offsetHeight - stageEl.offsetHeight);
      fit = clamp(Math.min(scene.offsetWidth / 640, scene.offsetHeight / 560), 0.4, 1.15);
      lastY = null;
    });
    if (fine) section.addEventListener('pointermove', function (e) {
      tmx = e.clientX / window.innerWidth - 0.5; tmy = e.clientY / window.innerHeight - 0.5;
    });
    whileVisible(section, function () {
      var y = window.scrollY;
      var drifting = Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002;
      if (y === lastY && !drifting) return;
      lastY = y;
      mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
      var p = clamp((y - top) / span, 0, 1);
      var close = ease(ramp(p, LAST, 0.98));
      var apart = ease(ramp(p, 0.08, FIRST)) * (1 - close);
      var seg = (p - FIRST) / STEP;
      var focus = p < FIRST || p >= LAST ? -1 : Math.min(4, Math.floor(seg));
      var local = seg - focus;
      var out = focus < 0 ? 0 : ease(ramp(local, 0, 0.28)) * (1 - ease(ramp(local, 0.74, 1)));
      var at = 4 - focus;                                  /* index of the focused sheet */
      for (var i = 0; i < 5; i++) {
        var mine = i === at, above = focus >= 0 && i > at;
        var z = (i - 2) * GAP * apart + (mine ? 10 * out : above ? LIFT * out : 0);
        sheets[i].style.transform = 'translate3d(' + (mine ? PULL * out : 0).toFixed(1) + 'px,0,' + z.toFixed(1) + 'px)';
      }
      if (focus !== lastFocus) {
        sheets.forEach(function (s, i) { s.classList.toggle('focus', focus >= 0 && i === at); s.classList.toggle('ghost', focus >= 0 && i > at); });
        lastFocus = focus;
      }
      var tx = 58 - 30 * close - my * 8;
      var tz = -34 + 30 * ramp(p, 0.08, 0.9) - 4 * close + mx * 10;
      stack.style.setProperty('--sh', (-30 - GAP * 2.3 * apart).toFixed(0) + 'px');
      stack.style.transform = 'scale(' + fit.toFixed(3) + ') rotateX(' + tx.toFixed(2) + 'deg) rotateZ(' + tz.toFixed(2) + 'deg)';
      var c = focus < 0 ? (p < FIRST ? 0 : 6) : focus + 1;
      if (c !== lastCap) { caps.forEach(function (el, i) { el.classList.toggle('on', i === c); }); lastCap = c; }
    });
  })();

  /* ---------- Estimate ---------- */
  var estimate = { team: 6, hours: 8, total: 0 };
  (function calc() {
    var team = $('#r-team'), hours = $('#r-hours'), rate = $('#r-rate');
    var out = { team: $('#o-team'), hours: $('#o-hours'), rate: $('#o-rate') };
    var resH = $('#res-hours'), resM = $('#res-money'), resW = $('#res-weeks'), weeks = $('#weeks');
    for (var i = 0; i < 52; i++) { var c = document.createElement('i'); c.style.setProperty('--k', i); weeks.appendChild(c); }
    var cells = weeks.children;
    var shown = { h: 0, m: 0, w: 0 }, goal = { h: 0, m: 0, w: 0 };
    var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
    function fill(el) { el.style.setProperty('--fill', ((el.value - el.min) / (el.max - el.min) * 100) + '%'); }
    function paint() { resH.textContent = fmt(shown.h); resM.textContent = '$' + fmt(shown.m); resW.textContent = fmt(shown.w); }
    function anim() {
      var done = true;
      ['h', 'm', 'w'].forEach(function (k) {
        var d = goal[k] - shown[k];
        if (Math.abs(d) > 0.5) { shown[k] += d * 0.14; done = false; } else shown[k] = goal[k];
      });
      paint();
      if (done) tickers.delete(anim);
    }
    function update() {
      [team, hours, rate].forEach(fill);
      out.team.textContent = team.value; out.hours.textContent = hours.value; out.rate.textContent = '$' + rate.value;
      goal.h = team.value * hours.value * 48 * 0.6;
      goal.m = goal.h * rate.value;
      goal.w = goal.h / 40;
      estimate = { team: +team.value, hours: +hours.value, total: Math.round(goal.h) };
      var lit = clamp(Math.round(goal.w), 0, 52);
      for (var j = 0; j < 52; j++) cells[j].classList.toggle('on', j < lit);
      if (reduce) { shown.h = goal.h; shown.m = goal.m; shown.w = goal.w; paint(); } else run(anim);
    }
    [team, hours, rate].forEach(function (el) { el.addEventListener('input', update); });
    update();
    if (!reduce) { shown = { h: 0, m: 0, w: 0 }; paint(); tickers.delete(anim); onceVisible($('.result'), function () { run(anim); }); }

    $('#carry').addEventListener('click', function () {
      var msg = $('#f-msg');
      if (!msg.value.trim()) {
        msg.value = 'Our team of ' + estimate.team + ' spends about ' + estimate.hours + ' hours each per week on repeat tasks. Your estimate says around ' +
          estimate.total.toLocaleString('en-US') + ' hours a year could come back.';
      }
    });
  })();

  /* ---------- Process path ---------- */
  (function process() {
    var list = $('#steps'), items = $$('li', list), draw = $('#path-draw'), wps = $$('.wp');
    if (reduce) { draw.style.strokeDashoffset = 0; wps.forEach(function (w) { w.classList.add('lit'); }); items.forEach(function (li) { li.classList.add('active'); }); return; }
    var lastP = -1, lastA = -1;
    whileVisible($('#process'), function () {
      var r = list.getBoundingClientRect(), vh = window.innerHeight;
      var p = ramp(vh * 0.55 - r.top, 0, r.height - vh * 0.25);
      if (Math.abs(p - lastP) > 0.001) {
        draw.style.strokeDashoffset = (1 - p).toFixed(4);
        wps.forEach(function (w, i) { w.classList.toggle('lit', p >= i / (wps.length - 1) - 0.02); });
        lastP = p;
      }
      var a = Math.min(items.length - 1, Math.floor(p * items.length * 0.999));
      if (a !== lastA) { items.forEach(function (li, i) { li.classList.toggle('active', i === a); }); lastA = a; }
    });
  })();

  /* ---------- Things we can build: an object follows the cursor on hover ---------- */
  (function builds() {
    var list = $('#builds'), W = 300;
    $$('.build-row', list).forEach(function (row) {
      row.addEventListener('click', function () {
        setTopic(row.dataset.topic);
        var msg = $('#f-msg');
        if (!msg.value.trim()) msg.value = 'I would like something like your "' + row.dataset.build + '" example.';
      });
    });
    if (!hoverable) {                                      /* touch: each object sits under its row and pops in on scroll */
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
      }, { threshold: 0.4 });
      $$('.obj', list).forEach(function (o) { if (reduce) o.classList.add('on'); else io.observe(o); });
      return;
    }
    var active = null, anchor = null, x = 0, y = 0, tx = 0, ty = 0, rot = 0;
    function aimAtRow(li) {
      var r = li.getBoundingClientRect();
      if (r.bottom < 20 || r.top > window.innerHeight - 20) return false;
      aim(r.left + r.width * 0.5, r.top + r.height / 2 + 130);
      return true;
    }
    function aim(cx, cy) {
      tx = clamp(cx + 28, 16, window.innerWidth - W - 16);
      ty = clamp(cy - 150, 96, window.innerHeight - 250);
    }
    function show(li) {
      var o = li ? $('.obj', li) : null;
      if (o === active) return;
      if (active) active.classList.remove('on');
      active = o;
      if (!o) return;
      x = tx; y = ty; rot = 0;
      o.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      o.classList.add('on');
      run(tick);
    }
    function tick() {
      if (!active) { tickers.delete(tick); return; }
      if (anchor && !aimAtRow(anchor)) { anchor = null; show(null); return; }
      var dx = tx - x, k = reduce ? 1 : 0.16;
      x += dx * k; y += (ty - y) * k;
      rot = reduce ? 0 : rot + (clamp(dx * 0.18, -9, 9) - rot) * 0.2;
      active.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
    }
    list.addEventListener('pointermove', function (e) { anchor = null; aim(e.clientX, e.clientY); show(e.target.closest('.build')); });
    list.addEventListener('pointerleave', function () { if (!anchor) show(null); });
    list.addEventListener('focusin', function (e) {
      var li = e.target.closest('.build');
      if (!li || !e.target.matches(':focus-visible')) return;
      anchor = li;
      if (aimAtRow(li)) show(li);
    });
    list.addEventListener('focusout', function () { anchor = null; show(null); });
  })();

  /* ---------- Pick what eats your week: a globe of tasks you can spin ---------- */
  (function globe() {
    var el = $('#globe'), all = $$('.tile', el), count = $('#pick-count');
    var tiles = [], pts = [], R = 240, ry = 0.5, rx = -0.22, vy = 0, vx = 0, target = null, cur = 0;
    var down = null, dragging = false, swallow = false, hover = false, kbd = false, arrow = false, lastT = 0, lastKey = '', picked = [];

    function label(t) { return t.textContent.trim(); }
    function tray() {
      count.textContent = !picked.length ? 'Nothing picked yet.' :
        picked.length + ' picked: ' + picked.slice(0, 3).join(', ') + (picked.length > 3 ? ' and ' + (picked.length - 3) + ' more' : '') + '.';
    }
    function toggle(t) {
      var on = t.getAttribute('aria-pressed') !== 'true';
      t.setAttribute('aria-pressed', String(on));
      if (on) picked.push(label(t)); else picked = picked.filter(function (n) { return n !== label(t); });
      tray();
    }
    onMeasure(function () {
      var w = el.offsetWidth;
      var n = w < 460 ? 16 : all.length;
      R = Math.min(w * (w < 460 ? 0.36 : 0.39), 290);
      lastKey = '';
      if (n === tiles.length) return;
      tiles = all.slice(0, n);
      all.forEach(function (t, i) {
        t.hidden = i >= n; t.tabIndex = -1;
        if (i >= n && t.getAttribute('aria-pressed') === 'true') toggle(t);
      });
      cur = 0; tiles[0].tabIndex = 0;
      pts = tiles.map(function (_, i) {
        var y = 1 - (i + 0.5) * 2 / n, r = Math.sqrt(1 - y * y), a = i * 2.399963;
        return { x: Math.cos(a) * r, y: y, z: Math.sin(a) * r, back: null };
      });
    });

    function render() {
      var key = ry.toFixed(4) + '/' + rx.toFixed(4) + '/' + R;
      if (key === lastKey) return;
      lastKey = key;
      var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), k = 0.46;
      for (var i = 0; i < tiles.length; i++) {
        var p = pts[i];
        var x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
        var y2 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
        var s = z2 < 0 ? -1 : 1, az = Math.abs(z2) + 0.2;
        tiles[i].style.transform = 'translate(-50%,-50%) translate3d(' + (x1 * R).toFixed(1) + 'px,' + (y2 * R).toFixed(1) + 'px,' + (z2 * R).toFixed(1) + 'px) rotateY(' +
          (Math.atan2(x1, az) * k * s).toFixed(3) + 'rad) rotateX(' + (-Math.atan2(y2, az) * k * s).toFixed(3) + 'rad)';
        var back = z2 < -0.12;
        if (back !== p.back) { p.back = back; tiles[i].classList.toggle('back', back); }
      }
    }
    function tick(t) {
      var dt = Math.min(48, t - (lastT || t)) / 16.67; lastT = t;
      if (!dragging) {
        if (target) {
          var d = Math.atan2(Math.sin(target.ry - ry), Math.cos(target.ry - ry)), k = reduce ? 1 : Math.min(1, 0.14 * dt);
          ry += d * k; rx += (target.rx - rx) * k;
          if (Math.abs(d) < 0.002 && Math.abs(target.rx - rx) < 0.002) target = null;
        } else {
          var drift = reduce || kbd ? 0 : 0.0032 * (hover ? 0.2 : 1);
          ry += (drift + vy) * dt;
          rx += vx * dt + (kbd ? 0 : (-0.22 - rx) * 0.02 * dt);
          vy *= Math.pow(0.94, dt); vx *= Math.pow(0.94, dt);
        }
      }
      render();
    }
    whileVisible(el, tick);

    el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      down = { id: e.pointerId, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, ry: ry, rx: rx };
      target = null; vy = 0; vx = 0;
    });
    el.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== down.id) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragging && Math.hypot(dx, dy) > 6) {
        dragging = true; el.classList.add('dragging');
        try { el.setPointerCapture(down.id); } catch (err) {}
      }
      if (!dragging) return;
      vy = clamp((e.clientX - down.px) * 0.006, -0.2, 0.2); vx = clamp(-(e.clientY - down.py) * 0.006, -0.2, 0.2);
      down.px = e.clientX; down.py = e.clientY;
      ry = down.ry + dx * 0.006; rx = clamp(down.rx - dy * 0.006, -1.1, 1.1);
    });
    function release() {
      if (dragging) { swallow = true; setTimeout(function () { swallow = false; }, 0); }
      dragging = false; down = null; el.classList.remove('dragging');
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    el.addEventListener('pointerleave', function () { hover = false; });
    el.addEventListener('click', function (e) {
      var t = e.target.closest('.tile');
      if (t && !swallow) toggle(t);
    });

    /* Keyboard: one tab stop, arrow keys move between tasks, and the focused task turns to the front. */
    el.addEventListener('keydown', function (e) {
      var t = e.target.closest('.tile');
      if (!t) return;
      var i = tiles.indexOf(t), n = tiles.length, j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j < 0) return;
      e.preventDefault();
      tiles[cur].tabIndex = -1; cur = j; tiles[cur].tabIndex = 0;
      arrow = true; tiles[cur].focus({ preventScroll: true }); arrow = false;
    });
    el.addEventListener('focusin', function (e) {
      var t = e.target.closest('.tile');
      if (!t || !(arrow || t.matches(':focus-visible'))) return;
      var p = pts[tiles.indexOf(t)];
      kbd = true; vy = 0; vx = 0;
      target = { ry: Math.atan2(-p.x, p.z), rx: clamp(Math.atan2(p.y, Math.hypot(p.x, p.z)), -1.1, 1.1) };
    });
    el.addEventListener('focusout', function () { kbd = false; });

    $('#pick-carry').addEventListener('click', function () {
      if (!picked.length) return;
      var msg = $('#f-msg'), line = 'We would love to hand off: ' + picked.join(', ') + '.';
      if (msg.value.indexOf(line) < 0) msg.value = msg.value.trim() ? msg.value.trim() + '\n' + line : line;
    });
  })();

  /* ---------- Final call: the Double Fang particle mark ---------- */
  (function fang() {
    var canvas = $('#fang-field'), ctx = canvas.getContext('2d'), section = $('#contact');
    var FL = new Path2D('M16 20H45C45 47 42 70 37 94C30 70 20 48 16 20Z');
    var FR = new Path2D('M55 20H84C80 48 70 70 63 94C58 70 55 47 55 20Z');
    var P = [], W = 0, H = 0, col = {}, mouse = { x: 0, y: 0, on: false };
    function colors() { col.ink = token('--ink'); col.red = token('--red'); if ((reduce || !fine) && W) draw(); }
    if (DF.onTheme) DF.onTheme(colors);
    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = section.offsetWidth; H = section.offsetHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var wide = W > 900, sec = section.getBoundingClientRect(), copy = $('.cta-copy', section).getBoundingClientRect();
      var above = copy.top - sec.top, below = copy.bottom - sec.top, S, cx, cy;
      if (wide) { S = Math.round(Math.min(H * 0.42, W * 0.24, H - below - 90)); cx = W * 0.27; cy = clamp(H * 0.68, below + 44 + S / 2, H - S / 2 - 44); }
      else { S = 72; cx = copy.left - sec.left + S / 2; cy = above - S / 2 - 14; }
      var room = S >= 64 && cy - S / 2 > 4;
      $('#hint').hidden = !room || reduce || !fine;
      if (!room) { P = []; ctx.clearRect(0, 0, W, H); return; }
      var off = document.createElement('canvas'); off.width = S; off.height = S;
      var o = off.getContext('2d');
      o.scale(S / 100, S / 100); o.fillStyle = '#fff';
      o.fillRect(8, 4, 84, 9); o.fill(FL); o.fill(FR);
      var data = o.getImageData(0, 0, S, S).data, pts = [];
      for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) pts.push([x, y, y < S * 0.14]);
      for (var i = pts.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      pts = pts.slice(0, wide ? 1800 : 700);
      var old = P;
      P = pts.map(function (p, k) {
        var tx = cx - S / 2 + p[0], ty = cy - S / 2 + p[1], q = old[k];
        return { x: q ? q.x : (reduce ? tx : Math.random() * W), y: q ? q.y : (reduce ? ty : Math.random() * H), vx: 0, vy: 0, tx: tx, ty: ty, bar: p[2], s: Math.random() < 0.25 ? 2.2 : 1.6, seed: Math.random() * 6.28 };
      });
      if (reduce || !fine) { P.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); draw(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = col.ink; ctx.globalAlpha = 0.7;
      var hot = [];
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (p.bar || Math.abs(p.vx) + Math.abs(p.vy) > 2) hot.push(p); else ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.fillStyle = col.red; ctx.globalAlpha = 1;
      for (i = 0; i < hot.length; i++) ctx.fillRect(hot[i].x, hot[i].y, hot[i].s + 0.4, hot[i].s + 0.4);
      ctx.globalAlpha = 1;
    }
    function step(t) {
      var time = t * 0.001, R = 130, R2 = R * R;
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        p.vx += (p.tx + Math.sin(time * 0.8 + p.seed) * 1.2 - p.x) * 0.018;
        p.vy += (p.ty + Math.cos(time * 0.7 + p.seed) * 1.2 - p.y) * 0.018;
        if (mouse.on) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) { var d = Math.sqrt(d2), f = (1 - d / R) * 3.2; p.vx += dx / d * f; p.vy += dy / d * f; }
        }
        p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
      }
      draw();
    }
    if (reduce || !fine) $('#hint').hidden = true;
    new IntersectionObserver(function (en, io) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      colors(); build();
      var rt, lastW = W, lastH = H;
      function again() { clearTimeout(rt); rt = setTimeout(function () { if (section.offsetWidth !== lastW || section.offsetHeight !== lastH) { build(); lastW = W; lastH = H; } }, 150); }
      if ('ResizeObserver' in window) new ResizeObserver(again).observe(section); else window.addEventListener('resize', again);
      if (!reduce && fine) whileVisible(section, step);
    }, { rootMargin: '600px 0px' }).observe(section);
    if (reduce || !fine) return;
    section.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; });
    section.addEventListener('pointerleave', function () { mouse.on = false; });
    section.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button, input, select, textarea, label, .form')) return;
      var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      P.forEach(function (p) { var dx = p.x - x, dy = p.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = Math.max(0, 1 - d / 420) * 24 + Math.random() * 2; p.vx += dx / d * f; p.vy += dy / d * f; });
    });
  })();

  /* ---------- Form: checks the fields, then hands the note to the visitor's own email app ---------- */
  (function form() {
    var f = $('#lead-form'), ok = $('#success'), sel = $('#f-topic'), msg = $('#f-msg');
    var labelEl = $('#l-msg'), submitEl = $('#submit-label'), link = $('#mail-link'), copyBtn = $('#mail-copy');
    var TO = $('#mail-text').textContent.trim();
    var base = [labelEl.textContent, msg.placeholder, submitEl.textContent];
    var COPY = {
      cancel: ['Which plan or project is this about?', 'The project name, and whether you want to cancel or ask for a refund.', 'Send request'],
      'delete': ['Anything we should know?', 'For example, another email address you have used with us.', 'Send request']
    };
    sel.addEventListener('change', function () {
      var c = COPY[sel.value] || base;
      labelEl.textContent = c[0]; msg.placeholder = c[1]; submitEl.textContent = c[2];
    });
    var asked = /[?&]topic=([a-z]+)/.exec(window.location.search);
    if (asked) setTopic(asked[1]);

    var rules = {
      name: function (el) { return el.value.trim().length > 1; },
      email: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()); },
      agree: function (el) { return el.checked; }
    };
    var tried = false;
    function check(name) {
      var input = f.elements[name], good = rules[name](input);
      input.setAttribute('aria-invalid', good ? 'false' : 'true');
      $('#e-' + name).hidden = good;
      return good;
    }
    Object.keys(rules).forEach(function (n) {
      f.elements[n].addEventListener(n === 'agree' ? 'change' : 'input', function () { if (tried) check(n); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) { f.elements[bad[0]].focus(); return; }
      var name = f.elements.name.value.trim(), topic = sel.options[sel.selectedIndex].text;
      var body = [
        'Name: ' + name,
        'Email: ' + f.elements.email.value.trim(),
        'About: ' + topic,
        '',
        msg.value.trim() || '(no message)',
        '',
        'I am 18 or older and I agree to the Double Fang privacy policy.',
        'Sent from the form on the Double Fang website.'
      ].join('\n');
      var url = 'mailto:' + TO + '?subject=' + encodeURIComponent('Double Fang: ' + topic) + '&body=' + encodeURIComponent(body);
      link.href = url;
      $('#s-name').textContent = name.split(/\s+/)[0];
      f.hidden = true; ok.hidden = false;
      link.focus();
      if (!window.DF_NO_MAIL) window.location.href = url;
    });
    copyBtn.addEventListener('click', function () {
      function done() { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy address'; }, 1800); }
      function pick() {
        var range = document.createRange(), s = window.getSelection();
        range.selectNodeContents($('#mail-text')); s.removeAllRanges(); s.addRange(range);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(TO).then(done, pick); else pick();
    });
    $('#again').addEventListener('click', function () {
      f.reset(); tried = false;
      sel.dispatchEvent(new Event('change'));
      Object.keys(rules).forEach(function (n) { f.elements[n].removeAttribute('aria-invalid'); $('#e-' + n).hidden = true; });
      ok.hidden = true; f.hidden = false; f.elements.name.focus();
    });
  })();
})();
