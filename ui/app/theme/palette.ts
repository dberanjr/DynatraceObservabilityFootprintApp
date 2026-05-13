export type ThemeMode = "light" | "dark";

export type Gradient = {
  from: string;
  to: string;
};

export type FootprintPalette = {
  mode: ThemeMode;
  pageBg: string;
  cardBg: string;
  surfaceBg: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sectionLabel: string;
  separator: string;
  cardBorder: string;
  accentStripe: Gradient;
  cardShadow: string;
  cardShadowHover: string;
  brand: {
    blue: string;
    blueAlt: string;
    blueLight: string;
    cyan: string;
    purple: string;
    purpleAlt: string;
    magenta: string;
    green: string;
    greenLime: string;
    pink: string;
  };
  row: {
    infrastructure: { accent: string; number: string };
    applications: { accent: string; number: string };
    kubernetes: { accent: string; number: string };
    dataVolume: { accent: string; number: string };
  };
  monoFont: string;
};

const BRAND = {
  blue: "#1C5BE5",
  blueAlt: "#4635D6",
  blueLight: "#1497FF",
  cyan: "#54C8E9",
  purple: "#B23BE4",
  purpleAlt: "#6C3AD6",
  magenta: "#E436FF",
  green: "#73BE28",
  greenLime: "#BDDF28",
  pink: "#FF5AA8",
};

const MONO =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

export const DARK_PALETTE: FootprintPalette = {
  mode: "dark",
  pageBg: "#060912",
  cardBg: "#0F172E",
  surfaceBg: "#162042",
  surfaceHover: "#1A2340",
  textPrimary: "#FFFFFF",
  textSecondary: "#A7B3D0",
  textMuted: "#64748B",
  sectionLabel: "#4E8BFF",
  separator: "#1F2A4D",
  cardBorder: "rgba(110,140,220,0.14)",
  accentStripe: { from: BRAND.blue, to: BRAND.magenta },
  cardShadow:
    "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.45)",
  cardShadowHover:
    "0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 32px rgba(28,91,229,0.18), 0 8px 24px rgba(0,0,0,0.55)",
  brand: BRAND,
  row: {
    infrastructure: { accent: "#6C3AD6", number: "#B23BE4" },
    applications: { accent: "#1C5BE5", number: "#54C8E9" },
    kubernetes: { accent: "#73BE28", number: "#BDDF28" },
    dataVolume: { accent: "#BDDF28", number: "#FFFFFF" },
  },
  monoFont: MONO,
};

export const LIGHT_PALETTE: FootprintPalette = {
  mode: "light",
  pageBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  surfaceBg: "#F1F5F9",
  surfaceHover: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  sectionLabel: BRAND.blue,
  separator: "#E2E8F0",
  cardBorder: "rgba(15,23,42,0.08)",
  accentStripe: { from: BRAND.blue, to: BRAND.magenta },
  cardShadow:
    "0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 18px rgba(15,23,42,0.08)",
  cardShadowHover:
    "0 1px 0 rgba(255,255,255,0.8) inset, 0 12px 28px rgba(28,91,229,0.14)",
  brand: BRAND,
  row: {
    infrastructure: { accent: "#6C3AD6", number: "#6C3AD6" },
    applications: { accent: "#1C5BE5", number: "#1C5BE5" },
    kubernetes: { accent: "#73BE28", number: "#3B6D11" },
    dataVolume: { accent: "#73BE28", number: "#0F172A" },
  },
  monoFont: MONO,
};

export const getPalette = (mode: ThemeMode): FootprintPalette =>
  mode === "dark" ? DARK_PALETTE : LIGHT_PALETTE;

export const nebulaBackground = (palette: FootprintPalette): string => {
  if (palette.mode === "dark") {
    return [
      "radial-gradient(1200px 320px at 5% 110%, rgba(178,59,228,0.28), transparent 60%)",
      "radial-gradient(1000px 320px at 95% 110%, rgba(28,91,229,0.28), transparent 60%)",
      "radial-gradient(600px 260px at 55% -40%, rgba(84,200,233,0.16), transparent 70%)",
      "radial-gradient(400px 220px at 20% -20%, rgba(228,54,255,0.12), transparent 65%)",
      `linear-gradient(180deg, ${palette.pageBg} 0%, ${palette.cardBg} 100%)`,
    ].join(", ");
  }
  return [
    "radial-gradient(800px 260px at 0% 120%, rgba(28,91,229,0.12), transparent 60%)",
    "radial-gradient(700px 260px at 100% 120%, rgba(178,59,228,0.10), transparent 60%)",
    `linear-gradient(180deg, ${palette.pageBg} 0%, #ECF1FA 100%)`,
  ].join(", ");
};
