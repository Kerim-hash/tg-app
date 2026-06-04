"use client";

import { useState } from "react";
import type { Language, Translations, UserData, Notifications, HapticType } from "./types";

interface ProfileScreenProps {
  t: Translations;
  user: UserData;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  notifs: Notifications;
  onNotifsChange: (notifs: Notifications) => void;
  triggerHaptic: (type: HapticType) => void;
  onToggleActivePlan: () => void;
}

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Español" },
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
  triggerHaptic,
  onToggleActivePlan,
}: ProfileScreenProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <div style={{ padding: "16px 16px 8px", fontFamily: "var(--font-onest), sans-serif" }}>
      {/* Nav title */}
      <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#00D1FF", marginBottom: "24px", margin: "0 0 24px" }}>
        {t.profile.title}
      </p>

      {/* User header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
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
      <div style={{ position: "relative", marginBottom: "32px", height: "72px" }}>
        {!dropdownOpen ? (
          <button
            onClick={() => { triggerHaptic("light"); setDropdownOpen(true); }}
            style={{
              width: "100%",
              height: "72px",
              padding: "12px 24px",
              borderRadius: "30px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              outline: "none",
            }}
          >
            <div>
              <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px" }}>
                {t.profile.language}
              </span>
              <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                {currentLangLabel}
              </span>
            </div>
            {/* Chevron Down icon */}
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#8A94A6" }}>
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              background: "rgba(25, 28, 38, 0.72)", // Frosted glass iPhone background
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "28px",
              zIndex: 150,
              boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Expanded Header Button (clicking toggles dropdown closed) */}
            <button
              onClick={() => { triggerHaptic("light"); setDropdownOpen(false); }}
              style={{
                width: "100%",
                height: "72px",
                padding: "12px 24px",
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
                <span style={{ display: "block", fontSize: "12px", color: "#8A94A6", marginBottom: "3px" }}>
                  {t.profile.language}
                </span>
                <span style={{ display: "block", fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                  {currentLangLabel}
                </span>
              </div>
              {/* Chevron Up icon */}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ color: "#fff" }}>
                <path d="M11 6.5L6 1.5L1 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Separator line */}
            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 24px" }} />

            {/* Options list */}
            <div style={{ padding: "8px 0 16px" }}>
              {LANG_OPTIONS.map((opt) => {
                const isActive = language === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      triggerHaptic("light");
                      onLanguageChange(opt.value);
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      height: "48px",
                      padding: "0 24px",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#40D1FD" : "#fff",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div>
        <h3 style={{ fontSize: "24px", textAlign: "center", color: "#fff", margin: "0 0 16px" }}>
          {t.profile.notifications}
        </h3>

        <div>
          {notifItems.map(({ key, label, desc }, idx) => (
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

      {/* Separator dots */}
      <div style={{ height: "1px", backgroundImage: "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 2px, transparent 2px, transparent 8px)", margin: "24px 0" }} />

      {/* Simulator / Developer Settings */}
      <div style={{ paddingBottom: "24px" }}>
        <h3 style={{ fontSize: "24px", textAlign: "center", color: "#fff", margin: "0 0 16px" }}>
          Simulator
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 0",
          }}
        >
          <div>
            <p style={{ fontSize: "18px", color: "#fff", margin: "0 0 2px" }}>
              {t.profile.simulateActivePlan}
            </p>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              {t.profile.simulateActivePlanDesc}
            </p>
          </div>
          <Toggle
            value={!!user.activePlan}
            onChange={() => {
              triggerHaptic("light");
              onToggleActivePlan();
            }}
          />
        </div>
      </div>
    </div>
  );
}
