
import React, { useEffect, useState } from 'react';
import { ChevronRight, Terminal, Cpu, Calendar, Target, Clock, Mail, Maximize } from 'lucide-react';
import { getSyllabusStatus, getSchedule, getUserProfile } from '../services/storageService';
import { SchedulePhase } from '../types';
import { parseLocal, getEndOfDay } from '../utils/dateHelpers';

interface WelcomeProps {
  onNavigate: (tab: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  const [currentPhase, setCurrentPhase] = useState<SchedulePhase | null>(null);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number} | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isGap, setIsGap] = useState(false);
  const [userName, setUserName] = useState('Forgemaster');
  const [targetYears, setTargetYears] = useState<number[]>([2027]);

  useEffect(() => {
    const status = getSyllabusStatus();
    const schedule = getSchedule();
    const profile = getUserProfile();
    setUserName(profile.name);
    if (profile.targetYears) {
        setTargetYears(profile.targetYears.sort());
    }
    
    const updateTime = () => {
      const now = new Date();
      
      // 1. Filter only valid, decided phases
      const validPhases = schedule.filter(p => p.start && p.end && !p.isUndecided);

      // 2. Try to find an ACTIVE phase (Now is between Start and End)
      const active = validPhases.find(p => {
        const s = parseLocal(p.start);
        const e = getEndOfDay(p.end);
        return s && e && now >= s && now <= e;
      });

      if (active) {
        // --- ACTIVE PHASE FOUND ---
        setCurrentPhase(active);
        setIsGap(false);
        setIsCompleted(status[active.id]?.completed || false);
        
        const endDate = getEndOfDay(active.end);
        if (endDate) {
            const diff = endDate.getTime() - now.getTime();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0 });
            }
        }
      } else {
        // --- NO ACTIVE PHASE (Check for UPCOMING) ---
        // Find the earliest phase that starts in the future
        const upcoming = validPhases
            .filter(p => {
                const s = parseLocal(p.start);
                return s && s > now;
            })
            .sort((a, b) => {
                const da = parseLocal(a.start)!.getTime();
                const db = parseLocal(b.start)!.getTime();
                return da - db;
            })[0];

        if (upcoming) {
            // Found a gap before the next subject
            setCurrentPhase(upcoming);
            setIsGap(true);
            setIsCompleted(false);

            const startDate = parseLocal(upcoming.start);
            if (startDate) {
                const diff = startDate.getTime() - now.getTime();
                if (diff > 0) {
                    setTimeLeft({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff / (1000 * 60 * 60)) % 24)
                    });
                }
            }
        } else {
            // No active and no upcoming? (End of all schedules or empty)
            setCurrentPhase(null);
        }
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-16 py-10 animate-fade-in">
      
      <div className="text-center space-y-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gate-100/5 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>
        
        <div className="relative z-10 animate-slide-up delay-100 space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold text-gate-100 tracking-tighter drop-shadow-lg">
              {userName}<span className="text-gate-500">.</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-3 bg-gate-900/40 border border-gate-800 px-4 py-1.5 rounded-full backdrop-blur-md">
                  <Target size={14} className="text-blue-500"/>
                  <span className="text-xs font-mono font-medium text-gate-400 tracking-widest uppercase">Targeting GATE {targetYears.join(', ')}</span>
              </div>
              
              <div className="inline-flex items-center gap-2 text-yellow-500/80 bg-yellow-950/10 px-3 py-1 rounded-md border border-yellow-900/20 text-[10px] font-bold tracking-wide animate-pulse">
                  <Maximize size={10} />
                  <span>RUN IN FULL SCREEN FOR MAX VISIBILITY</span>
              </div>
            </div>
        </div>
        
        {currentPhase ? (
           <div className="relative z-20 max-w-lg mx-auto animate-slide-up delay-200 group cursor-default">
              <div className={`p-[1px] rounded-2xl bg-gradient-to-r bg-[length:200%_200%] animate-shimmer ${
                  isGap ? 'from-yellow-900 via-yellow-600 to-yellow-900' :
                  isCompleted ? 'from-green-900 via-green-600 to-green-900' : 
                  'from-blue-900 via-gate-500 to-blue-900'
              }`}>
                  <div className="bg-gate-950 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                         {isGap ? <Calendar size={100} className="text-yellow-500"/> : <Target size={100} className="text-gate-100" />}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                              isGap ? 'text-yellow-500' :
                              isCompleted ? 'text-green-500' : 
                              'text-blue-500'
                          }`}>
                              {isGap ? 'NEXT PHASE' : (isCompleted ? 'MISSION ACCOMPLISHED' : 'CURRENT OBJECTIVE')}
                          </span>
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gate-100 leading-tight mb-6 relative z-10">{currentPhase.name}</h2>

                      <div className="flex items-center gap-4 text-sm relative z-10">
                          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                              isGap ? 'bg-yellow-950/20 border-yellow-900/50 text-yellow-500' :
                              isCompleted ? 'bg-green-900/10 border-green-500/20 text-green-500' : 
                              'bg-gate-800 border-gate-700 text-gate-200'
                          }`}>
                              <Clock size={16} />
                              <span className="font-mono font-bold text-base">
                                {timeLeft ? `${timeLeft.days}d ${timeLeft.hours}h` : '0d 0h'}
                              </span>
                              <span className="text-xs opacity-60 uppercase tracking-wide">
                                {isGap ? 'until start' : (isCompleted ? 'saved' : 'left')}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        ) : (
            <div className="relative z-20 max-w-md mx-auto mt-6 animate-slide-up delay-200">
                <div className="bg-gate-900 border border-gate-800 p-6 rounded-2xl text-gate-400 text-sm">
                    No active or upcoming phases found. Check your Master Plan.
                </div>
            </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-md animate-slide-up delay-300">
        <button 
          onClick={() => onNavigate('Dashboard')}
          className="flex-1 group relative overflow-hidden bg-gate-100 text-gate-950 px-8 py-5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-glow"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
             <Cpu size={20} />
             <span>Initialize Dashboard</span>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('Daily')}
          className="flex-1 group relative overflow-hidden bg-gate-900 text-gate-200 border border-gate-700 px-8 py-5 rounded-2xl font-bold transition-all hover:bg-gate-800 hover:border-gate-500 active:scale-95"
        >
           <div className="relative z-10 flex items-center justify-center gap-3">
             <Calendar size={20} />
             <span>Log Protocol</span>
          </div>
        </button>
      </div>

      <div className="max-w-xl mx-auto text-center space-y-6 pt-12 mt-4 border-t border-gate-800/50 animate-fade-in delay-500">
         <div className="text-xs font-bold uppercase tracking-widest text-gate-500">Credits</div>
         
         <div className="space-y-1">
            <p className="text-sm text-gate-300">Built by <span className="font-bold text-gate-100">Yamala Manikanta</span></p>
            <p className="text-xs text-gate-500">3rd Year B.Tech (CSE), KL University</p>
         </div>

         <div className="text-xs text-gate-400 leading-relaxed space-y-2 max-w-md mx-auto">
            <p>This app was not built entirely alone — AI tools were used to assist with coding, UI improvements, and content creation.</p>
            <p>The idea, structure, logic, and validation come from personal GATE preparation experience.</p>
            <p className="italic text-gate-500">Shared freely for students preparing without clear guidance.</p>
         </div>

         <div className="flex flex-col items-center gap-2">
             <p className="text-[10px] text-gate-500">For queries and suggestion feel free to contact this email</p>
             <a 
               href="https://mail.google.com/mail/?view=cm&fs=1&to=yamalamanikanta1@gmail.com" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gate-900 border border-gate-800 text-xs text-gate-400 hover:text-gate-100 hover:border-gate-600 transition-all hover:scale-105"
             >
                <Mail size={12} />
                <span>yamalamanikanta1@gmail.com</span>
             </a>
         </div>
      </div>

      <div className="text-gate-500 text-[10px] font-mono opacity-50 pb-8">
         v1.5.0 • SECURE CONNECTION • OFFLINE MODE
      </div>
    </div>
  );
};

export default Welcome;
