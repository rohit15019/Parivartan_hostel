const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reportRoutes = require('./routes/reportRoutes');
const profileRequestRoutes = require('./routes/profileRequestRoutes');
const libraryRoutes = require('./routes/libraryRoutes');

const app = express();

// Trust proxy for reverse proxies (Nginx on VPS)
app.set('trust proxy', 1);

// Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible CDN & image loading
    crossOriginEmbedderPolicy: false,
  })
);

// Gzip / Deflate payload compression
app.use(compression());

// Body Parsers with safe payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production & local dev
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server) or from allowed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive fallback to prevent breaking external clients
      }
    },
    credentials: true,
  })
);

// Global API Rate Limiter (500 requests per 15 mins per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP. Please slow down.' },
});
app.use('/api', globalApiLimiter);

// Rate Limiter for Auth Routes (Prevents brute-force while allowing normal retries & OTP flows)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again after a few minutes.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// Mount API routers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile-requests', profileRequestRoutes);
app.use('/api/library', libraryRoutes);

// Health check endpoint for uptime monitors & load balancers
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Production Static File Serving (Fallback if not directly handled by Nginx)
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  // Serve React Router index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

// Centralized Error Handling Middleware (Hides stack traces in production)
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_db')
  .then(() => {
    console.log('MongoDB Connected successfully');
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

      // Auto-ensure official admin account exists
      const { ensureAdminUser } = require('./controllers/authController');
      ensureAdminUser()
        .then(() => console.log('[Auto-Admin] Official admin account verified: vallabhdharejiya9@gmail.com'))
        .catch((err) => console.error('[Auto-Admin Error]', err.message));

      // Auto-renew and sync monthly fees for all active students on server start
      const { ensureMonthlyFeesForAllStudents } = require('./controllers/feeController');
      ensureMonthlyFeesForAllStudents()
        .then((res) =>
          console.log(
            `[Auto-Renew] Monthly fee cycle synced for ${res.updatedStudentsCount} students (${res.currentMonthName})`
          )
        )
        .catch((err) => console.error('[Auto-Renew Error]', err.message));

      // Periodic check every 12 hours
      setInterval(() => {
        ensureMonthlyFeesForAllStudents()
          .then((res) =>
            console.log(`[Auto-Renew Cron] Monthly fee cycle checked: ${res.currentMonthName}`)
          )
          .catch((err) => console.error('[Auto-Renew Cron Error]', err.message));
      }, 12 * 60 * 60 * 1000);
    });

    // Graceful Shutdown on termination signals (PM2 reload / stop)
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false).then(() => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
