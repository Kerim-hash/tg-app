"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import GradientBlock from "../GradientBlock";
import { ParticleGlobe } from "../ParticleGlobe";
import { ScrambleText } from "../ScrambleText";
import { PlanCard, getPlanLabelText, getBilledFrequencyText } from "./PlanCard";
import { trackEvent } from "../../lib/mixpanel";
import { apiCall } from "./api";
import type { Plan, UserData, Translations, HapticType, Tab, PaymentMethod } from "./types";

function FeatureBadge({ text, align = "left" }: { text: string; align?: "left" | "right" }) {
  return (
    <div
      className="flex items-start gap-2"
      style={{ flexDirection: align === "right" ? "row-reverse" : "row" }}
    >
      <div className="haptikos-bullet shrink-0 mt-1" />
      <ScrambleText
        text={text}
        className="font-mono"
        style={{
          fontSize: "11px",
          lineHeight: 1.35,
          letterSpacing: "-0.02em",
          color: "#40D1FD",
          textTransform: "uppercase",
          whiteSpace: "pre-line",
          textAlign: align,
        }}
        delay={align === "right" ? 500 : 300}
      />
    </div>
  );
}

interface HomeScreenProps {
  t: Translations;
  user: UserData;
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan | null) => void;
  triggerHaptic: (type: HapticType) => void;
  onTabChange: (tab: Tab) => void;
  personalKey?: string;
  onProceedPayment: (method: PaymentMethod) => Promise<void>;
  isPaying: boolean;
  billingRegion: string;
  onBillingRegionChange: (region: string) => void;
  paymentMethods?: any[];
  onRefreshProfile?: () => Promise<void>;
}

const REGION_OPTIONS = [
  { value: "UAE" },
  { value: "UZB" },
  { value: "BY" },
];

export default function HomeScreen({
  t,
  user,
  plans,
  selectedPlan,
  onSelectPlan,
  triggerHaptic,
  onTabChange,
  personalKey,
  onProceedPayment,
  isPaying,
  billingRegion,
  onBillingRegionChange,
  paymentMethods = [],
  onRefreshProfile,
}: HomeScreenProps) {
  const language = t.nav.home === "Главная" ? "ru" : t.nav.home === "Bosh sahifa" ? "uz" : t.nav.home === "Галоўная" ? "by" : "en";
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sheetRegionDropdownOpen, setSheetRegionDropdownOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState("UAE");
  const [globeOffsetTop, setGlobeOffsetTop] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const globeSize = 720; // matches maxWidth of the globe wrapper
  const globeShiftY = 0; // extra downward shift of the globe center
  const globeMinViewportTop = 80; // globe's top edge never rises above this viewport Y

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (sheetRegionDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    if (val === "UZB") return "🇺🇿 UZ UZB";
    if (val === "BY") return "🇧🇾 BY BY";
    return "🇦🇪 AE UAE";
  };

  useEffect(() => {
    if (isPaymentSheetOpen && !billingRegion) {
      setSheetRegionDropdownOpen(true);
    }
  }, [isPaymentSheetOpen, billingRegion]);

  useEffect(() => {
    if (billingRegion) {
      setTempRegion(billingRegion);
    } else {
      setTempRegion("UAE");
    }
  }, [billingRegion]);

  const hasActivePlan = !!user.activePlan;

  useLayoutEffect(() => {
    if (hasActivePlan) return;
    const container = heroContainerRef.current;
    const textBlock = heroTextRef.current;
    if (!container || !textBlock) return;

    const recalc = () => {
      const containerRect = container.getBoundingClientRect();
      const textRect = textBlock.getBoundingClientRect();
      const textCenterY = textRect.top - containerRect.top + textRect.height / 2;
      let top = textCenterY - globeSize / 2 + globeShiftY;
      // Don't let the globe's top edge climb to the very top of the screen
      const minTop = globeMinViewportTop - containerRect.top;
      if (top < minTop) top = minTop;
      setGlobeOffsetTop(top);
    };

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActivePlan]);

  useEffect(() => {
    setMounted(true);
    trackEvent("screen_home_viewed", {
      plan_status: user.activePlan ? "active" : "none" // We don't have expiring state readily available here, simplifying for now or can calculate if needed
    });
  }, [user.activePlan]);

  useEffect(() => {
    if (isPlanSheetOpen) {
      trackEvent("plan_selector_viewed", { trigger: hasActivePlan ? "extend" : "buy" });
    }
  }, [isPlanSheetOpen, hasActivePlan]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const isAnySheetOpen = isPlanSheetOpen || isPaymentSheetOpen;
    if (isAnySheetOpen) {
      mainEl.style.overflowY = "hidden";
    } else {
      mainEl.style.overflowY = "auto";
    }
    return () => {
      mainEl.style.overflowY = "auto";
    };
  }, [isPlanSheetOpen, isPaymentSheetOpen]);

  const activeKey = personalKey || "";

  const handleCopyKey = () => {
    if (!activeKey) return;
    navigator.clipboard.writeText(activeKey);
    trackEvent("personal_key_copied", { source: "home_inline" });
    triggerHaptic("success");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const subTypeNorm = (user.subscriptionType || "").toLowerCase();
  const isTrialActive = subTypeNorm === "trial" || (hasActivePlan && (user.activePlan?.isTrial || user.isTrial));

  // Pre-select the yearly plan so the BUY button is ready to go
  useEffect(() => {
    if (!selectedPlan && plans.length > 0) {
      const yearly = plans.find((p) => p.periodMonths === 12);
      onSelectPlan(yearly || plans[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, selectedPlan]);

  return (
    <div
      style={{
        padding: "calc(76px + env(safe-area-inset-top, 0px)) 16px 24px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-onest), sans-serif",
        position: "relative",
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
          .hover-scale-btn:active {
            transform: scale(0.97);
            opacity: 0.9;
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
          fontFamily: "var(--font-mono), monospace",
          marginBottom: "30px",
          animationDelay: "0ms",
        }}
      >
        {t.nav.home}
      </p>

      {hasActivePlan ? (
        <>
          {/* Welcome back heading */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: "24px",
              fontWeight: 400,
              textAlign: "center",
              color: "#FFFFFF",
              margin: "0 0 24px",
              lineHeight: 1.2,
              animationDelay: "100ms",
              fontFamily: "var(--font-onest), sans-serif",
            }}
          >
            {t.home.welcomeBack}
          </h1>

          {/* Active plan card */}
          <div
            className="animate-fade-in-up"
            style={{
              position: "relative",
              borderRadius: "70px",
              overflow: "hidden",
              animationDelay: "150ms",
            }}
          >
            <GradientBlock
              label=""
              primaryColor={isTrialActive ? "#00D1FF" : "#FF44DD"}
              secondaryColor="#9500FF"
              baseColor="#000000ff"
              borderRadius="70px"
              height={240}
              animate={false}
              animationSpeed={10}
              glowIntensity={isTrialActive ? 1.5 : 1.2}
              borderGlow={true}
              enableMouseTracking={false}
            />
            {/* Content overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "36px 24px",
                zIndex: 20,
                pointerEvents: "none",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: "#fff",
                  background: "#1A1A1A",
                  padding: "6px 12px",
                  borderRadius: "12px",
                  fontFamily: "var(--font-mono), monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {isTrialActive ? (
                  <>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#40D1FD" }} />
                    {t.home.freeTrialBadge}
                  </>
                ) : (
                  t.home.activePlanLabel
                )}
              </span>

              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.45)",
                  marginBottom: "4px",
                }}
              >
                {isTrialActive ? t.home.trialPlanName : t.home.secureFor}
              </span>
              <span
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  lineHeight: 1.1,
                  textAlign: "center",
                }}
              >
                {t.home.daysLeft(user.activePlan!.daysLeft)}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: isTrialActive ? "#40D1FD" : "rgba(255, 255, 255, 0.45)",
                }}
              >
                {isTrialActive
                  ? `(${t.home.freeTrialBadge}) • ${t.home.nextBilling(user.activePlan!.nextBilling)}`
                  : t.home.nextBilling(user.activePlan!.nextBilling)}
              </span>
            </div>
          </div>

          {/* Extend plan button */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
              animationDelay: "200ms",
            }}
          >
            <button
              className={user.paymentMethodSaved ? "" : "hover-scale-btn"}
              onClick={() => {
                if (user.paymentMethodSaved) {
                  triggerHaptic("warning");
                  return;
                }
                triggerHaptic("medium");
                const daysLeft = user.activePlan?.daysLeft || 0;
                trackEvent("extend_plan_tapped", { days_left: daysLeft, current_plan: user.activePlan?.name.includes("Year") || user.activePlan?.name.includes("год") ? "1y" : "30d" });
                apiCall("/api/track-event", "POST", { event: "buy_plan_tapped" }).catch((err) => {
                  console.error("Failed to track buy_plan_tapped event on backend:", err);
                });
                setIsPlanSheetOpen(true);
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "14px",
                background: user.paymentMethodSaved ? "transparent" : "#fff",
                border: user.paymentMethodSaved ? "1px solid rgba(255, 255, 255, 0.12)" : "none",
                color: user.paymentMethodSaved ? "rgba(255, 255, 255, 0.35)" : "#000",
                fontSize: "14px",
                fontWeight: 400,
                cursor: user.paymentMethodSaved ? "default" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.06em",
                textTransform: "uppercase",
              }}
            >
              {user.paymentMethodSaved
                ? t.home.autoRenewalActive
                : t.home.extendPlan}
            </button>
          </div>
        </>
      ) : (
        <div ref={heroContainerRef} style={{ position: "relative" }}>
          {/* Particle globe background */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: globeOffsetTop !== null ? `${globeOffsetTop}px` : "calc(-150px - env(safe-area-inset-top, 0px))",
              pointerEvents: "none",
              zIndex: 0,
              width: "100%",
              maxWidth: `${globeSize}px`,
              margin: "0 auto",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              visibility: globeOffsetTop !== null ? "visible" : "hidden",
            }}
          >
            <ParticleGlobe width={900} height={900} className="w-full h-full" />
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Feature badge — protection */}
          <div
            className="animate-fade-in-up"
            style={{ display: "flex", justifyContent: "center", animationDelay: "100ms" }}
          >
            <FeatureBadge text={t.home.badgeProtection} />
          </div>

          <div ref={heroTextRef} style={{ display: "flex", flexDirection: "column" }}>
          {/* Welcome heading */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: "32px",
              fontWeight: 400,
              textAlign: "center",
              color: "#FFFFFF",
              margin: 0,
              lineHeight: "41px",
              animationDelay: "150ms",
              fontFamily: "var(--font-onest), sans-serif",
            }}
          >
            {t.home.welcome}
          </h1>

          {/* Welcome subtitle */}
          <p
            className="animate-fade-in-up"
            style={{
              marginTop: "8px",
              fontSize: "16px",
              fontWeight: 400,
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.4)",
              margin: "0 auto",
              maxWidth: "280px",
              lineHeight: "20px",
              animationDelay: "200ms",
              fontFamily: "var(--font-onest), sans-serif",
            }}
          >
            {t.home.welcomeSubtitle}
          </p>

          {/* Activate button */}
          <div
            className="animate-fade-in-up"
            style={{ display: "flex", justifyContent: "center", animationDelay: "250ms", marginTop: "16px" }}
          >
            <button
              className="hover-scale-btn"
              onClick={() => {
                triggerHaptic("medium");
                trackEvent("activate_iguard_tapped", { source: "home_hero" });
                document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "13px 17px",
                borderRadius: "12px",
                background: "#fff",
                border: "none",
                color: "#000",
                fontSize: "14px",
                fontWeight: 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.06em",
                textTransform: "uppercase",
              }}
            >
              {t.home.activateBtn}
            </button>
          </div>
          </div>

          {/* Feature badges — privacy / speed */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              margin: "16px 0 24px",
              animationDelay: "300ms",
            }}
          >
            <FeatureBadge text={t.home.badgePrivacy} />
            <FeatureBadge text={t.home.badgeSpeed} align="right" />
          </div>
          </div>
        </div>
      )}

      {/* Choose a plan (HomeScreen embedded preview) or Unsubscribe Interface */}
      {user.paymentMethodSaved ? (
        <div
          id="unsubscribe-section"
          className="animate-fade-in-up flex flex-col gap-6 w-full p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.08] box-border items-center text-center"
          style={{ animationDelay: "400ms" }}
        >
          <div className="w-14 h-14 rounded-full bg-[#00D1FF]/10 flex items-center justify-center mb-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#00D1FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <h2 className="text-[20px] text-white m-0 mb-2">
              {t.home.autoRenewalActive}
            </h2>
            <p className="text-[14px] text-white/45 m-0 leading-normal">
              {t.home.autoRenewalDesc}
            </p>
          </div>

          <button
            className="hover-scale-btn w-full h-[50px] rounded-2xl bg-transparent border border-[#FF4D4F]/30 text-[#FF4D4F] text-[13px] font-semibold font-mono uppercase flex items-center justify-center gap-2 transition-all duration-250 ease-in-out"
            onClick={async () => {
              const confirmUnsubscribe = window.confirm(t.home.unsubscribeConfirm);
              if (!confirmUnsubscribe) return;

              triggerHaptic("medium");
              setIsUnsubscribing(true);
              try {
                await apiCall("/payment/unsubscribe", "POST");
                triggerHaptic("success");
                alert(t.home.unsubscribeSuccess);
                if (onRefreshProfile) {
                  await onRefreshProfile();
                }
              } catch (err: any) {
                triggerHaptic("warning");
                console.error("Failed to unsubscribe:", err);
                alert(err.message || "Unsubscribe failed. Please try again.");
              } finally {
                setIsUnsubscribing(false);
              }
            }}
            disabled={isUnsubscribing}
            style={{ cursor: isUnsubscribing ? "default" : "pointer" }}
          >
            {isUnsubscribing ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              t.home.unsubscribeBtn
            )}
          </button>
        </div>
      ) : !hasActivePlan ? (
        <div
          id="plans-section"
          className="animate-fade-in-up mt-5"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            width: "100%",
            animationDelay: "400ms",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", color: "#fff", margin: "0 0 6px" }}>
              {t.home.choosePlan}
            </h2>
            <p style={{ fontSize: "16px", color: "#666666", margin: 0 }}>{t.home.moneyBack}</p>
          </div>


          {/* Plan cards selector inside Main Screen — GradientBlock Figma Spec */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", width: "100%" }}>
            {plans.map((plan) => {
              const isActive = selectedPlan?.id === plan.id;

              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    if (user.paymentMethodSaved) {
                      triggerHaptic("warning");
                      return;
                    }
                    if (selectedPlan?.id === plan.id) {
                      triggerHaptic("medium");
                      setLocalSelectedMethod(null);
                      setIsPaymentSheetOpen(true);
                    } else {
                      triggerHaptic("light");
                      trackEvent("plan_card_selected", { plan: plan.periodMonths === 1 ? "30_days" : "1_year", price: plan.starsPrice || plan.usdTotal });
                      onSelectPlan(plan);
                    }
                  }}
                  style={{
                    width: "170px",
                    height: "170px",
                    flexShrink: 0,
                    borderRadius: "45px",
                    position: "relative",
                    cursor: user.paymentMethodSaved ? "default" : "pointer",
                    border: "none",
                    outline: "none",
                    overflow: "hidden",
                    background: "transparent",
                    padding: 0,
                    opacity: user.paymentMethodSaved ? 0.5 : 1,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <PlanCard
                    plan={plan}
                    plans={plans}
                    isActive={isActive}
                    language={language}
                    t={t}
                    borderRadius="45px"
                  />
                </button>
              );
            })}
          </div>

          {/* Action Buy Button below cards */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "center", position: "relative" }} className="group w-[150px]">
            <button
              className={user.paymentMethodSaved ? "" : (selectedPlan ? "hover-scale-btn" : "")}
              disabled={!user.paymentMethodSaved && !selectedPlan}
              onClick={() => {
                if (user.paymentMethodSaved) {
                  triggerHaptic("warning");
                  return;
                }
                if (!selectedPlan) {
                  triggerHaptic("warning");
                  return;
                }
                triggerHaptic("medium");
                setLocalSelectedMethod(null);
                setIsPaymentSheetOpen(true);
              }}
              style={{
                padding: "10px 15px",
                borderRadius: "14px",
                background: user.paymentMethodSaved ? "transparent" : (selectedPlan ? "#FFFFFF" : "rgba(255, 255, 255, 0.05)"),
                border: user.paymentMethodSaved ? "1px solid rgba(255, 255, 255, 0.12)" : (selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.1)"),
                color: user.paymentMethodSaved ? "rgba(255, 255, 255, 0.35)" : (selectedPlan ? "#000000" : "rgba(255, 255, 255, 0.3)"),
                fontSize: "14px",
                cursor: (user.paymentMethodSaved || !selectedPlan) ? "default" : "pointer",
                outline: "none",
                textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
                transition: "all 0.25s ease",
                opacity: user.paymentMethodSaved ? 0.5 : 1,
                width: "100%",
              }}
            >
              {user.paymentMethodSaved
                ? t.home.autoRenewalActive.toUpperCase()
                : (selectedPlan
                    ? t.home.buyBtn.toUpperCase()
                    : t.onboarding.selectAndBuy.toUpperCase())}
            </button>
            {!user.paymentMethodSaved && !selectedPlan && (
              <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {hasActivePlan && (
        <>
          {/* Server Key section */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "50px",
              animationDelay: "250ms",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#fff",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.06em",
                lineHeight: 1,
              }}
            >
              {t.home.serverKeyPill}
            </span>

            <h2 style={{ fontSize: "24px", fontWeight: 400, color: "#fff", margin: "24px 0 0", textAlign: "center", lineHeight: "31px", fontFamily: "var(--font-onest), sans-serif" }}>
              {t.home.serverKeyTitle}
            </h2>

            <p style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255, 255, 255, 0.4)", margin: "8px 0 0", textAlign: "center", lineHeight: "20px", maxWidth: "350px", fontFamily: "var(--font-onest), sans-serif" }}>
              {t.home.serverKeyDesc}
            </p>

            {/* Key container */}
            <div style={{ width: "100%", borderRadius: "24px", overflow: "hidden", marginTop: "24px" }}>
              <GradientBlock
                label=""
                primaryColor={"#cfdfe5"}
                secondaryColor={"#686F70"}
                baseColor="#1D1C1B"
                borderRadius="24px"
                height="auto"
                animate={false}
                glowIntensity={0.6}
                borderGlow={true}
                enableMouseTracking={false}
                enableHoverScale={false}
                contentAlign={"start"}
                padding="14px 24px"
              >
                <span style={{ fontSize: "12px", color: "#40D1FD", fontFamily: "var(--font-mono), monospace" }}>
                  {t.home.copyMe}
                </span>
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    fontSize: "15px",
                    color: activeKey ? "#fff" : "rgba(255, 255, 255, 0.6)",
                    fontFamily: "var(--font-onest), sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.4,
                  }}
                >
                  {activeKey || t.guide.personalKeyEmptyState}
                </span>
              </GradientBlock>
            </div>

            <button
              className="hover-scale-btn"
              onClick={handleCopyKey}
              disabled={!activeKey}
              style={{
                padding: "10px 32px",
                borderRadius: "14px",
                background: activeKey ? "#fff" : "rgba(255, 255, 255, 0.05)",
                border: activeKey ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                color: activeKey ? "#000" : "rgba(255, 255, 255, 0.3)",
                fontSize: "14px",
                cursor: activeKey ? "pointer" : "default",
                fontFamily: "var(--font-mono), monospace",
                marginTop: "24px",
              }}
            >
              {(copiedKey ? t.success.copied : t.home.copyBtn).toUpperCase()}
            </button>
          </div>

          {/* Guide section */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "50px",
              animationDelay: "300ms",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 8px",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 400,
                color: "#fff",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: "-0.06em",
                lineHeight: 1,
              }}
            >
              {t.home.guidePill}
            </span>

            <h2 style={{ fontSize: "24px", fontWeight: 400, color: "#fff", margin: "24px 0 0", textAlign: "center", lineHeight: "31px", fontFamily: "var(--font-onest), sans-serif" }}>
              {t.home.needHelpTitle}
            </h2>

            <p style={{ fontSize: "16px", fontWeight: 400, color: "rgba(255, 255, 255, 0.4)", margin: "8px 0 0", textAlign: "center", lineHeight: "20px", maxWidth: "312px", fontFamily: "var(--font-onest), sans-serif" }}>
              {t.home.needHelpDesc}
            </p>

            <button
              className="hover-scale-btn"
              onClick={() => {
                trackEvent("read_guide_tapped", { source: "home_inline" });
                triggerHaptic("light");
                onTabChange("guide");
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "14px",
                background: "transparent",
                border: "1px solid rgba(64, 209, 253, 0.5)",
                color: "#fff",
                fontSize: "14px",
                letterSpacing: "-0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                marginTop: "24px",
              }}
            >
              {t.home.readGuideBtn}
            </button>
          </div>
        </>
      )}

      {/* ─── BOTTOM SHEET 1: Choose a plan ────────────────────────────────────── */}
      {isPlanSheetOpen && mounted && createPortal(
        <>
          <div
            onClick={() => setIsPlanSheetOpen(false)}
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
              height: "auto",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#000", // Solid obsidian black
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              borderRadius: "32px 32px 0 0",
              padding: "24px 20px 60px",
              zIndex: 210,
              boxShadow: "0 -12px 40px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              boxSizing: "border-box",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 8px" }} />

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "22px", color: "#fff", margin: "0 0 4px" }}>
                {t.home.choosePlan}
              </h2>
              <p style={{ fontSize: "13px", color: "#8A94A6", margin: 0 }}>{t.home.moneyBack}</p>
            </div>

            {/* Plan cards selector inside Bottom Sheet — GradientBlock Figma Spec */}
            <div style={{ display: "flex", flexDirection: "column", gap: "45px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", width: "100%" }}>
                {plans.map((plan) => {
                  const isActive = selectedPlan?.id === plan.id;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => { triggerHaptic("light"); onSelectPlan(plan); }}
                      style={{
                        width: "170px",
                        height: "170px",
                        flexShrink: 0,
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
                      <PlanCard
                        plan={plan}
                        plans={plans}
                        isActive={isActive}
                        language={language}
                        t={t}
                        borderRadius="45px"
                      />
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "center", position: "relative" }} className="group">
                <button
                  disabled={!selectedPlan}
                  onClick={() => {
                    triggerHaptic("medium");
                    if (selectedPlan) {
                      trackEvent("select_and_continue_tapped", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", price: selectedPlan.starsPrice || selectedPlan.usdTotal, trigger: hasActivePlan ? "extend" : "buy" });
                      setIsPlanSheetOpen(false);
                      setLocalSelectedMethod(null);
                      setIsPaymentSheetOpen(true);
                    }
                  }}
                  style={{
                    width: "280px",
                    padding: "10px 15px",
                    borderRadius: "14px",
                    background: selectedPlan ? "#FFFFFF" : "rgba(255, 255, 255, 0.05)",
                    border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                    color: selectedPlan ? "#000000" : "rgba(255, 255, 255, 0.3)",
                    fontSize: "12px",
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
                    ).toUpperCase()
                    : t.onboarding.selectAndBuy.toUpperCase()}
                </button>
                {!selectedPlan && (
                  <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── BOTTOM SHEET 3: Select a payment method ──────────────────────────── */}
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
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left", fontFamily: "var(--font-onest), sans-serif", }}>
                    {t.payment.confirmBillingFirst}
                  </h2>
                </div>

                {/* Dropdown Card */}
                <div ref={dropdownRef} style={{ position: "relative", width: "100%", zIndex: sheetRegionDropdownOpen ? 1001 : 10 }}>
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
                            <span style={{ display: "block", fontSize: "15px",  color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
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
                            <span style={{ display: "block", fontSize: "15px", color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
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
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left", fontFamily: "var(--font-onest), sans-serif" }}>
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
