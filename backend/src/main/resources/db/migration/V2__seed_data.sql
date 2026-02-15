-- Seed data for development

-- Insert admin user
INSERT INTO users (id, phone, name, city, role, preferred_sports)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '+919999999999',
    'Admin User',
    'Mumbai',
    'ADMIN',
    ARRAY['BADMINTON', 'TENNIS', 'CRICKET']
);

-- Insert sample venue owner
INSERT INTO users (id, phone, name, city, role, preferred_sports)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '+919888888888',
    'Venue Owner',
    'Mumbai',
    'OWNER',
    ARRAY['BADMINTON', 'CRICKET']
);

-- Insert sample venues
INSERT INTO venues (id, owner_id, name, address, city, latitude, longitude, supported_sports, images, description, amenities)
VALUES
(
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'Sports Arena Mumbai',
    '123 Sports Complex, Andheri West',
    'Mumbai',
    19.1176,
    72.8562,
    ARRAY['BADMINTON', 'TENNIS', 'TABLE_TENNIS'],
    ARRAY['https://example.com/venue1.jpg'],
    'Premium sports facility with world-class courts',
    ARRAY['PARKING', 'CHANGING_ROOM', 'CAFETERIA', 'EQUIPMENT_RENTAL']
),
(
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000002',
    'PlayZone Bandra',
    '456 Link Road, Bandra West',
    'Mumbai',
    19.0596,
    72.8295,
    ARRAY['BADMINTON', 'CRICKET', 'FOOTBALL'],
    ARRAY['https://example.com/venue2.jpg'],
    'Multi-sport facility with indoor and outdoor courts',
    ARRAY['PARKING', 'CHANGING_ROOM', 'SHOWERS']
);

-- Insert sample courts
INSERT INTO courts (id, venue_id, name, sport, price_per_hour, description)
VALUES
-- Sports Arena Mumbai courts
(
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000010',
    'Badminton Court 1',
    'BADMINTON',
    500.00,
    'Professional synthetic court'
),
(
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000010',
    'Badminton Court 2',
    'BADMINTON',
    500.00,
    'Professional synthetic court'
),
(
    '00000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000010',
    'Tennis Court 1',
    'TENNIS',
    800.00,
    'Hard court surface'
),
-- PlayZone Bandra courts
(
    '00000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000011',
    'Badminton Court A',
    'BADMINTON',
    450.00,
    'Wooden court'
),
(
    '00000000-0000-0000-0000-000000000024',
    '00000000-0000-0000-0000-000000000011',
    'Cricket Net 1',
    'CRICKET',
    600.00,
    'Practice nets with bowling machine'
);

-- Generate slots for next 7 days for all courts
DO $$
DECLARE
    court_record RECORD;
    slot_date DATE;
    slot_hour INT;
BEGIN
    FOR court_record IN SELECT id FROM courts WHERE is_active = TRUE
    LOOP
        FOR slot_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', '1 day')::DATE
        LOOP
            FOR slot_hour IN 6..22
            LOOP
                INSERT INTO slots (court_id, date, start_time, end_time, status)
                VALUES (
                    court_record.id,
                    slot_date,
                    make_time(slot_hour, 0, 0),
                    make_time(slot_hour + 1, 0, 0),
                    'AVAILABLE'
                )
                ON CONFLICT (court_id, date, start_time) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
