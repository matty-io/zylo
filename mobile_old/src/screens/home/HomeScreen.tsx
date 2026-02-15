import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { useVenues } from '../../api/hooks/useVenues';
import { VenueListItem } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const SPORTS = ['All', 'BADMINTON', 'TENNIS', 'CRICKET', 'FOOTBALL', 'BASKETBALL'];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedSport, setSelectedSport] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useVenues({
    sport: selectedSport === 'All' ? undefined : selectedSport,
  });

  const venues = data?.pages.flatMap((page) => page.content) ?? [];

  const renderVenueCard = ({ item }: { item: VenueListItem }) => (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => navigation.navigate('VenueDetail', { venueId: item.id })}
    >
      <Image
        source={{ uri: item.primaryImage || 'https://via.placeholder.com/300x200' }}
        style={styles.venueImage}
      />
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.name}</Text>
        <Text style={styles.venueAddress} numberOfLines={1}>
          {item.address}
        </Text>
        <View style={styles.venueFooter}>
          <View style={styles.sportTags}>
            {item.supportedSports?.slice(0, 2).map((sport) => (
              <View key={sport} style={styles.sportTag}>
                <Text style={styles.sportTagText}>{sport}</Text>
              </View>
            ))}
          </View>
          {item.minPrice && (
            <Text style={styles.price}>From ₹{item.minPrice}/hr</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
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
            style={[styles.sportFilter, selectedSport === item && styles.sportFilterActive]}
            onPress={() => setSelectedSport(item)}
          >
            <Text
              style={[
                styles.sportFilterText,
                selectedSport === item && styles.sportFilterTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.sportFilters}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={renderVenueCard}
        contentContainerStyle={styles.venueList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Text style={styles.loadingMore}>Loading more...</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No venues found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sportFilters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    maxHeight: 56,
  },
  sportFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  sportFilterActive: {
    backgroundColor: '#6366F1',
  },
  sportFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sportFilterTextActive: {
    color: '#FFFFFF',
  },
  venueList: {
    padding: 16,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  venueImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  venueInfo: {
    padding: 16,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportTags: {
    flexDirection: 'row',
    gap: 8,
  },
  sportTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportTagText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  loadingMore: {
    textAlign: 'center',
    padding: 16,
    color: '#6B7280',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default HomeScreen;
