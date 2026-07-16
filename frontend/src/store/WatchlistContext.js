// [앱 데이터 공유 저장소]
// 여러 화면이 함께 보는 데이터(관심 상품 목록, 알림 목록)를 한곳에서 관리합니다.
// 목록은 서버에서 받아오는 개수만큼 그대로 담기므로, 4개든 100개든 그대로 표시됩니다.
// 백엔드가 완성되면 아래 [백엔드 ①] [백엔드 ②] 두 곳의 주석만 풀면
// 홈·관심상품·알림·마이페이지가 전부 실제 데이터로 바뀝니다.

import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DUMMY_WATCHED_PRODUCTS, DUMMY_NOTIFICATIONS } from '../dummyData/dummyData'; // 더미: 연동 시 삭제

// 화면들이 꺼내 쓸 저장소를 만듭니다.
export const WatchlistContext = createContext(null);

// 저장소의 실제 값을 담아 아래 화면들에게 나눠주는 컴포넌트
function WatchlistProvider({ children }) {
  // 관심 상품 목록
  const [watchedProducts, setWatchedProducts] = useState([]);

  // 알림 목록
  const [notifications, setNotifications] = useState([]);

  // 앱이 처음 켜질 때 관심 상품 목록을 불러옴
  useEffect(function () {
    // [백엔드 ①] 아래 주석을 풀고 서버 주소만 넣으세요.
    //
    // async function loadWatchedProducts() {
    //   const response = await fetch('여기에_서버주소/api/watchlist');
    //   const data = await response.json();
    //   setWatchedProducts(data);
    // }
    // loadWatchedProducts();

    setWatchedProducts(DUMMY_WATCHED_PRODUCTS); // 더미: 연동 시 삭제
  }, []);

  // 앱이 처음 켜질 때 알림 목록을 불러옴
  useEffect(function () {
    // [백엔드 ②] 아래 주석을 풀고 서버 주소만 넣으세요.
    //
    // async function loadNotifications() {
    //   const response = await fetch('여기에_서버주소/api/notifications');
    //   const data = await response.json();
    //   setNotifications(data);
    // }
    // loadNotifications();

    setNotifications(DUMMY_NOTIFICATIONS); // 더미: 연동 시 삭제
  }, []);

  // 관심 상품 하나를 목록 뒤에 추가 (등록 화면에서 사용)
  function addProduct(newProduct) {
    setWatchedProducts(function (previousList) {
      return previousList.concat(newProduct);
    });
  }

  // 관심 상품 하나를 목록에서 지움 (관심상품 화면의 휴지통 버튼에서 사용)
  function removeProduct(productId) {
    setWatchedProducts(function (previousList) {
      // 지울 상품만 빼고 나머지를 새 목록으로 만듦
      return previousList.filter(function (product) {
        return product.id !== productId;
      });
    });
  }

  // 종 아이콘을 눌렀을 때: 그 상품의 알림 켜짐/꺼짐을 뒤집음
  // (목록을 한곳에서 관리하므로 홈과 관심상품의 종이 함께 바뀝니다)
  function toggleAlert(productId) {
    setWatchedProducts(function (previousList) {
      const newList = [];

      // 목록을 하나씩 보면서 누른 상품만 알림 상태를 바꿈
      for (let i = 0; i < previousList.length; i = i + 1) {
        const product = previousList[i];

        if (product.id === productId) {
          // 기존 상품을 복사한 뒤 알림 켜짐/꺼짐만 반대로 바꿈
          const updatedProduct = Object.assign({}, product);
          updatedProduct.isAlertOn = !product.isAlertOn;
          newList.push(updatedProduct);
        } else {
          newList.push(product);
        }
      }

      return newList;
    });
  }

  // 화면들이 꺼내 쓸 값
  const value = {
    watchedProducts: watchedProducts,
    notifications: notifications,
    addProduct: addProduct,
    removeProduct: removeProduct,
    toggleAlert: toggleAlert,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

WatchlistProvider.propTypes = {
  children: PropTypes.node, // 이 저장소로 감싸는 화면들
};

export default WatchlistProvider;
