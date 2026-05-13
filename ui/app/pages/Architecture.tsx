import React from "react";
import { useFootprintPalette, useThemeToggle } from "../theme/ThemeProvider";
import { TIERS, getTierStyle } from "../theme/tierColors";
import { TierCard } from "../components/TierCard";
import { TechChip } from "../components/TechChip";
import { LaserWipe } from "../components/LaserWipe";
import {
  useTier1,
  useTier2,
  useTier3,
  useTier4,
  useTier5,
  useTier6,
  useTier7,
  useSummaryStrip,
} from "../hooks/useArchitectureData";
import {
  getEnvironmentUrl,
  getEnvironmentId,
  getAppVersion,
} from "@dynatrace-sdk/app-environment";

export const Architecture = () => {
  const palette = useFootprintPalette();
  const { mode, toggle } = useThemeToggle();

  const tier1 = useTier1();
  const tier2 = useTier2();
  const tier3 = useTier3();
  const tier4 = useTier4();
  const tier5 = useTier5();
  const tier6 = useTier6();
  const tier7 = useTier7();
  const summary = useSummaryStrip();

  const tiers = [
    { def: TIERS[0], result: tier1 },
    { def: TIERS[1], result: tier2 },
    { def: TIERS[2], result: tier3 },
    { def: TIERS[3], result: tier4 },
    { def: TIERS[4], result: tier5 },
    { def: TIERS[5], result: tier6 },
    { def: TIERS[6], result: tier7 },
  ];

  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const today = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nowTime = now.toLocaleTimeString("en-US", { hour12: false });

  let envUrl = "";
  let envId = "";
  let appVersion = "";
  try {
    envUrl = getEnvironmentUrl();
    envId = getEnvironmentId();
    appVersion = getAppVersion();
  } catch {
    // SDK unavailable during local dev
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: palette.pageBg,
        minHeight: "calc(100vh - 64px)",
        color: palette.textPrimary,
      }}
    >
      {/* Header */}
      <div
        className="fp-anim-section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          padding: "4px 2px 6px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="./assets/Dynatrace_Logo.svg"
              alt="Dynatrace"
              width={24}
              height={24}
            />
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: palette.textPrimary,
              }}
            >
              Observability Architecture
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              fontFamily: palette.monoFont,
              fontSize: 10.5,
              color: palette.textMuted,
            }}
          >
            <span>
              Live data as of {today}{" "}
              <span style={{ color: palette.brand.cyan }}>{nowTime}</span>
            </span>
            {envUrl ? (
              <>
                <span style={{ color: palette.separator }}>|</span>
                <span style={{ color: palette.brand.cyan, fontWeight: 500 }}>
                  {envUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </>
            ) : null}
            {envId ? (
              <>
                <span style={{ color: palette.separator }}>|</span>
                <span>{envId}</span>
              </>
            ) : null}
            <button
              onClick={toggle}
              style={{
                background: palette.surfaceBg,
                border: `1px solid ${palette.cardBorder}`,
                borderRadius: 6,
                padding: "2px 8px",
                color: palette.textSecondary,
                fontSize: 10,
                cursor: "pointer",
                marginLeft: 2,
              }}
            >
              {mode === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: palette.textSecondary,
            fontFamily: palette.monoFont,
            textAlign: "right",
          }}
        >
          7 architecture layers · top-to-bottom
        </div>
      </div>

      {/* Tier cards */}
      {tiers.map((t, i) => (
        <div
          key={t.def.key}
          className={`fp-anim-section fp-anim-d${Math.min(i + 1, 7)}`}
        >
          <TierCard
            tier={t.def}
            summary={t.result.summary}
            groups={t.result.groups}
            isLoading={t.result.isLoading}
            error={t.result.error ?? null}
            onRetry={t.result.refetch}
          />
        </div>
      ))}

      {/* Summary strip */}
      <div
        className="fp-anim-section fp-anim-d7"
        style={{
          position: "relative",
          marginTop: 4,
          padding: "10px 12px",
          borderRadius: 10,
          background: palette.cardBg,
          border: `1px solid ${palette.cardBorder}`,
          boxShadow: palette.cardShadow,
          overflow: "hidden",
        }}
      >
        <LaserWipe active={summary.isLoading} />
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: palette.sectionLabel,
            marginBottom: 8,
          }}
        >
          Footprint summary
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          {summary.stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                background: palette.surfaceBg,
                borderRadius: 8,
                padding: "8px 10px",
                border: `1px solid ${palette.cardBorder}`,
              }}
            >
              <div
                style={{
                  fontFamily: palette.monoFont,
                  fontSize: 18,
                  fontWeight: 700,
                  color: palette.textPrimary,
                  lineHeight: 1.15,
                  animation: `fpNumberPop 0.4s ease ${0.1 + i * 0.04}s both`,
                }}
              >
                {summary.isLoading ? (
                  <span
                    className="fp-shimmer"
                    style={{
                      display: "inline-block",
                      width: 60,
                      height: 16,
                      borderRadius: 3,
                    }}
                  />
                ) : (
                  s.value
                )}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: palette.textMuted,
                  marginTop: 2,
                  letterSpacing: "0.3px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI legend */}
      <div
        className="fp-anim-section fp-anim-d7"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "6px 10px",
          fontSize: 10.5,
          color: palette.textSecondary,
          fontFamily: palette.monoFont,
        }}
      >
        <span style={{ color: palette.textMuted, letterSpacing: "0.4px" }}>
          Legend:
        </span>
        <TechChip
          label="AI / ML technology"
          style={getTierStyle(TIERS[1], palette.mode)}
          isAI
        />
        <span style={{ color: palette.textMuted }}>
          = solid-fill pill indicates an AI or ML component
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "2px 0 8px",
          fontSize: 10,
          color: palette.textMuted,
          fontFamily: palette.monoFont,
        }}
      >
        Powered by Dynatrace Intelligence | Grail | Smartscape | OneAgent
        {appVersion ? (
          <>
            {" | "}
            <span style={{ color: palette.textSecondary }}>v{appVersion}</span>
          </>
        ) : null}
      </div>
    </div>
  );
};
