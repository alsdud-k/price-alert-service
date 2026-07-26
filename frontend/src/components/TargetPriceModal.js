// 목표 가격을 새로 입력하는 팝업입니다. (상품 상세 화면에서 사용)

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import { SURFACE, LINE, TEXT, POINT, BUTTON } from '../colors';
import { formatPrice, formatNumberWithComma, parsePrice } from '../utils/priceUtils';

// 목표 가격 수정 팝업
function TargetPriceModal({ visible, targetPrice, currentLowestPrice = null, onClose, onSave }) {
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 팝업이 열릴 때마다 지금 목표가를 콤마를 찍어 입력칸에 채워 넣음
  useEffect(
    function () {
      if (visible === true) {
        setInputText(formatNumberWithComma(targetPrice));
        setErrorMessage('');
      }
    },
    [visible, targetPrice]
  );

  // 숫자를 입력할 때마다 세 자리마다 콤마를 찍어 다시 보여줌
  function handleChangeInputText(text) {
    const onlyNumber = parsePrice(text);

    // 글자를 다 지웠을 때는 빈칸으로 둠
    if (onlyNumber === 0) {
      setInputText('');
      return;
    }

    setInputText(formatNumberWithComma(onlyNumber));
  }

  // 키보드의 완료키를 눌렀을 때 실행
  function handlePressDismissKeyboard() {
    Keyboard.dismiss();
  }

  // 저장 버튼을 눌렀을 때 실행
  async function handlePressSave() {
    if (isSaving === true) {
      return;
    }

    const newTargetPrice = parsePrice(inputText);

    // 숫자가 아니거나 0 이하이면 서버에 보내지 않고 안내만 함
    if (newTargetPrice <= 0) {
      setErrorMessage('목표 가격을 0보다 큰 숫자로 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await onSave(newTargetPrice);
      Keyboard.dismiss();
      onClose();
    } catch (error) {
      setErrorMessage(error.message || '목표 가격을 저장하지 못했어요.');
    } finally {
      setIsSaving(false);
    }
  }

  // 취소 버튼을 눌렀을 때 실행
  function handlePressCancel() {
    Keyboard.dismiss();
    onClose();
  }

  // iOS에서 키보드가 팝업을 가리지 않게 하는 설정
  let keyboardBehavior;
  if (Platform.OS === 'ios') {
    keyboardBehavior = 'padding';
  }

  // 현재 최저가 안내 문구 (아직 값이 없으면 안내하지 않음)
  let currentPriceText = '';
  if (typeof currentLowestPrice === 'number') {
    currentPriceText = '현재 최저가 ' + formatPrice(currentLowestPrice);
  }

  // 저장 버튼에 보여줄 글자
  let saveButtonText = '저장';
  if (isSaving === true) {
    saveButtonText = '저장 중';
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handlePressCancel}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={keyboardBehavior}>
        <View style={styles.box}>
          <Text style={styles.title}>목표 가격 수정</Text>

          {currentPriceText !== '' ? (
            <Text style={styles.description}>{currentPriceText}</Text>
          ) : null}

          {/* 목표 가격 입력칸 */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={handleChangeInputText}
              placeholder="목표 가격"
              placeholderTextColor={TEXT.WEAK}
              keyboardType="number-pad"
              returnKeyType="done" // 키보드의 완료키로 키보드를 내림
              onSubmitEditing={handlePressDismissKeyboard}
              autoFocus
            />
            <Text style={styles.wonText}>원</Text>
          </View>

          {errorMessage !== '' ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* 취소 · 저장 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handlePressCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handlePressSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>{saveButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

TargetPriceModal.propTypes = {
  visible: PropTypes.bool.isRequired, // 팝업을 보일지 여부
  targetPrice: PropTypes.number.isRequired, // 지금 설정된 목표가
  currentLowestPrice: PropTypes.number, // 현재 최저가 (안내용, 없으면 null)
  onClose: PropTypes.func.isRequired, // 팝업을 닫을 때 실행할 함수
  onSave: PropTypes.func.isRequired, // 저장할 때 실행할 함수 (새 목표가를 받음)
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 8,
    backgroundColor: SURFACE.WHITE,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT.STRONG,
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    color: TEXT.SUB,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: LINE.STRONG,
  },
  input: {
    flex: 1, // '원' 글자를 뺀 나머지 공간 차지
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: '700',
    color: TEXT.STRONG,
  },
  wonText: {
    fontSize: 15,
    color: TEXT.SUB,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: POINT.DEFAULT,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1, // 두 버튼이 공간을 반씩 나눔
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE.STRONG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT.SUB,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: BUTTON.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT.INVERSE,
  },
});

export default TargetPriceModal;
