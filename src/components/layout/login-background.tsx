"use client";

import { useEffect, useState } from "react";

/** Animated login-page backdrop — replaces the old static background-image SVG.
 *
 * Rendered as inline SVG (not `background-image: url(...)`) specifically so the animations
 * below actually play: CSS/SMIL animation inside an SVG loaded as a background-image is
 * unreliable across browsers (Safari in particular won't run it at all), whereas inline SVG
 * animates everywhere.
 *
 * Theme is deliberately hospital/medical, not generic "AI product" — a cardiac-monitor style
 * heartbeat line (the single most recognizable medical motif) sweeping continuously, a
 * synchronized pulse dot riding the same path, and a couple of faint static medical-cross
 * watermarks. Colors are the app's own --primary/--secondary brand tokens, not hardcoded hex.
 */
export function LoginBackground() {
  const heartbeatPath =
    "M -100,500 L 520,500 L 560,500 L 580,460 L 600,560 L 620,420 L 645,650 L 670,500 L 720,500 " +
    "L 760,500 L 780,460 L 800,560 L 820,420 L 845,650 L 870,500 L 920,500 L 1700,500";

  // The CSS @keyframes below already respect prefers-reduced-motion, but the pulse dot rides the
  // path via SMIL <animateMotion>, which CSS's `animation` property (and so that media query)
  // has no power over — so it's skipped from the markup entirely instead when the preference is
  // set, rather than left silently ignoring it.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);
    const onChange = () => setReduceMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="loginWash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(2 70% 96%)" />
          <stop offset="45%" stopColor="hsl(210 20% 98%)" />
          <stop offset="100%" stopColor="hsl(177 60% 95%)" />
        </linearGradient>
        <radialGradient id="loginBlobPrimary" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(2 58% 46%)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="hsl(2 58% 46%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="loginBlobSecondary" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(177 100% 24%)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="hsl(177 100% 24%)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="loginSweep" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(2 58% 46%)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="hsl(177 100% 24%)" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes ecgSweep {
          to { stroke-dashoffset: -3180; }
        }
        .ecg-highlight {
          stroke-dasharray: 180 3000;
          animation: ecgSweep 4.5s linear infinite;
        }
        @keyframes pulseBeat {
          0%, 100% { r: 6; opacity: 0.9; }
          50% { r: 9; opacity: 1; }
        }
        .ecg-dot {
          animation: pulseBeat 1.1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ecg-highlight, .ecg-dot { animation: none !important; }
        }
      `}</style>

      <rect width="1600" height="1000" fill="url(#loginWash)" />

      {/* broad soft brand-gradient sweep across the top, for a more "designed" feel than a flat wash */}
      <path d="M-100,180 C300,60 900,320 1700,120 L1700,-100 L-100,-100 Z" fill="url(#loginSweep)" />

      {/* soft ambient color blobs, corner-anchored so the centered login card sits in calm space */}
      <circle cx="90" cy="120" r="540" fill="url(#loginBlobPrimary)" />
      <circle cx="1520" cy="900" r="580" fill="url(#loginBlobSecondary)" />
      <circle cx="1450" cy="60" r="300" fill="url(#loginBlobPrimary)" />
      <circle cx="60" cy="940" r="260" fill="url(#loginBlobSecondary)" />

      {/* faint medical-cross watermarks, corner-anchored, static — a quiet "this is a hospital
          product" cue that doesn't compete with the animated heartbeat line below */}
      <g fill="hsl(2 58% 46%)" opacity="0.05">
        <path d="M1310 700 h60 v90 h90 v60 h-90 v90 h-60 v-90 h-90 v-60 h90 z" transform="rotate(-10 1360 805)" />
      </g>
      <g fill="hsl(177 100% 24%)" opacity="0.05">
        <path d="M120 60 h50 v75 h75 v50 h-75 v75 h-50 v-75 h-75 v-50 h75 z" transform="rotate(12 145 147)" />
      </g>

      {/* cardiac-monitor heartbeat line — the dim baseline is always visible; a brighter segment
          continuously sweeps along it, plus a pulse dot riding the same path, like a live vitals
          monitor. This is the page's one clearly "hospital/doctor" animated element. */}
      <g opacity="0.9">
        <path d={heartbeatPath} fill="none" stroke="hsl(2 58% 46%)" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={heartbeatPath}
          fill="none"
          stroke="hsl(2 58% 46%)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-highlight"
        />
        <circle r="6" fill="hsl(2 58% 46%)" className={reduceMotion ? "" : "ecg-dot"}>
          {!reduceMotion && <animateMotion dur="4.5s" repeatCount="indefinite" path={heartbeatPath} />}
        </circle>
      </g>
    </svg>
  );
}
