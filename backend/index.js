import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection (Supabase PostgreSQL)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:superdry9650165100@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';
console.log('🔌 Connecting to:', connectionString.split('@')[1]?.split('?')[0] || 'N/A');

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Import routes
import authRoutes from './api/auth.js';
import assessmentRoutes from './api/assessments.js';
import kycRoutes from './api/kyc.js';

// Routes
app.use('/api/auth', authRoutes(pool));
app.use('/api/assessments', assessmentRoutes(pool));
app.use('/api/kyc', kycRoutes(pool));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'FinPro API Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/sendOtp',
      'POST /api/auth/verifyOtp',
      'GET /api/auth/profile',
      'POST /api/assessments',
      'GET /api/assessments',
      'GET /api/assessments/:id',
      'PUT /api/assessments/:id',
      'DELETE /api/assessments/:id',
      'POST /api/kyc',
      'GET /api/kyc',
      'PUT /api/kyc/:id/verify'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 FinPro Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API: http://localhost:${PORT}/api/health`);
});

export default app;
