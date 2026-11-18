# 🌟 HappyReview Pro - SaaS de Reputación y Reseñas

**HappyReview Pro** es una plataforma SaaS y aplicación web automatizada desarrollada para ayudar a los establecimientos y comercios a potenciar su reputación online, captar valoraciones de 4 y 5 estrellas directamente en Google Maps, y gestionar incidencias privadas o cupones de fidelización de forma centralizada.

---

## 🚀 Arquitectura del Proyecto

* **Backend:** Google Apps Script (`Code.gs`, `Data.gs`, `Utils.gs`).
* **Base de Datos:** Google Sheets (inicializada y autogestionada mediante código).
* **Frontend SPA:** HTML5, CSS3 modular (`Css.html`) y JavaScript integrado con Chart.js (`Login.html`, `AdminDashboard.html`, `Empresas.html`, `EmpresaDashboard.html`, `Valoracion.html`).

---

## 📂 Estructura del Repositorio

* `Code.gs` - Controlador principal, enrutador de peticiones API (`doGet`) y renderizado seguro de vistas.
* `Data.gs` - Capa de persistencia, operaciones CRUD sobre Google Sheets y métricas avanzadas.
* `Utils.gs` - Funciones de seguridad, hash SHA256, autenticación de usuarios y notificaciones por Gmail.
* `Css.html` - Hoja de estilos global (`<?!= include('Css'); ?>`) con diseño moderno, variables CSS y componentes adaptativos.
* `Login.html` - Interfaz principal (SPA) con control de sesiones, navegación por roles y modales de cartelería QR.
* `AdminDashboard.html` - Panel de administración global con métricas, emisión de cupones y ranking.
* `Empresas.html` - Módulo de registro, edición, búsqueda y gestión de establecimientos SaaS.
* `EmpresaDashboard.html` - Panel de control por establecimiento con gráficas analíticas (Chart.js), desglose de estrellas e incidencias.
* `Valoracion.html` - Vista pública móvil para escaneo de QR, votación y entrega de recompensas.
* `appsscript.json` - Manifiesto de configuración de Google Apps Script.

---

## 🛠️ Despliegue con Google Clasp

1. Instala Clasp globalmente:
   ```bash
   npm install @google/clasp -g
   ```
2. Inicia sesión en tu cuenta de Google:
   ```bash
   clasp login
   ```
3. Vincula tu proyecto existente o crea uno nuevo:
   ```bash
   clasp clone <TU_SCRIPT_ID>
   ```
4. Sube los archivos a Google Apps Script:
   ```bash
   clasp push
   ```
