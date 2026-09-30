/**
 * projects.js — Edita este archivo para agregar o modificar proyectos.
 *
 * Campos disponibles:
 *   title       {string}   Nombre del proyecto.
 *   description {string}   Qué hace la aplicación (1-2 oraciones).
 *   problem     {string}   Qué problema concreto soluciona (opcional).
 *   url         {string}   URL pública. Déjalo "" si el proyecto es privado.
 *   service     {string}   "Google Apps Script" | "Vercel" | "Netlify" | "GitHub Pages" | otro.
 *   screenshot  {string}   Ruta a imagen en /screenshots/, o "" para usar iframe.
 *   private     {boolean}  true = oculta el botón "Abrir" y muestra candado en la preview.
 */
window.PROJECTS = [
  {
    title:       "Sistema de control de ausencias",
    description: "Plataforma web que centraliza el monitoreo de ausencias, permisos e incapacidades del personal, con generación automática de informes para nómina y KPIs de gestión del ausentismo.",
    problem:     "Elimina el seguimiento manual en hojas de cálculo, reduce errores en nómina y da visibilidad en tiempo real sobre el ausentismo de toda la organización.",
    url:         "",
    service:     "Google Apps Script",
    screenshot:  "",
    private:     true
  }
];
