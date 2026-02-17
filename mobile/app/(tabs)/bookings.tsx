import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useMyBookings } from '../../src/api/hooks/useBookings';
import { Booking } from '../../src/types';

const STATUS_STYLES = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DEFAULT: 'bg-gray-100 text-gray-500',
} as const;

export default function BookingsScreen() {
  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMyBookings();

  const bookings = data?.pages.flatMap((page) => page.content) ?? [];

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusStyle = STATUS_STYLES[item.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.DEFAULT;
    const [bgColor, textColor] = statusStyle.split(' ');

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        onPress={() => router.push(`/booking/${item.id}`)}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-base font-semibold text-gray-900 flex-1">{item.venueName}</Text>
          <View className={`px-2.5 py-1 rounded-xl ${bgColor}`}>
            <Text className={`text-xs font-semibold ${textColor}`}>{item.status}</Text>
          </View>
        </View>

        <Text className="text-sm text-gray-500 mb-4">{item.courtName}</Text>

        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-xs text-gray-400 mb-1">Date</Text>
            <Text className="text-sm font-medium text-gray-900">{item.date}</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400 mb-1">Time</Text>
            <Text className="text-sm font-medium text-gray-900">
              {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-gray-400 mb-1">Amount</Text>
            <Text className="text-sm font-medium text-gray-900">₹{item.amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerClassName="p-4"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <Text className="text-center p-4 text-gray-500">Loading more...</Text> : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-12 items-center">
              <Text className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</Text>
              <Text className="text-sm text-gray-500">Book a court to get started!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
