"use client";

import { useEffect } from "react";
import type { Plan, Translations, PaymentMethod, HapticType, Language } from "./types";
import { trackEvent } from "../../lib/mixpanel";
import GradientBlock from "../GradientBlock";

interface PaymentScreenProps {
  t: Translations;
  language: Language;
  plan: Plan;
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  onProceed: () => void;
  onBack: () => void;
  isPaying: boolean;
  triggerHaptic: (type: HapticType) => void;
}

const METHOD_CONFIG: { id: PaymentMethod; icon: string }[] = [
  { id: "card",   icon: "💳" },
  { id: "crypto", icon: "₿"  },
  { id: "stars",  icon: "⭐" },
];

export default function PaymentScreen({
  t,
  language,
  plan,
  selectedMethod,
  onSelectMethod,
  onProceed,
  onBack,
  isPaying,
  triggerHaptic,
}: PaymentScreenProps) {
  const getLabel = (m: PaymentMethod) => {
    if (m === "card")   return t.payment.card;
    if (m === "crypto") return t.payment.crypto;
    return t.payment.stars;
  };

  const getPrice = (m: PaymentMethod) => {
    if (m === "card") return t.payment.cardDesc(`$${plan.usdTotal.toFixed(2)}`);
    if (m === "crypto") return t.payment.cryptoDesc(plan.usdTotal.toFixed(0));
    return t.payment.starsDesc(plan.starsPrice);
  };

  const canProceed = !!selectedMethod && !isPaying;

  useEffect(() => {
    trackEvent("screen_payment_viewed", { plan: plan.periodMonths === 1 ? "30_days" : "1_year", price: plan.starsPrice || plan.usdTotal });
    trackEvent("payment_methods_viewed", { plan: plan.periodMonths === 1 ? "30_days" : "1_year", available_methods: METHOD_CONFIG.map(m => m.id) });
  }, [plan]);

  return (
    <div
      style={{
        height: "100%",
        background: "#090B0E",
        display: "flex",
        flexDirection: "column",
        padding: "20px 16px 40px",
        maxWidth: "480px",
        margin: "0 auto",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      {/* Back */}
      <button
        onClick={() => { triggerHaptic("light"); onBack(); }}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "#8A94A6",
          fontSize: "14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "8px 0",
          marginBottom: "4px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Nav title */}
      <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#00D1FF", marginBottom: "28px" }}>
        {t.nav.home}
      </p>

      {/* Title */}
      <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "32px", margin: "0 0 32px" }}>
        {t.payment.selectMethod}
      </h2>

      {/* Method list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {METHOD_CONFIG.map(({ id }) => {
          const isSelected = selectedMethod === id;
          return (
            <button
              key={id}
              onClick={() => { 
                triggerHaptic("light"); 
                trackEvent("payment_method_selected", { method: id, amount: plan.usdTotal, currency: "USD" });
                onSelectMethod(id); 
              }}
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "30px",
                position: "relative",
                cursor: "pointer",
                border: "none",
                outline: "none",
                overflow: "hidden",
                background: "transparent",
                padding: 0,
                transition: "all 0.2s ease",
                marginBottom: "2px",
              }}
            >
              <GradientBlock
                label=""
                primaryColor={isSelected ? "#511A78" : "#FFFFFF"}
                secondaryColor={isSelected ? "#4DA8D5" : "#9A9790"}
                baseColor="#12141A"
                borderRadius="30px"
                height={80}
                animate={isSelected}
                glowIntensity={isSelected ? 1.2 : 0.6}
                borderGlow={true}
                enableMouseTracking={false}
                solidGradient={isSelected ? "radial-gradient(circle at 50% 0%, rgb(196 112 255) 0%, rgb(131 21 209) 45%, rgb(120 143 202) 75%, rgb(77, 168, 213) 100%)" : undefined}
                enableHoverScale={false}
                absoluteChildren={true}
              >
                {isSelected && (
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
                      color: "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    {getLabel(id)}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: isSelected ? "rgba(255,255,255,0.85)" : "#8A94A6",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    {getPrice(id)}
                  </span>
                </div>
              </GradientBlock>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Proceed button */}
      <button
        disabled={!canProceed}
        onClick={() => { 
          triggerHaptic("medium"); 
          trackEvent("proceed_to_payment_tapped", { method: selectedMethod, amount: plan.usdTotal, plan: plan.periodMonths === 1 ? "30_days" : "1_year" });
          onProceed(); 
        }}
        style={{
          marginTop: "32px",
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          background: canProceed ? "#00D1FF" : "rgba(255,255,255,0.06)",
          border: "none",
          color: canProceed ? "#000" : "#8A94A6",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          cursor: canProceed ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {isPaying ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid rgba(0,0,0,0.2)",
                borderTop: "2px solid #000",
                borderRadius: "50%",
                animation: "tma-spin 0.7s linear infinite",
              }}
            />
            Processing...
          </>
        ) : (
          t.payment.proceedToPayment
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes tma-spin { to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
