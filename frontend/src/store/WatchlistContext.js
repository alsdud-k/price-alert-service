import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  deleteProduct as deleteProductFromServer,
  fetchNotifications,
  fetchProducts,
  markNotificationAsRead,
  updateProductAlert,
  updateProductTargetPrice,
} from '../api/client';

export const WatchlistContext = createContext(null);

function WatchlistProvider({ children }) {
  const [watchedProducts, setWatchedProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 로그인 완료 후, 또는 세션 복원 후 명시적으로 호출됩니다.
  async function loadInitialData() {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const [productList, notificationList] = await Promise.all([
        fetchProducts(),
        fetchNotifications(),
      ]);
      setWatchedProducts(productList);
      setNotifications(notificationList);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // 로그아웃 시 메모리에서 데이터 비움
  function clearData() {
    setWatchedProducts([]);
    setNotifications([]);
    setIsLoading(false);
    setErrorMessage('');
  }

  async function loadNotifications() {
    try {
      const notificationList = await fetchNotifications();
      setNotifications(notificationList);
      return notificationList;
    } catch (error) {
      setErrorMessage(error.message);
      return [];
    }
  }

  function addProduct(newProduct) {
    setWatchedProducts(function (previousList) {
      return [newProduct].concat(previousList);
    });
  }

  async function removeProduct(productId) {
    await deleteProductFromServer(productId);
    setWatchedProducts(function (previousList) {
      return previousList.filter(function (product) {
        return product.id !== productId;
      });
    });
    await loadNotifications();
  }

  async function toggleAlert(productId) {
    const targetProduct = watchedProducts.find(function (product) {
      return product.id === productId;
    });
    if (!targetProduct) {
      return;
    }

    const nextAlertEnabled = !targetProduct.isAlertOn;
    setWatchedProducts(function (previousList) {
      const newList = [];
      for (let i = 0; i < previousList.length; i = i + 1) {
        const product = previousList[i];
        if (product.id === productId) {
          const updatedProduct = Object.assign({}, product);
          updatedProduct.isAlertOn = nextAlertEnabled;
          newList.push(updatedProduct);
        } else {
          newList.push(product);
        }
      }
      return newList;
    });

    try {
      const updatedProduct = await updateProductAlert(productId, nextAlertEnabled);
      setWatchedProducts(function (previousList) {
        return previousList.map(function (product) {
          if (product.id === productId) {
            return updatedProduct;
          }
          return product;
        });
      });
      await loadNotifications();
    } catch (error) {
      setErrorMessage(error.message);
      setWatchedProducts(function (previousList) {
        return previousList.map(function (product) {
          if (product.id === productId) {
            const revertedProduct = Object.assign({}, product);
            revertedProduct.isAlertOn = !nextAlertEnabled;
            return revertedProduct;
          }
          return product;
        });
      });
    }
  }

  async function updateTargetPrice(productId, newTargetPrice) {
    const updatedProduct = await updateProductTargetPrice(productId, newTargetPrice);
    setWatchedProducts(function (previousList) {
      return previousList.map(function (product) {
        if (product.id === productId) {
          return updatedProduct;
        }
        return product;
      });
    });
    return updatedProduct;
  }

  async function readNotification(notificationId) {
    try {
      const updatedNotification = await markNotificationAsRead(notificationId);
      setNotifications(function (previousList) {
        return previousList.map(function (notification) {
          if (notification.id === notificationId) {
            return updatedNotification;
          }
          return notification;
        });
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const value = {
    watchedProducts: watchedProducts,
    notifications: notifications,
    isLoading: isLoading,
    errorMessage: errorMessage,
    reloadData: loadInitialData,
    clearData: clearData,
    reloadNotifications: loadNotifications,
    addProduct: addProduct,
    removeProduct: removeProduct,
    toggleAlert: toggleAlert,
    updateTargetPrice: updateTargetPrice,
    readNotification: readNotification,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

WatchlistProvider.propTypes = {
  children: PropTypes.node,
};

export default WatchlistProvider;
