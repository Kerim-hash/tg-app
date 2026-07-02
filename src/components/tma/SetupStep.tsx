"use client";

import { useEffect, useState } from "react";
import GradientBlock from "../GradientBlock";
import SwipeSlider from "./SwipeSlider";
import type { HapticType } from "./types";

interface SetupStepProps {
  language: string;
  campaign: string;
  t: any;
  isAndroid: boolean;
  planPurchased: boolean;
  activeKey: string;
  copied: boolean;
  onCopy: () => void;
  onComplete: () => void;
  onSelectPlanForPayment?: (id: string) => void;
  onboardingPlans: any[];
  tempSelectedPlanId: string;
  setTempSelectedPlanId: (id: string) => void;
  selectedPlan: any;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
  getPlanLabelText: (periodMonths: number, lang: string) => string;
  getBilledFrequencyText: (periodMonths: number, lang: string, t: any) => string;
  setupTexts: {
    title: string;
    subtitle: string;
    step3: string;
    bottomNote: string;
  };
}

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.98543 17.9453C5.43867 17.9306 3.33203 12.7318 3.33203 10.0842C3.33203 5.75929 6.57644 4.81245 7.82681 4.81245C8.3903 4.81245 8.99199 5.03374 9.5227 5.22956C9.89381 5.36615 10.2776 5.50716 10.4911 5.50716C10.6189 5.50716 10.92 5.38721 11.1858 5.28196C11.7527 5.05627 12.4582 4.77576 13.2797 4.77576C13.2812 4.77576 13.2831 4.77576 13.2846 4.77576C13.898 4.77576 15.7579 4.91038 16.8761 6.58962L17.138 6.98323L16.7611 7.26768C16.2225 7.67402 15.2399 8.41524 15.2399 9.88349C15.2399 11.6225 16.3527 12.2912 16.8874 12.6129C17.1234 12.7548 17.3676 12.9012 17.3676 13.2214C17.3676 13.4305 15.6992 17.9194 13.2762 17.9194C12.6834 17.9194 12.2643 17.7412 11.8947 17.584C11.5206 17.4249 11.198 17.2878 10.6648 17.2878C10.3946 17.2878 10.0529 17.4156 9.69107 17.5512C9.19667 17.7357 8.63705 17.9453 8.00208 17.9453H7.98543Z" fill="black" />
    <path d="M13.539 0.833374C13.6021 3.10859 11.975 4.68703 10.3497 4.58803C10.0819 2.77233 11.9748 0.833374 13.539 0.833374Z" fill="black" />
  </svg>
);

const AndroidIcon = () => (
  <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.8793 3.37899L16.5383 0.505167C16.5828 0.428023 16.5949 0.336417 16.5721 0.250349C16.5492 0.164281 16.4933 0.0907428 16.4164 0.0457918C16.3784 0.0235037 16.3364 0.00897168 16.2928 0.00303712C16.2492 -0.00289744 16.2048 -0.000116585 16.1622 0.011219C16.1197 0.0225547 16.0798 0.0422197 16.0449 0.0690746C16.01 0.0959295 15.9808 0.129441 15.959 0.167667L14.2793 3.0786C12.9969 2.49267 11.5535 2.1665 10.0012 2.1665C8.44883 2.1665 7.00547 2.49306 5.72305 3.0786L4.04336 0.167667C3.9986 0.0905884 3.92506 0.0344458 3.83891 0.0115898C3.75276 -0.0112662 3.66106 0.00103654 3.58398 0.0457918C3.50691 0.0905471 3.45076 0.164089 3.42791 0.250238C3.40505 0.336388 3.41735 0.428088 3.46211 0.505167L5.11719 3.37899C2.25781 4.92743 0.319922 7.82313 0 11.213H20C19.6801 7.82313 17.7422 4.92743 14.8793 3.37899ZM5.4082 8.40439C5.24241 8.40439 5.08033 8.35522 4.94248 8.26311C4.80462 8.171 4.69718 8.04008 4.63373 7.8869C4.57028 7.73372 4.55368 7.56517 4.58603 7.40256C4.61837 7.23995 4.69821 7.09059 4.81545 6.97335C4.93268 6.85611 5.08205 6.77628 5.24466 6.74393C5.40727 6.71158 5.57582 6.72819 5.729 6.79163C5.88218 6.85508 6.0131 6.96253 6.10521 7.10038C6.19732 7.23823 6.24648 7.40031 6.24648 7.5661C6.24638 7.7884 6.15803 8.00156 6.00084 8.15874C5.84366 8.31593 5.6305 8.40428 5.4082 8.40439ZM14.5879 8.40439C14.4222 8.40369 14.2605 8.35394 14.1231 8.2614C13.9857 8.16887 13.8788 8.03771 13.8159 7.88447C13.753 7.73124 13.7369 7.5628 13.7697 7.40042C13.8024 7.23804 13.8825 7.089 13.9999 6.97212C14.1173 6.85523 14.2666 6.77574 14.4292 6.74368C14.5917 6.71162 14.76 6.72843 14.913 6.79198C15.066 6.85553 15.1967 6.96297 15.2887 7.10075C15.3806 7.23852 15.4297 7.40046 15.4297 7.5661C15.4296 7.67634 15.4079 7.78548 15.3656 7.88729C15.3233 7.9891 15.2614 8.08158 15.1834 8.15944C15.1053 8.23729 15.0127 8.299 14.9108 8.34103C14.8089 8.38306 14.6997 8.40459 14.5895 8.40439H14.5879Z" fill="black" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const DICT: Record<string, {
  googlePlay: string;
  appStore: string;
  windowsText: string;
  linuxText: string;
  macText: string;
  downloadWindows: string;
  downloadLinux: string;
  visitAppStore: string;
  oneMin: string;
  thirtySecs: string;
  twentySecs: string;
  step2Text: string;
  needHelp: string;
  swipeToStart: string;
}> = {
  en: {
    googlePlay: "Download Happ from Play Store",
    appStore: "Download Happ from App Store",
    windowsText: "Download Happ for Windows",
    linuxText: "Download Happ for Linux",
    macText: "Download Happ for macOS",
    downloadWindows: "DOWNLOAD FOR WINDOWS",
    downloadLinux: "DOWNLOAD FOR LINUX",
    visitAppStore: "VISIT APPSTORE",
    oneMin: "1 min",
    thirtySecs: "30 secs",
    twentySecs: "20 secs",
    step2Text: "Pick a plan, pay with card, crypto or Stars",
    needHelp: "Need help? Check the Guide tab or contact support",
    swipeToStart: "SWIPE TO START",
  },
  ru: {
    googlePlay: "Скачайте Happ в Google Play",
    appStore: "Скачайте Happ в App Store",
    windowsText: "Скачайте Happ для Windows",
    linuxText: "Скачайте Happ для Linux",
    macText: "Скачайте Happ для macOS",
    downloadWindows: "СКАЧАТЬ ДЛЯ WINDOWS",
    downloadLinux: "СКАЧАТЬ ДЛЯ LINUX",
    visitAppStore: "ПЕРЕЙТИ В APPSTORE",
    oneMin: "1 мин",
    thirtySecs: "30 сек",
    twentySecs: "20 сек",
    step2Text: "Выберите тариф, оплатите картой, криптовалютой или Stars",
    needHelp: "Нужна помощь? Загляните в руководство или напишите в поддержку",
    swipeToStart: "ПРОВЕДИТЕ ДЛЯ СТАРТА",
  },
  uz: {
    googlePlay: "Google Play'dan Happ ilovasini yuklab oling",
    appStore: "App Store'dan Happ ilovasini yuklab oling",
    windowsText: "Windows uchun Happ ilovasini yuklab oling",
    linuxText: "Linux uchun Happ ilovasini yuklab oling",
    macText: "macOS uchun Happ ilovasini yuklab oling",
    downloadWindows: "WINDOWS UCHUN YUKLAB OLISH",
    downloadLinux: "LINUX UCHUN YUKLAB OLISH",
    visitAppStore: "VISIT APPSTORE",
    oneMin: "1 daq",
    thirtySecs: "30 soniya",
    twentySecs: "20 soniya",
    step2Text: "Tarifni tanlang, karta, kriptovalyuta yoki Stars orqali to'lang",
    needHelp: "Yordam kerakmi? Qo'llanmaga qarang yoki yordam xizmatiga yozing",
    swipeToStart: "BOSHLASH UCHUN SURING",
  },
  by: {
    googlePlay: "Спампуйце Happ у Google Play",
    appStore: "Спампуйце Happ у App Store",
    windowsText: "Спампуйце Happ для Windows",
    linuxText: "Спампуйце Happ для Linux",
    macText: "Спампуйце Happ для macOS",
    downloadWindows: "СКАЧАЦЬ ДЛЯ WINDOWS",
    downloadLinux: "СКАЧАЦЬ ДЛЯ LINUX",
    visitAppStore: "VISIT APPSTORE",
    oneMin: "1 хв",
    thirtySecs: "30 сек",
    twentySecs: "20 сек",
    step2Text: "Абярыце тарыф, аплаціце картай, крыптавалютай або Stars",
    needHelp: "Патрэбна дапамога? Зазірніце ў кіраўніцтва або напішыце ў падтрымку",
    swipeToStart: "ПРАВЯДЗІЦЕ ДЛЯ СТАРТУ",
  }
};

export default function SetupStep({
  language,
  campaign,
  t,
  isAndroid,
  planPurchased,
  activeKey,
  copied,
  onCopy,
  onComplete,
  onSelectPlanForPayment,
  onboardingPlans,
  tempSelectedPlanId,
  setTempSelectedPlanId,
  selectedPlan,
  triggerHaptic,
  trackEvent,
  getPlanLabelText,
  getBilledFrequencyText,
  setupTexts,
}: SetupStepProps) {
  const [userOS, setUserOS] = useState<string>("iOS");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      if (/android/i.test(ua)) {
        setUserOS("Android");
      } else if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
        setUserOS("iOS");
      } else if (/Macintosh|MacIntel|MacPPC|MacHermes/.test(ua)) {
        setUserOS("MacOS");
      } else if (/Windows|Win32|Win64|Windows NT|Slight/.test(ua)) {
        setUserOS("Windows");
      } else if (/Linux/.test(ua)) {
        setUserOS("Linux");
      }
    }
  }, []);

  const currentDict = DICT[language] || DICT.en;
  const isAndroidPlatform = userOS === "Android";

  let step1Text = isAndroidPlatform
    ? currentDict.googlePlay
    : currentDict.appStore;

  if (userOS === "Windows") {
    step1Text = currentDict.windowsText;
  } else if (userOS === "Linux") {
    step1Text = currentDict.linuxText;
  } else if (userOS === "MacOS") {
    step1Text = currentDict.macText;
  }

  let downloadUrl = "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215";
  let buttonLabel = currentDict.visitAppStore;
  let PlatformIcon = AppleIcon;

  if (userOS === "Android") {
    downloadUrl = "https://play.google.com/store/apps/details?id=com.happproxy";
    buttonLabel = t.onboarding.visitAndroidStore;
    PlatformIcon = AndroidIcon;
  } else if (userOS === "Windows") {
    downloadUrl = "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe";
    buttonLabel = currentDict.downloadWindows;
    PlatformIcon = DownloadIcon;
  } else if (userOS === "Linux") {
    downloadUrl = "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb";
    buttonLabel = currentDict.downloadLinux;
    PlatformIcon = DownloadIcon;
  } else if (userOS === "MacOS") {
    downloadUrl = "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215";
    buttonLabel = currentDict.visitAppStore;
    PlatformIcon = AppleIcon;
  }

  return (
    <div className="w-full flex flex-col box-border flex-1">
      <h2 className="text-[24px] text-center text-white m-0 mb-1.5 leading-tight font-sans">
        {setupTexts.title}
      </h2>

      <p className="text-[16px] max-w-[320px] mx-auto text-center text-white/40 m-0 mb-6 leading-relaxed font-sans">
        {setupTexts.subtitle}
      </p>

      {campaign === "gaming" || campaign === "adults" ? (
        <div className="flex flex-col flex-1 justify-between mt-4 box-border">
          {/* 4 steps timeline container */}
          <div className="flex flex-col w-full mt-2 mb-5">
            {/* Step 1 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  1
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {step1Text}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {currentDict.oneMin}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  2
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {currentDict.step2Text}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {currentDict.thirtySecs}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex relative pb-6">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] rounded-xl bg-[#1A1A1A] flex items-center justify-center text-[14px] text-white font-mono">
                  3
                </div>
                <div className="absolute left-[17px] top-9 bottom-0.5 w-0 border-l-2 border-dotted border-white/15" />
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {setupTexts.step3}
                </span>
                <span className="text-[13px] text-brand-gray mt-1 font-sans">
                  {currentDict.twentySecs}
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex relative">
              {/* Left Column */}
              <div className="w-[34px] flex flex-col items-center shrink-0">
                <div className="w-[34px] h-[34px] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 6.66663H16.668C17.1282 6.66663 17.5013 7.03972 17.5013 7.49996V16.6666L14.7236 14.359C14.5739 14.2347 14.3856 14.1666 14.191 14.1666H7.5013C7.04106 14.1666 6.66797 13.7935 6.66797 13.3333V10.8333" stroke="#666666" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12.5 3.33337H3.33333C2.8731 3.33337 2.5 3.70647 2.5 4.16671V13.3334L5.27774 11.0257C5.42736 10.9014 5.61574 10.8334 5.81025 10.8334H12.5C12.9602 10.8334 13.3333 10.4603 13.3333 10V4.16671C13.3333 3.70647 12.9602 3.33337 12.5 3.33337Z" fill="#666666" stroke="#666666" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {/* Right Column */}
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-[15px] text-white font-normal font-sans leading-tight">
                  {currentDict.needHelp}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom slider area */}
          <div className="flex flex-col gap-5 w-full mt-auto pb-2.5 ">
            <p className="text-[14px] max-w-[280px] mx-auto text-white/40 text-center m-0 leading-relaxed font-sans">
              {setupTexts.bottomNote}
            </p>

            <SwipeSlider
              onComplete={onComplete}
              text={currentDict.swipeToStart}
              triggerHaptic={triggerHaptic}
            />
          </div>
        </div>
      ) : (
        // Guide checklist steps
        <div className="flex flex-col gap-4 w-full">
          {/* Step 1: Buy a plan */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                {planPurchased ? (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : "1"}
              </div>
              <span className={`text-[16px] font-sans ${planPurchased ? "text-white/40" : "text-white"}`}>
                {t.onboarding.buyPlanStep}
              </span>
            </div>

            {/* Plans card block */}
            {!planPurchased && (
              <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3 w-full box-border">
                  {onboardingPlans.map((plan) => {
                    const isYearly = plan.periodMonths === 12;
                    const isActive = tempSelectedPlanId === plan.id;

                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          if (tempSelectedPlanId === plan.id) {
                            triggerHaptic("medium");
                            trackEvent("onboarding_plans_cta_clicked", { trigger: "double_click" });
                            if (onSelectPlanForPayment) {
                              onSelectPlanForPayment(plan.id);
                            }
                          } else {
                            triggerHaptic("light");
                            setTempSelectedPlanId(plan.id);
                            const planType = plan.periodMonths === 12 ? "1_year" : plan.periodMonths === 1 ? "30_days" : `${plan.periodMonths}_months`;
                            const priceVal = plan.usdTotal ?? 0;
                            trackEvent("onboarding_plan_selected", { plan: planType, price: priceVal });
                          }
                        }}
                        className="w-full h-[170px] rounded-[45px] relative cursor-pointer overflow-hidden select-none"
                      >
                        <GradientBlock
                          label=""
                          primaryColor={isYearly ? "#5B1B85" : "#cfdfe5"}
                          secondaryColor={isYearly ? "#7F96D0" : "#606768"}
                          baseColor={isYearly ? "#5B1B85" : "#08090a"}
                          borderRadius="45px"
                          height="100%"
                          animate={isYearly}
                          glowIntensity={isYearly ? 1.2 : 0.25}
                          borderGlow={true}
                          solidGradient={isYearly ? "#5B1B85" : undefined}
                          solidBoxShadow={isYearly ? "inset 0 0 24px 0 rgba(230, 252, 255, 0.7), inset 0 0 24px -22px rgba(230, 252, 255, 0.1), inset 0 -35px 65px -1px rgba(64, 209, 253, 1), inset 0 48px 67px -56px rgba(93, 28, 137, 1)" : undefined}
                          enableHoverScale={false}
                          absoluteChildren={true}
                        >
                          {isActive && (
                            <div className="absolute inset-0 border-2 border-white rounded-[45px] pointer-events-none z-30" />
                          )}

                          <div className="absolute inset-0 flex flex-col justify-between p-4 px-3 pb-5 z-20 pointer-events-none box-border text-center items-center">
                            <span
                              className={`inline-block text-[11px] py-1.5 px-3.5 rounded-[20px] text-white font-sans ${
                                isYearly ? "bg-black/16" : "bg-white/8"
                              }`}
                            >
                              {getPlanLabelText(plan.periodMonths, language)}
                            </span>

                            <div>
                              <span className={`block text-[28px] text-white leading-none font-sans ${
                                language === "ru" || language === "by" ? "text-[24px]" : ""
                              }`}>
                                {`$ ${plan.usdPerMonth.toFixed(2)}`}
                              </span>
                              <span className={`block text-[10px] mt-0.5 font-sans ${isYearly ? "text-white/85" : "text-[#8A94A6]"}`}>
                                {t.home.perMonth}
                              </span>
                            </div>

                            <span className={`block text-[11px] font-sans ${isYearly ? "text-[#E0F2FE] opacity-90" : "text-[#8A94A6]"}`}>
                              {getBilledFrequencyText(plan.periodMonths, language, t)}
                            </span>
                          </div>
                        </GradientBlock>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-1">
                  <button
                    onClick={() => {
                      if (!tempSelectedPlanId) {
                        triggerHaptic("warning");
                        return;
                      }
                      triggerHaptic("medium");
                      trackEvent("onboarding_plans_cta_clicked", {});
                      if (onSelectPlanForPayment) {
                        onSelectPlanForPayment(tempSelectedPlanId);
                      }
                    }}
                    className={`cursor-pointer font-mono text-[12px] px-6 py-2.5 rounded-[14px] transition-all duration-250 ease-in-out ${
                      selectedPlan
                        ? "bg-white text-black border-none"
                        : "bg-white/2 text-white border border-white/20"
                    }`}
                  >
                    {selectedPlan
                      ? t.home.buyFor(
                          `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                          selectedPlan.starsPrice
                        ).toUpperCase()
                      : t.onboarding.selectAndBuy.toUpperCase()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dotted separator */}
          <div className="h-[1px] bg-[repeating-linear-gradient(to_right,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-1" />

          {/* Step 2: Get the app */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                2
              </div>
              <span className="text-[16px] text-white font-sans">
                {t.onboarding.getAppStep}
              </span>
            </div>

            <div className="flex justify-center w-full mt-1">
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  trackEvent("onboarding_connect_store_clicked", { platform: userOS });
                  window.open(downloadUrl, "_blank");
                }}
                className="my-1 mx-auto w-fit flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] bg-white text-black text-[12px] cursor-pointer border-none font-mono"
              >
                <PlatformIcon />
                {buttonLabel}
              </button>
            </div>
          </div>

          {/* Dotted separator */}
          <div className="h-[1px] bg-[repeating-linear-gradient(to_right,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-1" />

          {/* Step 3: Paste your key */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 items-center">
              <div className="w-[34px] h-[34px] rounded-xl bg-brand-dark-gray flex items-center justify-center text-[14px] text-white shrink-0 font-mono">
                3
              </div>
              <span className="text-[16px] text-white font-sans">
                {setupTexts.step3}
              </span>
            </div>

            {planPurchased && activeKey ? (
              <div className="flex flex-col gap-3 w-full mt-1">
                <GradientBlock
                  label=""
                  primaryColor="#cfdfe5"
                  secondaryColor="#686F70"
                  baseColor="#1D1C1B"
                  borderRadius="30px"
                  height="85px"
                  animate={false}
                  glowIntensity={0.6}
                  borderGlow={true}
                  enableMouseTracking={false}
                  enableHoverScale={false}
                  contentAlign="start"
                  padding="12px 28px"
                >
                  <span className="text-[13px] text-[#8E8E93] font-sans">
                    {t.guide.personalKeyLabel}
                  </span>
                  <span className="block w-full text-[16px] text-white font-sans whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                    {activeKey}
                  </span>
                </GradientBlock>

                <div className="flex justify-center">
                  <button
                    onClick={onCopy}
                    className={`font-mono text-[12px] px-6 py-3 rounded-[14px] cursor-pointer transition-all duration-200 ease-in-out ${
                      copied ? "bg-white/8 border border-white/12 text-white/40" : "bg-white border-none text-black"
                    }`}
                  >
                    {copied ? "✓ " + t.guide.copied.toUpperCase() : t.guide.copyKey.toUpperCase()}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full mt-1">
                <GradientBlock
                  label=""
                  primaryColor="#cfdfe5"
                  secondaryColor="#686F70"
                  baseColor="#1D1C1B"
                  borderRadius="30px"
                  height="auto"
                  animate={false}
                  glowIntensity={0.6}
                  borderGlow={true}
                  enableMouseTracking={false}
                  enableHoverScale={false}
                  contentAlign="start"
                  padding="16px 28px"
                >
                  <span className="text-[13px] text-[#8E8E93] font-sans">
                    {t.guide.personalKeyLabel}
                  </span>
                  <span className="block w-full text-[14px] text-white/60 font-sans leading-relaxed mt-1">
                    {t.guide.personalKeyEmptyState}
                  </span>
                </GradientBlock>
              </div>
            )}
          </div>

          {campaign !== "default" && (
            <div className="flex flex-col gap-5 w-full mt-4">
              <p className="text-[12px] text-white/40 text-center m-0 leading-relaxed font-sans">
                {setupTexts.bottomNote}
              </p>

              <SwipeSlider
                onComplete={onComplete}
                text={currentDict.swipeToStart}
                triggerHaptic={triggerHaptic}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
