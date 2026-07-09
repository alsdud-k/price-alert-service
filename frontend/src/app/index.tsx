import * as Device from 'expo-device';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getApiBaseUrl, getHealthStatus, type HealthStatus } from '@/lib/api';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkBackendStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextHealthStatus = await getHealthStatus();
      setHealthStatus(nextHealthStatus);
    } catch (error) {
      setHealthStatus(null);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown API error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkBackendStatus();
  }, [checkBackendStatus]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Price Alert
          </ThemedText>
          <ThemedText style={styles.subtitle}>React Native + Spring Boot + MySQL</ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          {getApiBaseUrl()}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.statusContainer}>
          <ThemedText type="smallBold">Backend connection</ThemedText>
          <ThemedText type="subtitle" style={styles.statusText}>
            {isLoading ? 'Checking...' : healthStatus ? 'Connected' : 'Disconnected'}
          </ThemedText>
          <ThemedText type="small" style={styles.statusDetail}>
            {healthStatus
              ? `${healthStatus.service} responded ${healthStatus.status}`
              : errorMessage ?? 'Start the backend and try again.'}
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            onPress={checkBackendStatus}
            style={({ pressed }) => [styles.refreshButton, pressed && styles.refreshButtonPressed]}>
            <ThemedText type="smallBold" style={styles.refreshButtonText}>
              Retry
            </ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedText type="small">{getDevMenuHint()}</ThemedText>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  statusContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  statusText: {
    fontSize: 28,
    lineHeight: 36,
  },
  statusDetail: {
    minHeight: 20,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  refreshButtonPressed: {
    opacity: 0.75,
  },
  refreshButtonText: {
    color: '#FFFFFF',
  },
});
