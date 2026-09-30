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
      media.setAttribute('role', 'button');
      media.setAttribute('tabindex', '0');
      media.setAttribute('aria-label', 'Ampliar captura: ' + (project.title || 'proyecto'));
      media.addEventListener('click', function () {
        openLightbox(project.screenshot, project.title || '');
      });
      media.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(project.screenshot, project.title || '');
        }
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

    /* Autoplay solo si hay varios slides y el usuario no pidió reducir movimiento */
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canAuto  = total > 1 && !reduceMotion;
    var hovered  = false;
    var focused  = false;
    if (!canAuto && progBar) progBar.parentNode.hidden = true;

    /* Construir slides */
    var slides = [];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var s = buildSlide(projects[i]);
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'proyecto');
      s.setAttribute('aria-label', (i + 1) + ' de ' + total);
      slides.push(s);
      frag.appendChild(s);
    }
    track.appendChild(frag);

    /* Dots */
    var dots = [];
    if (total > 1 && dotsEl) {
      for (var j = 0; j < total; j++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Ir al proyecto ' + (j + 1));
        (function (idx) { dot.addEventListener('click', function () { navigate(idx); }); })(j);
        dots.push(dot);
        dotsEl.appendChild(dot);
      }
      prevBtn.hidden = false;
      nextBtn.hidden = false;
    }

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
      /* Los slides ocultos no deben recibir foco ni leerse */
      slides.forEach(function (sl, i) {
        if (i === current) { sl.removeAttribute('inert'); sl.removeAttribute('aria-hidden'); }
        else { sl.setAttribute('inert', ''); sl.setAttribute('aria-hidden', 'true'); }
      });
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
      if (!canAuto || hovered || focused) return;
      stopAuto();
      timer = setInterval(function () { goTo(current + 1); resetProgress(); }, AUTO_DELAY);
      resetProgress();
    }

    function stopAuto() {
      if (timer)   { clearInterval(timer);  timer   = null; }
      if (progTmr) { clearTimeout(progTmr); progTmr = null; }
      if (progBar) { progBar.style.transition = 'none'; progBar.style.width = '0%'; }
    }

    /* Navegación manual: reinicia el ciclo solo si no está en pausa */
    function navigate(idx) { stopAuto(); goTo(idx); startAuto(); }

    prevBtn.addEventListener('click', function () { navigate(current - 1); });
    nextBtn.addEventListener('click', function () { navigate(current + 1); });

    /* Pausar al hover (solo mouse; en táctil no hay "mouseleave") */
    wrap.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      hovered = true; stopAuto();
    });
    wrap.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      hovered = false; startAuto();
    });

    /* Pausar mientras el foco del teclado esté dentro del carrusel */
    wrap.addEventListener('focusin', function (e) {
      /* Un clic con mouse también da foco al botón; solo pausamos con foco de teclado */
      var visible = true;
      try { visible = e.target.matches(':focus-visible'); } catch (err) {}
      if (!visible) return;
      focused = true; stopAuto();
    });
    wrap.addEventListener('focusout', function (e) {
      if (e.relatedTarget && wrap.contains(e.relatedTarget)) return;
      focused = false; startAuto();
    });

    /* Teclas (solo si el lightbox está cerrado y no se está escribiendo) */
    document.addEventListener('keydown', function (e) {
      var lb = document.getElementById('lightbox');
      if (lb && !lb.hidden) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft')  navigate(current - 1);
      if (e.key === 'ArrowRight') navigate(current + 1);
    });

    /* Touch swipe */
    var touchX = null;
    wrap.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 40) return;
      navigate(dx < 0 ? current + 1 : current - 1);
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
    /* Si el botón con foco se ocultó (primer/último slide), no perder el foco */
    if (document.activeElement && document.activeElement.hidden) closeBtn.focus();
  }

  var returnFocus = null;

  function open(screenshot, title) {
    slides = getSlides();
    var idx = slides.findIndex(function (p) { return p.screenshot === screenshot; });
    returnFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(idx >= 0 ? idx : 0);
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = '';
    img.src = '';
    if (returnFocus && returnFocus.focus) returnFocus.focus();
    returnFocus = null;
  }

  /* Mantiene el Tab dentro del lightbox mientras está abierto */
  function trapFocus(e) {
    var items = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
    var first = items[0];
    var last  = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (items.indexOf(document.activeElement) === -1) { e.preventDefault(); first.focus(); }
  }

  if (lb) {
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      /* El lightbox tiene prioridad: que Esc no cierre también el chat */
      e.stopImmediatePropagation();
      if (e.key === 'Tab')        trapFocus(e);
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

/* ══════════════════════════════════════════════════════════
   EFECTOS DE PÁGINA: franjas, navegación y aparición al scroll
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* Franjas de herramientas: el track debe tener dos mitades idénticas y cada mitad
     debe ser más ancha que la pantalla, para que el desplazamiento no deje huecos */
  var tracks = document.querySelectorAll('.marquee-track');
  Array.prototype.forEach.call(tracks, function (track) {
    var items = Array.prototype.slice.call(track.children);
    var setWidth = track.scrollWidth || 1;
    var reps = Math.max(1, Math.ceil(Math.max(window.screen.width || 0, 1920) / setWidth));
    var copies = reps * 2 - 1; /* el set original cuenta como la primera copia */
    for (var r = 0; r < copies; r++) {
      items.forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('data-clone', '');
        track.appendChild(c);
      });
    }
  });

  /* Borde inferior de la navegación al hacer scroll */
  var nav = document.querySelector('.site-nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Aparición al hacer scroll */
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(els, function (el) { el.removeAttribute('data-reveal'); });
    return;
  }

  /* Escalonar los elementos que comparten contenedor (ej. los módulos) */
  Array.prototype.forEach.call(els, function (el) {
    var siblings = Array.prototype.filter.call(el.parentNode.children, function (s) { return s.hasAttribute('data-reveal'); });
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty('--rd', (idx % 3) * 90 + 'ms');
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      io.unobserve(el);
      /* Al terminar, se quitan los estilos de aparición para no interferir con los hover */
      setTimeout(function () {
        el.removeAttribute('data-reveal');
        el.classList.remove('is-visible');
        el.style.removeProperty('--rd');
      }, 1000);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();
