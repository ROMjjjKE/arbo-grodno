/* ARBO GRODNO MAN — меню, схема валки, объём работ, заявка */
(function () {
  'use strict';
  var WA = 'https://wa.me/375295840536';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- шапка ---------- */
  var head = document.querySelector('.head');
  function onScroll() {
    if (!head) return;
    head.classList.toggle('is-stuck', window.scrollY > 30 || head.classList.contains('head--solid'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- меню ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var closeBtn = document.getElementById('drawer-close');
  var lastFocus = null;
  function focusables() {
    if (!drawer) return [];
    return Array.prototype.slice.call(drawer.querySelectorAll('a[href],button:not([disabled]),input,select,textarea'))
      .filter(function (el) { return el.offsetParent !== null; });
  }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = focusables(); if (f.length) f[0].focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', function () { (drawer && drawer.hidden) ? openDrawer() : closeDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('is-locked');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
  });

  /* ---------- появление ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('is-in'); }); }

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  /* ---------- схема валки ---------- */
  var svg = document.getElementById('treeSvg');
  if (svg) {
    var hIn = document.getElementById('hHeight'), dIn = document.getElementById('hDist');
    var hOut = document.getElementById('hOut'), dOut = document.getElementById('dOut');
    var oMethod = document.getElementById('o-method'), oSections = document.getElementById('o-sections');
    var oZone = document.getElementById('o-zone'), oClimb = document.getElementById('o-climb');
    var oVerdict = document.getElementById('o-verdict'), send = document.getElementById('tree-send');
    var obs = 'open';
    var GROUND = 420;

    var NAMES = { open: 'открытый двор', house: 'дом', power: 'ЛЭП', road: 'дорога' };
    var NEAR = { open: 'двору', house: 'дому', power: 'ЛЭП', road: 'дороге' };
    var GEN = { open: 'двора', house: 'дома', power: 'ЛЭП', road: 'дороги' };

    function drawTree() {
      var H = parseFloat(hIn.value), D = parseFloat(dIn.value);
      var s = 11;                         /* 11 px на метр: 30 м = 330 px */
      var zoneM = Math.round(H * 0.85);
      var free = obs === 'open' || D >= zoneM;
      var sections = free ? 1 : Math.max(2, Math.ceil(H / 2.5));
      var climb = (free || H <= 6) ? 'с земли' : 'альпинист';

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      var cx = 168, ground = GROUND, top = ground - H * s, trunkW = Math.max(6, Math.min(16, H * 0.55));

      /* земля */
      svg.appendChild(el('line', { x1: 20, y1: ground, x2: 620, y2: ground, stroke: 'rgba(242,236,225,.4)', 'stroke-width': 1.4 }));
      for (var gx = 20; gx < 620; gx += 14) {
        svg.appendChild(el('line', { x1: gx, y1: ground + 6, x2: gx + 7, y2: ground - 1, stroke: 'rgba(242,236,225,.18)', 'stroke-width': 1 }));
      }

      /* зона падения */
      var zr = zoneM * s;
      svg.appendChild(el('path', {
        d: 'M' + cx + ' ' + ground + ' L' + (cx + zr) + ' ' + ground + ' A' + zr + ' ' + zr + ' 0 0 0 ' + cx + ' ' + (ground - zr) + ' Z',
        fill: 'rgba(193,70,42,.14)', stroke: 'rgba(193,70,42,.55)', 'stroke-width': 1.2, 'stroke-dasharray': '6 6'
      }));
      svg.appendChild(el('text', { x: cx + 8, y: ground - 10 }, 'зона падения ' + zoneM + ' м'));

      /* ствол */
      svg.appendChild(el('polygon', {
        points: [cx - trunkW / 2, ground, cx + trunkW / 2, ground, cx + trunkW / 3, top + 14, cx - trunkW / 3, top + 14].join(' '),
        fill: '#6F6254', stroke: '#8C7C6B', 'stroke-width': 1
      }));

      /* крона */
      var cw = Math.max(26, 20 + H * 3.4);
      svg.appendChild(el('ellipse', { cx: cx, cy: top + cw * 0.5, rx: cw * 0.62, ry: cw * 0.62, fill: 'rgba(92,97,73,.55)', stroke: 'rgba(146,152,118,.75)', 'stroke-width': 1.2 }));
      svg.appendChild(el('ellipse', { cx: cx - cw * 0.3, cy: top + cw * 0.8, rx: cw * 0.36, ry: cw * 0.34, fill: 'rgba(92,97,73,.5)', stroke: 'rgba(146,152,118,.5)', 'stroke-width': 1 }));
      svg.appendChild(el('ellipse', { cx: cx + cw * 0.32, cy: top + cw * 0.86, rx: cw * 0.34, ry: cw * 0.32, fill: 'rgba(92,97,73,.5)', stroke: 'rgba(146,152,118,.5)', 'stroke-width': 1 }));
      if (H > 8) {
        svg.appendChild(el('ellipse', { cx: cx, cy: top + cw * 0.18, rx: cw * 0.4, ry: cw * 0.36, fill: 'rgba(92,97,73,.45)', stroke: 'rgba(146,152,118,.45)', 'stroke-width': 1 }));
      }

      /* секции валки */
      if (sections > 1) {
        for (var i = 1; i < sections; i++) {
          var y = ground - (H * s) * (i / sections);
          svg.appendChild(el('line', { x1: cx - trunkW - 5, y1: y, x2: cx + trunkW + 5, y2: y, stroke: '#C1462A', 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }));
          if (sections <= 9) svg.appendChild(el('text', { x: cx + trunkW + 10, y: y + 3 }, String(i)));
        }
      }

      /* препятствие */
      var ox = cx + D * s;
      if (obs === 'house') {
        svg.appendChild(el('polygon', { points: ox + ',' + ground + ' ' + ox + ',' + (ground - 78) + ' ' + (ox + 62) + ',' + (ground - 78) + ' ' + (ox + 62) + ',' + ground, fill: '#2E2721', stroke: 'rgba(242,236,225,.5)', 'stroke-width': 1.2 }));
        svg.appendChild(el('polygon', { points: ox - 8 + ',' + (ground - 78) + ' ' + (ox + 31) + ',' + (ground - 112) + ' ' + (ox + 70) + ',' + (ground - 78), fill: 'none', stroke: 'rgba(242,236,225,.5)', 'stroke-width': 1.2 }));
        svg.appendChild(el('text', { x: ox + 31, y: ground - 118, 'text-anchor': 'middle' }, 'дом'));
      } else if (obs === 'power') {
        svg.appendChild(el('line', { x1: ox + 12, y1: ground, x2: ox + 12, y2: ground - 132, stroke: 'rgba(242,236,225,.7)', 'stroke-width': 2 }));
        svg.appendChild(el('line', { x1: ox - 20, y1: ground - 118, x2: ox + 44, y2: ground - 118, stroke: 'rgba(242,236,225,.7)', 'stroke-width': 2 }));
        [ox - 18, ox + 12, ox + 42].forEach(function (x) {
          svg.appendChild(el('path', { d: 'M' + x + ' ' + (ground - 118) + ' Q' + (x + 26) + ' ' + (ground - 96) + ' ' + (x + 52) + ' ' + (ground - 118), fill: 'none', stroke: '#E8794F', 'stroke-width': 1, opacity: '.7' }));
        });
        svg.appendChild(el('text', { x: ox + 12, y: ground - 146, 'text-anchor': 'middle' }, 'ЛЭП'));
      } else if (obs === 'road') {
        svg.appendChild(el('rect', { x: ox - 20, y: ground - 16, width: 120, height: 16, fill: '#2E2721', stroke: 'rgba(242,236,225,.35)', 'stroke-width': 1 }));
        for (var rx = ox - 8; rx < ox + 96; rx += 26) {
          svg.appendChild(el('line', { x1: rx, y1: ground - 8, x2: rx + 12, y2: ground - 8, stroke: 'rgba(242,236,225,.55)', 'stroke-width': 1.6 }));
        }
        svg.appendChild(el('text', { x: ox + 40, y: ground - 22, 'text-anchor': 'middle' }, 'дорога'));
      } else {
        svg.appendChild(el('text', { x: ox, y: ground - 10, 'text-anchor': 'middle' }, 'свободно'));
      }

      /* размер высоты */
      svg.appendChild(el('line', { x1: 60, y1: top, x2: 60, y2: ground, stroke: 'rgba(242,236,225,.45)', 'stroke-width': 1 }));
      [top, ground].forEach(function (y) {
        svg.appendChild(el('line', { x1: 53, y1: y, x2: 67, y2: y, stroke: '#C1462A', 'stroke-width': 1.4 }));
      });
      var tv = el('text', { x: 50, y: (top + ground) / 2, 'text-anchor': 'middle' }, 'H ' + H + ' м');
      tv.setAttribute('transform', 'rotate(-90 50 ' + ((top + ground) / 2) + ')');
      svg.appendChild(tv);

      /* расстояние */
      if (obs !== 'open') {
        var dy = ground + 30;
        svg.appendChild(el('line', { x1: cx, y1: dy, x2: ox, y2: dy, stroke: 'rgba(242,236,225,.45)', 'stroke-width': 1 }));
        [cx, ox].forEach(function (x) {
          svg.appendChild(el('line', { x1: x, y1: dy - 6, x2: x, y2: dy + 6, stroke: '#C1462A', 'stroke-width': 1.3 }));
        });
        svg.appendChild(el('text', { x: (cx + ox) / 2, y: dy + 18, 'text-anchor': 'middle' }, D + ' м до ' + (obs === 'power' ? 'ЛЭП' : obs === 'house' ? 'дома' : 'дороги')));
      }

      /* числа */
      hOut.textContent = H + ' м';
      dOut.textContent = D + ' м';
      oMethod.textContent = free ? 'целиком' : 'по частям';
      oSections.textContent = sections;
      oZone.textContent = zoneM + ' м';
      oClimb.textContent = climb;

      var v;
      if (free && obs === 'power') v = 'До ЛЭП ' + D + ' м, это дальше зоны падения: валим целиком в противоположную сторону, с оттяжкой.';
      else if (free) v = obs === 'open'
        ? 'Места хватает: дерево валим целиком, зона ' + zoneM + ' м свободна.'
        : 'Места хватает: до ' + GEN[obs] + ' ' + D + ' м, зона падения ' + zoneM + ' м — валим целиком.';
      else if (obs === 'power') v = 'Рядом ЛЭП (ближе зоны падения): снимаем по секциям с подвесом веток, порядок работ согласуем заранее.';
      else if (D < 3) v = 'Дерево почти вплотную к ' + NEAR[obs] + ': валим по частям с оттяжкой, чтобы ничего не задеть.';
      else v = 'Дерево выше расстояния до ' + GEN[obs] + ' — валим по частям с подвесом, ' + sections + ' секций.';
      oVerdict.textContent = v;

      send.href = WA + '?text=' + encodeURIComponent(
        'Дерево с сайта\nВысота: ' + H + ' м\nЧто рядом: ' + NAMES[obs] + '\nРасстояние: ' + D + ' м' +
        '\nМетод по расчёту: ' + (free ? 'валка целиком' : 'по частям, ' + sections + ' секций') +
        '\nХочу уточнить стоимость и время.');
    }

    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-obs]'));
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        chips.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        obs = b.getAttribute('data-obs');
        if (obs === 'open') { dIn.value = Math.max(parseFloat(dIn.value), 6); }
        drawTree();
      });
    });
    [hIn, dIn].forEach(function (i) { i.addEventListener('input', drawTree); });
    drawTree();
  }

  /* ---------- объём работ ---------- */
  var calcRows = document.querySelectorAll('[data-step]');
  if (calcRows.length) {
    var UNITS = { tree: 'шт.', prune: 'шт.', mow: 'соток', wood: 'м³' };
    var TITLES = { tree: 'деревья', prune: 'обрезка', mow: 'покос', wood: 'дрова' };
    var MAX = { tree: 20, prune: 20, mow: 100, wood: 20 };
    var vals = { tree: 0, prune: 0, mow: 0, wood: 0 };
    var list = document.getElementById('calcList');
    var emptyEl = document.getElementById('calcEmpty');
    var calcSend = document.getElementById('calcSend');

    function stepFor(k) { return k === 'mow' ? 5 : 1; }

    function refreshCalc() {
      var parts = [];
      Object.keys(vals).forEach(function (k) {
        var out = document.getElementById('c-' + k);
        if (out) out.textContent = vals[k] + ' ' + UNITS[k];
        if (vals[k] > 0) parts.push([TITLES[k], vals[k] + ' ' + UNITS[k]]);
      });

      while (list.firstChild) list.removeChild(list.firstChild);
      parts.forEach(function (p) {
        var li = document.createElement('li');
        var name = document.createElement('span');
        name.textContent = p[0];
        var num = document.createElement('b');
        num.textContent = p[1];
        li.appendChild(name); li.appendChild(num);
        list.appendChild(li);
      });
      emptyEl.hidden = parts.length > 0;

      calcRows.forEach(function (btn) {
        var k = btn.getAttribute('data-step'), dir = parseInt(btn.getAttribute('data-dir'), 10);
        btn.disabled = dir < 0 ? vals[k] <= 0 : vals[k] >= MAX[k];
      });

      var text;
      if (parts.length) {
        text = 'Заявка с сайта. Объём работ:\n— ' + parts.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n— ') +
          '\nПодскажите стоимость и когда сможете приехать.';
      } else {
        text = 'Заявка с сайта. Нужна консультация по удалению деревьев: подскажите стоимость и время выезда.';
      }
      calcSend.href = WA + '?text=' + encodeURIComponent(text);
    }

    calcRows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-step');
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        var next = vals[k] + dir * stepFor(k);
        vals[k] = Math.max(0, Math.min(MAX[k], next));
        refreshCalc();
      });
    });
    refreshCalc();
  }

  /* ---------- заявка ---------- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (sel) { var f = form.querySelector(sel); return f ? f.value : ''; };
      var name = g('#f-name'), phone = g('#f-phone'), what = g('#f-what'), obj = g('#f-obj'), note = g('#f-note');
      var ok = form.querySelector('.form__ok');
      if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 9) {
        if (ok) { ok.hidden = false; ok.textContent = 'Укажите имя и телефон, чтобы мы могли ответить.'; }
        return;
      }
      var text = 'Заявка на выезд\nИмя: ' + name.trim() + '\nТелефон: ' + phone.trim() +
        (what ? '\nЧто нужно: ' + what : '') + (obj ? '\nГде объект: ' + obj : '') +
        (note.trim() ? '\nКомментарий: ' + note.trim() : '');
      var url = WA + '?text=' + encodeURIComponent(text);
      if (ok) {
        ok.hidden = false;
        ok.innerHTML = 'Заявка собрана. Если WhatsApp не открылся, <a href="' + url + '" target="_blank" rel="noopener">нажмите здесь</a>. Фото дерева можно приложить в чате.';
      }
      window.open(url, '_blank', 'noopener');
    });
  }
})();
