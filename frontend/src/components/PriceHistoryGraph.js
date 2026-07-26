// 상품 상세 화면에서 쓰는 큰 가격 변동 그래프입니다.
// MiniLineGraph와 달리 실제 날짜(checkedAt) 간격에 맞춰 점을 찍고,
// 왼쪽에 가격 축, 아래쪽에 날짜 축 글자를 함께 보여줍니다.
// X축은 데이터가 며칠 안 쌓였어도 항상 windowDays(기본 30일) 폭으로 고정해서,
// 데이터가 적으면 오른쪽에 점이 몰려 보이는 식으로 그립니다. (KREAM '1개월' 탭과 비슷)

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import PropTypes from 'prop-types';
import { LINE, TEXT, POINT } from '../colors';
import { formatPrice } from '../utils/priceUtils';

const DAY_MS = 24 * 60 * 60 * 1000;

// '7.20'처럼 짧게 날짜를 표시
function formatShortDate(time) {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return (date.getMonth() + 1) + '.' + date.getDate();
}

// 가격 변동 그래프 (날짜·가격 축 포함, X축은 windowDays일 폭으로 고정)
function PriceHistoryGraph({ data, height = 220, lineColor = POINT.DEFAULT, windowDays = 30 }) {
  const [width, setWidth] = useState(0);

  function handleLayout(event) {
    setWidth(event.nativeEvent.layout.width);
  }

  const leftPadding = 52; // 왼쪽 가격 글자 자리
  const rightPadding = 12;
  const topPadding = 16;
  const bottomPadding = 22; // 아래 날짜 글자 자리

  // X축 범위는 항상 "오늘 기준 최근 windowDays일"로 고정
  const maxTime = Date.now();
  const minTime = maxTime - windowDays * DAY_MS;

  // 시간 순서대로 정렬 후, 고정된 날짜 범위 안에 있는 기록만 사용
  const sorted = data
    .slice()
    .sort(function (a, b) {
      return new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime();
    })
    .filter(function (item) {
      const time = new Date(item.checkedAt).getTime();
      return time >= minTime && time <= maxTime;
    });

  const hasAnyPoint = width > 0 && sorted.length >= 1;
  const canDrawLine = width > 0 && sorted.length >= 2;

  let linePoints = '';
  let areaPoints = '';
  let lastX = 0;
  let lastY = 0;
  let minPrice = 0;
  let maxPrice = 0;
  let midPrice = 0;

  // 날짜 축 글자는 데이터가 아니라 고정된 기간(minTime~maxTime) 기준으로 표시
  const startLabel = formatShortDate(minTime);
  const middleLabel = formatShortDate((minTime + maxTime) / 2);
  const endLabel = formatShortDate(maxTime);

  if (hasAnyPoint) {
    const usableWidth = width - leftPadding - rightPadding;
    const usableHeight = height - topPadding - bottomPadding;

    const prices = sorted.map(function (item) {
      return item.price;
    });

    minPrice = Math.min.apply(null, prices);
    maxPrice = Math.max.apply(null, prices);
    let priceRange = maxPrice - minPrice;
    if (priceRange === 0) {
      priceRange = 1;
    }
    midPrice = Math.round((minPrice + maxPrice) / 2);

    let timeRange = maxTime - minTime;
    if (timeRange === 0) {
      timeRange = 1;
    }

    const coords = sorted.map(function (item) {
      const time = new Date(item.checkedAt).getTime();
      const x = leftPadding + (usableWidth * (time - minTime)) / timeRange;
      const ratio = (item.price - minPrice) / priceRange;
      const y = topPadding + usableHeight * (1 - ratio);
      return { x: x, y: y };
    });

    lastX = coords[coords.length - 1].x;
    lastY = coords[coords.length - 1].y;

    if (canDrawLine) {
      linePoints = coords
        .map(function (point) {
          return point.x + ',' + point.y;
        })
        .join(' ');

      // 선 아래쪽을 옅게 채우기 위한 다각형 (선 좌표 + 바닥 두 점)
      const baseY = topPadding + usableHeight;
      areaPoints =
        linePoints +
        ' ' +
        coords[coords.length - 1].x + ',' + baseY + ' ' +
        coords[0].x + ',' + baseY;
    }
  }

  return (
    <View style={[styles.container, { height: height }]} onLayout={handleLayout}>
      {hasAnyPoint ? (
        <Svg width={width} height={height}>
          {/* 가격 기준선 3개 (최고·중간·최저) */}
          <Line
            x1={leftPadding}
            y1={topPadding}
            x2={width - rightPadding}
            y2={topPadding}
            stroke={LINE.DEFAULT}
            strokeWidth={1}
          />
          <Line
            x1={leftPadding}
            y1={height / 2}
            x2={width - rightPadding}
            y2={height / 2}
            stroke={LINE.DEFAULT}
            strokeWidth={1}
          />
          <Line
            x1={leftPadding}
            y1={height - bottomPadding}
            x2={width - rightPadding}
            y2={height - bottomPadding}
            stroke={LINE.DEFAULT}
            strokeWidth={1}
          />

          {/* 왼쪽 가격 글자 */}
          <SvgText x={4} y={topPadding + 4} fontSize={11} fill={TEXT.WEAK}>
            {formatPrice(maxPrice)}
          </SvgText>
          <SvgText x={4} y={height / 2 + 4} fontSize={11} fill={TEXT.WEAK}>
            {formatPrice(midPrice)}
          </SvgText>
          <SvgText x={4} y={height - bottomPadding + 4} fontSize={11} fill={TEXT.WEAK}>
            {formatPrice(minPrice)}
          </SvgText>

          {canDrawLine ? (
            <>
              {/* 선 아래 옅은 채움 */}
              <Polygon points={areaPoints} fill={lineColor} fillOpacity={0.08} />

              {/* 가격 꺾은선 */}
              <Polyline
                points={linePoints}
                fill="none"
                stroke={lineColor}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          ) : null}

          {/* 지금 가격 위치 점 */}
          <Circle cx={lastX} cy={lastY} r={4} fill={lineColor} />

          {/* 아래 날짜 글자 (기간 시작 · 중간 · 오늘) */}
          <SvgText x={leftPadding} y={height - 4} fontSize={11} fill={TEXT.WEAK}>
            {startLabel}
          </SvgText>
          <SvgText x={width / 2 - 12} y={height - 4} fontSize={11} fill={TEXT.WEAK}>
            {middleLabel}
          </SvgText>
          <SvgText x={width - rightPadding - 24} y={height - 4} fontSize={11} fill={TEXT.WEAK}>
            {endLabel}
          </SvgText>
        </Svg>
      ) : (
        <Text style={styles.emptyText}>가격 변동 이력이 아직 없어요.</Text>
      )}
    </View>
  );
}

PriceHistoryGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number.isRequired,
      checkedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  height: PropTypes.number,
  lineColor: PropTypes.string,
  windowDays: PropTypes.number, // X축으로 보여줄 최근 기간(일)
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: TEXT.WEAK,
  },
});

export default PriceHistoryGraph;
