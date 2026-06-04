"use client";

import { useState } from "react";
import type { Translations, HapticType } from "./types";

interface SuccessScreenProps {
  t: Translations;
  personalKey: string;
  onClose: () => void;
  triggerHaptic: (type: HapticType) => void;
}

export default function SuccessScreen({ t, personalKey, onClose, triggerHaptic }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!personalKey) return;
    triggerHaptic("light");
    navigator.clipboard.writeText(personalKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090B0E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        maxWidth: "480px",
        margin: "0 auto",
        gap: "24px",
        textAlign: "center",
      }}
    >
      {/* Success icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(0,209,255,0.08)",
          border: "1.5px solid rgba(0,209,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "#00D1FF",
          animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        ✓
      </div>

      <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", margin: 0 }}>
        {t.success.title}
      </h2>

      {/* Personal key section */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        <p style={{ fontSize: "14px", color: "#8A94A6", margin: 0 }}>
          {t.success.useCode}
        </p>

        {personalKey ? (
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#8A94A6",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                textAlign: "left",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              {personalKey}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "#8A94A6", margin: 0, maxWidth: "260px" }}>
            {t.success.noKey}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ width: "100%", display: "flex", gap: "10px" }}>
        <button
          onClick={() => { triggerHaptic("light"); onClose(); }}
          style={{
            flex: 1,
            padding: "14px 8px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {t.success.readGuide}
        </button>
        <button
          onClick={handleCopy}
          disabled={!personalKey}
          style={{
            flex: 1,
            padding: "14px 8px",
            borderRadius: "14px",
            background: !personalKey
              ? "rgba(255,255,255,0.06)"
              : copied
              ? "rgba(0,184,148,0.85)"
              : "#00D1FF",
            border: "none",
            color: !personalKey ? "#8A94A6" : "#000",
            fontSize: "13px",
            fontWeight: 700,
            cursor: personalKey ? "pointer" : "not-allowed",
            transition: "all 0.25s ease",
          }}
        >
          {copied ? t.success.copied : t.success.copyAndClose}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes pop { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }` }} />
    </div>
  );
}
