import React, { useState } from "react";
import { useFootprintPalette } from "../theme/ThemeProvider";
import type { TierDef } from "../theme/tierColors";
import { getTierStyle } from "../theme/tierColors";
import { TechGroup, type TechItem } from "./TechGroup";
import { LaserWipe } from "./LaserWipe";

export type TierGroupData = {
  label: string;
  items: TechItem[];
};

type TierCardProps = {
  tier: TierDef;
  summary: string;
  groups: TierGroupData[];
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

export const TierCard = ({
  tier,
  summary,
  groups,
  isLoading,
  error,
  onRetry,
}: TierCardProps) => {
  const palette = useFootprintPalette();
  const style = getTierStyle(tier, palette.mode);
  const [expanded, setExpanded] = useState(true);
  const isDark = palette.mode === "dark";

  const nonEmptyGroups = groups.filter((g) => g.items.length > 0);

  return (
    <div
      style={{
        position: "relative",
        background: palette.cardBg,
        border: `1px solid ${palette.cardBorder}`,
        borderLeft: `3px solid ${style.accent}`,
        borderRadius: 10,
        padding: "10px 12px 12px",
        boxShadow: isDark
          ? `${palette.cardShadow}, 0 0 20px ${style.glow}`
          : palette.cardShadow,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => {
          const next = !expanded;
          setExpanded(next);
          if (next && !expanded) onRetry?.();
        }}
        aria-expanded={expanded}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          width: "100%",
          marginBottom: expanded ? 10 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: palette.monoFont,
              color: style.accent,
              fontWeight: 700,
              letterSpacing: "1px",
              textShadow: isDark ? `0 0 6px ${style.glow}` : "none",
            }}
          >
            TIER {tier.number}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: palette.textPrimary,
              letterSpacing: "0.2px",
            }}
          >
            {tier.label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: palette.textSecondary,
              fontFamily: palette.monoFont,
              textAlign: "right",
            }}
          >
            {summary}
          </span>
          <span
            aria-hidden
            style={{
              color: style.accent,
              fontSize: 12,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 180ms ease",
              display: "inline-block",
              width: 12,
              textAlign: "center",
            }}
          >
            ▶
          </span>
        </div>
      </button>

      <LaserWipe
        color={`${style.accent}40`}
        active={isLoading && expanded && !error}
      />
      {expanded ? (
        <div>
          {error ? (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: palette.surfaceBg,
                border: `1px solid ${style.chipBorder}`,
                color: palette.textSecondary,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                title={error.message}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                Failed to load: {error.message.split(".")[0]}
              </span>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: `1px solid ${style.chipBorder}`,
                    color: style.chipText,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : isLoading && nonEmptyGroups.length === 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    background: palette.surfaceBg,
                    borderRadius: 8,
                    padding: "8px 10px",
                    height: 58,
                  }}
                >
                  <div
                    className="fp-shimmer"
                    style={{ height: 10, width: "40%", borderRadius: 3, marginBottom: 6 }}
                  />
                  <div
                    className="fp-shimmer"
                    style={{ height: 16, width: "100%", borderRadius: 999 }}
                  />
                </div>
              ))}
            </div>
          ) : nonEmptyGroups.length === 0 ? (
            <div
              style={{
                fontSize: 11,
                color: palette.textMuted,
                padding: "6px 2px",
                fontStyle: "italic",
              }}
            >
              No technologies detected in this layer.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {nonEmptyGroups.map((group, gi) => {
                const offset = nonEmptyGroups
                  .slice(0, gi)
                  .reduce((s, g) => s + g.items.length, 0);
                const n = group.items.length;
                const span = n > 30 ? 3 : n > 15 ? 2 : 1;
                const basis = `calc((100% - 40px) / 6 * ${span} + ${(span - 1) * 8}px)`;
                return (
                  <div
                    key={group.label}
                    style={{ flex: `0 0 ${basis}`, minWidth: 0 }}
                  >
                    <TechGroup
                      label={group.label}
                      items={group.items}
                      style={style}
                      indexOffset={offset}
                      isLoading={isLoading}
                      onReopen={onRetry}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
