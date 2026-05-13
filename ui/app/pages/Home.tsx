import React from "react";

import { useFootprintPalette, useThemeToggle } from "../theme/ThemeProvider";
import { GlowCard } from "../components/GlowCard";
import { HeroBackdrop } from "../components/HeroBackdrop";
import { SectionLabel } from "../components/SectionLabel";
import { FootprintTile } from "../components/FootprintTile";
import { LaserWipe } from "../components/LaserWipe";
import {
  HostIcon,
  ProcessIcon,
  ContainerIcon,
  VmwareIcon,
  CloudIcon,
  ServiceIcon,
  LambdaIcon,
  QueueIcon,
  DatabaseIcon,
  CustomDeviceIcon,
  KubernetesIcon,
  NamespaceIcon,
  WebAppIcon,
  MobileIcon,
  TraceIcon,
  LogIcon,
  SmartscapeIcon,
  SyntheticIcon,
  MttrIcon,
} from "../components/FootprintIcons";
import {
  useFootprintData,
  formatBigNumber,
  formatTB,
  formatPBorTB,
  type TechEntry,
} from "../hooks/useFootprintData";
import {
  getEnvironmentUrl,
  getEnvironmentId,
  getAppVersion,
} from "@dynatrace-sdk/app-environment";

export const Home = () => {
  const palette = useFootprintPalette();
  const { mode, toggle } = useThemeToggle();
  const fp = useFootprintData();

  const [now] = React.useState(() => new Date());

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
    // SDK not ready yet during local dev
  }

  const showMttr =
    fp.mttr.qualifies &&
    fp.mttr.medianMttr !== null &&
    fp.mttr.medianMttr <= 120;

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: palette.pageBg,
        minHeight: "calc(100vh - 64px)",
        color: palette.textPrimary,
      }}
    >
      {/* ═══ HERO — compact title bar + MTTR ═══ */}
      <HeroBackdrop minHeight={0}>
        {/* Ambient glow orbs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -60,
            left: "10%",
            width: 260,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(228,54,255,0.3), transparent 70%)",
            animation: "fpGlowDrift 8s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -40,
            right: "15%",
            width: 220,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(28,91,229,0.3), transparent 70%)",
            animation: "fpGlowDrift2 10s ease-in-out infinite",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {/* Left: branding + env info */}
          <div
            className="fp-anim-section"
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="./assets/Dynatrace_Logo.svg"
                alt="Dynatrace"
                width={26}
                height={26}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: palette.textPrimary,
                }}
              >
                Total Observability Footprint
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

          {/* Right: MTTR badge */}
          {showMttr && fp.mttr.medianMttr !== null ? (
            <MttrBadge
              medianMttr={fp.mttr.medianMttr}
              problemCount={fp.mttr.problemCount}
              sparkline={fp.mttrSparkline.series}
              prevWeekMttr={fp.mttrPrevWeek.medianMttr}
            />
          ) : null}
        </div>
      </HeroBackdrop>

      {/* ═══ Three tile rows side by side ═══ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {/* INFRASTRUCTURE */}
        <GlowCard
          accent={{ from: palette.row.infrastructure.accent, to: palette.brand.purple }}
          padding={14}
          style={{ animationDelay: "0.06s" }}
        >
          <div
            className="fp-anim-section fp-anim-d1"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <SectionLabel color={palette.row.infrastructure.accent}>
              Infrastructure
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <CompactTile
                label="Hosts"
                value={fp.hosts.value}
                isLoading={fp.hosts.isLoading}
                color={palette.row.infrastructure.number}
                icon={<HostIcon />}
                delay={0}
              />
              <CompactTile
                label="Processes"
                value={fp.processes.value}
                isLoading={fp.processes.isLoading}
                color={palette.row.infrastructure.number}
                icon={<ProcessIcon />}
                delay={1}
              />
              <CompactTile
                label="Containers / Pods"
                value={fp.pods.value}
                isLoading={fp.pods.isLoading}
                color={palette.row.infrastructure.number}
                icon={<ContainerIcon />}
                delay={2}
              />
              {fp.vmware.value ? (
                <CompactTile
                  label="VMware VMs"
                  value={fp.vmware.value}
                  isLoading={fp.vmware.isLoading}
                  color={palette.row.infrastructure.number}
                  icon={<VmwareIcon />}
                  delay={3}
                />
              ) : null}
              <CompactTile
                label="Cloud Accounts"
                value={fp.cloudAccounts.value}
                isLoading={fp.cloudAccounts.isLoading}
                color={palette.row.infrastructure.number}
                icon={<CloudIcon />}
                delay={3}
              />
            </div>
          </div>
        </GlowCard>

        {/* APPLICATIONS & CLOUD */}
        <GlowCard
          accent={{ from: palette.row.applications.accent, to: palette.brand.cyan }}
          padding={14}
        >
          <div
            className="fp-anim-section fp-anim-d2"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <SectionLabel color={palette.row.applications.accent}>
              Applications & Cloud
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <CompactTile
                label="Services"
                value={fp.services.value}
                isLoading={fp.services.isLoading}
                color={palette.row.applications.number}
                icon={<ServiceIcon />}
                delay={1}
              />
              <CompactTile
                label="Lambda Functions"
                value={fp.lambdaFunctions.value}
                isLoading={fp.lambdaFunctions.isLoading}
                color={palette.row.applications.number}
                icon={<LambdaIcon />}
                delay={2}
              />
              <CompactTile
                label="Message Queues"
                value={fp.queues.value}
                isLoading={fp.queues.isLoading}
                color={palette.row.applications.number}
                icon={<QueueIcon />}
                delay={3}
              />
              <CompactTile
                label="Databases"
                value={fp.databases.value}
                isLoading={fp.databases.isLoading}
                color={palette.row.applications.number}
                icon={<DatabaseIcon />}
                delay={4}
              />
              <CompactTile
                label="Cloud Service Types"
                value={fp.customDeviceGroups.value}
                isLoading={fp.customDeviceGroups.isLoading}
                color={palette.row.applications.number}
                icon={<CustomDeviceIcon />}
                delay={5}
              />
            </div>
          </div>
        </GlowCard>

        {/* KUBERNETES & FRONTEND */}
        <GlowCard
          accent={{ from: palette.row.kubernetes.accent, to: palette.brand.greenLime }}
          padding={14}
        >
          <div
            className="fp-anim-section fp-anim-d3"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <SectionLabel color={palette.row.kubernetes.accent}>
              Kubernetes & Frontend
            </SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <CompactTile
                label="K8s Clusters"
                value={fp.k8sClusters.value}
                isLoading={fp.k8sClusters.isLoading}
                color={palette.row.kubernetes.number}
                icon={<KubernetesIcon />}
                delay={2}
              />
              <CompactTile
                label="K8s Workloads"
                value={fp.k8sWorkloads.value}
                isLoading={fp.k8sWorkloads.isLoading}
                color={palette.row.kubernetes.number}
                icon={<ContainerIcon />}
                delay={3}
              />
              <CompactTile
                label="K8s Namespaces"
                value={fp.k8sNamespaces.value}
                isLoading={fp.k8sNamespaces.isLoading}
                color={palette.row.kubernetes.number}
                icon={<NamespaceIcon />}
                delay={4}
              />
              <CompactTile
                label="RUM Web Apps"
                value={fp.webApps.value}
                isLoading={fp.webApps.isLoading}
                color={palette.row.kubernetes.number}
                icon={<WebAppIcon />}
                delay={5}
              />
              <CompactTile
                label="Mobile Apps"
                value={fp.mobileApps.value}
                isLoading={fp.mobileApps.isLoading}
                color={palette.row.kubernetes.number}
                icon={<MobileIcon />}
                delay={6}
              />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* ═══ DATA VOLUME — inline horizontal strip ═══ */}
      <div className="fp-anim-section fp-anim-d4">
        <GlowCard
          accent={{ from: palette.brand.greenLime, to: palette.brand.green }}
          padding={14}
          style={{
            background:
              palette.mode === "dark"
                ? "linear-gradient(135deg, #0A0E1C 0%, #0D1225 50%, #0A0E1C 100%)"
                : palette.cardBg,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <SectionLabel color={palette.row.dataVolume.accent}>
              Data Volume
            </SectionLabel>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              <InlineStat
                label="Daily Traces"
                value={fp.traceVolume.value !== null ? formatBigNumber(fp.traceVolume.value) : null}
                isLoading={fp.traceVolume.isLoading}
                icon={<TraceIcon />}
              />
              <InlineStat
                label="Log Ingest/day"
                value={fp.logIngest.valueTB !== null ? formatTB(fp.logIngest.valueTB) : null}
                isLoading={fp.logIngest.isLoading}
                icon={<LogIcon />}
              />
              <InlineStat
                label="Logs Retained"
                value={formatPBorTB(fp.logRetention.valuePB, fp.logRetention.valueTB)}
                isLoading={fp.logRetention.isLoading}
                icon={<LogIcon />}
              />
              <InlineStat
                label="Smartscape Deps"
                value={fp.smartscapeDeps.value !== null ? fp.smartscapeDeps.value.toLocaleString("en-US") : null}
                isLoading={fp.smartscapeDeps.isLoading}
                icon={<SmartscapeIcon />}
              />
              <InlineStat
                label="Synthetic Monitors"
                value={fp.syntheticMonitors.value !== null ? fp.syntheticMonitors.value.toLocaleString("en-US") : null}
                isLoading={fp.syntheticMonitors.isLoading}
                icon={<SyntheticIcon />}
              />
              <InlineStat
                label="Custom Devices"
                value={fp.customDevices.value !== null ? fp.customDevices.value.toLocaleString("en-US") : null}
                isLoading={fp.customDevices.isLoading}
                icon={<CustomDeviceIcon />}
              />
            </div>
          </div>
        </GlowCard>
      </div>

      {/* ═══ TECHNOLOGIES — single combined section ═══ */}
      {fp.allTechnologies.length > 0 ? (
        <div className="fp-anim-section fp-anim-d5">
          <GlowCard padding={14}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionLabel>Monitored Technologies</SectionLabel>
              <TechChipCloud technologies={fp.allTechnologies} />
            </div>
          </GlowCard>
        </div>
      ) : null}

      {/* ═══ PUNCHLINE BAR ═══ */}
      <div
        className="fp-anim-section fp-anim-d6"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 24px",
          borderRadius: 10,
          background: `linear-gradient(90deg, ${palette.brand.green} 0%, ${palette.brand.greenLime} 50%, ${palette.brand.green} 100%)`,
          backgroundSize: "200% 100%",
          animation: "fpPunchlineShine 6s linear infinite",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 12,
            color: "#0D0D1A",
            letterSpacing: "0.5px",
          }}
        >
          ONE PLATFORM.
        </span>
        <span style={{ fontSize: 11, color: "#1A1A2E" }}>
          Unified data. Automatic full-stack observability. Causal AI-powered
          root cause in seconds.
        </span>
      </div>

      {/* ═══ PLATFORM CAPABILITIES — compact single row ═══ */}
      <div
        className="fp-anim-section fp-anim-d7"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          flexWrap: "wrap",
          padding: "4px 0",
        }}
      >
        {PLATFORM_CAPABILITIES.map((cap) => (
          <div
            key={cap.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 8,
              background: palette.surfaceBg,
              border: `1px solid ${palette.cardBorder}`,
              fontSize: 11,
              fontWeight: 500,
              color: palette.textSecondary,
            }}
          >
            <span style={{ color: cap.gradient.from, fontSize: 13 }}>
              {cap.icon}
            </span>
            {cap.name}
          </div>
        ))}
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

// ─── Compact tile (vertical stack within a column card) ──────────────

const CompactTile = ({
  label,
  value,
  isLoading,
  color,
  icon,
  delay = 0,
}: {
  label: string;
  value: number | null;
  isLoading: boolean;
  color: string;
  icon: React.ReactNode;
  delay?: number;
}) => {
  const palette = useFootprintPalette();
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        borderRadius: 8,
        background: palette.surfaceBg,
        border: `1px solid ${palette.cardBorder}`,
        overflow: "hidden",
      }}
    >
      <LaserWipe color={`${color}55`} active={isLoading} />
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}18`,
          color,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: palette.textMuted,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      </div>
      <span
        style={{
          fontFamily: palette.monoFont,
          fontSize: 17,
          fontWeight: 700,
          color,
          lineHeight: 1,
          animation:
            value !== null ? `fpNumberPop 0.4s ease ${0.3 + delay * 0.06}s both` : undefined,
        }}
      >
        {isLoading ? (
          <span
            className="fp-shimmer"
            style={{
              display: "inline-block",
              width: 44,
              height: 16,
              borderRadius: 3,
            }}
          />
        ) : value !== null ? (
          value.toLocaleString("en-US")
        ) : (
          "—"
        )}
      </span>
    </div>
  );
};

// ─── Inline stat for the data volume strip ──────────────────────────

const InlineStat = ({
  label,
  value,
  isLoading,
  icon,
}: {
  label: string;
  value: string | null;
  isLoading: boolean;
  icon: React.ReactNode;
}) => {
  const palette = useFootprintPalette();
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <LaserWipe
        color={`${palette.row.dataVolume.accent}55`}
        active={isLoading}
      />
      <span style={{ color: palette.row.dataVolume.accent, fontSize: 14 }}>
        {icon}
      </span>
      <span
        style={{
          fontFamily: palette.monoFont,
          fontSize: 15,
          fontWeight: 700,
          color: palette.textPrimary,
          lineHeight: 1,
        }}
      >
        {isLoading ? "..." : value ?? "—"}
      </span>
      <span
        style={{
          fontSize: 9,
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          color: palette.textMuted,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Technology chip cloud with staggered entrance ──────────────────

const CATEGORY_STYLES = {
  runtime: {
    bg: (dark: boolean) =>
      dark ? "rgba(178,59,228,0.14)" : "rgba(178,59,228,0.08)",
    border: (dark: boolean) =>
      dark ? "rgba(178,59,228,0.25)" : "rgba(178,59,228,0.15)",
    color: "#B23BE4",
  },
  cloud: {
    bg: (dark: boolean) =>
      dark ? "rgba(28,91,229,0.14)" : "rgba(28,91,229,0.08)",
    border: (dark: boolean) =>
      dark ? "rgba(84,200,233,0.2)" : "rgba(28,91,229,0.12)",
    color: "#54C8E9",
  },
};

const TechChipCloud = ({ technologies }: { technologies: TechEntry[] }) => {
  const palette = useFootprintPalette();
  const isDark = palette.mode === "dark";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {technologies.map((tech, i) => {
        const s = CATEGORY_STYLES[tech.category];
        return (
          <span
            key={`${tech.category}-${tech.name}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: s.bg(isDark),
              color: s.color,
              border: `1px solid ${s.border(isDark)}`,
              animation: `fpChipIn 0.3s ease ${0.3 + i * 0.02}s both`,
            }}
          >
            {tech.name}
            {tech.count > 0 ? (
              <span
                style={{
                  fontFamily: palette.monoFont,
                  fontSize: 9,
                  color: palette.textMuted,
                  fontWeight: 400,
                }}
              >
                {tech.count.toLocaleString("en-US")}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

// ─── MTTR badge with sparkline + trend ──────────────────────────────

const MttrBadge = ({
  medianMttr,
  problemCount,
  sparkline,
  prevWeekMttr,
}: {
  medianMttr: number;
  problemCount: number;
  sparkline: number[];
  prevWeekMttr: number | null;
}) => {
  const palette = useFootprintPalette();

  let trendPct: number | null = null;
  let trendDirection: "improved" | "degraded" | "flat" = "flat";
  if (prevWeekMttr !== null && prevWeekMttr > 0) {
    trendPct = ((medianMttr - prevWeekMttr) / prevWeekMttr) * 100;
    if (trendPct < -5) trendDirection = "improved";
    else if (trendPct > 5) trendDirection = "degraded";
  }

  const trendColor =
    trendDirection === "improved"
      ? palette.brand.green
      : trendDirection === "degraded"
        ? "#E24B4A"
        : palette.textMuted;

  const trendArrow =
    trendDirection === "improved"
      ? "\u2193"
      : trendDirection === "degraded"
        ? "\u2191"
        : "\u2192";

  return (
    <div
      className="fp-anim-section fp-anim-d1"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "10px 16px",
        borderRadius: 12,
        background:
          palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(228,54,255,0.10) 0%, rgba(84,200,233,0.10) 100%)"
            : "linear-gradient(135deg, rgba(228,54,255,0.06) 0%, rgba(84,200,233,0.06) 100%)",
        border: `1px solid ${
          palette.mode === "dark"
            ? "rgba(228,54,255,0.25)"
            : "rgba(228,54,255,0.12)"
        }`,
        backdropFilter: "blur(6px)",
        minWidth: 180,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #E436FF22, #54C8E922)",
            color: palette.brand.magenta,
            flexShrink: 0,
          }}
        >
          <MttrIcon />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span
            style={{
              fontSize: 8,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: palette.textMuted,
              fontWeight: 600,
            }}
          >
            Median MTTR (7d)
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: palette.monoFont,
                fontSize: 20,
                fontWeight: 700,
                color: palette.brand.magenta,
                lineHeight: 1,
                animation: "fpNumberPop 0.5s ease 0.2s both",
              }}
            >
              {Math.round(medianMttr)} min
            </span>
            {trendPct !== null ? (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: trendColor,
                  fontFamily: palette.monoFont,
                }}
              >
                {trendArrow} {Math.abs(Math.round(trendPct))}%
              </span>
            ) : null}
          </div>
          <span style={{ fontSize: 9, color: palette.textSecondary }}>
            {problemCount} resolved
          </span>
        </div>
      </div>
      {sparkline.length > 0 ? (
        <SparkChart data={sparkline} color={palette.brand.magenta} height={28} />
      ) : null}
    </div>
  );
};

const SparkChart = ({
  data,
  color,
  height = 28,
}: {
  data: number[];
  color: string;
  height?: number;
}) => {
  const filtered = data.filter((v) => v > 0);
  if (filtered.length < 2) return null;

  const max = Math.max(...filtered);
  const min = Math.min(...filtered);
  const range = max - min || 1;
  const w = 200;
  const pad = 2;

  const points = filtered.map((v, i) => {
    const x = pad + (i / (filtered.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const fillPath = `${linePath} L${w - pad},${height - pad} L${pad},${height - pad} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", opacity: 0.9 }}
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#spark-fill)" />
      <path
        className="fp-spark-line"
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Platform capabilities (compact) ────────────────────────────────

const PLATFORM_CAPABILITIES = [
  { name: "Infrastructure", gradient: { from: "#6C3AD6", to: "#B23BE4" }, icon: <HostIcon /> },
  { name: "Application", gradient: { from: "#1C5BE5", to: "#54C8E9" }, icon: <ServiceIcon /> },
  { name: "AI/LLM", gradient: { from: "#E436FF", to: "#B23BE4" }, icon: <SmartscapeIcon /> },
  { name: "Digital Experience", gradient: { from: "#54C8E9", to: "#1497FF" }, icon: <WebAppIcon /> },
  { name: "Log Analytics", gradient: { from: "#1497FF", to: "#1C5BE5" }, icon: <LogIcon /> },
  { name: "Security", gradient: { from: "#73BE28", to: "#BDDF28" }, icon: <KubernetesIcon /> },
  { name: "Business", gradient: { from: "#4635D6", to: "#6C3AD6" }, icon: <TraceIcon /> },
  { name: "Delivery", gradient: { from: "#BDDF28", to: "#73BE28" }, icon: <ContainerIcon /> },
];
