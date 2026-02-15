
import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { Plus, UserPlus, Search, Trash2, CheckCircle2, Users, Clock, MessageCircle, Edit2, Split, X, Save, Send } from 'lucide-react';

interface GuestListProps {
  eventId: string;
  guests: Guest[];
  tables: Table[];
  eventName: string;
  eventVenue: string;
  eventDate: string;
  categories: string[];
  seatingTemplate?: string;
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onRemoveGuest: (id: string) => void;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
  onSplitGuest: (originalId: string, splitData: { adults: number; children: number }) => void;
}

const GUEST_COLORS = [
  '#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', 
  '#8b5cf6', '#f43f5e', '#14b8a6', '#f97316', '#06b6d4'
];

const GuestList: React.FC<GuestListProps> = ({ 
  guests, tables, eventName, eventVenue, eventDate, categories, seatingTemplate,
  onAddGuest, onRemoveGuest, onUpdateGuest, onSplitGuest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newAdults, setNewAdults] = useState(1);
  const [newChildren, setNewChildren] = useState(0);

  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [splittingGuest, setSplittingGuest] = useState<Guest | null>(null);
  const [splitAdults, setSplitAdults] = useState(0);
  const [splitChildren, setSplitChildren] = useState(0);

  const filteredGuests = guests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const randomColor = GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)];
      onAddGuest({ 
        name: newName, 
        category: categories[0], 
        adults: newAdults, 
        children: newChildren, 
        tableId: null, 
        confirmed: false, 
        color: randomColor 
      });
      setNewName(''); setNewAdults(1); setNewChildren(0);
    }
  };

  const handleSendSeating = (guest: Guest) => {
    const table = tables.find(t => t.id === guest.tableId);
    const tableNum = table ? table.number.toString() : 'טרם נקבע';
    const totalSeats = guest.adults + guest.children;
    
    // ניסיון למצוא את כתובת האירוע מהנתונים הגלובליים או מהקונטקסט
    // מאחר ו-GuestList לא מקבל את האובייקט המלא של EventData, נחפש דרך seatingTemplate או נשתמש ב-Waze link אם יש כתובת
    const currentEvent = JSON.parse(localStorage.getItem('users_db_v3') || '{}');
    let address = '';
    Object.values(currentEvent).forEach((u: any) => {
      const ev = u.events?.find((e: any) => e.name === eventName && e.venue === eventVenue);
      if (ev?.address) address = ev.address;
    });

    let message = seatingTemplate || "היי [GUEST_NAME], מחכים לראותכם ב-[EVENT_NAME]! שולחן: [TABLE_NUMBER], כמות מקומות: [SEATS].";
    
    if (address) {
      message += `\n\n📍 הוראות הגעה ב-Waze:\nhttps://waze.com/ul?q=${encodeURIComponent(address)}`;
    }

    message = message
      .replace('[GUEST_NAME]', guest.name)
      .replace('[EVENT_NAME]', eventName)
      .replace('[TABLE_NUMBER]', tableNum)
      .replace('[SEATS]', totalSeats.toString())
      .replace('[EVENT_VENUE]', eventVenue)
      .replace('[EVENT_ADDRESS]', address)
      .replace('[EVENT_DATE]', new Date(eventDate).toLocaleDateString('he-IL'));

    window.open(`https://wa.me/${guest.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSplit = () => {
    if (splittingGuest && (splitAdults > 0 || splitChildren > 0)) {
      onSplitGuest(splittingGuest.id, { adults: splitAdults, children: splitChildren });
      setSplittingGuest(null); setSplitAdults(0); setSplitChildren(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-4">
            <h3 className="text-lg font-black text-indigo-950 mb-6 flex items-center gap-2"><UserPlus size={20} className="text-indigo-600" /> הוספה מהירה</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <input type="text" value={newName} required onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 font-bold outline-none" placeholder="שם מוזמן" />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 mr-1 uppercase">מבוגרים</span>
                  <input type="number" min="1" value={newAdults} onChange={(e) => setNewAdults(parseInt(e.target.value) || 1)} className="w-full p-3 rounded-2xl bg-gray-50 text-center font-black" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 mr-1 uppercase">ילדים</span>
                  <input type="number" min="0" value={newChildren} onChange={(e) => setNewChildren(parseInt(e.target.value) || 0)} className="w-full p-3 rounded-2xl bg-gray-50 text-center font-black" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all">הוסף</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input type="text" placeholder="חיפוש מוזמנים..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-12 pl-5 py-4 rounded-3xl bg-white border border-gray-100 font-bold shadow-sm" />
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase">
                <tr>
                  <th className="px-6 py-5">מוזמן</th>
                  <th className="px-4 py-5 text-center">נפשות</th>
                  <th className="px-6 py-5 text-center">שולחן</th>
                  <th className="px-6 py-5 text-center">סטטוס</th>
                  <th className="px-6 py-5 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map(guest => {
                  const table = tables.find(t => t.id === guest.tableId);
                  return (
                    <tr key={guest.id} className="hover:bg-indigo-50/20 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: guest.color }} />
                          <div className="flex flex-col">
                            <span className="font-black text-indigo-950">{guest.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{guest.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black text-xs">
                          {guest.adults + guest.children}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         {table ? <span className="font-black text-indigo-600">#{table.number}</span> : <span className="text-gray-300 text-xs">לא שובץ</span>}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => onUpdateGuest(guest.id, { confirmed: !guest.confirmed })} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${guest.confirmed ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
                          {guest.confirmed ? 'מאושר' : 'ממתין'}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleSendSeating(guest)} title="שלח שיבוץ" className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Send size={18} /></button>
                          <button onClick={() => setSplittingGuest(guest)} title="פיצול" className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Split size={18} /></button>
                          <button onClick={() => setEditingGuest(guest)} title="עריכה" className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><Edit2 size={18} /></button>
                          <button onClick={() => onRemoveGuest(guest.id)} title="מחיקה" className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingGuest && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2"><Edit2 size={20} /> עריכת מוזמן</h2>
              <button onClick={() => setEditingGuest(null)}><X className="text-gray-300 hover:text-red-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-400 mr-1 uppercase">שם מוזמן</label>
                <input type="text" className="w-full p-4 rounded-2xl bg-gray-50 font-bold outline-none border-2 border-transparent focus:border-indigo-500" value={editingGuest.name} onChange={e => setEditingGuest({...editingGuest, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 mr-1 uppercase">טלפון</label>
                <input type="tel" className="w-full p-4 rounded-2xl bg-gray-50 font-bold outline-none text-left" value={editingGuest.phone || ''} onChange={e => setEditingGuest({...editingGuest, phone: e.target.value})} placeholder="050-0000000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 mr-1 uppercase">מבוגרים</label>
                  <input type="number" className="w-full p-4 rounded-2xl bg-gray-50 font-black text-center" value={editingGuest.adults} onChange={e => setEditingGuest({...editingGuest, adults: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 mr-1 uppercase">ילדים</label>
                  <input type="number" className="w-full p-4 rounded-2xl bg-gray-50 font-black text-center" value={editingGuest.children} onChange={e => setEditingGuest({...editingGuest, children: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                 {GUEST_COLORS.map(color => (
                   <button key={color} onClick={() => setEditingGuest({...editingGuest, color})} className={`w-8 h-8 rounded-full border-2 ${editingGuest.color === color ? 'border-indigo-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                 ))}
              </div>
              <button onClick={() => { onUpdateGuest(editingGuest.id, editingGuest); setEditingGuest(null); }} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl mt-4">
                <Save size={20} /> שמור שינויים
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
