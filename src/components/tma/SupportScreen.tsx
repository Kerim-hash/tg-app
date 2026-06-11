"use client";

import { useState, useEffect, useRef } from "react";
import type { Translations, HapticType, Language } from "./types";
import { trackEvent } from "../../lib/mixpanel";

interface SupportScreenProps {
  t: Translations;
  triggerHaptic: (type: HapticType) => void;
  language: Language;
  onOpenSupportForm?: () => void;
}

const FAQItem = ({ question, answer, section = "support" }: { question: string; answer: string; section?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px dashed rgba(255, 255, 255, 0.1)" }}>
      <button
        onClick={() => {
          if (!isOpen) {
            trackEvent("faq_item_expanded", { section, question_id: question });
          } else {
            trackEvent("faq_item_collapsed", { question_id: question });
          }
          setIsOpen(!isOpen);
        }}
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
          fontWeight: 600,
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

export default function SupportScreen({ t, triggerHaptic, onOpenSupportForm }: SupportScreenProps) {
  const policyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("screen_support_viewed", { referrer: "tab" });

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target === policyRef.current) {
            trackEvent("refund_policy_viewed", { section: "subscription" });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (policyRef.current) observer.observe(policyRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        padding: "50px 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      {/* Nav title */}
      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          fontFamily: "JetBrains Mono",
          color: "#40D1FD",
          margin: 0,
        }}
      >
        {t.support.title}
      </p>

      {/* Header heading */}
      <h1
        style={{
          fontSize: "24px",
          textAlign: "center",
          color: "#fff",
          lineHeight: 1.2,
          marginBottom: "32px",
        }}
      >
        {t.support.subtitle}
      </h1>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>

        {/* Category 1: Subscription */}
        <div>
          <h2 style={{ fontSize: "24px", color: "#fff", margin: "0 0 30px", textAlign: "center" }}>
            {t.support.subscription}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem section="subscription" question={t.support.subQ1} answer={t.support.subA1} />
            <FAQItem section="subscription" question={t.support.subQ2} answer={t.support.subA2} />
            <FAQItem section="subscription" question={t.support.subQ3} answer={t.support.subA3} />
          </div>
        </div>

        {/* Category 2: Policy */}
        <div ref={policyRef}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.policy}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem section="policy" question={t.support.polQ1} answer={t.support.polA1} />
            <FAQItem section="policy" question={t.support.polQ2} answer={t.support.polA2} />
            <FAQItem section="policy" question={t.support.polQ3} answer={t.support.polA3} />
          </div>
        </div>

        {/* Category 3: Troubleshooting */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.troubleshooting}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem section="troubleshooting" question={t.support.trQ1} answer={t.support.trA1} />
            <FAQItem section="troubleshooting" question={t.support.trQ2} answer={t.support.trA2} />
            <FAQItem section="troubleshooting" question={t.support.trQ3} answer={t.support.trA3} />
          </div>
        </div>

      </div>

      {/* Bottom support box */}
      <div
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "24px", color: "#fff" }}>
          {t.guide.needHelp}
        </span>
        <button
          onClick={() => {
            trackEvent("contact_support_tapped", { source: "support_footer" });
            triggerHaptic("light");
            onOpenSupportForm?.();
          }}
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
          {t.guide.contactSupport}
        </button>
      </div>
    </div>
  );
}
