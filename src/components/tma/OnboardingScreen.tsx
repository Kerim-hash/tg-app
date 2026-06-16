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
          letterSpacing: "0.08em",
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
        cursor: "pointer",
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
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [gamingMode, setGamingMode] = useState<boolean>(true);
  const [wifiSecurity, setWifiSecurity] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [tempSelectedPlanId, setTempSelectedPlanId] = useState<string>("");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(false);
  const [billingRegion, setBillingRegion] = useState<string>("UAE");
  const [planPurchased, setPlanPurchased] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const platform = typeof window !== "undefined" ? (window as any)?.Telegram?.WebApp?.platform || "" : "";
  const isAndroid = platform === "android";

  const activeKey = personalKey || "https://fglove.online/x/dFCGjeCq4zw3d0f";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeKey);
    triggerHaptic("success");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    if (plans.length > 0 && !tempSelectedPlanId) {
      const defaultPlan = plan1Year || onboardingPlans[1] || onboardingPlans[0];
      if (defaultPlan) {
        setTempSelectedPlanId(defaultPlan.id);
        setSelectedPlanId(defaultPlan.id);
      }
    }
  }, [plans, plan1Year, onboardingPlans, tempSelectedPlanId]);

  useEffect(() => {
    trackEvent("onboarding_screen_viewed", { step: currentStep });
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
    if (currentStep > 0) {
      triggerHaptic("light");
      setDirection("prev");
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic("medium");
    trackEvent("onboarding_skipped", { at_step: currentStep });
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
        padding: "20px 20px 40px",
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
          .animate-spin-globe {
            animation: spin-globe 10s linear infinite;
            transform-origin: center;
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
            letterSpacing: "0.05em",
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
              letterSpacing: "0.05em",
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
          display: "flex",
          flexDirection: "column",
          justifyContent: currentStep === 3 || currentStep === 2 ? "flex-start" : "center",
          alignItems: "center",
          boxSizing: "border-box",
          width: "100%",
          overflowY: "auto",
          paddingBottom: "16px",
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
              height={230}
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
                    setDirection("next");
                    setCurrentStep(1);
                  }}
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 15px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, sans-serif",
                    letterSpacing: "0.05em",
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
              borderRadius="50px"
              height={230}
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
                    padding: "12px 15px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "JetBrains Mono, sans-serif",
                    letterSpacing: "0.05em",
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
          <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
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

            <div style={{ display: "flex", gap: "10px", width: "100%", flex: 1, maxHeight: "350px" }}>
              {/* Left Column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* Zoom&Calls */}
                <div
                  style={{
                    flex: 1.1,
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
                      borderRadius: "2px",
                      boxShadow: "0 0 8px #00D1FF",
                      animation: "voip-pulse 3s ease-in-out infinite"
                    }} />
                  </div>
                </div>

                {/* Wi-Fi security */}
                <div
                  onClick={() => {
                    triggerHaptic("light");
                    setWifiSecurity(!wifiSecurity);
                  }}
                  style={{
                    flex: 0.9,
                    borderRadius: "40px",
                    background: "#1A1A1A",
                    padding: "30px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    cursor: "pointer",
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
                    <Toggle value={wifiSecurity} onChange={() => {
                      triggerHaptic("light");
                      setWifiSecurity(!wifiSecurity);
                    }} />
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* Gaming mode */}
                <div
                  onClick={() => {
                    triggerHaptic("light");
                    setGamingMode(!gamingMode);
                  }}
                  style={{
                    height: "70px",
                    borderRadius: "30px",
                    background: "#1A1A1A",
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", maxWidth: "80px" }}>
                    <span style={{ fontSize: "14px", color: "#fff" }}>
                      {t.onboarding.gamingMode}
                    </span>
                  </div>
                  <Toggle value={gamingMode} onChange={() => {
                    triggerHaptic("light");
                    setGamingMode(!gamingMode);
                  }} />
                </div>

                {/* Bypass blocks */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: "40px",
                    background: "#1A1A1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Embedded Bypass blocks SVG */}
                  <svg width="100%" height="100%" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", maxHeight: "100%" }}>
                    <g clipPath="url(#clip0_228_4893)">
                      <path d="M0 40C0 17.9086 17.9086 0 40 0H130C152.091 0 170 17.9086 170 40V130C170 152.091 152.091 170 130 170H40C17.9086 170 0 152.091 0 130V40Z" fill="white" fillOpacity="0.05" />
                      <path className="bypass-arch-solid" d="M99 136C99 121.088 111.088 109 126 109C140.912 109 153 121.088 153 136" stroke="white" strokeWidth="1" />
                      <path className="bypass-arch-translucent" d="M61 136C61 125.507 69.5066 117 80 117C90.4934 117 99 125.507 99 136" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                      <path d="M21.548 47V34.274H26.012C26.648 34.274 27.224 34.328 27.74 34.436C28.256 34.532 28.7 34.7 29.072 34.94C29.456 35.18 29.75 35.504 29.954 35.912C30.158 36.32 30.26 36.836 30.26 37.46C30.26 38.108 30.11 38.684 29.81 39.188C29.522 39.692 29.072 40.064 28.46 40.304C29.276 40.448 29.888 40.784 30.296 41.312C30.704 41.828 30.908 42.518 30.908 43.382C30.908 44.09 30.776 44.678 30.512 45.146C30.248 45.614 29.882 45.986 29.414 46.262C28.958 46.526 28.43 46.718 27.83 46.838C27.23 46.946 26.594 47 25.922 47H21.548ZM23.114 45.578H25.868C26.24 45.578 26.624 45.56 27.02 45.524C27.428 45.476 27.806 45.386 28.154 45.254C28.502 45.11 28.784 44.888 29 44.588C29.216 44.288 29.324 43.886 29.324 43.382C29.324 42.95 29.24 42.596 29.072 42.32C28.916 42.044 28.7 41.828 28.424 41.672C28.16 41.516 27.854 41.408 27.506 41.348C27.158 41.288 26.804 41.258 26.444 41.258H23.114V45.578ZM23.114 39.854H25.562C26.006 39.854 26.42 39.818 26.804 39.746C27.188 39.662 27.524 39.53 27.812 39.35C28.1 39.17 28.322 38.936 28.478 38.648C28.646 38.36 28.73 38 28.73 37.568C28.742 37.016 28.622 36.608 28.37 36.344C28.118 36.08 27.782 35.906 27.362 35.822C26.954 35.738 26.51 35.696 26.03 35.696H23.114V39.854ZM37.1769 51.248C36.4449 51.248 35.7369 51.146 35.0529 50.942C34.3809 50.738 33.7749 50.384 33.2349 49.88L33.9009 48.674C34.3689 49.046 34.8669 49.34 35.3949 49.556C35.9349 49.772 36.4989 49.88 37.0869 49.88C38.0709 49.88 38.7729 49.592 39.1929 49.016C39.6249 48.452 39.8409 47.732 39.8409 46.856V45.722C39.6249 46.046 39.3489 46.316 39.0129 46.532C38.6889 46.736 38.3289 46.892 37.9329 47C37.5369 47.096 37.1289 47.144 36.7089 47.144C35.7729 47.144 35.0349 46.958 34.4949 46.586C33.9549 46.214 33.5709 45.698 33.3429 45.038C33.1149 44.378 33.0009 43.616 33.0009 42.752V37.514H34.5309V42.32C34.5309 42.752 34.5549 43.178 34.6029 43.598C34.6629 44.006 34.7769 44.378 34.9449 44.714C35.1129 45.038 35.3589 45.302 35.6829 45.506C36.0069 45.698 36.4389 45.794 36.9789 45.794C37.6629 45.794 38.2089 45.626 38.6169 45.29C39.0369 44.954 39.3369 44.504 39.5169 43.94C39.7089 43.376 39.8049 42.752 39.8049 42.068V37.514H41.3349V47C41.3349 47.684 41.2449 48.29 41.0649 48.818C40.8849 49.346 40.6149 49.79 40.2549 50.15C39.8949 50.51 39.4569 50.78 38.9409 50.96C38.4369 51.152 37.8489 51.248 37.1769 51.248ZM43.7412 50.42V37.514H45.1992L45.2712 38.936C45.5952 38.444 46.0332 38.066 46.5852 37.802C47.1492 37.538 47.7552 37.406 48.4032 37.406C49.3632 37.406 50.1492 37.622 50.7612 38.054C51.3732 38.474 51.8232 39.05 52.1112 39.782C52.4112 40.514 52.5612 41.342 52.5612 42.266C52.5612 43.19 52.4112 44.018 52.1112 44.75C51.8112 45.482 51.3492 46.058 50.7252 46.478C50.1012 46.898 49.3032 47.108 48.3312 47.108C47.8512 47.108 47.4192 47.06 47.0352 46.964C46.6512 46.856 46.3152 46.706 46.0272 46.514C45.7392 46.31 45.4872 46.076 45.2712 45.812V50.42H43.7412ZM48.2052 45.758C48.9012 45.758 49.4532 45.602 49.8612 45.29C50.2692 44.966 50.5632 44.54 50.7432 44.012C50.9352 43.484 51.0312 42.902 51.0312 42.266C51.0312 41.618 50.9352 41.03 50.7432 40.502C50.5632 39.974 50.2632 39.554 49.8432 39.242C49.4232 38.93 48.8652 38.774 48.1692 38.774C47.5452 38.774 47.0112 38.936 46.5672 39.26C46.1352 39.572 45.8052 39.998 45.5772 40.538C45.3492 41.066 45.2352 41.648 45.2352 42.284C45.2352 42.944 45.3432 43.538 45.5592 44.066C45.7752 44.594 46.1052 45.008 46.5492 45.308C46.9932 45.608 47.5452 45.758 48.2052 45.758ZM57.6464 47.108C57.2144 47.108 56.7944 47.054 56.3864 46.946C55.9904 46.826 55.6304 46.652 55.3064 46.424C54.9944 46.184 54.7424 45.89 54.5504 45.542C54.3704 45.182 54.2804 44.768 54.2804 44.3C54.2804 43.76 54.3764 43.304 54.5684 42.932C54.7724 42.56 55.0424 42.266 55.3784 42.05C55.7144 41.834 56.1044 41.678 56.5484 41.582C56.9924 41.486 57.4544 41.438 57.9344 41.438H60.7244C60.7244 40.898 60.6464 40.43 60.4904 40.034C60.3464 39.638 60.1064 39.332 59.7704 39.116C59.4344 38.888 58.9904 38.774 58.4384 38.774C58.1024 38.774 57.7904 38.81 57.5024 38.882C57.2144 38.954 56.9684 39.068 56.7644 39.224C56.5604 39.38 56.4104 39.59 56.3144 39.854H54.6764C54.7604 39.422 54.9224 39.056 55.1624 38.756C55.4144 38.444 55.7144 38.192 56.0624 38C56.4224 37.796 56.8064 37.646 57.2144 37.55C57.6224 37.454 58.0304 37.406 58.4384 37.406C59.8064 37.406 60.7784 37.808 61.3544 38.612C61.9304 39.416 62.2184 40.502 62.2184 41.87V47H60.9404L60.8504 45.794C60.5864 46.154 60.2684 46.43 59.8964 46.622C59.5244 46.814 59.1404 46.94 58.7444 47C58.3604 47.072 57.9944 47.108 57.6464 47.108ZM57.7904 45.758C58.3904 45.758 58.9064 45.662 59.3384 45.47C59.7824 45.266 60.1244 44.972 60.3644 44.588C60.6044 44.204 60.7244 43.736 60.7244 43.184V42.716H59.0504C58.6544 42.716 58.2644 42.722 57.8804 42.734C57.4964 42.746 57.1484 42.794 56.8364 42.878C56.5244 42.962 56.2724 43.106 56.0804 43.31C55.9004 43.514 55.8104 43.808 55.8104 44.192C55.8104 44.552 55.9004 44.846 56.0804 45.074C56.2724 45.302 56.5184 45.476 56.8184 45.596C57.1304 45.704 57.4544 45.758 57.7904 45.758ZM68.0448 47.108C67.6128 47.108 67.1748 47.066 66.7308 46.982C66.2988 46.898 65.8908 46.754 65.5068 46.55C65.1348 46.346 64.8228 46.07 64.5708 45.722C64.3188 45.374 64.1568 44.942 64.0848 44.426H65.6328C65.7528 44.75 65.9448 45.014 66.2088 45.218C66.4848 45.41 66.7908 45.548 67.1268 45.632C67.4748 45.716 67.8048 45.758 68.1168 45.758C68.3088 45.758 68.5308 45.746 68.7828 45.722C69.0348 45.698 69.2748 45.644 69.5028 45.56C69.7428 45.464 69.9348 45.326 70.0788 45.146C70.2348 44.966 70.3128 44.714 70.3128 44.39C70.3128 44.15 70.2588 43.952 70.1508 43.796C70.0428 43.64 69.8928 43.514 69.7008 43.418C69.5088 43.31 69.2748 43.232 68.9988 43.184C68.4348 43.064 67.8288 42.95 67.1808 42.842C66.5448 42.734 65.9808 42.53 65.4888 42.23C65.3208 42.122 65.1648 42.002 65.0208 41.87C64.8888 41.726 64.7748 41.57 64.6788 41.402C64.5828 41.222 64.5048 41.03 64.4448 40.826C64.3968 40.61 64.3728 40.376 64.3728 40.124C64.3728 39.656 64.4628 39.254 64.6428 38.918C64.8348 38.57 65.0988 38.288 65.4348 38.072C65.7708 37.844 66.1548 37.676 66.5868 37.568C67.0308 37.46 67.5048 37.406 68.0088 37.406C68.6328 37.406 69.1908 37.508 69.6828 37.712C70.1868 37.904 70.6008 38.192 70.9248 38.576C71.2488 38.948 71.4408 39.41 71.5008 39.962H70.0788C69.9948 39.614 69.7668 39.332 69.3948 39.116C69.0228 38.888 68.5488 38.774 67.9728 38.774C67.7808 38.774 67.5648 38.792 67.3248 38.828C67.0848 38.852 66.8568 38.912 66.6408 39.008C66.4248 39.092 66.2448 39.224 66.1008 39.404C65.9568 39.572 65.8848 39.8 65.8848 40.088C65.8848 40.352 65.9508 40.574 66.0828 40.754C66.2268 40.934 66.4248 41.078 66.6768 41.186C66.9288 41.294 67.2168 41.384 67.5408 41.456C67.9608 41.54 68.4228 41.63 68.9268 41.726C69.4308 41.81 69.8268 41.9 70.1148 41.996C70.4988 42.116 70.8168 42.284 71.0688 42.5C71.3328 42.716 71.5248 42.974 71.6448 43.274C71.7768 43.574 71.8428 43.922 71.8428 44.318C71.8428 44.882 71.7288 45.344 71.5008 45.704C71.2848 46.064 70.9908 46.346 70.6188 46.55C70.2468 46.754 69.8328 46.898 69.3768 46.982C68.9328 47.066 68.4888 47.108 68.0448 47.108ZM77.203 47.108C76.771 47.108 76.333 47.066 75.889 46.982C75.457 46.898 75.049 46.754 74.665 46.55C74.293 46.346 73.981 46.07 73.729 45.722C73.477 45.374 73.315 44.942 73.243 44.426H74.791C74.911 44.75 75.103 45.014 75.367 45.218C75.643 45.41 75.949 45.548 76.285 45.632C76.633 45.716 76.963 45.758 77.275 45.758C77.467 45.758 77.689 45.746 77.941 45.722C78.193 45.698 78.433 45.644 78.661 45.56C78.901 45.464 79.093 45.326 79.237 45.146C79.393 44.966 79.471 44.714 79.471 44.39C79.471 44.15 79.417 43.952 79.309 43.796C79.201 43.64 79.051 43.514 78.859 43.418C78.667 43.31 78.433 43.232 78.157 43.184C77.593 43.064 76.987 42.95 76.339 42.842C75.703 42.734 75.139 42.53 74.647 42.23C74.479 42.122 74.323 42.002 74.179 41.87C74.047 41.726 73.933 41.57 73.837 41.402C73.741 41.222 73.663 41.03 73.603 40.826C73.555 40.61 73.531 40.376 73.531 40.124C73.531 39.656 73.621 39.254 73.801 38.918C73.993 38.57 74.257 38.288 74.593 38.072C74.929 37.844 75.313 37.676 75.745 37.568C76.189 37.46 76.663 37.406 77.167 37.406C77.791 37.406 78.349 37.508 78.841 37.712C79.345 37.904 79.759 38.192 80.083 38.576C80.407 38.948 80.599 39.41 80.659 39.962H79.237C79.153 39.614 78.925 39.332 78.553 39.116C78.181 38.888 77.707 38.774 77.131 38.774C76.939 38.774 76.723 38.792 76.483 38.828C76.243 38.852 76.015 38.912 75.799 39.008C75.583 39.092 75.403 39.224 75.259 39.404C75.115 39.572 75.043 39.8 75.043 40.088C75.043 40.352 75.109 40.574 75.241 40.754C75.385 40.934 75.583 41.078 75.835 41.186C76.087 41.294 76.375 41.384 76.699 41.456C77.119 41.54 77.581 41.63 78.085 41.726C78.589 41.81 78.985 41.9 79.273 41.996C79.657 42.116 79.975 42.284 80.227 42.5C80.491 42.716 80.683 42.974 80.803 43.274C80.935 43.574 81.001 43.922 81.001 44.318C81.001 44.882 80.887 45.344 80.659 45.704C80.443 46.064 80.149 46.346 79.777 46.55C79.405 46.754 78.991 46.898 78.535 46.982C78.091 47.066 77.647 47.108 77.203 47.108ZM92.2388 47.108C91.8068 47.108 91.4048 47.06 91.0328 46.964C90.6728 46.856 90.3428 46.706 90.0428 46.514C89.7548 46.322 89.5028 46.1 89.2868 45.848L89.2148 47H87.7568V34.274H89.2868V38.882C89.5988 38.402 90.0428 38.036 90.6188 37.784C91.2068 37.532 91.8068 37.406 92.4188 37.406C93.3788 37.406 94.1648 37.622 94.7768 38.054C95.3888 38.474 95.8388 39.05 96.1268 39.782C96.4268 40.514 96.5768 41.342 96.5768 42.266C96.5768 43.19 96.4208 44.018 96.1088 44.696C95.7968 45.428 95.3228 46.016 94.6868 46.46C94.0508 46.892 93.2348 47.108 92.2388 47.108ZM92.2208 45.758C92.9168 45.758 93.4688 45.602 93.8768 45.29C94.2848 44.966 94.5788 44.54 94.7588 44.012C94.9508 43.484 95.0468 42.902 95.0468 42.266C95.0468 41.618 94.9508 41.03 94.7588 40.502C94.5788 39.974 94.2788 39.554 93.8588 39.242C93.4388 38.93 92.8808 38.774 92.1848 38.774C91.5608 38.774 91.0268 38.948 90.5828 39.296C90.1508 39.644 89.8208 40.088 89.5928 40.628C89.3648 41.168 89.2508 41.72 89.2508 42.284C89.2508 42.896 89.3468 43.466 89.5388 43.994C89.7428 44.522 90.0608 44.948 90.4928 45.272C90.9368 45.596 91.5128 45.758 92.2208 45.758ZM98.6201 47V34.274H100.15V47H98.6201ZM106.698 47.108C105.702 47.108 104.868 46.904 104.196 46.496C103.524 46.076 103.02 45.5 102.684 44.768C102.36 44.036 102.198 43.202 102.198 42.266C102.198 41.318 102.366 40.484 102.702 39.764C103.038 39.032 103.542 38.456 104.214 38.036C104.886 37.616 105.726 37.406 106.734 37.406C107.73 37.406 108.558 37.616 109.218 38.036C109.89 38.456 110.388 39.032 110.712 39.764C111.048 40.484 111.216 41.318 111.216 42.266C111.216 43.202 111.048 44.036 110.712 44.768C110.376 45.5 109.872 46.076 109.2 46.496C108.54 46.904 107.706 47.108 106.698 47.108ZM106.698 45.758C107.394 45.758 107.958 45.602 108.39 45.29C108.834 44.978 109.158 44.558 109.362 44.03C109.578 43.502 109.686 42.914 109.686 42.266C109.686 41.618 109.578 41.03 109.362 40.502C109.158 39.974 108.834 39.554 108.39 39.242C107.958 38.93 107.394 38.774 106.698 38.774C106.014 38.774 105.45 38.93 105.006 39.242C104.574 39.554 104.25 39.974 104.034 40.502C103.83 41.03 103.728 41.618 103.728 42.266C103.728 42.914 103.83 43.502 104.034 44.03C104.25 44.558 104.574 44.978 105.006 45.29C105.45 45.602 106.014 45.758 106.698 45.758ZM117.313 47.108C116.317 47.108 115.489 46.904 114.829 46.496C114.181 46.076 113.695 45.5 113.371 44.768C113.059 44.036 112.903 43.208 112.903 42.284C112.903 41.384 113.065 40.568 113.389 39.836C113.725 39.092 114.229 38.504 114.901 38.072C115.585 37.628 116.449 37.406 117.493 37.406C118.141 37.406 118.717 37.514 119.221 37.73C119.737 37.946 120.163 38.264 120.499 38.684C120.835 39.092 121.069 39.608 121.201 40.232H119.635C119.455 39.704 119.167 39.332 118.771 39.116C118.387 38.888 117.931 38.774 117.403 38.774C116.683 38.774 116.107 38.942 115.675 39.278C115.243 39.614 114.925 40.052 114.721 40.592C114.529 41.12 114.433 41.684 114.433 42.284C114.433 42.908 114.535 43.484 114.739 44.012C114.943 44.54 115.261 44.966 115.693 45.29C116.125 45.602 116.683 45.758 117.367 45.758C117.871 45.758 118.345 45.65 118.789 45.434C119.245 45.218 119.545 44.834 119.689 44.282H121.273C121.153 44.93 120.895 45.464 120.499 45.884C120.115 46.304 119.641 46.616 119.077 46.82C118.525 47.012 117.937 47.108 117.313 47.108ZM123.212 47V34.274H124.742V41.6H126.398L129.242 37.514H130.97L127.802 42.032L131.24 47H129.44L126.578 42.932H124.742V47H123.212ZM136.019 47.108C135.587 47.108 135.149 47.066 134.705 46.982C134.273 46.898 133.865 46.754 133.481 46.55C133.109 46.346 132.797 46.07 132.545 45.722C132.293 45.374 132.131 44.942 132.059 44.426H133.607C133.727 44.75 133.919 45.014 134.183 45.218C134.459 45.41 134.765 45.548 135.101 45.632C135.449 45.716 135.779 45.758 136.091 45.758C136.283 45.758 136.505 45.746 136.757 45.722C137.009 45.698 137.249 45.644 137.477 45.56C137.717 45.464 137.909 45.326 138.053 45.146C138.209 44.966 138.287 44.714 138.287 44.39C138.287 44.15 138.233 43.952 138.125 43.796C138.017 43.64 137.867 43.514 137.675 43.418C137.483 43.31 137.249 43.232 136.973 43.184C136.409 43.064 135.803 42.95 135.155 42.842C134.519 42.734 133.955 42.53 133.463 42.23C133.295 42.122 133.139 42.002 132.995 41.87C132.863 41.726 132.749 41.57 132.653 41.402C132.557 41.222 132.479 41.03 132.419 40.826C132.371 40.61 132.347 40.376 132.347 40.124C132.347 39.656 132.437 39.254 132.617 38.918C132.809 38.57 133.073 38.288 133.409 38.072C133.745 37.844 134.129 37.676 134.561 37.568C135.005 37.46 135.479 37.406 135.983 37.406C136.607 37.406 137.165 37.508 137.657 37.712C138.161 37.904 138.575 38.192 138.899 38.576C139.223 38.948 139.415 39.41 139.475 39.962H138.053C137.969 39.614 137.741 39.332 137.369 39.116C136.997 38.888 136.523 38.774 135.947 38.774C135.755 38.774 135.539 38.792 135.299 38.828C135.059 38.852 134.831 38.912 134.615 39.008C134.399 39.092 134.219 39.224 134.075 39.404C133.931 39.572 133.859 39.8 133.859 40.088C133.859 40.352 133.925 40.574 134.057 40.754C134.201 40.934 134.399 41.078 134.651 41.186C134.903 41.294 135.191 41.384 135.515 41.456C135.935 41.54 136.397 41.63 136.901 41.726C137.405 41.81 137.801 41.9 138.089 41.996C138.473 42.116 138.791 42.284 139.043 42.5C139.307 42.716 139.499 42.974 139.619 43.274C139.751 43.574 139.817 43.922 139.817 44.318C139.817 44.882 139.703 45.344 139.475 45.704C139.259 46.064 138.965 46.346 138.593 46.55C138.221 46.754 137.807 46.898 137.351 46.982C136.907 47.066 136.463 47.108 136.019 47.108Z" fill="white" />
                      <path d="M24.5522 67.126C24.1416 67.126 23.7449 67.0793 23.3622 66.986C22.9889 66.8927 22.6482 66.7527 22.3402 66.566C22.0322 66.37 21.7709 66.1227 21.5562 65.824C21.3416 65.5253 21.1922 65.1707 21.1082 64.76H22.3402C22.4429 65.0213 22.6062 65.2453 22.8302 65.432C23.0542 65.6187 23.3062 65.7633 23.5862 65.866C23.8756 65.9593 24.1602 66.006 24.4402 66.006C24.8976 66.006 25.3036 65.9313 25.6582 65.782C26.0222 65.6327 26.3116 65.404 26.5262 65.096C26.7409 64.7787 26.8482 64.3727 26.8482 63.878C26.8482 63.1967 26.6429 62.674 26.2322 62.31C25.8216 61.946 25.2896 61.764 24.6362 61.764C24.2442 61.764 23.8802 61.834 23.5442 61.974C23.2176 62.114 22.9189 62.3053 22.6482 62.548H21.3882L21.8362 57.102H27.7582V58.222H22.9282L22.6482 61.33C22.9002 61.1247 23.2082 60.9613 23.5722 60.84C23.9362 60.7093 24.3842 60.644 24.9162 60.644C25.5509 60.644 26.1062 60.7747 26.5822 61.036C27.0676 61.2973 27.4409 61.666 27.7022 62.142C27.9729 62.6087 28.1082 63.164 28.1082 63.808C28.1082 64.4987 27.9496 65.0913 27.6322 65.586C27.3242 66.0807 26.8996 66.4633 26.3582 66.734C25.8262 66.9953 25.2242 67.126 24.5522 67.126ZM33.5292 67.112C32.8385 67.112 32.2459 66.986 31.7512 66.734C31.2659 66.4727 30.8692 66.1133 30.5612 65.656C30.2532 65.1893 30.0245 64.6527 29.8752 64.046C29.7352 63.43 29.6652 62.7673 29.6652 62.058C29.6652 61.3487 29.7352 60.6907 29.8752 60.084C30.0152 59.468 30.2392 58.9313 30.5472 58.474C30.8552 58.0073 31.2519 57.6433 31.7372 57.382C32.2319 57.1207 32.8292 56.99 33.5292 56.99C34.2665 56.99 34.8825 57.1347 35.3772 57.424C35.8812 57.704 36.2779 58.0867 36.5672 58.572C36.8659 59.0573 37.0759 59.6033 37.1972 60.21C37.3279 60.8073 37.3932 61.4233 37.3932 62.058C37.3932 62.6927 37.3279 63.3133 37.1972 63.92C37.0759 64.5173 36.8659 65.0587 36.5672 65.544C36.2779 66.02 35.8812 66.4027 35.3772 66.692C34.8825 66.972 34.2665 67.112 33.5292 67.112ZM33.5292 66.006C34.0799 66.006 34.5232 65.8893 34.8592 65.656C35.2045 65.4133 35.4705 65.096 35.6572 64.704C35.8439 64.312 35.9699 63.8873 36.0352 63.43C36.1005 62.9633 36.1332 62.506 36.1332 62.058C36.1332 61.6193 36.1005 61.1713 36.0352 60.714C35.9699 60.2473 35.8439 59.818 35.6572 59.426C35.4705 59.0247 35.2045 58.7027 34.8592 58.46C34.5232 58.2173 34.0799 58.096 33.5292 58.096C32.9692 58.096 32.5165 58.2173 32.1712 58.46C31.8259 58.7027 31.5599 59.0247 31.3732 59.426C31.1959 59.818 31.0092 60.2473 31.0092 60.714C30.9439 61.1713 30.9112 61.6193 30.9112 62.058C30.9112 62.506 30.9439 62.9633 31.0092 63.43C31.0745 63.8873 31.1959 64.312 31.3732 64.704C31.5599 65.096 31.8259 65.4133 32.1712 65.656C32.5165 65.8893 32.9692 66.006 33.5292 66.006ZM41.4817 64.76V62.59H39.4237V61.512H41.4817V59.342H42.5737V61.512H44.6457V62.59H42.5737V64.76H41.4817ZM53.2744 67.084C52.9384 67.084 52.5978 67.0513 52.2524 66.986C51.9164 66.9207 51.5991 66.8087 51.3004 66.65C51.0111 66.4913 50.7684 66.2767 50.5724 66.006C50.3764 65.7353 50.2504 65.3993 50.1944 64.998H51.3984C51.4918 65.25 51.6411 65.4553 51.8464 65.614C52.0611 65.7633 52.2991 65.8707 52.5604 65.936C52.8311 66.0013 53.0878 66.034 53.3304 66.034C53.4798 66.034 53.6524 66.0247 53.8484 66.006C54.0444 65.9873 54.2311 65.9453 54.4084 65.88C54.5951 65.8053 54.7444 65.698 54.8564 65.558C54.9778 65.418 55.0384 65.222 55.0384 64.97C55.0384 64.7833 54.9964 64.6293 54.9124 64.508C54.8284 64.3867 54.7118 64.2887 54.5624 64.214C54.4131 64.13 54.2311 64.0693 54.0164 64.032C53.5778 63.9387 53.1064 63.85 52.6024 63.766C52.1078 63.682 51.6691 63.5233 51.2864 63.29C51.1558 63.206 51.0344 63.1127 50.9224 63.01C50.8198 62.898 50.7311 62.7767 50.6564 62.646C50.5818 62.506 50.5211 62.3567 50.4744 62.198C50.4371 62.03 50.4184 61.848 50.4184 61.652C50.4184 61.288 50.4884 60.9753 50.6284 60.714C50.7778 60.4433 50.9831 60.224 51.2444 60.056C51.5058 59.8787 51.8044 59.748 52.1404 59.664C52.4858 59.58 52.8544 59.538 53.2464 59.538C53.7318 59.538 54.1658 59.6173 54.5484 59.776C54.9404 59.9253 55.2624 60.1493 55.5144 60.448C55.7664 60.7373 55.9158 61.0967 55.9624 61.526H54.8564C54.7911 61.2553 54.6138 61.036 54.3244 60.868C54.0351 60.6907 53.6664 60.602 53.2184 60.602C53.0691 60.602 52.9011 60.616 52.7144 60.644C52.5278 60.6627 52.3504 60.7093 52.1824 60.784C52.0144 60.8493 51.8744 60.952 51.7624 61.092C51.6504 61.2227 51.5944 61.4 51.5944 61.624C51.5944 61.8293 51.6458 62.002 51.7484 62.142C51.8604 62.282 52.0144 62.394 52.2104 62.478C52.4064 62.562 52.6304 62.632 52.8824 62.688C53.2091 62.7533 53.5684 62.8233 53.9604 62.898C54.3524 62.9633 54.6604 63.0333 54.8844 63.108C55.1831 63.2013 55.4304 63.332 55.6264 63.5C55.8318 63.668 55.9811 63.8687 56.0744 64.102C56.1771 64.3353 56.2284 64.606 56.2284 64.914C56.2284 65.3527 56.1398 65.712 55.9624 65.992C55.7944 66.272 55.5658 66.4913 55.2764 66.65C54.9871 66.8087 54.6651 66.9207 54.3104 66.986C53.9651 67.0513 53.6198 67.084 53.2744 67.084ZM60.9015 67.084C60.1175 67.084 59.4688 66.9253 58.9555 66.608C58.4422 66.2813 58.0595 65.8333 57.8075 65.264C57.5555 64.6947 57.4295 64.046 57.4295 63.318C57.4295 62.5807 57.5602 61.932 57.8215 61.372C58.0922 60.8027 58.4842 60.3547 58.9975 60.028C59.5108 59.7013 60.1408 59.538 60.8875 59.538C61.4662 59.538 61.9608 59.65 62.3715 59.874C62.7915 60.0887 63.1368 60.378 63.4075 60.742C63.6782 61.106 63.8742 61.5073 63.9955 61.946C64.1168 62.3753 64.1682 62.8093 64.1495 63.248C64.1402 63.332 64.1308 63.416 64.1215 63.5C64.1215 63.584 64.1168 63.668 64.1075 63.752H58.6335C58.6708 64.1813 58.7782 64.5687 58.9555 64.914C59.1328 65.2593 59.3848 65.5347 59.7115 65.74C60.0382 65.936 60.4442 66.034 60.9295 66.034C61.1722 66.034 61.4148 66.006 61.6575 65.95C61.9095 65.8847 62.1335 65.7773 62.3295 65.628C62.5348 65.4787 62.6795 65.278 62.7635 65.026H63.9815C63.8695 65.502 63.6595 65.894 63.3515 66.202C63.0435 66.5007 62.6748 66.7247 62.2455 66.874C61.8162 67.014 61.3682 67.084 60.9015 67.084ZM58.6615 62.716H62.9315C62.9222 62.296 62.8288 61.9273 62.6515 61.61C62.4742 61.2927 62.2315 61.0453 61.9235 60.868C61.6248 60.6907 61.2655 60.602 60.8455 60.602C60.3882 60.602 60.0008 60.7 59.6835 60.896C59.3755 61.092 59.1375 61.3487 58.9695 61.666C58.8015 61.9833 58.6988 62.3333 58.6615 62.716ZM65.7349 67V59.622H66.8829L66.9389 60.77C67.1255 60.4807 67.3402 60.2473 67.5829 60.07C67.8349 59.8927 68.1102 59.762 68.4089 59.678C68.7169 59.5847 69.0482 59.538 69.4029 59.538C69.4682 59.538 69.5289 59.538 69.5849 59.538C69.6502 59.538 69.7155 59.538 69.7809 59.538V60.658H69.3469C68.7682 60.658 68.2969 60.784 67.9329 61.036C67.5782 61.2787 67.3215 61.61 67.1629 62.03C67.0042 62.4407 66.9249 62.898 66.9249 63.402V67H65.7349ZM72.9595 67L70.1175 59.622H71.4615L73.7855 65.852L76.0675 59.622H77.4255L74.5835 67H72.9595ZM81.6554 67.084C80.8714 67.084 80.2227 66.9253 79.7094 66.608C79.1961 66.2813 78.8134 65.8333 78.5614 65.264C78.3094 64.6947 78.1834 64.046 78.1834 63.318C78.1834 62.5807 78.3141 61.932 78.5754 61.372C78.8461 60.8027 79.2381 60.3547 79.7514 60.028C80.2647 59.7013 80.8947 59.538 81.6414 59.538C82.2201 59.538 82.7147 59.65 83.1254 59.874C83.5454 60.0887 83.8907 60.378 84.1614 60.742C84.4321 61.106 84.6281 61.5073 84.7494 61.946C84.8707 62.3753 84.9221 62.8093 84.9034 63.248C84.8941 63.332 84.8847 63.416 84.8754 63.5C84.8754 63.584 84.8707 63.668 84.8614 63.752H79.3874C79.4247 64.1813 79.5321 64.5687 79.7094 64.914C79.8867 65.2593 80.1387 65.5347 80.4654 65.74C80.7921 65.936 81.1981 66.034 81.6834 66.034C81.9261 66.034 82.1687 66.006 82.4114 65.95C82.6634 65.8847 82.8874 65.7773 83.0834 65.628C83.2887 65.4787 83.4334 65.278 83.5174 65.026H84.7354C84.6234 65.502 84.4134 65.894 84.1054 66.202C83.7974 66.5007 83.4287 66.7247 82.9994 66.874C82.5701 67.014 82.1221 67.084 81.6554 67.084ZM79.4154 62.716H83.6854C83.6761 62.296 83.5827 61.9273 83.4054 61.61C83.2281 61.2927 82.9854 61.0453 82.6774 60.868C82.3787 60.6907 82.0194 60.602 81.5994 60.602C81.1421 60.602 80.7547 60.7 80.4374 60.896C80.1294 61.092 79.8914 61.3487 79.7234 61.666C79.5554 61.9833 79.4527 62.3333 79.4154 62.716ZM86.4888 67V59.622H87.6368L87.6928 60.77C87.8794 60.4807 88.0941 60.2473 88.3368 60.07C88.5888 59.8927 88.8641 59.762 89.1628 59.678C89.4708 59.5847 89.8021 59.538 90.1568 59.538C90.2221 59.538 90.2828 59.538 90.3388 59.538C90.4041 59.538 90.4694 59.538 90.5348 59.538V60.658H90.1008C89.5221 60.658 89.0508 60.784 88.6868 61.036C88.3321 61.2787 88.0754 61.61 87.9168 62.03C87.7581 62.4407 87.6788 62.898 87.6788 63.402V67H86.4888ZM94.2627 67.084C93.9267 67.084 93.5861 67.0513 93.2407 66.986C92.9047 66.9207 92.5874 66.8087 92.2887 66.65C91.9994 66.4913 91.7567 66.2767 91.5607 66.006C91.3647 65.7353 91.2387 65.3993 91.1827 64.998H92.3867C92.4801 65.25 92.6294 65.4553 92.8347 65.614C93.0494 65.7633 93.2874 65.8707 93.5487 65.936C93.8194 66.0013 94.0761 66.034 94.3187 66.034C94.4681 66.034 94.6407 66.0247 94.8367 66.006C95.0327 65.9873 95.2194 65.9453 95.3967 65.88C95.5834 65.8053 95.7327 65.698 95.8447 65.558C95.9661 65.418 96.0267 65.222 96.0267 64.97C96.0267 64.7833 95.9847 64.6293 95.9007 64.508C95.8167 64.3867 95.7001 64.2887 95.5507 64.214C95.4014 64.13 95.2194 64.0693 95.0047 64.032C94.5661 63.9387 94.0947 63.85 93.5907 63.766C93.0961 63.682 92.6574 63.5233 92.2747 63.29C92.1441 63.206 92.0227 63.1127 91.9107 63.01C91.8081 62.898 91.7194 62.7767 91.6447 62.646C91.5701 62.506 91.5094 62.3567 91.4627 62.198C91.4254 62.03 91.4067 61.848 91.4067 61.652C91.4067 61.288 91.4767 60.9753 91.6167 60.714C91.7661 60.4433 91.9714 60.224 92.2327 60.056C92.4941 59.8787 92.7927 59.748 93.1287 59.664C93.4741 59.58 93.8427 59.538 94.2347 59.538C94.7201 59.538 95.1541 59.6173 95.5367 59.776C95.9287 59.9253 96.2507 60.1493 96.5027 60.448C96.7547 60.7373 96.9041 61.0967 96.9507 61.526H95.8447C95.7794 61.2553 95.6021 61.036 95.3127 60.868C95.0234 60.6907 94.6547 60.602 94.2067 60.602C94.0574 60.602 93.8894 60.616 93.7027 60.644C93.5161 60.6627 93.3387 60.7093 93.1707 60.784C93.0027 60.8493 92.8627 60.952 92.7507 61.092C92.6387 61.2227 92.5827 61.4 92.5827 61.624C92.5827 61.8293 92.6341 62.002 92.7367 62.142C92.8487 62.282 93.0027 62.394 93.1987 62.478C93.3947 62.562 93.6187 62.632 93.8707 62.688C94.1974 62.7533 94.9487 62.898 C95.3407 62.9633 95.6487 63.108 C96.1714 63.2013 96.4187 63.332 96.6147 63.5C96.8201 63.668 96.9694 63.8687 97.0627 64.102C97.1654 64.3353 97.2167 64.914 C97.2167 65.3527 97.1281 65.712 96.9507 65.992C96.7827 66.272 96.5541 66.4913 96.2647 66.65C95.9754 66.8087 95.6534 66.9207 95.2987 66.986C94.9534 67.0513 94.6081 67.084 94.2627 67.084Z" fill="white" fillOpacity="0.4" />
                      <path opacity="0.6" d="M14 136H189H364" stroke="url(#paint0_linear_228_4893)" strokeDasharray="1 8" strokeWidth="1" />
                      <rect className="server-dot-active" x="58" y="133" width="5" height="5" fill="#40D1FD" />
                      <rect className="server-dot-active" x="96" y="133" width="5" height="5" fill="#40D1FD" />
                      <rect x="141" y="134" width="3" height="3" fill="#535353" />
                      <rect x="105" y="134" width="3" height="3" fill="#535353" />
                      <rect x="49" y="134" width="3" height="3" fill="#535353" />
                      <rect className="server-dot-active" x="150" y="133" width="5" height="5" fill="#40D1FD" />
                    </g>
                    <defs>
                      <linearGradient id="paint0_linear_228_4893" x1="14" y1="136.5" x2="364" y2="136.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" stopOpacity="0" />
                        <stop offset="0.197122" stopColor="white" />
                        <stop offset="0.807705" stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <clipPath id="clip0_228_4893">
                        <path d="M0 40C0 17.9086 17.9086 0 40 0H130C152.091 0 170 17.9086 170 40V130C170 152.091 152.091 170 130 170H40C17.9086 170 0 152.091 0 130V40Z" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
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
                    <span style={{ fontSize: "16px", color: "#fff" }}>
                      {t.onboarding.privateBrowsing}
                    </span>
                    <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)" }}>
                      {t.onboarding.noLog}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "end", width: "100%", height: "20px" }}>
                    <svg className="animate-spin-globe" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
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
                    }}
                    style={{
                      width: "100%",
                      height: "170px",
                      borderRadius: "36px",
                      position: "relative",
                      cursor: "pointer",
                      overflow: "hidden",
                      userSelect: "none",
                    }}
                  >
                    <GradientBlock
                      label=""
                      primaryColor={isYearly ? "#511A78" : "#FFFFFF"}
                      secondaryColor={isYearly ? "#4DA8D5" : "#8A94A6"}
                      baseColor="#12141A"
                      borderRadius="36px"
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
                            borderRadius: "36px",
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
                            letterSpacing: "0.02em",
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
                            letterSpacing: "-0.02em",
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

            {/* What's always included Checklist */}
            <div style={{ marginTop: "24px", width: "100%", padding: "0 4px", boxSizing: "border-box" }}>
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

            {/* SELECT AND BUY Button */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "24px", width: "100%" }}>
              <button
                onClick={() => {
                  triggerHaptic("medium");
                  setIsRegionModalOpen(true);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "14px",
                  letterSpacing: "0.08em",
                  padding: "10px 24px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {t.onboarding.selectAndBuy}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Connect Guide Steps */}
        {currentStep === 3 && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box", paddingBottom: "50px" }}>
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
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
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
                            }}
                            style={{
                              width: "100%",
                              height: "170px",
                              borderRadius: "36px",
                              position: "relative",
                              cursor: "pointer",
                              overflow: "hidden",
                              userSelect: "none",
                            }}
                          >
                            <GradientBlock
                              label=""
                              primaryColor={isYearly ? "#511A78" : "#FFFFFF"}
                              secondaryColor={isYearly ? "#4DA8D5" : "#8A94A6"}
                              baseColor="#12141A"
                              borderRadius="36px"
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
                                    borderRadius: "36px",
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
                                    letterSpacing: "0.02em",
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
                                    letterSpacing: "-0.02em",
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
                          triggerHaptic("medium");
                          setIsRegionModalOpen(true);
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "12px",
                          letterSpacing: "0.08em",
                          padding: "10px 24px",
                          borderRadius: "14px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {t.onboarding.selectAndBuy}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dotted separator */}
              <div style={{
                height: "1px",
                backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)",
                margin: "4px 0"
              }} />

              {/* Step 2: Get the app */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: selectedPlanId ? "#fff" : "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    2
                  </div>
                  <span style={{ fontSize: "16px", color: selectedPlanId ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.onboarding.getAppStep}
                  </span>
                </div>

                {/* Visit Appstore / Android Store centered button (Always visible) */}
                <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "4px" }}>
                  {isAndroid ? (
                    <button
                      onClick={() => {
                        triggerHaptic("medium");
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
                backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 8px)",
                margin: "4px 0"
              }} />

              {/* Step 3: Paste your key */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: selectedPlanId ? "#fff" : "rgba(255,255,255,0.4)",
                      flexShrink: 0,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    3
                  </div>
                  <span style={{ fontSize: "16px", color: selectedPlanId ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "var(--font-onest), sans-serif" }}>
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
                        letterSpacing: "0.05em",
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
            {/* Spacer to push title to center */}
            <div style={{ flex: 1.2 }} />

            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
              <h2
                style={{
                  fontSize: "30px",
                  color: "#fff",
                  margin: 0,
                  lineHeight: 1.2,
                  fontFamily: "var(--font-onest), sans-serif",
                  letterSpacing: "-0.02em",
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

            {/* Spacer before slider */}
            <div style={{ flex: 1 }} />

            {/* Draggable Swipe Slider */}
            <div style={{ width: "100%", padding: "0 10px", boxSizing: "border-box" }}>
              <SwipeSlider
                onComplete={() => {
                  triggerHaptic("success");
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
      {currentStep > 0 && currentStep < 4 && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            boxSizing: "border-box",
            marginTop: "20px",
            justifyContent: "space-between"
          }}
        >
          <button
            onClick={handlePrev}
            style={{
              // flex: 1,
              height: "50px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
              height: "52px",
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
      )}

      {/* Billing Region Drawer */}
      {isRegionModalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsRegionModalOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 100,
              transition: "opacity 0.3s ease",
            }}
          />
          {/* Drawer content */}
          <div
            className="animate-drawer-onboarding"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#0E1013",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "32px 32px 0 0",
              padding: "24px 20px 40px",
              zIndex: 110,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 4px" }} />

            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#fff",
                margin: 0,
                fontFamily: "var(--font-onest), sans-serif",
              }}>
                {language === "ru" ? "Подтвердите регион оплаты" : language === "es" ? "Confirme la región de facturación" : "Confirm a billing region first"}
              </h3>
            </div>

            {/* Select Box */}
            <div style={{ position: "relative", width: "100%" }}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: "100%",
                  background: "#16171A",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "20px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  textAlign: "left",
                  boxSizing: "border-box",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-onest), sans-serif" }}>
                  {language === "ru" ? "Регион оплаты" : language === "es" ? "Región de facturación" : "Billing region"}
                </span>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", color: "#fff", fontWeight: 500, fontFamily: "var(--font-onest), sans-serif" }}>
                    {billingRegion === "UAE" ? "UAE 🇦🇪" : billingRegion === "Russia" ? (language === "ru" ? "Россия 🇷🇺" : "Russia 🇷🇺") : (language === "ru" ? "Казахстан 🇰🇿" : "Kazakhstan 🇰🇿")}
                  </span>
                  {/* Chevron down */}
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      opacity: 0.6,
                    }}
                  >
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Custom Options List */}
              {isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "#16171A",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    zIndex: 120,
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {[
                    { value: "UAE", label: "UAE 🇦🇪" },
                    { value: "Russia", label: language === "ru" ? "Россия 🇷🇺" : "Russia 🇷🇺" },
                    { value: "Kazakhstan", label: language === "ru" ? "Казахстан 🇰🇿" : "Kazakhstan 🇰🇿" },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        triggerHaptic("light");
                        setBillingRegion(opt.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "14px 20px",
                        fontSize: "15px",
                        color: "#fff",
                        cursor: "pointer",
                        background: billingRegion === opt.value ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        transition: "background 0.2s ease",
                        textAlign: "left",
                        fontFamily: "var(--font-onest), sans-serif",
                        borderBottom: opt.value !== "Kazakhstan" ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                triggerHaptic("success");
                setPlanPurchased(true);
                if (tempSelectedPlanId) {
                  setSelectedPlanId(tempSelectedPlanId);
                }
                setIsRegionModalOpen(false);
                // If they were on Step 2 (Choose Plan), automatically advance to Step 3 (Connect)
                if (currentStep === 2) {
                  setDirection("next");
                  setCurrentStep(3);
                }
              }}
              style={{
                background: "#FFFFFF",
                border: "none",
                color: "#000000",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "14px",
                borderRadius: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255, 255, 255, 0.15)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {language === "ru" ? "ПОДТВЕРДИТЬ" : language === "es" ? "CONFIRMAR" : "CONFIRM"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
