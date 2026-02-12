import React, { useState } from 'react';

type RiskProfile = 'Conservative' | 'Balanced' | 'Aggressive';

const StrategySimulator: React.FC = () => {
  const [accuracy, setAccuracy] = useState<number>(80);
  const [profile, setProfile] = useState<RiskProfile>('Balanced');
  
  const calculateStrategy = () => {
    let recommendedAttempts = 0;
    let stopThreshold = 0;
    
    if (profile === 'Conservative') {
        recommendedAttempts = 45; 
        stopThreshold = 50; 
    } else if (profile === 'Balanced') {
        recommendedAttempts = 55;
        stopThreshold = 60;
    } else {
        recommendedAttempts = 65; 
        stopThreshold = 65;
    }

    const expectedCorrect = Math.floor(recommendedAttempts * (accuracy / 100));
    const expectedWrong = recommendedAttempts - expectedCorrect;
    const expectedScore = (expectedCorrect * 1.5) - (expectedWrong * 0.5);
    
    return { recommendedAttempts, expectedScore: expectedScore.toFixed(1), stopThreshold };
  };

  const { recommendedAttempts, expectedScore, stopThreshold } = calculateStrategy();

  return (
    <div className="bg-gate-800 p-8 rounded-xl border border-gate-700 space-y-8 animate-fade-in shadow-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Attempt Strategy Simulator</h2>
        <p className="text-gate-500 text-sm mt-1">Configure your engine.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
           <div>
             <label className="block text-gate-300 text-xs font-bold uppercase mb-3">Your Avg Accuracy (%)</label>
             <input type="range" min="50" max="100" value={accuracy} onChange={e => setAccuracy(Number(e.target.value))} className="w-full accent-white" />
             <div className="text-right text-white font-mono font-bold text-xl mt-2">{accuracy}%</div>
           </div>

           <div>
             <label className="block text-gate-300 text-xs font-bold uppercase mb-3">Risk Profile</label>
             <div className="flex gap-2">
               {(['Conservative', 'Balanced', 'Aggressive'] as RiskProfile[]).map(p => (
                 <button key={p}
                   onClick={() => setProfile(p)}
                   className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${profile === p ? 'bg-white text-black scale-105' : 'bg-black text-gate-500 border border-gate-700'}`}
                 >
                   {p}
                 </button>
               ))}
             </div>
             <p className="text-xs text-gate-500 mt-3 italic bg-gate-900 p-3 rounded border border-gate-800">
               {profile === 'Conservative' ? 'Minimize negatives. Skip if unsure. Safe play.' : 
                profile === 'Balanced' ? 'Calculated risks. The standard champion approach.' :
                'Maximize attempts. High risk, high reward. Only for <75% acc.'}
             </p>
           </div>
        </div>

        <div className="bg-black p-8 rounded-xl border border-gate-700 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden">
           {/* Decorative background element */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

           <div className="relative z-10">
             <div className="text-gate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Optimal Attempts</div>
             <div className="text-5xl font-bold text-white tracking-tighter">{recommendedAttempts} <span className="text-xl text-gate-600 font-normal">/ 65</span></div>
           </div>
           
           <div className="w-16 h-1 bg-gate-800 rounded-full relative z-10"></div>

           <div className="relative z-10">
             <div className="text-gate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Expected Score</div>
             <div className="text-4xl font-bold text-white">~{expectedScore}</div>
           </div>

           <div className="text-xs font-medium text-red-400 bg-red-950/30 px-4 py-2 rounded-full border border-red-900/50 relative z-10">
             Hard Stop @ {stopThreshold} Qs
           </div>
        </div>
      </div>
    </div>
  );
};

export default StrategySimulator;