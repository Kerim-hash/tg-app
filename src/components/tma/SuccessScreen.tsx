"use client";

import { useState } from "react";
import type { Translations, HapticType } from "./types";
import { trackEvent } from "../../lib/mixpanel";
import Popup, { PopupButton, PopupTitle } from "./Popup";

interface SuccessScreenProps {
  t: Translations;
  personalKey: string;
  /** "Copy key and close" and the X button */
  onClose: () => void;
  /** "Read guide"; falls back to onClose */
  onReadGuide?: () => void;
  triggerHaptic: (type: HapticType) => void;
}

// Figma "Succes!" pop-up: title, personal key field, READ GUIDE + COPY KEY AND CLOSE
export default function SuccessScreen({ t, personalKey, onClose, onReadGuide, triggerHaptic }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleReadGuide = () => {
    triggerHaptic("light");
    trackEvent("read_guide_tapped", { screen: "payment", source: "payment_success" });
    (onReadGuide ?? onClose)();
  };

  const handleCopyAndClose = () => {
    if (!personalKey) return;
    triggerHaptic("light");
    navigator.clipboard.writeText(personalKey).catch(() => { });
    trackEvent("access_key_copied", { screen: "payment", source: "payment_success" });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 600);
  };

  return (
    <Popup open onClose={onClose}>
      <PopupTitle>{t.success.title}</PopupTitle>

      {/* Personal key */}
      {personalKey ? (
        <div
          style={{
            alignSelf: "stretch",
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "12px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: "12px", color: "#8A94A6", fontFamily: "var(--font-onest), sans-serif" }}>
            {t.guide.personalKeyLabel}
          </span>
          <span
            style={{
              fontSize: "15px",
              color: "#FFFFFF",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-onest), sans-serif",
            }}
          >
            {personalKey}
          </span>
        </div>
      ) : (
        <p style={{ fontSize: "14px", lineHeight: "20px", color: "#8A94A6", margin: 0, textAlign: "center" }}>
          {t.success.noKey}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <PopupButton variant={personalKey ? "secondary" : "primary"} onClick={handleReadGuide}>
          {t.success.readGuide}
        </PopupButton>
        {personalKey && (
          <PopupButton onClick={handleCopyAndClose}>
            {copied ? t.success.copied : t.success.copyAndClose}
          </PopupButton>
        )}
      </div>
    </Popup>
  );
}
