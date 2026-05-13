import React from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";
import type { TierStyle } from "../theme/tierColors";

type TechChipProps = {
  label: string;
  count?: number | null;
  style: TierStyle;
  index?: number;
  dotColor?: string;
  isAI?: boolean;
};

export const TechChip = ({
  label,
  count,
  style,
  index = 0,
  dotColor,
  isAI = false,
}: TechChipProps) => {
  const palette = useFootprintPalette();
  const isDark = palette.mode === "dark";
  const showBadge = typeof count === "number" && count > 0;

  // AI chips: solid tier-color fill with contrasting text.
  const bg = isAI ? style.badgeBg : style.chipBg;
  const text = isAI ? style.badgeText : style.chipText;
  const border = isAI ? style.badgeBg : style.chipBorder;
  const dot = dotColor ?? (isAI ? style.badgeText : style.dotColor);

  return (
    <span
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: showBadge ? "2px 4px 2px 9px" : "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: isAI ? 700 : 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        background: bg,
        color: text,
        border: `1px solid ${border}`,
        boxShadow: isDark
          ? isAI
            ? `0 0 10px ${style.glow}`
            : `0 0 6px ${style.glow}, inset 0 0 4px ${style.glow}`
          : "none",
        animation: `fpChipIn 0.28s ease ${0.04 + index * 0.015}s both`,
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dot,
          boxShadow: isDark ? `0 0 5px ${dot}` : "none",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
          flex: "0 1 auto",
        }}
      >
        {label}
      </span>
      {showBadge ? (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "1px 7px",
            borderRadius: 999,
            background: isAI ? style.chipText : style.badgeBg,
            color: isAI ? style.badgeBg : style.badgeText,
            fontFamily: palette.monoFont,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: 1.4,
            flexShrink: 0,
          }}
        >
          {formatCount(count as number)}
        </span>
      ) : null}
    </span>
  );
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}
