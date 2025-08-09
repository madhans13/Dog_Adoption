# 🚀 Dog Adoption App Setup Instructions

## Step 1: Create .env File

1. Copy the template file:
```bash
cp env.template .env
```

2. Edit `.env` file with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/dog_adoption?schema=public"
PORT=5000
JWT_SECRET="your_very_secure_jwt_secret_key_here"
```

**Replace:**
- `your_username` with your PostgreSQL username
- `your_password` with your PostgreSQL password
- `your_very_secure_jwt_secret_key_here` with a secure random string

## Step 2: Setup Database

### Option A: Using pgAdmin (Recommended)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → Create → Database
4. Name it: `dog_adoption`
5. Right-click on the new database → Query Tool
6. Copy and paste the contents of `database_setup.sql`
7. Click Execute (F5)

### Option B: Using Command Line
```bash
# Create database
createdb dog_adoption

# Run the setup script
psql -d dog_adoption -f database_setup.sql
```

## Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install bcryptjs jsonwebtoken

# Install frontend dependencies (if needed)
npm install
```

## Step 4: Switch to Full Backend

1. Open `backend/src/server.js`
2. Change line 1 from:
   ```javascript
   import app from './simpleApp.js';
   ```
   to:
   ```javascript
   import app from './app.js';
   ```

## Step 5: Test the Setup

1. Start the backend:
   ```bash
   npm run backend
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Visit: http://localhost:5173

## Step 6: Test User Registration

1. Click "Login / Register"
2. Switch to "Register"
3. Create accounts for:
   - **User**: Someone who wants to adopt
   - **Rescuer**: Someone who rescues dogs
   - **Admin**: System administrator

## Database Structure

### 📋 **Tables Created:**

1. **User** - Base table for all users
   - Stores: name, email, password, role (user/rescuer/admin)

2. **Rescuer** - Extended info for rescuers
   - Stores: organization, license, experience, location

3. **Admin** - Extended info for admins
   - Stores: admin level, permissions

4. **Dog** - Dog information
   - Enhanced with more fields like health, temperament

5. **AdoptionRequest** - Adoption applications
   - Links users to dogs they want to adopt

6. **RescueRequest** - Rescue reports
   - Users can report dogs that need rescue

7. **UserSession** - JWT token management
   - Tracks user sessions securely

### 🔐 **User Roles:**

- **User (Adopter)**: 
  - Can view dogs
  - Can submit adoption requests
  - Can report dogs needing rescue

- **Rescuer**: 
  - All user permissions +
  - Can add new dogs
  - Can manage rescue requests
  - Can update dog information

- **Admin**: 
  - All permissions
  - Can manage users
  - Can view analytics
  - Can manage system settings

## 🎯 **Default Accounts:**

- **Admin Account**: 
  - Email: `admin@dogadoption.com`
  - Password: `admin123`
  - (Change this immediately after first login!)

## ✅ **Verification Steps:**

1. ✅ Database tables created
2. ✅ Backend connects to database
3. ✅ Frontend shows login/register
4. ✅ User registration works
5. ✅ User login works
6. ✅ Role-based features work

## 🚨 **Troubleshooting:**

### Database Connection Error:
- Check your PostgreSQL is running
- Verify credentials in `.env`
- Ensure database `dog_adoption` exists

### Permission Errors:
- Check PostgreSQL user has necessary permissions
- Try connecting with pgAdmin first

### Backend Crashes:
- Check for missing environment variables
- Verify all npm packages are installed
- Check terminal for specific error messages
