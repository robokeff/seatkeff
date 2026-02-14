
import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Heart, Eye, EyeOff, UserCircle2, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthScreenProps {
  onLogin: (username: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [pincode, setPincode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberedUser, setRememberedUser] = useState<string | null>(null);

  // Synchronized with App.tsx
  const USERS_DB_KEY = 'users_db_v3';
  const LAST_USER_KEY = 'last_logged_user_v3';
  
  const ADMIN_EMAIL = 'robokeff@gmail.com';
  const ADMIN_PASS = '9985';

  useEffect(() => {
    const lastUser = localStorage.getItem(LAST_USER_KEY);
    if (lastUser) {
      setRememberedUser(lastUser);
      setUsername(lastUser);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const normalizedUsername = username.trim().toLowerCase();
    
    if (!normalizedUsername) {
      setError('נא להזין כתובת אימייל');
      return;
    }

    if (pincode.length !== 4) {
      setError('קוד הגישה חייב להכיל בדיוק 4 ספרות');
      return;
    }

    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users: Record<string, UserAccount> = usersRaw ? JSON.parse(usersRaw) : {};

    if (isLogin) {
      // Priority Check: Admin Master Credentials
      if (normalizedUsername === ADMIN_EMAIL && pincode === ADMIN_PASS) {
        if (!users[normalizedUsername]) {
          users[normalizedUsername] = { 
              username: normalizedUsername, 
              password: ADMIN_PASS, 
              events: [],
              isAdmin: true
          };
        }
        completeLogin(normalizedUsername, users);
        return;
      }

      // Database Check
      const user = users[normalizedUsername];
      if (!user) {
        setError('משתמש זה אינו רשום במערכת. יש לעבור למסך הרשמה.');
        return;
      }

      if (user.password === pincode) {
        completeLogin(normalizedUsername, users);
      } else {
        setError('קוד הגישה אינו נכון');
      }
    } else {
      // Registration Logic
      if (users[normalizedUsername]) {
        setError('משתמש זה כבר רשום במערכת. נסו להתחבר.');
      } else {
        const newUser: UserAccount = { 
            username: normalizedUsername, 
            password: pincode, 
            events: [],
            isAdmin: normalizedUsername === ADMIN_EMAIL
        };
        users[normalizedUsername] = newUser;
        completeLogin(normalizedUsername, users);
      }
    }
  };

  const completeLogin = (userEmail: string, usersMap: Record<string, UserAccount>) => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(usersMap));
      localStorage.setItem(LAST_USER_KEY, userEmail);
      onLogin(userEmail);
    } catch (e) {
      setError('שגיאה בשמירת הנתונים במכשיר.');
    }
  };

  const handlePincodeChange = (val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(0, 4);
    setPincode(sanitized);
    // Auto-submit if 4 digits entered in quick login
    if (rememberedUser && sanitized.length === 4 && isLogin) {
       // We can't easily call handleSubmit here without the event, 
       // but the user will likely click login anyway.
    }
  };

  const switchAccount = () => {
    localStorage.removeItem(LAST_USER_KEY);
    setRememberedUser(null);
    setUsername('');
    setPincode('');
    setError('');
  };

  // QUICK LOGIN VIEW
  if (rememberedUser && isLogin) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 font-['Assistant']" dir="rtl">
        <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md p-12 overflow-hidden relative text-center border-t-8 border-indigo-600 animate-slideUp">
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-28 h-28 bg-indigo-100 rounded-[2.5rem] flex items-center justify-center text-indigo-600 border-4 border-white shadow-2xl rotate-3">
                  <UserCircle2 size={72} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-white">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-indigo-950 mb-2">שמחים שחזרת!</h2>
            <p className="text-gray-400 text-sm font-bold mb-10 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              {rememberedUser}
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="block text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">הקש קוד גישה לכניסה</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    autoFocus
                    required
                    autoComplete="one-time-code"
                    className="w-full px-6 py-6 rounded-[2rem] border-2 border-gray-50 bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-4xl tracking-[1.5rem] text-center pl-16 text-indigo-950 shadow-inner"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors p-2"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 animate-fadeIn">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-black leading-tight">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pincode.length !== 4}
                className={`w-full font-black py-5 rounded-[1.5rem] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                  pincode.length === 4 ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <LogIn size={24} />
                <span className="text-xl">היכנס עכשיו</span>
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <button
                onClick={switchAccount}
                className="text-gray-400 hover:text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-colors group"
              >
                <ArrowRight size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                זה לא החשבון שלי? התחבר עם אימייל אחר
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD LOGIN/REGISTER VIEW
  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 font-['Assistant']" dir="rtl">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-md p-12 overflow-hidden relative animate-fadeIn">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 rotate-12">
              <Heart size={40} className="fill-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-center text-indigo-950 mb-3">
            {isLogin ? 'יושבים בכיף' : 'הרשמה למערכת'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-12 font-bold leading-relaxed">
            {isLogin ? 'ניהול מוזמנים והושבה בדרך הפשוטה ביותר' : 'בחר אימייל וקוד גישה בן 4 ספרות'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-indigo-400 mr-2 uppercase tracking-[0.2em]">כתובת אימייל</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-indigo-950 placeholder:text-gray-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-indigo-400 mr-2 uppercase tracking-[0.2em]">קוד גישה (4 ספרות)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-3xl tracking-[1rem] text-center pl-16 text-indigo-950"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 animate-fadeIn">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-black leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
              <span className="text-xl">{isLogin ? 'כניסה למערכת' : 'סיום הרשמה'}</span>
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPincode('');
              }}
              className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors bg-indigo-50 px-6 py-2 rounded-full"
            >
              {isLogin ? 'אין לך חשבון? הרשם כאן' : 'כבר רשום? היכנס מכאן'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
