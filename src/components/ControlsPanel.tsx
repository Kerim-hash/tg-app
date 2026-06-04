"use client";

import React from "react";

export interface ControlState {
  label: string;
  primaryColor: string;
  secondaryColor: string;
  baseColor: string;
  animationSpeed: number;
  glowIntensity: number;
  borderGlow: boolean;
  enableMouseTracking: boolean;
  animate: boolean;
}

interface ControlsPanelProps {
  state: ControlState;
  onChange: (updates: Partial<ControlState>) => void;
  onApplyPreset: (presetName: "opt1" | "opt2" | "opt3") => void;
  activePreset: string;
}

export default function ControlsPanel({
  state,
  onChange,
  onApplyPreset,
  activePreset,
}: ControlsPanelProps) {
  return (
    <div
      style={{
        backgroundColor: "rgba(18, 18, 22, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "32px",
        padding: "32px",
        color: "white",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        fontFamily: "var(--font-onest), sans-serif",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>
          Интерактивная Панель
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.4)", margin: "4px 0 0 0" }}>
          Настройте градиенты, скорость и физику эффектов в реальном времени
        </p>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

      {/* Preset Selector */}
      <div>
        <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: "12px" }}>
          Шаблоны (Presets)
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onApplyPreset("opt1")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "16px",
              border: activePreset === "opt1" ? "2px solid #FF82C9" : "1px solid rgba(255,255,255,0.08)",
              backgroundColor: activePreset === "opt1" ? "rgba(255, 130, 201, 0.1)" : "rgba(255,255,255,0.02)",
              color: activePreset === "opt1" ? "#FF82C9" : "white",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Stone_Opt.1
          </button>
          <button
            onClick={() => onApplyPreset("opt2")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "16px",
              border: activePreset === "opt2" ? "2px solid #8fa8b2" : "1px solid rgba(255,255,255,0.08)",
              backgroundColor: activePreset === "opt2" ? "rgba(143, 168, 178, 0.1)" : "rgba(255,255,255,0.02)",
              color: activePreset === "opt2" ? "#b4c7d0" : "white",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Stone_Opt.2
          </button>
          <button
            onClick={() => onApplyPreset("opt3")}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "16px",
              border: activePreset === "opt3" ? "2px solid #D6FC00" : "1px solid rgba(255,255,255,0.08)",
              backgroundColor: activePreset === "opt3" ? "rgba(214, 252, 0, 0.05)" : "rgba(255,255,255,0.02)",
              color: activePreset === "opt3" ? "#D6FC00" : "white",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Кастомный
          </button>
        </div>
      </div>

      {/* Colors Config */}
      <div>
        <label style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255, 255, 255, 0.5)", display: "block", marginBottom: "12px" }}>
          Настройка Цветов
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Первый Градиент</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <input
                type="color"
                value={state.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                style={{ width: "32px", height: "32px", border: 0, borderRadius: "8px", cursor: "pointer", background: "none" }}
              />
              <span style={{ fontSize: "13px", fontFamily: "var(--font-mono), monospace", textTransform: "uppercase" }}>{state.primaryColor}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>Второй Градиент</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <input
                type="color"
                value={state.secondaryColor}
                onChange={(e) => onChange({ secondaryColor: e.target.value })}
                style={{ width: "32px", height: "32px", border: 0, borderRadius: "8px", cursor: "pointer", background: "none" }}
              />
              <span style={{ fontSize: "13px", fontFamily: "var(--font-mono), monospace", textTransform: "uppercase" }}>{state.secondaryColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Glow Intensity */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.5)" }}>Интенсивность Свечения</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#FF82C9" }}>{state.glowIntensity}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.05"
            value={state.glowIntensity}
            onChange={(e) => onChange({ glowIntensity: parseFloat(e.target.value) })}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              WebkitAppearance: "none",
              background: "rgba(255,255,255,0.1)",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Animation Speed */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.5)" }}>Длительность анимации</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#5D1C89" }}>{state.animationSpeed} сек</span>
          </div>
          <input
            type="range"
            min="2"
            max="20"
            step="0.5"
            value={state.animationSpeed}
            onChange={(e) => onChange({ animationSpeed: parseFloat(e.target.value) })}
            disabled={!state.animate}
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              WebkitAppearance: "none",
              background: "rgba(255,255,255,0.1)",
              outline: "none",
              cursor: state.animate ? "pointer" : "not-allowed",
              opacity: state.animate ? 1 : 0.4,
            }}
          />
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

      {/* Switches/Toggles */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Animate Toggle */}
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>Запустить дрейф (Анимацию)</span>
          <input
            type="checkbox"
            checked={state.animate}
            onChange={(e) => onChange({ animate: e.target.checked })}
            style={{
              width: "44px",
              height: "22px",
              WebkitAppearance: "none",
              backgroundColor: state.animate ? "#FF82C9" : "rgba(255,255,255,0.1)",
              borderRadius: "11px",
              position: "relative",
              outline: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            className="after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-[18px] after:height-[18px] after:border-radius-['50%'] after:transition-all checked:after:left-[24px]"
          />
        </label>

        {/* Mouse Tracking Toggle */}
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>Интерактивный курсор (Glow-following)</span>
          <input
            type="checkbox"
            checked={state.enableMouseTracking}
            onChange={(e) => onChange({ enableMouseTracking: e.target.checked })}
            style={{
              width: "44px",
              height: "22px",
              WebkitAppearance: "none",
              backgroundColor: state.enableMouseTracking ? "#FF82C9" : "rgba(255,255,255,0.1)",
              borderRadius: "11px",
              position: "relative",
              outline: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          />
        </label>

        {/* Border Glow Toggle */}
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.85)" }}>Свечение внешней грани (Border Beam)</span>
          <input
            type="checkbox"
            checked={state.borderGlow}
            onChange={(e) => onChange({ borderGlow: e.target.checked })}
            style={{
              width: "44px",
              height: "22px",
              WebkitAppearance: "none",
              backgroundColor: state.borderGlow ? "#FF82C9" : "rgba(255,255,255,0.1)",
              borderRadius: "11px",
              position: "relative",
              outline: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          />
        </label>
      </div>
    </div>
  );
}
