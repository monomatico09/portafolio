(function () {
  'use strict';

  var IFRAME_W = 1280;
  var IFRAME_H = 800;
  var LOAD_TIMEOUT = 10000;

  /* ── Mapas de servicio ─────────────────────────────── */
  var BADGE_MAP = {
    'google apps script': 'badge--apps-script',
    'apps script':        'badge--apps-script',
    'vercel':             'badge--vercel',
    'netlify':            'badge--netlify',
    'github pages':       'badge--github-pages',
  };
  var SLUG_MAP = {
    'google apps script': 'apps-script',
    'apps script':        'apps-script',
    'vercel':             'vercel',
    'netlify':            'netlify',
    'github pages':       'github-pages',
  };

  function badgeClass(s) { return BADGE_MAP[(s||'').toLowerCase().trim()] || 'badge--other'; }
  function serviceSlug(s){ return SLUG_MAP[(s||'').toLowerCase().trim()]  || 'other'; }

  /* ══════════════════════════════════════════════════════
     LIGHTBOX
     ══════════════════════════════════════════════════════ */
  var lightbox      = document.getElementById('lightbox');
  var lbBody        = lightbox  ? lightbox.querySelector('.lightbox-body')    : null;
  var lbClose       = lightbox  ? lightbox.querySelector('.lightbox-close')   : null;
  var lbBackdrop    = lightbox  ? lightbox.querySelector('.lightbox-backdrop') : null;
  var lbLastFocus   = null;

  function openLightbox(project) {
    if (!lightbox || !lbBody) return;
    lbLastFocus = document.activeElement;
    lbBody.innerHTML = '';

    if (project.screenshot) {
      /* Mostrar captura ampliada */
      var img = document.createElement('img');
      img.src = project.screenshot;
      img.alt = 'Vista previa de ' + (project.title || 'proyecto');
      lbBody.appendChild(img);

    } else {
      /* Proyecto privado / sin captura */
      var wrap = document.createElement('div');
      wrap.className = 'lightbox-private';

      var icon = document.createElement('div');
      icon.className = 'lightbox-private-icon';
      icon.textContent = '🔒';

      var title = document.createElement('p');
      title.className = 'lightbox-private-title';
      title.textContent = 'Proyecto de uso interno';

      var text = document.createElement('p');
      text.className = 'lightbox-private-text';
      text.textContent = 'Esta herramienta está en producción dentro de una institución y no es de acceso público. Escríbeme si quieres ver una demostración.';

      wrap.appendChild(icon);
      wrap.appendChild(title);
      wrap.appendChild(text);
      lbBody.appendChild(wrap);
    }

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lbBody.innerHTML = '';
    if (lbLastFocus) lbLastFocus.focus();
  }

  if (lbClose)    lbClose.addEventListener('click', closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ══════════════════════════════════════════════════════
     CONSTRUCCIÓN DE TARJETA
     ══════════════════════════════════════════════════════ */
  function buildCard(project) {
    var isPrivate = !!project.private;

    var card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    if (project.service) card.setAttribute('data-service', serviceSlug(project.service));

    /* ── Área de preview ── */
    var preview = document.createElement('div');
    preview.className = 'card-preview';
    preview.setAttribute('role', 'button');
    preview.setAttribute('tabindex', '0');
    preview.setAttribute('aria-label', 'Ver vista previa de ' + (project.title || 'proyecto'));

    /* Abrir lightbox al clic o Enter/Space */
    function handlePreviewClick() { openLightbox(project); }
    preview.addEventListener('click', handlePreviewClick);
    preview.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreviewClick(); }
    });

    /* Skeleton */
    var skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    preview.appendChild(skeleton);

    function hideSkeleton() { skeleton.classList.add('is-hidden'); }

    /* ── Contenido de la preview ── */
    if (isPrivate) {
      /* Estado bloqueado visual */
      hideSkeleton();
      var lockWrap = document.createElement('div');
      lockWrap.className = 'preview-private';

      var lockIcon = document.createElement('div');
      lockIcon.className = 'preview-private-icon';
      lockIcon.textContent = '🔒';
      lockIcon.setAttribute('aria-hidden', 'true');

      var lockLabel = document.createElement('p');
      lockLabel.className = 'preview-private-label';
      lockLabel.textContent = project.screenshot ? project.title || 'Proyecto privado' : 'Uso interno';

      var lockHint = document.createElement('p');
      lockHint.className = 'preview-private-hint';
      lockHint.textContent = 'Click para ampliar';

      lockWrap.appendChild(lockIcon);
      lockWrap.appendChild(lockLabel);
      lockWrap.appendChild(lockHint);
      preview.appendChild(lockWrap);

      /* Si hay screenshot, cargarlo detrás del lock para el lightbox (sin mostrarlo aquí) */

    } else if (project.screenshot) {
      var img = document.createElement('img');
      img.className = 'card-screenshot';
      img.alt = 'Captura de ' + (project.title || 'proyecto');
      img.loading = 'lazy';
      img.onload = hideSkeleton;
      img.onerror = function () {
        img.remove();
        hideSkeleton();
        var unav = document.createElement('div');
        unav.className = 'preview-unavailable';
        unav.textContent = 'Vista previa no disponible';
        preview.appendChild(unav);
      };
      img.src = project.screenshot;
      preview.appendChild(img);

    } else if (project.url) {
      var wrapper = document.createElement('div');
      wrapper.className = 'card-iframe-wrapper';

      var iframe = document.createElement('iframe');
      iframe.className = 'card-iframe';
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
        if (!loaded) {
          hideSkeleton();
          wrapper.style.display = 'none';
          var unav = document.createElement('div');
          unav.className = 'preview-unavailable';
          unav.textContent = 'Vista previa no disponible';
          preview.appendChild(unav);
        }
      }, LOAD_TIMEOUT);

      iframe.onload = function () {
        loaded = true;
        clearTimeout(timer);
        hideSkeleton();
      };

      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function (entries) {
          var w = entries[0].contentRect.width;
          var scale = w / IFRAME_W;
          iframe.style.transform = 'scale(' + scale + ')';
          preview.style.height = (IFRAME_H * scale) + 'px';
          preview.style.aspectRatio = 'unset';
        });
        ro.observe(preview);
      }

      wrapper.appendChild(iframe);
      preview.appendChild(wrapper);

    } else {
      hideSkeleton();
      var unav2 = document.createElement('div');
      unav2.className = 'preview-unavailable';
      unav2.textContent = 'Vista previa no disponible';
      preview.appendChild(unav2);
    }

    card.appendChild(preview);

    /* ── Cuerpo de la tarjeta ── */
    var body = document.createElement('div');
    body.className = 'card-body';

    /* Título */
    var titleEl = document.createElement('h3');
    titleEl.className = 'card-title';
    titleEl.textContent = project.title || 'Sin título';
    body.appendChild(titleEl);

    /* Descripción */
    if (project.description) {
      var descEl = document.createElement('p');
      descEl.className = 'card-description';
      descEl.textContent = project.description;
      body.appendChild(descEl);
    }

    /* Callout "qué problema soluciona" */
    if (project.problem) {
      var problemBox = document.createElement('div');
      problemBox.className = 'card-problem';

      var problemLabel = document.createElement('p');
      problemLabel.className = 'card-problem-label';
      problemLabel.textContent = 'Qué soluciona';

      var problemText = document.createElement('p');
      problemText.className = 'card-problem-text';
      problemText.textContent = project.problem;

      problemBox.appendChild(problemLabel);
      problemBox.appendChild(problemText);
      body.appendChild(problemBox);
    }

    /* Footer: badge + botón (botón solo si no es privado y tiene URL) */
    var footer = document.createElement('div');
    footer.className = 'card-footer';

    if (project.service) {
      var badge = document.createElement('span');
      badge.className = 'badge ' + badgeClass(project.service);
      badge.textContent = project.service;
      footer.appendChild(badge);
    }

    if (project.url && !isPrivate) {
      var btn = document.createElement('a');
      btn.className = 'btn-open';
      btn.href = project.url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.textContent = 'Abrir';
      var arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      btn.appendChild(arrow);
      footer.appendChild(btn);
    }

    body.appendChild(footer);
    card.appendChild(body);

    return card;
  }

  /* ══════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════ */
  function init() {
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var grid       = document.getElementById('projects-grid');
    var emptyState = document.getElementById('empty-state');
    var projects   = window.PROJECTS;

    if (!Array.isArray(projects) || projects.length === 0) {
      if (grid)       grid.hidden = true;
      if (emptyState) emptyState.hidden = false;
      return;
    }

    var frag = document.createDocumentFragment();
    for (var i = 0; i < projects.length; i++) {
      frag.appendChild(buildCard(projects[i]));
    }
    if (grid) grid.appendChild(frag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ══════════════════════════════════════════════════════════
   CHAT WIDGET
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var FORMSPREE = 'https://formspree.io/f/mqpajeea';

  var trigger  = document.getElementById('chat-trigger');
  var panel    = document.getElementById('chat-panel');
  var closeBtn = document.getElementById('chat-panel-close');
  var form     = document.getElementById('chat-form');
  var sendBtn  = document.getElementById('chat-send');
  var errorEl  = document.getElementById('chat-error');
  var successEl= document.getElementById('chat-success');

  if (!trigger || !panel) return;

  var isOpen = false;

  /* ── Abrir / cerrar ── */
  function openPanel() {
    isOpen = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    /* Enfocar primer input */
    var first = panel.querySelector('.chat-input');
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closePanel() {
    isOpen = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  }

  trigger.addEventListener('click', function () {
    isOpen ? closePanel() : openPanel();
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  /* Cerrar con Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── Envío del formulario ── */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validación básica */
      var name    = form.querySelector('[name="name"]');
      var email   = form.querySelector('[name="email"]');
      var message = form.querySelector('[name="message"]');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showError('Por favor completa todos los campos.');
        return;
      }
      if (!isValidEmail(email.value.trim())) {
        showError('Ingresa un correo válido.');
        return;
      }

      hideError();
      setSending(true);

      var data = new FormData(form);

      fetch(FORMSPREE, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          showSuccess();
        } else {
          return res.json().then(function (body) {
            throw new Error(body.error || 'Error del servidor');
          });
        }
      })
      .catch(function () {
        setSending(false);
        showError('Ocurrió un error. Intenta de nuevo.');
      });
    });
  }

  /* ── Helpers ── */
  function setSending(sending) {
    if (!sendBtn) return;
    sendBtn.disabled = sending;
    var label = sendBtn.querySelector('.chat-send-label');
    if (label) label.textContent = sending ? 'Enviando…' : 'Enviar mensaje';
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function hideError() {
    if (errorEl) errorEl.hidden = true;
  }

  function showSuccess() {
    if (form)      form.hidden      = true;
    if (successEl) successEl.hidden = false;
  }

  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

})();
