
import React, { useState, useRef } from 'react';
import { EventData } from '../types';
import { Plus, Calendar, MapPin, Trash2, ArrowLeft, Edit2, ShieldCheck, Navigation, ImageIcon, Upload, X } from 'lucide-react';

interface EventDashboardProps {
  events: EventData[];
  onCreateEvent: (name: string, date: string, venue: string, address: string, imageUrl?: string) => void;
  onUpdateEventMetadata: (id: string, name: string, date: string, venue: string, address: string, imageUrl?: string) => void;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ 
  events, 
  onCreateEvent, 
  onUpdateEventMetadata,
  onSelectEvent, 
  onDeleteEvent 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCreate = () => {
    setEditingEventId(null); setFormName(''); setFormDate(''); setFormVenue(''); setFormAddress(''); setFormImageUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (event: EventData) => {
    setEditingEventId(event.id); setFormName(event.name); setFormDate(event.date); setFormVenue(event.venue); setFormAddress(event.address || ''); setFormImageUrl(event.imageUrl || '');
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert('התמונה גדולה מדי (מקסימום 2MB)'); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSelect = (id: string) => {
    // Immediate state change to manage the event
    onSelectEvent(id);
    
    // Silent URL sync for RSVP context (optional, non-blocking)
    try {
      const newUrl = `${window.location.origin}${window.location.pathname}?eid=${id}`;
      window.history.replaceState({}, document.title, newUrl);
    } catch(e) { console.debug('URL sync skipped'); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formDate && formVenue) {
      if (editingEventId) onUpdateEventMetadata(editingEventId, formName, formDate, formVenue, formAddress, formImageUrl);
      else onCreateEvent(formName, formDate, formVenue, formAddress, formImageUrl);
      setShowModal(false);
    }
  };

  const getHebrewDateInfo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { dayOfWeek: '', hebrewDate: '', gregDate: '' };
      const dayOfWeek = new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(date);
      const hebrewDate = new Intl.DateTimeFormat('he-IL-u-ca-hebrew-nu-hebr', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
      const gregDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
      return { dayOfWeek, hebrewDate, gregDate };
    } catch (e) { return { dayOfWeek: '', hebrewDate: '', gregDate: '' }; }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <header className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-indigo-950">האירועים שלי</h1>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck size={10} /> גרסה יציבה</span>
          </div>
          <p className="text-gray-500">נהל את כל האירועים והחגיגות שלך במקום אחד</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"><Plus size={20} /> צור אירוע חדש</button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slideUp overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-indigo-900">{editingEventId ? 'עריכת פרטי אירוע' : 'הגדרת אירוע חדש'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 text-right">
              <div><label className="block text-sm font-bold text-gray-700 mb-2">שם האירוע</label>
                <input autoFocus type="text" required placeholder="למשל: החתונה של עומר ונועה" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-2">תאריך</label><input type="date" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-2">שם האולם</label><input type="text" required placeholder="אולם אירועים, גן..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formVenue} onChange={(e) => setFormVenue(e.target.value)} /></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Navigation size={14} className="text-indigo-500" /> כתובת האירוע (לניווט בוויז)</label>
                <input type="text" placeholder="למשל: רחוב הירקון 1, תל אביב" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                <label className="block text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2"><ImageIcon size={16} className="text-pink-500" /> תמונת מיתוג לאירוע</label>
                {formImageUrl ? <div className="relative group rounded-xl overflow-hidden border-2 border-indigo-100 bg-white"><img src={formImageUrl} alt="Preview" className="w-full h-32 object-cover" /><button type="button" onClick={() => setFormImageUrl('')} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button></div> : <div className="flex flex-col gap-3"><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-6 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-indigo-400 transition-all text-indigo-400"><Upload size={24} /><span className="text-xs font-bold">העלה תמונה מהמכשיר</span></button></div>}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <div className="flex gap-4 pt-4"><button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-md transition-all active:scale-95">{editingEventId ? 'עדכן אירוע' : 'צור אירוע'}</button><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold transition-all">ביטול</button></div>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"><Calendar size={64} className="mx-auto text-gray-300 mb-4" /><h3 className="text-xl font-bold text-gray-800">אין אירועים פעילים</h3></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const totalPeople = event.guests.reduce((sum, g) => sum + (g.adults || 0) + (g.children || 0), 0);
            const { dayOfWeek, hebrewDate, gregDate } = getHebrewDateInfo(event.date);
            return (
              <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group relative flex flex-col">
                {event.imageUrl ? <div className="h-32 w-full relative"><img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div><div className="absolute bottom-3 right-4"><h3 className="text-white font-black text-lg drop-shadow-md">{event.name}</h3></div></div> : <div className="p-6 pb-2"><h3 className="text-xl font-bold text-indigo-950 truncate">{event.name}</h3></div>}
                <div className="p-6 flex flex-col gap-1 flex-1">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-bold"><Calendar size={14} className="text-indigo-400" /><span>{gregDate} ({dayOfWeek})</span></div>
                  <div className="text-[11px] text-pink-500 font-black mr-6 mb-1">{hebrewDate}</div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs"><MapPin size={14} className="text-gray-300" /><span className="truncate">{event.venue}</span></div>
                </div>
                <div className="px-6 pb-6 pt-2 flex justify-between items-center mt-auto border-t border-gray-50">
                  <div className="text-center"><p className="text-[10px] text-gray-400 font-bold leading-none">אורחים</p><p className="text-base font-black text-indigo-700">{totalPeople}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(event)} className="text-gray-400 hover:text-indigo-600 p-2 rounded-xl bg-gray-50 hover:bg-indigo-50" title="ערוך פרטים"><Edit2 size={16} /></button>
                    <button onClick={() => handleSelect(event.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md">נהל אירוע<ArrowLeft size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventDashboard;
