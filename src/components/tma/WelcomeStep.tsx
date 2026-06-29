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
      {/* <div className="grow min-h-[12px]" /> */}

      {welcomeTexts.title && (
        <div className={`${campaign === "gaming" ? "max-w-[320px] mx-auto mb-12" : campaign === "adults" ? "mb-8" : ""} text-center`}>
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
          baseColor="#27071E" // base color to match the SVG fill
          borderRadius="70px"
          height="100%"
          animate={true}
          glowIntensity={4}
          borderGlow={true}
          enableMouseTracking={false}
          enableHoverScale={false}
          solidGradient="#27071E"
          solidBoxShadow="inset 0px 0px 23.9px rgba(230, 252, 255, 0.7), inset 0px 0px 23.9px 22px rgba(230, 252, 255, 0.1), inset 0px 35px 64.8px 1px #CF579F, inset 0px 48px 67px 56px #60246A"
          absoluteChildren={true}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-between p-9 px-12 box-border text-center">
            <h3 className="text-[24px] text-white m-0 mb-2.5 font-sans leading-[1.3]">
              {welcomeTexts.card1Title}
            </h3>
            <p className="text-[16px] text-white/40 m-0 mb-7">
              {welcomeTexts.card1Desc}
            </p>
            <button
              onClick={() => {
                triggerHaptic("medium");
                trackEvent("onboarding_welcome_cta_clicked", { campaign });
                setDirection("next");
                setCurrentStep(1);
              }}
              className="bg-white text-black border-none rounded-xl px-3 py-2.5 text-[14px] cursor-pointer font-mono uppercase"
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
      primaryColor={"#cfdfe5"}
                        secondaryColor={"#686F70"}
          baseColor="#1C1B1A" // obsidian base color
          borderRadius="70px"
          height="100%"
          animate={false}
          glowIntensity={.4}
          borderGlow={true}
          enableMouseTracking={false}
          enableHoverScale={false}
          absoluteChildren={true}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-between p-9 px-12 box-border text-center">
            <h3 className="text-[24px] text-white m-0 mb-2.5 font-sans leading-[1.3] max-w-[185px]">
              {welcomeTexts.card2Title}
            </h3>
            <p className="text-[16px] text-white/40 m-0 mb-7">
              {welcomeTexts.card2Desc}
            </p>
            <button
              onClick={handleSkip}
              className="bg-[#494948] text-white border-none rounded-xl px-3 py-2.5 text-[14px] cursor-pointer font-mono"
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
