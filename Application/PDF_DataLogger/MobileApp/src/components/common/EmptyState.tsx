import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon
        source={icon}
        size={80}
        color={theme.colors.surfaceDisabled}
      />
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onSurfaceDisabled }]}
      >
        {title}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EmptyState;
