# Zylo Mobile App - Screen Documentation

## Overview

Zylo is a sports venue booking app built with **React Native** + **Expo Router** (file-based routing). The app uses:
- **Zustand** for state management
- **React Query** for API data fetching and caching
- **Axios** for HTTP requests

---

## Project Structure

```
mobile/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout (providers)
│   ├── (tabs)/                   # Tab navigator
│   │   ├── _layout.tsx           # Tab bar config + auth guard
│   │   ├── index.tsx             # Home (venue list)
│   │   ├── bookings.tsx          # My bookings
│   │   ├── games.tsx             # Games list
│   │   └── profile.tsx           # User profile
│   ├── auth/                     # Authentication flow
│   │   ├── phone.tsx             # Phone input
│   │   └── otp.tsx               # OTP verification
│   ├── venue/[id].tsx            # Venue details (dynamic route)
│   ├── booking/                  # Booking flow
│   │   ├── slots.tsx             # Slot selection
│   │   ├── confirm.tsx           # Booking confirmation
│   │   └── success.tsx           # Booking success
│   └── game/                     # Game screens
│       ├── [id].tsx              # Game details
│       └── create.tsx            # Create game
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   └── hooks/                # React Query hooks
│   ├── store/                    # Zustand stores
│   └── types/                    # TypeScript interfaces
└── assets/                       # Images, icons
```

---

## Navigation Flow

```
App Launch
    │
    ▼
┌─────────────────┐
│  Root Layout    │  ← QueryClientProvider, StatusBar
│  _layout.tsx    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     Not authenticated
│  (tabs)/_layout │  ─────────────────────►  /auth/phone
│  Auth Guard     │
└────────┬────────┘
         │ Authenticated
         ▼
┌─────────────────────────────────────────────┐
│                 Tab Navigator                │
├──────────┬──────────┬──────────┬────────────┤
│   Home   │ Bookings │  Games   │  Profile   │
│  index   │ bookings │  games   │  profile   │
└──────────┴──────────┴──────────┴────────────┘
```

---

## Screen Details

### 1. Authentication Screens

#### `/auth/phone` - Phone Input Screen
**File:** `app/auth/phone.tsx`

**Purpose:** Entry point for authentication. Collects user's phone number.

**Features:**
- Phone number input with +91 prefix
- Validation (minimum 10 digits)
- Sends OTP request to backend
- Loading state during API call

**State:**
- `phone` (string) - Phone number input
- `isPending` (boolean) - API loading state

**API Hook:** `useRequestOtp()`

**Flow:**
```
Enter phone → Click Continue → API: POST /auth/otp/request → Navigate to /auth/otp
```

---

#### `/auth/otp` - OTP Verification Screen
**File:** `app/auth/otp.tsx`

**Purpose:** Verify the 6-digit OTP sent to user's phone.

**Features:**
- 6 individual digit inputs with auto-focus
- Auto-submit when all digits entered
- Resend OTP with 30-second cooldown
- Backspace navigation between inputs

**State:**
- `otp` (string[]) - Array of 6 digits
- `resendTimer` (number) - Countdown for resend button

**API Hooks:** `useVerifyOtp()`, `useRequestOtp()`

**Flow:**
```
Enter OTP → Auto-verify or click Verify → API: POST /auth/otp/verify
    │
    ├── Success → Store tokens in Zustand → Navigate to /(tabs)
    │
    └── Error → Clear inputs, show alert
```

---

### 2. Main Tab Screens

#### `/(tabs)/index` - Home Screen
**File:** `app/(tabs)/index.tsx`

**Purpose:** Browse and search sports venues.

**Features:**
- Search bar (UI only, not connected)
- Sport filter chips (All, Badminton, Tennis, Cricket, Football, Basketball)
- Venue cards with image, name, address, sports, price
- Pull-to-refresh
- Infinite scroll pagination

**State:**
- `selectedSport` (string) - Active filter
- `searchQuery` (string) - Search input

**API Hook:** `useVenues({ sport })`

**Components:**
```
┌─────────────────────────────┐
│  🔍 Search venues...        │
├─────────────────────────────┤
│ [All] [Badminton] [Tennis]  │ ← Horizontal scroll
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │      Venue Image        │ │
│ ├─────────────────────────┤ │
│ │ Venue Name              │ │
│ │ 📍 Address              │ │
│ │ [Sport1] [Sport2]  ₹500 │ │
│ └─────────────────────────┘ │
│           ...               │
└─────────────────────────────┘
```

**Navigation:** Tap venue card → `/venue/[id]`

---

#### `/(tabs)/bookings` - My Bookings Screen
**File:** `app/(tabs)/bookings.tsx`

**Purpose:** View user's booking history.

**Features:**
- Booking cards with venue, court, date, time, amount
- Status badges (Confirmed=green, Pending=yellow, Cancelled=red)
- Pull-to-refresh
- Infinite scroll
- Empty state when no bookings

**API Hook:** `useMyBookings()`

**Card Layout:**
```
┌─────────────────────────────┐
│ Venue Name        [STATUS]  │
│ Court Name                  │
├─────────┬─────────┬─────────┤
│  Date   │  Time   │ Amount  │
│ 15 Feb  │ 10:00-  │  ₹500   │
│         │  11:00  │         │
└─────────┴─────────┴─────────┘
```

---

#### `/(tabs)/games` - Games Screen
**File:** `app/(tabs)/games.tsx`

**Purpose:** Browse and create pickup games.

**Features:**
- Create Game button
- List of public games
- Empty state

**Status:** Partially implemented (TODO: connect to API)

**Navigation:**
- Create Game → `/game/create`
- Tap game → `/game/[id]`

---

#### `/(tabs)/profile` - Profile Screen
**File:** `app/(tabs)/profile.tsx`

**Purpose:** View and manage user profile.

**Features:**
- Avatar with first letter of name
- Name and phone display
- Menu items (Edit Profile, My Bookings, Notifications, Help, Privacy)
- Logout button

**State:** Reads from `useAuthStore`

**Layout:**
```
┌─────────────────────────────┐
│           (U)               │
│         Username            │
│      +91 9999999999         │
├─────────────────────────────┤
│  Edit Profile            →  │
│  My Bookings             →  │
│  Notifications           →  │
│  Help & Support          →  │
│  Privacy Policy          →  │
├─────────────────────────────┤
│        [ Logout ]           │
└─────────────────────────────┘
```

---

### 3. Venue & Booking Flow

#### `/venue/[id]` - Venue Details Screen
**File:** `app/venue/[id].tsx`

**Purpose:** Show venue details and start booking.

**Features:**
- Venue name and address
- List of supported sports
- Book Now button

**Params:** `id` (venue UUID)

**Status:** Partially implemented (TODO: fetch real data)

**Navigation:** Book Now → `/booking/slots?venueId={id}`

---

#### `/booking/slots` - Slot Selection Screen
**File:** `app/booking/slots.tsx`

**Purpose:** Select date, court, and time slot.

**Params:** `venueId`

**Status:** Placeholder (TODO: implement)

**Expected Features:**
- Date picker
- Court selection
- Available time slots grid
- Price display

---

#### `/booking/confirm` - Booking Confirmation Screen
**File:** `app/booking/confirm.tsx`

**Purpose:** Review and pay for booking.

**Status:** Placeholder (TODO: implement)

**Expected Features:**
- Booking summary
- Price breakdown
- Payment integration (Razorpay)
- Confirm button

---

#### `/booking/success` - Booking Success Screen
**File:** `app/booking/success.tsx`

**Purpose:** Show booking confirmation.

**Expected Features:**
- Success animation/icon
- Booking details
- View booking button
- Go home button

---

### 4. Game Screens

#### `/game/[id]` - Game Details Screen
**File:** `app/game/[id].tsx`

**Purpose:** View game details and join/leave.

**Params:** `id` (game UUID)

**Expected Features:**
- Game title, sport, skill level
- Date/time and venue
- Participants list
- Join/Leave button

---

#### `/game/create` - Create Game Screen
**File:** `app/game/create.tsx`

**Purpose:** Create a new pickup game.

**Expected Features:**
- Link to existing booking
- Title input
- Max players
- Skill level selection
- Public/private toggle

---

## State Management

### Auth Store (`src/store/authStore.ts`)

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login(tokens, user): void;    // After OTP verify
  logout(): void;               // Clear session
  updateUser(user): void;       // Profile updates
  updateTokens(tokens): void;   // Token refresh
  setLoading(loading): void;
}
```

**Usage:**
```typescript
const { isAuthenticated, user, login, logout } = useAuthStore();
```

---

### Booking Store (`src/store/bookingStore.ts`)

```typescript
interface BookingState {
  selectedVenue: VenueDetail | null;
  selectedCourt: Court | null;
  selectedSlot: Slot | null;
  selectedDate: string | null;

  setSelectedVenue(venue): void;
  setSelectedCourt(court): void;
  setSelectedSlot(slot): void;
  setSelectedDate(date): void;
  clearSelection(): void;        // Reset after booking
}
```

**Purpose:** Maintains booking flow state across screens.

---

## API Layer

### Client (`src/api/client.ts`)

**Base URL:**
- Dev: `http://localhost:8080/api/v1`
- Prod: `https://api.zylo.app/api/v1`

**Interceptors:**
1. **Request:** Adds `Authorization: Bearer {token}` header
2. **Response:** Handles 401 errors with automatic token refresh

**Helper:**
```typescript
extractData<T>(response): T  // Unwraps ApiResponse<T>
```

---

### API Hooks

| Hook | Method | Endpoint | Description |
|------|--------|----------|-------------|
| `useRequestOtp()` | POST | `/auth/otp/request` | Send OTP |
| `useVerifyOtp()` | POST | `/auth/otp/verify` | Verify & login |
| `useVenues()` | GET | `/venues` | List venues (paginated) |
| `useVenueDetails()` | GET | `/venues/{id}` | Venue details |
| `useVenueSlots()` | GET | `/venues/{id}/slots` | Available slots |
| `useMyBookings()` | GET | `/bookings` | User's bookings |
| `useCreateBooking()` | POST | `/bookings` | Create booking |
| `useInitiatePayment()` | POST | `/payments/initiate` | Start payment |
| `useVerifyPayment()` | POST | `/payments/verify` | Confirm payment |
| `usePublicGames()` | GET | `/games` | List games |
| `useCreateGame()` | POST | `/games` | Create game |

---

## Design System

### Colors
```
Primary:     #6366F1 (Indigo)
Background:  #F9FAFB (Gray 50)
Card:        #FFFFFF
Text:        #111827 (Gray 900)
Secondary:   #6B7280 (Gray 500)
Success:     #059669 (Green)
Error:       #DC2626 (Red)
Warning:     #92400E (Amber)
```

### Common Styles
```typescript
borderRadius: 12-16    // Cards, buttons
padding: 16            // Standard spacing
shadowOpacity: 0.05    // Subtle shadows
fontWeight: '500'-'600' // Semi-bold to bold
```

---

## Implementation Status

| Screen | Status | Notes |
|--------|--------|-------|
| Phone Input | ✅ Complete | |
| OTP Verify | ✅ Complete | |
| Home | ✅ Complete | Search not connected |
| Bookings | ✅ Complete | |
| Games | ⚠️ Partial | API not connected |
| Profile | ✅ Complete | Menu items not functional |
| Venue Details | ⚠️ Partial | Uses mock data |
| Slot Selection | ❌ Placeholder | |
| Booking Confirm | ❌ Placeholder | |
| Booking Success | ❌ Placeholder | |
| Game Details | ❌ Placeholder | |
| Create Game | ❌ Placeholder | |
