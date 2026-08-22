const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

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

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile-requests', profileRequestRoutes);
app.use('/api/library', libraryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_db')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Auto-renew and sync monthly fees for all active students on server start
      const { ensureMonthlyFeesForAllStudents } = require('./controllers/feeController');
      ensureMonthlyFeesForAllStudents()
        .then(res => console.log(`[Auto-Renew] Monthly fee cycle synced for ${res.updatedStudentsCount} students (${res.currentMonthName})`))
        .catch(err => console.error('[Auto-Renew Error]', err.message));

      // Periodic check every 12 hours
      setInterval(() => {
        ensureMonthlyFeesForAllStudents()
          .then(res => console.log(`[Auto-Renew Cron] Monthly fee cycle checked: ${res.currentMonthName}`))
          .catch(err => console.error('[Auto-Renew Cron Error]', err.message));
      }, 12 * 60 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
