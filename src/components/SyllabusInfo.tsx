
import React, { useState, useEffect, useRef } from 'react';
import { getInfoItems, saveInfoItem, deleteInfoItem } from '../../services/storageService';
import { InfoItem } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import { BookOpen, TrendingUp, FolderOpen, Plus, Trash2, X, FileText, Image as ImageIcon, Clipboard, Grid } from 'lucide-react';

const SyllabusInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'pattern' | 'strategy' | 'resources'>('syllabus');
  const [items, setItems] = useState<InfoItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InfoItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(getInfoItems());
  }, []);

  // Handle Paste Event for Images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (activeTab !== 'resources') return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            await processImageFile(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImage(file);
      const newItem: InfoItem = {
        id: Date.now().toString(),
        title: file.name || `Pasted Image ${new Date().toLocaleTimeString()}`,
        date: new Date().toISOString().split('T')[0],
        dataUrl: compressedBase64,
        type: 'image'
      };
      saveInfoItem(newItem);
      setItems(getInfoItems());
    } catch (err) {
      alert("Failed to process image.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processImageFile(e.target.files[0]);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Strict Size Limit for PDFs in LocalStorage (1.5MB)
      if (file.size > 1.5 * 1024 * 1024) {
        alert("PDF is too large. Limit is 1.5MB for offline storage.");
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const newItem: InfoItem = {
            id: Date.now().toString(),
            title: file.name,
            date: new Date().toISOString().split('T')[0],
            dataUrl: reader.result as string,
            type: 'pdf'
          };
          saveInfoItem(newItem);
          setItems(getInfoItems());
        } catch (err) {
          alert("Storage full. Delete old items.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if(confirm("Delete this item?")) {
      deleteInfoItem(id);
      setItems(getInfoItems());
    }
  };

  const images = items.filter(i => i.type === 'image');
  const pdfs = items.filter(i => i.type === 'pdf');

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-md text-xs font-bold uppercase flex items-center gap-2 transition-all ${activeTab === id ? 'bg-gate-700 text-white' : 'text-gate-500 hover:text-gate-300'}`}>
        <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Syllabus & Info</h2>
          <p className="text-gate-500 text-sm">Official reference and your saved resources.</p>
        </div>
        <div className="flex bg-gate-900 p-1 rounded-lg border border-gate-800 flex-wrap">
           <TabButton id="syllabus" label="Syllabus" icon={BookOpen} />
           <TabButton id="pattern" label="Pattern" icon={Grid} />
           <TabButton id="strategy" label="Strategy" icon={TrendingUp} />
           <TabButton id="resources" label="Resources" icon={FolderOpen} />
        </div>
      </div>

      <div className="bg-gate-800 border border-gate-700 rounded-xl min-h-[500px] p-6">
        
        {/* SYLLABUS TAB */}
        {activeTab === 'syllabus' && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { sec: 1, title: "Engineering Mathematics", topics: "Discrete Math (Logic, Sets, Graphs), Linear Algebra (Matrices, Eigenvalues), Calculus (Limits, Maxima/Minima), Probability (Distributions, Bayes)." },
                { sec: 2, title: "Digital Logic", topics: "Boolean algebra, Combinational/Sequential circuits, Minimization, Number representations (Fixed & Floating point)." },
                { sec: 3, title: "COA", topics: "Instructions, Addressing modes, ALU, Pipelining, Cache/Memory hierarchy, I/O interface." },
                { sec: 4, title: "Programming & DS", topics: "C Programming, Recursion, Arrays, Stacks, Queues, Linked Lists, Trees, BST, Heaps, Graphs." },
                { sec: 5, title: "Algorithms", topics: "Sorting, Hashing, Asymptotic analysis, Greedy, DP, Divide & Conquer, Graph traversals, Shortest paths, MST." },
                { sec: 6, title: "Theory of Computation", topics: "Regular expressions, FA, CFG, PDA, Pumping lemma, Turing machines, Undecidability." },
                { sec: 7, title: "Compiler Design", topics: "Lexical analysis, Parsing, Syntax-directed translation, Runtime env, Intermediate code, Optimization." },
                { sec: 8, title: "Operating System", topics: "Processes, Threads, IPC, Synchronization, Deadlock, CPU Scheduling, Memory mgmt, Virtual memory, File systems." },
                { sec: 9, title: "Databases", topics: "ER-model, Relational model, SQL, Normal forms, File organization, Indexing (B/B+ trees), Transactions." },
                { sec: 10, title: "Computer Networks", topics: "Layering, Flow/Error control, Routing, IP, TCP/UDP, Application layer (DNS, HTTP, SMTP)." },
              ].map(item => (
                <div key={item.sec} className="border-b border-gate-700 pb-4 last:border-0">
                  <h3 className="text-gate-200 font-bold mb-1">Section {item.sec}: {item.title}</h3>
                  <p className="text-sm text-gate-400 leading-relaxed">{item.topics}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXAM PATTERN TAB */}
        {activeTab === 'pattern' && (
          <div className="space-y-8 animate-slide-up max-w-4xl mx-auto">
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/50 p-6 rounded-xl border border-gate-700 text-center">
                   <div className="text-gate-500 text-xs uppercase font-bold mb-1">Total Marks</div>
                   <div className="text-4xl font-bold text-white">100</div>
                </div>
                <div className="bg-black/50 p-6 rounded-xl border border-gate-700 text-center">
                   <div className="text-gate-500 text-xs uppercase font-bold mb-1">Total Questions</div>
                   <div className="text-4xl font-bold text-white">65</div>
                </div>
                <div className="bg-black/50 p-6 rounded-xl border border-gate-700 text-center">
                   <div className="text-gate-500 text-xs uppercase font-bold mb-1">Duration</div>
                   <div className="text-4xl font-bold text-white">180<span className="text-sm text-gate-600 ml-1">min</span></div>
                </div>
             </div>

             <div className="bg-gate-900 border border-gate-700 rounded-xl overflow-hidden">
                <div className="p-4 bg-gate-950 border-b border-gate-800 font-bold text-white text-sm uppercase tracking-wide">
                   Marks Distribution
                </div>
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="bg-gate-900 text-gate-500 text-xs uppercase">
                         <th className="p-4 font-bold">Section</th>
                         <th className="p-4 font-bold text-right">No. of Qs</th>
                         <th className="p-4 font-bold text-right">Marks</th>
                         <th className="p-4 font-bold">Composition</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gate-800 text-gate-300">
                      <tr>
                         <td className="p-4 font-bold text-white">General Aptitude (GA)</td>
                         <td className="p-4 text-right">10</td>
                         <td className="p-4 text-right font-bold text-white">15</td>
                         <td className="p-4 text-xs text-gate-400">5 Qs × 1 Mark<br/>5 Qs × 2 Marks</td>
                      </tr>
                      <tr>
                         <td className="p-4 font-bold text-white">Engineering Math + Core</td>
                         <td className="p-4 text-right">55</td>
                         <td className="p-4 text-right font-bold text-white">85</td>
                         <td className="p-4 text-xs text-gate-400">25 Qs × 1 Mark<br/>30 Qs × 2 Marks</td>
                      </tr>
                      <tr className="bg-gate-950/50">
                         <td className="p-4 font-bold text-white">TOTAL</td>
                         <td className="p-4 text-right font-bold">65</td>
                         <td className="p-4 text-right font-bold text-green-400">100</td>
                         <td className="p-4"></td>
                      </tr>
                   </tbody>
                </table>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-950/10 border border-red-900/30 p-5 rounded-xl">
                   <h4 className="font-bold text-red-400 mb-2">MCQ</h4>
                   <p className="text-xs text-gate-400 mb-2">Multiple Choice Questions. 1 correct option.</p>
                   <div className="text-[10px] font-bold text-red-500 bg-red-950/30 px-2 py-1 rounded inline-block">Negative Marking: -1/3 (1M), -2/3 (2M)</div>
                </div>
                <div className="bg-blue-950/10 border border-blue-900/30 p-5 rounded-xl">
                   <h4 className="font-bold text-blue-400 mb-2">MSQ</h4>
                   <p className="text-xs text-gate-400 mb-2">Multiple Select Questions. 1 or more correct options.</p>
                   <div className="text-[10px] font-bold text-green-500 bg-green-950/30 px-2 py-1 rounded inline-block">No Negative Marking</div>
                </div>
                <div className="bg-yellow-950/10 border border-yellow-900/30 p-5 rounded-xl">
                   <h4 className="font-bold text-yellow-400 mb-2">NAT</h4>
                   <p className="text-xs text-gate-400 mb-2">Numerical Answer Type. Enter the value.</p>
                   <div className="text-[10px] font-bold text-green-500 bg-green-950/30 px-2 py-1 rounded inline-block">No Negative Marking</div>
                </div>
             </div>

          </div>
        )}

        {/* STRATEGY TAB */}
        {activeTab === 'strategy' && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Marks Distribution */}
            <div className="bg-black/40 p-4 rounded-xl border border-gate-700">
               <h3 className="text-white font-bold mb-3 flex items-center gap-2">Marks Distribution</h3>
               <div className="grid grid-cols-3 gap-4 text-center text-sm">
                 <div className="bg-gate-900 p-3 rounded border border-gate-800">
                   <div className="text-gate-400 text-xs uppercase">Engg Math</div>
                   <div className="text-xl font-bold text-white">13</div>
                 </div>
                 <div className="bg-gate-900 p-3 rounded border border-gate-800">
                   <div className="text-gate-400 text-xs uppercase">Aptitude</div>
                   <div className="text-xl font-bold text-white">15</div>
                 </div>
                 <div className="bg-gate-900 p-3 rounded border border-gate-800">
                   <div className="text-gate-400 text-xs uppercase">CS Core</div>
                   <div className="text-xl font-bold text-white">72</div>
                 </div>
               </div>
            </div>

            {/* Insights Strategy */}
            <div className="space-y-4">
              <h3 className="text-white font-bold">Subject Weightage & Priority</h3>
              
              <div className="bg-green-950/20 border border-green-900/50 p-4 rounded-xl">
                 <h4 className="text-green-400 font-bold text-sm uppercase mb-2">High Weightage (Must Master)</h4>
                 <ul className="list-disc list-inside text-sm text-gate-300 space-y-1">
                   <li>Programming + DS + Algo (~16-17%)</li>
                   <li>Operating Systems (~9-10%)</li>
                   <li>COA (~8-12%)</li>
                   <li>Computer Networks (~7-10%)</li>
                   <li>General Aptitude (~15%)</li>
                 </ul>
              </div>

              <div className="bg-yellow-950/20 border border-yellow-900/50 p-4 rounded-xl">
                 <h4 className="text-yellow-400 font-bold text-sm uppercase mb-2">Medium Weightage (Selective)</h4>
                 <ul className="list-disc list-inside text-sm text-gate-300 space-y-1">
                   <li>DBMS (~7-8%)</li>
                   <li>Discrete Math (~7-8%)</li>
                   <li>Theory of Computation (~6-8%)</li>
                   <li>Engg Math (~6-13%) - <i>Linear Algebra, Probability</i></li>
                 </ul>
              </div>

              <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl">
                 <h4 className="text-red-400 font-bold text-sm uppercase mb-2">Low Weightage (Minimize)</h4>
                 <ul className="list-disc list-inside text-sm text-gate-300 space-y-1">
                   <li>Compiler Design (~4-5%)</li>
                   <li>Digital Logic (~5-6%)</li>
                 </ul>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES TAB (Images & PDFs) */}
        {activeTab === 'resources' && (
          <div className="space-y-8 animate-slide-up">
             
             {/* Upload Controls */}
             <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 p-4 rounded-xl border border-gate-700 gap-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Your Resources</h3>
                  <p className="text-xs text-gate-500 flex items-center gap-1">
                    <Clipboard size={12} /> Paste (Ctrl+V) images directly here.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isProcessing}
                    className="bg-gate-800 hover:bg-gate-700 text-white border border-gate-600 px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <ImageIcon size={16} /> Image
                  </button>
                  <button 
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={isProcessing}
                    className="bg-white hover:bg-gate-200 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <FileText size={16} /> PDF
                  </button>
                </div>
                
                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                <input type="file" ref={pdfInputRef} accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
             </div>

             {/* Documents Section */}
             {pdfs.length > 0 && (
               <div className="space-y-3">
                 <h3 className="text-gate-400 text-xs font-bold uppercase">Documents</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {pdfs.map(pdf => (
                     <div key={pdf.id} className="bg-gate-900 border border-gate-700 p-4 rounded-lg flex justify-between items-center hover:border-gate-500 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="bg-red-900/20 p-2 rounded text-red-400">
                             <FileText size={20} />
                           </div>
                           <div className="truncate">
                             <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{pdf.title}</h4>
                             <span className="text-xs text-gate-500">{pdf.date}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedItem(pdf)}
                            className="text-xs bg-gate-800 text-white px-3 py-1.5 rounded hover:bg-gate-700 border border-gate-700"
                          >
                            Open
                          </button>
                          <button 
                             onClick={() => handleDelete(pdf.id)}
                             className="text-gate-500 hover:text-red-500 p-1.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Images Section */}
             <div className="space-y-3">
               {images.length > 0 && <h3 className="text-gate-400 text-xs font-bold uppercase">Gallery</h3>}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {images.map(img => (
                   <div key={img.id} className="group relative aspect-square bg-black border border-gate-800 rounded-xl overflow-hidden hover:border-gate-500 transition-colors cursor-pointer" onClick={() => setSelectedItem(img)}>
                      <img src={img.dataUrl} alt={img.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <p className="text-white text-xs font-bold px-2 text-center break-all">{img.title}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                 ))}
               </div>
             </div>

             {items.length === 0 && (
               <div className="py-12 text-center text-gate-600 border border-dashed border-gate-800 rounded-xl">
                 No resources uploaded yet. Add syllabus snapshots or reference PDFs.
               </div>
             )}
          </div>
        )}
      </div>

      {/* Item Viewer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="relative max-w-5xl max-h-[95vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            
            {selectedItem.type === 'image' ? (
              <img src={selectedItem.dataUrl} alt="View" className="max-w-full max-h-full object-contain rounded-lg border border-gate-700" />
            ) : (
              <div className="w-full h-full bg-white rounded-lg overflow-hidden flex flex-col">
                 <div className="bg-gate-800 p-2 flex justify-between items-center border-b border-gate-700">
                    <span className="text-white text-sm font-bold px-2">{selectedItem.title}</span>
                    <button onClick={() => setSelectedItem(null)} className="text-white hover:text-red-400 p-1"><X size={20}/></button>
                 </div>
                 <iframe src={selectedItem.dataUrl} className="w-full h-full" title="PDF Viewer"></iframe>
              </div>
            )}

            {selectedItem.type === 'image' && (
               <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
               >
                 <X size={24} />
               </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusInfo;
