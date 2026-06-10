"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import WebApp from "@twa-dev/sdk";
import GradientBlock from "../GradientBlock";
import { trackEvent } from "../../lib/mixpanel";
import type { Plan, UserData, Translations, HapticType, Tab, PaymentMethod } from "./types";

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

const SERVERS_ROW1 = [
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
];

const SERVERS_ROW2 = [
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Germany", flag: "🇩🇪" },
];

const SERVERS_ROW3 = [
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Germany", flag: "🇩🇪" },
];

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
}

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
}: HomeScreenProps) {
  const language = t.nav.home === "Главная" ? "ru" : t.nav.home === "Inicio" ? "es" : "en";
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);
  const [isKeySheetOpen, setIsKeySheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [mounted, setMounted] = useState(false);

  const hasActivePlan = !!user.activePlan;

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
    const isAnySheetOpen = isPlanSheetOpen || isKeySheetOpen || isPaymentSheetOpen;
    if (isAnySheetOpen) {
      mainEl.style.overflowY = "hidden";
    } else {
      mainEl.style.overflowY = "auto";
    }
    return () => {
      mainEl.style.overflowY = "auto";
    };
  }, [isPlanSheetOpen, isKeySheetOpen, isPaymentSheetOpen]);

  const activeKey = personalKey || "";

  const handleCopyAndClose = () => {
    navigator.clipboard.writeText(activeKey);
    trackEvent("personal_key_copied", { source: "home_modal", trigger: "extend_flow" });
    triggerHaptic("success");
    setIsKeySheetOpen(false);
    try {
      WebApp.showAlert("Access key copied to clipboard!");
    } catch {
      alert("Access key copied to clipboard!");
    }
  };

  return (
    <div
      style={{
        padding: "50px 16px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
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

      {/* Welcome heading */}
      <h1
        className="animate-fade-in-up"
        style={{
          fontSize: "22px",
          textAlign: "center",
          color: "#fff",
          margin: 0,
          lineHeight: 1.2,
          animationDelay: "100ms",
        }}
      >
        {t.home.welcome}
      </h1>

      {/* Active plan card — GradientBlock with overlay content */}
      <div
        className="animate-fade-in-up"
        style={{
          position: "relative",
          borderRadius: "70px",
          overflow: "hidden",
          animationDelay: "200ms",
        }}
      >
        <GradientBlock
          label=""
          primaryColor={hasActivePlan ? "#FF44DD" : "#567780"}
          secondaryColor={hasActivePlan ? "#9500FF" : "#76BDD2"}
          baseColor="#000000ff"
          borderRadius="70px"
          height={240}
          animate={true}
          animationSpeed={10}
          glowIntensity={hasActivePlan ? 1.2 : 1.7}
          borderGlow={true}
          enableMouseTracking={false}
        />
        {/* Content overlay — positioned above GradientBlock layers */}
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
          {/* Top Capsule pill */}
          <span
            style={{
              fontSize: "12px",
              letterSpacing: "0.14em",
              color: "#fff",
              background: "#1A1A1A",
              padding: "6px 8px",
              borderRadius: "12px",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {t.home.activePlanLabel}
          </span>

          {hasActivePlan ? (
            <>
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.45)",
                  marginBottom: "4px",
                }}
              >
                {t.home.secureFor}
              </span>
              <span
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {t.home.daysLeft(user.activePlan!.daysLeft)}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.45)",
                }}
              >
                {t.home.nextBilling(user.activePlan!.nextBilling)}
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: "24px",
                  color: "#666666",
                  letterSpacing: "-0.02em",
                  transform: "translateY(-12px)",
                }}
              >
                {t.home.noActivePlan}
              </span>
              <div style={{ height: "24px" }} />
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="animate-fade-in-up"
        style={{
          display: "flex",
          gap: "10px",
          margin: "auto",
          width: "100%",
          animationDelay: "300ms",
        }}
      >
        <button
          className="hover-scale-btn"
          onClick={() => {
            triggerHaptic("medium");
            trackEvent("connect_device_tapped", { plan_status: hasActivePlan ? "active" : "none", source: "home" });
            setIsKeySheetOpen(true);
          }}
          style={{
            flex: 1.25,
            padding: "14px 8px",
            borderRadius: "14px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#fff",
            fontSize: "14px",
            letterSpacing: "0.03em",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono), monospace",
            display: "flex",
            gap: "5px",
            alignItems: "center",
            justifyContent: "center",
          }}
        ><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H15" stroke="white" stroke-linecap="square" stroke-linejoin="round" />
            <path d="M10 15V5" stroke="white" stroke-linecap="square" stroke-linejoin="round" />
          </svg>

          {t.home.connectDevice.toUpperCase()}
        </button>
        <button
          className="hover-scale-btn"
          onClick={() => {
            triggerHaptic("medium");
            if (user.activePlan) {
              const daysLeft = user.activePlan.daysLeft || 0;
              trackEvent("extend_plan_tapped", { days_left: daysLeft, current_plan: user.activePlan.name.includes("Year") || user.activePlan.name.includes("год") ? "1y" : "30d" });
            } else {
              trackEvent("buy_plan_tapped", { source: "home_cta" });
            }
            setIsPlanSheetOpen(true);
          }}
          style={{
            flex: 0.75,
            padding: "14px 8px",
            borderRadius: "14px",
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "14px",
            letterSpacing: "0.03em",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {(hasActivePlan ? t.home.extendPlan : t.home.buyPlan).toUpperCase()}
        </button>
      </div>

      <div
        className="animate-fade-in-up"
        style={{
          height: "1px",
          backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 8px)",
          margin: "16px 0",
          animationDelay: "350ms",
        }}
      />

      {/* Choose a plan (HomeScreen embedded preview) */}
      <div
        className="animate-fade-in-up"
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", width: "100%" }}>
          {plans.map((plan) => {
            const isYearly = plan.periodMonths === 12;
            const isActive = selectedPlan?.id === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => {
                  triggerHaptic("light");
                  trackEvent("plan_card_selected", { plan: plan.periodMonths === 1 ? "30_days" : "1_year", price: plan.starsPrice || plan.usdTotal });
                  onSelectPlan(plan);
                }}
                style={{
                  width: "100%",
                  height: "170px",
                  borderRadius: "30px",
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
                  primaryColor={isYearly ? "#511A78" : "#cfdfe5"}
                  secondaryColor={isYearly ? "#7F96D0" : "#606768"}
                  baseColor="#08090a"
                  borderRadius="30px"
                  height="100%"
                  animate={isYearly}
                  glowIntensity={isYearly ? .3 : 0.5}
                  borderGlow={true}
                  enableMouseTracking={false}
                  solidGradient={isYearly ? "radial-gradient(circle at 50% 0%, rgb(196 112 255) 0%, rgb(131 21 209) 45%, rgb(120 143 202) 75%, rgb(77, 168, 213) 100%)" : undefined}
                  absoluteChildren={true}
                  enableHoverScale={false}
                >
                  {/* White Border Overlay when Selected */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        border: "2px solid #FFFFFF",
                        borderRadius: "30px",
                        pointerEvents: "none",
                        zIndex: 30,
                      }}
                    />
                  )}

                  {/* Overlay Content */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "16px 12px 20px",
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
                        fontSize: language === "ru" ? "20px" : "24px", 
                        color: "#fff", 
                        lineHeight: 1.1, 
                        letterSpacing: "-0.02em" 
                      }}>
                        {`$ ${plan.usdPerMonth.toFixed(2)}`}
                      </span>
                      <span style={{ display: "block", fontSize: "14px", color: isYearly ? "rgba(255,255,255,0.85)" : "#fff", marginTop: "2px" }}>
                        {t.home.perMonth}
                      </span>
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

        {/* Action Buy Button below cards */}
        <button
          onClick={() => {
            triggerHaptic("medium");
            if (selectedPlan) {
              setLocalSelectedMethod(null);
              setIsPaymentSheetOpen(true);
            } else {
              const yearlyPlan = plans.find(p => p.periodMonths === 12) || plans[0];
              onSelectPlan(yearlyPlan);
              setLocalSelectedMethod(null);
              setTimeout(() => setIsPaymentSheetOpen(true), 100);
            }
          }}
          style={{
            padding: "13px 15px",
            borderRadius: "14px",
            background: selectedPlan ? "#FFFFFF" : "transparent",
            border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
            color: selectedPlan ? "#000000" : "#FFFFFF",
            fontSize: "14px",
            letterSpacing: "0.05em",
            alignSelf: "center",
            cursor: "pointer",
            outline: "none",
            textTransform: "uppercase",
            fontFamily: "JetBrains Mono, monospace",
            transition: "all 0.25s ease",
          }}
        >
          {selectedPlan
            ? t.home.buyFor(
                `${Math.round(selectedPlan.usdTotal)}$`,
                selectedPlan.starsPrice
              )
            : "SELECT AND BUY"}
        </button>
      </div>

      {/* Servers with continuous marquee horizontal ticker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "40px" }}>
        <p style={{ fontSize: "16px", color: "#666666", textAlign: "center", margin: 0 }}>
          {t.home.optimizedServers}
        </p>
        <div
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
              @keyframes home-marquee-ltr {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes home-marquee-rtl {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0); }
              }
            `
          }}
          />

          {/* Row 1: Left to Right */}
          <div style={{ display: "flex", width: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: "8px", animation: "home-marquee-ltr 26s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW1, ...SERVERS_ROW1].map((srv, idx) => (
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
            <div style={{ display: "flex", gap: "8px", animation: "home-marquee-rtl 26s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW2, ...SERVERS_ROW2].map((srv, idx) => (
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
            <div style={{ display: "flex", gap: "8px", animation: "home-marquee-ltr 22s linear infinite", width: "max-content" }}>
              {[...SERVERS_ROW3, ...SERVERS_ROW3].map((srv, idx) => (
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
            <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", width: "100%" }}>
                {plans.map((plan) => {
                  const isYearly = plan.periodMonths === 12;
                  const isActive = selectedPlan?.id === plan.id;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => { triggerHaptic("light"); onSelectPlan(plan); }}
                      style={{
                        width: "100%",
                        height: "170px",
                        borderRadius: "36px",
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

                        {/* Overlay Content */}
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
                              letterSpacing: "-0.02em" 
                            }}>
                              {`$ ${plan.usdPerMonth.toFixed(2)}`}
                            </span>
                            <span style={{ display: "block", fontSize: "10px", color: isYearly ? "rgba(255,255,255,0.85)" : "#8A94A6", marginTop: "2px" }}>
                              {t.home.perMonth}
                            </span>
                          </div>
                          <span style={{ display: "block", fontSize: "11px", color: isYearly ? "#E0F2FE" : "#8A94A6", opacity: isYearly ? 0.9 : 1 }}>
                            {getBilledFrequencyText(plan.periodMonths, language, t)}
                          </span>
                        </div>
                      </GradientBlock>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  triggerHaptic("medium");
                  if (selectedPlan) {
                    trackEvent("select_and_continue_tapped", { plan: selectedPlan.periodMonths === 1 ? "30_days" : "1_year", price: selectedPlan.starsPrice || selectedPlan.usdTotal, trigger: hasActivePlan ? "extend" : "buy" });
                    setIsPlanSheetOpen(false);
                    setLocalSelectedMethod(null);
                    setIsPaymentSheetOpen(true);
                  } else {
                    const yearlyPlan = plans.find(p => p.periodMonths === 12) || plans[0];
                    trackEvent("select_and_continue_tapped", { plan: yearlyPlan.periodMonths === 1 ? "30_days" : "1_year", price: yearlyPlan.starsPrice || yearlyPlan.usdTotal, trigger: hasActivePlan ? "extend" : "buy" });
                    onSelectPlan(yearlyPlan);
                    setLocalSelectedMethod(null);
                    setTimeout(() => {
                      setIsPlanSheetOpen(false);
                      setIsPaymentSheetOpen(true);
                    }, 100);
                  }
                }}
                style={{
                  width: "280px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: selectedPlan ? "#FFFFFF" : "transparent",
                  border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                  color: selectedPlan ? "#000000" : "#FFFFFF",
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                  alignSelf: "center",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "var(--font-mono), monospace",
                  transition: "all 0.25s ease",
                }}
              >
                {selectedPlan
                  ? t.home.buyFor(
                      `${Math.round(selectedPlan.usdTotal)}$`,
                      selectedPlan.starsPrice
                    )
                  : "SELECT AND CONTI"}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* ─── BOTTOM SHEET 2: Use your personal code ───────────────────────────── */}
      {isKeySheetOpen && mounted && createPortal(
        <>
          <div
            onClick={() => setIsKeySheetOpen(false)}
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
              height: "340px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              borderRadius: "32px 32px 0 0",
              padding: "24px 20px 32px",
              zIndex: 210,
              boxShadow: "0 -12px 40px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 8px" }} />

            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", color: "#fff", margin: 0 }}>
                {t.success.useCode}
              </h2>
            </div>

            {/* Key container */}
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


            {/* Side-by-side Buttons */}
            <div style={{ display: "flex", gap: "15px", margin: "12px auto 0" }}>
              <button
                onClick={() => {
                  trackEvent("read_guide_tapped", { source: "home_modal" });
                  triggerHaptic("light");
                  setIsKeySheetOpen(false);
                  onTabChange("guide");
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#333333",
                  color: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "JetBrains Mono, monospace",

                }}
              >
                {t.success.readGuide.toUpperCase()}
              </button>
              <button
                onClick={handleCopyAndClose}
                style={{
                  flex: 1.5,
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#fff",
                  border: "none",
                  color: "#000",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {t.success.copyAndClose.toUpperCase()}
              </button>
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
              padding: "24px 20px 32px",
              zIndex: 210,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Drag handle */}
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", margin: "0 auto 4px" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left" }}>
                Select a payment method
              </h2>
            </div>

            {/* Methods list */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
              {/* Method 1: Credit card */}
              <button
                disabled={isPaying}
                onClick={() => {
                  triggerHaptic("light");
                  setLocalSelectedMethod("card");
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
                />

                {localSelectedMethod === "card" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "2px solid #FFFFFF",
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
                      color: localSelectedMethod === "card" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Credit or debit card
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8A94A6",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    {`$ ${selectedPlan.usdTotal.toFixed(2)}`}
                  </span>
                </div>
              </button>

              {/* Method 2: Crypto */}
              <button
                disabled={isPaying}
                onClick={() => {
                  triggerHaptic("light");
                  setLocalSelectedMethod("crypto");
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
                />

                {localSelectedMethod === "crypto" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "2px solid #FFFFFF",
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
                      color: localSelectedMethod === "crypto" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Crypto
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8A94A6",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    {Math.round(selectedPlan.usdTotal)} USDT
                  </span>
                </div>
              </button>

              {/* Method 3: Telegram Stars */}
              <button
                disabled={isPaying}
                onClick={() => {
                  triggerHaptic("light");
                  setLocalSelectedMethod("stars");
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
                />

                {localSelectedMethod === "stars" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      border: "2px solid #FFFFFF",
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
                      color: localSelectedMethod === "stars" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Telegram Stars
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#8A94A6",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    {selectedPlan.starsPrice} Stars
                  </span>
                </div>
              </button>
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
                width: "280px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: localSelectedMethod ? "#FFFFFF" : "transparent",
                border: localSelectedMethod ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                color: localSelectedMethod ? "#000000" : "#FFFFFF",
                fontSize: "12px",
                letterSpacing: "0.05em",
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
                      border: "2px solid rgba(0,0,0,0.1)",
                      borderTop: "2px solid #000",
                      borderRadius: "50%",
                      animation: "tma-spin 0.8s linear infinite",
                    }}
                  />
                  PROCESSING...
                </>
              ) : localSelectedMethod ? (
                "PROCEED TO PAYMENT"
              ) : (
                "SELECT AND PAY"
              )}
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
