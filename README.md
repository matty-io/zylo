# Zylo - Sports Booking Platform

A production-ready MVP for a Playo-like sports booking mobile application.

## Architecture Overview

```
Zylo/
├── backend/          # Spring Boot API (Java 21)
├── mobile/           # React Native App (TypeScript)
└── docker-compose.yml
```

## Tech Stack

### Backend
- **Runtime**: Java 21, Spring Boot 3.2
- **Database**: PostgreSQL 15
- **Cache/Locks**: Redis 7
- **Auth**: JWT + OTP (Twilio)
- **Payments**: Razorpay

### Mobile
- **Framework**: React Native 0.73
- **Language**: TypeScript
- **State**: Zustand
- **Data Fetching**: React Query
- **Navigation**: React Navigation 6

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local backend dev)
- Node.js 20+ (for mobile dev)

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env if needed (defaults work for local dev)
```

### 2. Start Infrastructure

```bash
# Start PostgreSQL and Redis only (recommended for local dev)
docker-compose up postgres redis -d

# Or start everything including backend
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Run Backend (Local Development)

```bash
cd backend

# Run with Maven (hot-reload)
./mvnw spring-boot:run

# Or build and run JAR
./mvnw package -DskipTests
java -jar target/zylo-backend-1.0.0.jar
```

API available at `http://localhost:8080`

### 4. Run Mobile App

```bash
cd mobile
npm install

# iOS (Expo)
npx expo run:ios

# Android (Expo)
npx expo run:android

# Development server
npx expo start
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild backend image
docker-compose build backend

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Configuration

### Environment Variables (Backend)

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/zylo
DATABASE_USERNAME=zylo
DATABASE_PASSWORD=zylo_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-256-bit-secret-key-here-must-be-at-least-32-characters

# Twilio (optional for dev)
TWILIO_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# Razorpay (optional for dev)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## API Endpoints

### Authentication
```
POST /api/v1/auth/otp/request    # Request OTP
POST /api/v1/auth/otp/verify     # Verify OTP & login
POST /api/v1/auth/refresh        # Refresh token
POST /api/v1/auth/logout         # Logout
```

### Venues
```
GET  /api/v1/venues              # List venues (public)
GET  /api/v1/venues/nearby       # Nearby venues (public)
GET  /api/v1/venues/:id          # Venue details (public)
GET  /api/v1/venues/:id/slots    # Venue slots (public)
```

### Bookings
```
POST /api/v1/bookings            # Create booking
GET  /api/v1/bookings            # My bookings
GET  /api/v1/bookings/:id        # Booking details
POST /api/v1/bookings/:id/cancel # Cancel booking
```

### Payments
```
POST /api/v1/payments/initiate   # Create payment order
POST /api/v1/payments/verify     # Verify payment
```

### Games
```
POST /api/v1/games               # Create game
GET  /api/v1/games               # Public games
GET  /api/v1/games/:id           # Game details
POST /api/v1/games/:id/join      # Join game
POST /api/v1/games/:id/leave     # Leave game
```

### User
```
GET  /api/v1/users/me            # Get profile
PUT  /api/v1/users/me            # Update profile
PUT  /api/v1/users/me/fcm-token  # Update FCM token
```

## Critical Features

### Double-Booking Prevention

1. **Redis Distributed Lock**: Lua scripts for atomic lock/unlock
2. **Database Constraint**: Partial unique index on active bookings
3. **Idempotency Keys**: Prevent duplicate bookings on retry

```java
// Lock key: "lock:slot:{slotId}"
// TTL: 30 seconds
// Retry: 3 attempts with 100ms backoff
```

### Booking Flow

```
1. Check idempotency cache
2. Acquire Redis lock
3. Validate slot availability (DB)
4. Create PENDING booking
5. Mark slot as BOOKED
6. Release lock
7. Initiate payment
8. On success: Mark CONFIRMED
9. On failure: Mark CANCELLED, free slot
```

### Pending Booking Expiry

A scheduled job runs every minute to expire pending bookings older than 10 minutes.

## Development

### Database Migrations

Flyway manages migrations in `backend/src/main/resources/db/migration/`.

### Adding a New Feature

1. Create entity in `domain/`
2. Create repository in `repository/`
3. Create DTOs in `dto/`
4. Create service in `service/`
5. Create controller in `controller/`
6. Add mobile API hook in `mobile/src/api/hooks/`
7. Create screens in `mobile/src/screens/`

## Production Checklist

- [ ] Configure production database (RDS)
- [ ] Configure Redis cluster (ElastiCache)
- [ ] Set up Twilio Verify service
- [ ] Configure Razorpay production keys
- [ ] Set up Firebase for push notifications
- [ ] Configure CloudWatch logging
- [ ] Set up health checks and monitoring
- [ ] Configure HTTPS/SSL certificates
- [ ] Set strong JWT secret (256-bit minimum)
- [ ] Enable rate limiting

## License

Proprietary - All rights reserved
# zylo
