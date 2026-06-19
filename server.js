require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./src/config/db');
const apiRoutes = require('./src/routes/api');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection (with local fallback)
connectDB();

// Security and utility middleware
app.use(helmet({
  // Configure Content Security Policy to allow loading external fonts/styles from Google Fonts
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"], // Allow local scripts
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api', apiRoutes);

// Fallback for SPA routing or single page index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mount global error handler middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Portfolio Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
