# Dog Adoption Multi-User API Documentation

## 🏗️ **System Architecture**

### **User Roles:**
- **Users**: Can view/adopt dogs and report rescue cases
- **Rescuers**: Can add rescued dogs and handle rescue requests  
- **Admins**: Can manage everything in the system

### **Authentication:**
- JWT-based authentication
- Role-based access control
- Rate limiting on all endpoints

---

## 🔐 **Authentication Routes** (`/api/auth`)

### Register User
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "role": "user" // or "rescuer"
}
Response: { user, token }
```

### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: { user, token }
```

### Get Profile
```
GET /api/auth/profile
Headers: { "Authorization": "Bearer <token>" }
Response: { user }
```

---

## 🐕 **Dog Management Routes** (`/api`)

### Get Dogs (Public with optional auth)
```
GET /api/dogs?status=available&limit=20&offset=0
Response: { dogs: [...] }
```

### Get Single Dog
```
GET /api/dogs/:id
Response: { dog }
```

### Add Dog (Rescuers & Admins only)
```
POST /api/dogs
Headers: { "Authorization": "Bearer <token>" }
Body: FormData {
  "name": "Buddy",
  "age": "3",
  "breed": "Golden Retriever",
  "description": "Friendly dog",
  "gender": "Male",
  "location": "New York",
  "isRescueCase": "true",
  "image": <file>
}
Response: { message, dog }
```

### Update Dog (Rescuers: own dogs, Admins: any)
```
PUT /api/dogs/:id
Headers: { "Authorization": "Bearer <token>" }
Body: FormData { ...updated fields, image?: <file> }
Response: { message, dog }
```

### Delete Dog (Admins only)
```
DELETE /api/dogs/:id
Headers: { "Authorization": "Bearer <token>" }
Response: { message }
```

---

## 💝 **Adoption Routes** (`/api/adoptions`)

### Submit Adoption Request (Users only)
```
POST /api/adoptions/request
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "dogId": 1,
  "message": "I would love to adopt this dog..."
}
Response: { message, adoptionRequest }
```

### Get My Adoption Requests (Users only)
```
GET /api/adoptions/my-requests
Headers: { "Authorization": "Bearer <token>" }
Response: { adoptionRequests: [...] }
```

### Get All Adoption Requests (Admins only)
```
GET /api/adoptions/all?status=pending&limit=50&offset=0
Headers: { "Authorization": "Bearer <token>" }
Response: { adoptionRequests: [...] }
```

### Process Adoption Request (Admins only)
```
PUT /api/adoptions/process/:requestId
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "status": "approved", // or "rejected"
  "adminNotes": "Approved after background check"
}
Response: { message, status }
```

---

## 🚨 **Rescue Routes** (`/api/rescue`)

### Submit Rescue Request (Users)
```
POST /api/rescue/request
Headers: { "Authorization": "Bearer <token>" }
Body: FormData {
  "location": "Central Park, NYC",
  "latitude": "40.7829",
  "longitude": "-73.9654",
  "dogDescription": "Small brown dog, appears injured",
  "urgencyLevel": "high", // low, medium, high, critical
  "contactInfo": "Call me at +1234567890",
  "images": [<file1>, <file2>] // up to 5 images
}
Response: { message, rescueRequest }
```

### Get Available Rescue Requests (Rescuers)
```
GET /api/rescue/available?status=reported&urgency=high&userLat=40.7829&userLng=-73.9654&radius=50&limit=20&offset=0
Headers: { "Authorization": "Bearer <token>" }
Response: { rescueRequests: [...] } // sorted by urgency and distance
```

### Assign Rescue Request (Rescuers)
```
POST /api/rescue/assign/:requestId
Headers: { "Authorization": "Bearer <token>" }
Response: { message, rescueRequest }
```

### Get My Assigned Rescues (Rescuers)
```
GET /api/rescue/my-requests
Headers: { "Authorization": "Bearer <token>" }
Response: { rescueRequests: [...] }
```

### Update Rescue Status (Rescuers & Admins)
```
PUT /api/rescue/status/:requestId
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "status": "in_progress", // in_progress, completed, cancelled
  "adminNotes": "Dog rescued and taken to vet"
}
Response: { message, rescueRequest }
```

---

## 👨‍💼 **Admin Routes** (`/api/admin`)

### Get Dashboard Statistics
```
GET /api/admin/dashboard
Headers: { "Authorization": "Bearer <token>" }
Response: {
  "stats": {
    "totalUsers": 150,
    "totalRescuers": 25,
    "availableDogs": 45,
    "adoptedDogs": 120,
    "pendingAdoptions": 8,
    "pendingRescues": 3,
    "completedRescues": 67
  },
  "recentActivities": [...]
}
```

### Get All Users
```
GET /api/admin/users?role=user&isActive=true&search=john&limit=50&offset=0
Headers: { "Authorization": "Bearer <token>" }
Response: { users: [...] }
```

### Update User Status
```
PUT /api/admin/users/:userId/status
Headers: { "Authorization": "Bearer <token>" }
Body: { "isActive": false }
Response: { message, user }
```

### Update User Role
```
PUT /api/admin/users/:userId/role
Headers: { "Authorization": "Bearer <token>" }
Body: { "role": "rescuer" }
Response: { message, user }
```

### Get All Rescue Requests (Admin view)
```
GET /api/admin/rescue-requests?status=reported&urgency=critical&limit=50&offset=0
Headers: { "Authorization": "Bearer <token>" }
Response: { rescueRequests: [...] }
```

---

## 🔒 **Security Features**

- **Rate Limiting**: General (100 req/15min), Auth (5 req/15min)
- **Input Validation**: All endpoints validate input
- **File Upload Security**: Image-only, 5MB limit, virus scanning
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Standard security headers
- **JWT Expiration**: 7-day default token expiry

---

## 📊 **Database Schema**

### Users Table
- Authentication and profile information
- Role-based access (user/rescuer/admin)
- Location data for proximity matching

### Dogs Table  
- Extended with rescuer association
- Status tracking (available/adopted/pending/rescued)
- Rescue case identification

### AdoptionRequest Table
- Links users to dogs they want to adopt
- Admin approval workflow
- Automated rejection of conflicting requests

### RescueRequest Table
- Geo-located rescue reports
- Priority levels and status tracking  
- Image evidence support
- Rescuer assignment system

---

## 🚀 **Getting Started**

1. **Setup Database**: Run `database_schema.sql` in your PostgreSQL
2. **Environment**: Ensure `.env` has `DATABASE_URL` and `JWT_SECRET`
3. **Start Server**: `npm run backend`
4. **Test API**: Use the health check: `GET /health`

**Default Admin Account:**
- Email: `admin@dogadoption.com`
- Password: (Set during database setup)

---

## 📱 **Frontend Integration**

The API is designed to support:
- **Public Dog Browsing**: No auth required
- **User Registration/Login**: JWT token management
- **Role-based UI**: Different interfaces per user type
- **Real-time Updates**: Via periodic polling or WebSocket
- **Geolocation**: For rescue request proximity
- **Image Upload**: Form-data multipart support
