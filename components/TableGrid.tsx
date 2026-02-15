
import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { Plus, Trash2, Users, ChevronDown, UserCheck, Search, Edit2, X, Save, Tag } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  guests: Guest[];
  categories: string[];
  onAddTable: () => void;
  onRemoveTable: (id: string) => void;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
}

const TableGrid: React.FC<TableGridProps> = ({ tables, guests, onAddTable, onRemoveTable, onUpdateTable, onAssignGuest }) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const getTableGuests = (tableId: string) => guests.filter(g => g.tableId === tableId);
  const unassignedGuests = guests.filter(g => !g.tableId && g.confirmed && g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUpdateTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      onUpdateTable(editingTable.id, { 
        number: editingTable.number, 
        capacity: editingTable.capacity,
        name: editingTable.name?.trim() || undefined
      });
      setEditingTable(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-10">
      <div className="flex-1 space-y-8 animate-fadeIn">
        <header className="flex justify-between items-center">
          <div><h2 className="text-2xl font-black text-indigo-950">סידור שולחנות</h2><p className="text-gray-500">שבץ אורחים לפי הקבוצות שלהם</p></div>
          <button onClick={onAddTable} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md"><Plus size={20} /> הוסף שולחן</button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.sort((a, b) => a.number - b.number).map((table) => {
            const tableGuests = getTableGuests(table.id);
            const occupiedSeats = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
            const isFull = occupiedSeats >= table.capacity;
            const isSelected = selectedTableId === table.id;
            return (
              <div key={table.id} onClick={() => setSelectedTableId(isSelected ? null : table.id)} className={`bg-white rounded-[2rem] p-6 shadow-sm border-2 transition-all cursor-pointer relative overflow-hidden group ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-transparent hover:border-indigo-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-300 uppercase">שולחן {table.number}</span>
                    {table.name && <h3 className="text-lg font-black text-indigo-950 leading-tight bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{table.name}</h3>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingTable(table); }} className="p-2 text-gray-200 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><Edit2 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveTable(table.id); }} className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (occupiedSeats / table.capacity) * 100)}%` }} />
                  </div>
                  <span className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-gray-400'}`}>{occupiedSeats}/{table.capacity}</span>
                </div>

                <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {tableGuests.map(g => (
                    <div key={g.id} className="flex justify-between items-center bg-gray-50 border-r-4 px-3 py-2 rounded-xl text-[11px] animate-fadeIn" style={{ borderRightColor: g.color || '#cbd5e1' }}>
                      <span className="font-bold text-gray-800 truncate flex-1">{g.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold">{g.adults + g.children}</span>
                        <button onClick={(e) => { e.stopPropagation(); onAssignGuest(g.id, null); }} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  {tableGuests.length === 0 && <p className="text-center text-gray-300 text-[10px] py-6 italic">לחץ כאן כדי לשבץ אורחים</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 sticky top-8">
          <h3 className="text-lg font-black text-indigo-950 mb-6">אורחים להקצאה</h3>
          <div className="relative mb-6">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="חפש מוזמן..." className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-1">
            {unassignedGuests.map(g => (
              <button 
                key={g.id} disabled={!selectedTableId} onClick={() => onAssignGuest(g.id, selectedTableId!)} 
                className={`w-full text-right p-3 rounded-2xl border-2 flex flex-col transition-all group ${selectedTableId ? 'border-gray-50 hover:border-indigo-500 hover:bg-indigo-50' : 'border-gray-50 opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color || '#cbd5e1' }} />
                  <span className="font-black text-sm text-indigo-950">{g.name}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{g.category}</span>
                  <span className="text-[10px] font-black text-indigo-600">({g.adults + g.children})</span>
                </div>
              </button>
            ))}
            {unassignedGuests.length === 0 && <p className="text-center text-gray-300 py-10 font-bold">אין אורחים לא משובצים</p>}
          </div>
        </div>
      </div>

      {editingTable && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-slideUp text-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-indigo-950 flex items-center gap-2"><Edit2 size={20} /> עריכת שולחן</h2>
              <button onClick={() => setEditingTable(null)}><X className="text-gray-300 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleUpdateTableSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase mr-1">שם השולחן (אופציונלי)</label>
                <input type="text" placeholder="למשל: משפחת כהן המורחבת" className="w-full px-5 py-4 rounded-2xl bg-gray-50 font-bold outline-none border-2 border-transparent focus:border-indigo-500" value={editingTable.name || ''} onChange={e => setEditingTable({...editingTable, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase mr-1">מספר</label>
                  <input type="number" min="1" className="w-full p-4 rounded-2xl bg-gray-50 font-black text-xl text-center" value={editingTable.number} onChange={e => setEditingTable({...editingTable, number: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase mr-1">קיבולת</label>
                  <input type="number" min="1" className="w-full p-4 rounded-2xl bg-gray-50 font-black text-xl text-center" value={editingTable.capacity} onChange={e => setEditingTable({...editingTable, capacity: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl">
                <Save size={20} /> שמור הגדרות
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableGrid;
