(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- живой статус в шапке: Пн–Пт 09:00–18:00 по Москве ---------- */
  var statusBox = $('[data-status-box]');
  if (statusBox) {
    var tick = function () {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', hour12: false })
        .formatToParts(new Date());
      var day = parts.filter(function (p) { return p.type === 'weekday'; })[0].value;
      var hour = parseInt(parts.filter(function (p) { return p.type === 'hour'; })[0].value, 10) % 24;
      var open = ['Sat', 'Sun'].indexOf(day) === -1 && hour >= 9 && hour < 18;
      statusBox.classList.toggle('is-off', !open);
      $('[data-status]', statusBox).textContent = open ? 'На связи, ответим за 30 минут' : 'Ответим утром, с 9:00';
    };
    tick();
    setInterval(tick, 60000);
  }

  /* ---------- шапка: тень при прокрутке ---------- */
  var header = $('[data-header]');
  var onScroll = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- меню «Ещё» и бургер ---------- */
  var moreBtn = $('[data-more-btn]');
  var moreList = $('#more-menu');
  var closeMore = function () {
    if (!moreBtn) return;
    moreBtn.setAttribute('aria-expanded', 'false'); moreList.hidden = true;
  };
  if (moreBtn) {
    moreBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = moreBtn.getAttribute('aria-expanded') === 'true';
      moreBtn.setAttribute('aria-expanded', String(!open)); moreList.hidden = open;
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('[data-more]')) closeMore(); });
  }

  var burger = $('[data-burger]');
  var drawer = $('[data-drawer]');
  var closeDrawer = function () {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false'); drawer.hidden = true;
  };
  if (burger) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open)); drawer.hidden = open;
    });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeDrawer); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1240) closeDrawer(); });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMore(); closeDrawer(); } });

  /* ---------- окно «Заказать звонок»: одно на все кнопки ---------- */
  var modal = $('[data-modal]');
  var form = $('[data-modal-form]');
  var errBox = $('[data-modal-error]');
  var defTitle = $('[data-modal-title]') ? $('[data-modal-title]').textContent : '';
  var defText = $('[data-modal-text]') ? $('[data-modal-text]').textContent : '';

  var openModal = function (btn) {
    if (!modal || typeof modal.showModal !== 'function') return;
    form.classList.remove('is-sent'); errBox.hidden = true;
    $('[data-modal-title]').textContent = btn.getAttribute('data-callback-title') || defTitle;
    $('[data-modal-text]').textContent = btn.getAttribute('data-callback-text') || defText;
    closeDrawer();
    modal.showModal();
    document.body.classList.add('is-locked');
  };
  $$('[data-callback-open]').forEach(function (b) { b.addEventListener('click', function () { openModal(b); }); });
  if (modal) {
    var shut = function () { modal.close(); };
    $('[data-modal-close]').addEventListener('click', shut);
    modal.addEventListener('close', function () { document.body.classList.remove('is-locked'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) shut(); });
  }

  /* маска телефона: +7 (999) 000-00-00 — одна на все формы */
  $$('[data-phone]').forEach(function (phone) {
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '');
      if (d[0] === '8' || d[0] === '7') d = d.slice(1);
      d = d.slice(0, 10);
      var s = d.length ? '+7 (' + d.slice(0, 3) : '';
      if (d.length >= 3) s += ') ' + d.slice(3, 6);
      if (d.length >= 6) s += '-' + d.slice(6, 8);
      if (d.length >= 8) s += '-' + d.slice(8, 10);
      phone.value = s;
    });
  });

  /* кнопка «Отправить» — обычная кнопка, не submit: в изолированной рамке форма не уходит */
  var submit = $('[data-modal-submit]');
  if (submit) {
    submit.addEventListener('click', function () {
      var name = form.elements.name.value.trim();
      var digits = form.elements.phone.value.replace(/\D/g, '');
      var msg = '';
      if (!name) msg = 'Укажите имя';
      else if (digits.length !== 11) msg = 'Введите телефон полностью';
      else if (!form.elements.consent.checked || !form.elements.policy.checked) msg = 'Отметьте обе галочки — без них заявку не отправить';
      errBox.hidden = !msg; errBox.textContent = msg;
      if (msg) return;
      // TODO: отправка на POST /api/lead (формат полей — раздел 11 мастер-промта)
      if (window.console) console.log('lead', { name: name, contact: form.elements.phone.value });
      form.classList.add('is-sent');
      $('[data-modal-title]').textContent = 'Заявка принята';
      $('[data-modal-text]').textContent = 'Перезвоним в рабочее время, с 9:00 до 18:00 по Москве.';
    });
  }

  /* ---------- липкая кнопка на телефоне: прячется, пока видна кнопка в первом экране ---------- */
  var sticky = $('[data-sticky]');
  var heroBtn = $('.hero__cta .btn-pill');
  var quizBox = $('#quiz');
  var inView = function (el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };
  if (sticky && heroBtn) {
    var update = function () {
      // прячем, пока на экране есть своя кнопка или сам опрос
      sticky.classList.toggle('is-visible', !inView(heroBtn) && !inView(quizBox) && !inView($('.pcard__cta .btn-pill')));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- опрос: 4 вопроса о нагрузке и контакт ---------- */
  var quiz = $('[data-quiz]');
  if (quiz) {
    var qform = $('[data-quiz-form]', quiz);
    var qsteps = $$('.qstep', quiz);
    var qbar = $('[data-quiz-bar]', quiz);
    var qn = $('[data-quiz-n]', quiz);
    var qnext = $('[data-quiz-next]', quiz);
    var qnextText = $('[data-quiz-next-text]', quiz);
    var qback = $('[data-quiz-back]', quiz);
    var qerr = $('[data-quiz-error]', quiz);
    var qdone = $('[data-quiz-done]', quiz);
    var mgr = $('[data-manager-text]', quiz);
    var kwInput = $('#quiz-kw', quiz);
    var cur = 0;
    var last = qsteps.length - 1;

    var replies = [
      'Расскажите об объекте: от него зависят мощность ИБП и схема подключения.',
      'Отметьте нагрузки, которые резервируем. По перечню рассчитаем суммарную мощность и ёмкость АКБ.',
      'Мощность — главный параметр. Если точных данных нет, выберите «Не знаю»: рассчитаем по перечню потребителей.',
      'Чем больше время автономной работы, тем выше ёмкость АКБ. Подберём оптимум под вашу нагрузку.',
      'Остался контакт. Расчёт отправлю тем способом связи, который вы выберете.'
    ];
    // TODO: подтвердить у заказчика нижнюю границу мощности (сейчас 15 кВт)
    var softFilter = 'Мы специализируемся на системах от 15 кВт — это наш профиль. Заявку всё равно приму и подскажу решение.';

    var checked = function (name) { return $$('input[name="' + name + '"]:checked', qform); };
    var one = function (name) { var c = checked(name)[0]; return c ? c.value : ''; };
    var kw = function () { return parseFloat((kwInput.value || '').replace(',', '.')) || 0; };
    var phoneOk = function () { return form_digits() === 11; };
    var form_digits = function () { return qform.elements.phone.value.replace(/\D/g, '').length; };

    var valid = function (i) {
      if (i === 0) return !!one('object');
      if (i === 1) return checked('loads').length > 0;
      if (i === 2) return !!one('power') || kw() > 0;
      if (i === 3) return !!one('autonomy');
      return true;
    };
    var finalProblem = function () {
      if (!qform.elements.name.value.trim()) return 'Укажите имя';
      if (!phoneOk()) return 'Введите телефон полностью';
      if (!qform.elements.consent.checked || !qform.elements.policy.checked) return 'Отметьте обе галочки — без них заявку не отправить';
      return '';
    };

    var say = function (t) {
      mgr.textContent = t;
      mgr.classList.remove('is-swap'); void mgr.offsetWidth; mgr.classList.add('is-swap');
    };
    var powerSmall = function () { return one('power') === 'До 15 кВт' || (kw() > 0 && kw() < 15); };

    var render = function () {
      qsteps.forEach(function (s, i) { s.hidden = i !== cur; });
      qbar.style.width = ((cur + 1) / qsteps.length * 100) + '%';
      qn.textContent = cur + 1;
      qback.hidden = cur === 0;
      qnextText.textContent = cur === last ? 'Получить расчёт' : 'Далее';
      qnext.disabled = cur < last && !valid(cur);
      qerr.hidden = true;
      say(cur === 2 && powerSmall() ? softFilter : replies[cur]);
    };
    var refresh = function () {
      qnext.disabled = cur < last && !valid(cur);
      if (cur === 2) say(powerSmall() ? softFilter : replies[2]);
    };

    qform.addEventListener('change', function (e) {
      if (e.target.name === 'power') kwInput.value = '';
      refresh();
    });
    kwInput.addEventListener('input', function () {
      if (kwInput.value) $$('input[name="power"]', qform).forEach(function (r) { r.checked = false; });
      refresh();
    });
    qback.addEventListener('click', function () { if (cur > 0) { cur--; render(); } });

    var finish = function () {
      var power = kw() > 0 ? String(kw()).replace('.', ',') + ' кВт' : one('power');
      var loads = checked('loads').map(function (c) { return c.value; });
      var sum = {
        object: one('object'),
        loads: loads.join(', '),
        power: power,
        autonomy: one('autonomy')
      };
      Object.keys(sum).forEach(function (k) { $('[data-sum="' + k + '"]', quiz).textContent = sum[k]; });
      // TODO: отправка на POST /api/lead; формат — раздел 11 мастер-промта (поля name, contact, service, answers[])
      var lead = {
        type: 'service', name: qform.elements.name.value.trim(), contact: qform.elements.phone.value,
        service: 'Опрос по ИБП',
        answers: [
          { label: 'Объект', value: sum.object }, { label: 'Нагрузки', value: sum.loads },
          { label: 'Мощность', value: sum.power }, { label: 'Автономная работа', value: sum.autonomy },
          { label: 'Способ связи', value: one('channel') || 'не указан' }, { label: 'Срок установки', value: one('when') || 'не указан' }
        ],
        consent: true
      };
      if (window.console) console.log('lead', lead);
      qsteps.forEach(function (s) { s.hidden = true; });
      qdone.hidden = false;
      quiz.classList.add('is-done');
      qbar.style.width = '100%';
      qerr.hidden = true;
      say('Заявка принята. Свяжусь выбранным способом и уточню исходные данные по нагрузке.');
      qdone.focus({ preventScroll: true });
    };

    // «Далее» — обычная кнопка, не submit: в изолированной рамке форма не отправляется
    qnext.addEventListener('click', function () {
      if (cur < last) {
        if (!valid(cur)) return;
        cur++; render();
        return;
      }
      var p = finalProblem();
      qerr.hidden = !p; qerr.textContent = p;
      if (!p) finish();
    });
    qform.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); if (!qnext.disabled) qnext.click(); }
    });
    render();
  }

  /* ---------- лента клиентов: дублируем набор для бесконечной прокрутки ---------- */
  var marquee = $('[data-marquee]');
  if (marquee && !reduced) {
    var track = $('[data-marquee-track]', marquee);
    $$('li', track).slice().forEach(function (li) {
      var twin = li.cloneNode(true);
      twin.setAttribute('aria-hidden', 'true');
      track.appendChild(twin);
    });
    marquee.classList.add('is-running');
  }

  /* ---------- «Как работаем»: три кадра, пять шагов; листается сам каждые 4 секунды и руками ---------- */
  var proc = $('[data-process]');
  if (proc) {
    var AUTO_MS = 4000;
    var chapters = $$('.chapter', proc);
    var stepEls = $$('.step', proc);
    var trackBtns = $$('[data-go]', proc);
    var fill = $('[data-track-fill]', proc);
    var stage = $('[data-stage]', proc);
    var chapterOf = [0, 0, 1, 2, 2];
    var wide = window.matchMedia('(min-width: 901px)');
    var cur = 0, timer = null, seen = false, scrolling = null, dragAt = 0;

    var show = function (step) {
      cur = step;
      var ch = chapterOf[step];
      chapters.forEach(function (c, i) { c.classList.toggle('is-active', i === ch); });
      stepEls.forEach(function (s) { s.classList.toggle('is-current', parseInt(s.getAttribute('data-step'), 10) === step); });
      trackBtns.forEach(function (b, i) {
        b.classList.toggle('is-active', i === step);
        b.classList.toggle('is-done', i < step);
      });
      fill.style.width = (step / (trackBtns.length - 1) * 100) + '%';
    };
    // на телефоне кадры лежат в ленте с прокруткой: подводим нужный кадр к центру
    var scrollToChapter = function (ch) {
      var c = chapters[ch];
      stage.scrollTo({ left: c.offsetLeft - (stage.clientWidth - c.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    };
    // шаг на десктопе — по шагам; на телефоне — по кадрам
    var move = function (dir) {
      var n;
      if (wide.matches) {
        n = (cur + dir + trackBtns.length) % trackBtns.length;
      } else {
        var ch = (chapterOf[cur] + dir + chapters.length) % chapters.length;
        n = chapterOf.indexOf(ch);
        scrollToChapter(ch);
      }
      show(n);
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var play = function () {
      stop();
      if (reduced || !seen) return;
      timer = setInterval(function () { move(1); }, AUTO_MS);
    };

    // руками: стрелки, клик по кадру и по точке, клавиатура, перетаскивание
    $$('[data-move]', proc).forEach(function (b) {
      b.addEventListener('click', function () { move(parseInt(b.getAttribute('data-move'), 10)); play(); });
    });
    trackBtns.forEach(function (b) {
      b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-go'), 10)); play(); });
    });
    chapters.forEach(function (c, i) {
      var open = function () {
        if (Date.now() - dragAt < 400) return; // клик после перетаскивания не считаем
        if (chapterOf[cur] !== i) { show(chapterOf.indexOf(i)); if (!wide.matches) scrollToChapter(i); play(); }
      };
      c.addEventListener('click', open);
      // с клавиатуры (Tab) кадр открывается при фокусе; при нажатии мышью фокус игнорируем, чтобы не мешать перетаскиванию
      c.addEventListener('focus', function () { if (c.matches(':focus-visible')) open(); });
    });
    proc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { move(1); play(); }
      if (e.key === 'ArrowLeft') { move(-1); play(); }
    });
    var downX = null;
    stage.addEventListener('pointerdown', function (e) { downX = e.clientX; stop(); });
    var release = function (e) {
      if (downX !== null && wide.matches && e.type === 'pointerup') {
        var dx = e.clientX - downX;
        if (Math.abs(dx) > 60) { dragAt = Date.now(); move(dx < 0 ? 1 : -1); }
      }
      downX = null; play();
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    // свайп пальцем по ленте на телефоне: определяем, какой кадр остановился по центру
    stage.addEventListener('scroll', function () {
      if (wide.matches) return;
      clearTimeout(scrolling);
      scrolling = setTimeout(function () {
        var mid = stage.scrollLeft + stage.clientWidth / 2, best = 0, bestD = 1e9;
        chapters.forEach(function (c, i) {
          var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        if (chapterOf[cur] !== best) show(chapterOf.indexOf(best));
      }, 120);
    }, { passive: true });
    wide.addEventListener && wide.addEventListener('change', function () { if (wide.matches) stage.scrollTo({ left: 0 }); play(); });

    show(0);
    var inProc = function () {
      var r = proc.getBoundingClientRect();
      var visible = r.top < window.innerHeight * .6 && r.bottom > window.innerHeight * .3;
      if (visible !== seen) { seen = visible; if (seen) { show(0); if (!wide.matches) stage.scrollTo({ left: 0 }); } play(); }
    };
    // наблюдатель и запасной обработчик прокрутки: если наблюдатель не сработает, лента всё равно запустится
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(inProc, { threshold: [0, .3, .6] }).observe(proc);
    }
    window.addEventListener('scroll', inProc, { passive: true });
    inProc();
  }

  /* ---------- «Преимущества»: ползунок «типовой комплект / проект» ---------- */
  var cmp = $('[data-cmp]');
  if (cmp) {
    var range = $('[data-cmp-range]', cmp);
    var spots = $$('.spot', cmp);
    var advs = $$('.adv');
    var setPos = function (v) {
      cmp.style.setProperty('--pos', v + '%');
      spots.forEach(function (s) {
        var x = parseFloat(s.style.getPropertyValue('--x'));
        s.classList.toggle('is-on', x > v);
      });
    };
    var anim = null;
    var cancel = function () { if (anim) { cancelAnimationFrame(anim); anim = null; } };
    range.addEventListener('input', function () { cancel(); setPos(parseFloat(range.value)); });
    range.addEventListener('pointerdown', cancel);
    // подсветка точки при наведении на строку и обратно
    advs.forEach(function (li, i) {
      var on = function () { li.classList.add('is-hot'); spots[i].classList.add('is-lit'); };
      var off = function () { li.classList.remove('is-hot'); spots[i].classList.remove('is-lit'); };
      li.addEventListener('mouseenter', on); li.addEventListener('mouseleave', off);
      li.addEventListener('focus', on); li.addEventListener('blur', off);
    });
    setPos(50);
    // один раз при появлении: разделитель проезжает с правого края на место и открывает точки по очереди
    var played = false;
    var play = function () {
      if (played) return; played = true;
      if (reduced) return;
      var from = 98, to = 40, dur = 2600, t0 = performance.now();
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var step = function (now) {
        var t = Math.min(1, (now - t0) / dur), v = from + (to - from) * ease(t);
        range.value = v; setPos(v);
        anim = t < 1 ? requestAnimationFrame(step) : null;
      };
      setPos(from); range.value = from; anim = requestAnimationFrame(step);
    };
    var check = function () {
      var r = cmp.getBoundingClientRect();
      if (r.top < window.innerHeight * .7 && r.bottom > window.innerHeight * .3) play();
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(check, { threshold: [0, .4] }).observe(cmp);
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ---------- «Цены»: сумма набирается, полоса заполняется один раз при появлении ---------- */
  var prices = $('[data-prices]');
  if (prices) {
    var fmt = function (n) { return new Intl.NumberFormat('ru-RU').format(Math.round(n)).replace(/ | /g, ' '); };
    var counters = $$('[data-count]', prices);
    var bar = $('.pbar', prices);
    var done = false;
    var run = function () {
      if (done) return; done = true;
      if (reduced) return;
      var t0 = performance.now(), dur = 1700;
      bar.classList.add('is-armed');
      void bar.offsetWidth;
      requestAnimationFrame(function () { bar.classList.remove('is-armed'); });
      var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
      var step = function (now) {
        var t = Math.min(1, (now - t0) / dur);
        counters.forEach(function (el) {
          var target = parseFloat(el.getAttribute('data-count'));
          el.textContent = fmt(target * ease(t)) + (el.tagName === 'DD' ? ' ₽' : '');
        });
        if (t < 1) requestAnimationFrame(step);
      };
      counters.forEach(function (el) { el.textContent = '0' + (el.tagName === 'DD' ? ' ₽' : ''); });
      requestAnimationFrame(step);
    };
    var seePrices = function () {
      var r = $('.pcard', prices).getBoundingClientRect();
      if (r.top < window.innerHeight * .7 && r.bottom > window.innerHeight * .25) run();
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(seePrices, { threshold: [0, .3] }).observe($('.pcard', prices));
    window.addEventListener('scroll', seePrices, { passive: true });
    seePrices();
  }

  /* ---------- первый экран: один сценарий «сеть пропала — дом на батарее» ---------- */
  var hero = $('[data-hero]');
  var card = $('[data-status-card]');
  if (hero && card) {
    var title = $('[data-status-title]', card);
    var text = $('[data-status-text]', card);
    var set = function (t, s) { title.textContent = t; text.textContent = s; };
    var backup = function () { hero.classList.remove('is-blackout'); hero.classList.add('is-backup'); set('Дом на резерве', 'Свет и розетки работают'); };
    var applyDim = function () {}; // затемнение дома делает класс is-blackout в стилях
    if (reduced) {
      backup();
    } else {
      setTimeout(function () { hero.classList.add('is-blackout'); applyDim(true); set('Сеть пропала', 'Внешнее питание отключено'); }, 1400);
      setTimeout(function () { applyDim(false); backup(); }, 3400);
    }
  }
})();
