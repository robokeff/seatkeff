
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EventData, AppState, UserAccount, Guest } from './types';
import EventDashboard from './components/EventDashboard';
import EventEditor from './components/EventEditor';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import GuestRSVP from './components/GuestRSVP';
import { Calendar, MapPin, ChevronLeft, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'event_seat_pro_config_v2';
const USERS_DB_KEY = 'users_db_v2';
const LAST_USER_KEY = 'last_logged_user_v2';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const DEFAULT_CATEGORIES = ['משפחת החתן', 'משפחת הכלה', 'חברי החתן', 'חברי הכלה', 'חברים משותפים', 'משפחה משותפת'];
const DEFAULT_WHATSAPP_TEMPLATE = `שלום {name}, אנחנו מחכים לראותך ב{eventName}! 🥂\n\n📍 מקומך שמור בשולחן מספר: *{table}*\n🏛️ מיקום: {venue}\n👥 סה"כ מקומות שמורים: {totalSeats}\n\nנתראה בשמחות! ✨`;
const ADMIN_EMAIL = 'robokeff@gmail.com';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const lastUser = localStorage.getItem(LAST_USER_KEY);
      if (lastUser) return { currentUser: lastUser, currentEventId: null, showWelcome: false };
    } catch (e) {}
    return { currentUser: null, currentEventId: null, showWelcome: true };
  });

  const [events, setEvents] = useState<EventData[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings'>('dashboard');
  
  const dataLoadedForUser = useRef<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const rsvpEventId = urlParams.get('rsvp');

  const handleLogin = (username: string) => {
    const normalizedUsername = username.trim().toLowerCase();
    setIsLoaded(false); // Reset loaded state on new user
    setState(prev => ({ ...prev, currentUser: normalizedUsername, showWelcome: false, currentEventId: null }));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoaded(false);
    setState({ currentUser: null, currentEventId: null, showWelcome: false });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LAST_USER_KEY);
    setActiveTab('dashboard');
    setEvents([]);
    setUserIsAdmin(false);
    dataLoadedForUser.current = null;
  };

  // Load Data Effect
  useEffect(() => {
    if (state.currentUser) {
      try {
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        let userData = users[state.currentUser];
        
        // ADMIN RESCUE LOGIC
        if (!userData && state.currentUser === ADMIN_EMAIL) {
          userData = { username: ADMIN_EMAIL, events: [], isAdmin: true, password: '9985' };
          users[ADMIN_EMAIL] = userData;
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }

        if (userData) {
          setEvents(userData.events || []);
          setUserIsAdmin(!!userData.isAdmin);
          dataLoadedForUser.current = state.currentUser;
          setIsLoaded(true); // MARK AS LOADED
        } else {
          // If user exists in state but not in DB, it might be a cleared storage
          setIsLoaded(true); 
        }
      } catch (e) { 
        console.error("Load error", e); 
        setIsLoaded(true); // Prevent blocking even on error
      }
    } else {
      setIsLoaded(true); // Guest or Welcome screen
    }
  }, [state.currentUser]);

  // Save Data Effect
  useEffect(() => {
    if (!isLoaded || !state.currentUser || dataLoadedForUser.current !== state.currentUser) {
      return; // Do NOT save until data is fully loaded and matches user
    }

    const timer = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(LAST_USER_KEY, state.currentUser!);
        
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        
        if (users[state.currentUser!]) {
          users[state.currentUser!].events = events;
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }
      } catch (e) { console.error("Save failed", e); }
      setTimeout(() => setIsSaving(false), 500);
    }, 1000); // Debounce saves

    return () => clearTimeout(timer);
  }, [events, state, isLoaded]);

  if (rsvpEventId) {
    const currentEventForRSVP = events.find(e => e.id === rsvpEventId);
    return <GuestRSVP eventId={rsvpEventId} event={currentEventForRSVP || undefined} />;
  }

  if (state.showWelcome) return <WelcomeScreen onStart={() => setState(prev => ({ ...prev, showWelcome: false }))} />;
  if (!state.currentUser) return <AuthScreen onLogin={handleLogin} />;

  const currentEvent = events.find(e => e.id === state.currentEventId) || null;

  const createEvent = (name: string, date: string, venue: string, address: string, imageUrl?: string) => {
    const newEvent: EventData = {
      id: generateId(),
      name, date, venue, address, imageUrl,
      guests: [],
      categories: [...DEFAULT_CATEGORIES],
      whatsappTemplate: DEFAULT_WHATSAPP_TEMPLATE,
      tables: Array.from({ length: 12 }, (_, i) => ({
        id: generateId(),
        number: i + 1,
        capacity: 10,
        position: { x: (i % 4) * 200 + 50, y: Math.floor(i / 4) * 200 + 50 }
      }))
    };
    setEvents(prev => [...prev, newEvent]);
    setState(prev => ({ ...prev, currentEventId: newEvent.id }));
    setActiveTab('guests');
  };

  const updateEventMetadata = (id: string, name: string, date: string, venue: string, address: string, imageUrl?: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, name, date, venue, address, imageUrl } : e));
  };

  const updateEvent = (updatedEvent: EventData) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? { ...updatedEvent } : e));
  };

  const deleteEvent = (id: string) => {
    if (confirm('מחק אירוע?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
      if (state.currentEventId === id) {
        setState(prev => ({ ...prev, currentEventId: null }));
        setActiveTab('dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Assistant']" dir="rtl">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        hasActiveEvent={!!currentEvent} currentEventName={currentEvent?.name}
        onExitEvent={() => { setState(prev => ({ ...prev, currentEventId: null })); setActiveTab('dashboard'); }}
        onLogout={handleLogout} username={state.currentUser} isAdmin={userIsAdmin} isSaving={isSaving}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {currentEvent && activeTab !== 'dashboard' && activeTab !== 'admin' && (
          <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-6">
              <button onClick={() => { setState(prev => ({ ...prev, currentEventId: null })); setActiveTab('dashboard'); }} className="bg-gray-50 hover:bg-indigo-50 text-indigo-600 p-2 rounded-xl transition-all"><ChevronLeft className="rotate-180" /></button>
              <div>
                <h2 className="text-xl font-black text-indigo-950">{currentEvent.name}</h2>
                <div className="flex gap-4 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12}/>{new Date(currentEvent.date).toLocaleDateString('he-IL')}</span>
                  <span className="flex items-center gap-1"><MapPin size={12}/>{currentEvent.venue}</span>
                </div>
              </div>
            </div>
            {isSaving && (
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs animate-pulse">
                <CheckCircle2 size={14} /> שומר שינויים...
              </div>
            )}
          </header>
        )}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50/50 custom-scrollbar">
          {activeTab === 'admin' ? <AdminPanel /> : (!currentEvent || activeTab === 'dashboard') ? (
            <EventDashboard events={events} onCreateEvent={createEvent} onUpdateEventMetadata={updateEventMetadata} onSelectEvent={(id) => { setState(prev => ({ ...prev, currentEventId: id })); setActiveTab('guests'); }} onDeleteEvent={deleteEvent} />
          ) : (
            <EventEditor key={currentEvent.id} event={currentEvent} updateEvent={updateEvent} view={activeTab as any} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
