
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EventData, AppState, UserAccount, Guest, FirebaseConfig, CustomApiConfig } from './types';
import EventDashboard from './components/EventDashboard';
import EventEditor from './components/EventEditor';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import GuestRSVP from './components/GuestRSVP';
import { Calendar, MapPin, ChevronLeft, CheckCircle2, Cloud, CloudOff, CloudCheck, Server } from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'event_seat_pro_config_v3';
const USERS_DB_KEY = 'users_db_v3';
const LAST_USER_KEY = 'last_logged_user_v3';

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
      if (lastUser) return { currentUser: lastUser, currentEventId: null, showWelcome: false, isCloudEnabled: false };
    } catch (e) {}
    return { currentUser: null, currentEventId: null, showWelcome: true, isCloudEnabled: false };
  });

  const [events, setEvents] = useState<EventData[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings'>('dashboard');
  const [cloudStatus, setCloudStatus] = useState<'offline' | 'connecting' | 'online' | 'api'>('offline');
  
  const dataLoadedForUser = useRef<string | null>(null);
  const dbRef = useRef<any>(null);
  const apiConfigRef = useRef<CustomApiConfig | null>(null);

  // FIX: Extract RSVP and Import data from URL to fix "Cannot find name 'rsvpEventId'"
  const urlParams = new URLSearchParams(window.location.search);
  const rsvpEventId = urlParams.get('eid');
  const importDataEncoded = urlParams.get('import');

  const initFirebase = useCallback(async (config: FirebaseConfig) => {
    try {
      setCloudStatus('connecting');
      const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      dbRef.current = getFirestore(app);
      setCloudStatus('online');
      return true;
    } catch (e) {
      console.error("Firebase init failed", e);
      setCloudStatus('offline');
      return false;
    }
  }, []);

  const handleLogin = (username: string) => {
    const normalizedUsername = username.trim().toLowerCase();
    setIsLoaded(false);
    dataLoadedForUser.current = null;
    setState(prev => ({ ...prev, currentUser: normalizedUsername, showWelcome: false, currentEventId: null }));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoaded(false);
    dataLoadedForUser.current = null;
    setState({ currentUser: null, currentEventId: null, showWelcome: false, isCloudEnabled: false });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LAST_USER_KEY);
    setActiveTab('dashboard');
    setEvents([]);
    setUserIsAdmin(false);
    setCloudStatus('offline');
    dbRef.current = null;
  };

  useEffect(() => {
    if (state.currentUser && !isLoaded) {
      const loadData = async () => {
        try {
          const usersRaw = localStorage.getItem(USERS_DB_KEY);
          const users = usersRaw ? JSON.parse(usersRaw) : {};
          let userData = users[state.currentUser!];
          
          if (!userData && state.currentUser === ADMIN_EMAIL) {
            userData = { username: ADMIN_EMAIL, events: [], isAdmin: true, password: '9985' };
            users[ADMIN_EMAIL] = userData;
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
          }

          if (userData) {
            setUserIsAdmin(!!userData.isAdmin);
            
            // Priority 1: Custom API (Neon)
            if (userData.apiConfig) {
              apiConfigRef.current = userData.apiConfig;
              setCloudStatus('api');
              try {
                const res = await fetch(`${userData.apiConfig.baseUrl}/data`, {
                  headers: { 'Authorization': `Bearer ${userData.apiConfig.apiKey || ''}` }
                });
                if (res.ok) {
                  const cloudData = await res.json();
                  setEvents(cloudData.events || []);
                  setState(prev => ({ ...prev, isApiEnabled: true }));
                  dataLoadedForUser.current = state.currentUser;
                  setIsLoaded(true);
                  return;
                }
              } catch (e) { console.debug("Custom API load failed, fallback to local"); }
            }

            // Priority 2: Firebase
            if (userData.cloudConfig) {
              const connected = await initFirebase(userData.cloudConfig);
              if (connected && dbRef.current) {
                const docRef = doc(dbRef.current, 'users', state.currentUser!);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                  const cloudData = docSnap.data();
                  setEvents(cloudData.events || []);
                  setState(prev => ({ ...prev, isCloudEnabled: true }));
                  dataLoadedForUser.current = state.currentUser;
                  setIsLoaded(true);
                  return;
                }
              }
            }
            
            // Fallback: Local Data
            setEvents(userData.events || []);
            setState(prev => ({ 
              ...prev, 
              isCloudEnabled: !!userData.cloudConfig,
              isApiEnabled: !!userData.apiConfig 
            }));
          } else {
            setEvents([]);
          }
          dataLoadedForUser.current = state.currentUser;
          setIsLoaded(true);
        } catch (e) { 
          console.error("Load error", e); 
          setIsLoaded(true);
        }
      };
      loadData();
    }
  }, [state.currentUser, isLoaded, initFirebase]);

  // FIX: Handle data import from RSVP links when the host is logged in
  useEffect(() => {
    if (isLoaded && state.currentUser && importDataEncoded && rsvpEventId) {
      try {
        // Decode base64 (handling Hebrew/Unicode)
        const decodedString = decodeURIComponent(atob(importDataEncoded).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const guestToImport = JSON.parse(decodedString);
        
        const eventToUpdate = events.find(e => e.id === rsvpEventId);
        if (eventToUpdate) {
          const alreadyExists = eventToUpdate.guests.some(g => 
            g.name === guestToImport.name && g.phone === guestToImport.phone
          );
          
          if (!alreadyExists) {
            const updatedEvent = {
              ...eventToUpdate,
              guests: [...eventToUpdate.guests, { ...guestToImport, id: generateId() }]
            };
            setEvents(prev => prev.map(e => e.id === rsvpEventId ? updatedEvent : e));
            alert(`אורח חדש נוסף: ${guestToImport.name}`);
          }
          
          // Clear URL params to prevent repeated imports
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Import failed", e);
      }
    }
  }, [isLoaded, state.currentUser, importDataEncoded, rsvpEventId, events]);

  useEffect(() => {
    if (!isLoaded || !state.currentUser || dataLoadedForUser.current !== state.currentUser) {
      return; 
    }

    const saveChanges = async () => {
      setIsSaving(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(LAST_USER_KEY, state.currentUser!);
        
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        
        if (users[state.currentUser!]) {
          users[state.currentUser!].events = events;
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
          
          // Save to Custom API (Neon)
          if (state.isApiEnabled && apiConfigRef.current) {
             await fetch(`${apiConfigRef.current.baseUrl}/save`, {
               method: 'POST',
               headers: { 
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${apiConfigRef.current.apiKey || ''}`
               },
               body: JSON.stringify({ events, lastUpdated: new Date().toISOString() })
             });
          }

          // Save to Firebase
          if (state.isCloudEnabled && dbRef.current) {
            const docRef = doc(dbRef.current, 'users', state.currentUser!);
            await setDoc(docRef, {
              events: events,
              lastUpdated: new Date().toISOString()
            }, { merge: true });
          }
        }
      } catch (e) { 
        console.error("Save failed", e); 
      }
      setTimeout(() => setIsSaving(false), 800);
    };

    const timer = setTimeout(saveChanges, 1000);
    return () => clearTimeout(timer);
  }, [events, state, isLoaded]);

  // FIX: Render RSVP screen if requested and user is not logged in (guest mode). 
  // If host is logged in, we stay in dashboard/editor to handle management or import.
  if (rsvpEventId && !state.currentUser && !importDataEncoded) {
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
    if (confirm('למחוק את האירוע וכל נתוני ההושבה?')) {
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
        cloudStatus={cloudStatus}
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
            <div className="flex items-center gap-4">
               {cloudStatus !== 'offline' && (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black border border-green-100">
                    <Cloud size={14} className="animate-pulse" />
                    סנכרון {cloudStatus === 'api' ? 'Neon/API' : 'ענן'} פעיל
                 </div>
               )}
               <div className={`flex items-center gap-2 font-black text-[10px] transition-all duration-500 ${isSaving ? 'text-amber-500 scale-110' : 'text-green-500 opacity-60'}`}>
                {isSaving ? <><CheckCircle2 size={14} className="animate-spin" /> שומר שינויים...</> : <><CheckCircle2 size={14} /> נשמר בהצלחה</>}
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50/50 custom-scrollbar relative">
          {!isLoaded && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-black text-indigo-900">מאחזר מידע מהשרת...</p>
            </div>
          )}
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
