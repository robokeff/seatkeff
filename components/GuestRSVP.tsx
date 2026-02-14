
import React, { useState, useEffect } from 'react';
import { EventData } from '../types';
import { Heart, CheckCircle2, User, Baby, MapPin } from 'lucide-react';

interface GuestRSVPProps {
  eventId: string;
  event?: EventData;
}

// Unicode-safe btoa
const safeBtoa = (str: string) => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    ));
  } catch (e) {
    return btoa(str);
  }
};

const GuestRSVP: React.FC<GuestRSVPProps> = ({ eventId, event }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlEventName = urlParams.get('n');
  const urlVenue = urlParams.get('v');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<string>('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const displayEventName = event?.name || urlEventName || "האירוע שלנו";
  const displayVenue = event?.venue || urlVenue || "";

  useEffect(() => {
    if (event?.categories && event.categories.length > 0) {
      setCategory(event.categories[0]);
    } else {
      setCategory('חברים');
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const guestData = { 
      name: name.trim(), 
      phone: phone.trim(), 
      category: category, 
      adults, 
      children, 
      confirmed: true, 
      tableId: null 
    };

    // Use safe encoding for Hebrew support
    const encodedData = safeBtoa(JSON.stringify(guestData));
    const importUrl = `${window.location.origin}${window.location.pathname}?import=${encodedData}&eid=${eventId}`;
    
    const message = `היי! אנחנו מאשרים הגעה ל${displayEventName}:%0A👤 שם: ${name}%0A👥 מבוגרים: ${adults}%0A👶 ילדים: ${children}%0A%0Aלחץ על הקישור כדי לעדכן אותנו ברשימה שלך:%0A${importUrl}`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 text-center" dir="rtl">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full animate-fadeIn border-2 border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-indigo-950 mb-4">תודה רבה!</h2>
          <p className="text-gray-600 font-medium mb-8">אישור ההגעה שלך הופק. כעת שלח את ההודעה שנפתחה בוואטסאפ כדי לעדכן את המארח.</p>
          <button onClick={() => setSubmitted(false)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">עדכון פרטים</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-indigo-800 p-4 md:p-6 flex items-center justify-center font-['Assistant']" dir="rtl">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
        <header className="bg-indigo-50 p-8 text-center border-b border-indigo-100 relative">
          <div className="absolute top-4 right-4 text-indigo-200 opacity-20"><Heart size={80} /></div>
          <div className="inline-flex p-3 bg-white rounded-2xl shadow-sm mb-4 relative z-10"><Heart size={32} className="text-pink-500 fill-pink-500" /></div>
          <h1 className="text-3xl font-black text-indigo-950 mb-2 relative z-10">אישור הגעה</h1>
          <p className="text-indigo-600 font-bold text-lg relative z-10">{displayEventName}</p>
          {displayVenue && (
            <div className="flex items-center justify-center gap-1 text-indigo-400 text-sm mt-1 font-bold">
              <MapPin size={14} />
              {displayVenue}
            </div>
          )}
        </header>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-1">שם מלא של המאשר</label>
            <div className="relative">
              <input type="text" required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-lg pr-12" placeholder="למשל: משפחת כהן" value={name} onChange={(e) => setName(e.target.value)} />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-1">טלפון ליצירת קשר</label>
            <input type="tel" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-lg text-left" dir="ltr" placeholder="050-0000000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-1 flex items-center gap-2"><User size={12} /> מבוגרים</label>
              <input type="number" min="1" required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black text-xl text-center" value={adults} onChange={(e) => setAdults(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-1 flex items-center gap-2"><Baby size={12} /> ילדים</label>
              <input type="number" min="0" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-black text-xl text-center" value={children} onChange={(e) => setChildren(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mr-1">קשר לבעלי השמחה</label>
            <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg bg-white appearance-none cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
              {event?.categories ? (
                event.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
              ) : (
                <>
                  <option value="משפחה">משפחה</option>
                  <option value="חברים">חברים</option>
                  <option value="עבודה">עבודה</option>
                </>
              )}
            </select>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95">
            <CheckCircle2 size={24} /> 
            אישור הגעה בוואטסאפ
          </button>
          
          <p className="text-[10px] text-gray-400 text-center font-bold">הלחיצה תפתח את הוואטסאפ לשליחת האישור למארח</p>
        </form>
      </div>
    </div>
  );
};

export default GuestRSVP;
