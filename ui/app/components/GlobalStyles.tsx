import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";

export const GlobalStyles = () => {
  const palette = useFootprintPalette();
  const css = `
    html, body, #root {
      background: ${palette.pageBg};
      color: ${palette.textPrimary};
    }
    body { margin: 0; }
    .fp-glow-card.fp-interactive { cursor: pointer; }
    .fp-glow-card.fp-interactive:hover {
      border-color: rgba(110,140,220,0.32);
      box-shadow: ${palette.cardShadowHover};
      transform: translateY(-1px);
    }
    @keyframes fpPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes fpCountUp {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fpShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .fp-shimmer {
      background: linear-gradient(90deg,
        ${palette.surfaceBg} 25%,
        ${palette.surfaceHover} 50%,
        ${palette.surfaceBg} 75%);
      background-size: 200% 100%;
      animation: fpShimmer 1.5s ease infinite;
    }
    /* ── staggered entrance for sections ── */
    @keyframes fpFadeSlideIn {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fp-anim-section {
      animation: fpFadeSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }
    .fp-anim-d1 { animation-delay: 0.06s; }
    .fp-anim-d2 { animation-delay: 0.12s; }
    .fp-anim-d3 { animation-delay: 0.18s; }
    .fp-anim-d4 { animation-delay: 0.24s; }
    .fp-anim-d5 { animation-delay: 0.30s; }
    .fp-anim-d6 { animation-delay: 0.36s; }
    .fp-anim-d7 { animation-delay: 0.42s; }
    /* ── ambient glow drift on hero ── */
    @keyframes fpGlowDrift {
      0%   { transform: translate(0, 0) scale(1); opacity: 0.28; }
      33%  { transform: translate(30px, -20px) scale(1.1); opacity: 0.22; }
      66%  { transform: translate(-20px, 15px) scale(0.95); opacity: 0.32; }
      100% { transform: translate(0, 0) scale(1); opacity: 0.28; }
    }
    @keyframes fpGlowDrift2 {
      0%   { transform: translate(0, 0) scale(1); opacity: 0.24; }
      50%  { transform: translate(-35px, 25px) scale(1.15); opacity: 0.18; }
      100% { transform: translate(0, 0) scale(1); opacity: 0.24; }
    }
    /* ── sparkline draw-in ── */
    @keyframes fpDrawLine {
      from { stroke-dashoffset: 600; }
      to   { stroke-dashoffset: 0; }
    }
    .fp-spark-line {
      stroke-dasharray: 600;
      animation: fpDrawLine 1.2s ease-out 0.3s both;
    }
    /* ── tech chip stagger ── */
    @keyframes fpChipIn {
      from { opacity: 0; transform: scale(0.85) translateY(4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    /* ── number count pop ── */
    @keyframes fpNumberPop {
      0%   { opacity: 0; transform: scale(0.7); }
      60%  { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    /* ── loading laser wipe ── */
    @keyframes fpLaserWipe {
      0%   { transform: translateX(-60%); opacity: 0; }
      8%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { transform: translateX(260%); opacity: 0; }
    }
    .fp-laser {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      border-radius: inherit;
      z-index: 2;
    }
    .fp-laser::before,
    .fp-laser::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 45%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--fp-laser-color, rgba(255,255,255,0.18)) 45%,
        var(--fp-laser-color-bright, rgba(255,255,255,0.35)) 50%,
        var(--fp-laser-color, rgba(255,255,255,0.18)) 55%,
        transparent 100%);
      filter: blur(0.6px);
      animation: fpLaserWipe 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .fp-laser::after {
      animation-delay: 0.45s;
      opacity: 0.5;
    }
    /* ── punchline shimmer ── */
    @keyframes fpPunchlineShine {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: ${palette.surfaceBg};
      border-radius: 8px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${palette.surfaceHover};
    }
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};
