// 앱 실행 중 로그인한 사용자 정보를 보관합니다. (AsyncStorage로 영구 저장)

import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'auth_session';

let currentAuth = null;

export async function setAuthSession(auth) {
  currentAuth = auth;
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function getAuthSession() {
  return currentAuth;
}

export function getCurrentUser() {
  if (!currentAuth) {
    return null;
  }

  return currentAuth.user;
}

export async function clearAuthSession() {
  currentAuth = null;
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function loadAuthSession() {
  try {
    const stored = await AsyncStorage.getItem(AUTH_KEY);
    if (stored) {
      currentAuth = JSON.parse(stored);
    }
  } catch {
    currentAuth = null;
  }
  return currentAuth;
}
