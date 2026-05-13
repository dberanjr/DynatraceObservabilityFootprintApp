import React, { createContext, useCallback, useContext, useState } from "react";
import { DARK_PALETTE, getPalette, type FootprintPalette, type ThemeMode } from "./palette";

type ThemeCtx = {
  mode: ThemeMode;
  palette: FootprintPalette;
  toggle: () => void;
};

const Ctx = createContext<ThemeCtx>({
  mode: "dark",
  palette: DARK_PALETTE,
  toggle: () => {},
});

export const FootprintThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const toggle = useCallback(
    () => setMode((m) => (m === "dark" ? "light" : "dark")),
    []
  );
  const palette = getPalette(mode);
  return (
    <Ctx.Provider value={{ mode, palette, toggle }}>{children}</Ctx.Provider>
  );
};

export const useFootprintPalette = (): FootprintPalette =>
  useContext(Ctx).palette;

export const useThemeToggle = () => {
  const { mode, toggle } = useContext(Ctx);
  return { mode, toggle };
};
