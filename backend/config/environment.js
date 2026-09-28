const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  apiPrefix: process.env.API_PREFIX || '/api',
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
    channelHandle: (process.env.YOUTUBE_CHANNEL_HANDLE || '@Conceptpe').replace(/^@/, ''),
    cacheMinutes: parseInt(process.env.YOUTUBE_CACHE_MINUTES, 10) || 30
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || ''
  },
  adminEmail: process.env.ADMIN_EMAIL || 'anamikacse999@gmail.com'
};

module.exports = config;
