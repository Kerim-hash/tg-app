"use client";

import { useState, useEffect, useMemo } from "react";
import type { Plan, Language, Translations, HapticType, Campaign } from "./types";
import { trackEvent } from "../../lib/mixpanel";

import WelcomeStep from "./WelcomeStep";
import PainsStep from "./PainsStep";
import HowItWorksStep from "./HowItWorksStep";
import ChoosePlanStep from "./ChoosePlanStep";
import SetupStep from "./SetupStep";
import FinalReadyStep from "./FinalReadyStep";

interface OnboardingScreenProps {
  t: Translations;
  language: Language;
  onComplete: () => void;
  plans: Plan[];
  triggerHaptic: (type: HapticType) => void;
  personalKey?: string;
  onSelectPlanForPayment?: (planId: string) => void;
  campaign?: Campaign;
  expiration?: string;
}

function getPlanLabelText(periodMonths: number, lang: string): string {
  if (lang === "ru") {
    if (periodMonths === 1) return "30 дней";
    if (periodMonths === 3) return "3 месяца";
    if (periodMonths === 6) return "6 месяцев";
    if (periodMonths === 12) return "1 год";
    return `${periodMonths} мес.`;
  } else if (lang === "uz") {
    if (periodMonths === 1) return "30 kun";
    if (periodMonths === 3) return "3 oy";
    if (periodMonths === 6) return "6 oy";
    if (periodMonths === 12) return "1 yil";
    return `${periodMonths} oy`;
  } else if (lang === "by") {
    if (periodMonths === 1) return "30 дзён";
    if (periodMonths === 3) return "3 месяцы";
    if (periodMonths === 6) return "6 месяцаў";
    if (periodMonths === 12) return "1 год";
    return `${periodMonths} мес.`;
  } else {
    if (periodMonths === 1) return "30 Days";
    if (periodMonths === 3) return "3 Months";
    if (periodMonths === 6) return "6 Months";
    if (periodMonths === 12) return "1 Year";
    return `${periodMonths} Months`;
  }
}

function getBilledFrequencyText(periodMonths: number, lang: string, t: any): string {
  if (periodMonths === 1) {
    return t.home.billedMonthly;
  }
  if (periodMonths === 12) {
    return t.home.billedYearly;
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

const CAMPAIGN_DICT: Record<string, Record<string, any>> = {
  en: {
    gaming: {
      welcome: {
        title: "Your connection is holding you back",
        subtitle: "Fix it in 60 seconds",
        card1Title: "Show me what iGuard does",
        card1Desc: "Quick intro, 2 min",
        card1Btn: "SHOW ME",
        card2Title: "Let's go, I know the drill",
        card2Desc: "Skip straight to setup",
        card2Btn: "LET'S GO",
      },
      plans: {
        title: "Pick the plan that fits",
        desc: "One subscription — all features, all servers",
      },
      setup: {
        title: "Three steps. Under a minute",
        subtitle: "You're one key away from a better connection",
        step3: "Copy your key → paste in app → allow VPN config",
        bottomNote: "Your personal key appears at this app after purchase",
      }
    },
    adults: {
      welcome: {
        title: "The site you need is blocked?",
        subtitle: "iGuard removes that problem. No traces, no questions.",
        card1Title: "Show me what iGuard does",
        card1Desc: "Quick intro, 2 min",
        card1Btn: "SHOW ME",
        card2Title: "Let's go, I know the drill",
        card2Desc: "I know what I need",
        card2Btn: "LET'S GO",
      },
      plans: {
        title: "Private browsing shouldn't cost a fortune",
        desc: "One plan. All features. Pay anonymously if you want",
      },
      setup: {
        title: "Three steps. Under a minute",
        subtitle: "Nothing stored. Nothing traced",
        step3: "Copy your key → paste in app → connect",
        bottomNote: "No account, no email, no registration required. Your key appears here immediately after payment",
      }
    },
    default: {
      setup: {
        bottomNote: "Your personal key appears here after purchase"
      },
      connectHeader: "Connect",
      welcomeHeader: "Welcome",
      painsHeader: "Pains",
      howItWorksHeader: "How it works",
      plansHeader: "Plans",
      setupHeader: "Setup"
    }
  },
  ru: {
    gaming: {
      welcome: {
        title: "Плохое соединение мешает вашей игре?",
        subtitle: "Исправьте это за 60 секунд",
        card1Title: "Показать, как работает iGuard",
        card1Desc: "Быстрый обзор, 2 мин",
        card1Btn: "ОБЗОР",
        card2Title: "Поехали, я знаю, что делать",
        card2Desc: "Перейти сразу к настройке",
        card2Btn: "НАЧАТЬ",
      },
      plans: {
        title: "Выберите подходящий тариф",
        desc: "Одна подписка — все функции, все серверы",
      },
      setup: {
        title: "Три шага. Меньше минуты",
        subtitle: "Вы в одном ключе от лучшего соединения",
        step3: "Скопируйте ключ → вставьте в приложение → разрешите VPN",
        bottomNote: "Ваш персональный ключ появится в этом приложении после оплаты",
      }
    },
    adults: {
      welcome: {
        title: "Нужный сайт заблокирован?",
        subtitle: "iGuard решает эту проблему. Без следов, без вопросов.",
        card1Title: "Показать, как работает iGuard",
        card1Desc: "Быстрый обзор, 2 мин",
        card1Btn: "ОБЗОР",
        card2Title: "Поехали, я знаю, что делать",
        card2Desc: "Я знаю, что мне нужно",
        card2Btn: "НАЧАТЬ",
      },
      plans: {
        title: "Приватность не должна стоить целое состояние",
        desc: "Один тариф. Все функции. Оплачивайте анонимно по желанию",
      },
      setup: {
        title: "Три шага. Меньше минуты",
        subtitle: "Ничего не сохраняется. Ничего не отслеживается",
        step3: "Скопируйте ключ → вставьте в приложение → подключитесь",
        bottomNote: "Без аккаунтов, email и регистрации. Ваш ключ появится здесь сразу после оплаты",
      }
    },
    default: {
      setup: {
        bottomNote: "Ваш персональный ключ появится здесь после оплаты"
      },
      connectHeader: "Подключение",
      welcomeHeader: "Добро пожаловать",
      painsHeader: "Проблемы",
      howItWorksHeader: "Как это работает",
      plansHeader: "Тарифы",
      setupHeader: "Настройка"
    }
  },
  uz: {
    gaming: {
      welcome: {
        title: "Yomon ulanish o'yiningizga xalaqit beryaptimi?",
        subtitle: "Buni 60 soniyada hal qiling",
        card1Title: "iGuard qanday ishlashini ko'rsatish",
        card1Desc: "2 daqiqalik tezkor qo'llanma",
        card1Btn: "QO'LLANMA",
        card2Title: "Qani ketdik, nima qilishni bilaman",
        card2Desc: "To'g'ridan-to'g'ri sozlashga o'tish",
        card2Btn: "BOSHLASH",
      },
      plans: {
        title: "Mos tarifni tanlang",
        desc: "Yagona obuna — barcha funksiyalar va serverlar",
      },
      setup: {
        title: "Uchta qadam. Bir daqiqadan kam",
        subtitle: "Siz eng yaxshi ulanishdan bir kalit masofadasiz",
        step3: "Kalitni nusxalang → ilovaga joylashtiring → VPN-ga ruxsat bering",
        bottomNote: "Sizning shaxsiy kalitingiz to'lovdan so'ng ushbu ilovada paydo bo'ladi",
      }
    },
    adults: {
      welcome: {
        title: "Kerakli sayt bloklandimi?",
        subtitle: "iGuard buni hal qiladi. Izlarsiz, savollarsiz.",
        card1Title: "iGuard qanday ishlashini ko'rsatish",
        card1Desc: "2 daqiqalik tezkor qo'llanma",
        card1Btn: "QO'LLANMA",
        card2Title: "Qani ketdik, nima qilishni bilaman",
        card2Desc: "Menga nima kerakligini bilaman",
        card2Btn: "BOSHLASH",
      },
      plans: {
        title: "Maxfiylik qimmat turishi kerak emas",
        desc: "Yagona tarif. Barcha funksiyalar. Xohlasangiz, anonim to'lang",
      },
      setup: {
        title: "Uchta qadam. Bir daqiqadan kam",
        subtitle: "Hech narsa saqlanmaydi. Hech narsa kuzatilmaydi",
        step3: "Kalitni nusxalang → ilovaga joylashtiring → ulaning",
        bottomNote: "Akkountlarsiz, email va ro'yxatdan o'tishsiz. Kalitingiz to'lovdan so'ng darhol shu yerda paydo bo'ladi",
      }
    },
    default: {
      setup: {
        bottomNote: "Shaxsiy kalitingiz to'lovdan so'ng shu yerda paydo bo'ladi"
      },
      connectHeader: "Ulanish",
      welcomeHeader: "Xush kelibsiz",
      painsHeader: "Muammolar",
      howItWorksHeader: "Qanday ishlashi",
      plansHeader: "Tariflar",
      setupHeader: "Sozlash"
    }
  },
  by: {
    gaming: {
      welcome: {
        title: "Дрэннае злучэнне заважае вашай гульні?",
        subtitle: "Выпраўце гэта за 60 секунд",
        card1Title: "Паказаць, как працуе iGuard",
        card1Desc: "Хуткі агляд, 2 хв",
        card1Btn: "АГЛЯД",
        card2Title: "Паехалі, я ведаю, што рабіць",
        card2Desc: "Перайсці адразу да налады",
        card2Btn: "ПАЧАЦЬ",
      },
      plans: {
        title: "Абярыце падыходзячы тарыф",
        desc: "Адна падпіска — усе функцыі, усе серверы",
      },
      setup: {
        title: "Тры крокі. Менш за хвіліну",
        subtitle: "Вы ў адным ключы ад лепшага злучэння",
        step3: "Скапіруйте ключ → устаўце ў прыкладанне → дазвольце VPN",
        bottomNote: "Ваш персанальны ключ з'явіцца ў гэтым прыкладанні пасля аплаты",
      }
    },
    adults: {
      welcome: {
        title: "Патрэбны сайт заблакаваны?",
        subtitle: "iGuard вырашае гэтую праблему. Без слядоў, без пытанняў.",
        card1Title: "Паказаць, как працуе iGuard",
        card1Desc: "Хуткі агляд, 2 хв",
        card1Btn: "АГЛЯД",
        card2Title: "Паехалі, я ведаю, што рабіць",
        card2Desc: "Я ведаю, што мне трэба",
        card2Btn: "ПАЧАЦЬ",
      },
      plans: {
        title: "Прыватнасць не павінна каштаваць цэлае багацце",
        desc: "Адзін тарыф. Усе функцыі. Аплачвайце ананімна пры жаданні",
      },
      setup: {
        title: "Тры крокі. Менш за хвіліну",
        subtitle: "Нічога не захоўваецца. Нічога не адсочваецца",
        step3: "Скапіруйте ключ → устаўце ў прыкладанне → падключыцеся",
        bottomNote: "Без акаўнтаў, email і рэгістрацыі. Ваш ключ з'явіцца тут адразу пасля аплаты",
      }
    },
    default: {
      setup: {
        bottomNote: "Ваш персанальны ключ з'явіцца тут пасля аплаты"
      },
      connectHeader: "Падключэнне",
      welcomeHeader: "Сардэчна запрашаем",
      painsHeader: "Праблемы",
      howItWorksHeader: "Як гэта працуе",
      plansHeader: "Тарыфы",
      setupHeader: "Налада"
    }
  }
};

export default function OnboardingScreen({
  t,
  language,
  onComplete,
  plans,
  triggerHaptic,
  personalKey,
  onSelectPlanForPayment,
  campaign = "default",
  expiration,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [tempSelectedPlanId, setTempSelectedPlanId] = useState<string>("");

  useEffect(() => {
    if (plans && plans.length > 0 && !tempSelectedPlanId) {
      const yearlyPlan = plans.find((p) => p.periodMonths === 12);
      if (yearlyPlan) {
        setTempSelectedPlanId(yearlyPlan.id);
      }
    }
  }, [plans, tempSelectedPlanId]);

  const [wifiSecurity, setWifiSecurity] = useState(true);
  const [gamingMode, setGamingMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const isAndroid = typeof window !== "undefined" && /android/i.test(navigator.userAgent);
  const planPurchased = expiration !== undefined && !isNaN(new Date(expiration).getTime()) && new Date(expiration) > new Date();
  const activeKey = personalKey || "";
  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    setCopied(true);
    triggerHaptic("success");
    trackEvent("access_key_copied", { step: currentStep, source: "onboarding" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleWifiSecurity = () => {
    if (!wifiSecurity) {
      triggerHaptic("light");
      setWifiSecurity(true);
      trackEvent("onboarding_wifi_security_enabled", {});
    }
  };

  const handleToggleGamingMode = () => {
    triggerHaptic("light");
    const nextVal = !gamingMode;
    setGamingMode(nextVal);
    trackEvent(nextVal ? "onboarding_gaming_mode_enabled" : "onboarding_gaming_mode_disabled", {});
  };

  const langDict = CAMPAIGN_DICT[language] || CAMPAIGN_DICT.en;

  const welcomeTexts = useMemo(() => {
    if (campaign === "gaming" || campaign === "adults") {
      return langDict[campaign].welcome;
    }
    return {
      title: "",
      subtitle: "",
      card1Title: t.onboarding.showHowWorks,
      card1Desc: t.onboarding.quickWalkthrough,
      card1Btn: t.onboarding.start,
      card2Title: t.onboarding.readyToGo,
      card2Desc: t.onboarding.skipTourConnect,
      card2Btn: t.onboarding.skipAndGo,
    };
  }, [campaign, langDict, t]);

  const plansTexts = useMemo(() => {
    if (campaign === "gaming" || campaign === "adults") {
      return langDict[campaign].plans;
    }
    return {
      title: t.onboarding.pickPlanTitle,
      desc: t.onboarding.pickPlanDesc,
    };
  }, [campaign, langDict, t]);

  const setupTexts = useMemo(() => {
    if (campaign === "gaming" || campaign === "adults") {
      return langDict[campaign].setup;
    }
    return {
      title: t.onboarding.connectTitle,
      subtitle: t.onboarding.connectSubtitle,
      step3: t.onboarding.pasteKeyStep,
      bottomNote: langDict.default.setup.bottomNote,
    };
  }, [campaign, langDict, t]);

  const getHeaderLabel = () => {
    const def = CAMPAIGN_DICT[language]?.default || CAMPAIGN_DICT.en.default;
    if (campaign === "default") {
      if (currentStep === 0) return t.onboarding.welcome;
      if (currentStep === 1) return t.onboarding.useCases;
      if (currentStep === 2) return t.onboarding.plans;
      if (currentStep === 3) return def.connectHeader;
      return t.onboarding.readySteadyGo;
    }
    if (currentStep === 0) return def.welcomeHeader;
    if (currentStep === 1) return def.painsHeader;
    if (currentStep === 2) return def.howItWorksHeader;
    if (currentStep === 3) return def.plansHeader;
    return def.setupHeader;
  };

  // Find the plans we want to display (30 days and 1 year)
  const plan30Days = plans.find((p) => p.periodMonths === 1);
  const plan1Year = plans.find((p) => p.periodMonths === 12);
  const onboardingPlans = useMemo(() => {
    const result: Plan[] = [];
    if (plan30Days) result.push(plan30Days);
    if (plan1Year) result.push(plan1Year);
    if (result.length < 2) {
      const remaining = plans.filter((p) => p.id !== plan30Days?.id && p.id !== plan1Year?.id);
      result.push(...remaining.slice(0, 2 - result.length));
    }
    return result;
  }, [plans, plan30Days, plan1Year]);

  const selectedPlan = onboardingPlans.find((p) => p.id === tempSelectedPlanId);

  useEffect(() => {
    trackEvent("onboarding_started", { campaign });
  }, [campaign]);

  useEffect(() => {
    let screenName = "unknown";
    let stepParam = currentStep;

    if (campaign === "default") {
      const screens = ["welcome", "use_cases", "plans", "connect", "ready"];
      screenName = screens[currentStep] || "unknown";
      if (currentStep === 3) stepParam = 4;
      else if (currentStep === 4) stepParam = 5;
    } else {
      const screens = ["welcome", "pains", "how_it_works", "plans", "setup"];
      screenName = screens[currentStep] || "unknown";
    }

    trackEvent("onboarding_step_viewed", {
      step: stepParam,
      screen_name: screenName,
      campaign: campaign,
    });

    if (currentStep === 0) {
      trackEvent("onboarding_welcome_shown", { campaign });
    } else if (currentStep === 1) {
      trackEvent(campaign === "default" ? "onboarding_use_cases_shown" : "onboarding_pains_shown", { campaign });
    } else if (currentStep === 2) {
      trackEvent(campaign === "default" ? "onboarding_plans_shown" : "onboarding_how_it_works_shown", { campaign });
    } else if (currentStep === 3) {
      trackEvent(campaign === "default" ? "onboarding_connect_shown" : "onboarding_plans_shown", { campaign });
    } else if (currentStep === 4) {
      trackEvent(campaign === "default" ? "onboarding_completed_shown" : "onboarding_setup_shown", { campaign });
    }
  }, [currentStep, campaign]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.disableVerticalSwipe) {
        (window as any).Telegram.WebApp.disableVerticalSwipe();
      }
    } catch (e) {
      console.warn("Failed to disable vertical swipe:", e);
    }
  }, []);

  const handleNext = () => {
    if (currentStep === 1) {
      trackEvent("onboarding_use_cases_next_clicked", {});
    } else if (currentStep === 2) {
      trackEvent("onboarding_plans_next_clicked", {});
    } else if (currentStep === 3) {
      trackEvent("onboarding_connect_next_clicked", {});
    }

    if (currentStep < 4) {
      triggerHaptic("light");
      setDirection("next");
      setCurrentStep((prev) => prev + 1);
    } else {
      triggerHaptic("success");
      trackEvent("onboarding_completed", {});
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep === 1) {
      trackEvent("onboarding_use_cases_back_clicked", {});
    } else if (currentStep === 3) {
      trackEvent("onboarding_connect_back_clicked", {});
    }

    if (currentStep > 0) {
      triggerHaptic("light");
      setDirection("prev");
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic("medium");

    const screens = ["welcome", "use_cases", "plans", "connect", "ready"];
    const lastScreen = screens[currentStep] || "unknown";
    trackEvent("onboarding_dropped", { last_screen: lastScreen });

    if (currentStep === 0) {
      trackEvent("onboarding_welcome_skipped", {});
    }

    onComplete();
  };

  const getContentPaddingClass = () => {
    const isSpecialCampaign = campaign === "adults" || campaign === "gaming";
    const horizPadding = (
      (currentStep === 1 && isSpecialCampaign) ||
      (currentStep === 2 && campaign === "adults")
    ) ? "px-0" : "px-5";

    let bottomPadding = "pb-4";
    if (currentStep > 0 && currentStep < 4) {
      bottomPadding = "pb-[100px]";
    } else if (currentStep === 4) {
      bottomPadding = "pb-10";
    }

    return `pt-[175px] ${horizPadding} ${bottomPadding}`;
  };

  return (
    <div className="h-full flex flex-col bg-black text-white max-w-[480px] mx-auto overflow-hidden relative box-border pt-0 px-0 pb-0">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideInFromRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInFromLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInFromRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-slide-in-left {
            animation: slideInFromLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes voip-pulse {
            0% { left: 5%; }
            50% { left: 90%; }
            100% { left: 5%; }
          }
          @keyframes pulse-arch-solid {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes pulse-arch-translucent {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.7; }
          }
          @keyframes server-flash {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes spin-globe {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .bypass-arch-solid {
            animation: pulse-arch-solid 2s infinite ease-in-out;
            transform-origin: bottom center;
          }
          .bypass-arch-translucent {
            animation: pulse-arch-translucent 2.5s infinite ease-in-out;
            transform-origin: bottom center;
          }
          .server-dot-active {
            animation: server-flash 1.5s infinite ease-in-out;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          @keyframes drawerSlideUpOnboarding {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-drawer-onboarding {
            animation: drawerSlideUpOnboarding 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `,
      }} />

      {/* Top Header Section */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "175px",
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: "40px",
          boxSizing: "border-box",
        }}
      >
        {currentStep === 0 ? (
          <div className="text-center flex items-center justify-center w-full">
            <span className="text-[14px] text-[#40D1FD] font-mono">
              {getHeaderLabel()}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Category Label */}
            <span className="text-[14px] text-[#40D1FD] font-mono">
              {getHeaderLabel()}
            </span>

            {/* Step dots */}
            <div className="flex gap-4 items-center h-5">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                let heightClass = "h-1";
                let bgClass = "bg-white/20";

                if (isActive) {
                  heightClass = "h-3";
                  bgClass = "bg-[#00D1FF]";
                } else if (idx === currentStep - 1) {
                  heightClass = "h-2";
                  bgClass = "bg-white";
                } else if (isCompleted) {
                  bgClass = "bg-white";
                }

                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-[1px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${heightClass} ${bgClass}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Slide Content Area */}
      <div
        key={currentStep} // forces re-render for slide animations
        className={`${
          direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"
        } hide-scrollbar w-full flex-1 flex flex-col justify-start items-center overflow-y-auto box-border ${getContentPaddingClass()}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {currentStep === 0 && (
          <WelcomeStep
            campaign={campaign}
            welcomeTexts={welcomeTexts}
            triggerHaptic={triggerHaptic}
            trackEvent={trackEvent}
            setDirection={setDirection}
            setCurrentStep={setCurrentStep}
            handleSkip={handleSkip}
          />
        )}

        {currentStep === 1 && (
          <PainsStep
            language={language}
            campaign={campaign}
            t={t}
            wifiSecurity={wifiSecurity}
            gamingMode={gamingMode}
            handleToggleWifiSecurity={handleToggleWifiSecurity}
            handleToggleGamingMode={handleToggleGamingMode}
            triggerHaptic={triggerHaptic}
            trackEvent={trackEvent}
          />
        )}

        {currentStep === 2 && (
          campaign === "default" ? (
            <ChoosePlanStep
              language={language}
              campaign={campaign}
              t={t}
              plansTexts={plansTexts}
              onboardingPlans={onboardingPlans}
              tempSelectedPlanId={tempSelectedPlanId}
              setTempSelectedPlanId={setTempSelectedPlanId}
              onSelectPlanForPayment={onSelectPlanForPayment}
              selectedPlan={selectedPlan}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
              getPlanLabelText={getPlanLabelText}
              getBilledFrequencyText={getBilledFrequencyText}
            />
          ) : (
            <HowItWorksStep
              language={language}
              campaign={campaign}
              t={t}
              wifiSecurity={wifiSecurity}
              gamingMode={gamingMode}
              handleToggleWifiSecurity={handleToggleWifiSecurity}
              handleToggleGamingMode={handleToggleGamingMode}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
            />
          )
        )}

        {currentStep === 3 && (
          campaign === "default" ? (
            <SetupStep
              language={language}
              campaign={campaign}
              t={t}
              isAndroid={isAndroid}
              planPurchased={planPurchased}
              activeKey={activeKey}
              copied={copied}
              onCopy={handleCopy}
              onComplete={handleNext}
              onSelectPlanForPayment={onSelectPlanForPayment}
              onboardingPlans={onboardingPlans}
              tempSelectedPlanId={tempSelectedPlanId}
              setTempSelectedPlanId={setTempSelectedPlanId}
              selectedPlan={selectedPlan}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
              getPlanLabelText={getPlanLabelText}
              getBilledFrequencyText={getBilledFrequencyText}
              setupTexts={setupTexts}
            />
          ) : (
            <ChoosePlanStep
              language={language}
              campaign={campaign}
              t={t}
              plansTexts={plansTexts}
              onboardingPlans={onboardingPlans}
              tempSelectedPlanId={tempSelectedPlanId}
              setTempSelectedPlanId={setTempSelectedPlanId}
              onSelectPlanForPayment={onSelectPlanForPayment}
              selectedPlan={selectedPlan}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
              getPlanLabelText={getPlanLabelText}
              getBilledFrequencyText={getBilledFrequencyText}
            />
          )
        )}

        {currentStep === 4 && (
          campaign === "default" ? (
            <FinalReadyStep
              t={t}
              onComplete={() => {
                triggerHaptic("success");
                trackEvent("onboarding_completed", {});
                onComplete();
              }}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
            />
          ) : (
            <SetupStep
              language={language}
              campaign={campaign}
              t={t}
              isAndroid={isAndroid}
              planPurchased={planPurchased}
              activeKey={activeKey}
              copied={copied}
              onCopy={handleCopy}
              onComplete={() => {
                triggerHaptic("success");
                trackEvent("onboarding_completed_cta_clicked", { campaign });
                trackEvent("onboarding_completed", { campaign });
                onComplete();
              }}
              onSelectPlanForPayment={onSelectPlanForPayment}
              onboardingPlans={onboardingPlans}
              tempSelectedPlanId={tempSelectedPlanId}
              setTempSelectedPlanId={setTempSelectedPlanId}
              selectedPlan={selectedPlan}
              triggerHaptic={triggerHaptic}
              trackEvent={trackEvent}
              getPlanLabelText={getPlanLabelText}
              getBilledFrequencyText={getBilledFrequencyText}
              setupTexts={setupTexts}
            />
          )
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      {currentStep > 0 && currentStep < 4 && (
        <div className="absolute bottom-0 left-0 w-full box-border flex gap-3 justify-between items-center bg-[#12141A]/40 backdrop-blur-[20px] border-t border-white/8 pt-4 px-5 pb-6 shadow-[0_-8px_32px_rgba(0,0,0,0.3)] z-10">
          <button
            onClick={handlePrev}
            className="h-13 rounded-[16px] bg-[#333333] text-white text-[14px] cursor-pointer outline-none px-[15px] font-mono transition-colors duration-200 ease"
          >
            {t.onboarding.back}
          </button>

          <button
            onClick={handleNext}
            className="h-13 rounded-[12px] bg-white text-black text-[14px] cursor-pointer border-none outline-none px-[60px] font-mono transition-transform duration-100 ease"
          >
            {t.onboarding.next}
          </button>
        </div>
      )}
    </div>
  );
}


