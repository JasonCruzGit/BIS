# Deployment Instructions

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub repository with the frontend code

### Steps

1. **Install Vercel CLI** (optional, for local deployment)
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment Variables**
   - Go to your Vercel project settings
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
     ```

3. **Deploy via Vercel Dashboard**
   - Connect your GitHub repository
   - Select the `frontend` directory as the root
   - Vercel will automatically detect Next.js and deploy

4. **Deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```

### Build Settings
- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

---

## Backend Deployment (Render/Supabase)

### Option 1: Render

#### Prerequisites
- Render account
- PostgreSQL database (Render provides this)

#### Steps

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Create a new PostgreSQL database
   - Note the connection string

2. **Create Web Service**
   - Connect your GitHub repository
   - Select the `backend` directory
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://user:password@host:port/dbname
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

4. **Run Migrations**
   - Add a one-off command in Render:
     ```
     npx prisma migrate deploy
     npx prisma generate
     ```

### Option 2: Supabase

#### Prerequisites
- Supabase account

#### Steps

1. **Create Supabase Project**
   - Create a new project
   - Note the database connection string

2. **Deploy Backend**
   - Use Supabase Edge Functions or deploy separately
   - Configure environment variables as above

3. **Run Migrations**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

---

## Database Setup

### Local Development

1. **Install PostgreSQL**
   - Download from https://www.postgresql.org/download/

2. **Create Database**
   ```sql
   CREATE DATABASE bis_db;
   ```

3. **Run Migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Seed Data** (optional)
   ```bash
   npx prisma db seed
   ```

### Production

1. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

---

## File Storage

### Local Development
Files are stored in `backend/uploads/` directory

### Production Options

#### Option 1: Cloud Storage (Recommended)
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

Update upload middleware to use cloud storage SDK

#### Option 2: Persistent Volume
- Render: Use persistent disk
- Other platforms: Mount volume for uploads directory

---

## Environment Variables Checklist

### Backend (.env)
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] JWT_EXPIRES_IN
- [ ] PORT
- [ ] NODE_ENV
- [ ] FRONTEND_URL
- [ ] MAX_FILE_SIZE
- [ ] UPLOAD_PATH

### Frontend (.env.local)
- [ ] NEXT_PUBLIC_API_URL

---

## Post-Deployment

1. **Create Admin User**
   - Use the register endpoint or database seed script

2. **Test All Modules**
   - Verify authentication
   - Test CRUD operations
   - Check file uploads
   - Verify PDF generation

3. **Set Up Backups**
   - Configure database backups
   - Set up file storage backups

4. **Monitor Logs**
   - Set up error tracking (Sentry, etc.)
   - Monitor application logs

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check firewall rules

2. **CORS Errors**
   - Verify FRONTEND_URL matches actual frontend URL
   - Check CORS configuration in server.ts

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Check disk space

4. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check token expiration settings

---

## Security Checklist

- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Audit logs enabled



