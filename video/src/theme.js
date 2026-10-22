import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Colours from the TaskFlow design system (src/index.css), so the video matches the app.
export const C = {
  bg: 'oklch(0.185 0.013 205)', // dark canvas
  bgDeep: 'oklch(0.14 0.012 205)',
  pine: 'oklch(0.470 0.082 186)', // primary (light theme)
  pineLight: 'oklch(0.75 0.075 186)', // primary (dark theme)
  saffron: 'oklch(0.810 0.138 74)', // accent
  fg: 'oklch(0.975 0.006 200)',
  fgMuted: 'oklch(0.825 0.012 200)',
  line: 'oklch(0.32 0.015 205)',
};

// Logo tile colours (same as public/favicon.svg, dark variant).
export const LOGO = { p: '#74beb5', a: '#eab35f' };

const fonts = [
  ['Readex Pro', 'readex-pro-arabic-wght-normal.woff2', '200 700'],
  ['Readex Pro', 'readex-pro-latin-wght-normal.woff2', '200 700'],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-400-normal.woff2', '400'],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-500-normal.woff2', '500'],
  ['IBM Plex Sans Arabic', 'ibm-plex-sans-arabic-arabic-600-normal.woff2', '600'],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-wght-normal.woff2', '100 700'],
];
export const fontsReady = Promise.all(
  fonts.map(([family, file, weight]) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight }),
  ),
);

export const HEAD = '"Readex Pro", sans-serif';
export const BODY = '"IBM Plex Sans", "IBM Plex Sans Arabic", sans-serif';
