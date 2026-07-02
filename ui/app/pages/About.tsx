import React from "react";

import { useFootprintPalette } from "../theme/ThemeProvider";
import { GlowCard } from "../components/GlowCard";
import {
  APP_VERSION,
  COMMIT_HASH,
  COMMIT_DATE,
} from "../generated/build-info";

const APP_NAME = "Dynatrace observability footprint app";
const AUTHOR = "David Beran";
const MAINTAINERS = "David Beran";
const EMAIL = "david.beran@dynatrace.com";
const DESCRIPTION =
  "See your entire Dynatrace observability footprint in one view.";
const GH_OWNER = "dberanjr";
const GH_REPO = "DynatraceObservabilityFootprintApp";
const REPO_LABEL = `github.com/${GH_OWNER}/${GH_REPO}`;
const REPO_URL = `https://${REPO_LABEL}`;
const ISSUE_URL = `${REPO_URL}/issues/new`;
const FEATURE_URL = `${REPO_URL}/issues/new?labels=enhancement`;

// Grail scopes the app relies on, with human-readable purposes.
const SCOPES: { name: string; desc: string }[] = [
  { name: "storage:entities:read", desc: "Smartscape topology and entity metadata" },
  { name: "storage:metrics:read", desc: "Host, service, and cloud resource metrics" },
  { name: "storage:events:read", desc: "Coverage and configuration events" },
  { name: "storage:logs:read", desc: "Log ingest volume by source" },
  { name: "storage:spans:read", desc: "Distributed trace and span coverage" },
  { name: "storage:bizevents:read", desc: "Business event ingestion checks" },
  { name: "storage:buckets:read", desc: "Grail bucket inventory for cost mapping" },
  {
    name: "environment-api:security-problems:read",
    desc: "Optional — security coverage tiles",
  },
];

function formatBuildDate(iso: string): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  const datePart = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(d);
  return `${datePart} · ${timePart}`;
}

export const About = () => {
  const palette = useFootprintPalette();
  const linkColor = palette.brand.blueLight;
  const scopeColor = palette.mode === "dark" ? "#7FD858" : "#3F8F1E";
  const buildDate = formatBuildDate(COMMIT_DATE);
  const year = (COMMIT_DATE ? new Date(COMMIT_DATE) : new Date()).getFullYear();

  const link = (href: string, label: React.ReactNode, external = false) => (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      style={{
        color: linkColor,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {label}
      {external ? <ExternalLinkIcon /> : null}
    </a>
  );

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "App", value: APP_NAME },
    {
      label: "Version",
      value: (
        <span style={{ fontFamily: palette.monoFont }}>v{APP_VERSION}</span>
      ),
    },
    {
      label: "Build",
      value: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>{buildDate}</span>
          <span style={{ color: palette.textMuted }}>·</span>
          <code
            style={{
              fontFamily: palette.monoFont,
              fontSize: 13,
              color: scopeColor,
              background:
                palette.mode === "dark"
                  ? "rgba(115,190,40,0.12)"
                  : "rgba(115,190,40,0.14)",
              border: `1px solid ${
                palette.mode === "dark"
                  ? "rgba(115,190,40,0.25)"
                  : "rgba(115,190,40,0.28)"
              }`,
              borderRadius: 6,
              padding: "1px 7px",
            }}
          >
            {COMMIT_HASH}
          </code>
        </span>
      ),
    },
    { label: "Author", value: AUTHOR },
    { label: "Maintainers", value: MAINTAINERS },
    { label: "Email", value: link(`mailto:${EMAIL}`, EMAIL) },
    { label: "Repository", value: link(REPO_URL, REPO_LABEL, true) },
    {
      label: "Support",
      value: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {link(ISSUE_URL, "Report an issue", true)}
          <span style={{ color: palette.textMuted }}>·</span>
          {link(FEATURE_URL, "Request a feature", true)}
        </span>
      ),
    },
    { label: "License", value: "Internal use only" },
    { label: "Environment", value: "Registered on your current Dynatrace tenant" },
    { label: "Description", value: DESCRIPTION },
  ];

  return (
    <div
      style={{
        padding: "16px 20px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        background: palette.pageBg,
        minHeight: "calc(100vh - 64px)",
        color: palette.textPrimary,
      }}
    >
      {/* ═══ Title row ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="./assets/app-icon.svg"
          alt={APP_NAME}
          width={44}
          height={44}
          style={{
            borderRadius: 11,
            boxShadow: "0 4px 14px rgba(28,91,229,0.35)",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: palette.textPrimary,
          }}
        >
          About
        </h1>
      </div>

      {/* ═══ Attribution card ═══ */}
      <GlowCard padding="24px 26px" style={{ maxWidth: 980 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "190px 1fr",
            rowGap: 2,
            columnGap: 16,
          }}
        >
          {rows.map((row) => (
            <React.Fragment key={row.label}>
              <div
                style={{
                  padding: "11px 0",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.3px",
                  textTransform: "uppercase",
                  color: palette.textMuted,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  padding: "11px 0",
                  fontSize: 15.5,
                  lineHeight: 1.5,
                  color: palette.textPrimary,
                }}
              >
                {row.value}
              </div>
            </React.Fragment>
          ))}
        </div>
      </GlowCard>

      {/* ═══ Grail permissions card ═══ */}
      <GlowCard
        accent={{ from: palette.brand.green, to: palette.brand.greenLime }}
        padding="20px 26px 24px"
        style={{ maxWidth: 980 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <ShieldIcon color={scopeColor} />
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            Grail permissions required
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
        >
          {SCOPES.map((scope) => (
            <div
              key={scope.name}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background:
                  palette.mode === "dark"
                    ? "rgba(115,190,40,0.06)"
                    : "rgba(115,190,40,0.08)",
                border: `1px solid ${
                  palette.mode === "dark"
                    ? "rgba(115,190,40,0.18)"
                    : "rgba(115,190,40,0.22)"
                }`,
              }}
            >
              <div
                style={{
                  fontFamily: palette.monoFont,
                  fontSize: 14,
                  fontWeight: 600,
                  color: scopeColor,
                  wordBreak: "break-word",
                }}
              >
                {scope.name}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: palette.textSecondary,
                }}
              >
                {scope.desc}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            margin: "18px 0 0",
            fontSize: 13,
            lineHeight: 1.5,
            color: palette.textMuted,
          }}
        >
          All scopes are read-only. Requested at install time via the platform
          token dialog; none permit write access to your environment.
        </p>
      </GlowCard>

      {/* ═══ Disclaimer callout ═══ */}
      <div
        style={{
          maxWidth: 980,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderRadius: 12,
          color: "#E8A33D",
          background:
            palette.mode === "dark"
              ? "rgba(224,160,48,0.10)"
              : "rgba(224,160,48,0.12)",
          border: "1px solid rgba(224,160,48,0.40)",
        }}
      >
        <WarningIcon />
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          Field developed, not supported by Dynatrace. Use at your own risk.
        </span>
      </div>

      {/* ═══ Footer block ═══ */}
      <div
        style={{
          maxWidth: 980,
          padding: "18px 22px",
          borderRadius: 12,
          background: palette.surfaceBg,
          border: `1px solid ${palette.cardBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13.5, color: palette.textSecondary }}>
          {APP_NAME}
          <br />
          Copyright {year} {AUTHOR}. All rights reserved.
        </div>
        <div style={{ fontSize: 13.5, color: palette.textMuted }}>
          This app queries Dynatrace Grail data within your tenant. No data
          leaves Dynatrace.
        </div>
      </div>
    </div>
  );
};

// ─── Inline icons ───────────────────────────────────────────────────

const ShieldIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.9 7.5 10 4.3-1.1 7.5-5.4 7.5-10v-6L12 2.5Z"
      stroke={color}
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="m8.8 12 2.2 2.2 4.2-4.4"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
    <path
      d="M12 3.2 1.8 20.5h20.4L12 3.2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="17.3" r="1.05" fill="currentColor" />
  </svg>
);
