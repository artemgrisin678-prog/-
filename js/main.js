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
      $('[data-status]', statusBox).textContent = open ? 'На связи — ответим за 30 минут' : 'Ответим утром, с 9:00';
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
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) closeDrawer(); });
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

  /* маска телефона: +7 (999) 000-00-00 */
  var phone = $('[data-phone]');
  if (phone) {
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
  }

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
  if (sticky && heroBtn) {
    var update = function () {
      var r = heroBtn.getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < window.innerHeight;
      sticky.classList.toggle('is-visible', !visible);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- первый экран: один сценарий «сеть пропала — дом на батарее» ---------- */
  var hero = $('[data-hero]');
  var card = $('[data-status-card]');
  if (hero && card) {
    var title = $('[data-status-title]', card);
    var text = $('[data-status-text]', card);
    var set = function (t, s) { title.textContent = t; text.textContent = s; };
    var backup = function () { hero.classList.remove('is-blackout'); hero.classList.add('is-backup'); set('Дом на резерве', 'Свет и розетки работают'); };
    var dim = $('.hero__house img', hero);
    var applyDim = function (on) {
      var f = on ? 'brightness(.3) saturate(.55)' : 'none';
      if (dim) dim.style.filter = f;
      var d = $('.hero__dim', hero); if (d) d.style.opacity = on ? '.35' : '0';
    };
    if (reduced) {
      backup();
    } else {
      setTimeout(function () { hero.classList.add('is-blackout'); applyDim(true); set('Сеть пропала', 'Внешнее питание отключено'); }, 1400);
      setTimeout(function () { applyDim(false); backup(); }, 3400);
    }
  }
})();
