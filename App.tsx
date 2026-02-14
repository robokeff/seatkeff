
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EventData, AppState, UserAccount, CustomApiConfig } from './types';
import EventDashboard from './components/EventDashboard';
import EventEditor from './components/EventEditor';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import { Calendar, MapPin, ChevronLeft, CheckCircle2, Clock, RefreshCw, Users, LayoutGrid, Map as MapIcon, Settings, ShieldCheck } from 'lucide-react';

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
const ADMIN_EMAIL = 'robokeff@gmail.com';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const lastUser = localStorage.getItem(LAST_USER_KEY);
      if (lastUser) return { currentUser: lastUser, currentEventId: null, showWelcome: false };
    } catch (e) {
      console.warn("Storage parse error", e);
    }
    return { currentUser: null, currentEventId: null, showWelcome: true };
  });

  const [events, setEvents] = useState<EventData[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings'>('dashboard');
  const [cloudStatus, setCloudStatus] = useState<'offline' | 'connecting' | 'online' | 'api' | 'conflict'>('offline');
  
  const dataLoadedForUser = useRef<string | null>(null);
  const apiConfigRef = useRef<CustomApiConfig | null>(null);
  const serverLastUpdated = useRef<string | null>(null);

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
    setState({ currentUser: null, currentEventId: null, showWelcome: false });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LAST_USER_KEY);
    setActiveTab('dashboard');
    setEvents([]);
    setUserIsAdmin(false);
    setCloudStatus('offline');
    apiConfigRef.current = null;
  };

  const fetchRemoteData = useCallback(async (userData: UserAccount) => {
    if (!userData.apiConfig || !userData.apiConfig.baseUrl) return null;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      apiConfigRef.current = userData.apiConfig;
      const res = await fetch(`${userData.apiConfig.baseUrl}/data`, {
        headers: { 
          'Authorization': `Bearer ${userData.apiConfig.apiKey || ''}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      if (res.ok) {
        const cloudData = await res.json();
        clearTimeout(timeoutId);
        serverLastUpdated.current = cloudData.lastUpdated;
        return cloudData;
      }
    } catch (e) { 
      console.warn("Neon API fetch failed, falling back to local storage", e); 
    }
    clearTimeout(timeoutId);
    return null;
  }, []);

  useEffect(() => {
    if (state.currentUser && !isLoaded) {
      const loadData = async () => {
        try {
          const usersRaw = localStorage.getItem(USERS_DB_KEY);
          const users = usersRaw ? JSON.parse(usersRaw) : {};
          
          if (!users[ADMIN_EMAIL]) {
             users[ADMIN_EMAIL] = { username: ADMIN_EMAIL, events: [], isAdmin: true, password: '9985' };
             localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
          }

          let userData = users[state.currentUser!];
          if (userData) {
            setUserIsAdmin(!!userData.isAdmin);
            const remoteData = await fetchRemoteData(userData);
            
            if (remoteData) {
              setEvents(remoteData.events || []);
              setState(prev => ({ 
                ...prev, 
                isApiEnabled: !!userData.apiConfig,
                lastUpdated: remoteData.lastUpdated 
              }));
              setCloudStatus('api');
            } else {
              setEvents(userData.events || []);
              setState(prev => ({ 
                ...prev, 
                isApiEnabled: !!userData.apiConfig,
                lastUpdated: state.lastUpdated || new Date().toISOString()
              }));
              setCloudStatus(userData.apiConfig ? 'api' : 'offline');
            }
          }
        } catch (e) { 
          console.error("Local load error", e); 
        } finally {
          dataLoadedForUser.current = state.currentUser;
          setIsLoaded(true);
        }
      };
      loadData();
    }
  }, [state.currentUser, isLoaded, fetchRemoteData, state.lastUpdated]);

  useEffect(() => {
    if (isLoaded) setHasUnsavedChanges(true);
  }, [events, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !state.currentUser || !hasUnsavedChanges || dataLoadedForUser.current !== state.currentUser) return;

    const saveChanges = async () => {
      // Don't save empty state if we previously had data from server
      if (events.length === 0 && serverLastUpdated.current) return;
      
      setIsSaving(true);
      const now = new Date().toISOString();
      try {
        localStorage.setItem(LAST_USER_KEY, state.currentUser!);
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        if (users[state.currentUser!]) {
          users[state.currentUser!].events = events;
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        }

        if (state.isApiEnabled && apiConfigRef.current) {
          await fetch(`${apiConfigRef.current.baseUrl}/save`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${apiConfigRef.current.apiKey || ''}` 
            },
            body: JSON.stringify({ events, lastUpdated: now })
          });
        }

        setState(prev => ({ ...prev, lastUpdated: now }));
        serverLastUpdated.current = now;
        setCloudStatus(state.isApiEnabled ? 'api' : 'offline');
        setHasUnsavedChanges(false);
      } catch (e) { 
        console.error("API Save error (Neon)", e); 
      } finally { 
        setIsSaving(false); 
      }
    };

    const timer = setTimeout(saveChanges, 2000);
    return () => clearTimeout(timer);
  }, [events, state.currentUser, isLoaded, hasUnsavedChanges, state.isApiEnabled]);

  const currentEvent = events.find(e => e.id === state.currentEventId) || null;

  const NavItemMobile = ({ tab, icon: Icon, label }: { tab: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center flex-1 gap-1 transition-all ${activeTab === tab ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
    >
      <div className={`p-1.5 rounded-xl ${activeTab === tab ? 'bg-indigo-50' : 'bg-transparent'}`}>
        <Icon size={20} strokeWidth={activeTab === tab ? 2.5 : 2} />
      </div>
      <span className="text-[10px] font-black">{label}</span>
    </button>
  );

  if (state.showWelcome) return <WelcomeScreen onStart={() => setState(prev => ({ ...prev, showWelcome: false }))} />;
  if (!state.currentUser) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Assistant']" dir="rtl">
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        hasActiveEvent={!!currentEvent} currentEventName={currentEvent?.name}
        onExitEvent={() => { setState(prev => ({ ...prev, currentEventId: null })); setActiveTab('dashboard'); }}
        onLogout={handleLogout} username={state.currentUser} isAdmin={userIsAdmin} isSaving={isSaving}
        cloudStatus={cloudStatus} lastUpdated={state.lastUpdated}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-20 md:pb-0">
        {currentEvent && activeTab !== 'dashboard' && activeTab !== 'admin' && (
          <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-20">
            <div className="flex items-center gap-3 md:gap-6">
              <button onClick={() => { setState(prev => ({ ...prev, currentEventId: null })); setActiveTab('dashboard'); }} className="bg-gray-100 hover:bg-indigo-50 text-indigo-600 p-2 rounded-xl transition-all"><ChevronLeft className="rotate-180" size={20} /></button>
              <div className="overflow-hidden">
                <h2 className="text-lg md:text-xl font-black text-indigo-950 truncate max-w-[150px] md:max-w-none">{currentEvent.name}</h2>
                <div className="flex gap-2 md:gap-4 text-[10px] font-bold text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={10}/>{new Date(currentEvent.date).toLocaleDateString('he-IL')}</span>
                  <span className="hidden md:flex items-center gap-1"><MapPin size={10}/>{currentEvent.venue}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {cloudStatus === 'conflict' ? (
                 <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[9px] font-black border border-red-100 animate-pulse"><RefreshCw size={12} /> רענן</button>
               ) : (
                 <div className={`flex items-center gap-1.5 font-black text-[9px] transition-all duration-500 ${isSaving ? 'text-amber-500' : (hasUnsavedChanges ? 'text-indigo-400' : 'text-green-500 opacity-60')}`}>
                    {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    <span className="hidden sm:inline">{isSaving ? 'מסנכרן ל-Neon...' : (hasUnsavedChanges ? 'שינויים מקומיים' : 'מסונכרן')}</span>
                 </div>
               )}
            </div>
          </header>
        )}

        <main className="flex-1 p-3 md:p-8 overflow-y-auto bg-gray-50/50 custom-scrollbar relative">
          {!isLoaded && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-black text-indigo-950">מתחבר למסד הנתונים...</p>
            </div>
          )}
          {activeTab === 'admin' ? <AdminPanel /> : (!currentEvent || activeTab === 'dashboard') ? (
            <EventDashboard events={events} onCreateEvent={(n,d,v,a,i) => { setEvents(prev => [...prev, { id: generateId(), name: n, date: d, venue: v, address: a, imageUrl: i, guests: [], categories: [...DEFAULT_CATEGORIES], tables: [], elements: [] }]); setActiveTab('guests'); }} onUpdateEventMetadata={(id,n,d,v,a,i) => setEvents(prev => prev.map(e => e.id === id ? {...e, name:n, date:d, venue:v, address:a, imageUrl:i} : e))} onSelectEvent={(id) => { setState(prev => ({ ...prev, currentEventId: id })); setActiveTab('guests'); }} onDeleteEvent={(id) => setEvents(prev => prev.filter(e => e.id !== id))} />
          ) : (
            <EventEditor key={currentEvent.id} event={currentEvent} updateEvent={(updated) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))} view={activeTab as any} currentUser={state.currentUser!} />
          )}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 p-2 flex justify-around items-center z-50 pb-safe">
        {currentEvent ? (
          <>
            <NavItemMobile tab="guests" icon={Users} label="מוזמנים" />
            <NavItemMobile tab="tables" icon={LayoutGrid} label="שולחנות" />
            <NavItemMobile tab="layout" icon={MapIcon} label="סקיצה" />
            <NavItemMobile tab="settings" icon={Settings} label="הגדרות" />
          </>
        ) : (
          <>
            <NavItemMobile tab="dashboard" icon={Calendar} label="אירועים" />
            {userIsAdmin && <NavItemMobile tab="admin" icon={ShieldCheck} label="ניהול" />}
            <button onClick={handleLogout} className="flex flex-col items-center justify-center flex-1 gap-1 text-red-400">
               <Clock size={20} />
               <span className="text-[10px] font-black">התנתק</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
