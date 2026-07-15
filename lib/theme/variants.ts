import type { Venue } from "@prisma/client";

/**
 * Visual variant presets. The variant key lives in the database; the visual
 * recipe lives here so designers can evolve it in code. Per-venue colors from
 * the database override the preset palette.
 */

export type VariantKey =
  | "DARK_NIGHTLIFE"
  | "ROOFTOP_ELEGANCE"
  | "COASTAL_SUMMER"
  | "FINE_DINING"
  | "URBAN_GASTROBAR"
  | "RELAXED_CAFE"
  | "PREMIUM_ALL_DAY";

export type VariantPreset = {
  /** CSS class applied to the page wrapper — drives the atmosphere layers. */
  atmosphereClass: string;
  /** Display typography treatment for headline + venue name. */
  displayClass: string;
  /** CTA shape/treatment. */
  ctaClass: string;
  /** Fallback palette when the venue row has no colors. */
  colors: {
    background: string;
    text: string;
    accent: string;
    /** Ink color used on top of the accent (CTA label). */
    accentInk: string;
    secondary: string;
  };
};

export const variantPresets: Record<VariantKey, VariantPreset> = {
  DARK_NIGHTLIFE: {
    atmosphereClass: "atm-nightlife",
    displayClass: "display-club",
    ctaClass: "cta-sharp",
    colors: {
      background: "#050509",
      text: "#eef2f7",
      accent: "#37d6e8",
      accentInk: "#03151a",
      secondary: "#141428",
    },
  },
  ROOFTOP_ELEGANCE: {
    atmosphereClass: "atm-rooftop",
    displayClass: "display-serif-italic",
    ctaClass: "cta-pill",
    colors: {
      background: "#0c1219",
      text: "#f2ede4",
      accent: "#c9b28a",
      accentInk: "#181207",
      secondary: "#233242",
    },
  },
  COASTAL_SUMMER: {
    atmosphereClass: "atm-coastal",
    displayClass: "display-airy",
    ctaClass: "cta-pill",
    colors: {
      background: "#04222f",
      text: "#f4f6f2",
      accent: "#f0b45c",
      accentInk: "#241302",
      secondary: "#0d4f66",
    },
  },
  FINE_DINING: {
    atmosphereClass: "atm-dining",
    displayClass: "display-serif",
    ctaClass: "cta-soft",
    colors: {
      background: "#140609",
      text: "#f5ece7",
      accent: "#c8323e",
      accentInk: "#fdf3ee",
      secondary: "#3d1220",
    },
  },
  URBAN_GASTROBAR: {
    atmosphereClass: "atm-gastrobar",
    displayClass: "display-serif",
    ctaClass: "cta-pill",
    colors: {
      background: "#0a0f1d",
      text: "#f4ede0",
      accent: "#d4a34f",
      accentInk: "#1c1204",
      secondary: "#1c2a45",
    },
  },
  RELAXED_CAFE: {
    atmosphereClass: "atm-cafe",
    displayClass: "display-serif",
    ctaClass: "cta-soft",
    colors: {
      background: "#161210",
      text: "#f4eee6",
      accent: "#c98f4e",
      accentInk: "#1d1204",
      secondary: "#33291f",
    },
  },
  PREMIUM_ALL_DAY: {
    atmosphereClass: "atm-allday",
    displayClass: "display-sans",
    ctaClass: "cta-pill",
    colors: {
      background: "#121010",
      text: "#f3efe9",
      accent: "#c99a5b",
      accentInk: "#1c1104",
      secondary: "#2e2723",
    },
  },
};

export type VenueTheme = {
  preset: VariantPreset;
  /** Inline CSS custom properties for the page wrapper. */
  cssVars: Record<string, string>;
};

export function themeForVenue(venue: Venue): VenueTheme {
  const preset = variantPresets[venue.visualVariant as VariantKey] ?? variantPresets.PREMIUM_ALL_DAY;
  const colors = preset.colors;
  return {
    preset,
    cssVars: {
      "--v-bg": venue.backgroundColor ?? colors.background,
      "--v-text": venue.textColor ?? colors.text,
      "--v-accent": venue.accentColor ?? colors.accent,
      "--v-accent-ink": colors.accentInk,
      "--v-secondary": venue.secondaryColor ?? colors.secondary,
      "--v-primary": venue.primaryColor ?? colors.secondary,
    },
  };
}
