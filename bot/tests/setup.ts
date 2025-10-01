/**
 * Jest setup file - runs before all tests
 * Sets NODE_ENV to 'test' to prevent loading .env file
 * Sets default test environment variables
 */

process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token_123';
process.env.CONVEX_URL = process.env.CONVEX_URL || 'https://test-deployment.convex.cloud';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';
