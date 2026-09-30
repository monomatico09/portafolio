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
    title:       "Mi primer proyecto",
    description: "Sistema de gestión construido con Google Apps Script para uso interno en una institución educativa.",
    problem:     "Elimina el ingreso manual de datos en hojas de cálculo y centraliza la información en tiempo real para todo el equipo.",
    url:         "",
    service:     "Google Apps Script",
    screenshot:  "",
    private:     true
  }
];
