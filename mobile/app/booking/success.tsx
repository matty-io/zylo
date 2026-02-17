import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { format, parseISO } from 'date-fns';

export default function BookingSuccessScreen() {
  const { venueName, courtName, date, startTime, endTime } = useLocalSearchParams<{
    venueName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  }>();

  const formattedDate = date ? format(parseISO(date), 'EEE, MMM d') : '';
  const formattedTime =
    startTime && endTime
      ? `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
      : '';

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">✓</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Your court has been successfully booked.
      </Text>

      {venueName && (
        <View className="bg-gray-50 rounded-xl p-4 w-full mb-6">
          <View className="mb-3">
            <Text className="text-xs text-gray-500 uppercase">Venue</Text>
            <Text className="text-base font-medium text-gray-900">{venueName}</Text>
          </View>
          {courtName && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 uppercase">Court</Text>
              <Text className="text-base font-medium text-gray-900">{courtName}</Text>
            </View>
          )}
          {formattedDate && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 uppercase">Date & Time</Text>
              <Text className="text-base font-medium text-gray-900">
                {formattedDate} {formattedTime && `• ${formattedTime}`}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        className="bg-primary py-4 px-8 rounded-xl w-full items-center"
        onPress={() => router.replace('/(tabs)/bookings')}
      >
        <Text className="text-white text-base font-semibold">View My Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-4 px-8"
        onPress={() => router.replace('/(tabs)')}
      >
        <Text className="text-primary text-base font-medium">Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
