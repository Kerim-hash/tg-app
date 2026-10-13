"use client";

import { useState, useEffect, useRef } from "react";
import GradientBlock from "../GradientBlock";
import { ParticleGlobe } from "../ParticleGlobe";
import { ScrambleText } from "../ScrambleText";
import { PlanCard, getPlanLabelText, getBilledFrequencyText } from "./PlanCard";
import { trackEvent } from "../../lib/mixpanel";
import { getPlanStatus, getPlanType, getCurrentPlanType } from "./analytics";
import { apiCall } from "./api";
import type { Plan, UserData, Translations, HapticType, Tab, PaymentMethod } from "./types";
import PriceSummary from "./PriceSummary";
import PromoCodeInput, { type PromoApplyResult } from "./PromoCodeInput";
import Popup, { PopupButton, PopupOption, PopupOptions, PopupTitle } from "./Popup";
import {
  applyDiscountToPlan,
  isDiscountActive,
  type AppliedPromo,
  type FirstPurchaseDiscount,
} from "./discount";

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
  firstPurchaseDiscount?: FirstPurchaseDiscount | null;
  appliedPromo?: AppliedPromo | null;
  onApplyPromo?: (code: string) => Promise<PromoApplyResult>;
  onClearPromo?: () => void;
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
  firstPurchaseDiscount,
  appliedPromo,
  onApplyPromo,
  onClearPromo,
}: HomeScreenProps) {
  const language = t.nav.home === "Главная" ? "ru" : t.nav.home === "Bosh sahifa" ? "uz" : t.nav.home === "Галоўная" ? "by" : "en";
  const activeFirstPurchase = isDiscountActive(firstPurchaseDiscount) ? firstPurchaseDiscount : null;
  // A manually applied promo wins over the automatic first-purchase discount
  const effectivePercent = appliedPromo?.percent ?? activeFirstPurchase?.percent ?? 0;
  const [isPlanSheetOpen, setIsPlanSheetOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [tempRegion, setTempRegion] = useState("UAE");
  const globeSize = 720; // matches maxWidth of the globe wrapper

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
  // none | trial | active | expiring | expired — shared enum for Mixpanel
  const planStatus = getPlanStatus(user);

  useEffect(() => {
    trackEvent("screen_home_viewed", { plan_status: planStatus });
  }, [planStatus]);

  useEffect(() => {
    if (isPlanSheetOpen) {
      trackEvent("plan_selector_viewed", { screen: "home", trigger: hasActivePlan ? "extend" : "buy" });
      trackEvent("money_back_badge_viewed", { source: "plan_sheet" });
    }
  }, [isPlanSheetOpen, hasActivePlan]);

  // home_scroll_depth: 25 / 50 / 75 / 100, each fired once per Home mount.
  // `main` is the scroll container (see mtTg.tsx), not the window.
  const scrollDepthFired = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const check = () => {
      const { scrollTop, clientHeight, scrollHeight } = mainEl;
      if (scrollHeight <= 0) return;
      const pct = ((scrollTop + clientHeight) / scrollHeight) * 100;
      for (const threshold of [25, 50, 75, 100]) {
        if (pct >= threshold && !scrollDepthFired.current.has(threshold)) {
          scrollDepthFired.current.add(threshold);
          trackEvent("home_scroll_depth", { pct: threshold });
        }
      }
    };
    mainEl.addEventListener("scroll", check, { passive: true });
    // Content may already fit the viewport; measure once the enter animation settles
    const initial = window.setTimeout(check, 800);
    return () => {
      mainEl.removeEventListener("scroll", check);
      window.clearTimeout(initial);
    };
  }, []);

  // plans_block_viewed / money_back_badge_viewed: impressions of the plans block,
  // which sits below the fold. Fired once per Home mount when ≥30% is visible.
  const plansBlockFired = useRef(false);
  const moneyBackFired = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;
    const plansEl = document.getElementById("plans-section");
    const badgeEl = document.getElementById("money-back-badge");
    if (!plansEl && !badgeEl) return;
    const mainEl = document.querySelector("main");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === plansEl && !plansBlockFired.current) {
            plansBlockFired.current = true;
            trackEvent("plans_block_viewed", { plan_status: planStatus });
          }
          if (entry.target === badgeEl && !moneyBackFired.current) {
            moneyBackFired.current = true;
            trackEvent("money_back_badge_viewed", { source: "home" });
          }
        }
      },
      { root: mainEl, threshold: 0.3 },
    );
    if (plansEl) observer.observe(plansEl);
    if (badgeEl) observer.observe(badgeEl);
    return () => observer.disconnect();
  }, [planStatus, user.paymentMethodSaved]);

  const activeKey = personalKey || "";

  const handleCopyKey = () => {
    if (!activeKey) return;
    navigator.clipboard.writeText(activeKey);
    trackEvent("access_key_copied", { screen: "home", source: "home_inline" });
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
                trackEvent("extend_plan_tapped", { days_left: daysLeft, current_plan: getCurrentPlanType(user) });
                apiCall("/api/track-event", "POST", { event: "buy_plan_tapped" }).catch((err) => {
                  console.error("Failed to track buy_plan_tapped event on backend:", err);
                });
                setIsPlanSheetOpen(true);
              }}
              style={{
                minWidth: "150px",
                height: "40px",
                padding: "13px 17px",
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
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {user.paymentMethodSaved
                ? t.home.autoRenewalActive
                : t.home.extendPlan}
            </button>
          </div>
        </>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Particle globe background */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: '-50px',
              pointerEvents: "none",
              zIndex: 0,
              width: "100%",
              maxWidth: `${globeSize}px`,
              margin: "0 auto",
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
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

          <div style={{ display: "flex", flexDirection: "column" }}>
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
                trackEvent("activate_iguard_tapped", { plan_status: planStatus, has_key: !!activeKey });
                // Lead the user to their server key; fall back to the plans block if no key yet
                const target =
                  document.getElementById("server-key-section") ??
                  document.getElementById("plans-section");
                target?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              style={{
                minWidth: "150px",
                height: "40px",
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
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
          className="mt-6 animate-fade-in-up flex flex-col gap-6 w-full p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.08] box-border items-center text-center"
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
            <p id="money-back-badge" style={{ fontSize: "16px", color: "#666666", margin: 0 }}>{t.home.moneyBack}</p>
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
                      // Second tap on the selected card opens checkout
                      triggerHaptic("medium");
                      trackEvent("buy_plan_tapped", { source: "plan_card", plan: getPlanType(plan), price_usd: plan.usdTotal });
                      setLocalSelectedMethod(null);
                      setIsPaymentSheetOpen(true);
                    } else {
                      triggerHaptic("light");
                      trackEvent("plan_card_selected", {
                        screen: "home",
                        plan: getPlanType(plan),
                        price_usd: plan.usdTotal,
                        discount_pct: effectivePercent,
                        // annual is pre-selected on load; flag whether the tap matches that default
                        is_default_selected: plan.periodMonths === 12,
                      });
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
                    firstPurchaseDiscount={activeFirstPurchase}
                  />
                </button>
              );
            })}
          </div>

          {/* Action Buy Button below cards */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "center", position: "relative" }} className="group min-w-[150px]">
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
                trackEvent("buy_plan_tapped", { source: "home_cta", plan: getPlanType(selectedPlan), price_usd: selectedPlan.usdTotal });
                setLocalSelectedMethod(null);
                setIsPaymentSheetOpen(true);
              }}
              style={{
                height: "40px",
                padding: "13px 17px",
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
                minWidth: "150px",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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

      {/* Key + guide: shown whenever a key exists, even if the plan/trial state
          from the profile is missing (buy-first regression: key must stay visible) */}
      {(hasActivePlan || !!activeKey) && (
        <>
          {/* Server Key section */}
          <div
            id="server-key-section"
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
                padding: "6px 9px",
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
                minWidth: "150px",
                height: "40px",
                padding: "13px 17px",
                borderRadius: "14px",
                background: activeKey ? "#fff" : "rgba(255, 255, 255, 0.05)",
                border: activeKey ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                color: activeKey ? "#000" : "rgba(255, 255, 255, 0.3)",
                fontSize: "14px",
                cursor: activeKey ? "pointer" : "default",
                fontFamily: "var(--font-mono), monospace",
                marginTop: "24px",
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                trackEvent("read_guide_tapped", { screen: "home", source: "home_inline" });
                triggerHaptic("light");
                onTabChange("guide");
              }}
              style={{
                minWidth: "150px",
                height: "40px",
                padding: "13px 17px",
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
                whiteSpace: "nowrap",
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.home.readGuideBtn}
            </button>
          </div>
        </>
      )}

      {/* ─── POP-UP 1: Choose a plan ──────────────────────────────────────────── */}
      <Popup open={isPlanSheetOpen} onClose={() => setIsPlanSheetOpen(false)} contentPadding="0 2px">
        <div style={{ textAlign: "center", alignSelf: "stretch" }}>
          <PopupTitle>{t.home.choosePlan}</PopupTitle>
          <p style={{ fontSize: "13px", color: "#8A94A6", margin: "4px 0 0" }}>{t.home.moneyBack}</p>
        </div>

        {/* Plan cards selector inside the pop-up — GradientBlock Figma Spec */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", width: "100%" }}>
          {plans.map((plan) => {
            const isActive = selectedPlan?.id === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => {
                  triggerHaptic("light");
                  if (selectedPlan?.id !== plan.id) {
                    trackEvent("plan_card_selected", {
                      screen: "home",
                      plan: getPlanType(plan),
                      price_usd: plan.usdTotal,
                      discount_pct: effectivePercent,
                      is_default_selected: plan.periodMonths === 12,
                    });
                  }
                  onSelectPlan(plan);
                }}
                style={{
                  width: "160px",
                  height: "160px",
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
                  firstPurchaseDiscount={activeFirstPurchase}
                />
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }} className="group">
          <PopupButton
            disabled={!selectedPlan}
            onClick={() => {
              triggerHaptic("medium");
              if (selectedPlan) {
                trackEvent("select_and_continue_tapped", { plan: getPlanType(selectedPlan), price_usd: selectedPlan.usdTotal, trigger: hasActivePlan ? "extend" : "buy" });
                setIsPlanSheetOpen(false);
                setLocalSelectedMethod(null);
                setIsPaymentSheetOpen(true);
              }
            }}
            style={{ width: "280px" }}
          >
            {selectedPlan
              ? (() => {
                const p = applyDiscountToPlan(selectedPlan, activeFirstPurchase?.percent ?? 0);
                return t.home.buyFor(
                  `${p.usdTotal % 1 === 0 ? p.usdTotal : p.usdTotal.toFixed(2)}$`,
                  p.starsPrice
                );
              })()
              : t.onboarding.selectAndBuy}
          </PopupButton>
          {!selectedPlan && (
            <div className="absolute bottom-full mb-2 bg-[#1A1A1A] border border-white/10 text-white text-[12px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {language === "ru" ? "Выберите план" : language === "uz" ? "Rejani tanlang" : language === "by" ? "Абярыце тарыф" : "Select a plan"}
            </div>
          )}
        </div>
      </Popup>

      {/* ─── POP-UP 2: Confirm a billing region ───────────────────────────────── */}
      <Popup
        open={isPaymentSheetOpen && !!selectedPlan && !billingRegion}
        onClose={() => setIsPaymentSheetOpen(false)}
      >
        <PopupTitle>{t.payment.confirmBillingFirst}</PopupTitle>

        <PopupOptions>
          {REGION_OPTIONS.map((opt) => (
            <PopupOption
              key={opt.value}
              selected={tempRegion === opt.value}
              onSelect={() => { triggerHaptic("light"); setTempRegion(opt.value); }}
              label={getRegionLabel(opt.value)}
            />
          ))}
        </PopupOptions>

        <PopupButton
          onClick={() => {
            triggerHaptic("medium");
            onBillingRegionChange(tempRegion);
          }}
        >
          {t.payment.confirm}
        </PopupButton>
      </Popup>

      {/* ─── POP-UP 3: Select a payment method ────────────────────────────────── */}
      <Popup
        open={isPaymentSheetOpen && !!selectedPlan && !!billingRegion}
        onClose={() => { if (!isPaying) setIsPaymentSheetOpen(false); }}
        dismissible={!isPaying}
      >
        {selectedPlan && (() => {
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
          const effectivePlan = applyDiscountToPlan(selectedPlan, effectivePercent);

          const getPriceText = (method: { id: string; merchant_method_type: string }) => {
            if (method.id === "stars") return t.payment.starsDesc(effectivePlan.starsPrice);
            if (method.merchant_method_type === "cryptocloud") return `${effectivePlan.usdTotal.toFixed(0)} USDT`;
            if (
              method.merchant_method_type.endsWith("_rub") ||
              method.id === "sberbank" ||
              method.id === "tinkoff_bank" ||
              method.id === "yoo_money"
            ) {
              return effectivePlan.rubTotal ? `${effectivePlan.rubTotal.toFixed(0)} ₽` : `$ ${effectivePlan.usdTotal.toFixed(2)}`;
            }
            return `$ ${effectivePlan.usdTotal.toFixed(2)}`;
          };

          return (
            <>
              <PopupTitle>{t.payment.selectMethod}</PopupTitle>

              {/* Total price for the selected plan */}
              <PriceSummary t={t} language={language} plan={selectedPlan} discountPercent={effectivePercent} />

              {/* Promo code — before choosing a payment method */}
              {onApplyPromo && onClearPromo && (
                <PromoCodeInput
                  t={t}
                  appliedPromo={appliedPromo ?? null}
                  onApply={onApplyPromo}
                  onClear={onClearPromo}
                  triggerHaptic={triggerHaptic}
                />
              )}

              {/* Methods list */}
              <PopupOptions>
                {methodsToRender.map((method) => (
                  <PopupOption
                    key={method.id}
                    selected={localSelectedMethod === method.id}
                    disabled={isPaying}
                    onSelect={() => {
                      triggerHaptic("light");
                      setLocalSelectedMethod(method.id);
                      apiCall("/api/track-event", "POST", { event: "payment_method_selected" }).catch((err) => {
                        console.error("Failed to track payment_method_selected event on backend:", err);
                      });
                    }}
                    label={method.name}
                    trailing={getPriceText(method)}
                  />
                ))}
              </PopupOptions>

              {/* Actions: BACK + SELECT AND PAY */}
              <div style={{ display: "flex", gap: "8px", alignSelf: "stretch", justifyContent: "center" }}>
                <PopupButton
                  variant="secondary"
                  disabled={isPaying}
                  onClick={() => {
                    triggerHaptic("light");
                    setIsPaymentSheetOpen(false);
                    setIsPlanSheetOpen(true);
                  }}
                  style={{ width: "auto", padding: "10px 15px" }}
                >
                  {t.onboarding.back}
                </PopupButton>
                <PopupButton
                  disabled={isPaying || !localSelectedMethod}
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
                  style={{ width: "auto", flex: 1, maxWidth: "246px", gap: "8px" }}
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
                    t.payment.proceedToPayment
                  ) : (
                    t.payment.selectAndPay
                  )}
                </PopupButton>
              </div>
            </>
          );
        })()}
      </Popup>
    </div>
  );
}
