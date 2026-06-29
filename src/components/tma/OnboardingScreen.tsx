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
}

function getPlanLabelText(periodMonths: number, lang: string): string {
  if (lang === "ru") {
    if (periodMonths === 1) return "30 дней";
    if (periodMonths === 3) return "3 месяца";
    if (periodMonths === 6) return "6 месяцев";
    if (periodMonths === 12) return "1 год";
    return `${periodMonths} мес.`;
  } else if (lang === "es") {
    if (periodMonths === 1) return "30 Días";
    if (periodMonths === 3) return "3 Meses";
    if (periodMonths === 6) return "6 Meses";
    if (periodMonths === 12) return "1 Año";
    return `${periodMonths} Meses`;
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
  } else if (lang === "es") {
    return `Facturado cada ${periodMonths} meses`;
  } else {
    return `Billed every ${periodMonths} months`;
  }
}

export default function OnboardingScreen({
  t,
  language,
  onComplete,
  plans,
  triggerHaptic,
  personalKey,
  onSelectPlanForPayment,
  campaign = "default",
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [gamingMode, setGamingMode] = useState<boolean>(true);
  const [wifiSecurity, setWifiSecurity] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [tempSelectedPlanId, setTempSelectedPlanId] = useState<string>("");
  const [planPurchased, setPlanPurchased] = useState<boolean>(false);

  const platform = typeof window !== "undefined" ? (window as any)?.Telegram?.WebApp?.platform || "" : "";
  const isAndroid = platform === "android";

  const activeKey = personalKey || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    triggerHaptic("success");
    trackEvent("onboarding_connect_key_copied", { campaign });
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleToggleWifiSecurity = () => {
    if (wifiSecurity) return;
    const newValue = !wifiSecurity;
    triggerHaptic("light");
    setWifiSecurity(newValue);
    trackEvent("onboarding_use_case_selected", { use_case: "wifi_security", enabled: newValue });
  };

  const handleToggleGamingMode = () => {
    if (gamingMode) return;
    const newValue = !gamingMode;
    triggerHaptic("light");
    setGamingMode(newValue);
    trackEvent("onboarding_use_case_selected", { use_case: "gaming", enabled: newValue });
  };

  const welcomeTexts = useMemo(() => {
    if (campaign === "gaming") {
      return {
        title: language === "ru" ? "Плохое соединение мешает вашей игре?" : language === "es" ? "Tu conexión te está frenando" : "Your connection is holding you back",
        subtitle: language === "ru" ? "Исправьте это за 60 секунд" : language === "es" ? "Corrígelo en 60 segundos" : "Fix it in 60 seconds",
        card1Title: language === "ru" ? "Показать, как работает iGuard" : language === "es" ? "Muéstrame qué hace iGuard" : "Show me what iGuard does",
        card1Desc: language === "ru" ? "Быстрый обзор, 2 мин" : language === "es" ? "Introducción rápida, 2 min" : "Quick intro, 2 min",
        card1Btn: language === "ru" ? "ОБЗОР" : language === "es" ? "MOSTRAR" : "SHOW ME",
        card2Title: language === "ru" ? "Поехали, я знаю, что делать" : language === "es" ? "Vamos, ya me conozco el truco" : "Let's go, I know the drill",
        card2Desc: language === "ru" ? "Перейти сразу к настройке" : language === "es" ? "Ir directo a la configuración" : "Skip straight to setup",
        card2Btn: language === "ru" ? "НАЧАТЬ" : language === "es" ? "VAMOS" : "LET'S GO",
      };
    }
    if (campaign === "adults") {
      return {
        title: language === "ru" ? "Нужный сайт заблокирован?" : language === "es" ? "¿El sitio que necesitas está bloqueado?" : "The site you need is blocked?",
        subtitle: language === "ru" ? "iGuard решает эту проблему. Без следов, без вопросов." : language === "es" ? "iGuard elimina ese problema. Sin rastros, sin preguntas." : "iGuard removes that problem. No traces, no questions.",
        card1Title: language === "ru" ? "Показать, как работает iGuard" : language === "es" ? "Muéstrame qué hace iGuard" : "Show me what iGuard does",
        card1Desc: language === "ru" ? "Быстрый обзор, 2 мин" : language === "es" ? "Introducción rápida, 2 min" : "Quick intro, 2 min",
        card1Btn: language === "ru" ? "ОБЗОР" : language === "es" ? "MOSTRAR" : "SHOW ME",
        card2Title: language === "ru" ? "Поехали, я знаю, что делать" : language === "es" ? "Vamos, ya me conozco el truco" : "Let's go, I know the drill",
        card2Desc: language === "ru" ? "Я знаю, что мне нужно" : language === "es" ? "Sé lo что нужно" : "I know what I need",
        card2Btn: language === "ru" ? "НАЧАТЬ" : language === "es" ? "VAMOS" : "LET'S GO",
      };
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
  }, [campaign, language, t]);

  const plansTexts = useMemo(() => {
    if (campaign === "gaming") {
      return {
        title: language === "ru" ? "Выберите подходящий тариф" : language === "es" ? "Elige el plan adecuado" : "Pick the plan that fits",
        desc: language === "ru" ? "Одна подписка — все функции, все серверы" : language === "es" ? "Una suscripción: todas las funciones, todos los servidores" : "One subscription — all features, all servers",
      };
    }
    if (campaign === "adults") {
      return {
        title: language === "ru" ? "Приватность не должна стоить целое состояние" : language === "es" ? "La navegación privada no debería costar una fortuna" : "Private browsing shouldn't cost a fortune",
        desc: language === "ru" ? "Один тариф. Все функции. Оплачивайте анонимно по желанию" : language === "es" ? "Un plan. Todas las funciones. Paga de forma anónima si quieres" : "One plan. All features. Pay anonymously if you want",
      };
    }
    return {
      title: t.onboarding.pickPlanTitle,
      desc: t.onboarding.pickPlanDesc,
    };
  }, [campaign, language, t]);

  const setupTexts = useMemo(() => {
    if (campaign === "gaming") {
      return {
        title: language === "ru" ? "Три шага. Меньше минуты" : language === "es" ? "Tres pasos. Menos de un minuto" : "Three steps. Under a minute",
        subtitle: language === "ru" ? "Вы в одном ключе от лучшего соединения" : language === "es" ? "Estás a una clave de una mejor conexión" : "You're one key away from a better connection",
        step3: language === "ru" ? "Скопируйте ключ → вставьте в приложение → разрешите VPN" : language === "es" ? "Copia tu clave → pega en la app → permite config VPN" : "Copy your key → paste in app → allow VPN config",
        bottomNote: language === "ru" ? "Ваш персональный ключ появится в этом приложении после оплаты" : language === "es" ? "Tu clave personal aparecerá в этой aplicación после покупки" : "Your personal key appears at this app after purchase",
      };
    }
    if (campaign === "adults") {
      return {
        title: language === "ru" ? "Три шага. Меньше минуты" : language === "es" ? "Tres pasos. Menos de un minuto" : "Three steps. Under a minute",
        subtitle: language === "ru" ? "Ничего не сохраняется. Ничего не отслеживается" : language === "es" ? "Nada se guarda. Nada se rastrea" : "Nothing stored. Nothing traced",
        step3: language === "ru" ? "Скопируйте ключ → вставьте в приложение → подключитесь" : language === "es" ? "Copia tu clave → pega en la app → conéctate" : "Copy your key → paste in app → connect",
        bottomNote: language === "ru" ? "Без аккаунтов, email и регистрации. Ваш ключ появится здесь сразу после оплаты" : language === "es" ? "Sin cuentas, email ni registro. Tu clave aparecerá aquí inmediatamente después del pago" : "No account, no email, no registration required. Your key appears here immediately after payment",
      };
    }
    return {
      title: t.onboarding.connectTitle,
      subtitle: t.onboarding.connectSubtitle,
      step3: t.onboarding.pasteKeyStep,
      bottomNote: language === "ru" ? "Ваш персональный ключ появится здесь после оплаты" : "Your personal key appears here after purchase",
    };
  }, [campaign, language, t]);

  const getHeaderLabel = () => {
    if (campaign === "default") {
      if (currentStep === 0) return t.onboarding.welcome;
      if (currentStep === 1) return t.onboarding.useCases;
      if (currentStep === 2) return t.onboarding.plans;
      if (currentStep === 3) return (language === "ru" ? "Подключение" : language === "es" ? "Conexión" : "Connect");
      return t.onboarding.readySteadyGo;
    }
    if (currentStep === 0) {
      return language === "ru" ? "Добро пожаловать" : language === "es" ? "Bienvenido" : "Welcome";
    }
    if (currentStep === 1) {
      return language === "ru" ? "Проблемы" : language === "es" ? "Problemas" : "Pains";
    }
    if (currentStep === 2) {
      return language === "ru" ? "Как это работает" : language === "es" ? "Cómo funciona" : "How it works";
    }
    if (currentStep === 3) {
      return language === "ru" ? "Тарифы" : language === "es" ? "Planes" : "Plans";
    }
    return language === "ru" ? "Настройка" : language === "es" ? "Configuración" : "Setup";
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

    // 1. Log the onboarding_step_viewed cross-screen event
    trackEvent("onboarding_step_viewed", {
      step: stepParam,
      screen_name: screenName,
      campaign: campaign,
    });

    // 2. Log step-specific shown events
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
    // Disable vertical swipe to prevent page bouncing/closing in Telegram on iOS/Android
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

  const getPaddingClass = () => {
    const isSpecialCampaign = true;
    const topPadding = isSpecialCampaign ? "pt-[70px]" : "pt-5";
    if (
      (currentStep === 1 && isSpecialCampaign) ||
      (currentStep === 2 && campaign === "adults")
    ) {
      return `${topPadding} px-0 pb-0`;
    }
    if (currentStep === 0) {
      return `${topPadding} px-5 pb-0`;
    }
    if (currentStep > 0 && currentStep < 4) {
      return `${topPadding} px-5 pb-0`;
    }
    return `${topPadding} px-5 pb-10`;
  };

  return (
    <div className={`h-full flex flex-col bg-black text-white max-w-[480px] mx-auto overflow-hidden relative box-border ${getPaddingClass()}`}>
      {/* Local keyframes for transitions */}
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
      {currentStep === 0 ? (
        <div className="text-center mt-3 mb-10 flex items-center justify-center">
          <span className="text-[14px] text-[#40D1FD] font-mono">
            {getHeaderLabel()}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 h-11 mt-3 mb-10 w-full">
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

      {/* Main Slide Content Area */}
      <div
        key={currentStep} // forces re-render for slide animations
        className={`${
          direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"
        } hide-scrollbar w-full flex-1 flex flex-col justify-start items-center overflow-y-auto box-border mb-0 pb-4 ${
          currentStep > 0 && currentStep < 4 ? "pb-[100px]" : ""
        }`}
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
