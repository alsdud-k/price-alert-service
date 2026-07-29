// 최상위 내비게이션. 인증(로그인)이냐 메인(탭)이냐를 정합니다. (시작은 인증)

import React, { useState, useEffect, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import MainTab from './MainTab';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { loadAuthSession } from '../store/AuthSession';
import { WatchlistContext } from '../store/WatchlistContext';

const Stack = createNativeStackNavigator();

// 인증 ↔ 메인을 담는 최상위 묶음
function RootStack() {
  const [initialRoute, setInitialRoute] = useState(null);
  const { reloadData } = useContext(WatchlistContext);

  useEffect(() => {
    loadAuthSession().then(async function (auth) {
      if (!auth) {
        setInitialRoute('인증');
      } else if (auth.user && auth.user.temporaryPassword) {
        setInitialRoute('비밀번호변경');
      } else {
        await reloadData();
        setInitialRoute('메인');
      }
    });
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator id="root" initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="인증" component={AuthStack} />
      <Stack.Screen name="메인" component={MainTab} />
      <Stack.Screen name="상품상세" component={ProductDetailScreen} />
      <Stack.Screen name="비밀번호변경" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

export default RootStack;
