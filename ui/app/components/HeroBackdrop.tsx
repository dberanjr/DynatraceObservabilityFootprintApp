import React from "react";
import { nebulaBackground } from "../theme/palette";
import { useFootprintPalette } from "../theme/ThemeProvider";

type HeroBackdropProps = {
  children: React.ReactNode;
  minHeight?: number | string;
};

export const HeroBackdrop = ({
  children,
  minHeight = 180,
}: HeroBackdropProps) => {
  const palette = useFootprintPalette();
  return (
    <section
      style={{
        position: "relative",
        padding: "16px 20px 14px",
        borderRadius: 18,
        minHeight,
        overflow: "hidden",
        background: nebulaBackground(palette),
        border: `1px solid ${palette.cardBorder}`,
        boxShadow: palette.cardShadow,
      }}
    >
      {/* dot-grid particle texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(110,140,220,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.35), transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 40%, rgba(0,0,0,0.35), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </section>
  );
};
