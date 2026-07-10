const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

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
      console.log(`🔄 MongoDB connection attempt ${attempt}/${retries}...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        family: 4, // Force IPv4
      });

      console.log(`✅ MongoDB connected: ${conn.connection.host} | DB: ${conn.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
      });

      return conn;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('\n💡 Troubleshooting tips:');
        console.error('   1. Check your MONGODB_URI in .env');
        console.error('   2. Ensure your IP is whitelisted in Atlas (Network Access → 0.0.0.0/0)');
        console.error('   3. Try using the non-SRV connection string from Atlas');
        console.error('   4. Check your internet connection\n');
        process.exit(1);
      }
      // Wait before retry
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

module.exports = connectDB;
