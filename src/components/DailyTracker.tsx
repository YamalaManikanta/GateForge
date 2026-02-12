import React, { useState, useEffect } from 'react';
import { saveDailyLog, getDailyLogs } from '../services/storageService';
import { DailyLog, Subject } from '../types';
import { SUBJECTS } from '../constants';
import { CheckCircle, XCircle, Plus, X, Clock, Calendar as CalendarIcon, Activity } from 'lucide-react';

const DailyTracker: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [formData, setFormData] = useState<Partial<DailyLog>>({
    date: new Date().toISOString().split('T')[0],
    studyHours: {},
    topicsCovered: [],
    practiceQuestions: 0,
    practiceCorrect: 0,
    revisionDone: false,
    focusLevel: 3,
    weakestConcept: ''
  });
  
  const [subjectInput, setSubjectInput] = useState<Subject>(Subject.CN);
  const [hoursInput, setHoursInput] = useState<string>('');

  useEffect(() => {
    setLogs(getDailyLogs());
  }, []);

  const addSubjectHours = () => {
    if (!hoursInput || Number(hoursInput) <= 0) return;
    const hours = Number(hoursInput);
    
    setFormData(prev => {
      const currentTotal = prev.studyHours?.[subjectInput] || 0;
      return {
        ...prev,
        studyHours: {
          ...prev.studyHours,
          [subjectInput]: currentTotal + hours
        }
      };
    });
    setHoursInput('');
  };

  const removeSubjectHours = (subj: Subject) => {
    const newHours = { ...formData.studyHours };
    delete newHours[subj];
    setFormData({ ...formData, studyHours: newHours });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.weakestConcept) return;

    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: formData.date!,
      studyHours: formData.studyHours || {},
      topicsCovered: formData.topicsCovered || [],
      practiceQuestions: Number(formData.practiceQuestions),
      practiceCorrect: Number(formData.practiceCorrect),
      revisionDone: formData.revisionDone || false,
      focusLevel: formData.focusLevel as any,
      weakestConcept: formData.weakestConcept!
    };

    saveDailyLog(newLog);
    setLogs(getDailyLogs());
    alert('Day Logged.');
  };

  const totalHoursToday = Object.values(formData.studyHours || {}).reduce((a: number, b) => a + (Number(b) || 0), 0);

  const generateHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const log = logs.find(l => l.date === dateStr);
        const totalHrs: number = log ? Object.values(log.studyHours).reduce<number>((a, b) => a + (Number(b) || 0), 0) : 0;
        
        let colorClass = "bg-gate-800 border-gate-700"; 
        if (totalHrs > 0) colorClass = "bg-green-900 border-green-800"; 
        if (totalHrs > 2) colorClass = "bg-green-700 border-green-600"; 
        if (totalHrs > 5) colorClass = "bg-green-500 border-green-400"; 
        if (totalHrs > 8) colorClass = "bg-green-400 border-white shadow-[0_0_5px_#4ade80]"; 

        days.push({ date: dateStr, hours: totalHrs, color: colorClass });
    }
    return days;
  };

  const heatmapData = generateHeatmap();

  return (
    <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl animate-fade-in relative z-10">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Activity size={18} className="text-green-500" /> Consistency Graph
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-gate-500 uppercase font-bold">
                 <span>Less</span>
                 <div className="w-2 h-2 bg-gate-800 rounded-sm"></div>
                 <div className="w-2 h-2 bg-green-900 rounded-sm"></div>
                 <div className="w-2 h-2 bg-green-700 rounded-sm"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                 <div className="w-2 h-2 bg-green-400 rounded-sm shadow-sm"></div>
                 <span>More</span>
              </div>
           </div>
           
           <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex flex-wrap flex-col content-start h-[100px] gap-1 min-w-max">
                 {heatmapData.map((day, i) => (
                    <div 
                      key={day.date} 
                      className={`w-3 h-3 rounded-sm border ${day.color} transition-all hover:scale-125 relative group cursor-default`}
                    >
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[10px] whitespace-nowrap px-2 py-1 rounded border border-gate-700 z-50">
                          {day.date}: {day.hours} hrs
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-gate-100 tracking-tight">Daily Protocol</h2>
            {/* Added relative and z-index to form to ensure clickability */}
            <form onSubmit={handleSubmit} className="bg-gate-900 p-6 rounded-xl border border-gate-800 space-y-5 relative z-20 shadow-lg">
            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Date</label>
                <input type="date" required className="w-full bg-gate-950 border border-gate-700 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none cursor-pointer"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="flex-1">
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Revision</label>
                <div className="flex gap-2 mt-1">
                    <button type="button" 
                    onClick={() => setFormData({...formData, revisionDone: true})}
                    className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-colors ${formData.revisionDone ? 'bg-green-600 text-white' : 'bg-gate-950 text-gate-500 border border-gate-700'}`}>Yes</button>
                    <button type="button" 
                    onClick={() => setFormData({...formData, revisionDone: false})}
                    className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-colors ${!formData.revisionDone ? 'bg-red-600 text-white' : 'bg-gate-950 text-gate-500 border border-gate-700'}`}>No</button>
                </div>
                </div>
            </div>

            <div className="p-4 bg-gate-950/50 rounded-xl border border-gate-800">
                <label className="block text-gate-300 text-sm mb-3 font-medium flex items-center gap-2">
                <Clock size={16} className="text-gate-500"/> Study Session Logger ({totalHoursToday}h Total)
                </label>
                <div className="flex gap-2 mb-3">
                <select className="bg-gate-800 border border-gate-700 rounded-lg p-2 text-sm text-gate-200 flex-1 focus:outline-none"
                    value={subjectInput} onChange={e => setSubjectInput(e.target.value as Subject)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" step="0.5" placeholder="Hrs" className="w-20 bg-gate-800 border border-gate-700 rounded-lg p-2 text-sm text-gate-200 focus:outline-none"
                    value={hoursInput} onChange={e => setHoursInput(e.target.value)} />
                <button type="button" onClick={addSubjectHours} className="bg-gate-100 text-gate-950 px-4 rounded-lg text-sm font-bold hover:bg-gate-300 flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Add
                </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                {Object.entries(formData.studyHours || {}).map(([subj, hrs]) => (
                    <div key={subj} className="group relative text-xs bg-gate-800 text-gate-200 border border-gate-700 px-3 py-1.5 rounded-full flex items-center gap-2 pr-8">
                    <span className="font-bold text-gate-100">{subj}</span>
                    <span className="bg-gate-700 px-1.5 rounded text-gate-200">{hrs}h</span>
                    <button type="button" onClick={() => removeSubjectHours(subj as Subject)} className="absolute right-1 p-1 hover:text-red-400 text-gate-500 transition-colors">
                        <X size={14}/>
                    </button>
                    </div>
                ))}
                {Object.keys(formData.studyHours || {}).length === 0 && (
                    <span className="text-xs text-gate-500 italic">No sessions logged yet.</span>
                )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Qs Attempted</label>
                <input type="number" className="w-full bg-gate-950 border border-gate-700 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
                    value={formData.practiceQuestions} onChange={e => setFormData({...formData, practiceQuestions: Number(e.target.value)})} />
                </div>
                <div>
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Qs Correct</label>
                <input type="number" className="w-full bg-gate-950 border border-gate-700 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
                    value={formData.practiceCorrect} onChange={e => setFormData({...formData, practiceCorrect: Number(e.target.value)})} />
                </div>
            </div>

            <div>
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Focus Level</label>
                <input type="range" min="1" max="5" className="w-full accent-gate-100"
                    value={formData.focusLevel} onChange={e => setFormData({...formData, focusLevel: Number(e.target.value) as any})} />
                <div className="flex justify-between text-xs text-gate-500 font-mono mt-1">
                <span>Zombie (1)</span>
                <span className="text-gate-100 font-bold text-lg">{formData.focusLevel}</span>
                <span>Machine (5)</span>
                </div>
            </div>

            <div>
                <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Weakest Concept</label>
                <input type="text" required placeholder="One line only" className="w-full bg-gate-950 border border-gate-700 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
                value={formData.weakestConcept} onChange={e => setFormData({...formData, weakestConcept: e.target.value})} />
            </div>

            <button type="submit" className="w-full bg-gate-100 hover:bg-gate-300 text-gate-950 font-bold py-3 rounded-lg uppercase tracking-wide transition-colors">Log Day</button>
            </form>
        </div>

        <div className="space-y-6 animate-slide-in-right animate-delay-200">
            <h3 className="text-xl font-bold text-gate-100 tracking-tight">History</h3>
            <div className="space-y-3">
            {logs.slice(0, 5).map(log => {
                const totalHrs = Object.values(log.studyHours).reduce<number>((a, b) => a + (Number(b) || 0), 0);
                const practiceAcc = log.practiceQuestions > 0 ? Math.round((log.practiceCorrect / log.practiceQuestions) * 100) : 0;
                return (
                <div key={log.id} className="bg-gate-900 p-5 rounded-xl border border-gate-800 hover:border-gate-700 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                    <div className="text-gate-100 font-bold">{log.date}</div>
                    <div className="flex gap-2">
                        {log.revisionDone ? <CheckCircle size={18} className="text-green-500"/> : <XCircle size={18} className="text-red-500" />}
                    </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-gate-300 mb-3">
                    <div className="bg-gate-950/50 p-2 rounded-lg text-center border border-gate-800">
                        <span className="block text-xl font-bold text-gate-100">{totalHrs}h</span>
                        <span className="text-[10px] uppercase text-gate-500 font-bold">Study</span>
                    </div>
                    <div className="bg-gate-950/50 p-2 rounded-lg text-center border border-gate-800">
                        <span className={`block text-xl font-bold ${practiceAcc < 70 ? 'text-gate-400' : 'text-gate-100'}`}>{practiceAcc}%</span>
                        <span className="text-[10px] uppercase text-gate-500 font-bold">Accuracy</span>
                    </div>
                    <div className="bg-gate-950/50 p-2 rounded-lg text-center border border-gate-800">
                        <span className="block text-xl font-bold text-gate-100">{log.focusLevel}</span>
                        <span className="text-[10px] uppercase text-gate-500 font-bold">Focus</span>
                    </div>
                    </div>
                    <div className="text-xs text-gate-400 mt-2 border-t border-gate-800 pt-3 flex items-center gap-2">
                    <span className="uppercase font-bold text-gate-600 text-[10px]">Weakness:</span> <span className="text-gate-300">{log.weakestConcept}</span>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTracker;