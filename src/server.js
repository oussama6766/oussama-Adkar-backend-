require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { sequelize } = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const alarmRoutes = require('./routes/alarm.routes');
const adhkarRoutes = require('./routes/adhkar.routes');
const reminderRoutes = require('./routes/reminder.routes');
const libraryRoutes = require('./routes/library.routes');
const syncRoutes = require('./routes/sync.routes');

// Import Error Handler
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (for uploaded audio files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nasheed Alarm API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/adhkar', adhkarRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/sync', syncRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global Error Handler
app.use(errorHandler);

// Database Connection & Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
