/**
 * CONCEPTPE — REST API Backend Server
 * Tagline: "Unlock Your Potential"
 * Platform: Node.js + Express.js
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/environment');
const apiRoutes = require('./routes');

const app = express();

// --------------------------------------------------------------------------
// 1. CORS Configuration
// --------------------------------------------------------------------------
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || config.clientOrigin === '*') {
      return callback(null, true);
    }
    const allowedOrigins = config.clientOrigin.split(',').map(o => o.trim());
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// --------------------------------------------------------------------------
// 2. Request Parsing & Body Middleware
// --------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --------------------------------------------------------------------------
// 3. Request Logging Middleware (Development)
// --------------------------------------------------------------------------
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// --------------------------------------------------------------------------
// 4. API Routes
// --------------------------------------------------------------------------
app.use('/api', apiRoutes);

// --------------------------------------------------------------------------
// 5. Serve Frontend Static Assets (Unified Experience)
// --------------------------------------------------------------------------
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Serve index.html for root path or non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --------------------------------------------------------------------------
// 6. 404 Not Found Handler
// --------------------------------------------------------------------------
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: `API route '${req.originalUrl}' not found.`
    });
  }
  res.status(404).sendFile(path.join(frontendPath, 'index.html'));
});

// --------------------------------------------------------------------------
// 7. Global Error Handler
// --------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// --------------------------------------------------------------------------
// 8. Server Initialization
// --------------------------------------------------------------------------
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  CONCEPTPE REST API Backend is running!`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Port:        ${config.port}`);
  console.log(`  API Health:  http://localhost:${config.port}/api/health`);
  console.log(`  Courses API: http://localhost:${config.port}/api/courses`);
  console.log(`  Videos API:  http://localhost:${config.port}/api/videos`);
  console.log(`  Resources:   http://localhost:${config.port}/api/resources`);
  console.log(`  Frontend:    http://localhost:${config.port}/`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
