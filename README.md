# Cinetia — Portafolio web

Landing page de servicios para mostrar proyectos web con carrusel automático, lightbox de imágenes, chat de contacto y modo oscuro automático.  
Publicada en **GitHub Pages** sin frameworks ni herramientas de compilación.

🌐 **URL pública:** https://monomatico09.github.io/portafolio/

---

## Estructura del proyecto

```
portafolio/
├── index.html        ← Página principal (hero, carrusel, contacto, chat, lightbox)
├── css/styles.css    ← Estilos, tokens de diseño, gradiente aurora y modo oscuro
├── js/app.js         ← Carrusel automático, lightbox y chat flotante
├── projects.js       ← Lista de proyectos ← ÚNICO ARCHIVO QUE EDITAS
├── Logos/            ← Logos y favicons de Cinetia
│   ├── favicon.svg
│   ├── favicon-32.png
│   ├── apple-touch-icon-180.png
│   ├── cinetia-monograma-violeta.svg   ← usado en hero (modo claro)
│   ├── cinetia-monograma-blanco.svg    ← usado en hero (modo oscuro) y chat
│   └── ...
├── screenshots/      ← Capturas de pantalla de los proyectos
│   └── .gitkeep
├── README.md
└── .nojekyll         ← Necesario para GitHub Pages
```

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
    screenshot:  "",                      // "" para iframe; o "screenshots/mi-app.png"
    private:     false                    // true = oculta el botón Abrir
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
| `private` | boolean | `true` oculta el botón Abrir |

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
  screenshot: "screenshots/mi-app.png"
}
```

La tarjeta muestra la captura en el carrusel pero **sin botón "Abrir"** ni URL visible.

### 3. Captura de pantalla

La captura se muestra en el slide del carrusel y se puede ver a pantalla completa haciendo clic (lightbox).

**Tamaño recomendado:** `1280 × 800 px` (proporción 16:10, igual al contenedor).

**Formato y nombre:** usa **WebP** (pesa ~10–20× menos que PNG) y nombres en minúsculas sin espacios ni tildes (ej. `mi-app.webp`).

1. Guarda la captura en `screenshots/` (ej. `screenshots/mi-app.png`).
2. Pon la ruta en el campo `screenshot`:

```js
screenshot: "screenshots/mi-app.png"
```

Usa una captura cuando el iframe no está disponible (login requerido, CSP bloqueante, etc.).

### 4. Subir los cambios

```bash
git add projects.js screenshots/mi-app.png
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
- Pausa automática al pasar el mouse
- Swipe táctil en móvil
- Teclas ← → del teclado

Al hacer clic sobre la captura de pantalla de un slide se abre el **lightbox** con la imagen a pantalla completa. Se cierra con Esc o clic fuera.

---

## Chat de contacto

El widget flotante (esquina inferior derecha) envía mensajes al correo usando **Formspree**.

- Endpoint configurado en `js/app.js`, variable `FORMSPREE`.
- Plan gratuito: 50 mensajes/mes.
- Para cambiar el endpoint, reemplaza la URL en esa variable.

---

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Bio y especialidades del hero | `index.html` — sección `<header class="hero">` |
| Enlace de WhatsApp | `index.html` — buscar `wa.me/` (2 ocurrencias) |
| Correo de contacto | `index.html` — buscar `mailto:` (2 ocurrencias) |
| Endpoint de Formspree (chat) | `js/app.js` — variable `FORMSPREE` |
| Logo (modo claro) | `Logos/cinetia-monograma-violeta.svg` |
| Logo (modo oscuro y chat) | `Logos/cinetia-monograma-blanco.svg` |
| Favicon | `Logos/favicon.svg` y `Logos/favicon-32.png` |
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
