🚀 GATE Forge
The Offline-First Command Center for GATE CSE Aspirants
![alt text](https://via.placeholder.com/1200x400.png?text=GATE+Forge+Dashboard+Preview)

(Replace this link with a real screenshot of your Dashboard)
📖 Overview
GATE Forge is a high-performance, offline-first desktop application designed specifically for Computer Science Engineering students preparing for the Graduate Aptitude Test in Engineering (GATE).
Unlike generic study tools, GATE Forge allows students to track syllabus dependencies via a Directed Acyclic Graph (DAG), simulate execution of C code for output-based questions, and practice with a pixel-perfect replica of the official TCS Ion Virtual Calculator—all without an internet connection.
🛠️ Tech Stack
Core Framework: React 18
Language: TypeScript
Runtime/Shell: Electron (Main Process)
Build Tool: Vite
Styling: Tailwind CSS
Visualization: Recharts (Analytics) & Native SVG (Dependency Graphs)
Persistence: LocalStorage + Node.js File System (fs)
🏗️ System Architecture
GATE Forge utilizes a "Fat Client" Hybrid Architecture. It bypasses the need for a remote backend server to ensure zero latency and full offline capability.
1. The Security Model
The application uses a permissive security model configured in electron/main.ts (nodeIntegration: true, contextIsolation: false).
Why? This allows the React Renderer process to directly access the User's File System via Node.js APIs.
Benefit: Users can paste screenshots of questions directly into the app, which are then saved securely to their %APPDATA% folder, ensuring data persists even if browser cache is cleared.
2. Data Persistence Layer
The app employs a dual-storage strategy:
Structured Data (JSON): User profile, mock scores, study logs, and flashcards are stored in localStorage via a custom wrapper (storageService.ts).
Binary Assets (Images/PDFs): Large files are intercepted, compressed via HTML5 Canvas, and written to the local disk using fs.writeFileSync.
3. Dependency Graph Logic
The syllabus is modeled not as a list, but as a DAG (Directed Acyclic Graph).
Logic: Subject B (e.g., Computer Networks) is "Locked" until Subject A (e.g., Operating Systems) is marked complete.
Implementation: Recursive graph traversal checks node status in real-time to visualize "Available" vs. "Locked" learning paths.
📂 Project Structure
code
Bash
GATE-FORGE/
├── electron/               # ⚡ Electron Main Process
│   ├── main.ts             # App entry, window creation, native bridge
│   └── preload.ts          # Context bridge (minimal usage)
├── src/                    # ⚛️ React Renderer Process
│   ├── components/         # UI Components
│   │   ├── Dashboard.tsx       # Main analytics hub
│   │   ├── VirtualCalculator.tsx # TCS Ion Replica
│   │   ├── CodeRunner.tsx      # C Logic Simulator
│   │   ├── DependencyGraph.tsx # Syllabus DAG visualization
│   │   └── ... (Trackers, Flashcards, etc.)
│   ├── services/           # Data Logic
│   │   └── storageService.ts   # CRUD operations for LocalStorage
│   ├── utils/              # Helper Functions
│   │   ├── fileSystem.ts       # Node.js fs wrapper for saving images
│   │   ├── dateHelpers.ts      # Timezone-safe date parsing
│   │   └── imageCompressor.ts  # Canvas-based JPEG compression
│   ├── App.tsx             # Main Routing & Layout
│   └── types.ts            # TypeScript Interfaces (Models)
├── dist/                   # Production build (Frontend)
├── dist-electron/          # Production build (Backend)
└── vite.config.ts          # Build configuration
✨ Key Features & Modules
1. 🧮 Virtual Calculator (TCS Ion Replica)
A complete re-implementation of the exam calculator.
Features: Logarithms, Trigonometry, Memory functions.
Speed Drill Mode: Generates random math problems to improve calculation speed and mouse accuracy.
Tech: Custom state machine to handle infix-to-postfix logic and UI updates.
2. 🧬 Syllabus Dependency Graph
Visualizes the "Prerequisite Chain" of CS subjects.
Example: Digital Logic → COA → OS.
Tech: Hand-crafted SVG with Bezier curves calculated dynamically based on node coordinates.
3. 🖥️ Code Runner (Logic Studio)
A simulation environment for C programming questions.
Purpose: Helps students trace "Output Finding" questions involving Pointers and Recursion.
Mechanism: It simulates the memory stack and static variable behavior visually (Note: It is a simulation engine, not a full GCC compiler).
4. 📈 Mock & Error Analytics
Ghost Competitor: Users can upload a "Ghost JSON" file to compare their mock test trajectory against a topper's historical data.
Negative Marking Bleed: Automatically calculates how many marks are lost to negative marking based on accuracy.
🚀 Getting Started
Prerequisites
Node.js (v18 or higher)
npm or yarn
Installation
Clone the repository:
code
Bash
git clone https://github.com/yourusername/gate-forge.git
cd gate-forge
Install dependencies:
code
Bash
npm install
Run in Development Mode:
code
Bash
npm run dev
This starts the Vite server and launches the Electron window with Hot Module Replacement (HMR).
Build for Production (Windows .exe):
code
Bash
npm run build
The executable will be generated in the dist_installer folder.
💾 Data Management
Backup & Restore
Since data is local, GATE Forge includes a Data Control module.
Export: Generates a single .json file containing all logs, scores, and base64-encoded assets.
Import: Parses the JSON and hydrates the application state.
Nuke: One-click wipe of localStorage for a fresh start.
File System Permissions
The app writes to:
C:\Users\<Name>\AppData\Roaming\GATE Forge\assets\
🔮 Future Roadmap
AI Question Generator: Integration with local LLMs (like Ollama) to generate quiz questions from notes.
Pomodoro Focus Timer: Linked specifically to subject logs.
Linux/Mac Builds: Configuring electron-builder for cross-platform support.
🤝 Contributing
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
