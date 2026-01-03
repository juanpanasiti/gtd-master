# 📋 GTD Master

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Version](https://img.shields.io/badge/Version-1.5.0-blue)

---

## 📖 Description

**GTD Master** is a professional personal productivity solution rigorously based on David Allen's **Getting Things Done (GTD)** methodology. Designed to transform chaos into calm, GTD Master combines a premium interface with the power of a robust local database (**Offline-First**).

> 📘 **New to GTD?** Check out our [Complete Usage Guide (USAGE.md)](./USAGE.md) to learn the methodology and how to apply it in this app.

### The Complete GTD Workflow:

| Pillar | Functionality | Description |
|-------|---------------|-------------|
| 📥 **Capture** | Inbox & Quick Capture | Ultra-fast capture with Haptics and Deep Linking. |
| 🔍 **Clarify** | Inbox Processor Wizard | Intelligent assistant to reach "Inbox Zero" without friction. |
| 📂 **Organize** | Projects & Contexts | Areas of responsibility, Project References, and Contexts. |
| 📅 **Review** | Weekly Review Wizard | Guided step-by-step ritual to keep your system up to date. |
| 🔄 **Repeat** | Recurring Tasks | Automatic tasks (daily, weekly, monthly) with intelligent reset. |
| ⚡ **Engage** | Engage List | Next actions grouped by context and filtered by start date. |
| 📊 **Reflect** | Perspectives Dashboard | System health visualization, areas, and weekly momentum. |

---

## ✨ Refinement Features (v1.5.0)

### 🧠 Flow Intelligence
- **Recurring Tasks**: Set up routines (daily, weekly, or monthly). The system automatically "resets" them upon completion according to their cycle.
- **Manual Reset FAB**: Floating action button in projects to instantly reset all recurring tasks for a session.
- **Step-by-Step Wizards**: Inbox processing and weekly review through interactive guides.
- **Visual Milestones**: Confetti celebrations and smooth transitions when completing key processes.
- **Project References**: Save support material (notes, links) directly linked to your projects.

### 🔔 Notifications & Habits
- **Daily Briefing**: Dynamic morning notification informing you how many tasks are due and starting today.
- **Custom Reminders**: Freely configure the day and time for your Weekly Review and Daily Briefing.
- **Fast Capture**: Direct access via Deep Linking (`gtdmaster://inbox/quick`) to capture ideas instantly.

### 🛡️ Your Data, Your Control
- **True Offline-First**: No login, no mandatory cloud. Everything lives on your device.
- **Data Portability**: Export and import your entire system in a standard JSON file for backups or migration.
- **Global Search**: Real-time filtering for tasks, projects, and reference material from any tab.

### 🎨 Premium Design & UX
- **Adaptive Dark Mode**: Full Dark/Light mode support with a modern and professional aesthetic.
- **Sensory Feedback**: `expo-haptics` integration for a satisfying tactile response.
- **Unified UI**: Premium custom headers consistent across all main sections.

---

## 🛠️ Technological Stack

| Category | Technology |
|-----------|------------|
| **Core** | Expo SDK 54 / React Native 0.81.5 |
| **Logic** | TypeScript 5.9 |
| **Persistence** | SQLite + Drizzle ORM (with custom migration system) |
| **State Management** | Zustand with AsyncStorage persistence |
| **Styling** | NativeWind (TailwindCSS) + Lucide Icons |
| **UX/UI Extras** | Reanimated, Confetti Cannon, Haptics |
| **I18n** | i18next (Full English/Spanish support) |
| **System APIs** | Notifications, Sharing, Document Picker, File System |

---

## 📁 Project Architecture

```
src/
├── app/                    # 📱 Routes (Expo Router)
│   ├── (tabs)/             # Main tabs (Inbox, Organize, Engage, Review)
│   ├── inbox/              # Processing and Quick Capture Wizards
│   ├── project/            # Project, Area, and Reference management
│   ├── review/             # Weekly Review Assistant
│   ├── perspectives.tsx    # Metrics dashboard and data management
│   ├── search.tsx          # Global search screen
│   └── settings.tsx        # Notification, language, and theme configuration
│
├── components/             # 🧩 UI Kit & TaskItem
├── core/                   # ⚙️ i18n, Theme, Notifications & DataService
├── db/                     # 🗄️ SQLite Client, Schemas & Migration Runner
└── store/                  # 📦 Zustand Stores (Tasks, Projects, Settings)
```

---

## 🚀 Installation & Usage

### Prerequisites

- Node.js 18+ 
- Expo Go (mobile) or Simulator (Android/iOS)

### Quick Steps

```bash
# 1. Install dependencies
npm install

# 2. Start development
npm start

# 3. Android / iOS
npm run android
npm run ios
```

---

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">
  <b>GTD Master</b> - Clear your mind, focus on what matters.<br>
  Built with ❤️ using the power of Expo.
</p>
