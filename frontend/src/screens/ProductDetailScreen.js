// 상품 상세 화면. (홈·관심상품에서 상품 줄을 누르면 여기로 옴)
// 상품 이미지·이름·현재가·목표가와, 크림 앱처럼 날짜·가격 축이 있는 큰 그래프를 보여줍니다.

import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

import ScreenHeader from '../components/ScreenHeader';
import PlaceholderImage from '../components/PlaceholderImage';
import StatusBadge from '../components/StatusBadge';
import PriceHistoryGraph from '../components/PriceHistoryGraph';
import TargetPriceModal from '../components/TargetPriceModal';
import { SURFACE, LINE, TEXT, POINT } from '../colors';
import { formatPrice, calculateDropRate } from '../utils/priceUtils';
import { fetchProduct } from '../api/client';
import { WatchlistContext } from '../store/WatchlistContext';

// 상품 상세 화면
function ProductDetailScreen() {
  const route = useRoute();
  const productId = route.params ? route.params.productId : null;

  // 목록 화면에서 이미 불러온 데이터가 있으면 먼저 그걸로 보여주고,
  // 그 사이에 최신 데이터를 서버에서 한 번 더 받아온다.
  const { watchedProducts, updateTargetPrice } = useContext(WatchlistContext);
  const cachedProduct = watchedProducts.find(function (item) {
    return item.id === productId;
  });

  const [product, setProduct] = useState(cachedProduct || null);
  const [isLoading, setIsLoading] = useState(cachedProduct === undefined);
  const [errorMessage, setErrorMessage] = useState('');

  // 목표 가격 수정 팝업을 열지 여부
  const [isTargetPriceModalOpen, setIsTargetPriceModalOpen] = useState(false);

  const loadProduct = useCallback(async function () {
    try {
      setErrorMessage('');
      const latestProduct = await fetchProduct(productId);
      setProduct(latestProduct);
    } catch (error) {
      setErrorMessage(error.message || '상품 정보를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(function () {
    loadProduct();
  }, [loadProduct]);

  if (isLoading && product === null) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title="상품 상세" showBackButton />
        <View style={styles.centerBox}>
          <ActivityIndicator color={TEXT.SUB} />
        </View>
      </SafeAreaView>
    );
  }

  if (product === null) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScreenHeader title="상품 상세" showBackButton />
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>{errorMessage || '상품을 찾을 수 없어요.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dropRate = calculateDropRate(product.priceHistory, product.currentLowestPrice);

  // 목표 가격 수정 버튼을 눌렀을 때: 팝업을 엶
  function handlePressEditTargetPrice() {
    setIsTargetPriceModalOpen(true);
  }

  // 팝업을 닫음
  function handleCloseTargetPriceModal() {
    setIsTargetPriceModalOpen(false);
  }

  // 팝업에서 저장을 눌렀을 때: 서버에 새 목표가를 보내고 화면을 갱신함
  async function handleSaveTargetPrice(newTargetPrice) {
    const updatedProduct = await updateTargetPrice(productId, newTargetPrice);
    setProduct(updatedProduct);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="상품 상세" showBackButton />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 상품 이미지 */}
        <View style={styles.imageArea}>
          <PlaceholderImage size={120} uri={product.imageUrl} />
        </View>

        {/* 이름 / 쇼핑몰 / 상태 */}
        <View style={styles.infoArea}>
          <View style={styles.mallRow}>
            <Text style={styles.mall}>{product.mall}</Text>
            <StatusBadge label={product.status} />
          </View>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            {dropRate > 0 ? <Text style={styles.dropRate}>{dropRate}%</Text> : null}
            <Text style={styles.currentPrice}>
              {typeof product.currentLowestPrice === 'number'
                ? formatPrice(product.currentLowestPrice)
                : '-'}
            </Text>
          </View>
          {/* 목표가 + 수정 버튼 */}
          <View style={styles.targetPriceRow}>
            <Text style={styles.targetPrice}>목표가 {formatPrice(product.targetPrice)}</Text>
            <TouchableOpacity style={styles.editButton} onPress={handlePressEditTargetPrice}>
              <Ionicons name="create-outline" size={13} color={TEXT.SUB} />
              <Text style={styles.editButtonText}>목표 가격 수정</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 가격 변동 그래프 */}
        <View style={styles.graphArea}>
          <Text style={styles.graphTitle}>가격 변동 이력</Text>
          <PriceHistoryGraph data={product.priceHistoryDetailed || []} height={220} windowDays={14} />
        </View>

        {errorMessage !== '' ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </ScrollView>

      {/* 목표 가격 수정 팝업 */}
      <TargetPriceModal
        visible={isTargetPriceModalOpen}
        targetPrice={product.targetPrice}
        currentLowestPrice={product.currentLowestPrice}
        onClose={handleCloseTargetPriceModal}
        onSave={handleSaveTargetPrice}
      />
    </SafeAreaView>
  );
}

ProductDetailScreen.propTypes = {};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SURFACE.WHITE,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: TEXT.WEAK,
  },
  imageArea: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  infoArea: {
    paddingHorizontal: 20,
  },
  mallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mall: {
    fontSize: 13,
    color: TEXT.WEAK,
  },
  name: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: TEXT.STRONG,
    letterSpacing: -0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dropRate: {
    fontSize: 16,
    fontWeight: '800',
    color: POINT.DEFAULT,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT.STRONG,
    letterSpacing: -0.6,
  },
  // 목표가와 수정 버튼을 한 줄에 좌우로 배치
  targetPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  targetPrice: {
    fontSize: 13,
    color: TEXT.SUB,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE.DEFAULT,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT.SUB,
  },
  divider: {
    height: 8,
    backgroundColor: SURFACE.BAND,
    marginTop: 20,
  },
  graphArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT.STRONG,
    marginBottom: 12,
  },
  errorText: {
    marginTop: 12,
    marginHorizontal: 20,
    fontSize: 12,
    color: POINT.DEFAULT,
  },
});

export default ProductDetailScreen;
