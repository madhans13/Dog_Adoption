-- Create admin user with email: admin@dogadoption.com and password: admin123
INSERT INTO "User" (
  first_name, 
  last_name, 
  email, 
  password_hash, 
  role, 
  created_at
) VALUES (
  'Admin',
  'User',
  'admin@dogadoption.com',
  '$2b$10$rOFbF7zM6Z8.QoE8yKJ1DO7ZkKYG5H5h1pKjvDfJN8L9mK6YwK2nW', -- This is 'admin123' hashed
  'admin',
  CURRENT_TIMESTAMP
);

-- OR upgrade an existing user to admin (replace with your actual email)
-- UPDATE "User" SET role = 'admin' WHERE email = 'your_existing_email@example.com';
