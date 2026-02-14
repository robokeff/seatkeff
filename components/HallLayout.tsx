
import React, { useState, useRef, useEffect } from 'react';
import { Table as TableType, Guest, HallElement, HallElementType, HallTemplate } from '../types';
import { 
  Image as ImageIcon, X, Layers, Users, Plus, RotateCw, Trash2, Save, Map as MapIcon,
  Music, Utensils, Beer, DoorOpen, Trees, Square, Layout, Settings, Maximize2, Move, Disc
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface HallLayoutProps {
  tables: TableType[];
  elements: HallElement[];
  guests: Guest[];
  currentUser: string;
  onUpdateTable: (id: string, updates: Partial<TableType>) => void;
  onAddTable: (table: Omit<TableType, 'id'>) => void;
  onAddElement: (element: HallElement) => void;
  onUpdateElement: (id: string, updates: Partial<HallElement>) => void;
  onRemoveElement: (id: string) => void;
  onRemoveTable: (id: string) => void;
  onSaveTemplate: (name: string) => void;
  onLoadTemplate: (template: HallTemplate) => void;
  savedTemplates: HallTemplate[];
}

const ELEMENT_ICONS: Record<HallElementType, any> = {
  stage: Music,
  dance_floor: Disc,
  bar: Beer,
  buffet: Utensils,
  entrance: DoorOpen,
  dj: Music,
  wall: Square,
  plant: Trees
};

const ELEMENT_NAMES: Record<HallElementType, string> = {
  stage: 'במה',
  dance_floor: 'רחבת ריקודים',
  bar: 'בר אלכוהול',
  buffet: 'מזנונים/בופה',
  entrance: 'כניסה לאולם',
  dj: 'עמדת DJ',
  wall: 'קיר/מחיצה',
  plant: 'צמחייה/עיצוב'
};

const HallLayout: React.FC<HallLayoutProps> = ({ 
  tables, elements = [], guests, currentUser,
  onUpdateTable, onAddTable, onAddElement, onUpdateElement, onRemoveElement, onRemoveTable,
  onSaveTemplate, onLoadTemplate, savedTemplates 
}) => {
  const [draggingId, setDraggingId] = useState<{id: string, type: 'table' | 'element'} | null>(null);
  const [selectedId, setSelectedId] = useState<{id: string, type: 'table' | 'element'} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const CANVAS_SIZE = 1500;

  const handleMouseDown = (id: string, type: 'table' | 'element', e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.controls-panel')) return;
    setDraggingId({ id, type });
    setSelectedId({ id, type });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - 50) / 10) * 10;
    const y = Math.round((e.clientY - rect.top - 50) / 10) * 10;
    
    const boundedX = Math.max(0, Math.min(x, CANVAS_SIZE - 100));
    const boundedY = Math.max(0, Math.min(y, CANVAS_SIZE - 100));

    if (draggingId.type === 'table') {
      onUpdateTable(draggingId.id, { position: { x: boundedX, y: boundedY } });
    } else {
      onUpdateElement(draggingId.id, { position: { x: boundedX, y: boundedY } });
    }
  };

  const addNewElement = (type: HallElementType) => {
    const newEl: HallElement = {
      id: crypto.randomUUID(),
      type,
      label: ELEMENT_NAMES[type],
      position: { x: 700, y: 700 },
      size: { width: 150, height: 100 },
      rotation: 0
    };
    onAddElement(newEl);
    setSelectedId({ id: newEl.id, type: 'element' });
  };

  const addNewTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    onAddTable({
      number: nextNum,
      capacity: 10,
      position: { x: 750, y: 750 },
      type: 'round',
      rotation: 0
    });
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

  const exportAsImage = async () => {
    if (!canvasRef.current) return;
    setSelectedId(null);
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 800));
    try {
      const canvas = await html2canvas(canvasRef.current, { 
        scale: 1, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: CANVAS_SIZE,
        height: CANVAS_SIZE
      });
      const link = document.createElement('a');
      link.download = `סקיצה_אולם_${new Date().toLocaleDateString('he-IL')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const upListener = () => setDraggingId(null);
    window.addEventListener('mouseup', upListener);
    return () => window.removeEventListener('mouseup', upListener);
  }, []);

  const selectedElement = selectedId?.type === 'element' ? elements.find(e => e.id === selectedId.id) : null;
  const selectedTable = selectedId?.type === 'table' ? tables.find(t => t.id === selectedId.id) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] font-['Assistant'] relative overflow-hidden" dir="rtl">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-50">
        <div>
          <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-2">
            <MapIcon className="text-indigo-600" /> מעבדת עיצוב אולם Pro
          </h2>
          <p className="text-gray-400 text-xs font-bold">תכנון ועיצוב אולם במידות 1500x1500px מבית רובוכיף</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTemplateModal(true)} className="bg-indigo-50 text-indigo-600 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-indigo-100 transition-all">
            <Layout size={16} /> תבניות
          </button>
          <button onClick={exportAsImage} className="bg-indigo-600 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <ImageIcon size={16} /> ייצוא תמונה
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox Sidebar - Hebrew Names & Icons */}
        <aside className="w-24 md:w-32 bg-white border-l border-gray-100 p-2 md:p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar shrink-0 z-40">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-1">אלמנטים</p>
          <ToolButton icon={Layout} label="שולחן" color="indigo" onClick={addNewTable} />
          <div className="h-px bg-gray-100 my-1" />
          <ToolButton icon={Music} label="במה" onClick={() => addNewElement('stage')} />
          <ToolButton icon={Disc} label="רחבה" onClick={() => addNewElement('dance_floor')} />
          <ToolButton icon={Beer} label="בר" onClick={() => addNewElement('bar')} />
          <ToolButton icon={Utensils} label="בופה" onClick={() => addNewElement('buffet')} />
          <ToolButton icon={DoorOpen} label="כניסה" onClick={() => addNewElement('entrance')} />
          <ToolButton icon={Trees} label="צמחייה" onClick={() => addNewElement('plant')} />
          <ToolButton icon={Square} label="קיר" onClick={() => addNewElement('wall')} />
        </aside>

        {/* Canvas Area with Internal Scrolling */}
        <main 
          ref={containerRef}
          className="flex-1 bg-gray-100 overflow-auto p-8 custom-scrollbar relative z-10"
        >
          <div 
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="bg-white shadow-2xl relative mx-auto border-4 border-dashed border-gray-200 cursor-default"
            style={{ 
              width: CANVAS_SIZE, 
              height: CANVAS_SIZE,
              backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)', 
              backgroundSize: '40px 40px' 
            }}
          >
            {/* Design Watermark */}
            <div className="absolute top-10 left-10 text-gray-100 font-black text-6xl select-none pointer-events-none opacity-20 uppercase tracking-tighter">
              Robokeff Lab 1.5K
            </div>

            {/* Render Custom Elements */}
            {elements.map((el) => {
              const Icon = ELEMENT_ICONS[el.type] || Square;
              const isSelected = selectedId?.id === el.id;
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(el.id, 'element', e)}
                  className={`absolute flex flex-col items-center justify-center rounded-2xl border-4 transition-all group ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-2xl z-30 scale-105 cursor-grabbing' : 'border-gray-100 bg-gray-50/50 z-10 hover:border-indigo-200 cursor-grab'}`}
                  style={{ 
                    left: el.position.x, 
                    top: el.position.y, 
                    width: el.size.width, 
                    height: el.size.height, 
                    transform: `rotate(${el.rotation || 0}deg)` 
                  }}
                >
                  <Icon className={`${isSelected ? 'text-indigo-600' : 'text-gray-300'}`} size={Math.min(el.size.width, el.size.height) * 0.4} />
                  <span className="text-[10px] font-black text-indigo-950 mt-2 px-2 text-center break-words select-none">{el.label}</span>
                </div>
              );
            })}

            {/* Render Tables with Number */}
            {tables.map((table) => {
              const occupied = guests.filter(g => g.tableId === table.id).reduce((s, g) => s + g.adults + g.children, 0);
              const isFull = occupied >= table.capacity;
              const isSelected = selectedId?.id === table.id;
              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => handleMouseDown(table.id, 'table', e)}
                  className={`absolute cursor-grab active:cursor-grabbing transition-all ${isSelected ? 'z-40' : 'z-20'}`}
                  style={{ left: table.position.x, top: table.position.y, transform: `rotate(${table.rotation || 0}deg)` }}
                >
                  <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center p-3 text-center shadow-lg transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-8 ring-indigo-100/30 scale-110' : (isFull ? 'bg-indigo-900 border-indigo-700 text-white' : 'bg-white border-indigo-100 hover:border-indigo-300')}`}>
                    <span className="text-xl font-black select-none">#{table.number}</span>
                    <span className="text-[9px] font-bold opacity-60 uppercase select-none">{occupied}/{table.capacity} איש</span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Floating Controls Panel (Selected Item) */}
        {(selectedElement || selectedTable) && !isExporting && (
          <div className="absolute top-6 left-6 w-72 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-indigo-50 p-6 z-[100] animate-fadeIn controls-panel">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                <Settings size={16} className="text-indigo-600" /> עריכת {selectedElement ? 'אלמנט' : 'שולחן'}
              </h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {selectedElement && (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">שם האלמנט</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={selectedElement.label}
                      onChange={(e) => onUpdateElement(selectedElement.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">רוחב (px)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none"
                        value={selectedElement.size.width}
                        onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, width: parseInt(e.target.value) || 0 } })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">אורך (px)</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none"
                        value={selectedElement.size.height}
                        onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, height: parseInt(e.target.value) || 0 } })}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedTable && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">מספר שולחן</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none"
                        value={selectedTable.number}
                        onChange={(e) => onUpdateTable(selectedTable.id, { number: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">קיבולת</label>
                      <input 
                        type="number" 
                        className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none"
                        value={selectedTable.capacity}
                        onChange={(e) => onUpdateTable(selectedTable.id, { capacity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => rotateItem(selectedId!.id, selectedId!.type)}
                  className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all"
                >
                  <RotateCw size={14} /> סובב 45°
                </button>
                <button 
                  onClick={() => {
                    if (selectedId?.type === 'element') onRemoveElement(selectedId.id);
                    else onRemoveTable(selectedId!.id);
                    setSelectedId(null);
                  }}
                  className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={14} /> מחק
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-8 shadow-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-3">
                <Layout className="text-indigo-600" /> ניהול תבניות אולם
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-300 hover:text-red-500 transition-all"><X size={28} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mr-1">שמור סקיצה חדשה</h3>
                <input 
                  type="text" placeholder="שם האולם (למשל: לאגו - אולם א')" 
                  className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold"
                  value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                />
                <button 
                  onClick={() => { onSaveTemplate(templateName); setTemplateName(''); }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> שמור תבנית
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mr-1">טען מהספרייה</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {savedTemplates.map(t => (
                    <button 
                      key={t.id} onClick={() => { onLoadTemplate(t); setShowTemplateModal(false); }}
                      className="w-full text-right p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 transition-all group flex justify-between items-center"
                    >
                      <div className="overflow-hidden">
                        <p className="font-black text-indigo-950 truncate">{t.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">ע"י {t.createdBy}</p>
                      </div>
                      <Plus size={18} className="text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                    </button>
                  ))}
                  {savedTemplates.length === 0 && <p className="text-center py-10 text-gray-300 font-bold italic">טרם נשמרו תבניות</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding Overlay */}
      <div className="absolute bottom-6 right-6 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-50 pointer-events-none">
        <p className="text-[10px] font-black text-indigo-900 opacity-40 uppercase tracking-widest">Robokeff Software Lab &copy; 2024</p>
      </div>
    </div>
  );
};

const ToolButton = ({ icon: Icon, label, color = "gray", onClick }: { icon: any, label: string, color?: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full aspect-square rounded-2xl transition-all group shrink-0 shadow-sm border ${color === 'indigo' ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' : 'bg-white text-gray-400 border-gray-50 hover:border-indigo-200 hover:text-indigo-600'}`}
  >
    <Icon size={20} />
    <span className="text-[9px] font-black mt-1 text-center leading-tight select-none">{label}</span>
  </button>
);

export default HallLayout;
