import React, { useState } from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";
import type { TierStyle } from "../theme/tierColors";
import { TechChip } from "./TechChip";
import { LaserWipe } from "./LaserWipe";

export type TechItem = {
  label: string;
  count?: number | null;
  style?: TierStyle;
  dotColor?: string;
  isAI?: boolean;
};

type TechGroupProps = {
  label: string;
  items: TechItem[];
  style: TierStyle;
  indexOffset?: number;
  isLoading?: boolean;
  onReopen?: () => void;
};

export const TechGroup = ({
  label,
  items,
  style,
  indexOffset = 0,
  isLoading = false,
  onReopen,
}: TechGroupProps) => {
  const palette = useFootprintPalette();
  const [expanded, setExpanded] = useState(true);
  if (items.length === 0 && !isLoading) return null;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !expanded) onReopen?.();
  };

  return (
    <div
      style={{
        position: "relative",
        background: palette.surfaceBg,
        borderRadius: 8,
        padding: "6px 10px 8px",
        minWidth: 0,
        border: `1px solid ${palette.cardBorder}`,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
          width: "100%",
          marginBottom: expanded ? 6 : 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: palette.textSecondary,
            letterSpacing: "0.3px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
          <span
            style={{
              marginLeft: 6,
              color: palette.textMuted,
              fontFamily: palette.monoFont,
              fontSize: 9,
              fontWeight: 500,
            }}
          >
            {items.length}
          </span>
        </span>
        <span
          aria-hidden
          style={{
            color: style.accent,
            fontSize: 9,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
            display: "inline-block",
            width: 10,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          ▶
        </span>
      </button>
      {expanded ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            minWidth: 0,
          }}
        >
          {items.map((item, i) => (
            <TechChip
              key={`${label}-${item.label}`}
              label={item.label}
              count={item.count}
              style={item.style ?? style}
              dotColor={item.dotColor}
              isAI={item.isAI}
              index={indexOffset + i}
            />
          ))}
        </div>
      ) : null}
      <LaserWipe color={`${style.accent}55`} active={isLoading && expanded} />
    </div>
  );
};
