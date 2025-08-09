# Dog Adoption App Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. **Start both frontend and backend:**
   ```bash
   npm run dev:all
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend API
   npm run backend

   # Terminal 2 - Frontend
   npm run dev
   ```

## URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Dogs API:** http://localhost:5000/api/dogs

## Features

- ✅ Add dogs with image upload
- ✅ View all available dogs
- ✅ Images stored locally in `/uploads` folder
- ✅ Images served via API with full URLs
- ✅ Ready for S3 migration (just change storage logic)

## Database

Using SQLite for easy setup. Database file: `backend/src/prisma/dev.db`

To reset database:
```bash
rm backend/src/prisma/dev.db
npx prisma migrate dev --name init
```

## File Upload

- Images are stored in `/uploads` directory
- Served via `/uploads` route
- 5MB file size limit
- Only image files allowed
- Ready for S3 migration later
