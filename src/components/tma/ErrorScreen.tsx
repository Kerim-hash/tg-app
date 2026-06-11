"use client";

import type { Translations } from "./types";
import { trackEvent } from "../../lib/mixpanel";

interface ErrorScreenProps {
  t: Translations;
  onRetry: () => void;
  desc?: string;
}

export default function ErrorScreen({ t, onRetry, desc }: ErrorScreenProps) {
  return (
    <div
      style={{
        height: "100%",
        background: "#090B0E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        maxWidth: "480px",
        margin: "0 auto",
        gap: "20px",
        textAlign: "center",
      }}
    >
      {/* Error icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(239,68,68,0.08)",
          border: "1.5px solid rgba(239,68,68,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          color: "rgba(239,68,68,0.8)",
        }}
      >
        ✕
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
          }}
        >
          {t.error.title}
        </h2>
        <p style={{ fontSize: "13px", color: "#8A94A6", margin: 0, maxWidth: "240px" }}>
          {desc || t.error.desc}
        </p>
      </div>

      <button
        onClick={() => {
          trackEvent("try_again_tapped", { attempt_number: 1 });
          onRetry();
        }}
        style={{
          marginTop: "8px",
          padding: "14px 44px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "all 0.2s ease",
        }}
      >
        {t.error.tryAgain}
      </button>
    </div>
  );
}
