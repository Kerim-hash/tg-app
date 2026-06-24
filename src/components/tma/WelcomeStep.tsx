"use client";

import React from "react";
import GradientBlock from "../GradientBlock";
import type { HapticType } from "./types";

interface WelcomeStepProps {
  campaign: string;
  welcomeTexts: {
    title: string;
    subtitle: string;
    card1Title: string;
    card1Desc: string;
    card1Btn: string;
    card2Title: string;
    card2Desc: string;
    card2Btn: string;
  };
  triggerHaptic: (type: HapticType) => void;
  trackEvent: (eventName: string, params?: any) => void;
  setDirection: (dir: "next" | "prev") => void;
  setCurrentStep: (step: number) => void;
  handleSkip: () => void;
}

export default function WelcomeStep({
  campaign,
  welcomeTexts,
  triggerHaptic,
  trackEvent,
  setDirection,
  setCurrentStep,
  handleSkip,
}: WelcomeStepProps) {
  return (
    <div className="w-full flex flex-col gap-2.5 min-h-full pb-0 box-border">
      {/* Top spacer for vertical centering */}
      <div className="grow min-h-[12px]" />

      {welcomeTexts.title && (
        <div className={`${campaign === "gaming" ? "max-w-[320px] mx-auto mb-10" : campaign === "adults" ? "mb-8" : ""} text-center`}>
          <h2 className="text-[24px] text-white m-0 mb-2.5 leading-tight font-sans">
            {welcomeTexts.title}
          </h2>
          <p className={`text-[16px] ${campaign === "adults" ? "max-w-[320px] mx-auto" : ""}  text-[#666666] m-0 leading-relaxed font-sans`}>
            {welcomeTexts.subtitle}
          </p>
        </div>
      )}

      {/* Card 1: Start Walkthrough */}
      <div className="shrink-0 w-full h-[240px]">
        <GradientBlock
          label=""
          primaryColor="#D197C3" // violet/purple glow
          secondaryColor="#8F3B81" // fuschia/violet
          baseColor="#471849" // deep plum base color
          borderRadius="70px"
          height="100%"
          animate={true}
          glowIntensity={4}
          borderGlow={true}
          enableMouseTracking={false}
          enableHoverScale={false}
          absoluteChildren={true}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 px-5 box-border text-center">
            <h3 className="text-[24px] text-white m-0 mb-2.5 font-sans">
              {welcomeTexts.card1Title}
            </h3>
            <p className="text-[16px] text-white/40 m-0 mb-8">
              {welcomeTexts.card1Desc}
            </p>
            <button
              onClick={() => {
                triggerHaptic("medium");
                trackEvent("onboarding_welcome_cta_clicked", { campaign });
                setDirection("next");
                setCurrentStep(1);
              }}
              className="bg-white text-black border-none rounded-xl px-5 py-2.5 text-[14px] cursor-pointer font-mono"
            >
              {welcomeTexts.card1Btn}
            </button>
          </div>
        </GradientBlock>
      </div>

      {/* Card 2: Skip Tour */}
      <div className="shrink-0 w-full h-[240px]">
        <GradientBlock
          label=""
          primaryColor="#606767" // grey glow
          secondaryColor="#2D2E2D" // dark grey
          baseColor="#1C1B1A" // obsidian base color
          borderRadius="70px"
          height="100%"
          animate={false}
          glowIntensity={0.6}
          borderGlow={true}
          enableMouseTracking={false}
          enableHoverScale={false}
          absoluteChildren={true}
        >
          <div className="absolute  inset-0 flex flex-col items-center justify-center p-4 px-5 box-border text-center">
            <h3 className="text-[24px] text-white m-0 mb-2.5 font-sans max-w-[185px]">
              {welcomeTexts.card2Title}
            </h3>
            <p className="text-[16px] text-white/40 m-0 mb-8">
              {welcomeTexts.card2Desc}
            </p>
            <button
              onClick={handleSkip}
              className="bg-[#494948] text-white border-none rounded-xl px-5 py-2.5 text-[14px] cursor-pointer font-mono"
            >
              {welcomeTexts.card2Btn}
            </button>
          </div>
        </GradientBlock>
      </div>

      {/* Bottom spacer for vertical centering */}
      <div className="grow min-h-[4px]" />
    </div>
  );
}
