"use client";

import React from "react";

export function LoginIllustration({ className = "w-full max-w-[380px] h-auto" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 520 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="blobGrad" x1="0" y1="0" x2="520" y2="440" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F1F5FD" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="jacketGrad" x1="160" y1="180" x2="320" y2="340" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          <linearGradient id="cardGrad" x1="280" y1="210" x2="330" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>

          <linearGradient id="goldCoin" x1="390" y1="170" x2="420" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1E293B" floodOpacity="0.06" />
          </filter>
        </defs>

        {/* Ambient background decorative elements */}
        <ellipse cx="260" cy="380" rx="200" ry="24" fill="#E2E8F0" fillOpacity="0.4" />
        <circle cx="260" cy="220" r="170" fill="url(#blobGrad)" />
        <circle cx="130" cy="120" r="12" fill="#E0E7FF" fillOpacity="0.6" />
        <circle cx="410" cy="110" r="8" fill="#DDD6FE" fillOpacity="0.7" />

        {/* ── TOP-LEFT FLOATING CARD: Line Chart ────────────────────────── */}
        <g filter="url(#cardShadow)">
          <rect x="80" y="110" width="108" height="74" rx="14" fill="#FFFFFF" />
          <circle cx="98" cy="124" r="3" fill="#E2E8F0" />
          <circle cx="108" cy="124" r="3" fill="#E2E8F0" />
          <circle cx="118" cy="124" r="3" fill="#E2E8F0" />

          {/* Grid lines */}
          <line x1="94" y1="145" x2="174" y2="145" stroke="#F1F5F9" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="94" y1="162" x2="174" y2="162" stroke="#F1F5F9" strokeWidth="1.5" />

          {/* Trend line */}
          <path
            d="M96 160 Q112 152 126 154 T150 138 T172 130"
            fill="none"
            stroke="#818CF8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="172" cy="130" r="4" fill="#6366F1" />
          <circle cx="126" cy="154" r="3" fill="#818CF8" />
        </g>

        {/* ── TOP-RIGHT FLOATING CARD: Bar Chart with Magnifier ────────── */}
        <g filter="url(#cardShadow)">
          <rect x="330" y="96" width="102" height="78" rx="14" fill="#FFFFFF" />
          {/* 3 Columns */}
          <rect x="348" y="132" width="12" height="30" rx="4" fill="#E2E8F0" />
          <rect x="366" y="120" width="12" height="42" rx="4" fill="#CBD5E1" />
          <rect x="384" y="112" width="12" height="50" rx="4" fill="#818CF8" />
          <rect x="402" y="126" width="12" height="36" rx="4" fill="#C7D2FE" />

          {/* Magnifier icon overlay */}
          <circle cx="395" cy="122" r="10" stroke="#6366F1" strokeWidth="2.5" fill="none" />
          <line x1="402" y1="129" x2="410" y2="137" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* ── FLOATING DONUT CHART (Center-Left) ────────────────────────── */}
        <g filter="url(#cardShadow)">
          <circle cx="288" cy="192" r="24" fill="#FFFFFF" />
          {/* Segments */}
          <circle
            cx="288"
            cy="192"
            r="16"
            fill="none"
            stroke="#E0E7FF"
            strokeWidth="7"
          />
          <circle
            cx="288"
            cy="192"
            r="16"
            fill="none"
            stroke="#818CF8"
            strokeWidth="7"
            strokeDasharray="40 100"
            strokeDashoffset="10"
          />
          <circle
            cx="288"
            cy="192"
            r="16"
            fill="none"
            stroke="#F472B6"
            strokeWidth="7"
            strokeDasharray="25 100"
            strokeDashoffset="55"
          />
          <circle
            cx="288"
            cy="192"
            r="16"
            fill="none"
            stroke="#34D399"
            strokeWidth="7"
            strokeDasharray="20 100"
            strokeDashoffset="82"
          />
        </g>

        {/* ── FLOATING COIN ACCENT ─────────────────────────────────────── */}
        <g filter="url(#cardShadow)">
          <circle cx="398" cy="188" r="14" fill="url(#goldCoin)" />
          <circle cx="398" cy="188" r="10" stroke="#FDE68A" strokeWidth="1.5" fill="none" />
          <path d="M398 182v12M395 186h6" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── CHARACTER ILLUSTRATION ───────────────────────────────────── */}
        {/* Head & Hair */}
        <g>
          {/* Neck */}
          <rect x="254" y="162" width="16" height="18" rx="4" fill="#FBCFE8" />

          {/* Face */}
          <ellipse cx="262" cy="154" rx="18" ry="20" fill="#FEE2E2" />
          {/* Ear */}
          <ellipse cx="244" cy="154" rx="4" ry="6" fill="#FECDD3" />

          {/* Hair */}
          <path
            d="M245 152 C243 140 250 130 264 128 C278 126 284 134 283 144 C276 138 266 139 258 142 C252 144 248 148 245 152 Z"
            fill="#334155"
          />
          <path
            d="M246 142 C250 134 260 130 270 132 C276 133 282 138 281 146 C274 142 265 142 258 145 Z"
            fill="#1E293B"
          />

          {/* Facial features: closed calm smile & eyelid */}
          <path d="M256 154 Q260 156 264 154" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M260 162 Q264 165 268 162" stroke="#E11D48" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>

        {/* Torso & Inner Shirt */}
        <path d="M244 176 L280 176 L286 230 L238 230 Z" fill="#F8FAFC" />

        {/* Violet Cardigan / Oversized Jacket */}
        {/* Left Side (Viewer's left) */}
        <path
          d="M244 176 C230 180 216 195 212 216 L216 262 C226 262 236 250 242 238 L246 192 Z"
          fill="url(#jacketGrad)"
        />
        {/* Right Side */}
        <path
          d="M280 176 C294 180 308 195 312 216 L308 262 C298 262 288 250 282 238 L278 192 Z"
          fill="url(#jacketGrad)"
        />
        {/* Back collar */}
        <path d="M244 176 Q262 186 280 176 L278 190 Q262 198 246 190 Z" fill="#6366F1" />

        {/* Left Arm holding card sheet */}
        <path
          d="M216 216 Q200 242 222 256 Q246 254 260 236 L254 226 Q240 240 228 238 Q222 232 228 220 Z"
          fill="url(#jacketGrad)"
        />
        {/* Left Hand */}
        <ellipse cx="264" cy="232" rx="7" ry="6" fill="#FEE2E2" />

        {/* Right Arm extending forward */}
        <path
          d="M308 216 Q326 238 316 252 Q302 254 286 240 L292 230 Q302 240 310 236 Q314 230 306 220 Z"
          fill="url(#jacketGrad)"
        />
        {/* Right Hand holding credit card */}
        <ellipse cx="282" cy="236" rx="7" ry="6" fill="#FEE2E2" />

        {/* Credit Card in Hand */}
        <g transform="rotate(-12 290 228)" filter="url(#cardShadow)">
          <rect x="270" y="216" width="46" height="30" rx="5" fill="url(#cardGrad)" />
          <rect x="274" y="222" width="10" height="8" rx="2" fill="#FDE68A" />
          <line x1="274" y1="236" x2="306" y2="236" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
          <circle cx="304" cy="226" r="4" fill="#F43F5E" fillOpacity="0.8" />
          <circle cx="300" cy="226" r="4" fill="#F59E0B" fillOpacity="0.8" />
        </g>

        {/* Crossed Legs (Trousers - Cream/Khaki) */}
        {/* Pelvis/Lap */}
        <path d="M232 230 L292 230 L308 270 L216 270 Z" fill="#E2E8F0" />

        {/* Left Folded Leg */}
        <path
          d="M216 266 C194 274 180 300 186 314 C192 328 220 324 246 312 L254 284 C236 288 222 278 216 266 Z"
          fill="#F1F5F9"
        />

        {/* Right Folded Leg */}
        <path
          d="M308 266 C332 276 348 300 342 316 C334 330 304 324 276 310 L268 282 C288 288 302 278 308 266 Z"
          fill="#E2E8F0"
        />

        {/* Shoes (Blue Sneakers with White Soles) */}
        {/* Left Shoe */}
        <g>
          <path d="M230 312 Q238 322 248 324 L244 332 Q232 332 222 322 Z" fill="#3B82F6" />
          <path d="M222 322 Q232 332 244 332 L242 335 Q230 335 220 325 Z" fill="#FFFFFF" />
        </g>

        {/* Right Shoe */}
        <g>
          <path d="M292 312 Q284 322 274 324 L278 332 Q290 332 300 322 Z" fill="#3B82F6" />
          <path d="M300 322 Q290 332 278 332 L280 335 Q292 335 302 325 Z" fill="#FFFFFF" />
        </g>

        {/* Floating Financial Document in front */}
        <g filter="url(#cardShadow)" transform="rotate(4 240 248)">
          <rect x="220" y="240" width="48" height="34" rx="6" fill="#FFFFFF" />
          <line x1="226" y1="248" x2="256" y2="248" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="226" y1="254" x2="260" y2="254" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="226" y1="260" x2="248" y2="260" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="260" cy="263" r="3" fill="#10B981" />
        </g>
      </svg>
    </div>
  );
}
