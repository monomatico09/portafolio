(function () {
  'use strict';

  var IFRAME_W    = 1280;
  var IFRAME_H    = 800;
  var LOAD_TIMEOUT = 10000;
  var AUTO_DELAY  = 5000; /* ms entre slides */

  var BADGE_MAP = {
    'google apps script': 'badge--apps-script',
    'apps script':        'badge--apps-script',
    'vercel':             'badge--vercel',
    'netlify':            'badge--netlify',
    'github pages':       'badge--github-pages',
  };

  function badgeClass(s) { return BADGE_MAP[(s||'').toLowerCase().trim()] || 'badge--other'; }

  /* ── Helper skeleton ── */
  function makeSkeleton() {
    var sk = document.createElement('div');
    sk.className = 'card-skeleton';
    return sk;
  }

  /* ── Helper no-disponible ── */
  function showUnavailable(el) {
    var d = document.createElement('div');
    d.className = 'preview-unavailable';
    d.textContent = 'Vista previa no disponible';
    el.appendChild(d);
  }

  /* ══════════════════════════════════════════════════════
     CONSTRUCCIÓN DE SLIDE
     ══════════════════════════════════════════════════════ */
  function buildSlide(project) {
    var slide = document.createElement('div');
    slide.className = 'carousel-slide';

    /* ── Área de media (izquierda) ── */
    var media = document.createElement('div');
    media.className = 'slide-media';

    var sk = makeSkeleton();
    media.appendChild(sk);
    function hideSk() { sk.classList.add('is-hidden'); }

    if (project.screenshot) {
      media.classList.add('slide-media--clickable');
      media.addEventListener('click', function () {
        openLightbox(project.screenshot, project.title || '');
      });
      var img = document.createElement('img');
      img.className = 'slide-screenshot';
      img.alt = project.title || 'Vista previa';
      img.loading = 'lazy';
      img.onload  = hideSk;
      img.onerror = function () { img.remove(); hideSk(); showUnavailable(media); };
      img.src = project.screenshot;
      media.appendChild(img);

    } else if (project.url && !project.private) {
      var wrapper = document.createElement('div');
      wrapper.className = 'slide-iframe-wrapper';

      var iframe = document.createElement('iframe');
      iframe.className = 'slide-iframe';
      iframe.src = project.url;
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('tabindex', '-1');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.title = project.title || 'Vista previa';
      iframe.style.width  = IFRAME_W + 'px';
      iframe.style.height = IFRAME_H + 'px';
      iframe.style.pointerEvents = 'none';
      iframe.style.transformOrigin = 'top left';

      var loaded = false;
      var timer = setTimeout(function () {
        if (!loaded) { hideSk(); wrapper.style.display = 'none'; showUnavailable(media); }
      }, LOAD_TIMEOUT);

      iframe.onload = function () { loaded = true; clearTimeout(timer); hideSk(); };

      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function (entries) {
          var w = entries[0].contentRect.width;
          iframe.style.transform = 'scale(' + (w / IFRAME_W) + ')';
        });
        ro.observe(media);
      }

      wrapper.appendChild(iframe);
      media.appendChild(wrapper);
    } else {
      hideSk();
      showUnavailable(media);
    }

    /* ── Panel de información (derecha) ── */
    var info = document.createElement('div');
    info.className = 'slide-info';

    if (project.service) {
      var badge = document.createElement('span');
      badge.className = 'badge ' + badgeClass(project.service);
      badge.textContent = project.service;
      info.appendChild(badge);
    }

    var title = document.createElement('h3');
    title.className = 'slide-title';
    title.textContent = project.title || 'Sin título';
    info.appendChild(title);

    if (project.description) {
      var desc = document.createElement('p');
      desc.className = 'slide-description';
      desc.textContent = project.description;
      info.appendChild(desc);
    }

    if (project.problem) {
      var prob = document.createElement('div');
      prob.className = 'card-problem';
      var probLbl = document.createElement('p');
      probLbl.className = 'card-problem-label';
      probLbl.textContent = 'Qué soluciona';
      var probTxt = document.createElement('p');
      probTxt.className = 'card-problem-text';
      probTxt.textContent = project.problem;
      prob.appendChild(probLbl);
      prob.appendChild(probTxt);
      info.appendChild(prob);
    }

    if (project.url && !project.private) {
      var btn = document.createElement('a');
      btn.className = 'btn-open';
      btn.href      = project.url;
      btn.target    = '_blank';
      btn.rel       = 'noopener noreferrer';
      btn.innerHTML = 'Abrir <span aria-hidden="true">↗</span>';
      info.appendChild(btn);
    }

    slide.appendChild(media);
    slide.appendChild(info);
    return slide;
  }

  /* ══════════════════════════════════════════════════════
     CARRUSEL
     ══════════════════════════════════════════════════════ */
  function initCarousel(projects) {
    var wrap     = document.getElementById('carousel-wrap');
    var track    = document.getElementById('carousel-track');
    var dotsEl   = document.getElementById('carousel-dots');
    var prevBtn  = document.getElementById('carousel-prev');
    var nextBtn  = document.getElementById('carousel-next');
    var progBar  = document.getElementById('carousel-progress-bar');

    var total   = projects.length;
    var current = 0;
    var timer   = null;
    var progTmr = null;

    /* Construir slides */
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) frag.appendChild(buildSlide(projects[i]));
    track.appendChild(frag);

    /* Dots */
    var dots = [];
    if (total > 1 && dotsEl) {
      for (var j = 0; j < total; j++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Ir al proyecto ' + (j + 1));
        (function (idx) { dot.addEventListener('click', function () { stopAuto(); goTo(idx); startAuto(); }); })(j);
        dots.push(dot);
        dotsEl.appendChild(dot);
      }
      prevBtn.hidden = false;
      nextBtn.hidden = false;
    }

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
      resetProgress();
    }

    function resetProgress() {
      if (!progBar) return;
      if (progTmr) clearTimeout(progTmr);
      progBar.style.transition = 'none';
      progBar.style.width = '0%';
      /* micro-task para que el navegador aplique el reset antes de animar */
      progTmr = setTimeout(function () {
        progBar.style.transition = 'width ' + AUTO_DELAY + 'ms linear';
        progBar.style.width = '100%';
      }, 30);
    }

    function startAuto() {
      if (total <= 1) return;
      stopAuto();
      timer = setInterval(function () { goTo(current + 1); }, AUTO_DELAY);
      resetProgress();
    }

    function stopAuto() {
      if (timer)   { clearInterval(timer);  timer   = null; }
      if (progTmr) { clearTimeout(progTmr); progTmr = null; }
      if (progBar) { progBar.style.transition = 'none'; progBar.style.width = '0%'; }
    }

    prevBtn.addEventListener('click', function () { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', function () { stopAuto(); goTo(current + 1); startAuto(); });

    /* Pausar al hover */
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    /* Teclas (solo si el lightbox está cerrado y no se está escribiendo) */
    document.addEventListener('keydown', function (e) {
      var lb = document.getElementById('lightbox');
      if (lb && !lb.hidden) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft')  { stopAuto(); goTo(current - 1); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); goTo(current + 1); startAuto(); }
    });

    /* Touch swipe */
    var touchX = null;
    wrap.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      stopAuto();
      goTo(dx < 0 ? current + 1 : current - 1);
      startAuto();
    }, { passive: true });

    goTo(0);
    startAuto();
  }

  /* ══════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════ */
  function init() {
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var projects   = window.PROJECTS;
    var emptyState = document.getElementById('empty-state');
    var wrap       = document.getElementById('carousel-wrap');

    if (!Array.isArray(projects) || projects.length === 0) {
      if (wrap) wrap.hidden = true;
      if (emptyState) emptyState.hidden = false;
      return;
    }

    initCarousel(projects);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ══════════════════════════════════════════════════════════
   LIGHTBOX
   ══════════════════════════════════════════════════════════ */
var openLightbox = (function () {
  'use strict';

  /* Recopila todos los proyectos con captura, en orden */
  function getSlides() {
    return (window.PROJECTS || []).filter(function (p) { return !!p.screenshot; });
  }

  var lb       = document.getElementById('lightbox');
  var backdrop = document.getElementById('lightbox-backdrop');
  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn  = document.getElementById('lightbox-prev');
  var nextBtn  = document.getElementById('lightbox-next');
  var img      = document.getElementById('lightbox-img');
  var caption  = document.getElementById('lightbox-caption');

  var slides  = [];
  var current = 0;

  function show(index) {
    slides = getSlides();
    current = Math.max(0, Math.min(index, slides.length - 1));
    var slide = slides[current];
    img.src = slide.screenshot;
    img.alt = slide.title || '';
    caption.textContent = slide.title || '';
    prevBtn.hidden = current === 0;
    nextBtn.hidden = current === slides.length - 1;
  }

  function open(screenshot, title) {
    slides = getSlides();
    var idx = slides.findIndex(function (p) { return p.screenshot === screenshot; });
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(idx >= 0 ? idx : 0);
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    img.src = '';
  }

  if (lb) {
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  return open;
})();

/* ══════════════════════════════════════════════════════════
   CHAT WIDGET
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FORMSPREE = 'https://formspree.io/f/mqpajeea';

  var trigger   = document.getElementById('chat-trigger');
  var panel     = document.getElementById('chat-panel');
  var closeBtn  = document.getElementById('chat-panel-close');
  var form      = document.getElementById('chat-form');
  var sendBtn   = document.getElementById('chat-send');
  var errorEl   = document.getElementById('chat-error');
  var successEl = document.getElementById('chat-success');

  if (!trigger || !panel) return;

  var isOpen = false;

  function openPanel() {
    isOpen = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('.chat-input');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closePanel() {
    isOpen = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  }

  trigger.addEventListener('click', function () { isOpen ? closePanel() : openPanel(); });
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name    = form.querySelector('[name="name"]');
      var email   = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showError('Por favor completa todos los campos.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError('Ingresa un correo válido.');
        return;
      }

      hideError();
      setSending(true);

      fetch(FORMSPREE, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) { showSuccess(); }
        else { throw new Error(); }
      })
      .catch(function () {
        setSending(false);
        showError('Ocurrió un error. Intenta de nuevo.');
      });
    });
  }

  function setSending(v) {
    if (!sendBtn) return;
    sendBtn.disabled = v;
    var label = sendBtn.querySelector('.chat-send-label');
    if (label) label.textContent = v ? 'Enviando…' : 'Enviar mensaje';
  }
  function showError(msg) { if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; } }
  function hideError()    { if (errorEl) errorEl.hidden = true; }
  function showSuccess()  { if (form) form.hidden = true; if (successEl) successEl.hidden = false; }

})();
