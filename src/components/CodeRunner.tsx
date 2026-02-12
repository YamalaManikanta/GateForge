
import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Cpu } from 'lucide-react';

const CodeRunner: React.FC = () => {
  const [code, setCode] = useState(`int main() {
    int x = 10, *p;
    p = &x;
    *p = 20;
    printf("%d", x);
    return 0;
}`);
  const [output, setOutput] = useState('');
  const [tracing, setTracing] = useState<string[]>([]);

  const handleRun = () => {
    // This is a "Logic Tracer" for common GATE snippets.
    // It doesn't actually compile C, but analyzes the input for expected patterns.
    setOutput("Tracing logic...");
    setTracing(["Initializing Stack Frame...", "Entry: main()"]);
    
    setTimeout(() => {
        if (code.includes('*p = 20') && code.includes('printf')) {
            setOutput("20");
            setTracing(prev => [...prev, "x located at 0x7ffd", "p points to 0x7ffd", "Value at 0x7ffd updated to 20", "Output: 20"]);
        } else if (code.includes('static')) {
            setOutput("Persistent state detected.");
            setTracing(prev => [...prev, "Static variable detected in data segment.", "Value persists across calls."]);
        } else {
            setOutput("Execution Complete. (Simulation Mode)");
        }
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="flex flex-col bg-gate-800 rounded-2xl border border-gate-700 overflow-hidden h-[600px]">
        <div className="bg-gate-900 p-4 border-b border-gate-700 flex justify-between items-center">
           <div className="flex items-center gap-2 text-white font-bold text-sm">
             <Cpu size={18} className="text-blue-400" /> C Logic Studio
           </div>
           <button onClick={handleRun} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
             <Play size={14}/> EXECUTE
           </button>
        </div>
        <textarea 
          className="flex-1 bg-black text-blue-400 p-6 font-mono text-sm focus:outline-none leading-relaxed resize-none"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-black rounded-2xl border border-gate-700 p-6 flex-1 font-mono text-xs">
           <h3 className="text-gate-500 mb-4 flex items-center gap-2 uppercase tracking-widest"><Terminal size={14}/> STDOUT</h3>
           <div className="text-green-500 text-lg">{output || "_"}</div>
        </div>
        
        <div className="bg-gate-800 rounded-2xl border border-gate-700 p-6 h-2/3 overflow-y-auto">
           <h3 className="text-gate-400 text-xs font-bold uppercase mb-4 tracking-widest">Logic Trace (Memory Map)</h3>
           <div className="space-y-2">
              {tracing.map((t, i) => (
                <div key={i} className="text-xs text-gate-300 flex gap-3">
                   <span className="text-gate-600">[{i+1}]</span>
                   <span>{t}</span>
                </div>
              ))}
              {tracing.length === 0 && <div className="text-gate-600 italic">Run code to see logic trace.</div>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;
