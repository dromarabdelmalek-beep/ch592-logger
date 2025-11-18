export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.25,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 1.25,
    textTransform: 'uppercase' as const,
  },
  // Custom styles for data display
  largeReading: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    letterSpacing: 0,
    lineHeight: 56,
  },
  mediumReading: {
    fontSize: 32,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  smallReading: {
    fontSize: 24,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
};

export type Typography = typeof typography;
