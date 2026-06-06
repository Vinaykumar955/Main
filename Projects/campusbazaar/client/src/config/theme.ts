/**
 * Accent palette + tiny theme helper. The values are pushed to CSS variables
 * on `<html>` (App.tsx → ThemeBoot) so every Tailwind utility that resolves
 * to `var(--color-signal*)` re-skins automatically.
 */
export type AccentKey = "red" | "cyan" | "amber" | "violet";

export interface AccentSwatch {
  s50: string;
  s100: string;
  s200: string;
  s300: string;
  s400: string;
  s500: string;
  s600: string;
  s700: string;
  s800: string;
  s900: string;
}

export const ACCENT_PALETTE: Record<AccentKey, AccentSwatch> = {
  red: {
    s50: "#FFE8E6",
    s100: "#FFCFCB",
    s200: "#FF9F95",
    s300: "#FF6F60",
    s400: "#FF4D3F",
    s500: "#FF3B30",
    s600: "#E0271D",
    s700: "#B81D14",
    s800: "#8F160F",
    s900: "#660F0A",
  },
  cyan: {
    s50: "#E0FBFF",
    s100: "#B3F5FF",
    s200: "#80EFFF",
    s300: "#4DE9FF",
    s400: "#26E5FF",
    s500: "#00E5FF",
    s600: "#00B8CC",
    s700: "#008A99",
    s800: "#005C66",
    s900: "#002E33",
  },
  amber: {
    s50: "#FFF7E0",
    s100: "#FFECB3",
    s200: "#FFDD80",
    s300: "#FFCB4D",
    s400: "#FFBA26",
    s500: "#FFB300",
    s600: "#E09E00",
    s700: "#B87C00",
    s800: "#8F5E00",
    s900: "#664200",
  },
  violet: {
    s50: "#F1E5FF",
    s100: "#DCC2FF",
    s200: "#C29AFF",
    s300: "#A06EFF",
    s400: "#8A4DFF",
    s500: "#7B3FE4",
    s600: "#5F2DB8",
    s700: "#481F8F",
    s800: "#34146B",
    s900: "#1F0A45",
  },
};

export const ACCENT_OPTIONS: { value: AccentKey; label: string; hex: string }[] = [
  { value: "red", label: "HERMES", hex: ACCENT_PALETTE.red.s500 },
  { value: "cyan", label: "ELECTRIC", hex: ACCENT_PALETTE.cyan.s500 },
  { value: "amber", label: "CAUTION", hex: ACCENT_PALETTE.amber.s500 },
  { value: "violet", label: "PULSE", hex: ACCENT_PALETTE.violet.s500 },
];
