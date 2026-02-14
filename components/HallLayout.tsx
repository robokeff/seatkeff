
import React, { useState, useRef, useEffect } from 'react';
import { Table, Guest } from '../types';
import { Image as ImageIcon, Search, UserPlus, X, MousePointer2, Layers, Info, Users, User, Baby, ClipboardList } from 'lucide-react';
import html2canvas from 'html2canvas';

interface HallLayoutProps {
  tables: Table[];
  guests: Guest[];
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'משפחת החתן': 'bg-blue-500',
  'משפחת הכלה': 'bg-pink-500',
  'חברי החתן': 'bg-indigo-500',
  'חברי הכלה': 'bg-rose-500',
  'חברים משותפים': 'bg-green-500',
  'משפחה משותפת': 'bg-purple-500',
};

const getCategoryBgColor = (category: string) => {
  return CATEGORY_COLORS[category] || 'bg-amber-500';
};

const HallLayout: React.FC<HallLayoutProps> = ({ tables, guests, onUpdateTable, onAssignGuest }) => {
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
    
    // Give time for UI to hide controls
    await new Promise(r => setTimeout(r, 600));
    
    try {
      const element = exportWrapperRef.current!;
      const canvas = await html2canvas(element, {
        backgroundColor: '#f9fafb',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const link = document.createElement('a');
      link.download = `סקיצה_וסיכום_הושבה_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.png`;
      link.href = canvas.toDataURL('image/png', 0.9);
      link.click();
    } catch (error) {
      console.error('Export failed', error);
      alert('הייצוא נכשל. נסה לצלם מסך או להשתמש בדפדפן אחר.');
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
    <div ref={exportWrapperRef} className={`flex flex-col gap-8 pb-20 font-['Assistant'] bg-gray-50 ${isExporting ? 'p-10 w-[1200px]' : ''}`}>
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-indigo-950">סקיצת אולם אינטראקטיבית</h2>
          <p className="text-gray-500 font-medium text-sm">המידע נשמר אוטומטית. ניתן להוריד סקיצה מלאה כקובץ תמונה.</p>
        </div>
        {!isExporting && (
          <button
            onClick={exportAsImage}
            disabled={isExporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <ImageIcon size={20} />}
            {isExporting ? 'מעבד תמונה...' : 'הורד סקיצה מלאה (PNG)'}
          </button>
        )}
      </header>

      <div className={`flex gap-6 relative ${isExporting ? 'h-auto min-h-[900px]' : 'h-[calc(100vh-280px)] min-h-[600px]'}`}>
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className={`flex-1 bg-white rounded-[4rem] border-4 border-dashed border-gray-100 relative overflow-hidden shadow-inner select-none ${isExporting ? 'border-transparent rounded-none shadow-none min-h-[900px]' : ''}`}
          style={{ backgroundImage: isExporting ? 'none' : 'radial-gradient(#e5e7eb 1.2px, transparent 1.2px)', backgroundSize: '40px 40px' }}
        >
          {tables.map((table) => {
            const tableGuests = guests.filter(g => g.tableId === table.id);
            const occupied = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
            const isFull = occupied >= table.capacity;
            const isSelected = selectedTableId === table.id;
            const pos = table.position || { x: 100, y: 100 };
            
            const baseSize = 130;
            const extraSize = Math.max(0, (table.capacity - 10) * 5);
            const size = baseSize + extraSize;

            const seatCategories: string[] = [];
            tableGuests.forEach(g => {
              const count = (g.adults || 0) + (g.children || 0);
              for (let i = 0; i < count; i++) {
                seatCategories.push(g.category);
              }
            });

            return (
              <div
                key={table.id}
                onMouseDown={(e) => !isExporting && handleMouseDown(table.id, e)}
                className={`absolute transition-all ${draggingId === table.id ? 'z-50' : 'z-10'}`}
                style={{ left: pos.x, top: pos.y, width: size, height: size }}
              >
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: table.capacity }).map((_, i) => {
                    const angle = (i / table.capacity) * 2 * Math.PI;
                    const radius = size / 2 + 15;
                    const x = size / 2 + radius * Math.cos(angle) - 6;
                    const y = size / 2 + radius * Math.sin(angle) - 6;
                    const category = seatCategories[i];
                    
                    return (
                      <div 
                        key={i}
                        className={`absolute w-3 h-3 rounded-full border shadow-sm transition-colors ${
                          category ? `${getCategoryBgColor(category)} border-white` : 'bg-white border-gray-200'
                        }`}
                        style={{ left: x, top: y }}
                      />
                    );
                  })}
                </div>

                <div 
                  className={`w-full h-full rounded-full border-4 flex flex-col items-center justify-center p-3 text-center shadow-lg transition-all ${
                    isSelected ? 'border-pink-500 bg-pink-50 ring-8 ring-pink-100/50' : (isFull ? 'bg-indigo-900 border-indigo-700' : 'bg-white border-indigo-100')
                  }`}
                >
                  <span className={`text-2xl font-black mb-1 leading-none ${isFull && !isSelected ? 'text-white' : 'text-indigo-950'} ${isSelected ? 'text-pink-600' : ''}`}>
                    #{table.number}
                  </span>
                  
                  <div className={`flex flex-wrap justify-center gap-x-1 gap-y-0 px-2 leading-tight text-[8px] font-bold ${isFull && !isSelected ? 'text-indigo-200' : 'text-gray-500'} ${isSelected ? 'text-pink-500' : ''}`}>
                    {tableGuests.map((g, i) => (
                      <span key={g.id}>{g.name}{i < tableGuests.length - 1 ? ',' : ''}</span>
                    ))}
                    {tableGuests.length === 0 && <span className="opacity-30 italic">פנוי</span>}
                  </div>
                  
                  <div className={`mt-2 text-[10px] font-black ${isFull && !isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                    {occupied} / {table.capacity}
                  </div>
                </div>

                {!isExporting && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedTableId(isSelected ? null : table.id); }}
                    className={`absolute -top-3 -right-3 p-2 rounded-full shadow-lg border-2 transition-all active:scale-90 ${isSelected ? 'bg-pink-500 border-white text-white' : 'bg-white border-gray-100 text-gray-400 hover:text-indigo-600'}`}
                  >
                    <MousePointer2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!isExporting && selectedTableId && (
          <div className="w-80 bg-white rounded-[3rem] shadow-2xl border border-pink-100 flex flex-col p-8 animate-slideInRight z-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-indigo-950">שולחן #{selectedTable?.number}</h3>
              <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="relative mb-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" placeholder="חפש אורח..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {unassignedGuests.map(g => (
                <button
                  key={g.id}
                  onClick={() => onAssignGuest(g.id, selectedTableId)}
                  className="w-full text-right p-4 rounded-2xl bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-200 transition-all flex flex-col"
                >
                  <span className="font-black text-indigo-950 text-sm">{g.name}</span>
                  <span className="text-[10px] font-bold text-gray-400">{g.category} • {g.adults + g.children} נפשות</span>
                </button>
              ))}
              {unassignedGuests.length === 0 && <p className="text-center text-gray-300 font-bold py-10">אין אורחים לא משובצים</p>}
            </div>
          </div>
        )}
      </div>

      <section className={`bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 mt-4 animate-fadeIn ${isExporting ? 'shadow-none border-gray-200' : ''}`}>
        <header className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <ClipboardList size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-indigo-950">טבלת פירוט הושבה מרוכזת</h3>
            <p className="text-gray-400 font-bold text-sm">רשימה מלאה של כל האורחים לפי מספרי שולחן</p>
          </div>
        </header>

        <div className={`grid gap-6 ${isExporting ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {sortedTables.map(table => {
            const tableGuests = guests.filter(g => g.tableId === table.id);
            const occupied = tableGuests.reduce((sum, g) => sum + g.adults + g.children, 0);
            return (
              <div key={`table-summary-${table.id}`} className={`bg-gray-50 rounded-3xl p-5 border border-gray-100 transition-all ${isExporting ? 'bg-white border-gray-200' : 'hover:bg-white hover:shadow-xl'}`}>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                      {table.number}
                    </span>
                    <span className="font-black text-indigo-950">שולחן</span>
                  </div>
                  <span className={`text-xs font-black ${occupied >= table.capacity ? 'text-red-500' : 'text-indigo-400'}`}>
                    {occupied} / {table.capacity}
                  </span>
                </div>
                <div className="space-y-2">
                  {tableGuests.length > 0 ? tableGuests.map(g => (
                    <div key={`row-${g.id}`} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoryBgColor(g.category)}`} />
                        <span className="font-bold text-gray-700">{g.name}</span>
                      </div>
                      <span className="text-gray-400 font-medium">({g.adults + g.children})</span>
                    </div>
                  )) : (
                    <p className="text-center py-2 text-gray-300 italic text-[10px]">שולחן ריק</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className={`mt-10 pt-10 border-t border-gray-100 text-center ${isExporting ? '' : 'hidden'}`}>
        <p className="text-gray-300 font-black text-lg">נוצר באהבה באמצעות "יושבים בכיף"</p>
        <p className="text-gray-200 text-xs">www.seat-pro.app</p>
      </footer>
    </div>
  );
};

export default HallLayout;
