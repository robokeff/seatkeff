
import React, { useState, useEffect } from 'react';
import { EventData } from '../types';
import { Heart, CheckCircle2, User, Baby, MapPin, MessageCircle, LayoutGrid, ShieldCheck, Navigation } from 'lucide-react';

interface GuestRSVPProps {
  eventId: string;
  event?: EventData;
}

const safeBtoa = (str: string) => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch (e) {
    return btoa(str);
  }
};

const GUEST_COLORS = [
  '#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', 
  '#8b5cf6', '#f43f5e', '#14b8a6', '#f97316', '#06b6d4'
];

const GuestRSVP: React.FC<GuestRSVPProps> = ({ eventId, event }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlEventName = urlParams.get('n');
  const urlVenue = urlParams.get('v');
  const urlCats = urlParams.get('cats')?.split(',') || [];

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<string>('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const displayEventName = event?.name || urlEventName || "האירוע שלנו";
  const displayVenue = event?.venue || urlVenue || "";
  const categories = event?.categories || urlCats;
  const address = event?.address;

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategory(categories[0]);
    } else {
      setCategory('משפחה');
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomColor = GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)];
    const guestData = { 
      name: name.trim(), 
      phone: phone.trim(), 
      category: category, 
      adults, 
      children, 
      confirmed: true, 
      tableId: null,
      color: randomColor
    };

    const encodedData = safeBtoa(JSON.stringify(guestData));
    const importUrl = `${window.location.origin}${window.location.pathname}?import=${encodedData}&eid=${eventId}`;
    
    let message = `היי! אנחנו מאשרים הגעה ל${displayEventName}:%0A👤 שם: ${name}%0A👥 מבוגרים: ${adults}%0A👶 ילדים: ${children}%0A🏷️ קטגוריה: ${category}%0A%0Aאנא לחץ על הקישור כדי לעדכן אותנו ברשימה שלך:%0A${importUrl}`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6 text-center" dir="rtl">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full animate-fadeIn border-t-8 border-green-500">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-3xl font-black text-indigo-950 mb-4">תודה רבה!</h2>
          <p className="text-gray-500 font-bold mb-8 leading-relaxed">אישור ההגעה שלך הופק בהצלחה. כעת, עליך לשלוח את ההודעה שנפתחה בוואטסאפ כדי לעדכן את המארח סופית.</p>
          
          {address && (
            <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
               <p className="text-xs font-black text-indigo-900 mb-3">צריכים ניווט לאולם?</p>
               <button 
                 onClick={() => window.open(`https://waze.com/ul?q=${encodeURIComponent(address)}`, '_blank')}
                 className="flex items-center justify-center gap-2 w-full bg-white border-2 border-indigo-100 py-3 rounded-xl text-indigo-600 font-black hover:bg-indigo-100 transition-all"
               >
                 <Navigation size={18} />
                 נווט ב-Waze
               </button>
            </div>
          )}

          <button 
            onClick={() => setSubmitted(false)} 
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            עדכון פרטים נוספים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4 font-['Assistant']" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-500 rounded-full blur-[100px]" />
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp relative z-10 border-t-8 border-pink-500">
        <header className="bg-gray-50/50 p-10 text-center border-b border-gray-100 relative">
          <div className="inline-flex p-4 bg-white rounded-[1.5rem] shadow-xl mb-6 relative z-10 rotate-3">
            <Heart size={40} className="text-pink-500 fill-pink-500" />
          </div>
          <h1 className="text-3xl font-black text-indigo-950 mb-2 relative z-10">אישור הגעה</h1>
          <p className="text-pink-600 font-black text-xl relative z-10 drop-shadow-sm">{displayEventName}</p>
          {displayVenue && (
            <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm mt-3 font-bold">
              <MapPin size={16} className="text-indigo-400" />
              {displayVenue}
            </div>
          )}
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase mr-1">שם המאשר / המשפחה</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 focus:bg-white outline-none transition-all font-black text-xl pr-14" 
                placeholder="למשל: משפחת כהן" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mr-1">מבוגרים</label>
              <input 
                type="number" 
                min="1" 
                required 
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 outline-none font-black text-2xl text-center" 
                value={adults} 
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mr-1">ילדים</label>
              <input 
                type="number" 
                min="0" 
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-pink-500 outline-none font-black text-2xl text-center" 
                value={children} 
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase mr-1">מי אנחנו עבור בעלי השמחה?</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(categories.length > 0 ? categories : ['משפחה', 'חברים', 'עבודה']).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-3 rounded-xl border-2 font-black text-xs transition-all ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-transparent text-gray-400 hover:border-indigo-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 group"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" /> 
            אישור הגעה בוואטסאפ
          </button>
          
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <ShieldCheck size={14} />
            <p className="text-[10px] font-bold">הלחיצה תפתח את הוואטסאפ לשליחת האישור</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestRSVP;
