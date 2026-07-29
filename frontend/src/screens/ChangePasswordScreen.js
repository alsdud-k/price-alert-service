// 비밀번호 변경 화면. (임시 비밀번호로 로그인한 경우 강제 노출)

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import FormInput from '../components/FormInput';
import MessageModal from '../components/MessageModal';
import { changePassword } from '../api/client';
import { setAuthSession } from '../store/AuthSession';
import { WatchlistContext } from '../store/WatchlistContext';
import { SURFACE, LINE, TEXT, BUTTON } from '../colors';

function ChangePasswordScreen({ navigation }) {
  const { reloadData } = useContext(WatchlistContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    onClose: null,
  });

  function showPopup(title, message, onClose) {
    setPopup({ visible: true, title, message, onClose: onClose || null });
  }

  function handleClosePopup() {
    const onClose = popup.onClose;
    setPopup({ visible: false, title: '', message: '', onClose: null });
    if (onClose) {
      onClose();
    }
  }

  async function handlePressChange() {
    if (isSubmitting) {
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showPopup('변경 실패', '새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedAuth = await changePassword(currentPassword, newPassword);
      await setAuthSession(updatedAuth);
      await reloadData();
      showPopup('변경 완료', '비밀번호가 변경되었습니다.', function () {
        navigation.reset({ index: 0, routes: [{ name: '메인' }] });
      });
    } catch (error) {
      showPopup('변경 실패', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  let keyboardBehavior;
  if (Platform.OS === 'ios') {
    keyboardBehavior = 'padding';
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="비밀번호 변경" />

      <KeyboardAvoidingView style={styles.keyboardArea} behavior={keyboardBehavior}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            <Text style={styles.guideText}>
              임시 비밀번호로 로그인하셨습니다. 새 비밀번호로 변경해 주세요.
            </Text>

            <FormInput
              label="현재 비밀번호 (임시 비밀번호)"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="임시 비밀번호를 입력하세요"
              secureTextEntry
            />
            <FormInput
              label="새 비밀번호"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="새 비밀번호를 입력하세요 (8자 이상)"
              secureTextEntry
            />
            <FormInput
              label="새 비밀번호 확인"
              value={newPasswordConfirm}
              onChangeText={setNewPasswordConfirm}
              placeholder="새 비밀번호를 한 번 더 입력하세요"
              secureTextEntry
            />
          </View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handlePressChange}
            disabled={isSubmitting}
          >
            <Text style={styles.changeButtonText}>
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MessageModal
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        onClose={handleClosePopup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SURFACE.WHITE,
  },
  keyboardArea: {
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 22,
  },
  guideText: {
    fontSize: 13,
    color: TEXT.SUB,
    lineHeight: 19,
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE.DEFAULT,
  },
  changeButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: BUTTON.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.INVERSE,
    letterSpacing: -0.3,
  },
});

export default ChangePasswordScreen;
