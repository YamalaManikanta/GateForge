
# 🚀 GATE Forge

### The Offline-First Command Center for GATE CSE Aspirants

> A high-performance desktop productivity system built with **React + Electron**, designed specifically for serious GATE CSE preparation.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Why GATE Forge?](#-why-gate-forge)
* [Core Features](#-core-features)
* [System Architecture](#-system-architecture)
* [Data Persistence Strategy](#-data-persistence-strategy)
* [Project Structure](#-project-structure)
* [Module Breakdown](#-module-breakdown)
* [Technical Challenges Solved](#-technical-challenges-solved)
* [Installation & Setup](#-installation--setup)
* [Build & Distribution](#-build--distribution)
* [Data Management](#-data-management)
* [Security Model](#-security-model)
* [Future Roadmap](#-future-roadmap)
* [License](#-license)

---

# 📖 Overview

**GATE Forge** is an offline-first desktop application built for Computer Science Engineering students preparing for the **GATE examination**.

It replaces:

* ❌ Excel trackers
* ❌ Random notebooks
* ❌ Scattered browser tabs
* ❌ Disconnected tools

With a unified, data-driven **Command Center**.

No cloud dependency.
No internet required.
100% local ownership of data.

---

# 💡 Why GATE Forge?

GATE preparation involves:

* Syllabus dependency management
* Mock test analytics
* Revision scheduling
* Coding logic tracing
* Calculation drills

Generic tools don’t understand exam structure.
GATE Forge is purpose-built for it.

---

# 🛠 Tech Stack

| Layer               | Technology                           |
| ------------------- | ------------------------------------ |
| Frontend            | React 18 + TypeScript                |
| Desktop Shell       | Electron                             |
| Build Tool          | Vite                                 |
| Styling             | Tailwind CSS                         |
| Charts              | Recharts                             |
| Graph Visualization | Native SVG                           |
| Data Storage        | LocalStorage + Node.js `fs`          |
| State Management    | React Context + custom service layer |

---

# 🏗 System Architecture

GATE Forge follows a **Fat Client Hybrid Architecture**.

```
Electron Main Process (Node.js)
        ↓
Renderer Process (React + TS)
        ↓
LocalStorage + File System
```

## 1️⃣ Main Process (Electron)

Responsible for:

* Window lifecycle
* Native OS integration
* File system permissions
* External link handling

## 2️⃣ Renderer Process (React)

Responsible for:

* UI rendering
* Business logic
* State management
* Analytics computation
* Graph visualization

## 3️⃣ Direct Node Bridge

The app uses:

```ts
nodeIntegration: true
contextIsolation: false
```

This allows direct usage of:

```ts
import fs from "fs"
import path from "path"
```

This eliminates complex IPC layers for the offline use case.

---

# 💾 Data Persistence Strategy

## 🧠 1. Structured Data (JSON)

Stored in:

```js
localStorage
```

Includes:

* User profile
* Study logs
* Mock scores
* Flashcards
* Subject completion

Managed via:

```
storageService.ts
```

(Acts like a mini ORM over LocalStorage.)

---

## 🖼 2. Binary Assets

When a user pastes a screenshot:

1. Clipboard intercepted
2. Image compressed via HTML5 Canvas
3. Converted to buffer
4. Saved using:

```ts
fs.writeFileSync()
```

Stored in:

```
%APPDATA%/GATE Forge/assets/
```

---

## 🔁 3. Backup & Restore

* Export full app state → single `.json`
* Import JSON → hydrate state
* One-click wipe option

User owns 100% of their data.

---

# 📂 Project Structure

```
GATE-FORGE/
│
├── electron/
│   ├── main.ts
│   └── preload.ts
│
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── VirtualCalculator.tsx
│   │   ├── CodeRunner.tsx
│   │   ├── DependencyGraph.tsx
│   │   ├── FlashcardForge.tsx
│   │   └── MockTracker.tsx
│   │
│   ├── services/
│   │   └── storageService.ts
│   │
│   ├── utils/
│   │   ├── fileSystem.ts
│   │   ├── imageCompressor.ts
│   │   └── dateHelpers.ts
│   │
│   ├── types.ts
│   └── App.tsx
│
├── dist/
├── dist-electron/
└── vite.config.ts
```

---

# ✨ Core Features

---

## 🧮 Virtual Calculator

* Pixel-accurate TCS Ion replica
* Trigonometry, log, memory functions
* Drill Mode (speed + accuracy tracking)
* Custom infix → postfix evaluator

---

## 🧬 Syllabus Dependency Graph

Syllabus modeled as a **Directed Acyclic Graph (DAG)**.

Example chain:

```
Discrete Math → Algorithms → TOC
Digital Logic → COA → OS
```

Features:

* Locked / Unlocked subjects
* Real-time node state updates
* SVG-based dynamic edge rendering

---

## 🖥 Code Runner (C Logic Simulator)

Purpose: Solve GATE “Output Finding” questions.

Not a full GCC compiler.

Simulates:

* Stack frames
* Recursion depth
* Pointer behavior
* Static variables

Visual memory model improves conceptual clarity.

---

## 📊 Mock Tracker & Analytics Engine

User logs:

* Score
* Attempts
* Accuracy

App calculates:

* Negative Marking Bleed
* Accuracy trends
* Risk profile
* Predicted score trajectory

Includes:

* Ghost Topper comparison curve

---

## 🗂 Flashcard Forge (Leitner System)

Spaced repetition engine.

Cards move across:

```
Box 1 → Box 2 → Box 3 → Mastered
```

Based on recall strength.

---

## 🔥 Daily Protocol (Heatmap)

GitHub-style contribution graph.

Tracks:

* Daily study hours
* Subject consistency
* Yearly discipline pattern

---

# 🧠 Technical Challenges Solved

### 1️⃣ Image Compression

Problem:
Large pasted screenshots slowed the app.

Solution:
Canvas-based JPEG compression before disk write.

---

### 2️⃣ State Synchronization

Completing a subject unlocks graph nodes.

Solved via:

* React Context
* Centralized storage service
* Derived state calculations

---

### 3️⃣ Electron Routing Issue

White screen in production build.

Solution:

* HashRouter
  OR
* Proper Vite base path config

---

### 4️⃣ Offline Data Integrity

No backend.
All state must remain consistent locally.

Solved with:

* Structured JSON schemas
* TypeScript strict typing
* Controlled hydration process

---

# 🚀 Installation & Setup

## Prerequisites

* Node.js ≥ 18
* npm or yarn

---

## Clone Repository

```bash
git clone https://github.com/YamalaManikanta/gate-forge.git
cd gate-forge
```

---

## Install Dependencies

```bash
npm install
```

---

## Run in Development Mode

```bash
npm run dev
```

Starts:

* Vite dev server
* Electron window
* Hot Module Replacement

---

# 📦 Build & Distribution

## Production Build

```bash
npm run build
```

Output:

* Frontend → `dist/`
* Electron → `dist-electron/`
* Installer → `dist_installer/`

---

# 🔐 Security Model

⚠️ The app uses a permissive model:

```ts
nodeIntegration: true
contextIsolation: false
```

This is acceptable because:

* It is offline-first
* No remote content is loaded
* All code is bundled locally

If migrating to a cloud version:
A proper IPC + context bridge model is recommended.

---

# 🔮 Future Roadmap

* ⏱ Pomodoro Focus Timer (subject-linked)
* 🤖 Local LLM integration (offline quiz generator)
* 🐧 Linux & macOS builds
* 📈 Advanced predictive scoring model
* ☁ Optional encrypted cloud sync

---

# 🤝 Contributing

1. Fork the repo
2. Create a branch

   ```
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes

   ```
   git commit -m "Add AmazingFeature"
   ```
4. Push branch

   ```
   git push origin feature/AmazingFeature"
   ```
5. Open Pull Request

---

# 📄 License

Distributed under the MIT License.

---

# ❤️ Built for the GATE Community

GATE Forge is not just a tracker.
It is a preparation operating system.

* Or upgrade it into a **technical whitepaper version**
* Or restructure it for a **portfolio case study page**

Tell me which direction you want.
