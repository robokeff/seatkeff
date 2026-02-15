
import React, { useState, useEffect } from 'react';
import { UserAccount, HallTemplate } from '../types';
import { Users, ShieldCheck, Calendar, Trash2, Edit2, UserPlus, X, Check, Eye, EyeOff, Key, ShieldAlert, Tag, Layout, Plus, Save } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'templates'>('users');
  const [userMap, setUserMap] = useState<Record<string, UserAccount>>({});
  const [globalConfig, setGlobalConfig] = useState<{ categories: string[] }>({ categories: [] });
  const [allTemplates, setAllTemplates] = useState<HallTemplate[]>([]);
  
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const USERS_DB_KEY = 'users_db_v3';
  const GLOBAL_CONFIG_KEY = 'global_config_v3';
  const ADMIN_EMAIL = 'robokeff@gmail.com';

  useEffect(() => {
    // Load Users
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : {};
    setUserMap(users);

    // Load Global Config (Categories)
    const globalRaw = localStorage.getItem(GLOBAL_CONFIG_KEY);
    if (globalRaw) {
      setGlobalConfig(JSON.parse(globalRaw));
    } else {
      const initial = { categories: ['משפחת החתן', 'משפחת הכלה', 'חברי החתן', 'חברי הכלה'] };
      setGlobalConfig(initial);
      localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(initial));
    }

    // Load All Templates
    const templates: HallTemplate[] = [];
    Object.values(users).forEach((u: any) => {
      if (u.hallTemplates) templates.push(...u.hallTemplates);
    });
    setAllTemplates(templates);
  }, []);

  const saveUsers = (updatedMap: Record<string, UserAccount>) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedMap));
    setUserMap(updatedMap);
  };

  const saveGlobalConfig = (updated: { categories: string[] }) => {
    localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(updated));
    setGlobalConfig(updated);
  };

  const handleOpenUserModal = (user: UserAccount | null = null) => {
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
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUsername = formUsername.trim().toLowerCase();
    const updatedMap = { ...userMap };
    if (editingUser && editingUser.username !== newUsername) delete updatedMap[editingUser.username];
    updatedMap[newUsername] = {
      ...(editingUser || { events: [], username: newUsername }),
      username: newUsername,
      password: formPassword,
      isAdmin: newUsername === ADMIN_EMAIL ? true : formIsAdmin
    };
    saveUsers(updatedMap);
    setIsUserModalOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !globalConfig.categories.includes(newCategory.trim())) {
      saveGlobalConfig({ categories: [...globalConfig.categories, newCategory.trim()] });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    saveGlobalConfig({ categories: globalConfig.categories.filter(c => c !== cat) });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('האם למחוק תבנית זו ממאגר המערכת?')) return;
    const updatedUsers = { ...userMap };
    Object.keys(updatedUsers).forEach(username => {
      if (updatedUsers[username].hallTemplates) {
        updatedUsers[username].hallTemplates = updatedUsers[username].hallTemplates!.filter(t => t.id !== templateId);
      }
    });
    saveUsers(updatedUsers);
    setAllTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const userList = Object.values(userMap);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-950 flex items-center gap-3">
            <ShieldCheck className="text-amber-500" size={32} /> ניהול מערכת
          </h1>
          <p className="text-gray-500 font-medium mt-1">ניהול משתמשים, קטגוריות וסקיצות אולם גלובליות</p>
        </div>
      </header>

      <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 gap-2 overflow-x-auto">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="משתמשים" />
        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Tag} label="קטגוריות גלובליות" />
        <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={Layout} label="תבניות אולמות" />
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
             <h3 className="font-black text-indigo-950">רשימת משתמשים במערכת</h3>
             <button onClick={() => handleOpenUserModal()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">חדש</button>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest">
                  <th className="px-8 py-6">משתמש</th>
                  <th className="px-8 py-6 text-center">קוד גישה</th>
                  <th className="px-8 py-6 text-center">סטטוס</th>
                  <th className="px-8 py-6 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Fix: Explicitly type user as UserAccount to avoid 'unknown' type errors during mapping */}
                {userList.map((user: UserAccount) => (
                  <tr key={user.username} className="hover:bg-gray-50 group">
                    <td className="px-8 py-5">
                      <span className="font-black text-indigo-950">{user.username}</span>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-indigo-900 tracking-widest">{user.password}</td>
                    <td className="px-8 py-5 text-center">
                      {user.isAdmin ? <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-xl text-[10px] font-black">ADMIN</span> : <span className="text-gray-300 font-bold text-[10px]">USER</span>}
                    </td>
                    <td className="px-8 py-5 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenUserModal(user)} className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"><Edit2 size={18} /></button>
                        {user.username !== ADMIN_EMAIL && <button onClick={() => { if(confirm('למחוק?')) { const m = {...userMap}; delete m[user.username]; saveUsers(m); } }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-indigo-950 mb-6 flex items-center gap-2"><Tag size={20} className="text-pink-500" /> קטגוריות ברירת מחדל</h3>
          <p className="text-gray-400 text-sm mb-8">קטגוריות אלו יופיעו אוטומטית בכל אירוע חדש שנוצר במערכת.</p>
          
          <div className="flex gap-2 mb-8">
            <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="שם קטגוריה חדשה..." className="flex-1 bg-gray-50 px-6 py-4 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500" />
            <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-8 rounded-2xl font-black"><Plus size={20} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalConfig.categories.map(cat => (
              <div key={cat} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl group border border-gray-100">
                <span className="font-bold text-indigo-950">{cat}</span>
                <button onClick={() => handleRemoveCategory(cat)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-indigo-950 mb-4 flex items-center gap-2"><Layout size={20} className="text-indigo-600" /> מאגר תבניות אולמות</h3>
            <p className="text-gray-400 text-sm mb-8">כאן ניתן לנהל את כל סקיצות האולמות שנשמרו על ידי המשתמשים.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTemplates.map(template => (
                <div key={template.id} className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] group hover:border-indigo-200 transition-all relative">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-black text-indigo-950">{template.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">נוצר ע"י: {template.createdBy}</p>
                      </div>
                      <button onClick={() => handleDeleteTemplate(template.id)} className="p-2 text-red-300 hover:text-red-500 bg-white rounded-xl shadow-sm"><Trash2 size={16} /></button>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex-1 bg-white p-3 rounded-xl text-center">
                        <p className="text-[9px] font-black text-gray-300 uppercase">שולחנות</p>
                        <p className="text-lg font-black text-indigo-600">{template.tables.length}</p>
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-xl text-center">
                        <p className="text-[9px] font-black text-gray-300 uppercase">אלמנטים</p>
                        <p className="text-lg font-black text-indigo-600">{template.elements.length}</p>
                      </div>
                   </div>
                </div>
              ))}
              {allTemplates.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-300 font-bold italic">לא נמצאו תבניות שמורות במערכת</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
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
              <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">שמור</button>
              <button type="button" onClick={() => setIsUserModalOpen(false)} className="w-full text-gray-400 font-bold py-2">ביטול</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
    <Icon size={16} />
    {label}
  </button>
);

export default AdminPanel;
