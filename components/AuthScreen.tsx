
import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Heart, Eye, EyeOff, UserCircle2, ArrowRight, AlertCircle } from 'lucide-react';
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

  const USERS_DB_KEY = 'users_db_v2';
  const LAST_USER_KEY = 'last_logged_user_v2';
  
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
  };

  const switchAccount = () => {
    setRememberedUser(null);
    setUsername('');
    setPincode('');
    setError('');
  };

  if (rememberedUser && isLogin) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 font-['Assistant']" dir="rtl">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 overflow-hidden relative text-center">
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-4 border-white shadow-xl">
                <UserCircle2 size={64} />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-indigo-950 mb-1">ברוך הבא חזרה!</h2>
            <p className="text-gray-400 text-sm font-bold mb-8">{rememberedUser}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">הקש קוד גישה לכניסה מהירה</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    autoFocus
                    required
                    className="w-full px-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-3xl tracking-[1.5rem] text-center pl-16 text-indigo-950 shadow-inner"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition-colors p-2"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center gap-2 text-red-600 animate-fadeIn">
                  <AlertCircle size={16} className="shrink-0" />
                  <p className="text-xs font-black">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                <LogIn size={22} />
                <span className="text-lg">התחבר עכשיו</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <button
                onClick={switchAccount}
                className="text-gray-400 hover:text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <ArrowRight size={14} className="rotate-180" />
                זה לא החשבון שלי? התחברות אחרת
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 font-['Assistant']" dir="rtl">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-40"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-200">
              <Heart size={36} className="fill-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center text-indigo-950 mb-2">
            {isLogin ? 'ברוכים הבאים' : 'הרשמה למערכת'}
          </h2>
          <p className="text-gray-400 text-center text-sm mb-10 font-bold">
            {isLogin ? 'הזן אימייל וקוד גישה' : 'בחר קוד גישה בן 4 ספרות'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-500 mr-2 uppercase tracking-widest">אימייל</label>
              <input
                type="email"
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-indigo-950 placeholder:text-gray-300"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-500 mr-2 uppercase tracking-widest">קוד גישה (4 ספרות)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-2xl tracking-[1rem] text-center pl-16 text-indigo-950"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isLogin ? <LogIn size={22} /> : <UserPlus size={22} />}
              <span className="text-lg">{isLogin ? 'כניסה למערכת' : 'סיום הרשמה'}</span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPincode('');
              }}
              className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors"
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
