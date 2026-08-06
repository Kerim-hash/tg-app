"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
}

interface ParticleGlobeProps {
  className?: string;
  width?: number;
  height?: number;
}

export function ParticleGlobe({ className, width = 766, height = 735 }: ParticleGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const count = 380;
    const radius = Math.min(width, height) * 0.3;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        px: 0,
        py: 0
      });
    }

    const angleY = 0.0035;
    const angleX = 0.0015;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        const perspective = 500 / (500 + z2);
        p.px = width / 2 + x1 * perspective;
        p.py = height / 2 + y2 * perspective;

        const depthSize = ((p.z + radius) / (radius * 2)) * 2 + 0.8;
        const depthOpacity = ((p.z + radius) / (radius * 2)) * 0.45 + 0.15;

        ctx.fillStyle = `rgba(255, 255, 255, ${depthOpacity})`;
        ctx.fillRect(p.px, p.py, depthSize, depthSize);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height]);

  return <canvas ref={canvasRef} className={className} />;
}
