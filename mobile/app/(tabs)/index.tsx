import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useVenues } from '../../src/api/hooks/useVenues';
import { VenueListItem } from '../../src/types';

const SPORTS = ['All', 'BADMINTON', 'TENNIS', 'CRICKET', 'FOOTBALL', 'BASKETBALL'];

export default function HomeScreen() {
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useVenues({
    sport: selectedSport === 'All' ? undefined : selectedSport,
  });

  const venues = data?.pages.flatMap((page) => page.content) ?? [];

  const renderVenueCard = ({ item }: { item: VenueListItem }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
      onPress={() => router.push(`/venue/${item.id}`)}
    >
      <Image
        source={{ uri: item.primaryImage || 'https://via.placeholder.com/300x200' }}
        className="w-full h-40 bg-gray-200"
      />
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-1">{item.name}</Text>
        <Text className="text-sm text-gray-500 mb-3" numberOfLines={1}>
          {item.address}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-2">
            {item.supportedSports?.slice(0, 2).map((sport) => (
              <View key={sport} className="bg-indigo-50 px-2.5 py-1 rounded-xl">
                <Text className="text-xs text-primary font-medium">{sport}</Text>
              </View>
            ))}
          </View>
          {item.minPrice && (
            <Text className="text-sm font-semibold text-success">From ₹{item.minPrice}/hr</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <View className="p-4 bg-white">
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-3 text-base"
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        horizontal
        data={SPORTS}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedSport === item ? 'bg-primary' : 'bg-gray-100'
            }`}
            onPress={() => setSelectedSport(item)}
          >
            <Text
              className={`text-sm font-medium ${
                selectedSport === item ? 'text-white' : 'text-gray-500'
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        className="px-4 py-3 bg-white max-h-14"
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={renderVenueCard}
        contentContainerClassName="p-4"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text className="text-center p-4 text-gray-500">Loading more...</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-12 items-center">
              <Text className="text-base text-gray-400">No venues found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
