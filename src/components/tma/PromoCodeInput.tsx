"use client";

import { useState } from "react";
import type { Translations, HapticType } from "./types";
import type { AppliedPromo, PromoFailReason } from "./discount";

export interface PromoApplyResult {
  ok: boolean;
  reason?: PromoFailReason;
}

interface PromoCodeInputProps {
  t: Translations;
  appliedPromo: AppliedPromo | null;
  onApply: (code: string) => Promise<PromoApplyResult>;
  onClear: () => void;
  triggerHaptic: (type: HapticType) => void;
}

export default function PromoCodeInput({
  t,
  appliedPromo,
  onApply,
  onClear,
  triggerHaptic,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonToMessage = (reason?: PromoFailReason): string => {
    if (reason === "used") return t.promo.used;
    if (reason === "expired") return t.promo.expired;
    if (reason === "network") return t.promo.networkError;
    return t.promo.invalid;
  };

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed || isChecking) return;
    triggerHaptic("light");
    setIsChecking(true);
    setError(null);
    const result = await onApply(trimmed);
    setIsChecking(false);
    if (result.ok) {
      triggerHaptic("success");
      setCode("");
    } else {
      triggerHaptic("warning");
      setError(reasonToMessage(result.reason));
    }
  };

  if (appliedPromo) {
    return (
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "12px 18px",
          borderRadius: "16px",
          background: "rgba(64, 209, 253, 0.08)",
          border: "1px solid rgba(64, 209, 253, 0.35)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", minWidth: 0 }}>
          <span style={{ fontSize: "11px", color: "#40D1FD", fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            {t.promo.applied}
          </span>
          <span style={{ fontSize: "14px", color: "#fff", fontFamily: "var(--font-onest), sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {appliedPromo.code.toUpperCase()} · −{appliedPromo.percent}%
          </span>
        </div>
        <button
          onClick={() => {
            triggerHaptic("light");
            onClear();
          }}
          style={{
            flexShrink: 0,
            background: "transparent",
            border: "none",
            color: "#8A94A6",
            fontSize: "12px",
            cursor: "pointer",
            padding: "6px 0",
            fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          {t.promo.remove}
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 6px 6px 18px",
          borderRadius: "16px",
          background: "#12141A",
          border: error ? "1px solid rgba(255, 77, 79, 0.6)" : "1px solid rgba(255, 255, 255, 0.1)",
          transition: "border-color 0.2s ease",
        }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleApply();
          }}
          placeholder={t.promo.placeholder}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          disabled={isChecking}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "var(--font-onest), sans-serif",
            textTransform: "uppercase",
          }}
        />
        <button
          onClick={handleApply}
          disabled={!code.trim() || isChecking}
          style={{
            flexShrink: 0,
            padding: "10px 16px",
            borderRadius: "12px",
            background: code.trim() && !isChecking ? "#FFFFFF" : "rgba(255,255,255,0.06)",
            border: "none",
            color: code.trim() && !isChecking ? "#000" : "#8A94A6",
            fontSize: "12px",
            cursor: code.trim() && !isChecking ? "pointer" : "default",
            fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isChecking && (
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid rgba(255,255,255,0.15)",
                borderTop: "2px solid #8A94A6",
                borderRadius: "50%",
                animation: "tma-spin 0.7s linear infinite",
              }}
            />
          )}
          {t.promo.apply}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: "12px", color: "#FF4D4F", fontFamily: "var(--font-onest), sans-serif", padding: "0 4px", textAlign: "left" }}>
          {error}
        </span>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes tma-spin { to { transform: rotate(360deg); } }` }} />
    </div>
  );
}
