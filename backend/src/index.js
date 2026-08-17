const env = require('./config/env');
const connectDB = require('./config/db');
const createApp = require('./app');
const logger = require('./utils/logger');

const app = createApp();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      logger.info('NITJ Resource Exchange API started', {
        environment: env.NODE_ENV,
        port: env.PORT,
        health: `http://localhost:${env.PORT}/api/health`,
        clientUrl: env.CLIENT_URL,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
