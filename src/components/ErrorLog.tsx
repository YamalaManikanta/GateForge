
import React, { useState, useEffect, useRef } from 'react';
import { saveError, getErrors } from '../../services/storageService';
import { ErrorLogEntry, Subject, MistakeType } from '../../types';
import { SUBJECTS, MISTAKE_TYPES } from '../../constants';
import { compressImage } from '../../utils/imageCompressor';
import { Filter, Plus, X, Camera, Image as ImageIcon, Eye } from 'lucide-react';

const ErrorLog: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('All');
  
  // Image handling state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ErrorLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    subject: Subject.CN,
    topic: '',
    mistakeType: MistakeType.CONCEPT,
    notes: '',
    timeSpentSeconds: 0
  });

  useEffect(() => {
    setErrors(getErrors());
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(e.target.files[0]);
        setSelectedImage(compressedBase64);
      } catch (err) {
        alert("Failed to process image.");
        console.error(err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic || !formData.notes) return;

    const newError: ErrorLogEntry = {
      id: Date.now().toString(),
      date: formData.date!,
      subject: formData.subject!,
      topic: formData.topic!,
      mistakeType: formData.mistakeType!,
      notes: formData.notes!,
      timeSpentSeconds: Number(formData.timeSpentSeconds) || 0,
      reviewCount: 0,
      imageUrl: selectedImage || undefined
    };

    saveError(newError);
    setErrors(getErrors());
    setFormData({ ...formData, topic: '', notes: '', timeSpentSeconds: 0 });
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredErrors = filterSubject === 'All' 
    ? errors 
    : errors.filter(e => e.subject === filterSubject);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gate-100 tracking-tight">Error Log</h2>
          <p className="text-gate-500 text-sm">The Black Book of Mistakes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-red-900/20 flex items-center gap-2 text-sm font-bold uppercase transition-all"
        >
          {showForm ? <X size={16}/> : <Plus size={16}/>} {showForm ? 'Close' : 'Log Mistake'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gate-900 p-6 rounded-xl border border-gate-700 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up shadow-2xl">
           <div>
            <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Subject</label>
            <select className="w-full bg-gate-950 border border-gate-600 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
              value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value as Subject})}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
           </div>
           <div>
            <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Topic</label>
            <input type="text" required placeholder="e.g. TCP Flow Control" className="w-full bg-gate-950 border border-gate-600 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
              value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
           </div>
           <div>
            <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Mistake Type</label>
            <select className="w-full bg-gate-950 border border-gate-600 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
              value={formData.mistakeType} onChange={e => setFormData({...formData, mistakeType: e.target.value as MistakeType})}>
              {MISTAKE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
           </div>
           <div>
             <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Time Wasted (Sec)</label>
             <input type="number" placeholder="0" className="w-full bg-gate-950 border border-gate-600 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
              value={formData.timeSpentSeconds} onChange={e => setFormData({...formData, timeSpentSeconds: Number(e.target.value)})} />
           </div>
           <div className="col-span-1 md:col-span-2">
            <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Correct Logic</label>
            <textarea required rows={2} placeholder="Fix the gap." className="w-full bg-gate-950 border border-gate-600 rounded-lg p-3 text-gate-200 focus:ring-1 focus:ring-gate-300 outline-none"
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
           </div>

           {/* Image Upload Section */}
           <div className="col-span-1 md:col-span-2 border-t border-gate-700 pt-4">
              <label className="block text-gate-400 text-xs font-bold uppercase mb-2">Attach Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gate-800 hover:bg-gate-700 text-gate-300 border border-gate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase transition-colors"
                >
                  <Camera size={16} /> {selectedImage ? 'Change Photo' : 'Take Photo'}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSelect}
                />
                {isCompressing && <span className="text-xs text-gate-500 animate-pulse">Compressing...</span>}
                {selectedImage && !isCompressing && (
                  <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                    <ImageIcon size={16} /> Attached
                    <button type="button" onClick={() => setSelectedImage(null)} className="text-red-500 hover:text-red-400 ml-2"><X size={14}/></button>
                  </div>
                )}
              </div>
           </div>

           <div className="col-span-1 md:col-span-2 flex justify-end">
             <button type="submit" disabled={isCompressing} className="bg-gate-100 hover:bg-gate-300 text-gate-950 px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors">Add Entry</button>
           </div>
        </form>
      )}

      {/* Image Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img src={previewImage} alt="Mistake Evidence" className="w-full h-full object-contain rounded-lg border border-gate-700" />
            <button className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-gate-900 p-2 rounded-lg border border-gate-700 w-fit">
          <Filter size={14} className="text-gate-400 ml-2" />
          <select 
            value={filterSubject} 
            onChange={e => setFilterSubject(e.target.value)}
            className="bg-transparent text-sm text-gate-200 focus:outline-none p-1 cursor-pointer"
          >
            <option value="All">All Subjects</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredErrors.map((err, idx) => (
            <div key={err.id} 
              className="bg-gate-900 border-l-2 border-l-gate-600 rounded-r-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start animate-slide-in-right hover:bg-gate-800/80 transition-colors shadow-sm"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-[10px] font-bold text-gate-400 uppercase tracking-widest bg-gate-950 px-2 py-1 rounded">{err.subject}</span>
                  <span className="text-sm text-gate-100 font-bold">{err.topic}</span>
                </div>
                <p className="text-gate-300 text-sm leading-relaxed whitespace-pre-wrap">{err.notes}</p>
                
                <div className="flex gap-3 mt-3">
                  {err.timeSpentSeconds > 180 && (
                    <div className="inline-flex items-center text-[10px] font-bold uppercase text-yellow-500 bg-yellow-950/30 border border-yellow-900/50 px-2 py-0.5 rounded">
                      Time Sink: {Math.floor(err.timeSpentSeconds/60)}m wasted
                    </div>
                  )}
                  {err.imageUrl && (
                    <button 
                      onClick={() => setPreviewImage(err.imageUrl!)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-400 bg-blue-950/30 border border-blue-900/50 px-2 py-0.5 rounded hover:bg-blue-900/50 transition-colors"
                    >
                      <Eye size={12} /> View Image
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                <span className="text-xs text-gate-500 font-mono">{err.date}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                  err.mistakeType === MistakeType.SILLY ? 'border-orange-900 text-orange-400 bg-orange-950/30' :
                  err.mistakeType === MistakeType.CONCEPT ? 'border-red-900 text-red-400 bg-red-950/30' :
                  'border-blue-900 text-blue-400 bg-blue-950/30'
                }`}>
                  {err.mistakeType}
                </span>
              </div>
            </div>
          ))}
          {filteredErrors.length === 0 && (
            <div className="text-center py-12 text-gate-500 border border-dashed border-gate-800 rounded-xl">
              No errors logged.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorLog;
