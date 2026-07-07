"use client";

import React from "react";
import SwipeSlider from "./SwipeSlider";

import type { HapticType } from "./types";

interface FinalReadyStepProps {
  t: any;
  onComplete: () => void;
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
}

export default function FinalReadyStep({
  t,
  onComplete,
  triggerHaptic,
  trackEvent,
}: FinalReadyStepProps) {
  return (
    <div className="w-full flex flex-col items-center justify-between flex-1 py-5 px-0 pb-2.5 box-border h-full">
      {/* Vertical dotted line separator above title */}
      <div className="w-px flex-[1.2] bg-[repeating-linear-gradient(to_bottom,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-6 mx-auto" />

      <div className="text-center flex flex-col gap-3 w-full">
        <h2 className="text-[30px] text-white m-0 leading-tight font-sans">
          {t.onboarding.everythingInOnePlace}
        </h2>

        <p className="text-[16px] text-white/40 m-0 leading-relaxed font-sans">
          {t.onboarding.quickReference}
        </p>
      </div>

      {/* Vertical dotted line separator */}
      <div className="w-px flex-1 bg-[repeating-linear-gradient(to_bottom,#999999_0px,#999999_2px,transparent_2px,transparent_8px)] my-6 mx-auto" />

      {/* Draggable Swipe Slider */}
      <div className="w-full px-2.5 box-border">
        <SwipeSlider
          onComplete={() => {
            triggerHaptic("success");
            trackEvent("onboarding_completed_cta_clicked", {});
            trackEvent("onboarding_completed", {});
            onComplete();
          }}
          text={t.onboarding.startBtn.toUpperCase()}
          triggerHaptic={triggerHaptic}
        />
      </div>
    </div>
  );
}
