
import React, { useState, useEffect, useRef } from 'react';
import { EventData } from '../types';
import { Settings, Plus, Trash2, MessageCircle, Info, Tag, Edit3, Save, RotateCcw, Download, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';

interface SettingsPanelProps {
  event: EventData;
  onUpdateEvent: (event: EventData) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ event, onUpdateEvent }) => {
  const [newCategory, setNewCategory] = useState('');
  const [template, setTemplate] = useState(event.whatsappTemplate || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const USERS_DB_KEY = 'users_db_v2';

  useEffect(() => {
    if (event.whatsappTemplate) {
      setTemplate(event.whatsappTemplate);
    }
  }, [event.whatsappTemplate, event.id]);

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

  // FULL DATABASE BACKUP
  const exportFullBackup = () => {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_seat_pro_${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 font-['Assistant'] animate-fadeIn">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
          <Settings className="text-pink-500" size={32} />
          הגדרות אירוע מתקדמות
        </h2>
        <p className="text-gray-500 font-medium">ניהול קטגוריות, הודעות ומנגנון גיבוי נתונים</p>
      </header>

      {/* Critical Backup Section */}
      <section className="bg-amber-50 rounded-[2.5rem] p-8 border-2 border-amber-200 shadow-xl shadow-amber-100/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 items-start">
            <div className="p-4 bg-amber-500 text-white rounded-3xl shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-900">אבטחת המידע שלך</h3>
              <p className="text-amber-700 text-sm font-bold leading-relaxed max-w-md">
                המידע נשמר על המכשיר שלך בלבד. כדי למנוע אובדן נתונים בגלל עדכוני מערכת או ניקוי דפדפן, מומלץ להוריד גיבוי בסיום העבודה.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={exportFullBackup}
              className="flex-1 md:flex-none bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Download size={20} /> הורד גיבוי (JSON)
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
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <Tag size={20} className="text-indigo-500" /> ניהול קטגוריות
          </h3>
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input
              type="text" placeholder="קטגוריה חדשה..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border-none font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-lg"><Plus size={24} /></button>
          </form>
          <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {event.categories.map((cat, idx) => (
              <div key={`${cat}-${idx}`} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white hover:border-indigo-100 border border-transparent transition-all">
                <span className="font-bold text-gray-700">{cat}</span>
                <button onClick={() => handleRemoveCategory(cat)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-green-500" /> תבנית הודעת שיבוץ
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
              <button onClick={() => { if(confirm('לשחזר ברירת מחדל?')) setTemplate('שלום {name}...'); }} className="p-4 bg-gray-100 text-gray-400 rounded-xl"><RotateCcw size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
