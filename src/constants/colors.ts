import { Platform } from 'react-native';

export const colors = {
  // Fondos
  background: '#05060A',
  backgroundElevated: '#0B0D14',
  surface: '#12151F',
  surfaceHover: '#1A1F2E',

  // Acentos neón (triada cyberpunk)
  primary: '#00E5FF',      // cyan
  primaryDim: '#00B8CC',
  violet: '#7B5CFF',       // violeta (nuevo)
  magenta: '#FF2E97',      // magenta
  accent: '#FF2E97',       // alias de compatibilidad

  // Texto
  text: '#E8ECF2',
  textDim: '#8B95A5',
  textMuted: '#5A6372',

  // Bordes
  border: '#1C2028',
  borderBright: '#2A3140',

  // Estados del juego
  fija: '#00FF9C',         // verde neón
  pica: '#FFB020',         // ámbar
  danger: '#FF2E63',

  // Overlays
  overlay: 'rgba(0, 229, 255, 0.08)',
  overlayViolet: 'rgba(123, 92, 255, 0.10)',
};

// Gradientes prearmados (usar con LinearGradient)
export const gradients = {
  primary: ['#00E5FF', '#7B5CFF'] as const,
  accent: ['#7B5CFF', '#FF2E97'] as const,
  full: ['#00E5FF', '#7B5CFF', '#FF2E97'] as const,
  subtle: ['rgba(0, 229, 255, 0.15)', 'rgba(255, 46, 151, 0.05)'] as const,
};

export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
});