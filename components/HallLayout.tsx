
import React, { useState, useRef, useEffect } from 'react';
import { Table as TableType, Guest, HallElement, HallElementType, HallTemplate } from '../types';
import { 
  Image as ImageIcon, X, Plus, RotateCw, Trash2, Save, Map as MapIcon,
  Music, Utensils, Beer, DoorOpen, Trees, Square, Layout, Settings, Disc, Palette, MoveHorizontal, Maximize, Ruler, Download, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface HallLayoutProps {
  eventName: string;
  tables: TableType[];
  elements: HallElement[];
  guests: Guest[];
  currentUser: string;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateTable: (id: string, updates: Partial<TableType>) => void;
  onAddTable: (table: Omit<TableType, 'id'>) => void;
  onAddElement: (element: HallElement) => void;
  onUpdateElement: (id: string, updates: Partial<HallElement>) => void;
  onRemoveElement: (id: string) => void;
  onRemoveTable: (id: string) => void;
  onSaveTemplate: (name: string, width: number, height: number) => void;
  onLoadTemplate: (template: HallTemplate) => void;
  onUpdateDimensions: (width: number, height: number) => void;
  savedTemplates: HallTemplate[];
}

const ELEMENT_ICONS: Record<HallElementType, any> = {
  stage: Music, dance_floor: Disc, bar: Beer, buffet: Utensils, entrance: DoorOpen, dj: Music, wall: Square, plant: Trees
};

const ELEMENT_NAMES: Record<HallElementType, string> = {
  stage: 'במה', dance_floor: 'רחבת ריקודים', bar: 'בר', buffet: 'בופה', entrance: 'כניסה', dj: 'DJ', wall: 'קיר', plant: 'צמחייה'
};

const COLORS = [
  { name: 'לבן', val: '#ffffff' }, { name: 'אינדיגו', val: '#4f46e5' }, { name: 'פינק', val: '#ec4899' },
  { name: 'אמבר', val: '#f59e0b' }, { name: 'אמרלד', val: '#10b981' }, { name: 'סקיי', val: '#0ea5e9' },
  { name: 'סלייט', val: '#64748b' }, { name: 'שחור', val: '#1e293b' },
];

const HallLayout: React.FC<HallLayoutProps> = ({ 
  eventName, tables, elements = [], guests, canvasWidth = 1000, canvasHeight = 1000,
  onUpdateTable, onAddTable, onAddElement, onUpdateElement, onRemoveElement, onRemoveTable,
  onSaveTemplate, onLoadTemplate, onUpdateDimensions, savedTemplates 
}) => {
  const [draggingId, setDraggingId] = useState<{id: string, type: 'table' | 'element'} | null>(null);
  const [selectedId, setSelectedId] = useState<{id: string, type: 'table' | 'element'} | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((clientX - rect.left - 50) / 10) * 10;
    const y = Math.round((clientY - rect.top - 50) / 10) * 10;
    onUpdateItemPosition(draggingId.id, draggingId.type, { x, y });
  };

  const handleMouseDown = (id: string, type: 'table' | 'element', e: React.MouseEvent) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest('.controls-panel')) return;
    setDraggingId({ id, type });
    setSelectedId({ id, type });
  };

  const handleTouchStart = (id: string, type: 'table' | 'element', e: React.TouchEvent) => {
    e.stopPropagation();
    setDraggingId({ id, type });
    setSelectedId({ id, type });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) updatePosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingId) {
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const onUpdateItemPosition = (id: string, type: 'table' | 'element', pos: {x: number, y: number}) => {
    const boundedX = Math.max(0, Math.min(pos.x, canvasWidth - 100));
    const boundedY = Math.max(0, Math.min(pos.y, canvasHeight - 100));
    if (type === 'table') onUpdateTable(id, { position: { x: boundedX, y: boundedY } });
    else onUpdateElement(id, { position: { x: boundedX, y: boundedY } });
  };

  const addNewTable = (type: 'round' | 'square') => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    onAddTable({ number: nextNum, capacity: 10, position: { x: canvasWidth/2, y: canvasHeight/2 }, type, rotation: 0, color: '#ffffff' });
  };

  const rotateItem = (id: string, type: 'table' | 'element') => {
    if (type === 'table') {
      const t = tables.find(x => x.id === id);
      onUpdateTable(id, { rotation: ((t?.rotation || 0) + 45) % 360 });
    } else {
      const e = elements.find(x => x.id === id);
      onUpdateElement(id, { rotation: ((e?.rotation || 0) + 45) % 360 });
    }
  };

  const handleDownloadImage = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    setSelectedId(null); // נקה בחירה לסקיצה נקייה יותר

    // המתנה קלה כדי ש-State הבחירה יתנקה ב-DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2, // איכות גבוהה יותר
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      const dateStr = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      link.download = `סקיצת-אולם-${eventName}-${dateStr}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed', error);
      alert('נכשל בייצוא התמונה. אנא נסה שנית.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedElement = selectedId?.type === 'element' ? elements.find(e => e.id === selectedId.id) : null;
  const selectedTable = selectedId?.type === 'table' ? tables.find(t => t.id === selectedId.id) : null;

  useEffect(() => {
    const stopDragging = () => setDraggingId(null);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
    return () => {
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };
  }, []);

  const TableItem = ({ table, isSelected, guests, onMouseDown, onTouchStart }: { table: TableType, isSelected: boolean, guests: Guest[], onMouseDown: any, onTouchStart: any }) => {
    const tableGuests = guests.filter(g => g.tableId === table.id);
    const occupied = tableGuests.reduce((s, g) => s + g.adults + g.children, 0);
    const [isUpdating, setIsUpdating] = useState(false);
    const prevOccupied = useRef(occupied);

    useEffect(() => {
      if (prevOccupied.current !== occupied) {
        setIsUpdating(true);
        const timer = setTimeout(() => setIsUpdating(false), 600);
        prevOccupied.current = occupied;
        return () => clearTimeout(timer);
      }
    }, [occupied]);

    const chairs = [];
    const radius = 65;
    let currentSlot = 0;
    tableGuests.forEach(guest => {
      const guestSeats = guest.adults + guest.children;
      for(let i=0; i<guestSeats; i++) {
         if (currentSlot >= table.capacity) break;
         const angle = (currentSlot / table.capacity) * 2 * Math.PI;
         chairs.push({
           x: 50 + radius * Math.cos(angle),
           y: 50 + radius * Math.sin(angle),
           color: guest.color
         });
         currentSlot++;
      }
    });

    for (let i = currentSlot; i < table.capacity; i++) {
       const angle = (i / table.capacity) * 2 * Math.PI;
       chairs.push({
         x: 50 + radius * Math.cos(angle),
         y: 50 + radius * Math.sin(angle),
         color: '#e2e8f0'
       });
    }

    return (
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className={`absolute transition-all touch-none select-none cursor-move z-20 ${isSelected ? 'animate-tableBounce' : ''} ${isUpdating ? 'animate-dataUpdate' : ''}`}
        style={{ left: table.position.x, top: table.position.y, width: 100, height: 100, transform: `rotate(${table.rotation || 0}deg)` }}
      >
        {chairs.map((chair, i) => (
          <div key={i} className="absolute w-4 h-4 rounded-full border border-white shadow-sm"
            style={{ 
              left: chair.x - 8, 
              top: chair.y - 8, 
              backgroundColor: chair.color,
              zIndex: -1
            }}
          />
        ))}
        
        <div className={`w-full h-full flex flex-col items-center justify-center border-4 shadow-md ${table.type === 'round' ? 'rounded-full' : 'rounded-2xl'} ${isSelected ? 'border-indigo-600 ring-8 ring-indigo-50 scale-110' : 'border-indigo-50'}`}
          style={{ backgroundColor: table.color || '#ffffff' }}
        >
          {table.name ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black leading-none mb-0.5">#{table.number}</span>
              <span className="text-[11px] font-black text-center px-2 leading-tight overflow-hidden text-ellipsis line-clamp-2">{table.name}</span>
            </div>
          ) : (
            <span className="text-2xl font-black">#{table.number}</span>
          )}
          <span className="text-[8px] font-bold text-gray-400 mt-0.5">{occupied}/{table.capacity}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Assistant'] relative overflow-hidden" dir="rtl">
      {isExporting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[250] flex flex-col items-center justify-center animate-fadeIn">
          <Loader2 className="text-indigo-600 animate-spin mb-4" size={48} />
          <p className="text-xl font-black text-indigo-950">מייצא סקיצת אולם...</p>
        </div>
      )}

      <header className="bg-white border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-2"><MapIcon className="text-indigo-600" /> מעבדת עיצוב אולם</h2>
            <p className="text-gray-400 text-xs font-bold">סקיצת הושבה חיה בצבעי אורחים</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
             <Ruler size={14} className="text-indigo-400" />
             <input type="number" className="w-16 bg-transparent text-xs font-black text-center" value={canvasWidth} onChange={e => onUpdateDimensions(parseInt(e.target.value) || 100, canvasHeight)} />
             <span className="text-[10px] text-gray-300 font-bold">X</span>
             <input type="number" className="w-16 bg-transparent text-xs font-black text-center" value={canvasHeight} onChange={e => onUpdateDimensions(canvasWidth, parseInt(e.target.value) || 100)} />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadImage}
            className="bg-green-50 text-green-600 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-green-100 transition-all border border-green-100 shadow-sm"
          >
            <Download size={16} /> הורד JPG
          </button>
          <button onClick={() => setShowTemplateModal(true)} className="bg-indigo-50 text-indigo-600 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm">
            <Layout size={16} /> תבניות
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-24 md:w-32 bg-white border-l border-gray-100 p-2 md:p-4 flex flex-col gap-3 overflow-y-auto shrink-0 z-40">
          <ToolButton icon={Layout} label="עגול" color="indigo" onClick={() => addNewTable('round')} />
          <ToolButton icon={Square} label="ריבוע" color="indigo" onClick={() => addNewTable('square')} />
          <div className="h-px bg-gray-100 my-1" />
          {Object.entries(ELEMENT_NAMES).map(([type, name]) => (
            <ToolButton key={type} icon={ELEMENT_ICONS[type as HallElementType]} label={name} onClick={() => onAddElement({ id: crypto.randomUUID(), type: type as HallElementType, label: name, position: { x: canvasWidth/2, y: canvasHeight/2 }, size: type === 'wall' ? { width: 300, height: 10 } : { width: 150, height: 100 }, rotation: 0, color: '#f8fafc' })} />
          ))}
        </aside>

        <main className="flex-1 bg-gray-100 overflow-auto p-8 relative z-10 custom-scrollbar">
          <div 
            ref={canvasRef} 
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="bg-white shadow-2xl relative mx-auto border-4 border-dashed border-gray-200 touch-none"
            style={{ width: canvasWidth, height: canvasHeight, backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}
          >
            {elements.map((el) => {
              const Icon = ELEMENT_ICONS[el.type];
              const isSelected = selectedId?.id === el.id;
              return (
                <div key={el.id} 
                  onMouseDown={(e) => handleMouseDown(el.id, 'element', e)}
                  onTouchStart={(e) => handleTouchStart(el.id, 'element', e)}
                  className={`absolute flex flex-col items-center justify-center border-4 transition-all touch-none select-none cursor-move ${isSelected ? 'border-indigo-600 z-30 ring-4 ring-indigo-50 scale-105' : 'border-transparent z-10 hover:border-indigo-100'}`}
                  style={{ left: el.position.x, top: el.position.y, width: el.size.width, height: el.size.height, transform: `rotate(${el.rotation || 0}deg)`, backgroundColor: el.color || '#f8fafc', borderRadius: el.type === 'wall' ? '0px' : '20px' }}
                >
                  {el.type !== 'wall' && <><Icon size={Math.min(el.size.width, el.size.height) * 0.4} className="text-indigo-400" /><span className="text-[10px] font-black mt-1 px-1 text-center">{el.label}</span></>}
                </div>
              );
            })}

            {tables.map((table) => (
              <TableItem 
                key={table.id}
                table={table}
                isSelected={selectedId?.id === table.id && selectedId?.type === 'table'}
                guests={guests}
                onMouseDown={(e: any) => handleMouseDown(table.id, 'table', e)}
                onTouchStart={(e: any) => handleTouchStart(table.id, 'table', e)}
              />
            ))}
          </div>
        </main>

        {(selectedElement || selectedTable) && (
          <div className="absolute top-6 left-6 w-72 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-6 z-[100] controls-panel animate-fadeIn text-right">
            <div className="flex justify-between mb-6">
              <h3 className="font-black text-indigo-950 flex items-center gap-2"><Palette size={16} /> מאפייני פריט</h3>
              <button onClick={() => setSelectedId(null)}><X className="text-gray-300 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase">צבע</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLORS.map(c => (
                    <button key={c.val} onClick={() => selectedElement ? onUpdateElement(selectedElement.id, { color: c.val }) : onUpdateTable(selectedTable!.id, { color: c.val })}
                      className={`w-full aspect-square rounded-full border-2 ${ (selectedElement?.color === c.val || selectedTable?.color === c.val) ? 'border-indigo-600' : 'border-transparent'}`}
                      style={{ backgroundColor: c.val }} />
                  ))}
                </div>
              </div>

              {selectedElement && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black text-gray-400">רוחב</label>
                    <input type="number" className="w-full bg-gray-50 p-2 rounded-xl font-bold" value={selectedElement.size.width} onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, width: parseInt(e.target.value) || 1 } })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400">גובה</label>
                    <input type="number" className="w-full bg-gray-50 p-2 rounded-xl font-bold" value={selectedElement.size.height} onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, height: parseInt(e.target.value) || 1 } })} />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => rotateItem(selectedId!.id, selectedId!.type)} className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-xs">סובב 45°</button>
                <button onClick={() => { if (selectedId?.type === 'element') onRemoveElement(selectedId.id); else onRemoveTable(selectedId!.id); setSelectedId(null); }} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-black text-xs">מחק</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl animate-slideUp overflow-y-auto max-h-[80vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-indigo-900">ניהול תבניות אולם</h2>
              <button onClick={() => setShowTemplateModal(false)}><X size={24} className="text-gray-300 hover:text-red-500" /></button>
            </div>
            
            <div className="mb-10 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <h3 className="font-black text-indigo-950 mb-4">שמור סקיצה נוכחית כתבנית</h3>
              <div className="flex gap-3">
                <input type="text" placeholder="שם לתבנית..." className="flex-1 px-5 py-3 rounded-2xl bg-white border-2 border-transparent focus:border-indigo-500 outline-none font-bold shadow-sm" value={templateName} onChange={e => setTemplateName(e.target.value)} />
                <button onClick={() => { if(templateName.trim()){ onSaveTemplate(templateName, canvasWidth, canvasHeight); setTemplateName(''); } }} className="bg-indigo-600 text-white px-8 rounded-2xl font-black shadow-lg">שמור</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedTemplates.map(t => (
                <div key={t.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center group">
                  <div>
                    <h4 className="font-black text-indigo-900">{t.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{t.tables.length} שולחנות • {t.width}x{t.height}</p>
                  </div>
                  <button onClick={() => { onLoadTemplate(t); setShowTemplateModal(false); }} className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-indigo-600 hover:text-white transition-all">טען</button>
                </div>
              ))}
              {savedTemplates.length === 0 && <p className="col-span-2 text-center py-10 text-gray-300 font-bold italic">אין תבניות שמורות עדיין</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolButton = ({ icon: Icon, label, color = "gray", onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center aspect-square rounded-2xl border ${color === 'indigo' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-400 border-gray-100 hover:text-indigo-600'}`}>
    <Icon size={18} />
    <span className="text-[8px] font-black mt-1 leading-none">{label}</span>
  </button>
);

export default HallLayout;
