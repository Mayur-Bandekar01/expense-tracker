"use client";

import React from "react";

export function LoginIllustration({ className = "w-full max-w-[350px]" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center py-6 sm:py-8 select-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Self-contained GPU-composited 3D Keyframes (Zero JS overhead) */}
      <style>{`
        @keyframes ppCardFloat3D {
          0%, 100% {
            transform: rotateX(15deg) rotateY(-18deg) rotateZ(2deg) translate3d(0, 0px, 0);
          }
          50% {
            transform: rotateX(7deg) rotateY(-6deg) rotateZ(-1.5deg) translate3d(0, -10px, 12px);
          }
        }
        @keyframes ppFloatTopRight {
          0%, 100% {
            transform: translateZ(46px) translateY(0px);
          }
          50% {
            transform: translateZ(56px) translateY(-7px);
          }
        }
        @keyframes ppFloatBottomLeft {
          0%, 100% {
            transform: translateZ(38px) translateY(0px);
          }
          50% {
            transform: translateZ(48px) translateY(6px);
          }
        }
        @keyframes ppFloatCoin {
          0%, 100% {
            transform: translateZ(58px) translateY(0px) rotateY(0deg);
          }
          50% {
            transform: translateZ(68px) translateY(-8px) rotateY(18deg);
          }
        }
        @keyframes ppHoloSweep {
          0% {
            transform: translateX(-160%) skewX(-25deg);
          }
          45%, 100% {
            transform: translateX(260%) skewX(-25deg);
          }
        }
        @keyframes ppPulseWave {
          0% {
            stroke-dashoffset: 240;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -240;
          }
        }
        @keyframes ppOrbitSpin {
          0% {
            transform: translateZ(-35px) rotateX(68deg) rotateZ(0deg);
          }
          100% {
            transform: translateZ(-35px) rotateX(68deg) rotateZ(360deg);
          }
        }
        @keyframes ppShadowBreath {
          0%, 100% {
            transform: translateZ(-32px) translateY(16px) scale(1);
            opacity: 0.45;
          }
          50% {
            transform: translateZ(-32px) translateY(24px) scale(0.92);
            opacity: 0.28;
          }
        }
        .pp-scene-3d {
          transform-style: preserve-3d;
          animation: ppCardFloat3D 6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform;
        }
        .pp-badge-tr {
          animation: ppFloatTopRight 4.5s ease-in-out infinite;
          will-change: transform;
        }
        .pp-badge-bl {
          animation: ppFloatBottomLeft 5.2s ease-in-out infinite;
          will-change: transform;
        }
        .pp-coin-tl {
          animation: ppFloatCoin 4s ease-in-out infinite;
          will-change: transform;
        }
        .pp-holo-beam {
          animation: ppHoloSweep 5s ease-in-out infinite;
          will-change: transform;
        }
        .pp-wave-line {
          stroke-dasharray: 240;
          animation: ppPulseWave 4s linear infinite;
        }
        .pp-orbit-ring {
          animation: ppOrbitSpin 18s linear infinite;
          will-change: transform;
        }
        .pp-shadow-plate {
          animation: ppShadowBreath 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-scene-3d,
          .pp-badge-tr,
          .pp-badge-bl,
          .pp-coin-tl,
          .pp-holo-beam,
          .pp-wave-line,
          .pp-orbit-ring,
          .pp-shadow-plate {
            animation: none !important;
          }
        }
      `}</style>

      {/* Ambient Backlight Aura */}
      <div className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 blur-2xl pointer-events-none" />

      {/* 3D Animated Scene Container */}
      <div className="pp-scene-3d relative w-full max-w-[285px] sm:max-w-[305px] h-[205px] sm:h-[225px]">
        {/* 0. 3D Orbiting Gyro Ring Behind Card */}
        <div className="pp-orbit-ring absolute -inset-6 rounded-full border border-dashed border-indigo-400/40 dark:border-indigo-400/30 pointer-events-none" />

        {/* 1. Dynamic Breathing 3D Shadow Plate */}
        <div className="pp-shadow-plate absolute inset-3 rounded-3xl bg-indigo-950/40 dark:bg-black/80 blur-md pointer-events-none" />

        {/* 2. Main 3D Metallic Paisa Pulse Vault Card */}
        <div
          className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between text-white overflow-hidden border border-white/30 dark:border-indigo-400/35"
          style={{
            background: "linear-gradient(135deg, #2e1065 0%, #4338ca 48%, #6366f1 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -2px 6px rgba(15,23,42,0.55), 0 18px 32px -8px rgba(49,46,129,0.55), -5px 6px 0 rgba(30,27,75,0.95)",
            transform: "translateZ(0px)",
          }}
        >
          {/* Animated Holographic Foil Light Sweep */}
          <div className="pp-holo-beam absolute inset-y-0 -left-10 w-20 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          {/* Top Row: 3D Gold EMV Chip + Brand Title */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_2px_4px_rgba(0,0,0,0.35)] border border-amber-300/70 flex flex-col justify-between">
                <div className="w-full h-[1px] bg-amber-900/40" />
                <div className="w-full h-[1px] bg-amber-900/40" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-100/90 font-semibold">
                Paisa Pulse · 3D
              </span>
            </div>

            {/* Contactless / Live Signal Waves */}
            <svg
              className="w-4 h-4 text-indigo-200/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0"
              />
            </svg>
          </div>

          {/* Center Row: Net Balance + Animated Live ECG Pulse Line */}
          <div className="relative z-10 flex items-end justify-between gap-2 my-1">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-indigo-200/90 block font-medium">
                Net Available Balance
              </span>
              <div className="text-2xl sm:text-[26px] font-extrabold tracking-tight font-mono mt-0.5 drop-shadow-sm">
                ₹1,42,850<span className="text-xs text-indigo-200">.00</span>
              </div>
            </div>

            {/* Animated Live Pulse Waveform SVG */}
            <svg className="w-20 h-9 overflow-visible shrink-0" viewBox="0 0 100 36" fill="none">
              <path
                d="M2 24 L22 24 L32 10 L44 30 L56 6 L68 24 L98 24"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="pp-wave-line"
                d="M2 24 L22 24 L32 10 L44 30 L56 6 L68 24 L98 24"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Bottom Row: Card Footer & Live Sync Status */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-indigo-100/90 pt-2 border-t border-white/15">
            <span className="font-mono tracking-wider">•••• 2026</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
              Live Sync
            </span>
          </div>
        </div>

        {/* 3. Floating Top-Left 3D Gold Rupee Orb (Z: +58px) */}
        <div className="pp-coin-tl absolute -top-4 -left-3 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border border-white/70 shadow-[inset_0_1px_1px_#fff,0_10px_20px_-3px_rgba(245,158,11,0.5),0_2px_0_#b45309] flex items-center justify-center text-amber-950 font-extrabold text-lg">
          ₹
        </div>

        {/* 4. Floating Top-Right 3D Pill: UPI Inflow Alert (Z: +46px) */}
        <div className="pp-badge-tr absolute -top-3 -right-3 sm:-right-5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_#fff,0_14px_26px_-4px_rgba(15,23,42,0.22),0_2px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_14px_26px_-4px_rgba(0,0,0,0.75)] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            ↓
          </div>
          <div className="leading-tight">
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">
              +₹24,500
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block">
              UPI Auto-Parsed
            </span>
          </div>
        </div>

        {/* 5. Floating Bottom-Left 3D Pill: Mochi Budget Shield (Z: +38px) */}
        <div className="pp-badge-bl absolute -bottom-4 -left-2 sm:-left-4 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_#fff,0_14px_26px_-4px_rgba(15,23,42,0.22),0_2px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_14px_26px_-4px_rgba(0,0,0,0.75)] w-44">
          <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <span>🍡</span> Budget Shield
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono">64%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[1px] shadow-inner">
            <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginIllustration;
