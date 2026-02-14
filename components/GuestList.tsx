
import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { Plus, UserPlus, Search, Trash2, CheckCircle2, Users, Clock, MessageCircle, AlertCircle, Phone, ChevronDown, ChevronUp } from 'lucide-react';

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

const COLOR_PALETTE = ['#3b82f6', '#ec4899', '#6366f1', '#f43f5e', '#22c55e', '#a855f7', '#f59e0b', '#14b8a6'];

const GuestList: React.FC<GuestListProps> = ({ 
  guests, tables, eventName, eventVenue, categories, whatsappTemplate,
  onAddGuest, onRemoveGuest, onUpdateGuest 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCat, setNewCat] = useState<string>(categories[0] || '');
  const [newAdults, setNewAdults] = useState(1);
  const [newChildren, setNewChildren] = useState(0);

  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusTab === 'ALL' || (statusTab === 'CONFIRMED' ? g.confirmed : !g.confirmed);
    return matchesSearch && matchesStatus;
  });

  const confirmedCount = guests.filter(g => g.confirmed).reduce((sum, g) => sum + g.adults + g.children, 0);
  const pendingCount = guests.filter(g => !g.confirmed).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddGuest({
        name: newName, phone: newPhone.trim() || undefined,
        category: newCat || categories[0], adults: newAdults, children: newChildren,
        tableId: null, confirmed: false,
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
      });
      setNewName(''); setNewPhone(''); setNewAdults(1); setNewChildren(0);
    }
  };

  const sendWhatsApp = (guest: Guest) => {
    if (!guest.phone) return;
    const tableNum = tables.find(t => t.id === guest.tableId)?.number || 'טרם נקבע';
    const total = guest.adults + guest.children;
    const message = (whatsappTemplate || '')
      .replace(/{name}/g, guest.name).replace(/{eventName}/g, eventName)
      .replace(/{venue}/g, eventVenue).replace(/{table}/g, tableNum.toString())
      .replace(/{totalSeats}/g, total.toString());
    window.open(`https://wa.me/${guest.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fadeIn pb-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4 col-span-1">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={20} /></div>
          <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">מוזמנים</p><p className="text-xl md:text-3xl font-black text-indigo-950">{guests.reduce((s,g)=>s+g.adults+g.children,0)}</p></div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4 col-span-1">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
          <div><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase">מאושרים</p><p className="text-xl md:text-3xl font-black text-green-600">{confirmedCount}</p></div>
        </div>
        <div className="hidden md:flex bg-white p-6 rounded-3xl shadow-sm border border-gray-100 items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock size={20} /></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase">ממתינים</p><p className="text-3xl font-black text-amber-600">{pendingCount}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-indigo-950 mb-6 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600" />הוספת מוזמן</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" value={newName} required onChange={(e) => setNewName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 outline-none font-bold" placeholder="שם האורח" />
              <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 outline-none text-left font-bold" placeholder="טלפון" dir="ltr" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min="1" value={newAdults} onChange={(e) => setNewAdults(parseInt(e.target.value) || 1)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 font-black text-center" placeholder="מבוגרים" />
                <input type="number" min="0" value={newChildren} onChange={(e) => setNewChildren(parseInt(e.target.value) || 0)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 font-black text-center" placeholder="ילדים" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">הוסף לרשימה</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex bg-white p-1 rounded-2xl w-full md:w-auto shadow-sm border border-gray-100">
              <button onClick={() => setStatusTab('ALL')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black ${statusTab === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}>הכל</button>
              <button onClick={() => setStatusTab('CONFIRMED')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black ${statusTab === 'CONFIRMED' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400'}`}>מאושרים</button>
              <button onClick={() => setStatusTab('PENDING')} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black ${statusTab === 'PENDING' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400'}`}>ממתינים</button>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="חיפוש לפי שם..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-5 py-3 rounded-2xl bg-white border border-gray-100 font-bold text-sm shadow-sm" />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50/50 text-gray-400 font-black text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-5">מוזמן</th>
                  <th className="px-6 py-5 text-center">נפשות</th>
                  <th className="px-6 py-5 text-center">שולחן</th>
                  <th className="px-6 py-5 text-center">סטטוס</th>
                  <th className="px-8 py-5 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: guest.color }} />
                        <span className="font-black text-indigo-950">{guest.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-indigo-900">{guest.adults + guest.children}</td>
                    <td className="px-6 py-5 text-center">
                      {guest.tableId ? <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black">שולחן {tables.find(t=>t.id===guest.tableId)?.number}</span> : <span className="text-gray-300 italic text-[10px]">טרם נקבע</span>}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => onUpdateGuest(guest.id, { confirmed: !guest.confirmed })} className={`px-4 py-2 rounded-2xl text-[10px] font-black transition-all ${guest.confirmed ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'}`}>
                        {guest.confirmed ? 'מאושר' : 'ממתין'}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-1">
                        {guest.phone && <button onClick={() => sendWhatsApp(guest)} className="text-green-500 p-2 hover:bg-green-50 rounded-xl"><MessageCircle size={18} /></button>}
                        <button onClick={() => onRemoveGuest(guest.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredGuests.map(guest => (
              <div key={guest.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center transition-all active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 rounded-full" style={{ backgroundColor: guest.color }} />
                  <div>
                    <p className="font-black text-indigo-950 text-base">{guest.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {guest.adults + guest.children} נפשות {guest.tableId && `• שולחן ${tables.find(t=>t.id===guest.tableId)?.number}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateGuest(guest.id, { confirmed: !guest.confirmed })} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${guest.confirmed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 size={20} />
                  </button>
                  {guest.phone && (
                    <button onClick={() => sendWhatsApp(guest)} className="w-10 h-10 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                      <Phone size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredGuests.length === 0 && (
            <div className="py-20 text-center"><p className="text-gray-300 font-black">לא נמצאו מוזמנים</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestList;
