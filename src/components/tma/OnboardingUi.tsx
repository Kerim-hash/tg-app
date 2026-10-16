"use client";

import React from "react";

// Shared building blocks for the onboarding flow (Figma "D4" screens).
// Fonts: Manrope for text, JetBrains Mono for labels/CTAs.

export const ONB_FONT_SANS = "var(--font-manrope), var(--font-onest), ui-sans-serif, system-ui, sans-serif";
export const ONB_FONT_MONO = "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace";
export const ONB_ACCENT = "#40D1FD";

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-start gap-[6px] w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] w-[18px] rounded-[2px] transition-colors duration-300"
          style={{ background: i <= current ? "#FFFFFF" : "#2A2B2E" }}
        />
      ))}
    </div>
  );
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2L12 12M12 2L2 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L2 8L8 14" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TopBar({
  mode,
  label,
  onClick,
}: {
  mode: "close" | "back";
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      className="shrink-0 flex items-end"
      // Telegram draws its own header over the top of the web view in
      // fullscreen mode; --app-top is 0 in compact (in-chat) mode
      style={{
        paddingTop: "calc(var(--app-top) + 8px)",
        paddingBottom: 8,
        paddingLeft: "calc(var(--onb-pad) - 12px)",
        paddingRight: "calc(var(--onb-pad) - 12px)",
      }}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2 h-[34px] rounded-[17px] border-none outline-none cursor-pointer active:scale-[0.97] transition-transform duration-100"
        style={{ background: "#232326", padding: "0 14px 0 12px" }}
      >
        {mode === "close" ? <CloseIcon /> : <BackIcon />}
        <span
          style={{
            fontFamily: ONB_FONT_SANS,
            fontWeight: 600,
            fontSize: 15,
            lineHeight: "20px",
            color: "#FFFFFF",
          }}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  arrow = true,
}: {
  children: React.ReactNode;
  onClick: () => void;
  arrow?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[52px] rounded-[26px] border-none outline-none cursor-pointer flex items-center justify-center gap-[14px] active:scale-[0.98] transition-transform duration-100"
      style={{ background: ONB_ACCENT }}
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
        {children}
      </span>
      {arrow && (
        <span
          style={{
            fontFamily: ONB_FONT_MONO,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: "20px",
            color: "#000000",
          }}
        >
          →
        </span>
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-[52px] rounded-[26px] border-none outline-none cursor-pointer flex items-center justify-center active:scale-[0.98] transition-transform duration-100"
      style={{ background: "#1A1A1C" }}
    >
      <span
        style={{
          fontFamily: ONB_FONT_SANS,
          fontWeight: 600,
          fontSize: 15,
          lineHeight: "20px",
          color: "#FFFFFF",
        }}
      >
        {children}
      </span>
    </button>
  );
}

// Small cyan label with a rotated square, e.g. "◆ ПРОБНЫЙ ПЕРИОД"
export function AccentLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[10px] h-4">
      <span
        className="shrink-0"
        style={{ width: 9, height: 9, background: ONB_ACCENT, transform: "rotate(45deg)" }}
      />
      <span
        style={{
          fontFamily: ONB_FONT_MONO,
          fontWeight: 400,
          fontSize: 12,
          lineHeight: "16px",
          letterSpacing: "0.96px",
          color: ONB_ACCENT,
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

// Formats a date like "13 ноября" / "November 13" for the active language
export function formatTrialDate(date: Date, language: string): string {
  const locale =
    language === "ru" ? "ru-RU" : language === "by" ? "be-BY" : language === "uz" ? "uz-UZ" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatUsd(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}
