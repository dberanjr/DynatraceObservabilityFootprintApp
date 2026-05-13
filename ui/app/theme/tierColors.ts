import type { ThemeMode } from "./palette";

export type TierKey = "t1" | "t2" | "t3" | "t4" | "t5" | "t6" | "t7";

export type TierStyle = {
  accent: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
  dotColor: string;
};

export type TierDef = {
  key: TierKey;
  number: string;
  label: string;
  dark: TierStyle;
  light: TierStyle;
};

export const TIERS: TierDef[] = [
  {
    key: "t1",
    number: "1",
    label: "End-user experience",
    dark: {
      accent: "#4E8BFF",
      chipBg: "rgba(12,22,48,0.55)",
      chipText: "#7FB0FF",
      chipBorder: "#4E8BFF",
      badgeBg: "#4E8BFF",
      badgeText: "#061026",
      glow: "rgba(78,139,255,0.35)",
      dotColor: "#7FB0FF",
    },
    light: {
      accent: "#378ADD",
      chipBg: "#E6F1FB",
      chipText: "#0C447C",
      chipBorder: "#B9D6F3",
      badgeBg: "#378ADD",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#378ADD",
    },
  },
  {
    key: "t2",
    number: "2",
    label: "Cloud services",
    dark: {
      accent: "#32E6B7",
      chipBg: "rgba(8,32,28,0.55)",
      chipText: "#4FF0C0",
      chipBorder: "#32E6B7",
      badgeBg: "#32E6B7",
      badgeText: "#062018",
      glow: "rgba(50,230,183,0.35)",
      dotColor: "#4FF0C0",
    },
    light: {
      accent: "#1D9E75",
      chipBg: "#E1F5EE",
      chipText: "#085041",
      chipBorder: "#B5E2CE",
      badgeBg: "#1D9E75",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#1D9E75",
    },
  },
  {
    key: "t3",
    number: "3",
    label: "Container platform",
    dark: {
      accent: "#C964FF",
      chipBg: "rgba(30,12,48,0.55)",
      chipText: "#D58BFF",
      chipBorder: "#C964FF",
      badgeBg: "#C964FF",
      badgeText: "#190726",
      glow: "rgba(201,100,255,0.35)",
      dotColor: "#D58BFF",
    },
    light: {
      accent: "#7F77DD",
      chipBg: "#EEEDFE",
      chipText: "#3C3489",
      chipBorder: "#CAC6F2",
      badgeBg: "#7F77DD",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#7F77DD",
    },
  },
  {
    key: "t4",
    number: "4",
    label: "Application services",
    dark: {
      accent: "#FF7A45",
      chipBg: "rgba(50,18,8,0.55)",
      chipText: "#FF9F73",
      chipBorder: "#FF7A45",
      badgeBg: "#FF7A45",
      badgeText: "#1F0904",
      glow: "rgba(255,122,69,0.35)",
      dotColor: "#FF9F73",
    },
    light: {
      accent: "#D85A30",
      chipBg: "#FAECE7",
      chipText: "#712B13",
      chipBorder: "#EED2C4",
      badgeBg: "#D85A30",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#D85A30",
    },
  },
  {
    key: "t5",
    number: "5",
    label: "Data & integration",
    dark: {
      accent: "#FFB020",
      chipBg: "rgba(45,30,4,0.55)",
      chipText: "#FFC85F",
      chipBorder: "#FFB020",
      badgeBg: "#FFB020",
      badgeText: "#1F1304",
      glow: "rgba(255,176,32,0.35)",
      dotColor: "#FFC85F",
    },
    light: {
      accent: "#BA7517",
      chipBg: "#FAEEDA",
      chipText: "#633806",
      chipBorder: "#EAD5B0",
      badgeBg: "#BA7517",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#BA7517",
    },
  },
  {
    key: "t6",
    number: "6",
    label: "Infrastructure & endpoints",
    dark: {
      accent: "#9DB3CC",
      chipBg: "rgba(22,28,40,0.55)",
      chipText: "#BECDDF",
      chipBorder: "#9DB3CC",
      badgeBg: "#9DB3CC",
      badgeText: "#0E1420",
      glow: "rgba(157,179,204,0.28)",
      dotColor: "#BECDDF",
    },
    light: {
      accent: "#888780",
      chipBg: "#F1EFE8",
      chipText: "#444441",
      chipBorder: "#D9D7CC",
      badgeBg: "#888780",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#888780",
    },
  },
  {
    key: "t7",
    number: "7",
    label: "Mainframe (z/OS)",
    dark: {
      accent: "#FF6BC1",
      chipBg: "rgba(45,14,30,0.55)",
      chipText: "#FF92D3",
      chipBorder: "#FF6BC1",
      badgeBg: "#FF6BC1",
      badgeText: "#240717",
      glow: "rgba(255,107,193,0.35)",
      dotColor: "#FF92D3",
    },
    light: {
      accent: "#D4537E",
      chipBg: "#FBEAF0",
      chipText: "#72243E",
      chipBorder: "#EECCDA",
      badgeBg: "#D4537E",
      badgeText: "#FFFFFF",
      glow: "transparent",
      dotColor: "#D4537E",
    },
  },
];

export const getTierStyle = (tier: TierDef, mode: ThemeMode): TierStyle =>
  mode === "dark" ? tier.dark : tier.light;

export const getTierByKey = (key: TierKey): TierDef => {
  const t = TIERS.find((x) => x.key === key);
  if (!t) throw new Error(`Unknown tier: ${key}`);
  return t;
};

