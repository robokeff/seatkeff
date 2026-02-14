
import React, { useState, useMemo } from 'react';
import { Guest, GuestCategory, Table } from '../types';
import { Plus, UserPlus, Search, Trash2, CheckCircle2, User, Users, Baby, Scissors, X, MessageCircle, Share2, Link as LinkIcon, Clock, Filter, Palette } from 'lucide-react';

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

const COLOR_PALETTE = [
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#f43f5e', // rose-500
  '#22c55e', // green-500
  '#a855f7', // purple-500
  '#f59e0b', // amber-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
];

const getCategoryColorClass = (category: string, categories: string[]) => {
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

const getDefaultColorForCategory = (category: string, categories: string[]) => {
  const idx = categories.indexOf(category);
  return COLOR_PALETTE[idx % COLOR_PALETTE.length];
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
  const [newColor, setNewColor] = useState<string | undefined>(undefined);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || (g.phone && g.phone.includes(searchTerm));
    const matchesCategory = filterCategory === 'ALL' || g.category === filterCategory;
    const matchesStatus = statusTab === 'ALL' || (statusTab === 'CONFIRMED' ? g.confirmed : !g.confirmed);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalInvited = guests.reduce((sum, g) => sum + g.adults + g.children, 0);
  const confirmedCount = guests.filter(g => g.confirmed).reduce((sum, g) => sum + g.adults + g.children, 0);

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
        confirmed: false,
        color: newColor || getDefaultColorForCategory(newCat || categories[0], categories)
      });
      setNewName(''); setNewPhone(''); setNewAdults(1); setNewChildren(0); setNewColor(undefined);
    }
  };

  const sendWhatsApp = (guest: Guest) => {
    if (!guest.phone) {
      alert('אין מספר טלפון לאורח זה');
      return;
    }
    const tableNum = tables.find(t => t.id === guest.tableId)?.number || 'טרם נקבע';
    const total = guest.adults + guest.children;
    const message = (whatsappTemplate || '')
      .replace(/{name}/g, guest.name)
      .replace(/{eventName}/g, eventName)
      .replace(/{venue}/g, eventVenue)
      .replace(/{table}/g, tableNum.toString())
      .replace(/{totalSeats}/g, total.toString());
    
    window.open(`https://wa.me/${guest.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={28} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">סה"כ מוזמנים</p><p className="text-3xl font-black text-indigo-950">{totalInvited}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4 transition-all">
          <div className={`p-4 rounded-2xl ${confirmedCount > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-300'}`}><CheckCircle2 size={28} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">מאושרים</p><p className="text-3xl font-black text-green-600">{confirmedCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Clock size={28} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ממתינים לאישור</p><p className="text-3xl font-black text-amber-600">{guests.filter(g => !g.confirmed).reduce((sum, g) => sum + g.adults + g.children, 0)}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-xl font-bold text-indigo-950 mb-6 flex items-center gap-2"><UserPlus size={22} className="text-indigo-600" />הוספת מוזמן</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" value={newName} required onChange={(e) => setNewName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="שם האורח" />
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-left font-bold" placeholder="טלפון" dir="ltr" />
              <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-indigo-900 appearance-none">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase mr-1">צבע זיהוי אישי</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button 
                      key={c} type="button" onClick={() => setNewColor(c)} 
                      className={`w-6 h-6 rounded-full border-2 transition-all ${newColor === c ? 'border-indigo-600 scale-125' : 'border-transparent'}`} 
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" min="1" value={newAdults} onChange={(e) => setNewAdults(parseInt(e.target.value) || 1)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-black text-center" placeholder="מבוגרים" />
                <input type="number" min="0" value={newChildren} onChange={(e) => setNewChildren(parseInt(e.target.value) || 0)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-black text-center" placeholder="ילדים" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                <Plus size={20} /> הוסף לרשימה
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
              <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-2xl w-full md:w-auto">
                <button onClick={() => setStatusTab('ALL')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'ALL' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}>הכל</button>
                <button onClick={() => setStatusTab('CONFIRMED')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'CONFIRMED' ? 'bg-white shadow-md text-green-600' : 'text-gray-400'}`}>מאושרים</button>
                <button onClick={() => setStatusTab('PENDING')} className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${statusTab === 'PENDING' ? 'bg-white shadow-md text-amber-600' : 'text-gray-400'}`}>ממתינים</button>
              </div>
              <input type="text" placeholder="חיפוש לפי שם או טלפון..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase">
                    <th className="px-6 py-5">שם וצבע</th>
                    <th className="px-6 py-5">קטגוריה</th>
                    <th className="px-6 py-5 text-center">נפשות</th>
                    <th className="px-6 py-5">שולחן</th>
                    <th className="px-6 py-5 text-center">אישור הגעה</th>
                    <th className="px-6 py-5 text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50/50 group transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: guest.color || '#cbd5e1' }} />
                          <div className="flex flex-col">
                            <span className="font-black text-indigo-950">{guest.name}</span>
                            {guest.phone && <span className="text-[10px] text-gray-400">{guest.phone}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap ${getCategoryColorClass(guest.category, categories)}`}>{guest.category}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-indigo-900">{guest.adults + guest.children}</td>
                      <td className="px-6 py-5">
                        {guest.tableId ? <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap">שולחן {tables.find(t => t.id === guest.tableId)?.number}</span> : <span className="text-gray-300 italic text-[10px]">לא משובץ</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => onUpdateGuest(guest.id, { confirmed: !guest.confirmed })}
                          className={`p-2.5 rounded-full transition-all ${guest.confirmed ? 'bg-green-100 text-green-600 scale-110 shadow-sm' : 'bg-gray-50 text-gray-300 hover:text-indigo-400'}`}
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {guest.phone && (
                            <button onClick={() => sendWhatsApp(guest)} className="text-green-500 hover:bg-green-50 p-2.5 rounded-xl transition-all" title="שלח וואטסאפ">
                              <MessageCircle size={18} />
                            </button>
                          )}
                          <button onClick={() => onRemoveGuest(guest.id)} className="text-gray-200 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all" title="מחק">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGuests.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-300 font-bold">לא נמצאו אורחים התואמים לחיפוש</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestList;
