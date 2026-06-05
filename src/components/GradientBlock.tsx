"use client";

import React, { useState, useRef } from "react";

interface GradientBlockProps {
  label: string;
  primaryColor: string; // e.g. #FF82C9
  secondaryColor: string; // e.g. #5D1C89
  baseColor?: string; // center dark color
  animationSpeed?: number; // in seconds
  glowIntensity?: number; // 0.1 to 1.5
  borderGlow?: boolean;
  enableMouseTracking?: boolean;
  animate?: boolean;
  height?: number | string;
  width?: number | string;
  children?: React.ReactNode; // custom content rendered inside the card
  contentAlign?: "center" | "bottom" | "start"; // default "bottom" for label, "center" for children
  borderRadius?: string;
  solidGradient?: string; // custom solid background gradient (e.g. "linear-gradient(to bottom, #5B1C86, #76CFF1)")
  enableHoverScale?: boolean;
  padding?: string;
  absoluteChildren?: boolean;
}

export default function GradientBlock({
  label,
  primaryColor,
  secondaryColor,
  baseColor = "#0B1020", // Obsidian Black
  animationSpeed = 8,
  glowIntensity = 1,
  borderGlow = true,
  enableMouseTracking = true,
  animate = true,
  height = 320,
  width = "100%",
  children,
  contentAlign,
  borderRadius = "20px",
  solidGradient,
  enableHoverScale = true,
  padding,
  absoluteChildren = false,
}: GradientBlockProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableMouseTracking || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset mouse pos to center smoothly
    setMousePos({ x: 50, y: 50 });
  };

  // Inline animations style using CSS variables
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: width,
    height: height,
    borderRadius: borderRadius, // IGuard VPN cards radius
    display: "flex",
    flexDirection: "column",
    justifyContent: children
      ? contentAlign === "bottom" ? "flex-end" : "center"
      : "flex-end",
    padding: padding || "24px",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease",
    boxShadow: (enableHoverScale && isHovered)
      ? `0 12px 40px rgba(11, 16, 32, 0.5), 0 0 30px rgba(${hexToRgb(secondaryColor)}, ${solidGradient ? 0.4 : 0.2})`
      : (solidGradient 
          ? `0 8px 24px rgba(11, 16, 32, 0.3), 0 0 15px rgba(${hexToRgb(secondaryColor)}, 0.15)`
          : "0 8px 24px rgba(11, 16, 32, 0.4)"),
    transform: (enableHoverScale && isHovered) ? "scale(1.03) translateY(-4px)" : "scale(1)",
    backgroundColor: baseColor,
    border: solidGradient
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : (borderGlow 
          ? `1px solid rgba(255, 255, 255, 0.08)` 
          : "1px solid rgba(255, 255, 255, 0.03)"),
  };

  // Hex to RGB helper for transparent shadows
  function hexToRgb(hex: string) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "93, 28, 137";
  }

  // Animation configuration
  const driftAnimStyle: React.CSSProperties = animate ? {
    animation: `drift ${animationSpeed}s ease-in-out infinite alternate`,
  } : {};

  return (
    <div
      ref={cardRef}
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group select-none"
    >
      {/* Dynamic Keyframes injected locally */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drift {
          0% {
            transform: translate(-5%, -5%) scale(1);
          }
          50% {
            transform: translate(5%, 5%) scale(1.1);
          }
          100% {
            transform: translate(-3%, 3%) scale(0.95);
          }
        }
      `}} />

      {/* Layer 1: Base Dark Ambient Color */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: baseColor,
          zIndex: 1,
        }}
      />

      {/* Layer 2: Main Animated & Interactive Glow (Behind dark center mask) */}
      <div
        style={{
          position: "absolute",
          inset: solidGradient ? 0 : "-20%", // wider than container to hide edges when shifting
          zIndex: 2,
          opacity: solidGradient ? 1 : (isHovered ? 0.95 : 0.85),
          transition: "opacity 0.4s ease",
          background: solidGradient || `
            radial-gradient(
              circle at ${mousePos.x}% ${mousePos.y}%, 
              rgba(${hexToRgb(primaryColor)}, ${0.8 * glowIntensity}) 0%, 
              rgba(${hexToRgb(secondaryColor)}, ${0.5 * glowIntensity}) 40%, 
              transparent 75%
            )
          `,
          ...(!solidGradient ? driftAnimStyle : {})
        }}
      />

      {/* Layer 3: Top Ambient Edge Light for realism */}
      {!solidGradient && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            zIndex: 3,
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% -20%, rgba(${hexToRgb(primaryColor)}, ${0.75 * glowIntensity}) 0%, transparent 80%)`,
            opacity: isHovered ? 0.95 : 0.75,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* Layer 4: Inset Shadows to create that beautiful internal edge lighting */}
      {!solidGradient && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            borderRadius: borderRadius,
            pointerEvents: "none",
            boxShadow: `
              inset 0 0 50px rgba(0, 0, 0, 0.5),
              inset 0 0 35px rgba(${hexToRgb(secondaryColor)}, ${0.6 * glowIntensity}),
              inset 0 25px 45px rgba(${hexToRgb(primaryColor)}, ${0.8 * glowIntensity}),
              inset 0 -25px 45px rgba(${hexToRgb(secondaryColor)}, ${0.5 * glowIntensity})
            `,
            transition: "all 0.4s ease",
          }}
        />
      )}

      {/* Layer 5: Dark center core for high contrast with the edges */}
      {!solidGradient && (
        <div
          style={{
            position: "absolute",
            inset: "16px",
            zIndex: 5,
            borderRadius: `calc(${borderRadius} - 8px)`,
            pointerEvents: "none",
            backgroundColor: baseColor,
            opacity: 0.85,
            filter: "blur(12px)",
            boxShadow: "0 0 30px rgba(11, 16, 32, 0.95) inset",
            transform: (enableHoverScale && isHovered) ? "scale(0.98)" : "scale(1)",
            transition: "transform 0.4s ease",
          }}
        />
      )}

      {/* Layer 6: Subtle border beam effect (a rotating glow line visible at the border) */}
      {!solidGradient && borderGlow && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            borderRadius: borderRadius,
            pointerEvents: "none",
            border: "1.5px solid transparent",
            background: `linear-gradient(to bottom right, rgba(${hexToRgb(primaryColor)}, 0.4), rgba(${hexToRgb(secondaryColor)}, 0.1), rgba(255,255,255,0.05), rgba(${hexToRgb(primaryColor)}, 0.3)) border-box`,
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
            opacity: isHovered ? 1 : 0.6,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* Layer 7: Content — children override the default label */}
      {children ? (
        absoluteChildren ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
            }}
          >
            {children}
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: contentAlign === "center" ? "center" : contentAlign === "bottom" ? "flex-end" : "flex-start",
            }}
          >
            {children}
          </div>
        )
      ) : (
        label ? (
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              width: "100%",
              alignItems: contentAlign === "center" ? "center" : contentAlign === "bottom" ? "flex-end" : "flex-start",
            }}
          >
            <div 
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#F4F7FB",
                fontFamily: "var(--font-onest), sans-serif",
                textShadow: "0 2px 10px rgba(11,16,32,0.5)",
                transition: "transform 0.3s ease, color 0.3s ease",
              }}
              className="group-hover:translate-x-1 group-hover:text-white"
            >
              {label}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}
