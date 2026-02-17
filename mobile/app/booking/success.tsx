import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function BookingSuccessScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <Text className="text-6xl text-emerald-500 mb-6">✓</Text>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Your court has been successfully booked.
      </Text>

      <TouchableOpacity
        className="bg-primary py-4 px-8 rounded-xl"
        onPress={() => router.replace('/(tabs)/bookings')}
      >
        <Text className="text-white text-base font-semibold">View My Bookings</Text>
      </TouchableOpacity>
    </View>
  );
}
