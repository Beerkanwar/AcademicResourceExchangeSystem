const env = require('./config/env');
const connectDB = require('./config/db');
const createApp = require('./app');

const app = createApp();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`\n🚀 NITJ Resource Exchange API`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Server:      http://localhost:${env.PORT}`);
      console.log(`   Health:      http://localhost:${env.PORT}/api/health`);
      console.log(`   Client:      ${env.CLIENT_URL}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
