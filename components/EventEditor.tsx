
import React from 'react';
import { EventData, Guest, Table, HallElement, HallTemplate } from '../types';
import GuestList from './GuestList';
import TableGrid from './TableGrid';
import HallLayout from './HallLayout';
import SettingsPanel from './SettingsPanel';

interface EventEditorProps {
  event: EventData;
  updateEvent: (event: EventData) => void;
  view: 'guests' | 'tables' | 'layout' | 'settings';
  currentUser: string;
  allTemplates: HallTemplate[];
  onSaveTemplate: (template: HallTemplate) => void;
}

const EventEditor: React.FC<EventEditorProps> = ({ event, updateEvent, view, currentUser, allTemplates, onSaveTemplate }) => {

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    updateEvent({ ...event, guests: event.guests.map(g => g.id === id ? { ...g, ...updates } : g) });
  };

  const handleSplitGuest = (originalId: string, splitData: { adults: number; children: number }) => {
    const originalGuest = event.guests.find(g => g.id === originalId);
    if (!originalGuest) return;

    const remainingAdults = originalGuest.adults - splitData.adults;
    const remainingChildren = originalGuest.children - splitData.children;

    const newGuest: Guest = {
      ...originalGuest,
      id: crypto.randomUUID(),
      name: `${originalGuest.name} (פיצול)`,
      adults: splitData.adults,
      children: splitData.children,
      tableId: null 
    };

    updateEvent({
      ...event,
      guests: event.guests.map(g => 
        g.id === originalId 
          ? { ...g, adults: remainingAdults, children: remainingChildren } 
          : g
      ).concat(newGuest)
    });
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    updateEvent({ ...event, tables: event.tables.map(t => t.id === id ? { ...t, ...updates } : t) });
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    updateEvent({ ...event, tables: [...event.tables, { ...tableData, id: crypto.randomUUID() }] });
  };

  const removeTable = (id: string) => {
    updateEvent({ ...event, tables: event.tables.filter(t => t.id !== id), guests: event.guests.map(g => g.tableId === id ? { ...g, tableId: null } : g) });
  };

  const addElement = (el: HallElement) => {
    updateEvent({ ...event, elements: [...(event.elements || []), el] });
  };

  const updateElement = (id: string, updates: Partial<HallElement>) => {
    updateEvent({ ...event, elements: (event.elements || []).map(e => e.id === id ? { ...e, ...updates } : e) });
  };

  const removeElement = (id: string) => {
    updateEvent({ ...event, elements: (event.elements || []).filter(e => e.id !== id) });
  };

  const handleSaveAsTemplate = (name: string, width: number, height: number) => {
    const newTemplate: HallTemplate = {
      id: crypto.randomUUID(),
      name,
      createdBy: currentUser,
      tables: event.tables.map(({ id, ...rest }) => rest),
      elements: event.elements || [],
      width,
      height
    };
    onSaveTemplate(newTemplate);
  };

  const loadTemplate = (template: HallTemplate) => {
    const newTables = template.tables.map(t => ({ ...t, id: crypto.randomUUID() }));
    updateEvent({ 
      ...event, 
      tables: newTables, 
      elements: template.elements, 
      canvasWidth: template.width || 1000, 
      canvasHeight: template.height || 1000,
      guests: event.guests.map(g => ({ ...g, tableId: null })) 
    });
  };

  const updateDimensions = (width: number, height: number) => {
    updateEvent({ ...event, canvasWidth: width, canvasHeight: height });
  };

  return (
    <div className="animate-fadeIn h-full">
      {view === 'guests' && (
        <GuestList 
          eventId={event.id} 
          guests={event.guests} 
          tables={event.tables} 
          eventName={event.name} 
          eventVenue={event.venue} 
          eventDate={event.date}
          categories={event.categories} 
          seatingTemplate={event.seatingTemplate}
          onAddGuest={(g) => updateEvent({ ...event, guests: [...event.guests, { ...g, id: crypto.randomUUID() } as Guest] })} 
          onRemoveGuest={(id) => updateEvent({ ...event, guests: event.guests.filter(g => g.id !== id) })} 
          onUpdateGuest={updateGuest} 
          onSplitGuest={handleSplitGuest} 
        />
      )}
      {view === 'tables' && <TableGrid tables={event.tables} guests={event.guests} categories={event.categories} onAddTable={() => addTable({ number: event.tables.length + 1, capacity: 10, position: { x: 50, y: 50 }, type: 'round', rotation: 0 })} onRemoveTable={removeTable} onUpdateTable={updateTable} onAssignGuest={(guestId, tableId) => updateGuest(guestId, { tableId })} />}
      {view === 'layout' && (
        <HallLayout 
          eventName={event.name}
          tables={event.tables} 
          elements={event.elements || []} 
          guests={event.guests} 
          currentUser={currentUser} 
          canvasWidth={event.canvasWidth} 
          canvasHeight={event.canvasHeight} 
          onUpdateTable={updateTable} 
          onAddTable={addTable} 
          onAddElement={addElement} 
          onUpdateElement={updateElement} 
          onRemoveElement={removeElement} 
          onRemoveTable={removeTable} 
          onSaveTemplate={handleSaveAsTemplate} 
          onLoadTemplate={loadTemplate} 
          onUpdateDimensions={updateDimensions} 
          savedTemplates={allTemplates} 
        />
      )}
      {view === 'settings' && <SettingsPanel event={event} onUpdateEvent={updateEvent} />}
    </div>
  );
};

export default EventEditor;
