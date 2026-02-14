
import React from 'react';
import { Heart, CheckCircle, MapPin, Users, LayoutGrid, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 flex flex-col items-center justify-center p-6 text-white text-center" dir="rtl">
      <div className="max-w-4xl w-full space-y-12 animate-fadeIn">
        
        {/* Logo & Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-3xl backdrop-blur-md mb-4 animate-bounce">
            <Heart size={48} className="text-pink-400 fill-pink-400" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-2xl">
            יושבים בכיף
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 font-medium max-w-2xl mx-auto opacity-90 leading-relaxed">
            הפתרון החכם והפשוט ביותר לניהול הושבת מוזמנים באירועים. 
            בואו נעשה סדר בשולחנות, במשפחות ובחברים – כדי שכולם ירגישו הכי בבית.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 transition-transform hover:scale-105">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-300">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold">ניהול מוזמנים חכם</h3>
            <p className="text-sm text-indigo-200 opacity-70">חלוקה לקטגוריות: משפחה, חברים, חברי חתן/כלה ועוד.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 transition-transform hover:scale-105">
            <div className="p-3 bg-pink-500/20 rounded-2xl text-pink-300">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-lg font-bold">סידור שולחנות מהיר</h3>
            <p className="text-sm text-indigo-200 opacity-70">הקצאה קלה של אורחים לשולחנות לפי קיבולת והתאמה אישית.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-4 transition-transform hover:scale-105">
            <div className="p-3 bg-teal-500/20 rounded-2xl text-teal-300">
              <MapPin size={32} />
            </div>
            <h3 className="text-lg font-bold">סקיצת אולם דינמית</h3>
            <p className="text-sm text-indigo-200 opacity-70">תכנון ויזואלי של מיקום השולחנות באולם בגרירה נוחה.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <button
            onClick={onStart}
            className="group bg-white text-indigo-900 px-12 py-5 rounded-full text-2xl font-black shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-4 mx-auto animate-pulse hover:animate-none"
          >
            בואו נתחיל
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform" size={28} />
          </button>
          <p className="mt-6 text-indigo-300 text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            ללא הרשמה • הכל נשמר אצלך במכשיר
          </p>
        </div>
      </div>

      {/* Decorative Background Items */}
      <div className="absolute top-20 right-20 opacity-10 rotate-12 pointer-events-none hidden lg:block">
        <LayoutGrid size={200} />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 -rotate-12 pointer-events-none hidden lg:block">
        <Users size={200} />
      </div>
    </div>
  );
};

export default WelcomeScreen;
