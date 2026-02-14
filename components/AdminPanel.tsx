
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { Users, ShieldCheck, Calendar, Database, Trash2, Edit2, UserPlus, X, Check, Eye, EyeOff, ShieldAlert, Key } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [userMap, setUserMap] = useState<Record<string, UserAccount>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const USERS_DB_KEY = 'users_db_v2';
  const ADMIN_EMAIL = 'robokeff@gmail.com';

  // Initial data load
  useEffect(() => {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (usersRaw) {
      setUserMap(JSON.parse(usersRaw));
    }
  }, []);

  const saveToStorage = (updatedMap: Record<string, UserAccount>) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedMap));
    setUserMap(updatedMap);
  };

  const handleOpenModal = (user: UserAccount | null = null) => {
    setError('');
    setShowPassword(false);
    if (user) {
      setEditingUser(user);
      setFormUsername(user.username);
      setFormPassword(user.password || '');
      setFormIsAdmin(!!user.isAdmin);
    } else {
      setEditingUser(null);
      setFormUsername('');
      setFormPassword('');
      setFormIsAdmin(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newUsername = formUsername.trim().toLowerCase();
    
    if (!newUsername || !formPassword) {
      setError('חובה להזין אימייל וקוד גישה');
      return;
    }

    if (formPassword.length !== 4) {
      setError('קוד הגישה חייב להיות בדיוק 4 ספרות');
      return;
    }

    const updatedMap = { ...userMap };

    if (editingUser) {
      if (editingUser.username !== newUsername) {
        if (updatedMap[newUsername]) {
          setError('אימייל זה כבר רשום במערכת');
          return;
        }
        delete updatedMap[editingUser.username];
      }
      
      updatedMap[newUsername] = {
        ...editingUser,
        username: newUsername,
        password: formPassword,
        isAdmin: newUsername === ADMIN_EMAIL ? true : formIsAdmin,
        events: editingUser.events || []
      };
    } else {
      if (updatedMap[newUsername]) {
        setError('משתמש זה כבר קיים במערכת');
        return;
      }
      // Fix: removed 'categories' as it is not defined in UserAccount interface
      updatedMap[newUsername] = {
        username: newUsername,
        password: formPassword,
        isAdmin: formIsAdmin,
        events: []
      };
    }

    saveToStorage(updatedMap);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (username: string) => {
    if (username === ADMIN_EMAIL) {
      alert('לא ניתן למחוק את מנהל המערכת הראשי!');
      return;
    }
    if (confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${username}? כל האירועים שלו יימחקו לצמיתות!`)) {
      const updatedMap = { ...userMap };
      delete updatedMap[username];
      saveToStorage(updatedMap);
    }
  };

  const handlePincodeChange = (val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(0, 4);
    setFormPassword(sanitized);
  };

  const userList: UserAccount[] = Object.values(userMap);
  const totalEvents = userList.reduce((acc, user) => acc + (user.events?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-12 font-['Assistant']" dir="rtl">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-950 flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={32} />
            ניהול משתמשים
          </h1>
          <p className="text-gray-500 mt-1 font-medium">צפייה וניהול של כל המשתמשים וקודי הגישה במערכת</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus size={20} />
          משתמש חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">סה"כ משתמשים</p>
            <p className="text-3xl font-black text-indigo-950">{userList.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">סה"כ אירועים</p>
            <p className="text-3xl font-black text-indigo-950">{totalEvents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Key size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">אבטחת מערכת</p>
            <p className="text-xl font-black text-indigo-950">קודי גישה פעילים</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 font-black uppercase text-[10px] tracking-widest">
                <th className="px-8 py-6">פרטי המשתמש</th>
                <th className="px-8 py-6 text-center">אירועים</th>
                <th className="px-8 py-6 text-center">קוד גישה</th>
                <th className="px-8 py-6 text-center">סטטוס</th>
                <th className="px-8 py-6 text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userList.map((user) => (
                <tr key={user.username} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-indigo-400 uppercase">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-indigo-950 text-base">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-black text-xs">
                      <Calendar size={12} />
                      {user.events?.length || 0}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-black text-indigo-900 bg-gray-50 px-3 py-1 rounded-lg tracking-widest">
                      {user.password || '----'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {user.isAdmin ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 justify-center w-fit mx-auto">
                        <ShieldCheck size={12} /> מנהל מערכת
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 justify-center w-fit mx-auto">
                        משתמש רגיל
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="text-gray-300 hover:text-indigo-600 transition-all p-2 rounded-lg hover:bg-indigo-50"
                        title="ערוך משתמש"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.username !== ADMIN_EMAIL && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          className="text-gray-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50"
                          title="מחק משתמש"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-indigo-950">
                  {editingUser ? 'עריכת משתמש' : 'משתמש חדש'}
                </h2>
                <p className="text-xs text-gray-500 font-bold">
                  {editingUser ? `מעדכן את ${editingUser.username}` : 'יוצר חשבון חדש במערכת'}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <X size={24} />
              </button>
            </header>

            <form onSubmit={handleSaveUser} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mr-1">אימייל המשתמש</label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-indigo-950"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mr-1">קוד גישה (4 ספרות)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-2xl tracking-[0.5rem] text-center text-indigo-950"
                    value={formPassword}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  formIsAdmin ? 'border-amber-500 bg-amber-50' : 'border-gray-100 hover:border-gray-200'
                }`}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formIsAdmin}
                    onChange={(e) => setFormIsAdmin(e.target.checked)}
                    disabled={formUsername === ADMIN_EMAIL}
                  />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    formIsAdmin ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-black ${formIsAdmin ? 'text-amber-700' : 'text-gray-700'}`}>הרשאות מנהל מערכת</p>
                    <p className="text-[10px] font-bold text-gray-400">גישה מלאה לניהול משתמשים ונתונים</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    formIsAdmin ? 'border-amber-500 bg-amber-500' : 'border-gray-200'
                  }`}>
                    {formIsAdmin && <Check size={14} className="text-white" />}
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 items-center animate-fadeIn">
                  <div className="bg-red-500 text-white p-1 rounded-lg">
                    <X size={14} />
                  </div>
                  <p className="text-red-600 text-[11px] font-black">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Check size={20} />
                  שמור שינויים
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-black transition-all"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
