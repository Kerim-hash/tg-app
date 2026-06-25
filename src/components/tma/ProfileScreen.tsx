"use client";

import { useState, useEffect, useRef } from "react";
import type { Language, Translations, UserData, Notifications, HapticType, ReferralInfo } from "./types";
import GradientBlock from "../GradientBlock";

interface ProfileScreenProps {
  t: Translations;
  user: UserData;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  notifs: Notifications;
  onNotifsChange: (notifs: Notifications) => void;
  referralInfo: ReferralInfo | null;
  triggerHaptic: (type: HapticType) => void;
  onResetOnboarding?: () => void;
  billingRegion: string;
  onBillingRegionChange: (region: string) => void;
}

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Español" },
];

const REGION_OPTIONS = [
  { value: "UAE" },
  { value: "UZB" },
  { value: "BY" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-checked={value}
      role="switch"
      style={{
        position: "relative",
        width: "44px",
        height: "26px",
        borderRadius: "13px",
        background: value ? "#00D1FF" : "rgba(255,255,255,0.12)",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: value ? "21px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s ease",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

export default function ProfileScreen({
  t,
  user,
  language,
  onLanguageChange,
  notifs,
  onNotifsChange,
  referralInfo,
  triggerHaptic,
  onResetOnboarding,
  billingRegion,
  onBillingRegionChange,
}: ProfileScreenProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"web" | "bot" | null>(null);

  const langRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (langDropdownOpen && langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (regionDropdownOpen && regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [langDropdownOpen, regionDropdownOpen]);

  const getRegionLabel = (val: string) => {
    if (val === "UZB") return t.payment.regionUZB;
    if (val === "BY") return t.payment.regionBY;
    return t.payment.regionUAE;
  };

  const handleCopy = (link: string, type: "web" | "bot") => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(link);
        setCopiedLink(type);
        triggerHaptic("success");
        setTimeout(() => setCopiedLink(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const isAnyDropdownOpen = langDropdownOpen || regionDropdownOpen;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    if (isAnyDropdownOpen) {
      mainEl.style.overflowY = "hidden";
    } else {
      mainEl.style.overflowY = "auto";
    }
    return () => {
      mainEl.style.overflowY = "auto";
    };
  }, [isAnyDropdownOpen]);

  const initials = user.firstName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const currentLangLabel = LANG_OPTIONS.find((o) => o.value === language)?.label ?? "English";

  const notifItems: { key: keyof Notifications; label: string; desc: string }[] = [
    { key: "all",     label: t.profile.notifAll,     desc: t.profile.notifAllDesc     },
    { key: "news",    label: t.profile.notifNews,    desc: t.profile.notifNewsDesc    },
    { key: "billing", label: t.profile.notifBilling, desc: t.profile.notifBillingDesc },
    { key: "tech",    label: t.profile.notifTech,    desc: t.profile.notifTechDesc    },
  ];

  return (
    <div style={{ padding: "50px 16px 8px", fontFamily: "var(--font-onest), sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dropdownScaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-dropdown {
            animation: dropdownScaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .hover-scale-btn {
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
          }
          .hover-scale-btn:active {
            transform: scale(0.97);
            opacity: 0.9;
          }
        `,
      }} />

      {/* Nav title */}
      <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#00D1FF", marginBottom: "24px", margin: "0 0 24px" }}>
        {t.profile.title}
      </p>

      {/* User header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {user.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoUrl}
            alt={user.firstName}
            style={{ width: "68px", height: "68px", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00D1FF 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", color: "#fff", margin: "0 0 4px" }}>
            {t.profile.manage}
          </h2>
          {user.username && (
            <p style={{ fontSize: "16px", color: "#666666", margin: 0 }}>@{user.username}</p>
          )}
        </div>
      </div>

      {/* Language dropdown */}
      <div
        ref={langRef}
        style={{
          position: "relative",
          marginBottom: "32px",
          height: "72px",
          zIndex: 9,
          opacity: regionDropdownOpen ? 0.3 : 1,
          pointerEvents: regionDropdownOpen ? "none" : "auto",
          transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {!langDropdownOpen ? (
          <button
            onClick={() => { triggerHaptic("light"); setLangDropdownOpen(true); }}
            className="hover-scale-btn"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              outline: "none",
            }}
          >
            <GradientBlock
              label=""
              primaryColor={"#cfdfe5"}
              secondaryColor={"#686F70"}
              baseColor="#1D1C1B"
              borderRadius="30px"
              height="72px"
              animate={false}
              glowIntensity={0.6}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              contentAlign={"start"}
              padding="12px 28px"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.profile.language}
                  </span>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {currentLangLabel}
                  </span>
                </div>
                {/* Chevron Down icon */}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#8A94A6" }}>
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </GradientBlock>
          </button>
        ) : (
          <div
            className="animate-dropdown"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              zIndex: 1000,
            }}
          >
            <GradientBlock
              label=""
              primaryColor={"#cfdfe5"}
              secondaryColor={"#686F70"}
              baseColor="#1D1C1B"
              borderRadius="30px"
              height="auto"
              animate={false}
              glowIntensity={0.6}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              contentAlign={"start"}
              padding="0"
            >
              {/* Expanded Header Button (clicking toggles dropdown closed) */}
              <button
                onClick={() => { triggerHaptic("light"); setLangDropdownOpen(false); }}
                style={{
                  width: "100%",
                  height: "72px",
                  padding: "12px 28px",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.profile.language}
                  </span>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {currentLangLabel}
                  </span>
                </div>
                {/* Chevron Up icon */}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#fff" }}>
                  <path d="M11 6.5L6 1.5L1 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Separator line */}
              <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 28px", width: "calc(100% - 56px)" }} />

              {/* Options list */}
              <div style={{ padding: "8px 0 16px", width: "100%" }}>
                {LANG_OPTIONS.map((opt) => {
                  const isActive = language === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        triggerHaptic("light");
                        onLanguageChange(opt.value);
                        setLangDropdownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        height: "48px",
                        padding: "0 28px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#40D1FD" : "#fff",
                        transition: "color 0.2s ease",
                        fontFamily: "var(--font-onest), sans-serif",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </GradientBlock>
          </div>
        )}
      </div>

      {/* Billing region dropdown */}
      <div
        ref={regionRef}
        style={{
          position: "relative",
          marginBottom: "32px",
          height: "72px",
          zIndex: 8,
          opacity: langDropdownOpen ? 0.3 : 1,
          pointerEvents: langDropdownOpen ? "none" : "auto",
          transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {!regionDropdownOpen ? (
          <button
            onClick={() => { triggerHaptic("light"); setRegionDropdownOpen(true); }}
            className="hover-scale-btn"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              outline: "none",
            }}
          >
            <GradientBlock
              label=""
              primaryColor={"#cfdfe5"}
              secondaryColor={"#686F70"}
              baseColor="#1D1C1B"
              borderRadius="30px"
              height="72px"
              animate={false}
              glowIntensity={0.6}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              contentAlign={"start"}
              padding="12px 28px"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.payment.billingRegion}
                  </span>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {getRegionLabel(billingRegion)}
                  </span>
                </div>
                {/* Chevron Down icon */}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#8A94A6" }}>
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </GradientBlock>
          </button>
        ) : (
          <div
            className="animate-dropdown"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              zIndex: 1000,
            }}
          >
            <GradientBlock
              label=""
              primaryColor={"#cfdfe5"}
              secondaryColor={"#686F70"}
              baseColor="#1D1C1B"
              borderRadius="30px"
              height="auto"
              animate={false}
              glowIntensity={0.6}
              borderGlow={true}
              enableMouseTracking={false}
              enableHoverScale={false}
              contentAlign={"start"}
              padding="0"
            >
              {/* Expanded Header Button (clicking toggles dropdown closed) */}
              <button
                onClick={() => { triggerHaptic("light"); setRegionDropdownOpen(false); }}
                style={{
                  width: "100%",
                  height: "72px",
                  padding: "12px 28px",
                  background: "transparent",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                  outline: "none",
                }}
              >
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px", fontFamily: "var(--font-onest), sans-serif" }}>
                    {t.payment.billingRegion}
                  </span>
                  <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff", fontFamily: "var(--font-onest), sans-serif" }}>
                    {getRegionLabel(billingRegion)}
                  </span>
                </div>
                {/* Chevron Up icon */}
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#fff" }}>
                  <path d="M11 6.5L6 1.5L1 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Separator line */}
              <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 28px", width: "calc(100% - 56px)" }} />

              {/* Options list */}
              <div style={{ padding: "8px 0 16px", width: "100%" }}>
                {REGION_OPTIONS.map((opt) => {
                  const isActive = billingRegion === opt.value || (!billingRegion && opt.value === "UAE");
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        triggerHaptic("light");
                        onBillingRegionChange(opt.value);
                        setRegionDropdownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        height: "48px",
                        padding: "0 28px",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        fontSize: "15px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#40D1FD" : "#fff",
                        transition: "color 0.2s ease",
                        fontFamily: "var(--font-onest), sans-serif",
                      }}
                    >
                      {getRegionLabel(opt.value)}
                    </button>
                  );
                })}
              </div>
            </GradientBlock>
          </div>
        )}
      </div>
      {/* Referral Program */}
      {referralInfo && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "30px",
            padding: "20px 24px",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            opacity: isAnyDropdownOpen ? 0.3 : 1,
            pointerEvents: isAnyDropdownOpen ? "none" : "auto",
            transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>
              {t.profile.referralTitle}
            </h3>
            <div
              style={{
                background: "rgba(0, 209, 255, 0.1)",
                border: "1px solid rgba(0, 209, 255, 0.25)",
                borderRadius: "12px",
                padding: "4px 10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#00D1FF",
              }}
            >
              {t.profile.referralBalance}: {referralInfo.balance} USD
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#8A94A6", lineHeight: "1.5", margin: "0 0 18px" }}>
            {t.profile.referralDesc}
          </p>

          {/* Telegram referral link */}
          {referralInfo.telegram_referral_link && (
            <div style={{ marginBottom: 0 }}>
              <span style={{ display: "block", fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                {t.profile.referralLinkBot}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "16px",
                  padding: "6px 6px 6px 14px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <span style={{ flex: 1, fontSize: "13px", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "10px" }}>
                  {referralInfo.telegram_referral_link}
                </span>
                <button
                  onClick={() => handleCopy(referralInfo.telegram_referral_link, "bot")}
                  className="hover-scale-btn"
                  style={{
                    background: copiedLink === "bot" ? "#00E676" : "#00D1FF",
                    color: "#000",
                    border: "none",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                    outline: "none",
                  }}
                >
                  {copiedLink === "bot" ? t.profile.referralCopied : t.profile.referralCopy}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      <div
        style={{
          opacity: isAnyDropdownOpen ? 0.3 : 1,
          pointerEvents: isAnyDropdownOpen ? "none" : "auto",
          transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <h3 style={{ fontSize: "24px", textAlign: "center", color: "#fff", margin: "0 0 16px" }}>
          {t.profile.notifications}
        </h3>

        <div>
          {notifItems.map(({ key, label, desc }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 0",
              }}
            >
              <div>
                <p style={{ fontSize: "18px", color: "#fff", margin: "0 0 2px" }}>{label}</p>
                <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>{desc}</p>
              </div>
              <Toggle
                value={notifs[key]}
                onChange={() => {
                  triggerHaptic("light");
                  onNotifsChange({ ...notifs, [key]: !notifs[key] });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
