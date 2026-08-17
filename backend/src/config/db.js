const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');
const logger = require('../utils/logger');

// Force IPv4 DNS resolution — fixes SRV lookup failures on Windows
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (retries = 3) => {
  // Build connection URI — handle DB name and existing query params
  let uri = env.MONGODB_URI;
  if (env.DB_NAME) {
    // Insert DB name before any query string
    const [base, ...queryParts] = uri.split('?');
    const query = queryParts.join('?');
    const cleanBase = base.replace(/\/+$/, ''); // strip trailing slashes
    uri = query ? `${cleanBase}/${env.DB_NAME}?${query}` : `${cleanBase}/${env.DB_NAME}`;
  }
  // Append retryWrites if not already present
  if (!uri.includes('retryWrites')) {
    uri += uri.includes('?') ? '&retryWrites=true&w=majority' : '?retryWrites=true&w=majority';
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('MongoDB connection attempt', { attempt, retries });

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4, // Force IPv4
      });

      logger.info('MongoDB connected', {
        host: conn.connection.host,
        database: conn.connection.name,
      });

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected; attempting reconnection');
      });

      return conn;
    } catch (error) {
      logger.error('MongoDB connection attempt failed', {
        attempt,
        error: error.message,
      });
      if (attempt === retries) {
        logger.error('MongoDB connection exhausted retries', {
          tips: [
            'Check your MONGODB_URI in .env',
            'Ensure your IP is whitelisted in Atlas (Network Access → 0.0.0.0/0)',
            'Try using the non-SRV connection string from Atlas',
            'Check your internet connection',
          ],
        });
        process.exit(1);
      }
      // Wait before retry
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

module.exports = connectDB;
