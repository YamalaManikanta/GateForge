
import React, { useState, useEffect } from 'react';
import { saveMock, getMocks } from '../../services/storageService';
import { MockTest } from '../../types';
import { Plus, Trash2, TrendingUp, X } from 'lucide-react';
import { NEGATIVE_MARK_FACTOR_1_MARK, NEGATIVE_MARK_FACTOR_2_MARK, AVG_NEGATIVE_FACTOR } from '../../constants';

const MockTracker: React.FC = () => {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MockTest>>({
    date: new Date().toISOString().split('T')[0],
    provider: '',
    totalMarks: 100,
    score: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    timeSpentMinutes: 180
  });

  useEffect(() => {
    setMocks(getMocks());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || formData.score === undefined) return;

    const newMock: MockTest = {
      id: Date.now().toString(),
      date: formData.date!,
      provider: formData.provider!,
      totalMarks: 100,
      score: Number(formData.score),
      totalAttempts: Number(formData.totalAttempts),
      correctAttempts: Number(formData.correctAttempts),
      wrongAttempts: Number(formData.wrongAttempts),
      timeSpentMinutes: Number(formData.timeSpentMinutes) || 180,
    };

    saveMock(newMock);
    setMocks(getMocks());
    setShowForm(false);
    setFormData({ ...formData, score: 0, totalAttempts: 0, correctAttempts: 0, wrongAttempts: 0, timeSpentMinutes: 180 });
  };

  const getAnalysis = (mock: MockTest) => {
    const accuracy = mock.totalAttempts > 0 ? (mock.correctAttempts / mock.totalAttempts) * 100 : 0;
    const estimatedNegatives = mock.wrongAttempts * AVG_NEGATIVE_FACTOR; 
    const timePerQ = mock.totalAttempts > 0 ? ((mock.timeSpentMinutes || 180) / mock.totalAttempts).toFixed(1) : '0';

    return { accuracy, estimatedNegatives, timePerQ };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-gate-900/50 p-6 rounded-2xl border border-gate-800 backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-bold text-gate-100 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-blue-500"/> Mock Analyzer
          </h2>
          <p className="text-sm text-gate-500 mt-1">Track scores, accuracy, and timing efficiency.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gate-100 hover:bg-gate-200 text-gate-950 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold uppercase transition-transform hover:scale-105 shadow-glow"
        >
          <Plus size={18} /> Log Test
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-gate-900 w-full max-w-4xl p-8 rounded-2xl border border-gate-700 shadow-2xl relative animate-slide-up">
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-gate-500 hover:text-gate-100 transition-colors"><X size={24}/></button>
              
              <h3 className="text-xl font-bold text-gate-100 mb-8 border-b border-gate-800 pb-4">Input Test Data</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Date</label>
                    <input type="date" required className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-gate-400 outline-none transition-colors"
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Provider / Test Name</label>
                    <input type="text" required placeholder="e.g. MadeEasy FLT 1" className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-gate-400 outline-none transition-colors"
                    value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
                </div>
                
                <div className="col-span-1">
                    <label className="block text-gate-100 text-xs font-bold uppercase mb-2">Score Obtained</label>
                    <input type="number" step="0.01" required className="w-full bg-gate-800 border border-gate-600 rounded-xl p-4 text-gate-100 text-lg font-bold focus:border-gate-400 outline-none transition-colors"
                    value={formData.score} onChange={e => setFormData({...formData, score: Number(e.target.value)})} />
                </div>
                <div className="col-span-1">
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Time (Mins)</label>
                    <input type="number" required className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-gate-400 outline-none transition-colors"
                    value={formData.timeSpentMinutes} onChange={e => setFormData({...formData, timeSpentMinutes: Number(e.target.value)})} />
                </div>
                <div className="col-span-1 hidden md:block"></div>

                <div className="col-span-1">
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-2">Total Attempts</label>
                    <input type="number" required className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-gate-400 outline-none transition-colors"
                    value={formData.totalAttempts} onChange={e => setFormData({...formData, totalAttempts: Number(e.target.value)})} />
                </div>
                <div className="col-span-1">
                    <label className="block text-green-500 text-xs font-bold uppercase mb-2">Correct</label>
                    <input type="number" required className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-green-500 outline-none transition-colors"
                    value={formData.correctAttempts} onChange={e => setFormData({...formData, correctAttempts: Number(e.target.value)})} />
                </div>
                <div className="col-span-1">
                    <label className="block text-red-500 text-xs font-bold uppercase mb-2">Wrong</label>
                    <input type="number" required className="w-full bg-gate-950 border border-gate-700 rounded-xl p-4 text-gate-100 focus:border-red-500 outline-none transition-colors"
                    value={formData.wrongAttempts} onChange={e => setFormData({...formData, wrongAttempts: Number(e.target.value)})} />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gate-800">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-gate-400 hover:text-gate-100 transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-gate-100 hover:bg-gate-300 text-gate-950 px-8 py-3 rounded-xl font-bold uppercase tracking-wide transition-colors">Save Entry</button>
              </div>
            </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gate-800 bg-gate-900/50 backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gate-500 text-[10px] font-bold uppercase tracking-widest border-b border-gate-800 bg-gate-950/40">
              <th className="p-5">Date</th>
              <th className="p-5">Test ID</th>
              <th className="p-5 text-right">Score</th>
              <th className="p-5 text-right">Accuracy</th>
              <th className="p-5 text-right">Negatives (Est)</th>
              <th className="p-5 text-right">Speed</th>
              <th className="p-5 text-center">Verdict</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {mocks.map((mock, index) => {
              const { accuracy, estimatedNegatives, timePerQ } = getAnalysis(mock);
              return (
                <tr key={mock.id} className="border-b border-gate-800/50 hover:bg-gate-800/40 transition-colors last:border-0 group">
                  <td className="p-5 text-gate-400 font-mono text-xs">{mock.date}</td>
                  <td className="p-5 text-gate-100 font-bold">{mock.provider}</td>
                  <td className="p-5 text-right">
                    <span className="text-gate-100 font-bold text-lg">{mock.score}</span>
                    <span className="text-gate-600 text-xs ml-1">/100</span>
                  </td>
                  <td className="p-5 text-right">
                    <div className={`font-bold ${accuracy < 80 ? 'text-gate-400' : 'text-green-500'}`}>
                        {accuracy.toFixed(1)}%
                    </div>
                  </td>
                  <td className="p-5 text-right text-red-500 font-mono">-{estimatedNegatives.toFixed(2)}</td>
                  <td className="p-5 text-right text-gate-400 font-mono">{timePerQ}m/q</td>
                  <td className="p-5 text-center">
                    {accuracy < 75 && <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-900/50 px-2 py-1 rounded-md font-bold uppercase tracking-wide">High Error</span>}
                    {Number(timePerQ) > 3.5 && <span className="text-[9px] bg-yellow-950/40 text-yellow-400 border border-yellow-900/50 px-2 py-1 rounded-md font-bold uppercase tracking-wide ml-2">Slow</span>}
                    {accuracy >= 85 && <span className="text-[9px] bg-green-950/40 text-green-400 border border-green-900/50 px-2 py-1 rounded-md font-bold uppercase tracking-wide">Solid</span>}
                    {accuracy >= 75 && accuracy < 85 && Number(timePerQ) <= 3.5 && <span className="text-gate-600">-</span>}
                  </td>
                </tr>
              );
            })}
            {mocks.length === 0 && (
              <tr>
                <td colSpan={7} className="p-16 text-center">
                   <div className="text-gate-600 text-sm mb-2">No data logged yet.</div>
                   <div className="text-gate-700 text-xs">Complete a mock test and log it here to see analytics.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MockTracker;
