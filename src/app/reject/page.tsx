'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Language } from '../../components/tma/types';
import { translations, getDefaultLanguage } from '../../components/tma/i18n';

export default function RejectPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('ru');
  const [isTg, setIsTg] = useState(false);

  useEffect(() => {
    // Detect language from Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      setIsTg(true);
      setLang(getDefaultLanguage());
    } else {
      // Fallback to browser language
      let detectedLang: Language = 'ru';
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'uz') detectedLang = 'uz';
      else if (browserLang === 'be') detectedLang = 'by';
      else if (browserLang === 'en') detectedLang = 'en';
      setLang(detectedLang);
    }

    // Try to trigger warning/error haptic feedback if inside Telegram
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.notificationOccurred('error');
      } catch (e) {
        console.warn('Failed to trigger haptic feedback:', e);
      }
    }
  }, []);

  const t = translations[lang].reject;

  const handleClose = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.close();
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 box-border font-sans max-w-[480px] mx-auto relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Animated Error Badge */}
        <div className="relative mb-8 flex items-center justify-center animate-bounce-short">
          {/* Pulsing outer rings */}
          <div className="absolute w-24 h-24 rounded-full bg-red-500/20 animate-ping-once" />
          <div className="absolute w-20 h-20 rounded-full bg-red-500/30 animate-pulse" />
          {/* Main solid circle */}
          <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        {/* Text Details */}
        <h1 className="text-2xl font-bold mb-4 tracking-tight text-white animate-fade-in">
          {t.title}
        </h1>
        <p className="text-white/60 text-sm leading-relaxed max-w-[280px] animate-fade-in-delayed">
          {t.subtitle}
        </p>
      </div>

      {/* Action Buttons at the Bottom */}
      <div className="flex flex-col gap-3 w-full animate-fade-in-up">
        <button
          onClick={handleBack}
          className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-[15px] cursor-pointer transition-all duration-200 active:scale-98 hover:bg-white/90 shadow-md shadow-white/10"
        >
          {t.backBtn}
        </button>

        {isTg && (
          <button
            onClick={handleClose}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-medium text-[15px] cursor-pointer transition-all duration-200 active:scale-98 hover:bg-white/10"
          >
            {t.closeBtn}
          </button>
        )}
      </div>
    </div>
  );
}
