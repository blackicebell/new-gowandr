import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';

export type ThemeName = 'green' | 'pink' | 'blue';

export type AppColors = {
  name: ThemeName;
  label: string;
  canvas: string;
  canvasDeep: string;
  paper: string;
  paperSoft: string;
  cloud: string;
  mist: string;
  teal: string;
  tealDark: string;
  accent: string;
  accentSoft: string;
  sky: string;
  coral: string;
  sun: string;
  charcoal: string;
  muted: string;
  line: string;
  white: string;
  danger: string;
  glass: string;
};

export const themes: Record<ThemeName, AppColors> = {
  green: {
    name: 'green',
    label: 'Forest',
    canvas: '#08140F',
    canvasDeep: '#030806',
    paper: '#101D17',
    paperSoft: '#172720',
    cloud: '#21382E',
    mist: '#AFC8BB',
    teal: '#79D6B2',
    tealDark: '#4AA57F',
    accent: '#C7F06B',
    accentSoft: '#314425',
    sky: '#BFD9D2',
    coral: '#FFB38F',
    sun: '#E8D76B',
    charcoal: '#F5F4EA',
    muted: '#9AAEA4',
    line: '#284137',
    white: '#FFFFFF',
    danger: '#FF8E7A',
    glass: 'rgba(255,255,255,0.08)',
  },
  pink: {
    name: 'pink',
    label: 'Rose',
    canvas: '#160A12',
    canvasDeep: '#080306',
    paper: '#23101C',
    paperSoft: '#321827',
    cloud: '#442337',
    mist: '#E8BCD4',
    teal: '#FF8FC7',
    tealDark: '#E45F9D',
    accent: '#FFD166',
    accentSoft: '#4A2B36',
    sky: '#F5D7E8',
    coral: '#FF9C74',
    sun: '#FFE28A',
    charcoal: '#FFF6FB',
    muted: '#C9A1B7',
    line: '#4B2A3B',
    white: '#FFFFFF',
    danger: '#FF776F',
    glass: 'rgba(255,255,255,0.09)',
  },
  blue: {
    name: 'blue',
    label: 'Ocean',
    canvas: '#07111F',
    canvasDeep: '#030710',
    paper: '#0E1B2E',
    paperSoft: '#142641',
    cloud: '#1E3557',
    mist: '#AFC8E8',
    teal: '#68C7FF',
    tealDark: '#3D96D8',
    accent: '#A9F0D1',
    accentSoft: '#183D52',
    sky: '#C9E5FF',
    coral: '#FFB38F',
    sun: '#F6D365',
    charcoal: '#F4F8FF',
    muted: '#9BB1CC',
    line: '#263E60',
    white: '#FFFFFF',
    danger: '#FF837B',
    glass: 'rgba(255,255,255,0.09)',
  },
};

export const colors = themes.green;

export const font = {
  family: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif',
    web: 'Inter, Avenir Next, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    default: undefined,
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    default: undefined,
  }),
};

export const ThemeContext = createContext<AppColors>(themes.green);

export function ThemeProvider({ value, children }: { value: AppColors; children: React.ReactNode }) {
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useThemeColors() {
  return useContext(ThemeContext);
}
