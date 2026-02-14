
import React from 'react';
import { Heart, ArrowLeft, MessageCircle, Zap, Smartphone, LayoutGrid, Users, Phone, ShieldCheck, Star } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const WHATSAPP_NUMBER = '972549985605';
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('היי רובוכיף, אשמח לשמוע עוד על אפליקציית ניהול ההושבה ורכישת רישיון!')}`;

  return (
    <div className="min-h-screen bg-indigo-950 text-white font-['Assistant'] selection:bg-pink-500/30 overflow-x-hidden" dir="rtl">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
            <Heart size={24} className="text-pink-400 fill-pink-400" />
          </div>
          <span className="text-2xl font-black tracking-tight">יושבים בכיף</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">תמיכה טכנית</span>
              <span className="text-sm font-bold text-white">054-9985605</span>
           </div>
           <button 
             onClick={() => window.open(WHATSAPP_LINK, '_blank')}
             className="flex items-center gap-2 px-6 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-full text-xs font-black transition-all text-green-400"
           >
             <MessageCircle size={16} />
             צ'אט עם רובוכיף
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-12 pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4">
            <Star size={12} className="fill-indigo-300" /> פיתוח מקצועי מבית רובוכיף בע"מ
          </div>
          <h1 className="text-5xl md:text-8xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200">
            ניהול הושבה חכם <br /> <span className="text-pink-400">בסטנדרט עולמי</span>
          </h1>
          <p className="text-lg md:text-2xl text-indigo-100/70 font-medium max-w-2xl mx-auto leading-relaxed">
            הפתרון המקצועי ביותר בישראל לניהול מוזמנים, סידורי הושבה וסקיצות אולם. הופכים את הפקת האירוע שלכם לחוויה חלקה, מסודרת ויוקרתית.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-12 py-5 bg-white text-indigo-950 text-xl font-black rounded-3xl shadow-2xl hover:bg-indigo-50 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              כניסה למערכת
              <ArrowLeft size={24} />
            </button>
            <button
              onClick={() => window.open(WHATSAPP_LINK, '_blank')}
              className="w-full sm:w-auto px-12 py-5 bg-green-500/10 border-2 border-green-500/20 text-green-400 text-xl font-black rounded-3xl hover:bg-green-500/20 transition-all flex items-center justify-center gap-3"
            >
              <MessageCircle size={24} />
              לרכישת רישיון
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto">
          <BenefitCard 
            icon={Smartphone} 
            title="סנכרון Neon מהיר" 
            desc="גשו לנתונים מכל מקום - סמארטפון, טאבלט או מחשב. הכל מסונכרן מול מסד הנתונים בענן."
          />
          <BenefitCard 
            icon={LayoutGrid} 
            title="סקיצת אולם חכמה" 
            desc="מעבדת עיצוב אולמות בגרירה נוחה. תכננו את האולם בדיוק כפי שהוא נראה במציאות."
          />
          <BenefitCard 
            icon={Users} 
            title="ניהול אורחים" 
            desc="חלוקה לקטגוריות, מעקב אישורי הגעה והודעות וואטסאפ אוטומטיות לאורחים."
          />
        </div>

        {/* Brand Information Window */}
        <section className="mt-48 max-w-6xl mx-auto relative animate-fadeIn">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-110 pointer-events-none" />
          
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-10 md:p-20 overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="text-right space-y-8 flex-1">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/20 rounded-xl text-indigo-300 text-xs font-black uppercase tracking-widest">
                  <ShieldCheck size={16} /> פיתוח ישראלי מובטח
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-white to-indigo-400">
                  רובוכיף בע"מ
                </h2>
                <p className="text-indigo-100/60 font-medium text-xl leading-relaxed max-w-2xl">
                  חברת רובוכיף מובילה את מהפכת הניהול הדיגיטלי לאירועים בישראל. אנחנו מאמינים שכל אירוע מוצלח מתחיל בסדר ונגמר בחיוך. הצוות שלנו זמין עבורכם לכל שאלה, תמיכה טכנית או התאמה אישית של המערכת.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                  <ContactInfoItem 
                    icon={Phone} 
                    label="שיחת ייעוץ ותמיכה" 
                    value="054-9985605" 
                    href="tel:0549985605"
                  />
                  <ContactInfoItem 
                    icon={MessageCircle} 
                    label="וואטסאפ מהיר" 
                    value="זמינות מיידית" 
                    href={WHATSAPP_LINK}
                    color="green"
                  />
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col items-center gap-6 bg-indigo-600/10 p-12 md:p-16 rounded-[4rem] border border-white/5 shadow-inner">
                <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 border border-white/20">
                  <Zap size={64} className="text-white fill-white" />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-sm font-black text-indigo-300 uppercase tracking-[0.3em]">Established</p>
                   <p className="text-4xl font-black text-white">2026</p>
                </div>
                <button 
                  onClick={() => window.open(WHATSAPP_LINK, '_blank')}
                  className="mt-6 px-12 py-5 bg-white text-indigo-950 font-black text-lg rounded-3xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  הזמן רישיון עכשיו
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center opacity-30 pb-10">
            <p className="text-xs font-black tracking-[0.4em] uppercase text-indigo-300">
              Official Robokeff Software &copy; {new Date().getFullYear()} • Precision Seating Systems
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="group bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 hover:border-indigo-400/30 transition-all hover:-translate-y-2 text-right">
    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-black mb-3 text-white">{title}</h3>
    <p className="text-indigo-100/50 text-sm font-medium leading-relaxed">{desc}</p>
  </div>
);

const ContactInfoItem = ({ icon: Icon, label, value, href, color = "indigo" }: { icon: any, label: string, value: string, href: string, color?: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="text-right">
      <p className="text-xs font-black text-white/40 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  </a>
);

export default WelcomeScreen;
