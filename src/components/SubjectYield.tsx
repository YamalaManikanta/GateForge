import React, { useEffect, useState } from 'react';
import { getDailyLogs, getErrors } from '../../services/storageService';
import { DailyLog, ErrorLogEntry, Subject } from '../../types';
import { SUBJECTS } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SubjectYield: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const logs = getDailyLogs();
    const errors = getErrors();

    const studyHours: Record<string, number> = {};
    logs.forEach(log => {
      Object.entries(log.studyHours).forEach(([subj, hrs]) => {
        studyHours[subj] = (studyHours[subj] || 0) + hrs;
      });
    });

    const errorCounts: Record<string, number> = {};
    errors.forEach(err => {
      errorCounts[err.subject] = (errorCounts[err.subject] || 0) + 1;
    });

    const mergedData = SUBJECTS.map(subj => ({
      name: subj,
      hours: studyHours[subj] || 0,
      errors: errorCounts[subj] || 0,
    })).sort((a, b) => b.hours - a.hours);

    setData(mergedData);
  }, []);

  return (
    <div className="bg-gate-800 p-6 rounded-xl border border-gate-700 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-2">Subject Yield Analyzer</h2>
      <p className="text-sm text-gate-500 mb-6">Investment (Hours) vs Leakage (Errors). White = Hours, Grey = Errors.</p>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#52525b" fontSize={10} interval={0} tick={{fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" stroke="#ffffff" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip 
               contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '8px' }}
               cursor={{fill: '#27272a', opacity: 0.4}}
            />
            <Legend wrapperStyle={{paddingTop: '20px'}} />
            <Bar yAxisId="left" dataKey="hours" fill="#ffffff" name="Study Hours" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1000} />
            <Bar yAxisId="right" dataKey="errors" fill="#3f3f46" name="Mistake Count" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.filter(d => d.hours > 10 && d.errors > 5).map(d => (
          <div key={d.name} className="bg-red-950/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-4 animate-pulse-slow">
             <div className="text-xl">⚠️</div>
             <div>
               <div className="font-bold text-red-200">{d.name} is a Time Sink</div>
               <div className="text-xs text-red-400">High effort ({d.hours}h) but still high errors ({d.errors}). Change source/method.</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectYield;