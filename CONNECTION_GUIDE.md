# GATE Forge - Architecture & Connection Guide

## 1. Architecture Overview

**GATE Forge** is a hybrid desktop application built using **Electron** (for the native shell) and **React** (for the UI), bundled together by **Vite**.

*   **Frontend (Renderer):** React 18, Tailwind CSS, Recharts.
*   **Backend (Main Process):** Electron (Node.js context).
*   **Build System:** Vite.
*   **Data Strategy:** Offline-first. Uses `localStorage` for JSON data and direct File System (`fs`) access for saving images/assets to the user's `AppData` folder.

### Security Model
This application uses a **Permissive Security Model** to function as a local power-tool:
*   `nodeIntegration: true`
*   `contextIsolation: false`
*   `webSecurity: false` (to allow loading local file:// resources)

> **Note:** This configuration allows the React code to import Node.js modules (like `fs` and `path`) directly using `window.require`.

---

## 2. Directory Structure

```text
GATE-FORGE/
├── electron/               # ⚡ Electron Main Process
│   ├── main.ts             # App entry point (Window creation)
│   └── preload.ts          # Bridge script (Minimal use here)
├── src/                    # ⚛️ React Renderer Process
│   ├── components/         # Dashboard, Tracker, Calculator, etc.
│   ├── services/           # storageService.ts (LocalStorage wrapper)
│   ├── utils/              # fileSystem.ts (Node.js fs wrapper)
│   ├── App.tsx             # Main routing/layout logic
│   └── main.tsx            # React DOM entry
├── dist/                   # (Generated) Production frontend build
├── dist-electron/          # (Generated) Production backend build
├── public/                 # Static assets (icons)
├── vite.config.ts          # Vite configuration + Electron plugin
├── tailwind.config.js      # Tailwind styling config
└── package.json            # Dependencies & Scripts
```

---

## 3. Setup & Installation

### Prerequisites
*   **Node.js** (LTS version recommended, e.g., v18 or v20).
*   **npm** (comes with Node.js).

### Installation
1.  Open your terminal in the project folder.
2.  Install all dependencies defined in `package.json`:
    ```bash
    npm install
    ```

---

## 4. Development Workflow

To start the app in development mode with **Hot Module Replacement (HMR)**:

```bash
npm run dev
```

**What happens:**
1.  Vite starts a local web server (usually `http://localhost:5173`).
2.  Vite compiles `electron/main.ts` on the fly.
3.  Electron launches and loads the localhost URL.
4.  Any changes to `src/*.tsx` files will instantly update the Electron window.

> **Troubleshooting:** If you see a white screen, check the terminal for TypeScript errors.

---

## 5. Building for Production

To generate the standalone Windows executable (`.exe`):

```bash
npm run build
```

**Build Pipeline:**
1.  `tsc`: TypeScript type checking.
2.  `vite build`: Compiles React to `dist/` and Electron to `dist-electron/`.
3.  `electron-builder`: Packages everything into an installer located in `dist_installer/`.

### Testing the Build locally
To preview the production build without running the full installer:

```bash
npm run preview
```

---

## 6. Key Integrations

### File System Access (`src/utils/fileSystem.ts`)
We bypass the browser sandbox to save images permanently.
```typescript
// How we access Node.js in React
const fs = (window as any).require('fs');
const path = (window as any).require('path');
// Saves to: %APPDATA%/GATE Forge/assets/
```

### Styling (`tailwind.config.js`)
Tailwind is configured to scan all `./src` files. Styles are injected via `src/index.css`.
*   **Theme:** Custom colors defined in `tailwind.config.js` map to CSS variables in `index.css` (e.g., `bg-gate-950`).

### Graphing (`recharts`)
Used for performance analytics.
*   **Dependencies:** `recharts`, `react`, `react-dom`.

### Search (`fuse.js`)
Used in `KnowledgeBot.tsx` for fuzzy searching the offline database.

---

## 7. Common Issues & Fixes

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **"require is not defined"** | You opened the app in a regular Chrome browser (localhost:5173). | Use the **Electron window** that pops up when running `npm run dev`. |
| **White Screen in Production** | `base` path in `index.html` is incorrect. | Ensure `base: './'` is set in `vite.config.ts`. |
| **Images not loading** | Local file security blocked. | `webSecurity: false` must be set in `electron/main.ts`. |
| **Tailwind styles missing** | `index.css` not imported. | Ensure `import './index.css'` is at the top of `src/main.tsx`. |

