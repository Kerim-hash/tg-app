"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import WebApp from "@twa-dev/sdk";
import type { Plan, PaymentMethod, Translations, HapticType, Tab } from "./types";
import GradientBlock from "../GradientBlock";

const SERVERS_ROW1 = [
  { name: "Germany", flag: "🇩🇪" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Germany", flag: "🇩🇪" },
];

const SERVERS_ROW2 = [
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
  { name: "Georgia", flag: "🇬🇪" },
  { name: "Cheh Republic", flag: "🇨🇿" },
];

const SERVERS_ROW3 = [
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Armenia", flag: "🇦🇲" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Germany", flag: "🇩🇪" },
];

interface GuideScreenProps {
  t: Translations;
  personalKey?: string;
  onTabChange: (tab: Tab) => void;
  triggerHaptic: (type: HapticType) => void;
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan | null) => void;
  onProceedPayment: (method: PaymentMethod) => Promise<void>;
  isPaying: boolean;
}

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.98543 17.9453C5.43867 17.9306 3.33203 12.7318 3.33203 10.0842C3.33203 5.75929 6.57644 4.81245 7.82681 4.81245C8.3903 4.81245 8.99199 5.03374 9.5227 5.22956C9.89381 5.36615 10.2776 5.50716 10.4911 5.50716C10.6189 5.50716 10.92 5.38721 11.1858 5.28196C11.7527 5.05627 12.4582 4.77576 13.2797 4.77576C13.2812 4.77576 13.2831 4.77576 13.2846 4.77576C13.898 4.77576 15.7579 4.91038 16.8761 6.58962L17.138 6.98323L16.7611 7.26768C16.2225 7.67402 15.2399 8.41524 15.2399 9.88349C15.2399 11.6225 16.3527 12.2912 16.8874 12.6129C17.1234 12.7548 17.3676 12.9012 17.3676 13.2214C17.3676 13.4305 15.6992 17.9194 13.2762 17.9194C12.6834 17.9194 12.2643 17.7412 11.8947 17.584C11.5206 17.4249 11.198 17.2878 10.6648 17.2878C10.3946 17.2878 10.0529 17.4156 9.69107 17.5512C9.19667 17.7357 8.63705 17.9453 8.00208 17.9453H7.98543Z" fill="black" />
    <path d="M13.539 0.833374C13.6021 3.10859 11.975 4.68703 10.3497 4.58803C10.0819 2.77233 11.9748 0.833374 13.539 0.833374Z" fill="black" />
  </svg>

);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px dashed rgba(255, 255, 255, 0.1)" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
  triggerHaptic,
  plans,
  selectedPlan,
  onSelectPlan,
  onProceedPayment,
  isPaying,
}: GuideScreenProps) {
  const [copied, setCopied] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [localSelectedMethod, setLocalSelectedMethod] = useState<PaymentMethod | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const activeKey = personalKey || "https://fglove.online/x/dFcGjeCq4zwjYfLL";

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

  return (
    <div
      style={{
        padding: "16px 16px 40px",
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
              {t.guide.step1Title}
            </span>
          </div>

          <button
            className="hover-scale-btn"
            onClick={() => handleOpenLink("https://apps.apple.com/app/iguard-vpn")}
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "13px 15px",
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
            <AppleIcon />
            {t.guide.visitAppStore}
          </button>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 8px)",
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

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "4px" }}>
            {/* Interactive plan selection */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", width: "100%", flexWrap: "wrap" }}>
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
                      width: "170px",
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
                    />

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
                        {plan.label}
                      </span>
                      <div>
                        <span style={{ display: "block", fontSize: "24px", color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                          $ {plan.usdPerMonth.toFixed(2)}
                        </span>
                        <span style={{ display: "block", fontSize: "14px", color: isYearly ? "rgba(255,255,255,0.85)" : "#fff", marginTop: "2px" }}>
                          {t.home.perMonth}
                        </span>
                      </div>
                      <span style={{ display: "block", fontSize: "14px", color: isYearly ? "#8EBCDC" : "#797978" }}>
                        {isYearly ? t.home.billedYearly : t.home.billedMonthly}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              className="hover-scale-btn"
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
                width: "280px",
                padding: "14px 16px",
                borderRadius: "14px",
                background: selectedPlan ? "#FFFFFF" : "transparent",
                border: selectedPlan ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                color: selectedPlan ? "#000000" : "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.05em",
                alignSelf: "center",
                cursor: "pointer",
                outline: "none",
                fontFamily: "var(--font-mono), monospace",
                transition: "all 0.25s ease",
              }}
            >
              {selectedPlan
                ? `BUY FOR ${Math.round(selectedPlan.usdTotal)}$ OR ${selectedPlan.starsPrice} STARS`
                : "SELECT AND BUY"}
            </button>
          </div>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 8px)",
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
            {/* Access Key visualizer — Figma Glass Input Spec */}
            <GradientBlock
              label=""
              primaryColor={"#cfdfe5"}
              secondaryColor={"#686F70"}
              baseColor="#1D1C1B"
              borderRadius="30px"
              height="100%"
              animate={false}
              glowIntensity={0.5}
              borderGlow={true}
              enableMouseTracking={false}
              contentAlign={"start"}
            >
              <span style={{ fontSize: "10px", color: "#8A94A6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t.guide.personalKeyLabel}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#fff",
                  fontFamily: "var(--font-mono), monospace",
                  wordBreak: "break-all",
                  lineHeight: 1.4,
                }}
              >
                {activeKey}
              </span>
            </GradientBlock>

            <button
              className="hover-scale-btn"
              onClick={handleCopy}
              style={{
                padding: "13px 15px",
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
          </div>
        </div>

        {/* Separator dots */}
        <div
          className="animate-fade-in-up"
          style={{
            height: "1px",
            backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 8px)",
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
              {[...SERVERS_ROW1, ...SERVERS_ROW1].map((srv, idx) => (
                <span
                  key={`r1-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
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
              {[...SERVERS_ROW2, ...SERVERS_ROW2].map((srv, idx) => (
                <span
                  key={`r2-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
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
              {[...SERVERS_ROW3, ...SERVERS_ROW3].map((srv, idx) => (
                <span
                  key={`r3-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
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
          onClick={() => handleOpenLink("https://fastguard.io/ru/support")}
          style={{
            padding: "13px 15px",
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.1836 2.9538C13.9088 2.64842 14.6864 3.2617 14.5583 4.03816L13.0457 13.2093C12.8998 14.0936 11.9286 14.601 11.1174 14.1603C10.4385 13.7916 9.4313 13.224 8.52356 12.6309C8.07029 12.3347 6.68236 11.385 6.85296 10.7089C6.99883 10.1308 9.33209 7.9589 10.6654 6.66724C11.1892 6.15986 10.9506 5.86674 10.3321 6.3339C8.7977 7.49277 6.33424 9.2547 5.5196 9.75057C4.80085 10.188 4.42557 10.2627 3.97794 10.188C3.16052 10.0518 2.40267 9.8409 1.78395 9.58444C0.947702 9.23777 0.988435 8.08857 1.78338 7.7539L13.1836 2.9538Z" fill="black" />
          </svg>

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
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0, textAlign: "left" }}>
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
                      fontWeight: 600,
                      color: localSelectedMethod === "card" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Credit or debit card
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#8A94A6",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    $ {selectedPlan.usdTotal.toFixed(2)}
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
                      fontWeight: 600,
                      color: localSelectedMethod === "crypto" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Crypto
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
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
                      fontWeight: 600,
                      color: localSelectedMethod === "stars" ? "#00D1FF" : "#FFFFFF",
                      fontFamily: "var(--font-onest), sans-serif",
                    }}
                  >
                    Telegram Stars
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
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
                fontWeight: 800,
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
