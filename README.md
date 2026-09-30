# Portafolio — Johan Alexander Tirado

Landing page de servicios para mostrar proyectos web con vista previa, lightbox, chat de contacto y modo oscuro automático.  
Publicada en **GitHub Pages** sin frameworks ni herramientas de compilación.

🌐 **URL pública:** https://monomatico09.github.io/portafolio/

---

## Estructura del proyecto

```
portafolio/
├── index.html        ← Página principal (hero, proyectos, contacto, chat)
├── css/styles.css    ← Estilos, tokens de diseño y modo oscuro
├── js/app.js         ← Tarjetas, lightbox y chat flotante
├── projects.js       ← Lista de proyectos ← ÚNICO ARCHIVO QUE EDITAS
├── screenshots/      ← Capturas de pantalla opcionales
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
    private:     false                    // true = oculta el botón Abrir y muestra candado
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
| `service` | string | Plataforma — define el color del badge y el acento de la tarjeta |
| `screenshot` | string | Ruta a imagen en `/screenshots/`, o `""` para usar iframe |
| `private` | boolean | `true` oculta el botón Abrir y muestra candado en la preview |

**Valores válidos para `service`:**

| Valor | Badge | Acento superior de la tarjeta |
|---|---|---|
| `Google Apps Script` | Lavanda | Violeta |
| `Vercel` | Aqua | Cian |
| `Netlify` | Menta | Verde |
| `GitHub Pages` | Periwinkle | Azul |
| Cualquier otro | Gris | Sin acento |

### 2. Proyectos privados

Si el proyecto es de uso interno y no quieres exponer la URL:

```js
{
  title:    "Sistema interno",
  private:  true,
  url:      "",           // puedes dejarlo vacío
  screenshot: ""          // o agregar una captura para el lightbox
}
```

La tarjeta mostrará un candado 🔒. Al hacer clic en la preview se abre un lightbox con el mensaje *"Proyecto de uso interno"* invitando a contactarte.

Si además incluyes un `screenshot`, ese screenshot se mostrará en el lightbox (ampliado) pero **sin** botón "Abrir" ni URL expuesta.

### 3. Captura de pantalla (opcional)

Si quieres usar una imagen estática en lugar de un iframe:

1. Guarda la captura en `screenshots/` (ej. `screenshots/mi-app.png`).
2. En `projects.js`, pon la ruta en el campo `screenshot`:

```js
screenshot: "screenshots/mi-app.png"
```

Al hacer clic en la preview se abre la imagen ampliada en el lightbox.

### 4. Subir los cambios

```bash
git add projects.js screenshots/mi-app.png   # agrega solo lo necesario
git commit -m "Agrega proyecto: Nombre del proyecto"
git push
```

GitHub Pages publica automáticamente en unos segundos.

---

## Chat de contacto

El widget flotante (esquina inferior derecha) envía mensajes directamente a tu correo usando **Formspree**.

- El endpoint está en `js/app.js`, variable `FORMSPREE`.
- Plan gratuito de Formspree: 50 mensajes/mes.
- Para cambiar el endpoint, reemplaza la URL en esa variable.

---

## ¿Cuándo usar captura en lugar de iframe?

Usa **captura de pantalla** cuando:

- El servidor devuelve `X-Frame-Options: DENY` o `SAMEORIGIN`, o una política CSP que bloquea `frame-ancestors`.
- La app requiere inicio de sesión (el iframe mostraría el formulario de Google en lugar de la app).
- El proyecto es privado y no quieres que la URL quede visible en el código fuente.
- La página tarda mucho en cargar y quieres mejor rendimiento.

Usa **iframe** cuando la página es pública y no bloquea ser incrustada.

---

## Nota sobre Google Apps Script

Para que tu app se vea en el iframe debes:

1. En tu `doGet`, usar `ALLOWALL`:

```js
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

2. Al publicar la implementación web, establecer acceso en **"Cualquier persona"** (no "Cualquier persona con cuenta de Google").

> Si tu app exige cuenta de Google o está restringida a un dominio, el iframe mostrará el login de Google. Usa una captura de pantalla en ese caso, o marca el proyecto como `private: true`.

---

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Nombre, bio y especialidades del hero | `index.html` — sección `<header class="hero">` |
| Enlace de WhatsApp | `index.html` — buscar `wa.me/` (2 ocurrencias) |
| Correo de contacto | `index.html` — buscar `mailto:` (2 ocurrencias) |
| Endpoint de Formspree | `js/app.js` — variable `FORMSPREE` |
| Proyectos | `projects.js` |
