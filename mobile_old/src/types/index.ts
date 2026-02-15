// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// User
export interface User {
  id: string;
  phone: string;
  name?: string;
  city?: string;
  preferredSports?: string[];
  role: 'USER' | 'OWNER' | 'ADMIN';
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Venue
export interface VenueListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  supportedSports: string[];
  primaryImage?: string;
  minPrice?: number;
}

export interface Court {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  description?: string;
}

export interface VenueDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  supportedSports: string[];
  images: string[];
  description?: string;
  amenities: string[];
  openingTime: string;
  closingTime: string;
  courts: Court[];
}

// Slot
export interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED';
  available: boolean;
}

export interface SlotsByCourt {
  courtId: string;
  courtName: string;
  sport: string;
  pricePerHour: number;
  slots: Slot[];
}

// Booking
export interface Booking {
  id: string;
  slotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  amount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paymentOrderId?: string;
  createdAt: string;
  date: string;
  startTime: string;
  endTime: string;
  courtId: string;
  courtName: string;
  sport: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
}

// Game
export interface GameListItem {
  id: string;
  title: string;
  sport: string;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel?: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueCity: string;
  creatorName?: string;
}

export interface GameParticipant {
  userId: string;
  name?: string;
  joinedAt: string;
}

export interface GameDetail {
  id: string;
  title: string;
  sport: string;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel?: string;
  description?: string;
  isPublic: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  creatorId: string;
  creatorName?: string;
  participants: GameParticipant[];
}

// Payment
export interface PaymentInitiateResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  bookingId: string;
  mock?: boolean;
}

// Notification
export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Pagination
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
