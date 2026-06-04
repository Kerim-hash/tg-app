"use client";

import { useState } from "react";
import WebApp from "@twa-dev/sdk";
import type { Translations, HapticType } from "./types";

interface SupportScreenProps {
  t: Translations;
  triggerHaptic: (type: HapticType) => void;
}

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

export default function SupportScreen({ t, triggerHaptic }: SupportScreenProps) {
  const handleOpenLink = (url: string) => {
    triggerHaptic("medium");
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
            <FAQItem question={t.support.subQ1} answer={t.support.subA1} />
            <FAQItem question={t.support.subQ2} answer={t.support.subA2} />
            <FAQItem question={t.support.subQ3} answer={t.support.subA3} />
          </div>
        </div>

        {/* Category 2: Policy */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.policy}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem question={t.support.polQ1} answer={t.support.polA1} />
            <FAQItem question={t.support.polQ2} answer={t.support.polA2} />
            <FAQItem question={t.support.polQ3} answer={t.support.polA3} />
          </div>
        </div>

        {/* Category 3: Troubleshooting */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
            {t.support.troubleshooting}
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FAQItem question={t.support.trQ1} answer={t.support.trA1} />
            <FAQItem question={t.support.trQ2} answer={t.support.trA2} />
            <FAQItem question={t.support.trQ3} answer={t.support.trA3} />
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
    </div>
  );
}
