
import React, { useState, useRef } from 'react';
import { EventData, HallTemplate, Guest, Table, HallElement } from '../types';
import { 
  Plus, Calendar, MapPin, Trash2, ArrowLeft, Edit2, ShieldCheck, 
  ImageIcon, X, Layout, PlayCircle, Share2, MessageCircle, Copy, Check,
  Heart, Star, Music, PartyPopper, Cake
} from 'lucide-react';

interface EventDashboardProps {
  events: EventData[];
  availableTemplates: HallTemplate[];
  onCreateEvent: (name: string, date: string, venue: string, topic: string, address: string, imageUrl?: string, templateId?: string) => void;
  onUpdateEventMetadata: (id: string, name: string, date: string, venue: string, topic: string, address: string, imageUrl?: string) => void;
  onSelectEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onImportEvent: (event: EventData) => void;
}

const EVENT_TOPICS = [
  { id: 'חתונה', label: 'חתונה', icon: Heart, color: 'text-pink-500' },
  { id: 'ברית', label: 'ברית', icon: Star, color: 'text-blue-500' },
  { id: 'בר מצווה', label: 'בר מצווה', icon: PartyPopper, color: 'text-indigo-500' },
  { id: 'בת מצווה', label: 'בת מצווה', icon: Music, color: 'text-purple-500' },
  { id: 'אירוע כללי', label: 'אירוע כללי', icon: Cake, color: 'text-amber-500' }
];

const GUEST_COLORS = [
  '#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', 
  '#8b5cf6', '#f43f5e', '#14b8a6', '#f97316', '#06b6d4',
  '#ef4444', '#84cc16', '#a855f7', '#0891b2', '#be123c',
  '#15803d', '#b45309', '#4338ca', '#701a75', '#1e1b4b'
];

const EventDashboard: React.FC<EventDashboardProps> = ({ 
  events, 
  availableTemplates,
  onCreateEvent, 
  onUpdateEventMetadata,
  onSelectEvent, 
  onDeleteEvent,
  onImportEvent
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formVenue, setFormVenue] = useState('');
  const [formTopic, setFormTopic] = useState('חתונה');
  const [formAddress, setFormAddress] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTemplateId, setFormTemplateId] = useState('');
  
  const [sharingEvent, setSharingEvent] = useState<EventData | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateDemoEvent = () => {
    const eventId = crypto.randomUUID();
    const categories = ['משפחת החתן', 'משפחת הכלה', 'חברים קרובים', 'עבודה'];
    const tables: Table[] = [];
    const guests: Guest[] = [];
    
    const elements: HallElement[] = [
      { id: crypto.randomUUID(), type: 'stage', label: 'במת אירוע', position: { x: 350, y: 30 }, size: { width: 300, height: 100 }, rotation: 0, color: '#f1f5f9' },
      { id: crypto.randomUUID(), type: 'dance_floor', label: 'רחבת ריקודים', position: { x: 350, y: 150 }, size: { width: 300, height: 250 }, rotation: 0, color: '#e2e8f0' },
      { id: crypto.randomUUID(), type: 'bar', label: 'בר חוץ', position: { x: 40, y: 40 }, size: { width: 120, height: 200 }, rotation: 0, color: '#f8fafc' },
      { id: crypto.randomUUID(), type: 'entrance', label: 'כניסה ראשית', position: { x: 800, y: 880 }, size: { width: 150, height: 80 }, rotation: 0, color: '#f1f5f9' }
    ];

    const familyNames = ['כהן', 'לוי', 'ישראלי', 'מזרחי', 'פרץ', 'אברהם', 'ביטון', 'דהן', 'מלכה', 'אזולאי', 'חדד', 'גבאי', 'פרידמן', 'וייס', 'סוויסה'];
    
    for (let i = 1; i <= 8; i++) {
      const tableId = crypto.randomUUID();
      const row = Math.floor((i - 1) / 3);
      const col = (i - 1) % 3;
      tables.push({
        id: tableId,
        number: i,
        name: i === 1 ? 'שולחן כבוד' : (i === 2 ? 'משפחה קרובה' : undefined),
        capacity: 10,
        type: 'round',
        position: { x: 100 + col * 320, y: 450 + row * 180 },
        rotation: 0,
        color: '#ffffff'
      });

      let seatsOccupied = 0;
      let colorIdx = (i * 7) % GUEST_COLORS.length;

      while (seatsOccupied < 10) {
        const remaining = 10 - seatsOccupied;
        let adults = 0;
        let children = 0;
        let unitName = '';

        if (remaining >= 4 && Math.random() > 0.4) {
          adults = 2;
          children = Math.min(remaining - 2, Math.floor(Math.random() * 3) + 1);
          unitName = `משפחת ${familyNames[Math.floor(Math.random() * familyNames.length)]}`;
        } else if (remaining >= 2 && Math.random() > 0.3) {
          adults = 2;
          children = 0;
          unitName = `זוג ${familyNames[Math.floor(Math.random() * familyNames.length)]}`;
        } else {
          adults = 1;
          children = 0;
          unitName = `אורח ${familyNames[Math.floor(Math.random() * familyNames.length)]}`;
        }

        const unitColor = GUEST_COLORS[colorIdx % GUEST_COLORS.length];
        colorIdx++;

        guests.push({
          id: crypto.randomUUID(),
          name: unitName,
          category: categories[Math.floor(Math.random() * categories.length)],
          adults,
          children,
          confirmed: true,
          tableId: tableId,
          color: unitColor
        });

        seatsOccupied += (adults + children);
      }
    }

    const demoEvent: EventData = {
      id: eventId,
      name: 'אירוע הדגמה - 80 מוזמנים',
      date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      venue: 'אולמי רובוכיף',
      eventTopic: 'חתונה',
      address: 'רחוב העתיד 10, באר שבע',
      guests: guests.slice(0, 80),
      tables,
      elements,
      categories,
      canvasWidth: 1000,
      canvasHeight: 1000,
      seatingTemplate: "שלום [GUEST_NAME]! אנחנו מחכים לכם ב-[EVENT_NAME]. השולחן שלכם הוא [TABLE_NUMBER] (סה\"כ [SEATS] מקומות). נתראה!"
    };

    onImportEvent(demoEvent);
  };

  const getRSVPLink = (event: EventData) => {
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

  const shareOnWhatsApp = (event: EventData) => {
    const link = getRSVPLink(event);
    const wazeUrl = event.address ? `\n\n📍 הוראות הגעה ב-Waze:\nhttps://waze.com/ul?q=${encodeURIComponent(event.address)}` : '';
    const message = `היי! נשמח מאוד שתאשרו הגעה ל${event.name} דרך הקישור הבא: ${link}${wazeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyToClipboard = (event: EventData) => {
    const link = getRSVPLink(event);
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenCreate = () => {
    setEditingEventId(null); setFormName(''); setFormDate(''); setFormVenue(''); setFormTopic('חתונה'); setFormAddress(''); setFormImageUrl(''); setFormTemplateId('');
    setShowModal(true);
  };

  const handleOpenEdit = (event: EventData) => {
    setEditingEventId(event.id); setFormName(event.name); setFormDate(event.date); setFormVenue(event.venue); setFormTopic(event.eventTopic || 'חתונה'); setFormAddress(event.address || ''); setFormImageUrl(event.imageUrl || '');
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
    if (formName && formDate && formVenue && formTopic) {
      if (editingEventId) onUpdateEventMetadata(editingEventId, formName, formDate, formVenue, formTopic, formAddress, formImageUrl);
      else onCreateEvent(formName, formDate, formVenue, formTopic, formAddress, formImageUrl, formTemplateId);
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
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={generateDemoEvent} className="flex-1 md:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black transition-all">
            <PlayCircle size={22} /> אירוע לדוגמא (80 איש)
          </button>
          <button onClick={handleOpenCreate} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
            <Plus size={22} /> צור אירוע חדש
          </button>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-6 md:p-10 animate-slideUp overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-indigo-900">{editingEventId ? 'עריכת אירוע' : 'אירוע חדש'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 p-2"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">נושא האירוע</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    const isSelected = formTopic === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setFormTopic(topic.id)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all font-bold text-xs ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-indigo-100'}`}
                      >
                        <Icon size={16} className={isSelected ? topic.color : 'text-gray-300'} />
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">שם האירוע</label>
                <input autoFocus type="text" required placeholder="החתונה של..." className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">תאריך</label><input type="date" required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formDate} onChange={(e) => setFormDate(e.target.value)} /></div>
                <div><label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">שם האולם</label><input type="text" required placeholder="איפה חוגגים?" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" value={formVenue} onChange={(e) => setFormVenue(e.target.value)} /></div>
              </div>
              
              {!editingEventId && availableTemplates.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-indigo-400 uppercase mb-2 mr-1">בחירת סקיצת אולם (אופציונלי)</label>
                  <div className="relative">
                    <Layout className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select className="w-full px-12 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold appearance-none cursor-pointer" value={formTemplateId} onChange={(e) => setFormTemplateId(e.target.value)}>
                      <option value="">בחר סקיצה מוכנה (ללא)</option>
                      {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

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

      {sharingEvent && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 animate-slideUp">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Share2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-indigo-950 mb-2">שיתוף טופס הרשמה</h2>
            <p className="text-gray-400 font-bold text-sm mb-8 leading-relaxed">שלח את הקישור למוזמנים כדי שיאשרו הגעה בעצמם. הפרטים יופיעו אצלך אוטומטית.</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => shareOnWhatsApp(sharingEvent)}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-100"
              >
                <MessageCircle size={20} />
                שיתוף בוואטסאפ
              </button>
              
              <button 
                onClick={() => copyToClipboard(sharingEvent)}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'הקישור הועתק!' : 'העתק קישור להרשמה'}
              </button>
              
              <button 
                onClick={() => setSharingEvent(null)}
                className="w-full py-4 text-gray-400 font-bold text-sm"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={40} /></div>
          <h3 className="text-xl font-black text-indigo-950">אין אירועים קרובים</h3>
          <p className="text-gray-400 font-bold mt-2">לחץ על הכפתור למעלה כדי ליצור את האירוע הראשון שלך או נסה את האירוע לדוגמא</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {events.map((event) => {
            const totalPeople = event.guests.reduce((sum, g) => sum + (g.adults || 0) + (g.children || 0), 0);
            const { dayOfWeek, hebrewDate, gregDate } = getHebrewDateInfo(event.date);
            const topic = EVENT_TOPICS.find(t => t.id === event.eventTopic) || EVENT_TOPICS[0];
            const TopicIcon = topic.icon;

            return (
              <div key={event.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 group flex flex-col h-full transform hover:-translate-y-2">
                <div className="h-44 md:h-48 w-full relative">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white/20"><Calendar size={80} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/20 to-transparent"></div>
                  
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
                    <TopicIcon size={14} className="text-white fill-white/20" />
                    <span className="text-white text-[10px] font-black uppercase">{topic.label}</span>
                  </div>

                  <div className="absolute bottom-5 right-6 left-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-white font-black text-xl md:text-2xl drop-shadow-lg truncate max-w-[200px]">{event.name}</h3>
                      <div className="flex items-center gap-2 text-indigo-100/80 text-[10px] font-black uppercase mt-1">
                        <MapPin size={10} /> {event.venue}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSharingEvent(event); }}
                      className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-all border border-white/20"
                      title="שתף טופס הרשמה"
                    >
                      <Share2 size={18} />
                    </button>
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
                    <button onClick={() => { setEditingEventId(event.id); handleOpenEdit(event); }} className="p-3.5 rounded-2xl bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Edit2 size={18} /></button>
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
