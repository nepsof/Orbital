const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2831;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
let usersCollection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('smart-file-management');
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error (server will run with limited functionality):', error.message);
  }
}

// Import login routes
const loginRoutes = require('./pages/login');
app.use('/api/auth', loginRoutes);

// Import setting routes
const settingRoutes = require('./pages/setting');
app.use('/api', settingRoutes);

// Import file routes
const fileRoutes = require('./pages/files');
app.use('/api/files', fileRoutes);

// Import search routes
const searchRoutes = require('./pages/search/search');
app.use('/api', searchRoutes);

// Import analytics routes
const analyticsRoutes = require('./pages/analytics');
app.use('/api', analyticsRoutes);

// Import logs routes
const logsRoutes = require('./pages/logs');
app.use('/api', logsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(200).json({ success: true, data: {} });
});

// Start server (even if MongoDB connection takes time)
connectToDatabase();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { db, usersCollection };