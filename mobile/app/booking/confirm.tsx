import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useBookingStore } from '../../src/store/bookingStore';
import { useCreateBooking } from '../../src/api/hooks/useBookings';

function generateIdempotencyKey(): string {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function BookingConfirmScreen() {
  const { slotId, courtName, pricePerHour, date } = useLocalSearchParams<{
    slotId: string;
    courtName: string;
    pricePerHour: string;
    date: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedVenue, selectedSlot } = useBookingStore();
  const createBooking = useCreateBooking();

  const handleConfirmBooking = async () => {
    if (!slotId) return;

    setIsSubmitting(true);
    try {
      const idempotencyKey = generateIdempotencyKey();
      await createBooking.mutateAsync({ slotId, idempotencyKey });

      router.replace({
        pathname: '/booking/success',
        params: {
          venueName: selectedVenue?.name ?? 'Venue',
          courtName: courtName ?? 'Court',
          date: date ?? '',
          startTime: selectedSlot?.startTime ?? '',
          endTime: selectedSlot?.endTime ?? '',
        },
      });
    } catch (error: any) {
      const message = error?.response?.data?.error?.message ?? 'Failed to create booking. Please try again.';
      Alert.alert('Booking Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : '';
  const formattedTime = selectedSlot
    ? `${selectedSlot.startTime.slice(0, 5)} - ${selectedSlot.endTime.slice(0, 5)}`
    : '';

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="bg-white m-4 rounded-xl p-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Booking Summary</Text>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 uppercase mb-1">Venue</Text>
            <Text className="text-base font-medium text-gray-900">
              {selectedVenue?.name ?? 'N/A'}
            </Text>
            {selectedVenue?.address && (
              <Text className="text-sm text-gray-500">{selectedVenue.address}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 uppercase mb-1">Court</Text>
            <Text className="text-base font-medium text-gray-900">
              {courtName ?? 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 uppercase mb-1">Date</Text>
            <Text className="text-base font-medium text-gray-900">{formattedDate}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-xs text-gray-500 uppercase mb-1">Time</Text>
            <Text className="text-base font-medium text-gray-900">{formattedTime}</Text>
          </View>

          <View className="border-t border-gray-100 pt-4 mt-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Total Amount</Text>
              <Text className="text-xl font-bold text-primary">
                Rs {pricePerHour ?? '0'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-indigo-50 mx-4 rounded-xl p-4 mb-4">
          <Text className="text-sm text-primary font-medium mb-2">Demo Mode</Text>
          <Text className="text-sm text-gray-600">
            Payment is disabled for this demo. Your booking will be confirmed immediately.
          </Text>
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 p-4">
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={isSubmitting || !slotId}
          className={`py-4 rounded-xl items-center ${
            isSubmitting ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          {isSubmitting ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                Confirming...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-base font-semibold">
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
