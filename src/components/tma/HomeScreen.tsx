"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import WebApp from "@twa-dev/sdk";
import GradientBlock from "../GradientBlock";
import { trackEvent } from "../../lib/mixpanel";
import { apiCall } from "./api";
import type { Plan, UserData, Translations, HapticType, Tab, PaymentMethod } from "./types";

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

const SERVERS_ROW1 = [
  { name: "Russia", flag: "🇷🇺" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Kazahstan", flag: "🇰🇿" },
  { name: "Albania", flag: "🇦🇱" },
];

const SERVERS_ROW2 = [
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "France", flag: "🇫🇷" },
  { name: "Germany", flag: "🇩🇪" },
];

const SERVERS_ROW3 = [
  { name: "Armenia", flag: "🇦🇲" },
  { name: "USA", flag: "🇺🇸" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Turkey", flag: "🇹🇷" },
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
  billingRegion: string;
  onBillingRegionChange: (region: string) => void;
  paymentMethods?: any[];
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
}: HomeScreenProps) {
  const language = t.nav.home === "Главная" ? "ru" : t.nav.home === "Bosh sahifa" ? "uz" : t.nav.home === "Галоўная" ? "by" : "en";
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);
  const [isKeySheetOpen, setIsKeySheetOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sheetRegionDropdownOpen, setSheetRegionDropdownOpen] = useState(false);
  const [tempRegion, setTempRegion] = useState("UAE");

  const dropdownRef = useRef<HTMLDivElement>(null);

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
        onClick={() => {
          if (!hasActivePlan) {
            triggerHaptic("light");
            document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        style={{
          position: "relative",
          borderRadius: "70px",
          overflow: "hidden",
          animationDelay: "200ms",
          cursor: !hasActivePlan ? "pointer" : "default",
        }}
      >
        <GradientBlock
          label=""
          primaryColor={hasActivePlan ? "#FF44DD" : "#567780"}
          secondaryColor={hasActivePlan ? "#9500FF" : "#76BDD2"}
          baseColor="#000000ff"
          borderRadius="70px"
          height={240}
          animate={false}
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
          flexDirection: "column",
          animationDelay: "300ms",
          padding: "0 30px"
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
            padding: "10px 15px",
            borderRadius: "14px",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#fff",
            fontSize: "14px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono), monospace",
            display: "flex",
            gap: "5px",
            alignItems: "center",
            justifyContent: "center",
          }}
        ><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H15" stroke="white" strokeLinecap="square" strokeLinejoin="round" />
            <path d="M10 15V5" stroke="white" strokeLinecap="square" strokeLinejoin="round" />
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
            apiCall("/api/track-event", "POST", { event: "buy_plan_tapped" }).catch((err) => {
              console.error("Failed to track buy_plan_tapped event on backend:", err);
            });
            setIsPlanSheetOpen(true);
          }}
          style={{
            flex: 0.75,
            padding: "10px 15px",
            borderRadius: "14px",
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "14px",
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
          backgroundImage: "repeating-linear-gradient(to right, #999999 0px, #999999 1px, transparent 1px, transparent 8px)",
          margin: "16px 0",
          animationDelay: "350ms",
        }}
      />

      {/* Choose a plan (HomeScreen embedded preview) */}
      <div
        id="plans-section"
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
                  {/* White Border Overlay when Selected */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        border: "1px solid #FFFFFF",
                        borderRadius: "45px",
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
                        fontFamily: "JetBrains Mono, monospace",
                        textTransform: "capitalize"
                      }}
                    >
                      {getPlanLabelText(plan.periodMonths, language)}
                    </span>
                    <div>
                      <span style={{
                        display: "block",
                        fontSize: language === "ru" || language === "by" ? "20px" : "24px",
                        color: "#fff",
                        lineHeight: 1.1,
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
            padding: "10px 15px",
            borderRadius: "14px",
            background: selectedPlan ? "#FFFFFF" : "transparent",
            border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
            color: selectedPlan ? "#000000" : "#FFFFFF",
            fontSize: "14px",
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
              `${selectedPlan.usdTotal % 1 === 0 ? selectedPlan.usdTotal : selectedPlan.usdTotal.toFixed(2)}$`,
              selectedPlan.starsPrice
            )
            : t.onboarding.selectAndBuy.toUpperCase()}
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
            <div style={{ display: "flex", flexDirection: "column", gap: "45px", width: "100%" }}>
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
                        primaryColor={isYearly ? "#5B1B85" : "#cfdfe5"}
                        secondaryColor={isYearly ? "#7F96D0" : "#606768"}
                        baseColor={isYearly ? "#5B1B85" : "#08090a"}
                        borderRadius="36px"
                        height="100%"
                        animate={isYearly}
                        glowIntensity={isYearly ? 1.2 : 0.25}
                        borderGlow={true}
                        solidGradient={isYearly ? "#5B1B85" : undefined}
                        solidBoxShadow={isYearly ? "inset 0 0 24px 0 rgba(230, 252, 255, 0.7), inset 0 0 24px -22px rgba(230, 252, 255, 0.1), inset 0 -35px 65px -1px rgba(64, 209, 253, 1), inset 0 48px 67px -56px rgba(93, 28, 137, 1)" : undefined}
                        enableHoverScale={false}
                        absoluteChildren={true}
                      >
                        {/* White Border Overlay when Selected */}
                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              border: "1px solid #FFFFFF",
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
                            }}
                          >
                            {getPlanLabelText(plan.periodMonths, language)}
                          </span>
                          <div>
                            <span style={{
                              display: "block",
                              fontSize: language === "ru" || language === "by" ? "24px" : "28px",
                              color: "#fff",
                              lineHeight: 1.1,
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
                  padding: "10px 15px",
                  borderRadius: "14px",
                  background: selectedPlan ? "#FFFFFF" : "transparent",
                  border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                  color: selectedPlan ? "#000000" : "#FFFFFF",
                  fontSize: "12px",
                  alignSelf: "center",
                  cursor: "pointer",
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
            {personalKey ? (
              <>
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
                <div style={{ display: "flex", gap: "15px", margin: "12px auto 0", width: "100%" }}>
                  <button
                    onClick={() => {
                      trackEvent("read_guide_tapped", { source: "home_modal" });
                      triggerHaptic("light");
                      setIsKeySheetOpen(false);
                      onTabChange("guide");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 15px",
                      borderRadius: "14px",
                      background: "#333333",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "JetBrains Mono, monospace",
                      textWrap: "nowrap",
                      border: "none",
                    }}
                  >
                    {t.success.readGuide.toUpperCase()}
                  </button>
                  <button
                    onClick={handleCopyAndClose}
                    style={{
                      flex: 1.5,
                      padding: "10px 15px",
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
              </>
            ) : (
              <>
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

                {/* Side-by-side Buttons */}
                <div style={{ display: "flex", gap: "15px", margin: "12px auto 0", width: "100%" }}>
                  <button
                    onClick={() => {
                      trackEvent("read_guide_tapped", { source: "home_modal" });
                      triggerHaptic("light");
                      setIsKeySheetOpen(false);
                      onTabChange("guide");
                    }}
                    style={{
                      flex: 1,
                      padding: "10px 15px",
                      borderRadius: "14px",
                      background: "#333333",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "JetBrains Mono, monospace",
                      textWrap: "nowrap",
                      border: "none",
                    }}
                  >
                    {t.success.readGuide.toUpperCase()}
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setIsKeySheetOpen(false);
                      setIsPlanSheetOpen(true);
                    }}
                    style={{
                      flex: 1.5,
                      padding: "10px 15px",
                      borderRadius: "14px",
                      background: "#fff",
                      border: "none",
                      color: "#000",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {t.onboarding.selectAndBuy.toUpperCase()}
                  </button>
                </div>
              </>
            )}
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

            {!billingRegion ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h2 style={{ fontSize: "20px", color: "#fff", margin: 0, textAlign: "left", fontFamily: "var(--font-onest), sans-serif", fontWeight: 700 }}>
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
                    width: "280px",
                    padding: "10px 15px",
                    borderRadius: "14px",
                    background: localSelectedMethod ? "#FFFFFF" : "transparent",
                    border: localSelectedMethod ? "none" : "1.5px solid #FFFFFF",
                    color: localSelectedMethod ? "#000000" : "#FFFFFF",
                    fontSize: "12px",
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
