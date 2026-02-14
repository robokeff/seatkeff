
import React from 'react';
import { EventData, Guest, Table, GuestCategory } from '../types';
import GuestList from './GuestList';
import TableGrid from './TableGrid';
import HallLayout from './HallLayout';
import SettingsPanel from './SettingsPanel';

interface EventEditorProps {
  event: EventData;
  updateEvent: (event: EventData) => void;
  view: 'guests' | 'tables' | 'layout' | 'settings';
}

const EventEditor: React.FC<EventEditorProps> = ({ event, updateEvent, view }) => {
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest: Guest = { ...guest, id: crypto.randomUUID() };
    updateEvent({
      ...event,
      guests: [...event.guests, newGuest]
    });
  };

  const removeGuest = (id: string) => {
    updateEvent({
      ...event,
      guests: event.guests.filter(g => g.id !== id)
    });
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    updateEvent({
      ...event,
      guests: event.guests.map(g => g.id === id ? { ...g, ...updates } : g)
    });
  };

  const splitGuest = (originalId: string, splitData: { adults: number; children: number }) => {
    const originalGuest = event.guests.find(g => g.id === originalId);
    if (!originalGuest) return;

    const newGuest: Guest = {
      id: crypto.randomUUID(),
      name: `${originalGuest.name} (פיצול)`,
      category: originalGuest.category,
      adults: splitData.adults,
      children: splitData.children,
      tableId: null,
      confirmed: originalGuest.confirmed,
      phone: originalGuest.phone
    };

    const updatedGuests = event.guests.map(g => {
      if (g.id === originalId) {
        return {
          ...g,
          adults: g.adults - splitData.adults,
          children: g.children - splitData.children
        };
      }
      return g;
    });

    updateEvent({
      ...event,
      guests: [...updatedGuests, newGuest]
    });
  };

  const addTable = () => {
    const nextNum = event.tables.length > 0 ? Math.max(...event.tables.map(t => t.number)) + 1 : 1;
    const newTable: Table = {
      id: crypto.randomUUID(),
      number: nextNum,
      capacity: 10,
      position: { x: 50, y: 50 }
    };
    updateEvent({
      ...event,
      tables: [...event.tables, newTable]
    });
  };

  const removeTable = (id: string) => {
    const updatedGuests = event.guests.map(g => g.tableId === id ? { ...g, tableId: null } : g);
    updateEvent({
      ...event,
      guests: updatedGuests,
      tables: event.tables.filter(t => t.id !== id)
    });
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    updateEvent({
      ...event,
      tables: event.tables.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  return (
    <div className="animate-fadeIn">
      {view === 'guests' && (
        <GuestList 
          eventId={event.id}
          guests={event.guests} 
          tables={event.tables}
          eventName={event.name}
          eventVenue={event.venue}
          eventAddress={event.address}
          eventImageUrl={event.imageUrl}
          categories={event.categories}
          whatsappTemplate={event.whatsappTemplate}
          onAddGuest={addGuest} 
          onRemoveGuest={removeGuest}
          onUpdateGuest={updateGuest}
          onSplitGuest={splitGuest}
        />
      )}
      {view === 'tables' && (
        <TableGrid 
          tables={event.tables} 
          guests={event.guests}
          categories={event.categories}
          onAddTable={addTable}
          onRemoveTable={removeTable}
          onUpdateTable={updateTable}
          onAssignGuest={(guestId, tableId) => updateGuest(guestId, { tableId })}
        />
      )}
      {view === 'layout' && (
        <HallLayout 
          tables={event.tables}
          guests={event.guests}
          categories={event.categories}
          onUpdateTable={updateTable}
          onAssignGuest={(guestId, tableId) => updateGuest(guestId, { tableId })}
        />
      )}
      {view === 'settings' && (
        <SettingsPanel 
          event={event}
          onUpdateEvent={updateEvent}
        />
      )}
    </div>
  );
};

export default EventEditor;
