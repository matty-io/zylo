-- Zylo Database Initialization Script
-- This runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zylo TO zylo;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Zylo database initialized successfully';
END $$;
