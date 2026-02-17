import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useVerifyOtp, useRequestOtp } from '../../src/api/hooks/useAuth';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);

  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: requestOtp, isPending: isResending } = useRequestOtp();

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit) && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter the complete OTP');
      return;
    }

    verifyOtp(
      { phone: phone!, otp: code },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Invalid OTP');
          setOtp(Array(OTP_LENGTH).fill(''));
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  const handleResend = () => {
    if (resendTimer > 0) return;

    requestOtp(phone!, {
      onSuccess: () => {
        setResendTimer(30);
        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to resend OTP');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 pt-16">
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Text className="text-base text-primary">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</Text>
        <Text className="text-base text-gray-500 mb-10">
          Enter the 6-digit code sent to {phone}
        </Text>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              className={`w-12 h-14 border rounded-xl text-2xl font-semibold text-center text-gray-900 ${
                digit ? 'border-primary bg-indigo-50' : 'border-gray-300'
              }`}
              value={digit}
              onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${isPending ? 'bg-indigo-300' : 'bg-primary'}`}
          onPress={() => handleVerify()}
          disabled={isPending}
        >
          <Text className="text-white text-base font-semibold">
            {isPending ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-6 items-center"
          onPress={handleResend}
          disabled={resendTimer > 0 || isResending}
        >
          <Text className={`text-sm font-medium ${resendTimer > 0 ? 'text-gray-400' : 'text-primary'}`}>
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
