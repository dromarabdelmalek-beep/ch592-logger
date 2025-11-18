import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors, darkColors } from './colors';
import { typography } from './typography';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    error: colors.error.main,
    errorContainer: colors.error.light,
    background: colors.background.default,
    surface: colors.background.paper,
    surfaceVariant: colors.background.elevated,
    onPrimary: colors.primary.contrast,
    onSecondary: colors.secondary.contrast,
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    outline: colors.divider,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    regular: { fontFamily: 'Roboto-Regular' },
    medium: { fontFamily: 'Roboto-Medium' },
    bold: { fontFamily: 'Roboto-Bold' },
  },
  custom: {
    colors,
    typography,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary.main,
    primaryContainer: darkColors.primary.dark,
    secondary: darkColors.secondary.main,
    secondaryContainer: darkColors.secondary.dark,
    error: darkColors.error.main,
    errorContainer: darkColors.error.dark,
    background: darkColors.background.default,
    surface: darkColors.background.paper,
    surfaceVariant: darkColors.background.elevated,
    onPrimary: darkColors.primary.contrast,
    onSecondary: darkColors.secondary.contrast,
    onBackground: darkColors.text.primary,
    onSurface: darkColors.text.primary,
    outline: darkColors.divider,
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: { fontFamily: 'Roboto-Regular' },
    medium: { fontFamily: 'Roboto-Medium' },
    bold: { fontFamily: 'Roboto-Bold' },
  },
  custom: {
    colors: darkColors,
    typography,
  },
};

export type AppTheme = typeof lightTheme;
