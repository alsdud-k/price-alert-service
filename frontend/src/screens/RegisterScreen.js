// 관심 상품 등록 화면. (검색으로 고른 상품을 채워 넣거나, 직접 입력해서 등록)

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

import ScreenHeader from '../components/ScreenHeader';
import SectionBand from '../components/SectionBand';
import PlaceholderImage from '../components/PlaceholderImage';
import FormInput from '../components/FormInput';
import { SURFACE, LINE, TEXT, BUTTON } from '../colors';
import { WatchlistContext } from '../store/WatchlistContext';
import { parsePrice, decideStatus, formatPrice } from '../utils/priceUtils';

// 관심 상품 등록 화면
function RegisterScreen({ navigation, route }) {
  // 관심 상품 저장소에서 '추가' 기능을 가져옴
  const { addProduct } = useContext(WatchlistContext);

  // 검색 화면에서 고른 상품이 있으면 가져옴 (직접 등록이면 없음)
  let selectedProduct = null;
  if (route.params && route.params.product) {
    selectedProduct = route.params.product;
  }

  // 고른 상품이 있으면 그 값으로 미리 채우고, 직접 등록이면 빈칸으로 시작
  let firstImageUrl = '';
  let firstLowestPrice = null;
  let firstPriceHistory = [];
  let firstMallName = '';
  let firstProductName = '';
  if (selectedProduct) {
    firstImageUrl = selectedProduct.imageUrl;
    firstLowestPrice = selectedProduct.currentLowestPrice;
    firstPriceHistory = selectedProduct.priceHistory;
    firstMallName = selectedProduct.mall;
    firstProductName = selectedProduct.name;
  }

  // 입력창 값들
  const [productName, setProductName] = useState(firstProductName);
  const [productUrl, setProductUrl] = useState('');
  const [mallName, setMallName] = useState(firstMallName);
  const [targetPrice, setTargetPrice] = useState('');

  // 상품 이미지와 현재 최저가 (버튼을 누르면 서버에서 다시 받아와 바뀔 수 있음)
  const [imageUrl, setImageUrl] = useState(firstImageUrl);
  const [currentLowestPrice, setCurrentLowestPrice] = useState(firstLowestPrice);

  // 목표가 이하 알림 스위치의 켜짐 여부
  const [isAlertOn, setIsAlertOn] = useState(true);

  // 최저가가 숫자면 '239,000원'처럼, 아직 없으면 '-'로 표시
  let currentLowestPriceText = '-';
  if (typeof currentLowestPrice === 'number') {
    currentLowestPriceText = formatPrice(currentLowestPrice);
  }

  // 이미지 검색 버튼을 눌렀을 때: 서버에서 상품 이미지를 찾아옴
  function handlePressImageSearch() {
    // [백엔드 ⑦] 아래 주석을 풀고 서버 주소만 넣으세요.
    //
    // async function loadProductImage() {
    //   const response = await fetch('여기에_서버주소/api/products/image?name=' + productName);
    //   const data = await response.json();
    //   setImageUrl(data.imageUrl);
    // }
    // loadProductImage();

    Alert.alert('준비중입니다'); // 더미: 연동 시 삭제
  }

  // 다시 확인 버튼을 눌렀을 때: 서버에서 지금 최저가를 다시 불러옴
  function handlePressCheckPrice() {
    // [백엔드 ⑧] 아래 주석을 풀고 서버 주소만 넣으세요.
    //
    // async function loadLowestPrice() {
    //   const response = await fetch('여기에_서버주소/api/products/lowest-price?url=' + productUrl);
    //   const data = await response.json();
    //   setCurrentLowestPrice(data.currentLowestPrice);
    // }
    // loadLowestPrice();

    Alert.alert('준비중입니다'); // 더미: 연동 시 삭제
  }

  // 등록을 마친 뒤 관심상품 탭으로 이동
  function handleGoToWatchlist() {
    navigation.goBack(); // 등록 화면을 닫아 검색 화면으로 돌아감
    const mainTab = navigation.getParent(); // 한 단계 위(탭 묶음)
    mainTab.navigate('관심상품'); // 관심상품 탭으로 이동
  }

  // 등록하기 버튼을 눌렀을 때 실행
  function handlePressRegister() {
    // 빈칸이 있으면 안내하고 멈춤
    if (productName === '') {
      Alert.alert('입력 확인', '상품명을 입력해주세요.');
      return;
    }
    if (targetPrice === '') {
      Alert.alert('입력 확인', '목표 가격을 입력해주세요.');
      return;
    }

    // 목표가 글자를 숫자로 바꿈
    const targetNumber = parsePrice(targetPrice);

    // 상태를 정함 (최저가를 아직 모르면 '유지 중')
    let status = '유지 중';
    if (currentLowestPrice !== null) {
      status = decideStatus(firstPriceHistory, currentLowestPrice, targetNumber);
    }

    // 저장소에 추가할 새 관심 상품 (id는 지금 시각으로 겹치지 않게 만듦)
    const newProduct = {
      id: Date.now(),
      name: productName,
      mall: mallName,
      imageUrl: imageUrl,
      currentLowestPrice: currentLowestPrice,
      targetPrice: targetNumber,
      priceHistory: firstPriceHistory,
      status: status,
      isAlertOn: isAlertOn, // 위의 '목표가 이하 알림' 스위치 값
    };

    // [백엔드 ⑤] 아래 주석을 풀고 서버 주소만 넣으세요.
    //
    // async function saveProductToServer() {
    //   const response = await fetch('여기에_서버주소/api/watchlist', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newProduct),
    //   });
    //   const savedProduct = await response.json();
    //   addProduct(savedProduct);
    // }
    // saveProductToServer();

    addProduct(newProduct); // 더미: 연동 시 삭제

    // 등록 완료 안내 후 관심상품 탭으로 이동
    Alert.alert('등록 완료', '관심 상품으로 등록됐어요.', [
      { text: '확인', onPress: handleGoToWatchlist },
    ]);
  }

  // iOS에서 키보드가 입력창을 가리지 않게 하는 설정
  let keyboardBehavior;
  if (Platform.OS === 'ios') {
    keyboardBehavior = 'padding';
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="관심 상품 등록" showBackButton />

      <KeyboardAvoidingView style={styles.keyboardArea} behavior={keyboardBehavior}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 상품 이미지 */}
          <View style={styles.imageSection}>
            <PlaceholderImage size={72} uri={imageUrl} />
            <View style={styles.imageTextArea}>
              <Text style={styles.imageTitle}>상품 이미지</Text>
              <Text style={styles.imageDescription}>
                검색으로 상품을 고르면 이미지가 자동으로 들어옵니다.
              </Text>
              <TouchableOpacity style={styles.imageSearchButton} onPress={handlePressImageSearch}>
                <Ionicons name="search" size={13} color={TEXT.SUB} />
                <Text style={styles.imageSearchText}>이미지 검색</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SectionBand />

          {/* 상품 정보 입력 */}
          <View style={styles.formSection}>
            <FormInput
              label="상품명"
              value={productName}
              onChangeText={setProductName}
              placeholder="상품 이름을 입력하세요"
            />
            <FormInput
              label="상품 URL"
              value={productUrl}
              onChangeText={setProductUrl}
              placeholder="상품 페이지 주소를 붙여넣으세요"
            />
            <FormInput
              label="쇼핑몰"
              value={mallName}
              onChangeText={setMallName}
              placeholder="쇼핑몰 이름을 입력하세요"
            />
          </View>

          <SectionBand />

          {/* 현재 최저가 (백엔드에서 불러옴) */}
          <View style={styles.priceSection}>
            <View style={styles.priceLabelRow}>
              <Text style={styles.priceLabel}>현재 최저가</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={handlePressCheckPrice}>
                <Ionicons name="refresh" size={13} color={TEXT.SUB} />
                <Text style={styles.refreshText}>다시 확인</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.priceValue}>{currentLowestPriceText}</Text>
          </View>

          <SectionBand />

          {/* 목표 가격 입력 */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>목표 가격</Text>
            <View style={styles.targetPriceRow}>
              <TextInput
                style={styles.targetPriceInput}
                value={targetPrice}
                onChangeText={setTargetPrice}
                placeholder="목표 가격"
                placeholderTextColor={TEXT.WEAK}
                keyboardType="number-pad"
              />
              <Text style={styles.wonText}>원</Text>
            </View>
            <Text style={styles.helperText}>
              현재 최저가보다 낮게 설정하면 가격이 내려갈 때 알림을 드려요.
            </Text>
          </View>

          <SectionBand />

          {/* 목표가 이하 알림 스위치 */}
          <View style={styles.alertRow}>
            <View style={styles.alertTextArea}>
              <Text style={styles.alertTitle}>목표가 이하 알림</Text>
              <Text style={styles.alertDescription}>목표가 아래로 내려가면 알림을 받습니다.</Text>
            </View>
            <Switch
              value={isAlertOn}
              onValueChange={setIsAlertOn}
              trackColor={{ false: LINE.STRONG, true: TEXT.STRONG }}
              thumbColor={SURFACE.WHITE}
              ios_backgroundColor={LINE.STRONG}
            />
          </View>
        </ScrollView>

        {/* 화면 아래에 고정된 등록 버튼 */}
        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.registerButton} onPress={handlePressRegister}>
            <Text style={styles.registerButtonText}>등록하기</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

RegisterScreen.propTypes = {
  navigation: PropTypes.object.isRequired, // 화면 이동 기능
  route: PropTypes.object.isRequired, // 화면으로 넘어온 정보 (고른 상품 등)
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SURFACE.WHITE,
  },
  keyboardArea: {
    flex: 1,
  },
  imageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
  },
  imageTextArea: {
    flex: 1,
    gap: 4,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT.STRONG,
    letterSpacing: -0.3,
  },
  imageDescription: {
    fontSize: 12,
    color: TEXT.SUB,
    lineHeight: 17,
  },
  imageSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // 글자 길이만큼만 차지
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE.STRONG,
    gap: 4,
    marginTop: 4,
  },
  imageSearchText: {
    fontSize: 12,
    color: TEXT.SUB,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: TEXT.SUB,
    letterSpacing: -0.2,
  },
  priceSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 6,
  },
  priceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: TEXT.SUB,
    letterSpacing: -0.2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE.STRONG,
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: TEXT.SUB,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT.STRONG,
    letterSpacing: -0.8,
  },
  targetPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LINE.STRONG,
    marginTop: -12, // 라벨과의 간격을 다른 입력칸과 맞춤
  },
  targetPriceInput: {
    flex: 1, // '원'을 뺀 나머지 공간 차지
    paddingVertical: 10,
    fontSize: 16,
    color: TEXT.STRONG,
  },
  wonText: {
    fontSize: 15,
    color: TEXT.SUB,
  },
  helperText: {
    fontSize: 12,
    color: TEXT.WEAK,
    lineHeight: 17,
    marginTop: -12, // 입력칸과의 간격을 좁힘
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  alertTextArea: {
    flex: 1, // 스위치를 오른쪽 끝으로 밀기
    gap: 3,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT.STRONG,
    letterSpacing: -0.3,
  },
  alertDescription: {
    fontSize: 12,
    color: TEXT.SUB,
  },
  // 스크롤과 상관없이 화면 아래에 항상 붙어 있는 버튼 칸
  bottomArea: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: SURFACE.WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE.DEFAULT,
  },
  registerButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: BUTTON.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.INVERSE,
    letterSpacing: -0.3,
  },
});

export default RegisterScreen;
