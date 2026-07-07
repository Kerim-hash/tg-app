"use client";

import React, { useState } from "react";
import type { HapticType } from "./types";

interface SwipeSliderProps {
  onComplete: () => void;
  text: string;
  triggerHaptic: (type: HapticType) => void;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export default function SwipeSlider({
  onComplete,
  text,
  triggerHaptic,
}: SwipeSliderProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic("success");

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2; // double size to ensure it covers the button completely
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now() + Math.random(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Complete the step action after ripple animation peak
    setTimeout(() => {
      onComplete();
    }, 280);
  };

  const handleRippleEnd = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes material-ripple {
            0% {
              transform: scale(0);
              opacity: 0.35;
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          .ripple-container {
            position: relative;
            overflow: hidden;
          }
          .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            pointer-events: none;
            transform-origin: center;
            animation: material-ripple 500ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          }
        `
      }} />
      <button
        onClick={handleClick}
        className="ripple-container w-full h-[56px] rounded-xl bg-[#6C63FF] hover:bg-[#5B52EE] active:bg-[#4E45DE] text-white font-mono text-[14px] font-bold tracking-wider flex items-center justify-center cursor-pointer border-none outline-none select-none transition-colors duration-250 ease-in-out shadow-lg shadow-[#6C63FF]/20"
      >
        {text}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple-effect"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            onAnimationEnd={() => handleRippleEnd(ripple.id)}
          />
        ))}
      </button>
    </div>
  );
}
