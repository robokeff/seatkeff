
import React, { useState, useRef, useEffect } from 'react';
import { Table, Guest } from '../types';
import { Image as ImageIcon, Search, UserPlus, X, MousePointer2, Layers, Info, Users, User, Baby, ClipboardList } from 'lucide-react';
import html2canvas from 'html2canvas';

interface HallLayoutProps {
  tables: Table[];
  guests: Guest[];
  categories: string[];
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
}

const HallLayout: React.FC<HallLayoutProps> = ({ tables, guests, categories, onUpdateTable, onAssignGuest }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const exportWrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; 
    const y = e.clientY - rect.top - 40;
    onUpdateTable(draggingId, { position: { x, y } });
  };

  const exportAsImage = async () => {
    if (!exportWrapperRef.current) return;
    setSelectedTableId(null);
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      const element = exportWrapperRef.current!;
      const canvas = await html2canvas(element, {
        backgroundColor: '#f9fafb',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `סקיצה_אירוע_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      link.click();
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const upListener = () => setDraggingId(null);
    window.addEventListener('mouseup', upListener);
    return () => window.removeEventListener('mouseup', upListener);
  }, []);

  const unassignedGuests = guests.filter(g => !g.tableId && g.confirmed && g.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedTables = [...tables].sort((a, b) => a.number - b.number);
  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <div ref={exportWrapperRef} className={`flex flex-col gap-8 pb-20 bg-gray-50 ${isExporting ? 'p-10 w-[1200px]' : ''}`}>
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-indigo-950">סקיצת אולם אינטראקטיבית</h2>
          <p className="text-gray-500 font-medium text-sm">הצבעים סביב השולחן הם הצבעים האישיים שבחרת לכל אורח.</p>
        </div>
        {!isExporting && (
          <button onClick={exportAsImage} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-xl transition-all active:scale-95"><ImageIcon size={20} /> הורד סקיצה (PNG)</button>
        )}
      </header>

      <div className={`flex gap-6 relative ${isExporting ? 'h-auto min-h-[900px]' : 'h-[calc(100vh-280px)] min-h-[600px]'}`}>
        <div 
          ref={containerRef} onMouseMove={handleMouseMove}
          className={`flex-1 bg-white rounded-[4rem] border-4 border-dashed border-gray-100 relative overflow-hidden shadow-inner select-none ${isExporting ? 'border-transparent rounded-none min-h-[900px]' : ''}`}
          style={{ backgroundImage: isExporting ? 'none' : 'radial-gradient(#e5e7eb 1.2px, transparent 1.2px)', backgroundSize: '40px 40px' }}
        >
          {tables.map((table) => {
            const tableGuests = guests.filter(g => g.tableId === table.id).sort((a, b) => (a.color || '').localeCompare(b.color || ''));
            const occupied = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
            const isFull = occupied >= table.capacity;
            const isSelected = selectedTableId === table.id;
            const pos = table.position || { x: 100, y: 100 };
            const size = 130 + Math.max(0, (table.capacity - 10) * 5);

            // Create flat array of colors representing each person
            const seatColors: string[] = [];
            tableGuests.forEach(g => {
              for (let i = 0; i < (g.adults + g.children); i++) seatColors.push(g.color || '#cbd5e1');
            });

            return (
              <div
                key={`${table.id}-${occupied}`} // Adding occupied to key triggers animation on count change
                onMouseDown={(e) => !isExporting && handleMouseDown(table.id, e)}
                className={`absolute transition-all duration-300 ${draggingId === table.id ? 'z-50 scale-105 opacity-80' : 'z-10'} ${isSelected ? 'animate-tablePop' : ''}`}
                style={{ left: pos.x, top: pos.y, width: size, height: size }}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: table.capacity }).map((_, i) => {
                    const angle = (i / table.capacity) * 2 * Math.PI;
                    const radius = size / 2 + 15;
                    const x = size / 2 + radius * Math.cos(angle) - 6;
                    const y = size / 2 + radius * Math.sin(angle) - 6;
                    const color = seatColors[i];
                    return (
                      <div key={i} className="absolute w-3.5 h-3.5 rounded-full border border-white shadow-sm transition-colors duration-500" style={{ left: x, top: y, backgroundColor: color || '#f1f5f9' }} />
                    );
                  })}
                </div>

                <div className={`w-full h-full rounded-full border-4 flex flex-col items-center justify-center p-3 text-center shadow-lg transition-all duration-300 ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-8 ring-indigo-100/50 animate-softPulse' : (isFull ? 'bg-indigo-900 border-indigo-700' : 'bg-white border-indigo-100')}`}>
                  <span className={`text-2xl font-black transition-colors duration-300 ${isFull && !isSelected ? 'text-white' : 'text-indigo-950'} ${isSelected ? 'text-indigo-600' : ''}`}>#{table.number}</span>
                  <div className={`mt-1 text-[10px] font-black transition-colors duration-300 ${isFull && !isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>{occupied}/{table.capacity}</div>
                </div>

                {!isExporting && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedTableId(isSelected ? null : table.id); }} className={`absolute -top-2 -right-2 p-2 rounded-full shadow-lg border-2 transition-all duration-300 active:scale-90 ${isSelected ? 'bg-indigo-600 border-white text-white' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600'}`}><MousePointer2 size={16} /></button>
                )}
              </div>
            );
          })}
        </div>

        {!isExporting && selectedTableId && (
          <div className="w-80 bg-white rounded-[3rem] shadow-2xl border border-indigo-100 flex flex-col p-8 animate-slideInRight z-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-indigo-950">שולחן #{selectedTable?.number}</h3>
              <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {unassignedGuests.map(g => (
                <button key={g.id} onClick={() => onAssignGuest(g.id, selectedTableId)} className="w-full text-right p-4 rounded-2xl bg-gray-50 border-r-8 hover:bg-indigo-50 hover:translate-x-1 transition-all flex flex-col" style={{ borderRightColor: g.color || '#cbd5e1' }}>
                  <span className="font-black text-indigo-950 text-sm">{g.name}</span>
                  <span className="text-[10px] font-bold text-gray-400">{g.category} • {g.adults + g.children} נפשות</span>
                </button>
              ))}
              {unassignedGuests.length === 0 && <p className="text-center text-gray-300 py-10 font-bold">אין אורחים נוספים</p>}
            </div>
          </div>
        )}
      </div>

      <section className={`bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 mt-4 transition-all duration-500 ${isExporting ? 'shadow-none border-gray-200' : 'hover:shadow-md'}`}>
        <h3 className="text-2xl font-black text-indigo-950 mb-8 flex items-center gap-3"><ClipboardList size={28} className="text-indigo-600" />ריכוז רשימות לפי שולחן</h3>
        <div className={`grid gap-6 ${isExporting ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}>
          {sortedTables.map(table => {
            const tableGuests = guests.filter(g => g.tableId === table.id);
            return (
              <div key={table.id} className="bg-gray-50 rounded-3xl p-5 border border-gray-100 transition-all hover:bg-white hover:border-indigo-50">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                  <span className="font-black text-indigo-950">שולחן {table.number}</span>
                  <span className="text-[10px] font-black text-gray-400">{tableGuests.reduce((s, g) => s + g.adults + g.children, 0)}/{table.capacity}</span>
                </div>
                <div className="space-y-2">
                  {tableGuests.map(g => (
                    <div key={g.id} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color || '#cbd5e1' }} />
                      <span className="font-bold text-gray-700 truncate">{g.name}</span>
                      <span className="text-gray-400 mr-auto">({g.adults + g.children})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HallLayout;
