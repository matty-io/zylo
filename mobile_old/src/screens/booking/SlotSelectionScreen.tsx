import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format, addDays } from 'date-fns';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { useVenueSlots } from '../../api/hooks/useVenues';
import { useBookingStore } from '../../store/bookingStore';
import { Slot } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'SlotSelection'>;

const SlotSelectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { venueId } = route.params;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { setSelectedSlot, setSelectedCourt, setSelectedDate: setStoreDate } = useBookingStore();

  const { data: slotsByCourt, isLoading } = useVenueSlots(venueId, selectedDate);

  // Generate next 7 days for date selection
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleSlotSelect = (slot: Slot, courtId: string, courtName: string, pricePerHour: number) => {
    setSelectedSlot(slot);
    setSelectedCourt({ id: courtId, name: courtName, sport: '', pricePerHour });
    setStoreDate(selectedDate);
    navigation.navigate('BookingConfirm', { slotId: slot.id });
  };

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dateButton, isSelected && styles.dateButtonActive]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                {format(date, 'EEE')}
              </Text>
              <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>
                {format(date, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slots by Court */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <ScrollView style={styles.slotsContainer}>
          {slotsByCourt?.map((court) => (
            <View key={court.courtId} style={styles.courtSection}>
              <View style={styles.courtHeader}>
                <Text style={styles.courtName}>{court.courtName}</Text>
                <Text style={styles.courtPrice}>₹{court.pricePerHour}/hr</Text>
              </View>
              <View style={styles.slotsGrid}>
                {court.slots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      !slot.available && styles.slotButtonDisabled,
                    ]}
                    disabled={!slot.available}
                    onPress={() =>
                      handleSlotSelect(slot, court.courtId, court.courtName, court.pricePerHour)
                    }
                  >
                    <Text
                      style={[styles.slotText, !slot.available && styles.slotTextDisabled]}
                    >
                      {slot.startTime.slice(0, 5)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {slotsByCourt?.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No slots available for this date</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dateSelector: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 100,
  },
  dateButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    minWidth: 56,
  },
  dateButtonActive: {
    backgroundColor: '#6366F1',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotsContainer: {
    flex: 1,
    padding: 16,
  },
  courtSection: {
    marginBottom: 24,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  courtPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  slotButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  slotTextDisabled: {
    color: '#9CA3AF',
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

export default SlotSelectionScreen;
