import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useVenueDetails } from '../../src/api/hooks/useVenues';

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: venue, isLoading } = useVenueDetails(id!);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!venue) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Venue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="bg-white p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">{venue.name}</Text>
        <Text className="text-sm text-gray-500">{venue.address}</Text>
      </View>

      <View className="bg-white p-4 mt-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">Sports Available</Text>
        <View className="flex-row flex-wrap gap-2">
          {venue.supportedSports?.map((sport) => (
            <View key={sport} className="bg-indigo-50 px-3 py-1.5 rounded-2xl">
              <Text className="text-sm text-primary font-medium">{sport}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="bg-primary m-4 p-4 rounded-xl items-center"
        onPress={() => router.push({ pathname: '/booking/slots', params: { venueId: id } })}
      >
        <Text className="text-white text-base font-semibold">Book Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
