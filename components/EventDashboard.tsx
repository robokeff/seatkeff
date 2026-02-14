
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
    <div className="max-w-6xl mx-auto animate-fadeIn px-2 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-indigo-950">האירועים שלי</h1>
            <span className="hidden sm:flex bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full items-center gap-1"><ShieldCheck size={10} /> בטוח ומסונכרן</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">כאן מתחיל הסדר באירוע המושלם שלך</p>
        </div>
        <button onClick={handleOpenCreate} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
          <Plus size={22} /> צור אירוע חדש
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 md:p-10 animate-slideUp overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-indigo-900">{editingEventId ? 'עריכת אירוע' : 'אירוע חדש'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">שם האירוע</label>
                <input autoFocus type="text" required placeholder="החתונה של..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">תאריך</label><input type="date" required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
                <div><label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">שם האולם</label><input type="text" required placeholder="איפה חוגגים?" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formVenue} onChange={(e) => setFormVenue(e.target.value)} /></div>
              </div>
              <div><label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">כתובת לניווט</label>
                <input type="text" placeholder="רחוב, עיר..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              </div>
              <div className="bg-indigo-50/50 p-6 rounded-3xl border-2 border-dashed border-indigo-100">
                <label className="block text-sm font-black text-indigo-900 mb-4">תמונת מיתוג (אופציונלי)</label>
                {formImageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormImageUrl('')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Trash2 size={24} /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center gap-2 hover:bg-white transition-all text-indigo-400">
                    <ImageIcon size={32} />
                    <span className="text-xs font-black uppercase">העלה תמונה מהגלריה</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95">שמור והמשך</button>
            </form>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={40} /></div>
          <h3 className="text-xl font-black text-indigo-950">אין אירועים קרובים</h3>
          <p className="text-gray-400 font-bold mt-2">לחץ על הכפתור למעלה כדי ליצור את האירוע הראשון שלך</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {events.map((event) => {
            const totalPeople = event.guests.reduce((sum, g) => sum + (g.adults || 0) + (g.children || 0), 0);
            const { dayOfWeek, hebrewDate, gregDate } = getHebrewDateInfo(event.date);
            return (
              <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 group flex flex-col h-full transform hover:-translate-y-2">
                <div className="h-44 md:h-48 w-full relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white/20"><Calendar size={80} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/20 to-transparent"></div>
                  <div className="absolute bottom-5 right-6 left-6">
                    <h3 className="text-white font-black text-xl md:text-2xl drop-shadow-lg truncate">{event.name}</h3>
                    <div className="flex items-center gap-2 text-indigo-100/80 text-[10px] font-black uppercase mt-1">
                      <MapPin size={10} /> {event.venue}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">תאריך</p>
                      <p className="text-xs font-black text-indigo-950">{gregDate}</p>
                      <p className="text-[9px] font-bold text-indigo-400">{dayOfWeek}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">מוזמנים</p>
                      <p className="text-lg font-black text-indigo-600 leading-none">{totalPeople}</p>
                      <p className="text-[9px] font-bold text-gray-400">נפשות</p>
                    </div>
                  </div>
                  <div className="mt-auto flex gap-3 pt-4">
                    <button onClick={() => setEditingEventId(event.id) || handleOpenEdit(event)} className="p-3.5 rounded-2xl bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => onSelectEvent(event.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95">ניהול אירוע <ArrowLeft size={16} /></button>
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
