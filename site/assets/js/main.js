/* Wok Express
   Plain JS, no dependencies.
   - Hero: fetches the film as a Blob, then scrubs it with scroll in a rAF loop that only runs
     while the hero is on screen, lerps the displayed time, and never overlaps seeks.
   - Order: menu "Add" buttons and the box builder feed one ticket; the form validates inline
     and shows an honest demo success state.
   No scroll event listeners anywhere: the hero reads scrollY inside its rAF loop, everything
   else uses IntersectionObserver. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var smooth = function (e0, e1, x) { var t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var live = $('#live');

  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* ---------- theme ---------- */
  (function theme() {
    var saved = 'system';
    try { saved = localStorage.getItem('wok-theme') || 'system'; } catch (e) { saved = 'system'; }
    $$('.theme-switch input').forEach(function (input) {
      input.checked = input.value === saved;
      input.addEventListener('change', function () {
        if (!input.checked) return;
        if (input.value === 'system') doc.removeAttribute('data-theme');
        else doc.setAttribute('data-theme', input.value);
        try { localStorage.setItem('wok-theme', input.value); } catch (e) { /* storage blocked: theme still applies for this visit */ }
      });
    });
  })();

  /* ---------- nav: mobile menu + active link ---------- */
  (function nav() {
    var burger = $('.burger');
    var overlay = $('#mobile-menu');
    if (!burger || !overlay) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      overlay.classList.toggle('is-open', open);
      doc.style.overflow = open ? 'hidden' : '';
      if (open) {
        var first = $('a', overlay);
        if (first) window.setTimeout(function () { first.focus(); }, 60);
      }
    }
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', overlay).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });

    var links = $$('.nav-links a');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        } else if (link.getAttribute('aria-current') === 'true') {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  })();

  /* ---------- entrances ---------- */
  (function reveals() {
    var items = $$('.reveal');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- hero film ---------- */
  (function hero() {
    var heroEl = $('.hero');
    var video = $('.hero-video');
    var loaderFill = $('.hero-loader .fill');
    if (!heroEl || !video) return;

    // The five gates: any one of them serves the designed still hero instead of the scrub.
    function scrubAllowed() {
      if (reduceMotion.matches) return false;                                              // 1. reduced motion
      if (window.matchMedia('(max-width: 760px)').matches) return false;                    // 2. phones
      if (window.matchMedia('(pointer: coarse) and (max-width: 1100px)').matches) return false; // 3. small touch tablets
      var c = navigator.connection;
      if (c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ''))) return false; // 4. save-data or slow network
      if (location.protocol === 'file:' || !window.fetch || !window.ReadableStream) return false; // 5. no fetch (file://)
      return true;
    }
    if (!scrubAllowed()) return;

    doc.classList.add('is-scrub');

    // band timings as [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] in scroll progress
    var BANDS = [
      [-1, 0, 0.1, 0.16],
      [0.2, 0.26, 0.4, 0.46],
      [0.5, 0.56, 0.7, 0.76],
      [0.82, 0.88, 9, 10]
    ];
    var bands = $$('.band', heroEl).map(function (el, i) {
      return { el: el, t: BANDS[i], opacity: -1, y: -999, visible: null };
    });

    var top = 0;
    var span = 1;
    function measure() {
      var rect = heroEl.getBoundingClientRect();
      top = rect.top + window.scrollY;
      span = Math.max(1, heroEl.offsetHeight - window.innerHeight);
      lastY = -1;
    }

    function writeBands(p) {
      for (var i = 0; i < bands.length; i++) {
        var b = bands[i];
        var inK = smooth(b.t[0], b.t[1], p);
        var outK = smooth(b.t[2], b.t[3], p);
        var o = Math.round(inK * (1 - outK) * 1000) / 1000;
        var y = Math.round(((1 - inK) * 24 - outK * 24) * 10) / 10;
        if (o !== b.opacity || y !== b.y) {
          b.el.style.opacity = String(o);
          b.el.style.transform = 'translate3d(0,' + y + 'px,0)';
          b.opacity = o;
          b.y = y;
        }
        var vis = o > 0.01;
        if (vis !== b.visible) {
          b.el.style.visibility = vis ? 'visible' : 'hidden';
          b.visible = vis;
        }
      }
    }

    // film time follows scroll between 4% and 88% of the section, then rests on the last frame
    function filmProgress(p) { return clamp01((p - 0.04) / 0.84); }

    var duration = 0;
    var ready = false;
    var seeking = false;
    var shown = 0;
    var target = 0;
    var lastY = -1;
    var running = false;

    function frame() {
      if (!running) return;
      var y = window.scrollY;
      if (y !== lastY) {
        lastY = y;
        var p = clamp01((y - top) / span);
        writeBands(p);
        target = filmProgress(p) * duration;
      }
      if (ready) {
        var d = target - shown;
        if (d !== 0) {
          shown += d * 0.16;
          if (Math.abs(target - shown) < 0.004) shown = target;
        }
        if (!seeking && Math.abs(video.currentTime - shown) > 0.01) {
          seeking = true;
          video.currentTime = shown;
        }
      }
      window.requestAnimationFrame(frame);
    }

    video.addEventListener('seeked', function () { seeking = false; });

    measure();
    writeBands(0);
    window.addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(heroEl);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var on = entries[0].isIntersecting;
        if (on && !running) {
          running = true;
          lastY = -1;
          window.requestAnimationFrame(frame);
        } else if (!on) {
          running = false;
        }
      }).observe(heroEl);
    } else {
      running = true;
      window.requestAnimationFrame(frame);
    }

    function setLoader(k) {
      if (loaderFill) loaderFill.style.strokeDashoffset = String(100.53 * (1 - clamp01(k)));
    }

    function fail() {
      doc.classList.remove('film-loading');
      doc.classList.add('film-failed');
      // Near the top, fall back to the plain still hero. Further down, keep the layout so nothing
      // jumps under the reader; the captions keep working over the still.
      if (window.scrollY < window.innerHeight * 0.3) {
        running = false;
        doc.classList.remove('is-scrub');
        bands.forEach(function (b) {
          b.el.style.opacity = '';
          b.el.style.transform = '';
          b.el.style.visibility = '';
        });
      }
    }

    function once(target, type, ms) {
      return new Promise(function (resolve, reject) {
        var timer = window.setTimeout(function () { reject(new Error(type + ' timeout')); }, ms);
        target.addEventListener(type, function handler() {
          window.clearTimeout(timer);
          target.removeEventListener(type, handler);
          resolve();
        });
      });
    }

    var wide = window.innerWidth * (window.devicePixelRatio || 1) > 1700;
    var size = wide ? '1080' : '720';
    // H.264 first (hardware decode, Safari), VP9 WebM for browsers built without H.264.
    var format = video.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4'
      : video.canPlayType('video/webm; codecs="vp9"') ? 'webm' : '';
    if (!format) { fail(); return; }
    var src = video.getAttribute('data-' + format + '-' + size);
    var mime = format === 'mp4' ? 'video/mp4' : 'video/webm';
    doc.classList.add('film-loading');

    fetch(src).then(function (res) {
      if (!res.ok || !res.body) throw new Error('film ' + res.status);
      var total = Number(res.headers.get('content-length')) || 0;
      var reader = res.body.getReader();
      var chunks = [];
      var got = 0;
      function pump() {
        return reader.read().then(function (step) {
          if (step.done) return new Blob(chunks, { type: mime });
          chunks.push(step.value);
          got += step.value.length;
          if (total) setLoader(got / total);
          return pump();
        });
      }
      return pump();
    }).then(function (blob) {
      setLoader(1);
      video.preload = 'auto';
      video.src = URL.createObjectURL(blob);
      return once(video, 'loadeddata', 15000);
    }).then(function () {
      duration = video.duration || 6;
      video.pause();
      shown = target;
      video.currentTime = shown;
      return once(video, 'seeked', 8000);
    }).then(function () {
      ready = true;
      lastY = -1;
      doc.classList.remove('film-loading');
      doc.classList.add('film-ready');
    }).catch(fail);
  })();

  /* ---------- ordering ---------- */
  (function order() {
    var builder = $('#builder');
    var ticket = $('#ticket');
    var form = $('#order-form');
    if (!builder || !ticket || !form) return;

    var BASE_PRICE = 11.5;
    var items = [];
    var received = false;

    var els = {
      lines: $('#ticket-lines'),
      empty: $('#ticket-empty'),
      total: $('#ticket-total'),
      ready: $('#ticket-ready'),
      status: $('#ticket-status'),
      error: $('#ticket-error'),
      no: $('#ticket-no'),
      buildName: $('#build-name'),
      buildDetail: $('#build-detail'),
      buildPrice: $('#build-price'),
      addBox: $('#add-box'),
      done: $('#order-done'),
      doneTitle: $('#done-title'),
      doneText: $('#done-text'),
      newOrder: $('#new-order'),
      navCount: $('.nav-count')
    };

    var money = function (n) { return n.toFixed(2); };

    function newTicketNumber() {
      els.no.textContent = String(200 + Math.floor(Math.random() * 780)).padStart(4, '0');
    }

    function currentBox() {
      var pick = function (name) { return $('input[name="' + name + '"]:checked', builder); };
      var base = pick('base'), protein = pick('protein'), sauce = pick('sauce'), heat = pick('heat');
      var price = BASE_PRICE + Number(protein.getAttribute('data-price') || 0);
      var heatLabel = heat.getAttribute('data-label');
      return {
        key: ['box', base.value, protein.value, sauce.value, heat.value].join('|'),
        name: base.getAttribute('data-label') + ', ' + protein.getAttribute('data-label').toLowerCase(),
        detail: sauce.getAttribute('data-label') + ', ' + heatLabel.charAt(0).toLowerCase() + heatLabel.slice(1),
        price: price
      };
    }

    function renderBuilder() {
      var box = currentBox();
      els.buildName.textContent = box.name;
      els.buildDetail.textContent = box.detail;
      els.buildPrice.textContent = '$' + money(box.price);
    }

    function count() {
      return items.reduce(function (n, it) { return n + it.qty; }, 0);
    }

    function svgIcon(id) {
      return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>';
    }

    function renderTicket() {
      var n = count();
      els.lines.innerHTML = '';
      items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'ticket-line';
        var name = document.createElement('span');
        name.textContent = (it.qty > 1 ? it.qty + ' × ' : '') + it.name;
        var price = document.createElement('span');
        price.textContent = money(it.price * it.qty);
        var detail = document.createElement('span');
        detail.className = 'detail';
        detail.textContent = it.detail || ' ';
        var qty = document.createElement('span');
        qty.className = 'qty';
        qty.innerHTML =
          '<button type="button" data-act="dec" aria-label="Remove one ' + it.name.replace(/"/g, '') + '">' + svgIcon('i-minus') + '</button>' +
          '<output aria-label="Quantity">' + it.qty + '</output>' +
          '<button type="button" data-act="inc" aria-label="Add one more ' + it.name.replace(/"/g, '') + '">' + svgIcon('i-plus') + '</button>';
        qty.querySelectorAll('button').forEach(function (btn) {
          btn.disabled = received;
          btn.addEventListener('click', function () {
            if (btn.getAttribute('data-act') === 'inc') it.qty += 1;
            else it.qty -= 1;
            if (it.qty <= 0) items = items.filter(function (x) { return x !== it; });
            renderTicket();
          });
        });
        li.appendChild(name);
        li.appendChild(price);
        li.appendChild(detail);
        li.appendChild(qty);
        els.lines.appendChild(li);
      });
      els.empty.hidden = n > 0;
      var total = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
      els.total.textContent = money(total);
      var minutes = Math.min(26, 12 + Math.max(0, n - 1) * 2);
      els.ready.textContent = 'Ready in about ' + minutes + ' min';
      if (els.navCount) {
        els.navCount.textContent = String(n);
        els.navCount.classList.toggle('is-on', n > 0);
      }
      if (n > 0) els.error.hidden = true;
    }

    function bump() {
      ticket.classList.remove('is-bump');
      void ticket.offsetWidth;
      ticket.classList.add('is-bump');
    }

    function addItem(entry) {
      if (received) resetOrder(true);
      var existing = items.filter(function (it) { return it.key === entry.key; })[0];
      if (existing) existing.qty += 1;
      else items.push({ key: entry.key, name: entry.name, detail: entry.detail || '', price: entry.price, qty: 1 });
      renderTicket();
      bump();
      announce(entry.name + ' added to your ticket. ' + count() + ' in total.');
    }

    builder.addEventListener('change', renderBuilder);
    els.addBox.addEventListener('click', function () {
      addItem(currentBox());
    });

    $$('.add-btn').forEach(function (btn) {
      var label = $('span', btn);
      var icon = $('use', btn);
      var timer = 0;
      btn.addEventListener('click', function () {
        addItem({
          key: 'dish|' + btn.getAttribute('data-id'),
          name: btn.getAttribute('data-name'),
          detail: '',
          price: Number(btn.getAttribute('data-price'))
        });
        btn.classList.add('is-added');
        label.textContent = 'Added';
        icon.setAttribute('href', '#i-check');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          btn.classList.remove('is-added');
          label.textContent = 'Add';
          icon.setAttribute('href', '#i-plus');
        }, 1400);
      });
    });

    /* form */
    var fields = {
      name: { input: $('#f-name'), error: $('#e-name') },
      phone: { input: $('#f-phone'), error: $('#e-phone') }
    };

    function setError(f, msg) {
      f.error.textContent = msg;
      if (msg) f.input.setAttribute('aria-invalid', 'true');
      else f.input.removeAttribute('aria-invalid');
    }

    function digits(v) { return v.replace(/\D/g, ''); }

    function validate() {
      var ok = true;
      if (!fields.name.input.value.trim()) {
        setError(fields.name, 'Add your name so we can call it out.');
        ok = false;
      } else setError(fields.name, '');
      var d = digits(fields.phone.input.value);
      if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
      if (d.length !== 10) {
        setError(fields.phone, 'Enter a 10-digit mobile number.');
        ok = false;
      } else setError(fields.phone, '');
      return ok;
    }

    Object.keys(fields).forEach(function (k) {
      fields[k].input.addEventListener('blur', function () {
        if (fields[k].input.getAttribute('aria-invalid') === 'true') validate();
      });
      fields[k].input.addEventListener('input', function () {
        if (fields[k].input.getAttribute('aria-invalid') === 'true') validate();
      });
    });

    function timeLabel(minutesFromNow) {
      var t = new Date(Date.now() + minutesFromNow * 60000);
      return t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fieldsOk = validate();
      if (!count()) {
        els.error.textContent = 'Add at least one box to your ticket.';
        els.error.hidden = false;
      }
      if (!fieldsOk) {
        var firstBad = $('[aria-invalid="true"]', form);
        if (firstBad) firstBad.focus();
        return;
      }
      if (!count()) {
        ticket.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      received = true;
      var name = fields.name.input.value.trim();
      var pickup = $('#f-pickup').value;
      var n = count();
      var minutes = Math.min(26, 12 + Math.max(0, n - 1) * 2);
      var when = pickup === 'asap' ? minutes : Number(pickup);
      els.status.innerHTML = '';
      [['Received', timeLabel(0)], ['Pickup', timeLabel(when)]].forEach(function (pair) {
        var row = document.createElement('span');
        row.className = 'ticket-row';
        var a = document.createElement('span');
        a.textContent = pair[0];
        var b = document.createElement('span');
        b.textContent = pair[1];
        row.appendChild(a);
        row.appendChild(b);
        els.status.appendChild(row);
      });
      els.status.hidden = false;
      ticket.classList.add('is-received');
      $$('button', els.lines).forEach(function (b) { b.disabled = true; });
      form.hidden = true;
      els.doneTitle.textContent = 'Order received, ' + name + '.';
      els.done.hidden = false;
      els.doneTitle.focus();
      announce('Order received. This is a demo, so nothing will be cooked.');
    });

    function resetOrder(clearItems) {
      received = false;
      if (clearItems) items = [];
      ticket.classList.remove('is-received');
      els.status.hidden = true;
      els.done.hidden = true;
      form.hidden = false;
      form.reset();
      setError(fields.name, '');
      setError(fields.phone, '');
      newTicketNumber();
      renderTicket();
    }

    els.newOrder.addEventListener('click', function () {
      resetOrder(true);
      fields.name.input.focus();
      announce('New ticket started.');
    });

    newTicketNumber();
    renderBuilder();
    renderTicket();
  })();
})();
