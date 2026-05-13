import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";

type FootprintTileProps = {
  label: string;
  value: number | null;
  isLoading: boolean;
  accentColor: string;
  numberColor: string;
  icon: React.ReactNode;
};

export const FootprintTile = ({
  label,
  value,
  isLoading,
  accentColor,
  numberColor,
  icon,
}: FootprintTileProps) => {
  const palette = useFootprintPalette();

  return (
    <div
      style={{
        position: "relative",
        background: palette.cardBg,
        border: `1px solid ${palette.cardBorder}`,
        borderRadius: 12,
        padding: "14px 16px",
        overflow: "hidden",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.04) inset",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
      }}
    >
      {/* left accent bar */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 4,
          bottom: 4,
          width: 3,
          borderRadius: 2,
          background: accentColor,
        }}
      />

      {/* icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}44 100%)`,
          color: accentColor,
          flexShrink: 0,
          fontSize: 18,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: palette.monoFont,
            fontSize: 22,
            fontWeight: 700,
            color: numberColor,
            lineHeight: 1.1,
            animation: value !== null ? "fpCountUp 0.4s ease-out" : undefined,
          }}
        >
          {isLoading ? (
            <span
              className="fp-shimmer"
              style={{
                display: "inline-block",
                width: 60,
                height: 22,
                borderRadius: 4,
              }}
            />
          ) : value !== null ? (
            value.toLocaleString("en-US")
          ) : (
            "—"
          )}
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: palette.textMuted,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
