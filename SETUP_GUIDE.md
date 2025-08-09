# 🚀 Dog Adoption Multi-User Setup Guide

## ✅ **What We've Built**

Your dog adoption app now supports:
- **3 User Roles**: Users, Rescuers, Admins
- **Adoption System**: Users can request to adopt dogs
- **Rescue System**: Report and manage dog rescues with location-based assignment
- **Admin Dashboard**: Complete system management
- **Authentication**: JWT-based with role-based access control
- **Security**: Rate limiting, input validation, file upload protection

---

## 🗄️ **Database Setup**

### **Step 1: Run SQL Schema in PgAdmin**

1. Open **PgAdmin** 
2. Connect to your `dogAdoption` database
3. Open **Query Tool**
4. Copy and paste the contents of `database_schema.sql`
5. **Execute** the query

This will create:
- `User` table (with roles: user/rescuer/admin)
- Updated `Dog` table (with rescuer association and status)
- `AdoptionRequest` table (adoption workflow)
- `RescueRequest` table (rescue reporting and assignment)

### **Step 2: Verify Tables Created**

Check that these tables exist in your database:
- ✅ `User`
- ✅ `Dog` (updated with new columns)
- ✅ `AdoptionRequest` 
- ✅ `RescueRequest`

---

## 🔧 **Environment Setup**

### **Update your `.env` file:**

```env
# Database (your existing one)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dogAdoption?schema=public"

# JWT Secret (add this)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

---

## 🏃‍♂️ **Running the System**

### **Start Backend:**
```bash
npm run backend
```

### **Start Frontend:**
```bash
npm run dev
```

### **Health Check:**
Visit: `http://localhost:5000/health`

---

## 👨‍💼 **Create Admin Account**

### **Option 1: Use Default Admin (if created)**
- Email: `admin@dogadoption.com`
- Password: You'll need to set this manually in the database

### **Option 2: Register New Admin**
1. Register a normal user via API: `POST /api/auth/register`
2. In PgAdmin, update their role: 
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
   ```

---

## 🧪 **Testing the API**

### **Test with Postman/Insomnia:**

1. **Register User:**
   ```
   POST http://localhost:5000/api/auth/register
   Body: {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User",
     "role": "user"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Body: {
     "email": "test@example.com", 
     "password": "password123"
   }
   ```

3. **Get Dogs (with token):**
   ```
   GET http://localhost:5000/api/dogs
   Headers: { "Authorization": "Bearer YOUR_JWT_TOKEN" }
   ```

---

## 🎯 **User Journeys**

### **For Users:**
1. Register/Login → Browse Dogs → Submit Adoption Request → Wait for Approval
2. Report Rescue Cases → Upload Images → Provide Location

### **For Rescuers:**
1. Register as Rescuer → View Rescue Requests → Assign to Self → Update Status
2. Add Rescued Dogs → Manage Dog Profiles

### **For Admins:**
1. Login → Dashboard Overview → Manage Users → Process Adoptions
2. Oversee All Rescue Operations → System Statistics

---

## 📱 **Frontend Integration Notes**

The current frontend needs updates for:
- User authentication (login/register forms)
- Role-based navigation
- Adoption request submission
- Rescue request reporting (with location and images)
- Admin dashboard

**API Endpoints Ready:**
- Authentication: `/api/auth/*`
- Dogs: `/api/dogs/*` 
- Adoptions: `/api/adoptions/*`
- Rescue: `/api/rescue/*`
- Admin: `/api/admin/*`

---

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Database Connection Error:**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database name is `dogAdoption`

2. **JWT Token Error:**
   - Add `JWT_SECRET` to `.env`
   - Make sure it's a strong, random string

3. **File Upload Issues:**
   - Ensure `uploads/` directory exists
   - Check file size (5MB limit)
   - Only image files allowed

4. **CORS Errors:**
   - Update `FRONTEND_URL` in `.env`
   - Make sure frontend runs on port 5173

### **Database Reset (if needed):**
```sql
-- Drop tables in correct order (foreign key dependencies)
DROP TABLE IF EXISTS "AdoptionRequest";
DROP TABLE IF EXISTS "RescueRequest"; 
DROP TABLE IF EXISTS "Dog";
DROP TABLE IF EXISTS "User";

-- Then re-run database_schema.sql
```

---

## 🎉 **You're Ready!**

Your multi-user dog adoption system is now fully set up with:
- ✅ Role-based authentication
- ✅ Adoption workflow
- ✅ Rescue request system
- ✅ Admin management
- ✅ Location-based features
- ✅ Image upload support
- ✅ Security features

**Next Steps:**
1. Run the database schema in PgAdmin
2. Update your `.env` file
3. Test the API endpoints
4. Update the frontend for multi-user features

**Need Help?** Check the `API_DOCUMENTATION.md` for detailed endpoint information!
