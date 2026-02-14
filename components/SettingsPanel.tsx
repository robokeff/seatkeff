
import React, { useState, useEffect, useRef } from 'react';
import { EventData, FirebaseConfig, UserAccount } from '../types';
import { Settings, Plus, Trash2, MessageCircle, Info, Tag, Save, RotateCcw, Download, Upload, ShieldCheck, AlertTriangle, Server, Database, Key, Globe, ExternalLink, Cloud, RefreshCw, Users } from 'lucide-react';

interface SettingsPanelProps {
  event: EventData;
  onUpdateEvent: (event: EventData) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ event, onUpdateEvent }) => {
  const [newCategory, setNewCategory] = useState('');
  const [template, setTemplate] = useState(event.whatsappTemplate || '');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'cloud'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Config Form State
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [appId, setAppId] = useState('');

  const USERS_DB_KEY = 'users_db_v3';
  const LAST_USER_KEY = 'last_logged_user_v3';

  useEffect(() => {
    if (event.whatsappTemplate) {
      setTemplate(event.whatsappTemplate);
    }
  }, [event.whatsappTemplate, event.id]);

  // Load existing cloud config if any
  useEffect(() => {
    const username = localStorage.getItem(LAST_USER_KEY);
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (username && usersRaw) {
      const users = JSON.parse(usersRaw);
      const config = users[username]?.cloudConfig;
      if (config) {
        setApiKey(config.apiKey || '');
        setProjectId(config.projectId || '');
        setAuthDomain(config.authDomain || '');
        setAppId(config.appId || '');
      }
    }
  }, []);

  const handleSaveCloudConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const username = localStorage.getItem(LAST_USER_KEY);
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    
    if (username && usersRaw) {
      const users = JSON.parse(usersRaw);
      const config: FirebaseConfig = {
        apiKey,
        projectId,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: '',
        appId
      };
      
      users[username].cloudConfig = config;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      
      alert('הגדרות השרת נשמרו בהצלחה! האפליקציה תתרענן כעת כדי להתחבר לענן.');
      window.location.reload();
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = newCategory.trim();
    if (cleanCat && !event.categories.includes(cleanCat)) {
      onUpdateEvent({ ...event, categories: [...event.categories, cleanCat] });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (event.categories.length <= 1) {
      alert('חייבת להישאר לפחות קטגוריה אחת במערכת.');
      return;
    }
    if (confirm(`למחוק את "${cat}"? אורחים שמשויכים אליה יצטרכו שיוך מחדש.`)) {
      onUpdateEvent({ ...event, categories: event.categories.filter(c => c !== cat) });
    }
  };

  const handleSaveTemplate = () => {
    onUpdateEvent({ ...event, whatsappTemplate: template });
    alert('תבנית ההודעה נשמרה!');
  };

  const exportFullBackup = () => {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_יושבים_בכיף_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('זהירות! ייבוא קובץ זה ימחק את כל המידע הנוכחי ויחליף אותו במידע מהקובץ. האם להמשיך?')) {
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(json));
          alert('המידע שוחזר בהצלחה! המערכת תתרענן כעת.');
          window.location.reload();
        }
      } catch (err) {
        alert('קובץ לא תקין.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-['Assistant'] animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <Settings className="text-pink-500" size={32} />
            הגדרות מתקדמות
          </h2>
          <p className="text-gray-500 font-medium">ניהול קטגוריות, הודעות וחיבור לענן</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => setActiveSubTab('general')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeSubTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
          >
            הגדרות כלליות
          </button>
          <button 
            onClick={() => setActiveSubTab('cloud')}
            className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeSubTab === 'cloud' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}
          >
            <Server size={14} /> חיבור לענן
          </button>
        </div>
      </header>

      {activeSubTab === 'general' ? (
        <>
          <section className="bg-amber-50 rounded-[2.5rem] p-8 border-2 border-amber-200 shadow-xl shadow-amber-100/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex gap-4 items-start">
                <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-900">גיבוי נתונים מקומי</h3>
                  <p className="text-amber-700 text-sm font-bold leading-relaxed max-w-md">
                    המידע נשמר על המכשיר שלך בלבד. מומלץ לייצא גיבוי בסיום העבודה כדי להבטיח שהמידע לא יאבד.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={exportFullBackup}
                  className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <Download size={20} /> הורד גיבוי
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 md:flex-none bg-white text-amber-600 border-2 border-amber-300 font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-50 transition-all active:scale-95"
                >
                  <Upload size={20} /> שחזר מגיבוי
                </button>
                <input type="file" ref={fileInputRef} onChange={importFullBackup} className="hidden" accept=".json" />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <Tag size={20} className="text-indigo-500" /> ניהול קטגוריות
              </h3>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input
                  type="text" placeholder="קטגוריה חדשה..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg transition-all active:scale-90"><Plus size={24} /></button>
              </form>
              <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                {event.categories.map((cat, idx) => (
                  <div key={`${cat}-${idx}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white hover:border-indigo-100 border border-transparent transition-all group">
                    <span className="font-bold text-gray-700">{cat}</span>
                    <button onClick={() => handleRemoveCategory(cat)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                <MessageCircle size={20} className="text-green-500" /> תבנית הודעה לאורח
              </h3>
              <div className="flex-1 space-y-4">
                <textarea
                  className="w-full h-60 p-5 rounded-2xl bg-gray-50 border-none font-medium text-sm leading-relaxed outline-none focus:ring-2 focus:ring-green-500 custom-scrollbar"
                  dir="rtl" value={template} onChange={(e) => setTemplate(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={handleSaveTemplate} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save size={20} /> שמור תבנית
                  </button>
                  <button onClick={() => { if(confirm('לשחזר ברירת מחדל?')) setTemplate(event.whatsappTemplate || ''); }} className="p-4 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors"><RotateCcw size={20} /></button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-slideUp">
          <div className="bg-indigo-900 p-10 text-white relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-800 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-3xl font-black mb-4 flex items-center gap-3"><Globe className="text-indigo-300" /> הפוך את האפליקציה לאתר חי</h3>
              <p className="text-indigo-100 font-medium leading-relaxed opacity-90">
                כדי לסנכרן את המידע בין מכשירים שונים, עליך להזין את פרטי ה-Firebase שלך כאן. 
              </p>
              <a 
                href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 bg-white text-indigo-900 px-6 py-3 rounded-xl font-black shadow-lg hover:bg-indigo-50 transition-all"
              >
                צור פרויקט ב-Firebase <ExternalLink size={16} />
              </a>
            </div>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleSaveCloudConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 mr-1">Firebase API Key</label>
                  <div className="relative">
                    <input 
                      type="text" required value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                      placeholder="AIzaSyA..." 
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 mr-1">Project ID</label>
                  <div className="relative">
                    <input 
                      type="text" required value={projectId} onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                      placeholder="my-project-123" 
                    />
                    <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 mr-1">App ID</label>
                  <div className="relative">
                    <input 
                      type="text" required value={appId} onChange={(e) => setAppId(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold" 
                      placeholder="1:123456789:web:abcdef..." 
                    />
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  </div>
                </div>
                <div className="pt-8">
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    <Cloud size={24} /> שמור והפעל סנכרון ענן
                  </button>
                </div>
              </div>
            </form>
            
            <div className="mt-12 bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
               <div className="flex gap-4">
                  <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm shrink-0">
                    <Info size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-indigo-950 mb-2">איך מוצאים את הפרטים?</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                      בתוך ה-Firebase Console, כנס לגלגל השיניים (Project Settings). תחת הכרטיסייה General, גלול למטה ל-Your apps. אם אין אפליקציה, צור אחת מסוג Web. שם תראה את ה-Config עם כל הפרטים הדרושים.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SettingsPanel;
