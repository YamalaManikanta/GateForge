
import React, { useState, useEffect, useRef } from 'react';
import { getBackupTimestamp, restoreBackup, clearAllData, createBackup, getAllDataForExport, importDataFromFile } from '../../services/storageService';
import { Save, RefreshCw, Trash2, ShieldCheck, AlertOctagon, Download, Upload, FileJson } from 'lucide-react';

const DataControl: React.FC = () => {
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    updateBackupStatus();
  }, []);

  const updateBackupStatus = () => {
    const ts = getBackupTimestamp();
    setLastBackup(ts ? new Date(ts).toLocaleString() : 'Never');
  };

  const handleManualBackup = () => {
    createBackup();
    updateBackupStatus();
    showMsg('Internal backup updated.');
  };

  const handleRestore = () => {
    if (window.confirm("Are you sure? This will overwrite your current dashboard with the internal backup.")) {
      const success = restoreBackup();
      if (success) {
        showMsg('Data restored from internal backup.');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMsg('Failed to restore. No backup found?');
      }
    }
  };

  const handleDownload = () => {
    const data = getAllDataForExport();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gate-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg('Backup file downloaded.');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm("WARNING: Importing a file will completely REPLACE your current data. Continue?")) {
        const success = importDataFromFile(content);
        if (success) {
          showMsg('Data imported successfully. Reloading...');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showMsg('Error: Invalid backup file.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    if (confirmClear) {
      clearAllData();
      showMsg('All active data wiped. Backup preserved.');
      setConfirmClear(false);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setConfirmClear(true);
    }
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-gate-400" /> Data Control
        </h2>
        <p className="text-gate-500 text-sm">Manage persistence and perform hard backups.</p>
      </div>

      {msg && (
        <div className="bg-gate-800 border border-gate-600 text-white p-3 rounded-lg text-sm text-center font-bold animate-slide-up shadow-lg shadow-black/50">
          {msg}
        </div>
      )}

      {/* File Backup Section (Hard Backup) */}
      <div className="bg-gate-800 border border-gate-700 rounded-xl p-6 space-y-6">
        <div>
           <h3 className="text-lg font-bold text-white flex items-center gap-2">
             <FileJson className="text-blue-400" /> Hard Backup (Recommended)
           </h3>
           <p className="text-xs text-gate-400 mt-1">
             Download your data to a file. This is the only way to save data if you clear browser cache or switch computers.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button 
             onClick={handleDownload}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-4 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-colors border border-blue-500"
           >
             <Download size={24} /> 
             <span>Download .json</span>
           </button>

           <div className="relative">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full h-full bg-gate-900 hover:bg-gate-700 text-gate-300 hover:text-white px-4 py-4 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-colors border border-gate-600 border-dashed"
             >
               <Upload size={24} />
               <span>Import .json</span>
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               accept=".json" 
               className="hidden" 
               onChange={handleUpload}
             />
           </div>
        </div>
      </div>

      {/* Browser Storage Section */}
      <div className="bg-gate-800 border border-gate-700 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Browser Storage</h3>
            <p className="text-xs text-gate-400 mt-1">
              Internal Auto-Backup: <span className="text-white font-mono">{lastBackup}</span>
            </p>
          </div>
          <button 
            onClick={handleManualBackup}
            className="bg-white hover:bg-gate-200 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Save size={16} /> Force Save
          </button>
        </div>
        
        <div className="h-px bg-gate-700 w-full"></div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
             <p className="text-sm text-gate-300">
               Restoring from internal backup reverts to the last time a Mock, Error, or Log was saved.
             </p>
          </div>
          <button 
            onClick={handleRestore}
            className="bg-gate-900 border border-gate-600 hover:border-orange-500 text-orange-500 hover:text-orange-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
          >
            <RefreshCw size={16} /> Revert
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
          <AlertOctagon size={20} /> Danger Zone
        </h3>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <p className="text-sm text-gate-400 max-w-md">
             This action will delete all active data from this browser. 
             If you haven't downloaded a backup file, data will be lost forever.
           </p>

           <div className="flex flex-col items-end gap-2">
             {confirmClear && (
               <span className="text-xs text-red-400 font-bold uppercase animate-pulse">
                 Click again to confirm
               </span>
             )}
             <button 
               onClick={handleClear}
               className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                 confirmClear 
                   ? 'bg-red-600 text-white hover:bg-red-700' 
                   : 'bg-transparent border border-red-900 text-red-600 hover:bg-red-950/50'
               }`}
             >
               <Trash2 size={16} /> {confirmClear ? 'CONFIRM NUKE' : 'Clear All Data'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DataControl;
