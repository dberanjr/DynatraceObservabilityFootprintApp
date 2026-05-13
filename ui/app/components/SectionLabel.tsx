import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";

type SectionLabelProps = {
  children: React.ReactNode;
  color?: string;
  underline?: boolean;
};

export const SectionLabel = ({
  children,
  color,
  underline = false,
}: SectionLabelProps) => {
  const palette = useFootprintPalette();
  const c = color ?? palette.sectionLabel;
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 4,
        color: c,
        textTransform: "uppercase",
        letterSpacing: "1.6px",
        fontSize: 10.5,
        fontWeight: 700,
      }}
    >
      <span>{children}</span>
      {underline ? (
        <span
          aria-hidden
          style={{
            width: 28,
            height: 2,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${palette.accentStripe.from} 0%, ${palette.accentStripe.to} 100%)`,
          }}
        />
      ) : null}
    </span>
  );
};
