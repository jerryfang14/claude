(function () {
  'use strict';

  var root = document.documentElement;
  var mm = function (q) { return window.matchMedia(q).matches; };
  var reduce = mm('(prefers-reduced-motion: reduce)');
  var fine = mm('(pointer: fine)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ramp = function (v, a, b) { return b === a ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a), 0, 1); };
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

  /* ---------- Theme: System / Light / Dark ---------- */
  var themeHooks = [];
  var sysLight = window.matchMedia('(prefers-color-scheme: light)');
  function storedTheme() { try { return localStorage.getItem('df-theme') || 'dark'; } catch (e) { return 'dark'; } }
  function applyTheme(choice) {
    var resolved = choice === 'system' ? (sysLight.matches ? 'light' : 'dark') : choice;
    root.setAttribute('data-theme', resolved);
    themeHooks.forEach(function (fn) { fn(); });
  }
  $$('.theme-switch input').forEach(function (r) {
    r.checked = r.value === storedTheme();
    r.addEventListener('change', function () {
      try { localStorage.setItem('df-theme', r.value); } catch (e) {}
      applyTheme(r.value);
    });
  });
  sysLight.addEventListener('change', function () { if (storedTheme() === 'system') applyTheme('system'); });

  /* ---------- Menu ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) setTimeout(function () { $('a', menu).focus(); }, 80);
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
  });

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav-links a');
  var navIO = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) navIO.observe(s); });

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
  $$('.work').forEach(function (w) { tilt(w, w, 8); });

  /* ---------- Hero: the site that builds itself ---------- */
  (function hero() {
    var section = $('.hero');
    var bands = $$('.band', section);
    var bandBtn = $('[data-band="3"] .btn', section);
    var pieces = $$('.piece', section);
    var browser = $('#browser');
    var promptEl = $('#prompt-text'), statusEl = $('#status-text'), pctEl = $('#status-pct'), urlEl = $('#url-text');
    var PROMPT = 'Build a site for Northside Roofing. Goal: more inspection bookings.';
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
      if (live !== last.live) { browser.classList.toggle('live', live); urlEl.textContent = live ? 'https://northside-roofing.com' : 'northside-roofing.com'; last.live = live; }
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
    function measure() {
      top = section.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, section.offsetHeight - window.innerHeight);
      lastY = null;
    }
    measure();
    window.addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
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
    function wrap(node, em) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w' + (em ? ' em' : '');
            s.textContent = part;
            frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) wrap(ch, em || ch.classList.contains('em-group'));
      });
    }
    wrap(el, false);
    if (reduce) { words.forEach(function (w) { w.classList.add('lit'); }); return; }
    var lastN = -1;
    whileVisible(el, function () {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = ramp(vh * 0.85 - r.top, 0, r.height + vh * 0.35);
      var n = Math.round(p * words.length);
      if (n === lastN) return;
      words.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      lastN = n;
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

  /* ---------- Example builds: horizontal pan on desktop ---------- */
  (function pan() {
    var section = $('#work'), track = $('#track');
    var can = !reduce && fine && !mm('(max-width: 900px)');
    if (!can) return;
    section.classList.add('scrub');
    var dist = 0, lastX = null;
    function measure() {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.height = (window.innerHeight + dist) + 'px';
      lastX = null;
    }
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    whileVisible(section, function () {
      var r = section.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      var x = Math.round(-p * dist);
      if (x !== lastX) { track.style.transform = 'translate3d(' + x + 'px,0,0)'; lastX = x; }
    });
  })();

  /* ---------- Final call: the Double Fang particle mark ---------- */
  (function fang() {
    var canvas = $('#fang-field'), ctx = canvas.getContext('2d'), section = $('#contact');
    var FL = new Path2D('M16 20H45C45 47 42 70 37 94C30 70 20 48 16 20Z');
    var FR = new Path2D('M55 20H84C80 48 70 70 63 94C58 70 55 47 55 20Z');
    var P = [], W = 0, H = 0, col = {}, mouse = { x: 0, y: 0, on: false };
    function colors() { col.ink = token('--ink'); col.ember = token('--ember'); if ((reduce || !fine) && W) draw(); }
    themeHooks.push(colors);
    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = section.offsetWidth; H = section.offsetHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var wide = W > 900;
      var S = Math.round(wide ? Math.min(H * 0.5, W * 0.26) : Math.min(W * 0.5, 260));
      var cx = wide ? W * 0.27 : W * 0.72, cy = wide ? H * 0.7 : S * 0.55 + 24;
      var off = document.createElement('canvas'); off.width = S; off.height = S;
      var o = off.getContext('2d');
      o.scale(S / 100, S / 100); o.fillStyle = '#fff';
      o.fillRect(8, 4, 84, 9); o.fill(FL); o.fill(FR);
      var data = o.getImageData(0, 0, S, S).data, pts = [];
      for (var y = 0; y < S; y += 2) for (var x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) pts.push([x, y, y < S * 0.14]);
      for (var i = pts.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
      pts = pts.slice(0, wide ? 1800 : 800);
      var old = P;
      P = pts.map(function (p, k) {
        var tx = cx - S / 2 + p[0], ty = cy - S / 2 + p[1], q = old[k];
        return { x: q ? q.x : (reduce ? tx : Math.random() * W), y: q ? q.y : (reduce ? ty : Math.random() * H), vx: 0, vy: 0, tx: tx, ty: ty, bar: p[2], s: Math.random() < 0.2 ? 2 : 1.4, seed: Math.random() * 6.28 };
      });
      if (reduce || !fine) { P.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); draw(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = col.ink; ctx.globalAlpha = 0.55;
      var hot = [];
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (p.bar || Math.abs(p.vx) + Math.abs(p.vy) > 2) hot.push(p); else ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.fillStyle = col.ember; ctx.globalAlpha = 0.95;
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
      var rt;
      window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
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

  /* ---------- Form ---------- */
  (function form() {
    var f = $('#lead-form'), ok = $('#success');
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    };
    var tried = false;
    function check(name) {
      var input = f.elements[name], good = rules[name](input.value);
      input.setAttribute('aria-invalid', good ? 'false' : 'true');
      $('#e-' + name).hidden = good;
      return good;
    }
    Object.keys(rules).forEach(function (n) { f.elements[n].addEventListener('input', function () { if (tried) check(n); }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) { f.elements[bad[0]].focus(); return; }
      $('#s-name').textContent = f.elements.name.value.trim().split(/\s+/)[0];
      f.hidden = true; ok.hidden = false;
      $('#again').focus();
    });
    $('#again').addEventListener('click', function () {
      f.reset(); tried = false;
      Object.keys(rules).forEach(function (n) { f.elements[n].removeAttribute('aria-invalid'); $('#e-' + n).hidden = true; });
      ok.hidden = true; f.hidden = false; f.elements.name.focus();
    });
  })();

  $('#year').textContent = new Date().getFullYear();
})();
