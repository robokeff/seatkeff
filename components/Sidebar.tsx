
import React from 'react';
import { Users, LayoutGrid, Calendar, LogOut, Heart, Map as MapIcon, ShieldCheck, Settings, Clock, MessageCircle } from 'lucide-react';

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
  lastUpdated?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, hasActiveEvent, onLogout, username, isAdmin, lastUpdated }) => {
  const WHATSAPP_NUMBER = '972549985605';
  
  return (
    <aside className="w-64 bg-indigo-950 text-white flex flex-col hidden md:flex sticky top-0 h-screen shadow-2xl z-30 border-l border-white/5">
      <div className="p-6 border-b border-indigo-900">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-pink-400 fill-pink-400" size={24} />
          <h1 className="text-xl font-black tracking-tight text-white">יושבים בכיף</h1>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black shrink-0 shadow-inner uppercase">
            {username.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">משתמש</p>
              {isAdmin && <span className="bg-amber-400 text-amber-950 text-[8px] font-black px-1.5 rounded-sm uppercase">ADMIN</span>}
            </div>
            <p className="text-sm font-bold truncate text-indigo-50" title={username}>{username}</p>
          </div>
        </div>
        
        <div className="mt-4 px-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">
              עבודה מקומית בטוחה
            </span>
          </div>
          {lastUpdated && (
             <div className="flex items-center gap-1.5 text-[9px] text-indigo-400 font-bold">
                <Clock size={10} />
                שמירה אחרונה: {new Date(lastUpdated).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
             </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Calendar} label="האירועים שלי" />
        
        {isAdmin && <NavItem active={activeTab === 'admin'} onClick={() => setActiveTab('admin'} icon={ShieldCheck} label="ניהול מערכת" />}

        {hasActiveEvent && (
          <div className="pt-4 space-y-1">
            <p className="px-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 opacity-50">ניהול האירוע</p>
            <NavItem active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} icon={Users} label="מוזמנים" />
            <NavItem active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} icon={LayoutGrid} label="שולחנות" />
            <NavItem active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} icon={MapIcon} label="סקיצת אולם" />
            <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="הגדרות" />
          </div>
        )}
      </nav>

      <div className="p-5 border-t border-indigo-900 space-y-4">
        <button 
          onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl transition-all border border-green-500/20 text-xs font-black"
        >
          <MessageCircle size={16} />
          תמיכת רובוכיף
        </button>
        <div className="px-1 text-center">
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">רובוכיף בע"מ - 0549985605</p>
          <p className="text-[8px] text-indigo-200/20 font-bold uppercase">כל הזכויות שמורות &copy; {new Date().getFullYear()}</p>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-300 transition-all text-xs font-bold">
          <LogOut size={18} />
          התנתקות
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-800 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/5'}`}>
    <Icon size={18} className={active ? 'text-pink-400' : 'text-indigo-400'} />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default Sidebar;
