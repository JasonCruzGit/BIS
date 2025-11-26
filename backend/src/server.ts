import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import residentRoutes from './routes/resident.routes';
import householdRoutes from './routes/household.routes';
import documentRoutes from './routes/document.routes';
import incidentRoutes from './routes/incident.routes';
import projectRoutes from './routes/project.routes';
import officialRoutes from './routes/official.routes';
import blotterRoutes from './routes/blotter.routes';
import financialRoutes from './routes/financial.routes';
import announcementRoutes from './routes/announcement.routes';
import disasterRoutes from './routes/disaster.routes';
import inventoryRoutes from './routes/inventory.routes';
import auditRoutes from './routes/audit.routes';
import residentPortalRoutes from './routes/resident-portal.routes';
import residentRequestsRoutes from './routes/resident-requests.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
// Normalize FRONTEND_URL to remove trailing slash for CORS matching
const normalizedFrontendUrl = FRONTEND_URL.replace(/\/$/, '');

// Middleware - CORS configuration
// For now, allow all origins to debug CORS issues
// TODO: Restrict to specific frontend URL once confirmed
app.use(cors({
  origin: (origin, callback) => {
    // Always allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Log the origin for debugging
    console.log('CORS request from origin:', origin);
    console.log('Expected FRONTEND_URL:', FRONTEND_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // For now, allow all origins to ensure it works
    // TODO: Once we confirm the frontend URL, restrict to that specific origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/officials', officialRoutes);
app.use('/api/blotter', blotterRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);

// Resident Portal Routes
try {
  app.use('/api/portal', residentPortalRoutes);
  console.log('✅ Resident portal routes registered at /api/portal');
} catch (error: any) {
  console.error('❌ Failed to register resident portal routes:', error?.message || error);
}

// Resident Requests Routes (Admin access to portal requests)
try {
  app.use('/api/resident-requests', residentRequestsRoutes);
  console.log('✅ Resident requests routes registered at /api/resident-requests');
} catch (error: any) {
  console.error('❌ Failed to register resident requests routes:', error?.message || error);
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Don't interfere with CORS errors - let CORS middleware handle them
  if (err.message === 'Not allowed by CORS') {
    console.error('CORS Error:', err.message);
    return res.status(403).json({
      message: 'CORS: Origin not allowed',
      origin: req.headers.origin
    });
  }
  
  console.error('Error:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

