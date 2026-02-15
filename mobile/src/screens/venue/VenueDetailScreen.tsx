import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { useVenueDetails } from '../../api/hooks/useVenues';

type Props = NativeStackScreenProps<HomeStackParamList, 'VenueDetail'>;

const VenueDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { venueId } = route.params;
  const { data: venue, isLoading } = useVenueDetails(venueId);

  if (isLoading || !venue) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: venue.images?.[0] || 'https://via.placeholder.com/400x250' }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.address}>{venue.address}</Text>

        <View style={styles.sportsList}>
          {venue.supportedSports?.map((sport) => (
            <View key={sport} style={styles.sportTag}>
              <Text style={styles.sportTagText}>{sport}</Text>
            </View>
          ))}
        </View>

        {venue.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timings</Text>
          <Text style={styles.timings}>
            {venue.openingTime} - {venue.closingTime}
          </Text>
        </View>

        {venue.amenities && venue.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {venue.amenities.map((amenity) => (
                <View key={amenity} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Courts</Text>
          {venue.courts?.map((court) => (
            <View key={court.id} style={styles.courtCard}>
              <View style={styles.courtInfo}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtSport}>{court.sport}</Text>
              </View>
              <Text style={styles.courtPrice}>₹{court.pricePerHour}/hr</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('SlotSelection', { venueId })}
        >
          <Text style={styles.bookButtonText}>View Available Slots</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  sportsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  sportTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sportTagText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  timings: {
    fontSize: 15,
    color: '#4B5563',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#374151',
  },
  courtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  courtSport: {
    fontSize: 14,
    color: '#6B7280',
  },
  courtPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  bookButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VenueDetailScreen;
