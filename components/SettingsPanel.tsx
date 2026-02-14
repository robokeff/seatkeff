
import React, { useState, useEffect, useRef } from 'react';
import { EventData, FirebaseConfig, CustomApiConfig } from '../types';
import { Settings, Plus, Trash2, MessageCircle, Info, Tag, Save, RotateCcw, Download, Upload, ShieldCheck, AlertTriangle, Server, Database, Key, Globe, ExternalLink, Cloud, RefreshCw, Users, HelpCircle, Code } from 'lucide-react';

interface SettingsPanelProps {
  event: EventData;
  onUpdateEvent: (event: EventData) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ event, onUpdateEvent }) => {
  const [newCategory, setNewCategory] = useState('');
  const [template, setTemplate] = useState(event.whatsappTemplate || '');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'firebase' | 'api'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase State
  const [fbApiKey, setFbApiKey] = useState('');
  const [fbProjectId, setFbProjectId] = useState('');
  const [fbAppId, setFbAppId] = useState('');

  // API State (Neon/Custom)
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiToken, setApiToken] = useState('');

  const USERS_DB_KEY = 'users_db_v3';
  const LAST_USER_KEY = 'last_logged_user_v3';

  useEffect(() => {
    const username = localStorage.getItem(LAST_USER_KEY);
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (username && usersRaw) {
      const users = JSON.parse(usersRaw);
      const user = users[username];
      if (user?.cloudConfig) {
        setFbApiKey(user.cloudConfig.apiKey);
        setFbProjectId(user.cloudConfig.projectId);
        setFbAppId(user.cloudConfig.appId);
      }
      if (user?.apiConfig) {
        setApiBaseUrl(user.apiConfig.baseUrl);
        setApiToken(user.apiConfig.apiKey || '');
      }
    }
  }, []);

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    const username = localStorage.getItem(LAST_USER_KEY);
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (username && usersRaw) {
      const users = JSON.parse(usersRaw);
      users[username].cloudConfig = { apiKey: fbApiKey, projectId: fbProjectId, appId: fbAppId, authDomain: `${fbProjectId}.firebaseapp.com`, storageBucket: `${fbProjectId}.appspot.com`, messagingSenderId: '' };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      alert('הגדרות Firebase נשמרו. האפליקציה תתרענן.');
      window.location.reload();
    }
  };

  const handleSaveApi = (e: React.FormEvent) => {
    e.preventDefault();
    const username = localStorage.getItem(LAST_USER_KEY);
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (username && usersRaw) {
      const users = JSON.parse(usersRaw);
      users[username].apiConfig = { baseUrl: apiBaseUrl.trim(), apiKey: apiToken.trim() };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      alert('הגדרות שרת ה-API נשמרו. האפליקציה תתרענן.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-['Assistant'] animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <Settings className="text-pink-500" size={32} /> הגדרות
          </h2>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button onClick={() => setActiveSubTab('general')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>כללי</button>
          <button onClick={() => setActiveSubTab('firebase')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'firebase' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Firebase</button>
          <button onClick={() => setActiveSubTab('api')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'api' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>שרת API (Neon)</button>
        </div>
      </header>

      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag size={20} /> קטגוריות</h3>
            <div className="space-y-2">
              {event.categories.map(cat => <div key={cat} className="p-3 bg-gray-50 rounded-xl font-bold">{cat}</div>)}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageCircle size={20} /> תבנית הודעה</h3>
             <textarea className="w-full h-40 p-4 bg-gray-50 rounded-xl outline-none" value={template} readOnly />
          </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-slideUp">
          <div className="bg-indigo-900 p-10 text-white">
            <h3 className="text-2xl font-black mb-2 flex items-center gap-3"><Server /> חיבור לשרת Neon / API</h3>
            <p className="text-indigo-100 opacity-80">הזן את כתובת ה-URL שסופקה לך על ידי ה-Neon extension או השרת שלך.</p>
          </div>
          <form onSubmit={handleSaveApi} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2">Sync URL (Endpoint)</label>
                <input type="url" required className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="https://api.myapp.com" />
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2">API Key / Token (Optional)</label>
                <input type="password" className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all">חבר ל-Neon / API</button>
            <div className="bg-amber-50 p-6 rounded-2xl flex gap-4 border border-amber-100">
               <Info className="text-amber-500 shrink-0" />
               <p className="text-xs font-medium text-amber-800 leading-relaxed">שימוש ב-Neon דורש בדרך כלל שרת API מתווך (כמו Netlify Functions). אם חיברת את ה-Extension ב-Netlify, בדוק את כתובת ה-Function שנוצרה לך.</p>
            </div>
          </form>
        </section>
      )}

      {activeSubTab === 'firebase' && (
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-slideUp">
          <div className="bg-indigo-900 p-10 text-white"><h3 className="text-2xl font-black mb-2">חיבור ל-Firebase</h3></div>
          <form onSubmit={handleSaveFirebase} className="p-10 space-y-6">
            <input type="text" required className="w-full p-4 rounded-xl bg-gray-50 outline-none font-bold" value={fbApiKey} onChange={(e) => setFbApiKey(e.target.value)} placeholder="API Key" />
            <input type="text" required className="w-full p-4 rounded-xl bg-gray-50 outline-none font-bold" value={fbProjectId} onChange={(e) => setFbProjectId(e.target.value)} placeholder="Project ID" />
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg">שמור הגדרות Firebase</button>
          </form>
        </section>
      )}
    </div>
  );
};

export default SettingsPanel;
