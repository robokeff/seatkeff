
import React, { useState, useEffect, useRef } from 'react';
import { EventData, AppState, UserAccount, HallTemplate, Guest } from './types';
import EventDashboard from './components/EventDashboard';
import EventEditor from './components/EventEditor';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import GuestRSVP from './components/GuestRSVP';
import { Calendar, MapPin, ChevronLeft, CheckCircle2, Clock, Users, LayoutGrid, Map as MapIcon, Settings, ShieldCheck, LogOut, CheckCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'event_seat_pro_config_v3';
const USERS_DB_KEY = 'users_db_v3';
const LAST_USER_KEY = 'last_logged_user_v3';
const GLOBAL_CONFIG_KEY = 'global_config_v3';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const safeAtob = (str: string) => {
  try {
    return decodeURIComponent(atob(str).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return atob(str);
  }
};

const DEFAULT_CATEGORIES = ['משפחת החתן', 'משפחת הכלה', 'חברי החתן', 'חברי הכלה', 'חברים משותפים', 'משפחה משותפת'];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      const lastUser = localStorage.getItem(LAST_USER_KEY);
      if (lastUser) return { currentUser: lastUser, currentEventId: null, showWelcome: false };
    } catch (e) {
      console.warn("Storage initial parse error", e);
    }
    return { currentUser: null, currentEventId: null, showWelcome: true };
  });

  const [events, setEvents] = useState<EventData[]>([]);
  const [allTemplates, setAllTemplates] = useState<HallTemplate[]>([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'tables' | 'layout' | 'admin' | 'settings'>('dashboard');
  
  const [isRSVPMode, setIsRSVPMode] = useState(false);
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const dataLoadedForUser = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rsvp = params.get('rsvp');
    const importData = params.get('import');
    const eid = params.get('eid');

    if (rsvp) {
      setIsRSVPMode(true);
      setRsvpEventId(rsvp);
    }

    if (importData && eid) {
      try {
        const decoded = JSON.parse(safeAtob(importData));
        handleImportGuest(eid, decoded);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to import guest data", e);
      }
    }
  }, []);

  const handleImportGuest = (eventId: string, guestData: any) => {
    setImportNotice(`מייבא את ${guestData.name}...`);
    
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return {
          ...ev,
          guests: [...ev.guests, { ...guestData, id: generateId() }]
        };
      }
      return ev;
    }));

    setTimeout(() => {
      setImportNotice(`המוזמן ${guestData.name} נוסף בהצלחה!`);
      setTimeout(() => setImportNotice(null), 2000);
    }, 500);
  };

  const handleImportFullEvent = (event: EventData) => {
    setEvents(prev => [...prev, event]);
    setImportNotice(`אירוע דוגמא נטען בהצלחה!`);
    setTimeout(() => setImportNotice(null), 2000);
  };

  // טעינת נתונים ראשונית כולל תבניות
  useEffect(() => {
    if (state.currentUser && dataLoadedForUser.current !== state.currentUser) {
      setIsLoaded(false);
      try {
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        const userData = users[state.currentUser!];
        
        // טעינת כל התבניות מכל המשתמשים (כדי שיהיו גלובליות)
        const templates: HallTemplate[] = [];
        Object.values(users).forEach((u: any) => {
          if (u.hallTemplates) templates.push(...u.hallTemplates);
        });
        setAllTemplates(templates);

        if (userData) {
          setUserIsAdmin(!!userData.isAdmin);
          setEvents(userData.events || []);
        } else {
          setEvents([]);
          setUserIsAdmin(false);
        }
      } catch (e) { 
        console.error("Local load error", e); 
      } finally {
        dataLoadedForUser.current = state.currentUser;
        setIsLoaded(true);
      }
    } else if (!state.currentUser) {
      setEvents([]);
      setAllTemplates([]);
      setIsLoaded(true);
      dataLoadedForUser.current = null;
    }
  }, [state.currentUser]);

  // שמירה מרכזית של אירועים ותבניות
  useEffect(() => {
    if (!isLoaded || !state.currentUser || dataLoadedForUser.current !== state.currentUser) return;

    const saveChanges = () => {
      setIsSaving(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(LAST_USER_KEY, state.currentUser!);
        
        const usersRaw = localStorage.getItem(USERS_DB_KEY);
        const users = usersRaw ? JSON.parse(usersRaw) : {};
        
        if (!users[state.currentUser!]) {
          users[state.currentUser!] = { username: state.currentUser!, events: [], isAdmin: userIsAdmin, hallTemplates: [] };
        }
        
        // עדכון אירועים למשתמש הנוכחי
        users[state.currentUser!].events = events;
        
        // וידוא שהתבניות של המשתמש הנוכחי נשמרות (אלו שנוצרו על ידו)
        const myTemplates = allTemplates.filter(t => t.createdBy === state.currentUser);
        users[state.currentUser!].hallTemplates = myTemplates;

        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      } catch (e: any) { 
        console.error("Save error", e); 
      } finally { 
        setIsSaving(false); 
      }
    };
    const timer = setTimeout(saveChanges, 800); 
    return () => clearTimeout(timer);
  }, [events, allTemplates, state.currentUser, isLoaded, userIsAdmin]);

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
    setAllTemplates([]);
    setUserIsAdmin(false);
  };

  const handleSaveTemplate = (template: HallTemplate) => {
    setAllTemplates(prev => {
      // אם התבנית כבר קיימת (לפי שם או מזהה), נעדכן אותה. אם לא, נוסיף.
      const exists = prev.find(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [...prev, template];
    });
  };

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

  if (isRSVPMode) return <GuestRSVP eventId={rsvpEventId || ''} event={events.find(e => e.id === rsvpEventId)} />;
  if (state.showWelcome) return <WelcomeScreen onStart={() => setState(prev => ({ ...prev, showWelcome: false }))} />;
  if (!state.currentUser) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-gray-50 text-right font-['Assistant']" dir="rtl">
      {importNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-white border-2 border-green-500 text-green-600 px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 animate-slideUp font-black">
          <CheckCircle size={24} />
          {importNotice}
        </div>
      )}
      <Sidebar 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        hasActiveEvent={!!currentEvent} currentEventName={currentEvent?.name}
        onExitEvent={() => { setState(prev => ({ ...prev, currentEventId: null })); setActiveTab('dashboard'); }}
        onLogout={handleLogout} username={state.currentUser} isAdmin={userIsAdmin} isSaving={isSaving}
        lastUpdated={state.lastUpdated}
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
                 <div className={`flex items-center gap-1.5 font-black text-[9px] transition-all duration-500 ${isSaving ? 'text-amber-500' : 'text-green-500 opacity-60'}`}>
                    {isSaving ? <span className="animate-spin text-lg">◌</span> : <CheckCircle2 size={12} />}
                    <span className="hidden sm:inline">{isSaving ? 'שומר שינויים...' : 'שמור מקומית'}</span>
                 </div>
            </div>
          </header>
        )}

        <main className="flex-1 p-3 md:p-8 overflow-y-auto bg-gray-50/50 custom-scrollbar relative">
          {activeTab === 'admin' ? <AdminPanel /> : (!currentEvent || activeTab === 'dashboard') ? (
            <EventDashboard 
              events={events} 
              availableTemplates={allTemplates}
              onImportEvent={handleImportFullEvent}
              onCreateEvent={(n,d,v,t_topic,a,i, templateId) => { 
                const globalRaw = localStorage.getItem(GLOBAL_CONFIG_KEY);
                const globalCats = globalRaw ? JSON.parse(globalRaw).categories : DEFAULT_CATEGORIES;
                
                let tables = [];
                let elements = [];
                let width = 1000;
                let height = 1000;
                
                if (templateId) {
                  const foundTemplate = allTemplates.find(temp => temp.id === templateId);
                  if (foundTemplate) {
                    tables = foundTemplate.tables.map((t: any) => ({ ...t, id: generateId() }));
                    elements = foundTemplate.elements || [];
                    width = foundTemplate.width || 1000;
                    height = foundTemplate.height || 1000;
                  }
                }

                const newEvent: EventData = { 
                  id: generateId(), 
                  name: n, 
                  date: d, 
                  venue: v, 
                  eventTopic: t_topic,
                  address: a, 
                  imageUrl: i, 
                  guests: [], 
                  categories: globalCats || [...DEFAULT_CATEGORIES], 
                  tables, 
                  elements,
                  canvasWidth: width,
                  canvasHeight: height,
                  seatingTemplate: "היי [GUEST_NAME]! אנחנו שמחים להזמינכם ל-[EVENT_NAME]. שולחן מספר [TABLE_NUMBER], כמות מקומות: [SEATS]. נתראה ב-[EVENT_VENUE] בכתובת [EVENT_ADDRESS]!"
                };
                setEvents(prev => [...prev, newEvent]); 
                setState(prev => ({ ...prev, currentEventId: newEvent.id }));
                setActiveTab('guests'); 
              }} 
              onUpdateEventMetadata={(id,n,d,v,t_topic,a,i) => setEvents(prev => prev.map(e => e.id === id ? {...e, name:n, date:d, venue:v, eventTopic: t_topic, address:a, imageUrl:i} : e))} 
              onSelectEvent={(id) => { 
                setState(prev => ({ ...prev, currentEventId: id })); 
                setActiveTab('guests'); 
              }} 
              onDeleteEvent={(id) => {
                if(confirm('האם אתה בטוח שברצונך למחוק את האירוע? כל הנתונים יאבדו.')) {
                  setEvents(prev => prev.filter(e => e.id !== id));
                }
              }} 
            />
          ) : (
            <EventEditor 
              key={currentEvent.id} 
              event={currentEvent} 
              updateEvent={(updated) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))} 
              view={activeTab as any} 
              currentUser={state.currentUser!}
              allTemplates={allTemplates}
              onSaveTemplate={handleSaveTemplate}
            />
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
               <LogOut size={20} />
               <span className="text-[10px] font-black">התנתק</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
