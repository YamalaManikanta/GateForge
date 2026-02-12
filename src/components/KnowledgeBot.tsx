import React, { useState, useEffect, useRef } from 'react';
import { getKnowledgeBase, saveKnowledgeItem } from '../services/storageService';
import { KnowledgeItem, ChatMessage, Subject } from '../types';
import { SUBJECTS } from '../constants';
import { Send, Terminal, Plus, X, Database, HelpCircle, Book, Search } from 'lucide-react';
import Fuse from 'fuse.js';

const KnowledgeBot: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', text: "Systems online. I am The Oracle. \n\nI am a deterministic offline engine equipped with Fuzzy Search. I can handle typos and partial queries.\n\nTry asking: 'Dijkstra algo' or 'quik sort time'.", sender: 'bot', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [teachData, setTeachData] = useState<{keywords: string, answer: string, category: Subject}>({
    keywords: '',
    answer: '',
    category: Subject.ALGO
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fuse, setFuse] = useState<Fuse<KnowledgeItem> | null>(null);

  useEffect(() => {
    const data = getKnowledgeBase();
    setKnowledge(data);
    
    const fuseOptions = {
      keys: [
        { name: 'keywords', weight: 0.6 },
        { name: 'answer', weight: 0.3 },
        { name: 'category', weight: 0.1 }
      ],
      threshold: 0.4, 
      includeScore: true
    };
    setFuse(new Fuse(data, fuseOptions));

  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const findBestMatch = (query: string): KnowledgeItem | null => {
    if (!fuse || !query.trim()) return null;
    const results = fuse.search(query);
    if (results.length > 0) {
       return results[0].item;
    }
    return null;
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const match = findBestMatch(userMsg.text);
      let botText = "";

      if (match) {
        botText = match.answer;
      } else {
        botText = "Data not found in local index. \n\nEven with fuzzy search, I couldn't find a match. \n\nIf the concept is missing, use the 'Teach' button to add it.";
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleTeachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachData.keywords || !teachData.answer) return;

    const keywordsArray = teachData.keywords.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
    
    const newItem: KnowledgeItem = {
      id: `custom_${Date.now()}`,
      category: teachData.category,
      keywords: keywordsArray,
      answer: teachData.answer
    };

    saveKnowledgeItem(newItem);
    
    const newData = getKnowledgeBase();
    setKnowledge(newData);
    setFuse(new Fuse(newData, {
      keys: [
        { name: 'keywords', weight: 0.6 },
        { name: 'answer', weight: 0.3 },
        { name: 'category', weight: 0.1 }
      ],
      threshold: 0.4
    }));

    setShowTeachModal(false);
    setTeachData({ keywords: '', answer: '', category: Subject.ALGO });
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: `Knowledge updated. I now know about: [${keywordsArray.join(', ')}].`,
      sender: 'bot',
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in bg-gate-900 border border-gate-800 rounded-xl overflow-hidden relative z-10">
      
      <div className="bg-gate-800 p-4 flex justify-between items-center border-b border-gate-700 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 rounded-lg border border-gate-600">
             <Terminal size={18} className="text-green-500" />
          </div>
          <div>
            <h2 className="text-white font-bold flex items-center gap-2">
              The Oracle <span className="text-[10px] bg-gate-700 text-gate-400 px-1.5 rounded uppercase">v1.5 Fuzzy</span>
            </h2>
            <p className="text-xs text-gate-500">Database Size: {knowledge.length} concepts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHelpModal(true)}
            className="bg-gate-900 hover:bg-gate-800 text-gate-400 border border-gate-600 p-2 rounded-lg transition-colors pointer-events-auto"
            title="Operational Manual"
          >
            <HelpCircle size={16} />
          </button>
          <button 
            onClick={() => setShowTeachModal(true)}
            className="bg-gate-700 hover:bg-white hover:text-black text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2 pointer-events-auto"
          >
            <Plus size={14} /> Teach
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 scroll-smooth relative z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user' 
                ? 'bg-gate-800 text-white border border-gate-600 rounded-tr-none' 
                : 'bg-gate-900/80 text-gate-200 border border-gate-700 rounded-tl-none'
            }`}>
              {msg.text}
              <div className="text-[9px] text-right mt-1 opacity-50 uppercase tracking-wider">
                {msg.sender === 'bot' ? 'Oracle' : 'You'}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-gate-900/80 p-3 rounded-xl rounded-tl-none border border-gate-700 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-gate-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gate-500 rounded-full animate-bounce animate-delay-100"></div>
                <div className="w-1.5 h-1.5 bg-gate-500 rounded-full animate-bounce animate-delay-200"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gate-800 p-4 border-t border-gate-700 relative z-20">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (typos allowed)..." 
            className="w-full bg-black text-white p-4 pr-12 rounded-xl border border-gate-600 focus:border-white focus:outline-none placeholder:text-gate-600 font-mono text-sm pointer-events-auto"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 p-2 bg-gate-700 text-white rounded-lg hover:bg-white hover:text-black transition-colors pointer-events-auto"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {showHelpModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-gate-800 w-full max-w-lg border border-gate-600 rounded-xl p-6 shadow-2xl relative animate-slide-up z-[110]">
              <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-gate-400 hover:text-white pointer-events-auto"><X size={20}/></button>
              
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Book size={18} className="text-yellow-500"/> Operational Manual
              </h3>

              <div className="space-y-4 text-sm text-gate-300">
                <div className="bg-black/40 p-3 rounded border border-gate-700">
                  <h4 className="font-bold text-white mb-1">1. Protocol Overview</h4>
                  <p>I use <span className="text-blue-400">Fuse.js</span> to perform approximate string matching. You don't need to spell correctly.</p>
                </div>

                <div className="bg-black/40 p-3 rounded border border-gate-700">
                  <h4 className="font-bold text-white mb-1">2. Search Strategy</h4>
                  <p>
                    <span className="text-green-400 font-mono">"quick sort worst case"</span> matches <br/>
                    <span className="text-gate-500 font-mono">"Quick Sort: ... worst case O(n^2)"</span>
                  </p>
                  <p className="mt-2 text-xs text-gate-500">I scan keywords first, then the full answer text.</p>
                </div>

                <div className="bg-black/40 p-3 rounded border border-gate-700">
                  <h4 className="font-bold text-white mb-1">3. Expansion</h4>
                  <p>If I don't know a topic, click <span className="font-bold text-white">TEACH</span>. New items are instantly indexed for fuzzy searching.</p>
                </div>
              </div>
              
              <button onClick={() => setShowHelpModal(false)} className="w-full mt-6 bg-gate-700 hover:bg-gate-600 text-white font-bold py-3 rounded-lg transition-colors pointer-events-auto">
                Acknowledged
              </button>
           </div>
        </div>
      )}

      {showTeachModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-gate-800 w-full max-w-md border border-gate-600 rounded-xl p-6 shadow-2xl relative animate-slide-up z-[110]">
              <button onClick={() => setShowTeachModal(false)} className="absolute top-4 right-4 text-gate-400 hover:text-white pointer-events-auto"><X size={20}/></button>
              
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <Database size={18} className="text-blue-400"/> Update Database
              </h3>
              
              <form onSubmit={handleTeachSubmit} className="space-y-4">
                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Category</label>
                    <select 
                      value={teachData.category}
                      onChange={(e) => setTeachData({...teachData, category: e.target.value as Subject})}
                      className="w-full bg-black border border-gate-600 rounded-lg p-2 text-white text-sm focus:border-white outline-none pointer-events-auto"
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Keywords (Comma Separated)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. heap, max heap, priority queue"
                      value={teachData.keywords}
                      onChange={(e) => setTeachData({...teachData, keywords: e.target.value})}
                      className="w-full bg-black border border-gate-600 rounded-lg p-3 text-white text-sm focus:border-white outline-none pointer-events-auto"
                    />
                 </div>

                 <div>
                    <label className="block text-gate-500 text-xs font-bold uppercase mb-1">Definition / Answer</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Enter the factual explanation..."
                      value={teachData.answer}
                      onChange={(e) => setTeachData({...teachData, answer: e.target.value})}
                      className="w-full bg-black border border-gate-600 rounded-lg p-3 text-white text-sm focus:border-white outline-none resize-none pointer-events-auto"
                    />
                 </div>

                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors pointer-events-auto">
                    Commit to Memory
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBot;