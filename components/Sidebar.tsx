
import React, { useState, useEffect } from 'react';
import { Users, LayoutGrid, Calendar, LogOut, Heart, Map as MapIcon, RefreshCw, ShieldCheck, Cloud, CloudUpload, DownloadCloud, Info, Settings, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings') => void;
  hasActiveEvent: boolean;
  currentEventName?: string;
  onExitEvent: () => void;
  onLogout: () => void;
  username: string;
  isAdmin?: boolean;
  isSaving?: boolean;
}

const APP_VERSION = 'v1.6.0';
const LAST_UPDATED = '24.05.2024';

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, hasActiveEvent, currentEventName, onExitEvent, onLogout, username, isAdmin, isSaving }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <aside className="w-64 bg-indigo-900 text-white flex flex-col hidden md:flex sticky top-0 h-screen shadow-xl z-30">
      <div className="p-6 border-b border-indigo-800">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-pink-400 fill-pink-400" size={24} />
          <h1 className="text-xl font-bold tracking-tight text-white">יושבים בכיף</h1>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 relative group">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-black shrink-0 shadow-inner">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">מחובר</p>
                {isAdmin && (
                  <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 rounded-sm flex items-center gap-0.5">
                    <ShieldCheck size={8} /> מנהל
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isSaving ? <CloudUpload size={10} className="text-amber-400 animate-savePulse" /> : <CheckCircle2 size={10} className="text-green-400 opacity-60" />}
              </div>
            </div>
            <p className="text-sm font-bold truncate text-indigo-50" title={username}>{username}</p>
          </div>
        </div>
        
        <div className="mt-2 px-1 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
            {isSaving ? 'מעדכן אוטומטית...' : 'הנתונים מסונכרנים'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
        >
          <Calendar size={20} />
          <span className="font-medium">האירועים שלי</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'admin' ? 'bg-amber-600 shadow-inner' : 'hover:bg-amber-800 text-amber-100'}`}
          >
            <ShieldCheck size={20} />
            <span className="font-medium">לוח מנהל</span>
          </button>
        )}

        {hasActiveEvent && (
          <div className="pt-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">ניהול האירוע</p>
            <button
              onClick={() => setActiveTab('guests')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
            >
              <Users size={20} />
              <span className="font-medium">רשימת מוזמנים</span>
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'tables' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
            >
              <LayoutGrid size={20} />
              <span className="font-medium">סידור שולחנות</span>
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'layout' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
            >
              <MapIcon size={20} />
              <span className="font-medium">סקיצת אולם</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-pink-600 shadow-inner' : 'hover:bg-indigo-800 text-pink-100'}`}
            >
              <Settings size={20} />
              <span className="font-medium">הגדרות אירוע</span>
            </button>
            
            <button
              onClick={onExitEvent}
              className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-lg hover:bg-white/10 text-indigo-200 transition-all border border-dashed border-indigo-700"
            >
              <RefreshCw size={18} />
              <span className="font-medium text-sm">החלף אירוע</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-indigo-800 space-y-2 bg-indigo-950/30">
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-all shadow-lg animate-bounce">
            <DownloadCloud size={20} /><span className="font-bold text-sm">התקן אפליקציה</span>
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-300 transition-all">
          <LogOut size={20} /><span className="font-medium">התנתקות</span>
        </button>
        <div className="pt-2 px-2 border-t border-white/5 mt-2">
          <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold">
            <span className="flex items-center gap-1"><Info size={10} /> גרסה {APP_VERSION}</span>
            <span>{LAST_UPDATED}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
