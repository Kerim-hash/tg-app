"use client";

import type { Tab, Translations } from "./types";
import { trackEvent } from "../../lib/mixpanel";

interface NavBarProps {
  t: Translations;
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  isVisible?: boolean;
}

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.3808 8.08428L10.5475 2.98011C10.2333 2.7052 9.76413 2.7052 9.44994 2.98011L3.61661 8.08428C3.43576 8.24252 3.33203 8.47112 3.33203 8.71143V15.8333C3.33203 16.2935 3.70513 16.6666 4.16536 16.6666H7.4987C7.95894 16.6666 8.33203 16.2935 8.33203 15.8333V12.5C8.33203 12.0397 8.70513 11.6666 9.16536 11.6666H10.832C11.2923 11.6666 11.6654 12.0397 11.6654 12.5V15.8333C11.6654 16.2935 12.0385 16.6666 12.4987 16.6666H15.832C16.2923 16.6666 16.6654 16.2935 16.6654 15.8333V8.71143C16.5616 8.47112 16.5616 8.24252 16.3808 8.08428Z" fill="white" />
  </svg>
);

const GuideIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.29289 3.20711C9.68342 2.81658 10.3166 2.81658 10.7071 3.20711L11.7929 4.29289C12.1834 4.68342 12.1834 5.31658 11.7929 5.70711L10.7071 6.79289C10.3166 7.18342 9.68342 7.18342 9.29289 6.79289L8.20711 5.70711C7.81658 5.31658 7.81658 4.68342 8.20711 4.29289L9.29289 3.20711Z" fill="white" />
    <path d="M9.29289 13.2071C9.68342 12.8166 10.3166 12.8166 10.7071 13.2071L11.7929 14.2929C12.1834 14.6834 12.1834 15.3166 11.7929 15.7071L10.7071 16.7929C10.3166 17.1834 9.68342 17.1834 9.29289 16.7929L8.20711 15.7071C7.81658 15.3166 7.81658 14.6834 8.20711 14.2929L9.29289 13.2071Z" fill="white" />
    <path d="M14.2929 8.20711C14.6834 7.81658 15.3166 7.81658 15.7071 8.20711L16.7929 9.29289C17.1834 9.68342 17.1834 10.3166 16.7929 10.7071L15.7071 11.7929C15.3166 12.1834 14.6834 12.1834 14.2929 11.7929L13.2071 10.7071C12.8166 10.3166 12.8166 9.68342 13.2071 9.29289L14.2929 8.20711Z" fill="white" />
    <path d="M4.29289 8.20711C4.68342 7.81658 5.31658 7.81658 5.70711 8.20711L6.79289 9.29289C7.18342 9.68342 7.18342 10.3166 6.79289 10.7071L5.70711 11.7929C5.31658 12.1834 4.68342 12.1834 4.29289 11.7929L3.20711 10.7071C2.81658 10.3166 2.81658 9.68342 3.20711 9.29289L4.29289 8.20711Z" fill="white" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.9987 13.3334C6.85524 13.3334 4.21993 14.6931 3.51637 16.5229C3.31817 17.0384 3.77975 17.5 4.33203 17.5H15.6654C16.2177 17.5 16.6792 17.0384 16.481 16.5229C15.7775 14.6931 13.1422 13.3334 9.9987 13.3334Z" fill="white" />
    <path d="M9.9987 10.8333C12.2999 10.8333 14.1654 8.96785 14.1654 6.66667C14.1654 4.36548 12.2999 2.5 9.9987 2.5C7.69751 2.5 5.83203 4.36548 5.83203 6.66667C5.83203 8.96785 7.69751 10.8333 9.9987 10.8333Z" fill="white" />
  </svg>
);

const SupportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3346 6.66663H16.668C17.1282 6.66663 17.5013 7.03972 17.5013 7.49996V16.6666L14.7236 14.359C14.5739 14.2347 14.3856 14.1666 14.191 14.1666H7.5013C7.04106 14.1666 6.66797 13.7935 6.66797 13.3333V10.8333" stroke="white" strokeLinejoin="round" />
    <path d="M12.5 3.33337H3.33333C2.8731 3.33337 2.5 3.70647 2.5 4.16671V13.3334L5.27774 11.0257C5.42736 10.9014 5.61574 10.8334 5.81025 10.8334H12.5C12.9602 10.8334 13.3333 10.4603 13.3333 10V4.16671C13.3333 3.70647 12.9602 3.33337 12.5 3.33337Z" fill="white" stroke="white" strokeLinejoin="round" />
  </svg>
);

type IconComponent = () => JSX.Element;

export default function NavBar({ t, currentTab, onTabChange, isVisible = true }: NavBarProps) {
  const tabs: { id: Tab; label: string; Icon: IconComponent }[] = [
    { id: "home", label: t.nav.home, Icon: HomeIcon },
    { id: "guide", label: t.nav.guide, Icon: GuideIcon },
    { id: "profile", label: t.nav.profile, Icon: ProfileIcon },
    { id: "support", label: t.nav.support, Icon: SupportIcon },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.id === currentTab);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: `translateX(-50%) translateY(${isVisible ? "0px" : "100px"})`,
        opacity: isVisible ? 1 : 0,
        width: "310px",
        height: "64px",
        background: "rgba(18, 20, 26, 0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "19px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 4px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        zIndex: 100,
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Sliding background pill */}
      {activeIndex !== -1 && (
        <div
          style={{
            position: "absolute",
            left: `${4 + activeIndex * 75.5}px`,
            width: "72px",
            height: "56px",
            background: "rgba(247, 246, 244, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: "17px",
            backdropFilter: "blur(76.3px)",
            WebkitBackdropFilter: "blur(76.3px)",
            transition: "left 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {tabs.map(({ id, label, Icon }) => {
        const active = currentTab === id;
        return (
          <button
            key={id}
            onClick={() => {
              if (currentTab !== id) {
                trackEvent("tab_switched", { from: currentTab, to: id });
              }
              onTabChange(id);
            }}
            style={{
              width: "72px",
              height: "56px",
              padding: "8px 2px",
              borderRadius: "17px",
              background: "transparent",
              border: "1px solid transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "all 0.2s ease",
              cursor: "pointer",
              outline: "none",
              zIndex: 1,
            }}
          >
            <Icon />
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "color 0.2s ease",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
