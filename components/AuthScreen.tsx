
import React, { useState, useEffect } from 'react';
import { UserPlus, Heart, UserCircle2, ShieldCheck, Delete, ChevronLeft } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthScreenProps {
  onLogin: (username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'profiles' | 'pin' | 'register'>('profiles');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState<Record<string, UserAccount>>({});

  const USERS_DB_KEY = 'users_db_v3';
  const LAST_USER_KEY = 'last_logged_user_v3';
  const ADMIN_EMAIL = 'robokeff@gmail.com';
  const ADMIN_PASS = '9985';

  const loadUsers = () => {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    let users = usersRaw ? JSON.parse(usersRaw) : {};
    if (!users[ADMIN_EMAIL]) {
      users[ADMIN_EMAIL] = { username: ADMIN_EMAIL, password: ADMIN_PASS, events: [], isAdmin: true };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
    setAllUsers(users);
    return users;
  };

  useEffect(() => {
    loadUsers();
    setView('profiles');
  }, []);

  const handlePinInput = (num: string) => {
    if (error) setError('');
    if (pincode.length < 4) {
      const newPin = pincode + num;
      setPincode(newPin);
      if (newPin.length === 4) verifyPin(newPin);
    }
  };

  const verifyPin = (pinToVerify: string) => {
    if (selectedUser === ADMIN_EMAIL && pinToVerify === ADMIN_PASS) { completeLogin(ADMIN_EMAIL); return; }
    const user = allUsers[selectedUser || ''];
    if (user && user.password === pinToVerify) completeLogin(selectedUser!);
    else { setError('קוד שגוי'); setTimeout(() => { setPincode(''); setError(''); }, 1000); }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = username.trim().toLowerCase();
    if (!normalized || pincode.length !== 4) { setError('השלם את כל הפרטים'); return; }
    if (allUsers[normalized]) { setError('משתמש כבר קיים'); return; }
    const newUser: UserAccount = { username: normalized, password: pincode, events: [], isAdmin: normalized === ADMIN_EMAIL };
    const updated = { ...allUsers, [normalized]: newUser };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
    completeLogin(normalized);
  };

  const completeLogin = (userEmail: string) => {
    localStorage.setItem(LAST_USER_KEY, userEmail);
    onLogin(userEmail);
  };

  const Keypad = () => (
    <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-[280px] mx-auto mt-6 md:mt-8" dir="ltr">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
        <button key={num} type="button" onClick={() => handlePinInput(num.toString())} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-50 text-indigo-900 text-xl md:text-2xl font-black hover:bg-indigo-100 active:scale-90 transition-all flex items-center justify-center shadow-sm">
          {num}
        </button>
      ))}
      <div className="flex items-center justify-center">
        <button type="button" onClick={() => setPincode('')} className="text-gray-400 font-bold text-[10px] hover:text-red-500">נקה</button>
      </div>
      <button type="button" onClick={() => handlePinInput('0')} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-indigo-50 text-indigo-900 text-xl md:text-2xl font-black hover:bg-indigo-100 active:scale-90 transition-all flex items-center justify-center shadow-sm">0</button>
      <button type="button" onClick={() => setPincode(pincode.slice(0, -1))} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center active:scale-90 transition-all">
        <Delete size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4 font-['Assistant']" dir="rtl">
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-md p-6 md:p-10 overflow-hidden relative animate-fadeIn border-t-8 border-indigo-600">
        
        {view === 'profiles' && (
          <div className="text-center animate-slideUp">
            <h2 className="text-2xl md:text-3xl font-black text-indigo-950 mb-8">בחר פרופיל</h2>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
              {Object.keys(allUsers).filter(u => u !== ADMIN_EMAIL).slice(0, 3).map(u => (
                <button key={u} onClick={() => { setSelectedUser(u); setView('pin'); setPincode(''); }} className="flex flex-col items-center gap-3 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    <UserCircle2 size={40} />
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-gray-500 truncate w-full px-2">{u}</span>
                </button>
              ))}
              <button onClick={() => { setView('register'); setPincode(''); setUsername(''); }} className="flex flex-col items-center gap-3 group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                  <UserPlus size={24} />
                </div>
                <span className="text-[10px] md:text-xs font-black text-gray-400">חדש</span>
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ניהול מנהל</p>
              <button onClick={() => { setSelectedUser(ADMIN_EMAIL); setView('pin'); setPincode(''); }} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-100">
                כניסת מנהל מערכת
              </button>
            </div>
          </div>
        )}

        {view === 'pin' && (
          <div className="text-center animate-fadeIn">
            <button onClick={() => setView('profiles')} className="absolute top-6 right-6 text-gray-300 hover:text-indigo-600"><ChevronLeft className="rotate-180" size={24} /></button>
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4"><ShieldCheck size={32} /></div>
            <h2 className="text-xl md:text-2xl font-black text-indigo-950 mb-1">הקש קוד גישה</h2>
            <p className="text-gray-400 text-[9px] font-bold mb-6 truncate max-w-[180px] mx-auto uppercase">{selectedUser}</p>
            <div className="flex justify-center gap-3 mb-2" dir="ltr">
              {[0, 1, 2, 3].map(i => <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pincode.length > i ? 'bg-indigo-600 border-indigo-600 scale-125' : 'bg-transparent border-gray-200'}`} />)}
            </div>
            {error && <p className="text-red-500 text-xs font-black h-4 animate-bounce mb-2">{error}</p>}
            <Keypad />
          </div>
        )}

        {view === 'register' && (
          <div className="animate-slideUp">
            <button onClick={() => setView('profiles')} className="absolute top-6 right-6 text-gray-300 hover:text-indigo-600"><ChevronLeft className="rotate-180" size={24} /></button>
            <div className="flex justify-center mb-6"><div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl rotate-12"><Heart size={24} className="fill-white" /></div></div>
            <h2 className="text-2xl font-black text-center text-indigo-950 mb-6">משתמש חדש</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="email" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold" placeholder="אימייל" />
              <div className="flex justify-center gap-3" dir="ltr">
                {[0, 1, 2, 3].map(i => <div key={i} className={`w-10 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-all ${pincode.length > i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-300'}`}>{pincode[i] || '•'}</div>)}
              </div>
              <Keypad />
              <button type="submit" disabled={pincode.length !== 4 || !username} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl disabled:opacity-30">הרשמה וכניסה</button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-8 text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 justify-center">
          <ShieldCheck size={12} />
          כל הזכויות שמורות לחברת רובוכיף בע"מ - 0549985605
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
