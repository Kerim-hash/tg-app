"use client";

import React, { useState, useEffect, useRef } from "react";

import type { HapticType } from "./types";

interface SwipeSliderProps {
  onComplete: () => void;
  text: string;
  triggerHaptic: (type: HapticType) => void;
}

export default function SwipeSlider({
  onComplete,
  text,
  triggerHaptic,
}: SwipeSliderProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startXRef.current = clientX - dragX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const maxDrag = containerWidth - 50 - 12; // container width - handle width - padding (6px left, 6px right)
    let newX = clientX - startXRef.current;
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;
    setDragX(newX);
  };

  const handleEnd = () => {
    if (!isDragging || !containerRef.current) return;
    setIsDragging(false);
    const containerWidth = containerRef.current.clientWidth;
    const maxDrag = containerWidth - 50 - 12;
    if (dragX >= maxDrag * 0.9) {
      setDragX(maxDrag);
      triggerHaptic("success");
      onComplete();
    } else {
      setDragX(0);
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const handleGlobalEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMove);
      window.addEventListener("mouseup", handleGlobalEnd);
      window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
      window.addEventListener("touchend", handleGlobalEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMove);
      window.removeEventListener("mouseup", handleGlobalEnd);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging, dragX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[56px] rounded-xl bg-[#2A2A2C] flex items-center justify-center overflow-hidden select-none box-border"
    >
      <span className="font-mono text-[12px] text-white/60 pointer-events-none ml-6">
        {text}
      </span>

      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => {
          if (e.cancelable) {
            e.preventDefault();
          }
          if (e.touches[0]) handleStart(e.touches[0].clientX);
        }}
        style={{
          left: `calc(6px + ${dragX}px)`,
          transition: isDragging ? "none" : "left 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute top-2 w-[50px] h-[40px] rounded-xl bg-white flex items-center justify-center cursor-grab z-10"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.83333 12.0202L11.6667 6.18685L5.83333 0.353516M11.6667 6.18685L0 6.18685" stroke="black" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
