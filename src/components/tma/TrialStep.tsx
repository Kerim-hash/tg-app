"use client";

import React from "react";
import type { Translations } from "./types";
import { AccentLabel, ONB_FONT_MONO, ONB_FONT_SANS, PrimaryButton, ProgressDots } from "./OnboardingUi";

interface TrialStepProps {
  t: Translations;
  trialDays: number;
  trialEndText: string;
  onActivate: () => void;
}

// 22px pixel-art style icons (Figma "image" vectors), drawn on a 7x7 grid
const PIXEL = "#D4F5FF";
function PixelIcon({ cells }: { cells: [number, number][] }) {
  return (
    <svg width="22" height="22" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PIXEL} />
      ))}
    </svg>
  );
}

const ICON_NO_LOGS: [number, number][] = [
  [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [5, 2], [0, 3], [5, 3], [1, 4], [2, 4], [3, 4], [4, 4], [6, 5],
];
const ICON_SPEED: [number, number][] = [
  [2, 1], [3, 1], [4, 2], [5, 2], [6, 2], [0, 3], [1, 3], [2, 3], [4, 4], [5, 4], [6, 4], [2, 5], [3, 5],
];
const ICON_KILL_SWITCH: [number, number][] = [
  [1, 1], [3, 1], [5, 1], [3, 2], [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [3, 4], [1, 5], [3, 5], [5, 5],
];
const ICON_SUPPORT: [number, number][] = [
  [1, 1], [5, 1], [0, 2], [6, 2], [2, 3], [3, 3], [4, 3], [0, 4], [6, 4], [1, 5], [5, 5],
];

const COUNTRY_ROWS: string[][] = [
  ["🇫🇷 France", "🇩🇪 Germany", "🇮🇹 Italy", "🇪🇸 Spain", "🇳🇱 Netherlands", "🇬🇧 United Kingdom"],
  ["🇺🇸 United States", "🇨🇦 Canada", "🇦🇹 Austria", "🇸🇪 Sweden", "🇨🇭 Switzerland", "🇯🇵 Japan"],
  ["🇹🇷 Turkey", "🇸🇬 Singapore", "🇹🇭 Thailand", "🇦🇪 UAE", "🇵🇱 Poland", "🇫🇮 Finland"],
];

function Chip({ label }: { label: string }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap"
      style={{
        background: "#1A1A1C",
        borderRadius: 999,
        padding: "8px 14px",
        fontFamily: ONB_FONT_MONO,
        fontSize: 13,
        lineHeight: "17px",
        color: "#E6E7EA",
      }}
    >
      {label}
    </span>
  );
}

function Marquee({ items, reverse, duration }: { items: string[]; reverse?: boolean; duration: number }) {
  // Two copies so the loop is seamless
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex gap-2 w-max"
        style={{
          animation: `onb-marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((label, i) => (
          <Chip key={`${label}-${i}`} label={label} />
        ))}
      </div>
    </div>
  );
}

export default function TrialStep({ t, trialDays, trialEndText, onActivate }: TrialStepProps) {
  const features = [
    { icon: ICON_NO_LOGS, text: t.onboarding.featNoLogs },
    { icon: ICON_SPEED, text: t.onboarding.featSpeed },
    { icon: ICON_KILL_SWITCH, text: t.onboarding.featKillSwitch },
    { icon: ICON_SUPPORT, text: t.onboarding.featSupport },
  ];

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes onb-marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `,
        }}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col px-6 pt-7">
          <ProgressDots total={4} current={1} />

          <div className="flex flex-col gap-[11px] pt-7">
            <AccentLabel>{t.onboarding.trialLabel}</AccentLabel>
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
              {t.onboarding.trialTitle(trialDays)}
            </h1>
          </div>

          <div className="flex flex-col gap-5 pt-12">
            {features.map((f) => (
              <div key={f.text} className="flex items-center gap-4">
                <PixelIcon cells={f.icon} />
                <span
                  style={{
                    fontFamily: ONB_FONT_SANS,
                    fontWeight: 600,
                    fontSize: 17,
                    lineHeight: "23px",
                    letterSpacing: "-0.17px",
                    color: "#FFFFFF",
                  }}
                >
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[28px]" />

        {/* Server locations, three drifting rows */}
        <div className="flex flex-col gap-2 pb-4">
          <Marquee items={COUNTRY_ROWS[0]} duration={38} />
          <Marquee items={COUNTRY_ROWS[1]} duration={46} reverse />
          <Marquee items={COUNTRY_ROWS[2]} duration={42} />
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-[10px] px-4 pt-3" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
        <p
          className="m-0 text-center mx-auto"
          style={{ fontFamily: ONB_FONT_SANS, fontSize: 12.5, lineHeight: "18px", color: "#8A8D93", maxWidth: 270 }}
        >
          {t.onboarding.trialNote(trialEndText)}
        </p>
        <PrimaryButton onClick={onActivate}>{t.onboarding.ctaActivate(trialDays)}</PrimaryButton>
      </div>
    </div>
  );
}
