import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '../../navigation/MainNavigator';
import { useBookingDetails, useCancelBooking } from '../../api/hooks/useBookings';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingDetail'>;

const BookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { data: booking, isLoading } = useBookingDetails(bookingId);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelBooking(
              { bookingId, reason: 'User requested cancellation' },
              {
                onSuccess: () => {
                  Alert.alert('Cancelled', 'Your booking has been cancelled');
                  navigation.goBack();
                },
                onError: (error) => {
                  Alert.alert('Error', error.message || 'Failed to cancel booking');
                },
              }
            );
          },
        },
      ]
    );
  };

  if (isLoading || !booking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const canCreateGame = booking.status === 'CONFIRMED';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.venueName}>{booking.venueName}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  booking.status === 'CONFIRMED'
                    ? '#D1FAE5'
                    : booking.status === 'PENDING'
                    ? '#FEF3C7'
                    : '#FEE2E2',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    booking.status === 'CONFIRMED'
                      ? '#065F46'
                      : booking.status === 'PENDING'
                      ? '#92400E'
                      : '#991B1B',
                },
              ]}
            >
              {booking.status}
            </Text>
          </View>
        </View>

        <Text style={styles.address}>{booking.venueAddress}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Court</Text>
            <Text style={styles.value}>{booking.courtName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sport</Text>
            <Text style={styles.value}>{booking.sport}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{booking.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amount}>₹{booking.amount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>{booking.paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {canCreateGame && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CreateGame', { bookingId })}
            >
              <Text style={styles.primaryButtonText}>Create a Game</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, isCancelling && styles.buttonDisabled]}
              onPress={handleCancel}
              disabled={isCancelling}
            >
              <Text style={styles.cancelButtonText}>
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  address: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
    color: '#6B7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default BookingDetailScreen;
