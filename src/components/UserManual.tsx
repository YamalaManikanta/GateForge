
import React from 'react';
import { X, HardDrive, Layout, PenTool, TrendingUp, Brain, BookOpen, AlertTriangle } from 'lucide-react';

interface UserManualProps {
  onClose: () => void;
}

const Section = ({ title, icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="mb-8 border-b border-gate-800 pb-8 last:border-0 last:pb-0 animate-slide-up">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
      <div className="p-2 bg-gate-800 rounded-lg text-gate-200 border border-gate-700">{icon}</div>
      {title}
    </h3>
    <div className="space-y-4 pl-2 md:pl-4 border-l-2 border-gate-800 ml-4">
      {children}
    </div>
  </div>
);

const Feature = ({ name, desc, steps }: { name: string, desc: string, steps?: string[] }) => (
  <div className="bg-gate-900/40 p-5 rounded-xl border border-gate-800 hover:border-gate-600 transition-colors">
    <h4 className="text-gate-100 font-bold text-base mb-2 flex items-center gap-2">
      {name}
    </h4>
    <p className="text-sm text-gate-400 mb-4 leading-relaxed">{desc}</p>
    {steps && (
      <div className="bg-black/30 rounded-lg p-3">
        <div className="text-[10px] font-bold uppercase text-gate-500 mb-2 tracking-widest">How to Use</div>
        <ul className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="text-xs text-gate-300 flex items-start gap-2">
              <span className="text-gate-600 font-mono select-none">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-3xl bg-gate-950 border-l border-gate-800 h-full overflow-y-auto shadow-2xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 bg-gate-950/95 backdrop-blur border-b border-gate-800 p-6 flex justify-between items-center z-20">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               <BookOpen className="text-gate-100"/> Forge Manual
            </h2>
            <p className="text-gate-500 text-sm">Comprehensive Operational Guide v1.5</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gate-800 rounded-lg text-gate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-2">

          {/* 1. CORE SYSTEM */}
          <Section title="1. Core Architecture & Data Safety" icon={<HardDrive size={20} />}>
             <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex gap-4 items-start">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                <div className="space-y-2">
                  <h4 className="text-red-400 font-bold text-sm uppercase">Critical Warning</h4>
                  <p className="text-sm text-red-200 leading-relaxed">
                    GATE Forge is an <strong>Offline-First</strong> application. It does NOT store data on any server. 
                    Your data lives in your browser's Local Storage.
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-300/80 space-y-1">
                    <li>Running "System Cleaners" (CCleaner, etc.) will delete your data.</li>
                    <li>Clearing Browser History/Cache will delete your data.</li>
                    <li>Using Incognito Mode will not save data after you close the window.</li>
                  </ul>
                </div>
             </div>
             
             <Feature 
               name="Backup & Restore (The Lifeboat)" 
               desc="To prevent data loss, you must manually create backups."
               steps={[
                 "Go to the 'Settings' tab.",
                 "Click 'Download .json'. This saves a file to your computer.",
                 "Store this file safely (Google Drive, Email, etc.).",
                 "To restore data (or move to another computer), click 'Import .json' and select your backup file."
               ]}
             />
          </Section>

          {/* 2. STRATEGY & PLANNING */}
          <Section title="2. Strategic Planning" icon={<Layout size={20} />}>
            <Feature 
               name="Dashboard & Directives" 
               desc="Your command center. The 'Directives' panel is an automated decision engine."
               steps={[
                 "Directives are auto-generated based on your logs.",
                 "If error count is high (>5), it orders 'Fix Leaks'.",
                 "If study streak is broken, it orders 'Maintain Streak'.",
                 "The 'Ghost' feature allows you to load a JSON file from a topper/friend to overlay their graph onto yours for comparison."
               ]}
            />
            <Feature 
               name="Master Plan (Syllabus Tracker)" 
               desc="Project management for the GATE syllabus. Breaks subjects into 'Phases'."
               steps={[
                 "Mark phases as 'Done' or track revision counts (R1, R2, R3).",
                 "Click 'Manual Edit' to add custom phases or change dates.",
                 "Use 'Smart Reschedule' if you fall behind. It mathematically redistributes remaining subjects to ensure you finish exactly 30 days before the exam."
               ]}
            />
            <Feature 
               name="Dependency Map" 
               desc="A Directed Acyclic Graph (DAG) visualizing subject prerequisites."
               steps={[
                 "Green nodes = Completed.",
                 "Yellow nodes = Unlocked & Recommended (Parents completed).",
                 "Grey nodes = Locked (Prerequisites missing).",
                 "Click any node to see its specific parent dependencies in the 'Assistant' panel."
               ]}
            />
          </Section>

          {/* 3. KNOWLEDGE TOOLS */}
          <Section title="3. Knowledge & Resources" icon={<Brain size={20} />}>
            <Feature 
               name="Memory Forge (Flashcards)" 
               desc="Implements the 'Leitner System' for Spaced Repetition."
               steps={[
                 "Box 1: Reviewed Daily. (New/Hard cards)",
                 "Box 2: Reviewed every 2 days.",
                 "Box 3: Reviewed every 4 days, and so on.",
                 "If you click 'Forgot' or 'Hard', the card resets to Box 1.",
                 "If you click 'Good' or 'Easy', it promotes to a higher box."
               ]}
            />
            <Feature 
               name="Syllabus Info & Resources" 
               desc="A digital binder for your syllabus and notes."
               steps={[
                 "Paste images (Ctrl+V) directly into the 'Resources' tab to save questions/snippets.",
                 "Upload PDFs (max 1.5MB) for quick reference.",
                 "Images are automatically compressed to save storage space."
               ]}
            />
          </Section>

          {/* 4. PRACTICE & EXECUTION */}
          <Section title="4. Practice & Execution" icon={<PenTool size={20} />}>
             <Feature 
               name="Mock Analyzer" 
               desc="Deep analytics for your test series performance."
               steps={[
                 "Click 'Log Test' after every mock.",
                 "Enter total marks, score, and attempts.",
                 "The system calculates 'Accuracy' and 'Estimated Negative Marks'.",
                 "Verdict: If Accuracy < 75%, it flags 'High Error'. If Speed > 3.5 min/q, it flags 'Slow'."
               ]}
            />
            <Feature 
               name="Error Log (The Black Book)" 
               desc="The most important tool for rank improvement. Tracks why you fail."
               steps={[
                 "Log every single mistake from mocks/practice.",
                 "Categorize it: 'Silly', 'Conceptual', or 'Time'.",
                 "Be honest with 'Time Wasted'.",
                 "Upload a photo of the question/solution if needed."
               ]}
            />
            <Feature 
               name="Code Runner (Logic Tracer)" 
               desc="A simulation environment for C Programming questions. It does NOT compile code."
               steps={[
                 "Type C snippets involving Pointers, Recursion, or Static variables.",
                 "Click 'Execute'.",
                 "The system 'traces' the logic step-by-step (e.g., updating stack frames, modifying pointer values) to help you visualize execution flow."
               ]}
            />
            <Feature 
               name="Virtual Calculator" 
               desc="A replica of the official GATE calculator interface."
               steps={[
                 "Use the 'Speed Trainer' panel on the right.",
                 "It generates random math expressions.",
                 "Solve them using the calculator buttons (mouse only) to build muscle memory and speed."
               ]}
            />
          </Section>

          {/* 5. ANALYTICS */}
          <Section title="5. Analytics & Optimization" icon={<TrendingUp size={20} />}>
             <Feature 
               name="Daily Protocol" 
               desc="Habit tracker for consistency."
               steps={[
                 "Log your study hours by subject.",
                 "Rate your 'Focus Level' (1-5).",
                 "Input 'Qs Attempted' vs 'Qs Correct' to track daily accuracy.",
                 "The 'Weakest Concept' field forces you to identify one gap every day."
               ]}
            />
            <Feature 
               name="Subject Yield" 
               desc="ROI Analysis (Return on Investment)."
               steps={[
                 "Compares 'Hours Invested' vs 'Errors Made'.",
                 "High Hours + High Errors = 'Time Sink'. You are studying inefficiently.",
                 "Low Hours + Low Errors = 'Safe Zone'."
               ]}
            />
            <Feature 
               name="Strategy Simulator" 
               desc="A 'What-If' analysis tool for exam day."
               steps={[
                 "Input your average accuracy.",
                 "Select a risk profile (Conservative/Aggressive).",
                 "It calculates the optimal number of questions to attempt to maximize score while minimizing negative marking risk."
               ]}
            />
          </Section>

           <div className="bg-blue-950/20 border border-blue-900/30 p-6 rounded-xl text-center space-y-2 mt-8">
              <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Final Note</h4>
              <p className="text-sm text-blue-200 italic">
                "The system works if you work the system. Be consistent. Be honest with your data."
              </p>
           </div>
           
           <div className="h-12"></div> {/* Spacer */}
        </div>
      </div>
    </div>
  );
};

export default UserManual;
