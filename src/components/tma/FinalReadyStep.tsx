"use client";

import React from "react";
import SwipeSlider from "./SwipeSlider";

import type { HapticType } from "./types";

interface FinalReadyStepProps {
  t: any;
  onComplete: () => void;
  onPrev: () => void;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
}

export default function FinalReadyStep({
  t,
  onComplete,
  onPrev,
  triggerHaptic,
  trackEvent,
}: FinalReadyStepProps) {
  return (
    <div className="w-full flex flex-col items-center justify-between flex-1 py-5 px-0 pb-2.5 box-border h-full">
      {/* Vertical dotted line separator above title */}
      <div
        className="w-px flex-[1.2] bg-[repeating-linear-gradient(to_bottom,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-6 mx-auto"
        style={{
          opacity: 0.35,
          maskImage: "linear-gradient(to bottom, transparent, white 25%, white 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, white 25%, white 75%, transparent)",
        }}
      />

      <div className="text-center flex flex-col gap-3 w-full">
        <h2 className="text-[30px] text-white m-0 leading-tight font-sans">
          {t.onboarding.everythingInOnePlace}
        </h2>

        <p className="text-[16px] text-white/40 m-0 leading-relaxed font-sans">
          {t.onboarding.quickReference}
        </p>
      </div>

      {/* Vertical dotted line separator */}
      <div
        className="w-px flex-1 bg-[repeating-linear-gradient(to_bottom,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-6 mx-auto"
        style={{
          opacity: 0.35,
          maskImage: "linear-gradient(to bottom, transparent, white 25%, white 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, white 25%, white 75%, transparent)",
        }}
      />

      {/* BACK and START NOW Buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => {
            triggerHaptic("light");
            onPrev();
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 15px",
            gap: "5px",
            width: "62px",
            height: "40px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            cursor: "pointer",
          }}
          className="active:scale-[0.97] transition-transform duration-100 ease"
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "100%",
              textAlign: "center",
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: "#FFFFFF",
            }}
          >
            BACK
          </span>
        </button>

        <button
          onClick={() => {
            triggerHaptic("success");
            trackEvent("onboarding_completed_cta_clicked", {});
            trackEvent("onboarding_completed", {});
            onComplete();
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 15px",
            gap: "5px",
            width: "150px",
            height: "52px",
            background: "#FFFFFF",
            borderRadius: "12px",
            border: "none",
            outline: "none",
            cursor: "pointer",
          }}
          className="active:scale-[0.97] transition-transform duration-100 ease"
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "100%",
              textAlign: "center",
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: "#000000",
            }}
          >
            START NOW
          </span>
        </button>
      </div>
    </div>
  );
}
