import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { format, addDays, parseISO } from 'date-fns';
import { useVenueDetails, useVenueSlots } from '../../src/api/hooks/useVenues';
import { useBookingStore } from '../../src/store/bookingStore';
import { Slot, SlotsByCourt } from '../../src/types';

function DateSelector({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM'),
    };
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {dates.map((d) => {
        const isSelected = d.date === selectedDate;
        return (
          <TouchableOpacity
            key={d.date}
            onPress={() => onDateSelect(d.date)}
            className={`w-16 py-3 rounded-xl items-center ${
              isSelected ? 'bg-primary' : 'bg-white'
            }`}
          >
            <Text
              className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}
            >
              {d.dayName}
            </Text>
            <Text
              className={`text-xl font-bold ${
                isSelected ? 'text-white' : 'text-gray-900'
              }`}
            >
              {d.dayNumber}
            </Text>
            <Text
              className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}
            >
              {d.month}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function SlotCard({
  slot,
  pricePerHour,
  isSelected,
  onSelect,
}: {
  slot: Slot;
  pricePerHour: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAvailable = slot.available && slot.status === 'AVAILABLE';

  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={!isAvailable}
      className={`flex-1 min-w-[100px] p-3 rounded-lg mr-2 mb-2 ${
        isSelected
          ? 'bg-primary'
          : isAvailable
          ? 'bg-white border border-gray-200'
          : 'bg-gray-100'
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected
            ? 'text-white'
            : isAvailable
            ? 'text-gray-900'
            : 'text-gray-400'
        }`}
      >
        {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
      </Text>
      <Text
        className={`text-xs mt-1 ${
          isSelected
            ? 'text-indigo-200'
            : isAvailable
            ? 'text-gray-500'
            : 'text-gray-400'
        }`}
      >
        {isAvailable ? `Rs ${pricePerHour}` : 'Booked'}
      </Text>
    </TouchableOpacity>
  );
}

function CourtSection({
  courtData,
  selectedSlotId,
  onSlotSelect,
}: {
  courtData: SlotsByCourt;
  selectedSlotId: string | null;
  onSlotSelect: (slot: Slot, courtId: string, courtName: string, pricePerHour: number) => void;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-base font-semibold text-gray-900">
            {courtData.courtName}
          </Text>
          <Text className="text-xs text-gray-500">{courtData.sport}</Text>
        </View>
        <Text className="text-sm font-medium text-primary">
          Rs {courtData.pricePerHour}/hr
        </Text>
      </View>
      <View className="flex-row flex-wrap">
        {courtData.slots.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            pricePerHour={courtData.pricePerHour}
            isSelected={selectedSlotId === slot.id}
            onSelect={() =>
              onSlotSelect(slot, courtData.courtId, courtData.courtName, courtData.pricePerHour)
            }
          />
        ))}
      </View>
    </View>
  );
}

export default function SlotSelectionScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedCourtInfo, setSelectedCourtInfo] = useState<{
    courtId: string;
    courtName: string;
    pricePerHour: number;
  } | null>(null);

  const { data: venue } = useVenueDetails(venueId!);
  const { data: slotsByCourt, isLoading, refetch } = useVenueSlots(venueId!, selectedDate);

  const { setSelectedVenue, setSelectedSlot, setSelectedDate: setStoreDate } = useBookingStore();

  useEffect(() => {
    if (venue) {
      setSelectedVenue(venue);
    }
  }, [venue, setSelectedVenue]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
    setSelectedCourtInfo(null);
    setStoreDate(date);
  };

  const handleSlotSelect = (
    slot: Slot,
    courtId: string,
    courtName: string,
    pricePerHour: number
  ) => {
    if (!slot.available || slot.status !== 'AVAILABLE') return;
    setSelectedSlotId(slot.id);
    setSelectedCourtInfo({ courtId, courtName, pricePerHour });
    setSelectedSlot(slot);
    setStoreDate(selectedDate);
  };

  const handleContinue = () => {
    if (!selectedSlotId || !selectedCourtInfo) return;
    router.push({
      pathname: '/booking/confirm',
      params: {
        slotId: selectedSlotId,
        courtName: selectedCourtInfo.courtName,
        pricePerHour: selectedCourtInfo.pricePerHour.toString(),
        date: selectedDate,
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <View className="bg-white p-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">
          {venue?.name ?? 'Select a Slot'}
        </Text>
        {venue?.address && (
          <Text className="text-sm text-gray-500 mt-1">{venue.address}</Text>
        )}
      </View>

      <DateSelector selectedDate={selectedDate} onDateSelect={handleDateSelect} />

      <ScrollView className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-gray-500 mt-2">Loading slots...</Text>
          </View>
        ) : !slotsByCourt || slotsByCourt.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-500">No slots available for this date</Text>
          </View>
        ) : (
          slotsByCourt.map((courtData) => (
            <CourtSection
              key={courtData.courtId}
              courtData={courtData}
              selectedSlotId={selectedSlotId}
              onSlotSelect={handleSlotSelect}
            />
          ))
        )}
        <View className="h-24" />
      </ScrollView>

      {selectedSlotId && selectedCourtInfo && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-primary py-4 rounded-xl items-center"
          >
            <Text className="text-white text-base font-semibold">
              Continue - Rs {selectedCourtInfo.pricePerHour}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
