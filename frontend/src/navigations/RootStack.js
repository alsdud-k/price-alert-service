// 최상위 내비게이션. 인증(로그인)이냐 메인(탭)이냐를 정합니다. (시작은 인증)

import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import MainTab from './MainTab';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { loadAuthSession } from '../store/AuthSession';

const Stack = createNativeStackNavigator();

// 인증 ↔ 메인을 담는 최상위 묶음
function RootStack() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    loadAuthSession().then(function (auth) {
      setInitialRoute(auth ? '메인' : '인증');
    });
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="인증" component={AuthStack} />
      <Stack.Screen name="메인" component={MainTab} />
      <Stack.Screen name="상품상세" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

export default RootStack;
