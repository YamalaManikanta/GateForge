import React, { useState, useEffect } from 'react';
import { getCheatSheet, saveCheatSheet } from '../services/storageService';
import { Printer, Save, FileText, Type } from 'lucide-react';

const CheatSheetGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState('');

  useEffect(() => {
    const data = getCheatSheet();
    setContent(data.content);
    setLastSaved(new Date(data.lastModified).toLocaleString());
  }, []);

  const handleSave = () => {
    const now = new Date().toISOString();
    saveCheatSheet({ content, lastModified: now });
    setLastSaved(new Date(now).toLocaleString());
  };

  const handlePrint = () => {
    handleSave();
    setTimeout(() => window.print(), 100);
  };

  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('###')) return <h3 key={idx} className="font-bold text-sm uppercase mt-2 mb-1 border-b border-black pb-0.5 break-after-avoid">{line.slice(3)}</h3>;
      if (line.startsWith('##')) return <h2 key={idx} className="font-bold text-base uppercase mt-3 mb-1 bg-black text-white px-1 break-after-avoid">{line.slice(2)}</h2>;
      if (line.startsWith('#')) return <h1 key={idx} className="font-bold text-xl uppercase mt-4 mb-2 text-center border-2 border-black p-1 break-after-avoid">{line.slice(1)}</h1>;
      if (line.startsWith('-')) return <li key={idx} className="ml-4 text-[10px] leading-tight mb-0.5">{parseInline(line.slice(1))}</li>;
      if (line.trim() === '') return <div key={idx} className="h-2"></div>;
      return <p key={idx} className="text-[10px] leading-tight mb-1 text-justify">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-fade-in relative print:h-auto print:block relative z-10">
      
      <div className="flex-1 flex flex-col bg-gate-800 rounded-xl border border-gate-700 overflow-hidden print:hidden cheatsheet-editor">
         <div className="bg-gate-900 p-3 border-b border-gate-700 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
               <Type size={16} /> Markdown Editor
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs text-gate-500 hidden md:block">Last saved: {lastSaved}</span>
               <button onClick={handleSave} className="bg-gate-700 hover:bg-gate-600 text-white p-2 rounded transition-colors" title="Save">
                  <Save size={16} />
               </button>
            </div>
         </div>
         <textarea 
           className="flex-1 bg-black text-gate-300 p-4 font-mono text-xs resize-none focus:outline-none leading-relaxed relative z-20 pointer-events-auto"
           value={content}
           onChange={(e) => setContent(e.target.value)}
           placeholder="# Header 1&#10;## Header 2&#10;- Bullet point&#10;**Bold text**"
         />
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gate-700 overflow-hidden text-black relative cheatsheet-preview">
         <div className="bg-gate-200 p-3 border-b border-gate-300 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-2 text-black font-bold text-sm">
               <FileText size={16} /> A4 Preview (Dense)
            </div>
            <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase flex items-center gap-2 transition-colors">
               <Printer size={14} /> Print PDF
            </button>
         </div>
         
         <div className="flex-1 p-6 overflow-y-auto font-serif printable-area" id="printable-section">
             {parseMarkdown(content)}
         </div>

         <div className="md:hidden absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center print:hidden z-10">
            <p className="text-white text-sm font-bold">Please use a desktop to edit and print the Cheat Sheet efficiently.</p>
         </div>
      </div>
    </div>
  );
};

export default CheatSheetGenerator;