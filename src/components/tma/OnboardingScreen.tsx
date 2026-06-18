"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Plan, Language, Translations, HapticType } from "./types";
import GradientBlock from "../GradientBlock";
import { trackEvent } from "../../lib/mixpanel";

interface OnboardingScreenProps {
  t: Translations;
  language: Language;
  onComplete: () => void;
  plans: Plan[];
  triggerHaptic: (type: HapticType) => void;
  personalKey?: string;
  onSelectPlanForPayment?: (planId: string) => void;
}

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.98543 17.9453C5.43867 17.9306 3.33203 12.7318 3.33203 10.0842C3.33203 5.75929 6.57644 4.81245 7.82681 4.81245C8.3903 4.81245 8.99199 5.03374 9.5227 5.22956C9.89381 5.36615 10.2776 5.50716 10.4911 5.50716C10.6189 5.50716 10.92 5.38721 11.1858 5.28196C11.7527 5.05627 12.4582 4.77576 13.2797 4.77576C13.2812 4.77576 13.2831 4.77576 13.2846 4.77576C13.898 4.77576 15.7579 4.91038 16.8761 6.58962L17.138 6.98323L16.7611 7.26768C16.2225 7.67402 15.2399 8.41524 15.2399 9.88349C15.2399 11.6225 16.3527 12.2912 16.8874 12.6129C17.1234 12.7548 17.3676 12.9012 17.3676 13.2214C17.3676 13.4305 15.6992 17.9194 13.2762 17.9194C12.6834 17.9194 12.2643 17.7412 11.8947 17.584C11.5206 17.4249 11.198 17.2878 10.6648 17.2878C10.3946 17.2878 10.0529 17.4156 9.69107 17.5512C9.19667 17.7357 8.63705 17.9453 8.00208 17.9453H7.98543Z" fill="black" />
    <path d="M13.539 0.833374C13.6021 3.10859 11.975 4.68703 10.3497 4.58803C10.0819 2.77233 11.9748 0.833374 13.539 0.833374Z" fill="black" />
  </svg>
);

const AndroidIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V11H6v7zM16 8l1.41-1.41c.2-.2.2-.51 0-.71a.498.498 0 0 0-.7 0L15.17 7.42A8.914 8.914 0 0 0 12 6.8c-1.15 0-2.25.22-3.17.62L7.29 5.88c-.2-.2-.51-.2-.7 0a.498.498 0 0 0 0 .7L8 8C5.55 9.4 4.09 11.96 4.01 14.93h15.98C19.9 11.96 18.45 9.4 16 8zm-6.5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" fill="black" />
  </svg>
);

function SwipeSlider({
  onComplete,
  text,
  triggerHaptic,
}: {
  onComplete: () => void;
  text: string;
  triggerHaptic: (type: HapticType) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const maxDrag = containerWidth - 50 - 12; // container width - handle width - padding (6px left, 6px right)
    let newX = clientX - startXRef.current;
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    setDragX(newX);
  };

  const handleEnd = () => {
    if (!isDragging || !containerRef.current) return;
    setIsDragging(false);
    const containerWidth = containerRef.current.clientWidth;
    const maxDrag = containerWidth - 50 - 12;
    if (dragX >= maxDrag * 0.9) {
      setDragX(maxDrag);
      triggerHaptic("success");
      onComplete();
    } else {
      setDragX(0);
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const handleGlobalEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalEnd);
      window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      window.addEventListener("touchend", handleGlobalEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging, dragX]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "56px",
        borderRadius: "12px",
        background: "#333333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.6)",
          pointerEvents: "none",
          marginLeft: "24px",
        }}
      >
        {text}
      </span>

      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => {
          if (e.cancelable) {
            e.preventDefault();
          }
          if (e.touches[0]) handleStart(e.touches[0].clientX);
        }}
        style={{
          position: "absolute",
          left: `calc(6px + ${dragX}px)`,
          top: "8px",
          width: "50px",
          height: "40px",
          borderRadius: "12px",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          transition: isDragging ? "none" : "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 10,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.83333 12.0202L11.6667 6.18685L5.83333 0.353516M11.6667 6.18685L0 6.18685" stroke="black" strokeLinejoin="round" />
        </svg>

      </div>
    </div>
  );
}

const SERVERS_ROW1 = [
  { name: "Germany", flag: "🇩🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
];

const SERVERS_ROW2 = [
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Georgia", flag: "🇬🇪" },
];

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

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      aria-checked={value}
      role="switch"
      style={{
        position: "relative",
        width: "44px",
        height: "26px",
        borderRadius: "13px",
        background: value ? "#00D1FF" : "rgba(255,255,255,0.12)",
        border: "none",
        cursor: value ? "default" : "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "21px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

export default function OnboardingScreen({
  t,
  language,
  onComplete,
  plans,
  triggerHaptic,
  personalKey,
  onSelectPlanForPayment,
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
    trackEvent("onboarding_connect_key_copied", {});
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

  // No default selection on initialization as user can skip step

  useEffect(() => {
    trackEvent("onboarding_started", {});
  }, []);

  useEffect(() => {
    const screens = ["welcome", "use_cases", "plans", "connect", "ready"];
    const screenName = screens[currentStep] || "unknown";

    // Map currentStep to the step parameter expected by the user (accounting for skipped billing_region = step 3)
    // 0 -> 0, 1 -> 1, 2 -> 2, 3 -> 4, 4 -> 5
    let stepParam = currentStep;
    if (currentStep === 3) stepParam = 4;
    else if (currentStep === 4) stepParam = 5;

    // 1. Log the onboarding_step_viewed cross-screen event
    trackEvent("onboarding_step_viewed", {
      step: stepParam,
      screen_name: screenName,
    });

    // 2. Log step-specific shown events
    if (currentStep === 0) {
      trackEvent("onboarding_welcome_shown", {});
    } else if (currentStep === 1) {
      trackEvent("onboarding_use_cases_shown", {});
    } else if (currentStep === 2) {
      trackEvent("onboarding_plans_shown", {});
    } else if (currentStep === 3) {
      trackEvent("onboarding_connect_shown", {});
    } else if (currentStep === 4) {
      trackEvent("onboarding_completed_shown", {});
    }
  }, [currentStep]);

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

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#000000",
        color: "#fff",
        maxWidth: "480px",
        margin: "0 auto",
        overflow: "hidden",
        fontFamily: "var(--font-onest), sans-serif",
        position: "relative",
        padding: currentStep > 0 && currentStep < 4 ? "20px 20px 0px" : "20px 20px 40px",
        boxSizing: "border-box",
      }}
    >
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
        <div style={{
          textAlign: "center",
          marginTop: "16px",
          marginBottom: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{
            fontSize: "14px",
            color: "#40D1FD",
            fontFamily: "Jetbrains Mono",
          }}>
            {t.onboarding.welcome}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            height: "50px",
            marginTop: "20px",
            marginBottom: "55px",
            width: "100%",
          }}
        >
          {/* Category Label */}
          <span
            style={{
              fontSize: "14px",
              color: "#40D1FD",
              fontFamily: "Jetbrains Mono, sans-serif",
            }}
          >
            {currentStep === 1
              ? t.onboarding.useCases
              : currentStep === 2
                ? t.onboarding.plans
                : currentStep === 3
                  ? (language === "ru" ? "Подключение" : language === "es" ? "Conexión" : "Connect")
                  : t.onboarding.readySteadyGo}
          </span>

          {/* Step dots */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", height: "20px" }}>
            {[0, 1, 2, 3, 4].map((idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              let height = "4px";
              let background = "rgba(255, 255, 255, 0.2)";

              if (isActive) {
                height = "12px";
                background = "#00D1FF";
              } else if (idx === currentStep - 1) {
                height = "8px";
                background = "#FFFFFF";
              } else if (isCompleted) {
                background = "#FFFFFF";
              }

              return (
                <div
                  key={idx}
                  style={{
                    width: "4px",
                    height: height,
                    borderRadius: "1px",
                    background: background,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Main Slide Content Area */}
      <div
        key={currentStep} // forces re-render for slide animations
        className={`${direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"} hide-scrollbar`}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          boxSizing: "border-box",
          width: "100%",
          overflowY: "auto",
          paddingBottom: currentStep > 0 && currentStep < 4 ? "120px" : "16px",
          marginBottom: "0px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Step 0: Welcome cards (1-to-1 match with the image) */}
        {currentStep === 0 && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
            justifyContent: "center",
            height: "100%",
          }}>
            {/* Card 1: Start Walkthrough */}
            <GradientBlock
              label=""
              primaryColor="#D197C3" // violet/purple glow
              secondaryColor="#8F3B81" // fuschia/violet
              baseColor="#471849" // deep plum base color
              borderRadius="70px"
              height={240}
              animate={true}
              glowIntensity={4}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              absoluteChildren={true}
            >
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                boxSizing: "border-box",
                textAlign: "center",
              }}>
                <h3 style={{
                  fontSize: "24px",
                  color: "#fff",
                  margin: "0 0 20px",
                  fontFamily: "var(--font-onest), sans-serif",
                }}>
                  {t.onboarding.showHowWorks}
                </h3>
                <p style={{
                  fontSize: "16px",
                  color: "#ffffffff",
                  opacity: ".6",
                  margin: "0 0 20px",
                  fontWeight: 400,
                }}>
                  {t.onboarding.quickWalkthrough}
                </p>
                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    trackEvent("onboarding_welcome_cta_clicked", {});
                    setDirection("next");
                    setCurrentStep(1);
                  }}
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px 15px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, sans-serif",
                  }}
                >
                  {t.onboarding.start}
                </button>
              </div>
            </GradientBlock>

            {/* Card 2: Skip Tour */}
            <GradientBlock
              label=""
              primaryColor="#606767" // grey glow
              secondaryColor="#2D2E2D" // dark grey
              baseColor="#1C1B1A" // obsidian base color
              borderRadius="70px"
              height={240}
              animate={false}
              glowIntensity={.6}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              absoluteChildren={true}
            >
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                boxSizing: "border-box",
                textAlign: "center",
              }}>
                <h3 style={{
                  fontSize: "24px",
                  color: "#fff",
                  margin: "0 0 20px",
                }}>
                  {t.onboarding.readyToGo}
                </h3>
                <p style={{
                  fontSize: "16px",
                  color: "#fff",
                  opacity: "0.4",
                  margin: "0 0 20px",
                  fontWeight: 400,
                  maxWidth: "160px"
                }}>
                  {t.onboarding.skipTourConnect}
                </p>
                <button
                  onClick={handleSkip}
                  style={{
                    background: "#494948",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px 15px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, sans-serif",
                  }}
                >
                  {t.onboarding.skipAndGo}
                </button>
              </div>
            </GradientBlock>
          </div>
        )}

        {/* Step 1: Use cases */}
        {currentStep === 1 && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box", marginTop: "auto", marginBottom: "auto" }}>
            <h2
              style={{
                fontSize: "24px",
                textAlign: "center",
                color: "#fff",
                margin: "0 0 8px",
                lineHeight: 1.2,
              }}
            >
              {t.onboarding.useCasesTitle}
            </h2>

            <p
              style={{
                fontSize: "14px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.4)",
                margin: "0 0 40px",
                lineHeight: 1.4,
                fontFamily: "var(--font-onest), sans-serif",
              }}
            >
              {t.onboarding.useCasesDesc}
            </p>

            <div style={{ display: "flex", gap: "10px", width: "100%", flex: 1, minHeight: "350px" }}>
              {/* Left Column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>

                {/* Zoom&Calls */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "40px",
                    background: "#1A1A1A",
                    padding: "30px 20px",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ fontSize: "18px", color: "#fff", display: "block", marginBottom: "4px" }}>
                    {t.onboarding.zoomCalls}
                  </span>
                  <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)", display: "block" }}>
                    {t.onboarding.voipMode}
                  </span>

                  {/* Dot signal/voip animation */}
                  <div style={{ position: "relative", width: "100%", height: "20px", marginTop: "auto", display: "flex", alignItems: "center" }}>
                    {/* Horizontal dotted line */}
                    <div style={{
                      width: "100%",
                      height: "2px",
                      background: "repeating-linear-gradient(to right, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 8px)"
                    }} />
                    {/* Sliding indicator */}
                    <div style={{
                      position: "absolute",
                      width: "4px",
                      height: "12px",
                      background: "#00D1FF",
                      boxShadow: "0 0 8px #00D1FF",
                      animation: "voip-pulse 3s ease-in-out infinite"
                    }} />
                  </div>
                </div>

                {/* Wi-Fi security */}
                <div
                  onClick={handleToggleWifiSecurity}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "40px",
                    background: "#1A1A1A",
                    padding: "30px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    cursor: wifiSecurity ? "default" : "pointer",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "16px", color: "#fff", display: "block", marginBottom: "4px" }}>
                      {t.onboarding.wifiSecurity}
                    </span>
                    <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)", display: "block" }}>
                      {t.onboarding.alwaysOn}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Toggle value={wifiSecurity} onChange={handleToggleWifiSecurity} />
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>

                {/* Gaming mode */}
                <div
                  onClick={handleToggleGamingMode}
                  style={{
                    height: "70px",
                    borderRadius: "30px",
                    background: "#1A1A1A",
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    cursor: gamingMode ? "default" : "pointer",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "80px" }}>
                    <span style={{ fontSize: "14px", color: "#fff" }}>
                      {t.onboarding.gamingMode}
                    </span>
                  </div>
                  <Toggle value={gamingMode} onChange={handleToggleGamingMode} />
                </div>

                {/* Bypass blocks */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    borderRadius: "40px",
                    background: "#1A1A1A",
                    padding: "30px 20px",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#fff",
                      display: "block",
                      marginBottom: "4px",
                      fontFamily: "var(--font-onest), sans-serif",
                      fontWeight: 500,
                      zIndex: 1,
                    }}
                  >
                    {t.onboarding.bypassBlocks}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.4)",
                      display: "block",
                      fontFamily: "var(--font-onest), sans-serif",
                      zIndex: 1,
                    }}
                  >
                    {t.onboarding.serversCount}
                  </span>

                  {/* Decorative arches and background SVG */}
                  <div style={{ position: "relative", width: "100%", height: "20px", marginTop: "auto", display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="156" height="30" viewBox="0 0 156 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M85 27.5C85 12.5883 97.0883 0.5 112 0.5C126.912 0.5 139 12.5883 139 27.5" stroke="white">
                          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
                        </path>
                        <path d="M47 27.5C47 17.0066 55.5066 8.5 66 8.5C76.4934 8.5 85 17.0066 85 27.5" stroke="white" strokeOpacity="0.4">
                          <animate attributeName="strokeOpacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite" />
                        </path>
                        <path opacity="0.6" d="M0 27.5H175H350" stroke="url(#paint0_linear_1_2)" strokeDasharray="1 8" />

                        {/* Sliding indicator node */}
                        <rect x="0" y="25" width="5" height="5" fill="#40D1FD" filter="url(#svg-glow)">
                          <animate attributeName="x" values="0;150;0" dur="3s" repeatCount="indefinite" />
                        </rect>

                        {/* Flashing server nodes */}
                        <rect x="44" y="24.5" width="5" height="5" fill="#40D1FD">
                          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
                        </rect>
                        <rect x="82" y="24.5" width="5" height="5" fill="#40D1FD">
                          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="136" y="24.5" width="5" height="5" fill="#40D1FD">
                          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                        </rect>

                        {/* Static server nodes */}
                        <rect x="127" y="25.5" width="3" height="3" fill="#535353" />
                        <rect x="91" y="25.5" width="3" height="3" fill="#535353" />
                        <rect x="35" y="25.5" width="3" height="3" fill="#535353" />

                        <defs>
                          <linearGradient id="paint0_linear_1_2" x1="0" y1="28" x2="350" y2="28" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white" stopOpacity="0" />
                            <stop offset="0.197122" stopColor="white" />
                            <stop offset="0.807705" stopColor="white" />
                            <stop offset="1" stopColor="white" stopOpacity="0" />
                          </linearGradient>
                          <filter id="svg-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Private browsing */}
                <div
                  style={{
                    height: "90px",
                    borderRadius: "24px",
                    background: "#1A1A1A",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "16px", color: "#fff", textWrap: "nowrap" }}>
                      {t.onboarding.privateBrowsing}
                    </span>
                    <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)" }}>
                      {t.onboarding.noLog}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "100%", height: "20px" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.0013 18.3334C14.6037 18.3334 18.3346 14.6025 18.3346 10.0001C18.3346 5.39771 14.6037 1.66675 10.0013 1.66675C5.39893 1.66675 1.66797 5.39771 1.66797 10.0001C1.66797 14.6025 5.39893 18.3334 10.0013 18.3334Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.66797 10H18.3346" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.0013 1.66675C12.0857 3.94871 13.2703 6.91011 13.3346 10.0001C13.2703 13.0901 12.0857 16.0515 10.0013 18.3334C7.9169 16.0515 6.73234 13.0901 6.66797 10.0001C6.73234 6.91011 7.9169 3.94871 10.0013 1.66675V1.66675Z" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Plan */}
        {currentStep === 2 && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <h2
              style={{
                fontSize: "24px",
                textAlign: "center",
                color: "#fff",
                margin: "0 0 6px",
                lineHeight: 1.2,
                fontFamily: "var(--font-onest), sans-serif",
              }}
            >
              {t.onboarding.pickPlanTitle}
            </h2>

            <p
              style={{
                fontSize: "16px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.4)",
                margin: "0 0 50px",
                lineHeight: 1.4,
                fontFamily: "var(--font-onest), sans-serif",
              }}
            >
              {t.onboarding.pickPlanDesc}
            </p>

            {/* Plans Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {onboardingPlans.map((plan) => {
                const isYearly = plan.periodMonths === 12;
                const isActive = tempSelectedPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      triggerHaptic("light");
                      setTempSelectedPlanId(plan.id);
                      const planType = plan.periodMonths === 12 ? "1_year" : plan.periodMonths === 1 ? "30_days" : `${plan.periodMonths}_months`;
                      const priceVal = plan.usdTotal ?? 0;
                      trackEvent("onboarding_plan_selected", { plan: planType, price: priceVal });
                    }}
                    style={{
                      width: "100%",
                      height: "170px",
                      borderRadius: "45px",
                      position: "relative",
                      cursor: "pointer",
                      overflow: "hidden",
                      userSelect: "none",
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
                      glowIntensity={isYearly ? 1.2 : 0.25}
                      borderGlow={true}
                      enableMouseTracking={false}
                      solidGradient={isYearly ? "radial-gradient(circle at 50% 0%, rgb(196 112 255) 0%, rgb(131 21 209) 45%, rgb(120 143 202) 75%, rgb(77, 168, 213) 100%)" : undefined}
                      enableHoverScale={false}
                      absoluteChildren={true}
                    >
                      {/* White Border Overlay when Selected */}
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            border: "2px solid #FFFFFF",
                            borderRadius: "45px",
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
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "16px 12px 20px",
                          zIndex: 20,
                          pointerEvents: "none",
                          boxSizing: "border-box",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        {/* Plan title badge */}
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "11px",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            background: isYearly ? "rgba(0, 0, 0, 0.16)" : "rgba(255, 255, 255, 0.08)",
                            color: "#fff",
                            fontFamily: "var(--font-onest), sans-serif",
                          }}
                        >
                          {getPlanLabelText(plan.periodMonths, language)}
                        </span>

                        <div>
                          <span style={{
                            display: "block",
                            fontSize: language === "ru" ? "24px" : "28px",
                            color: "#fff",
                            lineHeight: 1.1,
                            fontFamily: "var(--font-onest), sans-serif",
                          }}>
                            {`$ ${plan.usdPerMonth.toFixed(2)}`}
                          </span>
                          <span style={{ display: "block", fontSize: "10px", color: isYearly ? "rgba(255,255,255,0.85)" : "#8A94A6", marginTop: "2px", fontFamily: "var(--font-onest), sans-serif" }}>
                            {t.home.perMonth}
                          </span>
                        </div>

                        <span style={{
                          display: "block",
                          fontSize: "11px",
                          color: isYearly ? "#E0F2FE" : "#8A94A6",
                          opacity: isYearly ? 0.9 : 1,
                          fontFamily: "var(--font-onest), sans-serif",
                        }}>
                          {getBilledFrequencyText(plan.periodMonths, language, t)}
                        </span>
                      </div>
                    </GradientBlock>
                  </div>
                );
              })}
            </div>
            {/* SELECT AND BUY Button */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px", width: "100%" }}>
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
                style={{
                  background: selectedPlan ? "#FFFFFF" : "rgba(255, 255, 255, 0.02)",
                  border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                  color: selectedPlan ? "#000000" : "#FFFFFF",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "14px",
                  padding: "10px 24px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              >
                {selectedPlan
                  ? t.home.buyFor(
                    `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
                    selectedPlan.starsPrice
                  ).toUpperCase()
                  : t.onboarding.selectAndBuy.toUpperCase()}
              </button>
            </div>
            {/* What's always included Checklist */}
            <div style={{ marginTop: "30px", width: "100%", padding: "0 4px", boxSizing: "border-box" }}>
              <h4 style={{ fontSize: "14px", color: "#fff", margin: "0 0 12px", fontFamily: "var(--font-onest), sans-serif" }}>
                {language === "ru" ? "Что всегда включено" : language === "es" ? "Qué está incluido" : "What's always included"}
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {[
                  t.onboarding.bandwidth,
                  t.onboarding.servers50,
                  t.onboarding.moneyBack7,
                  t.onboarding.noLogs
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.707031 4.24269L4.24257 7.77822L11.3136 0.707153" stroke="white" strokeOpacity={0.4} strokeLinecap="square" />
                    </svg>

                    <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", fontFamily: "var(--font-onest), sans-serif", fontWeight: 400 }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Connect Guide Steps */}
        {currentStep === 3 && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <h2
              style={{
                fontSize: "24px",
                textAlign: "center",
                color: "#fff",
                margin: "0 0 6px",
                lineHeight: 1.2,
                fontFamily: "var(--font-onest), sans-serif",
              }}
            >
              {t.onboarding.connectTitle}
            </h2>

            <p
              style={{
                fontSize: "14px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.4)",
                margin: "0 0 24px",
                lineHeight: 1.4,
                fontFamily: "var(--font-onest), sans-serif",
              }}
            >
              {t.onboarding.connectSubtitle}
            </p>

            {/* Guide checklist steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>

              {/* Step 1: Buy a plan */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {planPurchased ? (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : "1"}
                  </div>
                  <span style={{ fontSize: "16px", color: planPurchased ? "rgba(255,255,255,0.4)" : "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.onboarding.buyPlanStep}
                  </span>
                </div>

                {/* Plans card block (Only visible when no plan is selected yet) */}
                {!planPurchased && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {onboardingPlans.map((plan) => {
                        const isYearly = plan.periodMonths === 12;
                        const isActive = tempSelectedPlanId === plan.id;

                        return (
                          <div
                            key={plan.id}
                            onClick={() => {
                              triggerHaptic("light");
                              setTempSelectedPlanId(plan.id);
                              const planType = plan.periodMonths === 12 ? "1_year" : plan.periodMonths === 1 ? "30_days" : `${plan.periodMonths}_months`;
                              const priceVal = plan.usdTotal ?? 0;
                              trackEvent("onboarding_plan_selected", { plan: planType, price: priceVal });
                            }}
                            style={{
                              width: "100%",
                              height: "170px",
                              borderRadius: "45px",
                              position: "relative",
                              cursor: "pointer",
                              overflow: "hidden",
                              userSelect: "none",
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
                              glowIntensity={isYearly ? 1.2 : 0.25}
                              borderGlow={true}
                              enableMouseTracking={false}
                              solidGradient={isYearly ? "radial-gradient(circle at 50% 0%, rgb(196 112 255) 0%, rgb(131 21 209) 45%, rgb(120 143 202) 75%, rgb(77, 168, 213) 100%)" : undefined}
                              enableHoverScale={false}
                              absoluteChildren={true}
                            >
                              {/* White Border Overlay when Selected */}
                              {isActive && (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    border: "2px solid #FFFFFF",
                                    borderRadius: "45px",
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
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  padding: "16px 12px 20px",
                                  zIndex: 20,
                                  pointerEvents: "none",
                                  boxSizing: "border-box",
                                  textAlign: "center",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "11px",
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    background: isYearly ? "rgba(0, 0, 0, 0.16)" : "rgba(255, 255, 255, 0.08)",
                                    color: "#fff",
                                    fontFamily: "var(--font-onest), sans-serif",
                                  }}
                                >
                                  {getPlanLabelText(plan.periodMonths, language)}
                                </span>

                                <div>
                                  <span style={{
                                    display: "block",
                                    fontSize: language === "ru" ? "24px" : "28px",
                                    color: "#fff",
                                    lineHeight: 1.1,
                                    fontFamily: "var(--font-onest), sans-serif",
                                  }}>
                                    {`$ ${plan.usdPerMonth.toFixed(2)}`}
                                  </span>
                                  <span style={{ display: "block", fontSize: "10px", color: isYearly ? "rgba(255,255,255,0.85)" : "#8A94A6", marginTop: "2px", fontFamily: "var(--font-onest), sans-serif" }}>
                                    {t.home.perMonth}
                                  </span>
                                </div>

                                <span style={{
                                  display: "block",
                                  fontSize: "11px",
                                  color: isYearly ? "#E0F2FE" : "#8A94A6",
                                  opacity: isYearly ? 0.9 : 1,
                                  fontFamily: "var(--font-onest), sans-serif",
                                }}>
                                  {getBilledFrequencyText(plan.periodMonths, language, t)}
                                </span>
                              </div>
                            </GradientBlock>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
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
                        style={{
                          background: selectedPlan ? "#FFFFFF" : "rgba(255, 255, 255, 0.02)",
                          border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                          color: selectedPlan ? "#000000" : "#FFFFFF",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "12px",
                          padding: "10px 24px",
                          borderRadius: "14px",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                        }}
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
              <div style={{
                height: "1px",
                backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 2px, transparent 2px, transparent 8px)",
                margin: "4px 0"
              }} />

              {/* Step 2: Get the app */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    2
                  </div>
                  <span style={{ fontSize: "16px", color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.onboarding.getAppStep}
                  </span>
                </div>

                {/* Visit Appstore / Android Store centered button (Always visible) */}
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "4px" }}>
                  {isAndroid ? (
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
                        trackEvent("onboarding_connect_playstore_clicked", {});
                        window.open("https://play.google.com", "_blank");
                      }}
                      style={{
                        margin: "4px auto",
                        width: "fit-content",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        borderRadius: "14px",
                        background: "#fff",
                        color: "#000",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      <AndroidIcon />
                      {t.onboarding.visitAndroidStore}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
                        trackEvent("onboarding_connect_appstore_clicked", {});
                        window.open("https://apps.apple.com/us/app/happ-proxy-utility/id6504287215", "_blank");
                      }}
                      style={{
                        margin: "4px auto",
                        width: "fit-content",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        borderRadius: "14px",
                        background: "#fff",
                        color: "#000",
                        fontSize: "12px",
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      <AppleIcon />
                      {t.guide.visitAppStore}
                    </button>
                  )}
                </div>
              </div>

              {/* Dotted separator */}
              <div style={{
                height: "1px",
                backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 2px, transparent 2px, transparent 8px)",
                margin: "4px 0"
              }} />

              {/* Step 3: Paste your key */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    3
                  </div>
                  <span style={{ fontSize: "16px", color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.onboarding.pasteKeyStep}
                  </span>
                </div>

                {/* Key block and Copy key button (Always visible) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "4px" }}>
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
                    enableHoverScale={false}
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

                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: copied ? "rgba(255, 255, 255, 0.08)" : "#FFFFFF",
                        border: copied ? "1px solid rgba(255, 255, 255, 0.12)" : "none",
                        color: copied ? "rgba(255, 255, 255, 0.4)" : "#000000",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "12px",
                        padding: "12px 24px",
                        borderRadius: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {copied ? "✓ " + t.guide.copied.toUpperCase() : t.guide.copyKey.toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Step 4: Ready Steady Go (Final swipe slider page) */}
        {currentStep === 4 && (
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            padding: "20px 0 10px",
            boxSizing: "border-box",
            height: "100%",
          }}>
            {/* Vertical dotted line separator above title */}
            <div style={{
              width: "1px",
              flex: 1.2,
              backgroundImage: "repeating-linear-gradient(to bottom, #999999 0px, #999999 2px, transparent 2px, transparent 8px)",
              margin: "24px auto"
            }} />

            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <h2
                style={{
                  fontSize: "30px",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                  fontFamily: "var(--font-onest), sans-serif",
                }}
              >
                {t.onboarding.everythingInOnePlace}
              </h2>

              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.4)",
                  margin: 0,
                  lineHeight: 1.4,
                  fontFamily: "var(--font-onest), sans-serif",
                }}
              >
                {t.onboarding.quickReference}
              </p>
            </div>

            {/* Vertical dotted line separator */}
            <div style={{
              width: "1px",
              flex: 1,
              backgroundImage: "repeating-linear-gradient(to bottom, #999999 0px, #999999 2px, transparent 2px, transparent 8px)",
              margin: "24px auto"
            }} />

            {/* Draggable Swipe Slider */}
            <div style={{ width: "100%", padding: "0 10px", boxSizing: "border-box" }}>
              <SwipeSlider
                onComplete={() => {
                  triggerHaptic("success");
                  trackEvent("onboarding_completed_cta_clicked", {});
                  trackEvent("onboarding_completed", {});
                  onComplete();
                }}
                text={t.onboarding.swipeToStart}
                triggerHaptic={triggerHaptic}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      {
        currentStep > 0 && currentStep < 4 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              alignItems: "center",
              // Blurred backing style like native tabbar, spanning full width
              background: "rgba(18, 20, 26, 0.4)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "16px 20px 24px",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.3)",
              zIndex: 10,
            }}
          >
            <button
              onClick={handlePrev}
              style={{
                // flex: 1,
                height: "40px",
                borderRadius: "16px",
                background: "#333333",
                color: "#fff",
                fontSize: "14px",
                cursor: "pointer",
                outline: "none",
                padding: "0 15px",
                fontFamily: "JetBrains Mono, monospace",
                transition: "background 0.2s ease",
              }}
            >
              {t.onboarding.back}
            </button>

            <button
              onClick={handleNext}
              style={{
                // flex: 2,
                height: "40px",
                borderRadius: "12px",
                background: "#fff",
                color: "#000",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                outline: "none",
                padding: "0 60px",
                fontFamily: "JetBrains Mono, monospace",
                transition: "transform 0.1s ease",
              }}
            >
              {t.onboarding.next}
            </button>
          </div>
        )
      }

      {/* Regions confirmation drawer removed as payment methods are shown directly */}
    </div >
  );
}
