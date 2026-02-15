import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import { useBookingStore } from '../../store/bookingStore';
import { useCreateBooking } from '../../api/hooks/useBookings';
import { useInitiatePayment, useVerifyPayment } from '../../api/hooks/usePayments';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingConfirm'>;

const BookingConfirmScreen: React.FC<Props> = ({ route, navigation }) => {
  const { slotId } = route.params;
  const { selectedVenue, selectedCourt, selectedSlot, selectedDate } = useBookingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutateAsync: createBooking } = useCreateBooking();
  const { mutateAsync: initiatePayment } = useInitiatePayment();
  const { mutateAsync: verifyPayment } = useVerifyPayment();

  const handleBooking = async () => {
    try {
      setIsProcessing(true);

      // Generate idempotency key
      const idempotencyKey = `${slotId}-${Date.now()}`;

      // Create booking
      const booking = await createBooking({ slotId, idempotencyKey });

      // Initiate payment
      const payment = await initiatePayment(booking.id);

      // For mock payments, auto-verify
      if (payment.mock) {
        await verifyPayment({
          orderId: payment.orderId,
          paymentId: `mock_pay_${Date.now()}`,
        });
        navigation.replace('BookingSuccess', { bookingId: booking.id });
        return;
      }

      // In real app, integrate with Razorpay SDK here
      // For now, simulate success
      Alert.alert(
        'Payment Required',
        `Amount: ₹${payment.amount}\nOrder ID: ${payment.orderId}`,
        [
          {
            text: 'Pay Now (Mock)',
            onPress: async () => {
              try {
                await verifyPayment({
                  orderId: payment.orderId,
                  paymentId: `mock_pay_${Date.now()}`,
                });
                navigation.replace('BookingSuccess', { bookingId: booking.id });
              } catch (error) {
                Alert.alert('Payment Failed', 'Please try again');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Your Booking</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{selectedDate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>
              {selectedSlot?.startTime?.slice(0, 5)} - {selectedSlot?.endTime?.slice(0, 5)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Court</Text>
            <Text style={styles.value}>{selectedCourt?.name}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{selectedCourt?.pricePerHour}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Your slot will be reserved for 10 minutes while you complete the payment.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Proceed to Pay ₹{selectedCourt?.pricePerHour}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingConfirmScreen;
