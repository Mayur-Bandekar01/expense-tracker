"use client";

import React from "react";

export function LoginIllustration({ className = "w-full max-w-[340px]" }: { className?: string }) {
  return (
    <div
      className={`relative flex items-center justify-center py-4 sm:py-6 select-none ${className}`}
      style={{ perspective: "1100px" }}
    >
      {/* Ambient 3D Backlight Glow */}
      <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 blur-2xl pointer-events-none" />

      {/* 3D Tilted Scene Container */}
      <div
        className="relative w-full max-w-[290px] sm:max-w-[310px] h-[210px] sm:h-[235px] transition-transform duration-500 ease-out hover:scale-[1.02]"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(14deg) rotateY(-16deg) rotateZ(3deg)",
        }}
      >
        {/* 1. Back Shadow Plate (Depth Base) */}
        <div
          className="absolute inset-3 rounded-3xl bg-indigo-950/25 dark:bg-black/60 blur-md"
          style={{ transform: "translateZ(-28px) translateY(14px)" }}
        />

        {/* 2. Main 3D Metallic Paisa Pulse Vault Card */}
        <div
          className="absolute inset-0 rounded-3xl p-5 flex flex-col justify-between text-white overflow-hidden border border-white/25 dark:border-indigo-400/30"
          style={{
            background: "linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -2px 6px rgba(15,23,42,0.5), 0 20px 35px -10px rgba(49,46,129,0.55), -4px 6px 0 rgba(30,27,75,0.95)",
            transform: "translateZ(0px)",
          }}
        >
          {/* Specular Light Reflection Diagonal */}
          <div
            className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-white/10 blur-xl pointer-events-none"
          />

          {/* Top Row: Chip & Contactless + Brand */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* 3D Gold EMV Chip */}
              <div className="w-9 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.3)] border border-amber-300/60 flex flex-col justify-between">
                <div className="w-full h-[1px] bg-amber-800/40" />
                <div className="w-full h-[1px] bg-amber-800/40" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-100/90 font-semibold">
                Paisa Pulse · Vault
              </span>
            </div>

            <span className="w-7 h-7 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-sm font-bold shadow-sm">
              ₹
            </span>
          </div>

          {/* Center Balance Readout */}
          <div className="relative z-10 my-1">
            <span className="text-[10px] uppercase tracking-wider text-indigo-200/90 block font-medium">
              Net Available Balance
            </span>
            <div className="text-2xl sm:text-[26px] font-extrabold tracking-tight font-mono mt-0.5 drop-shadow-sm">
              ₹1,42,850<span className="text-sm text-indigo-200">.00</span>
            </div>
          </div>

          {/* Bottom Row: Status & Sync Pill */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-indigo-100/90 pt-2 border-t border-white/15">
            <span className="font-mono tracking-wider">•••• 2026</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              Cloud Synced
            </span>
          </div>
        </div>

        {/* 3. Floating Front-Right 3D Pill: UPI Inflow Alert (Z: +36px) */}
        <div
          className="absolute -top-3 -right-3 sm:-right-5 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_#fff,0_12px_24px_-4px_rgba(15,23,42,0.22),0_2px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_24px_-4px_rgba(0,0,0,0.7)] flex items-center gap-2"
          style={{ transform: "translateZ(36px)" }}
        >
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

        {/* 4. Floating Bottom-Left 3D Pill: Budget Health (Z: +28px) */}
        <div
          className="absolute -bottom-3 -left-2 sm:-left-4 px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_0_#fff,0_12px_24px_-4px_rgba(15,23,42,0.2),0_2px_0_rgba(15,23,42,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_24px_-4px_rgba(0,0,0,0.7)] w-44"
          style={{ transform: "translateZ(28px)" }}
        >
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
