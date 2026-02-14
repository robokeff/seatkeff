
import React, { useState, useEffect } from 'react';
import { EventData } from '../types';
import { Settings, Tag, MessageCircle, Info, Server } from 'lucide-react';

interface SettingsPanelProps {
  event: EventData;
  onUpdateEvent: (event: EventData) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ event, onUpdateEvent }) => {
  const [template] = useState(event.whatsappTemplate || '');
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'api'>('general');

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
      if (user?.apiConfig) {
        setApiBaseUrl(user.apiConfig.baseUrl);
        setApiToken(user.apiConfig.apiKey || '');
      }
    }
  }, []);

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
          <button onClick={() => setActiveSubTab('api')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeSubTab === 'api' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>סנכרון שרת API</button>
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
            <h3 className="text-2xl font-black mb-2 flex items-center gap-3"><Server /> חיבור לשרת API חיצוני</h3>
            <p className="text-indigo-100 opacity-80">סנכרן את נתוני האירוע עם שרת מסד נתונים משלך.</p>
          </div>
          <form onSubmit={handleSaveApi} className="p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2">כתובת השרת (Endpoint URL)</label>
                <input type="url" required className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="https://api.myapp.com" />
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2">API Key / Token</label>
                <input type="password" className="w-full p-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all">שמור הגדרות סנכרון</button>
            <div className="bg-indigo-50 p-6 rounded-2xl flex gap-4 border border-indigo-100">
               <Info className="text-indigo-500 shrink-0" />
               <p className="text-xs font-medium text-indigo-800 leading-relaxed">השרת חייב לתמוך בשיטת POST בנתיב /save לקבלת הנתונים, ובשיטת GET בנתיב /data למשיכת הנתונים.</p>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default SettingsPanel;
