import React, { useState, useEffect } from 'react';
import { UserProfile, SchedulePhase } from '../types';
import { DEFAULT_SCHEDULE_TEMPLATE } from '../constants';
import { saveUserProfile, saveSchedule } from '../services/storageService';
import { Terminal, Calendar, ArrowRight, Check, Plus, Trash2, CalendarOff, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [targetYears, setTargetYears] = useState<number[]>([]);
  const [schedule, setSchedule] = useState<SchedulePhase[]>([]);
  
  const AVAILABLE_YEARS = [2026, 2027, 2028, 2029, 2030];

  useEffect(() => {
    const freshSchedule = DEFAULT_SCHEDULE_TEMPLATE.map((phase) => {
        return {
            ...phase,
            isUndecided: true 
        };
    });
    setSchedule(freshSchedule);
  }, []);

  const handleNextStep = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && targetYears.length > 0) {
      setStep(3);
    }
  };

  const toggleYear = (year: number) => {
    setTargetYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort()
    );
  };

  const handleFinish = () => {
    const primaryYear = Math.min(...targetYears);
    const calculatedExamDate = `${primaryYear}-02-05T09:00:00`;

    const profile: UserProfile = {
      name: name.trim(),
      examDate: calculatedExamDate,
      targetYears: targetYears,
      isSetupComplete: true
    };
    saveUserProfile(profile);
    
    const finalSchedule = schedule.map(p => ({
        ...p,
        start: p.isUndecided ? '' : p.start,
        end: p.isUndecided ? '' : p.end
    }));
    saveSchedule(finalSchedule);
    
    onComplete();
  };

  const updatePhase = (id: string, field: keyof SchedulePhase, value: any) => {
    setSchedule(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPhase = () => {
    const newPhase: SchedulePhase = {
      id: `custom_${Date.now()}`,
      name: 'New Phase',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      isUndecided: true
    };
    setSchedule(prev => [...prev, newPhase]);
  };

  const removePhase = (id: string) => {
    setSchedule(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gate-950 flex flex-col items-center justify-center p-6 text-gate-300 relative overflow-hidden">
      {/* Background Grid - Set to pointer-events-none to prevent blocking */}
      <div className="fixed inset-0 bg-grid-pattern z-0 opacity-20 pointer-events-none"></div>
      
      {/* Main Card - Boosted Z-Index to 50 to float above everything */}
      <div className="w-full max-w-3xl bg-gate-900/90 backdrop-blur-xl border border-gate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up relative">
        
        <div className="h-1 bg-gate-800 w-full flex">
           <div className={`h-full bg-blue-500 transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ width: '33%' }}></div>
           <div className={`h-full bg-blue-500 transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`} style={{ width: '33%' }}></div>
           <div className={`h-full bg-blue-500 transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} style={{ width: '34%' }}></div>
        </div>

        <div className="p-8 relative z-50">
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-2">
                 <div className="inline-block p-4 bg-gate-800 rounded-full mb-4">
                   <Terminal size={40} className="text-white" />
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-tight">Initialize Forge</h1>
                 <p className="text-gate-500">Universal GATE CSE Optimization Engine.</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                 <div>
                   <label className="block text-xs font-bold uppercase text-gate-400 mb-2">Identify Yourself</label>
                   <input 
                     type="text" 
                     placeholder="Enter your name"
                     className="w-full bg-black border border-gate-600 rounded-xl p-4 text-lg text-white focus:border-white outline-none transition-colors relative z-50 pointer-events-auto"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                     autoFocus
                   />
                 </div>
                 
                 <button 
                   onClick={handleNextStep}
                   disabled={!name.trim()}
                   className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-50 pointer-events-auto"
                 >
                   Proceed <ArrowRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
               <div className="text-center space-y-2">
                 <div className="inline-block p-4 bg-gate-800 rounded-full mb-4">
                   <Target size={40} className="text-white" />
                 </div>
                 <h2 className="text-2xl font-bold text-white">Select Target Year(s)</h2>
                 <p className="text-gate-500 text-sm">You can aim for multiple attempts. The countdown will track the earliest one.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                 {AVAILABLE_YEARS.map(year => (
                    <button 
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative z-50 pointer-events-auto ${
                        targetYears.includes(year) 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/50 scale-105' 
                          : 'bg-gate-800 border-gate-700 text-gate-500 hover:border-gate-500 hover:text-gate-300'
                      }`}
                    >
                       <span className="text-lg font-bold">GATE {year}</span>
                       {targetYears.includes(year) && <Check size={16} />}
                    </button>
                 ))}
              </div>

              <div className="max-w-md mx-auto">
                <button 
                    onClick={handleNextStep}
                    disabled={targetYears.length === 0}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-50 pointer-events-auto"
                    >
                    Set Objectives <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gate-700 pb-4">
                 <div>
                   <h2 className="text-xl font-bold text-white">The Master Plan</h2>
                   <p className="text-xs text-gate-500">Set dates or mark subjects as "Undecided" if you haven't planned them yet.</p>
                 </div>
                 <div className="text-right">
                   <span className="block text-[10px] font-bold uppercase text-gate-400">Primary Target</span>
                   <span className="text-lg font-bold text-blue-400">GATE {Math.min(...targetYears)}</span>
                 </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                 {schedule.map((phase, idx) => (
                   <div key={phase.id} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border transition-colors relative z-10 ${phase.isUndecided ? 'bg-gate-900/30 border-gate-800 opacity-60' : 'bg-gate-800/50 border-gate-700'}`}>
                      <div className="col-span-1 text-xs text-gate-500 font-mono text-center">{idx + 1}</div>
                      
                      <div className="col-span-4">
                         <input 
                           type="text" 
                           className="w-full bg-transparent text-sm font-bold text-white focus:outline-none border-b border-transparent focus:border-gate-500 relative z-20 pointer-events-auto"
                           value={phase.name}
                           onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
                         />
                      </div>

                      <div className="col-span-5 flex items-center gap-2">
                        {phase.isUndecided ? (
                            <div className="flex-1 flex items-center justify-center gap-2 text-gate-500 text-xs italic bg-black/20 p-2 rounded border border-dashed border-gate-700">
                                <CalendarOff size={12}/> Dates Pending
                            </div>
                        ) : (
                            <>
                                <input 
                                type="date" 
                                className="w-1/2 bg-transparent text-xs text-gate-300 focus:outline-none bg-black/20 p-1 rounded relative z-20 pointer-events-auto cursor-pointer"
                                value={phase.start}
                                onChange={(e) => updatePhase(phase.id, 'start', e.target.value)}
                                />
                                <span className="text-gate-600">-</span>
                                <input 
                                type="date" 
                                className="w-1/2 bg-transparent text-xs text-gate-300 focus:outline-none bg-black/20 p-1 rounded relative z-20 pointer-events-auto cursor-pointer"
                                value={phase.end}
                                onChange={(e) => updatePhase(phase.id, 'end', e.target.value)}
                                />
                            </>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2">
                         <button 
                            onClick={() => updatePhase(phase.id, 'isUndecided', !phase.isUndecided)}
                            className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-colors whitespace-nowrap border relative z-20 pointer-events-auto ${
                                phase.isUndecided 
                                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500' 
                                : 'bg-gate-800 border-gate-600 text-gate-400 hover:text-white hover:bg-gate-700'
                            }`}
                         >
                            {phase.isUndecided ? "Set Dates" : "Undecided"}
                         </button>
                         <button onClick={() => removePhase(phase.id)} className="text-gate-600 hover:text-red-500 p-1 transition-colors relative z-20 pointer-events-auto"><Trash2 size={14}/></button>
                      </div>
                   </div>
                 ))}
                 
                 <button onClick={addPhase} className="w-full py-3 border border-dashed border-gate-600 rounded-lg text-gate-400 hover:text-white hover:border-gate-400 flex items-center justify-center gap-2 text-sm transition-colors relative z-20 pointer-events-auto">
                    <Plus size={16} /> Add Phase
                 </button>
              </div>

              <div className="pt-4 border-t border-gate-700 flex gap-4">
                 <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-gate-600 text-gate-400 font-bold text-sm hover:text-white transition-colors relative z-20 pointer-events-auto">
                    Back
                 </button>
                 <button onClick={handleFinish} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 relative z-20 pointer-events-auto">
                    <Check size={18} /> Confirm Plan
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;