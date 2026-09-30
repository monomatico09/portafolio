# Cinetia — Portafolio web

Landing page de servicios de Cinetia: aplicaciones web, automatización de procesos y capacitación en inteligencia artificial para colegios y empresas. Incluye hero con diagrama animado, franjas de herramientas en movimiento, carrusel de proyectos, sección de capacitación en IA, chat de contacto y modo oscuro automático.  
Publicada en **GitHub Pages** sin frameworks ni herramientas de compilación.

🌐 **URL pública:** https://monomatico09.github.io/portafolio/

---

## Estructura del proyecto

```
portafolio/
├── index.html        ← Página principal (hero, herramientas, carrusel, capacitación IA, contacto, chat, lightbox)
├── css/styles.css    ← Estilos, tokens de diseño, animaciones, gradiente aurora y modo oscuro
├── js/app.js         ← Carrusel, lightbox, chat, franjas animadas y aparición al hacer scroll
├── projects.js       ← Lista de proyectos del carrusel
├── Logos/            ← Logos, favicons e imagen para redes de Cinetia
│   ├── favicon.svg
│   ├── favicon-32.png
│   ├── apple-touch-icon-180.png
│   ├── cinetia-monograma-violeta.svg   ← barra de navegación (modo claro)
│   ├── cinetia-monograma-blanco.svg    ← barra de navegación (modo oscuro) y chat
│   ├── cinetia-icono-app-512.png       ← base de la imagen para redes
│   ├── og-image.png                    ← vista previa al compartir el enlace (1200×630)
│   └── ...
├── screenshots/      ← Capturas de los proyectos (WebP)
├── DESIGN.md         ← Guía de estilo de referencia
├── README.md
├── .gitignore
└── .nojekyll         ← Necesario para GitHub Pages
```

---

## Secciones de la página

| Sección | Qué contiene |
|---|---|
| **Navegación** | Barra fija con logo, enlaces a Proyectos, Capacitación IA y Contacto, y botón de WhatsApp. En móvil solo quedan el logo y el botón. |
| **Hero** | Título con palabra rotativa (colegio, empresa, equipo, institución), texto de presentación, tres puntos de valor, botones de acción y un diagrama animado con la forma de "C" hexagonal del logo. |
| **Herramientas** | Dos franjas que se desplazan en direcciones opuestas: automatización/desarrollo e IA. Se pausan al pasar el mouse. |
| **Proyectos** | Carrusel alimentado por `projects.js`. |
| **Capacitación en IA** | Seis módulos de formación y el formato de los talleres, con botón que abre WhatsApp con un mensaje ya escrito. |
| **Contacto** | Tarjeta con WhatsApp y correo. |
| **Chat flotante** | Formulario que envía al correo vía Formspree. |

### Tipografía

- **Sora** (`--font-display`) para títulos: geométrica y de curvas redondas, acorde al monograma.
- **Figtree** (`--font`) para el texto.

Ambas se cargan desde Google Fonts en el `<head>` de `index.html`.

### Animaciones y accesibilidad

- Entrada escalonada del hero, palabra rotativa, diagrama animado, franjas en movimiento y aparición de los módulos al hacer scroll.
- Si el visitante tiene activado **reducir movimiento** en su sistema, todo se muestra estático: sin rotación, sin franjas en movimiento y sin autoplay del carrusel.
- El carrusel y el lightbox se pueden usar completos con teclado.

---

## Cómo agregar un proyecto nuevo

### 1. Editar `projects.js`

Abre `projects.js` y agrega un objeto al array `window.PROJECTS`:

```js
window.PROJECTS = [
  {
    title:       "Nombre del proyecto",
    description: "Qué hace la aplicación (1-2 oraciones).",
    problem:     "Qué problema concreto soluciona (opcional).",
    url:         "https://tu-proyecto.example.com",
    service:     "Google Apps Script",   // ver tabla de servicios abajo
    screenshot:  "",                      // "" para iframe; o "screenshots/mi-app.webp"
    private:     false                    // true = oculta el botón Abrir y nunca usa iframe
  }
];
```

**Campos disponibles:**

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | string | Nombre del proyecto |
| `description` | string | Qué hace la app (1-2 oraciones) |
| `problem` | string | Qué problema soluciona — aparece en callout morado (opcional) |
| `url` | string | URL pública del proyecto |
| `service` | string | Plataforma — define el color del badge |
| `screenshot` | string | Ruta a imagen en `/screenshots/`, o `""` para usar iframe |
| `private` | boolean | `true` oculta el botón Abrir y nunca carga la URL en iframe |

**Valores válidos para `service`:**

| Valor | Badge |
|---|---|
| `Google Apps Script` | Lavanda |
| `Vercel` | Aqua |
| `Netlify` | Menta |
| `GitHub Pages` | Periwinkle |
| Cualquier otro (ej. `n8n + Python`) | Gris |

### 2. Proyectos privados (`private: true`)

Cuando el proyecto es de uso interno y no quieres exponer un enlace:

```js
{
  title:      "Sistema interno",
  private:    true,
  url:        "",        // puede ir vacío
  screenshot: "screenshots/mi-app.webp"
}
```

La tarjeta muestra la captura en el carrusel pero **sin botón "Abrir"** ni URL visible.

> ⚠️ **Datos personales:** si la app muestra información real de personas (nombres, permisos, salud, etc.), no pongas su URL aquí aunque sea privada: el código del sitio es público. Usa una captura con **datos ficticios o anonimizados**.

### 3. Captura de pantalla

La captura se muestra en el slide del carrusel y se puede ver a pantalla completa haciendo clic (lightbox).

**Tamaño recomendado:** `1280 × 800 px` (proporción 16:10, igual al contenedor).

**Formato y nombre:** usa **WebP** (pesa ~10–20× menos que PNG) y nombres en minúsculas sin espacios ni tildes (ej. `mi-app.webp`).

1. Guarda la captura en `screenshots/` (ej. `screenshots/mi-app.webp`).
2. Pon la ruta en el campo `screenshot`:

```js
screenshot: "screenshots/mi-app.webp"
```

Usa una captura cuando el iframe no está disponible (login requerido, CSP bloqueante, etc.).

### 4. Subir los cambios

```bash
git add projects.js screenshots/mi-app.webp
git commit -m "Agrega proyecto: Nombre del proyecto"
git push
```

GitHub Pages publica automáticamente en unos segundos.

---

## Carrusel de proyectos

El carrusel avanza automáticamente cada **5 segundos** y admite:

- Flechas ← → para navegar manualmente
- Dots de navegación en la parte inferior
- Barra de progreso animada
- Pausa automática al pasar el mouse o al navegar con teclado dentro del carrusel
- Swipe táctil en móvil
- Teclas ← → del teclado

Al hacer clic sobre la captura de un slide (o Enter/Espacio con el teclado) se abre el **lightbox** con la imagen a pantalla completa. Se cierra con Esc o clic fuera.

---

## Chat de contacto

El widget flotante (esquina inferior derecha) envía mensajes al correo usando **Formspree**.

- Endpoint configurado en `js/app.js`, variable `FORMSPREE`.
- Plan gratuito: 50 mensajes/mes.
- Para cambiar el endpoint, reemplaza la URL en esa variable.
- Incluye un campo oculto `_gotcha` (honeypot) para que Formspree descarte el spam de bots.

---

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Título, texto y puntos del hero | `index.html` — sección `<header class="hero">` |
| Palabras que rotan en el título | `index.html` — `.rotator-list` (la primera palabra se repite al final) |
| Herramientas de las franjas animadas | `index.html` — sección `.tools` (un `<li class="tool-chip">` por herramienta) |
| Módulos de capacitación en IA | `index.html` — sección `#capacitacion` |
| Tipografías (Sora para títulos, Figtree para texto) | `css/styles.css` — variables `--font-display` y `--font` |
| Enlace de WhatsApp | `index.html` — buscar `wa.me/` (4 ocurrencias: navegación, hero, capacitación y contacto) |
| Mensaje prellenado de WhatsApp (capacitación) | `index.html` — parámetro `?text=` del botón "Cotizar capacitación" |
| Correo de contacto | `index.html` — buscar `mailto:` (1 ocurrencia) |
| Endpoint de Formspree (chat) | `js/app.js` — variable `FORMSPREE` |
| Logo (modo claro) | `Logos/cinetia-monograma-violeta.svg` |
| Logo (modo oscuro y chat) | `Logos/cinetia-monograma-blanco.svg` |
| Favicon | `Logos/favicon.svg` y `Logos/favicon-32.png` |
| Imagen al compartir el enlace | `Logos/og-image.png` (1200×630) y etiquetas `og:*` en `index.html` |
| Proyectos | `projects.js` |
| Intervalo del carrusel | `js/app.js` — variable `AUTO_DELAY` (en milisegundos) |

---

## Nota sobre Google Apps Script

Para que tu app se vea en el iframe:

1. En tu `doGet`, usa `ALLOWALL`:

```js
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

2. Al publicar, establece el acceso en **"Cualquier persona"** (no "Cualquier persona con cuenta de Google").

> Si la app exige cuenta de Google o está restringida a un dominio, el iframe mostrará el login. En ese caso usa `private: true` con una captura de pantalla.

> ⚠️ Con acceso "Cualquier persona", **cualquiera que tenga la URL ve la app sin iniciar sesión**. Úsalo solo en apps de demostración, nunca en apps con datos reales de clientes o empleados.
