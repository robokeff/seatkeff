
import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { Plus, Trash2, Users, ChevronDown, UserCheck, Search, Baby, User, Download } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  guests: Guest[];
  categories: string[];
  onAddTable: () => void;
  onRemoveTable: (id: string) => void;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
  onExport?: () => void;
}

const getCategoryColor = (category: string, categories: string[]) => {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-pink-100 text-pink-700',
    'bg-blue-100 text-blue-700',
    'bg-rose-100 text-rose-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
  ];
  const idx = categories.indexOf(category);
  return idx === -1 ? 'bg-gray-100 text-gray-600' : colors[idx % colors.length];
};

const TableGrid: React.FC<TableGridProps> = ({ tables, guests, categories, onAddTable, onRemoveTable, onUpdateTable, onAssignGuest, onExport }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getTableGuests = (tableId: string) => guests.filter(g => g.tableId === tableId);
  const unassignedGuests = guests.filter(g => !g.tableId && g.confirmed && g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCapacityChange = (table: Table, newCapacity: number) => {
    const tableGuests = getTableGuests(table.id);
    const occupiedSeats = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
    if (newCapacity < occupiedSeats) { alert(`לא ניתן להקטין... משובצים בו כרגע ${occupiedSeats} אורחים.`); return; }
    onUpdateTable(table.id, { capacity: newCapacity });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8 animate-fadeIn">
        <header className="flex justify-between items-center">
          <div><h2 className="text-2xl font-black text-indigo-950">מערך שולחנות</h2><p className="text-gray-500">נהל את ההושבה</p></div>
          <div className="flex gap-3">
            <button onClick={onAddTable} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"><Plus size={20} /> הוסף שולחן</button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.sort((a, b) => a.number - b.number).map((table, index) => {
            const tableGuests = getTableGuests(table.id);
            const occupiedSeats = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
            const isFull = occupiedSeats >= table.capacity;
            const isSelected = selectedTableId === table.id;
            return (
              <div key={table.id} onClick={() => setSelectedTableId(isSelected ? null : table.id)} className={`bg-white rounded-[2rem] p-6 shadow-sm border-2 transition-all cursor-pointer relative overflow-hidden group animate-slideUp ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-transparent hover:border-indigo-100'}`} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex justify-between items-start mb-4"><div><span className="text-xs font-black text-indigo-300 uppercase tracking-widest">שולחן</span><h3 className="text-3xl font-black text-indigo-900 leading-none">#{table.number}</h3></div>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveTable(table.id); }} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
                <div className="flex items-center gap-3 mb-2"><div className="flex-1 bg-gray-100 h-3 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (occupiedSeats / table.capacity) * 100)}%` }} /></div><span className={`text-xs font-black ${isFull ? 'text-red-500' : 'text-gray-500'}`}>{occupiedSeats}/{table.capacity}</span></div>
                <div className="space-y-1 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                  {tableGuests.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-xl text-[11px] animate-fadeIn">
                      <span className="font-bold text-gray-700 truncate flex-1">{g.name}</span>
                      <div className="flex items-center gap-2 shrink-0"><span className="text-gray-400 font-bold">{g.adults}+{g.children}</span>
                        <button onClick={(e) => { e.stopPropagation(); onAssignGuest(g.id, null); }} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  {tableGuests.length === 0 && <p className="text-center text-gray-300 text-[10px] py-4 italic">השולחן ריק</p>}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50"><label className="text-[10px] font-bold text-gray-400">קיבולת:</label>
                   <input type="number" min="1" className="w-12 bg-gray-50 border-none rounded-lg px-2 py-1 text-[11px] font-bold text-indigo-900 outline-none" value={table.capacity} onClick={e => e.stopPropagation()} onChange={(e) => handleCapacityChange(table, parseInt(e.target.value) || 0)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6 shrink-0 animate-slideInRight">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-indigo-50 sticky top-8">
          <div className="mb-6"><h3 className="text-lg font-black text-indigo-900 mb-1">הקצאת מוזמנים</h3><p className="text-xs text-gray-500 font-medium">בחר שולחן ולחץ על מוזמן</p></div>
          <div className="relative mb-6"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="חפש מוזמן..." className="w-full pr-10 pl-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {!selectedTableId && <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-xs font-bold mb-4 flex gap-2 items-start animate-pulse"><ChevronDown size={16} className="shrink-0" />אנא בחר שולחן כדי להתחיל</div>}
          <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-1 custom-scrollbar">
            {unassignedGuests.length > 0 ? unassignedGuests.map((g, idx) => (
              <button key={g.id} disabled={!selectedTableId} onClick={() => selectedTableId && onAssignGuest(g.id, selectedTableId)} className={`w-full text-right p-3 rounded-2xl border flex flex-col transition-all group animate-slideUp ${selectedTableId ? 'border-gray-100 hover:border-indigo-500 hover:bg-indigo-50/50' : 'border-gray-50 opacity-60 cursor-not-allowed'}`} style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm text-gray-800">{g.name}</span>{selectedTableId && <UserCheck size={14} className="text-indigo-600 opacity-0 group-hover:opacity-100" />}</div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getCategoryColor(g.category, categories)}`}>{g.category}</span>
                  <div className="flex gap-2"><span className="text-[10px] font-bold text-indigo-400 flex items-center gap-0.5"><User size={10}/>{g.adults}</span>{g.children > 0 && <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5"><Baby size={10}/>{g.children}</span>}</div>
                </div>
              </button>
            )) : <div className="text-center py-8"><Users size={32} className="mx-auto text-gray-100 mb-2" /><p className="text-xs text-gray-400">אין מוזמנים לא משובצים</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableGrid;
