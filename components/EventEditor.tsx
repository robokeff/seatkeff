
import React, { useState, useEffect } from 'react';
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
}

const USERS_DB_KEY = 'users_db_v3';

const EventEditor: React.FC<EventEditorProps> = ({ event, updateEvent, view, currentUser }) => {
  const [savedTemplates, setSavedTemplates] = useState<HallTemplate[]>([]);

  useEffect(() => {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const allTemplates: HallTemplate[] = [];
      Object.values(users).forEach((u: any) => {
        if (u.hallTemplates) allTemplates.push(...u.hallTemplates);
      });
      setSavedTemplates(allTemplates);
    }
  }, []);

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    updateEvent({
      ...event,
      guests: event.guests.map(g => g.id === id ? { ...g, ...updates } : g)
    });
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    updateEvent({
      ...event,
      tables: event.tables.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    updateEvent({
      ...event,
      tables: [...event.tables, { ...tableData, id: crypto.randomUUID() }]
    });
  };

  const removeTable = (id: string) => {
    updateEvent({
      ...event,
      tables: event.tables.filter(t => t.id !== id),
      guests: event.guests.map(g => g.tableId === id ? { ...g, tableId: null } : g)
    });
  };

  const addElement = (el: HallElement) => {
    updateEvent({
      ...event,
      elements: [...(event.elements || []), el]
    });
  };

  const updateElement = (id: string, updates: Partial<HallElement>) => {
    updateEvent({
      ...event,
      elements: (event.elements || []).map(e => e.id === id ? { ...e, ...updates } : e)
    });
  };

  const removeElement = (id: string) => {
    updateEvent({
      ...event,
      elements: (event.elements || []).filter(e => e.id !== id)
    });
  };

  const saveAsTemplate = (name: string) => {
    const newTemplate: HallTemplate = {
      id: crypto.randomUUID(),
      name,
      createdBy: currentUser,
      tables: event.tables.map(({ id, ...rest }) => rest),
      elements: event.elements || [],
      width: 1500,
      height: 1500
    };

    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      if (users[currentUser]) {
        if (!users[currentUser].hallTemplates) users[currentUser].hallTemplates = [];
        users[currentUser].hallTemplates.push(newTemplate);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        setSavedTemplates(prev => [...prev, newTemplate]);
        alert('תבנית האולם נשמרה בהצלחה בספרייה שלך!');
      }
    }
  };

  const loadTemplate = (template: HallTemplate) => {
    if (confirm('טעינת תבנית תנקה את כל המיקומים הנוכחיים באולם. האם להמשיך?')) {
      const newTables = template.tables.map(t => ({ ...t, id: crypto.randomUUID() }));
      updateEvent({
        ...event,
        tables: newTables,
        elements: template.elements,
        guests: event.guests.map(g => ({ ...g, tableId: null }))
      });
    }
  };

  return (
    <div className="animate-fadeIn h-full">
      {view === 'guests' && (
        <GuestList 
          eventId={event.id} guests={event.guests} tables={event.tables}
          eventName={event.name} eventVenue={event.venue} categories={event.categories}
          whatsappTemplate={event.whatsappTemplate}
          onAddGuest={(g) => updateEvent({ ...event, guests: [...event.guests, { ...g, id: crypto.randomUUID() }] })}
          onRemoveGuest={(id) => updateEvent({ ...event, guests: event.guests.filter(g => g.id !== id) })}
          onUpdateGuest={updateGuest}
          onSplitGuest={() => {}}
        />
      )}
      {view === 'tables' && (
        <TableGrid 
          tables={event.tables} guests={event.guests} categories={event.categories}
          onAddTable={() => addTable({ number: event.tables.length + 1, capacity: 10, position: { x: 50, y: 50 }, type: 'round', rotation: 0 })}
          onRemoveTable={removeTable}
          onUpdateTable={updateTable}
          onAssignGuest={(guestId, tableId) => updateGuest(guestId, { tableId })}
        />
      )}
      {view === 'layout' && (
        <HallLayout 
          tables={event.tables} elements={event.elements || []} guests={event.guests} currentUser={currentUser}
          onUpdateTable={updateTable} onAddTable={addTable} onAddElement={addElement} onUpdateElement={updateElement} 
          onRemoveElement={removeElement} onRemoveTable={removeTable}
          onSaveTemplate={saveAsTemplate} onLoadTemplate={loadTemplate} savedTemplates={savedTemplates}
        />
      )}
      {view === 'settings' && <SettingsPanel event={event} onUpdateEvent={updateEvent} />}
    </div>
  );
};

export default EventEditor;
