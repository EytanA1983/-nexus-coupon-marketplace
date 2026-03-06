# Troubleshooting Guide

## Error: ERR_CONNECTION_REFUSED

### Problem
The frontend cannot connect to the backend API at `http://localhost:3000/api`.

### Causes
1. **Backend server is not running** (most common)
2. Backend is running on a different port
3. Backend crashed due to an error
4. Database connection failed
5. Environment variables not set correctly

### Solution

#### Step 1: Check if Backend is Running
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Or check Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue
```

#### Step 2: Start the Backend Server

**Option A: Development Mode (with hot-reload)**
```powershell
cd nexus-coupon-marketplace\backend

# Set environment variables
$env:DATABASE_URL="postgresql://nexus_user:nexus_password@localhost:5432/nexus_coupon_db?schema=public"
$env:JWT_SECRET="change-me-to-a-long-random-secret-at-least-32-chars-for-development"
$env:PORT="3000"

# Start the server
npm run dev
```

**Option B: Using Docker Compose**
```powershell
cd nexus-coupon-marketplace

# Start all services (postgres + backend + frontend)
docker-compose up -d

# Check logs
docker-compose logs backend
```

#### Step 3: Verify Backend is Running
Open in browser: `http://localhost:3000/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

#### Step 4: Check Backend Logs
Look for errors in the terminal where you started the backend:
- Database connection errors
- Missing environment variables
- Port already in use
- TypeScript compilation errors

### Common Issues

#### Issue: Port 3000 Already in Use
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port
$env:PORT="3001"
```

#### Issue: Database Not Running
```powershell
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Or check if PostgreSQL is running locally
Get-Service -Name postgresql*
```

#### Issue: Missing Environment Variables
Create `.env` file in `backend/` directory:
```env
DATABASE_URL=postgresql://nexus_user:nexus_password@localhost:5432/nexus_coupon_db?schema=public
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=change-me-to-a-long-random-secret-at-least-32-chars-for-development
JWT_EXPIRES_IN=24h
RESELLER_TOKENS=
```

#### Issue: Frontend API URL Mismatch
Check `frontend/src/api/client.ts` - it should point to:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

Create `frontend/.env` if needed:
```env
VITE_API_URL=http://localhost:3000/api
```

### Quick Start Checklist

1. ✅ PostgreSQL is running
2. ✅ Backend dependencies installed (`npm install` in backend/)
3. ✅ Prisma Client generated (`npm run prisma:generate`)
4. ✅ Database migrations run (`npm run prisma:migrate:dev`)
5. ✅ Environment variables set
6. ✅ Backend server started (`npm run dev`)
7. ✅ Frontend API URL configured correctly

### Verify Everything Works

1. **Backend Health**: `http://localhost:3000/health`
2. **Backend API**: `http://localhost:3000/api`
3. **Frontend**: `http://localhost:5174` (or port shown in Vite output)
