import { create } from 'zustand';
import { VenueDetail, Court, Slot } from '../types';

interface BookingState {
  selectedVenue: VenueDetail | null;
  selectedCourt: Court | null;
  selectedSlot: Slot | null;
  selectedDate: string | null;

  // Actions
  setSelectedVenue: (venue: VenueDetail | null) => void;
  setSelectedCourt: (court: Court | null) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  setSelectedDate: (date: string | null) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedVenue: null,
  selectedCourt: null,
  selectedSlot: null,
  selectedDate: null,

  setSelectedVenue: (venue) => {
    set({
      selectedVenue: venue,
      selectedCourt: null,
      selectedSlot: null,
    });
  },

  setSelectedCourt: (court) => {
    set({ selectedCourt: court, selectedSlot: null });
  },

  setSelectedSlot: (slot) => {
    set({ selectedSlot: slot });
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedSlot: null });
  },

  clearSelection: () => {
    set({
      selectedVenue: null,
      selectedCourt: null,
      selectedSlot: null,
      selectedDate: null,
    });
  },
}));
