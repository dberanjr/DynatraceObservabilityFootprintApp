import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";
import type { Gradient } from "../theme/palette";

type GlowCardProps = {
  children: React.ReactNode;
  accent?: Gradient;
  padding?: number | string;
  interactive?: boolean;
  style?: React.CSSProperties;
};

export const GlowCard = ({
  children,
  accent,
  padding = 16,
  interactive = false,
  style,
}: GlowCardProps) => {
  const palette = useFootprintPalette();
  const stripe = accent ?? palette.accentStripe;
  return (
    <div
      className={interactive ? "fp-glow-card fp-interactive" : "fp-glow-card"}
      style={{
        position: "relative",
        background: palette.cardBg,
        border: `1px solid ${palette.cardBorder}`,
        borderRadius: 14,
        padding,
        boxShadow: palette.cardShadow,
        overflow: "hidden",
        transition:
          "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${stripe.from} 0%, ${stripe.to} 100%)`,
          opacity: 0.9,
        }}
      />
      {children}
    </div>
  );
};
