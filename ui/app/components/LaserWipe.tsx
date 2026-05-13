import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";

type LaserWipeProps = {
  color?: string;
  active?: boolean;
};

export const LaserWipe = ({ color, active = true }: LaserWipeProps) => {
  const palette = useFootprintPalette();
  if (!active) return null;
  const isDark = palette.mode === "dark";
  const base =
    color ??
    (isDark ? "rgba(84,200,233,0.40)" : "rgba(28,91,229,0.28)");
  // Bright crest is an alpha-boosted version of base (appended hex alpha or
  // fallback).
  const bright = isDark
    ? brightenAlpha(base, 0.75)
    : brightenAlpha(base, 0.55);
  return (
    <div
      className="fp-laser"
      aria-hidden
      style={{
        ["--fp-laser-color" as string]: base,
        ["--fp-laser-color-bright" as string]: bright,
      }}
    />
  );
};

function brightenAlpha(input: string, targetAlpha: number): string {
  // Accept #RRGGBB[AA] hex or rgba() strings; return an rgba() at targetAlpha.
  const hexMatch = input.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${targetAlpha})`;
  }
  const rgbaMatch = input.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/
  );
  if (rgbaMatch) {
    return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${targetAlpha})`;
  }
  return input;
}
