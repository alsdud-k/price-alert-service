// 아이디 찾기 화면. (이름·이메일로 아이디 찾기)

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';

import ScreenHeader from '../components/ScreenHeader';
import FormInput from '../components/FormInput';
import MessageModal from '../components/MessageModal';
import { findUserId } from '../api/client';
import { SURFACE, LINE, TEXT, BUTTON, POINT } from '../colors';

// 아이디 찾기 화면
function FindIdScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
  });

  function showPopup(title, message) {
    setPopup({ visible: true, title: title, message: message });
  }

  function handleClosePopup() {
    setPopup({ visible: false, title: '', message: '' });
  }

  // 아이디 찾기 버튼을 눌렀을 때 실행
  async function handlePressFind() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFoundId(null);
    try {
      const result = await findUserId(name.trim(), email.trim());
      setFoundId(result.userId);
    } catch (error) {
      showPopup('아이디 찾기 실패', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // iOS에서 키보드가 입력창을 가리지 않게 하는 설정
  let keyboardBehavior;
  if (Platform.OS === 'ios') {
    keyboardBehavior = 'padding';
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader title="아이디 찾기" showBackButton />

      <KeyboardAvoidingView style={styles.keyboardArea} behavior={keyboardBehavior}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formSection}>
            {/* 안내 문구 */}
            <Text style={styles.guideText}>
              가입할 때 입력한 이름과 이메일을 넣으면 아이디를 찾아드려요.
            </Text>

            <FormInput
              label="이름"
              value={name}
              onChangeText={setName}
              placeholder="이름을 입력하세요"
            />
            <FormInput
              label="이메일"
              value={email}
              onChangeText={setEmail}
              placeholder="가입할 때 쓴 이메일을 입력하세요"
              keyboardType="email-address"
            />

            {/* 찾은 아이디 결과 */}
            {foundId !== null && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>회원님의 아이디</Text>
                <Text style={styles.resultId}>{foundId}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('로그인')}>
                  <Text style={styles.loginLink}>로그인하러 가기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* 화면 아래에 고정된 찾기 버튼 */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={styles.findButton}
            onPress={handlePressFind}
            disabled={isSubmitting}
          >
            <Text style={styles.findButtonText}>{isSubmitting ? '찾는 중...' : '아이디 찾기'}</Text>
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

FindIdScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

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
  resultBox: {
    marginTop: 8,
    padding: 20,
    borderRadius: 10,
    backgroundColor: SURFACE.GRAY,
    alignItems: 'center',
    gap: 8,
  },
  resultLabel: {
    fontSize: 13,
    color: TEXT.SUB,
  },
  resultId: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT.STRONG,
    letterSpacing: -0.5,
  },
  loginLink: {
    fontSize: 13,
    color: POINT.DEFAULT,
    marginTop: 4,
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LINE.DEFAULT,
  },
  findButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: BUTTON.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.INVERSE,
    letterSpacing: -0.3,
  },
});

export default FindIdScreen;
