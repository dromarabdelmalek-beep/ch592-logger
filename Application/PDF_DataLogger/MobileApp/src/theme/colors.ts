export const colors = {
  primary: {
    main: '#2196F3',
    dark: '#1976D2',
    light: '#64B5F6',
    contrast: '#FFFFFF',
  },
  secondary: {
    main: '#FF9800',
    dark: '#F57C00',
    light: '#FFB74D',
    contrast: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    dark: '#388E3C',
    light: '#81C784',
    contrast: '#FFFFFF',
  },
  warning: {
    main: '#FFC107',
    dark: '#F57F17',
    light: '#FFD54F',
    contrast: '#000000',
  },
  error: {
    main: '#F44336',
    dark: '#D32F2F',
    light: '#E57373',
    contrast: '#FFFFFF',
  },
  info: {
    main: '#00BCD4',
    dark: '#0097A7',
    light: '#4DD0E1',
    contrast: '#FFFFFF',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  divider: '#E0E0E0',
  // Temperature gradient colors
  temperature: {
    cold: '#2196F3',    // Blue
    cool: '#4CAF50',    // Green
    warm: '#FF9800',    // Orange
    hot: '#F44336',     // Red
  },
  // Humidity colors
  humidity: {
    low: '#FFC107',     // Amber
    normal: '#4CAF50',  // Green
    high: '#2196F3',    // Blue
  },
  // Chart colors
  chart: {
    temperature: '#F44336',
    humidity: '#2196F3',
    grid: '#E0E0E0',
    axis: '#757575',
    threshold: '#FFC107',
  },
};

export const darkColors = {
  ...colors,
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    elevated: '#2C2C2C',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#757575',
    hint: '#9E9E9E',
  },
  divider: '#424242',
};

export type ColorScheme = typeof colors;
