
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock, X, Info } from 'lucide-react';
import { getSyllabusStatus, getSchedule, saveSyllabusStatus } from '../services/storageService';
import { SyllabusStatus, SchedulePhase } from '../types';
import { parseLocal, getEndOfDay } from '../utils/dateHelpers';

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [status, setStatus] = useState<SyllabusStatus>({});
  const [schedule, setSchedule] = useState<SchedulePhase[]>([]);
  const [selectedDay, setSelectedDay] = useState<{
    dateStr: string;
    phase: SchedulePhase;
    status: { completed: boolean; rev1: boolean; rev2: boolean; rev3: boolean };
    isBanked: boolean;
  } | null>(null);

  useEffect(() => {
    setStatus(getSyllabusStatus());
    setSchedule(getSchedule());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const todayTimestamp = new Date().setHours(0,0,0,0);
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getDayInfo = (day: number) => {
    // Current date being rendered in the calendar loop
    const checkDate = new Date(year, month, day); 
    const checkTime = checkDate.getTime();
    
    // Find phase from dynamic schedule using helper for safe comparison
    const phase = schedule.find(p => {
        if (p.isUndecided || !p.start || !p.end) return false;
        
        // Parse the stored "YYYY-MM-DD" as local dates
        const s = parseLocal(p.start);
        const e = getEndOfDay(p.end);
        
        if (!s || !e) return false;
        
        return checkTime >= s.getTime() && checkTime <= e.getTime();
    });

    if (!phase) return null;

    const isCompleted = status[phase.id]?.completed || false;
    
    // Determine if this day is "Banked" (Future day of a completed subject)
    const isFuture = checkTime > todayTimestamp;
    const isBanked = isCompleted && isFuture;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return { phase, isCompleted, isBanked, dateStr };
  };

  const handleDayClick = (day: number) => {
    const info = getDayInfo(day);
    if (info) {
        const s = status[info.phase.id] || { completed: false, rev1: false, rev2: false, rev3: false };
        setSelectedDay({
            dateStr: info.dateStr,
            phase: info.phase,
            status: s,
            isBanked: info.isBanked
        });
    }
  };

  const toggleStatusFromModal = (field: 'completed' | 'rev1' | 'rev2' | 'rev3') => {
    if (!selectedDay) return;
    
    const phaseId = selectedDay.phase.id;
    const currentStatus = status[phaseId] || { completed: false, rev1: false, rev2: false, rev3: false };
    const newStatusVal = { ...currentStatus, [field]: !currentStatus[field] };
    
    const newFullStatus = { ...status, [phaseId]: newStatusVal };
    setStatus(newFullStatus);
    saveSyllabusStatus(newFullStatus);

    const [y, m, d] = selectedDay.dateStr.split('-').map(Number);
    const dayTimestamp = new Date(y, m-1, d).getTime();
    const isBanked = newStatusVal.completed && (dayTimestamp > todayTimestamp);

    setSelectedDay({
        ...selectedDay,
        status: newStatusVal,
        isBanked
    });
  };

  const renderDays = () => {
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return [...blanks, ...days].map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="min-h-[100px] bg-transparent hidden md:block"></div>;

      const info = getDayInfo(day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      let bgClass = "bg-gate-900/50";
      let textClass = "text-gate-600";
      let borderClass = "border-gate-800";
      let statusIcon = null;

      if (info) {
          if (info.isBanked) {
             bgClass = "bg-green-950/30";
             textClass = "text-green-300";
             borderClass = "border-green-900/50";
             statusIcon = <Clock size={12} className="text-green-400" />;
          } else if (info.isCompleted) {
             bgClass = "bg-gate-800/80";
             textClass = "text-gate-400";
             borderClass = "border-gate-700";
             statusIcon = <CheckCircle size={12} className="text-gate-500" />;
          } else {
             bgClass = "bg-blue-950/10";
             textClass = "text-blue-200";
             borderClass = "border-blue-900/20";
          }
      }

      if (isToday) {
          borderClass = "border-white ring-1 ring-white/20";
          bgClass = "bg-gate-800";
      }

      return (
        <div 
            key={day} 
            onClick={() => info && handleDayClick(day)}
            className={`min-h-[80px] md:min-h-[100px] p-2 border ${borderClass} ${bgClass} rounded-lg relative flex flex-col justify-between transition-all hover:bg-opacity-100 group ${info ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/50 z-0 hover:z-10' : ''}`}
        >
          <div className="flex justify-between items-start">
             <span className={`text-sm font-bold ${isToday ? 'bg-white text-black w-6 h-6 flex items-center justify-center rounded-full' : 'text-gate-500'}`}>{day}</span>
             {statusIcon}
          </div>
          
          {info ? (
              <div className="mt-1">
                  <div className={`text-[10px] font-bold leading-tight line-clamp-2 ${textClass}`}>
                    {info.phase.name}
                  </div>
                  {info.isBanked && (
                    <div className="text-[9px] uppercase font-bold text-green-500 mt-1">Bonus Day</div>
                  )}
              </div>
          ) : (
            <div className="text-[10px] text-gate-700 mt-2">Gap</div>
          )}
        </div>
      );
    });
  };

  const StatusItem = ({ label, field, active }: { label: string, field: 'completed' | 'rev1' | 'rev2' | 'rev3', active: boolean }) => (
    <button 
        onClick={() => toggleStatusFromModal(field)}
        className={`flex items-center justify-between p-3 rounded-lg border transition-colors w-full ${active ? 'bg-white text-black border-white' : 'bg-black text-gate-500 border-gate-700 hover:bg-gate-800'}`}
    >
        <span className="text-xs font-bold uppercase">{label}</span>
        {active ? <CheckCircle size={16} className="text-black" /> : <div className="w-4 h-4 rounded-full border border-gate-600"></div>}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gate-800 p-4 rounded-xl border border-gate-700">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-gate-400" /> Operational Calendar
          </h2>
          <p className="text-gate-500 text-sm">Visualize your timeline. Green days are banked time.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-black p-2 rounded-lg border border-gate-700">
           <button onClick={prevMonth} className="p-2 hover:bg-gate-800 rounded-lg text-white transition-colors"><ChevronLeft size={20}/></button>
           <div className="text-center min-w-[140px]">
              <div className="text-white font-bold">{monthNames[month]} {year}</div>
              <button onClick={goToToday} className="text-xs text-gate-500 hover:text-white transition-colors">Jump to Today</button>
           </div>
           <button onClick={nextMonth} className="p-2 hover:bg-gate-800 rounded-lg text-white transition-colors"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="flex-1 bg-black border border-gate-800 rounded-xl p-4 overflow-hidden flex flex-col">
         <div className="grid grid-cols-7 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-xs font-bold text-gate-600 uppercase tracking-widest py-2">{d}</div>
            ))}
         </div>
         
         <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto auto-rows-fr">
            {renderDays()}
         </div>
      </div>

      <div className="flex gap-4 text-xs justify-center flex-wrap">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-950/10 border border-blue-900/20 rounded"></div>
              <span className="text-gate-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gate-800/80 border border-gate-700 rounded"></div>
              <span className="text-gate-400">Completed (Past)</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-950/30 border border-green-900/50 rounded"></div>
              <span className="text-green-400">Banked/Bonus Time</span>
          </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gate-800 border border-white rounded"></div>
              <span className="text-white">Today</span>
          </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedDay(null)}>
            <div className="bg-gate-800 border border-gate-600 p-6 rounded-xl max-w-sm w-full shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedDay(null)} className="absolute top-4 right-4 text-gate-400 hover:text-white transition-colors"><X size={20}/></button>
                
                <div className="mb-6">
                    <div className="text-gate-500 font-mono text-xs uppercase tracking-widest mb-1">{selectedDay.dateStr}</div>
                    <h3 className="text-xl font-bold text-white leading-tight">{selectedDay.phase.name}</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <StatusItem label="Completed" field="completed" active={selectedDay.status.completed} />
                        <StatusItem label="Rev 1" field="rev1" active={selectedDay.status.rev1} />
                        <StatusItem label="Rev 2" field="rev2" active={selectedDay.status.rev2} />
                        <StatusItem label="Rev 3" field="rev3" active={selectedDay.status.rev3} />
                    </div>

                    {selectedDay.isBanked && (
                        <div className="mt-4 bg-green-950/20 border border-green-900/50 p-4 rounded-lg text-green-400 text-sm font-bold flex items-center gap-3 animate-pulse-slow">
                            <Clock size={20} />
                            <div>
                                <div className="uppercase tracking-wide text-[10px] text-green-500">Status</div>
                                <div>Bonus Time Banked</div>
                            </div>
                        </div>
                    )}

                     {!selectedDay.status.completed && !selectedDay.isBanked && (
                        <div className="mt-4 bg-blue-950/20 border border-blue-900/50 p-4 rounded-lg text-blue-200 text-sm flex items-center gap-3">
                            <Info size={20} className="text-blue-500" />
                            <div>
                                <div className="uppercase tracking-wide text-[10px] text-blue-500 font-bold">Objective</div>
                                <div>Focus on completion.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
