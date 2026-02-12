import React, { useState, useEffect } from 'react';
import { getCalcStats, saveCalcStats } from '../services/storageService';
import { DrillStats } from '../types';
import { Play, Zap, Award, Minus, X as CloseIcon, Maximize2 } from 'lucide-react';

const VirtualCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isNewTerm, setIsNewTerm] = useState(true);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number>(0);

  const [drillActive, setDrillActive] = useState(false);
  const [targetExpr, setTargetExpr] = useState('');
  const [targetAnswer, setTargetAnswer] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stats, setStats] = useState<DrillStats>({ totalAttempts: 0, correct: 0, avgTimeSec: 0, bestTimeSec: 9999 });

  useEffect(() => {
    setStats(getCalcStats());
  }, []);

  const generateDrill = () => {
    const types = ['basic', 'pow', 'log', 'complex'];
    const type = types[Math.floor(Math.random() * types.length)];
    let q = '';
    let a = 0;

    switch (type) {
      case 'basic': {
        const n1 = Math.floor(Math.random() * 50) + 1;
        const n2 = Math.floor(Math.random() * 20) + 1;
        const op = Math.random() > 0.5 ? '*' : '+';
        q = `${n1} ${op} ${n2}`;
        a = op === '*' ? n1 * n2 : n1 + n2;
        break;
      }
      case 'pow': {
        const base = Math.floor(Math.random() * 10) + 2;
        const exp = Math.floor(Math.random() * 4) + 2;
        q = `${base}^${exp}`;
        a = Math.pow(base, exp);
        break;
      }
      case 'log': {
        const val = [10, 100, 1000, 2, 4, 8, 16, 32, 64][Math.floor(Math.random() * 9)];
        q = `log10(${val})`;
        a = Math.log10(val);
        break;
      }
      case 'complex': {
          const n1 = Math.floor(Math.random() * 20) + 1;
          const n2 = Math.floor(Math.random() * 5) + 1;
          q = `sqrt(${n1 * n1 + n2})`;
          a = Math.sqrt(n1 * n1 + n2);
          break;
      }
    }
    
    setTargetExpr(q);
    setTargetAnswer(a);
    setStartTime(Date.now());
    setFeedback(null);
    setDisplay('0');
    setExpression('');
    setDrillActive(true);
  };

  const checkAnswer = (val: number) => {
    if (!drillActive) return;

    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = Math.abs(val - targetAnswer) < 0.01 || Math.abs((val - targetAnswer)/targetAnswer) < 0.01;

    if (isCorrect) {
      setFeedback(`Correct! ${timeTaken.toFixed(2)}s`);
      const newTotal = stats.totalAttempts + 1;
      const newCorrect = stats.correct + 1;
      const newAvg = ((stats.avgTimeSec * stats.correct) + timeTaken) / newCorrect;
      
      const newStats = {
        totalAttempts: newTotal,
        correct: newCorrect,
        avgTimeSec: newAvg,
        bestTimeSec: Math.min(stats.bestTimeSec, timeTaken)
      };
      setStats(newStats);
      saveCalcStats(newStats);
      setTimeout(generateDrill, 1500);
    } else {
      setFeedback("Incorrect. Try again.");
      const newStats = { ...stats, totalAttempts: stats.totalAttempts + 1 };
      setStats(newStats);
      saveCalcStats(newStats);
    }
  };

  const handleNum = (num: string) => {
    if (isNewTerm) {
      setDisplay(num);
      setIsNewTerm(false);
    } else {
      setDisplay(display === '0' && num !== '.' ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    let opStr = op;
    if (op === 'yroot') opStr = ' yroot ';
    if (op === 'logbase') opStr = ' logbase ';
    
    setExpression(prev => prev + display + opStr);
    setIsNewTerm(true);
  };

  const handleFunc = (func: string) => {
    const val = parseFloat(display);
    let res = 0;
    const toRad = (d: number) => d * (Math.PI / 180);
    const toDeg = (r: number) => r * (180 / Math.PI);
    
    const trigIn = angleMode === 'deg' ? toRad(val) : val;

    try {
      switch (func) {
        case 'sin': res = Math.sin(trigIn); break; 
        case 'cos': res = Math.cos(trigIn); break;
        case 'tan': res = Math.tan(trigIn); break;
        case 'asin': res = angleMode === 'deg' ? toDeg(Math.asin(val)) : Math.asin(val); break;
        case 'acos': res = angleMode === 'deg' ? toDeg(Math.acos(val)) : Math.acos(val); break;
        case 'atan': res = angleMode === 'deg' ? toDeg(Math.atan(val)) : Math.atan(val); break;
        
        case 'sinh': res = Math.sinh(val); break;
        case 'cosh': res = Math.cos(val); break; 
        case 'tanh': res = Math.tanh(val); break;
        case 'asinh': res = Math.asinh(val); break;
        case 'acosh': res = Math.acosh(val); break;
        case 'atanh': res = Math.atanh(val); break;

        case 'ln': res = Math.log(val); break;
        case 'log': res = Math.log10(val); break;
        case 'log2': res = Math.log2(val); break;
        case 'exp': res = Math.exp(val); break;
        case 'tenPow': res = Math.pow(10, val); break;
        
        case 'sqr': res = val * val; break;
        case 'cube': res = val * val * val; break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'cbrt': res = Math.cbrt(val); break;
        case 'recip': res = 1 / val; break;
        
        case 'fact': {
            let f = 1; for(let i=1;i<=val;i++) f*=i; res = f; break;
        }
        case 'abs': res = Math.abs(val); break;
        case 'neg': res = -val; break;
        case 'pct': res = val / 100; break;
      }
      
      const resStr = String(res).slice(0, 14);
      setDisplay(resStr);
      setIsNewTerm(true);
      if(drillActive) checkAnswer(res);
    } catch(e) {
      setDisplay("Error");
    }
  };

  const handleEq = () => {
    try {
      let finalExpr = expression + display;
      
      finalExpr = finalExpr.replace(/(\d+(\.\d+)?)\s*yroot\s*(\d+(\.\d+)?)/g, "Math.pow($1, 1/$3)");
      finalExpr = finalExpr.replace(/(\d+(\.\d+)?)\s*logbase\s*(\d+(\.\d+)?)/g, "(Math.log($1)/Math.log($3))");
      finalExpr = finalExpr.replace(/\^/g, '**');

      const res = eval(finalExpr); 
      setDisplay(String(res).slice(0, 14));
      setExpression('');
      setIsNewTerm(true);
      if(drillActive) checkAnswer(res);
    } catch (e) {
      setDisplay("Error");
    }
  };

  const handleClear = (all: boolean) => {
    setDisplay('0');
    if (all) setExpression('');
    setIsNewTerm(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setIsNewTerm(true);
    }
  };

  const handleMemory = (op: string) => {
    const val = parseFloat(display);
    switch(op) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(String(memory)); setIsNewTerm(true); break;
      case 'MS': setMemory(val); setIsNewTerm(true); break;
      case 'M+': setMemory(memory + val); setIsNewTerm(true); break;
      case 'M-': setMemory(memory - val); setIsNewTerm(true); break;
    }
  };

  const CalcBtn = ({ label, onClick, className = "", color = "default", colSpan = 1, rowSpan = 1 }: any) => {
    let bgClass = "bg-[#f0f0f0] text-black hover:bg-[#e0e0e0] border-[#a0a0a0]"; 
    if (color === "red") bgClass = "bg-[#d32f2f] text-white hover:bg-[#b71c1c] border-[#b71c1c]";
    if (color === "green") bgClass = "bg-[#28a745] text-white hover:bg-[#218838] border-[#218838]";
    if (color === "white") bgClass = "bg-white text-black hover:bg-[#f5f5f5] border-[#a0a0a0]";

    return (
      <button 
        onClick={onClick}
        className={`${bgClass} border rounded-[3px] text-xs md:text-sm font-medium active:scale-[0.98] transition-all shadow-sm flex items-center justify-center ${className} relative z-20 pointer-events-auto`}
        style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full animate-fade-in items-start justify-center relative z-10">
      
      <div className="bg-[#cccccc] p-1 rounded-md shadow-2xl w-full max-w-[800px] border border-gray-400 font-sans select-none flex-shrink-0 relative z-20">
        
        <div className="bg-[#4285f4] text-white flex justify-between items-center px-3 py-1.5 mb-1.5 rounded-t-sm">
          <span className="font-bold text-sm tracking-wide">Scientific Calculator</span>
          <div className="flex items-center gap-3">
             <button className="bg-[#64b5f6] hover:bg-[#90caf9] text-white px-3 py-0.5 text-xs rounded-sm transition-colors font-medium pointer-events-auto">Help</button>
             <div className="flex gap-1">
               <button className="text-white/80 hover:text-white pointer-events-auto"><Minus size={14}/></button>
               <button className="text-white/80 hover:text-white pointer-events-auto"><Maximize2 size={12}/></button>
               <button className="text-white/80 hover:text-red-300 pointer-events-auto"><CloseIcon size={14}/></button>
             </div>
          </div>
        </div>

        <div className="bg-[#e0e0e0] p-2.5 space-y-2.5 border-b border-gray-300">
           <input className="w-full h-8 border border-gray-400 bg-white px-2 text-sm text-gray-600 font-mono shadow-inner outline-none pointer-events-auto" readOnly value={expression} />
           <input className="w-full h-12 border border-gray-400 bg-white px-2 text-right text-3xl text-black font-bold shadow-inner outline-none pointer-events-auto" readOnly value={display} />
        </div>

        <div className="px-2 py-2 flex items-center justify-between text-black text-xs font-bold">
           <div className="flex items-center gap-4">
              <button className="border border-gray-400 bg-[#f0f0f0] px-2 py-1 rounded-sm hover:bg-[#e0e0e0] pointer-events-auto" onClick={() => handleOp('%')}>mod</button>
              <div className="flex gap-3 bg-[#e0e0e0] px-2 py-1 rounded border border-gray-300">
                <label className="flex items-center gap-1 cursor-pointer pointer-events-auto"><input type="radio" checked={angleMode==='deg'} onChange={()=>setAngleMode('deg')} className="accent-[#4285f4]"/> Deg</label>
                <label className="flex items-center gap-1 cursor-pointer pointer-events-auto"><input type="radio" checked={angleMode==='rad'} onChange={()=>setAngleMode('rad')} className="accent-[#4285f4]"/> Rad</label>
              </div>
           </div>
           <div className="flex gap-1">
              {['MC', 'MR', 'MS', 'M+', 'M-'].map(m => (
                 <button key={m} onClick={() => handleMemory(m)} className="bg-[#f0f0f0] border border-gray-400 px-2 py-1 rounded-sm hover:bg-[#e0e0e0] min-w-[32px] pointer-events-auto">{m}</button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-11 gap-1 px-2 pb-2 h-[320px]">
           <CalcBtn label="sinh" onClick={() => handleFunc('sinh')} />
           <CalcBtn label="cosh" onClick={() => handleFunc('cosh')} />
           <CalcBtn label="tanh" onClick={() => handleFunc('tanh')} />
           <CalcBtn label="Exp" onClick={() => handleOp('e+')} />
           <CalcBtn label="(" onClick={() => handleOp('(')} />
           <CalcBtn label=")" onClick={() => handleOp(')')} />
           <CalcBtn label="←" onClick={handleBackspace} color="red" colSpan={2} />
           <CalcBtn label="C" onClick={() => handleClear(true)} color="red" />
           <CalcBtn label="+/-" onClick={() => handleFunc('neg')} color="red" />
           <CalcBtn label="√" onClick={() => handleFunc('sqrt')} />

           <CalcBtn label="sinh⁻¹" onClick={() => handleFunc('asinh')} />
           <CalcBtn label="cosh⁻¹" onClick={() => handleFunc('acosh')} />
           <CalcBtn label="tanh⁻¹" onClick={() => handleFunc('atanh')} />
           <CalcBtn label="log₂x" onClick={() => handleFunc('log2')} />
           <CalcBtn label="ln" onClick={() => handleFunc('ln')} />
           <CalcBtn label="log" onClick={() => handleFunc('log')} />
           <CalcBtn label="7" onClick={() => handleNum('7')} color="white" className="font-bold text-base" />
           <CalcBtn label="8" onClick={() => handleNum('8')} color="white" className="font-bold text-base" />
           <CalcBtn label="9" onClick={() => handleNum('9')} color="white" className="font-bold text-base" />
           <CalcBtn label="/" onClick={() => handleOp('/')} />
           <CalcBtn label="%" onClick={() => handleFunc('pct')} />

           <CalcBtn label="π" onClick={() => handleNum(String(Math.PI))} />
           <CalcBtn label="e" onClick={() => handleNum(String(Math.E))} />
           <CalcBtn label="n!" onClick={() => handleFunc('fact')} />
           <CalcBtn label="logᵧx" onClick={() => handleOp('logbase')} />
           <CalcBtn label="eˣ" onClick={() => handleFunc('exp')} />
           <CalcBtn label="10ˣ" onClick={() => handleFunc('tenPow')} />
           <CalcBtn label="4" onClick={() => handleNum('4')} color="white" className="font-bold text-base" />
           <CalcBtn label="5" onClick={() => handleNum('5')} color="white" className="font-bold text-base" />
           <CalcBtn label="6" onClick={() => handleNum('6')} color="white" className="font-bold text-base" />
           <CalcBtn label="*" onClick={() => handleOp('*')} />
           <CalcBtn label="1/x" onClick={() => handleFunc('recip')} />

           <CalcBtn label="sin" onClick={() => handleFunc('sin')} />
           <CalcBtn label="cos" onClick={() => handleFunc('cos')} />
           <CalcBtn label="tan" onClick={() => handleFunc('tan')} />
           <CalcBtn label="xʸ" onClick={() => handleOp('^')} />
           <CalcBtn label="x³" onClick={() => handleFunc('cube')} />
           <CalcBtn label="x²" onClick={() => handleFunc('sqr')} />
           <CalcBtn label="1" onClick={() => handleNum('1')} color="white" className="font-bold text-base" />
           <CalcBtn label="2" onClick={() => handleNum('2')} color="white" className="font-bold text-base" />
           <CalcBtn label="3" onClick={() => handleNum('3')} color="white" className="font-bold text-base" />
           <CalcBtn label="-" onClick={() => handleOp('-')} />
           <CalcBtn label="=" onClick={handleEq} color="green" rowSpan={2} className="text-xl" />

           <CalcBtn label="sin⁻¹" onClick={() => handleFunc('asin')} />
           <CalcBtn label="cos⁻¹" onClick={() => handleFunc('acos')} />
           <CalcBtn label="tan⁻¹" onClick={() => handleFunc('atan')} />
           <CalcBtn label="ʸ√x" onClick={() => handleOp('yroot')} />
           <CalcBtn label="³√x" onClick={() => handleFunc('cbrt')} />
           <CalcBtn label="|x|" onClick={() => handleFunc('abs')} />
           <CalcBtn label="0" onClick={() => handleNum('0')} color="white" className="font-bold text-base" colSpan={2} />
           <CalcBtn label="." onClick={() => handleNum('.')} color="white" className="font-bold text-base" />
           <CalcBtn label="+" onClick={() => handleOp('+')} />
        </div>
      </div>

      <div className="w-full xl:w-[320px] space-y-4">
        <div className="bg-gate-800/80 backdrop-blur p-6 rounded-2xl border border-gate-700/50 shadow-xl relative z-20">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Zap className="text-yellow-400"/> Speed Trainer
           </h2>
           <p className="text-xs text-gate-400 mt-2">
             Calculate expressions using the interface on the left.
           </p>

           <div className="mt-6 space-y-4">
             {!drillActive ? (
                <button onClick={generateDrill} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gate-200 flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 pointer-events-auto">
                   <Play size={18}/> Start Speed Drill
                </button>
             ) : (
                <div className="bg-black/50 border border-gate-600 p-4 rounded-xl text-center animate-scale-in">
                   <div className="text-xs text-gate-500 uppercase font-bold">Target</div>
                   <div className="text-2xl font-mono text-white font-bold my-2">{targetExpr}</div>
                   {feedback && (
                     <div className={`text-sm font-bold animate-pulse ${feedback.includes('Correct') ? 'text-green-500' : 'text-red-500'}`}>
                        {feedback}
                     </div>
                   )}
                   <button onClick={() => setDrillActive(false)} className="text-xs text-red-400 mt-2 hover:text-red-300 underline pointer-events-auto">End Drill</button>
                </div>
             )}
           </div>
        </div>

        <div className="bg-gate-800/80 backdrop-blur p-6 rounded-2xl border border-gate-700/50 relative z-20">
           <h3 className="text-sm font-bold text-gate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award size={16}/> Drill Stats
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/60 p-3 rounded-xl border border-gate-800">
                 <div className="text-2xl font-bold text-white">{stats.correct}</div>
                 <div className="text-[10px] text-gate-500 uppercase">Solved</div>
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-gate-800">
                 <div className="text-2xl font-bold text-green-400">{stats.bestTimeSec < 999 ? stats.bestTimeSec.toFixed(2) : '-'}s</div>
                 <div className="text-[10px] text-gate-500 uppercase">Best Time</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCalculator;