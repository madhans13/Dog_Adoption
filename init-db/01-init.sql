-- Dog Adoption Database - Complete Table Creation Script
-- Run this in pgAdmin Query Tool after creating the 'dog_adoption' database

-- 1. USERS TABLE (Base table for all users)
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'rescuer', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. RESCUERS TABLE (Extended info for rescuers)
CREATE TABLE IF NOT EXISTS "Rescuer" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
    organization_name VARCHAR(100),
    license_number VARCHAR(50),
    experience_years INTEGER,
    specialization TEXT,
    location VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADMINS TABLE (Extended info for admins)
CREATE TABLE IF NOT EXISTS "Admin" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
    admin_level INTEGER DEFAULT 1,
    permissions TEXT[],
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOGS TABLE (Enhanced dog information)
CREATE TABLE IF NOT EXISTS "Dog" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    size VARCHAR(20) CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')),
    color VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    description TEXT,
    "imageUrl" VARCHAR(255),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'adopted', 'rescued', 'pending')),
    is_rescue_case BOOLEAN DEFAULT false,
    health_status TEXT,
    vaccination_status TEXT,
    spayed_neutered BOOLEAN,
    good_with_kids BOOLEAN,
    good_with_pets BOOLEAN,
    energy_level VARCHAR(20) CHECK (energy_level IN ('Low', 'Medium', 'High')),
    rescuer_id INTEGER REFERENCES "User"(id),
    rescue_date TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields needed by the backend
    imageUrl VARCHAR(255)
);

-- 5. ADOPTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS "AdoptionRequest" (
    id SERIAL PRIMARY KEY,
    dog_id INTEGER REFERENCES "Dog"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    application_data JSONB,
    reviewed_by INTEGER REFERENCES "User"(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RESCUE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS "RescueRequest" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency_level VARCHAR(20) DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'emergency')),
    animal_type VARCHAR(50) DEFAULT 'dog',
    estimated_count INTEGER DEFAULT 1,
    contact_phone VARCHAR(20),
    image_urls TEXT[],
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    assigned_rescuer_id INTEGER REFERENCES "User"(id),
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Additional fields needed by the backend
    rescue_completion_notes TEXT,
    rescue_photo_url VARCHAR(255),
    rescued_dog_id INTEGER REFERENCES "Dog"(id),
    reporter_id INTEGER REFERENCES "User"(id),
    dog_description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_info TEXT,
    admin_notes TEXT
);

-- 7. USER SESSIONS TABLE (JWT token management)
CREATE TABLE IF NOT EXISTS "UserSession" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_dog_status ON "Dog"(status);
CREATE INDEX IF NOT EXISTS idx_dog_rescuer ON "Dog"(rescuer_id);
CREATE INDEX IF NOT EXISTS idx_adoption_status ON "AdoptionRequest"(status);
CREATE INDEX IF NOT EXISTS idx_adoption_user ON "AdoptionRequest"(user_id);
CREATE INDEX IF NOT EXISTS idx_adoption_dog ON "AdoptionRequest"(dog_id);
CREATE INDEX IF NOT EXISTS idx_rescue_status ON "RescueRequest"(status);
CREATE INDEX IF NOT EXISTS idx_rescue_location ON "RescueRequest"(location);
CREATE INDEX IF NOT EXISTS idx_rescue_user ON "RescueRequest"(user_id);

-- CREATE TRIGGERS for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescuer_updated_at BEFORE UPDATE ON "Rescuer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_updated_at BEFORE UPDATE ON "Admin" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dog_updated_at BEFORE UPDATE ON "Dog" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adoption_updated_at BEFORE UPDATE ON "AdoptionRequest" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rescue_updated_at BEFORE UPDATE ON "RescueRequest" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE DATA
-- Sample Admin User (password: admin123)
INSERT INTO "User" (first_name, last_name, email, password_hash, role) VALUES 
('Admin', 'User', 'admin@dogadoption.com', '$2b$10$rOzKqKzqzqKzqKzqKzqKzquZzqKzqKzqKzqKzqKzqKzqKzqKzqKzq', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create admin record
INSERT INTO "Admin" (user_id, admin_level, permissions) 
SELECT id, 2, ARRAY['manage_users', 'manage_dogs', 'manage_rescues', 'view_analytics'] 
FROM "User" 
WHERE email = 'admin@dogadoption.com' 
AND NOT EXISTS (SELECT 1 FROM "Admin" WHERE user_id = (SELECT id FROM "User" WHERE email = 'admin@dogadoption.com'));

-- Sample Rescuer User (password: rescuer123)
INSERT INTO "User" (first_name, last_name, email, password_hash, role) VALUES 
('John', 'Rescuer', 'rescuer@dogadoption.com', '$2b$10$rOzKqKzqzqKzqKzqKzqKzquZzqKzqKzqKzqKzqKzqKzqKzqKzqKzq', 'rescuer')
ON CONFLICT (email) DO NOTHING;

-- Create rescuer record
INSERT INTO "Rescuer" (user_id, organization_name, location, experience_years, is_verified) 
SELECT id, 'City Animal Rescue', 'New York', 5, true
FROM "User" 
WHERE email = 'rescuer@dogadoption.com' 
AND NOT EXISTS (SELECT 1 FROM "Rescuer" WHERE user_id = (SELECT id FROM "User" WHERE email = 'rescuer@dogadoption.com'));

-- Sample Regular User (password: user123)
INSERT INTO "User" (first_name, last_name, email, password_hash, role) VALUES 
('Jane', 'Adopter', 'user@dogadoption.com', '$2b$10$rOzKqKzqzqKzqKzqKzqKzquZzqKzqKzqKzqKzqKzqKzqKzqKzqKzq', 'user')
ON CONFLICT (email) DO NOTHING;

-- Sample Dogs
INSERT INTO "Dog" (name, breed, age, gender, location, description, status) VALUES
('Buddy', 'Golden Retriever', 3, 'Male', 'New York', 'Friendly and energetic dog, great with kids!', 'available'),
('Bella', 'Labrador Mix', 2, 'Female', 'Los Angeles', 'Sweet and gentle, loves playing fetch.', 'available'),
('Max', 'German Shepherd', 4, 'Male', 'Chicago', 'Loyal and protective, needs experienced owner.', 'available')
ON CONFLICT DO NOTHING;

-- Verification Query
SELECT 'Tables created successfully!' as status,
       'User: ' || (SELECT COUNT(*) FROM "User") || ' records' as user_count,
       'Dog: ' || (SELECT COUNT(*) FROM "Dog") || ' records' as dog_count,
       'Rescuer: ' || (SELECT COUNT(*) FROM "Rescuer") || ' records' as rescuer_count,
       'Admin: ' || (SELECT COUNT(*) FROM "Admin") || ' records' as admin_count;
