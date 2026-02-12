
import React, { useState, useEffect } from 'react';
import { getSyllabusStatus, saveSyllabusStatus, getSchedule, saveSchedule, getUserProfile } from '../services/storageService';
import { SyllabusStatus, SchedulePhase } from '../types';
import { parseLocal, getEndOfDay } from '../utils/dateHelpers';
import { Clock, CheckSquare, Target, Hourglass, CalendarClock, Edit2, Plus, Trash2, Save, Sparkles, Check, ChevronRight } from 'lucide-react';

const SyllabusTracker: React.FC = () => {
  const [status, setStatus] = useState<SyllabusStatus>({});
  const [schedule, setSchedule] = useState<SchedulePhase[]>([]);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number, secs: number}>({ days: 0, hours: 0, mins: 0, secs: 0 });
  
  const [currentPhase, setCurrentPhase] = useState<SchedulePhase | null>(null);
  const [isGap, setIsGap] = useState(false); // Track if we are in a break between subjects
  
  const [phaseTimeLeft, setPhaseTimeLeft] = useState<{days: number, hours: number, mins: number, secs: number} | null>(null);
  const [now, setNow] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [editScheduleData, setEditScheduleData] = useState<SchedulePhase[]>([]);
  const [examDateStr, setExamDateStr] = useState<string>('');

  useEffect(() => {
    setStatus(getSyllabusStatus());
    const loadedSchedule = getSchedule();
    const profile = getUserProfile();
    
    setSchedule(loadedSchedule);
    setEditScheduleData(loadedSchedule);
    setExamDateStr(profile.examDate);

    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      const target = new Date(profile.examDate);
      const diff = target.getTime() - currentTime.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1. Filter valid phases
    const validPhases = schedule.filter(p => p.start && p.end && !p.isUndecided);

    // 2. Try to find Active Phase
    const active = validPhases.find(p => {
      const s = parseLocal(p.start);
      const e = getEndOfDay(p.end);
      return s && e && now >= s && now <= e;
    });

    if (active) {
      setCurrentPhase(active);
      setIsGap(false);
      const phaseEnd = getEndOfDay(active.end);
      if (phaseEnd) {
        const phaseDiff = phaseEnd.getTime() - now.getTime();
        if (phaseDiff > 0) {
          setPhaseTimeLeft({
            days: Math.floor(phaseDiff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((phaseDiff / (1000 * 60 * 60)) % 24),
            mins: Math.floor((phaseDiff / 1000 / 60) % 60),
            secs: Math.floor((phaseDiff / 1000) % 60),
          });
        }
      }
    } else {
      // 3. If no active phase, find the NEXT upcoming one (Gap Logic)
      const upcoming = validPhases
        .filter(p => {
            const s = parseLocal(p.start);
            return s && s > now;
        })
        .sort((a, b) => parseLocal(a.start)!.getTime() - parseLocal(b.start)!.getTime())[0];

      if (upcoming) {
        setCurrentPhase(upcoming);
        setIsGap(true);
        const nextStart = parseLocal(upcoming.start);
        if (nextStart) {
            const gapDiff = nextStart.getTime() - now.getTime();
            if (gapDiff > 0) {
                setPhaseTimeLeft({
                    days: Math.floor(gapDiff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((gapDiff / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((gapDiff / 1000 / 60) % 60),
                    secs: Math.floor((gapDiff / 1000) % 60),
                });
            }
        }
      } else {
        setCurrentPhase(null);
        setIsGap(false);
      }
    }
  }, [now, schedule]);

  const runSmartPlanner = () => {
    const remainingSubjects = schedule.filter(p => !status[p.id]?.completed);
    if (remainingSubjects.length === 0) return;

    const examDate = new Date(examDateStr);
    const today = new Date();
    const totalRemainingDays = Math.floor((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) - 30; 

    if (totalRemainingDays <= 0) {
      alert("Insufficient time for Smart Rescheduling. 30-day buffer already breached.");
      return;
    }

    const daysPerSubject = Math.floor(totalRemainingDays / remainingSubjects.length);
    const newSchedule = [...schedule];
    let rollingDate = new Date();

    newSchedule.forEach(p => {
      if (!status[p.id]?.completed) {
        p.start = rollingDate.toISOString().split('T')[0];
        rollingDate.setDate(rollingDate.getDate() + daysPerSubject);
        p.end = rollingDate.toISOString().split('T')[0];
        p.isUndecided = false; 
      }
    });

    setEditScheduleData(newSchedule);
    setIsEditing(true);
    alert("Smart Backwards Planner: Subjects distributed with a 30-day revision buffer.");
  };

  const toggleCheck = (id: string, field: 'completed' | 'rev1' | 'rev2' | 'rev3') => {
    const newStatus = { ...status };
    if (!newStatus[id]) newStatus[id] = { completed: false, rev1: false, rev2: false, rev3: false };
    newStatus[id][field] = !newStatus[id][field];
    setStatus(newStatus);
    saveSyllabusStatus(newStatus);
  };

  const getProgress = (id: string) => {
    const s = status[id];
    if (!s) return 0;
    let count = 0;
    if (s.completed) count++;
    if (s.rev1) count++;
    if (s.rev2) count++;
    if (s.rev3) count++;
    return (count / 4) * 100;
  };

  const saveEdit = () => {
    const finalData = editScheduleData.map(p => ({
        ...p,
        isUndecided: (!p.start || !p.end) 
    }));
    saveSchedule(finalData);
    setSchedule(getSchedule());
    setIsEditing(false);
  };

  const updateEditData = (id: string, field: keyof SchedulePhase, value: string) => {
    setEditScheduleData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleUndecidedEdit = (id: string) => {
    setEditScheduleData(prev => prev.map(p => {
        if (p.id === id) {
            const newVal = !p.isUndecided;
            return {
                ...p,
                isUndecided: newVal,
                start: newVal ? '' : p.start, 
                end: newVal ? '' : p.end
            };
        }
        return p;
    }));
  };

  const addPhase = () => {
    const newPhase: SchedulePhase = {
      id: `phase_${Date.now()}`,
      name: 'New Phase',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      isUndecided: false
    };
    setEditScheduleData([...editScheduleData, newPhase]);
  };

  const deletePhase = (id: string) => {
    if(confirm('Remove this phase?')) {
        setEditScheduleData(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Hourglass size={120} /></div>
           <h3 className="text-gate-500 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Target size={14} /> Exam Countdown</h3>
           <div className="grid grid-cols-4 gap-4 text-center">
             <div className="bg-gate-900/50 p-4 rounded-xl border border-gate-800 backdrop-blur-sm"><div className="text-3xl font-bold text-white font-mono tracking-tight">{timeLeft.days}</div><div className="text-[10px] text-gate-500 uppercase font-bold mt-1">Days</div></div>
             <div className="bg-gate-900/50 p-4 rounded-xl border border-gate-800 backdrop-blur-sm"><div className="text-3xl font-bold text-white font-mono tracking-tight">{timeLeft.hours}</div><div className="text-[10px] text-gate-500 uppercase font-bold mt-1">Hours</div></div>
             <div className="bg-gate-900/50 p-4 rounded-xl border border-gate-800 backdrop-blur-sm"><div className="text-3xl font-bold text-white font-mono tracking-tight">{timeLeft.mins}</div><div className="text-[10px] text-gate-500 uppercase font-bold mt-1">Mins</div></div>
             <div className="bg-gate-900/50 p-4 rounded-xl border border-gate-800 backdrop-blur-sm"><div className="text-3xl font-bold text-white font-mono tracking-tight">{timeLeft.secs}</div><div className="text-[10px] text-gate-500 uppercase font-bold mt-1">Secs</div></div>
           </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
           <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full pointer-events-none ${isGap ? 'bg-yellow-500/10' : 'bg-blue-500/5'}`}></div>
           <div>
             <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${isGap ? 'text-yellow-500' : 'text-gate-500'}`}>
                <CalendarClock size={14} /> {isGap ? 'Up Next' : 'Current Objective'}
             </h3>
             <div className="text-2xl font-bold text-white tracking-tight leading-tight">
                {currentPhase ? currentPhase.name : (schedule.some(s => s.isUndecided) ? "Schedule Pending" : "All Phases Complete")}
             </div>
           </div>
           
           {currentPhase ? (
             <div className={`mt-8 flex items-center gap-4 font-mono text-xl p-3 rounded-lg border w-fit ${
                 isGap ? 'bg-yellow-950/20 border-yellow-900/50 text-yellow-100' : 'bg-gate-900/50 border-gate-800 text-gate-200'
             }`}>
                <Clock size={20} className={isGap ? 'text-yellow-500' : 'text-blue-500'} />
                <span className="font-bold">
                    {isGap ? 'Starts in ' : ''}
                    {phaseTimeLeft?.days || 0}d {phaseTimeLeft?.hours || 0}h
                    {isGap ? '' : ' remaining'}
                </span>
             </div>
           ) : (
             <div className="mt-8 flex items-center gap-2 text-gate-500 text-sm">
               {schedule.some(s => s.isUndecided) ? <span>Define schedule to track progress</span> : <span>Mission Accomplished</span>}
             </div>
           )}
        </div>
      </div>

      <div className="glass-panel border border-gate-700 rounded-2xl overflow-hidden relative z-10">
        <div className="p-6 bg-gate-900/30 border-b border-gate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">The Master Plan</h2>
            <p className="text-xs text-gate-500 mt-1">Strategic timeline and completion status.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
               <button onClick={runSmartPlanner} className="flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-950/30 hover:bg-blue-900/50 border border-blue-900/50 px-4 py-2 rounded-lg transition-all hover:shadow-glow pointer-events-auto">
                  <Sparkles size={14} /> SMART RESCHEDULE
               </button>
               <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs font-bold text-gate-300 bg-gate-800 hover:bg-gate-700 border border-gate-600 px-4 py-2 rounded-lg transition-colors pointer-events-auto">
                  <Edit2 size={14} /> MANUAL EDIT
               </button>
              </>
            ) : (
               <div className="flex gap-3">
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gate-400 px-4 py-2 rounded-lg hover:bg-gate-800 transition-colors pointer-events-auto">CANCEL</button>
                  <button onClick={saveEdit} className="bg-white text-black px-5 py-2 rounded-lg font-bold text-xs uppercase flex items-center gap-2 hover:bg-gate-200 transition-colors pointer-events-auto">
                      <Save size={14}/> SAVE PLAN
                  </button>
               </div>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gate-800">
          {(isEditing ? editScheduleData : schedule).map((item) => {
              const isActive = currentPhase?.id === item.id && !isGap;
              const isNext = currentPhase?.id === item.id && isGap;
              const progress = getProgress(item.id);
              const isUndecided = item.isUndecided || (!item.start && !item.end);

              return (
                <div key={item.id} className={`p-6 transition-all duration-300 group ${
                    isActive && !isEditing ? 'bg-gate-800/40 border-l-2 border-l-white' : 
                    isNext && !isEditing ? 'bg-yellow-950/10 border-l-2 border-l-yellow-500' :
                    'hover:bg-gate-800/20 border-l-2 border-l-transparent'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <>
                           <input 
                             type="text" 
                             value={item.name} 
                             onChange={(e) => updateEditData(item.id, 'name', e.target.value)}
                             className="w-full bg-black border border-gate-600 rounded-lg p-3 text-sm font-bold text-white mb-2 focus:border-white outline-none relative z-20 pointer-events-auto"
                           />
                           <div className="flex gap-3 items-center flex-wrap">
                              {!item.isUndecided ? (
                                <>
                                    <input type="date" value={item.start} onChange={(e) => updateEditData(item.id, 'start', e.target.value)} className="bg-black border border-gate-600 rounded-lg p-2 text-xs text-gate-300 focus:border-white outline-none relative z-20 pointer-events-auto"/>
                                    <span className="text-gate-600">to</span>
                                    <input type="date" value={item.end} onChange={(e) => updateEditData(item.id, 'end', e.target.value)} className="bg-black border border-gate-600 rounded-lg p-2 text-xs text-gate-300 focus:border-white outline-none relative z-20 pointer-events-auto"/>
                                </>
                              ) : (
                                <div className="text-xs text-gate-500 italic bg-black/20 p-2 rounded-lg border border-dashed border-gate-700">Dates pending...</div>
                              )}

                              <button 
                                onClick={() => toggleUndecidedEdit(item.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors border relative z-20 pointer-events-auto ${
                                    item.isUndecided 
                                    ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500' 
                                    : 'bg-gate-800 border-gate-600 text-gate-400 hover:text-white hover:bg-gate-700'
                                }`}
                              >
                                {item.isUndecided ? "Set Dates" : "Undecided"}
                              </button>
                              
                              <button onClick={() => deletePhase(item.id)} className="text-gate-600 hover:text-red-500 p-2 transition-colors ml-auto relative z-20 pointer-events-auto"><Trash2 size={16}/></button>
                           </div>
                        </>
                      ) : (
                        <div className="flex items-start gap-4">
                           <div className={`mt-1 w-2 h-2 rounded-full ${
                               isActive ? 'bg-white shadow-[0_0_8px_white]' : 
                               isNext ? 'bg-yellow-500 shadow-[0_0_8px_yellow]' :
                               (progress === 100 ? 'bg-green-500' : 'bg-gate-700')
                           }`}></div>
                           <div>
                                <h3 className={`font-bold text-base flex items-center gap-3 ${
                                    isActive ? 'text-white' : 
                                    isNext ? 'text-yellow-100' :
                                    'text-gate-300 group-hover:text-gate-100 transition-colors'
                                }`}>
                                    {item.name}
                                    {isUndecided && <span className="text-[9px] bg-gate-800 text-gate-500 px-2 py-0.5 rounded border border-gate-700 uppercase font-bold tracking-wide">Pending</span>}
                                    {progress === 100 && <Check size={14} className="text-green-500" />}
                                    {isNext && <span className="text-[9px] bg-yellow-950 text-yellow-500 px-2 py-0.5 rounded border border-yellow-800 uppercase font-bold tracking-wide">Up Next</span>}
                                </h3>
                                <p className="text-xs text-gate-500 font-mono mt-1 flex items-center gap-2">
                                    {isUndecided ? 'TBD' : `${item.start} — ${item.end}`}
                                </p>
                           </div>
                        </div>
                      )}
                    </div>
                    
                    {!isEditing && (
                        <div className="flex flex-col gap-3 min-w-[200px] relative z-20">
                            {!isUndecided && (
                                <div className="w-full h-1.5 bg-gate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-white'}`} style={{width: `${progress}%`}}></div>
                                </div>
                            )}
                            <div className="flex justify-between gap-2">
                                {['completed', 'rev1', 'rev2', 'rev3'].map((chk, i) => (
                                    <button 
                                        key={chk} 
                                        onClick={() => toggleCheck(item.id, chk as any)} 
                                        className={`flex-1 py-1.5 rounded text-[9px] font-bold uppercase border transition-all duration-200 pointer-events-auto ${
                                            status[item.id]?.[chk as keyof SyllabusStatus[string]] 
                                            ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                                            : 'bg-transparent text-gate-600 border-gate-800 hover:border-gate-600 hover:text-gate-400'
                                        }`}
                                    >
                                        {i === 0 ? 'Done' : `R${i}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              );
          })}
          
          {isEditing && (
             <div className="p-4 bg-black/20">
                <button onClick={addPhase} className="w-full py-4 border-2 border-dashed border-gate-700 text-gate-500 hover:text-white hover:border-gate-500 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all relative z-20 pointer-events-auto">
                   <Plus size={18}/> Add New Phase
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTracker;
