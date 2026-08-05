"use client";

import React, { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";

export function ScrambleText({ text, className, style, delay = 0 }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Periodically scramble the text
    const interval = setInterval(() => {
      triggerScramble();
    }, 8000 + Math.random() * 4000); // Scramble every 8-12s

    // Trigger initial scramble after delay
    const initialTimeout = setTimeout(() => {
      triggerScramble();
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, delay]);

  const triggerScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = 12;

    if (timerRef.current) clearInterval(timerRef.current);

    // Phase 1: Scramble to random characters
    timerRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((char) => {
            if (char === " " || char === "\n") return char;
            // Increase randomness as iterations go on
            if (Math.random() < iteration / maxIterations) {
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            return char;
          })
          .join("")
      );

      iteration++;
      if (iteration > maxIterations) {
        if (timerRef.current) clearInterval(timerRef.current);

        // Keep scrambled for a brief moment, then decrypt
        setTimeout(() => {
          decrypt();
        }, 1200);
      }
    }, 45);
  };

  const decrypt = () => {
    let iteration = 0;
    const maxIterations = 15;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((char) => {
            if (char === " " || char === "\n") return char;
            // Gradually resolve back to original text
            if (Math.random() < iteration / maxIterations) {
              return char;
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration++;
      if (iteration > maxIterations) {
        if (timerRef.current) clearInterval(timerRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 50);
  };

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={() => triggerScramble()}
    >
      {displayText}
    </span>
  );
}
