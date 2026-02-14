
import React, { useState, useMemo } from 'react';
import { Guest, GuestCategory, Table } from '../types';
// Added Plus to the imports from lucide-react to fix 'Cannot find name Plus' error
import { Plus, UserPlus, Search, Trash2, CheckCircle2, User, Users, Baby, Scissors, X, MessageCircle, Share2, Link as LinkIcon, Clock, Filter } from 'lucide-react';

interface GuestListProps {
  eventId: string;
  guests: Guest[];
  tables: Table[];
  eventName: string;
  eventVenue: string;
  eventAddress?: string;
  eventImageUrl?: string;
  categories: string[];
  whatsappTemplate?: string;
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onRemoveGuest: (id: string) => void;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
  onSplitGuest: (originalId: string, splitData: { adults: number; children: number }) => void;
}

const getCategoryColor = (category: string, categories: string[]) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-rose-100 text-rose-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-teal-100 text-teal-700',
  ];
  const idx = categories.indexOf(category);
  return idx === -1 ? 'bg-gray-100 text-gray-600' : colors[idx % colors.length];
};

const GuestList: React.FC<GuestListProps> = ({ 
  eventId, guests, tables, eventName, eventVenue, eventAddress, eventImageUrl, categories, whatsappTemplate,
  onAddGuest, onRemoveGuest, onUpdateGuest, onSplitGuest 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | 'ALL'>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCat, setNewCat] = useState<string>(categories[0] || '');
  const [newAdults, setNewAdults] = useState(1);
  const [newChildren, setNewChildren] = useState(0);

  const [splitId, setSplitId] = useState<string | null>(null);
  const [splitAdults, setSplitAdults] = useState(0);
  const [splitChildren, setSplitChildren] = useState(0);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || (g.phone && g.phone.includes(searchTerm));
    const matchesCategory = filterCategory === 'ALL' || g.category === filterCategory;
    const matchesStatus = statusTab === 'ALL' || (statusTab === 'CONFIRMED' ? g.confirmed : !g.confirmed);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalInvited = guests.reduce((sum, g) => sum + g.adults + g.children, 0);
  const confirmedCount = guests.filter(g => g.confirmed).reduce((sum, g) => sum + g.adults + g.children, 0);
  const pendingCount = guests.filter(g => !g.confirmed).reduce((sum, g) => sum + g.adults + g.children, 0);

  const getRSVPFullUrl = () => {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('rsvp', eventId);
    params.set('n', eventName);
    params.set('v', eventVenue);
    return `${base}?${params.toString()}`;
  };

  const shareRSVPLink = () => {
    const rsvpUrl = getRSVPFullUrl();
    const message = `היי! נשמח מאוד לראותכם ב${eventName} ❤️\nאנא אשרו הגעה בקישור הבא כדי שנוכל להיערך בהתאם:\n${rsvpUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyRSVPLink = () => {
    const rsvpUrl = getRSVPFullUrl();
    navigator.clipboard.writeText(rsvpUrl).then(() => {
        alert('לינק להרשמה הועתק ללוח!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddGuest({
        name: newName,
        phone: newPhone.trim() || undefined,
        category: newCat || categories[0],
        adults: newAdults,
        children: newChildren,
        tableId: null,
        confirmed: false // Default to false so they must be confirmed before seating
      });
      setNewName(''); setNewPhone(''); setNewAdults(1); setNewChildren(0);
    }
  };

  const confirmSplit = (guest: Guest) => {
    if (splitAdults === 0 && splitChildren === 0) { setSplitId(null); return; }
    onSplitGuest(guest.id, { adults: splitAdults, children: splitChildren });
    setSplitId(null);
  };

  const sendWhatsAppMessage = (guest: Guest) => {
    const table = tables.find(t => t.id === guest.tableId);
    if (!table) { alert('יש לשבץ את האורח לשולחן לפני שליחת הודעה'); return; }
    
    const totalSeats = guest.adults + guest.children;
    const template = whatsappTemplate || `שלום {name}, אנחנו מחכים לראותך ב{eventName}! 🥂\n\n📍 מקומך שמור בשולחן מספר: *{table}*\n🏛️ מיקום: {venue}\n👥 סה"כ מקומות שמורים: {totalSeats}\n\nנתראה בשמחות! ✨`;

    let message = template
      .replace(/{name}/g, guest.name)
      .replace(/{table}/g, table.number.toString())
      .replace(/{venue}/g, eventVenue)
      .replace(/{eventName}/g, eventName)
      .replace(/{totalSeats}/g, totalSeats.toString());

    if (eventImageUrl && eventImageUrl.startsWith('http')) {
      message = `${eventImageUrl}\n\n${message}`;
    }

    const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">סה"כ מוזמנים</p>
            <p className="text-3xl font-black text-indigo-950">{totalInvited}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">מאושרים להושבה</p>
            <p className="text-3xl font-black text-green-600">{confirmedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ממתינים לאישור</p>
            <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-xl font-bold text-indigo-950 mb-6 flex items-center gap-2">
              <UserPlus size={22} className="text-indigo-600" />
              הוספת מוזמן חדש
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1.5 mr-1">שם האורח</label>
                <input type="text" value={newName} required onChange={(e) => setNewName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="למשל: משפחת כהן" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1.5 mr-1">טלפון (אופציונלי)</label>
                <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-left font-bold" placeholder="05X-XXXXXXX" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 mb-1.5 mr-1">קטגוריה</label>
                <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-indigo-900 appearance-none">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1.5 mr-1 uppercase">מבוגרים</label>
                  <input type="number" min="1" value={newAdults} onChange={(e) => setNewAdults(parseInt(e.target.value) || 1)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-center" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-1.5 mr-1 uppercase">ילדים</label>
                  <input type="number" min="0" value={newChildren} onChange={(e) => setNewChildren(parseInt(e.target.value) || 0)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-black text-center" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95">
                <Plus size={20} />
                הוסף לרשימה
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
               <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100 space-y-4">
                  <h4 className="font-black text-pink-700 flex items-center gap-2"><Share2 size={18} /> הרשמה עצמית</h4>
                  <p className="text-[11px] text-pink-600/70 font-bold leading-relaxed">שלחו קישור לאורחים והם יוכלו לעדכן בעצמם כמה אנשים מגיעים.</p>
                  <div className="space-y-2">
                    <button onClick={shareRSVPLink} className="w-full bg-pink-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-pink-700 shadow-md transition-colors"><MessageCircle size={16} /> שלח בוואטסאפ</button>
                    <button onClick={copyRSVPLink} className="w-full bg-white text-pink-600 border border-pink-200 py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors">העתק קישור להרשמה</button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
              <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-2xl w-full md:w-auto">
                <button 
                  onClick={() => setStatusTab('ALL')} 
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'ALL' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  הכל ({guests.length})
                </button>
                <button 
                  onClick={() => setStatusTab('PENDING')} 
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'PENDING' ? 'bg-white shadow-md text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ממתינים ({guests.filter(g => !g.confirmed).length})
                </button>
                <button 
                  onClick={() => setStatusTab('CONFIRMED')} 
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'CONFIRMED' ? 'bg-white shadow-md text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  מאושרים ({guests.filter(g => g.confirmed).length})
                </button>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="text" placeholder="חיפוש לפי שם או טלפון..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 pr-12 pl-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm" />
                </div>
                <select 
                  className="px-5 py-3.5 rounded-2xl bg-gray-50 border-none font-black text-xs outline-none appearance-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">כל הקטגוריות</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-5">פרטי האורח</th>
                    <th className="px-6 py-5">קטגוריה</th>
                    <th className="px-6 py-5 text-center">כמות נפשות</th>
                    <th className="px-6 py-5">שיבוץ שולחן</th>
                    <th className="px-6 py-5">סטטוס הגעה</th>
                    <th className="px-6 py-5 text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGuests.map((guest) => {
                    const table = tables.find(t => t.id === guest.tableId);
                    const canSendMsg = !!guest.tableId && !!guest.phone;
                    return (
                      <React.Fragment key={guest.id}>
                        <tr className={`hover:bg-gray-50/50 transition-colors group ${!guest.confirmed ? 'bg-gray-50/30' : ''} ${splitId === guest.id ? 'bg-indigo-50/50' : ''}`}>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className={`font-black text-indigo-950 text-base ${!guest.confirmed ? 'opacity-70' : ''}`}>{guest.name}</span>
                              {guest.phone && <span className="text-[10px] text-gray-400 font-bold">{guest.phone}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black ${getCategoryColor(guest.category, categories)}`}>{guest.category}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <div className="flex flex-col items-center">
                                 <span className="text-lg font-black text-indigo-900 leading-none">{guest.adults + guest.children}</span>
                                 <span className="text-[8px] text-gray-400 font-black uppercase">{guest.adults} מבוגרים, {guest.children} ילדים</span>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {table ? (
                              <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100">שולחן {table.number}</span>
                            ) : (
                              <span className="text-gray-300 italic text-[10px] font-bold">לא משובץ</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => onUpdateGuest(guest.id, { confirmed: !guest.confirmed })} 
                              className={`group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                                guest.confirmed 
                                ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-600'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${guest.confirmed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                              {guest.confirmed ? 'מאושר' : 'אשר הגעה'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-left">
                            <div className="flex items-center justify-end gap-1">
                              {canSendMsg && (
                                <button onClick={() => sendWhatsAppMessage(guest)} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm" title="שלח הודעת הושבה">
                                  <MessageCircle size={18} />
                                </button>
                              )}
                              {(guest.adults + guest.children > 1) && (
                                <button onClick={() => setSplitId(guest.id)} className="p-2.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="פצל קבוצה">
                                  <Scissors size={18} />
                                </button>
                              )}
                              <button onClick={() => onRemoveGuest(guest.id)} className="text-gray-200 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100" title="מחק מוזמן">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {splitId === guest.id && (
                          <tr className="bg-indigo-50/50 animate-slideUp">
                            <td colSpan={6} className="px-10 py-8">
                              <div className="bg-white p-8 rounded-[2rem] border border-indigo-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-1">
                                  <h4 className="text-lg font-black text-indigo-900">פיצול קבוצה להושבה נפרדת</h4>
                                  <p className="text-xs text-gray-400 font-bold">הגדר כמה מוזמנים להעביר לקבוצה חדשה</p>
                                </div>
                                <div className="flex items-center gap-10">
                                  <div className="flex gap-6">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-gray-400 uppercase mr-1">מבוגרים:</label>
                                      <input type="number" min="0" max={guest.adults} value={splitAdults} onChange={(e) => setSplitAdults(parseInt(e.target.value) || 0)} className="w-24 px-5 py-3 rounded-xl bg-gray-50 border-none font-black text-center focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-black text-gray-400 uppercase mr-1">ילדים:</label>
                                      <input type="number" min="0" max={guest.children} value={splitChildren} onChange={(e) => setSplitChildren(parseInt(e.target.value) || 0)} className="w-24 px-5 py-3 rounded-xl bg-gray-50 border-none font-black text-center focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <button onClick={() => confirmSplit(guest)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">בצע פיצול</button>
                                    <button onClick={() => setSplitId(null)} className="bg-gray-100 text-gray-500 px-6 py-3.5 rounded-2xl font-black hover:bg-gray-200 transition-all">ביטול</button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-6 bg-gray-50 text-gray-200 rounded-full">
                            <Users size={48} />
                          </div>
                          <p className="text-gray-400 font-bold">לא נמצאו מוזמנים בסינון הנוכחי</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestList;
