
import React, { useEffect, useState, useRef } from 'react';
import { getMocks, getErrors, getDailyLogs } from '../../services/storageService';
import { MockTest, ErrorLogEntry, DailyLog, GhostData } from '../../types';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Line, LineChart } from 'recharts';
import { Activity, AlertTriangle, Target, Zap, Lightbulb, ArrowUpRight, UserPlus, X, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [ghost, setGhost] = useState<GhostData | null>(null);
  const [objectives, setObjectives] = useState<{text: string, color: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedMocks = getMocks();
    const loadedErrors = getErrors();
    const loadedLogs = getDailyLogs();
    
    setMocks(loadedMocks);
    setErrors(loadedErrors);
    setDailyLogs(loadedLogs);
    generateLocalInsights(loadedMocks, loadedErrors, loadedLogs);
    generateObjectives(loadedLogs, loadedErrors);
  }, []);

  const handleGhostUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.mocks) {
          const ghostPoints = data.mocks.slice().reverse().map((m: any) => ({
            name: m.date.slice(5),
            score: m.score
          }));
          setGhost({ name: "Friend's Ghost", chartData: ghostPoints });
        }
      } catch (err) {
        alert("Invalid ghost file.");
      }
    };
    reader.readAsText(file);
  };

  const generateObjectives = (logs: DailyLog[], errs: ErrorLogEntry[]) => {
    const objs = [];
    const today = new Date().toISOString().split('T')[0];
    const hasLogged = logs.some(l => l.date === today);
    if (!hasLogged) {
        objs.push({ text: "Log today's protocol", color: "bg-yellow-500" });
    } else {
        objs.push({ text: "Maintain Streak Tomorrow", color: "bg-green-500" });
    }
    if (errs.length > 0) {
        const counts: Record<string, number> = {};
        errs.forEach(e => counts[e.subject] = (counts[e.subject] || 0) + 1);
        const worstSubject = Object.entries(counts).sort((a,b) => b[1] - a[1])[0][0];
        objs.push({ text: `Fix Leaks: ${worstSubject}`, color: "bg-red-500" });
    } else {
        objs.push({ text: "Take a Diagnostic Mock", color: "bg-blue-500" });
    }
    setObjectives(objs);
  };

  const generateLocalInsights = (m: MockTest[], e: ErrorLogEntry[], d: DailyLog[]) => {
    const newInsights: string[] = [];
    if (m.length > 0) {
      const lastMock = m[0];
      const acc = lastMock.totalAttempts > 0 ? (lastMock.correctAttempts / lastMock.totalAttempts) * 100 : 0;
      if (acc < 75) newInsights.push("CRITICAL: Accuracy below 75%. Negative marks are bleeding your rank.");
    }
    if (d.length > 0) {
      const lastLog = d[0];
      const todayStr = new Date().toISOString().split('T')[0];
      if (lastLog.date === todayStr && !lastLog.revisionDone) newInsights.push("HABIT ALERT: Daily revision skipped.");
    }
    if (newInsights.length === 0 && m.length > 0) newInsights.push("STATUS: Steady trajectory. No critical leakage detected.");
    setInsights(newInsights);
  };

  const lastMock = mocks[0];
  const avgAccuracy = mocks.length > 0 
    ? (mocks.reduce((acc, curr) => acc + (curr.correctAttempts / curr.totalAttempts), 0) / mocks.length * 100).toFixed(1) 
    : '0';

  const chartData = mocks.slice().reverse().map((m, idx) => {
    const entry: any = { name: m.date.slice(5), score: m.score };
    if (ghost && ghost.chartData[idx]) entry.ghostScore = ghost.chartData[idx].score;
    return entry;
  });

  const StatCard = ({ icon: Icon, label, value, sub, delay, colorClass }: any) => (
    <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-gate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover animate-slide-up ${delay}`}>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
         <Icon size={64} className="text-gate-300 opacity-20" />
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl bg-gate-950/50 border border-gate-800 ${colorClass}`}>
           <Icon size={20} />
        </div>
        <ArrowUpRight size={16} className="text-gate-500 group-hover:text-gate-300 transition-colors" />
      </div>
      <div className="relative z-10">
        <div className="text-gate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-4xl font-bold text-gate-100 tracking-tight flex items-baseline gap-1.5">
            {value} <span className="text-sm font-medium text-gate-600">{sub}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Activity} label="Last Score" value={lastMock ? lastMock.score : '-'} sub="/ 100" delay="delay-0" colorClass="text-blue-500" />
        <StatCard icon={Target} label="Avg Accuracy" value={`${avgAccuracy}%`} sub="" delay="delay-100" colorClass="text-green-500" />
        <StatCard icon={AlertTriangle} label="Error Count" value={errors.length} sub="entries" delay="delay-200" colorClass="text-red-500" />
        <StatCard icon={Zap} label="Daily Streak" value={dailyLogs.length} sub="days" delay="delay-300" colorClass="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 animate-slide-up delay-200">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-gate-100 tracking-tight">Performance Trajectory</h3>
                <p className="text-xs text-gate-500">Score progression over time.</p>
              </div>
              <div className="flex items-center gap-3">
                {ghost && (
                  <button onClick={() => setGhost(null)} className="text-[10px] bg-red-950/30 text-red-500 px-3 py-1.5 rounded-lg border border-red-900/50 hover:bg-red-950/50 flex items-center gap-1 transition-colors">
                    <X size={10}/> Remove Ghost
                  </button>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] bg-gate-900 text-gate-400 px-3 py-1.5 rounded-lg border border-gate-700 hover:border-gate-500 flex items-center gap-2 transition-all hover:text-gate-100"
                >
                  <UserPlus size={12}/> {ghost ? "Compare Ghost" : "Load Ghost Data"}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleGhostUpload} />
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--g-800)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--g-600)" tick={{fill: 'var(--g-500)', fontSize: 10}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="var(--g-600)" tick={{fill: 'var(--g-500)', fontSize: 10}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--g-900)', border: '1px solid var(--g-800)', color: 'var(--g-200)', borderRadius: '12px', padding: '12px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ stroke: 'var(--g-400)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--g-200)" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  {ghost && <Line type="monotone" dataKey="ghostScore" stroke="var(--g-500)" strokeDasharray="4 4" dot={false} strokeWidth={2} name={ghost.name} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-gate-100 mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/10 rounded border border-yellow-500/20"><Lightbulb size={16} className="text-yellow-500"/></div>
                System Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-4 items-start animate-fade-in group" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-gate-600 group-hover:bg-gate-300 transition-colors shrink-0"></div>
                  <p className="text-gate-300 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
              {insights.length === 0 && <p className="text-gate-500 text-sm italic">Not enough data to generate insights.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 animate-slide-in-right delay-300">
          <div className="glass-panel p-6 rounded-2xl h-full">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gate-100">Directives</h3>
                <span className="text-[10px] font-bold uppercase text-gate-500 tracking-wider">Priority Queue</span>
             </div>
             
             <ul className="space-y-3">
                {objectives.map((obj, i) => (
                  <li key={i} className="group flex items-center gap-3 p-4 rounded-xl border border-gate-800 bg-gate-900/50 hover:bg-gate-800 hover:border-gate-600 transition-all cursor-default">
                    <div className={`w-2 h-2 rounded-full ${obj.color} shadow-[0_0_8px] shadow-${obj.color.split('-')[1]}-500/50`}></div> 
                    <span className="font-medium text-sm text-gate-300 group-hover:text-gate-100 transition-colors">{obj.text}</span>
                    <ChevronRight size={14} className="ml-auto text-gate-600 group-hover:text-gate-400 transition-colors" />
                  </li>
                ))}
                {objectives.length === 0 && <li className="text-gate-500 text-sm italic">All directives cleared.</li>}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
