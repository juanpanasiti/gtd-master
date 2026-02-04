# 📋 GTD Master

![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active_Development-orange)
![Version](https://img.shields.io/badge/Version-1.7.0-blue)

---

## 📖 Description

**GTD Master** is a professional personal productivity solution rigorously based on David Allen's **Getting Things Done (GTD)** methodology. Designed to transform chaos into calm, GTD Master combines a premium interface with the power of a robust local database (**Offline-First**).

> 📘 **New to GTD?** Check out our [Complete Usage Guide (USAGE.md)](./USAGE.md) to learn the methodology and how to apply it in this app.

### The Complete GTD Workflow:

| Pillar | Functionality | Description |
|-------|---------------|-------------|
| 📥 **Capture** | Inbox & Quick Capture | Ultra-fast capture with Haptics, Deep Linking and Widgets. |
| 🔍 **Clarify** | Inbox Processor Wizard | Intelligent assistant to reach "Inbox Zero" without friction. |
| 📂 **Organize** | Projects & Contexts | Areas of responsibility, Project References, and Contexts. |
| 📅 **Review** | Weekly Review Wizard | Guided step-by-step ritual to keep your system up to date. |
| 🔄 **Repeat** | Recurring Tasks | Automatic tasks (daily, weekly, monthly) with intelligent reset. |
| ⚡ **Engage** | Engage List & Calendar | Next actions filtered by context. **Native Calendar Integration.** |
| 📊 **Reflect** | Perspectives Dashboard | System health visualization, areas, and weekly momentum. |

---

## ✨ Features Update (v1.7.0)

### 📆 Native Calendar Integration
Seamlessly bridge your tasks with your life using our new advanced calendar features:
- **Direct Integration**: Send any task with a *Start Date* or *Due Date* directly to your phone's native calendar app (Google Calendar, Outlook, etc.).
- **Smart Intent**: Uses native Android Intents to open the "Create Event" screen pre-filled with your task details (Title, Date, Description).
- **Full Control**: Review, edit, add alarms, or invite people in your calendar app before saving.
- **Dual Mode**: Separate buttons for "Start Date" (Morning event) and "Due Date" (Deadline event).

### 🧠 Flow Intelligence
- **Recurring Tasks**: Set up routines (daily, weekly, or monthly). The system automatically "resets" them upon completion.
- **Manual Reset FAB**: Floating action button to instantly reset recurring tasks.
- **Step-by-Step Wizards**: Inbox processing and weekly review guides.
- **Visual Milestones**: Confetti celebrations when completing key processes.

### 🔔 Notifications & Habits
- **Daily Briefing**: Dynamic morning notification about due and starting tasks.
- **Fast Capture**: Direct access via Deep Linking (`gtdmaster://inbox/quick`) or Home Screen Widgets.

### 🛡️ Your Data, Your Control
- **True Offline-First**: No login, no mandatory cloud.
- **Data Portability**: Export/Import your entire system via JSON.
- **Global Search**: Real-time filtering across the entire system.

### 🎨 Premium Design & UX
- **Adaptive Dark Mode**: Full Dark/Light mode support.
- **Sensory Feedback**: `expo-haptics` integration.

---

## 🛠️ Technological Stack

| Category | Technology |
|-----------|------------|
| **Core** | Expo SDK 54 / React Native 0.81.5 |
| **Logic** | TypeScript 5.9 |
| **Persistence** | SQLite + Drizzle ORM (custom migration system) |
| **State Management** | Zustand with AsyncStorage persistence |
| **Styling** | NativeWind (TailwindCSS) + Lucide Icons |
| **Integrations** | **Expo Calendar**, **Expo Intent Launcher**, Notifications |
| **UX/UI Extras** | Reanimated, Confetti Cannon, Haptics |
| **I18n** | i18next + expo-localization (English/Spanish) |

---

## 📁 Project Architecture

```
src/
├── app/                    # 📱 Routes (Expo Router)
│   ├── (tabs)/             # Main tabs (Inbox, Organize, Engage, Review)
│   ├── inbox/              # Processing and Quick Capture Wizards
│   ├── project/            # Project, Area, and Reference management
│   ├── task/               # Task Details & Calendar Integration logic
│   ├── review/             # Weekly Review Assistant
│   ├── perspectives.tsx    # Metrics dashboard
│   └── settings.tsx        # Configuration
│
├── components/             # 🧩 UI Kit & TaskItem
├── core/                   # ⚙️ Core Logic
│   ├── calendar/           # 📆 Calendar Service (Permissions & Intents)
│   ├── i18n/               # Internationalization
│   └── theme/              # Theme Provider
├── db/                     # 🗄️ SQLite Client & Drizzle Schema
└── store/                  # 📦 Zustand Stores
```

## 🚀 Installation & Usage

### Prerequisites

- Node.js 18+ 
- Expo Go (limited features) or Android Emulator/Device (Recommended for Calendar features)

### Quick Steps

```bash
# 1. Install dependencies
npm install

# 2. Rebuild Native Code (Required for Calendar/Widgets)
npm run android

# 3. Start development
npm start
```

---

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">
  <b>GTD Master</b> - Clear your mind, focus on what matters.<br>
  Built with ❤️ using the power of Expo.
</p>
