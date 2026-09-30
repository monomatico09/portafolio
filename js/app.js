(function () {
  'use strict';

  /* ── Constantes ───────────────────────────────────────── */
  var IFRAME_W = 1280;          // ancho "natural" del iframe
  var IFRAME_H = 800;           // alto  "natural" del iframe
  var LOAD_TIMEOUT = 10000;     // ms antes de mostrar "no disponible"

  /* ── Mapa servicio → clase CSS del badge ─────────────── */
  var BADGE_MAP = {
    'google apps script': 'badge--apps-script',
    'apps script':        'badge--apps-script',
    'vercel':             'badge--vercel',
    'netlify':            'badge--netlify',
    'github pages':       'badge--github-pages',
  };

  /* ── Mapa servicio → slug para data-service (borde superior) ── */
  var SLUG_MAP = {
    'google apps script': 'apps-script',
    'apps script':        'apps-script',
    'vercel':             'vercel',
    'netlify':            'netlify',
    'github pages':       'github-pages',
  };

  function badgeClass(service) {
    var key = (service || '').toLowerCase().trim();
    return BADGE_MAP[key] || 'badge--other';
  }

  function serviceSlug(service) {
    var key = (service || '').toLowerCase().trim();
    return SLUG_MAP[key] || 'other';
  }

  /* ── Construcción de una tarjeta ─────────────────────── */
  function buildCard(project) {
    /* Contenedor principal */
    var card = document.createElement('article');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    if (project.service) {
      card.setAttribute('data-service', serviceSlug(project.service));
    }

    /* ── Área de vista previa ── */
    var preview = document.createElement('div');
    preview.className = 'card-preview';

    /* Skeleton */
    var skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    preview.appendChild(skeleton);

    /* Mensaje de no disponible (oculto por defecto) */
    var unavailable = document.createElement('div');
    unavailable.className = 'preview-unavailable';
    unavailable.textContent = 'Vista previa no disponible';
    unavailable.hidden = true;
    preview.appendChild(unavailable);

    function hideSkeleton() {
      skeleton.classList.add('is-hidden');
    }
    function showUnavailable() {
      hideSkeleton();
      unavailable.hidden = false;
    }

    if (project.screenshot) {
      /* ── Imagen estática ── */
      var img = document.createElement('img');
      img.className = 'card-screenshot';
      img.alt = 'Captura de pantalla de ' + (project.title || 'proyecto');
      img.loading = 'lazy';
      img.onload = hideSkeleton;
      img.onerror = function () {
        img.remove();
        showUnavailable();
      };
      img.src = project.screenshot;
      preview.appendChild(img);

    } else if (project.url) {
      /* ── iframe escalado ── */
      var wrapper = document.createElement('div');
      wrapper.className = 'card-iframe-wrapper';

      var iframe = document.createElement('iframe');
      iframe.className = 'card-iframe';
      iframe.src = project.url;
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('tabindex', '-1');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.title = project.title || 'Vista previa';
      iframe.style.width = IFRAME_W + 'px';
      iframe.style.height = IFRAME_H + 'px';
      iframe.style.pointerEvents = 'none';
      iframe.style.transformOrigin = 'top left';

      /* Timeout: si no carga en LOAD_TIMEOUT ms, mostrar aviso */
      var loaded = false;
      var timer = setTimeout(function () {
        if (!loaded) {
          showUnavailable();
          wrapper.style.display = 'none';
        }
      }, LOAD_TIMEOUT);

      iframe.onload = function () {
        loaded = true;
        clearTimeout(timer);
        hideSkeleton();
      };

      /* ResizeObserver: recalcula scale cuando cambia el ancho de la tarjeta */
      if (typeof ResizeObserver !== 'undefined') {
        var ro = new ResizeObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var w = entries[i].contentRect.width;
            var scale = w / IFRAME_W;
            iframe.style.transform = 'scale(' + scale + ')';
            /* Ajustar alto del contenedor para mantener proporción */
            var h = IFRAME_H * scale;
            preview.style.height = h + 'px';
            preview.style.aspectRatio = 'unset';
          }
        });
        ro.observe(preview);
      }

      wrapper.appendChild(iframe);
      preview.appendChild(wrapper);

    } else {
      /* Sin URL ni screenshot */
      showUnavailable();
    }

    card.appendChild(preview);

    /* ── Cuerpo de la tarjeta ── */
    var body = document.createElement('div');
    body.className = 'card-body';

    var titleEl = document.createElement('h2');
    titleEl.className = 'card-title';
    titleEl.textContent = project.title || 'Sin título';
    body.appendChild(titleEl);

    if (project.description) {
      var descEl = document.createElement('p');
      descEl.className = 'card-description';
      descEl.textContent = project.description;
      body.appendChild(descEl);
    }

    /* Footer: badge + botón */
    var footer = document.createElement('div');
    footer.className = 'card-footer';

    if (project.service) {
      var badge = document.createElement('span');
      badge.className = 'badge ' + badgeClass(project.service);
      badge.textContent = project.service;
      footer.appendChild(badge);
    }

    if (project.url) {
      var btn = document.createElement('a');
      btn.className = 'btn-open';
      btn.href = project.url;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.textContent = 'Abrir';

      var arrow = document.createElement('span');
      arrow.className = 'btn-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      btn.appendChild(arrow);

      footer.appendChild(btn);
    }

    body.appendChild(footer);
    card.appendChild(body);

    return card;
  }

  /* ── Inicialización ──────────────────────────────────── */
  function init() {
    /* Año en el footer */
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var grid       = document.getElementById('projects-grid');
    var emptyState = document.getElementById('empty-state');

    var projects = window.PROJECTS;

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
