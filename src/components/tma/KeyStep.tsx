"use client";

import React from "react";
import type { Translations } from "./types";
import {
  ONB_ACCENT,
  ONB_FONT_MONO,
  ONB_FONT_SANS,
  PrimaryButton,
  ProgressDots,
  SecondaryButton,
} from "./OnboardingUi";

interface KeyStepProps {
  t: Translations;
  trialEndText: string;
  trialActive: boolean;
  activeKey: string;
  copied: boolean;
  onCopy: () => void;
  onOpenGuide: () => void;
  onNext: () => void;
}

const CheckIcon = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.2L6.5 11.2L12.5 5.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="#FFFFFF" strokeWidth="1.3" />
    <path d="M9.5 4.5V3A1.5 1.5 0 0 0 8 1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h1.5" stroke="#FFFFFF" strokeWidth="1.3" />
  </svg>
);

// Three stacked "done" cards; the front one is the current state
// Pending steps get a hollow grey circle instead of a check
const PendingIcon = ({ size }: { size: number }) => (
  <span
    className="shrink-0"
    style={{ width: size, height: size, borderRadius: size / 2, border: "1.5px solid #8A8D93", boxSizing: "border-box" }}
  />
);

function StatusStack({
  t,
  trialEndText,
  trialActive,
  keyReady,
}: {
  t: Translations;
  trialEndText: string;
  trialActive: boolean;
  keyReady: boolean;
}) {
  return (
    <div className="relative w-full" style={{ height: 150 }}>
      <div
        className="absolute flex items-center"
        style={{
          left: 20, right: 20, top: 13, height: 46, padding: "0 14px", gap: 10,
          background: "#1C1C1F", opacity: 0.5, borderRadius: 16,
        }}
      >
        <CheckIcon color="#8A8D93" size={16} />
        <span style={{ fontFamily: ONB_FONT_SANS, fontSize: 12.8, lineHeight: "17px", color: "#FFFFFF" }}>
          {t.onboarding.stackAccount}
        </span>
      </div>
      <div
        className="absolute flex items-center"
        style={{
          left: 10, right: 10, top: 38, height: 49, padding: "0 15px", gap: 11,
          background: "#1C1C1F", opacity: 0.75, borderRadius: 16,
        }}
      >
        {trialActive ? <CheckIcon color="#8A8D93" size={17} /> : <PendingIcon size={14} />}
        <span style={{ fontFamily: ONB_FONT_SANS, fontSize: 13.6, lineHeight: "19px", color: "#FFFFFF" }}>
          {t.onboarding.stackTrial(trialEndText)}
        </span>
      </div>
      <div
        className="absolute flex items-center justify-between"
        style={{
          left: 0, right: 0, top: 66, height: 52, padding: "0 16px",
          background: "#1C1C1F", borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center"
            style={{ width: 18, height: 18, border: "1.5px solid #FFFFFF", borderRadius: 4 }}
          >
            {keyReady ? <CheckIcon color="#FFFFFF" size={14} /> : null}
          </span>
          <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 600, fontSize: 14.5, lineHeight: "20px", color: "#FFFFFF" }}>
            {t.onboarding.stackKey}
          </span>
        </div>
        {keyReady ? (
          <span
            className="flex items-center justify-center"
            style={{ width: 22, height: 22, borderRadius: 11, background: ONB_ACCENT }}
          >
            <CheckIcon color="#000000" size={14} />
          </span>
        ) : (
          <PendingIcon size={22} />
        )}
      </div>
    </div>
  );
}

export default function KeyStep({
  t,
  trialEndText,
  trialActive,
  activeKey,
  copied,
  onCopy,
  onOpenGuide,
  onNext,
}: KeyStepProps) {
  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto hide-scrollbar px-6 pt-7">
        <ProgressDots total={4} current={2} />

        <div className="pt-[25px]">
          <StatusStack t={t} trialEndText={trialEndText} trialActive={trialActive} keyReady={!!activeKey} />
        </div>

        <div className="flex flex-col gap-[10px] pt-3">
          <h1
            className="m-0"
            style={{
              fontFamily: ONB_FONT_SANS,
              fontWeight: 700,
              fontSize: 30,
              lineHeight: "34px",
              letterSpacing: "-0.75px",
              color: "#FFFFFF",
            }}
          >
            {t.onboarding.keyTitle}
          </h1>
          <p className="m-0" style={{ fontFamily: ONB_FONT_SANS, fontSize: 15, lineHeight: "22px", color: "#8A8D93" }}>
            {t.onboarding.keySubtitle}
          </p>
        </div>

        {/* Key field */}
        <div
          className="flex items-center justify-between gap-3 mt-6"
          style={{ background: "#121214", border: "1px solid #2A2B2E", borderRadius: 16, padding: "12px 12px 12px 16px" }}
        >
          <div className="flex flex-col gap-1 min-w-0">
            <span style={{ fontFamily: ONB_FONT_SANS, fontSize: 11.5, lineHeight: "15px", color: "#8A8D93" }}>
              {t.onboarding.yourKey}
            </span>
            <span
              className="truncate"
              style={{ fontFamily: ONB_FONT_MONO, fontSize: 13, lineHeight: "17px", color: activeKey ? "#E6E7EA" : "#8A8D93" }}
            >
              {activeKey || t.onboarding.keyPending}
            </span>
          </div>
          {activeKey && (
            <button
              onClick={onCopy}
              className="shrink-0 flex items-center gap-2 border-none outline-none cursor-pointer active:scale-[0.97] transition-transform duration-100"
              style={{ background: "#232326", borderRadius: 999, padding: "9px 14px" }}
            >
              <CopyIcon />
              <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 600, fontSize: 13, lineHeight: "17px", color: "#FFFFFF" }}>
                {copied ? t.onboarding.copied : t.onboarding.copy}
              </span>
            </button>
          )}
        </div>

        <div className="min-h-6" />
      </div>

      <div className="shrink-0 flex flex-col gap-[10px] px-4 pt-3 pb-4">
        <PrimaryButton onClick={onOpenGuide}>{t.onboarding.ctaInstruction}</PrimaryButton>
        <SecondaryButton onClick={onNext}>{t.onboarding.next}</SecondaryButton>
      </div>
    </div>
  );
}
