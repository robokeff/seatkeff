
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
  cloudStatus?: 'offline' | 'connecting' | 'online' | 'api';
}

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

  const getStatusText = () => {
    if (cloudStatus === 'online') return 'מחובר ל-Firebase';
    if (cloudStatus === 'api') return 'מחובר ל-Neon/API';
    if (cloudStatus === 'connecting') return 'מתחבר...';
    return 'עבודה מקומית';
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
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">משתמש</p>
              {isAdmin && <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 rounded-sm">מנהל</span>}
            </div>
            <p className="text-sm font-bold truncate text-indigo-50" title={username}>{username}</p>
          </div>
        </div>
        
        <div className="mt-4 px-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cloudStatus !== 'offline' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-1">
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}>
          <Calendar size={20} /> <span className="font-medium">האירועים שלי</span>
        </button>

        {hasActiveEvent && (
          <div className="pt-4 space-y-1">
            <p className="px-4 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">ניהול האירוע</p>
            <button onClick={() => setActiveTab('guests')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'guests' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}><Users size={20} /> <span className="font-medium">מוזמנים</span></button>
            <button onClick={() => setActiveTab('tables')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'tables' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}><LayoutGrid size={20} /> <span className="font-medium">שולחנות</span></button>
            <button onClick={() => setActiveTab('layout')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'layout' ? 'bg-indigo-700' : 'hover:bg-indigo-800'}`}><MapIcon size={20} /> <span className="font-medium">סקיצה</span></button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-pink-600' : 'hover:bg-indigo-800'}`}><Settings size={20} /> <span className="font-medium">הגדרות ושרת</span></button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-indigo-800 space-y-2">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-300 transition-all">
          <LogOut size={20} /><span className="font-medium">התנתקות</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
