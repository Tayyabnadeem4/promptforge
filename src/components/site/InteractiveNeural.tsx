"use client";

import { useEffect, useRef } from "react";

/**
 * An interactive neural-network canvas: particles drift and link to nearby
 * neighbours, and reach toward the mouse cursor (with a gentle attraction).
 * Pointer events pass through (we track the mouse on window), so it never
 * blocks clicks. Respects prefers-reduced-motion (renders a single static frame).
 */
export default function InteractiveNeural() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number };
    let particles: P[] = [];

    const LINK_DIST = 130;
    const MOUSE_DIST = 190;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.max(24, Math.floor((w * h) / 15000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // gentle pull toward the cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_DIST && d > 0.001) {
          p.x += (dx / d) * 0.35;
          p.y += (dy / d) * 0.35;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx!.strokeStyle = `rgba(124,92,255,${(1 - d / LINK_DIST) * 0.28})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        // thread to the cursor
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE_DIST) {
          ctx!.strokeStyle = `rgba(84,227,255,${(1 - dm / MOUSE_DIST) * 0.5})`;
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
        // node
        ctx!.fillStyle = "rgba(157,134,255,0.9)";
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // glow at the cursor
      if (mouse.x > -9000) {
        const g = ctx!.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          MOUSE_DIST,
        );
        g.addColorStop(0, "rgba(84,227,255,0.10)");
        g.addColorStop(1, "rgba(84,227,255,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    }

    const onResize = () => resize();
    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    draw();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
    />
  );
}
