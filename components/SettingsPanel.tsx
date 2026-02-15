
import React, { useState } from 'react';
import { EventData } from '../types';
import { 
  Settings, Tag, MessageCircle, Info, Plus, X, Save, Trash2, 
  Calendar, MapPin, Navigation, Heart, Star, PartyPopper, 
  Music, Cake, Link, Copy, Check, Share2
} from 'lucide-react';

interface SettingsPanelProps {
  event: EventData;
  onUpdateEvent: (event: EventData) => void;
}

const EVENT_TOPICS = [
  { id: 'חתונה', label: 'חתונה', icon: Heart, color: 'text-pink-500' },
  { id: 'ברית', label: 'ברית', icon: Star, color: 'text-blue-500' },
  { id: 'בר מצווה', label: 'בר מצווה', icon: PartyPopper, color: 'text-indigo-500' },
  { id: 'בת מצווה', label: 'בת מצווה', icon: Music, color: 'text-purple-500' },
  { id: 'אירוע כללי', label: 'אירוע כללי', icon: Cake, color: 'text-amber-500' }
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ event, onUpdateEvent }) => {
  const [newCategory, setNewCategory] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<Partial<EventData>>({
    name: event.name,
    date: event.date,
    venue: event.venue,
    eventTopic: event.eventTopic || 'חתונה',
    address: event.address,
    seatingTemplate: event.seatingTemplate || "היי [GUEST_NAME], מחכים לראותכם ב-[EVENT_NAME]! שולחן מספר [TABLE_NUMBER], כמות מקומות: [SEATS]. נתראה ב-[EVENT_VENUE]!"
  });
  
  const getRSVPLink = () => {
    if (event.customRsvpUrl) return event.customRsvpUrl;
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('rsvp', event.id);
    params.set('n', event.name);
    params.set('v', event.venue);
    if (event.categories && event.categories.length > 0) {
      params.set('cats', event.categories.join(','));
    }
    return `${baseUrl}?${params.toString()}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getRSVPLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const link = getRSVPLink();
    const wazeUrl = event.address ? `\n\n📍 הוראות הגעה ב-Waze:\nhttps://waze.com/ul?q=${encodeURIComponent(event.address)}` : '';
    const message = `היי! נשמח מאוד שתאשרו הגעה ל${event.name} דרך הקישור הבא: ${link}${wazeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !event.categories.includes(newCategory.trim())) {
      onUpdateEvent({ ...event, categories: [...event.categories, newCategory.trim()] });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    onUpdateEvent({ ...event, categories: event.categories.filter(c => c !== cat) });
  };

  const handleSaveGeneral = () => {
    onUpdateEvent({ ...event, ...formData });
    alert('הגדרות האירוע נשמרו בהצלחה!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-['Assistant'] animate-fadeIn text-right">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <Settings className="text-indigo-600" size={32} /> הגדרות וניהול
          </h2>
          <p className="text-gray-500 font-medium">התאמה אישית של פרטי האירוע ותבניות ההודעה</p>
        </div>
        <button onClick={handleSaveGeneral} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-all">
          <Save size={20} /> שמור את כל השינויים
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* RSVP Management Card */}
          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Link size={24} className="text-pink-400" />
                </div>
                <h3 className="text-xl font-black">ניהול קישור הרשמה (RSVP)</h3>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-6">
                <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3">קישור ההרשמה שלך:</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 px-4 py-3 rounded-xl font-mono text-xs truncate dir-ltr text-left border border-white/5">
                    {getRSVPLink()}
                  </div>
                  <button 
                    onClick={copyLink}
                    className={`shrink-0 p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-indigo-950 hover:bg-indigo-50'}`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
                >
                  <Share2 size={20} />
                  שיתוף בוואטסאפ (כולל Waze)
                </button>
              </div>
            </div>
          </div>

          {/* General Info */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2"><MapPin size={24} className="text-indigo-500" /> פרטי אירוע וניווט</h3>
            
            <div className="mb-8">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 mr-1">נושא האירוע</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_TOPICS.map((topic) => {
                  const Icon = topic.icon;
                  const isSelected = formData.eventTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setFormData({...formData, eventTopic: topic.id})}
                      className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-indigo-100'}`}
                    >
                      <Icon size={16} className={isSelected ? topic.color : 'text-gray-300'} />
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">שם האירוע</label>
                <input type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">תאריך</label>
                <input type="date" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">שם האולם</label>
                <input type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">כתובת ל-Waze</label>
                <div className="relative">
                  <input type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold pr-12" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="למשל: רחוב העצמאות 1, תל אביב" />
                  <Navigation className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Template */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2"><MessageCircle size={24} className="text-green-500" /> הודעת וואטסאפ למוזמנים</h3>
            <div className="bg-amber-50 p-4 rounded-2xl mb-6 border border-amber-100">
               <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                 תגיות דינמיות: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">[GUEST_NAME]</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">[TABLE_NUMBER]</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">[SEATS]</code>
               </p>
            </div>
            <textarea 
              className="w-full h-48 p-6 bg-gray-50 rounded-3xl outline-none font-medium text-sm border-2 border-transparent focus:border-green-500 transition-all resize-none mb-4 leading-relaxed" 
              value={formData.seatingTemplate} 
              onChange={e => setFormData({...formData, seatingTemplate: e.target.value})}
              placeholder="כתוב כאן את נוסח ההודעה..."
            />
          </div>
        </div>

        {/* Categories Sidebar */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2"><Tag size={24} className="text-pink-500" /> קטגוריות</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="חדשה..." className="flex-1 bg-gray-50 px-4 py-3 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-indigo-500 transition-all" />
            <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-4 rounded-2xl font-black"><Plus size={18} /></button>
          </div>
          <div className="flex flex-col gap-2">
            {event.categories.map(cat => (
              <div key={cat} className="flex justify-between items-center px-4 py-3 bg-indigo-50/50 text-indigo-700 rounded-2xl font-black text-xs border border-indigo-100 group">
                {cat}
                <button onClick={() => handleRemoveCategory(cat)} className="text-indigo-300 hover:text-red-500 transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
