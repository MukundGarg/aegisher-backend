// server.js - Main Express Server for AegiSher
require('dotenv').config();
console.log("🧩 MONGODB_URI from env:", process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const sosRoutes = require('./routes/sos');
const trustedCircleRoutes = require('./routes/trustedCircle');
const safetyReportsRoutes = require('./routes/safetyReports');
const routesRoutes = require('./routes/routes');
const dangerPredictionRoutes = require('./routes/dangerPrediction');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Define PORT after environment is loaded
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AegiSher API is running',
    version: '1.0.0',
    status: 'active'
  });
});

// API Routes
app.use('/api/sos', sosRoutes);
app.use('/api/trusted-circle', trustedCircleRoutes);
app.use('/api/safety-reports', safetyReportsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/danger-prediction', dangerPredictionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AegiSher server running on port ${PORT}`);
  console.log(`📍 API available at https://aegisher-backend.onrender.com`);
});