module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setupEnv.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000,
  clearMocks: true,
  verbose: true,
  // file-type (used by upload MIME validation) is ESM-only
  transform: {},
};
