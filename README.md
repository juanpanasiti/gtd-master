# 📋 GTD Master

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

---

## 📖 Descripción

**GTD Master** es una aplicación de productividad personal basada en la metodología **Getting Things Done (GTD)** de David Allen. Construida con una filosofía **Offline-First**, todos tus datos permanecen en tu dispositivo sin necesidad de conexión a internet.

### Los 4 Pilares de GTD Implementados:

| Pilar | Pantalla | Descripción |
|-------|----------|-------------|
| 📥 **Capturar** | Inbox | Captura rápida de ideas y tareas pendientes |
| 📂 **Organizar** | Projects | Asigna tareas a Proyectos y Contextos (@etiquetas) |
| ⚡ **Ejecutar** | Engage | Vista de próximas acciones agrupadas por contexto |
| 📅 **Revisar** | Review | Agenda cronológica de tareas con fecha de vencimiento |

---

## ✨ Características Clave

### 🔌 Offline-First
- **Persistencia total** con SQLite local mediante `expo-sqlite`
- Sistema de **migraciones secuenciales** personalizado
- Tus datos nunca salen de tu dispositivo

### 📋 Gestión GTD Completa
- **Inbox Zero**: Procesa y categoriza todas tus tareas entrantes
- **Proyectos**: Agrupa tareas relacionadas bajo un objetivo común
- **Contextos**: Etiqueta tareas por ubicación o herramienta (@oficina, @teléfono, @computadora)
- **Fechas de Vencimiento**: Planifica con el calendario nativo

### 🎨 Experiencia de Usuario Nativa
- **Modo Oscuro**: Soporte completo de Light/Dark/System
- **Multi-idioma**: Español e Inglés con cambio instantáneo
- **Gestos nativos**: Swipe para completar/eliminar tareas
- **Animaciones fluidas**: Powered by React Native Reanimated
- **Feedback háptico**: Respuesta táctil en acciones importantes

### 📅 Agenda Inteligente
- Vista cronológica de tareas con vencimiento
- Selector de fecha nativo (DatePicker)
- Indicadores inteligentes: "Hoy", "Mañana", "Vencida"

---

## 📸 Capturas de Pantalla

| Inbox | Modo Oscuro | Calendario |
|-------|-------------|------------|
| ![INSERT SCREENSHOT HERE] | ![INSERT SCREENSHOT HERE] | ![INSERT SCREENSHOT HERE] |

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Expo SDK 54 / React Native 0.81.5 |
| **Lenguaje** | TypeScript 5.9 |
| **Navegación** | Expo Router (File-based routing) |
| **Estilos** | NativeWind (TailwindCSS para RN) |
| **Base de Datos** | expo-sqlite + Drizzle ORM |
| **Estado Global** | Zustand (con persistencia AsyncStorage) |
| **Animaciones** | react-native-reanimated |
| **Gestos** | react-native-gesture-handler |
| **Iconos** | lucide-react-native |
| **i18n** | i18next + react-i18next |
| **Haptics** | expo-haptics |
| **DatePicker** | @react-native-community/datetimepicker |

---

## 📁 Arquitectura del Proyecto

```
src/
├── app/                    # 📱 Rutas (Expo Router - File-based)
│   ├── (tabs)/             # Tab Navigator principal
│   │   ├── index.tsx       # Inbox
│   │   ├── projects.tsx    # Proyectos
│   │   ├── engage.tsx      # Ejecutar
│   │   └── review.tsx      # Revisar (Agenda)
│   ├── task/[id].tsx       # Detalle/edición de tarea
│   ├── project/[id].tsx    # Detalle de proyecto
│   ├── settings.tsx        # Configuración
│   └── _layout.tsx         # Layout raíz con providers
│
├── components/             # 🧩 Componentes reutilizables
│   ├── ui/                 # Componentes base (Input, Button)
│   └── TaskItem.tsx        # Tarjeta de tarea
│
├── core/                   # ⚙️ Configuraciones base
│   ├── theme/              # ThemeProvider (Dark Mode)
│   └── i18n/               # Configuración de idiomas
│       └── locales/        # Traducciones (en.json, es.json)
│
├── db/                     # 🗄️ Capa de datos
│   ├── client.ts           # Cliente SQLite
│   ├── schema.ts           # Esquemas Drizzle ORM
│   └── migrations-runner.ts # Sistema de migraciones
│
├── store/                  # 📦 Estado global (Zustand)
│   ├── useTasks.ts         # Store de tareas y contextos
│   ├── useProjects.ts      # Store de proyectos
│   └── useSettings.ts      # Store de preferencias (persist)
│
└── global.css              # Estilos globales TailwindCSS
```

---

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ 
- npm o Yarn
- Expo Go (en tu dispositivo móvil) o Android Studio / Xcode

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/gtd-master.git
cd gtd-master

# 2. Instalar dependencias
npm install
# o con Yarn
yarn install

# 3. Iniciar el servidor de desarrollo
npm start
# o
yarn start
```

### Ejecutar en Dispositivo

```bash
# Android
npm run android

# iOS
npm run ios

# Escanear QR con Expo Go
npm start
```

---

## 🗄️ Sistema de Base de Datos

GTD Master implementa un **sistema de migraciones secuenciales personalizado** que garantiza la integridad de los datos entre versiones.

### ¿Cómo Funciona?

1. **Tabla de Control**: Se crea `_app_migrations` que registra qué versión de schema tiene el usuario.

2. **Migraciones Ordenadas**: Las migraciones se definen como un array ordenado en `migrations-runner.ts`:
   - v1: Tabla `tasks`
   - v2: Tabla `projects`
   - v3: Tabla `contexts`
   - v4: Columna `due_date` en tasks

3. **Ejecución Inteligente**: Al iniciar la app:
   - Lee la versión actual del usuario
   - Compara con la versión del código
   - Ejecuta solo las migraciones pendientes (en transacción)
   - Registra la nueva versión

```typescript
// Ejemplo simplificado del runner
const currentVersion = await getCurrentVersion(); // ej: 2
for (let i = currentVersion; i < MIGRATIONS.length; i++) {
  await db.transaction(async (tx) => {
    await tx.run(MIGRATIONS[i]);
    await tx.insert(appMigrations).values({ version: i + 1 });
  });
}
```

Este sistema permite **agregar nuevas tablas o columnas** sin perder los datos existentes del usuario.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un Issue o Pull Request.

---

<p align="center">
  Hecho con ❤️ usando Expo y React Native
</p>
