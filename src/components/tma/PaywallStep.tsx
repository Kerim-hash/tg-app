"use client";

import React from "react";
import type { Plan, Translations } from "./types";
import {
  AccentLabel,
  ONB_FONT_MONO,
  ONB_FONT_SANS,
  ProgressDots,
  SecondaryButton,
  formatUsd,
} from "./OnboardingUi";

interface PaywallStepProps {
  t: Translations;
  yearPlan: Plan;
  monthPlan?: Plan;
  onBuyYear: () => void;
  onLater: () => void;
}

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-[10px]">
    <span className="shrink-0 mt-[7px]" style={{ width: 6, height: 6, borderRadius: 3, background: "#000000" }} />
    <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 600, fontSize: 14.5, lineHeight: "20px", color: "#000000" }}>
      {children}
    </span>
  </div>
);

export default function PaywallStep({ t, yearPlan, monthPlan, onBuyYear, onLater }: PaywallStepProps) {
  const monthlyRate = monthPlan?.usdPerMonth;
  const fullYearAtMonthly = monthlyRate ? monthlyRate * 12 : undefined;
  const discountPercent =
    fullYearAtMonthly && fullYearAtMonthly > yearPlan.usdTotal
      ? Math.round((1 - yearPlan.usdTotal / fullYearAtMonthly) * 100)
      : 0;
  const monthsEquivalent = monthlyRate ? Math.max(1, Math.round(yearPlan.usdTotal / monthlyRate)) : 12;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto hide-scrollbar px-6 pt-7">
        <ProgressDots total={4} current={3} />

        <div className="flex flex-col gap-[11px] pt-7">
          <AccentLabel>
            {t.onboarding.yearLabel}
            {discountPercent > 0 ? ` · -${discountPercent}%` : ""}
          </AccentLabel>
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
            {t.onboarding.paywallTitle(monthsEquivalent)}
          </h1>
        </div>

        {/* Annual plan card */}
        <div className="mt-6 flex flex-col gap-4" style={{ background: "#40D1FD", borderRadius: 24, padding: "18px 20px 16px" }}>
          <div className="flex items-center gap-2">
            <span style={{ width: 7, height: 7, background: "#000000", transform: "rotate(45deg)" }} />
            <span
              style={{
                fontFamily: ONB_FONT_MONO,
                fontSize: 11,
                lineHeight: "14px",
                letterSpacing: "0.9px",
                color: "#000000",
                textTransform: "uppercase",
              }}
            >
              {t.onboarding.yearly}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              style={{
                fontFamily: ONB_FONT_SANS,
                fontWeight: 700,
                fontSize: 40,
                lineHeight: "44px",
                letterSpacing: "-1px",
                color: "#000000",
              }}
            >
              ${yearPlan.usdPerMonth.toFixed(2)}
            </span>
            <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 600, fontSize: 16, lineHeight: "22px", color: "#000000" }}>
              {t.onboarding.perMonth}
            </span>
          </div>

          <div className="h-px w-full" style={{ background: "rgba(0,0,0,0.18)" }} />

          <div className="flex flex-col gap-[7px]">
            <Bullet>{t.onboarding.pwFeatures}</Bullet>
            <Bullet>{t.onboarding.pwDevices}</Bullet>
            <Bullet>{t.onboarding.pwSupport}</Bullet>
            <Bullet>{t.onboarding.pwRefund}</Bullet>
          </div>

          {fullYearAtMonthly && (
            <div
              className="text-center"
              style={{
                fontFamily: ONB_FONT_MONO,
                fontSize: 11,
                lineHeight: "14px",
                letterSpacing: "0.66px",
                color: "rgba(0,0,0,0.65)",
                textTransform: "uppercase",
              }}
            >
              {t.onboarding.yearInsteadOf(formatUsd(yearPlan.usdTotal), formatUsd(fullYearAtMonthly))}
            </div>
          )}
        </div>

        {/* Monthly plan row */}
        {monthPlan && (
          <div
            className="mt-3 flex items-center justify-between"
            style={{ background: "#121214", border: "1px solid #2A2B2E", borderRadius: 20, padding: "16px 20px" }}
          >
            <div className="flex flex-col gap-[2px]">
              <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 700, fontSize: 15, lineHeight: "20px", color: "#FFFFFF" }}>
                {t.onboarding.oneMonth}
              </span>
              <span style={{ fontFamily: ONB_FONT_SANS, fontSize: 12.5, lineHeight: "17px", color: "#8A8D93" }}>
                {t.onboarding.upToDevices}
              </span>
            </div>
            <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 700, fontSize: 15, lineHeight: "20px", color: "#FFFFFF" }}>
              {formatUsd(monthPlan.usdPerMonth)}
              {t.onboarding.perMonth}
            </span>
          </div>
        )}

        <div className="min-h-6" />
      </div>

      <div className="shrink-0 flex flex-col gap-[10px] px-4 pt-3" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="rounded-[26px]" style={{ background: "#FFFFFF" }}>
          <button
            onClick={onBuyYear}
            className="w-full h-[52px] rounded-[26px] border-none outline-none cursor-pointer flex items-center justify-center gap-[14px] active:scale-[0.98] transition-transform duration-100"
            style={{ background: "#FFFFFF" }}
          >
            <span
              style={{
                fontFamily: ONB_FONT_MONO,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: "20px",
                letterSpacing: "0.6px",
                color: "#000000",
                textTransform: "uppercase",
              }}
            >
              {t.onboarding.ctaBuyYear(formatUsd(yearPlan.usdTotal))}
            </span>
            <span style={{ fontFamily: ONB_FONT_MONO, fontWeight: 500, fontSize: 15, color: "#000000" }}>→</span>
          </button>
        </div>
        <SecondaryButton onClick={onLater}>{t.onboarding.later}</SecondaryButton>
      </div>
    </div>
  );
}
