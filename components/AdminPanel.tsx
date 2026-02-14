
import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { Users, ShieldCheck, Calendar, Trash2, Edit2, UserPlus, X, Check, Eye, EyeOff, Key, ShieldAlert } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [userMap, setUserMap] = useState<Record<string, UserAccount>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const USERS_DB_KEY = 'users_db_v3';
  const ADMIN_EMAIL = 'robokeff@gmail.com';

  useEffect(() => {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    if (usersRaw) setUserMap(JSON.parse(usersRaw));
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
    const newUsername = formUsername.trim().toLowerCase();
    if (!newUsername || formPassword.length !== 4) {
      setError('חובה להזין אימייל וקוד גישה בן 4 ספרות');
      return;
    }

    const updatedMap = { ...userMap };
    if (editingUser && editingUser.username !== newUsername) delete updatedMap[editingUser.username];

    // Ensure all required UserAccount properties are present when creating a new user
    updatedMap[newUsername] = {
      ...(editingUser || { events: [], username: newUsername }),
      username: newUsername,
      password: formPassword,
      isAdmin: newUsername === ADMIN_EMAIL ? true : formIsAdmin
    };

    saveToStorage(updatedMap);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (username: string) => {
    if (username === ADMIN_EMAIL) return alert('מנהל ראשי חסין למחיקה!');
    if (confirm(`למחוק את ${username}? הפעולה אינה הפיכה!`)) {
      const updatedMap = { ...userMap };
      delete updatedMap[username];
      saveToStorage(updatedMap);
    }
  };

  // Explicitly type userList to avoid 'unknown' inference from Object.values
  const userList: UserAccount[] = Object.values(userMap);
  const totalEvents = userList.reduce((acc, u) => acc + (u.events?.length || 0), 0);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={32} /> ניהול מערכת
          </h1>
          <p className="text-gray-500 font-medium mt-1">ניהול משתמשים, קודי גישה והרשאות רובוכיף</p>
        </div>
        <button onClick={() => handleOpenModal()} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-xl hover:bg-indigo-700 transition-all">
          <UserPlus size={20} /> משתמש חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={Users} color="indigo" label="משתמשים" val={userList.length} />
        <StatCard icon={Calendar} color="pink" label="אירועים" val={totalEvents} />
        <StatCard icon={Key} color="amber" label="קודי גישה" val="פעילים" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest">
              <th className="px-8 py-6">משתמש</th>
              <th className="px-8 py-6 text-center">אירועים</th>
              <th className="px-8 py-6 text-center">קוד גישה</th>
              <th className="px-8 py-6 text-center">סטטוס</th>
              <th className="px-8 py-6 text-left">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* Explicitly type the mapped item as UserAccount */}
            {userList.map((user: UserAccount) => (
              <tr key={user.username} className="hover:bg-gray-50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 uppercase">{user.username.charAt(0)}</div>
                    <span className="font-black text-indigo-950">{user.username}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center font-bold text-gray-400">{user.events?.length || 0}</td>
                <td className="px-8 py-5 text-center font-black text-indigo-900 tracking-widest">{user.password}</td>
                <td className="px-8 py-5 text-center">
                  {user.isAdmin ? <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black">מנהל</span> : <span className="text-gray-300 font-bold text-[10px]">משתמש</span>}
                </td>
                <td className="px-8 py-5 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(user)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit2 size={18} /></button>
                    {user.username !== ADMIN_EMAIL && <button onClick={() => handleDeleteUser(user.username)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 animate-slideUp">
            <h2 className="text-2xl font-black text-indigo-950 mb-8">{editingUser ? 'עריכת משתמש' : 'משתמש חדש'}</h2>
            <form onSubmit={handleSaveUser} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">אימייל המשתמש</label>
                <input type="email" required className="w-full px-5 py-4 rounded-2xl bg-gray-50 outline-none font-bold" value={formUsername} onChange={e => setFormUsername(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2">קוד גישה (4 ספרות)</label>
                <input type="password" maxLength={4} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 outline-none font-black text-2xl tracking-[1rem] text-center" value={formPassword} onChange={e => setFormPassword(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </div>
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
                <input type="checkbox" className="hidden" checked={formIsAdmin} onChange={e => setFormIsAdmin(e.target.checked)} disabled={formUsername === ADMIN_EMAIL} />
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${formIsAdmin ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200'}`}>{formIsAdmin && <Check size={14} className="text-white" />}</div>
                <span className="font-black text-sm text-indigo-950">הרשאות מנהל מערכת</span>
              </label>
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">שמור שינויים</button>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-gray-400 font-bold py-2">ביטול</button>
            </form>
          </div>
        </div>
      )}

      <footer className="mt-20 text-center opacity-40">
        <p className="text-[10px] font-black text-indigo-950 uppercase">ממשק ניהול רובוכיף בע"מ - כל הזכויות שמורות &copy;</p>
      </footer>
    </div>
  );
};

const StatCard = ({ icon: Icon, color, label, val }: { icon: any, color: string, label: string, val: any }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
    <div className={`p-4 bg-${color}-50 text-${color}-600 rounded-3xl`}><Icon size={28} /></div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-indigo-950">{val}</p>
    </div>
  </div>
);

export default AdminPanel;
