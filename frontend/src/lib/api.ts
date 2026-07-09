import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export type HealthStatus = {
  status: string;
  service: string;
  timestamp: string;
};

function getDevServerHost() {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  const hostUri = expoConfig?.hostUri;
  return hostUri?.split(':')[0];
}

export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const devServerHost = getDevServerHost();

  if (Device.isDevice && devServerHost) {
    return `http://${devServerHost}:8080`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080';
  }

  if (Platform.OS === 'ios') {
    return 'http://localhost:8080';
  }

  return `http://${devServerHost ?? 'localhost'}:8080`;
}

export async function getHealthStatus() {
  const response = await fetch(`${getApiBaseUrl()}/api/health`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as HealthStatus;
}
