"use client";

import React, { useEffect, useState } from "react";
import { ParticleGlobe } from "../ParticleGlobe";
import type { Translations } from "./types";
import { fetchIpStatus, type IpStatus } from "./api";
import { ONB_ACCENT, ONB_FONT_MONO, ONB_FONT_SANS, PrimaryButton, ProgressDots } from "./OnboardingUi";

interface WelcomeStepProps {
  t: Translations;
  trialDays: number;
  onContinue: () => void;
}

function GlowDot() {
  return (
    <span
      className="shrink-0"
      style={{
        width: 12,
        height: 12,
        background: ONB_ACCENT,
        boxShadow: "0 0 0 3px rgba(64, 209, 253, 0.18), 0 0 12px rgba(64, 209, 253, 0.6)",
      }}
    />
  );
}

function GlobeTag({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div className="absolute flex items-end gap-2" style={style}>
      <GlowDot />
      <span
        style={{
          fontFamily: ONB_FONT_MONO,
          fontWeight: 400,
          fontSize: 10.5,
          lineHeight: "14px",
          letterSpacing: "0.63px",
          textTransform: "uppercase",
          color: ONB_ACCENT,
          maxWidth: 90,
        }}
      >
        {children}
      </span>
    </div>
  );
}

export default function WelcomeStep({ t, trialDays, onContinue }: WelcomeStepProps) {
  // GET /ip/status: same source as the landing's status bar
  const [ipStatus, setIpStatus] = useState<IpStatus | null>(null);
  const [ipFailed, setIpFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchIpStatus(controller.signal)
      .then((data) => setIpStatus(data))
      .catch(() => setIpFailed(true));
    return () => controller.abort();
  }, []);

  const isProtected = ipStatus?.protected === true;
  const loc = ipStatus?.location;
  const place = loc ? [loc.city, loc.country].filter(Boolean).join(", ") : "";
  const placeText = place ? ` · ${loc?.flag ? `${loc.flag} ` : ""}${place}` : "";
  const ipText = ipStatus ? `${ipStatus.ip}${placeText}` : ipFailed ? "—" : t.onboarding.ipDetecting;
  const badgeBg = isProtected ? "rgba(52, 211, 153, 0.14)" : "rgba(255, 149, 64, 0.14)";
  const badgeDot = isProtected ? "#34D399" : "#FF9540";
  const badgeText = isProtected ? "#6EE7B7" : "#FFA45C";

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Particle sphere, sits behind the text */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ top: 275, width: 460, height: 460, opacity: 0.9 }}
      >
        <ParticleGlobe width={460} height={460} className="w-full h-full" />
      </div>

      <div className="relative flex-1 flex flex-col onb-px pt-7 gap-[22px] min-h-0">
        <ProgressDots total={4} current={0} />

        {/* "Not protected" card */}
        <div
          className="flex flex-col gap-[10px] w-full"
          style={{ background: "rgba(24, 24, 26, 0.92)", borderRadius: 16, padding: "14px 16px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-[7px] shrink-0"
              style={{ background: badgeBg, borderRadius: 999, padding: "5px 11px" }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 3.5, background: badgeDot }} />
              <span
                style={{
                  fontFamily: ONB_FONT_MONO,
                  fontSize: 11.5,
                  lineHeight: "15px",
                  letterSpacing: "0.69px",
                  color: badgeText,
                  textTransform: "uppercase",
                }}
              >
                {isProtected ? t.onboarding.protectedLabel : t.onboarding.notProtected}
              </span>
            </div>
            <span style={{ fontFamily: ONB_FONT_SANS, fontWeight: 600, fontSize: 14.5, lineHeight: "20px", color: "#FFFFFF" }}>
              {isProtected ? t.onboarding.protectedByIguard : t.onboarding.ipVisible}
            </span>
          </div>
          <div style={{ fontFamily: ONB_FONT_MONO, fontSize: 13, lineHeight: "17px", color: "#C9CBD0" }}>
            {t.onboarding.ipPrefix} {ipText}
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-[9px] pt-[5px]">
          <h1
            className="m-0"
            style={{
              fontFamily: ONB_FONT_SANS,
              fontWeight: 700,
              fontSize: 40,
              lineHeight: "41px",
              letterSpacing: "-1px",
              color: "#FFFFFF",
            }}
          >
            {t.onboarding.welcomeTitle(trialDays)}
          </h1>
          <p className="m-0" style={{ fontFamily: ONB_FONT_SANS, fontSize: 16, lineHeight: "23px", color: "#8A8D93" }}>
            {t.onboarding.welcomeSubtitle}
          </p>
        </div>

        {/* Tags floating around the globe */}
        <div className="relative w-full" style={{ height: 150 }}>
          <GlobeTag style={{ right: 0, top: 6 }}>{t.onboarding.tagNoPayment}</GlobeTag>
          <GlobeTag style={{ left: 0, top: 64 }}>{t.onboarding.tagNoCard}</GlobeTag>
          <GlobeTag style={{ right: 16, top: 118 }}>{t.onboarding.tagFullAccess}</GlobeTag>
        </div>
      </div>

      <div className="relative shrink-0 onb-px-cta pt-3" style={{ paddingBottom: "calc(16px + var(--tg-safe-bottom))" }}>
        <PrimaryButton onClick={onContinue}>{t.onboarding.ctaEnableFree}</PrimaryButton>
      </div>
    </div>
  );
}
