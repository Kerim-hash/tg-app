"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import WebApp from "@twa-dev/sdk";
import type { Plan, PaymentMethod, Translations, HapticType, Tab } from "./types";
import GradientBlock from "../GradientBlock";
import { trackEvent } from "../../lib/mixpanel";
import { apiCall } from "./api";

function getPlanLabelText(periodMonths: number, lang: string): string {
  if (periodMonths === 12) {
    if (lang === "uz") return "60% chegirma";
    if (lang === "by") return "Зніжка 60%";
    if (lang === "ru") return "Скидка 60%";
    return "Save 60%";
  }
  if (lang === "ru") {
    if (periodMonths === 1) return "30 дней";
    if (periodMonths === 3) return "3 месяца";
    if (periodMonths === 6) return "6 месяцев";
    return `${periodMonths} мес.`;
  } else if (lang === "uz") {
    if (periodMonths === 1) return "30 kun";
    if (periodMonths === 3) return "3 oy";
    if (periodMonths === 6) return "6 oy";
    return `${periodMonths} oy`;
  } else if (lang === "by") {
    if (periodMonths === 1) return "30 дзён";
    if (periodMonths === 3) return "3 месяцы";
    if (periodMonths === 6) return "6 месяцаў";
    return `${periodMonths} мес.`;
  } else {
    if (periodMonths === 1) return "30 Days";
    if (periodMonths === 3) return "3 Months";
    if (periodMonths === 6) return "6 Months";
    return `${periodMonths} Months`;
  }
}

function getBilledFrequencyText(periodMonths: number, lang: string, t: any): string {
  if (periodMonths === 12) {
    if (lang === "uz") return "Oyiga $4";
    if (lang === "by") return "$4 у месяц";
    if (lang === "ru") return "$4 в месяц";
    return "$4 per month";
  }
  if (periodMonths === 1) {
    return t.home.billedMonthly;
  }
  if (lang === "ru") {
    if (periodMonths === 3) return "Оплата каждые 3 месяца";
    if (periodMonths === 6) return "Оплата каждые 6 месяцев";
    return `Оплата каждые ${periodMonths} мес.`;
  } else if (lang === "uz") {
    if (periodMonths === 3) return "Har 3 oyda to'lov";
    if (periodMonths === 6) return "Har 6 oyda to'lov";
    return `Har ${periodMonths} oyda to'lov`;
  } else if (lang === "by") {
    if (periodMonths === 3) return "Аплата кожныя 3 месяцы";
    if (periodMonths === 6) return "Аплата кожныя 6 месяцаў";
    return `Аплата кожныя ${periodMonths} мес.`;
  } else {
    return `Billed every ${periodMonths} months`;
  }
}

const SERVERS_ROW1 = [
  { name: "Albania", flag: "🇦🇱" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "France", flag: "🇫🇷" },
];

const SERVERS_ROW2 = [
  { name: "Germany", flag: "🇩🇪" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Spain", flag: "🇪🇸" },
];

const SERVERS_ROW3 = [
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "United States", flag: "🇺🇸" },
];
interface GuideScreenProps {
  t: Translations;
  personalKey?: string;
  onOpenSupportForm?: () => void;
  triggerHaptic: (type: HapticType) => void;
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan | null) => void;
  onProceedPayment: (method: PaymentMethod) => Promise<void>;
  isPaying: boolean;
  billingRegion: string;
  onBillingRegionChange: (region: string) => void;
  paymentMethods?: any[];
  expiration?: string;
  paymentMethodSaved?: boolean;
}

const REGION_OPTIONS = [
  { value: "UAE" },
  { value: "UZB" },
  { value: "BY" },
];

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

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px dashed rgba(255, 255, 255, 0.1)" }}>
      <button
        onClick={() => {
          if (!isOpen) {
            trackEvent("faq_item_expanded", { section: "faq", question_id: question });
          }
          setIsOpen(!isOpen);
        }}
        style={{
          width: "100%",
          padding: "16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          color: isOpen ? "#40D1FD" : "#fff",
          fontSize: "16px",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          fontWeight: 400,
        }}
      >
        <span>{question}</span>
        <span style={{ fontSize: "16px", color: "#8A94A6", fontWeight: 400 }}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "200px" : "0",
          overflow: "hidden",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "14px",
          color: "#fff",
          lineHeight: 1.5,
          paddingBottom: isOpen ? "16px" : "0",
        }}
      >
        {answer}
      </div>
    </div>
  );
};

export default function GuideScreen({
  t,
  personalKey,
  onOpenSupportForm,
  triggerHaptic,
  plans,
  selectedPlan,
  onSelectPlan,
  onProceedPayment,
  isPaying,
  billingRegion,
  onBillingRegionChange,
  paymentMethods = [],
  expiration,
  paymentMethodSaved = false,
}: GuideScreenProps) {
  const language = t.nav.home === "Главная" ? "ru" : t.nav.home === "Bosh sahifa" ? "uz" : t.nav.home === "Галоўная" ? "by" : "en";
  const [copied, setCopied] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sheetRegionDropdownOpen, setSheetRegionDropdownOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState("UAE");
  const [userOS, setUserOS] = useState<string>("iOS");

  const sheetRegionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let platform = WebApp.platform?.toLowerCase();
      if (platform === "android") {
        setUserOS("Android");
      } else if (platform === "ios") {
        setUserOS("iOS");
      } else if (platform === "macos") {
        setUserOS("MacOS");
      } else {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) {
          setUserOS("Android");
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
          setUserOS("iOS");
        } else if (/mac/.test(userAgent)) {
          setUserOS("MacOS");
        } else if (/win/.test(userAgent)) {
          setUserOS("Windows");
        } else if (/linux/.test(userAgent)) {
          setUserOS("Linux");
        }
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (sheetRegionDropdownOpen && sheetRegionDropdownRef.current && !sheetRegionDropdownRef.current.contains(event.target as Node)) {
        setSheetRegionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [sheetRegionDropdownOpen]);

  const getRegionLabel = (val: string) => {
    if (val === "UZB") return t.payment.regionUZB;
    if (val === "BY") return t.payment.regionBY;
    return t.payment.regionUAE;
  };

  useEffect(() => {
    if (billingRegion) {
      setTempRegion(billingRegion);
    } else {
      setTempRegion("UAE");
    }
  }, [billingRegion]);

  const step2Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === step2Ref.current) {
              trackEvent("plan_selector_viewed", { source: "guide_step_2" });
              observer.unobserve(entry.target);
            }
            if (entry.target === step4Ref.current) {
              trackEvent("server_list_viewed", { step: 4, servers_count: 18 });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (step2Ref.current) observer.observe(step2Ref.current);
    if (step4Ref.current) observer.observe(step4Ref.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMounted(true);
    trackEvent("screen_guide_viewed", { referrer: "tab" }); // Simplified referrer tracking
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    if (isPaymentSheetOpen) {
      mainEl.style.overflowY = "hidden";
    } else {
      mainEl.style.overflowY = "auto";
    }
    return () => {
      mainEl.style.overflowY = "auto";
    };
  }, [isPaymentSheetOpen]);

  const activeKey = personalKey || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    triggerHaptic("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenLink = (url: string) => {
    triggerHaptic("light");
    try {
      WebApp.openLink(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  const PLATFORM_DICT: Record<string, Record<string, { step1Text: string; buttonLabel: string }>> = {
    en: {
      Android: {
        step1Text: "Download and Install the free Happ client from Google Play",
        buttonLabel: "DOWNLOAD FOR ANDROID",
      },
      Windows: {
        step1Text: "Download and Install the free Happ client for Windows",
        buttonLabel: "DOWNLOAD FOR WINDOWS",
      },
      Linux: {
        step1Text: "Download and Install the free Happ client for Linux",
        buttonLabel: "DOWNLOAD FOR LINUX",
      },
      MacOS: {
        step1Text: "Download and Install the free Happ client from the App Store",
        buttonLabel: "VISIT APPSTORE",
      },
      TV: {
        step1Text: "Download and Install the free Happ client for Apple TV",
        buttonLabel: "VISIT APPSTORE",
      }
    },
    ru: {
      Android: {
        step1Text: "Скачайте и установите бесплатное приложение Happ из Google Play",
        buttonLabel: "СКАЧАТЬ ДЛЯ ANDROID",
      },
      Windows: {
        step1Text: "Скачайте и установите бесплатное приложение Happ для Windows",
        buttonLabel: "СКАЧАТЬ ДЛЯ WINDOWS",
      },
      Linux: {
        step1Text: "Скачайте и установите бесплатное приложение Happ для Linux",
        buttonLabel: "СКАЧАТЬ ДЛЯ LINUX",
      },
      MacOS: {
        step1Text: "Скачайте и установите бесплатное приложение Happ из App Store",
        buttonLabel: "ПЕРЕЙТИ В APPSTORE",
      },
      TV: {
        step1Text: "Скачайте и установите бесплатное приложение Happ для Apple TV",
        buttonLabel: "ПЕРЕЙТИ В APPSTORE",
      }
    },
    uz: {
      Android: {
        step1Text: "Google Play'dan bepul Happ ilovasini yuklab oling va o'rnating",
        buttonLabel: "ANDROID UCHUN YUKLAB OLISH",
      },
      Windows: {
        step1Text: "Windows uchun bepul Happ ilovasini yuklab oling va o'rnating",
        buttonLabel: "WINDOWS UCHUN YUKLAB OLISH",
      },
      Linux: {
        step1Text: "Linux uchun bepul Happ ilovasini yuklab oling va o'rnating",
        buttonLabel: "LINUX UCHUN YUKLAB OLISH",
      },
      MacOS: {
        step1Text: "App Store'dan bepul Happ ilovasini yuklab oling va o'rnating",
        buttonLabel: "APPSTORE'GA O'TISH",
      },
      TV: {
        step1Text: "Apple TV uchun bepul Happ ilovasini yuklab oling va o'rnating",
        buttonLabel: "APPSTORE'GA O'TISH",
      }
    },
    by: {
      Android: {
        step1Text: "Спампуйце і ўсталюйце бясплатнае прыкладанне Happ з Google Play",
        buttonLabel: "СПАМПАВАЦЬ ДЛЯ ANDROID",
      },
      Windows: {
        step1Text: "Спампуйце і ўсталюйце бясплатнае прыкладанне Happ для Windows",
        buttonLabel: "СПАМПАВАЦЬ ДЛЯ WINDOWS",
      },
      Linux: {
        step1Text: "Спампуйце і ўсталюйце бясплатнае прыкладанне Happ для Linux",
        buttonLabel: "СПАМПАВАЦЬ ДЛЯ LINUX",
      },
      MacOS: {
        step1Text: "Спампуйце і ўсталюйце бясплатнае прыкладанне Happ з App Store",
        buttonLabel: "ПЕРАЙСЦІ Ў APPSTORE",
      },
      TV: {
        step1Text: "Спампуйце і ўсталюйце бясплатнае прыкладанне Happ для Apple TV",
        buttonLabel: "ПЕРАЙСЦІ Ў APPSTORE",
      }
    }
  };

  // ─── Platform-specific content ───────────────────────────────────────────
  let downloadUrl = "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215";
  let step1Text = t.guide.step1Title;
  let buttonLabel = t.guide.visitAppStore;
  let PlatformIcon = AppleIcon;

  const currentPlatformDict = PLATFORM_DICT[language] || PLATFORM_DICT.en;

  if (userOS === "Android") {
    downloadUrl = "https://play.google.com/store/apps/details?id=com.happproxy";
    step1Text = currentPlatformDict.Android.step1Text;
    buttonLabel = currentPlatformDict.Android.buttonLabel;
    PlatformIcon = AndroidIcon;
  } else if (userOS === "Windows") {
    downloadUrl = "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe";
    step1Text = currentPlatformDict.Windows.step1Text;
    buttonLabel = currentPlatformDict.Windows.buttonLabel;
    PlatformIcon = DownloadIcon;
  } else if (userOS === "Linux") {
    downloadUrl = "https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb";
    step1Text = currentPlatformDict.Linux.step1Text;
    buttonLabel = currentPlatformDict.Linux.buttonLabel;
    PlatformIcon = DownloadIcon;
  } else if (userOS === "MacOS") {
    downloadUrl = "https://apps.apple.com/us/app/happ-proxy-utility/id6504287215";
    step1Text = currentPlatformDict.MacOS.step1Text;
    buttonLabel = currentPlatformDict.MacOS.buttonLabel;
    PlatformIcon = AppleIcon;
  } else if (userOS === "TV") {
    downloadUrl = "https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274";
    step1Text = currentPlatformDict.TV.step1Text;
    buttonLabel = currentPlatformDict.TV.buttonLabel;
    PlatformIcon = AppleIcon;
  }

  return (
    <div
      style={{
        padding: "calc(76px + env(safe-area-inset-top, 0px)) 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            opacity: 0;
            animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .hover-scale-btn {
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
          }
          @keyframes drawerSlideUp {
            from {
              transform: translate(-50%, 100%);
            }
            to {
              transform: translate(-50%, 0);
            }
          }
          @keyframes backdropFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-drawer {
            animation: drawerSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-backdrop {
            animation: backdropFadeIn 0.3s ease forwards;
          }
        `,
      }} />

      {/* Nav title */}
      <p
        className="animate-fade-in-up"
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#40D1FD",
          fontFamily: "JetBrains Mono",
          margin: 0,
          animationDelay: "0ms",
        }}
      >
        {t.guide.title}
      </p>

      {/* Header heading */}
      <div
        className="animate-fade-in-up"
        style={{ textAlign: "center", animationDelay: "100ms" }}
      >
        <h1
          style={{
            fontSize: "24px",
            color: "#fff",
            marginTop: "30px"
          }}
        >
          {t.guide.subtitle}<br />
          <span style={{ fontSize: "24px", color: "#666666", margin: 0 }}>
            {t.guide.withBrand}
          </span>
        </h1>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Step 1 */}
        <div
          className="animate-fade-in-up"
          style={{ display: "flex", flexDirection: "column", gap: "12px", animationDelay: "200ms" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                background: "#1A1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#fff",
                flexShrink: 0,
                fontFamily: "JetBrains Mono",
              }}
            >
              1
            </div>
            <span style={{ fontSize: "16px", color: "#fff", lineHeight: 1.4 }}>
              {step1Text}
            </span>
          </div>

          <button
            className="hover-scale-btn"
            onClick={() => {
              trackEvent("appstore_link_tapped", { step: 1 });
              handleOpenLink(downloadUrl);
            }}
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "10px 15px",
              borderRadius: "12px",
              background: "#fff",
              color: "#000",
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: "JetBrains Mono",
              marginTop: "4px",
            }}
          >
            <PlatformIcon />
            {buttonLabel}
          </button>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 1px, transparent 1px, transparent 8px)",
            margin: "4px 0 16px",
            animationDelay: "250ms",
          }}
        />

        {/* Step 2 */}
        <div
          className="animate-fade-in-up"
          style={{ display: "flex", flexDirection: "column", gap: "12px", animationDelay: "300ms" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                background: "#1A1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#fff",
                flexShrink: 0,
                fontFamily: "JetBrains Mono",
              }}
            >
              2
            </div>
            <span style={{ fontSize: "16px", color: "#fff", lineHeight: 1.4 }}>
              {t.guide.step2Title}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "4px" }} ref={step2Ref}>
            {paymentMethodSaved ? (
              <div
                style={{
                  width: "100%",
                  borderRadius: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "24px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "24px",
                    background: "rgba(0, 209, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#00D1FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-mono), monospace" }}>
                  {t.home.autoRenewalActive}
                </span>
                <span style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.45)", lineHeight: 1.4 }}>
                  {t.home.autoRenewalDesc}
                </span>
              </div>
            ) : (
              <>
                {/* Interactive plan selection */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "100%" }}>
              {plans.map((plan) => {
                const isYearly = plan.periodMonths === 12;
                const isActive = selectedPlan?.id === plan.id;

                return (
                  <button
                    key={plan.id}
                    className="hover-scale-btn"
                    onClick={() => {
                      triggerHaptic("light");
                      onSelectPlan(plan);
                    }}
                    style={{
                      width: "100%",
                      height: "170px",
                      borderRadius: "45px",
                      position: "relative",
                      cursor: "pointer",
                      border: "none",
                      outline: "none",
                      overflow: "hidden",
                      background: "transparent",
                      padding: 0,
                    }}
                  >
                    <GradientBlock
                      label=""
                      primaryColor={isYearly ? "#5B1B85" : "#cfdfe5"}
                      secondaryColor={isYearly ? "#7F96D0" : "#606768"}
                      baseColor={isYearly ? "#5B1B85" : "#08090a"}
                      borderRadius="45px"
                      height="100%"
                      animate={isYearly}
                      glowIntensity={isYearly ? .3 : 0.5}
                      borderGlow={true}
                      solidGradient={isYearly ? "#5B1B85" : undefined}
                      solidBoxShadow={isYearly ? "inset 0 0 24px 0 rgba(230, 252, 255, 0.7), inset 0 0 24px -22px rgba(230, 252, 255, 0.1), inset 0 -35px 65px -1px rgba(64, 209, 253, 1), inset 0 48px 67px -56px rgba(93, 28, 137, 1)" : undefined}
                      absoluteChildren={true}
                      enableHoverScale={false}
                    >
                      {/* Border and Checkmark Icon Overlay when Selected */}
                      {isActive && (
                        <>
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              border: "2px solid #6C63FF",
                              borderRadius: "45px",
                              pointerEvents: "none",
                              zIndex: 30,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "16px",
                              right: "16px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: "#6C63FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              pointerEvents: "none",
                              zIndex: 30,
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </>
                      )}

                      {/* Overlay Content */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "15px 12px 22px",
                          pointerEvents: "none",
                          boxSizing: "border-box",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderRadius: "20px",
                            background: isYearly ? "rgba(0, 0, 0, 0.16)" : "#353534",
                            color: "#fff",
                            letterSpacing: "-6%",
                            fontFamily: "JetBrains Mono, monospace",
                            textTransform: "capitalize"
                          }}
                        >
                          {getPlanLabelText(plan.periodMonths, language)}
                        </span>
                        <div>
                          <span style={{
                            display: "block",
                            fontSize: language === "ru" || language === "by" || language === "uz" ? "18px" : "22px",
                            color: "#fff",
                            lineHeight: 1.1,
                            letterSpacing: "-0.02em"
                          }}>
                            {isYearly ? (
                              language === "uz" ? "$48 / yil" :
                              language === "by" ? "$48 / год" :
                              language === "ru" ? "$48 / год" : "$48 / year"
                            ) : (
                              `$ ${plan.usdPerMonth.toFixed(2)}`
                            )}
                          </span>
                          {!isYearly && (
                            <span style={{ display: "block", fontSize: "14px", color: isYearly ? "rgba(255,255,255,0.85)" : "#fff", marginTop: "2px" }}>
                              {t.home.perMonth}
                            </span>
                          )}
                        </div>
                        <span style={{ display: "block", fontSize: "14px", color: isYearly ? "#8EBCDC" : "#797978" }}>
                          {getBilledFrequencyText(plan.periodMonths, language, t)}
                        </span>
                      </div>
                    </GradientBlock>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "center", position: "relative" }} className="group">
              <button
                className={selectedPlan ? "hover-scale-btn" : ""}
                disabled={!selectedPlan}
                onClick={() => {
                  triggerHaptic("medium");
                  if (selectedPlan) {
                    trackEvent("guide_select_and_buy_tapped", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", price: selectedPlan.starsPrice || selectedPlan.usdTotal });
                    setLocalSelectedMethod(null);
                    setIsPaymentSheetOpen(true);
                  }
                }}
                style={{
                  width: "280px",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  background: selectedPlan ? "#FFFFFF" : "rgba(255, 255, 255, 0.05)",
                  border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                  color: selectedPlan ? "#000000" : "rgba(255, 255, 255, 0.3)",
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                  cursor: selectedPlan ? "pointer" : "default",
                  outline: "none",
                  fontFamily: "var(--font-mono), monospace",
                  transition: "all 0.25s ease",
                }}
              >
                {selectedPlan
                  ? t.home.buyFor(
                    `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                    selectedPlan.starsPrice
                  )
                  : t.onboarding.selectAndBuy.toUpperCase()}
              </button>
              {!selectedPlan && (
                <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 1px, transparent 1px, transparent 8px)",
            margin: "4px 0 16px",
            animationDelay: "350ms",
          }}
        />

        {/* Step 3 */}
        <div
          className="animate-fade-in-up"
          style={{ display: "flex", flexDirection: "column", gap: "12px", animationDelay: "400ms" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                background: "#1A1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#fff",
                flexShrink: 0,
                fontFamily: "JetBrains Mono",
              }}
            >
              3
            </div>
            <span style={{ fontSize: "16px", color: "#fff", lineHeight: 1.4 }}>
              {t.guide.step3Title}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "4px" }}>
            {expiration !== undefined && !isNaN(new Date(expiration).getTime()) && new Date(expiration) > new Date() && personalKey ? (
              <>
                {/* Access Key visualizer — Figma Glass Input Spec */}
                <GradientBlock
                  label=""
                  primaryColor={"#cfdfe5"}
                  secondaryColor={"#686F70"}
                  baseColor="#1D1C1B"
                  borderRadius="30px"
                  height="85px"
                  animate={false}
                  glowIntensity={0.6}
                  borderGlow={true}
                  enableMouseTracking={false}
                  contentAlign={"start"}
                  padding="12px 28px"
                >
                  <span style={{ fontSize: "13px", color: "#8E8E93", fontWeight: 400, fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.guide.personalKeyLabel}
                  </span>
                  <span
                    style={{
                      display: "block",
                      width: "100%",
                      fontSize: "16px",
                      color: "#fff",
                      fontFamily: "var(--font-onest), sans-serif",
                      fontWeight: 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.4,
                    }}
                  >
                    {activeKey}
                  </span>
                </GradientBlock>

                <button
                  className="hover-scale-btn"
                  onClick={() => {
                    trackEvent("access_key_copied", { step: 3, source: "guide" });
                    handleCopy();
                  }}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "14px",
                    fontSize: "14px",
                    letterSpacing: "0.05em",
                    alignSelf: "center",
                    cursor: "pointer",
                    outline: "none",
                    textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                    transition: "all 0.25s ease",
                    ...(copied
                      ? {
                        background: "rgba(255, 255, 255, 0.08)",
                        color: "#8A94A6",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }
                      : {
                        background: "#FFFFFF",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        color: "#000",
                      }),
                  }}
                >
                  {copied ? "✓ " + t.guide.copied : t.guide.copyKey}
                </button>
              </>
            ) : (
              <GradientBlock
                label=""
                primaryColor={"#cfdfe5"}
                secondaryColor={"#686F70"}
                baseColor="#1D1C1B"
                borderRadius="30px"
                height="auto"
                animate={false}
                glowIntensity={0.6}
                borderGlow={true}
                enableMouseTracking={false}
                contentAlign={"start"}
                padding="16px 28px"
              >
                <span style={{ fontSize: "13px", color: "#8E8E93", fontWeight: 400, fontFamily: "var(--font-onest), sans-serif" }}>
                  {t.guide.personalKeyLabel}
                </span>
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "var(--font-onest), sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.4,
                    marginTop: "4px",
                  }}
                >
                  {t.guide.personalKeyEmptyState}
                </span>
              </GradientBlock>
            )}
          </div>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 1px, transparent 1px, transparent 8px)",
            margin: "4px 0 16px",
            animationDelay: "450ms",
          }}
        />

        {/* Step 4 */}
        <div
          className="animate-fade-in-up"
          style={{ display: "flex", flexDirection: "column", gap: "12px", animationDelay: "500ms" }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "start" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "12px",
                background: "#1A1A1A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#fff",
                flexShrink: 0,
                fontFamily: "JetBrains Mono",
              }}
            >
              4
            </div>
            <span style={{ fontSize: "16px", color: "#fff", lineHeight: 1.4 }}>
              {t.guide.step4Title}
            </span>
          </div>
        </div>

        {/* Full-width 3-Row continuous moving marquee ticker — Figma Out of Bounds Spec */}
        <div
          ref={step4Ref}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            overflow: "hidden",
            width: "calc(100% + 32px)",
            margin: "4px -16px 12px",
            padding: "6px 0",
            maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
          }}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes guide-marquee-ltr {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes guide-marquee-rtl {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
            `
          }} />

          {/* Row 1: Left to Right */}
          <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "8px", animation: "guide-marquee-ltr 26s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW1, ...SERVERS_ROW1, ...SERVERS_ROW1, ...SERVERS_ROW1].map((srv, idx) => (
                <span
                  key={`r1-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#fff",
                    background: "#1A1A1A",
                    padding: "6.5px 12px 6.5px 8px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {srv.flag} {srv.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 2: Right to Left */}
          <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "8px", animation: "guide-marquee-rtl 26s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW2, ...SERVERS_ROW2, ...SERVERS_ROW2, ...SERVERS_ROW2].map((srv, idx) => (
                <span
                  key={`r2-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#fff",
                    background: "#1A1A1A",
                    padding: "6.5px 12px 6.5px 8px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {srv.flag} {srv.name}
                </span>
              ))}
            </div>
          </div>

          {/* Row 3: Left to Right */}
          <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "8px", animation: "guide-marquee-ltr 22s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW3, ...SERVERS_ROW3, ...SERVERS_ROW3, ...SERVERS_ROW3].map((srv, idx) => (
                <span
                  key={`r3-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "#fff",
                    background: "#1A1A1A",
                    padding: "6.5px 12px 6.5px 8px",
                    borderRadius: "20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {srv.flag} {srv.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ fontSize: "24px", color: "#fff", textAlign: "center", margin: "0 0 8px" }}>
          {t.guide.faqTitle}
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <FAQItem question={t.guide.faq1Question} answer={t.guide.faq1Answer} />
          <FAQItem question={t.guide.faq2Question} answer={t.guide.faq2Answer} />
          <FAQItem question={t.guide.faq3Question} answer={t.guide.faq3Answer} />
        </div>
      </div>

      {/* Need support Section */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "24px", color: "#fff" }}>
          {t.guide.needHelp}
        </span>
        <button
          onClick={() => {
            trackEvent("contact_support_tapped", { source: "guide_footer" });
            triggerHaptic("light");
            if (onOpenSupportForm) {
              onOpenSupportForm();
            } else {
              window.location.href = "mailto:support@fastguard.site";
            }
          }}
          style={{
            padding: "10px 15px",
            borderRadius: "14px",
            background: "#FFFFFF",
            border: "none",
            color: "#000000",
            fontSize: "14px",
            letterSpacing: "0.05em",
            alignSelf: "center",
            cursor: "pointer",
            outline: "none",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono, monospace",
            transition: "all 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {t.guide.contactSupport}
        </button>
      </div>

      {/* ─── BOTTOM SHEET: Select a payment method ──────────────────────────── */}
      {isPaymentSheetOpen && selectedPlan && mounted && createPortal(
        <>
          <div
            onClick={() => {
              if (!isPaying) {
                setIsPaymentSheetOpen(false);
              }
            }}
            className="animate-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 200,
            }}
          />
          <div
            className="animate-drawer"
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              borderRadius: "32px 32px 0 0",
              padding: "24px 20px calc(40px + env(safe-area-inset-bottom, 16px))",
              zIndex: 210,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 4px" }} />

            {!billingRegion ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left", fontFamily: "var(--font-onest), sans-serif", fontWeight: 700 }}>
                    {t.payment.confirmBillingFirst}
                  </h2>
                </div>

                {/* Dropdown Card */}
                <div ref={sheetRegionDropdownRef} style={{ position: "relative", width: "100%", zIndex: sheetRegionDropdownOpen ? 1001 : 10 }}>
                  {!sheetRegionDropdownOpen ? (
                    <button
                      onClick={() => { triggerHaptic("light"); setSheetRegionDropdownOpen(true); }}
                      className="hover-scale-btn"
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        outline: "none",
                      }}
                    >
                      <GradientBlock
                        label=""
                        primaryColor={"#cfdfe5"}
                        secondaryColor={"#686F70"}
                        baseColor="#1D1C1B"
                        borderRadius="30px"
                        height="72px"
                        animate={false}
                        glowIntensity={0.6}
                        borderGlow={true}
                        enableMouseTracking={false}
                        enableHoverScale={false}
                        contentAlign={"start"}
                        padding="12px 28px"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <div>
                            <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                              {t.payment.billingRegion}
                            </span>
                            <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                              {getRegionLabel(tempRegion)}
                            </span>
                          </div>
                          {/* Chevron Down icon */}
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#8A94A6" }}>
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </GradientBlock>
                    </button>
                  ) : (
                    <div
                      className="animate-dropdown"
                      style={{
                        position: "relative",
                        width: "100%",
                        zIndex: 1000,
                      }}
                    >
                      <GradientBlock
                        label=""
                        primaryColor={"#cfdfe5"}
                        secondaryColor={"#686F70"}
                        baseColor="#1D1C1B"
                        borderRadius="30px"
                        height="auto"
                        animate={false}
                        glowIntensity={0.6}
                        borderGlow={true}
                        enableMouseTracking={false}
                        enableHoverScale={false}
                        contentAlign={"start"}
                        padding="0"
                      >
                        {/* Expanded Header Button */}
                        <button
                          onClick={() => { triggerHaptic("light"); setSheetRegionDropdownOpen(false); }}
                          style={{
                            width: "100%",
                            height: "72px",
                            padding: "12px 28px",
                            background: "transparent",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            textAlign: "left",
                            outline: "none",
                          }}
                        >
                          <div>
                            <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                              {t.payment.billingRegion}
                            </span>
                            <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                              {getRegionLabel(tempRegion)}
                            </span>
                          </div>
                          {/* Chevron Up icon */}
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#fff" }}>
                            <path d="M11 6.5L6 1.5L1 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        {/* Separator line */}
                        <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 28px", width: "calc(100% - 56px)" }} />

                        {/* Options list */}
                        <div style={{ padding: "8px 0 16px", width: "100%" }}>
                          {REGION_OPTIONS.map((opt) => {
                            const isActive = tempRegion === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  triggerHaptic("light");
                                  setTempRegion(opt.value);
                                  setSheetRegionDropdownOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  height: "48px",
                                  padding: "0 28px",
                                  textAlign: "left",
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  cursor: "pointer",
                                  fontSize: "15px",
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? "#40D1FD" : "#fff",
                                  transition: "color 0.2s ease",
                                  fontFamily: "var(--font-onest), sans-serif",
                                }}
                              >
                                {getRegionLabel(opt.value)}
                              </button>
                            );
                          })}
                        </div>
                      </GradientBlock>
                    </div>
                  )}
                </div>

                {/* Confirm button */}
                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    onBillingRegionChange(tempRegion);
                  }}
                  style={{
                    width: "280px",
                    padding: "10px 15px",
                    borderRadius: "14px",
                    background: "#FFFFFF",
                    border: "none",
                    color: "#000000",
                    fontSize: "12px",
                    alignSelf: "center",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "var(--font-mono), monospace",
                    fontWeight: 700,
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.payment.confirm.toUpperCase()}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left", fontFamily: "var(--font-onest), sans-serif", fontWeight: 700 }}>
                    {t.payment.selectMethod}
                  </h2>
                </div>

                {/* Methods list */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
                  {(() => {
                    const combinedMethods = [
                      ...paymentMethods.map(m => ({
                        id: m.method_type,
                        name: m.name,
                        merchant_method_type: m.merchant_method_type,
                      })),
                      {
                        id: "stars",
                        name: t.payment.stars,
                        merchant_method_type: "stars",
                      }
                    ];
                    const fallbackMethods = [
                      { id: "card", name: t.payment.card, merchant_method_type: "card" },
                      { id: "crypto", name: t.payment.crypto, merchant_method_type: "crypto" },
                      { id: "stars", name: t.payment.stars, merchant_method_type: "stars" }
                    ];
                    const methodsToRender = paymentMethods.length > 0 ? combinedMethods : fallbackMethods;

                    return methodsToRender.map((method) => {
                      const isSelected = localSelectedMethod === method.id;

                      // Calculate pricing text
                      let priceText = "";
                      if (method.id === "stars") {
                        priceText = t.payment.starsDesc(selectedPlan.starsPrice);
                      } else if (method.merchant_method_type === "cryptocloud") {
                        priceText = `${selectedPlan.usdTotal.toFixed(0)} USDT`;
                      } else if (
                        method.merchant_method_type.endsWith("_rub") ||
                        method.id === "sberbank" ||
                        method.id === "tinkoff_bank" ||
                        method.id === "yoo_money"
                      ) {
                        priceText = selectedPlan.rubTotal ? `${selectedPlan.rubTotal.toFixed(0)} ₽` : `$ ${selectedPlan.usdTotal.toFixed(2)}`;
                      } else {
                        priceText = `$ ${selectedPlan.usdTotal.toFixed(2)}`;
                      }

                      return (
                        <button
                          key={method.id}
                          disabled={isPaying}
                          onClick={() => {
                            triggerHaptic("light");
                            setLocalSelectedMethod(method.id);
                            apiCall("/api/track-event", "POST", { event: "payment_method_selected" }).catch((err) => {
                              console.error("Failed to track payment_method_selected event on backend:", err);
                            });
                          }}
                          style={{
                            width: "310px",
                            height: "80px",
                            borderRadius: "30px",
                            position: "relative",
                            cursor: isPaying ? "not-allowed" : "pointer",
                            border: "none",
                            outline: "none",
                            overflow: "hidden",
                            background: "transparent",
                            padding: 0,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <GradientBlock
                            label=""
                            primaryColor="#FFFFFF"
                            secondaryColor="#9A9790"
                            baseColor="#12141A"
                            borderRadius="30px"
                            height={80}
                            animate={false}
                            glowIntensity={0.6}
                            borderGlow={true}
                            enableMouseTracking={false}
                            enableHoverScale={false}
                          />

                          {isSelected && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                border: "1.5px solid #00D1FF",
                                borderRadius: "30px",
                                pointerEvents: "none",
                                zIndex: 30,
                              }}
                            />
                          )}

                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0 30px",
                              zIndex: 20,
                              pointerEvents: "none",
                              boxSizing: "border-box",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "15px",
                                color: isSelected ? "#00D1FF" : "#FFFFFF",
                                fontFamily: "var(--font-onest), sans-serif",
                              }}
                            >
                              {method.name}
                            </span>
                            <span
                              style={{
                                fontSize: "14px",
                                color: isSelected ? "#00D1FF" : "#8A94A6",
                                fontFamily: "var(--font-onest), sans-serif",
                              }}
                            >
                              {priceText}
                            </span>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Action button */}
                <button
                  disabled={isPaying}
                  onClick={async () => {
                    if (!localSelectedMethod) return;
                    triggerHaptic("medium");
                    try {
                      await onProceedPayment(localSelectedMethod);
                      setIsPaymentSheetOpen(false);
                    } catch {
                      // error handled by screen
                    }
                  }}
                  style={{
                    width: "310px",
                    padding: "14px 20px",
                    borderRadius: "14px",
                    background: localSelectedMethod ? "#FFFFFF" : "transparent",
                    border: localSelectedMethod ? "none" : "1.5px solid #FFFFFF",
                    color: localSelectedMethod ? "#000000" : "#FFFFFF",
                    fontSize: "14px",
                    alignSelf: "center",
                    cursor: localSelectedMethod && !isPaying ? "pointer" : "not-allowed",
                    outline: "none",
                    fontFamily: "var(--font-mono), monospace",
                    transition: "all 0.2s ease",
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isPaying ? (
                    <>
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderTop: "2px solid #000",
                          borderRadius: "50%",
                          animation: "tma-spin 0.8s linear infinite",
                        }}
                      />
                      PROCESSING...
                    </>
                  ) : localSelectedMethod ? (
                    t.payment.proceedToPayment.toUpperCase()
                  ) : (
                    t.payment.selectAndPay.toUpperCase()
                  )}
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
