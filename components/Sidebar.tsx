
import React, { useState, useEffect } from 'react';
import { Users, LayoutGrid, Calendar, LogOut, Heart, Map as MapIcon, RefreshCw, ShieldCheck, Cloud, CloudUpload, DownloadCloud, Info, Settings, CheckCircle2, AlertTriangle, FileJson, Server } from 'lucide-react';

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
  cloudStatus?: 'offline' | 'connecting' | 'online';
}

const APP_VERSION = 'v1.8.0';
const USERS_DB_KEY = 'users_db_v3';

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, hasActiveEvent, currentEventName, onExitEvent, onLogout, username, isAdmin, isSaving, cloudStatus }) => {
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

  const quickExport = () => {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `יושבים_בכיף_גיבוי_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">משתמש</p>
                {isAdmin && (
                  <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 rounded-sm flex items-center gap-0.5">
                    <ShieldCheck size={8} /> מנהל
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm font-bold truncate text-indigo-50" title={username}>{username}</p>
          </div>
        </div>
        
        <div className="mt-4 px-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cloudStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-1">
              {cloudStatus === 'online' ? <><Cloud size={10}/> שרת מסונכרן</> : <><CloudUpload size={10}/> עבודה מקומית</>}
            </span>
          </div>
          {cloudStatus !== 'online' && (
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <p className="text-[9px] font-bold text-amber-300 leading-tight">
                המידע נשמר בדפדפן זה בלבד. חבר שרת כדי לסנכרן מכשירים.
              </p>
            </div>
          )}
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
              <span className="font-medium">הגדרות ושרת</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-indigo-800 space-y-2 bg-indigo-950/30">
        <button onClick={quickExport} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 text-indigo-200 transition-all text-xs font-bold border border-white/10">
          <FileJson size={16} /> ייצוא גיבוי
        </button>
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-all shadow-lg animate-bounce">
            <DownloadCloud size={20} /><span className="font-bold text-sm">התקן אפליקציה</span>
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-300 transition-all">
          <LogOut size={20} /><span className="font-medium">התנתקות</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
