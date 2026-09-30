# Portafolio — Johan Alexander Tirado

Landing page tipo hub para mostrar proyectos web con vista previa en vivo o captura de pantalla.  
Publicada en **GitHub Pages** sin frameworks ni herramientas de compilación.

---

## Estructura del proyecto

```
portafolio/
├── index.html        ← Página principal
├── css/styles.css    ← Estilos y modo oscuro
├── js/app.js         ← Lógica de renderizado de tarjetas
├── projects.js       ← Lista de proyectos ← SOLO ESTE ARCHIVO EDITAS
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
    description: "Una o dos oraciones describiendo qué hace.",
    url:         "https://tu-proyecto.example.com",
    service:     "Google Apps Script",   // o Vercel, Netlify, GitHub Pages, etc.
    screenshot:  ""                       // "" para usar iframe; o "screenshots/mi-app.png"
  }
];
```

**Valores válidos para `service`** y el color del badge que generan:

| Valor | Color del badge |
|---|---|
| `Google Apps Script` | Lavanda |
| `Vercel` | Aqua |
| `Netlify` | Menta |
| `GitHub Pages` | Periwinkle |
| Cualquier otro | Gris |

### 2. Captura de pantalla (opcional)

Si quieres usar una imagen estática en lugar de un iframe:

1. Guarda la captura en `screenshots/` (ej. `screenshots/mi-app.png`).
2. En `projects.js`, pon la ruta en el campo `screenshot`:

```js
screenshot: "screenshots/mi-app.png"
```

### 3. Subir los cambios

```bash
git add projects.js screenshots/mi-app.png   # agrega solo lo necesario
git commit -m "Agrega proyecto: Nombre del proyecto"
git push
```

GitHub Pages publica automáticamente en unos segundos.

---

## ¿Cuándo usar captura en lugar de iframe?

Usa **captura de pantalla** cuando:

- El servidor devuelve el encabezado `X-Frame-Options: DENY` o `SAMEORIGIN`,  
  o una política CSP que bloquea `frame-ancestors`.
- La aplicación requiere inicio de sesión para mostrar contenido útil  
  (el iframe mostrará el formulario de login en lugar de la app).
- La página tarda mucho en cargar y quieres mejor rendimiento.

Usa **iframe** cuando la página es pública y no bloquea ser incrustada.

---

## Nota sobre Google Apps Script

Para que tu app de Apps Script se vea correctamente dentro del iframe debes:

1. En tu `doGet`, usar `ALLOWALL` como modo de X-Frame-Options:

```js
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
```

2. Al publicar la implementación web, establecer acceso en **"Cualquier persona"**  
   (no "Cualquier persona con cuenta de Google").

> Si tu app requiere una cuenta de Google o está restringida a un dominio,  
> el iframe mostrará el formulario de inicio de sesión de Google.  
> En ese caso, usa una **captura de pantalla** en su lugar.
