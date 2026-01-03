# 📋 GTD Master

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Version](https://img.shields.io/badge/Version-1.4.1-blue)

---

## 📖 Descripción

**GTD Master** es una solución profesional de productividad personal basada rigurosamente en la metodología **Getting Things Done (GTD)** de David Allen. Diseñada para transformar el caos en calma, GTD Master combina una interfaz premium con la potencia de una base de datos local robusta (**Offline-First**).

### El Flujo de Trabajo GTD Completo:

| Pilar | Funcionalidad | Descripción |
|-------|---------------|-------------|
| 📥 **Capturar** | Inbox & Quick Capture | Captura ultra-rápida con Haptics y Deep Linking. |
| 🔍 **Clarificar** | Inbox Processor Wizard | Asistente inteligente para llegar a "Inbox Zero" sin fricción. |
| 📂 **Organizar** | Projects & Contexts | Áreas de responsabilidad, Referencias de proyecto y Contextos. |
| 📅 **Revisar** | Weekly Review Wizard | Ritual guiado paso a paso para mantener tu sistema al día. |
| ⚡ **Ejecutar** | Engage List | Próximas acciones agrupadas por contexto y filtradas por fecha de inicio. |
| 📊 **Reflejar** | Perspectives Dashboard | Visualización de salud del sistema, áreas y moméntum semanal. |

---

## ✨ Características de Refinamiento (v1.4.0)

### 🧠 Inteligencia en el Flujo
- **Wizards Paso a Paso**: Procesamiento de bandeja de entrada y revisión semanal mediante guías interactivas.
- **Hitos Visuales**: Celebraciones con confeti y transiciones fluidas al completar procesos clave.
- **Referencias de Proyecto**: Guarda material de apoyo (notas, links) vinculado directamente a tus proyectos.

### 🔔 Notificaciones y Hábitos
- **Daily Briefing**: Notificación matutina dinámica que te informa cuántas tareas vencen e inician hoy.
- **Recordatorios Personalizados**: Configura libremente el día y la hora de tu Revisión Semanal y Resumen Diario.
- **Fast Capture**: Acceso directo mediante Deep Linking (`gtdmaster://inbox/quick`) para capturar ideas al instante.

### 🛡️ Tu Información, Tu Control
- **Offline-First Real**: Sin login, sin nube obligatoria. Todo vive en tu dispositivo.
- **Data Portability**: Exporta e importa todo tu sistema en un archivo JSON estándar para respaldos o migración.
- **Búsqueda Global**: Filtro en tiempo real por tareas, proyectos y material de referencia desde cualquier pestaña.

### 🎨 Diseño Premium & UX
- **Modo Oscuro Adaptativo**: Soporte completo de Dark/Light mode con una estética moderna y profesional.
- **Feedback Sensorial**: Integración de `expo-haptics` para una respuesta táctil satisfactoria.
- **UI Unificada**: Cabeceras personalizadas premium consistentes en todas las secciones principales.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Core** | Expo SDK 54 / React Native 0.81.5 |
| **Logic** | TypeScript 5.9 |
| **Persistence** | SQLite + Drizzle ORM (con sistema de migraciones personalizado) |
| **State Management** | Zustand con persistencia AsyncStorage |
| **Styling** | NativeWind (TailwindCSS) + Lucide Icons |
| **UX/UI Extras** | Reanimated, Confetti Cannon, Haptics |
| **I18n** | i18next (Soporte completo Inglés/Español) |
| **System APIs** | Notifications, Sharing, Document Picker, File System |

---

## 📁 Arquitectura del Proyecto

```
src/
├── app/                    # 📱 Rutas (Expo Router)
│   ├── (tabs)/             # Pestañas principales (Inbox, Organize, Engage, Review)
│   ├── inbox/              # Wizards de Procesamiento y Captura Rápida
│   ├── project/            # Gestión de Proyectos, Áreas y Referencias
│   ├── review/             # Asistente de Revisión Semanal
│   ├── perspectives.tsx    # Dashboard de métricas y gestión de datos
│   ├── search.tsx          # Pantalla de búsqueda global
│   └── settings.tsx        # Configuración de notificaciones, idioma y tema
│
├── components/             # 🧩 UI Kit & TaskItem
├── core/                   # ⚙️ i18n, Theme, Notifications & DataService
├── db/                     # 🗄️ SQLite Client, Schemas & Migration Runner
└── store/                  # 📦 Zustand Stores (Tasks, Projects, Settings)
```

---

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ 
- Expo Go (móvil) o Simulador (Android/iOS)

### Pasos Rápidos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar desarrollo
npm start

# 3. Android / iOS
npm run android
npm run ios
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  <b>GTD Master</b> - Despeja tu mente, enfócate en lo importante.<br>
  Hecho con ❤️ usando la potencia de Expo.
</p>
