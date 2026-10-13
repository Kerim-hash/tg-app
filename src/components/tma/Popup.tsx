"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

// Figma "Pop-up": centered 358px panel, #0F1110, 1px white/10 border, 30px radius,
// 10px outer padding (40px bottom), a 48px close button in the top-right corner
// and a content column with 24px side padding and 24px gap.

const POPUP_BACKGROUND = "#0F1110";

let stylesInjected = false;
function usePopupStyles() {
  useEffect(() => {
    if (stylesInjected || typeof document === "undefined") return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.setAttribute("data-tma-popup", "");
    style.textContent = `
      @keyframes tmaPopupIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes tmaPopupBackdropIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .tma-popup-panel { animation: tmaPopupIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      .tma-popup-backdrop { animation: tmaPopupBackdropIn 0.25s ease forwards; }
      .tma-popup-close:active { transform: scale(0.94); }
      .tma-popup-btn:active { transform: scale(0.97); }
      .tma-popup-btn:disabled { cursor: not-allowed; opacity: 0.6; }
    `;
    document.head.appendChild(style);
  }, []);
}

interface PopupProps {
  open: boolean;
  onClose?: () => void;
  /** Close on backdrop tap; defaults to true when onClose is given */
  dismissible?: boolean;
  children: ReactNode;
  /** Side padding of the content column; the Figma default is 24px */
  contentPadding?: string;
  zIndex?: number;
}

export default function Popup({
  open,
  onClose,
  dismissible = true,
  children,
  contentPadding = "0 24px",
  zIndex = 1100,
}: PopupProps) {
  const [mounted, setMounted] = useState(false);
  usePopupStyles();
  useEffect(() => setMounted(true), []);

  // Lock the scrolling <main> while a popup is open
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const prev = mainEl.style.overflowY;
    mainEl.style.overflowY = "hidden";
    return () => {
      mainEl.style.overflowY = prev || "auto";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div
        className="tma-popup-backdrop"
        onClick={() => {
          if (onClose && dismissible) onClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex,
        }}
      />
      <div
        className="tma-popup-panel"
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100% - 32px)",
          maxWidth: "358px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          padding: onClose ? "10px 10px 40px" : "40px 10px 40px",
          gap: "16px",
          background: POPUP_BACKGROUND,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "30px",
          zIndex: zIndex + 10,
        }}
      >
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            className="tma-popup-close"
            onClick={onClose}
            style={{
              flex: "none",
              width: "48px",
              height: "48px",
              borderRadius: "100px",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              outline: "none",
              transition: "transform 0.15s ease",
            }}
          >
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "100px",
                background: "rgba(48, 50, 54, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        )}

        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: contentPadding,
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

export function PopupTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        alignSelf: "stretch",
        margin: 0,
        fontFamily: "var(--font-onest), 'Onest', sans-serif",
        fontWeight: 400,
        fontSize: "24px",
        lineHeight: "31px",
        textAlign: "center",
        color: "#FFFFFF",
      }}
    >
      {children}
    </h2>
  );
}

// 24px radio: 1.5px #363538 ring when idle, 1px #797D86 ring + #40D1FD dot when selected
export function PopupRadio({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        flex: "none",
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          boxSizing: "border-box",
          border: selected ? "1px solid #797D86" : "1.5px solid #363538",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s ease",
        }}
      >
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#40D1FD",
            transform: selected ? "scale(1)" : "scale(0)",
            transition: "transform 0.2s ease",
          }}
        />
      </span>
    </span>
  );
}

interface PopupOptionProps {
  selected: boolean;
  onSelect: () => void;
  label: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
}

// 48px row: radio + label, optional trailing text (e.g. price) on the right
export function PopupOption({ selected, onSelect, label, trailing, disabled }: PopupOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      style={{
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "16px",
        padding: "12px 0",
        height: "48px",
        boxSizing: "border-box",
        background: "transparent",
        border: "none",
        borderRadius: "30px",
        outline: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        color: "#FFFFFF",
      }}
    >
      <PopupRadio selected={selected} />
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-onest), 'Onest', sans-serif",
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "20px",
          color: "#FFFFFF",
        }}
      >
        {label}
      </span>
      {trailing !== undefined && (
        <span
          style={{
            flex: "none",
            fontFamily: "var(--font-onest), 'Onest', sans-serif",
            fontSize: "14px",
            lineHeight: "20px",
            color: selected ? "#FFFFFF" : "#8A94A6",
            transition: "color 0.2s ease",
          }}
        >
          {trailing}
        </span>
      )}
    </button>
  );
}

export function PopupOptions({ children }: { children: ReactNode }) {
  return (
    <div
      role="radiogroup"
      style={{
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {children}
    </div>
  );
}

interface PopupButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  style?: CSSProperties;
}

// 246x40 pill: white primary (#090909 text) or translucent secondary, JetBrains Mono uppercase
export function PopupButton({ children, onClick, variant = "primary", disabled, style }: PopupButtonProps) {
  const primary = variant === "primary";
  return (
    <button
      type="button"
      className="tma-popup-btn"
      disabled={disabled}
      onClick={onClick}
      style={{
        flex: "none",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "5px",
        padding: "10px 15px",
        width: "246px",
        maxWidth: "100%",
        height: "40px",
        boxSizing: "border-box",
        background: primary ? "#FFFFFF" : "rgba(255, 255, 255, 0.08)",
        border: "none",
        borderRadius: "12px",
        color: primary ? "#090909" : "#FFFFFF",
        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: 1,
        letterSpacing: "-0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        transition: "transform 0.15s ease, background 0.2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
