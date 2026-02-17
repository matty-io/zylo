import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useRequestOtp } from '../../src/api/hooks/useAuth';

export default function PhoneInputScreen() {
  const [phone, setPhone] = useState('+91');
  const { mutate: requestOtp, isPending } = useRequestOtp();

  const handleContinue = () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    requestOtp(phone, {
      onSuccess: () => {
        router.push({ pathname: '/auth/otp', params: { phone } });
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome to Zylo</Text>
        <Text className="text-base text-gray-500 mb-12">Book courts. Create games. Play together.</Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-lg text-gray-900"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 99999 99999"
            keyboardType="phone-pad"
            autoFocus
            maxLength={15}
          />
        </View>

        <TouchableOpacity
          className={`rounded-xl py-4 items-center ${isPending ? 'bg-indigo-300' : 'bg-primary'}`}
          onPress={handleContinue}
          disabled={isPending}
        >
          <Text className="text-white text-base font-semibold">
            {isPending ? 'Sending...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <Text className="mt-6 text-xs text-gray-400 text-center leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
